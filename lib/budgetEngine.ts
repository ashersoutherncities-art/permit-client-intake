// AI Budget Generation Engine
// Uses Charlotte, NC market-rate data to generate realistic estimates
// Enhanced with photo analysis integration for recommended budgets

import type { VisionAnalysis } from './visionAnalysis';

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
  photoAnalysis?: VisionAnalysis;
}

export interface LineItem {
  label: string;
  amount: number;
  isRecommended?: boolean; // true if added by photo analysis
}

export interface BudgetBreakdown {
  lineItems: LineItem[];
  total: number;
  notes: string[];
}

export interface EnhancedBudgetResult {
  standardBudget: BudgetBreakdown;
  recommendedBudget: BudgetBreakdown | null;
  recommendations: Array<{
    item: string;
    priority: string;
    estimatedCostRange: string;
    included: boolean;
  }>;
  photoAnalysis: VisionAnalysis | null;
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

function buildBaseBudget(input: BudgetInput): BudgetBreakdown {
  const rate = RATES[input.projectType as keyof typeof RATES] || RATES["Renovation"];
  const complexity = analyzeScope(input.scopeOfWork);
  const sf = Math.max(100, input.squareFootage);

  const materialPerSF = rate.materials.min + (rate.materials.max - rate.materials.min) * complexity;
  const laborPerSF = rate.labor.min + (rate.labor.max - rate.labor.min) * complexity;

  const materials = Math.round(sf * materialPerSF);
  const labor = Math.round(sf * laborPerSF);

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

  const softCosts = Math.round((materials + labor) * 0.08);
  const contingencyRate = 0.10 + complexity * 0.05;
  const contingency = Math.round((materials + labor + permitTotal + softCosts) * contingencyRate);

  const total = materials + labor + permitTotal + softCosts + contingency;

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

export function generateBudget(input: BudgetInput): BudgetBreakdown {
  return buildBaseBudget(input);
}

export function generateEnhancedBudget(input: BudgetInput): EnhancedBudgetResult {
  const standardBudget = buildBaseBudget(input);

  if (!input.photoAnalysis) {
    return {
      standardBudget,
      recommendedBudget: null,
      recommendations: [],
      photoAnalysis: null,
    };
  }

  const analysis = input.photoAnalysis;
  const multiplier = analysis.budgetMultiplier;

  // Apply multiplier to materials and labor
  const adjustedLineItems: LineItem[] = standardBudget.lineItems.map((item) => {
    if (item.label === "Materials" || item.label === "Labor") {
      return { ...item, amount: Math.round(item.amount * multiplier) };
    }
    return { ...item };
  });

  // Add recommended scope items as line items
  const recommendedItems: LineItem[] = [];
  for (const rec of analysis.recommendedScopeItems) {
    if (rec.priority === 'required' || rec.priority === 'recommended') {
      // Parse cost range to get midpoint
      const costMatch = rec.estimatedCostRange.match(/\$?([\d,]+)/g);
      if (costMatch && costMatch.length >= 1) {
        const costs = costMatch.map((c) => parseInt(c.replace(/[$,]/g, '')));
        const midpoint = costs.length >= 2 ? Math.round((costs[0] + costs[1]) / 2) : costs[0];
        recommendedItems.push({
          label: `📋 ${rec.item}`,
          amount: midpoint,
          isRecommended: true,
        });
      }
    }
  }

  // Adjust contingency based on risk
  const riskCount = analysis.riskFactors.length + analysis.safetyFlags.length;
  const adjustedContingencyRate = Math.min(0.25, 0.10 + riskCount * 0.02);

  // Find and replace contingency line
  const materialsLabor = adjustedLineItems
    .filter((i) => i.label === "Materials" || i.label === "Labor")
    .reduce((s, i) => s + i.amount, 0);
  const otherCosts = adjustedLineItems
    .filter((i) => !i.label.startsWith("Contingency") && i.label !== "Materials" && i.label !== "Labor")
    .reduce((s, i) => s + i.amount, 0);
  const recommendedExtra = recommendedItems.reduce((s, i) => s + i.amount, 0);

  const newContingency = Math.round((materialsLabor + otherCosts + recommendedExtra) * adjustedContingencyRate);

  const finalLineItems = [
    ...adjustedLineItems.filter((i) => !i.label.startsWith("Contingency")),
    ...recommendedItems,
    { label: `Contingency (${Math.round(adjustedContingencyRate * 100)}% - Risk Adjusted)`, amount: newContingency, isRecommended: riskCount > 0 },
  ];

  const recommendedTotal = finalLineItems.reduce((s, i) => s + i.amount, 0);

  const recommendedNotes = [...standardBudget.notes];
  if (multiplier > 1.0) {
    recommendedNotes.push(`Photo analysis indicates ${analysis.overallCondition} condition — budget adjusted by ${Math.round((multiplier - 1) * 100)}%.`);
  }
  if (analysis.safetyFlags.length > 0) {
    recommendedNotes.push(`⚠️ Safety concerns identified: ${analysis.safetyFlags.join('; ')}`);
  }
  if (riskCount > 2) {
    recommendedNotes.push("Elevated contingency due to multiple risk factors identified in photos.");
  }

  const recommendations = analysis.recommendedScopeItems.map((rec) => ({
    item: rec.item,
    priority: rec.priority,
    estimatedCostRange: rec.estimatedCostRange,
    included: rec.priority === 'required' || rec.priority === 'recommended',
  }));

  return {
    standardBudget,
    recommendedBudget: {
      lineItems: finalLineItems,
      total: recommendedTotal,
      notes: recommendedNotes,
    },
    recommendations,
    photoAnalysis: analysis,
  };
}
