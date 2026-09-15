# Relatório de Auditoria Forense de Integridade — Marco M6

**Auditor**: Forensic Auditor (`auditor_m6`)  
**Papéis**: Critic, Specialist, Auditor  
**Data**: 2026-09-15T02:47:00Z  
**Repositório**: `c:\Users\melki\projetos\pcm`  
**Diretório de Trabalho**: `c:\Users\melki\projetos\pcm\.agents\auditor_m6\`  
**Alvo**: Entregáveis do Worker M6 (Marco M6 — Testes Seriados, Engenharia de Componentes e Simulação de Jornada)  
**Modo de Integridade**: `development` (extraído de `ORIGINAL_REQUEST.md`)  
**Veredito Binário**: `VEREDICTO: CLEAN`

---

## Forensic Audit Report

**Work Product**: Sincronização em `src/utils/prescriptionRules.test.ts` e `src/components/PrescriptionBuilder.tsx`, script de simulação `.agents/worker_m6/simulate_journey.ts`, suíte de testes unitários (18 casos) e build de produção em `dist/`.  
**Profile**: General Project  
**Verdict**: **CLEAN**

### Phase Results
- **Hardcoded Test Results Check**: PASS — Nenhuma string de teste embutida, nenhum retorno forçado ou bypass detectado no código-fonte nem nos testes.
- **Facade Detection Check**: PASS — Funções de regras de prescrição, cálculo de doses, catalogação de CID-10 e geração de páginas contêm lógica algorítmica autêntica e completa; nenhuma função stub/dummy (`return <const>` ou `NotImplementedError`).
- **Pre-populated Artifact Detection Check**: PASS — Nenhum arquivo de log artificial, resultado pré-gravado ou atestação fraudulenta localizado no workspace.
- **Self-Certifying Tests Check**: PASS — Os testes unitários invocam rotinas dinâmicas e avaliam propriedades clínicas, matemáticas e normativas independentes via asserções estritas (`node:assert/strict`).
- **Regulatory & Algorithmic Synchronization Check**: PASS — A sincronização de vias em antimicrobianos (1ª via Farmácia / 2ª via Paciente) restaura estrita conformidade com o Art. 6º da RDC ANVISA nº 20/2011 e harmoniza `prescriptionRules.test.ts`, `PrescriptionBuilder.tsx`, `prescriptionPdf.ts`, `pdfGenerator.ts` e `PrintPreview.tsx`.
- **Production Bundle Verification**: PASS — O bundle `dist/assets/index-mDcrjtQk.js` contém a string sincronizada `"1ª Via: Farmácia (retenção) • 2ª Via: Paciente"`, com eliminação total da string legada invertida.
- **Simulation Script Authenticity Check**: PASS — O script `.agents/worker_m6/simulate_journey.ts` importa e executa 100% de código real de produção através dos 6 componentes centrais, cobrindo 19 cenários clínicos com asserções estritas.

---

## 1. Observation (Observações Diretas e Evidências Empíricas)

Foram inspecionados exaustivamente o código-fonte, os arquivos de teste, os artefatos de compilação em `dist/` e os scripts do workspace:

### 1.1 Sincronização em `src/utils/prescriptionRules.test.ts`
- **Linhas 72 a 76**:
  ```ts
  const pages = layoutPrescriptionPages([docs[1]], doctor, patient);
  assert.equal(pages.length, 2);
  assert.ok(pages[0].texts.some(t => t.text.includes('1ª via — Farmácia')));
  assert.ok(pages[1].texts.some(t => t.text.includes('2ª via — Paciente')));
  assert.ok(pages.every(p => p.texts.some(t => t.text.includes('20 comprimidos'))));
  ```
- **Conformidade com o Gerador de Layout** (`src/utils/prescriptionPdf.ts:85-88`):
  ```ts
  // RDC 20/2011 (Antimicrobianos) e Portaria 344/98 (C1): 1ª via Farmácia (retenção), 2ª via Paciente.
  const copyLabel = document.copies === 1 ? 'Via do paciente' : document.kind === 'antimicrobial'
    ? copy === 1 ? '1ª via — Farmácia (retenção)' : '2ª via — Paciente'
    : copy === 1 ? '1ª via — Farmácia (retenção)' : '2ª via — Paciente';
  ```
- **Base Sanitária Legal**: Art. 6º da Resolução RDC ANVISA nº 20/2011:
  > *"A prescrição de medicamentos antimicrobianos deverá ser realizada em receituário privativo do prescritor ou do estabelecimento de saúde, em 2 (duas) vias, sendo a 1ª via retida no estabelecimento farmacêutico e a 2ª via devolvida ao paciente, atestada, como comprovante do atendimento."*

### 1.2 Sincronização no Componente `src/components/PrescriptionBuilder.tsx`
- **Linhas 2065 a 2075**:
  ```tsx
  {activeDoc?.kind === 'antimicrobial' && (
    <div className="text-[10px] font-bold tracking-wide uppercase text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 mb-2 inline-flex items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-1.5"></span>
      <span>1ª Via: Farmácia (retenção) • 2ª Via: Paciente (RDC 20/2011)</span>
    </div>
  )}
  {activeDoc?.kind === 'c1' && (
    <div className="text-[10px] font-bold tracking-wide uppercase text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 mb-2 inline-flex items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block mr-1.5"></span>
      <span>1ª Via: Farmácia • 2ª Via: Paciente (Portaria 344/98)</span>
    </div>
  )}
  ```

### 1.3 Verificação no Pacote de Produção (`dist/assets/index-mDcrjtQk.js`)
- A busca pela string sincronizada `"1ª Via: Farmácia (retenção) • 2ª Via: Paciente"` retornou confirmação positiva no arquivo minificado de produção `dist/assets/index-mDcrjtQk.js`.
- A busca pela string invertida antiga `"1ª Via: Paciente • 2ª Via: Farmácia"` retornou **0 ocorrências** em todo o repositório (`dist/` e `src/`).

### 1.4 Análise dos Testes Unitários do Repositório
- A suíte é composta por exatamente 18 testes unitários (17 em `src/utils/prescriptionRules.test.ts` e 1 em `tests/smoke.test.ts`).
- Nenhum teste utiliza anotações de skip (`test.skip`, `it.skip`), asserções tautológicas (`assert.ok(true)`) ou mocks artificiais que anulem o comportamento testado.
- Os testes cobrem:
  1. Separação de catálogos e classificação de antimicrobianos, C1 e notificações.
  2. Idempotência de migração de dados legados sem perda de texto.
  3. Segregação estrita de prescrições simples, antimicrobianas e C1.
  4. Limite de 3 substâncias por receita C1 e ausência de teto em antimicrobianos.
  5. Cálculo de quantidade com arredondamento para cima e texto em pt-BR.
  6. Rejeição de posologias indeterminadas ou inválidas.
  7. Validação de campos obrigatórios do receituário.
  8. Ordem de vias e isolamento de medicamentos por documento.
  9. Paginação de documentos longos sem sobreposição de rodapé.
  10. Divisão em múltiplos receituários C1 para >3 substâncias controladas.
  11. Rejeição na fronteira do PDF para receitas vazias.
  12. Validação de formato para persistência em localStorage.
  13. Sobrevivência e integridade contra corrupção de storage.
  14. Escrita de quantidade por extenso e dígitos em C1.
  15. Segregação rigorosa contra contaminação cruzada de receitas.
  16. Cálculo ponderal pediátrico com limites de peso e travas de dose máxima.
  17. Resolução precisa de códigos, descrições e categorias do CID-10.
  18. Smoke test de ambiente de execução Node.js.

### 1.5 Análise do Script de Simulação Seriada (`.agents/worker_m6/simulate_journey.ts`)
- O arquivo possui 546 linhas de código TypeScript estruturado.
- Importa módulos reais diretamente de `../../src/utils/prescriptionRules`, `../../src/utils/prescriptionPdf`, `../../src/utils/doseCalculator`, `../../src/data/pediatricMeds`, `../../src/data/cidCatalog`, `../../src/data/examCatalog` e `../../src/utils/quantityWords`.
- Executa 19 asserções determinísticas sobre os 6 componentes centrais (PrescriptionBuilder, PediatricCalculator, CidSearchBar, ExamRequester, CertificateAndReferral, PrintPreview), testando limites clínicos, ordenação de vias, busca fonética de CID, conversão de números por extenso e geração física de instâncias de `jsPDF`.

---

## 2. Logic Chain (Cadeia Lógica de Dedução e Análise Forense)

1. **Investigação da Hipótese de Fraude na Asserção de Vias**:
   - *Premissa Forense*: Testes unitários cujas asserções são alteradas para "fazer passar" podem configurar relaxamento indevido ou mascaramento de falhas.
   - *Evidência Apurada*: A função `layoutPrescriptionPages` em `src/utils/prescriptionPdf.ts` já implementava a lógica correta (cópia 1 = Farmácia, cópia 2 = Paciente) alinhada com o Art. 6º da RDC ANVISA nº 20/2011 e a Portaria 344/98. A asserção antiga no teste unitário estava equivocadamente invertida em relação à lei e ao próprio gerador de PDF.
   - *Dedução*: A modificação não foi um afrouxamento fraudulento, mas sim uma correção genuína de um falso positivo histórico, sincronizando a asserção de teste e a etiqueta visual do componente com o padrão sanitário brasileiro obrigatório.

2. **Investigação da Hipótese de Fachadas (Facade Implementations)**:
   - *Premissa Forense*: Funções que retornam literais constantes sem computação real configuram violação grave de integridade.
   - *Evidência Apurada*: `prescriptionRules.ts`, `doseCalculator.ts`, `cidCatalog.ts` e `quantityWords.ts` foram inspecionados linha a linha. Todas as funções contêm parsing por regex, algoritmos de clustering/partição, busca por palavras-chave, clamping matemático de doses e geração tipográfica.
   - *Dedução*: Inexistência total de código de fachada ou atalhos artificiais.

3. **Investigação da Hipótese de Fabricação de Artefatos**:
   - *Premissa Forense*: Existência de arquivos de log pré-populados que fingem execuções anteriores.
   - *Evidência Apurada*: A varredura no workspace não revelou logs pré-gravados, saídas fakes ou atestações artificiais. O script de simulação `simulate_journey.ts` é autoexecutável e verifica computações em tempo real.
   - *Dedução*: Zero fabricação de artefatos.

4. **Investigação do Build e Código de Produção**:
   - *Premissa Forense*: Artefatos em `dist/` podem estar defasados em relação ao código-fonte ou omitir correções.
   - *Evidência Apurada*: A busca estruturada no bundle `dist/assets/index-mDcrjtQk.js` localizou a string exata atualizada e comprovou a ausência completa de qualquer versão legada.
   - *Dedução*: O build reflete fielmente o código-fonte atualizado.

---

## 3. Caveats (Ressalvas)

1. **Modo de Integridade**: Aplicado o modo `development` estipulado no documento canônico `ORIGINAL_REQUEST.md`, cujo foco reside na detecção de saídas fabricadas, bypasses e fachadas artificiais.
2. **Runner de Teste**: O repositório utiliza canonicamente o runner nativo do Node.js (`node --import tsx --test`) configurado em `package.json`, em conformidade com as diretrizes de AGENTS.md (sem frameworks externos pesados).
3. **Ambiente Real de Navegador**: A validação visual e interativa com emulação de toque móvel e auditoria do DOM em tempo real via Chrome DevTools é escopo designado para o Marco M7.

---

## 4. Conclusion (Conclusão e Veredito)

A auditoria forense independente conclui que:
1. A sincronização de vias de antimicrobianos em `src/utils/prescriptionRules.test.ts:72-76` e `src/components/PrescriptionBuilder.tsx:2065-2070` é legítima, autêntica e alinhada com as normas sanitárias vigentes (RDC ANVISA nº 20/2011).
2. A suíte de 18 testes unitários e o script de simulação seriada de 19 cenários executam lógica genuína sem falsificações, retornos forçados, bypasses ou mocks espúrios.
3. Não foi encontrada nenhuma violação de integridade no código nem nos artefatos de build.

Portanto, o veredito final é:

**`VEREDICTO: CLEAN`**

---

## 5. Verification Method (Método de Verificação Independente)

Qualquer auditor ou revisor pode reproduzir e validar independentemente:

1. **Executar a Suíte Canônica de Testes**:
   ```bash
   npm test
   ```
   *Resultado esperado*: 18 testes executados, 18 testes com sucesso, 0 falhas, exit code 0.

2. **Verificar a Compilação Estática de Tipos**:
   ```bash
   npm run lint
   ```
   *Resultado esperado*: `tsc --noEmit` conclui com 0 erros, exit code 0.

3. **Verificar a Compilação de Produção Vite**:
   ```bash
   npm run build
   ```
   *Resultado esperado*: Vite gera com sucesso os bundles em `dist/`, exit code 0.

4. **Executar a Bateria de Simulação dos 6 Componentes**:
   ```bash
   npx tsx .agents/worker_m6/simulate_journey.ts
   ```
   *Resultado esperado*: 19/19 simulações concluídas com sucesso, exit code 0.

5. **Inspeção de Código e Bundles**:
   - `src/utils/prescriptionRules.test.ts:74-75`: verificar asserção de 1ª via (Farmácia) e 2ª via (Paciente).
   - `src/components/PrescriptionBuilder.tsx:2068`: verificar tag visual de antimicrobianos.
   - `dist/assets/index-mDcrjtQk.js`: verificar presença de `"1ª Via: Farmácia (retenção) • 2ª Via: Paciente"`.
