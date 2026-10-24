import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon, resolveIconName } from '../components/Icon';
import { ContextSwitcher } from '../components/ContextSwitcher';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { PediatricCalculator } from '../components/PediatricCalculator';
import { ConsultationReadinessBar } from '../components/bento/ConsultationReadinessBar';
import type { DoctorProfile, Patient, WorkContext } from '../types';

const mockContext: WorkContext = {
  id: 'ctx-sus',
  name: 'UBS Vila Mariana',
  sphere: 'municipal',
  clinicName: 'Secretaria Municipal de Saúde',
  clinicAddress: 'Rua Domingos de Morais, 100',
  cnes: '1234567',
  logoAlignment: 'left',
  watermarkType: 'sus_double',
  doctorCredentials: {
    crm: '123456',
    uf: 'SP',
    specialty: 'Clínica Médica',
  },
  documentFormatting: {
    headerType: 'standard',
    prescriptionViaCount: 1,
    showCnesOnHeader: true,
    referralModel: 'sus_regulation',
    examHeaderTitle: 'SOLICITAÇÃO DE EXAMES',
  },
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const emptyDoctor: DoctorProfile = {
  name: '',
  crm: '',
  crmState: 'SP',
  specialty: '',
  clinicName: '',
  address: '',
  cityState: '',
  phone: '',
  email: '',
  showSignature: true,
};

const emptyPatient: Patient = {
  id: 'pat-empty',
  name: '',
  weightKg: 0,
  gender: 'other',
  allergies: [],
};

describe('Design Interface Médica Minimalista (v3.0.0) — Regressão Mobile & Precisão Clínica', () => {
  it('resolve aliases clínicos críticos (sus, guias_sus, verified) e blinda o container do ícone com overflow-hidden', () => {
    expect(resolveIconName('sus')).toBe('local_hospital');
    expect(resolveIconName('guias_sus')).toBe('clinical_notes');
    expect(resolveIconName('verified')).toBe('verified_user');
    expect(resolveIconName('arrow_downward')).toBe('expand_more');

    const html = renderToStaticMarkup(<Icon name="sus" size="xs" />);
    expect(html).toContain('local_hospital');
    expect(html).toContain('overflow-hidden');
  });

  it('mantém contraste escuro nos seletores institucionais (ContextSwitcher) dentro da Sidebar Navy', () => {
    const html = renderToStaticMarkup(
      <ContextSwitcher
        contexts={[mockContext]}
        activeContext={mockContext}
        onSwitchContext={vi.fn()}
      />
    );
    expect(html).toContain('bg-white/[0.05]');
    expect(html).toContain('surface-inset');
    expect(html).toContain('Local de Atuação (SUS)');
  });

  it('exibe os 5 destinos no MobileBottomNav sem truncamento artificial max-w-[68px]', () => {
    const html = renderToStaticMarkup(
      <MobileBottomNav
        activeTab="prescription"
        onSelectTab={vi.fn()}
        prescriptionCount={2}
        selectedExamsCount={1}
        patientWeight={18}
        onOpenMenu={vi.fn()}
      />
    );
    expect(html).not.toContain('max-w-[68px]');
    expect(html).toContain('whitespace-nowrap');
    expect(html).toContain('Documentos');
    expect(html).toContain('id="mobile-nav-hospital"');
    expect(html).toContain('Hospitalar');
    expect(html).not.toContain('id="mobile-nav-pediatric_calc"');
  });

  it('renderiza badges de categoria na Calculadora Pediátrica em linha única (inline-flex whitespace-nowrap) e controles compactos de peso', () => {
    const html = renderToStaticMarkup(
      <PediatricCalculator
        darkMode={false}
        patient={{ ...emptyPatient, name: 'Lucas', weightKg: 15 }}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
      />
    );
    expect(html).toContain('inline-flex items-center whitespace-nowrap');
    expect(html).toContain('scrollbar-none');
  });

  it('oculta o atalho de teclado Ctrl+K em telas mobile na ConsultationReadinessBar', () => {
    const html = renderToStaticMarkup(
      <ConsultationReadinessBar
        doctor={emptyDoctor}
        patient={emptyPatient}
        prescriptionCount={0}
        documentsCount={0}
        onOpenDoctorModal={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenCommandPalette={vi.fn()}
      />
    );
    expect(html).toContain('hidden sm:inline-flex');
    expect(html).toContain('Ctrl+K');
  });
});
