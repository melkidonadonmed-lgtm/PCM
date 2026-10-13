import React from 'react';
import type { Patient, PrescriptionItem } from '../../types';
import {
  agruparPorVia,
  enderecoDoPaciente,
  rotuloApresentacao,
  type IdentidadeDocumento
} from '../../utils/documentoClinico';
import { CabecalhoInstitucional } from './CabecalhoInstitucional';
import { AssinaturaMedico } from './AssinaturaMedico';

/** Regime da receita em folha A4 paisagem: simples (1 via à esquerda), antimicrobiano (2 vias) ou controle especial (2 vias Portaria 344/98). */
export type RegimeDuasVias = 'simples' | 'controle_especial' | 'antimicrobiano';

interface ReceitaDuasViasProps {
  regime: RegimeDuasVias;
  identidade: IdentidadeDocumento;
  patient: Patient;
  nomePaciente: string;
  items: PrescriptionItem[];
  emissao: Date;
}

const TINTA = '#0F172A';
const TINTA_SUAVE = '#334155';
const TINTA_APAGADA = '#64748B';
const FILETE = '#94A3B8';
const SERIFA = 'var(--font-serif-doc)';

const rotulo: React.CSSProperties = {
  margin: 0,
  fontSize: 7.5,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: TINTA_APAGADA
};

const quadro: React.CSSProperties = {
  padding: '5px 8px 6px',
  border: `1px solid ${FILETE}`,
  borderRadius: 3,
  fontSize: 9.5,
  lineHeight: 1.45,
  color: TINTA
};

/** Campo a preencher à mão: rótulo seguido de linha. */
const Campo: React.FC<{ nome: string; largura?: string }> = ({ nome, largura = '100%' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, width: largura, marginTop: 6 }}>
    <span style={{ whiteSpace: 'nowrap' }}>{nome}:</span>
    <span style={{ flex: 1, borderBottom: `1px solid ${FILETE}`, height: 10 }} />
  </span>
);

interface ViaProps extends ReceitaDuasViasProps {
  via: 1 | 2;
}

const Via: React.FC<ViaProps> = ({ via, regime, identidade, patient, nomePaciente, items, emissao }) => {
  const simples = regime === 'simples';
  const controleEspecial = regime === 'controle_especial';
  const { medico } = identidade;
  const endereco = enderecoDoPaciente(patient);
  const documento = patient?.documentNumber?.trim() || '';
  const idade = patient?.ageText?.trim() || '';
  const sexo = patient?.sex === 'M' ? 'Sexo: Masculino' : patient?.sex === 'F' ? 'Sexo: Feminino' : '';
  const peso = patient?.weightKg && patient.weightKg > 0 ? `${String(patient.weightKg).replace('.', ',')} kg` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <CabecalhoInstitucional cabecalho={identidade.cabecalho} compacto />

      <div style={{ marginTop: 7, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <h1 style={{ margin: 0, fontFamily: SERIFA, fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TINTA }}>
          {controleEspecial ? 'Receituário de Controle Especial' : 'Receituário Médico'}
        </h1>
        {!simples && (
          <p style={{ margin: 0, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: TINTA, whiteSpace: 'nowrap' }}>
            {controleEspecial
              ? (via === 1 ? '1ª via — Farmácia (retenção)' : '2ª via — Paciente (orientação)')
              : (via === 1 ? '1ª via — Paciente' : '2ª via — Farmácia (retenção)')}
          </p>
        )}
      </div>
      {regime === 'antimicrobiano' && (
        <p style={{ margin: '2px 0 0', fontSize: 8.5, color: TINTA_SUAVE }}>
          Antimicrobiano — receita válida por 10 dias a contar da data de emissão (RDC Anvisa nº 471/2021).
        </p>
      )}

      {/* Identificação do emitente em quadro próprio (exigida nos regimes de 2 vias: antimicrobiano e controle especial) */}
      {!simples && (
        <div style={{ ...quadro, marginTop: 7 }}>
          <p style={rotulo}>Identificação do emitente</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700 }}>
            {medico.nome} <span style={{ fontWeight: 600, color: TINTA_SUAVE }}>— {medico.registro}</span>
          </p>
          <p style={{ margin: 0, fontSize: 9, color: TINTA_SUAVE }}>
            {[
              medico.endereco,
              medico.cidadeUf && !medico.endereco.includes(medico.cidadeUf) ? medico.cidadeUf : '',
              medico.telefone ? `Tel. ${medico.telefone}` : ''
            ].filter(Boolean).join(' • ') || '\u00A0'}
          </p>
        </div>
      )}

      {/* Identificação do paciente; o endereço é exigido só na receita de controle especial */}
      <div style={{ ...quadro, marginTop: simples ? 8 : 5 }}>
        <p style={rotulo}>Paciente</p>
        <p style={{ margin: '2px 0 0', fontSize: 11 }}>
          <strong style={{ fontWeight: 700 }}>{nomePaciente}</strong>
          {documento && <span style={{ color: TINTA_SUAVE }}> — Doc. {documento}</span>}
          {idade && <span style={{ color: TINTA_SUAVE }}> — {idade}</span>}
          {sexo && <span style={{ color: TINTA_SUAVE }}> — {sexo}</span>}
          {peso && <span style={{ color: TINTA_SUAVE }}> — {peso}</span>}
        </p>
        {controleEspecial && (
          endereco ? (
            <p style={{ margin: 0, fontSize: 9, color: TINTA_SUAVE }}>Endereço: {endereco}</p>
          ) : (
            <Campo nome="Endereço" />
          )
        )}
      </div>

      {/* Prescrição: idêntica nas vias (medicamento, apresentação, quantidade e posologia) */}
      <div style={{ marginTop: 9, flex: 1 }}>
        <p style={{ ...rotulo, fontSize: 8, color: TINTA_SUAVE }}>Prescrição</p>
        {items.length === 0 ? (
          <p style={{ margin: '28px 0', textAlign: 'center', fontFamily: SERIFA, fontStyle: 'italic', fontSize: 13, color: TINTA_APAGADA }}>
            {controleEspecial
              ? 'Nenhum medicamento de controle especial prescrito.'
              : simples
                ? 'Nenhum medicamento adicionado nesta prescrição.'
                : 'Nenhum antimicrobiano prescrito.'}
          </p>
        ) : (
          agruparPorVia(items).map((grupo) => (
            <div key={grupo.via} style={{ marginTop: 4 }}>
              <p style={{ ...rotulo, fontSize: 8 }}>{grupo.via}</p>
              <ol style={{ margin: '2px 0 0', padding: 0, listStyle: 'none', fontFamily: SERIFA, color: TINTA }}>
                {grupo.itens.map((item, idx) => {
                  const apresentacao = rotuloApresentacao(item);
                  return (
                    <li key={item.id} style={{ marginTop: idx === 0 ? 0 : 6 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 13, lineHeight: 1.3 }}>
                        <span style={{ fontWeight: 700 }}>
                          {idx + 1}. {item.name}
                          {apresentacao && <span style={{ fontWeight: 500, fontStyle: 'italic' }}> ({apresentacao})</span>}
                        </span>
                        <span aria-hidden="true" style={{ flex: 1, minWidth: 14, borderBottom: `1px dotted ${TINTA_APAGADA}`, transform: 'translateY(-3px)' }} />
                        <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.quantity}</span>
                      </div>
                      <p style={{ margin: '1px 0 0', paddingLeft: 14, fontSize: 12.5, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {item.instructions}
                      </p>
                      {item.scheduleTimes && item.scheduleTimes.length > 0 && (
                        <p style={{ margin: 0, paddingLeft: 14, fontFamily: 'var(--font-sans)', fontSize: 8.5, color: TINTA_SUAVE }}>
                          Horários sugeridos: {item.scheduleTimes.join(' • ')}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))
        )}
      </div>

      {regime === 'antimicrobiano' && (
        // Antimicrobiano: a farmácia anota a dispensação nas duas vias (RDC 471/2021)
        <div style={{ ...quadro, marginTop: 8, fontSize: 8.5 }}>
          <p style={rotulo}>Dispensação — preenchimento da farmácia</p>
          <Campo nome="Data" largura="28%" />{' '}
          <Campo nome="Quantidade aviada" largura="38%" />{' '}
          <Campo nome="Lote" largura="30%" />
        </div>
      )}

      {controleEspecial && (
        via === 1 ? (
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ ...quadro, fontSize: 8.5 }}>
              <p style={rotulo}>Identificação do comprador</p>
              <Campo nome="Nome" />
              <Campo nome="RG" largura="48%" />{' '}
              <Campo nome="Órgão emissor" largura="48%" />
              <Campo nome="Endereço" />
              <Campo nome="Cidade/UF" largura="58%" />{' '}
              <Campo nome="Telefone" largura="38%" />
            </div>
            <div style={{ ...quadro, fontSize: 8.5 }}>
              <p style={rotulo}>Identificação do fornecedor</p>
              <Campo nome="Farmácia/Drogaria" />
              <Campo nome="Quantidade dispensada" />
              <Campo nome="Lote" largura="58%" />{' '}
              <Campo nome="Data" largura="38%" />
              <span style={{ display: 'block', marginTop: 20, paddingTop: 2, borderTop: `1px solid ${FILETE}`, textAlign: 'center', fontSize: 7.5, color: TINTA_APAGADA }}>
                Assinatura do farmacêutico
              </span>
            </div>
          </div>
        ) : (
          <div style={{ ...quadro, marginTop: 8, fontSize: 8.5, color: TINTA_SUAVE }}>
            <p style={rotulo}>Orientações ao paciente (Portaria SVS/MS nº 344/98)</p>
            <p style={{ margin: '3px 0 0' }}>• Medicamento sujeito a controle especial. Uso estritamente individual conforme prescrito.</p>
            <p style={{ margin: 0 }}>• Não altere as doses nem interrompa o tratamento sem prévia avaliação médica.</p>
            <p style={{ margin: 0 }}>• Mantenha fora do alcance de crianças, em local seguro e protegido de luz e umidade.</p>
          </div>
        )
      )}

      <AssinaturaMedico medico={medico} emissao={emissao} compacto />
    </div>
  );
};

/**
 * Receita em folha única A4 paisagem (padrão PEC do SUS), dividida ao meio com
 * linha de corte central:
 *  - simples: 1 via na metade esquerda e metade direita livre;
 *  - antimicrobiano (RDC Anvisa nº 471/2021): 2 vias lado a lado no mesmo modelo
 *    limpo (1ª via Paciente / 2ª via Farmácia, válida por 10 dias);
 *  - controle especial (Portaria SVS/MS nº 344/98): 2 vias lado a lado com os
 *    quadros regulamentares de comprador e fornecedor e endereço do paciente.
 */
export const ReceitaDuasVias: React.FC<ReceitaDuasViasProps> = (props) => (
  <div
    style={{
      position: 'relative',
      zIndex: 1,
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      columnGap: 16
    }}
  >
    <Via via={1} {...props} />
    <div
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: `1px dashed ${FILETE}`, width: 0 }}
    >
      <span style={{ padding: '6px 0', backgroundColor: '#FFFFFF', fontSize: 11, color: TINTA_APAGADA, transform: 'translateX(-0.5px)' }}>✂</span>
    </div>
    {props.regime === 'simples' ? <div aria-hidden="true" /> : <Via via={2} {...props} />}
  </div>
);

export default ReceitaDuasVias;
