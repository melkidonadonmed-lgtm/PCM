import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Printer, 
  Upload, 
  Type, 
  Undo, 
  Redo, 
  Trash2, 
  FileText,
  Sparkles,
  ShieldCheck,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { DoctorProfile, Patient, WorkContext } from '../types';

interface DocumentEditorViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  activeContext: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
  onNavigateToPrint?: () => void;
}

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  darkMode,
  doctor,
  patient,
  activeContext,
  onSaveContext,
}) => {
  const [typography, setTypography] = useState<'serif' | 'sans' | 'inter'>('serif');
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialContent = `
    <p><strong>PRESCRIÇÃO AMBULATORIAL / DOCUMENTO LIVRE</strong></p>
    <p><br></p>
    <p><strong>1. Amoxicilina 500mg</strong> ------------------------------------------------ 1 caixa</p>
    <p style="margin-left: 20px;">Tomar 1 cápsula por via oral a cada 8 horas durante 7 dias.</p>
    <p><br></p>
    <p><strong>2. Dipirona 500mg/mL (Gotas)</strong> ---------------------------------- 1 frasco</p>
    <p style="margin-left: 20px;">Tomar 30 a 40 gotas por via oral até de 6 em 6 horas se febre ou dor.</p>
    <p><br></p>
    <p><strong>Recomendações Clínicas:</strong> Repouso, hidratação oral vigorosa (mínimo 2 litros de água/dia) e retorno imediato ao serviço se sinais de alarme ou piora respiratória.</p>
  `;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Digite ou cole o texto do laudo, receita médica ou parecer clínico livre aqui...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'outline-none focus:outline-none min-h-[460px] leading-relaxed text-sm sm:text-base selection:bg-sky-200 dark:selection:bg-sky-800'
      }
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContext || !onSaveContext) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG).');
      return;
    }

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await onSaveContext({
          ...activeContext,
          logoDataUrl: dataUrl
        });
      } catch (err) {
        console.error('Erro ao salvar logotipo no IndexedDB:', err);
      } finally {
        setLogoUploading(false);
      }
    };
    reader.onerror = () => {
      setLogoUploading(false);
      alert('Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (!activeContext || !onSaveContext) return;
    if (confirm('Deseja remover o logotipo deste local de atuação?')) {
      await onSaveContext({
        ...activeContext,
        logoDataUrl: undefined
      });
    }
  };

  const applyTemplate = (type: 'laudo' | 'receita' | 'parecer') => {
    if (!editor) return;
    if (type === 'laudo') {
      editor.commands.setContent(`
        <p style="text-align: center;"><strong>LAUDO MÉDICO DE AVALIAÇÃO CLÍNICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patient?.name || '__________________________'}</strong>, portador(a) do documento nº ${patient?.documentNumber || '________________'}, foi submetido(a) a exame clínico nesta data, encontrando-se sob acompanhamento ambulatorial para investigação e manejo terapêutico.</p>
        <p><br></p>
        <p><strong>Hipótese Diagnóstica / Quadro Clínico:</strong> Paciente lúcido(a), orientado(a), estável hemodinamicamente, sem queixas agudas de urgência no momento da avaliação.</p>
        <p><br></p>
        <p><strong>Conduta:</strong> Mantido plano terapêutico previamente instituído. Retorno programado com resultados de exames complementares.</p>
      `);
    } else if (type === 'parecer') {
      editor.commands.setContent(`
        <p style="text-align: center;"><strong>PARECER MÉDICO ESPECIALIZADO / CONTRA-REFERÊNCIA</strong></p>
        <p><br></p>
        <p>Ao Médico(a) Assistente da Unidade de Origem,</p>
        <p>Encaminhamos avaliação especializada referente ao(à) paciente <strong>${patient?.name || '__________________________'}</strong>.</p>
        <p><br></p>
        <p><strong>Sumário da Avaliação:</strong> Exame físico sem alterações significativas para a queixa principal. Exames de imagem/laboratoriais revisados e compatíveis com a faixa etária.</p>
        <p><br></p>
        <p><strong>Recomendações e Ajustes Farmacológicos:</strong> Seguir acompanhamento na Atenção Primária com as orientações anexas.</p>
      `);
    } else {
      editor.commands.setContent(initialContent);
    }
  };

  const docClinic = activeContext?.clinicName || doctor?.clinicName?.trim() || 'Rede de Atenção à Saúde';
  const docAddress = activeContext?.clinicAddress || doctor?.address?.trim() || 'Unidade Básica de Saúde';
  const docCrm = activeContext?.doctorCredentials?.crm || doctor?.crm || '------';
  const docCrmState = activeContext?.doctorCredentials?.uf || doctor?.crmState || 'SP';
  const docSpecialty = activeContext?.doctorCredentials?.specialty || doctor?.specialty || 'Clínica Médica';

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-16">
      {/* Barra de Ferramentas Superior Fixa / Elevada */}
      <div 
        className="sticky top-[72px] sm:top-[76px] z-30 rounded-2xl p-2.5 sm:p-3 border backdrop-blur-md shadow-tactile-sm flex flex-wrap items-center justify-between gap-2.5 bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)] no-print"
      >
        {/* Agrupamento: Estilos Básicos */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive('bold') 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive('italic') 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Itálico (Ctrl+I)"
            aria-label="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-1" />

          {/* Alinhamento */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive({ textAlign: 'left' }) 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive({ textAlign: 'center' }) 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive({ textAlign: 'right' }) 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive({ textAlign: 'justify' }) 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Justificar"
            aria-label="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-1" />

          {/* Listas */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive('bulletList') 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Lista com Marcadores"
            aria-label="Marcadores"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              editor?.isActive('orderedList') 
                ? 'bg-sky-700 text-white shadow-tactile-sm' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Lista Numerada"
            aria-label="Numeração"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-1" />

          {/* Desfazer / Refazer */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer"
            title="Desfazer (Ctrl+Z)"
            aria-label="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer"
            title="Refazer (Ctrl+Y)"
            aria-label="Refazer"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Agrupamento: Tipografia, Templates e Ações */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor Tipográfico */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2 py-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={typography}
              onChange={(e) => setTypography(e.target.value as any)}
              className="bg-transparent font-medium cursor-pointer focus:outline-none"
              aria-label="Família Tipográfica da Folha A4"
            >
              <option value="serif">Cormorant Garamond (Clássica)</option>
              <option value="sans">Plus Jakarta Sans (Hospitalar)</option>
              <option value="inter">Inter (Técnica)</option>
            </select>
          </div>

          {/* Modelos Rápidos */}
          <div className="relative group">
            <button
              type="button"
              className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
              title="Carregar modelos rápidos"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Modelos</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-tactile-lg p-1 hidden group-hover:block z-40">
              <button
                type="button"
                onClick={() => applyTemplate('laudo')}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--surface-hover)] font-medium"
              >
                Laudo de Avaliação
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('parecer')}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--surface-hover)] font-medium"
              >
                Parecer / Encaminhamento
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('receita')}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--surface-hover)] font-medium"
              >
                Receita Livre Padrão
              </button>
            </div>
          </div>

          {/* Upload de Logotipo Institucional */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={logoUploading}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
            title="Fazer upload de brasão ou logotipo institucional"
          >
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            <span>{logoUploading ? 'Carregando...' : 'Logotipo'}</span>
          </button>

          {activeContext?.logoDataUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="h-9 w-9 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center cursor-pointer shadow-tactile-sm"
              title="Remover logotipo do contexto atual"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Botão de Impressão Direta A4 */}
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-white text-white dark:text-navy-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-tactile-btn transition-transform active:scale-95"
            title="Imprimir folha A4 milimétrica ou salvar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir A4</span>
          </button>
        </div>
      </div>

      {/* Canvas A4 Tátil Milimétrico (210mm x 297mm) */}
      <div className="flex justify-center w-full overflow-x-auto py-2">
        <div
          id="printable-a4-sheet"
          className={`a4-editor-canvas bg-white text-slate-900 rounded-lg shadow-2xl relative transition-all duration-200 ${
            typography === 'serif' ? 'font-serif-doc' : typography === 'inter' ? 'font-sans' : 'font-sans'
          }`}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)'
          }}
        >
          {/* Cabeçalho Hospitalar / Timbrado Oficial */}
          <header className="border-b-2 border-slate-900 pb-4 mb-6">
            {activeContext?.logoDataUrl && (
              <div className={`mb-3 flex ${
                activeContext.logoAlignment === 'center' ? 'justify-center' :
                activeContext.logoAlignment === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <img 
                  src={activeContext.logoDataUrl} 
                  alt="Logotipo da Instituição" 
                  className="max-h-16 object-contain"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-sky-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 leading-none">
                      {doctor?.name || 'Dr(a). Médico(a)'}
                    </h1>
                    <p className="text-xs font-bold text-sky-800 font-sans mt-0.5">
                      CRM-{docCrmState} {docCrm} {doctor?.rqe ? `• RQE ${doctor.rqe}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 font-sans">
                  {docSpecialty}
                </p>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-tight">
                  {docClinic}
                  {activeContext?.cnes && activeContext.documentFormatting?.showCnesOnHeader ? ` • CNES: ${activeContext.cnes}` : ''}
                  {docAddress ? ` • ${docAddress}` : ''}
                </p>
              </div>

              {/* Selo do Tipo de Documento */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-sans">
                  DOCUMENTO CLÍNICO LIVRE
                </span>
                <span className="text-[11px] text-slate-500 font-sans mt-1">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Identificação Rápida do Paciente */}
            {patient?.name && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-sans text-slate-700">
                <span><strong>Paciente:</strong> {patient.name}</span>
                {patient.documentNumber && <span><strong>Doc:</strong> {patient.documentNumber}</span>}
                {patient.weightKg > 0 && <span><strong>Peso:</strong> {patient.weightKg} kg</span>}
              </div>
            )}
          </header>

          {/* Área de Digitação Livre (Editor Tiptap) */}
          <div className="flex-1 w-full text-slate-900">
            <EditorContent editor={editor} />
          </div>

          {/* Rodapé Clínico com Carimbo Regulamentar e Linha de Assinatura */}
          <footer className="border-t border-slate-300 pt-6 mt-8 flex flex-col items-center justify-center text-center font-sans">
            <div className="w-64 border-b border-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-900 uppercase">
              {doctor?.name || 'Dr(a). Médico(a)'}
            </p>
            <p className="text-[11px] text-slate-600">
              Médico(a) — CRM-{docCrmState} {docCrm}
            </p>
            <p className="text-[9px] text-slate-400 mt-2">
              Emitido eletronicamente via PresCMed • Documento em conformidade com as resoluções do CFM
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorView;
