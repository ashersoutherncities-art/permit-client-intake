"use client";

import { FormData } from "@/app/page";
import { BudgetBreakdown } from "@/lib/budgetEngine";

interface Props {
  data: FormData;
  budget: BudgetBreakdown | null;
}

export default function SuccessPage({ data, budget }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Application Submitted!</h1>
          <p className="text-gray-500 mb-6">
            Thank you, {data.firstName}. Your project intake form has been received successfully.
          </p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-5 text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Submission Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{data.firstName} {data.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Property</span>
                <span className="font-medium text-right max-w-[60%]">{data.propertyAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Project Type</span>
                <span className="font-medium">{data.projectType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Square Footage</span>
                <span className="font-medium">{parseInt(data.squareFootage).toLocaleString()} SF</span>
              </div>
              {budget && (
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Budget Estimate</span>
                  <span className="font-bold text-[#C8A951]">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(budget.total)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              📧 A confirmation email will be sent to <strong>{data.email}</strong>. 
              Our team will review your submission and contact you within 24-48 business hours.
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Reference ID: SCE-{Date.now().toString(36).toUpperCase()}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="step-btn-primary w-full"
          >
            Submit Another Application
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Southern Cities Enterprises. All rights reserved.
        </p>
      </div>
    </main>
  );
}
