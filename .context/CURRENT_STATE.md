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
- 180/180 testes · `tsc --noEmit` limpo · `npm run build` OK · bundle principal 2,34 MB → 0,47 MB
  (logos em base64 saíram do JavaScript; motor de PDF sob demanda).
- Validado em navegador (dados fictícios): desktop claro e celular escuro geram PDFs idênticos.

## Pendências (precisam de decisão ou revisão humana)
1. **Notificação de Receita:** o app agora avisa na tela (formulário, lista de medicamentos, prévia e
   emissão) quando o controlado exige Notificação de Receita A/B/B2/Especial em talonário próprio
   (`utils/notificacaoDeReceita.ts`), também no Editor A4. Continua em aberto:
   - esses itens ainda saem na folha de controle especial, com os dizeres de retenção da 1ª via (o aviso
     não bloqueia a emissão nem muda a folha);
   - o texto de WhatsApp/copiar ainda os chama de "Receituário de Controle Especial", sem ressalva;
   - o modelo pronto de controle especial (`presetClinicalTemplates.ts`) usa clonazepam, que é B1, como exemplo;
   - a detecção é por nome: marcas fora da tabela, codeína/tramadol acima de 100 mg por unidade,
     tretinoína sistêmica e a Lista C3 (talidomida, lenalidomida) passam sem aviso;
   - o Termo de Responsabilidade da sibutramina não é citado (falta fonte primária);
   - a tabela precisa ser reconferida a cada atualização do Anexo I da Portaria 344/98 (conferida na
     Atualização nº 101, RDC 1.036/2026, por leitura resumida de reprodução não oficial).
2. **Sexo do paciente na receita de antimicrobiano:** a RDC 471/2021 pede nome, idade e sexo. O cadastro
   usa "masculino" como valor inicial, então o sexo não é impresso (seria um dado presumido).
3. **SIGTAP e procedimento dos documentos SUS** ainda abrem preenchidos com o padrão do catálogo nos 7
   documentos que não têm impresso oficial (na APAC e na LME já abrem em branco).
4. **Impressos oficiais que faltam:** SISCAN (citopatológico, histopatológico, mamografia) tem formulário
   nacional do INCA e pode entrar no mesmo motor, mas exige campos novos na tela (anamnese ginecológica,
   exame clínico). Guia SISREG, GAL/LACEN, TRM-TB e "APAC complementar" não têm modelo nacional único:
   é preciso o impresso usado em Porto Velho/RO (foto ou PDF) para reproduzir.
5. **APAC:** a cópia do modelo nacional veio do site da SES/RS (o Ministério não publica o PDF em página
   própria). Conferir com o impresso que a regulação local aceita; campos 4, 11, 12, 15 e 21–35 ficam em
   branco porque o app não coleta esses dados.
6. **LME:** o cadastro do médico não guarda CNS (campo 15); é digitado a cada sessão na tela do documento.
7. Promover a CSP de `Report-Only` para bloqueante depois de validar login Google/Firebase.
8. Unificar os cabeçalhos duplicados do Editor A4 (`DocumentEditorView.tsx`) com os componentes da folha.
9. Fonte de ícones de 4 MB (`material-symbols`) domina o cache offline; avaliar subconjunto.
10. Editor A4: com mais de uma receita na consulta, o botão "Receita simples" do seletor não troca a folha
   (continua na de controle especial). Visto em 11/10/2026; já ocorria antes do aviso de notificação.
