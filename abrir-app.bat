@echo off
setlocal
cd /d "%~dp0"
title PresCMed (PCM) - Prescricao e Doses Pediatricas

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado neste computador.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Instalando dependencias do PCM...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

echo ====================================================================
echo  PCM (PresCMed) - Iniciando na porta 3000...
echo  Acesse em: http://localhost:3000
echo  (O navegador abrira automaticamente em instantes)
echo ====================================================================
echo  Para encerrar o aplicativo, pressione Ctrl+C.
echo ====================================================================
echo.

call npm run dev
if errorlevel 1 (
  echo.
  echo O aplicativo foi encerrado com erro.
  pause
)
