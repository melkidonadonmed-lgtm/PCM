import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  ShieldCheck,
  Icon,
} from '../Icon';
import { DocumentViaLayout, PrescriptionItem } from '../../types';
import type { RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { AvisoNotificacaoReceita } from '../AvisoNotificacaoReceita';
import { RECEITA_NO_EDITOR } from './editorConfigAndFormatters';

export interface EditorTextFormattingToolbarProps {
  editor: Editor | null;
  baseFontSize: number;
  setBaseFontSize: React.Dispatch<React.SetStateAction<number>>;
  regimesNaConsulta: RegimeReceita[];
  activeLoadedRecipeType: RegimeReceita | null;
  itensPorRegime: Record<RegimeReceita, PrescriptionItem[]>;
  handleLoadActivePrescription: (showToastMsg?: boolean, targetMode?: 'auto' | RegimeReceita) => void;
  viaLayout?: DocumentViaLayout;
  isSheetConfigOpen?: boolean;
  onToggleSheetConfig?: () => void;
}

export const EditorTextFormattingToolbar: React.FC<EditorTextFormattingToolbarProps> = ({
  editor,
  baseFontSize,
  setBaseFontSize,
  regimesNaConsulta,
  activeLoadedRecipeType,
  itensPorRegime,
  handleLoadActivePrescription,
  viaLayout = '1-via',
  isSheetConfigOpen = false,
  onToggleSheetConfig,
}) => {
  return (
    <>
      {/* BARRA UNIFICADA ESTILO GOOGLE DOCS: linha única rolável no celular, fixa acima da folha A4 */}
      <div className="editor-toolbar no-print sticky top-16 sm:top-18 z-30 rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 border shadow-[var(--elevation-low)] bg-[var(--surface-card)] border-[var(--hairline)] text-[var(--ink-primary)] flex items-center gap-1 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap lg:flex-wrap lg:overflow-visible">
        {/* Gatilho Retrátil de Configuração da Folha & Timbrado (Evita poluição visual no mobile) */}
        {onToggleSheetConfig && (
          <>
            <button
              id="btn-toggle-sheet-config"
              type="button"
              aria-expanded={isSheetConfigOpen}
              onClick={onToggleSheetConfig}
              className={`touch-target min-h-[44px] px-2.5 text-xs flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                isSheetConfigOpen
                  ? 'btn-tactile-primary'
                  : 'btn-tactile-secondary'
              }`}
              title="Abrir ou recolher ajustes de página, orientação, 1/2 vias, cabeçalho, logotipos e marca d'água"
            >
              <Icon name="tune" size={15} className={`shrink-0 ${isSheetConfigOpen ? 'text-white' : 'text-[var(--ink-muted)]'}`} />
              <span>Folha & Timbrado</span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-[6px] clinical-tabular-nums ${
                  isSheetConfigOpen
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--surface-chip-muted)] text-[var(--ink-secondary)] border border-[var(--hairline)]'
                }`}
              >
                {viaLayout === '2-vias' ? '2 Vias' : '1 Via'}
              </span>
              <Icon
                name="expand_more"
                size={15}
                className={`transition-transform duration-150 ${isSheetConfigOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className="h-5 w-px bg-[var(--hairline)] mx-0.5 shrink-0" />
          </>
        )}

        {/* Desfazer / Refazer logo no início (padrão Google Docs Mobile & Desktop) */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition shrink-0"
          title="Desfazer (Ctrl+Z)"
          aria-label="Desfazer"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition shrink-0"
          title="Refazer (Ctrl+Y)"
          aria-label="Refazer"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[var(--hairline)] mx-0.5 shrink-0" />

        {/* Estilo do Parágrafo / Título */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={
              editor?.isActive('heading', { level: 1 }) ? 'h1' :
              editor?.isActive('heading', { level: 2 }) ? 'h2' :
              editor?.isActive('heading', { level: 3 }) ? 'h3' : 'p'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') editor?.chain().focus().setParagraph().run();
              else if (val === 'h1') editor?.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2') editor?.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3') editor?.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className="tactile-input pcm-select appearance-none h-11 min-h-[44px] pl-3 pr-7 rounded-[10px] border border-[var(--border-control)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] leading-none"
            title="Estilo de texto (Parágrafo ou Título)"
            id="editor-block-style-select"
            name="editorBlockStyle"
            aria-label="Estilo de texto"
          >
            <option className="bg-[var(--surface-card)] text-[var(--ink-primary)]" value="p">Normal</option>
            <option className="bg-[var(--surface-card)] text-[var(--ink-primary)]" value="h1">Título 1</option>
            <option className="bg-[var(--surface-card)] text-[var(--ink-primary)]" value="h2">Título 2</option>
            <option className="bg-[var(--surface-card)] text-[var(--ink-primary)]" value="h3">Título 3</option>
          </select>
          <Icon name="expand_more" size={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
        </div>

        {/* Ajuste Fino do Tamanho da Fonte (Docs Style: [-] 11 pt [+]) */}
        <div className="flex items-center h-11 rounded-[10px] bg-[var(--surface-card-lit)] border border-[var(--border-control)] px-0.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setBaseFontSize(prev => Math.max(8, prev - 1))}
            className="touch-target h-10 min-h-[44px] min-w-[44px] rounded-[8px] hover:bg-[var(--surface-hover)] flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none text-[var(--ink-primary)]"
            title="Diminuir tamanho da fonte da folha (A-)"
            aria-label="Diminuir fonte"
          >
            −
          </button>
          <select
            value={baseFontSize}
            onChange={(e) => setBaseFontSize(Number(e.target.value))}
            className="pcm-select appearance-none bg-transparent text-[var(--ink-primary)] px-2 h-11 min-h-[44px] leading-none font-bold text-center text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] rounded-[8px] cursor-pointer clinical-tabular-nums"
            title="Tamanho da fonte em pontos (pt)"
            id="editor-font-size-select"
            name="editorFontSize"
            aria-label="Tamanho da fonte em pontos (pt)"
          >
            {[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28].map(sz => (
              <option className="bg-[var(--surface-card)] text-[var(--ink-primary)]" key={sz} value={sz}>{sz} pt</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBaseFontSize(prev => Math.min(32, prev + 1))}
            className="touch-target min-h-[44px] min-w-[44px] rounded hover:bg-[var(--surface-hover)] flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none text-[var(--ink-primary)]"
            title="Aumentar tamanho da fonte da folha (A+)"
            aria-label="Aumentar fonte"
          >
            <Icon name="add" size={14} />
          </button>
        </div>

        <div className="h-5 w-px bg-[var(--hairline)] mx-0.5 shrink-0" />

        {/* Formatação básica: Negrito, Itálico, Sublinhado */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive('bold')
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Negrito (Ctrl+B)"
          aria-label="Negrito"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive('italic')
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Itálico (Ctrl+I)"
          aria-label="Itálico"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleMark('underline').run()}
          disabled={!editor}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive('underline')
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Sublinhado (Ctrl+U)"
          aria-label="Sublinhado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[var(--hairline)] mx-0.5 shrink-0" />

        {/* Alinhamento de Texto */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive({ textAlign: 'left' })
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Alinhar à Esquerda"
          aria-label="Alinhar à Esquerda"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive({ textAlign: 'center' })
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Centralizar"
          aria-label="Centralizar"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive({ textAlign: 'right' })
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Alinhar à Direita"
          aria-label="Alinhar à Direita"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive({ textAlign: 'justify' })
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Justificar"
          aria-label="Justificar"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[var(--hairline)] mx-0.5 shrink-0" />

        {/* Listas */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive('bulletList')
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Lista com Marcadores"
          aria-label="Lista com Marcadores"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`touch-target min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
            editor?.isActive('orderedList')
              ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)] font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
          }`}
          title="Lista Numerada"
          aria-label="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* SELETOR RÁPIDO ENTRE RECEITAS QUANDO HOUVER ITENS SIMPLES E ESPECIAIS NA MESMA CONSULTA */}
      {regimesNaConsulta.length > 1 && (
        <div className="no-print px-3.5 py-2.5 rounded-[12px] bg-[var(--surface-card)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--accent-amber)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[var(--elevation-low)]">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-amber)] shrink-0" />
            <div>
              <span className="font-semibold text-[var(--ink-primary)]">Receitas separadas:</span>
              <span className="ml-1 text-xs">
                esta consulta gera {regimesNaConsulta.length} receitas. Escolha a folha:
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {regimesNaConsulta.map((regime) => (
              <button
                key={regime}
                type="button"
                onClick={() => handleLoadActivePrescription(true, regime)}
                aria-pressed={activeLoadedRecipeType === regime}
                className={`touch-target flex-1 sm:flex-initial min-h-[44px] px-3 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLoadedRecipeType === regime
                    ? 'btn-tactile-primary'
                    : 'btn-tactile-secondary'
                }`}
              >
                <span>{RECEITA_NO_EDITOR[regime].botao} ({itensPorRegime[regime].length})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controlados que exigem Notificação de Receita em talonário específico (aviso de tela, fora da folha) */}
      {activeLoadedRecipeType === 'controle_especial' && (
        <AvisoNotificacaoReceita items={itensPorRegime.controle_especial} />
      )}
    </>
  );
};
