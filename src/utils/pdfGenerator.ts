import { buildPrescriptionDocuments } from './prescriptionRules';
import { generatePrescriptionPDF } from './prescriptionPdf';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';

export interface PDFExportOptions {
  docType: 'prescription' | 'antimicrobial_prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral';
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  exams: ExamItem[];
  examIndication: string;
  certificate: MedicalCertificate;
  referral: MedicalReferral;
  examFilter?: 'all' | 'lab' | 'image';
}

const numberToWordsPtBr = (num: number): string => {
  const words: { [key: number]: string } = {
    1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
    6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
    11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze',
    20: 'vinte', 30: 'trinta', 60: 'sessenta', 90: 'noventa'
  };
  return words[num] || String(num);
};

export const generateMedicalPDF = (options: PDFExportOptions): jsPDF => {
  const {
    docType,
    doctor,
    patient,
    prescriptionItems,
    exams,
    examIndication,
    certificate,
    referral,
    examFilter = 'all'
  } = options;

  if (['prescription', 'antimicrobial_prescription', 'special_prescription'].includes(docType)) {
    const kind = docType === 'prescription' ? 'simple' : docType === 'antimicrobial_prescription' ? 'antimicrobial' : 'c1';
    return generatePrescriptionPDF(buildPrescriptionDocuments(prescriptionItems).filter(d => d.kind === kind), doctor, patient);
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2);

  const patientName = patient?.name?.trim() || certificate?.patientName?.trim() || referral?.patientName?.trim() || 'Não identificado';
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : null;
  const patientDoc = patient?.documentNumber?.trim() || certificate?.documentNumber?.trim() || referral?.documentNumber?.trim() || '—';
  const patientAge = patient?.ageText?.trim() || patient?.birthDate?.trim() || '—';

  const docName = doctor?.name?.trim() || 'Dr(a). Médico(a)';
  const docCrm = doctor?.crm?.trim() || '------';
  const docCrmState = doctor?.crmState || 'SP';
  const docSpecialty = doctor?.specialty || 'Clínica Médica';
  const docClinic = doctor?.clinicName?.trim() || '';
  const docAddress = doctor?.address?.trim() || '';
  const docPhone = doctor?.phone?.trim() || '';

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Helper to draw Header
  const renderHeader = (doc: jsPDF, customBadge?: string, isSecondCopy = false) => {
    let y = 14;

    // Doctor Icon / Symbol
    doc.setFillColor(30, 79, 122); // #1E4F7A
    doc.roundedRect(marginX, y, 10, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Rx', marginX + 2.5, y + 6.8);

    // Doctor Info
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(docName.toUpperCase(), marginX + 13, y + 4.5);

    doc.setTextColor(30, 79, 122);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const rquText = doctor?.rqe ? ` • RQE ${doctor.rqe}` : '';
    doc.text(`CRM-${docCrmState} ${docCrm}${rquText}`, marginX + 13, y + 8.5);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(docSpecialty, marginX + 13, y + 12.5);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.text(`${docClinic} • ${docAddress} • Tel: ${docPhone}`, marginX, y + 18);

    // Document Title Badge on Top Right
    let badgeText = customBadge || 'RECEITUÁRIO MÉDICO';
    if (!customBadge) {
      if (docType === 'special_prescription') badgeText = 'RECEITA CONTROLE ESPECIAL';
      else if (docType === 'exams') badgeText = 'SOLICITAÇÃO DE EXAMES';
      else if (docType === 'certificate') badgeText = 'ATESTADO MÉDICO';
      else if (docType === 'referral') badgeText = 'ENCAMINHAMENTO MÉDICO';
    }

    const badgeWidth = 68;
    const badgeX = pageWidth - marginX - badgeWidth;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(badgeX, y, badgeWidth, 8.5, 1.5, 1.5, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(badgeText, badgeX + (badgeWidth / 2), y + 5.5, { align: 'center' });

    if (docType === 'special_prescription') {
      doc.setTextColor(153, 27, 27); // #991B1B
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const viaText = isSecondCopy ? '2ª VIA: PACIENTE' : '1ª VIA: FARMÁCIA / RETENÇÃO';
      doc.text(viaText, badgeX + (badgeWidth / 2), y + 12.5, { align: 'center' });
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, badgeX + badgeWidth, y + (docType === 'special_prescription' ? 17 : 13), { align: 'right' });

    // Top Divider Line
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(marginX, y + 21, pageWidth - marginX, y + 21);

    // Patient Information Box using autoTable
    autoTable(doc, {
      startY: y + 23,
      margin: { left: marginX, right: marginX },
      theme: 'grid',
      head: [
        ['PACIENTE', 'DOC (RG/CPF)', 'PESO ATUAL', 'IDADE']
      ],
      body: [
        [
          patientName.toUpperCase(),
          patientDoc,
          patientWeight ? `${patientWeight} kg` : '—',
          patientAge
        ]
      ],
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [15, 23, 42],
        fontSize: 8.5,
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 32, textColor: [3, 105, 161] },
        3: { cellWidth: 40 }
      }
    });

    return (doc as any).lastAutoTable.finalY + 6;
  };

  // Helper to draw Footer
  const renderFooter = (doc: jsPDF) => {
    const bottomY = pageHeight - 34;

    // Bottom Divider
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(marginX, bottomY, pageWidth - marginX, bottomY);

    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(['Documento para impressão', 'e assinatura manuscrita.'], marginX, bottomY + 7);

    // City & Doctor Signature Line
    const signatureWidth = 75;
    const signatureX = pageWidth - marginX - signatureWidth;

    doc.setTextColor(51, 65, 85);
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text(`${doctor?.cityState || 'São Paulo - SP'}, ${currentDate}`, pageWidth - marginX, bottomY + 5, { align: 'right' });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(signatureX, bottomY + 15, pageWidth - marginX, bottomY + 15);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(docName.toUpperCase(), signatureX + (signatureWidth / 2), bottomY + 19, { align: 'center' });

    doc.setTextColor(3, 105, 161);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`CRM-${docCrmState} ${docCrm}`, signatureX + (signatureWidth / 2), bottomY + 22.5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(docSpecialty, signatureX + (signatureWidth / 2), bottomY + 25.5, { align: 'center' });
  };

  if (docType === 'exams') {
    const labExams = exams.filter(e => !e.isImage);
    const imageExams = exams.filter(e => Boolean(e.isImage));

    const renderExamTable = (examList: ExamItem[], pageTitle: string) => {
      let currentY = renderHeader(pdf, pageTitle, false);

      if (examIndication) {
        pdf.setFillColor(254, 248, 238);
        pdf.setDrawColor(253, 230, 138);
        pdf.roundedRect(marginX, currentY, contentWidth, 10, 1.5, 1.5, 'FD');

        pdf.setTextColor(120, 53, 15);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('INDICAÇÃO CLÍNICA: ', marginX + 3, currentY + 6.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(examIndication, marginX + 38, currentY + 6.5);
        currentY += 14;
      }

      pdf.setTextColor(7, 89, 133);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('EXAMES SOLICITADOS:', marginX, currentY);
      currentY += 3;

      if (examList.length === 0) {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(11);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Nenhum exame selecionado nesta categoria.', pageWidth / 2, currentY + 30, { align: 'center' });
      } else {
        autoTable(pdf, {
          startY: currentY,
          margin: { left: marginX, right: marginX },
          theme: 'striped',
          head: [['ITEM', 'EXAME', 'CATEGORIA', 'TIPO / PREPARO']],
          body: examList.map((exam, idx) => [
            String(idx + 1).padStart(2, '0'),
            exam.name,
            exam.category || 'Geral',
            exam.isImage ? 'Diagnóstico por Imagem / Gráfico' : (exam.description || 'Rotina Laboratorial')
          ]),
          headStyles: {
            fillColor: [30, 79, 122],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: [15, 23, 42],
            fontSize: 8.5,
            cellPadding: 2.5
          },
          columnStyles: {
            0: { cellWidth: 14, halign: 'center' },
            1: { cellWidth: 80, fontStyle: 'bold' },
            2: { cellWidth: 40 },
            3: { cellWidth: 48 }
          }
        });
      }

      renderFooter(pdf);
    };

    if (examFilter === 'lab') {
      renderExamTable(labExams, 'SOLICITAÇÃO DE EXAMES LABORATORIAIS');
    } else if (examFilter === 'image') {
      renderExamTable(imageExams, 'SOLICITAÇÃO DE EXAMES DE IMAGEM');
    } else {
      // Se 'all': se tiver ambos, gera 2 páginas separadas; senão, gera 1 página com o título apropriado
      if (labExams.length > 0 && imageExams.length > 0) {
        renderExamTable(labExams, 'SOLICITAÇÃO DE EXAMES LABORATORIAIS');
        pdf.addPage('a4', 'portrait');
        renderExamTable(imageExams, 'SOLICITAÇÃO DE EXAMES DE IMAGEM');
      } else if (imageExams.length > 0) {
        renderExamTable(imageExams, 'SOLICITAÇÃO DE EXAMES DE IMAGEM');
      } else {
        renderExamTable(labExams, 'SOLICITAÇÃO DE EXAMES LABORATORIAIS');
      }
    }

    return pdf;
  }

  // 4. ATESTADO MÉDICO
  if (docType === 'certificate') {
    let currentY = renderHeader(pdf, 'ATESTADO MÉDICO', false);
    currentY += 6;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('ATESTADO MÉDICO', pageWidth / 2, currentY, { align: 'center' });

    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.4);
    pdf.line(pageWidth / 2 - 35, currentY + 2.5, pageWidth / 2 + 35, currentY + 2.5);
    currentY += 16;

    const certPatient = certificate.patientName?.trim() || patientName;
    const certDocNumber = (certificate.documentNumber?.trim() || (patientDoc !== '—' ? patientDoc : ''))
      ? `portador(a) do documento nº ${certificate.documentNumber?.trim() || patientDoc}, `
      : '';
    const daysCount = Math.max(1, certificate.daysOff || 1);
    const daysWritten = numberToWordsPtBr(daysCount);
    const startDateFormatted = certificate.startDate
      ? new Date(certificate.startDate + 'T00:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');
    const endDateFormatted = certificate.endDate
      ? new Date(certificate.endDate + 'T00:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    const certText = `Atesto para os devidos fins de direito que o(a) paciente ${certPatient.toUpperCase()}, ${certDocNumber}esteve sob meus cuidados médicos profissionais no dia ${startDateFormatted}, necessitando de ${daysCount} (${daysWritten}) dia(s) de repouso e afastamento de suas atividades habituais ${certificate.periodText || ''}, com retorno previsto a partir de ${endDateFormatted}.`;

    pdf.setFont('times', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    const splitCert = pdf.splitTextToSize(certText, contentWidth);
    pdf.text(splitCert, marginX, currentY, { lineHeightFactor: 1.6 });

    currentY += (splitCert.length * 8) + 12;

    if (certificate.includeCID && certificate.cid10Code) {
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(marginX, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 79, 122);
      pdf.text('DIAGNÓSTICO CODIFICADO (CID-10):', marginX + 4, currentY + 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${certificate.cid10Code} — ${certificate.cid10Description || ''}`, marginX + 4, currentY + 9);
      currentY += 16;
    }

    if (certificate.observations) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('OBSERVAÇÕES ADICIONAIS:', marginX, currentY);
      currentY += 4;

      pdf.setFont('times', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);
      const splitObs = pdf.splitTextToSize(certificate.observations, contentWidth);
      pdf.text(splitObs, marginX, currentY);
    }

    renderFooter(pdf);
    return pdf;
  }

  // 5. ENCAMINHAMENTO MÉDICO
  if (docType === 'referral') {
    let currentY = renderHeader(pdf, 'ENCAMINHAMENTO MÉDICO', false);
    currentY += 4;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('GUIA DE ENCAMINHAMENTO & REFERÊNCIA', pageWidth / 2, currentY, { align: 'center' });

    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.4);
    pdf.line(pageWidth / 2 - 45, currentY + 2, pageWidth / 2 + 45, currentY + 2);
    currentY += 10;

    // Destination Specialty Box
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(187, 247, 208);
    pdf.roundedRect(marginX, currentY, contentWidth, 14, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(20, 83, 45);
    pdf.text('AO SERVIÇO ESPECIALIZADO DE:', marginX + 4, currentY + 4.5);

    pdf.setFontSize(11);
    pdf.setTextColor(6, 78, 59);
    pdf.text(referral.destinationSpecialty || 'Especialidade Médica', marginX + 4, currentY + 9.5);

    if (referral.destinationInstitution) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`Local / Instituição: ${referral.destinationInstitution}`, marginX + 110, currentY + 9.5);
    }
    currentY += 18;

    const referralSections = [
      { title: 'MOTIVO DA SOLICITAÇÃO', content: referral.reason || 'Avaliação e conduta terapêutica especializada.' },
      { title: 'RESUMO CLÍNICO / EVOLUÇÃO', content: referral.clinicalSummary || 'Histórico clínico e exame físico sem alterações agudas no momento.' },
      { title: 'EXAMES COMPLEMENTARES REALIZADOS', content: referral.relevantExams },
      { title: 'HIPÓTESE DIAGNÓSTICA (CID-10)', content: referral.hypothesisCID },
      { title: 'OBSERVAÇÕES E RECOMENDAÇÕES AO SERVIÇO', content: referral.observations }
    ].filter(s => !!s.content);

    referralSections.forEach(section => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(section.title, marginX, currentY);
      currentY += 3.5;

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);

      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);

      const lines = pdf.splitTextToSize(section.content || '', contentWidth - 6);
      const boxHeight = Math.max(10, (lines.length * 5) + 5);

      pdf.roundedRect(marginX, currentY, contentWidth, boxHeight, 1, 1, 'FD');
      pdf.text(lines, marginX + 3, currentY + 5);

      currentY += boxHeight + 4;
    });

    renderFooter(pdf);
    return pdf;
  }

  return pdf;
};
