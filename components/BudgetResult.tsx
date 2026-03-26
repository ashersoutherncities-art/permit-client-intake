"use client";

import { BudgetBreakdown } from "@/lib/budgetEngine";

interface Props {
  budget: BudgetBreakdown;
  clientEstimate?: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function BudgetResult({ budget, clientEstimate }: Props) {
  const clientNum = clientEstimate ? parseFloat(clientEstimate.replace(/[^0-9.]/g, "")) : 0;
  const diff = clientNum ? budget.total - clientNum : 0;

  return (
    <div className="mt-6 bg-gradient-to-br from-[#1B2A4A] to-[#243660] rounded-xl p-6 text-white animate-fadeIn">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#C8A951]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        AI Budget Estimate
      </h3>

      <div className="space-y-3">
        {budget.lineItems.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">{item.label}</span>
            <span className="font-semibold">{formatCurrency(item.amount)}</span>
          </div>
        ))}

        <div className="border-t border-white/20 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-[#C8A951] font-bold text-lg">Total Estimate</span>
            <span className="text-[#C8A951] font-bold text-xl">{formatCurrency(budget.total)}</span>
          </div>
        </div>

        {clientNum > 0 && (
          <div className="bg-white/10 rounded-lg p-3 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Your Estimate</span>
              <span>{formatCurrency(clientNum)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-300">Difference</span>
              <span className={diff > 0 ? "text-red-400" : "text-green-400"}>
                {diff > 0 ? "+" : ""}{formatCurrency(diff)}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        * This is an AI-generated estimate based on Charlotte, NC market rates. Actual costs may vary.
        A detailed proposal will be provided after review.
      </p>
    </div>
  );
}
