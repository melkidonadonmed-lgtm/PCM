#!/usr/bin/env bash
# ==============================================================================
# Deploy manual do PresCMed no Google Cloud Run.
#
# Submete o MESMO cloudbuild.yaml usado pelo gatilho de push em main: type-check,
# testes, build da imagem, deploy e teste de fumaça. O deploy normal é automático
# (push em main); use este script só para publicar a pasta local sem o GitHub.
# ==============================================================================
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
if [ -z "$PROJECT_ID" ]; then
    echo "Erro: nenhum projeto GCP configurado (gcloud config set project SEU_PROJETO ou GCP_PROJECT_ID)." >&2
    exit 1
fi

# A imagem é etiquetada com o commit; alterações não commitadas ficam marcadas.
SHA="$(git rev-parse --short=7 HEAD)"
if [ -n "$(git status --porcelain)" ]; then
    echo "Aviso: há alterações não commitadas; a imagem será etiquetada como ${SHA}-local." >&2
    SHA="${SHA}-local"
fi

echo "Projeto: $PROJECT_ID   Commit: $SHA"
echo "Submetendo cloudbuild.yaml (testes, build, deploy e teste de fumaça)..."

gcloud builds submit --project="$PROJECT_ID" --config=cloudbuild.yaml --substitutions="SHORT_SHA=$SHA" .

echo "Deploy concluído e verificado."
