import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';
import { medicoConfigurado } from './medicoConfigurado';
import { isSpecialControlOrAntibiotic } from './isSpecialControlOrAntibiotic';

export interface PDFExportOptions {
  docType: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral';
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  exams: ExamItem[];
  examIndication: string;
  certificate: MedicalCertificate;
  referral: MedicalReferral;
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

const generateSpecialPrescriptionLandscapePDF = (options: PDFExportOptions): jsPDF => {
  const { doctor, patient, prescriptionItems } = options;
  const specialItems = (prescriptionItems || []).filter(i => isSpecialControlOrAntibiotic(i));
  const effectiveItems = specialItems.length > 0 ? specialItems : (prescriptionItems || []);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const colWidth = 133;
  const via1X = 10;
  const via2X = 154;
  const dividerX = 148.5;

  const patientName = patient?.name?.trim() || 'Não identificado';
  const patientDoc = patient?.documentNumber?.trim() || '—';
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? `${patient.weightKg} kg` : '—';
  const patientAge = patient?.ageText?.trim() || patient?.birthDate?.trim() || '—';

  const docName = doctor?.name?.trim() || 'Dr(a). Médico(a)';
  const docCrm = doctor?.crm?.trim() || '------';
  const docCrmState = doctor?.crmState || 'SP';
  const docSpecialty = doctor?.specialty || 'Clínica Médica';
  const docClinic = doctor?.clinicName?.trim() || '';
  const docAddress = doctor?.address?.trim() || '';
  const docPhone = doctor?.phone?.trim() || '';
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Renderiza uma via completa (isSecondCopy = false -> 1ª Via Farmácia; true -> 2ª Via Paciente)
  const renderSingleVia = (startX: number, isSecondCopy: boolean) => {
    let y = 8;

    // Símbolo Rx
    pdf.setFillColor(30, 79, 122);
    pdf.roundedRect(startX, y, 7, 7, 1.5, 1.5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('Rx', startX + 1.6, y + 4.8);

    // Identificação do Médico
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(docName.toUpperCase(), startX + 9, y + 3.8);

    pdf.setTextColor(30, 79, 122);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    const rqeText = doctor?.rqe ? ` • RQE ${doctor.rqe}` : '';
    pdf.text(`CRM-${docCrmState} ${docCrm}${rqeText}`, startX + 9, y + 7);

    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(docSpecialty, startX, y + 11.5);
    if (docClinic || docAddress || docPhone) {
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(6);
      const contactLine = `${docClinic}${docAddress ? ' • ' + docAddress : ''}${docPhone ? ' • Tel: ' + docPhone : ''}`;
      pdf.text(contactLine.slice(0, 75), startX, y + 14.8);
    }

    // Badge do Tipo de Documento no topo direito da via
    const badgeW = 48;
    const badgeX = startX + colWidth - badgeW;
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(badgeX, y, badgeW, 6.5, 1, 1, 'FD');

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.text('RECEITA CONTROLE ESPECIAL', badgeX + (badgeW / 2), y + 4.2, { align: 'center' });

    // Subtítulo da Via
    pdf.setFontSize(6);
    if (!isSecondCopy) {
      pdf.setTextColor(153, 27, 27); // Vermelho escuro
      pdf.setFont('helvetica', 'bold');
      pdf.text('1ª VIA: FARMÁCIA (RETENÇÃO)', badgeX + (badgeW / 2), y + 10, { align: 'center' });
    } else {
      pdf.setTextColor(3, 105, 161); // Azul clínico
      pdf.setFont('helvetica', 'bold');
      pdf.text('2ª VIA: PACIENTE (ORIENTAÇÃO)', badgeX + (badgeW / 2), y + 10, { align: 'center' });
    }

    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.text(`Data: ${currentDate}`, badgeX + badgeW, y + 14.5, { align: 'right' });

    // Linha divisória sob cabeçalho
    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.35);
    pdf.line(startX, y + 16.5, startX + colWidth, y + 16.5);

    // Box do Paciente compacto via autoTable
    autoTable(pdf, {
      startY: y + 18,
      margin: { left: startX, right: pageWidth - (startX + colWidth) },
      theme: 'grid',
      head: [['PACIENTE', 'DOC (RG/CPF)', 'PESO', 'IDADE']],
      body: [[patientName.toUpperCase(), patientDoc, patientWeight, patientAge]],
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        fontSize: 6,
        fontStyle: 'bold',
        lineWidth: 0.15,
        lineColor: [203, 213, 225],
        cellPadding: 1
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [15, 23, 42],
        fontSize: 7,
        fontStyle: 'bold',
        lineWidth: 0.15,
        lineColor: [203, 213, 225],
        cellPadding: 1.2
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 32 },
        2: { cellWidth: 20, textColor: [3, 105, 161] },
        3: { cellWidth: 26 }
      }
    });

    let currentY = (pdf as any).lastAutoTable.finalY + 3;

    // Prescrição de Medicamentos
    if (effectiveItems.length === 0) {
      pdf.setFont('times', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Nenhum medicamento de controle especial ou antimicrobiano.', startX + (colWidth / 2), currentY + 15, { align: 'center' });
      currentY += 25;
    } else {
      const itemsByRoute = effectiveItems.reduce((acc, item) => {
        const route = (item.route || 'Oral').toUpperCase();
        if (!acc[route]) acc[route] = [];
        acc[route].push(item);
        return acc;
      }, {} as { [route: string]: PrescriptionItem[] });

      Object.entries(itemsByRoute).forEach(([route, items]) => {
        // Faixa da Rota
        pdf.setFillColor(241, 245, 249);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(startX, currentY, colWidth, 4.5, 0.8, 0.8, 'FD');

        pdf.setTextColor(7, 89, 133);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.text(`USO ${route}`, startX + 2, currentY + 3.2);

        currentY += 5.8;

        const rows: any[] = [];
        items.forEach((item, idx) => {
          const presLower = (item.presentation || '').toLowerCase();
          const qtdLower = (item.quantity || '').toLowerCase();
          const showPres = item.presentation && presLower !== qtdLower && !presLower.includes('caixa') && presLower !== 'uso oral' && !qtdLower.includes(presLower);
          const presLabel = showPres ? ` (${item.presentation})` : '';
          const headline = `${idx + 1}) ${item.name.toUpperCase()}${presLabel} -------- ${item.quantity}`;
          let posologyText = item.instructions;
          if (isSecondCopy && item.scheduleTimes && item.scheduleTimes.length > 0) {
            posologyText += ` [Horários: ${item.scheduleTimes.join(' • ')}]`;
          }
          if (isSecondCopy && item.durationDays) {
            posologyText += ` (Duração: ${item.durationDays} dias)`;
          }
          rows.push([headline, posologyText]);
        });

        autoTable(pdf, {
          startY: currentY,
          margin: { left: startX, right: pageWidth - (startX + colWidth) },
          body: rows.map(r => [
            {
              content: !isSecondCopy 
                ? `${r[0]}\n${r[1]}` 
                : `${r[0]}\nPosologia: ${r[1]}`,
              styles: { font: 'times', fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 } }
            }
          ]),
          theme: 'plain',
          styles: {
            textColor: [15, 23, 42],
            lineColor: [226, 232, 240],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: colWidth }
          }
        });

        currentY = (pdf as any).lastAutoTable.finalY + 2.5;
      });
    }

    // Parte Inferior: Específica de cada Via
    if (!isSecondCopy) {
      // 1ª VIA: Box Comprador e Fornecedor (Portaria 344/98)
      const boxStartY = Math.max(currentY + 2, pageHeight - 68);

      autoTable(pdf, {
        startY: boxStartY,
        margin: { left: startX, right: pageWidth - (startX + colWidth) },
        theme: 'grid',
        head: [['IDENTIFICAÇÃO DO COMPRADOR', 'IDENTIFICAÇÃO DO FORNECEDOR']],
        body: [
          [
            'Nome: ________________________________\nRG/Órgão: ___________  CPF: ___________\nEndereço: _____________________________\nCidade/UF: ____________  Tel: __________',
            'Farmácia/Drogaria: ____________________\nFarmacêutico: _________________________\nData: ___/___/______   Lote: ___________\nQtd Dispensada: _______________________'
          ]
        ],
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontSize: 5.5,
          fontStyle: 'bold',
          lineWidth: 0.15,
          lineColor: [203, 213, 225],
          cellPadding: 1
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [51, 65, 85],
          fontSize: 5.5,
          lineWidth: 0.15,
          lineColor: [203, 213, 225],
          cellPadding: 1.5
        },
        columnStyles: {
          0: { cellWidth: colWidth / 2 },
          1: { cellWidth: colWidth / 2 }
        }
      });
    } else {
      // 2ª VIA: Advertências Sanitárias e Cuidados ao Paciente
      const alertStartY = Math.max(currentY + 2, pageHeight - 62);
      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(254, 202, 202);
      pdf.roundedRect(startX, alertStartY, colWidth, 18, 1, 1, 'FD');

      pdf.setTextColor(153, 27, 27);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.text('⚠️ ORIENTAÇÕES SANITÁRIAS & ADVERTÊNCIAS (PORTARIA 344/98)', startX + 3, alertStartY + 4);

      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.text('• Medicamento sujeito a controle especial. Uso estritamente individual conforme prescrito.', startX + 3, alertStartY + 8);
      pdf.text('• Não altere as doses nem interrompa o tratamento sem prévia avaliação médica.', startX + 3, alertStartY + 11.5);
      pdf.text('• Mantenha este produto fora do alcance de crianças e animais domésticos em local protegido.', startX + 3, alertStartY + 15);
    }

    // Assinatura e Rodapé da Via
    const footerY = pageHeight - 16;
    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.3);
    pdf.line(startX, footerY - 2, startX + colWidth, footerY - 2);

    const sigW = 60;
    const sigX = startX + colWidth - sigW;

    pdf.setTextColor(51, 65, 85);
    pdf.setFont('times', 'italic');
    pdf.setFontSize(7);
    pdf.text(`${doctor?.cityState || 'Brasil'}, ${currentDate}`, startX, footerY + 2.5);

    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.25);
    pdf.line(sigX, footerY + 6, startX + colWidth, footerY + 6);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text(docName.toUpperCase(), sigX + (sigW / 2), footerY + 9.5, { align: 'center' });

    pdf.setTextColor(3, 105, 161);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.text(`CRM-${docCrmState} ${docCrm}`, sigX + (sigW / 2), footerY + 12.5, { align: 'center' });
  };

  // Renderiza 1ª Via (Farmácia) à esquerda
  renderSingleVia(via1X, false);

  // Linha de Corte Central Tracejada
  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.setLineDashPattern([2, 2], 0);
  pdf.line(dividerX, 8, dividerX, pageHeight - 8);
  pdf.setLineDashPattern([], 0); // Reset dash

  // Ícone/Texto de corte no centro da linha divisória
  pdf.setFillColor(255, 255, 255);
  pdf.rect(dividerX - 2.5, 95, 5, 20, 'F');
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('✂', dividerX, 102, { align: 'center' });
  pdf.setFontSize(5.5);
  pdf.text('Corte', dividerX, 107, { align: 'center' });
  pdf.text('aqui', dividerX, 111, { align: 'center' });

  // Renderiza 2ª Via (Paciente) à direita
  renderSingleVia(via2X, true);

  return pdf;
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
    referral
  } = options;

  if (!medicoConfigurado(doctor)) {
    throw new Error('Médico não configurado: documento não emitido.');
  }

  // Se for Receita de Controle Especial, gerar folha única em modo Paisagem com 2 vias lado a lado (Portaria 344/98)
  if (docType === 'special_prescription') {
    return generateSpecialPrescriptionLandscapePDF(options);
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

  // Fallbacks defensivos: atestado/encaminhamento podem ser emitidos sem paciente na sessão ativa.
  const safeCertificate = certificate ?? ({} as MedicalCertificate);
  const safeReferral = referral ?? ({} as MedicalReferral);
  const patientName = patient?.name?.trim() || safeCertificate.patientName?.trim() || safeReferral.patientName?.trim() || 'Não identificado';
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : null;
  const patientDoc = patient?.documentNumber?.trim() || safeCertificate.documentNumber?.trim() || safeReferral.documentNumber?.trim() || '—';
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
  const renderHeader = (doc: jsPDF, isSecondCopy = false) => {
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
    let badgeText = 'RECEITUÁRIO MÉDICO';
    if (docType === 'exams') badgeText = 'SOLICITAÇÃO DE EXAMES';
    else if (docType === 'certificate') badgeText = 'ATESTADO MÉDICO';
    else if (docType === 'referral') badgeText = 'ENCAMINHAMENTO MÉDICO';

    const badgeWidth = 62;
    const badgeX = pageWidth - marginX - badgeWidth;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(badgeX, y, badgeWidth, 8.5, 1.5, 1.5, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(badgeText, badgeX + (badgeWidth / 2), y + 5.5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, badgeX + badgeWidth, y + 13, { align: 'right' });

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

    // QR mini grid simulation
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

  // Render content according to docType
  const renderDocumentContent = (isSecondCopy = false) => {
    let currentY = renderHeader(pdf, isSecondCopy);

    // 1. PRESCRIPTION (Standard Ambulatorial - 1 Via Simples)
    if (docType === 'prescription') {
      const simpleItems = (prescriptionItems || []).filter(i => !isSpecialControlOrAntibiotic(i));
      const hasSpecial = (prescriptionItems || []).some(i => isSpecialControlOrAntibiotic(i));
      const effectiveItems = simpleItems.length > 0 ? simpleItems : (hasSpecial ? [] : prescriptionItems);

      if (effectiveItems.length === 0) {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(11);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Nenhum medicamento simples nesta prescrição.', pageWidth / 2, currentY + 30, { align: 'center' });
      } else {
        const itemsByRoute = effectiveItems.reduce((acc, item) => {
          const route = (item.route || 'Oral').toUpperCase();
          if (!acc[route]) acc[route] = [];
          acc[route].push(item);
          return acc;
        }, {} as { [route: string]: PrescriptionItem[] });

        Object.entries(itemsByRoute).forEach(([route, items]) => {
          // Route Header
          pdf.setFillColor(241, 245, 249);
          pdf.setDrawColor(203, 213, 225);
          pdf.roundedRect(marginX, currentY, contentWidth, 6.5, 1, 1, 'FD');

          pdf.setTextColor(7, 89, 133); // #075985
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.text(`USO ${route}`, marginX + 3, currentY + 4.5);

          currentY += 9;

          // Items Table via autoTable
          const rows: any[] = [];
          items.forEach((item, idx) => {
            const presLower = (item.presentation || '').toLowerCase();
            const qtdLower = (item.quantity || '').toLowerCase();
            const showPres = item.presentation && presLower !== qtdLower && !presLower.includes('caixa') && presLower !== 'uso oral' && !qtdLower.includes(presLower);
            const presLabel = showPres ? ` (${item.presentation})` : '';
            const headline = `${idx + 1})  ${item.name.toUpperCase()}${presLabel}  -------------  ${item.quantity}`;
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
            styles: {
              textColor: [15, 23, 42],
              lineColor: [226, 232, 240],
              lineWidth: 0.1
            },
            columnStyles: {
              0: { cellWidth: contentWidth }
            }
          });

          currentY = (pdf as any).lastAutoTable.finalY + 4;
        });
      }
    }

    // 2. EXAMS REQUEST
    else if (docType === 'exams') {
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
      pdf.text('EXAMES COMPLEMENTARES SOLICITADOS:', marginX, currentY);
      currentY += 3;

      if (exams.length === 0) {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(11);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Nenhum exame selecionado neste pedido.', pageWidth / 2, currentY + 30, { align: 'center' });
      } else {
        autoTable(pdf, {
          startY: currentY,
          margin: { left: marginX, right: marginX },
          theme: 'striped',
          head: [['ITEM', 'EXAME', 'CATEGORIA', 'PREPARO / OBSERVAÇÃO']],
          body: exams.map((exam, idx) => [
            String(idx + 1).padStart(2, '0'),
            exam.name,
            exam.category || 'Geral',
            exam.description || (exam.urgency === 'urgent' ? 'Urgente • Prioritário' : 'Rotina Laboratorial')
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
    }

    // 3. ATESTADO MÉDICO
    else if (docType === 'certificate') {
      currentY += 6;

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text('ATESTADO MÉDICO', pageWidth / 2, currentY, { align: 'center' });

      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.4);
      pdf.line(pageWidth / 2 - 35, currentY + 2.5, pageWidth / 2 + 35, currentY + 2.5);

      currentY += 16;

      const certPatient = safeCertificate.patientName?.trim() || patientName;
      const certDocRaw = safeCertificate.documentNumber?.trim() || (patientDoc !== '—' ? patientDoc : '');
      const certDocNumber = certDocRaw ? `portador(a) do documento nº ${certDocRaw}, ` : '';
      const daysCount = Math.max(1, safeCertificate.daysOff || 1);
      const daysWritten = numberToWordsPtBr(daysCount);
      const startDateFormatted = safeCertificate.startDate
        ? new Date(safeCertificate.startDate + 'T00:00:00').toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      const endDateFormatted = safeCertificate.endDate
        ? new Date(safeCertificate.endDate + 'T00:00:00').toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');

      const certText = `Atesto para os devidos fins de direito que o(a) paciente ${certPatient.toUpperCase()}, ${certDocNumber}esteve sob meus cuidados médicos profissionais no dia ${startDateFormatted}, necessitando de ${daysCount} (${daysWritten}) dia(s) de repouso e afastamento de suas atividades habituais ${safeCertificate.periodText || ''}, com retorno previsto a partir de ${endDateFormatted}.`;

      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);

      const splitCertText = pdf.splitTextToSize(certText, contentWidth - 10);
      pdf.text(splitCertText, marginX + 5, currentY, { lineHeightFactor: 1.6 });

      currentY += (splitCertText.length * 7.5) + 12;

      // CID-10 Box
      if (certificate.includeCID && certificate.cid10Code) {
        pdf.setFillColor(241, 245, 249);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(marginX + 5, currentY, contentWidth - 10, 16, 1.5, 1.5, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Diagnóstico Codificado (CID-10): ', marginX + 9, currentY + 5.5);

        pdf.setTextColor(3, 105, 161);
        pdf.text(`${certificate.cid10Code} - ${certificate.cid10Description || ''}`, marginX + 56, currentY + 5.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text('* Inclusão do CID expressamente solicitada e autorizada pelo(a) paciente (Resolução CFM nº 1.658/2002).', marginX + 9, currentY + 11.5);

        currentY += 22;
      }

      // Observations
      if (certificate.observations) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Observações Médicas:', marginX + 5, currentY);

        pdf.setFont('times', 'italic');
        pdf.setFontSize(10.5);
        pdf.setTextColor(51, 65, 85);
        const splitObs = pdf.splitTextToSize(certificate.observations, contentWidth - 10);
        pdf.text(splitObs, marginX + 5, currentY + 5);
      }
    }

    // 4. ENCAMINHAMENTO
    else if (docType === 'referral') {
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
        { title: 'HIPÓTESE DIAGNÓSTICA (CID-10)', content: referral.hypothesisCID }
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
    }

    renderFooter(pdf);
  };

  // Render 1st page
  renderDocumentContent(false);

  return pdf;
};
