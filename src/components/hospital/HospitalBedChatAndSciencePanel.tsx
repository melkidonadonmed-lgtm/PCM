import React, { useState, useRef } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type {
  HospitalBedChatMessage,
  HospitalBedPatientRecord,
} from '../../core/domain/clinicalEntities';
import {
  SCIENCE_CLINICAL_GUIDELINES,
  generateBedCopilotResponse,
} from '../../utils/hospital/hospitalAiAssistantService';
import {
  extractStructuredHospitalDataFromRawInput,
  mergeExtractedHospitalDataIntoBed,
} from '../../utils/hospital/hospitalMultimodalIngestor';

export interface HospitalBedChatAndSciencePanelProps {
  allBeds: HospitalBedPatientRecord[];
  activeBed: HospitalBedPatientRecord;
  onSelectBed: (bedId: string) => void;
  onUpdateBed: (updated: HospitalBedPatientRecord) => void;
}

export const HospitalBedChatAndSciencePanel: React.FC<HospitalBedChatAndSciencePanelProps> = ({
  allBeds,
  activeBed,
  onSelectBed,
  onUpdateBed,
}) => {
  const [channel, setChannel] = useState<'bed_copilot' | 'science_protocol' | 'live_voice'>('bed_copilot');
  const [promptInput, setPromptInput] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSendMessage = (customPrompt?: string) => {
    const text = (customPrompt !== undefined ? customPrompt : promptInput).trim();
    if (!text) return;

    const userMsg: HospitalBedChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      channel,
      content: text,
      attachedFileName: attachedFileName || undefined,
      createdAtIso: new Date().toISOString(),
    };

    const replyMsg = generateBedCopilotResponse(text, activeBed, channel);

    onUpdateBed({
      ...activeBed,
      chatMessages: [...activeBed.chatMessages, userMsg, replyMsg],
      updatedAt: Date.now(),
    });
    setPromptInput('');
    setAttachedFileName(null);
  };

  const handleAttachFileInChat = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFileName(file.name);

    try {
      const textContent = await file.text();
      const extracted = extractStructuredHospitalDataFromRawInput(textContent, `Anexo Chat: ${file.name}`);
      if (extracted.extractedFieldsCount > 0) {
        const merged = mergeExtractedHospitalDataIntoBed(activeBed, extracted);
        const sysMsg: HospitalBedChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          channel: 'bed_copilot',
          content: `Arquivo "${file.name}" processado sob Diretriz de Rigor Terapêutico: ${extracted.extractedFieldsCount} campos verificados e integrados em ordem cronológica ao Leito ${activeBed.wardAndBed}.`,
          attachedFileName: file.name,
          createdAtIso: new Date().toISOString(),
        };
        onUpdateBed({
          ...merged,
          chatMessages: [...merged.chatMessages, sysMsg],
        });
      }
    } catch {
      // Caso binário puro, mantém apenas o nome anexado para envio na mensagem
    }
  };

  const handleToggleLiveVoiceSession = () => {
    if (typeof window === 'undefined') return;
    setChannel('live_voice');
    const winWithSpeech = window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
    };
    const SpeechCtor = winWithSpeech.SpeechRecognition || winWithSpeech.webkitSpeechRecognition;
    if (!SpeechCtor) {
      handleSendMessage('Resumo executivo em tempo real (Live API) do leito ativo e pendências.');
      return;
    }

    if (isLiveListening) {
      setIsLiveListening(false);
      return;
    }

    try {
      const rec = new SpeechCtor();
      rec.lang = 'pt-BR';
      setIsLiveListening(true);
      rec.onresult = (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      rec.onend = () => setIsLiveListening(false);
      rec.start();
    } catch {
      setIsLiveListening(false);
    }
  };

  return (
    <div data-state="idle" aria-busy={false} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Coluna Principal: Assistente Virtual por Leito + Live API + Science */}
      <div className="lg:col-span-8 card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 flex flex-col justify-between min-h-96 space-y-4">
        {/* Topo com Seletor Instantâneo de Leito e Modos do Agente */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-instant-bed-selector" className="text-xs font-bold text-[var(--text-muted)]">
              Leito Ativo:
            </label>
            <select
              id="chat-instant-bed-selector"
              value={activeBed.id}
              onChange={(e) => onSelectBed(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold text-[var(--text-main)] clinical-tabular-nums"
            >
              {allBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  EF/LT {b.wardAndBed} — {b.patientNameOrInitials || 'Sem ID'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setChannel('bed_copilot')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                channel === 'bed_copilot'
                  ? 'bg-sky-600 text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Assistente do Leito
            </button>
            <button
              type="button"
              onClick={() => setChannel('science_protocol')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                channel === 'science_protocol'
                  ? 'bg-emerald-600 text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Agente Science (Literatura)
            </button>
            <button
              type="button"
              onClick={handleToggleLiveVoiceSession}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                isLiveListening || channel === 'live_voice'
                  ? 'bg-rose-600 text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon name="call" size={13} />
              <span>{isLiveListening ? 'Live Ativo...' : 'Live API (Voz)'}</span>
            </button>
          </div>
        </div>

        {/* Histórico Persistente de Mensagens do Caso */}
        <div className="flex-1 overflow-y-auto max-h-80 space-y-3 pr-1">
          {activeBed.chatMessages.length === 0 ? (
            <div className="p-6 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-center space-y-2">
              <p className="text-xs font-bold text-[var(--text-main)]">
                Memória Clínica Persistente — Leito {activeBed.wardAndBed} ({activeBed.patientNameOrInitials || 'Novo Paciente'})
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Discuta a evolução das 24h, envie exames em anexo, acione a Live API por voz ou consulte diretrizes mundiais no modo <strong>Agente Science</strong>.
              </p>
            </div>
          ) : (
            activeBed.chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  msg.role === 'user'
                    ? 'bg-sky-500/10 border-sky-500/30 ml-6'
                    : msg.role === 'science'
                      ? 'bg-emerald-500/10 border-emerald-500/30 mr-4'
                      : 'bg-[var(--surface-inset)] border-[var(--border-subtle)] mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold uppercase tracking-wider text-[11px] text-sky-700 dark:text-sky-300">
                    {msg.role === 'user'
                      ? 'Médico Assistente'
                      : msg.role === 'science'
                        ? 'Agente Science — Diretrizes & Evidências'
                        : 'Assistente Clínico do Leito'}
                  </span>
                  {msg.attachedFileName && (
                    <Badge tone="info">Anexo: {msg.attachedFileName}</Badge>
                  )}
                </div>
                <p className="whitespace-pre-line text-[var(--text-main)] clinical-tabular-nums">
                  {msg.content}
                </p>
                {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                  <div className="pt-1.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                    <strong>Fontes / Diretrizes:</strong> {msg.evidenceCitations.join(' • ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Caixa de Entrada com Upload e Disparo Rápido */}
        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleAttachFileInChat}
              className="hidden"
              aria-label="Anexar arquivo ao chat do leito"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Enviar arquivo de exame ou evolução no chat"
              aria-label="Anexar arquivo no chat"
              className="w-10 h-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] flex items-center justify-center text-sky-600 dark:text-sky-400 cursor-pointer shrink-0"
            >
              <Icon name="upload" size={18} />
            </button>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ex.: Avaliar resposta ao antibiótico, checar critérios de switch VO ou consultar diretriz KDIGO..."
              aria-label="Mensagem para o assistente do leito ou Agente Science"
              className="flex-1 h-10 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="btn-tactile-primary h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Icon name="send" size={15} />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coluna Lateral: Biblioteca Rápida do Agente Science (Diretrizes e Protocolos Mundiais) */}
      <div className="lg:col-span-4 card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <Icon name="science" size={18} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">Agente Science — Diretrizes</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Toque para discutir a conduta do leito sob evidência</p>
          </div>
        </div>

        <div className="space-y-2">
          {SCIENCE_CLINICAL_GUIDELINES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setChannel('science_protocol');
                handleSendMessage(`Discutir conduta segundo: ${g.title} (${g.societyAndYear})`);
              }}
              className="w-full text-left p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] transition space-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-[var(--text-main)]">{g.title}</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {g.societyAndYear}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
