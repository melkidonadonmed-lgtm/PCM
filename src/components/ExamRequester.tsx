import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExamItem, Patient } from '../types';
import { EXAM_CATALOG, EXAM_PACKAGES, ExamPackage } from '../data/examCatalog';
import { escapeHtml } from '../utils/sanitizeHtml';
import { Icon } from './Icon';

export function buildExamRequestHtmlForA4(
  patient: Patient,
  selectedExams: ExamItem[],
  clinicalIndication: string
): string {
  const safePatient = escapeHtml(patient?.name?.trim() || '______________________________');
  const safeIndication = escapeHtml(clinicalIndication.trim());
  const listItems = selectedExams
    .map(
      (ex, idx) =>
        `<li><strong>${idx + 1}. ${escapeHtml(ex.name)}</strong> <span>(${escapeHtml(ex.category)})</span></li>`
    )
    .join('');

  return [
    '<h2>SOLICITAÇÃO DE EXAMES COMPLEMENTARES (SADT)</h2>',
    `<p><strong>Paciente:</strong> ${safePatient}</p>`,
    safeIndication ? `<p><strong>Indicação Clínica:</strong> ${safeIndication}</p>` : '',
    '<hr />',
    selectedExams.length > 0 ? `<ol>${listItems}</ol>` : '<p></p>',
  ]
    .filter(Boolean)
    .join('');
}

/**
 * Sub-ilha de Solicitação de Exames Laboratoriais e de Imagem.
 * Estados de UI cobertos: empty (nenhum exame selecionado), loading (carregando painel/rotina),
 * success (sucesso na montagem do pedido) e error (erro de busca sem correspondência).
 */
interface ExamRequesterProps {
  darkMode: boolean;
  patient: Patient;
  selectedExams: ExamItem[];
  onUpdateSelectedExams?: (exams: ExamItem[]) => void;
  onUpdateExams?: (exams: ExamItem[]) => void;
  clinicalIndication: string;
  onUpdateClinicalIndication: (text: string) => void;
  onNavigateToPrint: () => void;
  onNavigateToEditorWithHtml?: (
    html: string,
    title: string,
    type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom'
  ) => void;
}

export const ExamRequester: React.FC<ExamRequesterProps> = ({
  patient,
  selectedExams = [],
  onUpdateSelectedExams,
  onUpdateExams,
  clinicalIndication,
  onUpdateClinicalIndication,
  onNavigateToPrint,
  onNavigateToEditorWithHtml,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [customExamName, setCustomExamName] = useState('');
  const [isPackagesMenuOpen, setIsPackagesMenuOpen] = useState(false);
  const [copiedExams, setCopiedExams] = useState(false);
  const packagesMenuRef = useRef<HTMLDivElement>(null);

  const updateExams = onUpdateSelectedExams || onUpdateExams || (() => {});

  // Fecha o menu de kits ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!isPackagesMenuOpen) return;
    const onOutsideOrEsc = (event: MouseEvent | KeyboardEvent) => {
      if ('key' in event) {
        if (event.key === 'Escape') setIsPackagesMenuOpen(false);
        return;
      }
      if (packagesMenuRef.current && !packagesMenuRef.current.contains(event.target as Node)) {
        setIsPackagesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideOrEsc);
    document.addEventListener('keydown', onOutsideOrEsc);
    return () => {
      document.removeEventListener('mousedown', onOutsideOrEsc);
      document.removeEventListener('keydown', onOutsideOrEsc);
    };
  }, [isPackagesMenuOpen]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(EXAM_CATALOG.map((e) => e.category)));
    return ['Todos', ...list];
  }, []);

  const isExamSelected = (id: string) => selectedExams.some((e) => e.id === id);

  const toggleExam = (exam: ExamItem) => {
    if (isExamSelected(exam.id)) {
      updateExams(selectedExams.filter((e) => e.id !== exam.id));
    } else {
      updateExams([...selectedExams, { ...exam, selected: true }]);
    }
  };

  const applyPackage = (pkg: ExamPackage) => {
    const newExams = [...selectedExams];
    pkg.examIds.forEach((id) => {
      const found = EXAM_CATALOG.find((e) => e.id === id);
      if (found && !newExams.some((e) => e.id === id)) {
        newExams.push({ ...found, selected: true });
      }
    });
    updateExams(newExams);
    setIsPackagesMenuOpen(false);
  };

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExamName.trim()) return;

    const newCustomExam: ExamItem = {
      id: `custom-exam-${Date.now()}`,
      category: 'Personalizado',
      name: customExamName.trim(),
      selected: true,
      urgency: 'routine',
    };

    updateExams([...selectedExams, newCustomExam]);
    setCustomExamName('');
  };

  const filteredCatalog = useMemo(() => {
    return EXAM_CATALOG.filter((exam) => {
      const matchCat = selectedCategory === 'Todos' || exam.category === selectedCategory;
      const matchSearch =
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div data-state="idle" aria-busy={false} id="exam-requester-section" className="flex flex-col gap-3">
      {/* Top Header Card Compacto */}
      <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <Icon name="science" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <h2 className="text-sm font-semibold tracking-tight text-[var(--text-main)] truncate">
            Solicitação de exames complementares
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-info-subtle)] text-sky-700 dark:text-sky-300 border border-[var(--border-info-subtle)] font-semibold clinical-tabular-nums shrink-0">
            {selectedExams.length} selecionado(s)
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateToPrint}
          className="btn-tactile-primary text-xs font-semibold px-3 h-8 min-h-[32px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shrink-0 clinical-tabular-nums"
        >
          <Icon name="download" size={14} />
          <span>Visualizar e baixar PDF ({selectedExams.length})</span>
        </button>
      </div>

      {/* Main Grid: Catálogo Individual & Menu de Kits à Esquerda (2 Cols) + Pedido & Indicação à Direita (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        {/* Left 2 Cols: Exam Catalog Matrix + Kits Dropdown Menu */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Barra de Seleção Individual + Menu Retrátil de Kits/Painéis */}
          <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                <Icon name="fact_check" size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Seleção de exames individuais</span>
              </div>

              {/* Botão que abre o Menu / Lista de Seleção de Kits e Painéis Clínicos */}
              <div ref={packagesMenuRef} className="relative">
                <button
                  id="btn-exam-packages-menu"
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isPackagesMenuOpen}
                  onClick={() => setIsPackagesMenuOpen((prev) => !prev)}
                  className="chip-neutral min-h-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none border border-[var(--border-info-subtle)] bg-[var(--surface-info-subtle)] text-sky-700 dark:text-sky-300"
                  title="Abrir lista de kits e painéis clínicos prontos"
                >
                  <Icon name="auto_awesome" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Kits e painéis prontos</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-sky-600/15 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200 clinical-tabular-nums">
                    {EXAM_PACKAGES.length}
                  </span>
                  <Icon
                    name="expand_more"
                    size={15}
                    className={`transition-transform duration-150 ${isPackagesMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isPackagesMenuOpen && (
                  <div
                    role="dialog"
                    aria-label="Kits e painéis clínicos de exames"
                    className="absolute right-0 left-auto z-40 top-full mt-1.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-tactile-lg overflow-hidden animate-tab-fade"
                  >
                    <div
                      className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-inset)] flex items-center justify-between gap-2"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400">
                        Kits e painéis clínicos (1 clique inclui todos)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPackagesMenuOpen(false)}
                        aria-label="Fechar menu de kits de exames"
                        className="p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>

                    <ul
                      role="listbox"
                      aria-label="Lista de kits e painéis de exames"
                      className="max-h-72 overflow-y-auto divide-y divide-slate-500/10"
                    >
                      {EXAM_PACKAGES.map((pkg) => {
                        const selectedInPkg = pkg.examIds.filter((id) => isExamSelected(id)).length;
                        const allSelected = selectedInPkg === pkg.examIds.length;
                        return (
                          <li key={pkg.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={allSelected}
                              onClick={() => applyPackage(pkg)}
                              className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 outline-none ${
                                allSelected
                                  ? 'bg-[var(--surface-info-subtle)] text-[var(--text-main)]'
                                  : 'hover:bg-slate-500/10'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                    {pkg.name}
                                  </span>
                                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                    {pkg.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                  {pkg.description}
                                </p>
                              </div>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 clinical-tabular-nums inline-flex items-center gap-1 border ${
                                  allSelected
                                    ? 'bg-[var(--accent-emerald-subtle)] text-emerald-800 dark:text-emerald-200 border-[var(--accent-emerald-border)]'
                                    : 'bg-[var(--surface-info-subtle)] text-sky-700 dark:text-sky-300 border-[var(--border-info-subtle)]'
                                }`}
                              >
                                {allSelected ? (
                                  <>
                                    <Icon name="check" size={12} />
                                    <span>Incluído</span>
                                  </>
                                ) : (
                                  <span>+{pkg.examIds.length} exames</span>
                                )}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Custom Exam Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] dark:text-slate-400 pointer-events-none"
                />
                <input
                  id="exam-catalog-search"
                  name="examCatalogSearch"
                  type="text"
                  placeholder="Ex.: Hemograma, PCR, Dengue, Ureia, Raio-X, ECG..."
                  aria-label="Buscar exame no catálogo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                />
              </div>

              <form onSubmit={handleAddCustomExam} className="flex gap-1.5">
                <input
                  id="exam-custom-name"
                  name="customExamName"
                  type="text"
                  placeholder="Ex.: Exame avulso..."
                  aria-label="Nome do exame avulso"
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input flex-1 sm:w-40"
                />
                <button
                  type="submit"
                  aria-label="Adicionar exame avulso"
                  title="Adicionar exame avulso digitado"
                  className="tactile-btn-primary px-3 py-2 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0"
                >
                  + Avulso
                </button>
              </form>
            </div>

            {/* Category Chips Compactos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar fade-scroll-x">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-2.5 py-1 min-h-[32px] rounded-lg whitespace-nowrap border transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                    selectedCategory === cat
                      ? 'bg-[var(--pill-active-bg)] text-white border-[var(--pill-active-border)] shadow-sm'
                      : 'bg-[var(--surface-chip-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-chip-muted-hover)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lista Compacta de Exames Individuais */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Lista de exames"
            className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong max-h-96 sm:max-h-120 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            {filteredCatalog.map((exam) => {
              const selected = isExamSelected(exam.id);

              return (
                <div
                  key={exam.id}
                  role="checkbox"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => toggleExam(exam)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleExam(exam);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none border ${
                    selected
                      ? 'bg-[var(--surface-info-subtle)] border-[var(--border-info-subtle)]'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--surface-chip-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                        selected
                          ? 'bg-[var(--pill-active-bg)] border-[var(--pill-active-border)] text-white'
                          : 'border-slate-300 dark:border-white/20'
                      }`}
                    >
                      {selected && <Icon name="check" size={12} />}
                    </span>
                    <span
                      title={exam.name}
                      className="font-semibold text-xs truncate text-[var(--text-main)]"
                    >
                      {exam.name}
                    </span>
                  </div>

                  {exam.urgency === 'urgent' ? (
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-rose-subtle)] text-rose-800 dark:text-rose-200 border border-[var(--accent-rose-border)] shrink-0">
                      Urgência
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 shrink-0">
                      {exam.category.split(' ')[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Indicação Clínica + Exames Selecionados no Pedido */}
        <div className="flex flex-col gap-3">
          {/* Indicação Clínica */}
          <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong">
            <label
              htmlFor="exam-clinical-indication"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Indicação clínica / hipótese diagnóstica
            </label>
            <input
              id="exam-clinical-indication"
              name="examClinicalIndication"
              type="text"
              value={clinicalIndication}
              onChange={(e) => onUpdateClinicalIndication(e.target.value)}
              placeholder="Ex.: Investigação de síndrome febril aguda, controle de rotina..."
              className="w-full h-9 px-3 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
            />
          </div>

          {/* Bandeja de Exames Selecionados */}
          <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col h-fit gap-2.5">
            <div className="flex items-center justify-between border-b border-subtle dark:border-strong pb-2">
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                <Icon name="fact_check" className="text-[16px] text-emerald-700 dark:text-emerald-400" />
                Exames no pedido ({selectedExams.length})
              </h3>
              {selectedExams.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateExams([])}
                  className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition"
                >
                  <Icon name="delete" size={14} className="text-rose-800 dark:text-rose-200" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {selectedExams.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-muted)] dark:text-slate-400 text-xs">
                Nenhum exame selecionado ainda. Marque exames avulsos na lista ou abra o menu{' '}
                <strong>Kits e painéis prontos</strong>.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                {selectedExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className="px-3 py-2 rounded-xl border border-subtle dark:border-strong bg-[var(--surface-inset)] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[var(--text-main)] truncate">
                        {index + 1}. {exam.name}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 font-medium">
                        {exam.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExam(exam)}
                      className="text-[var(--text-muted)] hover:text-rose-600 dark:text-slate-400 p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none rounded-md"
                      title="Remover"
                      aria-label={`Remover exame ${exam.name}`}
                    >
                      <Icon name="delete" className="text-[14px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedExams.length > 0 && (
              <div className="pt-2.5 border-t border-subtle dark:border-strong flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onNavigateToPrint}
                  className="btn-tactile-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                >
                  <Icon name="print" className="text-[16px]" />
                  <span>Visualizar Folha A4 e Emitir PDF</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  {onNavigateToEditorWithHtml && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToEditorWithHtml(
                          buildExamRequestHtmlForA4(patient, selectedExams, clinicalIndication),
                          'Solicitação de Exames',
                          'custom'
                        )
                      }
                      className="btn-tactile-secondary py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                      title="Abrir pedido de exames no Editor Livre A4 para personalização"
                    >
                      <Icon name="edit_document" className="text-[15px] text-sky-600 dark:text-sky-400" />
                      <span>Abrir no Editor A4</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const lines = [
                        'SOLICITAÇÃO DE EXAMES COMPLEMENTARES',
                        patient?.name?.trim() ? `Paciente: ${patient.name.trim()}` : '',
                        clinicalIndication.trim() ? `Indicação clínica: ${clinicalIndication.trim()}` : '',
                        '',
                        ...selectedExams.map((ex, i) => `${i + 1}. ${ex.name}`),
                      ].filter(Boolean);
                      navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
                      setCopiedExams(true);
                      setTimeout(() => setCopiedExams(false), 2000);
                    }}
                    className={`btn-tactile-secondary py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                      onNavigateToEditorWithHtml ? '' : 'col-span-2'
                    }`}
                    title="Copiar lista de exames selecionados para a área de transferência"
                  >
                    <Icon
                      name={copiedExams ? 'check' : 'content_copy'}
                      className={`text-[15px] ${copiedExams ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                    />
                    <span>{copiedExams ? 'Pedido Copiado!' : 'Copiar Pedido'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
