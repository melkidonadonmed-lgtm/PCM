import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Copy, Check, FileText } from 'lucide-react';
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
    try { generatePrescriptionPDF(docs, doctor, patient, date).save('Receitas.pdf'); setMessage('PDF exportado. Imprima e assine as vias.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Não foi possível exportar.'); }
  };
  const canExport = selected && !selectedProblems.length && !identityProblems.length && !layout.error;
  return <section className="prescription-review space-y-5 p-4 sm:p-6 max-w-6xl mx-auto">
    <header className="clinical-card p-5 no-print">
      <button className="clinical-button secondary mb-4" onClick={onBack}><ArrowLeft size={18} />Voltar aos medicamentos</button>
      <p className="text-sm mb-1">Etapa 3 de 3</p><h1 className="text-2xl font-semibold">Revisar e exportar</h1>
      <p className="mt-2">{items.length} medicamentos · {documents.length} receitas. Confira o documento e suas vias antes de imprimir.</p>
      <p className="text-sm mt-2">PDF para impressão e assinatura manuscrita. O app não realiza assinatura digital.</p>
      <div className="flex flex-wrap gap-2 mt-4"><button className="clinical-button secondary" onClick={onEditPatient}>Editar paciente</button><button className="clinical-button secondary" onClick={onEditDoctor}>Editar prescritor</button></div>
    </header>
    {(problems.length > 0 || identityProblems.length > 0 || layout.error) && <div role="alert" className="clinical-card p-4 no-print">
      <h2 className="font-semibold">Pendências para emissão</h2><ul className="list-disc pl-5 mt-2 text-sm">{[...problems, ...identityProblems, ...(layout.error ? [layout.error] : [])].map((p, i) => <li key={i}>{p}</li>)}</ul>
      <button className="clinical-button secondary mt-3" onClick={onBack}>Corrigir medicamentos</button>
    </div>}
    {!documents.length && <div className="clinical-card p-6"><FileText className="mb-3" /><p>Nenhuma receita pronta para revisão. Adicione medicamentos e resolva a classificação dos itens pendentes.</p></div>}
    {!!documents.length && <>
      <nav aria-label="Receitas geradas" className="flex flex-wrap gap-2 no-print">{documents.map(d => <button key={d.id} aria-pressed={d.id === selected?.id} onClick={() => { setSelectedId(d.id); setMessage(''); }} className={`clinical-button ${d.id === selected?.id ? '' : 'secondary'}`}>{d.title} · {d.items.length} itens · {d.copies} {d.copies === 1 ? 'via' : 'vias'}{d.kind === 'c1' ? ` (${d.id})` : ''}</button>)}</nav>
      <div className="clinical-card p-4 flex flex-wrap gap-3 items-center no-print">
        <button className="clinical-button" disabled={!canExport} onClick={() => exportDocuments([selected])}><Download size={18} />Exportar selecionado</button>
        <button className="clinical-button secondary" disabled={!!problems.length || !!prescriptionIdentityIssues(doctor, patient, documents).length} onClick={() => exportDocuments(documents)}>Exportar todos</button>
        <button className="clinical-button secondary" disabled={!canExport} onClick={async () => { try { await navigator.clipboard.writeText(`Paciente: ${patient.name}\nPrescritor: ${doctor.name} — CRM ${doctor.crm}/${doctor.crmState}\nData: ${date.toLocaleDateString('pt-BR')}\n\n${prescriptionDocumentText(selected)}`); setMessage('Texto do documento selecionado copiado.'); } catch { setMessage('Não foi possível copiar. Use a exportação PDF.'); } }}><Copy size={18} />Copiar selecionado</button>
        <span className="text-sm">{layout.pages.length} páginas, incluindo todas as vias</span>
      </div>
      {message && <p role="status" className="flex gap-2 no-print"><Check size={18} />{message}</p>}
      <PrescriptionPages pages={layout.pages} />
    </>}
  </section>;
}
