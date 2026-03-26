"use client";

import { VisionAnalysis } from "@/lib/visionAnalysis";
import { EnhancedBudgetResult } from "@/lib/budgetEngine";

interface Props {
  result: EnhancedBudgetResult;
  onAcceptRecommendations: () => void;
  onRejectRecommendations: () => void;
  accepted: boolean | null;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const CONDITION_COLORS = {
  good: "text-green-600 bg-green-50",
  fair: "text-yellow-600 bg-yellow-50",
  poor: "text-orange-600 bg-orange-50",
  major_work_needed: "text-red-600 bg-red-50",
};

const CONDITION_LABELS = {
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  major_work_needed: "Major Work Needed",
};

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function PhotoAnalysisResult({ result, onAcceptRecommendations, onRejectRecommendations, accepted }: Props) {
  const { standardBudget, recommendedBudget, recommendations, photoAnalysis } = result;

  if (!photoAnalysis || !recommendedBudget) return null;

  const budgetDiff = recommendedBudget.total - standardBudget.total;
  const budgetDiffPercent = Math.round((budgetDiff / standardBudget.total) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Analysis Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <span>🔍</span> AI Photo Analysis
        </h3>

        {/* Condition Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Overall Condition:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${CONDITION_COLORS[photoAnalysis.overallCondition]}`}>
            {CONDITION_LABELS[photoAnalysis.overallCondition]}
          </span>
          <span className="text-sm text-gray-400">Score: {photoAnalysis.conditionScore}/10</span>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-4">{photoAnalysis.summary}</p>

        {/* Issues */}
        {photoAnalysis.identifiedIssues.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Identified Issues</h4>
            <div className="space-y-2">
              {photoAnalysis.identifiedIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[issue.severity]}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="text-gray-500 font-medium min-w-[80px]">{issue.category}</span>
                  <span className="text-gray-600">{issue.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Flags */}
        {photoAnalysis.safetyFlags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-semibold text-red-800 mb-1">⚠️ Safety Concerns</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {photoAnalysis.safetyFlags.map((flag, i) => (
                <li key={i}>• {flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Scope */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Recommended Scope of Work</h4>
          <p className="text-sm text-gray-600 mb-3">{photoAnalysis.scopeDescription}</p>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${
                  rec.priority === "required" ? "bg-red-500" :
                  rec.priority === "recommended" ? "bg-yellow-500" : "bg-gray-400"
                }`} />
                <span className="text-gray-700 flex-1">{rec.item}</span>
                <span className="text-gray-400 text-xs">{rec.estimatedCostRange}</span>
                {rec.included && (
                  <span className="text-green-600 text-xs font-medium">✓ Included</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Budget Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Budget */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-5 text-white">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span>📊</span> Standard Budget
          </h3>
          <div className="space-y-2">
            {standardBudget.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.label}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(standardBudget.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Budget */}
        <div className="bg-gradient-to-br from-[#1B2A4A] to-[#243660] rounded-xl p-5 text-white ring-2 ring-[#C8A951]">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span>⭐</span> Recommended Budget
            <span className="ml-auto text-xs bg-[#C8A951] text-[#1B2A4A] px-2 py-0.5 rounded-full font-bold">
              AI Enhanced
            </span>
          </h3>
          <div className="space-y-2">
            {recommendedBudget.lineItems.map((item, i) => (
              <div key={i} className={`flex justify-between text-sm ${item.isRecommended ? "text-[#C8A951]" : ""}`}>
                <span className={item.isRecommended ? "text-[#C8A951]" : "text-gray-300"}>{item.label}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-[#C8A951]">Total</span>
                <span className="font-bold text-lg text-[#C8A951]">{formatCurrency(recommendedBudget.total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 bg-white/10 rounded-lg p-2 text-center">
            <span className={`text-sm font-semibold ${budgetDiff > 0 ? "text-red-300" : "text-green-300"}`}>
              {budgetDiff > 0 ? "+" : ""}{formatCurrency(budgetDiff)} ({budgetDiff > 0 ? "+" : ""}{budgetDiffPercent}%)
            </span>
            <span className="text-xs text-gray-300 ml-2">vs Standard</span>
          </div>
        </div>
      </div>

      {/* Accept/Reject */}
      {accepted === null && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onAcceptRecommendations}
            className="flex-1 py-3 bg-[#1B2A4A] text-white rounded-lg font-semibold hover:bg-[#243660] transition-all flex items-center justify-center gap-2"
          >
            ✅ Accept Recommendations
          </button>
          <button
            type="button"
            onClick={onRejectRecommendations}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            ❌ Use Standard Budget
          </button>
        </div>
      )}

      {accepted === true && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <span className="text-green-700 font-semibold text-sm">✅ Recommendations accepted — using enhanced budget</span>
        </div>
      )}
      {accepted === false && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <span className="text-gray-600 font-semibold text-sm">Using standard budget (recommendations declined)</span>
        </div>
      )}
    </div>
  );
}
