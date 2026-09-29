export interface ClinicalKitItem {
  name: string;
  route: string;
  quantity: string;
  instructions: string;
  pediaDrugKey?: string;
  isSpecial?: boolean;
}

export interface ClinicalKit {
  id: string;
  name: string;
  badge: string;
  description: string;
  items: ClinicalKitItem[];
}

export const CLINICAL_KITS: ClinicalKit[] = [
  {
    id: 'kit_amigdalite',
    name: 'Amigdalite Bacteriana',
    badge: 'Amoxicilina + AINE',
    description: 'Amoxicilina 500mg (10d) + Ibuprofeno 600mg + Dipirona',
    items: [
      {
        name: 'Amoxicilina 500mg cápsula (Amoxil)',
        route: 'Uso Oral',
        quantity: '1 caixa (21 cápsulas)',
        instructions: 'Tomar 1 cápsula via oral de 8 em 8 horas durante 7 a 10 dias consecutivos.',
        pediaDrugKey: 'amoxicilina_susp'
      },
      {
        name: 'Ibuprofeno 600mg comprimido',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 8 em 8 horas após as refeições por 3 dias.',
        pediaDrugKey: 'ibuprofeno_100'
      },
      {
        name: 'Dipirona Sódica 500mg comprimido (Novalgina)',
        route: 'Uso Oral',
        quantity: '1 caixa (20 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.',
        pediaDrugKey: 'dipirona_gotas'
      }
    ]
  },
  {
    id: 'kit_geca',
    name: 'Gastroenterite & Vômitos (GECA)',
    badge: 'Antiemético + SRO',
    description: 'Ondansetrona + SRO Hidratação + Simeticona',
    items: [
      {
        name: 'Ondansetrona 8mg comprimido de desintegração oral (Vonau Flash)',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Dissolver 1 comprimido sob a língua de 8 em 8 horas em caso de náuseas ou vômitos.'
      },
      {
        name: 'Sais para Reidratação Oral (SRO) 27,9g sachê',
        route: 'Uso Oral',
        quantity: '4 envelopes',
        instructions: 'Diluir 1 envelope em 1 litro de água filtrada/fervida. Beber ao longo do dia e após cada evacuação líquida.'
      },
      {
        name: 'Simeticona 75mg/mL emulsão oral gotas (Luftal)',
        route: 'Uso Oral',
        quantity: '1 frasco (15 mL)',
        instructions: 'Tomar 40 gotas via oral de 8 em 8 horas em caso de cólicas e gases.'
      }
    ]
  },
  {
    id: 'kit_ivas',
    name: 'IVAS / Gripe & Resfriado',
    badge: 'Sintomáticos + Lavagem',
    description: 'Dipirona + Paracetamol + Lavagem Nasal com SF 0,9%',
    items: [
      {
        name: 'Dipirona Sódica 500mg comprimido (Novalgina)',
        route: 'Uso Oral',
        quantity: '1 caixa (20 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.',
        pediaDrugKey: 'dipirona_gotas'
      },
      {
        name: 'Paracetamol 750mg comprimido (Tylenol)',
        route: 'Uso Oral',
        quantity: '1 caixa (20 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 8 em 8 horas se dor persistente.',
        pediaDrugKey: 'paracetamol_gotas'
      },
      {
        name: 'Cloreto de Sódio 0,9% frasco para lavagem nasal (Soro Fisiológico)',
        route: 'Uso Nasal',
        quantity: '1 frasco (100 mL)',
        instructions: 'Aplicar 5 a 10 mL em cada narina com seringa ou spray de 4 em 4 horas.'
      }
    ]
  },
  {
    id: 'kit_lombalgia',
    name: 'Lombalgia / Dor Aguda',
    badge: 'AINE + Relaxante Muscular',
    description: 'Cetoprofeno + Dipirona 1g + Ciclobenzaprina + Omeprazol',
    items: [
      {
        name: 'Cetoprofeno 100mg comprimido (Profenid)',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 12 em 12 horas após as refeições por 5 dias.'
      },
      {
        name: 'Dipirona Sódica 1g comprimido',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor intensa.'
      },
      {
        name: 'Cloridrato de Ciclobenzaprina 5mg comprimido (Miosan)',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido via oral à noite ao deitar durante 5 dias.'
      },
      {
        name: 'Omeprazol 20mg cápsula',
        route: 'Uso Oral',
        quantity: '1 caixa (14 cápsulas)',
        instructions: 'Tomar 1 cápsula via oral pela manhã em jejum durante o uso do anti-inflamatório.'
      }
    ]
  },
  {
    id: 'kit_itu',
    name: 'Infecção Urinária (ITU)',
    badge: 'Fosfomicina + Analgésico',
    description: 'Fosfomicina 3g Dose Única + Buscopan Composto',
    items: [
      {
        name: 'Fosfomicina Trometamol 3g sachê granulado (Monuril)',
        route: 'Uso Oral',
        quantity: '1 envelope (3g)',
        instructions: 'Dissolver em 1/2 copo de água e tomar em dose única à noite antes de deitar, após esvaziar a bexiga.'
      },
      {
        name: 'Butilbrometo de Escopolamina + Dipirona (Buscopan Composto)',
        route: 'Uso Oral',
        quantity: '1 caixa (20 drágeas)',
        instructions: 'Tomar 1 a 2 drágeas via oral de 8 em 8 horas em caso de dor ou cólica.'
      }
    ]
  },
  {
    id: 'kit_asma',
    name: 'Crise de Asma / Broncoespasmo',
    badge: 'Spray + Corticoide',
    description: 'Salbutamol Spray 100mcg + Prednisolona Oral',
    items: [
      {
        name: 'Sulfato de Salbutamol 100mcg/dose spray aerossol (Aerolin)',
        route: 'Uso Inalatória',
        quantity: '1 frasco (200 doses)',
        instructions: 'Inalar 2 a 4 jatos com espaçador de 6 em 6 horas ou de 4 em 4 horas se tosse/falta de ar.'
      },
      {
        name: 'Prednisolona 20mg comprimido (ou 3mg/mL suspensão)',
        route: 'Uso Oral',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 a 2 comprimidos (40mg) via oral pela manhã durante 5 dias.',
        pediaDrugKey: 'prednisolona_sol'
      }
    ]
  }
];
