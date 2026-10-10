# PresCMed — CURRENT STATE (.context)

## Fase Atual: v2.0.7 (Correção Crítica: Emissão de PDF no Android/WebView)

**Correção aplicada (10/10/2026):** "Baixar PDF" não emitia nada na receita nem na APAC/documentos SUS.
- **Causa raiz:** `pdf.save()` do jsPDF usa internamente o truque `viewSupported` que, em WebViews sem visualizador de PDF embutido, abre uma JANELA POPUP (`window.open`) — bloqueada silenciosamente no app instalado. O clique simplesmente não fazia nada.
- **Fix:** novo utilitário `src/utils/downloadPdf.ts` (`downloadPdfDoc`): gera o Blob via `doc.output('blob')` e dispara download por `<a download>` anexado ao DOM (remoção tardia de 10s para não cancelar o download no WebView), com fallback dataURI→fetch e, em último caso, abertura em aba.
- **Pontos de chamada substituídos (todos os fluxos de PDF):**
  - `PrintPreview.tsx` (receita comum, controle especial, exames)
  - `SusDocumentsFiller.tsx` (APAC/LME/TFD/LOAS — individual e múltiplos documentos)
  - `DocumentEditorView.tsx` (Editor A4 / laudos TipTap)

## Design System (fase anterior, mantido)
- Paleta fosca/tátil uniforme (tokens únicos em `index.css` + `tailwind.config.js`), cores discretas creme/sálvia, sem tons discrepantes; `PrintablePrescription.tsx` sincronizado.

---

## Status de Implantação e Nuvem
- **Deploy único e oficial: Google Cloud Run** (decisão do usuário em 10/10/2026 — Vercel descartada; nenhum arquivo/config Vercel no repositório).
- Firebase segue apenas como camada de dados/auth (Firestore rules no repo); o app é servido pelo Cloud Run.
- URL Ativa: `https://prescmed-1044179901556.southamerica-east1.run.app`
- Alias Direto: `https://prescmed-syqnqsm4iq-rj.a.run.app`
- **PENDENTE:** commit local `57adf873` (fix PDF) ainda NÃO foi publicado — esta sessão não tem acesso ao GitHub nem credenciais gcloud. Publicar de quem tem as credenciais:
  1. `git push origin HEAD:main`
  2. `pwsh -File .\deploy-cloudrun.ps1` (ou `bash deploy-cloudrun.sh`)

---

## Qualidade
- 83/83 testes aprovados · `tsc --noEmit` limpo · `npm run build` OK (PWA gerado) · design:lint 0 erros

## Débitos Técnicos e Blockers
- Nenhum blocker de código. Único débito: publicar o fix do PDF (push + deploy acima).
