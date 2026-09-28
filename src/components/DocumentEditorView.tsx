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
  Move,
  Image as ImageIcon,
  Save,
  Plus,
  Eye,
  EyeOff,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { 
  DoctorProfile, 
  Patient, 
  WorkContext, 
  PrescriptionItem, 
  WatermarkType,
  LogoPosition,
  DocumentHeaderConfig,
  DocumentLogoConfig,
  SavedDocument
} from '../types';
import { db, initializeDefaultTemplates } from '../services/db';
import { PRESET_LOGOS } from '../data/presetAssets';
import LogoGeneratorModal from './LogoGeneratorModal';
import WatermarkOverlay from './WatermarkOverlay';
import WatermarkSelector from './WatermarkSelector';

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
  const sheetRef = useRef<HTMLDivElement>(null);

  // Estados de Persistência Local-First & Auto-Save
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isDraftRestoredRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeContextRef = useRef(activeContext);
  activeContextRef.current = activeContext;

  // Estados do Modelo Ativo
  const [currentModel, setCurrentModel] = useState<{
    id: string | null;
    title: string;
    isPreset: boolean;
  }>({
    id: null,
    title: 'Documento Livre (Rascunho)',
    isPreset: false
  });
  const [isEditingModelTitle, setIsEditingModelTitle] = useState(false);
  const [tempModelTitle, setTempModelTitle] = useState('');

  // Estados do Cabeçalho e Rodapé Editáveis em Tempo Real
  const buildDefaultHeader = useCallback((): DocumentHeaderConfig => {
    const docClinic = activeContext?.clinicName || doctor?.clinicName?.trim() || 'Rede de Atenção à Saúde';
    const docAddress = activeContext?.clinicAddress || doctor?.address?.trim() || 'Unidade Básica de Saúde';
    const docCrm = activeContext?.doctorCredentials?.crm || doctor?.crm || '------';
    const docCrmState = activeContext?.doctorCredentials?.uf || doctor?.crmState || 'SP';
    const docRqe = activeContext?.doctorCredentials?.rqe || doctor?.rqe;
    const docSpecialty = activeContext?.doctorCredentials?.specialty || doctor?.specialty || 'Clínica Médica';
    const docName = doctor?.name || 'Dr(a). Médico(a)';
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return {
      doctorName: docName,
      doctorCrm: `CRM-${docCrmState} ${docCrm}${docRqe ? ` • RQE ${docRqe}` : ''}`,
      doctorSpecialty: docSpecialty,
      clinicName: docClinic,
      clinicAddress: `${docAddress}${activeContext?.cnes && activeContext.documentFormatting?.showCnesOnHeader ? ` • CNES: ${activeContext.cnes}` : ''}`,
      badgeText: 'DOCUMENTO CLÍNICO LIVRE',
      dateText: today,
      showHeader: true,
      showFooter: true,
      showPatientBanner: true,
      patientCustomText: '',
      footerDocName: docName,
      footerCrm: `Médico(a) — CRM-${docCrmState} ${docCrm}${docRqe ? ` • RQE ${docRqe}` : ''}`,
      footerSpecialty: docSpecialty,
      footerSubtext: 'Emitido eletronicamente via PresCMed • Documento em conformidade com as resoluções do CFM'
    };
  }, [doctor, activeContext]);

  const [headerConfig, setHeaderConfig] = useState<DocumentHeaderConfig>(buildDefaultHeader);

  // Estados da Logo em Tempo Real (Posição Livre, Arrastável, Alinhamento, Tamanho)
  const [logoConfig, setLogoConfig] = useState<DocumentLogoConfig>({
    dataUrl: activeContext?.logoDataUrl || undefined,
    position: (activeContext?.logoAlignment === 'center' ? 'top-center' : activeContext?.logoAlignment === 'right' ? 'top-right' : 'top-left'),
    x: 4, // percentual horizontal na folha A4
    y: 3, // percentual vertical na folha A4
    size: 'md',
    visible: true
  });
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const [logoSelected, setLogoSelected] = useState(false);

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

  const [docWatermark, setDocWatermark] = useState<WatermarkType>(
    activeContext?.watermarkType || 'none'
  );

  useEffect(() => {
    if (activeContext?.watermarkType !== undefined) {
      setDocWatermark(activeContext.watermarkType);
    }
  }, [activeContext?.watermarkType]);

  const handleWatermarkChange = async (newType: WatermarkType) => {
    setDocWatermark(newType);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        watermarkType: newType
      });
      showToast("Marca d'água atualizada!");
    }
  };

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

  // Interpolação de tags dinâmicas
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

  // Função para salvar rascunho com debounce no IndexedDB
  const triggerAutoSave = useCallback((editorInstance: any, updatedHeader?: DocumentHeaderConfig, updatedLogo?: DocumentLogoConfig) => {
    if (!isDraftRestoredRef.current) return;
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const currentHeader = updatedHeader || headerConfig;
    const currentLogo = updatedLogo || logoConfig;

    saveTimerRef.current = setTimeout(async () => {
      try {
        const json = editorInstance?.getJSON?.() || null;
        const html = editorInstance?.getHTML?.() || '';
        const now = Date.now();
        await db.savedDocuments.put({
          id: 'draft-current',
          title: currentModel.title || 'Rascunho Automático',
          contentJson: json,
          contentHtml: html,
          contextId: activeContextRef.current?.id || 'global',
          isTemplate: false,
          headerConfig: currentHeader,
          logoConfig: currentLogo,
          typography,
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
    }, 600);
  }, [headerConfig, logoConfig, typography, currentModel.title]);

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
        class: 'outline-none focus:outline-none min-h-[460px] leading-relaxed text-sm sm:text-base selection:bg-sky-200 dark:selection:bg-sky-800'
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
            if (draft.headerConfig) {
              setHeaderConfig(draft.headerConfig);
            }
            if (draft.logoConfig) {
              setLogoConfig(draft.logoConfig);
            }
            if (draft.typography) {
              setTypography(draft.typography);
            }
            if (draft.title && draft.title !== 'Rascunho Automático') {
              setCurrentModel({
                id: null,
                title: draft.title,
                isPreset: false
              });
            }
            setLastSavedTime(
              new Date(draft.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            );
            setSaveStatus('saved');
          } else {
            editor.commands.setContent(initialContent);
            setHeaderConfig(buildDefaultHeader());
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
  }, [editor, buildDefaultHeader]);

  // Carregar lista de modelos salvos do IndexedDB
  const loadSavedTemplates = useCallback(async () => {
    try {
      let allDocs = await db.savedDocuments.toArray();
      let templates = allDocs
        .filter(doc => doc.isTemplate)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      if (templates.length === 0) {
        await initializeDefaultTemplates();
        allDocs = await db.savedDocuments.toArray();
        templates = allDocs
          .filter(doc => doc.isTemplate)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      }
      setSavedTemplates(templates);
    } catch (err) {
      console.error('Erro ao carregar modelos do Dexie:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedTemplates();
  }, [loadSavedTemplates]);

  // Atualização de campos do cabeçalho em tempo real
  const handleHeaderFieldChange = (field: keyof DocumentHeaderConfig, value: any) => {
    setHeaderConfig(prev => {
      const next = { ...prev, [field]: value };
      if (editor) triggerAutoSave(editor, next, logoConfig);
      return next;
    });
  };

  // Restaurar dados do médico cadastrado no perfil
  const handleResetHeaderFromProfile = () => {
    const fresh = buildDefaultHeader();
    setHeaderConfig(fresh);
    if (editor) triggerAutoSave(editor, fresh, logoConfig);
    showToast('Cabeçalho sincronizado com os dados do seu Perfil Médico!');
  };

  // Ação: Salvar alterações no modelo atual OU abrir modal se for novo
  const handleSaveModelDirectly = async () => {
    if (!editor) return;

    if (currentModel.id && !currentModel.isPreset) {
      // Salva diretamente no modelo ativo
      try {
        const now = Date.now();
        const updatedDoc: SavedDocument = {
          id: currentModel.id,
          title: currentModel.title,
          contentJson: editor.getJSON(),
          contentHtml: editor.getHTML(),
          contextId: activeContext?.id || 'global',
          isTemplate: true,
          headerConfig,
          logoConfig,
          typography,
          createdAt: now,
          updatedAt: now
        };
        await db.savedDocuments.put(updatedDoc);
        await loadSavedTemplates();
        setSaveStatus('saved');
        setLastSavedTime(
          new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        showToast(`Modelo "${currentModel.title}" atualizado com sucesso!`);
      } catch (err) {
        console.error('Erro ao atualizar modelo existente:', err);
        alert('Falha ao atualizar modelo no banco local.');
      }
    } else {
      // É um preset ou documento novo sem ID: abre o modal com o título sugerido
      setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? currentModel.title : '');
      setIsSaveModelModalOpen(true);
    }
  };

  // Ação: Salvar como modelo personalizado (cria novo)
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
        headerConfig,
        logoConfig,
        typography,
        createdAt: now,
        updatedAt: now
      };

      await db.savedDocuments.put(templateDoc);
      await loadSavedTemplates();
      setCurrentModel({
        id: tplId,
        title: templateDoc.title,
        isPreset: false
      });
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

    if (tpl.headerConfig) {
      setHeaderConfig({
        ...buildDefaultHeader(),
        ...tpl.headerConfig,
        // Garante data de hoje se dateText estiver desatualizado
        dateText: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      });
    } else {
      // Se não tinha headerConfig salvo, define o badge com o título
      setHeaderConfig(prev => ({
        ...prev,
        badgeText: tpl.title.toUpperCase().slice(0, 32)
      }));
    }

    if (tpl.logoConfig) {
      setLogoConfig(tpl.logoConfig);
    }

    if (tpl.typography) {
      setTypography(tpl.typography);
    }

    setCurrentModel({
      id: tpl.id,
      title: tpl.title,
      isPreset: false
    });

    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast(`Modelo "${tpl.title}" carregado na folha A4.`);
  };

  // Ação: Iniciar novo documento em branco
  const handleStartNewDocument = () => {
    if (!editor) return;
    if (confirm('Deseja iniciar um novo documento em branco na folha A4?')) {
      editor.commands.setContent('<p><br></p>');
      setCurrentModel({
        id: null,
        title: 'Novo Documento Livre',
        isPreset: false
      });
      setHeaderConfig(buildDefaultHeader());
      triggerAutoSave(editor);
      showToast('Folha A4 pronta para novo documento.');
    }
  };

  // Ação: Excluir modelo
  const handleDeleteTemplate = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente excluir o modelo "${title}"?`)) return;
    try {
      await db.savedDocuments.delete(id);
      await loadSavedTemplates();
      if (currentModel.id === id) {
        setCurrentModel({
          id: null,
          title: 'Documento Livre (Rascunho)',
          isPreset: false
        });
      }
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
        if (currentModel.id === id) {
          setCurrentModel(prev => ({ ...prev, title: editingTemplateTitle.trim() }));
        }
      }
      setEditingTemplateId(null);
      setEditingTemplateTitle('');
      showToast('Modelo renomeado com sucesso.');
    } catch (err) {
      console.error('Erro ao renomear modelo:', err);
    }
  };

  // Renomear modelo ativo diretamente na toolbar
  const handleSaveCurrentModelTitle = () => {
    if (tempModelTitle.trim()) {
      setCurrentModel(prev => ({ ...prev, title: tempModelTitle.trim() }));
      setIsEditingModelTitle(false);
      if (editor) triggerAutoSave(editor);
      showToast('Nome do modelo atualizado.');
    }
  };

  // Modelos Rápidos de Fábrica com Dados Completos
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
    let presetTitle = '';
    let badge = 'DOCUMENTO CLÍNICO LIVRE';

    if (type === 'laudo_com_receita') {
      presetTitle = 'Laudo Médico com Prescrição Terapêutica';
      badge = 'LAUDO COM RECEITA';
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
      presetTitle = 'Relatório Médico Circunstanciado';
      badge = 'RELATÓRIO CIRCUNSTANCIADO';
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
      presetTitle = 'Declaração de Comparecimento com Receita';
      badge = 'DECLARAÇÃO DE COMPARECIMENTO';
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
      presetTitle = 'Laudo de Avaliação Clínica';
      badge = 'LAUDO CLÍNICO';
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
      presetTitle = 'Parecer de Risco Cirúrgico Pré-Operatório';
      badge = 'RISCO CIRÚRGICO';
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
      presetTitle = 'Parecer Médico Especializado';
      badge = 'PARECER ESPECIALIZADO';
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
      presetTitle = 'Atestado Médico de Aptidão Física';
      badge = 'ATESTADO DE APTIDÃO';
      templateHtml = `
        <p style="text-align: center;"><strong>ATESTADO MÉDICO DE APTIDÃO FÍSICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico e anamnese dirigida nesta data, encontrando-se <strong>APTO(A)</strong> para a prática de atividades físicas esportivas e laborativas que não exijam esforço físico extenuante desmedido.</p>
        <p><br></p>
        <p>Válido pelo período regulamentar a contar da presente data.</p>
      `;
    } else {
      presetTitle = 'Receita Ambulatorial Livre';
      badge = 'RECEITA MÉDICA';
      templateHtml = initialContent;
    }

    editor.commands.setContent(interpolateMedicalTags(templateHtml));
    setHeaderConfig(prev => ({
      ...prev,
      badgeText: badge
    }));

    setCurrentModel({
      id: null,
      title: presetTitle,
      isPreset: true
    });

    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast(`Modelo "${presetTitle}" carregado. Faça suas alterações e clique em "Salvar Alterações".`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Upload de arquivo de imagem para logotipo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const updatedLogo: DocumentLogoConfig = {
        ...logoConfig,
        dataUrl,
        visible: true
      };
      setLogoConfig(updatedLogo);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          logoDataUrl: dataUrl
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
      setLogoUploading(false);
      setIsLogoMenuOpen(false);
      showToast('Logotipo adicionado com sucesso! Você pode movê-lo para onde quiser.');
    };
    reader.onerror = () => {
      setLogoUploading(false);
      alert('Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  // Aplicar logo pré-definida
  const handleApplyPresetLogo = async (dataUrl: string, name: string) => {
    const updatedLogo: DocumentLogoConfig = {
      ...logoConfig,
      dataUrl,
      visible: true
    };
    setLogoConfig(updatedLogo);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        logoDataUrl: dataUrl
      });
    }
    if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
    setIsLogoMenuOpen(false);
    showToast(`Logotipo "${name}" aplicado!`);
  };

  // Mudar posição da logo
  const handleChangeLogoPosition = (position: LogoPosition) => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      position,
      visible: true
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
    showToast(
      position === 'free' 
        ? 'Modo Livre ativado: clique e arraste a logo para onde quiser na folha!' 
        : `Posição da logo alterada.`
    );
  };

  // Mudar tamanho da logo
  const handleChangeLogoSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      size
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
  };

  // Remover logotipo
  const handleRemoveLogo = async () => {
    if (confirm('Deseja remover o logotipo deste documento?')) {
      const updated: DocumentLogoConfig = {
        ...logoConfig,
        dataUrl: undefined,
        visible: false
      };
      setLogoConfig(updated);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          logoDataUrl: undefined
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updated);
      showToast('Logotipo removido.');
    }
  };

  // Handlers para Arrastar a Logo na Folha A4 (Drag and Drop em Tempo Real)
  const handleLogoPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(true);
    setLogoSelected(true);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleLogoPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingLogo || !sheetRef.current) return;
    const rect = sheetRef.current.getBoundingClientRect();
    // Limita entre 1% e 85% para não estourar a folha A4
    const x = Math.max(1, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(1, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    setLogoConfig(prev => ({
      ...prev,
      position: 'free',
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    }));
  };

  const handleLogoPointerUp = (e: React.PointerEvent) => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      if (editor) triggerAutoSave(editor);
    }
  };

  // Helper para tamanho da logo
  const getLogoSizeClass = (size: DocumentLogoConfig['size']) => {
    switch (size) {
      case 'sm': return 'max-h-12 max-w-[120px]';
      case 'md': return 'max-h-16 max-w-[170px]';
      case 'lg': return 'max-h-24 max-w-[240px]';
      case 'xl': return 'max-h-32 max-w-[300px]';
      default: return 'max-h-16 max-w-[170px]';
    }
  };

  // Filtro de modelos salvos
  const filteredSavedTemplates = savedTemplates.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full pb-16" onClick={() => setLogoSelected(false)}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-tab-fade no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR: Contexto do Modelo Ativo & Ações Rápidas */}
      <div className="no-print bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-tactile-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[260px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs">
            <LayoutTemplate className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-[var(--text-muted)] font-medium">Modelo:</span>
            {isEditingModelTitle ? (
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={tempModelTitle}
                  onChange={e => setTempModelTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveCurrentModelTitle();
                    if (e.key === 'Escape') setIsEditingModelTitle(false);
                  }}
                  autoFocus
                  className="px-2 py-0.5 text-xs font-bold rounded border border-sky-500 bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentModelTitle}
                  className="p-1 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
                  title="Salvar título"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingModelTitle(false)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sky-900 dark:text-sky-200 truncate max-w-[280px]">
                  {currentModel.title}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempModelTitle(currentModel.title);
                    setIsEditingModelTitle(true);
                  }}
                  className="p-1 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg text-sky-700 dark:text-sky-300 cursor-pointer transition-colors"
                  title="Renomear este modelo"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Indicador de Status Local-First */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                <span className="hidden sm:inline">Salvando em tempo real...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Salvo {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Edição em Tempo Real</span>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação de Modelo */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão SALVAR ALTERAÇÕES (Salva e atualiza o modelo atual) */}
          <button
            type="button"
            onClick={handleSaveModelDirectly}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-btn transition-all active:scale-95"
            title="Salvar e atualizar este modelo com todas as modificações atuais de texto, cabeçalho e logo"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>

          {/* Botão Salvar como Novo Modelo */}
          <button
            type="button"
            onClick={() => {
              setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? `${currentModel.title} (Cópia)` : '');
              setIsSaveModelModalOpen(true);
            }}
            className="h-9 px-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
            title="Criar um novo modelo salvo a partir deste documento"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvar como Novo</span>
          </button>

          {/* Botão Biblioteca de Modelos */}
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

          {/* Botão Novo em Branco */}
          <button
            type="button"
            onClick={handleStartNewDocument}
            className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-sky-600 flex items-center justify-center cursor-pointer shadow-tactile-sm"
            title="Iniciar novo documento em branco"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BARRA DE FERRAMENTAS DO EDITOR (Fixa / Sticky) */}
      <div 
        className="editor-toolbar no-print sticky top-[72px] sm:top-[76px] z-30 rounded-2xl p-2.5 sm:p-3 border backdrop-blur-md shadow-tactile-sm flex flex-wrap items-center justify-between gap-2.5 bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
      >
        {/* Agrupamento 1: Formatação Tiptap */}
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
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer"
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Agrupamento 2: Tipografia, Importar Consulta, Logotipo & Impressão */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor Tipográfico */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={typography}
              onChange={(e) => {
                const val = e.target.value as any;
                setTypography(val);
                if (editor) triggerAutoSave(editor);
              }}
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
            className="h-9 px-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm"
            title="Inserir dados do paciente e medicamentos prescritos nesta consulta na folha A4"
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

          {/* MENU / CONTROLE DE LOGOTIPO (Mudar de lugar, carregar, redimensionar) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLogoMenuOpen(prev => !prev)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition-all ${
                logoConfig.dataUrl && logoConfig.visible
                  ? 'border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)]'
              }`}
              title="Posicionar e gerenciar logotipo na folha A4"
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Logotipo</span>
              {logoConfig.dataUrl && (
                <span className="text-[10px] px-1.5 py-0.2 bg-sky-200 dark:bg-sky-800 rounded font-bold uppercase">
                  {logoConfig.position === 'free' ? 'Livre' : logoConfig.position.replace('top-', '').replace('header-', '')}
                </span>
              )}
            </button>

            {/* Dropdown de Gestão do Logotipo */}
            {isLogoMenuOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-2xl shadow-tactile-lg p-4 z-50 flex flex-col gap-3 animate-tab-fade">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>Configurar Logotipo / Timbre</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsLogoMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Opções de Posicionamento */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1.5">
                    Posição na Folha A4:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('top-left')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'top-left' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm">⇱</span>
                      <span className="text-[10px]">Topo Esq.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('top-center')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'top-center' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm">⬌</span>
                      <span className="text-[10px]">Topo Centro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('top-right')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'top-right' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm">⇲</span>
                      <span className="text-[10px]">Topo Dir.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('header-left')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'header-left' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm">🏢</span>
                      <span className="text-[10px]">Header Esq.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('header-right')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'header-right' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm">🏢</span>
                      <span className="text-[10px]">Header Dir.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('free')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        logoConfig.position === 'free' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                      title="Arrastar e soltar livremente em qualquer lugar da folha"
                    >
                      <Move className="w-4 h-4 text-sky-600" />
                      <span className="text-[10px]">Modo Livre</span>
                    </button>
                  </div>
                  {logoConfig.position === 'free' && (
                    <p className="text-[10px] text-sky-700 dark:text-sky-300 mt-1.5 flex items-center gap-1">
                      <Move className="w-3 h-3 shrink-0" />
                      <span>Arraste a logo diretamente sobre o papel A4 para posicionar!</span>
                    </p>
                  )}
                </div>

                {/* Opções de Tamanho */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1.5">
                    Tamanho do Logotipo:
                  </label>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleChangeLogoSize(sz)}
                        className={`py-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                          logoConfig.size === sz ? 'border-sky-500 bg-sky-100 dark:bg-sky-900 font-bold text-sky-900 dark:text-sky-200' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ações de Imagem: Upload, Criar SVG, Preset, Remover */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
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
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-btn"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUploading ? 'Carregando...' : 'Fazer Upload'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLogoMenuOpen(false);
                        setIsLogoGeneratorOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      title="Criar brasão vetorial SVG"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Criar SVG</span>
                    </button>
                  </div>

                  {/* Logotipos Rápidos da Rede Pública */}
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block mb-1">Brasões Rápidos:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.semusa.dataUrl, 'SEMUSA')}
                        className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-sky-400 text-center truncate cursor-pointer"
                        title="SEMUSA Porto Velho"
                      >
                        SEMUSA
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sesau_ro.dataUrl, 'SESAU')}
                        className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-sky-400 text-center truncate cursor-pointer"
                        title="SESAU Rondônia"
                      >
                        SESAU
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sus.dataUrl, 'SUS')}
                        className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-sky-400 text-center truncate cursor-pointer"
                        title="Sistema Único de Saúde"
                      >
                        SUS
                      </button>
                    </div>
                  </div>

                  {logoConfig.dataUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover Logotipo</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Seletor de Marca d'Água Oficial */}
          <WatermarkSelector 
            currentType={docWatermark} 
            onChange={handleWatermarkChange} 
          />

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

      {/* ÁREA DA FOLHA A4 TÁTIL MILIMÉTRICA (210mm x 297mm) */}
      <div className="flex justify-center w-full overflow-x-auto py-2">
        <div
          ref={sheetRef}
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
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            position: 'relative'
          }}
        >
          {/* Marca d'Água Oficial em Camada Transparente */}
          <WatermarkOverlay 
            type={docWatermark} 
            opacity={activeContext?.watermarkOpacity} 
          />

          {/* LOGOTIPO NO MODO LIVRE (Arrastável / Drag & Drop em qualquer coordenada) */}
          {logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'free' && (
            <div
              onPointerDown={handleLogoPointerDown}
              onPointerMove={handleLogoPointerMove}
              onPointerUp={handleLogoPointerUp}
              onClick={e => {
                e.stopPropagation();
                setLogoSelected(true);
              }}
              className={`absolute select-none z-30 group touch-none cursor-move transition-shadow ${
                logoSelected ? 'ring-2 ring-sky-500 rounded p-1' : ''
              }`}
              style={{
                left: `${logoConfig.x ?? 4}%`,
                top: `${logoConfig.y ?? 3}%`,
              }}
            >
              <img 
                src={logoConfig.dataUrl} 
                alt="Logotipo Institucional" 
                className={`${getLogoSizeClass(logoConfig.size)} object-contain pointer-events-none drop-shadow-xs`}
              />

              {/* Controles Flutuantes da Logo (Visíveis na tela, ocultos na impressão) */}
              <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 bg-slate-900 text-white rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-tactile-lg text-[10px] whitespace-nowrap">
                <Move className="w-3 h-3 text-sky-400" />
                <span>Arraste para onde quiser</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeLogoPosition('top-center');
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] cursor-pointer"
                  title="Alinhar ao centro do topo"
                >
                  Centralizar
                </button>
              </div>
            </div>
          )}

          {/* CABEÇALHO HOSPITALAR / TIMBRADO TOTALMENTE EDITÁVEL EM TEMPO REAL */}
          {headerConfig.showHeader && (
            <header className="border-b-2 border-slate-900 pb-4 mb-6 relative z-10 transition-all">
              {/* Barra de Ferramentas Discreta do Cabeçalho (no-print) */}
              <div className="no-print mb-2 flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Pencil className="w-3 h-3 text-sky-600" />
                  <span>Cabeçalho Editável em Tempo Real (clique em qualquer texto para editar)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetHeaderFromProfile}
                    className="hover:text-sky-700 font-medium flex items-center gap-1 cursor-pointer"
                    title="Preencher com os dados do seu Perfil Médico cadastrado"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Puxar do Perfil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHeaderFieldChange('showHeader', false)}
                    className="hover:text-amber-600 font-medium flex items-center gap-1 cursor-pointer"
                    title="Ocultar cabeçalho (ideal se usar folha já timbrada)"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar Cabeçalho</span>
                  </button>
                </div>
              </div>

              {/* LOGOTIPO NO TOPO (Top-Left, Top-Center ou Top-Right) */}
              {logoConfig.dataUrl && logoConfig.visible && (logoConfig.position === 'top-left' || logoConfig.position === 'top-center' || logoConfig.position === 'top-right') && (
                <div className={`mb-3 flex relative group ${
                  logoConfig.position === 'top-center' ? 'justify-center' :
                  logoConfig.position === 'top-right' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className="relative">
                    <img 
                      src={logoConfig.dataUrl} 
                      alt="Logotipo da Instituição" 
                      className={`${getLogoSizeClass(logoConfig.size)} object-contain`}
                    />
                    {/* Alça rápida no-print para trocar posição ou tamanho */}
                    <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-0 bg-slate-900/90 text-white rounded-md px-2 py-0.5 flex items-center gap-1 text-[9px] z-20">
                      <button
                        type="button"
                        onClick={() => handleChangeLogoPosition('free')}
                        className="hover:text-sky-300 flex items-center gap-0.5 cursor-pointer"
                        title="Ativar modo livre e arrastar para qualquer lugar"
                      >
                        <Move className="w-2.5 h-2.5" />
                        <span>Mover</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleChangeLogoSize(logoConfig.size === 'sm' ? 'md' : logoConfig.size === 'md' ? 'lg' : 'sm')}
                        className="hover:text-sky-300 cursor-pointer"
                      >
                        Tamanho ({String(logoConfig.size).toUpperCase()})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                {/* Lado Esquerdo: Identificação Médica e Institucional Editáveis Inline */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2.5 mb-1">
                    {/* Logotipo integrado ao lado esquerdo OU Ícone de Saúde */}
                    {logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'header-left' ? (
                      <img 
                        src={logoConfig.dataUrl} 
                        alt="Logotipo" 
                        className={`${getLogoSizeClass(logoConfig.size)} object-contain shrink-0`}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-sky-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Nome do Médico Editável */}
                      <input
                        type="text"
                        value={headerConfig.doctorName || ''}
                        onChange={e => handleHeaderFieldChange('doctorName', e.target.value)}
                        placeholder="DR(A). MÉDICO(A)"
                        className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 leading-none w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition-all"
                        title="Clique para editar o nome do médico"
                      />

                      {/* CRM e RQE Editáveis */}
                      <input
                        type="text"
                        value={headerConfig.doctorCrm || ''}
                        onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                        placeholder="CRM-SP 000000 • RQE 0000"
                        className="text-xs font-bold text-sky-800 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition-all"
                        title="Clique para editar CRM e RQE"
                      />
                    </div>
                  </div>

                  {/* Especialidade Editável */}
                  <input
                    type="text"
                    value={headerConfig.doctorSpecialty || ''}
                    onChange={e => handleHeaderFieldChange('doctorSpecialty', e.target.value)}
                    placeholder="Especialidade Médica (Ex: Clínica Médica)"
                    className="text-xs font-semibold text-slate-700 font-sans w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition-all"
                    title="Clique para editar a especialidade"
                  />

                  {/* Nome da Instituição / Hospital / Clínica Editável */}
                  <input
                    type="text"
                    value={headerConfig.clinicName || ''}
                    onChange={e => handleHeaderFieldChange('clinicName', e.target.value)}
                    placeholder="Nome da Instituição ou Clínica de Atendimento"
                    className="text-[11px] font-medium text-slate-600 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition-all"
                    title="Clique para editar a instituição ou clínica"
                  />

                  {/* Endereço / CNES Editável */}
                  <input
                    type="text"
                    value={headerConfig.clinicAddress || ''}
                    onChange={e => handleHeaderFieldChange('clinicAddress', e.target.value)}
                    placeholder="Endereço e Informações de Contato"
                    className="text-[10px] text-slate-500 font-sans w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition-all"
                    title="Clique para editar o endereço"
                  />
                </div>

                {/* Lado Direito: Logo (header-right), Selo do Tipo de Documento & Data */}
                <div className="text-right flex flex-col items-end shrink-0 max-w-[220px]">
                  {logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'header-right' && (
                    <img 
                      src={logoConfig.dataUrl} 
                      alt="Logotipo" 
                      className={`${getLogoSizeClass(logoConfig.size)} object-contain mb-2`}
                    />
                  )}

                  {/* Badge Editável do Tipo de Documento */}
                  <input
                    type="text"
                    value={headerConfig.badgeText || ''}
                    onChange={e => handleHeaderFieldChange('badgeText', e.target.value)}
                    placeholder="TIPO DE DOCUMENTO"
                    className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-sans text-right hover:bg-slate-200/80 focus:bg-sky-50 focus:border-sky-500 outline-none transition-all w-full max-w-[200px]"
                    title="Clique para personalizar o tipo do documento (ex: RELATÓRIO MÉDICO, LAUDO, RECEITUÁRIO)"
                  />

                  {/* Data Editável */}
                  <input
                    type="text"
                    value={headerConfig.dateText || ''}
                    onChange={e => handleHeaderFieldChange('dateText', e.target.value)}
                    placeholder="Data de emissão"
                    className="text-[11px] text-slate-500 font-sans mt-1 text-right bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 rounded px-1 outline-none transition-all w-full"
                    title="Clique para editar a data de emissão"
                  />
                </div>
              </div>

              {/* Identificação Rápida do Paciente (Se houver) */}
              {headerConfig.showPatientBanner && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-sans text-slate-700">
                  {patient?.name ? (
                    <>
                      <span><strong>Paciente:</strong> {patient.name}</span>
                      {patient.documentNumber && <span><strong>Doc:</strong> {patient.documentNumber}</span>}
                      {patient.weightKg > 0 && <span><strong>Peso:</strong> {patient.weightKg} kg</span>}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={headerConfig.patientCustomText || ''}
                      onChange={e => handleHeaderFieldChange('patientCustomText', e.target.value)}
                      placeholder="Identificação do paciente (opcional: digite o nome e documento aqui)"
                      className="w-full text-xs text-slate-600 italic bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 rounded px-1 outline-none"
                    />
                  )}
                </div>
              )}
            </header>
          )}

          {/* ÁREA PRINCIPAL DO EDITOR (Tiptap WYSIWYG em Tempo Real) */}
          <div className="flex-1 w-full text-slate-900 relative z-10 py-1">
            <EditorContent editor={editor} />
          </div>

          {/* RODAPÉ CLÍNICO COM CARIMBO E ASSINATURA EDITÁVEIS */}
          {headerConfig.showFooter && (
            <footer className="border-t border-slate-300 pt-5 mt-6 flex flex-col items-center justify-center text-center font-sans relative z-10 group">
              <div className="w-72 border-b border-slate-400 mb-2" />

              {/* Nome do Médico na Assinatura */}
              <input
                type="text"
                value={headerConfig.footerDocName || headerConfig.doctorName || ''}
                onChange={e => handleHeaderFieldChange('footerDocName', e.target.value)}
                placeholder="Dr(a). Médico(a)"
                className="text-xs font-bold text-slate-900 uppercase text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 rounded px-1 outline-none transition-all w-80"
                title="Clique para editar o nome na assinatura"
              />

              {/* CRM na Assinatura */}
              <input
                type="text"
                value={headerConfig.footerCrm || headerConfig.doctorCrm || ''}
                onChange={e => handleHeaderFieldChange('footerCrm', e.target.value)}
                placeholder="Médico(a) — CRM-SP 00000"
                className="text-[11px] text-slate-600 font-semibold text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 rounded px-1 outline-none transition-all w-80 mt-0.5"
                title="Clique para editar CRM na assinatura"
              />

              {/* Especialidade na Assinatura */}
              <input
                type="text"
                value={headerConfig.footerSpecialty || headerConfig.doctorSpecialty || ''}
                onChange={e => handleHeaderFieldChange('footerSpecialty', e.target.value)}
                placeholder="Especialidade"
                className="text-[11px] text-slate-500 font-medium text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 rounded px-1 outline-none transition-all w-80"
                title="Clique para editar a especialidade no carimbo"
              />

              {/* Subtexto Regulamentar CFM */}
              <input
                type="text"
                value={headerConfig.footerSubtext || ''}
                onChange={e => handleHeaderFieldChange('footerSubtext', e.target.value)}
                className="text-[9px] text-slate-400 mt-1.5 text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 rounded px-1 outline-none transition-all w-full max-w-md"
              />

              {/* Botão no-print para Ocultar Rodapé */}
              <button
                type="button"
                onClick={() => handleHeaderFieldChange('showFooter', false)}
                className="no-print opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-amber-600 mt-1 flex items-center gap-1 transition-opacity cursor-pointer"
                title="Ocultar rodapé de assinatura"
              >
                <EyeOff className="w-2.5 h-2.5" />
                <span>Ocultar Rodapé</span>
              </button>
            </footer>
          )}
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
                  Modelos personalizados salvos e modelos de referência PresCMed
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
                  setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? currentModel.title : '');
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
                          Clique em &quot;Salvar Alterações&quot; na barra superior para guardar qualquer modelo editado.
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
                            <span>Carregar e Editar na Folha</span>
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
                      <span>Carregar e Personalizar</span>
                    </button>
                  </div>

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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                      <span>Carregar e Personalizar</span>
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
                  <span>Salvar Modelo</span>
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
            const updatedLogo: DocumentLogoConfig = {
              ...logoConfig,
              dataUrl,
              visible: true
            };
            setLogoConfig(updatedLogo);
            if (activeContext && onSaveContext) {
              await onSaveContext({
                ...activeContext,
                logoDataUrl: dataUrl
              });
            }
            if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
            showToast('Logotipo vetorial SVG aplicado com sucesso!');
          }}
        />
      )}
    </div>
  );
};

export default DocumentEditorView;
