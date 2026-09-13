## Descrição das Alterações
Descreva de forma clara e objetiva o objetivo desta alteração e o impacto clínico/técnico no PresCMed.

## Tipo de Alteração
- [ ] 🩺 Ajuste Clínico / Farmacológico / Regulatório (Anvisa / CFM)
- [ ] 🐛 Correção de Bug (*bugfix*)
- [ ] ✨ Nova Funcionalidade / Módulo Clínico (*feature*)
- [ ] ♿ Acessibilidade (WCAG 2.2 / Design Tátil Hospitalar)
- [ ] ⚡ Performance & Otimização de Bundle
- [ ] 📝 Documentação Técnica

## Checklist de Qualidade Médica e Técnica (Baseline PCM)
- [ ] **Segregação Sanitária:** Preservada a separação estrita entre Receita Simples, Antimicrobianos (RDC 20/2011) e C1 (Portaria 344/98).
- [ ] **Zero-Knowledge:** Nenhuma informação clínica ou de paciente é transmitida para servidores externos.
- [ ] **Lint / Type-Check:** `npm run lint` executou com sucesso (0 erros de tipagem TypeScript).
- [ ] **Testes Automatizados:** `npm test` executou com 100% de aprovação (todos os testes passando).
- [ ] **Build:** `npm run build` gerou o bundle estático sem falhas impeditivas.
- [ ] **Segurança:** Nenhum segredo, chave de API ou `.env` foi incluído no commit.
- [ ] **Changelog:** `CHANGELOG.md` atualizado com as alterações realizadas.

## Demonstração Visual (se aplicável)
*Adicione capturas de tela ou logs demonstrando o layout hospitalar e responsividade.*
