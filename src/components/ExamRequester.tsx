import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExamItem, Patient } from '../types';
import { EXAM_CATALOG, EXAM_PACKAGES, ExamPackage } from '../data/examCatalog';
import { Icon } from './Icon';

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
}

export const ExamRequester: React.FC<ExamRequesterProps> = ({
  darkMode,
  patient,
  selectedExams = [],
  onUpdateSelectedExams,
  onUpdateExams,
  clinicalIndication,
  onUpdateClinicalIndication,
  onNavigateToPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [customExamName, setCustomExamName] = useState('');
  const [isPackagesMenuOpen, setIsPackagesMenuOpen] = useState(false);
  const packagesMenuRef = useRef<HTMLDivElement>(null);

  const updateExams = onUpdateSelectedExams || onUpdateExams || (() => {});

  // Fecha o menu de kits ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!isPackagesMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (packagesMenuRef.current && !packagesMenuRef.current.contains(event.target as Node)) {
        setIsPackagesMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPackagesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPackagesMenuOpen]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(EXAM_CATALOG.map(e => e.category)));
    return ['Todos', ...list];
  }, []);

  const isExamSelected = (id: string) => {
    return selectedExams.some(e => e.id === id);
  };

  const toggleExam = (exam: ExamItem) => {
    if (isExamSelected(exam.id)) {
      updateExams(selectedExams.filter(e => e.id !== exam.id));
    } else {
      updateExams([...selectedExams, { ...exam, selected: true }]);
    }
  };

  const applyPackage = (pkg: ExamPackage) => {
    const newExams = [...selectedExams];
    pkg.examIds.forEach(id => {
      const found = EXAM_CATALOG.find(e => e.id === id);
      if (found && !newExams.some(e => e.id === id)) {
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
      urgency: 'routine'
    };

    updateExams([...selectedExams, newCustomExam]);
    setCustomExamName('');
  };

  const filteredCatalog = useMemo(() => {
    return EXAM_CATALOG.filter(exam => {
      const matchCat = selectedCategory === 'Todos' || exam.category === selectedCategory;
      const matchSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div data-state="idle" aria-busy={false} id="exam-requester-section" className="space-y-3 sm:space-y-4">
      {/* Top Header Card Compacto */}
      <div 
        className="tactile-card p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-navy-900 dark:bg-sky-600 border border-white/12 shadow-sm shrink-0"
          >
            <Icon name="science" size={16} className="text-slate-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold truncate" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                Solicitação de exames complementares
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-[#27354A] dark:text-slate-200 border border-slate-300 dark:border-white/10 font-semibold clinical-tabular-nums">
                {selectedExams.length} selecionado(s)
              </span>
            </div>
            <p className="text-[11px] font-medium truncate" style={{ color: darkMode ? '#8E9CAE' : '#64748B' }}>
              Marque exames individuais na lista abaixo ou aplique um kit pronto pelo menu.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToPrint}
          disabled={selectedExams.length === 0}
          className="btn-tactile-primary text-xs font-semibold px-3.5 py-2 min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 clinical-tabular-nums"
        >
          <Icon name="download" size={15} />
          <span>Visualizar e baixar PDF ({selectedExams.length})</span>
        </button>
      </div>

      {/* Main Grid: Catálogo Individual & Menu de Kits à Esquerda (2 Cols) + Pedido & Indicação à Direita (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Left 2 Cols: Exam Catalog Matrix + Kits Dropdown Menu */}
        <div className="lg:col-span-2 space-y-2.5">
          {/* Barra de Seleção Individual + Menu Retrátil de Kits/Painéis */}
          <div
            className="tactile-card p-3 rounded-2xl border space-y-2.5"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-300">
                <Icon name="fact_check" size={15} className="text-sky-600 dark:text-sky-400 shrink-0" />
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
                  className="chip-neutral h-8 min-h-[34px] px-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  title="Abrir lista de kits e painéis clínicos prontos"
                >
                  <Icon name="auto_awesome" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Kits e painéis prontos</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-600/15 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200 clinical-tabular-nums">
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
                    className="absolute right-0 left-auto z-40 top-full mt-1.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border shadow-tactile-lg overflow-hidden animate-tab-fade"
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'
                    }}
                  >
                    <div
                      className="px-3 py-2 border-b flex items-center justify-between gap-2"
                      style={{
                        backgroundColor: darkMode ? 'var(--surface-inset)' : '#F8FAFC',
                        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                      }}
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
                                  ? darkMode
                                    ? 'bg-sky-950/50 text-white'
                                    : 'bg-sky-50 text-slate-900'
                                  : 'hover:bg-slate-500/10'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                    {pkg.name}
                                  </span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                    {pkg.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                  {pkg.description}
                                </p>
                              </div>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 clinical-tabular-nums inline-flex items-center gap-1 ${
                                  allSelected
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
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
                <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] dark:text-slate-400 pointer-events-none" />
                <input
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
                      ? 'bg-navy-900 text-white dark:bg-[#0369A1] dark:text-white border-navy-900 dark:border-sky-500/30 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-[#27354A] dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#334155]'
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
            className="tactile-card p-2.5 rounded-2xl max-h-[420px] sm:max-h-[480px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
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
                      ? 'bg-sky-50/80 dark:bg-[#27354A] border-sky-500/40 dark:border-sky-400/30' 
                      : 'border-[var(--border-subtle)] hover:bg-slate-100/70 dark:hover:bg-[#27354A]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                        selected ? 'bg-navy-900 dark:bg-[#0369A1] border-navy-900 dark:border-sky-500/40 text-white' : 'border-slate-300 dark:border-white/20'
                      }`}
                    >
                      {selected && <Icon name="check" size={12} />}
                    </div>
                    <span
                      title={exam.name}
                      className="font-semibold text-xs truncate"
                      style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}
                    >
                      {exam.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {exam.urgency === 'urgent' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        Urgência
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)] dark:text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70">
                        {exam.category.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Indicação Clínica + Exames Selecionados no Pedido */}
        <div className="space-y-3">
          {/* Indicação Clínica */}
          <div 
            className="tactile-card p-3 rounded-2xl border"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <label htmlFor="exam-clinical-indication" className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-1.5">
              Indicação clínica / hipótese diagnóstica
            </label>
            <input
              id="exam-clinical-indication"
              type="text"
              value={clinicalIndication}
              onChange={(e) => onUpdateClinicalIndication(e.target.value)}
              placeholder="Ex.: Investigação de síndrome febril aguda, controle de rotina..."
              className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
            />
          </div>

          {/* Bandeja de Exames Selecionados */}
          <div 
            className="tactile-card p-3 sm:p-3.5 rounded-2xl flex flex-col h-fit space-y-2.5"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                <Icon name="fact_check" className="text-[16px] text-emerald-700 dark:text-emerald-400" />
                Exames no pedido ({selectedExams.length})
              </h3>
              {selectedExams.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateExams([])}
                  className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none rounded-md px-1 py-0.5"
                >
                  Limpar
                </button>
              )}
            </div>

            {selectedExams.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-muted)] dark:text-slate-400 text-xs">
                Nenhum exame selecionado ainda. Marque exames avulsos na lista ou abra o menu <strong>Kits e painéis prontos</strong>.
              </div>
            ) : (
              <div className="space-y-1 max-h-[340px] overflow-y-auto">
                {selectedExams.map((exam, index) => (
                  <div 
                    key={exam.id}
                    className="px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 tactile-flat"
                    style={{
                      backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
                      borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                        {index + 1}. {exam.name}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 font-medium">{exam.category}</span>
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
              <div className="pt-2 border-t" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
                <button
                  type="button"
                  onClick={onNavigateToPrint}
                  className="btn-tactile-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                >
                  <Icon name="download" className="text-[16px]" />
                  <span>Gerar e baixar PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
