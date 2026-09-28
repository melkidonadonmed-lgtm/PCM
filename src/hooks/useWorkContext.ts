import { useState, useEffect, useCallback } from 'react';
import { db, initializeDefaultTemplates } from '../services/db';
import { WorkContext } from '../types';
import { PRESET_LOGOS } from '../data/presetAssets';

const ACTIVE_CONTEXT_KEY = 'pcm_active_context_id';

export function useWorkContext(doctorProfile: { crm: string; uf: string; rqe?: string }) {
  const [contexts, setContexts] = useState<WorkContext[]>([]);
  const [activeContext, setActiveContext] = useState<WorkContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega os contextos e inicializa se necessário
  const loadContexts = useCallback(async () => {
    try {
      await db.open();
      // Assegura que modelos clínicos padrão estejam semeados
      await initializeDefaultTemplates();

      let allContexts = await db.workContexts.toArray();
      
      if (allContexts.length === 0) {
        await db.workContexts.clear();
        // Inicializa com os dados do perfil do médico e logos oficiais
        const ubsContext: WorkContext = {
          id: 'ctx-ubs',
          name: 'USF Osvaldo Piana (SEMUSA - Porto Velho)',
          sphere: 'municipal',
          clinicName: 'UNIDADE DE SAÚDE DA FAMÍLIA OSVALDO PIANA',
          clinicAddress: 'Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358',
          cnes: '2678942',
          logoDataUrl: PRESET_LOGOS.semusa.dataUrl,
          logoAlignment: 'left',
          watermarkType: 'sus_double',
          watermarkOpacity: 0.08,
          documentFormatting: {
            headerType: 'custom_logo',
            prescriptionViaCount: 2,
            showCnesOnHeader: true,
            referralModel: 'sus_regulation',
            examHeaderTitle: 'SOLICITAÇÃO DE EXAMES — REDE MUNICIPAL'
          },
          doctorCredentials: { ...doctorProfile },
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const polContext: WorkContext = {
          id: 'ctx-policlinica',
          name: 'Policlínica Oswaldo Cruz - POC (SESAU - RO)',
          sphere: 'state',
          clinicName: 'POC - Policlínica Oswaldo Cruz',
          clinicAddress: 'Av. Gov. Jorge Teixeira, 3862 - Industrial, Porto Velho - RO, Tel: (69) 3216-5462',
          cnes: '2678950',
          logoDataUrl: PRESET_LOGOS.sesau_ro.dataUrl,
          logoAlignment: 'center',
          watermarkType: 'sus_double',
          watermarkOpacity: 0.08,
          documentFormatting: {
            headerType: 'custom_logo',
            prescriptionViaCount: 2,
            showCnesOnHeader: true,
            referralModel: 'sus_regulation',
            examHeaderTitle: 'REQUISIÇÃO DE EXAMES E PROCEDIMENTOS — REDE ESTADUAL'
          },
          doctorCredentials: { ...doctorProfile },
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const consultorioContext: WorkContext = {
          id: 'ctx-consultorio',
          name: 'Consultório Particular',
          sphere: 'private',
          clinicName: 'Consultório Médico Particular',
          clinicAddress: 'Atendimento Ambulatorial Privado',
          cnes: '',
          logoDataUrl: PRESET_LOGOS.sus.dataUrl,
          logoAlignment: 'right',
          watermarkType: 'none',
          watermarkOpacity: 0.08,
          documentFormatting: {
            headerType: 'standard',
            prescriptionViaCount: 1,
            showCnesOnHeader: false,
            referralModel: 'direct_ambulatory',
            examHeaderTitle: 'SOLICITAÇÃO DE EXAMES COMPLEMENTARES'
          },
          doctorCredentials: { ...doctorProfile },
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await db.workContexts.bulkAdd([ubsContext, polContext, consultorioContext]);
        allContexts = [ubsContext, polContext, consultorioContext];
      }

      setContexts(allContexts);

      // Define o ativo
      const savedActiveId = localStorage.getItem(ACTIVE_CONTEXT_KEY);
      const matched = allContexts.find(c => c.id === savedActiveId) || allContexts.find(c => c.isDefault) || allContexts[0];
      setActiveContext(matched || null);
    } catch (err) {
      console.error('Erro ao carregar WorkContexts do IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorProfile]);

  useEffect(() => {
    loadContexts();
  }, [loadContexts]);

  // Alterna o contexto ativo em 1 clique
  const switchContext = useCallback((contextId: string) => {
    const selected = contexts.find(c => c.id === contextId);
    if (selected) {
      setActiveContext(selected);
      localStorage.setItem(ACTIVE_CONTEXT_KEY, selected.id);
    }
  }, [contexts]);

  // Salva ou atualiza um contexto existente
  const saveContext = useCallback(async (context: WorkContext) => {
    await db.workContexts.put({ ...context, updatedAt: Date.now() });
    await loadContexts();
  }, [loadContexts]);

  return {
    contexts,
    activeContext,
    switchContext,
    saveContext,
    loadContexts,
    loading
  };
}
