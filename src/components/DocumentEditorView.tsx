import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FolderOpen,
  BookmarkPlus,
  Check,
  Search,
  X,
  Pencil,
  Clock,
  RotateCcw,
  Loader2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { DoctorProfile, Patient, WorkContext, PrescriptionItem } from '../types';
import { db, SavedDocument } from '../services/db';
import LogoGeneratorModal from './LogoGeneratorModal';

interface DocumentEditorViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems?: PrescriptionItem[];
  activeContext: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
  onNavigateToPrint?: () => void;
}

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  darkMode,
  doctor,
  patient,
  prescriptionItems = [],
  activeContext,
  onSaveContext,
}) => {
  const [typography, setTypography] = useState<'serif' | 'sans' | 'inter'>('serif');
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Persistência Local-First & Auto-Save
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isDraftRestoredRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeContextRef = useRef(activeContext);
  activeContextRef.current = activeContext;

  // Estados do Criador de Logos, Drawer de Modelos & Modal de Salvar
  const [isLogoGeneratorOpen, setIsLogoGeneratorOpen] = useState(false);
  const [isModelsDrawerOpen, setIsModelsDrawerOpen] = useState(false);
  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [newModelTitle, setNewModelTitle] = useState('');
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedDocument[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateTitle, setEditingTemplateTitle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Formatador da lista de medicamentos prescritos na consulta ativa
  const formatPrescriptionItemsList = useCallback((items: PrescriptionItem[]): string => {
    if (!items || items.length === 0) {
      return '<p><em>(Nenhum medicamento registrado na aba de prescrição)</em></p>';
    }
    return items.map((item, idx) => `
      <p><strong>${idx + 1}. ${item.name}${item.presentation ? ` (${item.presentation})` : ''}</strong> (${item.route}) -------------------- ${item.quantity}</p>
      <p style="margin-left: 20px;">${item.instructions}</p>
    `).join('<p><br></p>');
  }, []);

  // Formatador do sumário do paciente
  const formatPatientSummary = useCallback((p: Patient): string => {
    const parts: string[] = [];
    if (p.name) parts.push(`<strong>Paciente:</strong> ${p.name}`);
    if (p.ageText || p.birthDate) parts.push(`<strong>Idade:</strong> ${p.ageText || p.birthDate}`);
    if (p.documentNumber) parts.push(`<strong>Doc:</strong> ${p.documentNumber}`);
    if (p.weightKg > 0) parts.push(`<strong>Peso:</strong> ${p.weightKg} kg`);
    return parts.join(' | ') || '<strong>Paciente:</strong> Não identificado';
  }, []);

  // Interpolação de tags dinâmicas: {{paciente_nome}}, {{paciente_idade}}, {{medicamentos_prescritos}}, {{data_atendimento}}
  const interpolateMedicalTags = useCallback((rawHtml: string): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const pName = patient?.name?.trim() || '______________________________';
    const pAge = patient?.ageText || (patient?.birthDate ? patient.birthDate : '____ anos');
    const meds = formatPrescriptionItemsList(prescriptionItems);

    return rawHtml
      .replace(/\{\{paciente_nome\}\}/g, pName)
      .replace(/\{\{paciente_idade\}\}/g, pAge)
      .replace(/\{\{medicamentos_prescritos\}\}/g, meds)
      .replace(/\{\{data_atendimento\}\}/g, today);
  }, [patient, prescriptionItems, formatPrescriptionItemsList]);

  // Ação: Inserir bloco estruturado da consulta ativa na posição do cursor
  const handleImportActiveConsultation = () => {
    if (!editor) return;

    const pSummary = formatPatientSummary(patient);
    const medsList = formatPrescriptionItemsList(prescriptionItems);
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const consultationBlock = `
      <div style="border-left: 3px solid #0284C7; padding-left: 12px; margin: 12px 0;">
        <p><strong>[DADOS DA CONSULTA MÉDICA — ${today}]</strong></p>
        <p>${pSummary}</p>
        <p><br></p>
        <p><strong>CONDUTA FARMACOLÓGICA PRESCRITA:</strong></p>
        ${medsList}
      </div>
      <p><br></p>
    `;

    editor.chain().focus().insertContent(consultationBlock).run();
    triggerAutoSave(editor);
    showToast('Dados da consulta médica inseridos na folha A4.');
  };

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

  // Função para salvar rascunho com debounce de 800ms no IndexedDB
  const triggerAutoSave = useCallback((editorInstance: any) => {
    if (!isDraftRestoredRef.current) return;
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        const json = editorInstance.getJSON();
        const html = editorInstance.getHTML();
        const now = Date.now();
        await db.savedDocuments.put({
          id: 'draft-current',
          title: 'Rascunho Automático',
          contentJson: json,
          contentHtml: html,
          contextId: activeContextRef.current?.id || 'global',
          isTemplate: false,
          createdAt: now,
          updatedAt: now
        });
        setSaveStatus('saved');
        setLastSavedTime(
          new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.error('Falha no auto-save do rascunho:', err);
        setSaveStatus('idle');
      }
    }, 800);
  }, []);

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
    content: '',
    editorProps: {
      attributes: {
        class: 'outline-none focus:outline-none min-h-[480px] leading-relaxed text-sm sm:text-base selection:bg-sky-200 dark:selection:bg-sky-800'
      }
    },
    onUpdate: ({ editor: ed }) => {
      triggerAutoSave(ed);
    }
  });

  // Carregar rascunho existente do IndexedDB na inicialização
  useEffect(() => {
    if (!editor) return;

    let isMounted = true;
    const restoreDraft = async () => {
      try {
        const draft = await db.savedDocuments.get('draft-current');
        if (isMounted) {
          if (draft && (draft.contentJson || draft.contentHtml)) {
            if (draft.contentJson) {
              editor.commands.setContent(draft.contentJson);
            } else {
              editor.commands.setContent(draft.contentHtml);
            }
            setLastSavedTime(
              new Date(draft.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            );
            setSaveStatus('saved');
          } else {
            editor.commands.setContent(initialContent);
            setSaveStatus('idle');
          }
        }
      } catch (err) {
        console.error('Erro ao ler rascunho do IndexedDB:', err);
        if (isMounted) {
          editor.commands.setContent(initialContent);
        }
      } finally {
        if (isMounted) {
          isDraftRestoredRef.current = true;
        }
      }
    };

    restoreDraft();

    return () => {
      isMounted = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [editor]);

  // Carregar lista de modelos salvos do IndexedDB
  const loadSavedTemplates = useCallback(async () => {
    try {
      const allDocs = await db.savedDocuments.toArray();
      const templates = allDocs
        .filter(doc => doc.isTemplate)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      setSavedTemplates(templates);
    } catch (err) {
      console.error('Erro ao carregar modelos do Dexie:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedTemplates();
  }, [loadSavedTemplates]);

  // Ação: Salvar como modelo personalizado
  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !newModelTitle.trim()) return;

    try {
      const tplId = 'tpl-' + Date.now();
      const now = Date.now();
      const contextId = saveAsGlobal ? 'global' : (activeContext?.id || 'global');

      const templateDoc: SavedDocument = {
        id: tplId,
        title: newModelTitle.trim(),
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
        contextId,
        isTemplate: true,
        createdAt: now,
        updatedAt: now
      };

      await db.savedDocuments.put(templateDoc);
      await loadSavedTemplates();
      setIsSaveModelModalOpen(false);
      setNewModelTitle('');
      setSaveAsGlobal(false);
      showToast(`Modelo "${templateDoc.title}" salvo com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar modelo:', err);
      alert('Falha ao salvar modelo no banco local.');
    }
  };

  // Ação: Aplicar um modelo no editor
  const handleApplyTemplate = (tpl: SavedDocument) => {
    if (!editor) return;
    if (tpl.contentHtml) {
      editor.commands.setContent(interpolateMedicalTags(tpl.contentHtml));
    } else if (tpl.contentJson) {
      editor.commands.setContent(tpl.contentJson);
    }
    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast(`Modelo "${tpl.title}" carregado na folha A4.`);
  };

  // Ação: Excluir modelo
  const handleDeleteTemplate = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente excluir o modelo "${title}"?`)) return;
    try {
      await db.savedDocuments.delete(id);
      await loadSavedTemplates();
      showToast('Modelo excluído.');
    } catch (err) {
      console.error('Erro ao excluir modelo:', err);
    }
  };

  // Ação: Iniciar renomeação de modelo
  const handleStartRename = (tpl: SavedDocument) => {
    setEditingTemplateId(tpl.id);
    setEditingTemplateTitle(tpl.title);
  };

  // Ação: Salvar renomeação de modelo
  const handleSaveRename = async (id: string) => {
    if (!editingTemplateTitle.trim()) return;
    try {
      const existing = await db.savedDocuments.get(id);
      if (existing) {
        await db.savedDocuments.put({
          ...existing,
          title: editingTemplateTitle.trim(),
          updatedAt: Date.now()
        });
        await loadSavedTemplates();
      }
      setEditingTemplateId(null);
      setEditingTemplateTitle('');
      showToast('Modelo renomeado com sucesso.');
    } catch (err) {
      console.error('Erro ao renomear modelo:', err);
    }
  };

  // Ação: Limpar canvas e rascunho
  const handleClearCanvas = async () => {
    if (!editor) return;
    if (confirm('Deseja limpar todo o texto da folha A4?')) {
      editor.commands.clearContent();
      triggerAutoSave(editor);
      showToast('Canvas limpo.');
    }
  };

  // Modelos Rápidos de Fábrica
  const applyPresetTemplate = (
    type: 
      | 'laudo' 
      | 'receita' 
      | 'parecer' 
      | 'risco' 
      | 'atestado' 
      | 'laudo_com_receita' 
      | 'relatorio_circunstanciado' 
      | 'declaracao_comparecimento'
  ) => {
    if (!editor) return;
    const patientName = patient?.name || '__________________________';
    const patientDoc = patient?.documentNumber || '________________';
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const medsList = formatPrescriptionItemsList(prescriptionItems);

    let templateHtml = '';

    if (type === 'laudo_com_receita') {
      templateHtml = `
        <p style="text-align: center;"><strong>LAUDO MÉDICO COM PRESCRIÇÃO TERAPÊUTICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, encontra-se sob acompanhamento ambulatorial neste serviço para investigação propedêutica e manejo clínico integral.</p>
        <p><br></p>
        <p><strong>Quadro Clínico & Parecer:</strong> Paciente hemodinamicamente estável, em bom estado geral, orientado(a) quanto aos cuidados clínicos, medidas higienodietéticas e aderência farmacológica estrita.</p>
        <p><br></p>
        <p><strong>PLANO FARMACOLÓGICO INSTITUÍDO:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>Recomendações Clínicas:</strong> Manter a posologia prescrita com rigor de horários. Retorno ambulatorial programado para reavaliação de conduta e seguimento terapêutico.</p>
      `;
    } else if (type === 'relatorio_circunstanciado') {
      templateHtml = `
        <p style="text-align: center;"><strong>RELATÓRIO MÉDICO CIRCUNSTANCIADO</strong></p>
        <p><br></p>
        <p><strong>Identificação do Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc} | <strong>Data:</strong> ${today}</p>
        <p><br></p>
        <p><strong>1. Histórico da Moléstia Atual:</strong> Paciente em acompanhamento regular neste serviço de saúde apresentando quadro clínico compatível com a hipótese diagnóstica em investigação, demandando suporte clínico contínuo e plano farmacológico diário.</p>
        <p><br></p>
        <p><strong>2. Exame Físico / Sinais Vitais:</strong> Bom estado geral, consciente e orientado(a) no tempo e espaço, eupneico(a) em ar ambiente, acianótico(a). Aparelho cardiovascular com ritmo regular em 2 tempos, bulhas normofonéticas sem sopros. Ausculta pulmonar com murmúrio vesicular universalmente audível sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>3. Terapêutica Farmacológica em Curso:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>4. Conclusão & Conduta:</strong> Paciente com benefício clínico comprovado ao esquema medicamentoso instituído, necessitando de continuidade do tratamento e reavaliações periódicas neste serviço.</p>
      `;
    } else if (type === 'declaracao_comparecimento') {
      templateHtml = `
        <p style="text-align: center;"><strong>DECLARAÇÃO DE COMPARECIMENTO E RECEITA MÉDICA</strong></p>
        <p><br></p>
        <p>Declaro para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, compareceu a esta unidade de saúde na data de <strong>${today}</strong> para consulta médica ambulatorial.</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO FARMACOLÓGICA EMITIDA:</strong></p>
        ${medsList}
        <p><br></p>
        <p>Apto(a) a retornar às suas atividades habituais após o atendimento, respeitadas as orientações posológicas e de repouso prescritas.</p>
      `;
    } else if (type === 'laudo') {
      templateHtml = `
        <p style="text-align: center;"><strong>LAUDO MÉDICO DE AVALIAÇÃO CLÍNICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico nesta data, encontrando-se sob acompanhamento ambulatorial para investigação e manejo terapêutico.</p>
        <p><br></p>
        <p><strong>Hipótese Diagnóstica / Quadro Clínico:</strong> Paciente lúcido(a), orientado(a), eupneico(a), hemodinamicamente estável, sem queixas agudas de urgência no momento da avaliação.</p>
        <p><br></p>
        <p><strong>Conduta:</strong> Mantido plano terapêutico previamente instituído. Retorno programado com resultados de exames complementares.</p>
      `;
    } else if (type === 'risco') {
      templateHtml = `
        <p style="text-align: center;"><strong>PARECER DE RISCO CIRÚRGICO PRÉ-OPERATÓRIO</strong></p>
        <p><br></p>
        <p>Paciente: <strong>${patientName}</strong> | Documento: ${patientDoc}</p>
        <p><br></p>
        <p>Avaliado(a) para liberação de procedimento cirúrgico eletivo. Nega precordialgia típica, dispneia paroxística noturna ou síncope aos esforços. Capacidade funcional estimada > 4 METs.</p>
        <p><br></p>
        <p><strong>Exame Físico:</strong> Ritmo cardíaco regular em 2 tempos, bulhas normofonéticas sem sopros audíveis. PA dentro dos limites de tolerância. Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>Classificação de Risco:</strong> ASA II / Baixo Risco Cardiovascular para o procedimento proposto.</p>
        <p><br></p>
        <p><strong>Recomendações:</strong> Manter medicação anti-hipertensiva habitual com mínimo gole de água pela manhã no dia da cirurgia. Monitorização hemodinâmica intraoperatória padrão.</p>
      `;
    } else if (type === 'parecer') {
      templateHtml = `
        <p style="text-align: center;"><strong>PARECER MÉDICO ESPECIALIZADO / CONTRA-REFERÊNCIA</strong></p>
        <p><br></p>
        <p>Ao Médico(a) Assistente da Unidade de Origem,</p>
        <p>Encaminhamos avaliação especializada referente ao(à) paciente <strong>${patientName}</strong>.</p>
        <p><br></p>
        <p><strong>Sumário da Avaliação:</strong> Exame físico sem alterações significativas para a queixa principal. Exames complementares revisados e discutidos com o paciente.</p>
        <p><br></p>
        <p><strong>Recomendações e Ajustes Farmacológicos:</strong> Seguir acompanhamento regular na Atenção Primária com as orientações anexas. Programado novo retorno especializado caso haja refratariedade sintomática.</p>
      `;
    } else if (type === 'atestado') {
      templateHtml = `
        <p style="text-align: center;"><strong>ATESTADO MÉDICO DE APTIDÃO FÍSICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico e anamnese dirigida nesta data, encontrando-se <strong>APTO(A)</strong> para a prática de atividades físicas esportivas e laborativas que não exijam esforço físico extenuante desmedido.</p>
        <p><br></p>
        <p>Válido pelo período regulamentar a contar da presente data.</p>
      `;
    } else {
      templateHtml = initialContent;
    }

    editor.commands.setContent(interpolateMedicalTags(templateHtml));
    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast('Modelo de referência aplicado.');
  };

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
        showToast('Logotipo atualizado no local de atendimento.');
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
      showToast('Logotipo removido.');
    }
  };

  // Dados dinâmicos do contexto de trabalho institucional ativo
  const docClinic = activeContext?.clinicName || doctor?.clinicName?.trim() || 'Rede de Atenção à Saúde';
  const docAddress = activeContext?.clinicAddress || doctor?.address?.trim() || 'Unidade Básica de Saúde';
  const docCrm = activeContext?.doctorCredentials?.crm || doctor?.crm || '------';
  const docCrmState = activeContext?.doctorCredentials?.uf || doctor?.crmState || 'SP';
  const docRqe = activeContext?.doctorCredentials?.rqe || doctor?.rqe;
  const docSpecialty = activeContext?.doctorCredentials?.specialty || doctor?.specialty || 'Clínica Médica';
  const docName = doctor?.name || 'Dr(a). Médico(a)';

  // Filtro de modelos salvos
  const filteredSavedTemplates = savedTemplates.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-tab-fade no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Ferramentas Superior Fixa / Elevada */}
      <div 
        className="editor-toolbar no-print sticky top-[72px] sm:top-[76px] z-30 rounded-2xl p-2.5 sm:p-3 border backdrop-blur-md shadow-tactile-sm flex flex-wrap items-center justify-between gap-2.5 bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
      >
        {/* Agrupamento 1: Estilos Básicos de Formatação */}
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

          {/* Alinhamento de Texto */}
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

          {/* Indicador Tátil de Auto-Save Local-First */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] ml-1">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                <span className="hidden sm:inline">Salvando...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Salvo {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Local-First</span>
              </>
            )}
          </div>
        </div>

        {/* Agrupamento 2: Tipografia, Modelos, Salvar e Impressão */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor Tipográfico */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={typography}
              onChange={(e) => setTypography(e.target.value as any)}
              className="bg-transparent font-medium cursor-pointer focus:outline-none text-xs"
              aria-label="Família Tipográfica da Folha A4"
            >
              <option value="serif">Cormorant Garamond (Clássica)</option>
              <option value="sans">Plus Jakarta Sans (Hospitalar)</option>
              <option value="inter">Inter (Técnica)</option>
            </select>
          </div>

          {/* Botão Importar Consulta Ativa */}
          <button
            type="button"
            onClick={handleImportActiveConsultation}
            className="h-9 px-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition-all"
            title="Importar dados do paciente e medicamentos prescritos nesta consulta para a folha A4"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Importar Consulta</span>
            <span className="sm:hidden">Importar</span>
            {prescriptionItems && prescriptionItems.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                {prescriptionItems.length}
              </span>
            )}
          </button>

          {/* Botão Biblioteca de Modelos (Drawer) */}
          <button
            type="button"
            onClick={() => setIsModelsDrawerOpen(true)}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
            title="Abrir biblioteca de modelos clínicos e laudos salvos"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Modelos</span>
            {savedTemplates.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {savedTemplates.length}
              </span>
            )}
          </button>

          {/* Botão Salvar como Modelo */}
          <button
            type="button"
            onClick={() => {
              setNewModelTitle('');
              setIsSaveModelModalOpen(true);
            }}
            className="h-9 px-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
            title="Salvar o texto atual como modelo reutilizável no IndexedDB"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvar Modelo</span>
          </button>

          {/* Criador Procedural de Logotipos SVG */}
          <button
            type="button"
            onClick={() => setIsLogoGeneratorOpen(true)}
            className="h-9 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition-all"
            title="Criador procedural de timbrados e brasões clínicos em SVG"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Criar Logo / Timbre SVG</span>
            <span className="md:hidden">Criar SVG</span>
          </button>

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

          {/* Botão Limpar Canvas */}
          <button
            type="button"
            onClick={handleClearCanvas}
            className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center cursor-pointer shadow-tactile-sm"
            title="Limpar folha A4"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

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
          {/* Cabeçalho Hospitalar / Timbrado Oficial Regulamentar */}
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
                      {docName}
                    </h1>
                    <p className="text-xs font-bold text-sky-800 font-sans mt-0.5">
                      CRM-{docCrmState} {docCrm} {docRqe ? `• RQE ${docRqe}` : ''}
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
            <div className="w-72 border-b border-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-900 uppercase">
              {docName}
            </p>
            <p className="text-[11px] text-slate-600 font-semibold">
              Médico(a) — CRM-{docCrmState} {docCrm} {docRqe ? `• RQE ${docRqe}` : ''}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {docSpecialty}
            </p>
            <p className="text-[9px] text-slate-400 mt-2">
              Emitido eletronicamente via PresCMed • Documento em conformidade com as resoluções do CFM
            </p>
          </footer>
        </div>
      </div>

      {/* DRAWER LATERAL: Modelos & Histórico Clínico */}
      {isModelsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end no-print">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsModelsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[var(--surface-card)] text-[var(--text-main)] shadow-tactile-lg border-l border-[var(--border-subtle)] flex flex-col h-full z-10 animate-tab-fade">
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  <span>Modelos Clínicos</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Modelos salvos no IndexedDB e padrões regulamentares
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModelsDrawerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Busca e Ação de Criar */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col gap-2.5 bg-[var(--bg-app)]">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Buscar modelo salvo..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModelsDrawerOpen(false);
                  setNewModelTitle('');
                  setIsSaveModelModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-tactile-btn cursor-pointer"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Salvar Documento Atual como Modelo</span>
              </button>
            </div>

            {/* Lista com Rolagem */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {/* Seção 1: Meus Modelos Salvos no IndexedDB */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <span>Meus Modelos Salvos</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[var(--surface-hover)] text-[10px]">
                      {filteredSavedTemplates.length}
                    </span>
                  </h3>
                </div>

                {filteredSavedTemplates.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                    {templateSearch ? (
                      'Nenhum modelo encontrado para esta busca.'
                    ) : (
                      <>
                        <BookmarkPlus className="w-6 h-6 mx-auto mb-1.5 text-slate-400 opacity-60" />
                        <p className="font-medium">Nenhum modelo personalizado salvo ainda.</p>
                        <p className="text-[11px] mt-1 opacity-80">
                          Clique em &quot;Salvar Modelo&quot; para registrar seus laudos e receitas habituais.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSavedTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col gap-2 group shadow-tactile-sm"
                      >
                        {editingTemplateId === tpl.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTemplateTitle}
                              onChange={(e) => setEditingTemplateTitle(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-sky-500 bg-[var(--bg-app)] focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(tpl.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 cursor-pointer"
                              title="Salvar novo título"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTemplateId(null)}
                              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-xs hover:bg-[var(--surface-hover)] cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                                {tpl.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                                <span>
                                  {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                                  {new Date(tpl.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {tpl.contextId && tpl.contextId !== 'global' ? (
                                  <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold">
                                    Local
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    Global
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartRename(tpl)}
                                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-sky-600 cursor-pointer"
                                title="Renomear modelo"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                                title="Excluir modelo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate(tpl)}
                            className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Carregar na Folha</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção 2: Modelos de Referência PresCMed */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modelos de Referência PresCMed</span>
                </h3>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 hover:border-sky-400 transition-all">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-extrabold uppercase">
                        Consulta Ativa
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-main)]">
                        Laudo com Prescrição Anexa
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Avaliação clínica estruturada acompanhada dos medicamentos prescritos na consulta atual.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('laudo_com_receita')}
                      className="mt-2 text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 hover:border-sky-400 transition-all">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-extrabold uppercase">
                        SUS / Perícia
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-main)]">
                        Relatório Médico Circunstanciado
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Para perícia médica, regulação do SUS ou INSS com anamnese dirigida e terapêutica em curso.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('relatorio_circunstanciado')}
                      className="mt-2 text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 hover:border-sky-400 transition-all">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-extrabold uppercase">
                        Declaração
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-main)]">
                        Declaração de Comparecimento com Receita
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Comprovação de horário de atendimento com prescrição dos fármacos indicados.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('declaracao_comparecimento')}
                      className="mt-2 text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-amber-400 transition-all">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Laudo de Avaliação Clínica
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Sumário de atendimento, hipótese diagnóstica e conduta terapêutica.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('laudo')}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-amber-400 transition-all">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Risco Cirúrgico Pré-Operatório
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Avaliação pré-anestésica com estratificação ASA e recomendações clínicas.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('risco')}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-amber-400 transition-all">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Parecer Especializado / Contra-Referência
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Resposta ao médico da Atenção Básica com plano terapêutico e seguimento.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('parecer')}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-amber-400 transition-all">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Atestado de Aptidão Física
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Declaração de aptidão para esportes e academia conforme diretrizes do CFM.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('atestado')}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-amber-400 transition-all">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Receita Ambulatorial Livre Padrão
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Prescrição antibiótica e analgésica sintomática com espaçamento milimétrico.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyPresetTemplate('receita')}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inserir este modelo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Salvar como Modelo Personalizado */}
      {isSaveModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print animate-tab-fade">
          <div className="bg-[var(--surface-card)] text-[var(--text-main)] rounded-2xl max-w-md w-full p-5 border border-[var(--border-subtle)] shadow-tactile-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold">Salvar como Modelo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModelModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsTemplate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
                  Nome do Modelo Clínico
                </label>
                <input
                  type="text"
                  required
                  value={newModelTitle}
                  onChange={(e) => setNewModelTitle(e.target.value)}
                  placeholder="Ex: Laudo Cardiológico - Policlínica"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 font-medium"
                  autoFocus
                />
              </div>

              {/* Vínculo de Contexto */}
              <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Local de Atuação:</span>
                  <span className="text-[var(--text-main)] font-bold">
                    {activeContext?.name || 'Geral'}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={saveAsGlobal}
                    onChange={(e) => setSaveAsGlobal(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Tornar este modelo disponível em todos os meus locais de trabalho</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newModelTitle.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white shadow-tactile-btn cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar no Banco Local</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Criador Procedural de Logotipos e Timbrados em SVG */}
      {isLogoGeneratorOpen && (
        <LogoGeneratorModal
          isOpen={isLogoGeneratorOpen}
          onClose={() => setIsLogoGeneratorOpen(false)}
          activeContext={activeContext}
          doctor={doctor}
          onApplyLogo={async (dataUrl) => {
            if (activeContext && onSaveContext) {
              await onSaveContext({
                ...activeContext,
                logoDataUrl: dataUrl
              });
            }
            showToast('Logotipo vetorial SVG aplicado com sucesso!');
          }}
        />
      )}
    </div>
  );
};

export default DocumentEditorView;
