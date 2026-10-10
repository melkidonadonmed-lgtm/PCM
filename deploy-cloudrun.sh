#!/usr/bin/env bash
# ==============================================================================
# Script de automação: Build e Deploy do PresCMed no Google Cloud Run
# ==============================================================================
set -euo pipefail

# Cores para exibição no terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== PRESCMED (PCM) — AUTOMAÇÃO DE DEPLOY NO GOOGLE CLOUD RUN ===${NC}"

# 1. Obter ou definir projeto GCP e região
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Erro: Nenhum projeto GCP configurado no gcloud CLI ou na variável GCP_PROJECT_ID.${NC}"
    echo "Defina com: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

REGION="${GCP_REGION:-southamerica-east1}"
SERVICE_NAME="prescmed"
REPO_NAME="prescmed-repo"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"

echo -e "${GREEN}Projeto GCP:${NC}  $PROJECT_ID"
echo -e "${GREEN}Região:${NC}       $REGION"
echo -e "${GREEN}Serviço:${NC}      $SERVICE_NAME"
echo -e "${GREEN}Repositório:${NC}  $REPO_NAME"
echo -e "${GREEN}Imagem:${NC}       $IMAGE_TAG"
echo "------------------------------------------------------------------"

# 2. Habilitar APIs necessárias no Google Cloud
echo -e "${YELLOW}>> Verificando e habilitando APIs necessárias (Cloud Run, Artifact Registry, Cloud Build)...${NC}"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --project="$PROJECT_ID"

# 3. Garantir criação do repositório no Artifact Registry
echo -e "${YELLOW}>> Garantindo repositório Docker no Artifact Registry...${NC}"
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "Criando repositório $REPO_NAME na região $REGION..."
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="PresCMed Web Docker Repository" \
        --project="$PROJECT_ID"
else
    echo "Repositório $REPO_NAME já existe."
fi

# 4. Executar Cloud Build na nuvem (sem necessidade de Docker local)
echo -e "${YELLOW}>> Submetendo build para o Google Cloud Build...${NC}"
gcloud builds submit \
    --project="$PROJECT_ID" \
    --tag="$IMAGE_TAG" \
    .

# 5. Fazer deploy do container no Cloud Run
echo -e "${YELLOW}>> Realizando deploy no Google Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    --image="$IMAGE_TAG" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --port=8080

# 6. Exibir URL pública do serviço
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform=managed --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")

echo "=================================================================="
echo -e "${GREEN}✔ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "Acesse o PresCMed em: ${BLUE}${SERVICE_URL}${NC}"
echo "=================================================================="
