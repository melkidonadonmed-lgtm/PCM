# PresCMed — CURRENT STATE (.context)

## Fase Atual: v2.0.0 (Auditoria e Emissão Clínica Completa)

Sistema 100% validado para o fluxo ambulatorial e de emergência:
- **Receita de Controle Especial (Portaria SVS/MS 344/98):** Emissão em folha única A4 Paisagem (297×210 mm) com 2 vias lado a lado (1ª Via Farmácia com campos de comprador/fornecedor, 2ª Via Paciente com advertências e linha de corte central).
- **Sincronização de Paciente:** Card de preenchimento rápido integrado na coluna de prescrição com propagação imediata para exames, atestados, encaminhamentos e editor livre.
- **Higiene de Atendimento:** Troca ou limpeza de paciente executa o reset integral de todos os documentos ativos do atendimento, impedindo contaminação cruzada.
- **Mobile UX:** `MobileBottomNav` 100% canônico com Google Material Symbols, targets de toque de 48px e safe-areas calibradas.

---

## Decisões Tomadas
1. **Layout Paisagem Nativo:** Receita Especial renderiza diretamente em `landscape` na prévia e no PDF sem gerar páginas desnecessárias em retrato.
2. **Separação Rígida de Vias:** A 1ª Via traz campos legais obrigatórios da Portaria 344/98; a 2ª Via omite tais campos de compra e foca na orientação de uso e advertências.
3. **Reset de Consulta Atômico:** A limpeza do paciente dispara a limpeza de rascunhos de todos os 5 tipos de documentos.

---

## Débitos Técnicos e Blockers
- **Nenhum blocker ativo.** Todos os 51 testes unitários passam com 100% de sucesso.
- **Build de produção:** Gerado com sucesso (`dist/` pronto para deploy).

---

## Próximo Ponto de Entrada
- Deploy contínuo da versão atualizada para o Google Cloud Run ou testes e2e com médicos em ambiente de homologação.
