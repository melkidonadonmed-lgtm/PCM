import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { WorkContext } from '../types';

const ACTIVE_CONTEXT_KEY = 'pcm_active_context_id';

export function useWorkContext(doctorProfile: { crm: string; uf: string; rqe?: string }) {
  const [contexts, setContexts] = useState<WorkContext[]>([]);
  const [activeContext, setActiveContext] = useState<WorkContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega os contextos e inicializa se necessário
  const loadContexts = useCallback(async () => {
    try {
      await db.open();
      let allContexts = await db.workContexts.toArray();
      
      if (allContexts.length === 0) {
        await db.workContexts.clear();
        // Inicializa com os dados do perfil do médico
        const ubsContext: WorkContext = {
          id: 'ctx-ubs',
          name: 'UBS Municipal (Atenção Básica)',
          sphere: 'municipal',
          clinicName: 'Unidade Básica de Saúde',
          clinicAddress: 'Secretaria Municipal de Saúde',
          logoAlignment: 'left',
          regulatoryRules: {
            restrictToRemume: true,
            requireSpecificReferralHeader: true,
            standardPrescriptionViaCount: 1
          },
          doctorCredentials: { ...doctorProfile },
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const polContext: WorkContext = {
          id: 'ctx-policlinica',
          name: 'Policlínica / Hospital Estadual',
          sphere: 'state',
          clinicName: 'Policlínica Estadual de Especialidades',
          clinicAddress: 'Secretaria de Estado da Saúde',
          logoAlignment: 'center',
          regulatoryRules: {
            restrictToRemume: false,
            requireSpecificReferralHeader: true,
            standardPrescriptionViaCount: 2
          },
          doctorCredentials: { ...doctorProfile },
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await db.workContexts.bulkAdd([ubsContext, polContext]);
        allContexts = [ubsContext, polContext];
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
    loading
  };
}
