import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Copy, Check, FileText, AlertTriangle, User, Stethoscope, Layers } from 'lucide-react';
import type { DoctorProfile, Patient, PrescriptionItem, PrescriptionDocument } from '../types';
import { buildPrescriptionDocuments, prescriptionDocumentText, prescriptionIssues } from '../utils/prescriptionRules';
import { generatePrescriptionPDF, layoutPrescriptionPages, prescriptionIdentityIssues } from '../utils/prescriptionPdf';
import { PrescriptionPages } from './PrescriptionPages';

export function PrescriptionReview({ items, doctor, patient, onBack, onEditPatient, onEditDoctor }: {
  items: PrescriptionItem[]; doctor: DoctorProfile; patient: Patient;
  onBack: () => void; onEditPatient: () => void; onEditDoctor: () => void;
}) {
  const documents = useMemo(() => buildPrescriptionDocuments(items), [items]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [date] = useState(() => new Date());
  const selected = documents.find(d => d.id === selectedId) ?? documents[0];
  const problems = items.flatMap(i => prescriptionIssues(i).map(issue => `${i.name}: ${issue}`));
  const identityProblems = prescriptionIdentityIssues(doctor, patient, selected ? [selected] : []);
  const selectedProblems = selected?.items.flatMap(prescriptionIssues) ?? [];
  const layout = useMemo(() => {
    if (!selected || selected.items.some(i => prescriptionIssues(i).length)) return { pages: [], error: '' };
    try { return { pages: layoutPrescriptionPages([selected], doctor, patient, date), error: '' }; }
    catch (e) { return { pages: [], error: e instanceof Error ? e.message : 'Falha ao montar as páginas.' }; }
  }, [selected, doctor, patient, date]);

  const exportDocuments = (docs: PrescriptionDocument[]) => {
    try {
      generatePrescriptionPDF(docs, doctor, patient, date).save('Receitas.pdf');
      setMessage('PDF exportado com sucesso. Imprima e assine as vias.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Não foi possível exportar.');
    }
  };

  const canExport = selected && !selectedProblems.length && !identityProblems.length && !layout.error;

  return (
    <section className="prescription-review space-y-5 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header Clínico de Revisão */}
      <header className="tactile-card p-4 sm:p-6 rounded-2xl space-y-4 no-print" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-medium)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="clinical-button secondary"
              onClick={onBack}
              aria-label="Voltar aos medicamentos"
            >
              <ArrowLeft size={16} />
              <span>Voltar aos medicamentos</span>
            </button>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-navy-900/10 dark:bg-white/10 text-navy-900 dark:text-cream-100 font-bold uppercase tracking-wider">
              Etapa 3 de 3 • Revisão Final
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="clinical-button secondary text-xs"
              onClick={onEditPatient}
              title="Editar dados cadastrais do paciente"
            >
              <User size={14} />
              <span>Paciente: {patient.name || 'Identificar'}</span>
            </button>
            <button
              type="button"
              className="clinical-button secondary text-xs"
              onClick={onEditDoctor}
              title="Editar dados do médico prescritor"
            >
              <Stethoscope size={14} />
              <span>Médico: {doctor.name ? `Dr(a). ${doctor.name}` : 'Identificar'}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-cream-50">
            Revisar Documentos e Exportar PDF
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {items.length} medicamento(s) distribuído(s) em {documents.length} receituário(s) normativo(s). Confira o layout e as vias antes da impressão.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Padrão CFM/Anvisa para impressão e assinatura manuscrita (sem necessidade de certificado digital em nuvem).
          </p>
        </div>
      </header>

      {/* Alertas de Pendências Clínicas ou Legais */}
      {(problems.length > 0 || identityProblems.length > 0 || layout.error) && (
        <div role="alert" className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 no-print space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h2 className="font-bold text-sm">Pendências para Emissão do Documento</h2>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            {[...problems, ...identityProblems, ...(layout.error ? [layout.error] : [])].map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="pt-1">
            <button
              type="button"
              className="clinical-button secondary text-xs"
              onClick={onBack}
            >
              Corrigir medicamentos na receita
            </button>
          </div>
        </div>
      )}

      {/* Sem documentos */}
      {!documents.length && (
        <div className="tactile-card p-8 rounded-2xl text-center space-y-3" style={{ backgroundColor: 'var(--surface-card)' }}>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
            <FileText size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhuma receita pronta para revisão.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Adicione medicamentos no formulário e resolva a classificação de qualquer item pendente.
          </p>
          <button type="button" className="clinical-button" onClick={onBack}>
            Adicionar Medicamentos
          </button>
        </div>
      )}

      {/* Documentos Prontos */}
      {!!documents.length && (
        <>
          {/* Seletor de Receitas Geradas (Tabs) */}
          <nav aria-label="Receitas geradas" className="flex flex-wrap items-center gap-2 no-print">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Layers size={14} />
              <span>Receitas:</span>
            </span>
            {documents.map(d => {
              const isCurrent = d.id === selected?.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={isCurrent}
                  onClick={() => { setSelectedId(d.id); setMessage(''); }}
                  className={`clinical-button ${isCurrent ? '' : 'secondary'} text-xs`}
                >
                  <span>{d.title}</span>
                  <span className="opacity-70">({d.items.length} itens • {d.copies} {d.copies === 1 ? 'via' : 'vias'})</span>
                  {d.kind === 'c1' && <span className="text-[10px] font-extrabold px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">C1</span>}
                </button>
              );
            })}
          </nav>

          {/* Barra de Ações Rápidas */}
          <div className="tactile-card p-3.5 sm:p-4 rounded-2xl flex flex-wrap gap-2.5 items-center justify-between no-print" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-medium)' }}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="clinical-button"
                disabled={!canExport}
                onClick={() => exportDocuments([selected])}
              >
                <Download size={16} />
                <span>Exportar Selecionado</span>
              </button>

              <button
                type="button"
                className="clinical-button secondary"
                disabled={!!problems.length || !!prescriptionIdentityIssues(doctor, patient, documents).length}
                onClick={() => exportDocuments(documents)}
              >
                <Download size={16} />
                <span>Exportar Todas ({documents.length})</span>
              </button>

              <button
                type="button"
                className="clinical-button secondary"
                disabled={!canExport}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `Paciente: ${patient.name}\nPrescritor: ${doctor.name} — CRM ${doctor.crm}/${doctor.crmState}\nData: ${date.toLocaleDateString('pt-BR')}\n\n${prescriptionDocumentText(selected)}`
                    );
                    setMessage('Texto do documento selecionado copiado para a área de transferência.');
                  } catch {
                    setMessage('Não foi possível copiar. Use a exportação em PDF.');
                  }
                }}
              >
                <Copy size={16} />
                <span>Copiar Texto</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {layout.pages.length} página(s) gerada(s)
            </span>
          </div>

          {/* Toast de Feedback */}
          {message && (
            <div role="status" className="p-3 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-2 text-xs font-bold no-print">
              <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Páginas do Documento Renderizadas em Visualização Fiel */}
          <PrescriptionPages pages={layout.pages} />
        </>
      )}
    </section>
  );
}
