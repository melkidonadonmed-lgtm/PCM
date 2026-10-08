import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent, Mark } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
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
  LayoutTemplate,
  Scissors,
  RefreshCw,
  Layers,
  ChevronLeft
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
  SavedDocument,
  DocumentOrientation,
  DocumentViaLayout,
  PrescriptionStyle
} from '../types';
import { db, initializeDefaultTemplates } from '../services/db';
import { PRESET_LOGOS } from '../data/presetAssets';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import LogoGeneratorModal from './LogoGeneratorModal';
import WatermarkOverlay from './WatermarkOverlay';
import WatermarkSelector from './WatermarkSelector';

export const DEFAULT_PRESCRIPTION_STYLES: PrescriptionStyle[] = [
  {
    id: 'padrao_simples',
    name: 'Receita Simples Ambulatorial (1 Via • Retrato)',
    fontFamilyId: 'jakarta',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none'
  },
  {
    id: 'especial_2vias',
    name: 'Controle Especial 2 Vias (Portaria 344/98 • Paisagem)',
    fontFamilyId: 'jakarta',
    baseFontSize: 10,
    pageOrientation: 'landscape',
    viaLayout: '2-vias',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none'
  },
  {
    id: 'sus',
    name: 'Receita SUS / Atenção Básica (1 Via • Retrato)',
    fontFamilyId: 'inter',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'sus_double'
  },
  {
    id: 'classico',
    name: 'Receita Clássica Nobre (Cormorant 12pt • Retrato)',
    fontFamilyId: 'cormorant',
    baseFontSize: 12,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none'
  },
  {
    id: 'hospitalar',
    name: 'Receita Hospitalar / Clínica (Jakarta 11pt • Retrato)',
    fontFamilyId: 'jakarta',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none'
  },
  {
    id: 'pre_timbrado',
    name: 'Papel Pré-Timbrado da Gráfica (Sem Cabeçalho/Rodapé)',
    fontFamilyId: 'inter',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: false,
    showFooter: false,
    watermarkType: 'none'
  }
];

// Extensão Tiptap Customizada para Sublinhado (Ctrl+U)
const CustomUnderline = Mark.create({
  name: 'underline',
  parseHTML() {
    return [
      { tag: 'u' },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: (style: any) => (typeof style === 'string' && style.includes('underline') ? {} : false),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      toggleUnderline: () => ({ commands }: any) => {
        return commands.toggleMark(this.name);
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => (this.editor as any).commands.toggleUnderline(),
    };
  },
});

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Serif' | 'Sans' | 'Mono';
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'cormorant', name: 'Cormorant Garamond (Clássica)', family: "'Cormorant Garamond', Georgia, serif", category: 'Serif' },
  { id: 'jakarta', name: 'Plus Jakarta Sans (Hospitalar)', family: "'Plus Jakarta Sans', sans-serif", category: 'Sans' },
  { id: 'roboto', name: 'Roboto (Google Docs)', family: "'Roboto', sans-serif", category: 'Sans' },
  { id: 'inter', name: 'Inter (Técnica / Neutra)', family: "'Inter', sans-serif", category: 'Sans' },
  { id: 'open-sans', name: 'Open Sans (Ambulatorial)', family: "'Open Sans', sans-serif", category: 'Sans' },
  { id: 'merriweather', name: 'Merriweather (Editorial / Serif)', family: "'Merriweather', Georgia, serif", category: 'Serif' },
  { id: 'lora', name: 'Lora (Elegante / Pericial)', family: "'Lora', Georgia, serif", category: 'Serif' },
  { id: 'montserrat', name: 'Montserrat (Moderna)', family: "'Montserrat', sans-serif", category: 'Sans' },
  { id: 'playfair', name: 'Playfair Display (Nobiliar)', family: "'Playfair Display', serif", category: 'Serif' },
  { id: 'arial', name: 'Arial (Padrão Universal)', family: 'Arial, Helvetica, sans-serif', category: 'Sans' },
  { id: 'times', name: 'Times New Roman (Pericial)', family: "'Times New Roman', Times, serif", category: 'Serif' },
  { id: 'courier', name: 'Courier Prime (Máquina)', family: "'Courier Prime', 'Courier New', monospace", category: 'Mono' }
];

interface DocumentEditorViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems?: PrescriptionItem[];
  onUpdatePrescriptionItems?: (items: PrescriptionItem[]) => void;
  activeContext: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
  onNavigateToPrint?: () => void;
  onOpenDoctorModal?: () => void;
  editorInitialSyncTrigger?: number;
  onNavigateBack?: () => void;
}

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  darkMode,
  doctor,
  patient,
  prescriptionItems = [],
  onUpdatePrescriptionItems,
  activeContext,
  onSaveContext,
  onOpenDoctorModal,
  editorInitialSyncTrigger = 0,
  onNavigateBack,
}) => {
  // Tipografia, Tamanho e Orientação da Folha A4
  const [fontFamilyId, setFontFamilyId] = useState<string>('cormorant');
  const [baseFontSize, setBaseFontSize] = useState<number>(11);
  const [pageOrientation, setPageOrientation] = useState<DocumentOrientation>('portrait');
  const [viaLayout, setViaLayout] = useState<DocumentViaLayout>('1-via');
  const [drawerTab, setDrawerTab] = useState<'padrao' | 'salvos' | 'estilos'>('padrao');
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [editorDomHtml, setEditorDomHtml] = useState<string>('');

  const selectedFont = useMemo(() => {
    return FONT_OPTIONS.find(f => f.id === fontFamilyId) || FONT_OPTIONS[0];
  }, [fontFamilyId]);

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
    visible: true,
    secondaryDataUrl: activeContext?.secondaryLogoDataUrl || undefined,
    secondaryPosition: 'header-right',
    secondarySize: 'md',
    secondaryVisible: true
  });
  const [activeLogoTab, setActiveLogoTab] = useState<'left' | 'right'>('left');
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const [secondaryLogoUploading, setSecondaryLogoUploading] = useState(false);
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

  // Estados para Estilos de Receita Salvos pelo Médico
  const [customStyles, setCustomStyles] = useState<PrescriptionStyle[]>(() => {
    try {
      const raw = localStorage.getItem('prescmed_custom_styles');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);
  const [newStyleTitle, setNewStyleTitle] = useState('');

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

  const handleSaveCustomStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleTitle.trim()) return;
    const newStyle: PrescriptionStyle = {
      id: 'style-' + Date.now(),
      name: newStyleTitle.trim(),
      fontFamilyId,
      baseFontSize,
      pageOrientation,
      viaLayout,
      showHeader: headerConfig.showHeader ?? true,
      showFooter: headerConfig.showFooter ?? true,
      watermarkType: docWatermark,
      isCustom: true
    };
    const updated = [...customStyles, newStyle];
    setCustomStyles(updated);
    try {
      localStorage.setItem('prescmed_custom_styles', JSON.stringify(updated));
    } catch (err) {
      console.error('Falha ao salvar estilo no localStorage:', err);
    }
    setIsSaveStyleModalOpen(false);
    setNewStyleTitle('');
    showToast(`Estilo "${newStyle.name}" salvo com sucesso!`);
  };

  const handleDeleteCustomStyle = (id: string, name: string) => {
    if (!confirm(`Deseja remover o estilo personalizado "${name}"?`)) return;
    const updated = customStyles.filter(s => s.id !== id);
    setCustomStyles(updated);
    try {
      localStorage.setItem('prescmed_custom_styles', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast(`Estilo "${name}" removido.`);
  };

  const handleApplyStyle = (st: PrescriptionStyle) => {
    setFontFamilyId(st.fontFamilyId);
    setBaseFontSize(st.baseFontSize);
    setPageOrientation(st.pageOrientation);
    setViaLayout(st.viaLayout);
    setHeaderConfig(prev => ({
      ...prev,
      showHeader: st.showHeader,
      showFooter: st.showFooter,
      badgeText: st.viaLayout === '2-vias' ? 'RECEITUÁRIO DE CONTROLE ESPECIAL' : prev.badgeText
    }));
    handleWatermarkChange(st.watermarkType);
    if (editor) triggerAutoSave(editor);
    showToast(`Estilo "${st.name}" aplicado!`);
  };

  // Formatador da lista de medicamentos prescritos na consulta ativa
  const formatPrescriptionItemsList = useCallback((items: PrescriptionItem[]): string => {
    if (!items || items.length === 0) {
      return '<p><em>(Nenhum medicamento registrado na aba de prescrição)</em></p>';
    }
    return items.map((item, idx) => {
      const presLower = (item.presentation || '').toLowerCase();
      const qtdLower = (item.quantity || '').toLowerCase();
      const showPres = item.presentation && presLower !== qtdLower && !presLower.includes('caixa') && presLower !== 'uso oral' && !qtdLower.includes(presLower);
      const presLabel = showPres ? ` (${item.presentation})` : '';
      return `
        <p><strong>${idx + 1}. ${item.name}${presLabel}</strong> (${item.route}) -------------------- ${item.quantity}</p>
        <p style="margin-left: 20px;">${item.instructions}</p>
      `;
    }).join('<p><br></p>');
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



  const initialContent = `
    <p style="text-align: center;"><strong>RECEITUÁRIO MÉDICO</strong></p>
    <p></p>
    <p><strong>1. Amoxicilina 500mg</strong> ------------------------------------------------ 1 caixa</p>
    <p style="margin-left: 20px;">Tomar 1 cápsula por via oral a cada 8 horas durante 7 dias.</p>
    <p></p>
    <p><strong>2. Dipirona 500mg/mL (Gotas)</strong> ---------------------------------- 1 frasco</p>
    <p style="margin-left: 20px;">Tomar 30 a 40 gotas por via oral até de 6 em 6 horas se febre ou dor.</p>
    <p></p>
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
          typography: fontFamilyId,
          fontSize: baseFontSize,
          orientation: pageOrientation,
          viaLayout: viaLayout,
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
  }, [headerConfig, logoConfig, fontFamilyId, baseFontSize, pageOrientation, viaLayout, currentModel.title]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomUnderline,
      Placeholder.configure({
        placeholder: 'Digite ou cole o texto da receita médica, laudo ou parecer clínico livre aqui...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] leading-relaxed text-inherit selection:bg-sky-200 dark:selection:bg-sky-800'
      }
    },
    onUpdate: ({ editor: ed }) => {
      setEditorHtml(ed.getHTML());
      if (ed.view?.dom) {
        setEditorDomHtml(ed.view.dom.innerHTML);
      }
      triggerAutoSave(ed);
    }
  });

  // Mantém editorDomHtml continuamente sincronizado com o DOM real do TipTap para espelhamento perfeito na 2ª via
  useEffect(() => {
    if (editor?.view?.dom) {
      setEditorDomHtml(editor.view.dom.innerHTML);
    }
  }, [editorHtml, editor]);

  const [activeLoadedRecipeType, setActiveLoadedRecipeType] = useState<'special' | 'simple' | null>(null);

  const specialPrescriptionItems = useMemo(
    () => (prescriptionItems || []).filter(i => isSpecialControlOrAntibiotic(i)),
    [prescriptionItems]
  );
  const simplePrescriptionItems = useMemo(
    () => (prescriptionItems || []).filter(i => !isSpecialControlOrAntibiotic(i)),
    [prescriptionItems]
  );
  const hasBothPrescriptionTypesInEditor = specialPrescriptionItems.length > 0 && simplePrescriptionItems.length > 0;

  // Construtor e carregador completo da receita médica em tempo real com segregação inteligente
  const handleLoadActivePrescription = useCallback((showToastMsg = true, targetMode: 'auto' | 'special' | 'simple' = 'auto') => {
    if (!editor) return;

    const allItems = prescriptionItems || [];
    const specialItems = allItems.filter(i => isSpecialControlOrAntibiotic(i));
    const simpleItems = allItems.filter(i => !isSpecialControlOrAntibiotic(i));

    let effectiveMode: 'special' | 'simple' = 'simple';
    if (targetMode === 'special') {
      effectiveMode = 'special';
    } else if (targetMode === 'simple') {
      effectiveMode = 'simple';
    } else {
      // Prioridade sanitária: se houver antimicrobianos ou substâncias controladas, abre em 2 vias
      effectiveMode = specialItems.length > 0 ? 'special' : 'simple';
    }

    const isSpecial = effectiveMode === 'special';
    const itemsToLoad = isSpecial
      ? (specialItems.length > 0 ? specialItems : allItems)
      : (simpleItems.length > 0 ? simpleItems : allItems);

    setActiveLoadedRecipeType(isSpecial ? 'special' : 'simple');

    const pName = patient?.name?.trim() || '______________________________';
    const pDoc = patient?.documentNumber ? ` • Doc: ${patient.documentNumber}` : '';
    const pAge = patient?.ageText || (patient?.birthDate ? ` • Idade: ${patient.ageText || patient.birthDate}` : '');
    const pWeight = patient?.weightKg > 0 ? ` • Peso: ${patient.weightKg} kg` : '';
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Ajuste regulamentar inteligente: Se for controle especial, define 2 vias e paisagem!
    if (isSpecial) {
      setViaLayout('2-vias');
      setPageOrientation('landscape');
      setBaseFontSize(10);
    } else {
      setViaLayout('1-via');
      setPageOrientation('portrait');
      setBaseFontSize(11);
    }

    const itemsHtml = itemsToLoad && itemsToLoad.length > 0
      ? itemsToLoad.map((item, idx) => {
          const route = item.route ? `(${item.route})` : '';
          const presLower = (item.presentation || '').toLowerCase();
          const qtdLower = (item.quantity || '').toLowerCase();
          const showPres = item.presentation && presLower !== qtdLower && !presLower.includes('caixa') && presLower !== 'uso oral' && !qtdLower.includes(presLower);
          const presentation = showPres ? ` (${item.presentation})` : '';
          const quantity = item.quantity ? ` ----------------- ${item.quantity}` : '';
          const instructions = item.instructions || 'Conforme orientação médica.';
          const times = item.scheduleTimes && item.scheduleTimes.length > 0
            ? `<br><span style="font-size: 0.9em; color: #475569;">Horários recomendados: ${item.scheduleTimes.join(' — ')}</span>`
            : '';

          return `
            <p><strong>${idx + 1}. ${item.name}${presentation}</strong> ${route}${quantity}</p>
            <p style="margin-left: 20px;">${instructions}${times}</p>
            <p></p>
          `;
        }).join('')
      : `
          <p><strong>1. </strong></p>
          <p style="margin-left: 20px; color: #64748b;"><em>(Digite a posologia ou adicione medicamentos na consulta)</em></p>
          <p></p>
        `;

    // Evita duplicidade: se o banner de identificação de paciente no cabeçalho estiver ativo, não repete no corpo
    const patientLineHtml = headerConfig.showPatientBanner
      ? ''
      : `<p><strong>Paciente:</strong> ${pName}${pDoc}${pAge}${pWeight}</p><p></p>`;

    const newHtml = `
      <p style="text-align: center;"><strong>${isSpecial ? 'RECEITUÁRIO DE CONTROLE ESPECIAL' : 'RECEITUÁRIO MÉDICO'}</strong></p>
      <p></p>
      ${patientLineHtml}
      <p><strong>USO INTERNO / PRESCRIÇÃO:</strong></p>
      <p></p>
      ${itemsHtml}
      <p><strong>Orientações Gerais:</strong> Seguir rigorosamente a posologia prescrita. Manter boa hidratação oral e retornar para reavaliação clínica se houver persistência dos sintomas.</p>
    `;

    editor.commands.setContent(newHtml);
    setEditorHtml(newHtml);
    setHeaderConfig(prev => ({
      ...prev,
      showHeader: true,
      showFooter: true,
      showPatientBanner: true,
      badgeText: isSpecial ? 'RECEITUÁRIO DE CONTROLE ESPECIAL' : 'RECEITUÁRIO MÉDICO',
      dateText: today
    }));

    setCurrentModel({
      id: null,
      title: isSpecial ? 'Receita de Controle Especial (Consulta)' : 'Receita Médica (Consulta)',
      isPreset: false
    });

    isDraftRestoredRef.current = true;
    triggerAutoSave(editor);
    if (showToastMsg) {
      showToast(isSpecial ? 'Receita de Controle Especial (2 Vias • Paisagem) carregada no editor!' : 'Receita médica comum (1 Via • Retrato) carregada no editor!');
    }
  }, [editor, prescriptionItems, patient, headerConfig.showPatientBanner, triggerAutoSave]);

  // Gatilho externo: Navegar para o Editor a partir da aba de prescrição
  const lastTriggerRef = useRef(0);
  useEffect(() => {
    if (editor && editorInitialSyncTrigger && editorInitialSyncTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = editorInitialSyncTrigger;
      handleLoadActivePrescription(true);
    }
  }, [editor, editorInitialSyncTrigger, handleLoadActivePrescription]);

  // Carregar rascunho existente do IndexedDB OU carregar consulta ativa na inicialização
  useEffect(() => {
    if (!editor) return;

    let isMounted = true;
    const restoreDraft = async () => {
      // Prioridade clínica máxima: se houver itens prescritos na consulta ativa ou gatilho de sincronização, carrega a receita atual
      if ((prescriptionItems && prescriptionItems.length > 0) || (editorInitialSyncTrigger && editorInitialSyncTrigger > 0)) {
        if (editorInitialSyncTrigger) {
          lastTriggerRef.current = editorInitialSyncTrigger;
        }
        if (isMounted) {
          handleLoadActivePrescription(false);
          isDraftRestoredRef.current = true;
        }
        return;
      }

      try {
        const draft = await db.savedDocuments.get('draft-current');
        if (isMounted) {
          if (draft && (draft.contentJson || draft.contentHtml)) {
            if (draft.contentJson) {
              editor.commands.setContent(draft.contentJson);
              setEditorHtml(draft.contentHtml || '');
            } else {
              editor.commands.setContent(draft.contentHtml);
              setEditorHtml(draft.contentHtml || '');
            }
            if (draft.headerConfig) {
              setHeaderConfig(draft.headerConfig);
            }
            if (draft.logoConfig) {
              setLogoConfig(draft.logoConfig);
            }
            if (draft.typography) {
              if (draft.typography === 'serif') setFontFamilyId('cormorant');
              else if (draft.typography === 'sans') setFontFamilyId('jakarta');
              else if (draft.typography === 'inter') setFontFamilyId('inter');
              else setFontFamilyId(draft.typography);
            }
            if (draft.fontSize) {
              setBaseFontSize(draft.fontSize);
            }
            if (draft.orientation) {
              setPageOrientation(draft.orientation);
            }
            if (draft.viaLayout) {
              setViaLayout(draft.viaLayout);
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
            // Se não houver rascunho e houver prescrição ativa, já carrega a prescrição!
            if (prescriptionItems && prescriptionItems.length > 0) {
              handleLoadActivePrescription(false);
            } else {
              editor.commands.setContent(initialContent);
              setEditorHtml(initialContent);
              setHeaderConfig(buildDefaultHeader());
              setSaveStatus('idle');
            }
          }
        }
      } catch (err) {
        console.error('Erro ao ler rascunho do IndexedDB:', err);
        if (isMounted) {
          editor.commands.setContent(initialContent);
          setEditorHtml(initialContent);
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
  }, [editor, buildDefaultHeader, editorInitialSyncTrigger, handleLoadActivePrescription, prescriptionItems, initialContent]);

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

  // Sincronização inteligente do HTML do Editor de volta para os medicamentos da consulta ativa
  const syncWithActivePrescription = useCallback(() => {
    if (!editor || !onUpdatePrescriptionItems) return;
    try {
      const currentHtml = editor.getHTML();
      if (!currentHtml || !currentHtml.trim()) return;
      const parsedItems = parsePrescriptionHtmlToItems(currentHtml, prescriptionItems);
      if (parsedItems && parsedItems.length > 0) {
        onUpdatePrescriptionItems(parsedItems);
      }
    } catch (err) {
      console.warn('[PresCMed] Falha ao sincronizar HTML do editor com a receita ativa:', err);
    }
  }, [editor, onUpdatePrescriptionItems, prescriptionItems]);

  // Ação: Salvar alterações na receita da consulta E no modelo
  const handleSaveModelDirectly = async () => {
    if (!editor) return;

    // 1. Sincroniza sempre com a receita da consulta ativa
    syncWithActivePrescription();

    // 2. Dispara auto-save do rascunho
    triggerAutoSave(editor);

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
          typography: fontFamilyId,
          fontSize: baseFontSize,
          orientation: pageOrientation,
          viaLayout: viaLayout,
          createdAt: now,
          updatedAt: now
        };
        await db.savedDocuments.put(updatedDoc);
        await loadSavedTemplates();
        setSaveStatus('saved');
        setLastSavedTime(
          new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        showToast(`Receita e modelo "${currentModel.title}" atualizados com sucesso!`);
      } catch (err) {
        console.error('Erro ao atualizar modelo existente:', err);
        alert('Falha ao atualizar modelo no banco local.');
      }
    } else {
      // Documento da consulta ou rascunho sem ID: confirma salvamento e sincronização com a receita
      setSaveStatus('saved');
      setLastSavedTime(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      showToast('Receita médica salva e sincronizada com a consulta!');
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
        typography: fontFamilyId,
        fontSize: baseFontSize,
        orientation: pageOrientation,
        viaLayout: viaLayout,
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
      const interpolated = interpolateMedicalTags(tpl.contentHtml);
      editor.commands.setContent(interpolated);
      setEditorHtml(interpolated);
    } else if (tpl.contentJson) {
      editor.commands.setContent(tpl.contentJson);
      setEditorHtml(tpl.contentHtml || '');
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
      if (tpl.typography === 'serif') setFontFamilyId('cormorant');
      else if (tpl.typography === 'sans') setFontFamilyId('jakarta');
      else if (tpl.typography === 'inter') setFontFamilyId('inter');
      else setFontFamilyId(tpl.typography);
    }

    if (tpl.fontSize) {
      setBaseFontSize(tpl.fontSize);
    }

    if (tpl.orientation) {
      setPageOrientation(tpl.orientation);
    }

    if (tpl.viaLayout) {
      setViaLayout(tpl.viaLayout);
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

  // Ação: Aplicar estilo visual de receita médica
  const handleApplyStylePreset = (styleId: 'classico' | 'hospitalar' | 'sus' | 'especial_2vias' | 'pre_timbrado') => {
    if (styleId === 'classico') {
      setFontFamilyId('cormorant');
      setBaseFontSize(12);
      setPageOrientation('portrait');
      setViaLayout('1-via');
      setHeaderConfig(prev => ({ ...prev, showHeader: true, showFooter: true }));
      setLogoConfig(prev => ({ ...prev, position: 'top-center', visible: true }));
      showToast('Estilo Clássico Nobre aplicado!');
    } else if (styleId === 'hospitalar') {
      setFontFamilyId('jakarta');
      setBaseFontSize(11);
      setPageOrientation('portrait');
      setViaLayout('1-via');
      setHeaderConfig(prev => ({ ...prev, showHeader: true, showFooter: true }));
      setLogoConfig(prev => ({ ...prev, position: 'top-left', visible: true }));
      showToast('Estilo Hospitalar Moderno aplicado!');
    } else if (styleId === 'sus') {
      setFontFamilyId('inter');
      setBaseFontSize(11);
      setPageOrientation('portrait');
      setViaLayout('1-via');
      setHeaderConfig(prev => ({ ...prev, showHeader: true, showFooter: true }));
      handleWatermarkChange('sus_double');
      showToast("Estilo SUS / Atenção Básica aplicado!");
    } else if (styleId === 'especial_2vias') {
      setFontFamilyId('jakarta');
      setBaseFontSize(10);
      setPageOrientation('landscape');
      setViaLayout('2-vias');
      setHeaderConfig(prev => ({ ...prev, showHeader: true, showFooter: true, badgeText: 'RECEITUÁRIO DE CONTROLE ESPECIAL' }));
      showToast('Estilo Receita Especial de 2 Vias (Paisagem) aplicado!');
    } else if (styleId === 'pre_timbrado') {
      setHeaderConfig(prev => ({ ...prev, showHeader: false, showFooter: false }));
      setLogoConfig(prev => ({ ...prev, visible: false }));
      showToast('Estilo Folha Pré-Timbrada: Cabeçalho e rodapé ocultados!');
    }
    setIsModelsDrawerOpen(false);
    if (editor) triggerAutoSave(editor);
  };

  // Ação: Iniciar novo documento em branco
  const handleStartNewDocument = () => {
    if (!editor) return;
    if (confirm('Deseja iniciar um novo documento em branco na folha A4?')) {
      editor.commands.setContent('<p><br></p>');
      setEditorHtml('<p><br></p>');
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
      | 'receita_especial'
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

    if (type === 'receita_especial') {
      presetTitle = 'Receituário de Controle Especial (Portaria 344/98)';
      badge = 'RECEITUÁRIO DE CONTROLE ESPECIAL';
      setViaLayout('2-vias');
      setPageOrientation('landscape');
      setBaseFontSize(10);
      templateHtml = `
        <p style="text-align: center;"><strong>RECEITUÁRIO DE CONTROLE ESPECIAL</strong></p>
        <p><br></p>
        <p><strong>Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc}</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO MEDICAMENTOSA (PORTARIA SVS/MS 344/98):</strong></p>
        <p><strong>1. Clonazepam 2,5 mg/mL (Gotas)</strong> (Uso Oral) ---------------- 01 frasco (vinte mL)</p>
        <p style="margin-left: 20px;">Pingar 05 (cinco) gotas por via oral às 21:00 horas se insônia severa.</p>
        <p><br></p>
        <p><strong>2. Sertralina 50 mg (Comprimidos)</strong> (Uso Oral) ------------ 60 comprimidos (sessenta)</p>
        <p style="margin-left: 20px;">Tomar 01 (um) comprimido por via oral pela manhã, após o café, diariamente durante 60 dias.</p>
        <p><br></p>
        <p><strong>Orientações:</strong> Validade de 30 dias a contar da emissão. 1ª via retida na farmácia e 2ª via devolvida ao paciente orientada.</p>
      `;
    } else if (type === 'laudo_com_receita') {
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
      setViaLayout('1-via');
      setPageOrientation('portrait');
      setBaseFontSize(12);
      templateHtml = initialContent;
    }

    const interpolated = interpolateMedicalTags(templateHtml);
    editor.commands.setContent(interpolated);
    setEditorHtml(interpolated);
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
    if (!medicoConfigurado(doctor)) {
      if (onOpenDoctorModal) {
        onOpenDoctorModal();
      }
      showToast('Configure o nome e CRM do médico emitente para imprimir ou gerar PDF.');
      return;
    }
    // Injeta estilo dinâmico de orientação no documento
    const styleId = 'prescmed-dynamic-print-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @page {
        size: A4 ${pageOrientation};
        margin: 6mm;
      }
    `;

    if (pageOrientation === 'landscape') {
      document.body.classList.add('print-landscape');
      document.body.classList.remove('print-portrait');
    } else {
      document.body.classList.add('print-portrait');
      document.body.classList.remove('print-landscape');
    }

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

  // Remover logotipo principal / esquerdo
  const handleRemoveLogo = async () => {
    if (confirm('Deseja remover o logotipo esquerdo deste documento?')) {
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
      showToast('Logotipo esquerdo removido.');
    }
  };

  // Upload de imagem para Logotipo Secundário (Direito)
  const handleSecondaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    setSecondaryLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const updatedLogo: DocumentLogoConfig = {
        ...logoConfig,
        secondaryDataUrl: dataUrl,
        secondaryVisible: true,
        secondaryPosition: logoConfig.secondaryPosition || 'header-right',
        secondarySize: logoConfig.secondarySize || 'md'
      };
      setLogoConfig(updatedLogo);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          secondaryLogoDataUrl: dataUrl
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
      setSecondaryLogoUploading(false);
      showToast('Logotipo direito aplicado com sucesso!');
    };
    reader.onerror = () => {
      setSecondaryLogoUploading(false);
      alert('Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  // Aplicar Preset no Logotipo Secundário (Direito)
  const handleApplySecondaryPresetLogo = async (dataUrl: string, name: string) => {
    const updatedLogo: DocumentLogoConfig = {
      ...logoConfig,
      secondaryDataUrl: dataUrl,
      secondaryVisible: true,
      secondaryPosition: 'header-right',
      secondarySize: logoConfig.secondarySize || 'md'
    };
    setLogoConfig(updatedLogo);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        secondaryLogoDataUrl: dataUrl
      });
    }
    if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
    showToast(`Logotipo direito "${name}" aplicado!`);
  };

  // Alterar Tamanho do Logotipo Secundário (Direito)
  const handleChangeSecondaryLogoSize = (secondarySize: 'sm' | 'md' | 'lg' | 'xl') => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      secondarySize
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
  };

  // Remover Logotipo Secundário (Direito)
  const handleRemoveSecondaryLogo = async () => {
    if (confirm('Deseja remover o logotipo direito deste documento?')) {
      const updated: DocumentLogoConfig = {
        ...logoConfig,
        secondaryDataUrl: undefined,
        secondaryVisible: false
      };
      setLogoConfig(updated);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          secondaryLogoDataUrl: undefined
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updated);
      showToast('Logotipo direito removido.');
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
    <div className={`flex flex-col gap-4 mx-auto w-full pb-16 transition ${pageOrientation === 'landscape' ? 'max-w-[1240px]' : 'max-w-5xl'}`} onClick={() => setLogoSelected(false)}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-tab-fade no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR: Contexto do Modelo Ativo & Ações Rápidas (Ilha Tátil Mineral) */}
      <div className="no-print bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-tactile-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[260px]">
          {onNavigateBack && (
            <button
              type="button"
              onClick={() => {
                syncWithActivePrescription();
                onNavigateBack();
              }}
              className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
              title="Sincronizar e voltar à tela de montagem de receitas"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Voltar à Receita</span>
            </button>
          )}

          {/* Chip do Modelo Ativo */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs shrink-0 whitespace-nowrap">
            <LayoutTemplate className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
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
                  className="px-2 py-0.5 text-xs font-bold rounded border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentModelTitle}
                  className="p-1 rounded bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
                  title="Salvar título"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingModelTitle(false)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer text-slate-500"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--text-main)] truncate max-w-[240px]">
                  {currentModel.title}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempModelTitle(currentModel.title);
                    setIsEditingModelTitle(true);
                  }}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors"
                  title="Renomear este modelo"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Indicador de Status Local-First */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0 whitespace-nowrap">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                <span className="hidden sm:inline">Salvando...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Salvo localmente {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Edição em Tempo Real</span>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação de Impressão e Modelo */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Botão de Impressão Direta A4 Superior (Alta visibilidade) */}
          <button
            type="button"
            onClick={handlePrint}
            className={`btn-tactile-primary h-9 px-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-tactile-btn transition active:scale-95 shrink-0 whitespace-nowrap ${
              !medicoConfigurado(doctor) ? 'ring-1 ring-amber-400/50' : ''
            }`}
            title={medicoConfigurado(doctor) ? 'Imprimir folha A4 milimétrica ou salvar como PDF' : 'Clique para configurar o médico emitente e imprimir'}
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir A4 / PDF</span>
            {!medicoConfigurado(doctor) && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded font-bold">
                Configurar
              </span>
            )}
          </button>

          {/* Botão SALVAR NA RECEITA (Salva documento e sincroniza diretamente com a consulta ativa) */}
          <button
            type="button"
            onClick={handleSaveModelDirectly}
            className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none shrink-0 whitespace-nowrap"
            title="Salvar alterações no documento e sincronizar diretamente com a receita ativa da consulta"
          >
            <Save className="w-4 h-4" />
            <span>Salvar na Receita</span>
          </button>

          {/* Botão Salvar como Novo Modelo */}
          <button
            type="button"
            onClick={() => {
              setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? `${currentModel.title} (Cópia)` : '');
              setIsSaveModelModalOpen(true);
            }}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap"
            title="Criar um novo modelo salvo a partir deste documento"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Salvar como Novo</span>
          </button>

          {/* Botão Biblioteca de Modelos */}
          <button
            type="button"
            onClick={() => setIsModelsDrawerOpen(true)}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap"
            title="Abrir biblioteca de modelos clínicos e laudos salvos"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Modelos</span>
            {savedTemplates.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                {savedTemplates.length}
              </span>
            )}
          </button>

          {/* Botão Novo em Branco */}
          <button
            type="button"
            onClick={handleStartNewDocument}
            className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer shadow-tactile-sm shrink-0"
            title="Iniciar novo documento em branco"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BARRA DE FERRAMENTAS DO EDITOR (Fixa / Sticky) */}
      <div 
        className="editor-toolbar no-print sticky top-[72px] sm:top-[76px] z-30 rounded-2xl p-2.5 sm:p-3 border backdrop-blur-md shadow-tactile-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
      >
        {/* Agrupamento 1: Formatação Tiptap & Estilo Docs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none touch-pan-x flex-nowrap shrink-0">
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
            className="bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Estilo de texto (Parágrafo ou Título)"
            aria-label="Estilo de texto"
          >
            <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="p">Texto Normal</option>
            <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h1">Título 1 (Grande)</option>
            <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h2">Título 2 (Médio)</option>
            <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="h3">Título 3 (Pequeno)</option>
          </select>

          {/* Ajuste Fino do Tamanho da Fonte (Docs Style: [-] 11 pt [+]) */}
          <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] px-1 py-0.5 text-xs">
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
              className="bg-transparent text-[var(--text-main)] px-1 py-0.5 font-bold text-center text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer"
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

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5" />

          {/* Formatação básica: Negrito, Itálico, Sublinhado */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive('bold') 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
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
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive('italic') 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Itálico (Ctrl+I)"
            aria-label="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => (editor as any)?.chain().focus().toggleUnderline().run()}
            disabled={!editor}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              (editor as any)?.isActive('underline') 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Sublinhado (Ctrl+U)"
            aria-label="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5" />

          {/* Alinhamento de Texto */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive({ textAlign: 'left' }) 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
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
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive({ textAlign: 'center' }) 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
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
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive({ textAlign: 'right' }) 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
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
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive({ textAlign: 'justify' }) 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Justificar"
            aria-label="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5" />

          {/* Listas */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive('bulletList') 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
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
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              editor?.isActive('orderedList') 
                ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm font-bold' 
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
            }`}
            title="Lista Numerada"
            aria-label="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[var(--border-subtle)] mx-0.5" />

          {/* Desfazer / Refazer */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
            title="Desfazer (Ctrl+Z)"
            aria-label="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
            title="Refazer (Ctrl+Y)"
            aria-label="Refazer"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Agrupamento 2: Tipografia, Orientação, Vias, Cabeçalho, Carregar Consulta & Impressão */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none touch-pan-x flex-nowrap shrink-0">
          {/* Seletor Rápido de Estilo de Receita Atual */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2 py-1 text-xs">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Estilo:</span>
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const found = [...DEFAULT_PRESCRIPTION_STYLES, ...customStyles].find(s => s.id === val);
                if (found) handleApplyStyle(found);
              }}
              className="bg-transparent text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded text-xs max-w-[155px] truncate"
              title="Selecionar estilo visual da receita médica atual (1 via, 2 vias, SUS, clássico...)"
              aria-label="Selecionar estilo visual da receita"
            >
              <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="" disabled>Selecionar estilo...</option>
              <optgroup label="Estilos Padrão" className="bg-[var(--surface-card)] text-[var(--text-main)]">
                {DEFAULT_PRESCRIPTION_STYLES.map(s => (
                  <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={s.id} value={s.id}>{s.name}</option>
                ))}
              </optgroup>
              {customStyles.length > 0 && (
                <optgroup label="Meus Estilos Salvos" className="bg-[var(--surface-card)] text-[var(--text-main)]">
                  {customStyles.map(s => (
                    <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <button
              type="button"
              onClick={() => setIsSaveStyleModalOpen(true)}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-sky-600 dark:text-sky-400 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              title="Salvar configuração visual atual como novo estilo personalizado"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seletor Tipográfico Docs Style (12 fontes) */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <select
              value={fontFamilyId}
              onChange={(e) => {
                setFontFamilyId(e.target.value);
                if (editor) triggerAutoSave(editor);
              }}
              className="bg-transparent text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded text-xs max-w-[170px] truncate"
              aria-label="Família Tipográfica da Folha A4"
              title="Trocar fonte da receita médica estilo Google Docs"
            >
              {FONT_OPTIONS.map(f => (
                <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alternador de Orientação: Retrato / Paisagem */}
          <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-0.5 text-xs shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setPageOrientation('portrait')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                pageOrientation === 'portrait' ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Orientação Retrato (Vertical 210×297mm)"
            >
              <span>↕️</span>
              <span className="hidden xl:inline">Retrato</span>
            </button>
            <button
              type="button"
              onClick={() => setPageOrientation('landscape')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                pageOrientation === 'landscape' ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Orientação Paisagem (Horizontal 297×210mm — Ideal para 2 Vias)"
            >
              <span>↔️</span>
              <span className="hidden xl:inline">Paisagem</span>
            </button>
          </div>

          {/* Alternador de Vias: 1 Via / 2 Vias na Mesma Folha */}
          <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-0.5 text-xs shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setViaLayout('1-via')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                viaLayout === '1-via' ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Folha Única (1 Via Padrão)"
            >
              <span>📄</span>
              <span className="hidden xl:inline">1 Via</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViaLayout('2-vias');
                if (pageOrientation === 'portrait') {
                  setPageOrientation('landscape');
                  showToast('Modo 2 Vias ativado! Paisagem recomendada para imprimir as duas vias lado a lado.');
                }
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                viaLayout === '2-vias' ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="2 Vias na Mesma Folha (1ª Via Farmácia + 2ª Via Paciente — Portaria 344/98)"
            >
              <span>📑</span>
              <span className="hidden xl:inline">2 Vias (Mesma Folha)</span>
            </button>
          </div>

          {/* Alternador de Visibilidade do Cabeçalho */}
          <button
            type="button"
            onClick={() => handleHeaderFieldChange('showHeader', !headerConfig.showHeader)}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              headerConfig.showHeader
                ? 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)]'
                : 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
            }`}
            title={headerConfig.showHeader ? "Cabeçalho visível. Clique para ocultar (ideal para papel já timbrado)" : "Cabeçalho ocultado. Clique para restaurar"}
          >
            {headerConfig.showHeader ? <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
            <span className="hidden sm:inline">Cabeçalho</span>
            <span className="text-[10px] opacity-75">({headerConfig.showHeader ? 'Sim' : 'Não'})</span>
          </button>

          {/* Alternador de Visibilidade do Rodapé */}
          <button
            type="button"
            onClick={() => handleHeaderFieldChange('showFooter', !headerConfig.showFooter)}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
              headerConfig.showFooter
                ? 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)]'
                : 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
            }`}
            title={headerConfig.showFooter ? "Rodapé de carimbo visível. Clique para ocultar" : "Rodapé ocultado. Clique para restaurar"}
          >
            {headerConfig.showFooter ? <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">Rodapé</span>
            <span className="text-[10px] opacity-75">({headerConfig.showFooter ? 'Sim' : 'Não'})</span>
          </button>

          {/* Botão CARREGAR RECEITA ATUAL */}
          <button
            type="button"
            onClick={() => handleLoadActivePrescription(true)}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            title="Preencher a folha A4 com os dados do paciente e medicamentos prescritos nesta consulta"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Carregar Receita Atual</span>
            <span className="sm:hidden">Receita</span>
            {prescriptionItems && prescriptionItems.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                {prescriptionItems.length}
              </span>
            )}
          </button>

          {/* MENU / CONTROLE DE LOGOTIPO (Mudar de lugar, carregar, redimensionar) */}
          <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLogoMenuOpen(prev => !prev)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                (logoConfig.dataUrl && logoConfig.visible) || (logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false)
                  ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-[var(--text-main)] font-bold'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
              }`}
              title="Configurar logotipos (esquerdo e direito) no timbrado A4"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Logotipo</span>
              {(logoConfig.dataUrl || logoConfig.secondaryDataUrl) && (
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-bold uppercase">
                  {logoConfig.dataUrl && logoConfig.secondaryDataUrl ? 'Duplo' : '1 Logo'}
                </span>
              )}
            </button>

            {/* Dropdown de Gestão do Logotipo com Abas: Esquerdo e Direito */}
            {isLogoMenuOpen && (
              <div className="absolute right-0 top-11 w-84 sm:w-90 bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-2xl shadow-tactile-lg p-4 z-50 flex flex-col gap-3 animate-tab-fade">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <h4 className="text-xs font-bold">Timbrado / Logotipos</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLogoMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Seletor de Abas: Esquerda vs Direita */}
                <div className="flex items-center p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('left')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                      activeLogoTab === 'left'
                        ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span>⇱ Logo Esquerdo</span>
                    {logoConfig.dataUrl && logoConfig.visible && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Logo esquerdo ativo" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('right')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                      activeLogoTab === 'right'
                        ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span>Logo Direito ⇲</span>
                    {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Logo direito ativo" />
                    )}
                  </button>
                </div>

                {/* CONTEÚDO DA ABA ESQUERDA */}
                {activeLogoTab === 'left' && (
                  <div className="space-y-3">
                    {/* Posição do Logo Esquerdo */}
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                        Posição do Logo Esquerdo:
                      </label>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleChangeLogoPosition('header-left')}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                            logoConfig.position === 'header-left' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          <span className="text-xs">🏢</span>
                          <span className="text-[10px]">Header Esq.</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeLogoPosition('top-left')}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                            logoConfig.position === 'top-left' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          <span className="text-xs">⇱</span>
                          <span className="text-[10px]">Topo Esq.</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeLogoPosition('top-center')}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                            logoConfig.position === 'top-center' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          <span className="text-xs">⬌</span>
                          <span className="text-[10px]">Topo Centro</span>
                        </button>
                      </div>
                    </div>

                    {/* Tamanho do Logo Esquerdo */}
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                        Tamanho do Logo Esquerdo:
                      </label>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleChangeLogoSize(sz)}
                            className={`py-1 rounded-lg border text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                              logoConfig.size === sz 
                                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border-navy-800 dark:border-blue-400 font-bold shadow-tactile-sm' 
                                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            {sz.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ações: Upload, SVG, Presets */}
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
                          className="flex-1 py-1.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{logoUploading ? 'Carregando...' : 'Upload Logo Esq.'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsLogoMenuOpen(false);
                            setIsLogoGeneratorOpen(true);
                          }}
                          className="py-1.5 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                          title="Criar brasão vetorial SVG"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Criar SVG</span>
                        </button>
                      </div>

                      {/* Presets Rápidos */}
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block mb-1">Brasões Rápidos:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplyPresetLogo(PRESET_LOGOS.semusa.dataUrl, 'SEMUSA')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer"
                          >
                            SEMUSA
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sesau_ro.dataUrl, 'SESAU')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer"
                          >
                            SESAU
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sus.dataUrl, 'SUS')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer"
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
                          <span>Remover Logo Esquerdo</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* CONTEÚDO DA ABA DIREITA */}
                {activeLogoTab === 'right' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                      O logotipo secundário é exibido no canto superior direito do timbrado A4 (ao lado da data e selo do documento).
                    </p>

                    {/* Tamanho do Logo Direito */}
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                        Tamanho do Logo Direito:
                      </label>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleChangeSecondaryLogoSize(sz)}
                            className={`py-1 rounded-lg border text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                              (logoConfig.secondarySize || 'md') === sz 
                                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border-navy-800 dark:border-blue-400 font-bold shadow-tactile-sm' 
                                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            {sz.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ações: Upload, Presets */}
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                      <input
                        type="file"
                        ref={secondaryFileInputRef}
                        onChange={handleSecondaryLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => secondaryFileInputRef.current?.click()}
                        disabled={secondaryLogoUploading}
                        className="w-full py-1.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{secondaryLogoUploading ? 'Carregando...' : 'Upload Logo Direito (SUS / Clínica)'}</span>
                      </button>

                      {/* Presets Rápidos para o lado direito */}
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block mb-1">Logos Rápidos para a Direita:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sus.dataUrl, 'SUS')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer font-bold text-blue-600 dark:text-blue-400"
                          >
                            SUS
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sesau_ro.dataUrl, 'SESAU')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer"
                          >
                            SESAU
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.semusa.dataUrl, 'SEMUSA')}
                            className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-slate-400 text-center truncate cursor-pointer"
                          >
                            SEMUSA
                          </button>
                        </div>
                      </div>

                      {logoConfig.secondaryDataUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveSecondaryLogo}
                          className="py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover Logo Direito</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
            className={`btn-tactile-primary h-9 px-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer ${
              !medicoConfigurado(doctor) ? 'ring-1 ring-amber-400/50' : ''
            }`}
            title={medicoConfigurado(doctor) ? 'Imprimir folha A4 milimétrica ou salvar como PDF' : 'Clique para configurar o médico emitente e imprimir'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir A4</span>
            {!medicoConfigurado(doctor) && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded font-bold">
                Configurar
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SELETOR RÁPIDO ENTRE RECEITAS QUANDO HOUVER ITENS SIMPLES E ESPECIAIS NA MESMA CONSULTA */}
      {hasBothPrescriptionTypesInEditor && (
        <div className="no-print p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-tactile-sm">
          <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Segregação Sanitária:</span>
              <span className="ml-1 text-[11px] opacity-90">
                Esta consulta possui antimicrobianos/controlados e medicamentos comuns. Alterne a folha:
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleLoadActivePrescription(true, 'special')}
              className={`flex-1 sm:flex-initial h-8 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shadow-tactile-sm ${
                activeLoadedRecipeType === 'special'
                  ? 'bg-amber-600 text-white border border-amber-700'
                  : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>📑 Controle Especial ({specialPrescriptionItems.length} • 2 Vias)</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadActivePrescription(true, 'simple')}
              className={`flex-1 sm:flex-initial h-8 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shadow-tactile-sm ${
                activeLoadedRecipeType === 'simple'
                  ? 'bg-sky-600 text-white border border-sky-700'
                  : 'bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 hover:bg-sky-50'
              }`}
            >
              <span>📋 Receita Simples ({simplePrescriptionItems.length} • 1 Via)</span>
            </button>
          </div>
        </div>
      )}

      {/* ÁREA DA FOLHA A4 TÁTIL MILIMÉTRICA (210mm x 297mm) */}
      <div className="flex justify-center w-full overflow-x-auto py-2">
        <div
          ref={sheetRef}
          id="printable-a4-sheet"
          className={`a4-editor-canvas bg-white text-slate-900 rounded-lg shadow-2xl relative transition duration-200 ${
            pageOrientation === 'landscape' ? 'canvas-landscape' : 'canvas-portrait'
          } ${viaLayout === '2-vias' ? 'vias-2' : ''}`}
          style={{
            width: pageOrientation === 'landscape' ? '297mm' : '210mm',
            minHeight: pageOrientation === 'landscape' ? '210mm' : '297mm',
            padding: pageOrientation === 'landscape' ? '10mm 14mm' : '20mm',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            fontFamily: selectedFont.family,
            fontSize: `${baseFontSize}pt`
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

          {/* AVISO E RESTAURAÇÃO DE CABEÇALHO OCULTADO (no-print) */}
          {!headerConfig.showHeader && (
            <div className="no-print mb-4 p-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Cabeçalho Ocultado:</strong> A folha será impressa sem cabeçalho (ideal para papel timbrado físico).</span>
              </div>
              <button
                type="button"
                onClick={() => handleHeaderFieldChange('showHeader', true)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Restaurar Cabeçalho</span>
              </button>
            </div>
          )}

          {/* LAYOUT 1 VIA (FOLHA ÚNICA PADRÃO) */}
          {viaLayout === '1-via' && (
            <>
              {/* CABEÇALHO HOSPITALAR / TIMBRADO TOTALMENTE EDITÁVEL EM TEMPO REAL */}
              {headerConfig.showHeader && (
                <header className="border-b-2 border-slate-900 pb-4 mb-6 relative z-10 transition">
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
                        {logoConfig.dataUrl && logoConfig.visible && (logoConfig.position === 'header-left' || logoConfig.secondaryDataUrl || (!logoConfig.position && !logoConfig.secondaryDataUrl)) ? (
                          <div className="relative group shrink-0">
                            <img 
                              src={logoConfig.dataUrl} 
                              alt="Logotipo Principal / Esquerdo" 
                              className={`${getLogoSizeClass(logoConfig.size)} object-contain`}
                            />
                            <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-0 bg-slate-900/90 text-white rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[8px] z-20 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleChangeLogoSize(logoConfig.size === 'sm' ? 'md' : logoConfig.size === 'md' ? 'lg' : 'sm')}
                                className="hover:text-sky-300 cursor-pointer"
                              >
                                {String(logoConfig.size).toUpperCase()}
                              </button>
                            </div>
                          </div>
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
                            className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 leading-none w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center"
                            title="Clique para editar o nome do médico"
                          />

                          {/* CRM e RQE Editáveis */}
                          <input
                            type="text"
                            value={headerConfig.doctorCrm || ''}
                            onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                            placeholder="CRM-SP 000000 • RQE 0000"
                            className="text-xs font-bold text-sky-800 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center"
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
                        className="text-xs font-semibold text-slate-700 font-sans w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center"
                        title="Clique para editar a especialidade"
                      />

                      {/* Nome da Instituição / Hospital / Clínica Editável */}
                      <input
                        type="text"
                        value={headerConfig.clinicName || ''}
                        onChange={e => handleHeaderFieldChange('clinicName', e.target.value)}
                        placeholder="Nome da Instituição ou Clínica de Atendimento"
                        className="text-[11px] font-medium text-slate-600 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center"
                        title="Clique para editar a instituição ou clínica"
                      />

                      {/* Endereço / CNES Editável */}
                      <input
                        type="text"
                        value={headerConfig.clinicAddress || ''}
                        onChange={e => handleHeaderFieldChange('clinicAddress', e.target.value)}
                        placeholder="Endereço e Informações de Contato"
                        className="text-[10px] text-slate-500 font-sans w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center"
                        title="Clique para editar o endereço"
                      />
                    </div>

                    {/* Lado Direito: Logo (header-right ou secundário), Selo do Tipo de Documento & Data */}
                    <div className="text-right flex flex-col items-end shrink-0 max-w-[220px]">
                      {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false ? (
                        <div className="relative group mb-2">
                          <img 
                            src={logoConfig.secondaryDataUrl} 
                            alt="Logotipo Secundário / Direito" 
                            className={`${getLogoSizeClass(logoConfig.secondarySize || logoConfig.size)} object-contain`}
                          />
                          <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 right-0 bg-slate-900/90 text-white rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[8px] z-20 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleChangeSecondaryLogoSize(logoConfig.secondarySize === 'sm' ? 'md' : logoConfig.secondarySize === 'md' ? 'lg' : 'sm')}
                              className="hover:text-sky-300 cursor-pointer"
                            >
                              Tamanho ({String(logoConfig.secondarySize || logoConfig.size).toUpperCase()})
                            </button>
                          </div>
                        </div>
                      ) : (logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'header-right' && (
                        <img 
                          src={logoConfig.dataUrl} 
                          alt="Logotipo" 
                          className={`${getLogoSizeClass(logoConfig.size)} object-contain mb-2`}
                        />
                      ))}

                      {/* Badge Editável do Tipo de Documento */}
                      <input
                        type="text"
                        value={headerConfig.badgeText || ''}
                        onChange={e => handleHeaderFieldChange('badgeText', e.target.value)}
                        placeholder="TIPO DE DOCUMENTO"
                        className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-sans text-right hover:bg-slate-200/80 focus:bg-sky-50 focus:border-sky-500 outline-none transition w-full max-w-[200px]"
                        title="Clique para personalizar o tipo do documento (ex: RELATÓRIO MÉDICO, LAUDO, RECEITUÁRIO)"
                      />

                      {/* Data Editável */}
                      <input
                        type="text"
                        value={headerConfig.dateText || ''}
                        onChange={e => handleHeaderFieldChange('dateText', e.target.value)}
                        placeholder="Data de emissão"
                        className="text-[11px] text-slate-500 font-sans mt-1 text-right bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 rounded px-1 outline-none transition w-full min-h-6"
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
                          id="editor-patient-custom-text"
                          aria-label="Identificação do paciente"
                          value={headerConfig.patientCustomText || ''}
                          onChange={e => handleHeaderFieldChange('patientCustomText', e.target.value)}
                          placeholder="Identificação do paciente (opcional: digite o nome e documento aqui)"
                          className="w-full text-xs text-slate-700 italic bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none min-h-6 transition placeholder:text-slate-400"
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
                    className="text-xs font-bold text-slate-900 uppercase text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-80 min-h-6 flex items-center justify-center"
                    title="Clique para editar o nome na assinatura"
                  />

                  {/* CRM na Assinatura */}
                  <input
                    type="text"
                    value={headerConfig.footerCrm || headerConfig.doctorCrm || ''}
                    onChange={e => handleHeaderFieldChange('footerCrm', e.target.value)}
                    placeholder="Médico(a) — CRM-SP 00000"
                    className="text-[11px] text-slate-600 font-semibold text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-80 mt-0.5 min-h-6 flex items-center justify-center"
                    title="Clique para editar CRM na assinatura"
                  />

                  {/* Especialidade na Assinatura */}
                  <input
                    type="text"
                    value={headerConfig.footerSpecialty || headerConfig.doctorSpecialty || ''}
                    onChange={e => handleHeaderFieldChange('footerSpecialty', e.target.value)}
                    placeholder="Especialidade"
                    className="text-[11px] text-slate-500 font-medium text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-80 min-h-6 flex items-center justify-center"
                    title="Clique para editar a especialidade no carimbo"
                  />

                  {/* Subtexto Regulamentar CFM */}
                  <input
                    type="text"
                    id="editor-footer-subtext"
                    aria-label="Subtexto regulamentar CFM"
                    value={headerConfig.footerSubtext || ''}
                    onChange={e => handleHeaderFieldChange('footerSubtext', e.target.value)}
                    className="text-[9px] text-slate-600 mt-1.5 text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-full max-w-md min-h-6"
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
            </>
          )}

          {/* LAYOUT 2 VIAS NA MESMA FOLHA (PORTARIA SVS/MS 344/98 & CONTROLE ESPECIAL) */}
          {viaLayout === '2-vias' && (
            <>
              {pageOrientation === 'landscape' ? (
                /* 2 VIAS LADO A LADO EM PAISAGEM (LAYOUT CLÁSSICO DE CONTROLE ESPECIAL) */
                <div className="grid grid-cols-[1fr_auto_1fr] gap-6 flex-1 w-full relative z-10">
                  {/* 1ª VIA: FARMÁCIA (RETENÇÃO) */}
                  <div className="flex flex-col justify-between h-full pr-2">
                    <div>
                      {headerConfig.showHeader && (
                        <header className="border-b-2 border-slate-900 pb-2 mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={headerConfig.doctorName || ''}
                                onChange={e => handleHeaderFieldChange('doctorName', e.target.value)}
                                placeholder="DR(A). MÉDICO(A)"
                                aria-label="Nome do médico emitente (1ª via)"
                                className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                              />
                              <input
                                type="text"
                                value={headerConfig.doctorCrm || ''}
                                onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                                placeholder="CRM-SP 000000"
                                aria-label="CRM do médico emitente (1ª via)"
                                className="text-xs font-bold text-sky-800 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                              />
                              <p className="text-[10px] text-slate-600 truncate mt-0.5">{headerConfig.clinicName || 'Rede de Atenção à Saúde'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300 block">
                                1ª VIA — FARMÁCIA
                              </span>
                              <span className="text-[8px] text-slate-500 font-bold block mt-0.5">(RETENÇÃO)</span>
                              <span className="text-[9px] text-slate-500 block">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          {headerConfig.showPatientBanner && (
                            <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
                              <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                              {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                            </div>
                          )}
                        </header>
                      )}

                      {/* Editor na 1ª Via */}
                      <div className="text-slate-900 py-1">
                        <EditorContent editor={editor} />
                      </div>
                    </div>

                    {headerConfig.showFooter && (
                      <div className="mt-3 pt-2">
                        {/* Carimbo / Assinatura */}
                        <div className="border-t border-slate-300 pt-1 flex flex-col items-center justify-center text-center">
                          <div className="w-44 border-b border-slate-400 mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase">
                            {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                          </p>
                          <p className="text-[9px] text-slate-600 font-semibold">
                            {headerConfig.footerCrm || headerConfig.doctorCrm || 'CRM'}
                          </p>
                        </div>

                        {/* Blocos Regulamentares Portaria SVS/MS 344/98 */}
                        <div className="mt-2 pt-1 border-t-2 border-slate-900 grid grid-cols-2 gap-1.5 text-[8px] text-slate-700 leading-tight">
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Comprador
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Nome:</strong> _________________________</p>
                              <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                              <p><strong>Endereço:</strong> _____________________</p>
                              <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                            </div>
                          </div>

                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Fornecedor
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Farmácia/Drogaria:</strong> _____________</p>
                              <p><strong>Assinatura Farmacêutico:</strong> _________</p>
                              <p><strong>Data:</strong> __/__/____ <strong>Lote:</strong> ________</p>
                              <p><strong>Quantidade Dispensada:</strong> __________</p>
                            </div>
                          </div>
                        </div>

                        {/* Subtexto Regulamentar / Validade */}
                        <div className="mt-1 text-[7.5px] text-slate-500 italic text-center">
                          1ª Via: Retenção da Farmácia / Drogaria (Portaria SVS/MS nº 344/98).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LINHA DE CORTE VERTICAL ✂ */}
                  <div className="flex flex-col items-center justify-center relative border-l border-dashed border-slate-400 px-1 select-none">
                    <div className="absolute top-1/2 -translate-y-1/2 bg-white py-3 px-1 flex flex-col items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      <Scissors className="w-3.5 h-3.5 text-slate-500 rotate-90" />
                      <span style={{ writingMode: 'vertical-rl' }}>✂ CORTE AQUI</span>
                    </div>
                  </div>

                  {/* 2ª VIA: PACIENTE (ORIENTAÇÃO) */}
                  <div className="flex flex-col justify-between h-full pl-2">
                    <div>
                      {headerConfig.showHeader && (
                        <header className="border-b-2 border-slate-900 pb-2 mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight truncate h-5 flex items-center">
                                {headerConfig.doctorName || 'DR(A). MÉDICO(A)'}
                              </h3>
                              <p className="text-xs font-bold text-sky-800 font-sans mt-0.5 h-4 flex items-center">
                                {headerConfig.doctorCrm || 'CRM'}
                              </p>
                              <p className="text-[10px] text-slate-600 truncate mt-0.5">{headerConfig.clinicName || 'Rede de Atenção à Saúde'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 block">
                                2ª VIA — PACIENTE
                              </span>
                              <span className="text-[8px] text-slate-500 font-bold block mt-0.5">(ORIENTAÇÃO)</span>
                              <span className="text-[9px] text-slate-500 block">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          {headerConfig.showPatientBanner && (
                            <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
                              <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                              {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                            </div>
                          )}
                        </header>
                      )}

                      {/* Espelho em Tempo Real na 2ª Via */}
                      <div className="text-slate-900 py-1">
                        <div 
                          className="ProseMirror via-preview-content outline-none leading-relaxed text-inherit" 
                          dangerouslySetInnerHTML={{ __html: editorDomHtml || editorHtml || editor?.getHTML() || '' }}
                        />
                      </div>
                    </div>

                    {headerConfig.showFooter && (
                      <div className="mt-3 pt-2">
                        {/* Carimbo / Assinatura */}
                        <div className="border-t border-slate-300 pt-1 flex flex-col items-center justify-center text-center">
                          <div className="w-44 border-b border-slate-400 mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase">
                            {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                          </p>
                          <p className="text-[9px] text-slate-600 font-semibold">
                            {headerConfig.footerCrm || headerConfig.doctorCrm || 'CRM'}
                          </p>
                        </div>

                        {/* Blocos Regulamentares Portaria SVS/MS 344/98 */}
                        <div className="mt-2 pt-1 border-t-2 border-slate-900 grid grid-cols-2 gap-1.5 text-[8px] text-slate-700 leading-tight">
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Comprador
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Nome:</strong> _________________________</p>
                              <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                              <p><strong>Endereço:</strong> _____________________</p>
                              <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                            </div>
                          </div>

                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Fornecedor
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Farmácia/Drogaria:</strong> _____________</p>
                              <p><strong>Assinatura Farmacêutico:</strong> _________</p>
                              <p><strong>Data:</strong> __/__/____ <strong>Lote:</strong> ________</p>
                              <p><strong>Quantidade Dispensada:</strong> __________</p>
                            </div>
                          </div>
                        </div>

                        {/* Subtexto Regulamentar / Validade */}
                        <div className="mt-1 text-[7.5px] text-slate-500 italic text-center">
                          2ª Via: Orientação ao Paciente • Válido por 30 (trinta) dias em todo o território nacional (Portaria SVS/MS nº 344/98).
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 2 VIAS EMPILHADAS EM RETRATO (SUPERIOR E INFERIOR) */
                <div className="flex flex-col justify-between h-full flex-1 w-full relative z-10 gap-3">
                  {/* 1ª VIA: FARMÁCIA (SUPERIOR) */}
                  <div className="flex-1 flex flex-col justify-between pb-2">
                    <div>
                      {headerConfig.showHeader && (
                        <header className="border-b border-slate-900 pb-2 mb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={headerConfig.doctorName || ''}
                                onChange={e => handleHeaderFieldChange('doctorName', e.target.value)}
                                placeholder="DR(A). MÉDICO(A)"
                                aria-label="Nome do médico emitente (1ª via paisagem)"
                                className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                              />
                              <input
                                type="text"
                                value={headerConfig.doctorCrm || ''}
                                onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                                placeholder="CRM-SP 000000"
                                aria-label="CRM do médico emitente (1ª via paisagem)"
                                className="text-xs font-bold text-sky-800 font-sans mt-0.5 w-full bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                              />
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300 block">
                                1ª VIA — FARMÁCIA (RETENÇÃO)
                              </span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          {headerConfig.showPatientBanner && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
                              <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                              {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                            </div>
                          )}
                        </header>
                      )}

                      <div 
                        className="text-slate-900 py-1 font-inherit text-inherit leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: editorDomHtml || editorHtml }}
                      />
                    </div>

                    {headerConfig.showFooter && (
                      <div className="mt-2 pt-1">
                        <div className="border-t border-slate-300 pt-1 flex flex-col items-center justify-center text-center">
                          <div className="w-40 border-b border-slate-400 mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase">
                            {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                          </p>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-900 grid grid-cols-2 gap-1 text-[8px] text-slate-700">
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Comprador
                            </p>
                            <p><strong>Nome:</strong> _________________________</p>
                            <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                            <p><strong>Endereço:</strong> _____________________</p>
                            <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                          </div>
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Fornecedor
                            </p>
                            <p><strong>Farmácia/Drogaria:</strong> _____________</p>
                            <p><strong>Assinatura Farmacêutico:</strong> _________</p>
                            <p><strong>Data:</strong> __/__/____ <strong>Lote:</strong> ________</p>
                            <p><strong>Quantidade Dispensada:</strong> __________</p>
                          </div>
                        </div>
                        <div className="mt-0.5 text-[7px] text-slate-500 italic text-center">
                          1ª Via: Retenção da Farmácia / Drogaria (Portaria SVS/MS nº 344/98).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LINHA DE CORTE HORIZONTAL ✂ */}
                  <div className="relative border-t border-dashed border-slate-400 my-1 flex items-center justify-center select-none">
                    <span className="absolute bg-white px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-slate-500" />
                      <span>✂ CORTE AQUI</span>
                    </span>
                  </div>

                  {/* 2ª VIA: PACIENTE (INFERIOR) */}
                  <div className="flex-1 flex flex-col justify-between pt-2">
                    <div>
                      {headerConfig.showHeader && (
                        <header className="border-b border-slate-900 pb-2 mb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight truncate h-5 flex items-center">
                                {headerConfig.doctorName || 'DR(A). MÉDICO(A)'}
                              </h3>
                              <p className="text-xs font-bold text-sky-800 font-sans mt-0.5 h-4 flex items-center">
                                {headerConfig.doctorCrm || 'CRM'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 block">
                                2ª VIA — PACIENTE (ORIENTAÇÃO)
                              </span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          {headerConfig.showPatientBanner && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
                              <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                              {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                            </div>
                          )}
                        </header>
                      )}

                      <div className="text-slate-900 py-1">
                        <div 
                          className="ProseMirror via-preview-content outline-none leading-relaxed text-inherit" 
                          dangerouslySetInnerHTML={{ __html: editorDomHtml || editorHtml || editor?.getHTML() || '' }}
                        />
                      </div>
                    </div>

                    {headerConfig.showFooter && (
                      <div className="mt-2 pt-1">
                        <div className="border-t border-slate-300 pt-1 flex flex-col items-center justify-center text-center">
                          <div className="w-40 border-b border-slate-400 mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase">
                            {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                          </p>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-900 grid grid-cols-2 gap-1 text-[8px] text-slate-700">
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Comprador
                            </p>
                            <p><strong>Nome:</strong> _________________________</p>
                            <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                            <p><strong>Endereço:</strong> _____________________</p>
                            <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                          </div>
                          <div className="border border-slate-400 rounded p-1 bg-slate-50/50">
                            <p className="font-bold text-[8px] uppercase border-b border-slate-300 pb-0.5 mb-0.5 text-slate-900">
                              Identificação do Fornecedor
                            </p>
                            <p><strong>Farmácia/Drogaria:</strong> _____________</p>
                            <p><strong>Assinatura Farmacêutico:</strong> _________</p>
                            <p><strong>Data:</strong> __/__/____ <strong>Lote:</strong> ________</p>
                            <p><strong>Quantidade Dispensada:</strong> __________</p>
                          </div>
                        </div>
                        <div className="mt-0.5 text-[7px] text-slate-600 italic text-center">
                          2ª Via: Orientação ao Paciente • Válido por 30 dias a contar da emissão (Portaria SVS/MS nº 344/98).
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AVISO E RESTAURAÇÃO DE RODAPÉ OCULTADO (no-print) */}
          {!headerConfig.showFooter && (
            <div className="no-print mt-4 p-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-600 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span><strong>Rodapé Ocultado:</strong> Carimbo e assinatura não serão impressos.</span>
              </div>
              <button
                type="button"
                onClick={() => handleHeaderFieldChange('showFooter', true)}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Restaurar Rodapé</span>
              </button>
            </div>
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
                  <span>Modelos & Estilos</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Modelos de referência, rascunhos salvos e formatos de prescrição
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModelsDrawerOpen(false)}
                aria-label="Fechar modelos e estilos"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ABAS DO DRAWER */}
            <div className="grid grid-cols-3 p-1.5 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] gap-1">
              <button
                type="button"
                onClick={() => setDrawerTab('padrao')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'padrao'
                    ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>📋</span>
                <span className="truncate">Modelos Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('salvos')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'salvos'
                    ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>💾</span>
                <span className="truncate">Meus Modelos ({savedTemplates.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('estilos')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'estilos'
                    ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>🎨</span>
                <span className="truncate">Estilos ({DEFAULT_PRESCRIPTION_STYLES.length + customStyles.length})</span>
              </button>
            </div>

            {/* CONTEÚDO DAS ABAS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* ABA 1: MODELOS PADRÃO DO SISTEMA */}
              {drawerTab === 'padrao' && (
                <div className="space-y-3">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Buscar modelo padrão..."
                      aria-label="Buscar modelo padrão"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 transition"
                    />
                  </div>

                  {/* Lista de Modelos Padrão */}
                  {[
                    {
                      id: 'receita_especial',
                      badge: 'Portaria 344/98 • 2 Vias',
                      title: 'Receituário de Controle Especial (2 Vias)',
                      desc: 'Receita C1/B1 para retenção da farmácia e orientação do paciente em paisagem lado a lado.',
                      badgeColor: 'bg-amber-600'
                    },
                    {
                      id: 'receita',
                      badge: 'Ambulatorial',
                      title: 'Receita Ambulatorial Livre Padrão',
                      desc: 'Prescrição antibiótica e analgésica sintomática com espaçamento milimétrico.',
                      badgeColor: 'bg-sky-600'
                    },
                    {
                      id: 'relatorio_circunstanciado',
                      badge: 'SUS / Perícia / INSS',
                      title: 'Relatório Médico Circunstanciado',
                      desc: 'Para perícia médica, regulação do SUS ou INSS com anamnese dirigida e terapêutica em curso.',
                      badgeColor: 'bg-emerald-600'
                    },
                    {
                      id: 'laudo_com_receita',
                      badge: 'Consulta Ativa',
                      title: 'Laudo com Prescrição Anexa',
                      desc: 'Avaliação clínica estruturada acompanhada dos medicamentos prescritos na consulta atual.',
                      badgeColor: 'bg-sky-600'
                    },
                    {
                      id: 'declaracao_comparecimento',
                      badge: 'Declaração',
                      title: 'Declaração de Comparecimento com Receita',
                      desc: 'Comprovação de horário de atendimento com prescrição dos fármacos indicados.',
                      badgeColor: 'bg-indigo-600'
                    },
                    {
                      id: 'laudo',
                      badge: 'Clínico',
                      title: 'Laudo de Avaliação Clínica',
                      desc: 'Sumário de atendimento, hipótese diagnóstica e conduta terapêutica.',
                      badgeColor: 'bg-slate-600'
                    },
                    {
                      id: 'risco',
                      badge: 'Cardiológico',
                      title: 'Risco Cirúrgico Pré-Operatório',
                      desc: 'Avaliação pré-anestésica com estratificação ASA e recomendações clínicas.',
                      badgeColor: 'bg-rose-600'
                    },
                    {
                      id: 'parecer',
                      badge: 'Especialista',
                      title: 'Parecer Especializado / Contra-Referência',
                      desc: 'Resposta ao médico da Atenção Básica com plano terapêutico e seguimento.',
                      badgeColor: 'bg-purple-600'
                    },
                    {
                      id: 'atestado',
                      badge: 'Aptidão',
                      title: 'Atestado de Aptidão Física',
                      desc: 'Declaração de aptidão para esportes e academia conforme diretrizes do CFM.',
                      badgeColor: 'bg-teal-600'
                    }
                  ]
                    .filter(m => !templateSearch || m.title.toLowerCase().includes(templateSearch.toLowerCase()) || m.desc.toLowerCase().includes(templateSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-400 transition flex flex-col gap-1.5 shadow-tactile-sm"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-white text-[9px] font-extrabold uppercase ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--text-main)]">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => applyPresetTemplate(item.id as any)}
                            className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none rounded-md px-1 py-0.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Carregar e Personalizar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ABA 2: MEUS MODELOS SALVOS */}
              {drawerTab === 'salvos' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Buscar em meus modelos salvos..."
                        aria-label="Buscar em meus modelos salvos"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 transition"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsModelsDrawerOpen(false);
                        setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? currentModel.title : '');
                        setIsSaveModelModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-tactile-btn cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Salvar Documento Atual como Modelo</span>
                    </button>
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
                            Clique no botão acima para salvar a folha atual como um modelo reutilizável.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSavedTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-300 dark:hover:border-sky-800 transition flex flex-col gap-2 group shadow-tactile-sm"
                        >
                          {editingTemplateId === tpl.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingTemplateTitle}
                                onChange={(e) => setEditingTemplateTitle(e.target.value)}
                                aria-label="Editar título do modelo"
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-sky-500 bg-[var(--bg-app)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(tpl.id)}
                                aria-label="Salvar novo título"
                                className="p-1.5 rounded-lg bg-emerald-700 text-white text-xs hover:bg-emerald-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                                title="Salvar novo título"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplateId(null)}
                                aria-label="Cancelar edição do título"
                                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-xs hover:bg-[var(--surface-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
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
                                  aria-label="Renomear modelo"
                                  className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-sky-600 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                                  title="Renomear modelo"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                                  aria-label="Excluir modelo"
                                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition"
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
                              className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none rounded-md px-1 py-0.5"
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
              )}

              {/* ABA 3: ESTILOS DE RECEITA (FORMATAÇÃO RÁPIDA & PERSONALIZADA) */}
              {drawerTab === 'estilos' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between gap-2">
                    <div className="text-xs text-[var(--text-secondary)]">
                      <p className="font-bold text-sky-900 dark:text-sky-200">Personalize e Salve seu Estilo</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Guarde fonte, orientação e formato de vias atual</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelsDrawerOpen(false);
                        setIsSaveStyleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1 shadow-tactile-sm cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Salvar Atual</span>
                    </button>
                  </div>

                  {/* Meus Estilos Salvos */}
                  {customStyles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                        <span>💾 Meus Estilos Personalizados</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 font-bold">
                          {customStyles.length}
                        </span>
                      </h4>
                      {customStyles.map(st => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-400 transition flex flex-col gap-2 shadow-tactile-sm"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[var(--text-main)] truncate">{st.name}</h5>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomStyle(st.id, st.name)}
                              aria-label="Excluir estilo"
                              className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition"
                              title="Excluir estilo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{st.fontFamilyId} • {st.baseFontSize}pt</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'} • {st.viaLayout}</span>
                            {!st.showHeader && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">Sem Cabeçalho</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleApplyStyle(st);
                              setIsModelsDrawerOpen(false);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold cursor-pointer shadow-tactile-btn transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                          >
                            Aplicar Este Estilo
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Estilos Padrão do Sistema */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      📋 Estilos Padrão de Fábrica
                    </h4>
                    {DEFAULT_PRESCRIPTION_STYLES.map(st => (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-400 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            <span>{st.viaLayout === '2-vias' ? '📑' : st.watermarkType !== 'none' ? '⚕️' : '📄'}</span>
                            <span>{st.name}</span>
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">
                            {st.baseFontSize}pt • {st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {st.id === 'especial_2vias'
                            ? 'Orientação Paisagem (297×210mm) com 2 vias na mesma folha e linha de corte ✂ para retenção na farmácia (Portaria 344/98).'
                            : st.id === 'sus'
                            ? 'Configuração oficial para UBS/UPA com tipografia Inter e marca d’água do SUS.'
                            : st.id === 'classico'
                            ? 'Tipografia serifada Cormorant Garamond nobre para consultórios e clínicas privadas.'
                            : st.id === 'pre_timbrado'
                            ? 'Oculta o cabeçalho e rodapé digitais para imprimir perfeitamente em papel pré-impresso de gráfica.'
                            : 'Formato padrão para prescrições ambulatoriais com tipografia limpa e moderna.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            handleApplyStyle(st);
                            setIsModelsDrawerOpen(false);
                          }}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold cursor-pointer shadow-tactile-btn transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                        >
                          Aplicar Estilo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                aria-label="Fechar modal de salvar modelo"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsTemplate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="save-model-title" className="block text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
                  Nome do Modelo Clínico
                </label>
                <input
                  id="save-model-title"
                  type="text"
                  required
                  value={newModelTitle}
                  onChange={(e) => setNewModelTitle(e.target.value)}
                  placeholder="Ex: Laudo Cardiológico - Policlínica"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 font-medium transition"
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newModelTitle.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white shadow-tactile-btn cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Modelo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Salvar como Estilo de Receita Personalizado */}
      {isSaveStyleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print animate-tab-fade">
          <div className="bg-[var(--surface-card)] text-[var(--text-main)] rounded-2xl max-w-md w-full p-5 border border-[var(--border-subtle)] shadow-tactile-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold">Salvar Estilo da Receita</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveStyleModalOpen(false)}
                aria-label="Fechar modal de salvar estilo"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomStyle} className="mt-4 space-y-4">
              <div>
                <label htmlFor="save-style-title" className="block text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
                  Nome do Estilo Visual
                </label>
                <input
                  id="save-style-title"
                  type="text"
                  required
                  value={newStyleTitle}
                  onChange={(e) => setNewStyleTitle(e.target.value)}
                  placeholder="Ex: Minha Clínica • 2 Vias Azul"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 font-medium transition"
                  autoFocus
                />
              </div>

              {/* Resumo da Configuração Atual do Estilo */}
              <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                <span className="font-bold text-[var(--text-secondary)] block text-[11px] uppercase tracking-wider">
                  Configurações que serão salvas:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
                  <div>• Tipografia: <strong className="text-[var(--text-main)] capitalize">{fontFamilyId}</strong></div>
                  <div>• Tamanho: <strong className="text-[var(--text-main)]">{baseFontSize} pt</strong></div>
                  <div>• Orientação: <strong className="text-[var(--text-main)]">{pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}</strong></div>
                  <div>• Formato: <strong className="text-[var(--text-main)]">{viaLayout === '2-vias' ? '2 Vias (Mesma Folha)' : '1 Via'}</strong></div>
                  <div>• Cabeçalho: <strong className="text-[var(--text-main)]">{headerConfig.showHeader ? 'Visível' : 'Oculto'}</strong></div>
                  <div>• Rodapé: <strong className="text-[var(--text-main)]">{headerConfig.showFooter ? 'Visível' : 'Oculto'}</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveStyleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newStyleTitle.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white shadow-tactile-btn cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Estilo</span>
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
