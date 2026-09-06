import { jsPDF } from 'jspdf';
import type { DoctorProfile, Patient, PrescriptionDocument } from '../types';
import { prescriptionDocumentText, prescriptionItemText } from './prescriptionRules';

export interface PageText { text: string; x: number; y: number; size: number; bold?: boolean }
export interface PrescriptionPage {
  documentId: string; copy: number; page: number; pages: number;
  texts: PageText[]; boxes: { x: number; y: number; width: number; height: number }[];
}

export function prescriptionIdentityIssues(doctor: DoctorProfile, patient: Patient, docs: PrescriptionDocument[]): string[] {
  const errors: string[] = [];
  if (!patient.name?.trim()) errors.push('Preencha o nome do paciente.');
  if (!doctor.name?.trim() || !doctor.crm?.trim() || !doctor.crmState?.trim()) errors.push('Preencha nome e CRM/UF do prescritor.');
  if (docs.some(d => d.kind !== 'simple')) {
    if (!doctor.address?.trim() || !doctor.cityState?.trim() || !doctor.phone?.trim()) errors.push('Preencha endereço, cidade/UF e telefone do prescritor.');
    if (!patient.ageText?.trim() && !patient.birthDate?.trim()) errors.push('Preencha idade ou nascimento do paciente.');
  }
  if (docs.some(d => d.kind === 'c1')) {
    if (!patient.address?.trim()) errors.push('Preencha o endereço completo do paciente para controle especial.');
    if (!patient.documentNumber?.trim()) errors.push('Preencha o documento do paciente para controle especial.');
  }
  return errors;
}

/** A single, measured page model drives both the DOM preview and the PDF. */
export function layoutPrescriptionPages(documents: PrescriptionDocument[], doctor: DoctorProfile, patient: Patient, date = new Date()): PrescriptionPage[] {
  const measure = new jsPDF({ unit: 'mm', format: 'a4' });
  const wrap = (text: string, width: number, size = 10, bold = false): string[] => {
    measure.setFont('helvetica', bold ? 'bold' : 'normal'); measure.setFontSize(size);
    return measure.splitTextToSize(text, width);
  };
  const pages: PrescriptionPage[] = [];
  for (const document of documents) {
    // Reject empty, unresolved or unsupported content at the final boundary too.
    prescriptionDocumentText(document);
    const header: PageText[] = [];
    const boxes: PrescriptionPage['boxes'] = [];
    let y = 17;
    const add = (text: string, size = 10, bold = false) => {
      for (const line of wrap(text, 176, size, bold)) { header.push({ text: line, x: 17, y, size, bold }); y += size * 0.42 + 1; }
    };
    add(document.kind === 'c1' ? 'RECEITA DE CONTROLE ESPECIAL' : document.title.toUpperCase(), 14, true);
    const copyY = y + 1;
    y += 12;
    const emitterY = y - 4;
    add('IDENTIFICAÇÃO DO EMITENTE', 9, true);
    add(`${doctor.name} — CRM ${doctor.crm}/${doctor.crmState}`);
    if (doctor.clinicName) add(doctor.clinicName);
    add([doctor.address, doctor.cityState, doctor.phone].filter(Boolean).join(' | '), 9);
    boxes.push({ x: 14, y: emitterY, width: 182, height: y - emitterY + 1 });
    y += 8;
    add(`Paciente: ${patient.name}`, 10, true);
    if (patient.documentNumber) add(`Documento (CPF/RG): ${patient.documentNumber}`, 9);
    if (patient.address) add(`Endereço: ${patient.address}`, 9);
    const gender = { male: 'Masculino', female: 'Feminino', other: 'Outro / não informado' }[patient.gender];
    add(`${patient.ageText ? `Idade: ${patient.ageText}` : `Nascimento: ${patient.birthDate || '—'}`} | Sexo: ${gender}`, 9);
    add(`Data de emissão: ${date.toLocaleDateString('pt-BR')}`, 9);
    y += 5;
    if (y > 132) throw new Error('Identificação muito extensa. Revise os campos de paciente e prescritor.');
    const bodyStart = y;
    const bodyEnd = 222;
    const capacity = Math.floor((bodyEnd - bodyStart) / 4.8);
    const bodies: PageText[][] = [];
    let body: PageText[] = [];
    let cursor = bodyStart;
    document.items.forEach((item, index) => {
      const lines = prescriptionItemText(item, index).split('\n').flatMap((line, i) => wrap(line, 176, 10, i === 0).map(text => ({ text, bold: i === 0 })));
      if (lines.length <= capacity && cursor + lines.length * 4.8 > bodyEnd && body.length) { bodies.push(body); body = []; cursor = bodyStart; }
      for (const line of lines) {
        if (cursor > bodyEnd) {
          bodies.push(body); body = []; cursor = bodyStart;
          body.push({ text: `${index + 1}. Continuação da posologia`, x: 17, y: cursor, size: 9, bold: true }); cursor += 4.8;
        }
        body.push({ ...line, x: 17, y: cursor, size: 10 }); cursor += 4.8;
      }
      cursor += 4.8;
    });
    if (body.length) bodies.push(body);
    for (let copy = 1; copy <= document.copies; copy++) {
      bodies.forEach((content, pageIndex) => {
        // Antimicrobials retain the second copy; C1 retains the first copy.
        const copyLabel = document.copies === 1 ? 'Via do paciente' : document.kind === 'antimicrobial'
          ? copy === 1 ? '1ª via — Paciente' : '2ª via — Farmácia (retenção)'
          : copy === 1 ? '1ª via — Farmácia (retenção)' : '2ª via — Paciente';
        const footer: PageText[] = [
          { text: copyLabel, x: 17, y: copyY, size: 9 },
          { text: '________________________________________________', x: 45, y: 234, size: 10 },
          { text: 'Assinatura e identificação do prescritor', x: 65, y: 240, size: 9 },
          { text: `${document.id} | Página ${pageIndex + 1}/${bodies.length} | Via ${copy}/${document.copies}`, x: 17, y: 290, size: 8 },
        ];
        const pageBoxes = [...boxes];
        if (document.kind === 'c1') {
          pageBoxes.push({ x: 14, y: 247, width: 182, height: 35 });
          footer.push(
            { text: 'IDENTIFICAÇÃO DO COMPRADOR', x: 17, y: 253, size: 9, bold: true },
            { text: 'Nome: _______________________________________________________________', x: 17, y: 260, size: 9 },
            { text: 'CPF / documento: ________________________ Telefone: _____________________', x: 17, y: 267, size: 9 },
            { text: 'Endereço: ____________________________________________________________', x: 17, y: 274, size: 9 },
            { text: 'Dispensação: registros no verso pela farmácia.', x: 17, y: 279, size: 8 },
          );
        }
        pages.push({ documentId: document.id, copy, page: pageIndex + 1, pages: bodies.length, texts: [...header, ...content, ...footer], boxes: pageBoxes });
      });
    }
  }
  return pages;
}

export function generatePrescriptionPDF(documents: PrescriptionDocument[], doctor: DoctorProfile, patient: Patient, date = new Date()): jsPDF {
  if (!documents.length) throw new Error('Não há receitas para exportar.');
  const issues = prescriptionIdentityIssues(doctor, patient, documents);
  if (issues.length) throw new Error(issues.join(' '));
  const pages = layoutPrescriptionPages(documents, doctor, patient, date);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pages.forEach((page, index) => {
    if (index) pdf.addPage();
    pdf.setDrawColor(80); pdf.setLineWidth(0.25); pdf.setTextColor(20);
    page.boxes.forEach(b => pdf.rect(b.x, b.y, b.width, b.height));
    page.texts.forEach(t => { pdf.setFont('helvetica', t.bold ? 'bold' : 'normal'); pdf.setFontSize(t.size); pdf.text(t.text, t.x, t.y); });
  });
  return pdf;
}
