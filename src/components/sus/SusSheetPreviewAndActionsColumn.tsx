import React, { useRef, useState } from 'react';
import { Icon, type IconName } from '../Icon';
import {
  SusDocumentId,
  SusDocumentItem,
  SusFilledFormData,
} from '../../types';
import {
  SUS_DOCUMENTS_CATALOG,
  buildSusDocumentHtml,
  timbreDoDocumentoSus,
} from '../../data/susDocumentsCatalog';
import { camposSemEspaco, formularioOficialDe } from '../../data/formulariosOficiaisSus';
import { exportarFolhaPdf, prepararRaizDeImpressao } from '../../utils/folhaA4';
import { DOMPurify } from '../../utils/sanitizeHtml';
import { FolhaA4 } from '../documento/FolhaA4';
import { FormularioOficialSus } from '../documento/FormularioOficialSus';
import { SusInteractiveVectorSheet } from './SusInteractiveVectorSheet';

const makeIcon = (name: IconName) => ({ className = '', size }: { className?: string; size?: number }) => (
  <Icon name={name} size={size} className={className} />
);

const ArrowLeft = makeIcon('arrow_back');
const Download = makeIcon('download');
const Printer = makeIcon('print');
const Copy = makeIcon('content_copy');
const Layers = makeIcon('layers');
const Edit3 = makeIcon('edit_document');

interface SusFormHeaderBarProps {
  currentDocItem: SusDocumentItem;
  hasOfficialForm: boolean;
  selectedDocIds: SusDocumentId[];
  activeFormDocId: SusDocumentId;
  onBackToList: () => void;
  onSelectActiveDocId: (id: SusDocumentId) => void;
}

export const SusFormHeaderBar: React.FC<SusFormHeaderBarProps> = ({
  currentDocItem,
  hasOfficialForm,
  selectedDocIds,
  activeFormDocId,
  onBackToList,
  onSelectActiveDocId,
}) => (
  <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBackToList}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition cursor-pointer"
        title="Voltar para a lista de exames SUS"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
          {hasOfficialForm
            ? 'Impresso oficial do Ministério da Saúde'
            : 'Modelo do PresCMed (sem impresso nacional único)'}{' '}
          • {currentDocItem.system}
        </span>
        <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate max-w-lg">
          {currentDocItem.title}
        </h2>
      </div>
    </div>

    {selectedDocIds.length > 1 && (
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">
          Documento:
        </span>
        {selectedDocIds.map((id) => {
          const doc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === id);
          const isActive = activeFormDocId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectActiveDocId(id)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-navy-900 dark:bg-[#0369A1] text-white border-navy-900 dark:border-sky-500/30 shadow-tactile-sm'
                  : 'bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/10'
              }`}
            >
              {doc?.shortTitle || id}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

interface SusSheetPreviewAndActionsColumnProps {
  currentDocItem: SusDocumentItem;
  formData: SusFilledFormData;
  selectedDocIds: SusDocumentId[];
  isExportingPdf: boolean;
  setIsExportingPdf: (loading: boolean) => void;
  getFilledDataForDoc: (docId: SusDocumentId) => SusFilledFormData;
  timbreDe: (doc: SusDocumentItem) => ReturnType<typeof timbreDoDocumentoSus>;
  onFieldChange: <K extends keyof SusFilledFormData>(
    field: K,
    value: SusFilledFormData[K] | string
  ) => void;
  onOpenInEditor: () => void;
  onOpenAllInEditor: () => void;
  onCopyMarkdown: () => void;
  showToast: (msg: string) => void;
}

export const SusSheetPreviewAndActionsColumn: React.FC<SusSheetPreviewAndActionsColumnProps> = ({
  currentDocItem,
  formData,
  selectedDocIds,
  isExportingPdf,
  setIsExportingPdf,
  getFilledDataForDoc,
  timbreDe,
  onFieldChange,
  onOpenInEditor,
  onOpenAllInEditor,
  onCopyMarkdown,
  showToast,
}) => {
  const [modoFolhaSus, setModoFolhaSus] = useState<'padrao' | 'vetorial_interativo'>(
    'vetorial_interativo'
  );
  const folhaSusRef = useRef<HTMLDivElement>(null);

  const pendenciasClinicas = [
    currentDocItem.id !== 'lme_medicamentos' &&
      !(formData.sigtapCode?.trim() && formData.procedureName?.trim()) &&
      'procedimento (código e nome)',
    currentDocItem.id === 'lme_medicamentos' &&
      !formData.lmeMedications?.some((m) => m.name?.trim()) &&
      'medicamento',
    !formData.cid10Code?.trim() && 'CID-10',
    !formData.clinicalJustification?.trim() && 'justificativa clínica',
    currentDocItem.id === 'apac_complementar' &&
      !(formData.renalCreatinine?.trim() && formData.renalEtfg?.trim()) &&
      'função renal',
  ].filter(Boolean) as string[];

  const formularioOficial = formularioOficialDe(currentDocItem.id);
  const camposCortados = formularioOficial ? camposSemEspaco(formularioOficial, formData) : [];
  const classeDaFolha = (oficial: boolean) =>
    `select-text ${oficial ? 'folha-a4--formulario' : ''}`;

  const nomeArquivo = (prefixo: string) =>
    `${prefixo}_${(formData.patientName || 'Paciente').trim().replace(/\s+/g, '_')}.pdf`;

  const handlePrintSheet = () => {
    prepararRaizDeImpressao(folhaSusRef.current, 'portrait');
    window.print();
  };

  const handleDownloadPdf = async (downloadAll = false) => {
    const folhaAtual = folhaSusRef.current;
    if (!folhaAtual) return;

    let bancadaOculta: HTMLDivElement | null = null;
    try {
      setIsExportingPdf(true);

      if (!downloadAll || selectedDocIds.length <= 1) {
        await exportarFolhaPdf(
          folhaAtual,
          nomeArquivo(currentDocItem.shortTitle.replace(/\s+/g, '_'))
        );
        showToast('PDF do documento gerado.');
        return;
      }

      bancadaOculta = document.createElement('div');
      bancadaOculta.style.cssText = 'position:fixed;left:-10000px;top:0;';
      const { renderToStaticMarkup } = await import('react-dom/server');
      const folhas = selectedDocIds.flatMap((docId) => {
        const docItem = SUS_DOCUMENTS_CATALOG.find((d) => d.id === docId);
        if (!docItem) return [];
        const oficial = formularioOficialDe(docId);
        const folha = document.createElement('div');
        folha.className = `folha-a4 ${classeDaFolha(Boolean(oficial))}`;
        folha.style.width = `${folhaAtual.offsetWidth}px`;
        folha.innerHTML = DOMPurify.sanitize(
          oficial
            ? renderToStaticMarkup(
                <FormularioOficialSus formulario={oficial} dados={getFilledDataForDoc(docId)} />
              )
            : buildSusDocumentHtml(docItem, getFilledDataForDoc(docId), timbreDe(docItem))
        );
        bancadaOculta!.appendChild(folha);
        return [folha];
      });
      document.body.appendChild(bancadaOculta);

      await exportarFolhaPdf(folhas, nomeArquivo('Documentos_SUS'));
      showToast(`PDF com ${folhas.length} documentos gerado.`);
    } catch (err) {
      console.error('Erro ao gerar PDF do documento SUS:', err);
      showToast('Não foi possível gerar o PDF. Tente novamente ou use Imprimir.');
    } finally {
      bancadaOculta?.remove();
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="lg:col-span-5 flex flex-col gap-3.5">
      {/* Barra de Ações Enxuta */}
      <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col gap-2.5">
        {pendenciasClinicas.length > 0 && (
          <p
            role="status"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10"
          >
            Em branco: {pendenciasClinicas.join(', ')}.
          </p>
        )}

        {camposCortados.length > 0 && (
          <p
            role="alert"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#27354A] text-rose-700 dark:text-rose-300 border border-slate-300 dark:border-white/10"
          >
            Texto cortado com […] {camposCortados.length > 1 ? 'nos campos' : 'no campo'}{' '}
            {camposCortados.join(', ')}.
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintSheet}
            aria-label="Imprimir folha A4"
            title="Imprimir folha A4 (Ctrl+P)"
            className="btn-tactile-primary h-11 min-h-[44px] px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPdf(false)}
            disabled={isExportingPdf}
            aria-label="Baixar PDF do documento atual"
            title="Baixar PDF do documento atual"
            className="btn-tactile-secondary h-11 min-h-[44px] px-3 text-xs font-bold flex-1 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Gerando...' : 'PDF'}</span>
          </button>

          {selectedDocIds.length > 1 && (
            <button
              type="button"
              onClick={() => handleDownloadPdf(true)}
              disabled={isExportingPdf}
              aria-label={`Baixar todos os ${selectedDocIds.length} documentos em PDF`}
              title={`Baixar todos os ${selectedDocIds.length} documentos selecionados em um único arquivo PDF`}
              className="btn-tactile-clinical h-11 min-h-[44px] px-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Layers className="w-4 h-4" />
              <span>{isExportingPdf ? '...' : `Todos (${selectedDocIds.length})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={selectedDocIds.length > 1 ? onOpenAllInEditor : onOpenInEditor}
            aria-label="Abrir no Editor A4"
            title={
              selectedDocIds.length > 1
                ? `Abrir todos (${selectedDocIds.length}) no Editor A4`
                : 'Abrir no Editor A4'
            }
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4 text-sky-500" />
          </button>

          <button
            type="button"
            onClick={onCopyMarkdown}
            aria-label="Copiar laudo"
            title="Copiar laudo estruturado para colar no PEP / e-SUS APS"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0"
          >
            <Copy className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Folha Física A4 Prévia (Papel Branco com Tipografia Grafite) */}
      <div className="p-2 rounded-2xl bg-slate-900/5 dark:bg-slate-950/40 border border-subtle dark:border-strong space-y-2">
        <div className="no-print flex items-center justify-between gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Icon name="layers" size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Padrão de Folha SUS</span>
          </span>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => setModoFolhaSus('vetorial_interativo')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                modoFolhaSus === 'vetorial_interativo'
                  ? 'bg-white dark:bg-[#1E293B] text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grade Vetorial SIA/SUS 12 colunas com edição direta clicando na folha A4"
            >
              Grade Vetorial Interativa
            </button>
            <button
              type="button"
              onClick={() => setModoFolhaSus('padrao')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                modoFolhaSus === 'padrao'
                  ? 'bg-white dark:bg-[#1E293B] text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={
                formularioOficial
                  ? 'Impresso oficial escaneado do Ministério da Saúde'
                  : 'Laudo técnico estruturado clássico'
              }
            >
              {formularioOficial ? 'Impresso Oficial MS' : 'Laudo Clássico'}
            </button>
          </div>
        </div>

        <FolhaA4
          ref={folhaSusRef}
          id="sus-document-print-sheet"
          imprimivel
          className={classeDaFolha(Boolean(formularioOficial && modoFolhaSus === 'padrao'))}
        >
          {modoFolhaSus === 'vetorial_interativo' ? (
            <SusInteractiveVectorSheet
              docItem={currentDocItem}
              formData={formData}
              timbre={timbreDe(currentDocItem)}
              onFieldChange={(key, val) => onFieldChange(key, val as never)}
            />
          ) : formularioOficial ? (
            <FormularioOficialSus formulario={formularioOficial} dados={formData} />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  buildSusDocumentHtml(currentDocItem, formData, timbreDe(currentDocItem))
                ),
              }}
            />
          )}
        </FolhaA4>
      </div>
    </div>
  );
};
