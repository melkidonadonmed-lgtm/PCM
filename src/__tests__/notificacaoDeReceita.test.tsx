import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import { classificarReceita } from '../utils/isSpecialControlOrAntibiotic';
import { TERMOS_COM_NOTIFICACAO, avisoTextoNotificacao, descreverNotificacao, notificacaoExigida } from '../utils/notificacaoDeReceita';
import { AvisoNotificacaoReceita } from '../components/AvisoNotificacaoReceita';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import type { DoctorProfile, Patient, PrescriptionItem } from '../types';

const item = (id: string, name: string, extra: Partial<PrescriptionItem> = {}): PrescriptionItem => ({
  id,
  name,
  presentation: 'comprimidos',
  route: 'Oral',
  quantity: '30 comprimidos',
  doseCalculatedText: '1 comprimido',
  frequencyText: 'à noite',
  scheduleInterval: 'Conforme posologia',
  scheduleTimes: [],
  instructions: `Posologia de ${name}.`,
  isContinuous: false,
  ...extra
});

describe('Notificação de Receita (Portaria SVS/MS nº 344/98)', () => {
  it('Lista A1 e A3 exigem Notificação de Receita A (amarela)', () => {
    [
      'Morfina 10mg comprimido (Dimorf)',
      'Sulfato de morfina 10mg/mL',
      'Metadona 10mg',
      'Fentanila adesivo 25mcg/h',
      'Petidina 50mg/mL',
      'Hidromorfona 8mg',
      'Tapentadol 50mg'
    ].forEach((nome) => {
      expect(notificacaoExigida(nome), nome).toMatchObject({ lista: 'A1', rotuloCurto: 'Notificação A' });
    });
    ['Cloridrato de Metilfenidato 10mg (Ritalina)', 'Lisdexanfetamina 30mg (Venvanse)'].forEach((nome) => {
      expect(notificacaoExigida(nome), nome).toMatchObject({ lista: 'A3', documento: 'Notificação de Receita A (amarela)' });
    });
  });

  it('Lista B1 exige Notificação de Receita B (azul), inclusive hipnóticos "Z" e modafinila', () => {
    [
      'Diazepam 10mg',
      'Clonazepam 2,5mg/mL gotas (Rivotril Gotas)',
      'Alprazolam 0,5mg',
      'Frontal 1 mg',
      'Clobazam 10mg',
      'Cloxazolam 2mg',
      'Nitrazepam 5mg',
      'Midazolam 15mg (Dormonid)',
      'Hemitartarato de Zolpidem 10mg comprimido (Stilnox, Patz)',
      'Zopiclona 7,5mg',
      'Eszopiclona 2mg',
      'Modafinila 200mg (Stavigile)'
    ].forEach((nome) => {
      expect(notificacaoExigida(nome), nome).toMatchObject({ lista: 'B1', documento: 'Notificação de Receita B (azul)' });
    });
  });

  it('sibutramina (B2) e isotretinoína (C2) têm notificação própria', () => {
    expect(notificacaoExigida('Sibutramina 15mg')).toMatchObject({ lista: 'B2', documento: 'Notificação de Receita B2' });
    expect(notificacaoExigida('Anfepramona 25mg')).toMatchObject({ lista: 'B2' });
    const retinoide = notificacaoExigida('Isotretinoína 20mg (Roacutan)');
    expect(retinoide).toMatchObject({ lista: 'C2' });
    expect(descreverNotificacao(retinoide!)).toContain('o uso tópico não exige notificação');
    expect(notificacaoExigida('Acitretina 25mg')).toMatchObject({ lista: 'C2' });
  });

  it('"morfina" e "frontal" só valem como palavra inteira', () => {
    // apomorfina não consta nas listas; etilmorfina é A2 e sai em Receita de Controle Especial pelo adendo
    expect(notificacaoExigida('Apomorfina 3mg')).toBeNull();
    expect(notificacaoExigida('Etilmorfina 10mg')).toBeNull();
    expect(notificacaoExigida('Frontalis 10mg')).toBeNull();
    expect(classificarReceita('Frontal 1 mg')).toBe('controle_especial');
  });

  it('cada termo que dispara o aviso também classifica a receita como controle especial', () => {
    expect(TERMOS_COM_NOTIFICACAO.length).toBeGreaterThan(40);
    TERMOS_COM_NOTIFICACAO.forEach((termo) => {
      expect(notificacaoExigida(termo), termo).not.toBeNull();
      expect(classificarReceita(termo), termo).toBe('controle_especial');
    });
  });

  it('declara a ressalva quando a apresentação muda a exigência', () => {
    expect(descreverNotificacao(notificacaoExigida('Oxicodona 10mg')!)).toBe(
      'Notificação de Receita A (amarela) — Lista A1, exceto comprimido de liberação controlada com até 40 mg por unidade, que sai em Receita de Controle Especial'
    );
    expect(descreverNotificacao(notificacaoExigida('Buprenorfina 5mg adesivo')!)).toContain(
      'exceto adesivo transdérmico de matriz (sem reservatório)'
    );
    expect(descreverNotificacao(notificacaoExigida('Clonazepam 2mg')!)).toBe('Notificação de Receita B (azul) — Lista B1');
  });

  it('não avisa para quem sai em Receita de Controle Especial (C1 e adendos das listas A2 e B1) nem para receita comum', () => {
    [
      'Tramadol 50mg',
      'Codeína 30mg + Paracetamol 500mg (Tylex)',
      'Fenobarbital 100mg (Gardenal)',
      'Fluoxetina 20mg',
      'Amitriptilina 25mg',
      'Carbamazepina 200mg',
      'Pregabalina 75mg',
      'Amoxicilina 500mg',
      'Dipirona 500mg',
      ''
    ].forEach((nome) => expect(notificacaoExigida(nome), nome).toBeNull());
    expect(notificacaoExigida(null)).toBeNull();
  });

  it('todo medicamento com notificação continua classificado como controle especial', () => {
    const comNotificacao = UNIFIED_MEDICATIONS.filter((m) => notificacaoExigida(m));
    expect(comNotificacao.map((m) => m.id)).toEqual(
      expect.arrayContaining(['morfina-10mg', 'diazepam-10mg', 'clonazepam-2mg', 'zolpidem-10mg', 'cloridrato-metilfenidato-10mg'])
    );
    comNotificacao.forEach((m) => expect(classificarReceita(m), m.name).toBe('controle_especial'));
    // medicamento de receita simples ou antimicrobiano nunca recebe o aviso
    UNIFIED_MEDICATIONS.filter((m) => classificarReceita(m) !== 'controle_especial').forEach((m) => {
      expect(notificacaoExigida(m), m.name).toBeNull();
    });
  });
});

describe('Aviso de Notificação de Receita na tela', () => {
  it('lista só os medicamentos que exigem notificação e não vai para a impressão', () => {
    const html = renderToStaticMarkup(
      <AvisoNotificacaoReceita items={[item('1', 'Clonazepam 2mg (Rivotril)'), item('2', 'Fluoxetina 20mg')]} />
    );
    expect(html).toContain('no-print');
    expect(html).toContain('A folha de controle especial não substitui a Notificação de Receita');
    expect(html).toContain('deste medicamento');
    expect(html).toContain('talonário específico que o PresCMed não emite');
    expect(html).not.toContain('cada notificação leva um único medicamento');
    expect(html).toContain('Clonazepam 2mg (Rivotril)');
    expect(html).toContain('Notificação de Receita B (azul) — Lista B1.');
    expect(html).not.toContain('Fluoxetina');
  });

  it('com mais de um item, lembra que cada notificação leva um único medicamento', () => {
    const html = renderToStaticMarkup(
      <AvisoNotificacaoReceita items={[item('1', 'Clonazepam 2mg'), item('2', 'Zolpidem 10mg')]} />
    );
    expect(html).toContain('destes medicamentos');
    expect(html).toContain('cada notificação leva um único medicamento');
  });

  it('não aparece quando nenhum item exige notificação', () => {
    expect(renderToStaticMarkup(<AvisoNotificacaoReceita items={[item('1', 'Fluoxetina 20mg'), item('2', 'Tramadol 50mg')]} />)).toBe('');
    expect(renderToStaticMarkup(<AvisoNotificacaoReceita items={[]} />)).toBe('');
  });

  it('fica fora da folha: o documento impresso não ganha texto novo', () => {
    const doctor: DoctorProfile = {
      name: 'Dra. Teste Ficticia',
      crm: '99999',
      crmState: 'RO',
      specialty: 'Clínica Médica',
      clinicName: 'UBS Teste',
      address: 'Rua Fictícia, 100',
      cityState: 'Porto Velho - RO',
      phone: '(69) 0000-0000',
      email: '',
      showSignature: true
    };
    const patient: Patient = { id: 'p', name: 'Paciente Ficticio', weightKg: 70, ageText: '36 anos', gender: 'male', allergies: [] };
    const folha = renderToStaticMarkup(
      <DocumentoClinico
        tipo="special_prescription"
        doctor={doctor}
        patient={patient}
        prescriptionItems={[item('1', 'Clonazepam 2mg (Rivotril)')]}
      />
    );
    expect(folha).toContain('Clonazepam 2mg (Rivotril)');
    expect(folha).not.toContain('Notificação de Receita');
  });

  it('gera aviso textual de Notificação de Receita para WhatsApp/área de transferência apenas quando necessário', () => {
    expect(avisoTextoNotificacao([item('1', 'Fluoxetina 20mg')])).toBe('');
    const texto = avisoTextoNotificacao([item('1', 'Clonazepam 2mg'), item('2', 'Fluoxetina 20mg')]);
    expect(texto).toContain('Nota sanitária (Portaria SVS/MS nº 344/98)');
    expect(texto).toContain('talonário próprio de Notificação de Receita');
    expect(texto).toContain('Clonazepam 2mg');
    expect(texto).toContain('Lista B1');
    expect(texto).not.toContain('Fluoxetina');
  });

  it('modelo predefinido de Receituário de Controle Especial usa fármaco da Lista C1 (sem exigir talonário de Notificação)', () => {
    const tpl = PRESET_CLINICAL_TEMPLATES.find((t) => t.id === 'tpl-receituario-controle-especial');
    expect(tpl).toBeDefined();
    expect(tpl!.contentHtml).toContain('Amitriptilina');
    expect(tpl!.contentHtml).not.toMatch(/clonazepam/i);
    expect(tpl!.prescriptionItems?.every((i) => notificacaoExigida(i) === null)).toBe(true);
  });
});

