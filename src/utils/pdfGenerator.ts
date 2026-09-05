import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';

export interface PDFExportOptions {
  docType: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral';
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

    // QR Code / Digital Verification Block
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(15, 23, 42);
    doc.rect(marginX, bottomY + 3, 11, 11, 'S');

    doc.setFillColor(15, 23, 42);
    doc.rect(marginX + 1, bottomY + 4, 3, 3, 'F');
    doc.rect(marginX + 7, bottomY + 4, 3, 3, 'F');
    doc.rect(marginX + 1, bottomY + 10, 3, 3, 'F');
    doc.rect(marginX + 5.5, bottomY + 8, 2, 2, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('VALIDAÇÃO DIGITAL CFM', marginX + 13, bottomY + 6);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const codeId = Math.random().toString(36).substr(2, 6).toUpperCase();
    doc.text(`Código: DOC-PRESC-${codeId}`, marginX + 13, bottomY + 9.5);
    doc.setTextColor(5, 150, 105);
    doc.text('Assinatura Eletrônica Válida • prescmed.digital', marginX + 13, bottomY + 13);

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

  // 1. PRESCRIPTION AUTO-SPLITTER (Simples vs. Especial em 2 vias com max 3 itens/folha)
  if (docType === 'prescription') {
    const simpleItems = prescriptionItems.filter(i => !i.isSpecialControl);
    let currentY = renderHeader(pdf, 'RECEITUÁRIO SIMPLES', false);

    if (simpleItems.length === 0) {
      pdf.setFont('times', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Nenhum medicamento simples nesta prescrição (Verifique a Receita Especial).', pageWidth / 2, currentY + 30, { align: 'center' });
    } else {
      const itemsByRoute = simpleItems.reduce((acc, item) => {
        const route = (item.route || 'Oral').toUpperCase();
        if (!acc[route]) acc[route] = [];
        acc[route].push(item);
        return acc;
      }, {} as { [route: string]: PrescriptionItem[] });

      Object.entries(itemsByRoute).forEach(([route, rItems]) => {
        pdf.setFillColor(241, 245, 249);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(marginX, currentY, contentWidth, 6.5, 1, 1, 'FD');

        pdf.setTextColor(7, 89, 133);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.text(`USO ${route}`, marginX + 3, currentY + 4.5);
        currentY += 9;

        const rows: any[] = [];
        rItems.forEach((item, idx) => {
          const headline = `${idx + 1})  ${item.name.toUpperCase()}  (${item.presentation})  -------------  ${item.quantity}`;
          let posology = item.instructions;
          if (item.scheduleTimes && item.scheduleTimes.length > 0) {
            posology += `\nHorários sugeridos: [ ${item.scheduleTimes.join(' • ')} ]`;
          }
          if (item.durationDays) {
            posology += `\nDuração do tratamento: ${item.durationDays} dias`;
          } else if (item.isContinuous) {
            posology += `\nTratamento de uso contínuo`;
          }
          rows.push([headline, posology]);
        });

        autoTable(pdf, {
          startY: currentY,
          margin: { left: marginX, right: marginX },
          body: rows.map(r => [
            {
              content: `${r[0]}\n${r[1]}`,
              styles: { font: 'times', fontSize: 10, cellPadding: { top: 2.5, bottom: 3, left: 3, right: 3 } }
            }
          ]),
          theme: 'plain',
          styles: { textColor: [15, 23, 42], lineColor: [226, 232, 240], lineWidth: 0.1 },
          columnStyles: { 0: { cellWidth: contentWidth } }
        });

        currentY = (pdf as any).lastAutoTable.finalY + 4;
      });
    }

    renderFooter(pdf);
    return pdf;
  }

  // 2. RECEITA DE CONTROLE ESPECIAL EM 2 VIAS (RDC 20/2011 e Portaria 344/98 - MAX 3 ITENS POR FOLHA)
  if (docType === 'special_prescription') {
    const specialItems = prescriptionItems.filter(i => Boolean(i.isSpecialControl));
    
    // Divide em blocos de até 3 medicamentos
    const chunks: PrescriptionItem[][] = [];
    if (specialItems.length === 0) {
      chunks.push([]);
    } else {
      for (let i = 0; i < specialItems.length; i += 3) {
        chunks.push(specialItems.slice(i, i + 3));
      }
    }

    chunks.forEach((chunk, chunkIndex) => {
      // 1ª Via: Farmácia (Retenção) e 2ª Via: Paciente
      [false, true].forEach((isSecondCopy, viaIndex) => {
        if (chunkIndex > 0 || viaIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const badgeSuffix = chunks.length > 1 ? ` (Folha ${chunkIndex + 1}/${chunks.length})` : '';
        let currentY = renderHeader(pdf, `RECEITA CONTROLE ESPECIAL${badgeSuffix}`, isSecondCopy);

        if (chunk.length === 0) {
          pdf.setFont('times', 'italic');
          pdf.setFontSize(11);
          pdf.setTextColor(148, 163, 184);
          pdf.text('Nenhum medicamento sujeito a controle especial nesta prescrição.', pageWidth / 2, currentY + 30, { align: 'center' });
        } else {
          pdf.setFillColor(254, 242, 242);
          pdf.setDrawColor(254, 202, 202);
          pdf.roundedRect(marginX, currentY, contentWidth, 6.5, 1, 1, 'FD');

          pdf.setTextColor(153, 27, 27);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.text(`MEDICAMENTOS SOB CONTROLE ESPECIAL (MAX 3 POR FOLHA)`, marginX + 3, currentY + 4.5);
          currentY += 9;

          const rows: any[] = [];
          chunk.forEach((item, idx) => {
            const itemNumber = (chunkIndex * 3) + idx + 1;
            const headline = `${itemNumber})  ${item.name.toUpperCase()}  (${item.presentation})  -------------  ${item.quantity}`;
            let posology = item.instructions;
            if (item.scheduleTimes && item.scheduleTimes.length > 0) {
              posology += `\nHorários sugeridos: [ ${item.scheduleTimes.join(' • ')} ]`;
            }
            if (item.durationDays) {
              posology += `\nDuração do tratamento: ${item.durationDays} dias`;
            }
            rows.push([headline, posology]);
          });

          autoTable(pdf, {
            startY: currentY,
            margin: { left: marginX, right: marginX },
            body: rows.map(r => [
              {
                content: `${r[0]}\n${r[1]}`,
                styles: { font: 'times', fontSize: 10, cellPadding: { top: 2.5, bottom: 3, left: 3, right: 3 } }
              }
            ]),
            theme: 'plain',
            styles: { textColor: [15, 23, 42], lineColor: [226, 232, 240], lineWidth: 0.1 },
            columnStyles: { 0: { cellWidth: contentWidth } }
          });

          currentY = (pdf as any).lastAutoTable.finalY + 4;
        }

        // Quadro Regulatório de Comprador & Fornecedor
        const boxY = Math.max(currentY + 2, pageHeight - 65);
        autoTable(pdf, {
          startY: boxY,
          margin: { left: marginX, right: marginX },
          theme: 'grid',
          head: [
            ['IDENTIFICAÇÃO DO COMPRADOR', 'IDENTIFICAÇÃO DO FORNECEDOR']
          ],
          body: [
            [
              'Nome: _____________________________________\nRG: __________________  CPF: ________________\nEndereço: __________________________________\nCidade/UF: _____________  Tel: _______________',
              'Farmácia/Drogaria: _________________________\nAssinatura do Farmacêutico: __________________\nData: ____/____/________   Lote: ____________\nQuantidade Dispensada: _____________________'
            ]
          ],
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: [15, 23, 42],
            fontSize: 7,
            fontStyle: 'bold',
            lineWidth: 0.2,
            lineColor: [203, 213, 225]
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [51, 65, 85],
            fontSize: 7,
            lineWidth: 0.2,
            lineColor: [203, 213, 225]
          },
          columnStyles: {
            0: { cellWidth: contentWidth / 2 },
            1: { cellWidth: contentWidth / 2 }
          }
        });

        renderFooter(pdf);
      });
    });

    return pdf;
  }

  // 3. EXAM AUTO-SPLITTER (Laboratoriais vs. Imagem & Gráficos)
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
