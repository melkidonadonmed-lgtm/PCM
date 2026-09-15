import test from 'node:test';
import assert from 'node:assert/strict';
import type { DoctorProfile, Patient, PrescriptionItem, QuantityPlan } from '../types';
import { normalizePrescriptionItem, buildPrescriptionDocuments, prescriptionIssues, suggestQuantity, prescriptionDocumentText } from './prescriptionRules';
import { layoutPrescriptionPages, generatePrescriptionPDF, prescriptionIdentityIssues } from './prescriptionPdf';
import { validStoredValue, safeStorage, getStorageMessages } from './storage';
import { quantityWords } from './quantityWords';
import { calculatePediatricDose, generateScheduleTimes } from './doseCalculator';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { searchCID10 } from '../data/cidCatalog';

const item = (overrides: Partial<PrescriptionItem> = {}): PrescriptionItem => ({
  id: '1', name: 'Medicamento fictício', presentation: '10 mg, comprimido', quantity: '20 comprimidos',
  route: 'Oral', instructions: 'Tomar conforme esquema de teste.', frequencyText: '', doseCalculatedText: '',
  scheduleInterval: '', scheduleTimes: [], isContinuous: false,
  schemaVersion: 2, prescriptionKind: 'simple', classificationReviewed: true, ...overrides,
});
const doctor: DoctorProfile = { name: 'Prescritor de Teste', crm: '000000', crmState: 'AM', specialty: '', clinicName: '', address: 'Rua de Teste, 1', cityState: 'Manaus/AM', phone: '0000000000', email: '', showSignature: false };
const patient: Patient = { id: 'test', name: 'Paciente Fictício', weightKg: 0, ageText: '30 anos', gender: 'other', documentNumber: 'DOCUMENTO FICTÍCIO', address: 'Rua de Teste, 2', allergies: [] };

test('catalog IDs separate antimicrobials, C1 and notifications, never by partial name', () => {
  assert.equal(normalizePrescriptionItem(item({ medicationId: 'amoxicilina-500mg' })).prescriptionKind, 'antimicrobial');
  assert.equal(normalizePrescriptionItem(item({ medicationId: 'fluoxetina-20mg' })).prescriptionKind, 'c1');
  for (const id of ['clonazepam-2mg', 'diazepam-10mg', 'zolpidem-10mg', 'morfina-10mg', 'cloridrato-metilfenidato-10mg']) assert.equal(normalizePrescriptionItem(item({ medicationId: id })).prescriptionKind, 'notification');
  assert.equal(normalizePrescriptionItem(item({ medicationId: 'albendazol-400mg' })).prescriptionKind, 'simple');
  assert.equal(normalizePrescriptionItem(item({ name: 'Medicamento Avulso', schemaVersion: undefined, prescriptionKind: undefined })).prescriptionKind, 'simple');
});
test('legacy data require review without losing text; migration is idempotent', () => {
  const old = item({ schemaVersion: undefined, isSpecialControl: true, instructions: 'Texto original', scheduleTimes: ['06:00'] });
  const migrated = normalizePrescriptionItem(old);
  assert.equal(migrated.instructions, old.instructions);
  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(migrated.scheduleTimes, []);
  assert.deepEqual(normalizePrescriptionItem(migrated), migrated);
});
test('empty and mixed prescriptions produce only appropriate documents', () => {
  assert.deepEqual(buildPrescriptionDocuments([]), []);
  const docs = buildPrescriptionDocuments([item(), item({ medicationId: 'amoxicilina-500mg' }), item({ medicationId: 'fluoxetina-20mg' }), item({ medicationId: 'zolpidem-10mg' })]);
  assert.deepEqual(docs.map(d => [d.kind, d.items.length, d.copies]), [['simple', 1, 1], ['antimicrobial', 1, 2], ['c1', 1, 2]]);
});
test('antimicrobials have no three-item cap; C1 counts distinct substances and associations', () => {
  assert.equal(buildPrescriptionDocuments(Array.from({ length: 8 }, (_, i) => item({ id: String(i), medicationId: 'amoxicilina-500mg' })))[0].items.length, 8);
  const c1 = (substances: string[], id: string) => item({ id, prescriptionKind: 'c1', controlledSubstances: substances });
  const docs = buildPrescriptionDocuments([c1(['a', 'b'], '1'), c1(['b'], '2'), c1(['c'], '3'), c1(['d'], '4')]);
  assert.deepEqual(docs.map(d => d.items.length), [3, 1]);
  assert.ok(prescriptionIssues(c1(['a', 'b', 'c', 'd'], '5')).length);
  assert.ok(prescriptionIssues(item({ name: '', prescriptionKind: 'c1' })).length);
});
const plan: QuantityPlan = { dose: 5, administrationsPerDay: 3, days: 7, packageSize: 100, unit: 'mL', packageUnit: 'mL', packageLabel: 'frasco', regimen: 'regular' };
test('quantity rounds whole packages up and retains pt-BR explanation', () => {
  assert.equal(suggestQuantity(plan)?.total, 105);
  assert.equal(suggestQuantity(plan)?.packages, 2);
  assert.equal(suggestQuantity({ ...plan, dose: 1, unit: 'comprimidos', packageUnit: 'comprimidos', packageLabel: 'caixa', packageSize: 20 })?.packages, 2);
  assert.equal(suggestQuantity({ ...plan, dose: 0.5, days: 10 })?.total, 15);
  assert.match(suggestQuantity({ ...plan, dose: 0.5 })!.explanation, /0,5/);
});
test('no guessed drops, duration, package size or variable regimen', () => {
  for (const patch of [{ days: undefined }, { packageSize: undefined }, { dose: 0 }, { dose: -1 }, { dose: Infinity }, { regimen: 'asNeeded' as const }, { regimen: 'variable' as const }, { unit: 'gotas' as const }]) assert.equal(suggestQuantity({ ...plan, ...patch }), null);
  assert.equal(suggestQuantity({ ...plan, unit: 'gotas', dropsPerMl: 20 })?.total, 5.25);
});
test('invalid prescription items cannot be emitted without required fields', () => {
  assert.ok(prescriptionIssues(item({ name: '' })).length);
  assert.ok(prescriptionIssues(item({ instructions: '' })).length);
  assert.ok(prescriptionIssues(item({ presentation: '20 comprimidos', quantity: '20 comprimidos' })).length);
  assert.ok(prescriptionIssues(item({ medicationId: 'zolpidem-10mg' })).length);
  assert.deepEqual(prescriptionIssues(item({ quantityPlan: { ...plan, source: 'manual' } })), []);
});
test('copy and measured pages contain only the selected document; antimicrobial copy order', () => {
  const docs = buildPrescriptionDocuments([item({ name: 'SIMPLES TESTE' }), item({ name: 'ANTIMICROBIANO TESTE', medicationId: 'amoxicilina-500mg' })]);
  const text = prescriptionDocumentText(docs[1]);
  assert.match(text, /ANTIMICROBIANO TESTE/); assert.doesNotMatch(text, /SIMPLES TESTE/);
  const pages = layoutPrescriptionPages([docs[1]], doctor, patient);
  assert.equal(pages.length, 2);
  assert.ok(pages[0].texts.some(t => t.text.includes('1ª via — Farmácia')));
  assert.ok(pages[1].texts.some(t => t.text.includes('2ª via — Paciente')));
  assert.ok(pages.every(p => p.texts.some(t => t.text.includes('20 comprimidos'))));
});
test('long documents paginate without losing lines or overlapping fixed footer', () => {
  const docs = buildPrescriptionDocuments([item({ instructions: 'Instrução de teste muito longa. '.repeat(600) })]);
  const pages = layoutPrescriptionPages(docs, doctor, patient);
  assert.ok(pages.length > 3);
  for (const page of pages) {
    assert.ok(page.texts.every(t => t.y <= 290 && t.x >= 14));
    assert.ok(page.texts.filter(t => t.text.includes('Instrução de teste')).every(t => t.y <= 222));
  }
  const text = pages.flatMap(p => p.texts.map(t => t.text)).join(' ');
  assert.equal((text.match(/Instrução de teste/g) || []).length, 600);
  assert.equal(generatePrescriptionPDF(docs, doctor, patient).getNumberOfPages(), pages.length);
});
test('four C1 substances generate two documents with two copies each', () => {
  const docs = buildPrescriptionDocuments(['fluoxetina-20mg', 'sertralina-50mg', 'amitriptilina-25mg', 'pregabalina-75mg'].map((medicationId, i) => item({ id: String(i), medicationId })));
  const pages = layoutPrescriptionPages(docs, doctor, patient);
  assert.equal(pages.length, 4);
  assert.ok(pages.every(p => p.texts.some(t => t.text === 'IDENTIFICAÇÃO DO COMPRADOR')));
  const issues = prescriptionIdentityIssues(doctor, { ...patient, address: '' }, docs);
  assert.ok(issues.some(i => i.toLowerCase().includes('endereço')));
});
test('PDF boundary rejects empty and unsupported documents', () => {
  assert.throws(() => generatePrescriptionPDF([], doctor, patient));
  assert.ok(prescriptionIssues(item({ medicationId: 'zolpidem-10mg' })).some(i => i.includes('Notificação')));
});
test('storage rejects malformed records', () => {
  assert.equal(validStoredValue('prescmed_patient', { name: 123, allergies: [] }), false);
  assert.equal(validStoredValue('prescmed_patient', { name: 'Teste', allergies: 'invalid' }), false);
  assert.equal(validStoredValue('prescmed_exams', {}), false);
  assert.equal(validStoredValue('prescmed_prescription', [null]), false);
  assert.equal(validStoredValue('prescmed_prescription', [item()]), true);
});

test('corrupted originals survive initial save effects and write failures are reported', () => {
  const memory = new Map([['prescmed_prescription', '{invalid json']]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
    removeItem: (key: string) => { memory.delete(key); },
  } });
  assert.equal(safeStorage.getItem('prescmed_prescription'), null);
  assert.equal(safeStorage.setItem('prescmed_prescription', '[]'), false);
  assert.equal(memory.get('prescmed_prescription'), '{invalid json');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem() { throw new Error('quota'); } } });
  assert.equal(safeStorage.setItem('prescmed_theme', 'dark'), false);
  assert.ok(getStorageMessages().some(s => s.includes('Não foi possível salvar')));
  Reflect.deleteProperty(globalThis, 'localStorage');
});

test('C1 quantity is written in digits and words', () => {
  assert.equal(quantityWords(21), 'vinte e um');
  assert.equal(quantityWords(100), 'cem');
  assert.equal(quantityWords(120), 'cento e vinte');
  assert.equal(quantityWords(1500), 'mil e quinhentos');
  const doc = buildPrescriptionDocuments([item({ medicationId: 'fluoxetina-20mg' })])[0];
  assert.match(prescriptionDocumentText(doc), /20 \(vinte\) comprimidos/);
});

test('segregation ensures antimicrobials and C1 are never mixed with simple prescription', () => {
  const antimicrobial = item({ medicationId: 'amoxicilina-500mg' });
  const simple = item({ medicationId: 'albendazol-400mg' });
  const c1Item = item({ medicationId: 'fluoxetina-20mg' });
  const docs = buildPrescriptionDocuments([simple, antimicrobial, c1Item]);
  assert.equal(docs.length, 3);
  assert.deepEqual(docs.map(d => d.kind), ['simple', 'antimicrobial', 'c1']);
  assert.equal(docs[0].items.length, 1);
  assert.equal(docs[1].items.length, 1);
  assert.equal(docs[2].items.length, 1);
  const items = ['a', 'b', 'c', 'd'].map(controlled => item({ prescriptionKind: 'c1', controlledSubstances: [controlled] }));
  const c1Docs = buildPrescriptionDocuments(items);
  assert.equal(c1Docs.length, 2);
  assert.ok(c1Docs.every(d => d.items.length <= 3));
});

test('pediatric dose calculations respect weight boundaries and clinical max dose clamps', () => {
  const paracetamol = PEDIATRIC_MEDICATIONS.find(m => m.id === 'paracetamol-gotas')!;
  const dipirona = PEDIATRIC_MEDICATIONS.find(m => m.id === 'dipirona-gotas')!;
  const simeticona = PEDIATRIC_MEDICATIONS.find(m => m.id === 'simeticona-gotas')!;
  
  // Boundary tests (1 kg to 120 kg)
  const low = calculatePediatricDose(paracetamol, 1);
  assert.equal(low.calculatedDrops, 1);
  assert.equal(low.calculatedMg, 10);
  assert.equal(low.isMaxDoseReached, false);

  const high = calculatePediatricDose(paracetamol, 120);
  assert.equal(high.calculatedDrops, 100);
  assert.equal(high.calculatedMg, 1000);
  assert.equal(high.isMaxDoseReached, true);

  // Dipirona max dose clamp
  const dipHigh = calculatePediatricDose(dipirona, 80);
  assert.equal(dipHigh.calculatedDrops, 40);
  assert.equal(dipHigh.calculatedMg, 1000);
  assert.equal(dipHigh.isMaxDoseReached, true);

  // Simeticona clinical threshold (<12kg = 8 drops, >=12kg = 16 drops)
  assert.equal(calculatePediatricDose(simeticona, 8).calculatedDrops, 8);
  assert.equal(calculatePediatricDose(simeticona, 15).calculatedDrops, 16);

  // Schedule intervals
  assert.deepEqual(generateScheduleTimes('8/8h', 8), ['08:00', '16:00', '00:00']);
  assert.deepEqual(generateScheduleTimes('6 em 6 horas', 6), ['06:00', '12:00', '18:00', '00:00']);
});

test('CID-10 search resolves codes, descriptions and categories accurately', () => {
  const j00 = searchCID10('J00', 'Todos');
  assert.ok(j00.length > 0);
  assert.equal(j00[0].code, 'J00');

  const dengue = searchCID10('dengue', 'Todos');
  assert.ok(dengue.length > 0);
  assert.ok(dengue.some(c => c.code.startsWith('A90') || c.description.toLowerCase().includes('dengue')));

  const respiratory = searchCID10('asma', 'Respiratório');
  assert.ok(respiratory.length > 0);
  assert.ok(respiratory.every(c => c.category === 'Respiratório'));
});
