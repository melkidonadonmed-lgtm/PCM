import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Search, 
  Check, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  FileCheck,
  X,
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { ExamItem, Patient } from '../types';
import { EXAM_CATALOG, EXAM_PACKAGES, ExamPackage } from '../data/examCatalog';

interface ExamRequesterProps {
  darkMode: boolean;
  patient: Patient;
  selectedExams: ExamItem[];
  onUpdateSelectedExams?: (exams: ExamItem[]) => void;
  onUpdateExams?: (exams: ExamItem[]) => void;
  clinicalIndication: string;
  onUpdateClinicalIndication: (text: string) => void;
  onNavigateToPrint: () => void;
  onNavigateToPrescription?: () => void;
  onNavigateToDocuments?: () => void;
}

export const ExamRequester: React.FC<ExamRequesterProps> = ({
  darkMode,
  patient,
  selectedExams = [],
  onUpdateSelectedExams,
  onUpdateExams,
  clinicalIndication,
  onUpdateClinicalIndication,
  onNavigateToPrint,
  onNavigateToPrescription,
  onNavigateToDocuments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [customExamName, setCustomExamName] = useState('');

  // Estado do Modal de Seleção Granular de Kits
  const [activeKitModal, setActiveKitModal] = useState<ExamPackage | null>(null);
  const [selectedKitExamIds, setSelectedKitExamIds] = useState<string[]>([]);

  const updateExams = onUpdateSelectedExams || onUpdateExams || (() => {});

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

  // Abrir modal de seleção granular do kit
  const handleOpenKitModal = (pkg: ExamPackage) => {
    setActiveKitModal(pkg);
    setSelectedKitExamIds([...pkg.examIds]);
  };

  const handleToggleKitExam = (id: string) => {
    setSelectedKitExamIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleAllKitExams = () => {
    if (!activeKitModal) return;
    if (selectedKitExamIds.length === activeKitModal.examIds.length) {
      setSelectedKitExamIds([]);
    } else {
      setSelectedKitExamIds([...activeKitModal.examIds]);
    }
  };

  const handleConfirmKitSelection = () => {
    if (!activeKitModal) return;
    const newExams = [...selectedExams];
    selectedKitExamIds.forEach(id => {
      const found = EXAM_CATALOG.find(e => e.id === id);
      if (found && !newExams.some(e => e.id === id)) {
        newExams.push({ ...found, selected: true });
      }
    });
    updateExams(newExams);
    setActiveKitModal(null);
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
    <div id="exam-requester-section" className="space-y-4 sm:space-y-5">
      {/* Top Header Card com Fluxo Linear */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex items-center gap-3">
          {onNavigateToPrescription && (
            <button
              type="button"
              onClick={onNavigateToPrescription}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-cream-100 cursor-pointer transition-all active:scale-95 tactile-btn-secondary shrink-0"
              title="Voltar para Prescrição de Medicamentos"
              aria-label="Voltar para Prescrição de Medicamentos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center panel-navy text-cream-100 border border-white/10 shadow-tactile-sm shrink-0"
          >
            <FlaskConical className="w-5 h-5 icon-sculpted" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                Solicitação de Exames Complementares
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-navy-900/10 text-navy-900 dark:bg-cream-100/15 dark:text-cream-100 border border-navy-900/20 dark:border-cream-100/25 font-semibold">
                {selectedExams.length} selecionado(s)
              </span>
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: darkMode ? '#8E9CAE' : '#64748B' }}>
              Paciente: <span className="text-navy-900 dark:text-cream-100 font-semibold">{patient?.name?.trim() || 'Não identificado'}</span> • Selecione exames individuais ou painéis rápidos.
            </p>
          </div>
        </div>

        {/* Ações do Cabeçalho: Visualizar Pedido & Avançar para Documentos */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onNavigateToPrint}
            disabled={selectedExams.length === 0}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedExams.length === 0
                ? 'tactile-btn-secondary opacity-50 cursor-not-allowed'
                : 'tactile-btn-secondary cursor-pointer active:scale-95'
            }`}
            title="Visualizar pedido de exames e imprimir"
          >
            <Download className="w-4 h-4" strokeWidth={1.75} />
            <span>Visualizar Pedido ({selectedExams.length})</span>
          </button>

          {onNavigateToDocuments && (
            <button
              type="button"
              onClick={onNavigateToDocuments}
              className="btn-tactile-primary px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-tactile"
              title="Avançar para Atestados e Encaminhamentos"
            >
              <span>Avançar para Documentos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clinical Indication */}
      <div 
        className="tactile-card p-3.5 sm:p-4 rounded-2xl"
        style={{
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <label 
          htmlFor="exam-clinical-indication" 
          className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 cursor-pointer"
        >
          Indicação Clínica / Hipótese Diagnóstica (Para o Laboratório / Convênio)
        </label>
        <input
          id="exam-clinical-indication"
          type="text"
          value={clinicalIndication}
          onChange={(e) => onUpdateClinicalIndication(e.target.value)}
          placeholder="Ex: Investigação de síndrome febril aguda, controle pré-natal, check-up de rotina, etc."
          className="w-full p-3 rounded-xl text-xs font-medium focus:outline-none tactile-input"
        />
      </div>

      {/* BASE: Carrossel Horizontal de Painéis & Pacotes Clínicos */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-navy-900 dark:text-cream-200" strokeWidth={1.75} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-cream-50">
            Combos Clínicos
          </h3>
        </div>

        {/* Carrossel horizontal */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2 custom-scrollbar fade-scroll-x">
          {EXAM_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => handleOpenKitModal(pkg)}
              className="w-52 sm:w-56 shrink-0 p-3 min-h-[44px] rounded-xl border text-left transition-all cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 flex flex-col justify-between gap-2 group tactile-flat hover:shadow-tactile-sm"
              style={{
                backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
                borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
              }}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="font-bold text-xs leading-snug line-clamp-2" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                  {pkg.name}
                </span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  {pkg.badge}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  {pkg.examIds.length} exames
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Catalog Left & Selected Exams Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left 2 Cols: Exam Catalog Matrix */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
              <input
                id="exam-search-input"
                type="text"
                aria-label="Buscar exame complementar"
                placeholder="Buscar exame (ex: Hemograma, PCR, Dengue, Ureia, Raio-X, ECG)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none tactile-input"
              />
            </div>

            <form onSubmit={handleAddCustomExam} className="flex gap-2">
              <input
                id="custom-exam-input"
                type="text"
                aria-label="Adicionar exame avulso personalizado"
                placeholder="Adicionar exame avulso..."
                value={customExamName}
                onChange={(e) => setCustomExamName(e.target.value)}
                className="p-2.5 rounded-xl text-xs font-medium focus:outline-none tactile-input w-44"
              />
              <button
                type="submit"
                className="tactile-btn-primary min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center"
                title="Adicionar exame personalizado"
                aria-label="Adicionar exame personalizado"
              >
                +
              </button>
            </form>
          </div>

          {/* Category Chips */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar fade-scroll-x rounded-xl focus-visible:outline-3 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
            tabIndex={0}
            role="group"
            aria-label="Categorias de exames — role horizontalmente ou use as setas do teclado"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3.5 py-2 min-h-[44px] rounded-xl whitespace-nowrap transition-all cursor-pointer active:scale-95 border-none ${
                  selectedCategory === cat
                    ? 'bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 shadow-tactile-navy dark:shadow-tactile-cream'
                    : darkMode
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exams Grid */}
          <div 
            className="tactile-card p-3 rounded-2xl max-h-[480px] overflow-y-auto space-y-1.5 divide-y"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            {filteredCatalog.map((exam) => {
              const selected = isExamSelected(exam.id);

              return (
                <button
                  type="button"
                  key={exam.id}
                  onClick={() => toggleExam(exam)}
                  aria-pressed={selected}
                  className={`w-full text-left flex items-center justify-between p-3 min-h-[44px] rounded-xl cursor-pointer transition-all border-none ${
                    selected 
                      ? 'bg-navy-900/10 dark:bg-cream-100/10 shadow-tactile-sm' 
                      : 'hover:bg-slate-500/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                        selected ? 'bg-navy-900 dark:bg-cream-100 border-navy-900 dark:border-cream-100 text-white dark:text-navy-950' : 'border-slate-400'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs truncate" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                        {exam.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {exam.type === 'lab' ? 'Laboratorial' : 'Imagem / Gráfico'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {exam.urgency === 'urgent' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      Urgência
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Items Tray */}
        <div 
          className="tactile-card p-3.5 sm:p-4 rounded-2xl flex flex-col h-fit space-y-3"
          style={{
            backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
            <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" strokeWidth={1.75} />
              Exames no Pedido ({selectedExams.length})
            </h3>
            {selectedExams.length > 0 && (
              <button
                type="button"
                onClick={() => updateExams([])}
                className="min-h-[44px] px-2 inline-flex items-center text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer rounded-lg"
              >
                Limpar Tudo
              </button>
            )}
          </div>

          {selectedExams.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Nenhum exame selecionado ainda. Clique nos exames ao lado ou em um dos pacotes acima para incluir.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {selectedExams.map((exam, index) => (
                <div 
                  key={exam.id}
                  className="p-2 rounded-xl border flex items-center justify-between gap-2 tactile-flat"
                  style={{
                    backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
                    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                      {index + 1}. {exam.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-navy-900 dark:text-cream-100 font-medium">{exam.category}</span>
                      {exam.isImage && (
                        <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1"></span>
                          Imagem
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer rounded-lg"
                    title="Remover exame"
                    aria-label={`Remover ${exam.name} do pedido`}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Rodapé de Ações com Fluxo Linear */}
          <div className="pt-3 border-t space-y-2" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
            {selectedExams.length > 0 && (
              <button
                type="button"
                onClick={onNavigateToPrint}
                className="tactile-btn-secondary w-full py-2.5 min-h-[44px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Visualizar pedido e emitir PDF"
              >
                <Download className="w-4 h-4" strokeWidth={1.75} />
                <span>Visualizar Pedido de Exames</span>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onNavigateToPrescription && (
                <button
                  type="button"
                  onClick={onNavigateToPrescription}
                  className="tactile-btn-secondary w-full py-2.5 min-h-[44px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  title="Voltar para a etapa de prescrição de medicamentos"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Prescrição</span>
                </button>
              )}

              {onNavigateToDocuments && (
                <button
                  type="button"
                  onClick={onNavigateToDocuments}
                  className="btn-tactile-primary w-full py-2.5 min-h-[44px] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-tactile"
                  title="Avançar para a próxima etapa: atestados e encaminhamentos"
                >
                  <span>Avançar para Documentos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Seleção Granular de Exames do Kit */}
      {activeKitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-2xl border p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {activeKitModal.name}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 inline-flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block mr-1.5"></span>
                    {activeKitModal.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeKitModal.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveKitModal(null)}
                aria-label="Fechar modal de pacote de exames"
                className="text-slate-400 hover:text-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {selectedKitExamIds.length} de {activeKitModal.examIds.length} exames marcados
              </span>
              <button
                type="button"
                onClick={handleToggleAllKitExams}
                className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer min-h-[44px] px-2 flex items-center"
              >
                {selectedKitExamIds.length === activeKitModal.examIds.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            {/* List of Exams with Checkboxes */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {activeKitModal.examIds.map(id => {
                const exam = EXAM_CATALOG.find(e => e.id === id);
                if (!exam) return null;
                const isChecked = selectedKitExamIds.includes(id);

                return (
                  <label
                    key={id}
                    className="pt-1.5 flex items-center justify-between p-2.5 min-h-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleKitExam(id)}
                        aria-label={`Selecionar exame ${exam.name}`}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {exam.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {exam.category} {exam.isImage ? '• Imagem/Gráfico' : ''}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)' }}>
              <button
                type="button"
                onClick={() => setActiveKitModal(null)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmKitSelection}
                disabled={selectedKitExamIds.length === 0}
                className="tactile-btn-primary px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Incluir {selectedKitExamIds.length} Exames no Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
