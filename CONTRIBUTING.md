# Guia de Contribuição — PresCMed (PCM)

Agradecemos seu interesse em aprimorar o **PresCMed**! Sendo uma ferramenta de uso médico em atendimento clínico real (**YMYL — Your Money or Your Life**), todo código deve atender a critérios rigorosos de segurança e qualidade.

---

## 1. Princípios Inegociáveis

1. **Segurança Sanitária e do Paciente (Zero-Trust):** Qualquer alteração em doses, medicamentos ou regras de retenção de receitas exige validação em testes unitários.
2. **Privacidade e LGPD (Zero-Knowledge):** Nenhum dado de paciente, texto livre de prescrição ou identificador deve ser enviado para APIs externas sem consentimento explícito.
3. **Ergonomia e Usabilidade Rápida:** Interfaces médicas devem ser limpas, contrastadas (WCAG 2.2) e operáveis em telas de consultório, tablets ou celulares com poucos toques.

---

## 2. Fluxo de Trabalho (Git & PR)

1. Faça checkout da branch `main` e garanta que seu repositório local está sincronizado:
   ```bash
   git fetch origin
   git status
   ```
2. Crie uma branch específica:
   - `feat/novo-protocolo-clinico`
   - `fix/calculo-dosagem-x`
   - `refactor/otimizacao-pdf`
3. Realize commits semânticos com mensagens descritivas (`feat:`, `fix:`, `docs:`, `test:`).
4. Abra um Pull Request utilizando o template padrão em `.github/PULL_REQUEST_TEMPLATE.md`.

---

## 3. Validação Local Obrigatória

Antes de enviar qualquer PR ou commit, execute a validação completa local:

```bash
# 1. Checagem de tipagem estática (TypeScript)
npm run lint

# 2. Suíte de testes farmacológicos e clínicos
npm test

# 3. Compilação do bundle estático (Vite)
npm run build
```

---

## 4. Estrutura de Pastas e Convenções

- `src/components/`: Componentes React modulares da interface clínica.
- `src/data/`: Bancos de dados estáticos de fármacos, exames e protocolos (em pt-BR).
- `src/utils/`: Algoritmos puros de cálculo de dose, segregação de receitas e geração de PDF.
- `src/utils/*.test.ts`: Testes unitários com o test runner nativo do Node.js (`node:test`).
