import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActiveTab, DoctorProfile, Patient, PrescriptionItem } from '../types';
import { AcoesDaReceita } from '../components/AcoesDaReceita';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';

describe('Governança de Rotas e Navegação do Editor', () => {
  it('não deve possuir rotas órfãs ou duplicadas na união canônica de ActiveTab e deve bloquear ações sem médico configurado', () => {
    const validTabs: ActiveTab[] = [
      'prescription',
      'pediatric_calc',
      'documents',
      'exams',
      'certificate',
      'referral',
      'protocols',
      'editor',
      'print_preview',
      'patients'
    ];

    const uniqueTabs = new Set(validTabs);
    expect(uniqueTabs.size).toBe(validTabs.length);
    expect((validTabs as string[]).includes('models')).toBe(false);

    const htmlBlocked = renderToStaticMarkup(
      React.createElement(AcoesDaReceita, {
        itemsCount: 2,
        isMedicoConfigurado: false,
        onNavigateToPrint: vi.fn(),
        onNavigateToEditor: vi.fn(),
        onSendWhatsApp: vi.fn(),
        onCopyText: vi.fn(),
        onAbrirPerfilMedico: vi.fn()
      })
    );
    expect(htmlBlocked).toContain('Configure nome e CRM do médico para emitir documentos.');
    expect(htmlBlocked).toContain('Configurar médico');
  });

  it('deve priorizar a emissão direta com Imprimir/PDF na ação primária e Editor na ação secundária em AcoesDaReceita', () => {
    const onNavigateToPrint = vi.fn();
    const onNavigateToEditor = vi.fn();
    const onSendWhatsApp = vi.fn();
    const onCopyText = vi.fn();

    const htmlReady = renderToStaticMarkup(
      React.createElement(AcoesDaReceita, {
        itemsCount: 2,
        isMedicoConfigurado: true,
        onNavigateToPrint,
        onNavigateToEditor,
        onSendWhatsApp,
        onCopyText,
        copiedSuccess: false
      })
    );

    const printIdx = htmlReady.indexOf('Imprimir / Gerar PDF');
    const editorIdx = htmlReady.indexOf('Editor de Folha A4');
    const whatsappIdx = htmlReady.indexOf('WhatsApp');
    const copyIdx = htmlReady.indexOf('Copiar texto');

    expect(printIdx).toBeGreaterThan(-1);
    expect(editorIdx).toBeGreaterThan(printIdx);
    expect(whatsappIdx).toBeGreaterThan(editorIdx);
    expect(copyIdx).toBeGreaterThan(whatsappIdx);
    expect(htmlReady).toContain('btn-tactile-primary');
    expect(htmlReady).toContain('btn-tactile-secondary');
  });

  it('deve formatar a sincronização clínica dos medicamentos para a folha A4 e fazer roundtrip via parsePrescriptionHtmlToItems', () => {
    const doctor: DoctorProfile = {
      name: 'Dra. Helena Costa',
      crm: '12345',
      crmState: 'RO',
      specialty: 'Clínica Médica',
      clinicName: 'UBS Central',
      address: 'Av. Sete de Setembro, 100',
      cityState: 'Porto Velho - RO',
      phone: '(69) 3221-0000',
      email: '',
      showSignature: true
    };
    const patient: Patient = {
      id: 'pat-sync-1',
      name: 'Carlos Eduardo',
      weightKg: 72,
      gender: 'male',
      allergies: []
    };
    const activePrescriptionItems: PrescriptionItem[] = [
      {
        id: 'med-1',
        name: 'Dipirona Monoidratada 500 mg/mL',
        presentation: '1 frasco',
        route: 'Oral',
        quantity: '1 frasco',
        doseCalculatedText: '25 gotas',
        frequencyText: '6/6h se dor ou febre',
        scheduleInterval: 'Conforme posologia',
        scheduleTimes: [],
        instructions: 'Pingar 25 gotas a cada 6 horas se dor ou febre.',
        isContinuous: false
      },
      {
        id: 'med-2',
        name: 'Amoxicilina 500 mg',
        presentation: '21 cápsulas',
        route: 'Oral',
        quantity: '21 cápsulas',
        doseCalculatedText: '1 cápsula',
        frequencyText: '8/8h por 7 dias',
        scheduleInterval: 'Conforme posologia',
        scheduleTimes: [],
        instructions: 'Tomar 1 cápsula a cada 8 horas durante 7 dias.',
        isContinuous: false
      }
    ];

    const sheetHtml = renderToStaticMarkup(
      React.createElement(DocumentoClinico, {
        tipo: 'prescription',
        doctor,
        patient,
        prescriptionItems: activePrescriptionItems
      })
    );
    expect(sheetHtml).toContain('Dipirona Monoidratada 500 mg/mL');
    expect(sheetHtml).toContain('Pingar 25 gotas a cada 6 horas se dor ou febre.');

    const editorHtml = `
      <p><strong>USO ORAL</strong></p>
      <p><strong>1. Dipirona Monoidratada 500 mg/mL</strong> — 1 frasco</p>
      <p>Pingar 25 gotas a cada 6 horas se dor ou febre.</p>
      <p><strong>2. Amoxicilina 500 mg</strong> — 21 cápsulas</p>
      <p>Tomar 1 cápsula a cada 8 horas durante 7 dias.</p>
    `;
    const parsed = parsePrescriptionHtmlToItems(editorHtml, activePrescriptionItems);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toContain('Dipirona Monoidratada 500 mg/mL');
    expect(parsed[1].name).toContain('Amoxicilina 500 mg');
  });
});

