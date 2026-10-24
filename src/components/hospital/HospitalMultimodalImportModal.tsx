import React, { useState, useRef } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import {
  extractStructuredHospitalDataFromRawInput,
  type MultimodalExtractionResult,
} from '../../utils/hospital/hospitalMultimodalIngestor';

export interface HospitalMultimodalImportModalProps {
  isOpen: boolean;
  activeBedCode: string;
  onClose: () => void;
  onApplyExtraction: (extraction: MultimodalExtractionResult) => void;
}

const SAMPLE_RAW_CLINICAL_TEXT = `EF/LT : 110-15
ID: J. C. M. (Pront. 77410)
DN: 12/03/1958
CNS: 706509812340912
DIH: 21/10/2026
QP: "Febre alta, tosse produtiva e cansaço há 3 dias"
HDA: 21/10/2026: Admitido na emergência com dispneia, SpO2 89% em AA e consolidação basal direita. 23/10/2026: Melhora da curva térmica após 48h de Piperacilina-Tazobactam.
ALERGIAS: Penicilina Benzatina (rash cutâneo prévio)
SOROLOGIAS: HIV NR | HBsAg NR | Anti-HCV NR | VDRL NR (21/10/2026)
HPP: DPOC GOLD B, HAS em uso de Losartana
21/10/2026: HB 13,1 | HT 39 | LEU 17200 | SEG 84 | PLQ 210000 | CR 1,5 | UR 62 | NA 136 | K 4,6 | CL 100 | PCR 168
24/10/2026: HB 12,9 | HT 38 | LEU 9800 | SEG 68 | PLQ 240000 | CR 1,0 | UR 38 | NA 139 | K 4,2 | CL 102 | PCR 28
EVOLUÇÃO 24H: Paciente afebril nas últimas 24h, hemodinamicamente estável sem drogas vasoativas, SpO2 94% em cateter nasal 1 L/min, diurese clara 1500 mL/24h.
DIETA: Dieta oral branda para DPOC/HAS
HIDRATAÇÃO: SF 0,9% 500 mL EV 12/12h em bomba de infusão`;

export const HospitalMultimodalImportModal: React.FC<HospitalMultimodalImportModalProps> = ({
  isOpen,
  activeBedCode,
  onClose,
  onApplyExtraction,
}) => {
  const [rawInputText, setRawInputText] = useState('');
  const [sourceLabel, setSourceLabel] = useState('Texto Colado / Prontuário');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(null);
  const [extractionPreview, setExtractionPreview] = useState<MultimodalExtractionResult | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useModalAccessibility(isOpen, onClose, modalRef, textareaRef);

  if (!isOpen) return null;

  const handleRunDeterministicExtraction = (textToParse?: string, customSource?: string) => {
    const targetText = textToParse !== undefined ? textToParse : rawInputText;
    const label = customSource || sourceLabel;
    const result = extractStructuredHospitalDataFromRawInput(targetText, label);
    setExtractionPreview(result);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceLabel(`Arquivo: ${file.name}`);

    if (file.type.startsWith('text/') || /\.(txt|md|csv|json|html)$/i.test(file.name)) {
      const content = await file.text();
      setRawInputText(content);
      handleRunDeterministicExtraction(content, `Arquivo: ${file.name}`);
      return;
    }

    // Para arquivos binários (.pdf, .doc, .docx, imagens/fotos), extrai texto legível do buffer quando disponível
    try {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const decoded = decoder
        .decode(buffer)
        .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      const headerNote = `[Fonte Multimodal: ${file.name} (${Math.round(file.size / 1024)} KB)]\n`;
      const combined = rawInputText ? `${rawInputText}\n${headerNote}` : `${headerNote}${decoded.slice(0, 2500)}`;
      setRawInputText(combined);
      handleRunDeterministicExtraction(combined, `Documento Multimodal: ${file.name}`);
    } catch {
      setVoiceStatusMessage(`Arquivo ${file.name} carregado. Cole ou complemente os achados para validação estruturada.`);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const clip = await navigator.clipboard.readText();
        if (clip.trim()) {
          setRawInputText(clip);
          setSourceLabel('Área de Transferência (Clipboard)');
          handleRunDeterministicExtraction(clip, 'Área de Transferência (Clipboard)');
        }
      }
    } catch {
      setVoiceStatusMessage('Use Ctrl+V diretamente na caixa de texto abaixo.');
    }
  };

  const handleToggleVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const winWithSpeech = window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
    };

    const SpeechCtor = winWithSpeech.SpeechRecognition || winWithSpeech.webkitSpeechRecognition;
    if (!SpeechCtor) {
      setVoiceStatusMessage('Reconhecimento de voz nativo indisponível neste navegador. Use digitação ou colagem.');
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setVoiceStatusMessage('Ditado finalizado.');
      return;
    }

    try {
      const recognition = new SpeechCtor();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
      setIsRecordingVoice(true);
      setVoiceStatusMessage('Ouvindo ditado médico (pt-BR)... Fale os dados de evolução ou exames.');

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          const updated = rawInputText ? `${rawInputText}\n${transcript}` : transcript;
          setRawInputText(updated);
          setSourceLabel('Transcrição de Ditado Médico (Voz)');
          handleRunDeterministicExtraction(updated, 'Transcrição de Ditado Médico (Voz)');
        }
      };
      recognition.onerror = () => {
        setIsRecordingVoice(false);
        setVoiceStatusMessage('Não foi possível capturar o áudio do microfone.');
      };
      recognition.onend = () => {
        setIsRecordingVoice(false);
      };
      recognition.start();
    } catch {
      setIsRecordingVoice(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-multimodal-modal-title"
      data-state="idle"
      aria-busy={false}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-backdrop-fade no-print"
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-main)] shadow-2xl overflow-hidden modal-surface-spring"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--surface-inset)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Icon name="auto_awesome" size={18} />
            </span>
            <div className="min-w-0">
              <h2 id="hospital-multimodal-modal-title" className="text-sm sm:text-base font-bold truncate">
                Importação Multimodal & Extração Estruturada — Leito {activeBedCode}
              </h2>
              <p className="text-xs text-[var(--text-muted)] truncate">
                Diretriz de Rigor Terapêutico: ordenação estritamente cronológica e zero dados clínicos inventados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar importação multimodal"
            className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna Esquerda: Entrada Bruta e Canais Multimodais */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Selecionar arquivo clínico para importação"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="upload" size={15} className="text-sky-600 dark:text-sky-400" />
                <span>Arquivo (.pdf, .docx, Foto)</span>
              </button>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="content_copy" size={15} className="text-sky-600 dark:text-sky-400" />
                <span>Colar Prontuário</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                  isRecordingVoice
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'btn-tactile-secondary'
                }`}
              >
                <Icon name="call" size={15} />
                <span>{isRecordingVoice ? 'Ouvindo Ditado...' : 'Ditado por Voz'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRawInputText(SAMPLE_RAW_CLINICAL_TEXT);
                  setSourceLabel('Prontuário de Demonstração (Rigor Terapêutico)');
                  handleRunDeterministicExtraction(SAMPLE_RAW_CLINICAL_TEXT, 'Prontuário de Demonstração');
                }}
                className="h-9 px-3 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] cursor-pointer"
              >
                Carregar Exemplo Realista
              </button>
            </div>

            {voiceStatusMessage && (
              <div role="status" className="px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-700 dark:text-sky-300">
                {voiceStatusMessage}
              </div>
            )}

            <div>
              <label htmlFor="multimodal-raw-textarea" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Dados Brutos de Entrada (Texto Colado, Evolução Prévia, Exames ou Transcrição)
              </label>
              <textarea
                ref={textareaRef}
                id="multimodal-raw-textarea"
                rows={11}
                value={rawInputText}
                onChange={(e) => setRawInputText(e.target.value)}
                placeholder="Ex.: EF/LT : 110-15 | ID: Paciente | DN: 14/05/1962 | 20/10/2026: HB 12,1 | HT 36 | LEU 14500 | CR 1,4 | K 4,5..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-3 text-xs font-mono leading-relaxed text-[var(--text-main)] focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleRunDeterministicExtraction()}
                className="btn-tactile-primary h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Icon name="fact_check" size={16} />
                <span>Processar e Organizar em Ordem Cronológica</span>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Auditoria de Rigor Terapêutico (Diff Verificado) */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                <span className="text-xs font-bold text-[var(--text-main)]">
                  Auditoria de Extração (Zero Alucinação)
                </span>
                <Badge tone={extractionPreview && extractionPreview.extractedFieldsCount > 0 ? 'clinical' : 'neutral'} tabular>
                  {extractionPreview ? `${extractionPreview.extractedFieldsCount} campos` : 'Aguardando'}
                </Badge>
              </div>

              {!extractionPreview ? (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed py-6 text-center">
                  Cole um registro bruto, envie um documento ou use o ditado por voz e clique em <strong>Processar</strong> para auditar os campos antes de preencher o leito.
                </p>
              ) : extractionPreview.extractedFieldsCount === 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed py-4">
                  Nenhum rótulo estruturado ou linha de exame datada foi detectado. Campos ausentes permanecem vazios sem invenção de dados.
                </p>
              ) : (
                <>
                  {extractionPreview.chronologicalDatesFound.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Linha do Tempo Cronológica Detectada
                      </p>
                      <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 clinical-tabular-nums">
                        {extractionPreview.chronologicalDatesFound.join(' -> ')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {extractionPreview.verifiedExcerpts.map((item, idx) => (
                      <div
                        key={`${item.field}-${idx}`}
                        className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sky-700 dark:text-sky-300">{item.field}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Verificado na fonte
                          </span>
                        </div>
                        <p className="text-[var(--text-main)] font-medium break-words clinical-tabular-nums">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!extractionPreview || extractionPreview.extractedFieldsCount === 0}
                onClick={() => {
                  if (extractionPreview) {
                    onApplyExtraction(extractionPreview);
                    onClose();
                  }
                }}
                className="btn-tactile-primary h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Icon name="check_circle" size={15} />
                <span>Aplicar ao Leito {activeBedCode}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
