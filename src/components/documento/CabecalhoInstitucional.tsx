import React from 'react';
import type { IdentidadeDocumento } from '../../utils/documentoClinico';

interface CabecalhoInstitucionalProps {
  cabecalho: IdentidadeDocumento['cabecalho'];
  /** Versão reduzida, usada em cada via da receita de controle especial. */
  compacto?: boolean;
}

/**
 * Timbre do documento: logo e nome do local de atendimento. O médico não
 * aparece aqui — a identificação dele fica na assinatura (e no quadro do
 * emitente, na receita de controle especial).
 */
export const CabecalhoInstitucional: React.FC<CabecalhoInstitucionalProps> = ({ cabecalho, compacto = false }) => {
  const { titulo, linhas, logo, logoSecundario, alinhamentoLogo } = cabecalho;
  // Logos de órgão trazem o nome por extenso embaixo do símbolo (ex.: SEMUSA): menores que isto, ficam ilegíveis.
  const alturaLogo = compacto ? 40 : 70;
  const duplo = Boolean(logo && logoSecundario);
  const centralizado = duplo || (Boolean(logo) && alinhamentoLogo === 'center') || !logo;
  const logoADireita = !duplo && Boolean(logo) && alinhamentoLogo === 'right';

  const imagem = (src: string, alt: string) => (
    <img
      src={src}
      alt={alt}
      style={{ height: alturaLogo, maxWidth: compacto ? 96 : 170, objectFit: 'contain', flexShrink: 0 }}
    />
  );

  const texto = (
    <div style={{ flex: 1, minWidth: 0, textAlign: centralizado ? 'center' : 'left' }}>
      <p
        style={{
          margin: 0,
          fontSize: compacto ? 11.5 : 16,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: '#0F172A'
        }}
      >
        {titulo}
      </p>
      {linhas.map((linha) => (
        <p
          key={linha}
          style={{ margin: 0, marginTop: compacto ? 1 : 3, fontSize: compacto ? 8.5 : 10.5, lineHeight: 1.35, color: '#475569' }}
        >
          {linha}
        </p>
      ))}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: !duplo && logo && alinhamentoLogo === 'center' ? 'column' : 'row',
        alignItems: 'center',
        gap: compacto ? 8 : 16,
        paddingBottom: compacto ? 6 : 12,
        borderBottom: `${compacto ? 1 : 1.5}px solid #0F172A`
      }}
    >
      {logo && !logoADireita && imagem(logo, 'Logotipo do local de atendimento')}
      {texto}
      {logo && logoADireita && imagem(logo, 'Logotipo do local de atendimento')}
      {duplo && imagem(logoSecundario!, 'Logotipo secundário')}
    </div>
  );
};

export default CabecalhoInstitucional;
