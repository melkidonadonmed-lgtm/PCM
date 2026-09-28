<#
.SYNOPSIS
    Script de automação para Build e Deploy do PresCMed no Google Cloud Run via PowerShell 7 / Windows.
.DESCRIPTION
    Habilita APIs GCP necessárias, cria repositório no Artifact Registry se inexistente,
    submete o container ao Google Cloud Build e realiza o deploy no Cloud Run com HTTPS automático.
.PARAMETER ProjectId
    ID do projeto Google Cloud. Se omitido, utiliza a configuração atual do gcloud CLI.
.PARAMETER Region
    Região GCP para deploy (padrão: southamerica-east1 ou us-central1).
#>
[CmdletBinding()]
param(
    [string]$ProjectId = "",
    [string]$Region = "southamerica-east1",
    [string]$ServiceName = "prescmed",
    [string]$RepoName = "prescmed-repo"
)

$ErrorActionPreference = "Stop"

Write-Host "=== PRESCMED (PCM) — AUTOMAÇÃO DE DEPLOY NO GOOGLE CLOUD RUN ===" -ForegroundColor Cyan

# 1. Obter ou validar o projeto GCP
if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null).Trim()
}

if (-not $ProjectId) {
    Write-Error "Nenhum projeto GCP configurado no gcloud CLI. Defina com 'gcloud config set project SEU_PROJECT_ID' ou passe -ProjectId SEU_ID."
}

$ImageTag = "${Region}-docker.pkg.dev/${ProjectId}/${RepoName}/${ServiceName}:latest"

Write-Host "Projeto GCP:  $ProjectId" -ForegroundColor Green
Write-Host "Região:       $Region" -ForegroundColor Green
Write-Host "Serviço:      $ServiceName" -ForegroundColor Green
Write-Host "Repositório:  $RepoName" -ForegroundColor Green
Write-Host "Imagem:       $ImageTag" -ForegroundColor Green
Write-Host ("-" * 60)

# 2. Habilitar APIs necessárias
Write-Host ">> Verificando e habilitando APIs necessárias (Cloud Run, Artifact Registry, Cloud Build)..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project=$ProjectId

# 3. Garantir existência do repositório Artifact Registry
Write-Host ">> Garantindo repositório Docker no Artifact Registry..." -ForegroundColor Yellow
$repoExists = $false
try {
    $checkOutput = gcloud artifacts repositories describe $RepoName --location=$Region --project=$ProjectId 2>&1
    if ($LASTEXITCODE -eq 0) {
        $repoExists = $true
    }
} catch {
    $repoExists = $false
}

if (-not $repoExists) {
    Write-Host "Criando repositório $RepoName em $Region..."
    gcloud artifacts repositories create $RepoName `
        --repository-format=docker `
        --location=$Region `
        --description="PresCMed Web Docker Repository" `
        --project=$ProjectId
} else {
    Write-Host "Repositório $RepoName já existe em $Region."
}

# 4. Submeter build ao Cloud Build
Write-Host ">> Submetendo build para o Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --project=$ProjectId --tag=$ImageTag .

# 5. Realizar o deploy no Cloud Run
Write-Host ">> Realizando deploy no Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --project=$ProjectId `
    --image=$ImageTag `
    --platform=managed `
    --region=$Region `
    --allow-unauthenticated `
    --memory=256Mi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --port=8080

# 6. Exibir URL final
$serviceUrl = (gcloud run services describe $ServiceName --platform=managed --region=$Region --project=$ProjectId --format="value(status.url)").Trim()

Write-Host ("=" * 60)
Write-Host "✔ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "Acesse o PresCMed em: $serviceUrl" -ForegroundColor Cyan
Write-Host ("=" * 60)
