import { PathologyProtocol } from '../types';

/**
 * Decks de patologias comuns no Brasil com tratamento de 1ª linha.
 * Doses/posologias de referência conforme protocolos do Ministério da Saúde
 * (PCDT e manuais oficiais) e diretrizes das sociedades de especialidade.
 * São REFERÊNCIAS de apoio — a conduta final é sempre do médico assistente.
 *
 * Quando a medicação existe em PEDIATRIC_MEDICATIONS, use `pediatricMedId`
 * com o id EXATO do catálogo para habilitar o cálculo de dose por peso.
 */
export const PATHOLOGY_PROTOCOLS: PathologyProtocol[] = [
  {
    id: 'geca',
    name: 'GECA — Gastroenterocolite Aguda',
    category: 'Gastrointestinal',
    firstLineSummary: 'Hidratação oral com SRO em volume proporcional às perdas + antiemético se vômitos persistentes. Manter alimentação precoce.',
    pediatricRelevant: true,
    clinicalWarning: 'Antibióticos NÃO são rotineiros na GECA viral. Reavaliar se desidratação moderada/grave, sangue nas fezes ou vômitos incoercíveis.',
    reference: 'Protocolos SBP / Ministério da Saúde — Gastroenterite aguda.',
    medications: [
      {
        name: 'Sais de Reidratação Oral (SRO)',
        presentation: 'Envelope para diluição em 1 litro de água potável',
        route: 'Oral',
        quantity: '10 envelopes',
        posology: 'Oferecer livremente após cada evacuação ou vômito (~10 mL/kg por perda), em pequenos goles frequentes',
        frequencyText: 'após cada evacuação ou vômito, em goles frequentes',
        scheduleInterval: 'S.O.S',
        instructions: 'Diluir cada envelope em exatamente 1 litro de água filtrada ou fervida. Oferecer em goles pequenos e frequentes, mantendo enquanto houver perdas. Não adicionar açúcar nem sal.'
      },
      {
        pediatricMedId: 'ondansetrona-solucao',
        name: 'Ondansetrona Solução Oral',
        presentation: '0,8 mg/mL (4 mg/5 mL)',
        route: 'Oral',
        quantity: '1 frasco',
        posology: '0,15 mg/kg/dose de 8/8h se náuseas ou vômitos persistentes (máx 8 mg/dose)',
        frequencyText: 'de 8 em 8 horas se náuseas ou vômitos',
        scheduleInterval: 'S.O.S',
        durationDays: 2
      }
    ]
  },
  {
    id: 'dengue-grupo-a-ambulatorial',
    name: 'Dengue (Grupo A — Ambulatorial)',
    category: 'Infectológica',
    firstLineSummary: 'Hidratação oral guiada por peso (1/3 SRO + 2/3 líquidos caseiros) + sintomáticos APENAS com dipirona ou paracetamol. Retorno diário e orientação de sinais de alarme.',
    pediatricRelevant: true,
    clinicalWarning: 'PROIBIDO AAS e AINEs (ibuprofeno, nimesulida, cetoprofeno, diclofenaco) — risco hemorrágico. Expansão volêmica dos Grupos C e D no deck de urgência abaixo.',
    reference: 'Diretrizes de manejo da dengue — Ministério da Saúde.',
    medications: [
      {
        pediatricMedId: 'dipirona-gotas',
        name: 'Dipirona Gotas',
        presentation: '500 mg/mL (1 gota = 25 mg)',
        route: 'Oral',
        quantity: '1 frasco',
        posology: '20 mg/kg/dose (~1 gota/kg) de 6/6h se dor ou febre (máx 1000 mg/dose)',
        frequencyText: 'de 6 em 6 horas se dor ou febre',
        scheduleInterval: 'S.O.S',
        durationDays: 5
      },
      {
        name: 'Dipirona sódica',
        presentation: '500 mg comprimido',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: '500 a 1000 mg de 6/6h se dor ou febre (máx 4 g/dia) — adulto',
        frequencyText: 'de 6 em 6 horas se dor ou febre',
        scheduleInterval: 'S.O.S',
        durationDays: 5
      }
    ]
  },
  {
    id: 'pac',
    name: 'PAC — Pneumonia Adquirida na Comunidade',
    category: 'Infectológica',
    firstLineSummary: 'Amoxicilina oral (altas doses na criança, por 7 a 10 dias; 500 mg 8/8h por 7 dias no adulto ambulatorial sem comorbidades). Considerar macrolídeo se suspeita de germe atípico.',
    pediatricRelevant: true,
    clinicalWarning: 'Estratificar gravidade (CRB-65 / PSI / CURB-65): internar se hipotensão, confusão mental, SatO2 < 90% ou comorbidades graves descompensadas.',
    reference: 'Diretrizes Brasileiras de PAC (SBPT) e protocolos do Ministério da Saúde.',
    medications: [
      {
        pediatricMedId: 'amoxicilina-250-altas-doses',
        name: 'Amoxicilina Susp 250 mg/5 mL (Altas Doses)',
        presentation: '50 mg/mL (250 mg/5 mL)',
        route: 'Oral',
        quantity: '2 frascos',
        posology: '90 mg/kg/dia divididos em 3 tomadas de 8/8h por 10 dias (máx 1000 mg/dose) — pediatria',
        frequencyText: 'de 8 em 8 horas por 10 dias',
        scheduleInterval: '8/8h',
        durationDays: 10
      },
      {
        name: 'Amoxicilina',
        presentation: '500 mg comprimido',
        route: 'Oral',
        quantity: '21 comprimidos',
        posology: '500 mg de 8/8h por 7 dias — adulto ambulatorial',
        frequencyText: 'de 8 em 8 horas por 7 dias',
        scheduleInterval: '8/8h',
        durationDays: 7
      }
    ]
  },
  {
    id: 'itu-cistite',
    name: 'ITU — Cistite Aguda Não Complicada',
    category: 'Infectológica',
    firstLineSummary: 'Fosfomicina trometamol 3 g em dose única (1ª linha) ou nitrofurantoína 100 mg de 12/12h por 5 a 7 dias, em mulheres adultas.',
    pediatricRelevant: false,
    clinicalWarning: 'Colher urocultura ANTES do tratamento em gestantes, homens e suspeita de pielonefrite (febre + dor lombar). Não usar fosfomicina em pielonefrite.',
    reference: 'PCDT ITU / Diretrizes SBU (adaptadas das diretrizes IDSA).',
    medications: [
      {
        name: 'Fosfomicina trometamol',
        presentation: '3 g sachê',
        route: 'Oral',
        quantity: '1 sachê',
        posology: '3 g em dose única, à noite, após esvaziar a bexiga',
        frequencyText: 'dose única',
        scheduleInterval: 'Dose Única',
        durationDays: 1,
        instructions: 'Dissolver todo o conteúdo do sachê em meio copo de água e ingerir à noite, preferencialmente após esvaziar a bexiga.'
      },
      {
        name: 'Nitrofurantoína',
        presentation: '100 mg comprimido',
        route: 'Oral',
        quantity: '14 comprimidos',
        posology: '100 mg de 12/12h por 5 a 7 dias',
        frequencyText: 'de 12 em 12 horas por 5 a 7 dias',
        scheduleInterval: '12/12h',
        durationDays: 7
      }
    ]
  },
  {
    id: 'has',
    name: 'HAS — Hipertensão Arterial Sistêmica (Estágio 1 a 2)',
    category: 'Cardiovascular',
    firstLineSummary: 'Monoterapia ou terapia combinada em baixas doses (BRA/IECA + BCC ou Tiazídico). Alvo de PA < 130/80 mmHg na maioria dos pacientes.',
    pediatricRelevant: false,
    clinicalWarning: 'Evitar associação de IECA + BRA (risco de hipercalemia e piora renal aguda). Monitorar edema maleolar com anlodipino e eletrólitos/ácido úrico com diuréticos. Contraindicados na gestação.',
    reference: 'Diretrizes Brasileiras de Hipertensão Arterial (SBH 2020).',
    medications: [
      {
        name: 'Losartana potássica',
        presentation: '50 mg comprimido (marcas: Cozaar, Aradois)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã (pode titular até 100 mg/dia em dose única ou 12/12h)',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Besilato de anlodipino',
        presentation: '5 mg comprimido (marcas: Norvasc, Pressat)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã (titular até 10 mg/dia conforme meta de PA)',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Clortalidona',
        presentation: '12,5 mg a 25 mg comprimido (marca: Higroton)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      }
    ]
  },
  {
    id: 'dm2',
    name: 'DM2 — Diabetes Mellitus Tipo 2 (manejo inicial e proteção cardiorrenal)',
    category: 'Endocrinológica',
    firstLineSummary: 'Mudança de estilo de vida + Metformina. Adicionar iSGLT2 ou análogo de GLP-1 se alto risco cardiovascular, insuficiência cardíaca ou DRC.',
    pediatricRelevant: false,
    clinicalWarning: 'Suspender iSGLT2 em dias de cirurgia eletiva ou jejum prolongado (risco de cetoacidose euglicêmica). Suspender Metformina se TFGe < 30 mL/min/1,73m².',
    reference: 'Diretrizes SBD / PCDT DM2 — Ministério da Saúde.',
    medications: [
      {
        name: 'Cloridrato de metformina XR',
        presentation: '500 mg ou 750 mg comprimido de liberação prolongada (marca: Glifage XR)',
        route: 'Oral',
        quantity: '60 comprimidos',
        posology: 'Iniciar com 500 mg VO no jantar; titular semanalmente até 1.500 a 2.000 mg/dia junto às refeições',
        frequencyText: '1x ao dia no jantar (titulação semanal)',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Dapagliflozina',
        presentation: '10 mg comprimido (marca: Forxiga)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã, independente das refeições',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Gliclazida MR',
        presentation: '30 mg ou 60 mg comprimido de liberação modificada (marca: Diamicron MR)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Iniciar com 30 mg VO no café da manhã (máximo 120 mg/dia)',
        frequencyText: '1x ao dia no café da manhã',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      }
    ]
  },
  {
    id: 'candidiase-vulvovaginal',
    name: 'Candidíase Vulvovaginal',
    category: 'Ginecológica',
    firstLineSummary: 'Fluconazol 150 mg VO em dose única; pode associar nistatina creme vaginal à noite por 14 dias.',
    pediatricRelevant: false,
    clinicalWarning: 'Evitar fluconazol ORAL na gestação (preferir nistatina vaginal). Investigar DM2 em casos recorrentes (≥ 4 episódios/ano).',
    reference: 'PCDT Infecções Sexualmente Transmissíveis — Ministério da Saúde.',
    medications: [
      {
        name: 'Fluconazol',
        presentation: '150 mg cápsula',
        route: 'Oral',
        quantity: '1 cápsula',
        posology: '150 mg em dose única',
        frequencyText: 'dose única',
        scheduleInterval: 'Dose Única',
        durationDays: 1
      },
      {
        name: 'Nistatina',
        presentation: 'Creme vaginal 25.000 UI/g (60 g) com aplicadores',
        route: 'Tópica',
        quantity: '1 bisnaga',
        posology: '1 aplicador (5 g) por via vaginal, à noite, por 14 dias',
        frequencyText: '1x ao dia à noite por 14 dias',
        scheduleInterval: '24/24h',
        durationDays: 14
      }
    ]
  },
  {
    id: 'malaria',
    name: 'Malária (não complicada) — esquemas por espécie',
    category: 'Infectológica',
    firstLineSummary: 'Confirmação por gota espessa/TDR define a espécie: P. vivax com cloroquina + primaquina (ou tafenoquina se G6PD ≥ 6,1 UI/gHb e > 16 anos); P. falciparum com ACT (artemeter+lumefantrina) + primaquina gametocitocida em dose única no D1.',
    pediatricRelevant: true,
    clinicalWarning: 'Primaquina e Tafenoquina são ABSOLUTAMENTE CONTRAINDICADAS em gestantes, lactantes de menores de 1 mês e deficiência grave de G6PD (risco de crise hemolítica grave). Gestante: cloroquina semanal supressiva no vivax; quinina + clindamicina no 1º trimestre do falciparum. Notificação compulsória.',
    reference: 'Manual de Tratamento da Malária no Brasil — Ministério da Saúde (SVSA).',
    medications: [
      {
        name: 'Esquema P. vivax — Cloroquina (3 dias) + Primaquina (7 dias)',
        presentation: 'Cloroquina 150 mg base (comprimido) + Primaquina 15 mg base (comprimido)',
        route: 'Oral',
        quantity: 'Conforme esquema (adulto 50 a 70 kg)',
        posology: 'D1: 4 cp cloroquina (600 mg) + 2 cp primaquina (30 mg). D2 e D3: 3 cp cloroquina (450 mg) + 2 cp primaquina (30 mg). D4 ao D7: 2 cp primaquina (30 mg/dia) com refeição',
        frequencyText: 'cloroquina 1x/dia por 3 dias; primaquina diária por 7 dias',
        scheduleInterval: 'Uso Contínuo',
        instructions: 'Definir esquema conforme espécie, peso e atividade de G6PD, seguindo o Manual de Tratamento da Malária no Brasil (MS/SVSA). Notificação imediata obrigatória (SINAN).'
      },
      {
        name: 'Esquema P. falciparum — Artemeter 20mg + Lumefantrina 120mg (ACT, Coartem)',
        presentation: 'Comprimido combinado artemeter/lumefantrina 20/120 mg',
        route: 'Oral',
        quantity: '24 comprimidos (adulto ≥ 35 kg, 3 dias)',
        posology: 'D1: 4 cp iniciais + 4 cp após 8 horas (+ primaquina 45 mg dose única para bloqueio de transmissão). D2 e D3: 4 cp de 12/12h (total 24 cp em 3 dias)',
        frequencyText: 'total de 24 comprimidos em 3 dias, com alimento gorduroso',
        scheduleInterval: 'Uso Contínuo'
      },
      {
        name: 'Alternativa falciparum — Artesunato 100mg + Mefloquina 200mg (ASMQ)',
        presentation: 'Comprimido combinado artesunato/mefloquina 100/200 mg',
        route: 'Oral',
        quantity: '6 comprimidos (3 dias)',
        posology: 'Tomar 2 comprimidos VO 1x/dia por 3 dias consecutivos',
        frequencyText: '1x ao dia por 3 dias',
        scheduleInterval: 'Uso Contínuo'
      },
      {
        pediatricMedId: 'dipirona-gotas',
        name: 'Dipirona Gotas',
        presentation: '500 mg/mL (1 gota = 25 mg)',
        route: 'Oral',
        quantity: '1 frasco',
        posology: '20 mg/kg/dose (~1 gota/kg) de 6/6h se febre (máx 1000 mg/dose)',
        frequencyText: 'de 6 em 6 horas se febre',
        scheduleInterval: 'S.O.S',
        durationDays: 5
      }
    ]
  },

  {
    id: 'dislipidemia',
    name: 'Dislipidemia — Prevenção Primária e Secundária (Alto Risco)',
    category: 'Cardiovascular',
    firstLineSummary: 'Estatina de alta potência para redução de LDL ≥ 50%. Associar ezetimiba se não atingir a meta.',
    pediatricRelevant: false,
    clinicalWarning: 'Orientar relato de mialgia intensa, urina escura ou fadiga (rastreio de miopatia/rabdomiólise). Monitorar transaminases hepáticas basais.',
    reference: 'Diretrizes Brasileiras de Dislipidemia (SBC / Departamento de Aterosclerose).',
    medications: [
      {
        name: 'Atorvastatina cálcica',
        presentation: '20 mg ou 40 mg comprimido (marcas: Lipitor, Citalor)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia à noite (titular até 80 mg/dia em pós-SCA/alto risco)',
        frequencyText: '1x ao dia à noite',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Rosuvastatina cálcica',
        presentation: '10 mg ou 20 mg comprimido (marcas: Crestor, Vivacor)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia em qualquer horário (titular até 40 mg/dia)',
        frequencyText: '1x ao dia',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      },
      {
        name: 'Ezetimiba',
        presentation: '10 mg comprimido (marca: Zetia)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia, isolado ou em combinação com estatina',
        frequencyText: '1x ao dia',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      }
    ]
  },
  {
    id: 'asma',
    name: 'Asma — Crise Leve a Moderada e Manutenção Inicial',
    category: 'Pneumologia',
    firstLineSummary: 'Resgate com SABA associado ou não a corticoide inalatório. Corticosteroide oral por curto prazo se exacerbação.',
    pediatricRelevant: true,
    clinicalWarning: 'Enxaguar a boca após corticoide inalatório para prevenir candidíase oral e disfonia. Sempre prescrever com espaçador valvulado na faixa pediátrica.',
    reference: 'Iniciativa Global para a Asma (GINA) / Protocolos SBP.',
    medications: [
      {
        name: 'Sulfato de salbutamol spray',
        presentation: '100 mcg/jato, aerossol dosimetrado com espaçador (marca: Aerolin)',
        route: 'Inalatória',
        quantity: '1 frasco spray (200 doses) + espaçador',
        posology: 'Pediátrico: 2 a 4 jatos com espaçador a cada 20 min na 1ª hora se crise; manutenção 2 jatos de 4/4h a 6/6h se sintomas. Adulto: 2 a 4 jatos',
        frequencyText: 'S.O.S. (resgate)',
        scheduleInterval: 'S.O.S'
      },
      {
        name: 'Budesonida suspensão / spray',
        presentation: '200 mcg/dose (spray ou cápsula inalatória) ou 0,25 mg/mL (flaconete para nebulização) (marcas: Busonid, Pulmicort)',
        route: 'Inalatória',
        quantity: '1 frasco / 1 caixa de flaconetes',
        posology: 'Pediátrico: 200 a 400 mcg/dia divididos em 12/12h. Adulto: 400 a 800 mcg/dia divididos em 12/12h',
        frequencyText: 'de 12 em 12 horas (manutenção)',
        scheduleInterval: '12/12h',
        isContinuous: true
      },
      {
        name: 'Prednisolona solução oral',
        presentation: '3 mg/mL (marca: Prelone)',
        route: 'Oral',
        quantity: '1 frasco',
        posology: '1 a 2 mg/kg/dia VO (máx 40 mg/dia) pela manhã, por 3 a 5 dias, sem necessidade de desmame gradual',
        frequencyText: '1x ao dia pela manhã por 3 a 5 dias',
        scheduleInterval: '24/24h',
        durationDays: 5
      }
    ]
  },
  {
    id: 'asma-gina-manutencao',
    name: 'Asma — Manutenção e Resgate (Etapas GINA)',
    category: 'Pneumologia',
    firstLineSummary: 'Terapia anti-inflamatória contínua com corticoide inalatório (CI) isolado ou associado a LABA (formoterol) para manutenção e/ou alívio.',
    pediatricRelevant: true,
    clinicalWarning: 'O uso exclusivo de SABA sem corticoide inalatório está formalmente desaconselhado (aumenta risco de exacerbação grave e óbito). Sempre orientar higiene oral pós-inalação.',
    reference: 'Iniciativa Global para a Asma (GINA) — etapas de tratamento.',
    medications: [
      {
        name: 'Budesonida + Fumarato de Formoterol',
        presentation: '200/6 mcg ou 400/12 mcg pó inalatório ou spray dosimetrado (marcas: Symbicort, Alenia, Foraseq)',
        route: 'Inalatória',
        quantity: '1 frasco / 1 caixa (60 cápsulas)',
        posology: 'Adultos: 1 a 2 inalações 12/12h (manutenção) e 1 inalação adicional de resgate se sintomas (esquema SMART)',
        frequencyText: 'de 12 em 12 horas + resgate se sintomas',
        scheduleInterval: '12/12h',
        isContinuous: true
      },
      {
        name: 'Dipropionato de Beclometasona',
        presentation: '50 mcg, 200 mcg ou 250 mcg spray aerossol (marca: Clenil HFA)',
        route: 'Inalatória',
        quantity: '1 frasco spray (200 doses)',
        posology: 'Pediátrico: 100 a 200 mcg/dia divididos 12/12h com espaçador. Adulto: 200 a 400 mcg de 12/12h',
        frequencyText: 'de 12 em 12 horas',
        scheduleInterval: '12/12h',
        isContinuous: true
      },
      {
        name: 'Sulfato de salbutamol spray (SABA resgate)',
        presentation: '100 mcg/jato aerossol (marca: Aerolin)',
        route: 'Inalatória',
        quantity: '1 frasco spray (200 doses) + espaçador',
        posology: '2 a 4 jatos com espaçador de 4/4h a 6/6h durante crises leves/moderadas',
        frequencyText: 'S.O.S. (resgate)',
        scheduleInterval: 'S.O.S'
      }
    ]
  },
  {
    id: 'drge-dispepsia',
    name: 'DRGE, Dispepsia Funcional e Úlcera Péptica',
    category: 'Gastrointestinal',
    firstLineSummary: 'Inibidor de bomba de prótons em jejum por 4 a 8 semanas + modificações dietéticas e posturais.',
    pediatricRelevant: false,
    clinicalWarning: 'Investigar sinais de alarme antes de manter IBP prolongado: disfagia, perda ponderal inexplicada, anemia, hematêmese/melena ou início > 45-50 anos (indicação de endoscopia digestiva alta).',
    reference: 'Consenso Brasileiro de DRGE / FBG.',
    medications: [
      {
        name: 'Pantoprazol',
        presentation: '40 mg comprimido gastrorresistente (marca: Pantozol)',
        route: 'Oral',
        quantity: '28 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã, em jejum (30 a 60 minutos antes do café)',
        frequencyText: '1x ao dia em jejum por 4 a 8 semanas',
        scheduleInterval: '24/24h',
        durationDays: 28
      },
      {
        name: 'Esomeprazol magnésico',
        presentation: '20 mg ou 40 mg comprimido (marca: Nexium)',
        route: 'Oral',
        quantity: '28 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia pela manhã em jejum',
        frequencyText: '1x ao dia em jejum',
        scheduleInterval: '24/24h',
        durationDays: 28
      },
      {
        name: 'Domperidona',
        presentation: '10 mg comprimido (marca: Motilium)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Tomar 1 comprimido VO 15 a 30 minutos antes das principais refeições (máx 30 mg/dia, uso por curto período)',
        frequencyText: '15 a 30 min antes das refeições',
        scheduleInterval: '8/8h',
        durationDays: 7
      }
    ]
  },
  {
    id: 'nausea-vomitos',
    name: 'Náuseas e Vômitos (Antieméticos)',
    category: 'Gastrointestinal',
    firstLineSummary: 'Escolha baseada no perfil e causa: procinéticos (D2) para lentidão gástrica/refluxo; antagonistas 5-HT3 para vômitos incoercíveis ou pós-operatório/quimioterapia.',
    pediatricRelevant: true,
    clinicalWarning: 'Metoclopramida apresenta alto risco de sintomas extrapiramidais e discinesia tardia (evitar em crianças e idosos). Ondansetrona pode prolongar o intervalo QTc em doses elevadas e induz constipação intestinal.',
    reference: 'Protocolos SBP / UptoDate (antieméticos).',
    medications: [
      {
        name: 'Cloridrato de ondansetrona',
        presentation: '4 mg ou 8 mg comprimido orodispersível / 2 mg/mL injetável IV/IM (marcas: Vonau Flash, Zofran)',
        route: 'Oral',
        quantity: '6 comprimidos',
        posology: 'Adulto: 4 a 8 mg VO ou IV de 8/8h conforme náuseas (máximo 16 a 24 mg/dia)',
        frequencyText: 'de 8 em 8 horas se náuseas',
        scheduleInterval: '8/8h',
        durationDays: 3
      },
      {
        name: 'Cloridrato de metoclopramida',
        presentation: '10 mg comprimido / 5 mg/mL gotas / 10 mg/2 mL injetável (marca: Plasil)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Adulto: 10 mg VO, IM ou IV lento (mínimo 3 min) até 8/8h, 30 minutos antes das refeições (máx 30 mg/dia; uso máximo 5 dias)',
        frequencyText: 'até 8/8h, 30 min antes das refeições',
        scheduleInterval: '8/8h',
        durationDays: 5
      },
      {
        name: 'Dimenidrinato + Piridoxina (B6)',
        presentation: '50 mg + 10 mg comprimido / 25 mg/mL gotas (marca: Dramin B6)',
        route: 'Oral',
        quantity: '1 caixa (10 comprimidos)',
        posology: 'Adulto: 1 comprimido VO a cada 6 a 8 horas (máx 400 mg/dia de dimenidrinato). Indicado para cinetose e êmese gravídica',
        frequencyText: 'de 6 a 8 horas se náuseas',
        scheduleInterval: 'S.O.S'
      }
    ]
  },
  {
    id: 'dor-aguda',
    name: 'Dor Aguda Moderada / Crise Álgica Musculoesquelética',
    category: 'Ortopedia',
    firstLineSummary: 'Analgesia multimodal de resgate por curto período; evitar AINE prolongado.',
    pediatricRelevant: false,
    clinicalWarning: 'Cetorolaco é contraindicado em úlcera péptica ativa, sangramento gastrointestinal, DRC moderada/grave e hipovolemia. Risco renal e hemorrágico aumentado em idosos.',
    reference: 'Protocolos de analgesia multimodal (SBA / AMIB).',
    medications: [
      {
        name: 'Trometamol de cetorolaco sublingual',
        presentation: '10 mg comprimido sublingual (marcas: Toragesic, Deocil SL)',
        route: 'Sublingual',
        quantity: '10 comprimidos',
        posology: 'Colocar 1 comprimido sob a língua de 8/8h se dor intensa (tempo máximo de uso: 5 dias)',
        frequencyText: 'de 8 em 8 horas se dor intensa, por no máximo 5 dias',
        scheduleInterval: '8/8h',
        durationDays: 5
      },
      {
        name: 'Dipirona monoidratada',
        presentation: '1.000 mg comprimido (marca: Novalgina)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Tomar 1 comprimido VO de 6/6h se dor ou febre (máx 4 g/dia)',
        frequencyText: 'de 6 em 6 horas se dor',
        scheduleInterval: '6/6h',
        durationDays: 5
      },
      {
        name: 'Codeína + Paracetamol',
        presentation: '30 mg + 500 mg comprimido (marcas: Tylex, Paco)',
        route: 'Oral',
        quantity: '12 comprimidos',
        posology: 'Tomar 1 comprimido VO de 6/6h ou 8/8h se dor refratária a analgésicos simples (receituário de controle especial — C1)',
        frequencyText: 'de 6 a 8 horas se dor refratária',
        scheduleInterval: '6/6h',
        durationDays: 3
      }
    ]
  },
  {
    id: 'lombalgia-aguda',
    name: 'Lombalgia Mecânica Aguda',
    category: 'Ortopedia',
    firstLineSummary: 'Descartar red flags (febre, perda ponderal, déficits neurológicos focais, anestesia em sela, retenção urinária). Repouso absoluto no leito é contraindicado — estimular movimentação precoce tolerada + analgesia multimodal e relaxante muscular por curto prazo.',
    pediatricRelevant: false,
    clinicalWarning: 'Evitar AINEs em nefropatas, idosos frágeis, cardiopatas descompensados e portadores de úlcera péptica. Ciclobenzaprina causa sonolência importante e tem ação anticolinérgica (evitar em idosos pelo risco de confusão mental e retenção urinária).',
    reference: 'Diretrizes clínicas de lombalgia (Coluna — SBOT).',
    medications: [
      {
        name: 'Ciclobenzaprina',
        presentation: '5 mg e 10 mg comprimido revestido (marcas: Miosan, Musculare)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Tomar 5 a 10 mg VO à noite ao deitar (ou até 8/8h nos quadros mais espásticos) por no máximo 7 a 10 dias',
        frequencyText: 'à noite ao deitar, por até 7 a 10 dias',
        scheduleInterval: '24/24h',
        durationDays: 10
      },
      {
        name: 'Dipirona monoidratada',
        presentation: '1.000 mg comprimido (marca: Novalgina)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Tomar 1 comprimido VO de 6/6h se dor lombar (máx 4 g/dia)',
        frequencyText: 'de 6 em 6 horas se dor',
        scheduleInterval: '6/6h',
        durationDays: 7
      },
      {
        name: 'Naproxeno',
        presentation: '500 mg comprimido (marca: Flanax)',
        route: 'Oral',
        quantity: '14 comprimidos',
        posology: 'Tomar 1 comprimido VO de 12/12h após as refeições por 5 a 7 dias',
        frequencyText: 'de 12 em 12 horas após as refeições',
        scheduleInterval: '12/12h',
        durationDays: 7
      }
    ]
  },
  {
    id: 'fascite-plantar',
    name: 'Fascite Plantar e Esporão de Calcâneo',
    category: 'Ortopedia',
    firstLineSummary: 'Terapia conservadora é a base: alongamento da fáscia plantar e tríceps sural, calçados com suporte plantar ou calcanheiras de silicone amortecedoras. Medicações apenas para alívio de sintomas agudos.',
    pediatricRelevant: false,
    clinicalWarning: 'O esporão ósseo em si é frequentemente achado radiográfico assintomático; a dor decorre da inflamação da fáscia plantar. Infiltrações locais com corticoides devem ser ponderadas com cautela (risco de ruptura da fáscia e atrofia do coxim adiposo).',
    reference: 'Protocolos de ortopedia e fisiatria (SBOT / ABPMR).',
    medications: [
      {
        name: 'Meloxicam',
        presentation: '15 mg comprimido (marcas: Melocox, Inicox)',
        route: 'Oral',
        quantity: '10 comprimidos',
        posology: 'Tomar 1 comprimido VO 1x/dia junto ao almoço por 7 a 10 dias nas fases de dor inflamatória aguda',
        frequencyText: '1x ao dia junto ao almoço por 7 a 10 dias',
        scheduleInterval: '24/24h',
        durationDays: 10
      },
      {
        name: 'Paracetamol + Tramadol (resgate)',
        presentation: '325 mg + 37,5 mg comprimido (marca: Ultracet)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Tomar 1 a 2 comprimidos VO de 8/8h se dor limitante não controlada com analgésicos simples (uso por tempo limitado)',
        frequencyText: '1 a 2 comprimidos de 8 em 8 horas se dor limitante',
        scheduleInterval: '8/8h',
        durationDays: 5
      },
      {
        name: 'Órtese noturna / calcanheira de silicone amortecedora',
        presentation: 'Par de palmilhas ou calcanheiras com ponto de alívio (marcas: Silicup, Orthopauher)',
        route: 'Tópica',
        quantity: '1 par',
        posology: 'Uso contínuo diário em calçados fechados durante a marcha; associar massagem com bola de tênis ou garrafa de água congelada na planta do pé 2x/dia',
        frequencyText: 'uso contínuo diário',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      }
    ]
  },
  {
    id: 'enxaqueca',
    name: 'Crise de Enxaqueca (Migrânea) — Com ou Sem Aura',
    category: 'Neurologia',
    firstLineSummary: 'Administrar medicação abortiva no início da fase de dor (não durante a aura isolada). Casos leves/moderados: analgésicos/AINEs; moderados/graves ou refratários: triptanos.',
    pediatricRelevant: false,
    clinicalWarning: 'Triptanos são estritamente contraindicados em doença arterial coronariana (DAC), IAM/AVE prévio, vasculopatia periférica e HAS descontrolada (efeito vasoconstritor). Evitar uso por > 10 dias/mês (risco de cefaleia por sobreuso de medicação).',
    reference: 'Diretrizes da Sociedade Brasileira de Cefaleia / Academia Brasileira de Neurologia.',
    medications: [
      {
        name: 'Succinato de sumatriptana',
        presentation: '50 mg comprimido revestido (marcas: Imigran, Sumax)',
        route: 'Oral',
        quantity: '4 comprimidos',
        posology: 'Tomar 1 comprimido VO ao primeiro sinal de cefaleia. Pode repetir 1 dose após 2 horas se alívio parcial ou recorrência (máximo 200 mg/24h)',
        frequencyText: 'ao primeiro sinal de cefaleia, repetir após 2h se necessário',
        scheduleInterval: 'S.O.S'
      },
      {
        name: 'Cetoprofeno',
        presentation: '100 mg cápsula / 150 mg liberação prolongada (marca: Profenid)',
        route: 'Oral',
        quantity: '10 comprimidos',
        posology: 'Tomar 1 comprimido VO logo ao início da crise; repetir a cada 12h se necessário',
        frequencyText: 'ao início da crise, repetir 12/12h se necessário',
        scheduleInterval: 'S.O.S'
      },
      {
        name: 'Cloridrato de naratriptana',
        presentation: '2,5 mg comprimido revestido (marca: Naramig)',
        route: 'Oral',
        quantity: '2 comprimidos',
        posology: 'Tomar 1 comprimido VO ao início da crise. Se necessário, repetir 1 dose após 4 horas (máximo 5 mg/24h)',
        frequencyText: 'ao início da crise, repetir após 4h se necessário',
        scheduleInterval: 'S.O.S'
      }
    ]
  },
  {
    id: 'rinite-urticaria',
    name: 'Rinite Alérgica e Urticária (Anti-histamínicos)',
    category: 'Alergologia',
    firstLineSummary: 'Preferir sempre anti-histamínicos de 2ª geração (não sedantes / menor ação anticolinérgica). 1ª geração reservada para resgate agudo com prurido intenso noturno.',
    pediatricRelevant: true,
    clinicalWarning: 'Anti-histamínicos de 1ª geração causam sonolência acentuada, redução de reflexos e efeitos anticolinérgicos (boca seca, retenção urinária e glaucoma de ângulo fechado).',
    reference: 'Diretrizes ARIA / Asbai (rinite alérgica).',
    medications: [
      {
        name: 'Desloratadina',
        presentation: '5 mg comprimido / 0,5 mg/mL xarope (marcas: Desalex, Sigmaliv)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Adultos e > 12 anos: 5 mg (1 cp ou 10 mL) VO 1x/dia. Crianças 6-11 meses: 1 mg (2 mL); 1-5 anos: 1,25 mg (2,5 mL); 6-11 anos: 2,5 mg (5 mL) 1x/dia',
        frequencyText: '1x ao dia',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Cloridrato de fexofenadina',
        presentation: '120 mg ou 180 mg comprimido revestido (marcas: Allegra, Allexofed)',
        route: 'Oral',
        quantity: '12 comprimidos',
        posology: 'Rinite: 120 mg VO 1x/dia. Urticária crônica espontânea: 180 mg VO 1x/dia',
        frequencyText: '1x ao dia',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Maleato de dexclorfeniramina (1ª geração)',
        presentation: '2 mg comprimido / 0,4 mg/mL solução oral (marca: Polaramine)',
        route: 'Oral',
        quantity: '20 comprimidos',
        posology: 'Adulto: 2 mg VO de 6/6h a 8/8h (máx 12 mg/dia). Pediátrico (> 2 anos): 0,15 mg/kg/dia dividido em 3 a 4 tomadas',
        frequencyText: 'de 6 a 8 horas se prurido noturno intenso',
        scheduleInterval: '8/8h',
        durationDays: 5
      }
    ]
  },
  {
    id: 'dermatite-atopica',
    name: 'Dermatite Atópica e Dermatite de Contato',
    category: 'Dermatologia',
    firstLineSummary: 'Restauração de barreira com emolientes copiosos + corticoide tópico de potência adequada à topografia da lesão, em ciclos curtos.',
    pediatricRelevant: true,
    clinicalWarning: 'Corticoides tópicos de alta potência na face, axilas ou virilhas causam atrofia cutânea rápida, estrias irreversíveis, telangiectasias e dermatite perioral.',
    reference: 'Consenso Brasileiro de Dermatite Atópica (SBD).',
    medications: [
      {
        name: 'Dipropionato de betametasona creme/pomada (alta potência)',
        presentation: '0,5 mg/g (0,05%) tubo 30 g (marca: Diprosone)',
        route: 'Tópica',
        quantity: '1 tubo (30 g)',
        posology: 'Aplicar camada fina nas áreas afetadas (tronco e membros) 1 a 2x/dia por 7 a 14 dias. Não usar na face ou dobras',
        frequencyText: '1 a 2x ao dia por 7 a 14 dias',
        scheduleInterval: '12/12h',
        durationDays: 14
      },
      {
        name: 'Desonida / Valerato de betametasona (potência média/baixa)',
        presentation: 'Desonida 0,05% ou 0,1% creme, tubo 30 g (marcas: Desonol, Betnovate)',
        route: 'Tópica',
        quantity: '1 tubo (30 g)',
        posology: 'Aplicar 1 a 2x/dia em áreas de pele fina, dobras cutâneas ou face, por no máximo 5 a 7 dias',
        frequencyText: '1 a 2x ao dia por no máximo 5 a 7 dias',
        scheduleInterval: '12/12h',
        durationDays: 7
      },
      {
        name: 'Hidratante com ceramidas / ureia 10% (terapia de barreira)',
        presentation: 'Loção ou creme hidratante sem fragrância (marcas: Cetaphil, Cerave, Nutrel)',
        route: 'Tópica',
        quantity: '1 pote / 1 bisnaga',
        posology: 'Aplicar em todo o corpo imediatamente após o banho (pele úmida) 2 a 3x/dia, de uso contínuo',
        frequencyText: '2 a 3x ao dia após o banho, uso contínuo',
        scheduleInterval: 'Uso Contínuo',
        isContinuous: true
      }
    ]
  },
  {
    id: 'antifungicos-sistemicos',
    name: 'Antifúngicos Sistêmicos e Tópicos (Micoses Superficiais e Sistêmicas)',
    category: 'Infectológica',
    firstLineSummary: 'Infecções cutâneas localizadas: tópicos azólicos ou alilaminas. Onicomicoses extensas ou micoses de couro cabeludo: antifúngicos sistêmicos.',
    pediatricRelevant: false,
    clinicalWarning: 'Terbinafina e azólicos orais exigem monitorização de função hepática (risco de hepatotoxicidade). Azólicos orais possuem intensas interações via citocromo P450 (inibidores potentes do CYP3A4).',
    reference: 'Consenso Brasileiro de Micoses Superficiais (SBD).',
    medications: [
      {
        name: 'Fluconazol',
        presentation: '150 mg cápsula (marcas: Zoltec, Flucazol)',
        route: 'Oral',
        quantity: '1 a 4 cápsulas',
        posology: 'Candidíase vulvovaginal não complicada: 150 mg dose única VO. Pitiríase versicolor / Tinea pedis-cruris: 150 mg VO 1x/semana por 2 a 4 semanas',
        frequencyText: 'dose única ou 1x por semana por 2 a 4 semanas',
        scheduleInterval: 'Dose Única'
      },
      {
        name: 'Cloridrato de terbinafina',
        presentation: '250 mg comprimido / 1% creme dermatológico (marca: Lamisil)',
        route: 'Oral',
        quantity: '42 comprimidos',
        posology: 'Onicomicose das mãos: 250 mg VO 1x/dia por 6 semanas. Dos pés: 12 semanas. Tópico: aplicar 1 a 2x/dia por 1 a 2 semanas',
        frequencyText: '1x ao dia por 6 a 12 semanas (onicomicose)',
        scheduleInterval: '24/24h',
        durationDays: 42
      },
      {
        name: 'Itraconazol',
        presentation: '100 mg cápsula (marcas: Sporanox, Itraspor)',
        route: 'Oral',
        quantity: '30 cápsulas',
        posology: '100 a 200 mg VO 1x/dia junto às refeições principais (tempo variável conforme o sítio, 7 a 30 dias)',
        frequencyText: '1 a 2x ao dia junto às refeições',
        scheduleInterval: '24/24h',
        durationDays: 30
      },
      {
        name: 'Nitrato de miconazol creme',
        presentation: '20 mg/g (2%) tubo 28 g (marcas: Vodol, Daktarin)',
        route: 'Tópica',
        quantity: '1 bisnaga (28 g)',
        posology: 'Aplicar fina camada sobre a lesão limpa e seca 2x/dia por 2 a 4 semanas',
        frequencyText: '2x ao dia por 2 a 4 semanas',
        scheduleInterval: '12/12h',
        durationDays: 28
      }
    ]
  },
  {
    id: 'tuberculose',
    name: 'Tuberculose Pulmonar — Esquema Básico Adulto (2RHZE / 4RH)',
    category: 'Infectológica',
    firstLineSummary: 'Esquema de 6 meses sob Tratamento Diretamente Observado (TDO). Dose ajustada por faixa de peso com DFC (dose fixa combinada).',
    pediatricRelevant: false,
    clinicalWarning: 'Notificação compulsória obrigatória. Coletar transaminases, bilirrubinas e sorologias (HIV, hepatites B/C). Orientar coloração alaranjada/avermelhada de urina, suor e lágrimas pela rifampicina. Suspender se icterícia ou transaminases > 3-5x LSN com sintomas.',
    reference: 'Manual de Recomendações para o Controle da Tuberculose no Brasil — Ministério da Saúde.',
    medications: [
      {
        name: 'Fase intensiva (2 meses): 4 em 1 (RHZE)',
        presentation: 'Rifampicina 150 mg + Isoniazida 75 mg + Pirazinamida 400 mg + Etambutol 275 mg (DFC)',
        route: 'Oral',
        quantity: 'Conforme faixa de peso (TDO)',
        posology: 'Tomada única pela manhã, em jejum, por 2 meses (60 doses): 20-35 kg: 2 comprimidos; 36-50 kg: 3; ~50 kg: 4; peso > 70 kg: 5 (protocolo MS)',
        frequencyText: '1x ao dia em jejum, por 2 meses, sob TDO',
        scheduleInterval: '24/24h',
        durationDays: 60
      },
      {
        name: 'Fase de manutenção (4 meses): 2 em 1 (RH)',
        presentation: 'Rifampicina 300 mg + Isoniazida 150 mg (comprimido dose plena DFC)',
        route: 'Oral',
        quantity: 'Conforme faixa de peso (TDO)',
        posology: 'Tomada única pela manhã, em jejum, por 4 meses (120 doses): 20-35 kg: 1 comprimido; 36-50 kg: 2 cp (ou 1 cp 300/150 + 1 cp 150/75); ~50 kg: 2 cp de 300/150 mg (se > 70 kg, associar 1 cp de 150/75 mg)',
        frequencyText: '1x ao dia em jejum, por 4 meses, sob TDO',
        scheduleInterval: '24/24h',
        durationDays: 120
      },
      {
        name: 'Cloridrato de piridoxina (vitamina B6) — adjuvante',
        presentation: '50 mg comprimido',
        route: 'Oral',
        quantity: '180 comprimidos',
        posology: 'Tomar 50 mg VO 1x/dia durante todo o esquema, em gestantes, diabéticos, etilistas ou neuropatas (prevenção de neuropatia periférica pela isoniazida)',
        frequencyText: '1x ao dia durante todo o esquema',
        scheduleInterval: '24/24h',
        durationDays: 180
      }
    ]
  },
  {
    id: 'oma-otite-externa',
    name: 'Otite Média Aguda (OMA) e Otite Externa Aguda',
    category: 'Otorrinolaringologia',
    firstLineSummary: 'Otite média: amoxicilina em altas doses (ou amoxicilina-clavulanato se falha/risco). Otite externa: gotas otológicas tópicas com antibiótico + corticoide.',
    pediatricRelevant: true,
    clinicalWarning: 'Na vigência de perfuração da membrana timpânica, gotas contendo aminoglicosídeos (neomicina/gentamicina) são contraindicadas por ototoxicidade grave. Gotas otológicas não tratam otite média com tímpano íntegro.',
    reference: 'Protocolos SBP / Consenso Brasileiro de Otitas (ABORL).',
    medications: [
      {
        name: 'Amoxicilina + Clavulanato de potássio',
        presentation: 'Suspensão 400 mg + 57 mg/5 mL ou comprimido 875 mg + 125 mg (marcas: Clavulin, Sinot Clav)',
        route: 'Oral',
        quantity: '2 frascos / 1 caixa (14 comprimidos)',
        posology: 'Pediátrico: 80 a 90 mg/kg/dia da base amoxicilina divididos em 12/12h por 7 a 10 dias. Adulto: 875/125 mg VO de 12/12h por 7 a 10 dias',
        frequencyText: 'de 12 em 12 horas por 7 a 10 dias',
        scheduleInterval: '12/12h',
        durationDays: 10
      },
      {
        name: 'Ciprofloxacino + Hidrocortisona solução otológica',
        presentation: '2 mg/mL + 10 mg/mL frasco conta-gotas 10 mL (marcas: Otociriax, Otosynalar)',
        route: 'Otológica',
        quantity: '1 frasco (10 mL)',
        posology: 'Pingar 3 a 4 gotas no conduto auditivo afetado de 8/8h por 7 dias (manter a cabeça inclinada lateralmente por 5 minutos)',
        frequencyText: 'de 8 em 8 horas por 7 dias',
        scheduleInterval: '8/8h',
        durationDays: 7
      },
      {
        name: 'Amoxicilina monoidratada (dose dobrada)',
        presentation: 'Suspensão 250 mg/5 mL ou 500 mg/5 mL (marca: Amoxil)',
        route: 'Oral',
        quantity: '2 frascos',
        posology: '80 a 90 mg/kg/dia divididos a cada 8/8h ou 12/12h por 10 dias (crianças < 2 anos) ou 7 dias (> 2 anos)',
        frequencyText: 'de 8 a 12 horas por 7 a 10 dias',
        scheduleInterval: '8/8h',
        durationDays: 10
      }
    ]
  },
  {
    id: 'rinossinusite-aguda',
    name: 'Rinossinusite Aguda Bacteriana',
    category: 'Otorrinolaringologia',
    firstLineSummary: 'Diferenciar de quadro viral (indicar ATB apenas se sintomas > 10 dias sem melhora, febre alta com secreção purulenta por > 3-4 dias, ou piora súbita após melhora inicial).',
    pediatricRelevant: true,
    clinicalWarning: 'Descongestionantes tópicos nasais vasoconstritores (oximetazolina, nafazolina) não devem ultrapassar 3 a 5 dias de uso consecutivo pelo risco de rinite medicamentosa e efeito rebote. Em alérgicos a penicilinas, opções de resgate incluem claritromicina ou levofloxacino (em adultos).',
    reference: 'Consenso Brasileiro de Rinossinusites (ABORL).',
    medications: [
      {
        name: 'Amoxicilina + Clavulanato de potássio',
        presentation: '875 mg + 125 mg comprimido revestido (marcas: Clavulin, Sigma-Clav)',
        route: 'Oral',
        quantity: '1 caixa (14 comprimidos)',
        posology: 'Tomar 1 comprimido VO de 12/12h por 7 dias, junto às refeições para tolerância gástrica',
        frequencyText: 'de 12 em 12 horas por 7 dias',
        scheduleInterval: '12/12h',
        durationDays: 7
      },
      {
        name: 'Solução salina hipertônica/isotônica para lavagem nasal',
        presentation: 'Soro fisiológico 0,9% ou sachês para lavagem nasal (120 a 240 mL) (marcas: Sinus Wash, Lota, Sorine)',
        route: 'Nasal',
        quantity: '1 kit de irrigação nasal',
        posology: 'Irrigação nasal abundante em cada narina com seringa ou garrafa irrigadora, 3 a 4x/dia',
        frequencyText: '3 a 4x ao dia',
        scheduleInterval: '6/6h',
        durationDays: 14
      },
      {
        name: 'Furoato de mometasona spray nasal',
        presentation: '50 mcg/dose spray nasal (marcas: Nasonex, Omnaris)',
        route: 'Nasal',
        quantity: '1 frasco spray (120 doses)',
        posology: 'Adultos e crianças > 12 anos: 2 jatos em cada narina 1x/dia (ou 1 jato 12/12h) por 14 a 30 dias. Reduz edema de óstios meatais',
        frequencyText: '1x ao dia por 14 a 30 dias',
        scheduleInterval: '24/24h',
        durationDays: 30
      }
    ]
  },
  {
    id: 'contracepcao',
    name: 'Contracepção Hormonal de Rotina e Emergência',
    category: 'Ginecológica',
    firstLineSummary: 'Escolha baseada nos Critérios Médicos de Elegibilidade da OMS (MEC/CDC).',
    pediatricRelevant: false,
    clinicalWarning: 'Estrogênios são contraindicados (Critério 4 da OMS) em: enxaqueca com aura, tabagismo ≥ 35 anos, antecedente de TVP/TEP, HAS não controlada e câncer de mama ativo.',
    reference: 'Critérios Médicos de Elegibilidade para Uso de Contraceptivos — OMS (MEC 2015/CDC 2016).',
    medications: [
      {
        name: 'Drospirenona + Etinilestradiol (baixa dosagem)',
        presentation: '3 mg + 0,02 mg, regime 24+4 comprimidos (marcas: Yaz, Iumi)',
        route: 'Oral',
        quantity: '1 cartela (28 comprimidos)',
        posology: 'Tomar 1 comprimido VO 1x/dia no mesmo horário, continuamente por 28 dias (regime 24+4)',
        frequencyText: '1x ao dia no mesmo horário',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Desogestrel (pílula só de progestagênio)',
        presentation: '75 mcg (0,075 mg) cartela com 28 comprimidos (marcas: Cerazette, Nactali)',
        route: 'Oral',
        quantity: '1 cartela (28 comprimidos)',
        posology: 'Tomar 1 comprimido VO 1x/dia rigorosamente no mesmo horário, sem pausa entre cartelas (ideal para lactantes e contraindicações a estrogênio)',
        frequencyText: '1x ao dia, sem pausa',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Levonorgestrel (contracepção de emergência)',
        presentation: '1,5 mg comprimido dose única (marcas: Pozato Uni, Pilem)',
        route: 'Oral',
        quantity: '1 comprimido',
        posology: 'Tomar 1 comprimido VO em dose única o mais precocemente possível após a relação desprotegida (até 72 horas)',
        frequencyText: 'dose única',
        scheduleInterval: 'Dose Única',
        durationDays: 1
      }
    ]
  },
  {
    id: 'isrs-depressao-ansiedade',
    name: 'Transtornos Depressivos e de Ansiedade — ISRS',
    category: 'Psiquiatria',
    firstLineSummary: 'Iniciar em baixas doses para mitigar piora ansiosa paradoxal nas primeiras 1 a 2 semanas. Tempo mínimo de latência terapêutica: 2 a 4 semanas.',
    pediatricRelevant: false,
    clinicalWarning: 'Atenção ao risco aumentado de ideação suicida em adultos jovens nas primeiras semanas de tratamento. Nunca suspender abruptamente (risco de síndrome de descontinuação). Escitalopram e citalopram exigem cautela com intervalo QTc em doses máximas.',
    reference: 'Diretrizes da Associação Brasileira de Psiquiatria (ABP) para depressão.',
    medications: [
      {
        name: 'Oxalato de escitalopram',
        presentation: '10 mg e 20 mg comprimido revestido; 20 mg/mL gotas (marcas: Lexapro, Exodus, Reconter)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Iniciar com 10 mg VO pela manhã; titular após 2 a 4 semanas até 20 mg/dia se resposta parcial',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Cloridrato de sertralina',
        presentation: '25 mg, 50 mg e 100 mg comprimido revestido (marcas: Zoloft, Assert, Tolrest)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Iniciar com 25 a 50 mg VO pela manhã com alimento; titular gradualmente até 100 a 200 mg/dia conforme tolerância e eficácia',
        frequencyText: '1x ao dia pela manhã com alimento',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Cloridrato de fluoxetina',
        presentation: '20 mg cápsula ou comprimido; 20 mg/mL solução oral (marcas: Prozac, Daforin)',
        route: 'Oral',
        quantity: '30 cápsulas',
        posology: 'Iniciar com 20 mg VO pela manhã (após desjejum); pode ser titulada até 40 a 60 mg/dia',
        frequencyText: '1x ao dia pela manhã',
        scheduleInterval: '24/24h',
        isContinuous: true
      }
    ]
  },
  {
    id: 'valproato-estabilizador',
    name: 'Estabilizadores de Humor e Antiepilépticos — Valproato e Divalproato',
    category: 'Neurologia',
    firstLineSummary: 'Indicados para controle de crises epilépticas focais/generalizadas e episódios de mania no Transtorno Bipolar. Divalproato confere menor intolerância gástrica.',
    pediatricRelevant: true,
    clinicalWarning: 'ALTO RISCO TERATOGÊNICO (defeitos de fechamento de tubo neural e déficit cognitivo grave no feto) — formalmente contraindicado em mulheres em idade fértil sem método contraceptivo de alta eficácia comprovado. Monitorar periodicamente hemograma (plaquetopenia), coagulograma, transaminases hepáticas e lipase/amilase (risco de pancreatite aguda).',
    reference: 'Diretrizes da ABE / ILAE (valproato) e Ligue 265 (TDM).',
    medications: [
      {
        name: 'Divalproato de sódio (liberação prolongada/ER)',
        presentation: '250 mg e 500 mg comprimidos de liberação estendida (marcas: Depakote ER, Depakote Sprinkle)',
        route: 'Oral',
        quantity: '30 comprimidos',
        posology: 'Iniciar com 500 mg VO 1x/dia à noite ou 12/12h; titular conforme nível sérico (faixa terapêutica: 50 a 100 mcg/mL) até 1.000 a 2.000 mg/dia',
        frequencyText: '1 a 2x ao dia, com titulação',
        scheduleInterval: '24/24h',
        isContinuous: true
      },
      {
        name: 'Valproato de sódio / ácido valproico',
        presentation: '250 mg e 500 mg cápsulas; xarope 250 mg/5 mL (50 mg/mL) (marcas: Depakene, Valpakine)',
        route: 'Oral',
        quantity: '1 frasco (100 mL)',
        posology: '10 a 15 mg/kg/dia VO divididos em 2 a 3 tomadas junto às refeições; titular 5 a 10 mg/kg/semana até controle clínico (dose usual: 20 a 30 mg/kg/dia; máx 60 mg/kg/dia)',
        frequencyText: '2 a 3x ao dia junto às refeições',
        scheduleInterval: '12/12h',
        isContinuous: true
      }
    ]
  },
  {
    id: 'crise-epileptica',
    name: 'Crise Epiléptica Aguda e Convulsão Febril (Abordagem na Emergência)',
    category: 'Neurologia',
    firstLineSummary: 'ABCDE neurológico: posicionamento em decúbito lateral, oxigenação, afastar objetos cortantes, glicemia capilar imediata. NÃO introduzir objetos na boca. Iniciar medicação abortiva se crise generalizada durar > 5 minutos (EMA precoce).',
    pediatricRelevant: true,
    clinicalWarning: 'Risco iminente de depressão respiratória e hipotensão com benzodiazepínicos IV, principalmente com infusão rápida ou doses repetidas — manter material de intubação à beira do leito. Na Convulsão Febril Simples (típica, < 15 min, sem déficits focais pós-ictais, 6 meses a 5 anos), NÃO há indicação de anticonvulsivante de manutenção.',
    reference: 'Protocolos de emergência neurológica (ABN / AHA-ILAE adaptado).',
    medications: [
      {
        name: 'Diazepam solução injetável',
        presentation: '10 mg/2 mL ampola (5 mg/mL) (marcas: Valium, Compaz)',
        route: 'Injetável',
        quantity: '2 ampolas',
        posology: 'Adulto: 10 mg IV puro, infundido lentamente (2 a 5 mg/min); repetir 10 mg após 5 a 10 min se persistir (máx inicial 20 a 30 mg). Pediátrico: 0,2 a 0,3 mg/kg IV lento (máx 5 mg em < 5 anos; 10 mg em > 5 anos). Sem acesso IV na criança: via retal 0,5 mg/kg',
        frequencyText: 'dose de ataque conforme resposta',
        scheduleInterval: 'S.O.S'
      },
      {
        name: 'Midazolam (alternativa IM/bucal/IV)',
        presentation: '5 mg/mL ampolas de 3 mL ou 10 mL (marca: Dormonid)',
        route: 'Injetável',
        quantity: '3 ampolas',
        posology: 'Adulto (> 40 kg): 10 mg IM dose única (excelente opção sem acesso venoso). Pediátrico: 0,2 mg/kg IM ou 0,2 mg/kg na mucosa jugal/bucal (máx 10 mg)',
        frequencyText: 'dose única IM ou bucal',
        scheduleInterval: 'Dose Única'
      },
      {
        name: 'Fenitoína sódica (segunda linha/impregnação)',
        presentation: '50 mg/mL ampola de 5 mL (250 mg) (marca: Hidantal)',
        route: 'Injetável',
        quantity: '2 ampolas',
        posology: 'Dose de ataque de 20 mg/kg diluída EXCLUSIVAMENTE em SF 0,9% (precipita em glicosado), infundida a máx 50 mg/min em adultos e 1 mg/kg/min em crianças, sob monitorização cardíaca contínua',
        frequencyText: 'dose de ataque única com monitorização',
        scheduleInterval: 'Dose Única'
      },
      {
        name: 'Dipirona injetável/gotas (convulsão febril pediátrica)',
        presentation: '500 mg/mL gotas ou injetável (marcas: Novalgina, Anador)',
        route: 'Oral',
        quantity: '1 frasco',
        posology: '20 mg/kg/dose (1 gota/kg da solução 500 mg/mL) VO ou IV lento após a cessação do evento convulsivo, para controle do pico febril',
        frequencyText: '1 gota/kg após o evento convulsivo',
        scheduleInterval: 'S.O.S'
      }
    ]
  }
];
