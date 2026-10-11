import React from 'react';
import type { IdentidadeDocumento } from '../../utils/documentoClinico';
import { localEData } from '../../utils/documentoClinico';

interface AssinaturaMedicoProps {
  medico: IdentidadeDocumento['medico'];
  emissao: Date;
  /** Versão reduzida, usada em cada via da receita de controle especial. */
  compacto?: boolean;
}

/**
 * Local, data e linha de assinatura com nome, CRM/UF e especialidade do médico.
 * Não há selo de "validação digital": o PresCMed não assina eletronicamente —
 * o documento vale com a assinatura manuscrita ou com certificado ICP-Brasil
 * aplicado fora do sistema.
 */
export const AssinaturaMedico: React.FC<AssinaturaMedicoProps> = ({ medico, emissao, compacto = false }) => (
  <footer
    className="print-avoid-break"
    style={{
      marginTop: 'auto',
      paddingTop: compacto ? 10 : 28,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}
  >
    <p style={{ margin: 0, fontSize: compacto ? 9.5 : 12.5, color: '#334155' }}>
      {localEData(medico.cidadeUf, emissao)}
    </p>
    <div
      style={{
        marginTop: compacto ? 22 : 46,
        paddingTop: compacto ? 4 : 7,
        minWidth: compacto ? 200 : 290,
        borderTop: '1px solid #0F172A'
      }}
    >
      <p style={{ margin: 0, fontSize: compacto ? 10.5 : 13.5, fontWeight: 700, color: '#0F172A' }}>{medico.nome}</p>
      <p style={{ margin: 0, fontSize: compacto ? 9 : 11.5, fontWeight: 600, color: '#334155' }}>{medico.registro}</p>
      {medico.especialidade && (
        <p style={{ margin: 0, fontSize: compacto ? 8.5 : 10.5, color: '#64748B' }}>{medico.especialidade}</p>
      )}
    </div>
  </footer>
);

export default AssinaturaMedico;
