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

### Documentos SUS no impresso oficial (11/10/2026)
- **APAC (laudo de 55 campos) e LME (23 campos)** saem sobre o próprio formulário do Ministério da Saúde:
  a imagem do impresso é o fundo da folha (`public/formularios-sus/`) e os dados caem em cada campo
  numerado (`data/formulariosOficiaisSus.ts`, `components/documento/FormularioOficialSus.tsx`).
- Campo sem dado fica em branco para a caneta; sexo, raça/cor, tratamento prévio e incapacidade só saem
  marcados se escolhidos na tela. Texto que não cabe na caixa sai com "[…]" e a tela avisa.
- Os outros 7 documentos SUS não têm impresso nacional único: seguem no modelo do app, agora com o logo
  do órgão do posto de trabalho ativo (SEMUSA, na USF) à esquerda e o do SUS à direita do título
  (`TimbreSus` em `susDocumentsCatalog.ts`). A tela diz em cada cartão qual é o caso.
- **Timbre geral:** receitas, exames, atestado e encaminhamento de posto público saem com o logo do
  órgão à esquerda, o nome do local no meio e o logo do SUS à direita (antes só o logo do órgão).
  Documentos da categoria APAC levam o logo do estado (SESAU-RO) no lugar do municipal.
- Os PDFs da pasta do Drive `16_Documentos_comp_SUS` **não são os impressos oficiais** (são recriações:
  APAC com 52 campos, LME com 27). Não usar como referência de diagramação.
- Fundos gerados dos PDFs oficiais com `sandbox/python/pcm-formularios/gera_fundo.py` (PyMuPDF, 200 dpi);
  validação em navegador com `sandbox/node/pcm-repro/formularios.mjs`.

## Implantação
- Produção: Cloud Run `prescmed` (southamerica-east1) — https://prescmed-syqnqsm4iq-rj.a.run.app
- Deploy automático no push em `main` (gatilho `gcpmain` → `cloudbuild.yaml`).

## Qualidade
- 184/184 testes · `tsc --noEmit` limpo · `npm run design:lint` limpo · `npm run build` OK · bundle principal 2,34 MB → 0,47 MB
  (logos em base64 saíram do JavaScript; motor de PDF sob demanda).
- Validado em navegador (dados fictícios): desktop claro e celular escuro geram PDFs idênticos.

### Padrão PEC do SUS (A4 Paisagem) + Correções dos Grupos A e B (13/10/2026)
- **Receituário em A4 paisagem (padrão PEC do SUS):** as três modalidades de receita (`simple_prescription`, `antimicrobial_prescription`, `special_prescription`) saem sempre em A4 paisagem (`1123×794 px`), facilitando o corte ao meio (`✂`):
  - *Simples:* 1 via na metade esquerda da folha A4 paisagem, linha de corte central e metade direita em branco.
  - *Antimicrobiano (RDC Anvisa nº 471/2021):* 2 vias lado a lado no mesmo modelo limpo da receita simples (válida por 10 dias; retenção da 2ª via na farmácia).
  - *Controle Especial (Portaria SVS/MS nº 344/98):* 2 vias lado a lado com os quadros de comprador e fornecedor (retenção da 1ª via na farmácia).
- **Grupo A resolvido:**
  - Editor A4 (`DocumentEditorView.tsx`): seletor no topo com 3 botões independentes (`Receita simples`, `Antimicrobiano • 2 vias`, `Controle especial • 2 vias`), corrigindo o bug em que o botão "Receita simples" não trocava a folha em consultas mistas (antiga pendência #10).
  - Documentos SUS sem impresso oficial (`susDocumentsCatalog.ts`): SIGTAP e nome do procedimento não abrem mais pré-preenchidos por padrão nos 7 modelos restantes; o médico opta explicitamente pelo botão "Usar código sugerido" em `SusDocumentsFiller.tsx` (antiga pendência #3).
- **Grupo B resolvido:**
  - *Notificação de Receita (antiga pendência #1):* adicionado `avisoTextoNotificacao` no texto de WhatsApp e área de transferência (`PrescriptionBuilder.tsx` e `PrintPreview.tsx`) para alertar sobre a exigência de talonário físico (Listas A1, A3, B1, B2 e C2) sem poluir a folha A4 impressa; substituído o Clonazepam (Lista B1) por Cloridrato de Amitriptilina 25 mg (Lista C1) no modelo pronto `tpl-receituario-controle-especial` (`presetClinicalTemplates.ts`).
  - *Sexo do paciente na receita de antimicrobiano (RDC 471/2021 — antiga pendência #2):* adicionado campo opcional `sex?: '' | 'M' | 'F'` em `Patient` (iniciando vazio `''`, nunca presumido), com seletor em `PatientModal.tsx`, sincronização bidirecional com `SusDocumentsFiller.tsx` e impressão em `ReceitaDuasVias.tsx` apenas quando informado.
  - *CNS, CPF e CNES do médico no perfil (antiga pendência #6):* adicionados campos opcionais `cns`, `cpf` e `cnes` em `DoctorProfileModal.tsx` e `DEFAULT_DOCTOR`, preservando-os ao salvar o perfil e preenchendo automaticamente o campo 15 da LME e o campo 44 da APAC.
  - *Timbre institucional nas 2 vias do Editor A4 (antiga pendência #8):* cabeçalhos de 1ª e 2ª via em `DocumentEditorView.tsx` exibem o logotipo principal à esquerda e o logotipo secundário (SUS) à direita, alinhados ao `CabecalhoInstitucional.tsx`.

## Pendências (precisam de decisão ou revisão humana)
1. **Notificação de Receita (escopo complementar):**
   - a detecção é por nome: marcas fora da tabela, codeína/tramadol acima de 100 mg por unidade,
     tretinoína sistêmica e a Lista C3 (talidomida, lenalidomida) passam sem aviso;
   - o Termo de Responsabilidade da sibutramina não é citado (falta fonte primária);
   - a tabela precisa ser reconferida a cada atualização do Anexo I da Portaria 344/98.
2. **Impressos oficiais que faltam:** SISCAN (citopatológico, histopatológico, mamografia) tem formulário
   nacional do INCA e pode entrar no mesmo motor, mas exige campos novos na tela (anamnese ginecológica,
   exame clínico). Guia SISREG, GAL/LACEN, TRM-TB e "APAC complementar" não têm modelo nacional único:
   é preciso o impresso usado em Porto Velho/RO (foto ou PDF) para reproduzir.
3. **APAC:** a cópia do modelo nacional veio do site da SES/RS (o Ministério não publica o PDF em página
   própria). Conferir com o impresso que a regulação local aceita; campos 4, 11, 12, 15 e 21–35 ficam em
   branco porque o app não coleta esses dados.
4. Promover a CSP de `Report-Only` para bloqueante depois de validar login Google/Firebase.
5. Fonte de ícones de 4 MB (`material-symbols`) domina o cache offline; avaliar subconjunto.

