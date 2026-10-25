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
      <div className="editor-toolbar no-print sticky top-16 sm:top-18 z-30 rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 border shadow-tactile-sm bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)] flex items-center gap-1 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap lg:flex-wrap lg:overflow-visible">
        {/* Gatilho Retrátil de Configuração da Folha & Timbrado (Evita poluição visual no mobile) */}
        {onToggleSheetConfig && (
          <>
            <button
              id="btn-toggle-sheet-config"
              type="button"
              aria-expanded={isSheetConfigOpen}
              onClick={onToggleSheetConfig}
              className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap transition active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                isSheetConfigOpen
                  ? 'bg-navy-900 text-white dark:bg-sky-600 border-navy-900 dark:border-sky-500/40 shadow-tactile-sm font-bold'
                  : 'bg-sky-500/10 border-sky-500/25 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15'
              }`}
              title="Abrir ou recolher ajustes de página, orientação, 1/2 vias, cabeçalho, logotipos e marca d'água"
            >
              <Icon name="tune" size={14} className="shrink-0" />
              <span>Folha & Timbrado</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md clinical-tabular-nums ${
                  isSheetConfigOpen
                    ? 'bg-white/20 text-white'
                    : 'bg-sky-600/15 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200'
                }`}
              >
                {viaLayout === '2-vias' ? '2 Vias' : '1 Via'}
              </span>
              <Icon
                name="expand_more"
                size={14}
                className={`transition-transform duration-150 ${isSheetConfigOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5 shrink-0" />
          </>
        )}

        {/* Desfazer / Refazer logo no início (padrão Google Docs Mobile & Desktop) */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition shrink-0"
          title="Desfazer (Ctrl+Z)"
          aria-label="Desfazer"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition shrink-0"
          title="Refazer (Ctrl+Y)"
          aria-label="Refazer"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5 shrink-0" />

        {/* Estilo do Parágrafo / Título */}
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
          className="bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
          title="Estilo de texto (Parágrafo ou Título)"
          aria-label="Estilo de texto"
        >
          <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="p">Normal</option>
          <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h1">Título 1</option>
          <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h2">Título 2</option>
          <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h3">Título 3</option>
        </select>

        {/* Ajuste Fino do Tamanho da Fonte (Docs Style: [-] 11 pt [+]) */}
        <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] px-1 py-0.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setBaseFontSize(prev => Math.max(8, prev - 1))}
            className="w-6 h-6 rounded hover:bg-[var(--surface-hover)] flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none text-[var(--text-main)]"
            title="Diminuir tamanho da fonte da folha (A-)"
            aria-label="Diminuir fonte"
          >
            −
          </button>
          <select
            value={baseFontSize}
            onChange={(e) => setBaseFontSize(Number(e.target.value))}
            className="bg-transparent text-[var(--text-main)] px-1 py-0.5 font-bold text-center text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer clinical-tabular-nums"
            title="Tamanho da fonte em pontos (pt)"
            aria-label="Tamanho da fonte em pontos (pt)"
          >
            {[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28].map(sz => (
              <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={sz} value={sz}>{sz} pt</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBaseFontSize(prev => Math.min(32, prev + 1))}
            className="w-6 h-6 rounded hover:bg-[var(--surface-hover)] flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none text-[var(--text-main)]"
            title="Aumentar tamanho da fonte da folha (A+)"
            aria-label="Aumentar fonte"
          >
            +
          </button>
        </div>

        <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5 shrink-0" />

        {/* Formatação básica: Negrito, Itálico, Sublinhado */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive('bold')
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
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
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive('italic')
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
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
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive('underline')
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Sublinhado (Ctrl+U)"
          aria-label="Sublinhado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5 shrink-0" />

        {/* Alinhamento de Texto */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive({ textAlign: 'left' })
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Alinhar à Esquerda"
          aria-label="Alinhar à Esquerda"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive({ textAlign: 'center' })
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Centralizar"
          aria-label="Centralizar"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive({ textAlign: 'right' })
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Alinhar à Direita"
          aria-label="Alinhar à Direita"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive({ textAlign: 'justify' })
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Justificar"
          aria-label="Justificar"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5 shrink-0" />

        {/* Listas */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive('bulletList')
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Lista com Marcadores"
          aria-label="Lista com Marcadores"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            editor?.isActive('orderedList')
              ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm font-bold'
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Lista Numerada"
          aria-label="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* SELETOR RÁPIDO ENTRE RECEITAS QUANDO HOUVER ITENS SIMPLES E ESPECIAIS NA MESMA CONSULTA */}
      {regimesNaConsulta.length > 1 && (
        <div className="no-print p-3 rounded-2xl bg-amber-500/10 border border-warning flex flex-col sm:flex-row items-center justify-between gap-3 shadow-tactile-sm">
          <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Receitas separadas:</span>
              <span className="ml-1 text-xs opacity-90">
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
                className={`flex-1 sm:flex-initial h-8 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shadow-tactile-sm ${
                  activeLoadedRecipeType === regime
                    ? 'bg-sky-600 text-white border border-info'
                    : 'bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-200 border border-info dark:border-info hover:bg-sky-50'
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
