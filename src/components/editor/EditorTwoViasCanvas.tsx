import React from 'react';
import { EditorContent, type Editor } from '@tiptap/react';
import { Scissors } from '../Icon';
import { DOMPurify } from '../../utils/sanitizeHtml';
import {
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  Patient,
} from '../../types';

export interface EditorTwoViasCanvasProps {
  editor: Editor | null;
  pageOrientation: DocumentOrientation;
  headerConfig: DocumentHeaderConfig;
  logoConfig: DocumentLogoConfig;
  patient: Patient;
  editorDomHtml: string;
  editorHtml: string;
  rotuloVia1: string;
  rotuloVia2: string;
  viasDeControleEspecial: boolean;
  handleHeaderFieldChange: <K extends keyof DocumentHeaderConfig>(field: K, value: DocumentHeaderConfig[K]) => void;
}

export const EditorTwoViasCanvas: React.FC<EditorTwoViasCanvasProps> = ({
  editor,
  pageOrientation,
  headerConfig,
  logoConfig,
  patient,
  editorDomHtml,
  editorHtml,
  rotuloVia1,
  rotuloVia2,
  viasDeControleEspecial,
  handleHeaderFieldChange,
}) => {
  return (
    <>
      {pageOrientation === 'landscape' ? (
        /* 2 VIAS LADO A LADO EM PAISAGEM */
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 flex-1 w-full relative z-10">
          {/* 1ª VIA */}
          <div className="flex flex-col justify-between h-full pr-2 min-w-0">
            <div>
              {headerConfig.showHeader && (
                <header className="border-b-2 border-slate-900 pb-2 mb-3">
                  <div className="flex items-start justify-between gap-2">
                    {logoConfig.dataUrl && logoConfig.visible && (
                      <img
                        src={logoConfig.dataUrl}
                        alt="Logotipo Institucional"
                        className="h-9 max-w-[84px] object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={headerConfig.doctorName || ''}
                        onChange={e => handleHeaderFieldChange('doctorName', e.target.value)}
                        placeholder="DR(A). MÉDICO(A)"
                        aria-label="Nome do médico emitente (1ª via)"
                        className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight w-full !bg-transparent hover:bg-slate-50/80 focus:!bg-white focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition border-0 border-b border-transparent hover:border-subtle"
                      />
                      <input
                        type="text"
                        value={headerConfig.doctorCrm || ''}
                        onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                        placeholder="CRM-SP 000000"
                        aria-label="CRM do médico emitente (1ª via)"
                        style={{ fontFamily: 'inherit' }}
                        className="text-xs font-bold text-sky-800 mt-0.5 w-full !bg-transparent hover:bg-slate-50/80 focus:!bg-white focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition border-0 border-b border-transparent hover:border-subtle"
                      />
                      <p className="text-xs text-slate-600 leading-snug break-words mt-0.5">{headerConfig.clinicName || 'Rede de Atenção à Saúde'}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false && (
                        <img
                          src={logoConfig.secondaryDataUrl}
                          alt="Logotipo Secundário"
                          className="h-7 max-w-[72px] object-contain"
                        />
                      )}
                      <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-info block">
                        {rotuloVia1}
                      </span>
                      <span className="text-xs text-slate-500 block">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {headerConfig.showPatientBanner && (
                    <div className="mt-2 pt-1 border-t border-subtle text-xs text-slate-700 flex items-center justify-between">
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
                <div className="border-t border-medium pt-1 flex flex-col items-center justify-center text-center">
                  <div className="w-44 border-b border-medium mb-0.5" />
                  <p className="text-xs font-bold text-slate-900 uppercase">
                    {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">
                    {headerConfig.footerCrm || headerConfig.doctorCrm || 'CRM'}
                  </p>
                </div>

                {viasDeControleEspecial ? (
                  <>
                    {/* Blocos Regulamentares Portaria SVS/MS 344/98 */}
                    <div className="mt-2 pt-1 border-t-2 border-slate-900 grid grid-cols-2 gap-1.5 text-[8px] text-slate-700 leading-tight">
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
                          Identificação do Comprador
                        </p>
                        <div className="space-y-0.5">
                          <p><strong>Nome:</strong> _________________________</p>
                          <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                          <p><strong>Endereço:</strong> _____________________</p>
                          <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                        </div>
                      </div>

                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
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
                  </>
                ) : (
                  <div className="mt-1.5 text-[7.5px] text-slate-500 italic text-center">
                    1ª Via: Orientação ao Paciente • Válida por 10 (dez) dias a partir da emissão (RDC Anvisa nº 471/2021).
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LINHA DE CORTE VERTICAL */}
          <div className="flex flex-col items-center justify-center relative border-l border-dashed border-medium px-1 select-none">
            <div className="absolute top-1/2 -translate-y-1/2 bg-white py-3 px-1 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              <Scissors className="w-3.5 h-3.5 text-slate-500 rotate-90" />
              <span style={{ writingMode: 'vertical-rl' }}>CORTE AQUI</span>
            </div>
          </div>

          {/* 2ª VIA */}
          <div className="flex flex-col justify-between h-full pl-2 min-w-0">
            <div>
              {headerConfig.showHeader && (
                <header className="border-b-2 border-slate-900 pb-2 mb-3">
                  <div className="flex items-start justify-between gap-2">
                    {logoConfig.dataUrl && logoConfig.visible && (
                      <img
                        src={logoConfig.dataUrl}
                        alt="Logotipo Institucional"
                        className="h-9 max-w-[84px] object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight break-words flex items-center">
                        {headerConfig.doctorName || 'DR(A). MÉDICO(A)'}
                      </h3>
                      <p
                        style={{ fontFamily: 'inherit' }}
                        className="text-xs font-bold text-sky-800 mt-0.5 flex items-center"
                      >
                        {headerConfig.doctorCrm || 'CRM'}
                      </p>
                      <p className="text-xs text-slate-600 leading-snug break-words mt-0.5">{headerConfig.clinicName || 'Rede de Atenção à Saúde'}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false && (
                        <img
                          src={logoConfig.secondaryDataUrl}
                          alt="Logotipo Secundário"
                          className="h-7 max-w-[72px] object-contain"
                        />
                      )}
                      <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-clinical block">
                        {rotuloVia2}
                      </span>
                      <span className="text-xs text-slate-500 block">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {headerConfig.showPatientBanner && (
                    <div className="mt-2 pt-1 border-t border-subtle text-xs text-slate-700 flex items-center justify-between">
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
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorDomHtml || editorHtml || editor?.getHTML() || '') }}
                />
              </div>
            </div>

            {headerConfig.showFooter && (
              <div className="mt-3 pt-2">
                {/* Carimbo / Assinatura */}
                <div className="border-t border-medium pt-1 flex flex-col items-center justify-center text-center">
                  <div className="w-44 border-b border-medium mb-0.5" />
                  <p className="text-xs font-bold text-slate-900 uppercase">
                    {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">
                    {headerConfig.footerCrm || headerConfig.doctorCrm || 'CRM'}
                  </p>
                </div>

                {viasDeControleEspecial ? (
                  <>
                    {/* Blocos Regulamentares Portaria SVS/MS 344/98 */}
                    <div className="mt-2 pt-1 border-t-2 border-slate-900 grid grid-cols-2 gap-1.5 text-[8px] text-slate-700 leading-tight">
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
                          Identificação do Comprador
                        </p>
                        <div className="space-y-0.5">
                          <p><strong>Nome:</strong> _________________________</p>
                          <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                          <p><strong>Endereço:</strong> _____________________</p>
                          <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                        </div>
                      </div>

                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
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
                  </>
                ) : (
                  <>
                    <div className="mt-2 pt-1.5 border-t border-medium text-[8px] text-slate-700 flex items-center justify-between gap-2">
                      <span><strong>Dispensação (farmácia):</strong> Data: ___/___/_____</span>
                      <span>Qtd aviada: _______</span>
                      <span>Lote: _______</span>
                    </div>
                    <div className="mt-1 text-[7.5px] text-slate-500 italic text-center">
                      2ª Via: Retenção da Farmácia / Drogaria • Válida por 10 (dez) dias (RDC Anvisa nº 471/2021).
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2 VIAS EMPILHADAS EM RETRATO (SUPERIOR E INFERIOR) */
        <div className="flex flex-col justify-between h-full flex-1 w-full relative z-10 gap-3">
          {/* 1ª VIA (SUPERIOR) */}
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
                        aria-label="Nome do médico emitente (1ª via retrato)"
                        style={{ fontFamily: 'inherit' }}
                        className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight w-full !bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                      />
                      <input
                        type="text"
                        value={headerConfig.doctorCrm || ''}
                        onChange={e => handleHeaderFieldChange('doctorCrm', e.target.value)}
                        placeholder="CRM-SP 000000"
                        aria-label="CRM do médico emitente (1ª via retrato)"
                        style={{ fontFamily: 'inherit' }}
                        className="text-xs font-bold text-sky-800 mt-0.5 w-full !bg-transparent hover:bg-slate-100/70 focus:bg-sky-50 focus-visible:ring-1 focus-visible:ring-sky-500 rounded px-1 -mx-1 outline-none min-h-6 flex items-center transition"
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-info block">
                        {rotuloVia1}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {headerConfig.showPatientBanner && (
                    <div className="mt-1 pt-1 border-t border-subtle text-xs text-slate-700 flex items-center justify-between">
                      <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                      {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                    </div>
                  )}
                </header>
              )}

              <div
                className="text-slate-900 py-1 font-inherit text-inherit leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorDomHtml || editorHtml) }}
              />
            </div>

            {headerConfig.showFooter && (
              <div className="mt-2 pt-1">
                <div className="border-t border-medium pt-1 flex flex-col items-center justify-center text-center">
                  <div className="w-40 border-b border-medium mb-0.5" />
                  <p className="text-xs font-bold text-slate-900 uppercase">
                    {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                  </p>
                </div>
                {viasDeControleEspecial ? (
                  <>
                    <div className="mt-1 pt-1 border-t border-slate-900 grid grid-cols-2 gap-1 text-[8px] text-slate-700">
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
                          Identificação do Comprador
                        </p>
                        <p><strong>Nome:</strong> _________________________</p>
                        <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                        <p><strong>Endereço:</strong> _____________________</p>
                        <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                      </div>
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
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
                  </>
                ) : (
                  <div className="mt-1 text-[7px] text-slate-500 italic text-center">
                    1ª Via: Orientação ao Paciente • Válida por 10 (dez) dias a partir da emissão (RDC Anvisa nº 471/2021).
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LINHA DE CORTE HORIZONTAL */}
          <div className="relative border-t border-dashed border-medium my-1 flex items-center justify-center select-none">
            <span className="absolute bg-white px-3 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Scissors className="w-3 h-3 text-slate-500" />
              <span>CORTE AQUI</span>
            </span>
          </div>

          {/* 2ª VIA (INFERIOR) */}
          <div className="flex-1 flex flex-col justify-between pt-2">
            <div>
              {headerConfig.showHeader && (
                <header className="border-b border-slate-900 pb-2 mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3
                        style={{ fontFamily: 'inherit' }}
                        className="text-base font-bold uppercase tracking-tight text-slate-900 leading-tight break-words flex items-center"
                      >
                        {headerConfig.doctorName || 'DR(A). MÉDICO(A)'}
                      </h3>
                      <p
                        style={{ fontFamily: 'inherit' }}
                        className="text-xs font-bold text-sky-800 mt-0.5 flex items-center"
                      >
                        {headerConfig.doctorCrm || 'CRM'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-clinical block">
                        {rotuloVia2}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">{headerConfig.dateText || new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {headerConfig.showPatientBanner && (
                    <div className="mt-1 pt-1 border-t border-subtle text-xs text-slate-700 flex items-center justify-between">
                      <span><strong>Paciente:</strong> {patient?.name || headerConfig.patientCustomText || '_____________________'}</span>
                      {patient?.documentNumber && <span>Doc: {patient.documentNumber}</span>}
                    </div>
                  )}
                </header>
              )}

              <div className="text-slate-900 py-1">
                <div
                  className="ProseMirror via-preview-content outline-none leading-relaxed text-inherit"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorDomHtml || editorHtml || editor?.getHTML() || '') }}
                />
              </div>
            </div>

            {headerConfig.showFooter && (
              <div className="mt-2 pt-1">
                <div className="border-t border-medium pt-1 flex flex-col items-center justify-center text-center">
                  <div className="w-40 border-b border-medium mb-0.5" />
                  <p className="text-xs font-bold text-slate-900 uppercase">
                    {headerConfig.footerDocName || headerConfig.doctorName || 'Dr(a). Médico(a)'}
                  </p>
                </div>
                {viasDeControleEspecial ? (
                  <>
                    <div className="mt-1 pt-1 border-t border-slate-900 grid grid-cols-2 gap-1 text-[8px] text-slate-700">
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
                          Identificação do Comprador
                        </p>
                        <p><strong>Nome:</strong> _________________________</p>
                        <p><strong>RG:</strong> _______ <strong>CPF:</strong> ____________</p>
                        <p><strong>Endereço:</strong> _____________________</p>
                        <p><strong>Cidade/UF:</strong> _____ <strong>Tel:</strong> _________</p>
                      </div>
                      <div className="border border-medium rounded p-1 bg-slate-50/50">
                        <p className="font-bold text-[8px] uppercase border-b border-medium pb-0.5 mb-0.5 text-slate-900">
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
                  </>
                ) : (
                  <>
                    <div className="mt-1 pt-1 border-t border-medium text-[7.5px] text-slate-700 flex items-center justify-between gap-2">
                      <span><strong>Dispensação (farmácia):</strong> Data: ___/___/_____</span>
                      <span>Qtd aviada: _______</span>
                      <span>Lote: _______</span>
                    </div>
                    <div className="mt-0.5 text-[7px] text-slate-600 italic text-center">
                      2ª Via: Retenção da Farmácia / Drogaria • Válida por 10 (dez) dias (RDC Anvisa nº 471/2021).
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
