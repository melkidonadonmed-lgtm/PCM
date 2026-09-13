## 2026-09-12T21:00:11Z

Você é o Worker responsável pela implementação do Milestone 1 (M1) do projeto PresCMed (PCM):
"Navegabilidade Mobile Unificada, Safe Area e Chrome do Sistema".

Sua pasta exclusiva de trabalho para metadados/relatórios é: c:\Users\melki\projetos\pcm\.agents\worker_m1

Arquivos obrigatórios para leitura inicial:
1. c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md (Leia na íntegra!)
2. c:\Users\melki\projetos\pcm\AGENTS.md (Diretrizes arquiteturais, normas sanitárias CFM/ANVISA, design system)
3. c:\Users\melki\projetos\pcm\PROJECT.md (Arquitetura e escopo do projeto)
4. c:\Users\melki\projetos\pcm\.agents\explorer_survey_1\handoff.md (Relatório técnico minucioso com todas as evidências e propostas de código)
5. c:\Users\melki\projetos\pcm\.agents\explorer_survey_3\handoff.md (Evidências de design system e safe area)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Seu escopo exclusivo de modificação para o Milestone 1:
1. `index.html`:
   - Atualizar a meta viewport para incluir `viewport-fit=cover`:
     `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`
2. `src/index.css`:
   - Declarar os utilitários de safe area para o Tailwind v4:
     `@utility pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }`
     `@utility h-mobile-nav { height: calc(4rem + env(safe-area-inset-bottom, 0px)); }`
3. `src/components/MobileBottomNav.tsx`:
   - Estruturar a barra inferior mobile com 5 acessos clínicos diretos inequívocos:
     1. Prescrever (`prescription` - ícone `Pill`, badge de itens da prescrição)
     2. Calculadora (`pediatric_calc` - ícone `Calculator`, badge de peso se houver)
     3. Exames (`exams` - ícone `FlaskConical`, badge de exames)
     4. Documentos / Atestados (`certificate` - ícone `FileText`)
     5. Emitir PDF (`print_preview` - ícone `Download`)
   - Eliminar o botão redundante "Mais" (que abre a Sidebar que já é aberta pelo Header).
   - Tratar perfeitamente o estado ativo para todas as abas:
     - `isActive`: se `activeTab === item.id` ou (`item.id === 'certificate' && activeTab === 'referral'`).
   - Aplicar altura dinâmica com safe area e padding:
     `h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]`
   - Ajustar z-index da barra inferior para `z-40` (permitindo que a Sidebar mobile aberta fique sobreposta em `z-50`).
4. `src/components/Header.tsx`:
   - Erradicar o "blob" saturado do badge de paciente (linha 121), substituindo por tipografia limpa em tom neutro suave acompanhada de micro-ponto (dot de 6px: `w-1.5 h-1.5 rounded-full`), conforme AGENTS.md.
   - Limpar ou manter consistentes as props de contagem.
   - Garantir que o botão "Menu" no mobile (`w-10 h-10` / `min-w-[44px] min-h-[44px]`) abra a Sidebar com clareza.
5. `src/components/Sidebar.tsx`:
   - Elevar o z-index do backdrop e do container `<aside>` para `z-50`, de modo que o drawer móvel encubra a barra inferior sem conflito ou sobreposição.
   - Ajustar qualquer padding compensatório desnecessário.
6. `src/App.tsx`:
   - Ajustar o padding inferior do container `<main>` para acomodar a barra com safe area:
     `className="flex-1 min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6 outline-none"` (ou valor proporcional seguro para não esconder conteúdo).
7. `src/components/PrescriptionBuilder.tsx`:
   - Ajustar o toast de sucesso `itemAddedToast` para `bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6` para não ficar escondido sob a barra inferior mobile.

Validação obrigatória:
- Executar `npm run lint` (`tsc --noEmit`) e garantir 0 erros de TypeScript.
- Executar `npm run build` e garantir compilação com sucesso no Vite.
- Documentar detalhadamente todas as mudanças e saídas dos comandos em `c:\Users\melki\projetos\pcm\.agents\worker_m1\handoff.md`.
- Atualizar `progress.md` e enviar mensagem com `send_message` ao concluir.
