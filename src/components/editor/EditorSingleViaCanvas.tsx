import React from 'react';
import { EditorContent, type Editor } from '@tiptap/react';
import { Pencil, RotateCcw, EyeOff, Move, Scissors } from 'lucide-react';
import {
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  LogoPosition,
  Patient,
} from '../../types';
import { getLogoSizeClass } from './editorConfigAndFormatters';

export interface EditorSingleViaCanvasProps {
  editor: Editor | null;
  pageOrientation: DocumentOrientation;
  headerConfig: DocumentHeaderConfig;
  logoConfig: DocumentLogoConfig;
  patient: Patient;
  handleHeaderFieldChange: <K extends keyof DocumentHeaderConfig>(field: K, value: DocumentHeaderConfig[K]) => void;
  handleResetHeaderFromProfile: () => void;
  handleChangeLogoPosition: (position: LogoPosition) => void;
  handleChangeLogoSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  handleChangeSecondaryLogoSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
}

export const EditorSingleViaCanvas: React.FC<EditorSingleViaCanvasProps> = ({
  editor,
  pageOrientation,
  headerConfig,
  logoConfig,
  patient,
  handleHeaderFieldChange,
  handleResetHeaderFromProfile,
  handleChangeLogoPosition,
  handleChangeLogoSize,
  handleChangeSecondaryLogoSize,
}) => {
  const meiaFolhaPaisagem = pageOrientation === 'landscape' && /receitu[áa]rio/i.test(headerConfig.badgeText || '');

  const conteudoViaUnica = (
    <div className="flex flex-col justify-between h-full flex-1 w-full min-w-0 relative z-10">
      {/* CABEÇALHO HOSPITALAR / TIMBRADO TOTALMENTE EDITÁVEL EM TEMPO REAL */}
      {headerConfig.showHeader && (
        <header className="border-b-2 border-slate-900 pb-4 mb-6 relative z-10 transition">
          {/* Barra de Ferramentas Discreta do Cabeçalho (no-print) */}
          <div className="no-print mb-2 flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-subtle">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <Pencil className="w-3 h-3 text-sky-600" />
              <span>Clique em qualquer texto do cabeçalho para editar</span>
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
                <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-0 bg-slate-900/90 text-white rounded-md px-2 py-0.5 flex items-center gap-1 text-xs z-20">
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

          <div className="space-y-2">
            {/* Timbre institucional em largura total (sem truncar nome da unidade ou endereço) */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
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
                ) : null}

                <div className="flex-1 min-w-0">
                  {/* Nome do local de atendimento: é o título do timbre */}
                  <input
                    type="text"
                    value={headerConfig.clinicName || ''}
                    onChange={e => handleHeaderFieldChange('clinicName', e.target.value)}
                    placeholder="Nome do local de atendimento"
                    aria-label="Nome do local de atendimento"
                    style={{ fontFamily: 'inherit' }}
                    className="text-sm font-bold uppercase tracking-tight text-slate-900 leading-snug w-full !bg-transparent hover:bg-slate-50/80 focus:!bg-white focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center border-0 border-b border-transparent hover:border-subtle"
                    title="Clique para editar o nome do local de atendimento"
                  />

                  {/* Endereço / CNES / contato */}
                  <input
                    type="text"
                    value={headerConfig.clinicAddress || ''}
                    onChange={e => handleHeaderFieldChange('clinicAddress', e.target.value)}
                    placeholder="Endereço e informações de contato"
                    aria-label="Endereço e contato do local de atendimento"
                    style={{ fontFamily: 'inherit' }}
                    className="text-xs font-medium text-slate-600 mt-0.5 w-full !bg-transparent hover:bg-slate-50/80 focus:!bg-white focus:ring-1 focus:ring-sky-500 rounded px-1 -mx-1 outline-none transition min-h-6 flex items-center border-0 border-b border-transparent hover:border-subtle"
                    title="Clique para editar o endereço"
                  />
                </div>
              </div>

              {/* Logotipo Direito / Secundário (quando houver) */}
              {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false ? (
                <div className="relative group shrink-0">
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
                  className={`${getLogoSizeClass(logoConfig.size)} object-contain shrink-0`}
                />
              ))}
            </div>

            {/* Linha de Selo do Tipo de Documento & Data de Emissão */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-subtle">
              <input
                type="text"
                value={headerConfig.badgeText || ''}
                onChange={e => handleHeaderFieldChange('badgeText', e.target.value)}
                placeholder="TIPO DE DOCUMENTO"
                style={{ fontFamily: 'inherit', width: `${Math.max(12, (headerConfig.badgeText || 'TIPO DE DOCUMENTO').length) * 0.72 + 2}em` }}
                className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-medium text-left hover:bg-slate-200/80 focus:bg-sky-50 focus:border-info outline-none transition max-w-[65%]"
                title="Clique para personalizar o tipo do documento (ex: RELATÓRIO MÉDICO, LAUDO, RECEITUÁRIO)"
              />

              <input
                type="text"
                value={headerConfig.dateText || ''}
                onChange={e => handleHeaderFieldChange('dateText', e.target.value)}
                placeholder="Data de emissão"
                style={{ fontFamily: 'inherit' }}
                className="text-xs text-slate-500 text-right bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 rounded px-1 outline-none transition flex-1 min-w-[110px] min-h-6"
                title="Clique para editar a data de emissão"
              />
            </div>
          </div>

          {/* Identificação Rápida do Paciente (Se houver) */}
          {headerConfig.showPatientBanner && (
            <div
              style={{ fontFamily: 'inherit' }}
              className="mt-3 pt-2 border-t border-subtle flex items-center justify-between text-xs text-slate-700"
            >
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
                  style={{ fontFamily: 'inherit' }}
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
        <footer
          style={{ fontFamily: 'inherit' }}
          className="border-t border-medium pt-5 mt-6 flex flex-col items-center justify-center text-center relative z-10 group"
        >
          <div className="w-64 max-w-full border-b border-medium mb-2" />

          {/* Nome do Médico na Assinatura */}
          <input
            type="text"
            value={headerConfig.footerDocName || headerConfig.doctorName || ''}
            onChange={e => handleHeaderFieldChange('footerDocName', e.target.value)}
            placeholder="Dr(a). Médico(a)"
            className="text-xs font-bold text-slate-900 uppercase text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-full max-w-xs min-h-6 flex items-center justify-center"
            title="Clique para editar o nome na assinatura"
          />

          {/* CRM na Assinatura */}
          <input
            type="text"
            value={headerConfig.footerCrm || headerConfig.doctorCrm || ''}
            onChange={e => handleHeaderFieldChange('footerCrm', e.target.value)}
            placeholder="Médico(a) — CRM-SP 00000"
            className="text-xs text-slate-600 font-semibold text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-full max-w-xs mt-0.5 min-h-6 flex items-center justify-center"
            title="Clique para editar CRM na assinatura"
          />

          {/* Especialidade na Assinatura */}
          <input
            type="text"
            value={headerConfig.footerSpecialty || headerConfig.doctorSpecialty || ''}
            onChange={e => handleHeaderFieldChange('footerSpecialty', e.target.value)}
            placeholder="Especialidade"
            className="text-xs text-slate-500 font-medium text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-full max-w-xs min-h-6 flex items-center justify-center"
            title="Clique para editar a especialidade no carimbo"
          />

          {/* Subtexto Regulamentar CFM */}
          <input
            type="text"
            id="editor-footer-subtext"
            aria-label="Subtexto regulamentar CFM"
            value={headerConfig.footerSubtext || ''}
            onChange={e => handleHeaderFieldChange('footerSubtext', e.target.value)}
            className="text-xs text-slate-600 mt-1.5 text-center bg-transparent hover:bg-slate-100/60 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 outline-none transition w-full max-w-md min-h-6"
          />

          {/* Botão no-print para Ocultar Rodapé */}
          <button
            type="button"
            onClick={() => handleHeaderFieldChange('showFooter', false)}
            className="no-print opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-amber-600 mt-1 flex items-center gap-1 transition-opacity cursor-pointer"
            title="Ocultar rodapé de assinatura"
          >
            <EyeOff className="w-2.5 h-2.5" />
            <span>Ocultar Rodapé</span>
          </button>
        </footer>
      )}
    </div>
  );

  return meiaFolhaPaisagem ? (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-6 flex-1 w-full relative z-10">
      <div className="flex flex-col justify-between h-full pr-2 min-w-0">
        {conteudoViaUnica}
      </div>
      <div className="flex flex-col items-center justify-center relative border-l border-dashed border-medium px-1 select-none">
        <div className="absolute top-1/2 -translate-y-1/2 bg-white py-3 px-1 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
          <Scissors className="w-3.5 h-3.5 text-slate-500 rotate-90" />
          <span style={{ writingMode: 'vertical-rl' }}>CORTE AQUI</span>
        </div>
      </div>
      <div aria-hidden="true" />
    </div>
  ) : (
    conteudoViaUnica
  );
};
