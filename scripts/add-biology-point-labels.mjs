import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.resolve(
  SCRIPT_DIR,
  '../public/content/biology-grade-12',
);

const label = (x, y, text, side = 'right', options = {}) => ({
  x,
  y,
  lines: Array.isArray(text) ? text : [text],
  side,
  ...options,
});

const SPECS = {
  'amino-acid-peptide.webp': {
    outputs: ['bio-amino-acids-khmer-labeled.webp'],
    labels: [
      label(176, 315, 'ក្រុមអាមីន', 'left'),
      label(556, 315, 'ក្រុមកាបុកស៊ីល', 'right'),
      label(208, 687, 'ក្រុម R', 'left'),
      label(382, 252, 'អ៊ីដ្រូសែន', 'above'),
    ],
  },
  'dna-base-pairing.webp': {
    outputs: [
      'bio-dna-khmer-labeled.webp',
      'bio-dna-exercises-khmer-labeled.webp',
    ],
    labels: [
      label(67, 554, ['ទិសខ្សែ ADN', 'ទីមួយ'], 'right'),
      label(1194, 757, ['ខ្សែបំពេញគ្នា', 'ទិសផ្ទុយ'], 'left'),
      label(1538, 498, 'ស្ពៀរទ្វេ', 'left'),
      label(447, 862, ['ការផ្គូផ្គងបាស', 'A–T និង C–G'], 'above'),
    ],
  },
  'ecological-interactions.webp': {
    outputs: ['bio-interactions-khmer-labeled.webp'],
    labels: [
      label(34, 34, 'មំសាសី', 'right', { fontSize: 24 }),
      label(568, 34, 'ប៉ារ៉ាស៊ីត', 'right', { fontSize: 24 }),
      label(1100, 34, 'ប្រកួត', 'right', { fontSize: 24 }),
      label(34, 468, 'ផលប្រយោជន៍រួម', 'right', { fontSize: 22 }),
      label(568, 468, 'ឯកភាគី', 'right', { fontSize: 24 }),
      label(1100, 468, 'ស៊ីរុក្ខជាតិ', 'right', { fontSize: 24 }),
    ],
  },
  'endocrine-feedback.webp': {
    outputs: ['bio-endocrine-system-khmer-labeled.webp'],
    labels: [
      label(800, 49, 'គ្លុយកូសខ្ពស់', 'below'),
      label(314, 48, 'ក្រោយបរិភោគអាហារ', 'below', { fontSize: 23 }),
      label(570, 311, 'កោសិកាបេតា', 'right'),
      label(91, 260, ['ថ្លើមស្រូប', 'និងស្តុក'], 'right', {
        fontSize: 23,
      }),
      label(95, 589, ['សាច់ដុំស្រូប', 'និងស្តុក'], 'right', {
        fontSize: 23,
      }),
      label(668, 843, 'ត្រឡប់ធម្មតា', 'above'),
      label(1260, 49, 'ពេលអត់អាហារ', 'below'),
      label(1008, 311, 'កោសិកាអាល់ហ្វា', 'right'),
      label(1498, 260, ['ថ្លើមបញ្ចេញ', 'គ្លុយកូស'], 'left', {
        fontSize: 23,
      }),
      label(864, 843, 'ត្រឡប់ធម្មតា', 'above'),
    ],
  },
  'energy-pyramid.webp': {
    outputs: ['bio-energy-flow-khmer-labeled.webp'],
    labels: [
      label(31, 805, 'អ្នកផលិត', 'right', { fontSize: 23 }),
      label(208, 636, 'អ្នកប្រើទី១', 'right', { fontSize: 23 }),
      label(333, 469, 'អ្នកប្រើទី២', 'right', { fontSize: 23 }),
      label(452, 299, 'អ្នកប្រើកំពូល', 'right', { fontSize: 23 }),
    ],
  },
  'enzyme-action.webp': {
    outputs: ['bio-enzymes-khmer-labeled.webp'],
    labels: [
      label(180, 169, 'ស៊ុបស្ត្រាត', 'right'),
      label(500, 169, 'កុំផ្លិច', 'right'),
      label(805, 169, 'ប្រតិកម្ម', 'right'),
      label(1092, 169, 'ផលិតផល', 'right'),
      label(1384, 169, ['អង់ស៊ីម', 'អាចប្រើម្តងទៀត'], 'right', {
        fontSize: 22,
      }),
    ],
  },
  'evolution-evidence.webp': {
    outputs: ['bio-evolution-evidence-khmer-labeled.webp'],
    labels: [
      label(35, 35, 'ផូស៊ីល', 'right'),
      label(832, 35, 'សរីរាង្គអូម៉ូឡូក', 'right', { fontSize: 22 }),
      label(35, 485, 'អំប្រ៊ីយ៉ុង', 'right'),
      label(832, 485, 'ភ័ស្តុតាងម៉ូលេគុល', 'right', {
        fontSize: 22,
      }),
    ],
  },
  'eye-anatomy.webp': {
    outputs: ['bio-sense-organs-khmer-labeled.webp'],
    labels: [
      label(298, 169, 'ក័រណេ', 'left'),
      label(298, 247, 'អ៊ីរីស', 'left'),
      label(298, 326, 'ប្រស្រីភ្នែក', 'left'),
      label(298, 405, 'កែវភ្នែក', 'left'),
      label(298, 485, 'សាច់ដុំស៊ីលីយែរ', 'left', { fontSize: 22 }),
      label(1285, 86, 'វីត្រេ', 'right'),
      label(1285, 330, 'រ៉េទីន', 'right'),
      label(1285, 520, 'ចំណុចខ្វាក់', 'right'),
      label(1285, 744, 'សរសៃប្រសាទអុបទិក', 'right', {
        fontSize: 22,
      }),
    ],
  },
  'flower-anatomy.webp': {
    outputs: ['bio-angiosperms-1-khmer-labeled.webp'],
    labels: [
      label(1328, 128, 'ស្ទិចម៉ាត', 'right'),
      label(1328, 335, 'ស្ទីល', 'right'),
      label(1328, 492, 'អូវែរ', 'right'),
      label(1328, 595, 'អូវុល', 'right'),
      label(240, 230, 'អង់ទែរ', 'left'),
      label(240, 387, 'ហ្វីឡាម៉ង់', 'left'),
      label(240, 550, 'ក្រោនផ្កា', 'left'),
      label(240, 717, 'ត្របកផ្កា', 'left'),
    ],
  },
  'flower-reproduction.webp': {
    outputs: ['bio-plant-reproduction-khmer-labeled.webp'],
    labels: [
      label(35, 35, 'ផ្ទេរលម្អង', 'right'),
      label(435, 35, 'បំពង់លម្អង', 'right'),
      label(835, 35, 'បង្កកំណើត', 'right'),
      label(1235, 35, 'គ្រាប់ និងផ្លែ', 'right'),
    ],
  },
  'fossil-formation.webp': {
    outputs: ['bio-fossil-record-khmer-labeled.webp'],
    labels: [
      label(152, 153, ['សារពាង្គកាយ', 'ស្លាប់'], 'above', {
        fontSize: 20,
        width: 190,
      }),
      label(405, 153, ['រំកិលគ្រប', 'យ៉ាងលឿន'], 'above', {
        fontSize: 20,
        width: 175,
      }),
      label(628, 153, ['ផ្នែកទន់', 'រលួយ'], 'above', {
        fontSize: 20,
        width: 150,
      }),
      label(875, 153, ['រ៉ែជំនួស', 'សំណល់រឹង'], 'above', {
        fontSize: 20,
        width: 175,
      }),
      label(1128, 153, ['ស្រទាប់ថ្ម', 'ត្រូវលើក'], 'above', {
        fontSize: 20,
        width: 175,
      }),
      label(1366, 153, ['ផូស៊ីល', 'លេចចេញ'], 'above', {
        fontSize: 20,
        width: 150,
      }),
    ],
  },
  'gene-expression.webp': {
    outputs: [
      'bio-gene-expression-khmer-labeled.webp',
      'bio-dna-exercises-advanced-khmer-labeled.webp',
    ],
    labels: [
      label(210, 67, 'ADN ក្នុងណ្វៃយ៉ូ', 'right', { fontSize: 23 }),
      label(440, 373, 'ចម្លងទៅ ARNm', 'left', { fontSize: 23 }),
      label(600, 345, 'ARNm ចេញពីណ្វៃយ៉ូ', 'above', {
        fontSize: 22,
        offsetX: 45,
      }),
      label(737, 390, 'រីបូសូមភ្ជាប់', 'below', {
        fontSize: 23,
        offsetY: 22,
      }),
      label(1003, 190, 'ARNt បកប្រែកូដុង', 'right', { fontSize: 22 }),
      label(1458, 220, 'ប្រូតេអ៊ីន', 'left'),
    ],
  },
  'gymnosperm-cones.webp': {
    outputs: ['bio-gymnosperms-khmer-labeled.webp'],
    labels: [
      label(180, 52, 'កោណឈ្មោល', 'right'),
      label(893, 70, 'កោណញី', 'right'),
    ],
  },
  'monocot-dicot.webp': {
    outputs: ['bio-angiosperms-2-khmer-labeled.webp'],
    labels: [
      label(35, 35, 'កូទីលេដុន', 'right', { fontSize: 22 }),
      label(35, 220, 'សរសៃស្លឹក', 'right', { fontSize: 22 }),
      label(35, 398, 'ប្រព័ន្ធឫស', 'right', { fontSize: 22 }),
      label(35, 574, 'ផ្នែកផ្កា', 'right', { fontSize: 22 }),
      label(35, 748, 'បាច់សរសៃនាំ', 'right', { fontSize: 22 }),
      label(835, 35, 'កូទីលេដុន', 'right', { fontSize: 22 }),
      label(835, 220, 'សរសៃស្លឹក', 'right', { fontSize: 22 }),
      label(835, 398, 'ប្រព័ន្ធឫស', 'right', { fontSize: 22 }),
      label(835, 574, 'ផ្នែកផ្កា', 'right', { fontSize: 22 }),
      label(835, 748, 'បាច់សរសៃនាំ', 'right', { fontSize: 22 }),
    ],
  },
  'natural-selection.webp': {
    outputs: ['bio-darwin-khmer-labeled.webp'],
    labels: [
      label(35, 35, 'អថេរភាពក្នុងពពួក', 'right', { fontSize: 22 }),
      label(435, 35, 'ការជ្រើសរើស', 'right', { fontSize: 22 }),
      label(835, 35, 'រស់ និងបន្តពូជ', 'right', { fontSize: 22 }),
      label(1235, 35, 'ប្រេកង់កើនឡើង', 'right', { fontSize: 22 }),
    ],
  },
  'neuron.webp': {
    outputs: ['bio-nervous-system-khmer-labeled.webp'],
    labels: [
      label(127, 106, 'ដង់ឌ្រីត', 'right'),
      label(430, 305, 'តួកោសិកា', 'above', {
        addMarker: '2',
        fontSize: 23,
      }),
      label(520, 355, 'អាក់សូន', 'above'),
      label(686, 379, 'ស្រទាប់មីអេលីន', 'above', {
        fontSize: 22,
        offsetY: -58,
      }),
      label(824, 390, 'ចន្លោះរ៉ង់វីយេ', 'above', {
        fontSize: 22,
        offsetY: 18,
      }),
      label(1128, 250, 'ចុងអាក់សូន', 'right'),
      label(1537, 530, ['ប៊ូតុងមុន', 'ស៊ីណាប់'], 'left', {
        fontSize: 22,
      }),
      label(1537, 680, ['ភ្នាសក្រោយ', 'ស៊ីណាប់'], 'left', {
        fontSize: 22,
      }),
    ],
  },
  'nitrogen-cycle.webp': {
    outputs: ['bio-matter-cycles-khmer-labeled.webp'],
    labels: [
      label(275, 202, 'ចាប់អាសូត', 'right', { fontSize: 22 }),
      label(450, 780, 'អាម៉ូញ៉ូម', 'above', { fontSize: 22 }),
      label(760, 780, 'នីទ្រីត', 'above', { fontSize: 22 }),
      label(1078, 780, 'នីត្រាត', 'above', { fontSize: 22 }),
      label(820, 540, 'រុក្ខជាតិស្រូបយក', 'right', { fontSize: 22 }),
      label(1080, 365, 'ខ្សែអាហារ', 'right', { fontSize: 22 }),
      label(1475, 780, 'អាម៉ូនីភិកាស្យុង', 'left', { fontSize: 22 }),
      label(1355, 196, 'ដេនីទ្រីភិកាស្យុង', 'left', { fontSize: 22 }),
    ],
  },
  'plant-transport.webp': {
    outputs: ['bio-plant-transport-growth-khmer-labeled.webp'],
    labels: [
      label(132, 780, 'ឫសស្រូបទឹក', 'right'),
      label(352, 490, 'ដើម', 'left'),
      label(700, 62, 'ស្លឹក', 'right'),
      label(1060, 60, 'បាច់សរសៃនាំ', 'right'),
    ],
  },
  'population-growth.webp': {
    outputs: ['bio-population-khmer-labeled.webp'],
    labels: [
      label(35, 35, 'កំណើនរាង J', 'right'),
      label(835, 35, 'កំណើនរាង S', 'right'),
    ],
  },
  'protein-structure.webp': {
    outputs: ['bio-proteins-khmer-labeled.webp'],
    labels: [
      label(55, 55, 'រចនាសម្ព័ន្ធបឋម', 'right', {
        addMarker: '1',
        fontSize: 22,
      }),
      label(455, 55, 'រចនាសម្ព័ន្ធទុតិយ', 'right', {
        addMarker: '2',
        fontSize: 22,
      }),
      label(855, 55, 'រចនាសម្ព័ន្ធតតិយ', 'right', {
        addMarker: '3',
        fontSize: 22,
      }),
      label(1255, 55, 'រចនាសម្ព័ន្ធចតុត្ថ', 'right', {
        addMarker: '4',
        fontSize: 22,
      }),
    ],
  },
  'recombinant-dna.webp': {
    outputs: ['bio-biotechnology-khmer-labeled.webp'],
    labels: [
      label(530, 40, 'យកប្លាស្មីត', 'right', { fontSize: 22 }),
      label(1100, 40, 'កាត់ ADN គោលដៅ', 'right', { fontSize: 22 }),
      label(1410, 330, 'បញ្ចូលសែន', 'left', { fontSize: 22 }),
      label(1050, 780, 'អង់ស៊ីមលីហ្គាស', 'above', { fontSize: 22 }),
      label(520, 830, 'បញ្ចូលក្នុងបាក់តេរី', 'above', { fontSize: 22 }),
      label(185, 435, 'ក្លូន និងផលិតប្រូតេអ៊ីន', 'right', {
        fontSize: 21,
      }),
    ],
  },
  'transcription-translation.webp': {
    outputs: [
      'bio-transcription-exercises-khmer-labeled.webp',
      'bio-dna-exercises-exam-khmer-labeled.webp',
    ],
    labels: [
      label(50, 55, 'កំណត់ខ្សែគំរូ ADN', 'right', { fontSize: 23 }),
      label(50, 340, 'ចម្លងទៅ ARNm', 'right', { fontSize: 23 }),
      label(50, 615, 'បកប្រែជាប្រូតេអ៊ីន', 'right', { fontSize: 23 }),
    ],
  },
};

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const graphemeCount = (value) =>
  [...new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(value)]
    .length;

function renderLabel(item) {
  const fontSize = item.fontSize ?? 25;
  const lineHeight = fontSize + 8;
  const longestLine = Math.max(...item.lines.map(graphemeCount));
  const width =
    item.width ?? Math.max(92, Math.min(350, longestLine * fontSize * 0.72 + 30));
  const height = item.lines.length * lineHeight + 16;
  const gap = item.addMarker ? 29 : 25;

  let left;
  let top;
  if (item.side === 'left') {
    left = item.x - gap - width;
    top = item.y - height / 2;
  } else if (item.side === 'above') {
    left = item.x - width / 2;
    top = item.y - gap - height;
  } else if (item.side === 'below') {
    left = item.x - width / 2;
    top = item.y + gap;
  } else {
    left = item.x + gap;
    top = item.y - height / 2;
  }

  left = Math.max(8, Math.min(1600 - width - 8, left + (item.offsetX ?? 0)));
  top = Math.max(8, Math.min(900 - height - 8, top + (item.offsetY ?? 0)));

  const targetX = Math.max(left, Math.min(item.x, left + width));
  const targetY = Math.max(top, Math.min(item.y, top + height));
  const text = item.lines
    .map(
      (line, index) =>
        `<tspan x="${left + 15}" y="${top + 11 + fontSize + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const marker = item.addMarker
    ? `<circle cx="${item.x}" cy="${item.y}" r="21" fill="#2f6b4f" stroke="#fffdf7" stroke-width="4"/>
       <text x="${item.x}" y="${item.y + 8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#ffffff">${item.addMarker}</text>`
    : '';

  return `
    <line x1="${item.x}" y1="${item.y}" x2="${targetX}" y2="${targetY}" stroke="#2f5f48" stroke-width="2.5"/>
    ${marker}
    <rect x="${left}" y="${top}" width="${width}" height="${height}" rx="11" fill="#fffdf7" fill-opacity="0.96" stroke="#456c59" stroke-width="2"/>
    <text font-family="Khmer OS Content" font-size="${fontSize}" fill="#153b2b">${text}</text>`;
}

let outputCount = 0;
for (const [sourceName, spec] of Object.entries(SPECS)) {
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">${spec.labels
      .map(renderLabel)
      .join('')}</svg>`,
  );
  for (const outputName of spec.outputs) {
    await sharp(path.join(IMAGE_DIR, sourceName))
      .composite([{ input: overlay, left: 0, top: 0 }])
      .webp({ quality: 90, effort: 5 })
      .toFile(path.join(IMAGE_DIR, outputName));
    outputCount += 1;
    console.log(`${sourceName} -> ${outputName}`);
  }
}

if (outputCount !== 25) {
  throw new Error(`Expected 25 labeled outputs, generated ${outputCount}`);
}

console.log(`Generated ${outputCount} point-labeled Biology images.`);
