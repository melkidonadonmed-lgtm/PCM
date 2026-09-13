# DISPATCH: Verificação de Compilação, Lint e Build de Produção

Você atuará como Worker de Verificação Técnica Independente para o Victory Auditor do PresCMed.
Sua pasta exclusiva de trabalho é: c:\Users\melki\projetos\pcm\.agents\worker_audit_build

## Missão:
1. Navegue até o diretório c:\Users\melki\projetos\pcm.
2. Execute o comando `npm run lint` (`tsc --noEmit`).
   - Capture a saída completa e o código de saída.
   - Verifique se há qualquer erro ou warning de tipagem TypeScript.
3. Execute o comando `npm run build` (`vite build`).
   - Capture a saída completa e o código de saída.
   - Verifique se o diretório `dist/` foi gerado e inspecione seus arquivos (tamanho, integridade, hashes dos assets gerados).
4. Elabore um relatório detalhado com a evidência de execução em `c:\Users\melki\projetos\pcm\.agents\worker_audit_build\handoff.md`.
5. Envie uma mensagem com seu veredicto formal (`PASS` ou `FAIL`) e resumo das evidências para o Victory Auditor.
