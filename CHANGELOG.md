# Changelog — PresCMed (PCM)

Todas as alterações notáveis neste projeto são registradas neste arquivo.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e este projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2026-09-12

### Adicionado
- **Motor de Segregação Sanitária YMYL:** Classificação automática em Receita Simples, Antimicrobianos (RDC 20/2011) e Controle Especial C1 (Portaria 344/98).
- **Assistente de Quantidade e Embalagens:** Cálculo automático de caixas e frascos com conversão em texto por extenso para retenção em farmácia.
- **Calculadora Clínica e Pediátrica:** Doses por mg/kg com validação de tetos de segurança e conversão imediata para gotas/mL.
- **Módulo de Exames e Atestados:** Solicitações de exames laboratoriais/imagem e atestados/encaminhamentos médicos em conformidade com o CFM.
- **Suíte de Testes Automatizados:** 15 testes unitários validando regras sanitárias, paginação de PDF e integridade de dados.
- **Design System Hospitalar Tátil:** Paleta clínica sóbria, contraste calibrado WCAG 2.2 e navegação ergonômica sem loops.

### Modificado
- Refatoração do layout para suporte fluido mobile e tablet com safe-area insets.
- Otimização do gerador de PDF vetorial, prevenindo corte de carimbos e rodapés em documentos multipáginas.

### Segurança
- Arquitetura 100% Client-Side / Zero-Knowledge sem transmissão de prontuários ou identificadores de pacientes pela rede.

---

## [1.0.0] - 2026-08-01

### Adicionado
- Lançamento da primeira versão do PresCMed com receituário básico ambulatorial e catálogo de medicamentos.
