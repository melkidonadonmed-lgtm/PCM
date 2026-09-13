import { useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  AlertTriangle, 
  User, 
  Stethoscope, 
  Layers,
  FlaskConical,
  Award,
  Building2
} from 'lucide-react';
import type { DoctorProfile, Patient, PrescriptionItem, PrescriptionDocument } from '../types';
import { buildPrescriptionDocuments, prescriptionDocumentText, prescriptionIssues } from '../utils/prescriptionRules';
import { generatePrescriptionPDF, layoutPrescriptionPages, prescriptionIdentityIssues } from '../utils/prescriptionPdf';
import { PrescriptionPages } from './PrescriptionPages';

export interface PrescriptionReviewProps {
  items: PrescriptionItem[];
  doctor: DoctorProfile;
  patient: Patient;
  onBack: () => void;
  onEditPatient: () => void;
  onEditDoctor: () => void;
  onNavigateToPrescription?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToDocuments?: () => void;
  onSwitchDocType?: (type: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral') => void;
  examsCount?: number;
  hasCertificate?: boolean;
  hasReferral?: boolean;
}

export function PrescriptionReview({ 
  items, 
  doctor, 
  patient, 
  onBack, 
  onEditPatient, 
  onEditDoctor,
  onNavigateToPrescription,
  onNavigateToExams,
  onNavigateToDocuments,
  onSwitchDocType,
  examsCount = 0,
  hasCertificate = false,
  hasReferral = false
}: PrescriptionReviewProps) {
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="clinical-button secondary"
              onClick={onNavigateToPrescription || onBack}
              aria-label="Voltar aos medicamentos"
            >
              <ArrowLeft size={16} />
              <span>Voltar aos medicamentos</span>
            </button>

            {onNavigateToExams && (
              <button
                type="button"
                className="clinical-button secondary text-xs"
                onClick={onNavigateToExams}
                title="Ir para a solicitação de exames"
              >
                <FlaskConical size={14} />
                <span>Exames {examsCount > 0 ? `(${examsCount})` : ''}</span>
              </button>
            )}

            {onNavigateToDocuments && (
              <button
                type="button"
                className="clinical-button secondary text-xs"
                onClick={onNavigateToDocuments}
                title="Ir para emissão de atestados e encaminhamentos"
              >
                <Award size={14} />
                <span>Documentos</span>
              </button>
            )}

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
        <div role="alert" className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 no-print space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
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
              onClick={onNavigateToPrescription || onBack}
            >
              Corrigir medicamentos na receita
            </button>
          </div>
        </div>
      )}

      {/* Sem documentos de prescrição */}
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
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button type="button" className="clinical-button" onClick={onNavigateToPrescription || onBack}>
              Adicionar Medicamentos
            </button>
            {onSwitchDocType && (
              <>
                <button type="button" className="clinical-button secondary text-xs" onClick={() => onSwitchDocType('exams')}>
                  <FlaskConical size={14} className="mr-1 inline" />
                  Ver Exames {examsCount > 0 ? `(${examsCount})` : ''}
                </button>
                <button type="button" className="clinical-button secondary text-xs" onClick={() => onSwitchDocType('certificate')}>
                  <Award size={14} className="mr-1 inline" />
                  Ver Atestado
                </button>
                <button type="button" className="clinical-button secondary text-xs" onClick={() => onSwitchDocType('referral')}>
                  <Building2 size={14} className="mr-1 inline" />
                  Ver Encaminhamento
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Documentos Prontos */}
      {!!documents.length && (
        <>
          {/* Alternador de Tipo de Documento Global no Atendimento */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-print">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                className="clinical-button text-xs font-bold"
                aria-pressed="true"
              >
                <FileText size={14} />
                <span>Receituários ({documents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSwitchDocType) onSwitchDocType('exams');
                  else if (onNavigateToExams) onNavigateToExams();
                }}
                className="clinical-button secondary text-xs"
                title="Visualizar pedido de exames"
              >
                <FlaskConical size={14} />
                <span>Exames {examsCount > 0 ? `(${examsCount})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSwitchDocType) onSwitchDocType('certificate');
                  else if (onNavigateToDocuments) onNavigateToDocuments();
                }}
                className="clinical-button secondary text-xs"
                title="Visualizar atestado médico"
              >
                <Award size={14} />
                <span>Atestados</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSwitchDocType) onSwitchDocType('referral');
                  else if (onNavigateToDocuments) onNavigateToDocuments();
                }}
                className="clinical-button secondary text-xs"
                title="Visualizar guia de encaminhamento"
              >
                <Building2 size={14} />
                <span>Encaminhamento</span>
              </button>
            </div>
          </div>

          {/* Seletor de Receitas Geradas (Tabs das Vias Normativas) */}
          <nav aria-label="Receitas geradas" className="flex flex-wrap items-center gap-2 no-print">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Layers size={14} />
              <span>Vias Normativas:</span>
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
                  {d.kind === 'c1' && (
                    <span className="text-[10px] font-bold text-slate-300 inline-flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mr-1"></span>
                      C1
                    </span>
                  )}
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
            <div role="status" className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs font-bold no-print">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
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
