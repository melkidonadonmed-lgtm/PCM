import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PrescriptionItem, Patient, DoctorProfile, WorkContext } from '../types';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { classificarReceita, type RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import { DOCUMENTO_DO_REGIME, separarPorRegime, type TipoDocumento } from '../utils/documentoClinico';
import { acionarImpressaoDiretaDaBancada } from '../utils/folhaA4';
import { notificacaoExigida } from '../utils/notificacaoDeReceita';
import { calcularPrescricaoRapida, FrequenciaHorario, UnidadeDose } from '../utils/prescricaoRapida';
import { Icon } from './Icon';
import { ConfirmationModal } from './ConfirmationModal';
import { formatarReceitaCopiaTexto, formatarReceitaWhatsAppTexto } from '../utils/compartilhamentoTexto';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { usePrescriptionModels, type ConfirmActionState } from '../hooks/usePrescriptionModels';
import { PatientQuickCard } from './prescription/PatientQuickCard';
import { MedicationComposerCard } from './prescription/MedicationComposerCard';
import { PrescribedItemsList } from './prescription/PrescribedItemsList';
import { PrescriptionModelsModal } from './prescription/PrescriptionModelsModal';
import { PrescriptionPreviewColumn } from './prescription/PrescriptionPreviewColumn';
import {
  REGIMES, REGIME_INFO, resolveMedicationKeyAction, inferirUnidadeDoseDoMedicamento,
  construirOuAtualizarItemPrescrito, usePrescriptionSearchHotkeys,
} from './prescription/prescriptionComposerHelpers';

export { acionarImpressaoDiretaDaBancada, resolveMedicationKeyAction };

interface PrescriptionBuilderProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  onUpdateDoctor?: (doctor: DoctorProfile) => void;
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  activeContext?: WorkContext | null;
  items: PrescriptionItem[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  weightCalcEnabled?: boolean;
  onToggleWeightCalc?: (enabled: boolean) => void;
  onClearPrescription?: () => void;
  onClearPatient?: () => void;
  onNavigateToPrint: (docType?: TipoDocumento) => void;
  onNavigateToPediatricCalc?: () => void;
  onNavigateToEditor?: () => void;
  onNavigateToCertificate?: () => void;
  onNavigateToReferral?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToSus?: () => void;
  onOpenDoctorModal?: () => void;
  onOpenPatientModal: () => void;
  medicamentoPendente?: UnifiedMedication | null;
  onConsumirMedicamentoPendente?: () => void;
  onAbrirPerfilMedico?: () => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  darkMode: _darkMode,
  doctor,
  patient,
  onUpdatePatient,
  activeContext = null,
  items,
  onUpdateItems,
  onClearPrescription,
  onClearPatient,
  onNavigateToPrint,
  onNavigateToEditor,
  onNavigateToCertificate,
  onNavigateToReferral,
  onNavigateToExams,
  onNavigateToSus,
  onOpenDoctorModal,
  onOpenPatientModal,
  medicamentoPendente,
  onConsumirMedicamentoPendente,
  onAbrirPerfilMedico,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pediatricDrawerRef = useRef<HTMLDivElement>(null);
  const folhaPreviewRef = useRef<HTMLDivElement>(null);

  const [mobileSection, setMobileSection] = useState<'composer' | 'preview'>('composer');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState<number>(-1);

  const [selectedMedName, setSelectedMedName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('Uso Oral');
  const [selectedQuantity, setSelectedQuantity] = useState('30 comprimidos');
  const [selectedPosology, setSelectedPosology] = useState('');
  const [selectedRegime, setSelectedRegime] = useState<RegimeReceita>('simples');

  const [doseAmount, setDoseAmount] = useState<number>(1);
  const [doseUnit, setDoseUnit] = useState<UnidadeDose>('comprimido');
  const [doseFrequency, setDoseFrequency] = useState<FrequenciaHorario>('8/8h');
  const [doseDays, setDoseDays] = useState<number>(5);
  const [isContinuousDose, setIsContinuousDose] = useState<boolean>(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);
  const [isPediatricDrawerOpen, setIsPediatricDrawerOpen] = useState(false);

  useModalAccessibility({
    isOpen: isPediatricDrawerOpen,
    onClose: () => setIsPediatricDrawerOpen(false),
    containerRef: pediatricDrawerRef,
  });

  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

  const {
    isSaveModelModalOpen, setIsSaveModelModalOpen, isLoadModelModalOpen, setIsLoadModelModalOpen,
    newModelName, setNewModelName, savedPrescriptionModels, prescriptionModelToast,
    showNotice, isCreatingCustomModel, setIsCreatingCustomModel, customModelDraftTitle,
    setCustomModelDraftTitle, customModelDraftItems, setCustomModelDraftItems,
    customModelSearchTerm, setCustomModelSearchTerm, customModelSuggestions,
    loadPrescriptionModels, handleCustomModelSearchChange, handleAddCustomModelItem,
    handleRemoveCustomModelItem, handleUpdateCustomModelItem, handleSaveCustomCreatedModel,
    handleSavePrescriptionModel, handleApplyPrescriptionModel, handleDeletePrescriptionModel,
  } = usePrescriptionModels({ items, onUpdateItems, setConfirmAction });

  const [showExtraPatientFields, setShowExtraPatientFields] = useState(() =>
    Boolean((patient?.documentNumber && patient.documentNumber.trim()) || (patient?.weightKg && patient.weightKg > 0))
  );

  const patientName = patient?.name?.trim() || '';
  const porRegime = useMemo(() => separarPorRegime(items), [items]);
  const regimesComItens = REGIMES.filter((regime) => porRegime[regime].length > 0);
  const itensEmDuasVias = porRegime.antimicrobiano.length + porRegime.controle_especial.length;

  const [previewRegime, setPreviewRegime] = useState<RegimeReceita | null>(null);
  const regimeAtivo: RegimeReceita =
    regimesComItens.length === 0
      ? (previewRegime ?? selectedRegime)
      : previewRegime && porRegime[previewRegime].length > 0
        ? previewRegime
        : (regimesComItens[0] ?? 'simples');
  const itemsInPreview = porRegime[regimeAtivo];

  const handlePrintClick = () => {
    const folha =
      folhaPreviewRef.current ??
      (typeof document !== 'undefined'
        ? (document.getElementById('printable-a4-sheet') as HTMLDivElement | null)
        : null);
    acionarImpressaoDiretaDaBancada(folha, () => onNavigateToPrint(DOCUMENTO_DO_REGIME[regimeAtivo]));
  };

  const notificacaoDoFormulario = notificacaoExigida(selectedMedName);
  const isDoctorConfigured = medicoConfigurado(doctor);
  const handleAbrirPerfilMedico = onAbrirPerfilMedico || onOpenDoctorModal;

  usePrescriptionSearchHotkeys(searchInputRef, setMobileSection, setShowSuggestions);

  const searchSuggestions = useMemo(() => {
    const term = selectedMedName.trim();
    if (!term || term.length < 2) return [];
    return searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all').slice(0, 8);
  }, [selectedMedName]);

  const handleAtualizarConstrutor = (
    novoDose: number,
    novoUnit: UnidadeDose,
    novoFreq: FrequenciaHorario,
    novoDays: number,
    novoContinuo: boolean,
    viaAtual: string = selectedRoute
  ) => {
    setDoseAmount(novoDose);
    setDoseUnit(novoUnit);
    setDoseFrequency(novoFreq);
    setDoseDays(novoDays);
    setIsContinuousDose(novoContinuo);

    const res = calcularPrescricaoRapida({
      dose: novoDose,
      unidade: novoUnit,
      frequencia: novoFreq,
      diasTratamento: novoDays,
      usoContinuo: novoContinuo,
      via: viaAtual,
    });

    setSelectedPosology(res.posologiaTexto);
    setSelectedQuantity(res.quantidadeTotalTexto);
  };

  const handleSelectMedication = (med: UnifiedMedication) => {
    setSelectedMedName(med.name);
    setSelectedRoute(med.route);
    setSelectedQuantity(med.defaultQuantity || '30 comprimidos');
    setSelectedPosology(med.defaultPosology);
    setSelectedRegime(classificarReceita(med));
    setDoseUnit(inferirUnidadeDoseDoMedicamento(med.name));
    setShowSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  const handleMedInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const action = resolveMedicationKeyAction(
      e.key, showSuggestions, searchSuggestions, highlightedSuggestionIndex, selectedMedName
    );
    if (action.type === 'highlight') {
      e.preventDefault();
      setHighlightedSuggestionIndex(action.nextIndex);
    } else if (action.type === 'select') {
      e.preventDefault();
      handleSelectMedication(action.medication);
    } else if (action.type === 'dismiss') {
      e.preventDefault();
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    setSelectedRegime(classificarReceita(selectedMedName));
  }, [selectedMedName]);

  useEffect(() => {
    if (medicamentoPendente) {
      handleSelectMedication(medicamentoPendente);
      onConsumirMedicamentoPendente?.();
    }
  }, [medicamentoPendente, onConsumirMedicamentoPendente]);

  const resetComposerFields = () => {
    setEditingItemId(null);
    setSelectedMedName('');
    setSelectedQuantity('30 comprimidos');
    setSelectedPosology('');
    setSelectedRegime('simples');
    setDoseAmount(1);
    setDoseUnit('comprimido');
    setDoseFrequency('8/8h');
    setDoseDays(5);
    setIsContinuousDose(false);
  };

  const handleStartEdit = (item: PrescriptionItem) => {
    setEditingItemId(item.id);
    setSelectedMedName(item.name);
    setSelectedRoute(item.route);
    setSelectedQuantity(item.quantity);
    setSelectedPosology(item.instructions);
    setSelectedRegime(classificarReceita(item));
    setDoseUnit(inferirUnidadeDoseDoMedicamento(item.name));

    if (searchInputRef.current) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      searchInputRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  const handleAddMedicationToPrescription = () => {
    if (!selectedMedName.trim()) {
      showNotice('Por favor, informe o nome do medicamento.');
      return;
    }

    const { updatedItems, regime } = construirOuAtualizarItemPrescrito(
      {
        selectedMedName, selectedRoute, selectedQuantity, selectedPosology,
        doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose,
      },
      items,
      editingItemId
    );

    onUpdateItems(updatedItems);
    setPreviewRegime(regime);
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2000);
    resetComposerFields();
  };

  const handleRemoveItem = (id: string) => onUpdateItems(items.filter((i) => i.id !== id));

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onUpdateItems(newItems);
  };

  const handleCopyText = () => {
    if (items.length === 0 || !medicoConfigurado(doctor)) return;
    const text = formatarReceitaCopiaTexto(items, regimesComItens, porRegime);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const text = formatarReceitaWhatsAppTexto({ items, regimesComItens, porRegime, doctor, patient });
    if (!text) {
      showNotice('Adicione pelo menos um medicamento à receita antes de enviar.');
      return;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div data-state="idle" aria-busy={false} className="w-full max-w-7xl mx-auto flex flex-col gap-3 sm:gap-3.5 surface-raised">
      <div className="flex md:hidden items-center justify-between p-1 rounded-2xl nav-segmented-track gap-1">
        <button
          type="button"
          onClick={() => setMobileSection('composer')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            mobileSection === 'composer' ? 'nav-segmented-pill-active font-bold' : 'text-[var(--text-secondary)] font-semibold'
          }`}
        >
          <Icon name="medication" size={15} filled={mobileSection === 'composer'} className={mobileSection === 'composer' ? 'text-sky-600 dark:text-sky-400' : 'opacity-70'} />
          <span>Prescrever medicamentos</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer clinical-tabular-nums ${
            mobileSection === 'preview' ? 'nav-segmented-pill-active font-bold' : 'text-[var(--text-secondary)] font-semibold'
          }`}
        >
          <Icon name="description" size={15} filled={mobileSection === 'preview'} className={mobileSection === 'preview' ? 'text-sky-600 dark:text-sky-400' : 'opacity-70'} />
          <span>Visualizar receita ({items.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 xl:gap-4 items-start">
        <div className={`xl:col-span-7 flex flex-col gap-3 ${mobileSection === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <PatientQuickCard
            patient={patient}
            showExtraPatientFields={showExtraPatientFields}
            onToggleExtraFields={() => setShowExtraPatientFields((prev) => !prev)}
            onUpdatePatient={onUpdatePatient}
            onOpenPatientModal={onOpenPatientModal}
            onRequestClearPatient={
              patientName && onClearPatient
                ? () => {
                    setConfirmAction({
                      title: 'Limpar atendimento e paciente?',
                      description: 'Deseja limpar os dados deste paciente e reiniciar a consulta atual para segurança clínica?',
                      confirmLabel: 'Limpar atendimento',
                      onConfirm: () => {
                        setConfirmAction(null);
                        onClearPatient();
                      },
                    });
                  }
                : undefined
            }
            onNavigateToCertificate={onNavigateToCertificate}
            onNavigateToReferral={onNavigateToReferral}
            onNavigateToExams={onNavigateToExams}
            onNavigateToSus={onNavigateToSus}
          />

          <MedicationComposerCard
            searchInputRef={searchInputRef}
            editingItemId={editingItemId}
            selectedMedName={selectedMedName}
            selectedRoute={selectedRoute}
            selectedQuantity={selectedQuantity}
            selectedPosology={selectedPosology}
            selectedRegime={selectedRegime}
            doseAmount={doseAmount}
            doseUnit={doseUnit}
            doseFrequency={doseFrequency}
            doseDays={doseDays}
            isContinuousDose={isContinuousDose}
            showSuggestions={showSuggestions}
            highlightedSuggestionIndex={highlightedSuggestionIndex}
            searchSuggestions={searchSuggestions}
            notificacaoDoFormulario={notificacaoDoFormulario}
            regimeLabels={REGIME_INFO}
            onOpenPediatricDrawer={() => setIsPediatricDrawerOpen(true)}
            onCancelEdit={resetComposerFields}
            onMedNameChange={(val) => {
              setSelectedMedName(val);
              setShowSuggestions(true);
              setHighlightedSuggestionIndex(-1);
            }}
            onFocusSearch={() => setShowSuggestions(true)}
            onBlurSearch={() => setShowSuggestions(false)}
            onMedInputKeyDown={handleMedInputKeyDown}
            onClearMedication={() => {
              setSelectedMedName('');
              setShowSuggestions(false);
              setHighlightedSuggestionIndex(-1);
              searchInputRef.current?.focus();
            }}
            onSelectMedication={handleSelectMedication}
            onHighlightSuggestion={setHighlightedSuggestionIndex}
            onAtualizarConstrutor={handleAtualizarConstrutor}
            onChangeRoute={setSelectedRoute}
            onChangeQuantity={setSelectedQuantity}
            onChangePosology={setSelectedPosology}
            onSubmitMedication={handleAddMedicationToPrescription}
          />

          <PrescribedItemsList
            items={items}
            editingItemId={editingItemId}
            regimesComItens={regimesComItens}
            porRegime={porRegime}
            itensEmDuasVias={itensEmDuasVias}
            regimeLabels={REGIME_INFO}
            savedModelsCount={savedPrescriptionModels.length}
            isDoctorConfigured={isDoctorConfigured}
            copiedSuccess={copiedSuccess}
            onOpenModelsModal={() => {
              loadPrescriptionModels();
              setIsLoadModelModalOpen(true);
            }}
            onOpenSaveModelModal={() => {
              setNewModelName('');
              setIsSaveModelModalOpen(true);
            }}
            onOpenCreateCustomModel={() => {
              setIsCreatingCustomModel(true);
              setCustomModelDraftTitle('');
              setCustomModelDraftItems([]);
              setIsLoadModelModalOpen(true);
            }}
            onClearPrescription={onClearPrescription}
            onStartEdit={handleStartEdit}
            onMoveItem={handleMoveItem}
            onRemoveItem={handleRemoveItem}
            onNavigateToPrint={handlePrintClick}
            onNavigateToEditor={onNavigateToEditor}
            onSendWhatsApp={handleSendWhatsApp}
            onCopyText={handleCopyText}
            onAbrirPerfilMedico={handleAbrirPerfilMedico}
          />
        </div>

        <PrescriptionPreviewColumn
          darkMode={_darkMode}
          mobileSection={mobileSection}
          isDoctorConfigured={isDoctorConfigured}
          porRegime={porRegime}
          regimesComItens={regimesComItens}
          regimeAtivo={regimeAtivo}
          itemsInPreview={itemsInPreview}
          itemsCount={items.length}
          regimeLabels={REGIME_INFO}
          doctor={doctor}
          patient={patient}
          activeContext={activeContext}
          copiedSuccess={copiedSuccess}
          isPediatricDrawerOpen={isPediatricDrawerOpen}
          pediatricDrawerRef={pediatricDrawerRef}
          folhaRef={folhaPreviewRef}
          onSelectPreviewRegime={setPreviewRegime}
          onNavigateToPrint={handlePrintClick}
          onNavigateToEditor={onNavigateToEditor}
          onSendWhatsApp={handleSendWhatsApp}
          onCopyText={handleCopyText}
          onAbrirPerfilMedico={handleAbrirPerfilMedico}
          onClosePediatricDrawer={() => setIsPediatricDrawerOpen(false)}
          onUpdatePatientWeight={(newWeight) => onUpdatePatient({ ...patient, weightKg: newWeight })}
          onAddPediatricItem={(item) => {
            onUpdateItems([...items, item]);
            setItemAddedToast(true);
            setTimeout(() => setItemAddedToast(false), 2500);
          }}
        />
      </div>

      {itemAddedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-tactile-lg animate-tab-fade"
        >
          <Icon name="check" className="text-[16px]" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}

      {prescriptionModelToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-strong animate-tab-fade"
        >
          <Icon name="check" className="text-[16px] text-emerald-400" />
          <span>{prescriptionModelToast}</span>
        </div>
      )}

      <PrescriptionModelsModal
        isSaveModelModalOpen={isSaveModelModalOpen}
        isLoadModelModalOpen={isLoadModelModalOpen}
        isCreatingCustomModel={isCreatingCustomModel}
        items={items}
        newModelName={newModelName}
        savedPrescriptionModels={savedPrescriptionModels}
        customModelDraftTitle={customModelDraftTitle}
        customModelDraftItems={customModelDraftItems}
        customModelSearchTerm={customModelSearchTerm}
        customModelSuggestions={customModelSuggestions}
        onChangeNewModelName={setNewModelName}
        onSavePrescriptionModel={handleSavePrescriptionModel}
        onCloseSaveModelModal={() => setIsSaveModelModalOpen(false)}
        onCloseLoadModelModal={() => {
          setIsLoadModelModalOpen(false);
          setIsCreatingCustomModel(false);
        }}
        onStartCreateCustomModel={() => {
          setIsCreatingCustomModel(true);
          setCustomModelDraftTitle('');
          setCustomModelDraftItems([]);
          setCustomModelSearchTerm('');
        }}
        onExitCreateCustomModel={() => setIsCreatingCustomModel(false)}
        onChangeCustomModelDraftTitle={setCustomModelDraftTitle}
        onCustomModelSearchChange={handleCustomModelSearchChange}
        onAddCustomModelItem={handleAddCustomModelItem}
        onRemoveCustomModelItem={handleRemoveCustomModelItem}
        onUpdateCustomModelItem={handleUpdateCustomModelItem}
        onSaveCustomCreatedModel={handleSaveCustomCreatedModel}
        onApplyPrescriptionModel={handleApplyPrescriptionModel}
        onDeletePrescriptionModel={handleDeletePrescriptionModel}
      />

      <ConfirmationModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirmar'}
        cancelLabel="Cancelar"
        variant="danger"
        darkMode={_darkMode}
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
