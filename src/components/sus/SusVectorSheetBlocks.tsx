import React from 'react';
import { LmeMedicationRow, SusFilledFormData } from '../../types';

export interface VectorCellProps {
  colSpan: number;
  label: string;
  fieldKey: keyof SusFilledFormData;
  value: string;
  placeholder?: string;
  mono?: boolean;
  multiline?: boolean;
  rows?: number;
  staticPrintMode?: boolean;
  onFieldChange: (key: keyof SusFilledFormData, value: string | boolean) => void;
}

export const VectorCell: React.FC<VectorCellProps> = ({
  colSpan,
  label,
  fieldKey,
  value,
  placeholder = '',
  mono = false,
  multiline = false,
  rows = 3,
  staticPrintMode = false,
  onFieldChange,
}) => {
  const colClass =
    colSpan === 12
      ? 'col-span-12'
      : colSpan === 9
        ? 'col-span-9'
        : colSpan === 8
          ? 'col-span-8'
          : colSpan === 7
            ? 'col-span-7'
            : colSpan === 6
              ? 'col-span-6'
              : colSpan === 5
                ? 'col-span-5'
                : colSpan === 4
                  ? 'col-span-4'
                  : colSpan === 3
                    ? 'col-span-3'
                    : colSpan === 2
                      ? 'col-span-2'
                      : 'col-span-1';

  return (
    <div
      className={`${colClass} relative group/suscell border-r border-b border-black p-1.5 flex flex-col justify-between bg-white focus-within:bg-sky-50/70 transition-colors`}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[0.5rem] font-bold uppercase tracking-tight text-slate-800 leading-none select-none">
          {label}
        </span>
        {!staticPrintMode && value && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onFieldChange(fieldKey, '')}
            title={`Limpar ${label}`}
            aria-label={`Limpar ${label}`}
            className="no-print opacity-0 group-hover/suscell:opacity-100 focus:opacity-100 w-3.5 h-3.5 rounded flex items-center justify-center text-[0.625rem] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-opacity cursor-pointer leading-none"
          >
            ×
          </button>
        )}
      </div>

      {staticPrintMode ? (
        <div
          style={multiline ? { minHeight: `${rows * 16}px`, whiteSpace: 'pre-wrap' } : { minHeight: '16px' }}
          className={`w-full text-[11px] font-semibold text-slate-950 leading-snug break-words ${
            mono ? 'font-mono clinical-tabular-nums tracking-tight' : 'font-sans'
          }`}
        >
          {value}
        </div>
      ) : multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onFieldChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full resize-none border-0 bg-transparent p-0 text-[11px] font-semibold text-slate-950 leading-snug focus:outline-none ${
            mono ? 'font-mono clinical-tabular-nums' : 'font-sans'
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onFieldChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full border-0 bg-transparent p-0 text-[11.5px] font-semibold text-slate-950 leading-tight focus:outline-none ${
            mono ? 'font-mono clinical-tabular-nums tracking-tight' : 'font-sans'
          }`}
        />
      )}
    </div>
  );
};

interface SusVectorLmeBlockProps {
  formData: SusFilledFormData;
  staticPrintMode?: boolean;
  onFieldChange: (key: keyof SusFilledFormData, value: string | boolean) => void;
  onUpdateLmeRow?: (index: number, nextRow: LmeMedicationRow) => void;
}

export const SusVectorLmeBlock: React.FC<SusVectorLmeBlockProps> = ({
  formData,
  staticPrintMode = false,
  onFieldChange,
  onUpdateLmeRow,
}) => {
  const rows: LmeMedicationRow[] =
    formData.lmeMedications && formData.lmeMedications.length > 0
      ? formData.lmeMedications
      : [{ name: '', quantities: ['', '', '', '', '', ''] }];

  return (
    <>
      <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
        3. Solicitação de Medicamentos — Componente Especializado da Assistência Farmacêutica (LME / CEAF)
      </div>

      <VectorCell
        colSpan={3}
        label="16 - Peso do Paciente (kg)"
        fieldKey="patientWeightKg"
        value={formData.patientWeightKg || ''}
        placeholder="Ex.: 70,5"
        mono
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />
      <VectorCell
        colSpan={3}
        label="17 - Altura (cm)"
        fieldKey="patientHeightCm"
        value={formData.patientHeightCm || ''}
        placeholder="Ex.: 170"
        mono
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />
      <VectorCell
        colSpan={2}
        label="18 - CID-10"
        fieldKey="cid10Code"
        value={formData.cid10Code || ''}
        placeholder="Ex.: M05.8"
        mono
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />
      <VectorCell
        colSpan={4}
        label="19 - Diagnóstico Clínico"
        fieldKey="cid10Description"
        value={formData.cid10Description || ''}
        placeholder="Descrição do diagnóstico..."
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />

      {/* Cabeçalho da Grade Mensal de Medicamentos (1º ao 6º Mês) */}
      <div className="col-span-6 border-r border-b border-black px-1.5 py-1 bg-slate-100 text-[0.5rem] font-extrabold uppercase tracking-tight text-slate-900">
        Medicamento Solicitado (Nome Genérico / DCB, Concentração e Forma Farmacêutica)
      </div>
      {[1, 2, 3, 4, 5, 6].map((mes) => (
        <div
          key={mes}
          className="col-span-1 border-r border-b border-black px-1 py-1 bg-slate-100 text-center text-[0.5rem] font-extrabold uppercase tracking-tight text-slate-900 clinical-tabular-nums"
        >
          {mes}º Mês
        </div>
      ))}

      {rows.map((row, idx) => (
        <React.Fragment key={idx}>
          <div className="col-span-6 border-r border-b border-black p-1.5 bg-white focus-within:bg-sky-50/70">
            {staticPrintMode ? (
              <div className="text-[11px] font-semibold text-slate-950 min-h-[16px]">
                {row.name ? `${idx + 1}. ${row.name}` : `${idx + 1}.`}
              </div>
            ) : (
              <input
                type="text"
                value={row.name || ''}
                onChange={(e) =>
                  onUpdateLmeRow?.(idx, {
                    ...row,
                    name: e.target.value,
                  })
                }
                placeholder={`${idx + 1}. Nome, concentração e apresentação...`}
                aria-label={`Medicamento LME ${idx + 1}`}
                className="w-full border-0 bg-transparent p-0 text-[11px] font-semibold text-slate-950 leading-tight focus:outline-none"
              />
            )}
          </div>
          {[0, 1, 2, 3, 4, 5].map((mIdx) => {
            const qVal = row.quantities?.[mIdx] || '';
            return (
              <div
                key={mIdx}
                className="col-span-1 border-r border-b border-black p-1 bg-white flex items-center justify-center focus-within:bg-sky-50/70"
              >
                {staticPrintMode ? (
                  <div className="text-[11px] font-mono font-bold text-slate-950 text-center clinical-tabular-nums min-h-[16px]">
                    {qVal}
                  </div>
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={qVal}
                    onChange={(e) => {
                      const nextQuantities = Array.from(
                        { length: 6 },
                        (_, i) => (i === mIdx ? e.target.value : row.quantities?.[i] || '')
                      );
                      onUpdateLmeRow?.(idx, {
                        ...row,
                        quantities: nextQuantities,
                      });
                    }}
                    aria-label={`Quantidade mês ${mIdx + 1} do medicamento ${idx + 1}`}
                    className="w-full border-0 bg-transparent p-0 text-[11px] font-mono font-bold text-center text-slate-950 leading-tight focus:outline-none clinical-tabular-nums"
                  />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}

      <VectorCell
        colSpan={8}
        label="20 - Relato de Tratamentos Prévios Realizados (Quando Aplicável)"
        fieldKey="lmePreviousTreatmentReport"
        value={formData.lmePreviousTreatmentReport || ''}
        placeholder="Esquemas prévios utilizados ou motivo de substituição..."
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />
      <VectorCell
        colSpan={4}
        label="21 - Nome do Responsável (Se Incapaz)"
        fieldKey="lmeResponsibleName"
        value={formData.lmeResponsibleName || ''}
        placeholder="Apenas quando paciente incapaz..."
        staticPrintMode={staticPrintMode}
        onFieldChange={onFieldChange}
      />
    </>
  );
};
