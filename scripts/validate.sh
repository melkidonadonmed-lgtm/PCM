#!/usr/bin/env bash
# Script de validação local do PresCMed (PCM)
set -e

echo "==> 1. Executando checagem de tipos e lint (TypeScript)..."
npm run lint

echo "==> 2. Executando suíte de testes clínicos e regulatórios..."
npm test

echo "==> 3. Executando build de produção (Vite)..."
npm run build

echo "✅ PresCMed: Todas as validações passaram com sucesso!"
