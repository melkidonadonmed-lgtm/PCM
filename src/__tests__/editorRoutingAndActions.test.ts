import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActiveTab, DoctorProfile, Patient, PrescriptionItem } from '../types';
import { AcoesDaReceita } from '../components/AcoesDaReceita';
import { acionarImpressaoDiretaDaBancada } from '../components/PrescriptionBuilder';
import { PrintPreview } from '../components/PrintPreview';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import {
  converterCamposEditaveisEmTexto
} from '../utils/folhaA4';
import {
  buildSidebarNavGroups,
  SidebarKitsGroupSection,
} from '../components/SidebarKitsAndFooterSection';
import { buildPresetQuickTemplatePayload } from '../components/editor/editorDocumentPayloads';
import {
  PRESET_STANDARD_MODELS,
  EditorStylesDrawerTab,
} from '../components/editor/EditorStylesTabAndSaveModals';
import { buscarDescricaoCid } from '../components/sus/SusRegulatorySpecificFields';
import {
  SusLmeMedicationFieldsSection,
  linhaVaziaDaLme,
} from '../components/sus/SusLmeMedicationFieldsSection';
import {
  extractDoctorInitials,
  LogoGeneratorControlsColumn,
} from '../components/logo/LogoGeneratorControlsColumn';
import {
  buildOncologyScreeningExamItem,
  resolveActiveDocumentsSubTab,
} from '../components/layout/AppWorkspaceAndModals';
import {
  resolveDraftRecipeType,
  resolveLegacyTypographyId,
  hasEmbeddedInstitutionalHeader,
} from '../hooks/useDocumentTemplatesAndStyles';
import {
  calculateSagittalBalance,
  calculateLawtonYoung,
  calculatePhasesScore,
  calculateVasograde,
} from '../utils/scores/neuroSpineEngine';
import {
  normalizeText,
  stripSaltPrefix,
  extractCommercialBrands,
} from '../utils/fuzzySearch';
import {
  EditorLogoConfigDropdown,
  resolveLogoBadgeLabel,
} from '../components/editor/EditorSheetConfigBar';
import { VALID_DIRECT_TABS, parseTabFromHash } from '../hooks/useNavigationSync';

describe('Governança de Rotas e Navegação do Editor', () => {
  it('não deve possuir rotas órfãs ou duplicadas na união canônica de ActiveTab e deve bloquear ações sem médico configurado', () => {
    const exhaustiveRouteMap: Record<ActiveTab, true> = {
      prescription: true, pediatric_calc: true, documents: true, exams: true,
      certificate: true, referral: true, sus: true, protocols: true,
      scores: true, editor: true, print_preview: true, hospital: true,
    };
    const validTabs = Object.keys(exhaustiveRouteMap) as ActiveTab[];
    const uniqueTabs = new Set(validTabs);
    expect(uniqueTabs.size).toBe(12);
    expect(uniqueTabs).toEqual(VALID_DIRECT_TABS);
    for (const tab of validTabs) {
      expect(parseTabFromHash(`#${tab}`)).toBe(tab);
    }
    expect(parseTabFromHash('#patients')).toBeNull();
    expect(parseTabFromHash('#models')).toBeNull();

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

    const htmlBlank = renderToStaticMarkup(
      React.createElement(AcoesDaReceita, {
        itemsCount: 0,
        isMedicoConfigurado: false,
        onNavigateToPrint: vi.fn(),
        onNavigateToEditor: vi.fn(),
        onSendWhatsApp: vi.fn(),
        onCopyText: vi.fn(),
        onAbrirPerfilMedico: vi.fn()
      })
    );
    expect(htmlBlank).toContain('Imprimir / Gerar PDF');
    expect(htmlBlank).not.toMatch(/disabled=""[^>]*>[\s\S]*?Imprimir \/ Gerar PDF/);

    const previewHtml = renderToStaticMarkup(
      React.createElement(PrintPreview, {
        doctor: {
          name: '',
          crm: '',
          crmState: 'RO',
          specialty: '',
          clinicName: '',
          address: '',
          cityState: '',
          phone: '',
          email: '',
          showSignature: true
        },
        patient: { id: 'p-empty', name: '', weightKg: 0, gender: 'male', allergies: [] },
        prescriptionItems: [],
        exams: [],
        examIndication: '',
        certificate: {
          patientName: '',
          documentNumber: '',
          daysOff: 1,
          startDate: '2026-10-10',
          endDate: '2026-10-10',
          periodText: 'por motivo de saúde',
          includeCID: false,
          cid10Code: '',
          cid10Description: '',
          observations: ''
        },
        referral: {
          patientName: '',
          documentNumber: '',
          destinationSpecialty: 'Clínica Médica',
          reason: '',
          clinicalSummary: '',
          relevantExams: '',
          hypothesisCID: '',
          priority: 'eletivo'
        },
        onBack: vi.fn()
      })
    );
    expect(previewHtml).toContain('Baixar PDF');
    expect(previewHtml).toContain('Imprimir');
    expect(previewHtml).toContain('Antimicrobiano • 2 Vias (0)');
    expect(previewHtml).toContain('Controle Especial • 2 Vias (0)');
    expect(previewHtml).not.toMatch(/id="printable-a4-sheet"[^>]*class="[^"]*no-print/);
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

  it('deve acionar impressão direta na bancada da aba principal sem abrir a aba print_preview quando a folha A4 está presente', () => {
    const fallbackNavigate = vi.fn();
    const printSpy = vi.fn();

    const fakeFolha = {
      classList: {
        contains: () => false
      },
      cloneNode: () => ({
        removeAttribute: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        style: {
          setProperty: vi.fn()
        },
        querySelectorAll: () => []
      }),
      querySelectorAll: () => []
    } as unknown as HTMLElement;

    const resultadoDireto = acionarImpressaoDiretaDaBancada(fakeFolha, fallbackNavigate, printSpy);
    expect(resultadoDireto).toBe('printed');
    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(fallbackNavigate).not.toHaveBeenCalled();

    // Caso adversarial: sem folha montada no DOM, cai para o fallback de navegação
    const resultadoFallback = acionarImpressaoDiretaDaBancada(null, fallbackNavigate, printSpy);
    expect(resultadoFallback).toBe('fallback');
    expect(fallbackNavigate).toHaveBeenCalledTimes(1);
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

  it('deve preparar a folha para impressão nativa convertendo inputs com valor em texto quebrável e suprimindo placeholders vazios', () => {
    const campoClinic = {
      tagName: 'INPUT',
      type: 'text',
      value: 'UNIDADE DE SAÚDE DA FAMÍLIA',
      removed: false,
      replacedWith: null as unknown,
      remove() {
        this.removed = true;
      },
      replaceWith(el: unknown) {
        this.replacedWith = el;
      }
    };

    const campoPacienteVazio = {
      tagName: 'INPUT',
      type: 'text',
      value: '   ',
      placeholder: 'Identificação do paciente (opcional: digite o nome e documento aqui)',
      removed: false,
      replacedWith: null as unknown,
      remove() {
        this.removed = true;
      },
      replaceWith(el: unknown) {
        this.replacedWith = el;
      }
    };

    const fakeDoc = {
      defaultView: {
        getComputedStyle: () => ({
          fontFamily: 'serif',
          fontSize: '14px',
          fontWeight: '700',
          fontStyle: 'normal',
          lineHeight: '1.3',
          letterSpacing: '0px',
          textAlign: 'left',
          textTransform: 'uppercase',
          color: '#0F172A',
          paddingTop: '2px',
          paddingRight: '4px',
          paddingBottom: '2px',
          paddingLeft: '4px',
          display: 'block',
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px'
        })
      },
      createElement: (tag: string) => ({
        tagName: tag.toUpperCase(),
        textContent: '',
        style: {} as Record<string, string>
      })
    } as unknown as Document;

    const fakeFolhaClonada = {
      querySelectorAll: () => [campoClinic, campoPacienteVazio]
    } as unknown as HTMLElement;

    converterCamposEditaveisEmTexto(fakeDoc, fakeFolhaClonada);

    expect(campoClinic.removed).toBe(false);
    const blocoClinic = campoClinic.replacedWith as { textContent: string; style: Record<string, string> };
    expect(blocoClinic).not.toBeNull();
    expect(blocoClinic.textContent).toBe('UNIDADE DE SAÚDE DA FAMÍLIA');
    expect(blocoClinic.style.whiteSpace).toBe('normal');
    expect(blocoClinic.style.overflowWrap).toBe('break-word');

    expect(campoPacienteVazio.removed).toBe(true);
    expect(campoPacienteVazio.replacedWith).toBeNull();
  });

  it('deve validar grupos de navegação da Sidebar, payloads de modelos padrão do Editor, busca de CID SUS e iniciais do gerador de logo', () => {
    // 1. SidebarKitsAndFooterSection: badges apenas quando contagem/peso > 0
    const groupsZero = buildSidebarNavGroups(0, 0, 0);
    expect(groupsZero.coreHubNavItems[0].badge).toBeUndefined();
    expect(groupsZero.coreHubNavItems[1].badge).toBeUndefined();
    expect(groupsZero.clinicalToolsNavItems[0].badge).toBeUndefined();
    expect(groupsZero.clinicalToolsNavItems[2].badge).toBe('114');

    const groupsActive = buildSidebarNavGroups(3, 5, 18.5);
    expect(groupsActive.coreHubNavItems[0].badge).toBe('3');
    expect(groupsActive.coreHubNavItems[1].badge).toBe('5');
    expect(groupsActive.clinicalToolsNavItems[0].badge).toBe('18.5kg');

    const kitsExpandedHtml = renderToStaticMarkup(
      React.createElement(SidebarKitsGroupSection, {
        isOpen: true,
        showKits: true,
        onToggleKits: vi.fn(),
        onExpandAndShowKits: vi.fn(),
        onApplyKit: vi.fn(),
      })
    );
    expect(kitsExpandedHtml).toContain('id="sidebar-kits-list"');

    // 2. editorDocumentPayloads + EditorStylesTabAndSaveModals: escapa XSS e configura 2 vias na receita_especial
    expect(PRESET_STANDARD_MODELS.length).toBeGreaterThanOrEqual(9);
    const specialPreset = buildPresetQuickTemplatePayload(
      'receita_especial',
      {
        id: 'p-xss',
        name: 'Maria <script>alert(1)</script>',
        documentNumber: '111.222.333-44',
        weightKg: 60,
        gender: 'female',
        allergies: [],
      },
      []
    );
    expect(specialPreset.viaLayout).toBe('2-vias');
    expect(specialPreset.pageOrientation).toBe('landscape');
    expect(specialPreset.templateHtml).not.toContain('<script>');
    expect(specialPreset.templateHtml).toContain('Maria &lt;script&gt;alert(1)&lt;/script&gt;');

    const stylesTabHtml = renderToStaticMarkup(
      React.createElement(EditorStylesDrawerTab, {
        customStyles: [],
        setIsModelsDrawerOpen: vi.fn(),
        setIsSaveStyleModalOpen: vi.fn(),
        handleDeleteCustomStyle: vi.fn(),
        handleApplyStyle: vi.fn(),
      })
    );
    expect(stylesTabHtml).toContain('Estilos Padrão de Fábrica');

    // 3. SusRegulatorySpecificFields + SusLmeMedicationFieldsSection
    expect(buscarDescricaoCid('m54.5')).toContain('Dor lombar baixa');
    expect(buscarDescricaoCid('   ')).toBe('');
    expect(buscarDescricaoCid('CODIGO_INEXISTENTE_999')).toBe('');

    const lmeHtmlWithRepeat = renderToStaticMarkup(
      React.createElement(SusLmeMedicationFieldsSection, {
        formData: {
          doctorName: '',
          doctorCrm: '',
          doctorCrmState: 'RO',
          doctorSpecialty: '',
          doctorCnes: '',
          doctorClinicName: '',
          patientName: '',
          patientCns: '',
          patientCpf: '',
          patientBirthDate: '',
          patientAge: '',
          patientGender: 'female',
          patientSex: 'F',
          patientMotherName: '',
          patientPhone: '',
          patientAddress: '',
          patientNeighborhood: '',
          patientCity: '',
          patientState: 'RO',
          patientCep: '',
          cid10Code: '',
          cid10Description: '',
          clinicalJustification: '',
        },
        linhasDaLme: [{ name: 'Atorvastatina 40 mg', quantities: ['30', '', '', '', '', ''] }],
        onFieldChange: vi.fn(),
        onAlterarLinhaDaLme: vi.fn(),
      })
    );
    expect(lmeHtmlWithRepeat).toContain('Repetir a quantidade do 1º mês nos 6 meses');
    expect(linhaVaziaDaLme().quantities).toHaveLength(6);

    // 4. LogoGeneratorControlsColumn: extração de iniciais do médico sem prefixos Dr./Dra.
    expect(extractDoctorInitials('Dra. Helena Costa')).toBe('HC');
    expect(extractDoctorInitials('Dr. Marcos')).toBe('M');
    expect(extractDoctorInitials('   ')).toBe('PCM');

    const logoControlsHtml = renderToStaticMarkup(
      React.createElement(LogoGeneratorControlsColumn, {
        symbol: 'monogram',
        setSymbol: vi.fn(),
        monogramText: 'HC',
        setMonogramText: vi.fn(),
        frame: 'double_circle',
        setFrame: vi.fn(),
        paletteKey: 'sus',
        setPaletteKey: vi.fn(),
        institutionName: 'UBS CENTRAL',
        setInstitutionName: vi.fn(),
        subtitle: 'ATENÇÃO BÁSICA',
        setSubtitle: vi.fn(),
        textLayout: 'curved',
        setTextLayout: vi.fn(),
      })
    );
    expect(logoControlsHtml).toContain('aria-label="Iniciais do monograma"');
    expect(logoControlsHtml).toContain('Arco Circular');
  });

  it('deve validar helpers modulares da TASK-09 (exames de rastreio INCA, restauração de rascunho, motores neurovasculares, taxonomia fuzzy e dropdown de logotipo)', () => {
    // 1. AppWorkspaceAndModals: mapeia exames de rastreio canônicos e bloqueia IDs vazios/desconhecidos sem inventar PSA
    const mamo = buildOncologyScreeningExamItem('mamografia');
    expect(mamo?.name).toContain('SIGTAP 02.04.03.018-8');
    const papa = buildOncologyScreeningExamItem('PAPANICOLAOU');
    expect(papa?.name).toContain('SIGTAP 02.03.01.008-6');
    expect(buildOncologyScreeningExamItem('')).toBeNull();
    expect(buildOncologyScreeningExamItem('   ')).toBeNull();
    expect(buildOncologyScreeningExamItem('exame-inexistente-999')).toBeNull();

    expect(resolveActiveDocumentsSubTab('sus', 'certificate')).toBe('sus');
    expect(resolveActiveDocumentsSubTab('referral', 'certificate')).toBe('referral');
    expect(resolveActiveDocumentsSubTab('documents', 'exams')).toBe('exams');

    // 2. useDocumentActiveLoadersAndDraft: detecção de regime do rascunho, tipografia legada e cabeçalho embutido
    expect(resolveDraftRecipeType('RECEITUÁRIO DE CONTROLE ESPECIAL')).toBe('controle_especial');
    expect(resolveDraftRecipeType('RECEITUÁRIO MÉDICO — ANTIMICROBIANO')).toBe('antimicrobiano');
    expect(resolveDraftRecipeType('RECEITUÁRIO MÉDICO')).toBe('simples');
    expect(resolveDraftRecipeType('ATESTADO MÉDICO')).toBeNull();
    expect(resolveDraftRecipeType('')).toBeNull();

    expect(resolveLegacyTypographyId('serif')).toBe('cormorant');
    expect(resolveLegacyTypographyId('sans')).toBe('jakarta');
    expect(resolveLegacyTypographyId('inter')).toBe('inter');
    expect(resolveLegacyTypographyId('   ')).toBeNull();

    expect(hasEmbeddedInstitutionalHeader('<div style="border-bottom: 2px solid #000">UBS</div>')).toBe(true);
    expect(hasEmbeddedInstitutionalHeader('<p>Texto simples</p>')).toBe(false);
    expect(hasEmbeddedInstitutionalHeader('')).toBe(false);

    // 3. neuroSpineEngine + neurovascularEngine: alerta geométrico Duval-Beaupère e escores neurovasculares
    const inconsistentSagittal = calculateSagittalBalance({ pi: 60, pt: 15, ss: 35, ll: 30, sva: 110 });
    expect(inconsistentSagittal.activeRiskTier.severityLevel).toBe('critical');
    expect(inconsistentSagittal.warnings?.[0]).toContain('Inconsistência geométrica espinopélvica');

    const lawtonHigh = calculateLawtonYoung({ spetzlerMartin: 4, age: 55, unruptured: true, diffuse: true });
    expect(lawtonHigh.score).toBe(9);
    expect(lawtonHigh.activeRiskTier.severityLevel).toBe('critical');

    const phasesHigh = calculatePhasesScore({ population: 'finland', hypertension: true, age: 74, size: 12, earlierSah: true, site: 'pcoa' });
    expect(phasesHigh.score).toBe(18);
    expect(phasesHigh.scoreFormatted).toContain('> 17.8%');

    const vasogradeRed = calculateVasograde({ wfns: 4, fisher: 3 });
    expect(vasogradeRed.activeRiskTier.severityLevel).toBe('critical');
    expect(vasogradeRed.activeRiskTier.pharmacologicalActions[0].drugName).toContain('Nimodipino');

    // 4. fuzzySearch + fuzzySearchTaxonomy: extração de marcas ignorando dosagens numéricas e preservação de sais minerais
    const brands = extractCommercialBrands('Dipirona Sódica (1g) (Novalgina, Anador) (500mg/mL)', normalizeText);
    expect(brands).toEqual(['novalgina', 'anador']);
    expect(stripSaltPrefix('cloridrato de metformina')).toBe('metformina');
    expect(stripSaltPrefix('sulfato ferroso')).toBe('sulfato ferroso');
    expect(stripSaltPrefix('sulfato de zinco')).toBe('sulfato de zinco');

    // 5. EditorLogoConfigDropdown: selo de contagem de logos e renderização do menu aberto
    expect(resolveLogoBadgeLabel({ dataUrl: null, position: 'header-left', size: 'md', visible: true })).toBeNull();
    expect(resolveLogoBadgeLabel({ dataUrl: 'data:image/png;base64,AAA', position: 'header-left', size: 'md', visible: true })).toBe('1 Logo');
    expect(
      resolveLogoBadgeLabel({
        dataUrl: 'data:image/png;base64,AAA',
        position: 'header-left',
        size: 'md',
        visible: true,
        secondaryDataUrl: 'data:image/png;base64,BBB',
        secondaryVisible: true,
      })
    ).toBe('Duplo');

    const logoDropdownHtml = renderToStaticMarkup(
      React.createElement(EditorLogoConfigDropdown, {
        logoConfig: { dataUrl: 'data:image/png;base64,AAA', position: 'header-left', size: 'md', visible: true },
        isLogoMenuOpen: true,
        setIsLogoMenuOpen: vi.fn(),
        activeLogoTab: 'left',
        setActiveLogoTab: vi.fn(),
        handleChangeLogoPosition: vi.fn(),
        handleChangeLogoSize: vi.fn(),
        fileInputRef: { current: null },
        handleLogoUpload: vi.fn(),
        logoUploading: false,
        setIsLogoGeneratorOpen: vi.fn(),
        handleApplyPresetLogo: vi.fn(),
        handleRemoveLogo: vi.fn(),
        handleChangeSecondaryLogoSize: vi.fn(),
        secondaryFileInputRef: { current: null },
        handleSecondaryLogoUpload: vi.fn(),
        secondaryLogoUploading: false,
        handleApplySecondaryPresetLogo: vi.fn(),
        handleRemoveSecondaryLogo: vi.fn(),
      })
    );
    expect(logoDropdownHtml).toContain('Timbrado / Logotipos');
    expect(logoDropdownHtml).toContain('Remover Logo Esquerdo');
  });
});

