import React, { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Icon } from '../Icon';
import WatermarkOverlay from '../WatermarkOverlay';
import {
  alturaFolhaPx,
  larguraFolhaPx,
  limparRaizDeImpressao,
  prepararRaizDeImpressao,
} from '../../utils/folhaA4';
import {
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  DocumentViaLayout,
  Patient,
  WatermarkType,
} from '../../types';
import { type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { FontOption, getLogoSizeClass } from './editorConfigAndFormatters';
import { EditorSingleViaCanvas } from './EditorSingleViaCanvas';
import { EditorTwoViasCanvas } from './EditorTwoViasCanvas';

/**
 * Sincroniza campos padrão do cabeçalho/rodapé com o perfil médico atualizado
 * sem sobrescrever customizações manuais já realizadas pelo médico no documento.
 */
export function mergeHeaderConfigWithDoctorProfile(
  prev: DocumentHeaderConfig,
  fresh: DocumentHeaderConfig
): DocumentHeaderConfig {
  const medicoEraPadrao =
    !prev.doctorName ||
    prev.doctorName === 'Dr(a). Médico(a)' ||
    !prev.doctorCrm ||
    prev.doctorCrm.includes('------');
  const rodapeEraPadrao =
    !prev.footerDocName ||
    prev.footerDocName === 'Dr(a). Médico(a)' ||
    !prev.footerCrm ||
    prev.footerCrm.includes('------');
  const clinicaEraPadrao = !prev.clinicName || prev.clinicName === 'Dr(a). Médico(a)';

  if (!medicoEraPadrao && !rodapeEraPadrao && !clinicaEraPadrao) {
    return prev;
  }

  return {
    ...prev,
    doctorName: medicoEraPadrao ? fresh.doctorName : prev.doctorName,
    doctorCrm: medicoEraPadrao ? fresh.doctorCrm : prev.doctorCrm,
    doctorSpecialty: medicoEraPadrao ? fresh.doctorSpecialty : prev.doctorSpecialty,
    footerDocName: rodapeEraPadrao ? fresh.footerDocName : prev.footerDocName,
    footerCrm: rodapeEraPadrao ? fresh.footerCrm : prev.footerCrm,
    footerSpecialty: rodapeEraPadrao ? fresh.footerSpecialty : prev.footerSpecialty,
    clinicName: clinicaEraPadrao ? fresh.clinicName : prev.clinicName,
    clinicAddress: clinicaEraPadrao ? fresh.clinicAddress : prev.clinicAddress,
  };
}

interface EditorSheetViewportProps {
  sheetRef: React.RefObject<HTMLDivElement | null>;
  editor: Editor | null;
  pageOrientation: DocumentOrientation;
  viaLayout: DocumentViaLayout;
  selectedFont: FontOption;
  baseFontSize: number;
  docWatermark: WatermarkType;
  watermarkOpacity?: number;
  headerConfig: DocumentHeaderConfig;
  logoConfig: DocumentLogoConfig;
  logoSelected: boolean;
  setLogoSelected: (selected: boolean) => void;
  patient: Patient;
  editorDomHtml: string;
  editorHtml: string;
  activeLoadedRecipeType: RegimeReceita | null;
  handleLogoPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleLogoPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleLogoPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleChangeLogoPosition: (position: DocumentLogoConfig['position']) => void;
  handleChangeLogoSize: (size: DocumentLogoConfig['size']) => void;
  handleChangeSecondaryLogoSize: (size: DocumentLogoConfig['size']) => void;
  handleHeaderFieldChange: <K extends keyof DocumentHeaderConfig>(
    field: K,
    value: DocumentHeaderConfig[K]
  ) => void;
  handleResetHeaderFromProfile: () => void;
}

export const EditorSheetViewport: React.FC<EditorSheetViewportProps> = ({
  sheetRef,
  editor,
  pageOrientation,
  viaLayout,
  selectedFont,
  baseFontSize,
  docWatermark,
  watermarkOpacity,
  headerConfig,
  logoConfig,
  logoSelected,
  setLogoSelected,
  patient,
  editorDomHtml,
  editorHtml,
  activeLoadedRecipeType,
  handleLogoPointerDown,
  handleLogoPointerMove,
  handleLogoPointerUp,
  handleChangeLogoPosition,
  handleChangeLogoSize,
  handleChangeSecondaryLogoSize,
  handleHeaderFieldChange,
  handleResetHeaderFromProfile,
}) => {
  const molduraEditorRef = useRef<HTMLDivElement>(null);
  const [sheetZoom, setSheetZoom] = useState<number>(1);

  const larguraFolhaEditor = larguraFolhaPx(pageOrientation);
  const alturaFolhaEditor = alturaFolhaPx(pageOrientation);

  useEffect(() => {
    const moldura = molduraEditorRef.current;
    if (!moldura) {
      setSheetZoom(1);
      return;
    }
    const medir = () => {
      const disponivel = moldura.clientWidth;
      if (disponivel > 0) {
        setSheetZoom(Math.min(1, disponivel / larguraFolhaEditor));
      }
    };
    medir();
    if (typeof ResizeObserver !== 'undefined') {
      const obs = new ResizeObserver(medir);
      obs.observe(moldura);
      return () => obs.disconnect();
    }
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [larguraFolhaEditor]);

  useEffect(() => {
    const orientacao = pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    const preparar = () => prepararRaizDeImpressao(sheetRef.current, orientacao);
    const limpar = () => limparRaizDeImpressao();

    window.addEventListener('beforeprint', preparar);
    window.addEventListener('afterprint', limpar);
    return () => {
      window.removeEventListener('beforeprint', preparar);
      window.removeEventListener('afterprint', limpar);
      limpar();
    };
  }, [pageOrientation, sheetRef]);

  const viasDeAntimicrobiano = /antimicrobiano/i.test(headerConfig.badgeText || '');
  const viasDeControleEspecial =
    /controle especial/i.test(headerConfig.badgeText || '') ||
    activeLoadedRecipeType === 'controle_especial';
  const rotuloVia1 = viasDeAntimicrobiano
    ? '1ª via — Paciente'
    : '1ª via — Farmácia (retenção)';
  const rotuloVia2 = viasDeAntimicrobiano
    ? '2ª via — Farmácia (retenção)'
    : '2ª via — Paciente (orientação)';

  return (
    <div ref={molduraEditorRef} className="w-full overflow-hidden py-2">
      <div
        ref={sheetRef}
        id="printable-a4-sheet"
        className={`a4-editor-canvas shrink-0 bg-white text-slate-900 rounded-lg shadow-2xl relative transition duration-200 ${
          pageOrientation === 'landscape' ? 'canvas-landscape' : 'canvas-portrait'
        } ${viaLayout === '2-vias' ? 'vias-2' : ''}`}
        style={{
          width: `${larguraFolhaEditor}px`,
          minHeight: `${alturaFolhaEditor}px`,
          zoom: sheetZoom,
          marginInline: 'auto',
          padding: pageOrientation === 'landscape' ? '10mm 14mm' : '20mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
          position: 'relative',
          fontFamily: selectedFont.family,
          fontSize: `${baseFontSize}pt`,
        }}
      >
        <WatermarkOverlay type={docWatermark} opacity={watermarkOpacity} />

        {/* LOGOTIPO NO MODO LIVRE (Arrastável / Drag & Drop em qualquer coordenada) */}
        {logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'free' && (
          <div
            onPointerDown={handleLogoPointerDown}
            onPointerMove={handleLogoPointerMove}
            onPointerUp={handleLogoPointerUp}
            onClick={(e) => {
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

            <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 bg-slate-900 text-white rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-tactile-lg text-xs whitespace-nowrap">
              <Icon name="move" size={12} className="text-sky-400" />
              <span>Arraste para onde quiser</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeLogoPosition('top-center');
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs cursor-pointer"
                title="Alinhar ao centro do topo"
              >
                Centralizar
              </button>
            </div>
          </div>
        )}

        {/* AVISO E RESTAURAÇÃO DE CABEÇALHO OCULTADO (no-print) */}
        {!headerConfig.showHeader && (
          <div className="no-print mb-4 p-2.5 rounded-xl border border-dashed border-warning bg-amber-50/70 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="visibility_off" size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Cabeçalho Ocultado:</strong> A folha será impressa sem cabeçalho (ideal
                para papel timbrado físico).
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleHeaderFieldChange('showHeader', true)}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Icon name="visibility" size={14} />
              <span>Restaurar Cabeçalho</span>
            </button>
          </div>
        )}

        {viaLayout === '1-via' && (
          <EditorSingleViaCanvas
            editor={editor}
            pageOrientation={pageOrientation}
            headerConfig={headerConfig}
            logoConfig={logoConfig}
            patient={patient}
            handleHeaderFieldChange={handleHeaderFieldChange}
            handleResetHeaderFromProfile={handleResetHeaderFromProfile}
            handleChangeLogoPosition={handleChangeLogoPosition}
            handleChangeLogoSize={handleChangeLogoSize}
            handleChangeSecondaryLogoSize={handleChangeSecondaryLogoSize}
          />
        )}

        {viaLayout === '2-vias' && (
          <EditorTwoViasCanvas
            editor={editor}
            pageOrientation={pageOrientation}
            headerConfig={headerConfig}
            logoConfig={logoConfig}
            patient={patient}
            editorDomHtml={editorDomHtml}
            editorHtml={editorHtml}
            rotuloVia1={rotuloVia1}
            rotuloVia2={rotuloVia2}
            viasDeControleEspecial={viasDeControleEspecial}
            handleHeaderFieldChange={handleHeaderFieldChange}
          />
        )}

        {/* AVISO E RESTAURAÇÃO DE RODAPÉ OCULTADO (no-print) */}
        {!headerConfig.showFooter && (
          <div className="no-print mt-4 p-2 rounded-xl border border-dashed border-medium bg-slate-50 text-slate-600 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="visibility_off" size={14} className="text-slate-500 shrink-0" />
              <span>
                <strong>Rodapé Ocultado:</strong> Carimbo e assinatura não serão impressos.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleHeaderFieldChange('showFooter', true)}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Icon name="visibility" size={14} />
              <span>Restaurar Rodapé</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
