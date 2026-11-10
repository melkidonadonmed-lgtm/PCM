import React, { useState } from 'react';
import { Icon } from '../Icon';
import type { HospitalBedPatientRecord } from '../../core/domain/clinicalEntities';

export interface HospitalPhysicalExamAndConductSectionProps {
  bedRecord: HospitalBedPatientRecord;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
}

export const HospitalPhysicalExamAndConductSection: React.FC<
  HospitalPhysicalExamAndConductSectionProps
> = ({ bedRecord, onUpdateBedRecord }) => {
  const [newFreeCategoryTitle, setNewFreeCategoryTitle] = useState('');

  const updateField = <K extends keyof HospitalBedPatientRecord>(
    key: K,
    value: HospitalBedPatientRecord[K]
  ) => {
    onUpdateBedRecord({ ...bedRecord, [key]: value, updatedAt: Date.now() });
  };

  const handleAddFreeCategory = () => {
    if (!newFreeCategoryTitle.trim()) return;
    const customSections = [
      ...(bedRecord.physicalExam.customSections || []),
      { id: `custom-${Date.now()}`, title: newFreeCategoryTitle.trim(), content: '' },
    ];
    updateField('physicalExam', { ...bedRecord.physicalExam, customSections });
    setNewFreeCategoryTitle('');
  };

  const handleRemoveFreeCategory = (sectionId: string) => {
    const customSections = (bedRecord.physicalExam.customSections || []).filter(
      (s) => s.id !== sectionId
    );
    updateField('physicalExam', { ...bedRecord.physicalExam, customSections });
  };

  const handleClear24hEvolution = () => {
    updateField('evolution24h', '');
  };

  return (
    <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
        <div className="flex items-center gap-2">
          <Icon name="clinical_notes" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <h3 className="text-sm font-semibold text-[var(--text-main)]">
            3. Evolução 24h, Exame Físico e Conduta do Dia (CD)
          </h3>
        </div>
        {bedRecord.evolution24h && (
          <button
            type="button"
            onClick={handleClear24hEvolution}
            className="chip-neutral h-7 px-2 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
            title="Limpar texto da evolução 24h"
          >
            <Icon name="close" size={12} />
            <span>Limpar 24h</span>
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor="hosp-evol-24h"
          className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
        >
          Evolução nas Últimas 24h (Subjetivo, Intercorrências, Curva Térmica e Diurese)
        </label>
        <textarea
          id="hosp-evol-24h"
          rows={2}
          value={bedRecord.evolution24h}
          onChange={(e) => updateField('evolution24h', e.target.value)}
          placeholder="Ex.: Paciente permaneceu afebril nas últimas 24h, SSVV estáveis, boa aceitação da dieta..."
          aria-label="Evolução 24 horas"
          className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label
            htmlFor="hosp-ef-geral"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Estado Geral (GERAL)
          </label>
          <input
            id="hosp-ef-geral"
            type="text"
            value={bedRecord.physicalExam.geral}
            onChange={(e) =>
              updateField('physicalExam', { ...bedRecord.physicalExam, geral: e.target.value })
            }
            placeholder="Ex.: BEG, LOTE, corado, hidratado"
            aria-label="Exame físico geral"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-ef-ssvv"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Sinais Vitais (SSVV)
          </label>
          <input
            id="hosp-ef-ssvv"
            type="text"
            value={bedRecord.physicalExam.ssvv}
            onChange={(e) =>
              updateField('physicalExam', { ...bedRecord.physicalExam, ssvv: e.target.value })
            }
            placeholder="Ex.: PA 120/80 mmHg | FC 76 bpm | SpO2 97%"
            aria-label="Sinais vitais"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-ef-ar"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Aparelho Respiratório (AR)
          </label>
          <input
            id="hosp-ef-ar"
            type="text"
            value={bedRecord.physicalExam.ar}
            onChange={(e) =>
              updateField('physicalExam', { ...bedRecord.physicalExam, ar: e.target.value })
            }
            placeholder="Ex.: MV+ bilateral sem ruídos adventícios"
            aria-label="Aparelho respiratório"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-ef-ac"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Aparelho Cardiovascular (AC)
          </label>
          <input
            id="hosp-ef-ac"
            type="text"
            value={bedRecord.physicalExam.ac}
            onChange={(e) =>
              updateField('physicalExam', { ...bedRecord.physicalExam, ac: e.target.value })
            }
            placeholder="Ex.: RCR 2T BNF sem sopros"
            aria-label="Aparelho cardiovascular"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-ef-abd"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Abdome (ABD)
          </label>
          <input
            id="hosp-ef-abd"
            type="text"
            value={bedRecord.physicalExam.abd}
            onChange={(e) =>
              updateField('physicalExam', { ...bedRecord.physicalExam, abd: e.target.value })
            }
            placeholder="Ex.: Plano, flácido, RHA+, indolor"
            aria-label="Abdome"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-ef-membros"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Membros e Anexos
          </label>
          <input
            id="hosp-ef-membros"
            type="text"
            value={bedRecord.physicalExam.membrosEAnexos}
            onChange={(e) =>
              updateField('physicalExam', {
                ...bedRecord.physicalExam,
                membrosEAnexos: e.target.value,
              })
            }
            placeholder="Ex.: Panturrilhas livres, sem edema"
            aria-label="Membros e anexos"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>
      </div>

      {/* Categorias Livres de Exame Físico por Especialidade */}
      <div className="space-y-2 pt-1">
        {(bedRecord.physicalExam.customSections || []).map((sec, idx) => (
          <div key={sec.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                {sec.title}
              </label>
              <button
                type="button"
                onClick={() => handleRemoveFreeCategory(sec.id)}
                aria-label={`Remover categoria ${sec.title}`}
                className="text-[11px] text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
              >
                Remover
              </button>
            </div>
            <input
              type="text"
              value={sec.content}
              onChange={(e) => {
                const next = [...bedRecord.physicalExam.customSections];
                next[idx] = { ...sec, content: e.target.value };
                updateField('physicalExam', { ...bedRecord.physicalExam, customSections: next });
              }}
              placeholder={`Ex.: ${sec.title} — achados detalhados`}
              aria-label={sec.title}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
            />
          </div>
        ))}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFreeCategoryTitle}
            onChange={(e) => setNewFreeCategoryTitle(e.target.value)}
            placeholder="Adicionar seção específica (ex.: EXAME ORTOPÉDICO, NEUROLÓGICO, VM...)"
            aria-label="Título de nova categoria livre"
            className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
          <button
            type="button"
            onClick={handleAddFreeCategory}
            className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-bold cursor-pointer"
          >
            + Categoria Livre
          </button>
        </div>
      </div>

      {/* Dieta, Hidratação, Pendências e Conduta do Dia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-[var(--border-subtle)] pt-3">
        <div>
          <label
            htmlFor="hosp-diet"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Dieta
          </label>
          <input
            id="hosp-diet"
            type="text"
            value={bedRecord.dietDescription}
            onChange={(e) => updateField('dietDescription', e.target.value)}
            placeholder="Ex.: Dieta branda hipossódica via oral"
            aria-label="Dieta"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-hydration"
            className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
          >
            Hidratação Venosa
          </label>
          <input
            id="hosp-hydration"
            type="text"
            value={bedRecord.hydrationDescription}
            onChange={(e) =>
              onUpdateBedRecord({
                ...bedRecord,
                hydrationApplicable: Boolean(e.target.value.trim()),
                hydrationDescription: e.target.value,
                updatedAt: Date.now(),
              })
            }
            placeholder="Ex.: SF 0,9% 1000 mL EV 24/24h"
            aria-label="Hidratação"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-pendings"
            className="block text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1"
          >
            Pendências do Leito (separar por ;)
          </label>
          <input
            id="hosp-pendings"
            type="text"
            value={bedRecord.pendingItemsList.join('; ')}
            onChange={(e) =>
              updateField(
                'pendingItemsList',
                e.target.value
                  .split(';')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ex.: Avaliar switch oral; Checar cultura"
            aria-label="Pendências"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="hosp-conduct"
            className="block text-[11px] font-bold text-sky-700 dark:text-sky-300 mb-1"
          >
            Conduta do Dia — CD (separar por ;)
          </label>
          <input
            id="hosp-conduct"
            type="text"
            value={bedRecord.conductList.join('; ')}
            onChange={(e) =>
              updateField(
                'conductList',
                e.target.value
                  .split(';')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ex.: Manter ATB D4/D7; Manter profilaxia TEV"
            aria-label="Condutas"
            className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
        </div>
      </div>
    </section>
  );
};
