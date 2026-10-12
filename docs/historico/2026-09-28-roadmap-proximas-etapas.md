# ROADMAP TÉCNICO E DE PRODUTO — PRESCMED (PCM)
## Evolução para Plataforma Médica Multi-Instituição, Local-First e Editor Livre

**Versão da Linha de Base:** 1.1.0 (Pós-Estabilização do Chunk de 294 kB)  
**Data:** 28 de Setembro de 2026  
**Status:** Pronto para Execução Faseada  

---

## OBJETIVO ESTRATÉGICO
Transformar o PresCMed de um utilitário estático de plantão em uma **Plataforma Médica Híbrida Multi-Instituição**, permitindo que o profissional alterne dinamicamente entre diferentes locais de trabalho (SUS Municipal/UBS, SUS Estadual/Policlínicas e Consultório Privado) com regras sanitárias, timbrados e catálogos próprios (REMUME vs. RENAME), integrando um módulo de edição livre de documentos clínicos estilo processador de texto (Docs/Word) com paginação A4 e persistência resiliente Local-First com sincronização em nuvem via Cloud Run e Firestore.

---

## FASE 0: VALIDAÇÃO DE LINHA DE BASE E INTEGRIDADE
* **Objetivo:** Assegurar que as otimizações de code-splitting e desacoplamento estejam consolidadas antes de introduzir novos módulos de tela.
* **Entregáveis:**
  1. Suíte de testes clínicos executada com `npm test` confirmando regras da RDC 20 e Portaria 344/98 intactas.
  2. Validação de build limpo (`npm run clean && npm run build`) com tempo inferior a 4 segundos.
  3. Checagem de tipagem estrita com zero erros via `npx tsc --noEmit`.
* **Dependências:** Walkthrough de estabilização aprovado e repositório sincronizado.
* **Esforço:** Baixo.

---

## FASE 1: ARQUITETURA MULTI-INSTITUIÇÃO (CONTEXTOS DE TRABALHO)
* **Objetivo:** Resolver a segregação regulatória entre Município, Estado e Privado, permitindo troca imediata de perfil de atuação em 1 clique.
* **Entregáveis:**
  1. **Modelo de Domínio `WorkContext`:**
     - Estrutura tipada em `src/types.ts` contendo: ID institucional, Razão Social, Esfera (Municipal / Estadual / Privado), CRM/UF de atuação, Endereço de dispensação, Logotipo e Regras Farmacológicas.
  2. **Configuração de Restrição Sanitária:**
     - Flag para limitar busca a medicamentos da Relação Municipal (REMUME) em UBS ou Relação Nacional/Estadual (RENAME/Componente Especializado) na Policlínica.
  3. **Alternador Rápido na Interface (Context Switcher):**
     - Seletor de topo na `Sidebar.tsx` e `Header.tsx` exibindo o local atual ativo com mudança instantânea de carimbos e timbrados.
* **Dependências:** Fase 0 concluída; `usePrescriptionSession.ts` ativo.
* **Esforço:** Médio.

---

## FASE 2: MÓDULO DE EDIÇÃO LIVRE ESTILO DOCS/WORD (CANVAS A4 TÁTIL)
* **Objetivo:** Permitir ao médico criar, formatar e personalizar prescrições, relatórios e laudos com total liberdade visual sem engessamento de formulário rígido.
* **Entregáveis:**
  1. **Engine de Texto Rico Tiptap (Headless):**
     - Instalação e configuração do Tiptap com extensões de tipografia, alinhamento, tabelas e nós personalizados.
  2. **Folha de Trabalho A4 Calibrada:**
     - Contêiner milimétrico (210mm x 297mm) com margens regulamentares, sombreamento tátil hospitalar e quebra automática de páginas.
  3. **Barra de Ferramentas de Formatação:**
     - Seletor de famílias tipográficas clínicas (Plus Jakarta Sans, Cormorant Garamond, Inter, Merriweather).
     - Controles de tamanho (pontos/pixels), entrelinha, negrito, itálico, cores de texto e marcadores.
  4. **Gestão de Imagens e Logotipos:**
     - Componente de upload, redimensionamento e fixação de logotipo institucional no cabeçalho ou rodapé.
  5. **Exportação Fiel em PDF:**
     - Pipeline de captura vetorial e rasterizada direta do nó do documento para download imediato em A4.
* **Dependências:** Fase 1 (herança do contexto institucional ativo).
* **Esforço:** Alto.

---

## FASE 3: PERSISTÊNCIA LOCAL-FIRST (INDEXEDDB) E NUVEM (CLOUD RUN + FIRESTORE)
* **Objetivo:** Superar a barreira de 5 MB do `localStorage` para suportar imagens de logos e múltiplos documentos, habilitando backup e login seguro.
* **Entregáveis:**
  1. **Camada de Banco Local com Dexie.js (IndexedDB):**
     - Tabelas locais: `work_contexts`, `prescription_templates`, `saved_documents`, `assets_blob`.
     - Zero dependência de internet para consultas diárias.
  2. **Autenticação Google Sign-In (Firebase Auth):**
     - Modal de login para identificação do profissional e recuperação de perfis.
  3. **Sincronização Assíncrona no Cloud Firestore:**
     - Sincronização em segundo plano dos modelos de receita e perfis quando houver conexão ativa.
  4. **Empacotamento para Google Cloud Run:**
     - Criação de `Dockerfile` multi-stage leve com Nginx para servir a SPA estática em HTTPS com alta performance e baixo custo.
* **Dependências:** Fase 2 concluída.
* **Esforço:** Alto.

---

## FASE 4: SUBAGENTE CRIADOR DE LOGOTIPOS CLÍNICOS E MARCAS DE ÁGUA
* **Objetivo:** Prover ferramenta integrada para que o profissional crie identidades visuais minimalistas e timbrados sem softwares externos.
* **Entregáveis:**
  1. **Gerador Procedural Vetorial (SVG / Canvas Offline):**
     - Construtor modular combinando monogramas tipográficos, símbolos da medicina e geometria hospitalar com paleta de cores institucional.
  2. **Modo Exportação e Injeção em 1 Clique:**
     - Vinculação direta do SVG gerado ao `WorkContext` ativo para estampar automaticamente as folhas de prescrição.
* **Dependências:** Fases 1 e 2.
* **Esforço:** Médio.

---

## PRÓXIMO PASSO SUGERIDO
Iniciar a execução pela **Fase 1 (Arquitetura Multi-Instituição)**, criando a modelagem tipada do `WorkContext` e o alternador de contexto (UBS vs. Policlínica) na Sidebar, garantindo que o cabeçalho e as restrições sanitárias mudem de forma instantânea.
