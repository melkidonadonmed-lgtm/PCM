import React from 'react';
import type {
  DoctorProfile,
  ExamItem,
  MedicalCertificate,
  MedicalReferral,
  Patient,
  PrescriptionItem,
  WatermarkType,
  WorkContext
} from '../../types';
import {
  dataCurta,
  nomeDoPaciente,
  numeroPorExtenso,
  resolverIdentidade,
  tituloDoDocumento,
  type TipoDocumento
} from '../../utils/documentoClinico';
import { CabecalhoInstitucional } from './CabecalhoInstitucional';
import { AssinaturaMedico } from './AssinaturaMedico';
import { ReceitaDuasVias } from './ReceitaDuasVias';
import { WatermarkOverlay } from '../WatermarkOverlay';

export interface DocumentoClinicoProps {
  tipo: TipoDocumento;
  doctor: DoctorProfile;
  patient: Patient;
  activeContext?: WorkContext | null;
  /** Itens já filtrados para este documento (simples, antimicrobianos OU controle especial — nunca misturados). */
  prescriptionItems?: PrescriptionItem[];
  exams?: ExamItem[];
  examIndication?: string;
  certificate?: MedicalCertificate;
  referral?: MedicalReferral;
  /** Marca d'água da folha; por padrão, a do local de atendimento ativo. */
  marcaDagua?: WatermarkType;
  emissao?: Date;
}

const TINTA = '#0F172A';
const TINTA_SUAVE = '#334155';
const TINTA_APAGADA = '#64748B';
const FILETE = '#CBD5E1';
const SERIFA = 'var(--font-serif-doc)';

const rotulo: React.CSSProperties = {
  margin: 0,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: TINTA_APAGADA
};

const Secao: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <section className="print-avoid-break" style={{ marginTop: 18 }}>
    <p style={rotulo}>{titulo}</p>
    <div style={{ marginTop: 4, fontFamily: SERIFA, fontSize: 16, lineHeight: 1.55, color: TINTA, whiteSpace: 'pre-wrap' }}>
      {children}
    </div>
  </section>
);

const Vazio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: '64px 0', textAlign: 'center', fontFamily: SERIFA, fontStyle: 'italic', fontSize: 16, color: TINTA_APAGADA }}>
    {children}
  </p>
);

/**
 * Conteúdo do documento clínico, diagramado para a FolhaA4. É o ÚNICO desenho
 * de receita, pedido de exames, atestado e encaminhamento: a prévia na tela, a
 * impressão e o PDF saem todos deste componente.
 */
export const DocumentoClinico: React.FC<DocumentoClinicoProps> = ({
  tipo,
  doctor,
  patient,
  activeContext = null,
  prescriptionItems = [],
  exams = [],
  examIndication = '',
  certificate,
  referral,
  marcaDagua,
  emissao = new Date()
}) => {
  const identidade = resolverIdentidade(doctor, activeContext);
  const paciente = nomeDoPaciente(patient, identidade.exemplo, [certificate?.patientName, referral?.patientName]);
  const documentoPaciente =
    patient?.documentNumber?.trim() || certificate?.documentNumber?.trim() || referral?.documentNumber?.trim() || '';
  const idade = patient?.ageText?.trim() || '';
  const peso = patient?.weightKg && patient.weightKg > 0 ? `${String(patient.weightKg).replace('.', ',')} kg` : '';
  const marca = marcaDagua ?? activeContext?.watermarkType ?? 'none';

  const fundo = (
    <>
      {identidade.exemplo && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              transform: 'rotate(-38deg)',
              fontSize: 118,
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#94A3B8',
              opacity: 0.22
            }}
          >
            EXEMPLO
          </span>
        </div>
      )}
      <WatermarkOverlay type={marca} opacity={activeContext?.watermarkOpacity} />
    </>
  );

  if (tipo === 'prescription' || tipo === 'special_prescription' || tipo === 'antimicrobial_prescription') {
    const regime =
      tipo === 'special_prescription'
        ? 'controle_especial'
        : tipo === 'antimicrobial_prescription'
          ? 'antimicrobiano'
          : 'simples';
    return (
      <>
        {fundo}
        <ReceitaDuasVias
          regime={regime}
          identidade={identidade}
          patient={patient}
          nomePaciente={paciente}
          items={prescriptionItems}
          emissao={emissao}
        />
      </>
    );
  }

  const dadosPaciente = [
    documentoPaciente && { rotulo: 'Documento', valor: documentoPaciente },
    idade && { rotulo: 'Idade', valor: idade },
    peso && { rotulo: 'Peso', valor: peso }
  ].filter(Boolean) as Array<{ rotulo: string; valor: string }>;

  return (
    <>
      {fundo}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CabecalhoInstitucional cabecalho={identidade.cabecalho} />

        <h1
          style={{
            margin: '20px 0 0',
            textAlign: 'center',
            fontFamily: SERIFA,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: TINTA
          }}
        >
          {tituloDoDocumento(tipo, activeContext)}
        </h1>

        {/* Identificação do paciente */}
        <div
          style={{
            marginTop: 16,
            padding: '8px 0',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 20,
            borderTop: `1px solid ${FILETE}`,
            borderBottom: `1px solid ${FILETE}`
          }}
        >
          <p style={{ margin: 0, fontSize: 13.5, color: TINTA, minWidth: 0 }}>
            <span style={{ ...rotulo, display: 'inline', marginRight: 6 }}>Paciente</span>
            <strong style={{ fontWeight: 700 }}>{paciente}</strong>
          </p>
          <p style={{ margin: 0, display: 'flex', gap: 18, flexShrink: 0, fontSize: 12, color: TINTA_SUAVE }}>
            {dadosPaciente.map((dado) => (
              <span key={dado.rotulo}>
                <span style={{ ...rotulo, display: 'inline', marginRight: 5 }}>{dado.rotulo}</span>
                <span style={{ fontWeight: 600 }}>{dado.valor}</span>
              </span>
            ))}
          </p>
        </div>

        <main style={{ marginTop: 8 }}>
          {/* 1. Solicitação de exames */}
          {tipo === 'exams' && (
            <>
              {examIndication.trim() && <Secao titulo="Indicação clínica">{examIndication}</Secao>}
              {exams.length === 0 ? (
                <Vazio>Nenhum exame selecionado neste pedido.</Vazio>
              ) : (
                <section style={{ marginTop: 18 }}>
                  <p style={rotulo}>Exames solicitados</p>
                  <ol style={{ margin: '8px 0 0', paddingLeft: 26, fontFamily: SERIFA, fontSize: 16.5, lineHeight: 1.5, color: TINTA }}>
                    {exams.map((exam) => (
                      <li key={exam.id} className="print-avoid-break" style={{ marginTop: 5, paddingLeft: 4 }}>
                        <span style={{ fontWeight: 600 }}>{exam.name}</span>
                        {exam.urgency === 'urgent' && (
                          <span style={{ marginLeft: 8, fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Urgente
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}

          {/* 3. Atestado médico */}
          {tipo === 'certificate' && certificate && (() => {
            const dias = Math.max(1, certificate.daysOff || 1);
            const documento = certificate.documentNumber?.trim() || documentoPaciente;
            return (
              <div style={{ marginTop: 34, padding: '0 16px', fontFamily: SERIFA, color: TINTA }}>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 2, textAlign: 'justify', textIndent: 44 }}>
                  Atesto para os devidos fins de direito que o(a) paciente{' '}
                  <strong style={{ fontWeight: 700, textTransform: 'uppercase' }}>{certificate.patientName?.trim() || paciente}</strong>,{' '}
                  {documento ? `portador(a) do documento nº ${documento}, ` : ''}
                  esteve sob meus cuidados médicos profissionais no dia {dataCurta(certificate.startDate, emissao)},{' '}
                  necessitando de <strong style={{ fontWeight: 700 }}>{dias} ({numeroPorExtenso(dias)}) dia(s)</strong> de repouso e
                  afastamento de suas atividades habituais{certificate.periodText?.trim() ? ` ${certificate.periodText.trim()}` : ''},
                  com retorno previsto a partir de {dataCurta(certificate.endDate, emissao)}.
                </p>

                {/* CID-10 somente com consentimento expresso do paciente (Res. CFM nº 1.658/2002) */}
                {certificate.includeCID && certificate.cid10Code && (
                  <div className="print-avoid-break" style={{ marginTop: 26, paddingLeft: 14, borderLeft: `2px solid ${TINTA}` }}>
                    <p style={{ margin: 0, fontSize: 16 }}>
                      <strong style={{ fontWeight: 700 }}>CID-10: </strong>
                      {certificate.cid10Code}
                      {certificate.cid10Description ? ` — ${certificate.cid10Description}` : ''}
                    </p>
                    <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-sans)', fontSize: 10, color: TINTA_APAGADA }}>
                      * Inclusão do CID expressamente solicitada e autorizada pelo(a) paciente (Resolução CFM nº 1.658/2002).
                    </p>
                  </div>
                )}

                {certificate.observations?.trim() && (
                  <p style={{ margin: '24px 0 0', fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    <strong style={{ fontWeight: 700 }}>Observações: </strong>
                    {certificate.observations}
                  </p>
                )}
              </div>
            );
          })()}

          {/* 4. Encaminhamento: só entra o que o médico escreveu (campos vazios não geram texto) */}
          {tipo === 'referral' && referral && (
            <>
              <Secao titulo="Ao serviço especializado de">
                <strong style={{ fontWeight: 700, fontSize: 18 }}>{referral.destinationSpecialty?.trim() || '—'}</strong>
                {referral.destinationInstitution?.trim() && (
                  <span style={{ display: 'block', fontSize: 15, color: TINTA_SUAVE }}>{referral.destinationInstitution}</span>
                )}
              </Secao>
              {referral.reason?.trim() && <Secao titulo="Motivo da solicitação">{referral.reason}</Secao>}
              {referral.clinicalSummary?.trim() && <Secao titulo="Resumo clínico / evolução">{referral.clinicalSummary}</Secao>}
              {referral.relevantExams?.trim() && <Secao titulo="Exames complementares realizados">{referral.relevantExams}</Secao>}
              {referral.hypothesisCID?.trim() && <Secao titulo="Hipótese diagnóstica (CID-10)">{referral.hypothesisCID}</Secao>}
            </>
          )}
        </main>

        <AssinaturaMedico medico={identidade.medico} emissao={emissao} />
      </div>
    </>
  );
};

export default DocumentoClinico;
