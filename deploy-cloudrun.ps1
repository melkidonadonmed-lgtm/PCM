<#
.SYNOPSIS
    Deploy manual do PresCMed no Google Cloud Run (PowerShell 7 / Windows).
.DESCRIPTION
    Submete o MESMO cloudbuild.yaml usado pelo gatilho de push em main: type-check,
    testes, build da imagem, deploy e teste de fumaça. Não há uma segunda receita
    de deploy aqui — o que este script publica é o que o gatilho publicaria.

    O deploy normal é automático (push em main). Use este script só para publicar
    o que está na pasta local sem passar pelo GitHub.
.PARAMETER ProjectId
    ID do projeto Google Cloud. Se omitido, usa o projeto configurado no gcloud.
#>
[CmdletBinding()]
param(
    [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# O instalador do Cloud SDK nem sempre coloca o gcloud no PATH do PowerShell.
$gcloud = (Get-Command gcloud -ErrorAction SilentlyContinue)?.Source
if (-not $gcloud) {
    $candidato = Join-Path $env:LOCALAPPDATA "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    if (Test-Path $candidato) { $gcloud = $candidato }
}
if (-not $gcloud) {
    throw "gcloud CLI não encontrado. Instale o Google Cloud SDK ou adicione-o ao PATH."
}

if (-not $ProjectId) {
    $ProjectId = (& $gcloud config get-value project 2>$null | Out-String).Trim()
}
if (-not $ProjectId) {
    throw "Nenhum projeto GCP configurado. Use 'gcloud config set project SEU_PROJETO' ou -ProjectId."
}

# A imagem é etiquetada com o commit; alterações não commitadas ficam marcadas.
$sha = (git rev-parse --short=7 HEAD).Trim()
if (git status --porcelain) {
    Write-Warning "Há alterações não commitadas: a imagem será etiquetada como $sha-local."
    $sha = "$sha-local"
}

Write-Host "Projeto: $ProjectId   Commit: $sha" -ForegroundColor Cyan
Write-Host "Submetendo cloudbuild.yaml (testes, build, deploy e teste de fumaça)..." -ForegroundColor Yellow

& $gcloud builds submit --project=$ProjectId --config=cloudbuild.yaml --substitutions="SHORT_SHA=$sha" .
if ($LASTEXITCODE -ne 0) {
    throw "O build falhou (código $LASTEXITCODE). Nada foi publicado além do que o log acima indicar."
}

Write-Host "Deploy concluído e verificado." -ForegroundColor Green
