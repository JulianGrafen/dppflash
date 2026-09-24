export const DIMENSIONS = ['awareness', 'productData', 'supplierEvidence', 'governance'];

export const QUESTIONS = [
  {
    id: 'familiarity',
    sectionKey: 'scan.q1.section',
    titleKey: 'scan.q1.title',
    hintKey: 'scan.q1.hint',
    options: [
      { id: 'new', emoji: '🌱', titleKey: 'scan.q1.o1.t', subKey: 'scan.q1.o1.s', points: { awareness: 1, governance: 0 } },
      { id: 'active', emoji: '🧭', titleKey: 'scan.q1.o2.t', subKey: 'scan.q1.o2.s', points: { awareness: 3, governance: 2 } },
    ],
  },
  {
    id: 'role',
    sectionKey: 'scan.q2.section',
    titleKey: 'scan.q2.title',
    hintKey: 'scan.q2.hint',
    options: [
      { id: 'manufacturer', emoji: '🏭', titleKey: 'scan.q2.o1.t', subKey: 'scan.q2.o1.s', points: { awareness: 2, governance: 2 } },
      { id: 'importer', emoji: '🚢', titleKey: 'scan.q2.o2.t', subKey: 'scan.q2.o2.s', points: { awareness: 3, governance: 2 } },
      { id: 'brand', emoji: '🛍️', titleKey: 'scan.q2.o3.t', subKey: 'scan.q2.o3.s', points: { awareness: 2, governance: 2 } },
      { id: 'reseller', emoji: '📦', titleKey: 'scan.q2.o4.t', subKey: 'scan.q2.o4.s', points: { awareness: 2, governance: 1 } },
      { id: 'advisor', emoji: '🧭', titleKey: 'scan.q2.o5.t', subKey: 'scan.q2.o5.s', points: { awareness: 3, governance: 3 } },
    ],
  },
  {
    id: 'supply',
    sectionKey: 'scan.q3.section',
    titleKey: 'scan.q3.title',
    hintKey: 'scan.q3.hint',
    options: [
      { id: 'eu', emoji: '🇪🇺', titleKey: 'scan.q3.o1.t', subKey: 'scan.q3.o1.s', points: { supplierEvidence: 2, productData: 2 } },
      { id: 'non_eu', emoji: '🌏', titleKey: 'scan.q3.o2.t', subKey: 'scan.q3.o2.s', points: { supplierEvidence: 1, awareness: 2 } },
      { id: 'mixed', emoji: '🔀', titleKey: 'scan.q3.o3.t', subKey: 'scan.q3.o3.s', points: { supplierEvidence: 2, productData: 1 } },
      { id: 'unknown', emoji: '❓', titleKey: 'scan.q3.o4.t', subKey: 'scan.q3.o4.s', points: { supplierEvidence: 0, awareness: 0 } },
    ],
  },
  {
    id: 'product',
    sectionKey: 'scan.q4.section',
    titleKey: 'scan.q4.title',
    hintKey: 'scan.q4.hint',
    options: [
      { id: 'battery', emoji: '🔋', titleKey: 'scan.q4.o1.t', subKey: 'scan.q4.o1.s', points: { awareness: 3, productData: 2 }, tag: 'battery' },
      { id: 'textile', emoji: '🧵', titleKey: 'scan.q4.o2.t', subKey: 'scan.q4.o2.s', points: { awareness: 2, productData: 2 }, tag: 'textile' },
      { id: 'electronics', emoji: '💻', titleKey: 'scan.q4.o3.t', subKey: 'scan.q4.o3.s', points: { awareness: 2, productData: 2 }, tag: 'electronics' },
      { id: 'furniture', emoji: '🪑', titleKey: 'scan.q4.o4.t', subKey: 'scan.q4.o4.s', points: { awareness: 2, productData: 2 }, tag: 'furniture' },
      { id: 'other', emoji: '📦', titleKey: 'scan.q4.o5.t', subKey: 'scan.q4.o5.s', points: { awareness: 1, productData: 1 }, tag: 'other' },
    ],
  },
  {
    id: 'skus',
    sectionKey: 'scan.q5.section',
    titleKey: 'scan.q5.title',
    hintKey: 'scan.q5.hint',
    options: [
      { id: 's1', emoji: '1️⃣', titleKey: 'scan.q5.o1.t', subKey: 'scan.q5.o1.s', points: { productData: 3, governance: 2 } },
      { id: 's2', emoji: '📊', titleKey: 'scan.q5.o2.t', subKey: 'scan.q5.o2.s', points: { productData: 2, governance: 2 } },
      { id: 's3', emoji: '📈', titleKey: 'scan.q5.o3.t', subKey: 'scan.q5.o3.s', points: { productData: 2, governance: 1 } },
      { id: 's4', emoji: '🏭', titleKey: 'scan.q5.o4.t', subKey: 'scan.q5.o4.s', points: { productData: 1, governance: 1 } },
    ],
  },
  {
    id: 'data',
    sectionKey: 'scan.q6.section',
    titleKey: 'scan.q6.title',
    hintKey: 'scan.q6.hint',
    options: [
      { id: 'structured', emoji: '✅', titleKey: 'scan.q6.o1.t', subKey: 'scan.q6.o1.s', points: { productData: 3 } },
      { id: 'partial', emoji: '📁', titleKey: 'scan.q6.o2.t', subKey: 'scan.q6.o2.s', points: { productData: 2 } },
      { id: 'pdf', emoji: '📄', titleKey: 'scan.q6.o3.t', subKey: 'scan.q6.o3.s', points: { productData: 1 } },
      { id: 'unclear', emoji: '❓', titleKey: 'scan.q6.o4.t', subKey: 'scan.q6.o4.s', points: { productData: 0 } },
    ],
  },
  {
    id: 'supplier',
    sectionKey: 'scan.q7.section',
    titleKey: 'scan.q7.title',
    hintKey: 'scan.q7.hint',
    options: [
      { id: 'ready', emoji: '🤝', titleKey: 'scan.q7.o1.t', subKey: 'scan.q7.o1.s', points: { supplierEvidence: 3 } },
      { id: 'some', emoji: '📬', titleKey: 'scan.q7.o2.t', subKey: 'scan.q7.o2.s', points: { supplierEvidence: 2 } },
      { id: 'not_yet', emoji: '⏳', titleKey: 'scan.q7.o3.t', subKey: 'scan.q7.o3.s', points: { supplierEvidence: 1 } },
      { id: 'none', emoji: '🚫', titleKey: 'scan.q7.o4.t', subKey: 'scan.q7.o4.s', points: { supplierEvidence: 0 } },
    ],
  },
  {
    id: 'identifiers',
    sectionKey: 'scan.q8.section',
    titleKey: 'scan.q8.title',
    hintKey: 'scan.q8.hint',
    options: [
      { id: 'gtin_qr', emoji: '🔗', titleKey: 'scan.q8.o1.t', subKey: 'scan.q8.o1.s', points: { productData: 3, awareness: 2 } },
      { id: 'gtin_only', emoji: '🏷️', titleKey: 'scan.q8.o2.t', subKey: 'scan.q8.o2.s', points: { productData: 2 } },
      { id: 'none', emoji: '➖', titleKey: 'scan.q8.o3.t', subKey: 'scan.q8.o3.s', points: { productData: 0 } },
      { id: 'unclear', emoji: '❓', titleKey: 'scan.q8.o4.t', subKey: 'scan.q8.o4.s', points: { productData: 0, awareness: 0 } },
    ],
  },
  {
    id: 'governance',
    sectionKey: 'scan.q9.section',
    titleKey: 'scan.q9.title',
    hintKey: 'scan.q9.hint',
    options: [
      { id: 'team', emoji: '👥', titleKey: 'scan.q9.o1.t', subKey: 'scan.q9.o1.s', points: { governance: 3 } },
      { id: 'one', emoji: '👤', titleKey: 'scan.q9.o2.t', subKey: 'scan.q9.o2.s', points: { governance: 2 } },
      { id: 'nobody', emoji: '⚠️', titleKey: 'scan.q9.o3.t', subKey: 'scan.q9.o3.s', points: { governance: 0 } },
      { id: 'external', emoji: '🤝', titleKey: 'scan.q9.o4.t', subKey: 'scan.q9.o4.s', points: { governance: 2 } },
    ],
  },
  {
    id: 'deadline',
    sectionKey: 'scan.q10.section',
    titleKey: 'scan.q10.title',
    hintKey: 'scan.q10.hint',
    options: [
      { id: 'battery', emoji: '📅', titleKey: 'scan.q10.o1.t', subKey: 'scan.q10.o1.s', points: { awareness: 3 } },
      { id: 'espr', emoji: '📜', titleKey: 'scan.q10.o2.t', subKey: 'scan.q10.o2.s', points: { awareness: 2 } },
      { id: 'unsure', emoji: '🤔', titleKey: 'scan.q10.o3.t', subKey: 'scan.q10.o3.s', points: { awareness: 1 } },
      { id: 'new', emoji: '🌱', titleKey: 'scan.q10.o4.t', subKey: 'scan.q10.o4.s', points: { awareness: 0 } },
    ],
  },
];

export function getMaxPointsPerDimension() {
  const max = { awareness: 0, productData: 0, supplierEvidence: 0, governance: 0 };
  QUESTIONS.forEach((q) => {
    DIMENSIONS.forEach((dim) => {
      const best = Math.max(0, ...q.options.map((o) => o.points[dim] ?? 0));
      max[dim] += best;
    });
  });
  return max;
}
