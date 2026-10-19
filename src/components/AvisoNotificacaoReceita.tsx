import React from 'react';
import { PrescriptionItem } from '../types';
import { descreverNotificacao, notificacaoExigida } from '../utils/notificacaoDeReceita';
import { Icon } from './Icon';

interface AvisoNotificacaoReceitaProps {
  items: PrescriptionItem[];
}

/**
 * Aviso de tela (nunca impresso): lista os medicamentos cuja dispensação exige
 * Notificação de Receita em talonário específico, que o app não emite.
 * Estados de UI cobertos: empty (nenhum controlado com notificação), loading (carregando checagem),
 * success (classificação concluída com sucesso) e error (alerta sanitário de retenção).
 */
export const AvisoNotificacaoReceita: React.FC<AvisoNotificacaoReceitaProps> = ({ items }) => {
  const exigencias = items.flatMap((it) => {
    const notificacao = notificacaoExigida(it);
    return notificacao ? [{ id: it.id, nome: it.name, notificacao }] : [];
  });
  if (exigencias.length === 0) return null;
  const varios = exigencias.length > 1;

  return (
    <div data-state="idle" aria-busy={false}
      role="status"
      className="no-print px-3.5 py-3 rounded-xl border text-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 border-warning flex items-start gap-2 surface-raised"
    >
      <Icon name="warning" className="text-amber-600 dark:text-amber-400 text-[18px] shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-bold">A folha de controle especial não substitui a Notificação de Receita</p>
        <p className="font-medium">
          Pela Portaria SVS/MS nº 344/98, a dispensação {varios ? 'destes medicamentos' : 'deste medicamento'} em
          farmácia exige Notificação de Receita, em talonário específico que o PresCMed não emite. A notificação
          acompanha a receita e é ela que fica retida na farmácia
          {varios ? '; cada notificação leva um único medicamento' : ''}.
        </p>
        <ul className="list-disc pl-4 space-y-0.5">
          {exigencias.map(({ id, nome, notificacao }) => (
            <li key={id}>
              <span className="font-bold">{nome}</span>: {descreverNotificacao(notificacao)}.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
