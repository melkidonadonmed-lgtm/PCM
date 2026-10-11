import { WatermarkType } from '../types';

export interface PresetLogoItem {
  id: string;
  name: string;
  description: string;
  sphere: 'municipal' | 'state' | 'federal' | 'private';
  /** Arquivo servido de public/ (os logos não são embutidos no JavaScript). */
  publicUrl: string;
}

export const PRESET_LOGOS: Record<string, PresetLogoItem> = {
  semusa: {
    id: 'semusa',
    name: 'SEMUSA — Porto Velho',
    description: 'Secretaria Municipal de Saúde de Porto Velho - RO',
    sphere: 'municipal',
    publicUrl: '/logos/semusa.png'
  },
  sesau_ro: {
    id: 'sesau_ro',
    name: 'SESAU — Governo de Rondônia',
    description: 'Secretaria de Estado da Saúde de Rondônia (RO GOV)',
    sphere: 'state',
    publicUrl: '/logos/sesau-ro.png'
  },
  sus: {
    id: 'sus',
    name: 'SUS — Sistema Único de Saúde',
    description: 'Logotipo oficial do SUS vetorizado em alta resolução',
    sphere: 'federal',
    publicUrl: '/logos/sus.png'
  },
  rondonia_brasao: {
    id: 'rondonia_brasao',
    name: 'Brasão do Estado de Rondônia',
    description: 'Brasão de Armas Oficial de Rondônia (Vetor SVG completo)',
    sphere: 'state',
    publicUrl: '/logos/rondonia-brasao.svg'
  }
};

export interface PresetWatermarkItem {
  id: WatermarkType;
  name: string;
  description: string;
  layout: 'single' | 'double' | 'triple' | 'full';
  publicUrl?: string;
  defaultOpacity: number;
}

export const PRESET_WATERMARKS: PresetWatermarkItem[] = [
  {
    id: 'none',
    name: "Sem Marca d'Água",
    description: 'Folha branca sem marcação de fundo',
    layout: 'single',
    defaultOpacity: 0
  },
  {
    id: 'sus_single',
    name: 'SUS — 1 Via (Folha Inteira)',
    description: "Logotipo do SUS centralizado suavemente na folha A4",
    layout: 'single',
    publicUrl: '/watermarks/sus.png',
    defaultOpacity: 0.09
  },
  {
    id: 'sus_double',
    name: 'SUS — 2 Vias (Lado a Lado)',
    description: "Duas marcas d'água do SUS para receituários em 2 colunas",
    layout: 'double',
    publicUrl: '/watermarks/sus.png',
    defaultOpacity: 0.08
  },
  {
    id: 'sus_triple',
    name: 'SUS — 3 Vias (Três Colunas)',
    description: "Três marcas d'água do SUS para pedidos de exames e guias triplas",
    layout: 'triple',
    publicUrl: '/watermarks/sus.png',
    defaultOpacity: 0.08
  },
  {
    id: 'rondonia',
    name: 'Brasão Estado de Rondônia',
    description: "Brasão oficial estilizado de Rondônia como marca d'água",
    layout: 'full',
    publicUrl: '/logos/rondonia-brasao.svg',
    defaultOpacity: 0.07
  }
];