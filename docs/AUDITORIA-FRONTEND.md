# PresCMed — auditoria e implementação

Verificação técnica: 06/09/2026. Alterações anteriores, já preparadas no Git, foram preservadas.

## Evidência e limites

Auditoria estática dos fluxos, estado, catálogos e geração de documentos, com testes executáveis. Não existe backend neste repositório. Não foram adicionados servidor, contas, telemetria ou serviços externos.

A auditoria visual **não está concluída**. O navegador integrado falhou ao importar `browser-service.mjs` de uma versão ausente da instalação. Não há capturas antes/depois nem validação de interação em navegador nesta execução. Foi solicitada autorização para Playwright isolado; não foi usado sem resposta. A imagem antiga presente no repositório não foi usada como evidência atual.

## Achados e correções

| Prioridade | Problema observado no código | Implementação |
| --- | --- | --- |
| Alta | Antibióticos, C1 e notificações A/B agrupados pelo mesmo booleano | Tipos explícitos e classificação pelo ID do catálogo; notificações não são emitidas no formulário comum |
| Alta | Limite de três itens aplicado a todos os medicamentos retidos | Antimicrobianos sem teto artificial; C1 agrupado por até três substâncias distintas, considerando associações |
| Alta | Quantidade usada como apresentação, inclusive ao editar | Campos separados; correção de criação, edição e inclusão por atalhos |
| Alta | Quantidades fixas e horários 8/8h ou 6/6h não associados ao esquema | Retirada dos horários inventados; assistente opcional calcula embalagens a partir de dados explícitos, com revisão manual |
| Alta | Cópia não respeitava a receita selecionada | Revisão, texto e PDF compartilham agrupamento e validação; exportação selecionada ou de todas as receitas |
| Alta | Documentos exibiam assinatura válida, QR ilustrativo e URL aleatória sem serviço de validação | Removidas as alegações e o link fictício; documentos destinados a impressão e assinatura manuscrita |
| Alta | Dados inválidos podiam ser substituídos pelos defaults na montagem | Armazenamento com validação, preservação do original, aviso de falha e backup local acionado pelo usuário |
| Média | Paginação podia sobrepor o rodapé | Modelo de páginas medido, usado no DOM e no PDF; reserva de assinatura e comprador; cabeçalho repetido |
| Média | Seis destinos comprimidos na barra móvel | Cinco destinos: Prescrever, Exames, Documentos, Calculadoras e Mais |
| Média | Editor desmontado perdia medicamento em composição | Editor preservado ao navegar; rascunho limpo ao iniciar novo atendimento |
| Média | Retorno do preview sempre levava à prescrição; subtelas de documentos não acompanhavam navegação | Retorno à origem e abas de atestado/encaminhamento controladas pelo App |
| Média | Novo atendimento mantinha dados clínicos dos documentos anteriores | Limpeza também de atestado, encaminhamento e indicação de exames, com uma confirmação central |
| Média | Hierarquia visual carregada e controles pequenos | Etapas visíveis, controles padronizados, sombras reduzidas, foco visível, movimento reduzido e ajuste de página à largura |

## Comportamentos e compatibilidade

- `PrescriptionItem` aceita versão de esquema, identificador, classificação, substâncias C1 e parâmetros opcionais para quantidade. O campo legado permanece apenas por compatibilidade; não decide a emissão.
- Itens antigos sem identificação confiável e itens de fontes secundárias são preservados como pendentes. O prescritor revisa apresentação, quantidade e classificação no editor.
- O cálculo usa quantidade por administração × administrações/dia × dias e arredonda para embalagens inteiras. Não interpreta a posologia livre nem adivinha embalagem, duração ou fator gotas/mL. Mudanças no esquema invalidam sugestões aplicadas.
- As fórmulas de `doseCalculator.ts` não foram modificadas. A revisão de doses clínicas dos catálogos está fora desta implementação.
- Antimicrobianos: primeira via do paciente, segunda da farmácia. C1: primeira via da farmácia, segunda do paciente. C1 inclui quantidade em algarismos e por extenso, identificação do prescritor e paciente, assinatura e comprador.
- Preparações com adendos específicos, como codeína/tramadol, ficam pendentes; não são tratadas automaticamente como C1. Notificações A/B, integrações SNCR e assinatura digital não foram implementadas.
- O motor trata classificação e número de substâncias por receita. Não substitui a avaliação do prescritor sobre duração máxima, quantidade clínica, exceções individuais e requisitos sanitários locais.
- A SPA continua usando estado central no App e armazenamento no navegador. Ações existentes de compartilhamento em outros documentos continuam dependendo do clique do usuário; não há envio automático.

## Fontes regulatórias consultadas

- [RDC 471/2021](https://www.cff.org.br/userfiles/RDC%20471_21%20ANTIMICROBIANOS.pdf): receitas de antimicrobianos, vias e quantidade de itens.
- [IN 83/2021](https://www.cff.org.br/userfiles/IN_83_2021_antimicrobianos.pdf): substâncias sujeitas ao regime de antimicrobianos. Categoria terapêutica do catálogo não equivale a classificação regulatória.
- [Portaria 344/1998](https://www.gov.br/anvisa/pt-br/assuntos/fiscalizacao-e-monitoramento/propaganda/legislacao/arquivos/8827json-file-1): controle especial, campos e agrupamento.
- [RDC 1.023/2026](https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=abrirTextoAto&cod_menu=8542&cod_modulo=310&link=S&numeroAto=00001023&orgao=RDC/DC/ANVISA/MS&seqAto=000&tipo=RDC&valorAno=2026): listas e adendos consultados, incluindo C1 e carisoprodol.
- [Anvisa: zolpidem](https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2024/medicamento-zolpidem-tera-alteracao-no-tipo-de-receita-para-prescricao-e-venda): Notificação B.
- [Anvisa: ivermectina e nitazoxanida](https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2020/ivermectina-e-nitazoxanida-volta-a-receita-em-uma-via): dispensa de retenção.
- [CRM-MS, orientação de agosto/2026](https://crmms.org.br/noticias/crm-ms-orienta-medicos-sobre-novos-modelos-de-receituarios-de-controle-especial/): admite layout próprio para Receita de Controle Especial com campos legais preservados; diferencia receita física e assinatura digital.

## Verificação

- `npm test`: classificação, migração idempotente, receitas vazias/mistas, associações, C1 em múltiplos documentos, mais de três antimicrobianos, notificações bloqueadas, arredondamento, dados incompletos, gotas, alterações de esquema, texto selecionado, quantidade por extenso, paginação longa, vias, armazenamento inválido e falha de gravação.
- `npm run lint`: verificação TypeScript.
- `npm run build`: geração de produção. Permanece aviso de bundle principal grande; nenhuma dependência de produção foi acrescentada.
- Pendentes: navegação real por teclado, modais e fluxo completo desktop/celular nos dois temas; capturas atuais; inspeção visual dos PDFs renderizados. Testes de conteúdo e limites geométricos não substituem essas verificações.

Roteiro visual pendente: identificar paciente/prescritor → adicionar simples e antimicrobiano → calcular e revisar quantidade → editar duração → exportar documento selecionado e todos → conferir vias → voltar sem perder rascunho → exames → atestado/encaminhamento → calculadora → novo atendimento → recarregar. Repetir em 390 px e 1440 px, claro e escuro, somente com dados fictícios.
