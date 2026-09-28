# PresCMed

SPA React/TypeScript para prescrições, documentos médicos, cálculos
pediátricos e geração de PDF em pt-BR.

## Ambiente local

- Local recomendado neste Windows: `C:\Users\melki\Projetos\PCM`
- Pré-requisitos: Node.js LTS, npm e Git
- Gerenciador adotado: npm (`package-lock.json`)

```powershell
npm ci
npm run dev
```

O servidor de desenvolvimento usa `http://localhost:3000`.

## Validação

```powershell
npm run lint
npm run build
```

Não há suíte automatizada de testes. Alterações de UI e PDF devem ser
verificadas no navegador, em tema claro/escuro e nos fluxos de impressão.

## Dados e segurança clínica

O aplicativo é client-side e persiste dados no `localStorage`. Não use dados
reais de pacientes durante o desenvolvimento e não adicione telemetria ou
transmissão desses dados sem requisito explícito.

As variáveis de `.env.example` são remanescentes do template e não são usadas
pelo código atual. Nunca faça commit de arquivos `.env`.
