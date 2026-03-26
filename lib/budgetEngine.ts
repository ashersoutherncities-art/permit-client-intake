// AI Budget Generation Engine
// Uses Charlotte, NC market-rate data to generate realistic estimates

export interface BudgetInput {
  scopeOfWork: string;
  squareFootage: number;
  projectType: string;
  occupancyType: string;
  permits: {
    electrical: boolean;
    mechanical: boolean;
    hvac: boolean;
  };
  estimatedCost?: number;
}

export interface LineItem {
  label: string;
  amount: number;
}

export interface BudgetBreakdown {
  lineItems: LineItem[];
  total: number;
  notes: string[];
}

// Charlotte, NC market rates (per SF)
const RATES = {
  "New Build": {
    materials: { min: 55, max: 85 },
    labor: { min: 45, max: 75 },
    basePermit: 2500,
  },
  "Renovation": {
    materials: { min: 35, max: 65 },
    labor: { min: 30, max: 55 },
    basePermit: 1500,
  },
  "Site Improvements": {
    materials: { min: 15, max: 40 },
    labor: { min: 20, max: 45 },
    basePermit: 1000,
  },
};

const PERMIT_COSTS = {
  electrical: { min: 500, max: 2500 },
  mechanical: { min: 750, max: 3000 },
  hvac: { min: 1000, max: 4000 },
};

// Keyword analysis for scope complexity
function analyzeScope(scope: string): number {
  const complexKeywords = [
    "structural", "foundation", "load-bearing", "commercial", "multi-story",
    "addition", "expansion", "custom", "high-end", "luxury", "demolition",
    "environmental", "historic", "ada", "accessibility",
  ];
  const simpleKeywords = [
    "paint", "cosmetic", "minor", "basic", "standard", "simple",
    "repair", "patch", "touch-up",
  ];

  const lower = scope.toLowerCase();
  let score = 0.5; // baseline

  complexKeywords.forEach((k) => { if (lower.includes(k)) score += 0.05; });
  simpleKeywords.forEach((k) => { if (lower.includes(k)) score -= 0.05; });

  return Math.max(0.2, Math.min(1.0, score));
}

export function generateBudget(input: BudgetInput): BudgetBreakdown {
  const rate = RATES[input.projectType as keyof typeof RATES] || RATES["Renovation"];
  const complexity = analyzeScope(input.scopeOfWork);
  const sf = Math.max(100, input.squareFootage);

  // Calculate per-SF costs using complexity as interpolation factor
  const materialPerSF = rate.materials.min + (rate.materials.max - rate.materials.min) * complexity;
  const laborPerSF = rate.labor.min + (rate.labor.max - rate.labor.min) * complexity;

  const materials = Math.round(sf * materialPerSF);
  const labor = Math.round(sf * laborPerSF);

  // Permits
  let permitTotal = rate.basePermit;
  const permitItems: LineItem[] = [];

  if (input.permits.electrical) {
    const cost = Math.round(PERMIT_COSTS.electrical.min + (PERMIT_COSTS.electrical.max - PERMIT_COSTS.electrical.min) * (sf / 5000));
    permitTotal += cost;
    permitItems.push({ label: "  → Electrical Permit", amount: cost });
  }
  if (input.permits.mechanical) {
    const cost = Math.round(PERMIT_COSTS.mechanical.min + (PERMIT_COSTS.mechanical.max - PERMIT_COSTS.mechanical.min) * (sf / 5000));
    permitTotal += cost;
    permitItems.push({ label: "  → Mechanical Permit", amount: cost });
  }
  if (input.permits.hvac) {
    const cost = Math.round(PERMIT_COSTS.hvac.min + (PERMIT_COSTS.hvac.max - PERMIT_COSTS.hvac.min) * (sf / 5000));
    permitTotal += cost;
    permitItems.push({ label: "  → HVAC Permit", amount: cost });
  }

  // Soft costs (design, engineering, inspections)
  const softCosts = Math.round((materials + labor) * 0.08);

  // Contingency (10-15% based on complexity)
  const contingencyRate = 0.10 + complexity * 0.05;
  const contingency = Math.round((materials + labor + permitTotal + softCosts) * contingencyRate);

  const subtotal = materials + labor + permitTotal + softCosts;
  const total = subtotal + contingency;

  const lineItems: LineItem[] = [
    { label: "Materials", amount: materials },
    { label: "Labor", amount: labor },
    { label: "Permits & Fees", amount: permitTotal },
    ...permitItems,
    { label: "Soft Costs (Design/Engineering)", amount: softCosts },
    { label: `Contingency (${Math.round(contingencyRate * 100)}%)`, amount: contingency },
  ];

  const notes: string[] = [];
  if (input.occupancyType === "Investment/Rental") {
    notes.push("Investment properties may require additional inspections and code compliance reviews.");
  }
  if (complexity > 0.7) {
    notes.push("Complex scope detected — budget includes premium for specialized work.");
  }
  if (sf > 5000) {
    notes.push("Large-scale project may qualify for volume material discounts.");
  }

  return { lineItems, total, notes };
}
