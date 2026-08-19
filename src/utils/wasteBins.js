export const WASTE_BINS = {
  recyclable: {
    id: 'recyclable',
    name: 'Blue Bin',
    category: 'Recyclable Waste',
    color: '#1976D2',
    softColor: 'rgba(25,118,210,0.12)',
    icon: 'recycling',
    description: 'Paper, cardboard, bottles, cans and other recyclables.',
  },
  organic: {
    id: 'organic',
    name: 'Green Bin',
    category: 'Organic Waste',
    color: '#2E7D32',
    softColor: 'rgba(46,125,50,0.12)',
    icon: 'organic',
    description: 'Food scraps, leaves, garden waste and biodegradable material.',
  },
  residual: {
    id: 'residual',
    name: 'Red Bin',
    category: 'General / Residual Waste',
    color: '#D32F2F',
    softColor: 'rgba(211,47,47,0.12)',
    icon: 'residual',
    description: 'Non-recyclable waste, dirty packaging and residual material.',
  },
};

const CATEGORY_BIN_IDS = {
  plastic: 'recyclable',
  paper: 'recyclable',
  cardboard: 'recyclable',
  glass: 'recyclable',
  metal: 'recyclable',
  organic: 'organic',
  'food-waste': 'organic',
  'garden-waste': 'organic',
  'e-waste': 'residual',
  hazardous: 'residual',
  residual: 'residual',
  general: 'residual',
};

export function getWasteBin(category) {
  const binId = CATEGORY_BIN_IDS[category?.slug] || 'residual';
  return WASTE_BINS[binId];
}

export function summarizeWasteBins(logs = []) {
  return Object.values(WASTE_BINS).map(bin => {
    const binLogs = logs.filter(log => getWasteBin(log.category).id === bin.id);
    return {
      ...bin,
      quantityKg: binLogs.reduce((total, log) => total + Number(log.quantityKg || 0), 0),
      entries: binLogs.length,
    };
  });
}
