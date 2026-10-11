# PresCMed — CURRENT STATE (.context)

## Fase atual: saída única de documentos (10/10/2026)

**Problema resolvido:** a prévia mostrava uma coisa e o arquivo saía outra. Havia cinco desenhos
independentes do mesmo documento (prévia da tela de receitas, folha do `PrintPreview`, PDF desenhado à
mão em `pdfGenerator.ts`, Editor A4 e HTML dos documentos SUS).

**Agora existe uma única folha:** `src/components/documento/` (`FolhaA4` + `DocumentoClinico`). A prévia,
a impressão e o PDF saem dela. Detalhes e regras em `AGENTS.md` → "Geração e Impressão de Documentos".

### O que mudou
- `pdfGenerator.ts` e `jspdf-autotable` removidos; PDF = fotografia da folha exibida (`exportarFolhaPdf`).
- `html2canvas` → `html2canvas-pro`: o original falhava com as cores `oklch` do Tailwind v4, e o código
  caía em silêncio em `window.print()` — por isso o PDF do SUS/APAC e do Editor A4 nunca era gerado.
- Cabeçalho = local de atendimento + logo; médico na assinatura (e no "emitente" da receita especial).
- Removidos QR code, "Validação Digital CFM" e "Assinatura Eletrônica Válida": o app não assina digitalmente.
- Receita de controle especial: as duas vias trazem a prescrição completa e o endereço do paciente.
- Editor A4 voltou a abrir (TipTap 3 lançava exceção ao ler `editor.view` antes da montagem).
- Atestado: CID-10 começa desmarcado; datas em horário local (antes, à noite, saía o dia seguinte).
- Deploy: cabeçalhos de segurança efetivos no nginx, Node 24, testes como portão do build, teste de fumaça.
- `node_modules/` deixou de ser versionado (eram 30.957 arquivos no git).

## Implantação
- Produção: Cloud Run `prescmed` (southamerica-east1) — https://prescmed-syqnqsm4iq-rj.a.run.app
- Deploy automático no push em `main` (gatilho `gcpmain` → `cloudbuild.yaml`).

## Qualidade
- 138/138 testes · `tsc --noEmit` limpo · `npm run build` OK · bundle principal 2,34 MB → 0,47 MB
  (logos em base64 saíram do JavaScript; motor de PDF sob demanda).
- Validado em navegador (dados fictícios): desktop claro e celular escuro geram PDFs idênticos.

## Pendências (precisam de decisão ou revisão humana)
1. **Notificação de Receita:** benzodiazepínicos (B1), opioides (A1/A2) e estimulantes (A3) saem hoje como
   "Receituário de Controle Especial". Esses exigem Notificação de Receita B/A em talonário próprio; o app
   deveria avisar isso em vez de sugerir que a folha impressa basta.
2. **Sexo do paciente na receita de antimicrobiano:** a RDC 471/2021 pede nome, idade e sexo. O cadastro
   usa "masculino" como valor inicial, então o sexo não é impresso (seria um dado presumido).
3. **SIGTAP e procedimento dos documentos SUS** ainda abrem preenchidos com o padrão do catálogo.
4. Promover a CSP de `Report-Only` para bloqueante depois de validar login Google/Firebase.
5. Unificar os cabeçalhos duplicados do Editor A4 (`DocumentEditorView.tsx`) com os componentes da folha.
6. Fonte de ícones de 4 MB (`material-symbols`) domina o cache offline; avaliar subconjunto.
