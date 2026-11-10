import type { LmeMedicationRow, SusDocumentId, SusFilledFormData } from '../types';
import { ajustarTexto, type Caixa, partesDaData, partesDoTelefone, soDigitos } from '../utils/formularioOficial';
import { SUS_OFFICIAL_FORM_URLS } from './externalUrlsConfig';

/**
 * Formulários oficiais do SUS emitidos sobre o próprio impresso do órgão.
 *
 * O fundo da folha é a imagem do formulário publicado pelo Ministério da Saúde
 * (em `public/formularios-sus/`); o app só escreve os dados por cima, cada um
 * no seu campo numerado. Assim a folha que sai é a que a regulação e a farmácia
 * conhecem — não um documento "parecido".
 *
 * Regras:
 *  - Só entra aqui formulário com modelo oficial conferido na fonte (`fonte`).
 *    Não desenhe formulário "no estilo SUS": impresso recriado é recusado.
 *  - Campo sem dado informado fica EM BRANCO (o médico completa à mão). Nada de
 *    "—", valor padrão ou caixa marcada sem escolha explícita na tela.
 *  - As coordenadas (em pontos, origem no canto superior esquerdo) foram lidas
 *    do PDF oficial. Se o órgão publicar nova versão, gere o fundo de novo e
 *    reconfira campo a campo.
 */

export type CampoDoFormulario =
  | {
      tipo: 'texto';
      /** Número do campo no impresso, para avisos na tela ("campo 40"). */
      campo: string;
      caixa: Caixa;
      valor: string;
      tamanhoMaximo?: number;
      centralizado?: boolean;
      /** Encosta o texto no pé da caixa (área de assinatura). */
      noPe?: boolean;
    }
  | {
      /** Um caractere por quadrícula do impresso. `celulas` são as divisórias, da esquerda para a direita. */
      tipo: 'pente';
      campo: string;
      celulas: number[];
      y0: number;
      y1: number;
      valor: string;
    }
  | { tipo: 'marca'; campo: string; caixa: Caixa };

export interface FormularioOficial {
  id: SusDocumentId;
  titulo: string;
  imagem: string;
  /** Largura e altura da página do impresso, em pontos. */
  pagina: [number, number];
  fonte: { orgao: string; url: string; conferidoEm: string };
  montar: (dados: SusFilledFormData, emissao: Date) => CampoDoFormulario[];
}

const texto = (campo: string, caixa: Caixa, valor: string | undefined, extra: Partial<Extract<CampoDoFormulario, { tipo: 'texto' }>> = {}): CampoDoFormulario[] =>
  valor?.trim() ? [{ tipo: 'texto', campo, caixa, valor: valor.trim(), ...extra }] : [];

const pente = (campo: string, celulas: number[], y0: number, y1: number, valor: string | undefined): CampoDoFormulario[] =>
  valor?.trim() ? [{ tipo: 'pente', campo, celulas, y0, y1, valor: valor.trim() }] : [];

const marca = (campo: string, caixa: Caixa, marcar: boolean): CampoDoFormulario[] =>
  marcar ? [{ tipo: 'marca', campo, caixa }] : [];

/** Data nos três espaços separados pelas barras já impressas no formulário. */
const dataEmTresPartes = (campo: string, partes: [string, string, string], caixas: [Caixa, Caixa, Caixa]): CampoDoFormulario[] =>
  partes.map((valor, i) => ({ tipo: 'texto' as const, campo, caixa: caixas[i], valor, centralizado: true }));

const dataDeEmissao = (emissao: Date): [string, string, string] => [
  String(emissao.getDate()).padStart(2, '0'),
  String(emissao.getMonth() + 1).padStart(2, '0'),
  String(emissao.getFullYear())
];

const ROTULO_RACA_COR: Record<string, string> = {
  branca: 'Branca',
  preta: 'Preta',
  parda: 'Parda',
  amarela: 'Amarela',
  indigena: 'Indígena'
};

const registroNoConselho = (d: SusFilledFormData): string =>
  d.doctorCrm?.trim() ? `CRM-${(d.doctorCrmState || '').trim().toUpperCase()} ${d.doctorCrm.trim()}` : '';

/** Linhas de medicamento da LME; o campo antigo (um único nome) vale como 1ª linha. */
export function medicamentosDaLme(d: SusFilledFormData): LmeMedicationRow[] {
  const linhas = (d.lmeMedications || []).filter((m) => m.name?.trim() || m.quantities?.some((q) => q?.trim()));
  if (linhas.length > 0) return linhas.slice(0, 6);
  return d.lmeMedicationName?.trim() ? [{ name: d.lmeMedicationName.trim(), quantities: [] }] : [];
}

// ---------------------------------------------------------------------------
// APAC — Laudo para Solicitação/Autorização de Procedimento Ambulatorial
// ---------------------------------------------------------------------------

export type BlocoRegulatorioApac =
  | 'estabelecimento_solicitante'
  | 'identificacao_paciente'
  | 'procedimento_principal'
  | 'procedimentos_secundarios'
  | 'justificativa'
  | 'solicitacao'
  | 'autorizacao'
  | 'estabelecimento_executante';

export type ResponsavelCampoApac =
  | 'solicitante_obrigatorio'
  | 'solicitante_opcional'
  | 'autorizador_regulador'
  | 'executante';

export interface CampoMatrizRegulatoriaApac {
  campo: string;
  rotulo: string;
  bloco: BlocoRegulatorioApac;
  responsavel: ResponsavelCampoApac;
  regraLocalSesauSemusa: string;
}

/**
 * Matriz regulatória completa dos 55 campos do Laudo APAC (SIA/SUS — MS),
 * conferida com as diretrizes de regulação ambulatorial SESAU-RO / SEMUSA.
 */
export const MATRIZ_CAMPOS_APAC_55: readonly CampoMatrizRegulatoriaApac[] = [
  { campo: '1', rotulo: 'Nome do Estabelecimento de Saúde Solicitante', bloco: 'estabelecimento_solicitante', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Preenchido com o nome da unidade solicitante.' },
  { campo: '2', rotulo: 'CNES do Estabelecimento Solicitante', bloco: 'estabelecimento_solicitante', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Pente de 7 dígitos do CNES solicitante.' },
  { campo: '3', rotulo: 'Nome do Paciente', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Nome civil completo sem abreviações.' },
  { campo: '4', rotulo: 'Nº do Prontuário', bloco: 'identificacao_paciente', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco para anotação manual do prontuário local quando não informado.' },
  { campo: '5', rotulo: 'Cartão Nacional de Saúde (CNS)', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Pente de 15 dígitos do CNS do usuário.' },
  { campo: '6', rotulo: 'Data de Nascimento', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Data em 3 partes (DD/MM/AAAA).' },
  { campo: '7', rotulo: 'Sexo', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Marca X em Masc. ou Fem. somente quando informado explicitamente.' },
  { campo: '8', rotulo: 'Raça/Cor', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Autodeclaração conforme Portaria MS nº 344/2017; em branco se não informada.' },
  { campo: '9', rotulo: 'Nome da Mãe', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Nome completo da genitora do paciente.' },
  { campo: '10', rotulo: 'Telefone de Contato do Paciente', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'DDD (2 dígitos) + telefone (pente até 8 dígitos ou texto corrido para celular de 9 dígitos).' },
  { campo: '11', rotulo: 'Nome do Responsável', bloco: 'identificacao_paciente', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional para menores/incapazes; em branco para preenchimento manual quando aplicável.' },
  { campo: '12', rotulo: 'Telefone de Contato do Responsável', bloco: 'identificacao_paciente', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; segue a mesma regra de DDD + número do campo 10.' },
  { campo: '13', rotulo: 'Endereço (Rua, Nº, Bairro)', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Logradouro, número e bairro concatenados.' },
  { campo: '14', rotulo: 'Município de Residência', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Município de residência atual do paciente.' },
  { campo: '15', rotulo: 'Cód. IBGE Município', bloco: 'identificacao_paciente', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Pente de 7 dígitos (ex.: 1100205 Porto Velho); se em branco, codificado pela regulação SESAU-RO/SEMUSA.' },
  { campo: '16', rotulo: 'UF', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Sigla da UF com 2 letras em quadrícula.' },
  { campo: '17', rotulo: 'CEP', bloco: 'identificacao_paciente', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Pente de 8 dígitos do CEP residencial.' },
  { campo: '18', rotulo: 'Código do Procedimento Principal', bloco: 'procedimento_principal', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Pente de 10 dígitos do código SIGTAP principal.' },
  { campo: '19', rotulo: 'Nome do Procedimento Principal', bloco: 'procedimento_principal', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Descrição oficial SIGTAP do procedimento principal.' },
  { campo: '20', rotulo: 'Qtde. do Procedimento Principal', bloco: 'procedimento_principal', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Quantidade solicitada do procedimento principal.' },
  { campo: '21', rotulo: 'Código do Procedimento Secundário (1ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional (10 dígitos SIGTAP); em branco quando não houver procedimento secundário.' },
  { campo: '22', rotulo: 'Nome do Procedimento Secundário (1ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver procedimento secundário.' },
  { campo: '23', rotulo: 'Qtde. do Procedimento Secundário (1ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver procedimento secundário.' },
  { campo: '24', rotulo: 'Código do Procedimento Secundário (2ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional (10 dígitos SIGTAP); em branco quando não houver 2º secundário.' },
  { campo: '25', rotulo: 'Nome do Procedimento Secundário (2ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 2º secundário.' },
  { campo: '26', rotulo: 'Qtde. do Procedimento Secundário (2ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 2º secundário.' },
  { campo: '27', rotulo: 'Código do Procedimento Secundário (3ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional (10 dígitos SIGTAP); em branco quando não houver 3º secundário.' },
  { campo: '28', rotulo: 'Nome do Procedimento Secundário (3ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 3º secundário.' },
  { campo: '29', rotulo: 'Qtde. do Procedimento Secundário (3ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 3º secundário.' },
  { campo: '30', rotulo: 'Código do Procedimento Secundário (4ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional (10 dígitos SIGTAP); em branco quando não houver 4º secundário.' },
  { campo: '31', rotulo: 'Nome do Procedimento Secundário (4ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 4º secundário.' },
  { campo: '32', rotulo: 'Qtde. do Procedimento Secundário (4ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 4º secundário.' },
  { campo: '33', rotulo: 'Código do Procedimento Secundário (5ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional (10 dígitos SIGTAP); em branco quando não houver 5º secundário.' },
  { campo: '34', rotulo: 'Nome do Procedimento Secundário (5ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 5º secundário.' },
  { campo: '35', rotulo: 'Qtde. do Procedimento Secundário (5ª linha)', bloco: 'procedimentos_secundarios', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver 5º secundário.' },
  { campo: '36', rotulo: 'Descrição do Diagnóstico', bloco: 'justificativa', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Descrição clínica do diagnóstico principal.' },
  { campo: '37', rotulo: 'CID-10 Principal', bloco: 'justificativa', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Código CID-10 principal obrigatório para autorização SIA/SUS.' },
  { campo: '38', rotulo: 'CID-10 Secundário', bloco: 'justificativa', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver diagnóstico secundário.' },
  { campo: '39', rotulo: 'CID-10 Causas Associadas', bloco: 'justificativa', responsavel: 'solicitante_opcional', regraLocalSesauSemusa: 'Opcional; em branco quando não houver causas associadas.' },
  { campo: '40', rotulo: 'Observações / Justificativa Clínica', bloco: 'justificativa', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Quadro clínico, exames prévios e justificativa técnica.' },
  { campo: '41', rotulo: 'Nome do Profissional Solicitante', bloco: 'solicitacao', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Nome completo do médico solicitante.' },
  { campo: '42', rotulo: 'Data da Solicitação', bloco: 'solicitacao', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Data local de emissão do laudo (DD/MM/AAAA).' },
  { campo: '43', rotulo: 'Tipo de Documento (CNS / CPF) do Solicitante', bloco: 'solicitacao', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Marca X em CNS ou CPF conforme documento informado.' },
  { campo: '44', rotulo: 'Nº Documento (CNS/CPF) do Profissional Solicitante', bloco: 'solicitacao', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'Pente de 11 dígitos (CPF) ou 15 dígitos (CNS).' },
  { campo: '45', rotulo: 'Assinatura e Carimbo (Nº Registro do Conselho)', bloco: 'solicitacao', responsavel: 'solicitante_obrigatorio', regraLocalSesauSemusa: 'CRM-UF impresso na base da caixa, preservando área livre para assinatura e carimbo.' },
  { campo: '46', rotulo: 'Nome do Profissional Autorizador', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para o médico autorizador (SESAU-RO / SEMUSA).' },
  { campo: '47', rotulo: 'Cód. Órgão Emissor', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para o complexo regulador.' },
  { campo: '48', rotulo: 'Tipo de Documento (CNS / CPF) do Autorizador', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para o autorizador.' },
  { campo: '49', rotulo: 'Nº Documento (CNS/CPF) do Profissional Autorizador', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para o autorizador.' },
  { campo: '50', rotulo: 'Data da Autorização', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para a regulação.' },
  { campo: '51', rotulo: 'Assinatura e Carimbo do Autorizador', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para o autorizador.' },
  { campo: '52', rotulo: 'Nº da Autorização (APAC)', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para numeração APAC de 13 dígitos gerada pelo SIA/SUS.' },
  { campo: '53', rotulo: 'Período de Validade da APAC', bloco: 'autorizacao', responsavel: 'autorizador_regulador', regraLocalSesauSemusa: 'Reservado em branco para vigência definida pela regulação.' },
  { campo: '54', rotulo: 'Nome Fantasia do Estabelecimento de Saúde Executante', bloco: 'estabelecimento_executante', responsavel: 'executante', regraLocalSesauSemusa: 'Reservado em branco para o prestador executante.' },
  { campo: '55', rotulo: 'CNES do Estabelecimento Executante', bloco: 'estabelecimento_executante', responsavel: 'executante', regraLocalSesauSemusa: 'Reservado em branco para o CNES do prestador executante.' }
] as const;

export function conferirMatrizApac55Campos() {
  const totalCampos = MATRIZ_CAMPOS_APAC_55.length;
  const obrigatoriosSolicitante = MATRIZ_CAMPOS_APAC_55.filter((c) => c.responsavel === 'solicitante_obrigatorio').map((c) => c.campo);
  const opcionaisSolicitante = MATRIZ_CAMPOS_APAC_55.filter((c) => c.responsavel === 'solicitante_opcional').map((c) => c.campo);
  const reservadosRegulacaoExecutante = MATRIZ_CAMPOS_APAC_55.filter(
    (c) => c.responsavel === 'autorizador_regulador' || c.responsavel === 'executante'
  ).map((c) => c.campo);

  return {
    totalCampos,
    sequenciaCompleta1a55: MATRIZ_CAMPOS_APAC_55.every((item, idx) => item.campo === String(idx + 1)),
    obrigatoriosSolicitante,
    opcionaisSolicitante,
    reservadosRegulacaoExecutante
  };
}

const MARGEM_X_CAIXA_APAC = 3;
const MARGEM_TOPO_CAIXA_APAC = 4.2;
const MARGEM_BASE_CAIXA_APAC = 1.2;

/** Área útil de uma caixa da APAC: o rótulo do campo fica sobre a borda de cima. */
const naCaixa = ([x0, y0, x1, y1]: Caixa): Caixa => [
  x0 + MARGEM_X_CAIXA_APAC,
  y0 + MARGEM_TOPO_CAIXA_APAC,
  x1 - MARGEM_X_CAIXA_APAC,
  y1 - MARGEM_BASE_CAIXA_APAC
];

const passos = (inicio: number, passo: number, quantidade: number): number[] =>
  Array.from({ length: quantidade + 1 }, (_, i) => Math.round((inicio + passo * i) * 10) / 10);

const APAC = {
  cnes: [455.6, 470.0, 484.4, 499.0, 513.4, 527.8, 542.2, 556.7],
  cns: [33.6, 50.8, 68.2, 85.8, 103.2, 120.7, 138.1, 155.8, 173.2, 190.7, 208.1, 225.7, 243.1, 260.6, 278.2, 296.2],
  ddd: [400.6, 416.2, 431.6],
  telefone: [431.6, 447.2, 462.7, 478.3, 493.9, 509.4, 525.0, 540.5, 556.1],
  ibge: passos(355.0, 11.0, 7),
  uf: [432.0, 448.6, 465.1],
  cep: [465.1, 477.0, 488.0, 499.1, 510.2, 521.3, 533.2, 544.2, 556.1],
  procedimento: passos(33.6, 17.75, 10),
  linhasSecundarias: [
    { campos: ['21', '22', '23'] as const, yCaixa: [330.0, 350.0] as const, yPente: [336.0, 350.0] as const },
    { campos: ['24', '25', '26'] as const, yCaixa: [355.5, 375.5] as const, yPente: [361.5, 375.5] as const },
    { campos: ['27', '28', '29'] as const, yCaixa: [381.0, 401.0] as const, yPente: [387.0, 401.0] as const },
    { campos: ['30', '31', '32'] as const, yCaixa: [406.5, 426.5] as const, yPente: [412.5, 426.5] as const },
    { campos: ['33', '34', '35'] as const, yCaixa: [432.0, 452.0] as const, yPente: [438.0, 452.0] as const }
  ],
  documento: [145.2, 160.7, 176.3, 191.8, 207.2, 222.7, 238.2, 253.8, 269.3, 284.6, 300.2, 315.7, 331.3, 346.8, 362.2, 378.5]
};

function montarTelefoneApac(campo: string, y0: number, y1: number, valorBruto?: string): CampoDoFormulario[] {
  const tel = partesDoTelefone(valorBruto);
  if (!tel.ddd && !tel.numero) return [];
  return tel.numero.length <= 8
    ? [...pente(campo, APAC.ddd, y0, y1, tel.ddd), ...pente(campo, APAC.telefone, y0, y1, tel.numero)]
    : [
        ...pente(campo, APAC.ddd, y0, y1, tel.ddd),
        ...texto(campo, [433.0, y0 + 0.1, 555.0, y1 - 0.4], tel.numero, { centralizado: true })
      ];
}

function montarApac(d: SusFilledFormData, emissao: Date): CampoDoFormulario[] {
  const nascimento = partesDaData(d.patientBirthDate);
  const cpfMedico = soDigitos(d.doctorCpf);
  const cnsMedico = soDigitos(d.doctorCns);
  const documentoMedico = cpfMedico.length === 11 ? 'cpf' : cnsMedico.length === 15 ? 'cns' : '';
  const endereco = [d.patientAddress?.trim(), d.patientNeighborhood?.trim()].filter(Boolean).join(', ');
  const secundarios = (d.apacSecondaryProcedures || []).slice(0, 5);

  return [
    // Estabelecimento solicitante (1–2)
    ...texto('1', naCaixa([33.6, 88.1, 450.0, 106.0]), d.doctorClinicName),
    ...pente('2', APAC.cnes, 92.5, 106.0, soDigitos(d.doctorCnes)),

    // Paciente (3–17)
    ...texto('3', naCaixa([33.6, 128.5, 467.2, 146.3]), d.patientName),
    ...texto('4', naCaixa([471.5, 128.5, 556.7, 146.3]), d.patientChartNumber, { centralizado: true }),
    ...pente('5', APAC.cns, 156.0, 169.6, soDigitos(d.patientCns)),
    ...(nascimento
      ? dataEmTresPartes('6', nascimento, [[305.5, 156.5, 326.5, 168.5], [330.0, 156.5, 349.5, 168.5], [353.0, 156.5, 389.0, 168.5]])
      : texto('6', naCaixa([303.5, 151.8, 390.0, 169.6]), d.patientBirthDate)),
    ...marca('7', [415.4, 155.2, 427.3, 165.6], d.patientSex === 'M'),
    ...marca('7', [472.7, 155.2, 483.4, 165.6], d.patientSex === 'F'),
    ...texto('8', naCaixa([494.6, 150.7, 556.7, 168.5]), ROTULO_RACA_COR[d.patientRaceColor || ''], { centralizado: true }),
    ...texto('9', naCaixa([33.6, 175.1, 396.1, 192.8]), d.patientMotherName),
    // Celular tem 9 dígitos e o impresso só 8 quadrículas: nesse caso o número vai corrido.
    ...montarTelefoneApac('10', 183.5, 192.8, d.patientPhone),
    ...texto('11', naCaixa([33.6, 197.7, 396.1, 215.4]), d.apacResponsibleName),
    ...montarTelefoneApac('12', 206.1, 215.4, d.apacResponsiblePhone),
    ...texto('13', naCaixa([33.6, 220.3, 556.1, 238.0]), endereco),
    ...texto('14', naCaixa([33.6, 244.2, 351.7, 262.0]), d.patientCity),
    ...pente('15', APAC.ibge, 250.0, 262.0, soDigitos(d.patientCityIbgeCode)),
    ...pente('16', APAC.uf, 250.0, 262.0, (d.patientState || '').trim().toUpperCase().slice(0, 2)),
    ...pente('17', APAC.cep, 250.0, 262.0, soDigitos(d.patientCep)),

    // Procedimento principal (18–20)
    ...pente('18', APAC.procedimento, 290.5, 304.6, soDigitos(d.sigtapCode)),
    ...texto('19', naCaixa([214.6, 284.4, 490.0, 304.6]), d.procedureName),
    ...texto('20', naCaixa([494.4, 284.4, 547.8, 304.6]), d.procedureQuantity, { centralizado: true }),

    // Procedimentos secundários opcionais (21–35, até 5 linhas; em branco se não informados)
    ...secundarios.flatMap((proc, i) => {
      const linha = APAC.linhasSecundarias[i];
      if (!linha) return [];
      const [cCod, cNome, cQtde] = linha.campos;
      return [
        ...pente(cCod, APAC.procedimento, linha.yPente[0], linha.yPente[1], soDigitos(proc.sigtapCode)),
        ...texto(cNome, naCaixa([214.6, linha.yCaixa[0], 490.0, linha.yCaixa[1]]), proc.procedureName),
        ...texto(cQtde, naCaixa([494.4, linha.yCaixa[0], 547.8, linha.yCaixa[1]]), proc.quantity, { centralizado: true })
      ];
    }),

    // Justificativa (36–40)
    ...texto('36', naCaixa([33.6, 478.2, 333.4, 500.4]), d.cid10Description),
    ...texto('37', naCaixa([333.4, 478.2, 394.4, 500.4]), d.cid10Code?.toUpperCase(), { centralizado: true }),
    ...texto('38', naCaixa([394.4, 478.2, 468.0, 500.4]), d.cid10Secondary?.toUpperCase(), { centralizado: true }),
    ...texto('39', naCaixa([468.0, 478.2, 556.7, 500.4]), d.cid10AssociatedCauses?.toUpperCase(), { centralizado: true }),
    ...texto('40', naCaixa([33.6, 508.3, 556.7, 589.9]), d.clinicalJustification),

    // Solicitação (41–45; campos 46–55 ficam estritamente reservados à regulação SESAU-RO/SEMUSA e executante)
    ...texto('41', naCaixa([33.6, 616.1, 295.7, 633.8]), d.doctorName),
    ...dataEmTresPartes('42', dataDeEmissao(emissao), [[301.0, 621.5, 320.5, 633.0], [324.0, 621.5, 340.5, 633.0], [344.0, 621.5, 377.5, 633.0]]),
    ...marca('43', [51.6, 645.0, 59.6, 653.6], documentoMedico === 'cns'),
    ...marca('43', [102.6, 645.0, 110.6, 653.6], documentoMedico === 'cpf'),
    ...pente('44', APAC.documento, 644.0, 657.1, documentoMedico === 'cpf' ? cpfMedico : documentoMedico === 'cns' ? cnsMedico : ''),
    // O carimbo traz o nº do conselho; impresso no pé da área, deixa o espaço da assinatura livre.
    ...texto('45', [384.0, 646.5, 554.0, 656.0], registroNoConselho(d), { centralizado: true, noPe: true, tamanhoMaximo: 7.5 })
  ];
}

// ---------------------------------------------------------------------------
// LME — Laudo de Solicitação, Avaliação e Autorização de Medicamento(s) (CEAF)
// ---------------------------------------------------------------------------

/** Linhas do campo 7 (medicamento) e colunas do campo 8 (quantidade do 1º ao 6º mês). */
const LME_LINHAS: Array<[number, number]> = [
  [281.6, 298.2], [300.0, 317.4], [318.4, 335.5], [336.3, 353.3], [354.3, 372.0], [372.9, 391.2]
];
const LME_MESES: Array<[number, number]> = [
  [370.0, 399.5], [400.3, 433.7], [434.3, 465.9], [466.6, 497.2], [497.8, 527.8], [528.5, 560.6]
];

const LME_RACA: Record<string, Caixa> = {
  branca: [44.9, 714.1, 51.8, 723.7],
  amarela: [98.1, 716.8, 105.3, 726.3],
  preta: [45.0, 726.5, 52.0, 736.3],
  indigena: [98.2, 728.9, 105.3, 738.7],
  parda: [45.0, 741.5, 52.1, 751.4]
};

const comVirgula = (valor?: string): string => (valor || '').trim().replace('.', ',');

function montarLme(d: SusFilledFormData, emissao: Date): CampoDoFormulario[] {
  const cpf = soDigitos(d.patientCpf);
  const cns = soDigitos(d.patientCns);
  const documento = cpf.length === 11 ? 'cpf' : cns.length === 15 ? 'cns' : '';
  const medicamentos = medicamentosDaLme(d);

  return [
    ...texto('1', [39.5, 181.5, 203.0, 197.2], soDigitos(d.doctorCnes) || d.doctorCnes),
    ...texto('2', [209.0, 181.5, 555.0, 197.2], d.doctorClinicName),
    ...texto('3', [39.5, 208.0, 465.0, 225.0], d.patientName),
    ...texto('5', [480.5, 211.0, 538.0, 226.0], comVirgula(d.patientWeightKg), { centralizado: true }),
    ...texto('4', [40.0, 234.0, 465.0, 251.0], d.patientMotherName),
    ...texto('6', [481.0, 236.3, 538.5, 251.3], comVirgula(d.patientHeightCm), { centralizado: true }),

    ...medicamentos.flatMap((m, i) => [
      ...texto('7', [60.0, LME_LINHAS[i][0], 367.0, LME_LINHAS[i][1]], m.name),
      ...LME_MESES.flatMap(([x0, x1], mes) =>
        texto('8', [x0 + 1, LME_LINHAS[i][0], x1 - 1, LME_LINHAS[i][1]], m.quantities?.[mes], { centralizado: true })
      )
    ]),

    ...texto('9', [38.0, 405.0, 101.0, 422.8], d.cid10Code?.toUpperCase(), { centralizado: true }),
    ...texto('10', [106.0, 405.0, 558.0, 422.8], d.cid10Description),
    ...texto('11', [40.0, 436.0, 559.0, 490.5], d.clinicalJustification),

    ...marca('12', [45.8, 507.8, 53.2, 517.8], d.lmePreviousTreatment === 'nao'),
    ...marca('12', [87.9, 508.1, 95.4, 517.9], d.lmePreviousTreatment === 'sim'),
    ...texto('12', [146.0, 501.5, 557.0, 521.2], d.lmePreviousTreatment === 'sim' ? d.lmePreviousTreatmentReport : ''),

    ...marca('13', [46.3, 566.3, 54.2, 576.2], d.lmeIncapable === 'nao'),
    ...marca('13', [84.0, 565.8, 91.6, 575.7], d.lmeIncapable === 'sim'),
    ...texto('13', [312.0, 563.0, 558.0, 580.0], d.lmeIncapable === 'sim' ? d.lmeResponsibleName : '', { noPe: true }),

    ...texto('14', [38.0, 610.0, 389.0, 626.2], d.doctorName),
    ...texto('15', [38.5, 639.0, 287.5, 655.8], soDigitos(d.doctorCns)),
    ...texto('16', [294.0, 639.0, 372.5, 655.2], dataDeEmissao(emissao).join('/'), { centralizado: true }),
    ...texto('17', [400.0, 646.0, 556.0, 655.5], registroNoConselho(d), { centralizado: true, noPe: true, tamanhoMaximo: 7.5 }),

    ...(d.patientRaceColor && LME_RACA[d.patientRaceColor] ? marca('19', LME_RACA[d.patientRaceColor], true) : []),
    ...texto('19', [198.0, 721.0, 368.0, 736.5], d.patientRaceColor === 'indigena' ? d.patientEthnicity : '', { noPe: true }),
    ...texto('20', [383.0, 715.0, 558.5, 732.0], d.patientPhone),
    ...marca('21', [44.8, 767.7, 52.2, 777.1], documento === 'cpf'),
    ...marca('21', [88.0, 767.3, 95.3, 777.2], documento === 'cns'),
    ...texto('21', [179.0, 762.5, 371.0, 782.5], documento === 'cpf' ? cpf : documento === 'cns' ? cns : ''),
    ...texto('22', [41.0, 790.0, 372.0, 805.0], d.patientEmail)
  ];
}

export const FORMULARIOS_OFICIAIS_SUS: FormularioOficial[] = [
  {
    id: 'apac_principal',
    titulo: 'Laudo para Solicitação/Autorização de Procedimento Ambulatorial',
    imagem: '/formularios-sus/apac-laudo.png',
    pagina: [595, 842],
    fonte: {
      orgao: 'Ministério da Saúde (SIA/SUS) — modelo nacional de 55 campos, cópia publicada pela SES/RS',
      url: SUS_OFFICIAL_FORM_URLS.apacLaudoPrincipal,
      conferidoEm: '2026-10-11'
    },
    montar: montarApac
  },
  {
    id: 'lme_medicamentos',
    titulo: 'Laudo de Solicitação, Avaliação e Autorização de Medicamento(s) — LME',
    imagem: '/formularios-sus/lme.png',
    pagina: [595.3, 841.9],
    fonte: {
      orgao: 'Ministério da Saúde — DAF/SECTICS (Componente Especializado da Assistência Farmacêutica)',
      url: SUS_OFFICIAL_FORM_URLS.lmeMedicamentos,
      conferidoEm: '2026-10-11'
    },
    montar: montarLme
  }
];

export function formularioOficialDe(id: SusDocumentId): FormularioOficial | undefined {
  return FORMULARIOS_OFICIAIS_SUS.find((f) => f.id === id);
}

/**
 * Números dos campos cujo texto não coube na caixa do impresso (saem cortados,
 * com "[…]"). A tela usa isto para avisar o médico antes de emitir.
 */
export function camposSemEspaco(formulario: FormularioOficial, dados: SusFilledFormData, emissao: Date = new Date()): string[] {
  const semEspaco = formulario.montar(dados, emissao).flatMap((campo) => {
    if (campo.tipo !== 'texto') return [];
    const [x0, y0, x1, y1] = campo.caixa;
    return ajustarTexto(campo.valor, x1 - x0, y1 - y0, { max: campo.tamanhoMaximo }).cabe ? [] : [campo.campo];
  });
  return Array.from(new Set(semEspaco));
}
