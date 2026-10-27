import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon, resolveIconName } from '../components/Icon';
import { ContextSwitcher } from '../components/ContextSwitcher';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { PediatricCalculator } from '../components/PediatricCalculator';
import { ConsultationReadinessBar } from '../components/bento/ConsultationReadinessBar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PatientModal } from '../components/PatientModal';
import { DoctorProfileModal } from '../components/DoctorProfileModal';
import { Sidebar } from '../components/Sidebar';
import { PRESCMED_TOKENS } from '../config/tokens';
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

  it('exibe os 5 destinos no MobileBottomNav sem truncamento artificial max-w-16', () => {
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
    expect(html).not.toContain('max-w-16');
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

  it('aplica otimização de composição cromática no tema escuro (Regra 60-30-10, elevação modal-content e tokens OKLCH)', () => {
    expect(PRESCMED_TOKENS.cssVars.surfaceHover).toBe('var(--surface-hover)');
    expect(PRESCMED_TOKENS.cssVars.surfaceModal).toBe('var(--surface-modal)');
    expect(PRESCMED_TOKENS.cssVars.textSecondary).toBe('var(--text-secondary)');
    expect(PRESCMED_TOKENS.cssVars.oklchPrimary).toBe('var(--oklch-primary)');
    expect(PRESCMED_TOKENS.cssVars.oklchPrimaryHover).toBe('var(--oklch-primary-hover)');

    const sidebarDarkHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={true}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        doctor={emptyDoctor}
        patient={emptyPatient}
      />
    );
    expect(sidebarDarkHtml).toContain('#1E293B');

    const confirmHtml = renderToStaticMarkup(
      <ConfirmationModal
        isOpen={true}
        title="Confirmar ação"
        description="Descrição secundária legível"
        darkMode={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(confirmHtml).toContain('modal-content');
    expect(confirmHtml).toContain('text-[var(--text-main)]');
    expect(confirmHtml).toContain('text-[var(--text-secondary)]');

    const patientModalHtml = renderToStaticMarkup(
      <PatientModal
        darkMode={true}
        patient={emptyPatient}
        onSavePatient={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(patientModalHtml).toContain('modal-content');

    const doctorModalHtml = renderToStaticMarkup(
      <DoctorProfileModal
        darkMode={true}
        doctor={emptyDoctor}
        onSaveDoctor={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(doctorModalHtml).toContain('modal-content');
    expect(doctorModalHtml).not.toContain('#0E1420');
  });
});
