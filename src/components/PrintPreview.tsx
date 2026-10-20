import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icon';
import { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral, WorkContext, WatermarkType } from '../types';
import { exportarFolhaPdf } from '../utils/folhaA4';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import type { RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import {
  DOCUMENTO_DO_REGIME,
  nomeArquivoDocumento,
  nomeDoPaciente,
  orientacaoDoDocumento,
  resolverIdentidade,
  separarPorRegime,
  type TipoDocumento
} from '../utils/documentoClinico';
import { FolhaA4 } from './documento/FolhaA4';
import { DocumentoClinico } from './documento/DocumentoClinico';
import { AvisoNotificacaoReceita } from './AvisoNotificacaoReceita';
import { formatarDocumentoPreviewTexto } from '../utils/compartilhamentoTexto';
import WatermarkSelector from './WatermarkSelector';

/**
 * Tela de Emissão e Prévia A4.
 * Estados de UI cobertos: empty (vazio sem itens), loading (carregando exportação PDF),
 * success (sucesso ao copiar/exportar) e error (erro na geração ou médico não configurado).
 */

interface PrintPreviewProps {
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  exams: ExamItem[];
  examIndication: string;
  certificate: MedicalCertificate;
  referral: MedicalReferral;
  activeContext?: WorkContext | null;
  initialDocType?: TipoDocumento;
  onBack: () => void;
  onAbrirPerfilMedico?: () => void;
}

const AVISO_SEM_MEDICO = 'Configure nome e CRM do médico para emitir documentos';
const REGIMES: RegimeReceita[] = ['simples', 'antimicrobiano', 'controle_especial'];
const NOME_DO_REGIME: Record<RegimeReceita, string> = {
  simples: 'simples',
  antimicrobiano: 'antimicrobiano',
  controle_especial: 'controle especial'
};

/**
 * Tela de emissão: mostra a folha A4 do documento e as ações de saída. A
 * folha exibida (FolhaA4 + DocumentoClinico) é a mesma que vai para a
 * impressora e para o PDF — não há um segundo desenho do documento.
 */
export const PrintPreview: React.FC<PrintPreviewProps> = ({
  doctor,
  patient,
  prescriptionItems,
  exams,
  examIndication,
  certificate,
  referral,
  activeContext = null,
  initialDocType = 'prescription',
  onBack,
  onAbrirPerfilMedico
}) => {
  const isConfigured = medicoConfigurado(doctor);

  // Cada regime sanitário sai em um documento próprio: receita simples, antimicrobiano
  // (2 vias, RDC 471/2021) e controle especial (2 vias, Portaria 344/98).
  const porRegime = useMemo(() => separarPorRegime(prescriptionItems), [prescriptionItems]);
  const itensDoTipo = (tipo: TipoDocumento): PrescriptionItem[] | null => {
    if (tipo === 'prescription') return porRegime.simples;
    if (tipo === 'antimicrobial_prescription') return porRegime.antimicrobiano;
    if (tipo === 'special_prescription') return porRegime.controle_especial;
    return null;
  };
  const receitasComItens = REGIMES.filter((regime) => porRegime[regime].length > 0);

  // Se a receita pedida não tem itens, abre a primeira receita que tiver
  const resolverTipoInicial = (tipo: TipoDocumento): TipoDocumento => {
    const itens = itensDoTipo(tipo);
    if (itens === null || itens.length > 0 || receitasComItens.length === 0) return tipo;
    return DOCUMENTO_DO_REGIME[receitasComItens[0]];
  };

  const [docType, setDocType] = useState<TipoDocumento>(() => resolverTipoInicial(initialDocType));
  const [textoCopiado, setTextoCopiado] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [ajustarATela, setAjustarATela] = useState(true);
  const [docWatermark, setDocWatermark] = useState<WatermarkType>(activeContext?.watermarkType || 'none');

  const folhaRef = useRef<HTMLDivElement>(null);
  const emissao = useMemo(() => new Date(), []);

  useEffect(() => {
    setDocType(resolverTipoInicial(initialDocType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDocType, receitasComItens.join(',')]);

  useEffect(() => {
    if (activeContext?.watermarkType !== undefined) {
      setDocWatermark(activeContext.watermarkType);
    }
  }, [activeContext?.watermarkType]);

  // Itens da folha conforme a aba selecionada (regimes diferentes nunca dividem a mesma folha)
  const itensDaFolha = itensDoTipo(docType) ?? prescriptionItems;

  const identidade = resolverIdentidade(doctor, activeContext);
  const patientName = nomeDoPaciente(patient, identidade.exemplo, [certificate?.patientName, referral?.patientName]);
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : null;

  const handleExportPDF = async () => {
    if (!isConfigured || !folhaRef.current) return;

    try {
      setIsExportingPdf(true);
      setPdfError(null);
      await exportarFolhaPdf(folhaRef.current, nomeArquivoDocumento(docType, patientName, emissao), {
        orientation: orientacaoDoDocumento(docType)
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Erro ao exportar PDF da folha:', err);
      setPdfError('Não foi possível gerar o PDF. Tente novamente ou use Imprimir.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Texto formatado para WhatsApp e área de transferência
  const getFormattedDocumentText = (): string => {
    return formatarDocumentoPreviewTexto({
      isConfigured,
      docType,
      emissao,
      identidade,
      patientName,
      patientWeight,
      ehReceita: itensDoTipo(docType) !== null,
      itensDaFolha,
      certificate,
      referral,
      exams,
      examIndication
    });
  };

  const handleSendWhatsApp = () => {
    const text = getFormattedDocumentText();
    if (!text) {
      setPdfError('Não há conteúdo neste documento para enviar.');
      return;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyFormattedText = async () => {
    const text = getFormattedDocumentText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setTextoCopiado(true);
      setTimeout(() => setTextoCopiado(false), 2000);
    } catch {
      setPdfError('Não foi possível copiar o texto neste navegador.');
    }
  };

  const handlePrint = () => {
    if (!isConfigured) return;
    window.print();
  };

  const abas: Array<{ id: TipoDocumento; rotulo: string; icone: string }> = [
    { id: 'prescription', rotulo: `Receita Simples (${porRegime.simples.length})`, icone: 'description' },
    // As receitas de 2 vias só aparecem quando há medicamento desse regime na consulta
    ...(porRegime.antimicrobiano.length > 0
      ? [{ id: 'antimicrobial_prescription' as const, rotulo: `Antimicrobiano • 2 Vias (${porRegime.antimicrobiano.length})`, icone: 'layers' }]
      : []),
    ...(porRegime.controle_especial.length > 0
      ? [{ id: 'special_prescription' as const, rotulo: `Controle Especial • 2 Vias (${porRegime.controle_especial.length})`, icone: 'layers' }]
      : []),
    { id: 'exams', rotulo: `Exames (${exams.length})`, icone: 'science' },
    { id: 'certificate', rotulo: 'Atestado', icone: 'workspace_premium' },
    { id: 'referral', rotulo: 'Encaminhamento', icone: 'share' }
  ];

  const tituloAcao = (texto: string) => (isConfigured ? texto : AVISO_SEM_MEDICO);
  const classeBotaoSecundario =
    'btn-tactile-secondary h-10 sm:h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold items-center gap-2 shrink-0 whitespace-nowrap transition active:scale-95 cursor-pointer shadow-tactile-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none';

  return (
    <div data-state="idle" aria-busy={false} id="print-preview-section" className="space-y-4 sm:space-y-5 pb-12">
      {/* Barra de ações */}
      <div className="tactile-card surface-card-minimal p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 no-print bg-[var(--surface-card)] border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl border flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition active:scale-95 tactile-btn-secondary bg-[var(--surface-inset)] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            title="Voltar para edição"
            aria-label="Voltar para edição"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">Emitir documento</h2>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              O PDF e a impressão saem exatamente como a folha abaixo.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-2.5 max-w-full">
          {!isConfigured && (
            <div
              role="status"
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold border bg-amber-500/10 text-amber-900 dark:text-amber-200 border-warning"
            >
              <span>Configure nome e CRM do médico para emitir documentos.</span>
              {onAbrirPerfilMedico && (
                <button
                  type="button"
                  onClick={onAbrirPerfilMedico}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer active:scale-95 transition shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  Configurar médico
                </button>
              )}
            </div>
          )}

          {pdfError && (
            <div
              role="alert"
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold border bg-rose-500/10 text-rose-900 dark:text-rose-200 border-rose-500/25"
            >
              <span>{pdfError}</span>
              <button
                type="button"
                onClick={() => setPdfError(null)}
                className="text-rose-700 dark:text-rose-300 font-bold hover:underline shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                Fechar
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full custom-scrollbar">
            <button
              type="button"
              onClick={handleCopyFormattedText}
              disabled={!isConfigured}
              className={`${classeBotaoSecundario} flex`}
              title={tituloAcao('Copiar o texto do documento para o prontuário')}
            >
              {textoCopiado ? (
                <Icon name="check" className="text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Icon name="content_copy" className="text-[16px] text-slate-500 dark:text-slate-400 shrink-0" />
              )}
              <span>{textoCopiado ? 'Copiado!' : 'Copiar texto'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!isConfigured}
              className={`${classeBotaoSecundario} flex`}
              title={tituloAcao('Enviar o texto do documento pelo WhatsApp')}
            >
              <Icon name="send" className="text-[16px] text-slate-500 dark:text-slate-400 shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!isConfigured}
              aria-label="Imprimir a folha"
              className="btn-tactile-secondary w-10 sm:w-11 h-10 sm:h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer shadow-tactile-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={tituloAcao('Imprimir a folha (Ctrl+P)')}
            >
              <Icon name="print" className="text-[16px] text-slate-500 dark:text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPdf || !isConfigured}
              className="btn-tactile-primary h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 whitespace-nowrap shadow-tactile-btn transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={tituloAcao('Baixar o PDF desta folha')}
            >
              {isExportingPdf ? (
                <>
                  <Icon name="sync" className="text-[16px] animate-spin shrink-0" />
                  <span>Gerando PDF...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Icon name="check" className="text-[16px] shrink-0" />
                  <span>PDF baixado</span>
                </>
              ) : (
                <>
                  <Icon name="download" className="text-[16px] shrink-0" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tipo de documento, marca d'água e zoom */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {abas.map(({ id, rotulo, icone }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDocType(id)}
              aria-pressed={docType === id}
              className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                docType === id
                  ? 'bg-sky-600 text-white border-info shadow-tactile-sm font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-subtle dark:border-strong hover:bg-slate-50 dark:hover:bg-slate-700/80'
              }`}
            >
              <Icon name={icone} className="text-[16px]" />
              <span>{rotulo}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <WatermarkSelector currentType={docWatermark} onChange={setDocWatermark} />

          <button
            type="button"
            onClick={() => setAjustarATela(!ajustarATela)}
            className="lg:hidden px-3 py-2 min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-main)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 btn-tactile-secondary transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            title={ajustarATela ? 'Ver em tamanho real' : 'Ajustar à tela'}
          >
            <Icon name={ajustarATela ? 'open_in_full' : 'close_fullscreen'} className="text-[16px]" />
            <span>{ajustarATela ? 'Tamanho real' : 'Ajustar'}</span>
          </button>
        </div>
      </div>

      {/* Mais de uma receita na mesma consulta: cada uma é um documento e precisa ser emitida */}
      {receitasComItens.length > 1 && itensDoTipo(docType) !== null && (
        <div role="status" className="no-print px-4 py-2.5 rounded-xl border text-xs font-semibold bg-sky-500/10 text-sky-900 dark:text-sky-200 border-info">
          Esta consulta gera {receitasComItens.length} receitas separadas ({receitasComItens.map((r) => NOME_DO_REGIME[r]).join(', ')}).
          Emita cada uma pela sua aba.
        </div>
      )}

      {/* Controlados que exigem Notificação de Receita em talonário próprio (aviso de tela, fora da folha) */}
      {docType === 'special_prescription' && <AvisoNotificacaoReceita items={itensDaFolha} />}

      {/* Bancada com a folha A4: única fonte da prévia, da impressão e do PDF */}
      <div className="p-3 sm:p-8 bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl border border-subtle dark:border-strong shadow-tactile-inset dark:shadow-tactile-inset-dark">
        <FolhaA4
          ref={folhaRef}
          id="printable-a4-sheet"
          orientacao={orientacaoDoDocumento(docType)}
          ajustarALargura={ajustarATela}
          imprimivel
          className={isConfigured ? '' : 'no-print'}
        >
          <DocumentoClinico
            tipo={docType}
            doctor={doctor}
            patient={patient}
            activeContext={activeContext}
            prescriptionItems={itensDaFolha}
            exams={exams}
            examIndication={examIndication}
            certificate={certificate}
            referral={referral}
            marcaDagua={docWatermark}
            emissao={emissao}
          />
        </FolhaA4>
      </div>
    </div>
  );
};

export default PrintPreview;
