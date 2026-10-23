import React from 'react';

/**
 * Catálogo Canônico de Ícones PresCMed baseados no Google Material Design Icons (Material Symbols).
 * Esta tipagem rigorosa evita a mutação de ícones durante o desenvolvimento e geração de código por IA.
 * Referência: https://github.com/google/material-design-icons
 */
export type CanonicalIconName =
  // Prescrição, Farmacologia & Dosagem
  | 'prescriptions'
  | 'medication'
  | 'pill'
  | 'water_drop'
  | 'vaccines'
  | 'syringe'
  | 'stethoscope'
  | 'scale'
  | 'calculate'
  | 'child_care'
  | 'baby_changing_station'
  | 'schedule'
  | 'alarm'
  | 'lock'
  | 'verified_user'
  // Atendimento Clínico, Médico & Paciente
  | 'person'
  | 'person_add'
  | 'person_remove'
  | 'groups'
  | 'badge'
  | 'signature'
  | 'approval'
  | 'draw'
  | 'call'
  | 'location_on'
  | 'local_hospital'
  | 'clinical_notes'
  // Exames & Diagnósticos
  | 'biotech'
  | 'science'
  | 'radiology'
  | 'monitor_heart'
  | 'ecg_heart'
  | 'bloodtype'
  | 'diagnosis'
  | 'sell'
  | 'tag'
  | 'fact_check'
  | 'rule'
  // Atestados, Documentos & Encaminhamentos
  | 'workspace_premium'
  | 'send'
  | 'event_available'
  | 'description'
  | 'picture_as_pdf'
  | 'download'
  | 'print'
  | 'content_copy'
  | 'qr_code_2'
  | 'layers'
  | 'watermark'
  | 'visibility'
  | 'visibility_off'
  // Ações, CRUD & Navegação
  | 'search'
  | 'close'
  | 'check'
  | 'check_circle'
  | 'add'
  | 'add_circle'
  | 'delete'
  | 'edit'
  | 'edit_document'
  | 'ink_eraser'
  | 'save'
  | 'bookmark_add'
  | 'folder_open'
  | 'shield'
  | 'security'
  | 'auto_awesome'
  | 'undo'
  | 'redo'
  | 'refresh'
  | 'sync'
  | 'progress_activity'
  | 'arrow_back'
  | 'arrow_forward'
  | 'chevron_left'
  | 'chevron_right'
  | 'expand_more'
  | 'expand_less'
  | 'menu'
  | 'menu_open'
  | 'more_vert'
  | 'more_horiz'
  | 'filter_list'
  | 'tune'
  // Sistema, Tema & Nuvem
  | 'light_mode'
  | 'dark_mode'
  | 'cloud'
  | 'cloud_upload'
  | 'cloud_download'
  | 'cloud_done'
  | 'cloud_sync'
  | 'warning'
  | 'error'
  | 'info'
  | 'help'
  | 'palette'
  | 'history'
  | 'calendar_today'
  // Formatação de Documento (Editor Tiptap)
  | 'format_bold'
  | 'format_italic'
  | 'format_align_left'
  | 'format_align_center'
  | 'format_align_right'
  | 'format_align_justify'
  | 'format_list_bulleted'
  | 'format_list_numbered';

/**
 * Permite autocompletação das chaves canônicas com suporte aberto a qualquer símbolo oficial do Google.
 */
export type IconName = CanonicalIconName | (string & {});

/**
 * Dicionário de Aliases para evitar mutação e inconsistência quando modelos ou desenvolvedores
 * chamam ícones com nomes clínicos em português ou nomes herdados do Lucide/MUI.
 */
export const ICON_ALIASES: Record<string, string> = {
  // Aliases Clínicos e Farmacológicos
  prescription: 'prescriptions',
  receita: 'prescriptions',
  receituario: 'prescriptions',
  remedio: 'medication',
  medicamento: 'medication',
  comprimido: 'medication',
  capsula: 'medication',
  gotas: 'water_drop',
  solucao: 'water_drop',
  droplet: 'water_drop',
  injecao: 'vaccines',
  vacina: 'vaccines',
  estetoscopio: 'stethoscope',
  balanca: 'scale',
  peso: 'scale',
  pediatria: 'child_care',
  crianca: 'child_care',
  bebe: 'child_care',
  baby: 'child_care',
  posologia: 'schedule',
  horario: 'schedule',
  clock: 'schedule',
  controle_especial: 'lock',
  portaria344: 'lock',
  retencao: 'lock',
  
  // Aliases de Exames e Diagnósticos
  exame: 'biotech',
  exames: 'biotech',
  laboratorio: 'biotech',
  flask: 'biotech',
  tubo: 'biotech',
  raiox: 'radiology',
  imagem: 'radiology',
  tomografia: 'radiology',
  ultrassom: 'radiology',
  coracao: 'monitor_heart',
  ecg: 'monitor_heart',
  heartpulse: 'monitor_heart',
  cid: 'diagnosis',
  cid10: 'diagnosis',
  diagnostico: 'diagnosis',
  termo: 'fact_check',
  consentimento: 'fact_check',
  cfm: 'fact_check',
  sus: 'local_hospital',
  guias_sus: 'clinical_notes',
  verified: 'verified_user',
  emergency: 'medical_services',
  
  // Aliases de Documentos
  atestado: 'workspace_premium',
  certificado: 'workspace_premium',
  award: 'workspace_premium',
  encaminhamento: 'send',
  referral: 'send',
  documentos: 'description',
  documents: 'description',
  comparecimento: 'event_available',
  imprimir: 'print',
  printer: 'print',
  pdf: 'picture_as_pdf',
  baixar: 'download',
  instalar: 'download',
  copiar: 'content_copy',
  copy: 'content_copy',
  qrcode: 'qr_code_2',
  qr_code: 'qr_code_2',
  marcaddagua: 'layers',
  watermark: 'layers',
  
  // Aliases de Paciente & Médico
  paciente: 'person',
  user: 'person',
  usuario: 'person',
  novo_paciente: 'person_add',
  user_plus: 'person_add',
  userplus: 'person_add',
  medico: 'badge',
  doctor: 'badge',
  crm: 'badge',
  carimbo: 'signature',
  assinatura: 'signature',
  clinica: 'local_hospital',
  hospital: 'local_hospital',
  telefone: 'call',
  phone: 'call',
  endereco: 'location_on',
  localizacao: 'location_on',
  map_pin: 'location_on',
  
  // Aliases de Ações & CRUD
  buscar: 'search',
  fechar: 'close',
  cancelar: 'close',
  x: 'close',
  confirmar: 'check',
  sucesso: 'check_circle',
  novo: 'add',
  adicionar: 'add',
  plus: 'add',
  excluir: 'delete',
  remover: 'delete',
  trash: 'delete',
  lixeira: 'delete',
  editar: 'edit_document',
  editor: 'edit_document',
  edit: 'edit_document',
  pencil: 'edit_document',
  borracha: 'ink_eraser',
  eraser: 'ink_eraser',
  limpar: 'ink_eraser',
  salvar: 'save',
  desfazer: 'undo',
  refazer: 'redo',
  atualizar: 'sync',
  carregando: 'progress_activity',
  loader: 'progress_activity',
  spinner: 'progress_activity',
  
  // Aliases de Navegação & Visualização
  voltar: 'chevron_left',
  avancar: 'chevron_right',
  subir: 'expand_less',
  descer: 'expand_more',
  arrow_downward: 'expand_more',
  arrow_upward: 'expand_less',
  chevron_down: 'expand_more',
  chevron_up: 'expand_less',
  olho: 'visibility',
  ver: 'visibility',
  eye: 'visibility',
  ocultar: 'visibility_off',
  eye_off: 'visibility_off',
  
  // Aliases de Sistema & Tema
  sol: 'light_mode',
  sun: 'light_mode',
  lua: 'dark_mode',
  moon: 'dark_mode',
  nuvem: 'cloud',
  alerta: 'warning',
  alert: 'warning',
  erro: 'error',
  info: 'info',
  ajuda: 'help',
  
  // Aliases Editor Tiptap & Compatibilidade Universal
  negrito: 'format_bold',
  bold: 'format_bold',
  italico: 'format_italic',
  italic: 'format_italic',
  lista: 'format_list_bulleted',
  list: 'format_list_bulleted',
  lista_numerada: 'format_list_numbered',
  list_ordered: 'format_list_numbered',
  share2: 'send',
  building2: 'domain',
  sparkles: 'auto_awesome',
  refresh_cw: 'refresh',
  refreshcw: 'refresh',
  calendar: 'calendar_today',
  hash: 'tag',
  alert_circle: 'warning',
  alertcircle: 'warning',
  alert_triangle: 'warning',
  alerttriangle: 'warning',
  check_circle_2: 'check_circle',
  checkcircle2: 'check_circle',
  file_text: 'description',
  filetext: 'description',
  file_check: 'fact_check',
  filecheck: 'fact_check',
  user_check: 'verified_user',
  usercheck: 'verified_user',
  shield_check: 'verified_user',
  shieldcheck: 'verified_user',
  hard_drive: 'hard_drive',
  harddrive: 'hard_drive',
  database: 'database',
  upload: 'upload',
  move: 'open_with',
  activity: 'monitor_heart',
  heart: 'favorite',
  type: 'title',
  trash2: 'delete'
};

/**
 * Resolve o nome canônico do ícone tratando aliases e normalização de strings.
 */
export function resolveIconName(name: string): string {
  if (!name) return 'help';
  const clean = name.trim().toLowerCase().replace(/-/g, '_');
  return ICON_ALIASES[clean] || clean;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

const SIZE_MAP: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40
};

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Nome canônico ou alias do Material Symbols */
  name: IconName;
  /** Dimensão do ícone (xs: 14px, sm: 16px, md: 20px, lg: 24px, xl: 32px, 2xl: 40px ou valor numérico) */
  size?: IconSize;
  /** Se o ícone deve ser preenchido (FILL 1) ou vazado (FILL 0, padrão) */
  filled?: boolean;
  /** Peso tipográfico da linha (100 a 700, padrão 400) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grau de ênfase (-25, 0, 200, padrão 0) */
  grade?: -25 | 0 | 200;
  /** Tamanho óptico (20, 24, 40, 48, padrão calculado com base no tamanho) */
  opticalSize?: 20 | 24 | 40 | 48;
  /** Animação de rotação contínua (ideal para spinners de carregamento) */
  spin?: boolean;
  /** Classes CSS adicionais (Tailwind) */
  className?: string;
  /** Título acessível */
  title?: string;
}

/**
 * Componente Canônico `<Icon />` do PresCMed.
 *
 * Utiliza o Google Material Design Icons (Material Symbols Outlined) de forma 100% offline,
 * com cache PWA e resolução inteligente de sinônimos/aliases para prevenir a mutação visual.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size,
  filled = false,
  weight = 400,
  grade = 0,
  opticalSize,
  spin = false,
  className = '',
  style = {},
  title,
  ...props
}) => {
  const resolvedName = resolveIconName(name);
  const classSizeMatch = size === undefined ? className.match(/(?:text-\[(\d+)px\]|w-(\d+(?:\.\d+)?))/) : null;
  const inferredPx = classSizeMatch
    ? classSizeMatch[1]
      ? Number(classSizeMatch[1])
      : Math.round(Number(classSizeMatch[2]) * 4)
    : undefined;
  const resolvedSize = size !== undefined ? size : inferredPx !== undefined ? inferredPx : 'md';
  const pixelSize = typeof resolvedSize === 'number' ? resolvedSize : SIZE_MAP[resolvedSize] || 20;
  const opsz = opticalSize || (pixelSize <= 20 ? 20 : pixelSize <= 24 ? 24 : pixelSize <= 40 ? 40 : 48);

  const fontVariation = `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`;

  return (
    <span
      className={`material-symbols-outlined select-none shrink-0 inline-flex items-center justify-center leading-none overflow-hidden ${spin ? 'icon-spin' : ''} ${className}`}
      style={{
        fontSize: `${pixelSize}px`,
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        fontVariationSettings: fontVariation,
        ...style
      }}
      title={title}
      aria-hidden={title ? undefined : 'true'}
      {...props}
    >
      {resolvedName}
    </span>
  );
};

export const MaterialSymbol = Icon;

export interface MappedIconProps extends Omit<IconProps, 'name'> {
  strokeWidth?: number;
}

function createMaterialIcon(iconName: IconName): React.FC<MappedIconProps> {
  const MappedIcon: React.FC<MappedIconProps> = ({ strokeWidth: _sw, ...rest }) => (
    <Icon name={iconName} {...rest} />
  );
  MappedIcon.displayName = `MaterialIcon(${iconName})`;
  return MappedIcon;
}

export const Award = createMaterialIcon('workspace_premium');
export const Share2 = createMaterialIcon('send');
export const Download = createMaterialIcon('download');
export const CheckCircle2 = createMaterialIcon('check_circle');
export const AlertCircle = createMaterialIcon('warning');
export const FileText = createMaterialIcon('description');
export const Building2 = createMaterialIcon('domain');
export const Stethoscope = createMaterialIcon('stethoscope');
export const Sparkles = createMaterialIcon('auto_awesome');
export const RefreshCw = createMaterialIcon('refresh');
export const Plus = createMaterialIcon('add');
export const Trash2 = createMaterialIcon('delete');
export const Calendar = createMaterialIcon('calendar_today');
export const Clock = createMaterialIcon('schedule');
export const User = createMaterialIcon('person');
export const Hash = createMaterialIcon('tag');
export const Send = createMaterialIcon('send');
export const UserCheck = createMaterialIcon('verified_user');
export const Check = createMaterialIcon('check');
export const X = createMaterialIcon('close');
export const Shield = createMaterialIcon('shield');
export const Eraser = createMaterialIcon('ink_eraser');
export const Phone = createMaterialIcon('call');
export const MapPin = createMaterialIcon('location_on');
export const Upload = createMaterialIcon('upload');
export const Database = createMaterialIcon('database');
export const AlertTriangle = createMaterialIcon('warning');
export const ShieldCheck = createMaterialIcon('verified_user');
export const HardDrive = createMaterialIcon('hard_drive');
export const FileCheck = createMaterialIcon('fact_check');
export const Activity = createMaterialIcon('monitor_heart');
export const Heart = createMaterialIcon('favorite');
export const Type = createMaterialIcon('title');
export const Circle = createMaterialIcon('circle');
export const Hexagon = createMaterialIcon('hexagon');
export const Square = createMaterialIcon('square');
export const Palette = createMaterialIcon('palette');
export const Eye = createMaterialIcon('visibility');
export const EyeOff = createMaterialIcon('visibility_off');
export const Pencil = createMaterialIcon('edit');
export const RotateCcw = createMaterialIcon('refresh');
export const Move = createMaterialIcon('open_with');
export const Scissors = createMaterialIcon('content_cut');
export const Bold = createMaterialIcon('format_bold');
export const Italic = createMaterialIcon('format_italic');
export const Underline = createMaterialIcon('format_underlined');
export const AlignLeft = createMaterialIcon('format_align_left');
export const AlignCenter = createMaterialIcon('format_align_center');
export const AlignRight = createMaterialIcon('format_align_right');
export const AlignJustify = createMaterialIcon('format_align_justify');
export const List = createMaterialIcon('format_list_bulleted');
export const ListOrdered = createMaterialIcon('format_list_numbered');
export const Undo = createMaterialIcon('undo');
export const Redo = createMaterialIcon('redo');
export const FolderOpen = createMaterialIcon('folder_open');
export const Save = createMaterialIcon('save');
export const LayoutTemplate = createMaterialIcon('dashboard');
export const Search = createMaterialIcon('search');
export const BookmarkPlus = createMaterialIcon('bookmark_add');
export const Files = createMaterialIcon('layers');
export const File = createMaterialIcon('description');
export const ChevronLeft = createMaterialIcon('chevron_left');
export const Loader2 = createMaterialIcon('progress_activity');
export const Printer = createMaterialIcon('print');
export const Pill = createMaterialIcon('medication');
export const RectangleVertical = createMaterialIcon('crop_portrait');
export const RectangleHorizontal = createMaterialIcon('crop_landscape');
export const Image = createMaterialIcon('image');

export default Icon;
