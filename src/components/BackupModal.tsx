import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  Check, 
  AlertTriangle, 
  Building2, 
  FileText, 
  ShieldCheck, 
  RefreshCw,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { DoctorProfile } from '../types';
import { 
  getLocalDatabaseStats, 
  exportCompleteBackup, 
  parseAndValidateBackup, 
  importBackupData,
  PresCMedBackup,
  BackupStats 
} from '../services/backupService';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  doctor: DoctorProfile;
  onUpdateDoctor?: (doctor: DoctorProfile) => void;
  onBackupRestored?: () => Promise<void> | void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  doctor,
  onUpdateDoctor,
  onBackupRestored
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de estatísticas locais
  const [stats, setStats] = useState<BackupStats>({
    contextsCount: 0,
    documentsCount: 0,
    templatesCount: 0
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Estados de importação
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<PresCMedBackup | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importStrategy, setImportStrategy] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Carrega estatísticas do banco local ao abrir
  useEffect(() => {
    if (isOpen) {
      getLocalDatabaseStats()
        .then(setStats)
        .catch(err => console.error('Erro ao ler estatísticas do banco:', err));
      setExportFeedback(null);
      setSelectedFile(null);
      setParsedBackup(null);
      setValidationError(null);
      setImportSuccess(null);
    }
  }, [isOpen]);

  // Listener de tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ação: Exportar Backup
  const handleExport = async () => {
    setIsExporting(true);
    setExportFeedback(null);
    try {
      const result = await exportCompleteBackup(doctor);
      setExportFeedback(`Arquivo gerado: ${result.filename} (${(result.sizeBytes / 1024).toFixed(1)} kB)`);
    } catch (err) {
      console.error('Falha ao exportar backup:', err);
      alert('Ocorreu um erro ao exportar os dados.');
    } finally {
      setIsExporting(false);
    }
  };

  // Processa arquivo selecionado
  const handleProcessFile = async (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setParsedBackup(null);
    setImportSuccess(null);

    try {
      const validated = await parseAndValidateBackup(file);
      setParsedBackup(validated);
    } catch (err: any) {
      setValidationError(err.message || 'Arquivo inválido.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Ação: Executar Restauração
  const handleExecuteImport = async () => {
    if (!parsedBackup) return;

    if (importStrategy === 'replace') {
      const confirmed = window.confirm(
        'ATENÇÃO: A opção "Substituir base local completa" apagará os dados atuais do navegador antes de restaurar o backup.\n\nDeseja prosseguir?'
      );
      if (!confirmed) return;
    }

    setIsImporting(true);
    setValidationError(null);

    try {
      const result = await importBackupData(parsedBackup, importStrategy);

      if (result.doctorProfile && onUpdateDoctor) {
        onUpdateDoctor(result.doctorProfile);
      }

      setImportSuccess(
        `Restauração concluída: ${result.importedContexts} locais e ${result.importedDocs} documentos/modelos importados com sucesso!`
      );

      // Notifica o aplicativo pai para atualizar contextos na tela
      if (onBackupRestored) {
        await onBackupRestored();
      }

      // Atualiza estatísticas locais
      const updatedStats = await getLocalDatabaseStats();
      setStats(updatedStats);

      // Limpa seleção após alguns instantes
      setTimeout(() => {
        setSelectedFile(null);
        setParsedBackup(null);
      }, 2500);

    } catch (err: any) {
      console.error('Falha na restauração do backup:', err);
      setValidationError(err.message || 'Ocorreu um erro ao restaurar os dados.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs isolate animate-tab-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[var(--surface-card)] text-[var(--text-main)] rounded-2xl border border-[var(--border-subtle)] shadow-tactile-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-base sm:text-lg font-bold">
                Portabilidade & Backup de Plantão
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Exporte ou restaure seus timbrados, logos e modelos em arquivo único (.pcm.json)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* CARD 1: EXPORTAR BASE COMPLETA */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] shadow-tactile-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>1. Exportar Base Completa (.pcm.json)</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  Gera um arquivo com todos os seus locais de atuação, timbrados em SVG, credenciais e modelos de laudo para levar no pendrive.
                </p>
              </div>

              {/* Badges de Contagem */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{stats.contextsCount} locais</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{stats.templatesCount} modelos</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="btn-tactile-primary w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-tactile-btn cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Baixar Backup Completo (.pcm.json)</span>
              </button>

              {exportFeedback && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-tab-fade">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{exportFeedback}</span>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: RESTAURAR BACKUP */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] shadow-tactile-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Restaurar Base no Navegador</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Carregue o arquivo <code className="font-mono text-sky-600 font-bold">.pcm.json</code> gerado em outro computador para recuperar imediatamente seu ambiente.
              </p>
            </div>

            {/* Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".json,.pcm.json"
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 ${
                isDragOver 
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30' 
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-[var(--border-subtle)] hover:border-sky-400 hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                {selectedFile ? <FileCheck className="w-5 h-5 text-emerald-500" /> : <HardDrive className="w-5 h-5" />}
              </div>

              <div>
                <p className="text-xs font-bold">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste o arquivo aqui'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Suporta arquivos com extensão .pcm.json ou .json
                </p>
              </div>
            </div>

            {/* Alerta de Erro de Validação */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Sucesso na Restauração */}
            {importSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-tab-fade">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Prévia dos Dados a Importar e Estratégia */}
            {parsedBackup && (
              <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-sky-100 dark:border-sky-900/40">
                  <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Backup Válido ({parsedBackup.system})</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Exportado em: {new Date(parsedBackup.exportedAt).toLocaleDateString('pt-BR')} às {new Date(parsedBackup.exportedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Locais de Atendimento</span>
                    <strong className="text-sm font-bold text-[var(--text-main)]">{parsedBackup.data.workContexts?.length || 0}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Modelos e Documentos</span>
                    <strong className="text-sm font-bold text-[var(--text-main)]">{parsedBackup.data.savedDocuments?.length || 0}</strong>
                  </div>
                </div>

                {/* Seletor de Estratégia */}
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Estratégia de Restauração:
                  </label>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] cursor-pointer">
                      <input
                        type="radio"
                        name="import_strategy"
                        value="merge"
                        checked={importStrategy === 'merge'}
                        onChange={() => setImportStrategy('merge')}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <span className="font-bold text-[var(--text-main)] block">
                          Mesclar com dados atuais (Recomendado)
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block">
                          Insere os novos modelos e atualiza os existentes sem apagar nada local.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] cursor-pointer">
                      <input
                        type="radio"
                        name="import_strategy"
                        value="replace"
                        checked={importStrategy === 'replace'}
                        onChange={() => setImportStrategy('replace')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          Substituir base local completa
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block">
                          Limpa o IndexedDB local e aplica exatamente o conteúdo do arquivo.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Botão de Confirmação */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-tactile-btn cursor-pointer transition active:scale-95 disabled:opacity-50 text-white ${
                      importStrategy === 'replace'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isImporting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>
                      {importStrategy === 'replace' ? 'Substituir e Restaurar' : 'Mesclar e Restaurar Dados'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
          <span className="text-[11px] text-[var(--text-muted)]">
            Operação 100% offline no navegador • Sem envio a servidores externos
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
