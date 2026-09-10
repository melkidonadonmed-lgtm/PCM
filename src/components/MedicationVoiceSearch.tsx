import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
interface LocalRecognition {
  processLocally: boolean; lang: string;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; abort: () => void;
}
export function MedicationVoiceSearch({ onResult }: { onResult: (text: string) => void }) {
  const recognition = useRef<LocalRecognition | null>(null);
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  useEffect(() => () => { const active = recognition.current; if (active) { active.onresult = null; active.onerror = null; active.onend = null; active.abort(); } }, []);
  const start = () => {
    if (listening) { recognition.current?.abort(); return; }
    const browser = window as unknown as { SpeechRecognition?: new () => LocalRecognition; webkitSpeechRecognition?: new () => LocalRecognition };
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) { setMessage('Ditado indisponível neste navegador. Digite o medicamento.'); return; }
    const active = new Constructor();
    if (!('processLocally' in active)) { setMessage('Ditado local indisponível neste navegador. Digite o medicamento.'); return; }
    active.processLocally = true;
    active.lang = 'pt-BR';
    active.onresult = event => { onResult(event.results[0][0].transcript); setMessage('Confira o medicamento reconhecido.'); };
    active.onerror = () => { setListening(false); setMessage('Não foi possível usar o ditado local. Confira a permissão do microfone e o idioma instalado ou digite.'); };
    active.onend = () => setListening(false);
    recognition.current = active;
    try { active.start(); setListening(true); setMessage('Diga o nome do medicamento.'); } catch { setMessage('Ditado indisponível. Digite o medicamento.'); }
  };
  return <div><button type="button" aria-label={listening ? 'Parar ditado' : 'Buscar medicamento por voz'} aria-pressed={listening} className="min-h-11 flex gap-2 items-center text-sm" onClick={start}><Mic className="w-4 h-4" />{listening ? 'Parar ditado' : 'Ditado por voz'}</button>{message && <p role="status" className="text-xs">{message}</p>}</div>;
}
