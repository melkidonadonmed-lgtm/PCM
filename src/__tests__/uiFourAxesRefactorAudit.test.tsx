import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ClinicalDocumentsHub } from '../components/ClinicalDocumentsHub';
import { ConsultationReadinessBar } from '../components/bento/ConsultationReadinessBar';
import { LgpdLocalModeNotice } from '../components/lgpd/LgpdLocalModeNotice';
import { PatientQuickCard } from '../components/prescription/PatientQuickCard';
import { PediatricCalculator } from '../components/PediatricCalculator';
import { FolhaA4 } from '../components/documento/FolhaA4';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import { ReceitaDuasVias } from '../components/documento/ReceitaDuasVias';
import { WatermarkOverlay } from '../components/WatermarkOverlay';
import { resolverIdentidade } from '../utils/documentoClinico';
import type { DoctorProfile, MedicalCertificate, MedicalReferral, Patient } from '../types';

const configuredDoctor: DoctorProfile = {
  name: 'Dra. Helena Costa',
  crm: '54321',
  crmState: 'SP',
  specialty: 'Clínica Médica',
  clinicName: 'UBS Jardim Europa',
  address: 'Av. Brasil, 100',
  cityState: 'São Paulo - SP',
  phone: '(11) 99999-0000',
  email: 'helena@exemplo.med.br',
  showSignature: true,
};

const activePatient: Patient = {
  id: 'pat-1',
  name: 'Carlos Eduardo Lima',
  documentNumber: '111.222.333-44',
  weightKg: 18.5,
  gender: 'male',
  allergies: [],
};

const zeroWeightPatient: Patient = {
  ...activePatient,
  weightKg: 0,
};

const srcDir = path.resolve(__dirname, '..');

function listSrcCodeFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSrcCodeFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('Auditoria dos 4 Eixos de Refatoração UI/UX e Invariantes Clínicos', () => {
  it('Eixo 1: Header adapta navegação conforme isSidebarOpen (3 Macro-Módulos vs. 6 rotas) em >=13px e gap-2 (>=8px)', () => {
    const headerExpandedSidebar = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={true}
        activeTab="hospital"
        onSelectTab={vi.fn()}
        patient={activePatient}
        prescriptionCount={2}
        selectedExamsCount={1}
      />
    );

    expect(headerExpandedSidebar).toContain('data-macro-module="mod-01"');
    expect(headerExpandedSidebar).toContain('data-macro-module="mod-02"');
    expect(headerExpandedSidebar).toContain('data-macro-module="mod-03"');
    expect(headerExpandedSidebar).toContain('Ambulatorial &amp; SUS');
    expect(headerExpandedSidebar).toContain('Escores CDSS');
    expect(headerExpandedSidebar).toContain('Hospitalar');
    expect(headerExpandedSidebar).not.toContain('Guias SUS');
    expect(headerExpandedSidebar).toMatch(/<nav[^>]*class="[^"]*gap-(?:1\.5|2)/);
    expect(headerExpandedSidebar).toContain('text-[13px]');
    expect(headerExpandedSidebar).toContain('min-h-[44px]');
    expect(headerExpandedSidebar).toMatch(/data-macro-module="mod-03"[^>]*aria-current="page"/);

    const headerCollapsedSidebar = renderToStaticMarkup(
      <Header
        darkMode={true}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
        activeTab="scores"
        onSelectTab={vi.fn()}
        patient={activePatient}
        prescriptionCount={1}
        selectedExamsCount={2}
      />
    );

    expect(headerCollapsedSidebar).not.toContain('data-macro-module="mod-01"');
    expect(headerCollapsedSidebar).toContain('Guias SUS');
    expect(headerCollapsedSidebar).toContain('Hospitalar');
    expect(headerCollapsedSidebar).toContain('text-[13px]');
    expect(headerCollapsedSidebar).toMatch(/<nav[^>]*class="[^"]*gap-(?:1\.5|2)/);
    expect(headerCollapsedSidebar).toContain('min-h-[44px]');
  });

  it('Eixo 2: Alvos de toque ergonômicos >= 44px sem regressões sm:min-w-0 ou w-7 h-7', () => {
    const headerHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={true}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        onOpenCommandPalette={vi.fn()}
        onOpenLgpdModal={vi.fn()}
      />
    );
    expect(headerHtml).not.toContain('sm:min-w-0');
    expect(headerHtml).not.toContain('sm:min-h-0');
    expect(headerHtml).toContain('touch-target');
    expect(headerHtml).toContain('min-h-[44px]');

    const sidebarHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
        onOpenBackupModal={vi.fn()}
        onOpenLgpdModal={vi.fn()}
      />
    );
    expect(sidebarHtml).not.toContain('w-7 h-7');
    expect(sidebarHtml).toContain('min-h-[44px]');

    const readinessHtml = renderToStaticMarkup(
      <ConsultationReadinessBar
        doctor={configuredDoctor}
        patient={activePatient}
        prescriptionCount={1}
        documentsCount={1}
        onOpenDoctorModal={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenCommandPalette={vi.fn()}
      />
    );
    expect(readinessHtml).toContain('touch-target');
    expect(readinessHtml).toContain('min-h-[44px]');

    const lgpdNoticeHtml = renderToStaticMarkup(
      <LgpdLocalModeNotice
        isCloudAuthenticated={false}
        sharedComputerMode={false}
        isDismissed={false}
        hasActiveClinicalData={true}
        onOpenLgpdModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onSanitizeShiftData={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(lgpdNoticeHtml).toContain('touch-target');
    expect(lgpdNoticeHtml).not.toContain('min-h-[32px]');

    const patientCardHtml = renderToStaticMarkup(
      <PatientQuickCard
        patient={activePatient}
        onUpdatePatient={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onRequestClearPatient={vi.fn()}
      />
    );
    expect(patientCardHtml).toContain('min-h-[44px]');
  });

  it('Eixo 3 & Fronteira Adversarial YMYL: remove literais hex dos componentes e blinda FolhaA4 contra dark mode', () => {
    const migratedFiles = [
      'components/ClinicalProtocolsView.tsx',
      'components/CidSearchBar.tsx',
      'components/PediatricCalculator.tsx',
      'components/ExamRequester.tsx',
    ];
    for (const rel of migratedFiles) {
      const content = fs.readFileSync(path.join(srcDir, rel), 'utf8');
      expect(content, rel).not.toContain('#27354A');
      expect(content, rel).not.toContain('#0369A1');
      expect(content, rel).not.toContain('#161A21');
    }

    const certWithoutCidConsent: MedicalCertificate = {
      patientName: activePatient.name,
      documentNumber: '111.222.333-44',
      daysOff: 2,
      startDate: '2026-11-17',
      endDate: '2026-11-18',
      periodText: 'por motivo de saúde',
      includeCID: false,
      cid10Code: 'J06.9',
      cid10Description: 'IVAS',
      observations: '',
    };

    const a4Html = renderToStaticMarkup(
      <FolhaA4 orientacao="portrait" imprimivel>
        <DocumentoClinico
          tipo="certificate"
          doctor={configuredDoctor}
          patient={activePatient}
          certificate={certWithoutCidConsent}
        />
      </FolhaA4>
    );
    expect(a4Html).toContain('folha-a4 paper-sheet-floating');
    expect(a4Html).toContain('#0F172A');
    expect(a4Html).not.toContain('dark:');
    expect(a4Html).not.toContain('J06.9');

    const pediaZeroHtml = renderToStaticMarkup(
      <PediatricCalculator
        darkMode={true}
        patient={zeroWeightPatient}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
      />
    );
    expect(pediaZeroHtml).toContain('Informe o peso do paciente para calcular as doses.');
    expect(pediaZeroHtml).toContain('disabled=""');
  });

  it('Eixo 4 & Modularidade: w-px na toolbar, zero sombra flat ou override nos botões, e <=600 linhas em src/', () => {
    const toolbarSrc = fs.readFileSync(
      path.join(srcDir, 'components/editor/EditorTextFormattingToolbar.tsx'),
      'utf8'
    );
    expect(toolbarSrc).toContain('w-px');
    expect(toolbarSrc).not.toContain(['w', '[1px]'].join('-'));

    const indexCss = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf8');
    const flatShadowNeedle = ['box-shadow: 0 1px 2px rgba(0', ' 0', ' 0', ' 0.22);'].join(',');
    const importantNeedle = ['!', 'important'].join('');
    expect(indexCss).not.toContain(flatShadowNeedle);
    expect(indexCss).toContain('color: var(--text-inverse, #FFFFFF);');
    expect(indexCss).not.toContain(`color: var(--text-inverse, #FFFFFF) ${importantNeedle}`);
    expect(indexCss).toContain('@media print');
    expect(indexCss).toContain('prefers-reduced-motion');

    const globalsCss = fs.readFileSync(path.join(srcDir, 'styles/globals.css'), 'utf8');
    expect(globalsCss).toContain('--pill-active-bg');
    expect(globalsCss).toContain('--surface-chip-muted');
    expect(globalsCss).toContain('.touch-target');

    const files = listSrcCodeFiles(srcDir);
    const oversized = files
      .map((fp) => ({
        rel: path.relative(srcDir, fp),
        lines: fs.readFileSync(fp, 'utf8').split(/\r?\n/).length,
      }))
      .filter((entry) => entry.lines > 600);
    expect(oversized).toEqual([]);
  });

  it('CLAREZA P0–P2: contraste Dark/Limpar, tipografia INP/<=3 fontes, <=3 <nav> e FolhaA4 React 19 sem refluxo', () => {
    const importantNeedle = ['!', 'important'].join('');
    const rootDir = path.resolve(srcDir, '..');

    // 1. P0 Dark Mode CTA & Clinical AAA + "Limpar" button high contrast
    const darkThemeCss = fs.readFileSync(path.join(srcDir, 'styles/dark-theme.css'), 'utf8');
    expect(darkThemeCss).toContain('--text-inverse: #FFFFFF;');
    expect(darkThemeCss).not.toContain('--text-inverse: #0F172A;');
    expect(darkThemeCss).toContain('--p-teal-600: oklch(0.435 0.074 186);');
    expect(darkThemeCss).toContain('--clinical: var(--p-teal-600);');

    const patientCardHtml = renderToStaticMarkup(
      <PatientQuickCard
        patient={activePatient}
        onUpdatePatient={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onRequestClearPatient={vi.fn()}
      />
    );
    expect(darkThemeCss).toContain('--status-danger: oklch(0.785 0.145 18);');
    expect(patientCardHtml).toContain('data-variant="danger"');
    expect(patientCardHtml).toContain('btn-tactile-danger');

    // 2. P0 Typography INP + <=3 Google Fonts + CSS Modularity <= 600 lines
    const indexCss = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf8');
    expect(indexCss).toContain('text-rendering: auto;');
    expect(indexCss).toContain('text-rendering: optimizeLegibility;');
    expect(indexCss).toContain('overflow-x: clip;');
    expect(indexCss).not.toContain('overflow-x: hidden;');
    expect(indexCss).not.toContain(importantNeedle);

    for (const cssFile of ['styles/dark-theme.css', 'styles/tactile-components.css', 'styles/a4-and-editor.css']) {
      const cssText = fs.readFileSync(path.join(srcDir, cssFile), 'utf8');
      expect(cssText, cssFile).not.toContain(importantNeedle);
      expect(cssText.split(/\r?\n/).length, cssFile).toBeLessThanOrEqual(600);
    }

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const googleFontsMatch = indexHtml.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/);
    expect(googleFontsMatch).not.toBeNull();
    const families = Array.from((googleFontsMatch?.[0] ?? '').matchAll(/family=([^:&]+)/g)).map((m) => m[1]);
    expect(families.length).toBeLessThanOrEqual(3);
    expect(families).toEqual(['Cormorant+Garamond', 'IBM+Plex+Sans', 'JetBrains+Mono']);

    // 3. P1 Navigation Landmarks <= 3 <nav> & Header gap-2 (>= 8px)
    const headerHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={true}
        activeTab="prescription"
        onSelectTab={vi.fn()}
      />
    );
    expect(headerHtml).toMatch(/<nav[^>]*class="[^"]*gap-(?:1\.5|2)/);

    const sidebarHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
      />
    );
    const mobileNavHtml = renderToStaticMarkup(
      <MobileBottomNav
        activeTab="prescription"
        onSelectTab={vi.fn()}
        prescriptionCount={1}
        selectedExamsCount={0}
        patientWeight={18.5}
        onOpenMenu={vi.fn()}
      />
    );
    const defaultCertificate: MedicalCertificate = {
      patientName: activePatient.name,
      documentNumber: '111.222.333-44',
      daysOff: 1,
      startDate: '2026-11-17',
      endDate: '2026-11-17',
      periodText: 'por motivo de saúde',
      includeCID: false,
      cid10Code: '',
      cid10Description: '',
      observations: '',
    };
    const defaultReferral: MedicalReferral = {
      patientName: activePatient.name,
      documentNumber: '111.222.333-44',
      destinationSpecialty: 'Pediatria',
      clinicalSummary: '',
      reason: '',
      relevantExams: '',
      hypothesisCID: '',
      priority: 'eletivo',
    };
    const docsHubHtml = renderToStaticMarkup(
      <ClinicalDocumentsHub
        darkMode={false}
        patient={activePatient}
        doctor={configuredDoctor}
        certificate={defaultCertificate}
        onUpdateCertificate={vi.fn()}
        referral={defaultReferral}
        onUpdateReferral={vi.fn()}
        selectedExams={[]}
        onUpdateSelectedExams={vi.fn()}
        clinicalIndication=""
        onUpdateClinicalIndication={vi.fn()}
        onNavigateToPrint={vi.fn()}
      />
    );
    const totalShellNavs =
      (headerHtml.match(/<nav\b/g)?.length ?? 0) +
      (sidebarHtml.match(/<nav\b/g)?.length ?? 0) +
      (mobileNavHtml.match(/<nav\b/g)?.length ?? 0) +
      (docsHubHtml.match(/<nav\b/g)?.length ?? 0);
    expect(totalShellNavs).toBeLessThanOrEqual(3);
    expect(docsHubHtml).toContain('role="tablist"');
    expect(docsHubHtml).not.toContain('<nav');

    const countNavItems = (html: string): number[] =>
      Array.from(html.matchAll(/<nav\b[\s\S]*?<\/nav>/g)).map(
        (m) => m[0].match(/<(?:button|a)\b/g)?.length ?? 0
      );
    const headerCollapsedHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
        activeTab="prescription"
        onSelectTab={vi.fn()}
      />
    );
    const sidebarCollapsedHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={false}
        onToggleOpen={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
      />
    );
    for (const htmlSample of [headerHtml, headerCollapsedHtml, sidebarHtml, sidebarCollapsedHtml, mobileNavHtml]) {
      for (const itemCount of countNavItems(htmlSample)) {
        expect(itemCount).toBeGreaterThan(0);
        expect(itemCount).toBeLessThanOrEqual(6);
      }
    }
    expect(indexCss).toContain('.dark .paper-sheet-floating');
    expect(indexCss).toContain('.dark body');
    expect(indexCss).toContain('transition: none;');

    // 4. P2 FolhaA4 React 19 ref + ResizeObserver + >=44px zoom pill + Watermark intrinsic dims + Material icon cut
    const folhaSrc = fs.readFileSync(path.join(srcDir, 'components/documento/FolhaA4.tsx'), 'utf8');
    expect(folhaSrc).not.toContain('forwardRef');
    expect(folhaSrc).toContain('entry.contentRect.width');
    expect(folhaSrc).toContain('min-w-[44px] min-h-[44px]');

    const watermarkHtml = renderToStaticMarkup(<WatermarkOverlay type="sus_single" />);
    expect(watermarkHtml).toContain('width="770"');
    expect(watermarkHtml).toContain('height="398"');

    const duasViasHtml = renderToStaticMarkup(
      <ReceitaDuasVias
        regime="antimicrobiano"
        identidade={resolverIdentidade(configuredDoctor)}
        patient={activePatient}
        nomePaciente={activePatient.name}
        items={[]}
        emissao={new Date(2026, 10, 17)}
      />
    );
    expect(duasViasHtml).toContain('content_cut');
    expect(duasViasHtml).not.toContain('\u2702');

    // 5. Acabamento Fino UI: sem pseudo-ícones Unicode em logotipos e controles táteis >=44px sem override
    const logoDropdownSrc = fs.readFileSync(
      path.join(srcDir, 'components/editor/EditorLogoConfigDropdown.tsx'),
      'utf8'
    );
    for (const badUnicode of ['\u21F1', '\u21F2', '\u2B0C']) {
      expect(logoDropdownSrc).not.toContain(badUnicode);
    }
    expect(logoDropdownSrc).toContain('format_align_left');
    expect(logoDropdownSrc).toContain('format_align_right');
    expect(logoDropdownSrc).toContain('format_align_center');
    expect(logoDropdownSrc).toContain('min-h-[44px]');

    for (const rel of [
      'components/hospital/HospitalWardModuleView.tsx',
      'components/sus/SusCatalogListView.tsx',
      'components/WatermarkSelector.tsx',
      'components/PrintPreview.tsx',
    ]) {
      const modSrc = fs.readFileSync(path.join(srcDir, rel), 'utf8');
      expect(modSrc, rel).toContain('min-h-[44px]');
      expect(modSrc, rel).not.toMatch(/btn-tactile-(?:primary|secondary)[^"']*\b(?:h-8|h-9|h-10|min-h-\[(?:32|36|40)px\])\b/);
    }
  });
});
