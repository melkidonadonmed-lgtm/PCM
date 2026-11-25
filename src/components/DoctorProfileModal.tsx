import React, { useState, useEffect, useRef } from 'react';
import { Icon, UserCheck, Check, X, Shield, Eraser, Building2, Phone, MapPin } from './Icon';
import { DoctorProfile, WorkContext } from '../types';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

const LogoGeneratorModal = React.lazy(() => import('./LogoGeneratorModal'));

/**
 * Modal de Perfil e Identificação Médica.
 * Estados de UI cobertos: empty (perfil vazio não configurado), loading (carregando gerador de logo),
 * success (perfil salvo com sucesso) e error (erro de validação de CRM/nome).
 */
interface DoctorProfileModalProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  onSaveDoctor: (doctor: DoctorProfile) => void;
  onClose: () => void;
  activeContext?: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  darkMode,
  doctor,
  onSaveDoctor,
  onClose,
  activeContext,
  onSaveContext
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useModalAccessibility({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: nameInputRef,
  });

  const [formData, setFormData] = useState<DoctorProfile>({
    name: doctor?.name || '',
    crm: doctor?.crm || '',
    crmState: doctor?.crmState || 'SP',
    specialty: doctor?.specialty || 'Clínica Médica',
    rqe: doctor?.rqe || '',
    clinicName: doctor?.clinicName || '',
    address: doctor?.address || '',
    cityState: doctor?.cityState || '',
    phone: doctor?.phone || '',
    email: doctor?.email || '',
    showSignature: doctor?.showSignature ?? true,
    signatureText: doctor?.signatureText || '',
    stampText: doctor?.stampText || '',
    cnes: doctor?.cnes || '',
    cpf: doctor?.cpf || '',
    cns: doctor?.cns || ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Acessibilidade WCAG 2.2: Foco inicial executado apenas na montagem (Escape e Focus Trap gerenciados por useModalAccessibility)
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const [showAdvancedClinic, setShowAdvancedClinic] = useState(
    Boolean(doctor?.clinicName || doctor?.address || doctor?.cityState || doctor?.phone || doctor?.cns || doctor?.cpf || doctor?.cnes)
  );

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleFillSample = () => {
    setFormData({
      name: 'Dr. Melki Donadon',
      crm: '123456',
      crmState: 'SP',
      specialty: 'Clínica Médica',
      rqe: '67890',
      clinicName: formData.clinicName || 'USF Osvaldo Piana (SEMUSA)',
      address: formData.address || 'Av. Campos Sales, 858 - Areal',
      cityState: formData.cityState || 'Porto Velho - RO',
      phone: formData.phone || '(69) 99999-9999',
      email: formData.email || '',
      showSignature: true,
      signatureText: '',
      stampText: '',
      cnes: formData.cnes || '',
      cpf: formData.cpf || '',
      cns: formData.cns || ''
    });
    setValidationError(null);
  };

  const handleClear = () => {
    setFormData({
      name: '',
      crm: '',
      crmState: 'SP',
      specialty: '',
      rqe: '',
      clinicName: '',
      address: '',
      cityState: '',
      phone: '',
      email: '',
      showSignature: true,
      signatureText: '',
      stampText: '',
      cnes: '',
      cpf: '',
      cns: ''
    });
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedCrm = formData.crm.trim();

    if (!trimmedName || !trimmedCrm) {
      setValidationError('Por favor, preencha o Nome Completo e o Número do CRM do médico.');
      if (!trimmedName) {
        nameInputRef.current?.focus();
      } else {
        document.getElementById('doc-input-crm')?.focus();
      }
      return;
    }

    setValidationError(null);
    const cleanedData: DoctorProfile = {
      ...formData,
      name: trimmedName,
      crm: trimmedCrm
    };

    onSaveDoctor(cleanedData);

    if (activeContext && onSaveContext) {
      try {
        await onSaveContext({
          ...activeContext,
          doctorCredentials: {
            crm: trimmedCrm,
            uf: cleanedData.crmState,
            rqe: cleanedData.rqe?.trim() || '',
            specialty: cleanedData.specialty?.trim() || '',
          }
        });
      } catch (err) {
        console.warn('Erro ao atualizar credenciais no contexto ativo:', err);
      }
    }

    onClose();
  };

  return (
    <div
      ref={modalRef}
      data-state={validationError ? 'error' : 'idle'}
      aria-busy={false}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-[oklch(0.14_0.02_258/0.70)] isolate animate-backdrop-fade surface-raised"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-modal-title"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl tactile-modal modal-content overflow-hidden modal-surface-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-card)] flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border border-[var(--hairline)] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 id="doctor-modal-title" className="font-bold text-sm sm:text-base text-[var(--text-main)]">
                Perfil Profissional do Médico
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Nome, CRM e dados essenciais para o cabeçalho dos documentos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto custom-scrollbar">
          
          {/* Mensagem de Validação Clara */}
          {validationError && (
            <div 
              role="alert" 
              className="p-3 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--status-danger)] text-[var(--ink-primary)] text-xs font-semibold flex items-center gap-2 animate-tab-fade"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--status-danger)] shrink-0" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Identificação Principal (Essencial) */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--hairline)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--ink-clinical)]">
                Identificação Obrigatória
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handleFillSample}
                  className="btn-tactile-secondary touch-target min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
                  title="Preencher com dados de exemplo (Dr. Melki Donadon / CRM 123456-SP)"
                >
                  <Icon name="fact_check" size={14} className="text-[var(--ink-clinical)] shrink-0" />
                  <span>Usar exemplo</span>
                </button>
                <span className="text-[var(--border-medium)]" aria-hidden="true">•</span>
                <button 
                  type="button"
                  onClick={handleClear}
                  className="btn-tactile-danger touch-target min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="doc-input-name" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Nome Completo com Título *
              </label>
              <input
                ref={nameInputRef}
                id="doc-input-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex.: Melki Donadon"
                className="w-full h-11 min-h-[44px] px-3.5 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] transition"
              />
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-8">
                <label htmlFor="doc-input-crm" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Número do CRM *
                </label>
                <input
                  id="doc-input-crm"
                  type="text"
                  required
                  value={formData.crm}
                  onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  placeholder="Ex.: 123456"
                  className="w-full h-11 min-h-[44px] px-3.5 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] transition clinical-tabular-nums"
                />
              </div>

              <div className="col-span-4">
                <label htmlFor="doc-input-state" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  UF do CRM *
                </label>
                <div className="relative">
                  <select
                    id="doc-input-state"
                    value={formData.crmState}
                    onChange={(e) => setFormData({ ...formData, crmState: e.target.value })}
                    className="pcm-select appearance-none w-full h-11 min-h-[44px] pl-3 pr-8 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] transition cursor-pointer"
                  >
                    {states.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    size={16}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-7">
                <label htmlFor="doc-input-specialty" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Especialidade Principal
                </label>
                <input
                  id="doc-input-specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex.: Clínica Médica / Pediatria"
                  className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] transition"
                />
              </div>

              <div className="col-span-5">
                <label htmlFor="doc-input-rqe" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  RQE (Opcional)
                </label>
                <input
                  id="doc-input-rqe"
                  type="text"
                  value={formData.rqe || ''}
                  onChange={(e) => setFormData({ ...formData, rqe: e.target.value })}
                  placeholder="Ex.: 67890"
                  className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] transition clinical-tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Toggle Dados Opcionais do Consultório / Unidade */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedClinic(!showAdvancedClinic)}
              className="btn-tactile-secondary w-full min-h-[44px] py-2 px-3 rounded-[10px] text-xs font-bold flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Dados de Consultório / Unidade (Opcional)</span>
              </span>
              <span className="text-xs font-bold text-[var(--ink-clinical)]">
                {showAdvancedClinic ? 'Ocultar' : 'Exibir campos'}
              </span>
            </button>

            {showAdvancedClinic && (
              <div className="mt-2.5 space-y-2.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] animate-tab-fade">
                <div>
                  <label htmlFor="doc-input-clinic" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Nome da Unidade / Consultório
                  </label>
                  <input
                    id="doc-input-clinic"
                    type="text"
                    value={formData.clinicName || ''}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Ex.: USF Hamilton Gondim / Consultório Particular"
                    className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)]"
                  />
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <label htmlFor="doc-input-city" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Cidade - UF
                    </label>
                    <input
                      id="doc-input-city"
                      type="text"
                      value={formData.cityState || ''}
                      onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                      placeholder="Ex.: Porto Velho - RO"
                      className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)]"
                    />
                  </div>
                  <div className="col-span-5">
                    <label htmlFor="doc-input-phone" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Telefone / Contato
                    </label>
                    <input
                      id="doc-input-phone"
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex.: (69) 99999-9999"
                      className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] clinical-tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="doc-input-address" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Endereço Completo
                  </label>
                  <input
                    id="doc-input-address"
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex.: Av. 7 de Setembro, 1200 - Sala 04"
                    className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)]"
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Identificação SUS (APAC / LME / SISREG — opcional)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="doc-input-cns" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        CNS do Médico (LME)
                      </label>
                      <input
                        id="doc-input-cns"
                        type="text"
                        inputMode="numeric"
                        value={formData.cns || ''}
                        onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                        placeholder="Ex.: 700 0000 0000 0000"
                        className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] font-mono clinical-tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="doc-input-cpf" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        CPF do Médico (APAC)
                      </label>
                      <input
                        id="doc-input-cpf"
                        type="text"
                        inputMode="numeric"
                        value={formData.cpf || ''}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="Ex.: 000.000.000-00"
                        className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] font-mono clinical-tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="doc-input-cnes" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        CNES da Unidade
                      </label>
                      <input
                        id="doc-input-cnes"
                        type="text"
                        inputMode="numeric"
                        value={formData.cnes || ''}
                        onChange={(e) => setFormData({ ...formData, cnes: e.target.value })}
                        placeholder="Ex.: 1234567"
                        className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-focus)] font-mono clinical-tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timbrado e Logotipo Institucional */}
          <div className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg-app)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border border-[var(--hairline)] flex items-center justify-center shrink-0">
                <Icon name="approval" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text-main)]">
                  Timbrado e Logotipo Clínico (SVG)
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {activeContext?.logoDataUrl 
                    ? `Logotipo ativo no contexto: ${activeContext.name}`
                    : 'Personalize o brasão médico ou logotipo do consultório/UBS'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="btn-tactile-secondary min-h-[44px] px-3.5 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            >
              <Icon name="edit" size={14} className="text-[var(--ink-clinical)] shrink-0" />
              <span>{activeContext?.logoDataUrl ? 'Editar Logo SVG' : 'Criar Logo / Timbre SVG'}</span>
            </button>
          </div>

          {/* Assinatura & Carimbo */}
          <div className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--bg-app)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[var(--ink-clinical)] shrink-0" />
              <label htmlFor="doc-input-show-sig" className="cursor-pointer">
                <p className="text-xs font-bold text-[var(--text-main)]">
                  Exibir Linha de Assinatura e Carimbo
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Inclui campo formal no rodapé das folhas A4
                </p>
              </label>
            </div>
            <input
              type="checkbox"
              id="doc-input-show-sig"
              checked={formData.showSignature}
              onChange={(e) => setFormData({ ...formData, showSignature: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary min-h-[44px] px-4 rounded-[10px] text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-tactile-primary min-h-[44px] px-5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Perfil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Criador Procedural de Logotipos SVG */}
      {isLogoModalOpen && (
        <React.Suspense fallback={null}>
          <LogoGeneratorModal
            isOpen={isLogoModalOpen}
            onClose={() => setIsLogoModalOpen(false)}
            activeContext={activeContext || null}
            doctor={formData}
            onApplyLogo={async (dataUrl) => {
              if (activeContext && onSaveContext) {
                await onSaveContext({
                  ...activeContext,
                  logoDataUrl: dataUrl
                });
              }
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default DoctorProfileModal;
