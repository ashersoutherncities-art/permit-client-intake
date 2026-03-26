"use client";

import { FormData } from "@/app/page";
import { BudgetBreakdown } from "@/lib/budgetEngine";
import type { VisionAnalysis } from "@/lib/visionAnalysis";

interface Props {
  data: FormData;
  budget: BudgetBreakdown | null;
  referenceId?: string;
  emailSent?: boolean;
  emailError?: boolean | string;
  photoAnalysis?: VisionAnalysis | null;
  driveFolderLink?: string;
  uploadedPhotos?: Array<{ fileName: string; category: string; webViewLink: string }>;
  recommendationsAccepted?: boolean | null;
}

const CONDITION_LABELS: Record<string, string> = {
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  major_work_needed: "Major Work Needed",
};

export default function SuccessPage({
  data, budget, referenceId, emailSent, emailError,
  photoAnalysis, driveFolderLink, uploadedPhotos, recommendationsAccepted,
}: Props) {
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

          {/* Photo Analysis Results */}
          {photoAnalysis && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <h4 className="font-semibold text-purple-800">AI Photo Analysis</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-600">Property Condition</span>
                  <span className="font-semibold text-purple-800">
                    {CONDITION_LABELS[photoAnalysis.overallCondition] || photoAnalysis.overallCondition} ({photoAnalysis.conditionScore}/10)
                  </span>
                </div>
                <p className="text-purple-700 text-xs">{photoAnalysis.summary}</p>
                {photoAnalysis.identifiedIssues.length > 0 && (
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs font-semibold text-purple-700">Issues Found:</span>
                    <ul className="text-xs text-purple-600 mt-1 space-y-0.5">
                      {photoAnalysis.identifiedIssues.slice(0, 5).map((issue, i) => (
                        <li key={i}>• [{issue.severity}] {issue.category}: {issue.description}</li>
                      ))}
                      {photoAnalysis.identifiedIssues.length > 5 && (
                        <li className="text-purple-400">...and {photoAnalysis.identifiedIssues.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {recommendationsAccepted !== null && (
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs text-purple-600">
                      Recommendations: <strong>{recommendationsAccepted ? "✅ Accepted" : "❌ Declined (using standard budget)"}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo Upload Confirmation */}
          {uploadedPhotos && uploadedPhotos.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📸</span>
                <h4 className="font-semibold text-indigo-800">Photos Uploaded</h4>
              </div>
              <div className="space-y-1 text-xs text-indigo-700">
                {uploadedPhotos.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{p.fileName}</span>
                    <span className="text-indigo-400">({p.category})</span>
                  </div>
                ))}
              </div>
              {driveFolderLink && (
                <a
                  href={driveFolderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-indigo-600 underline hover:text-indigo-800"
                >
                  📂 View in Google Drive →
                </a>
              )}
            </div>
          )}

          {/* Permit Queue Confirmation */}
          {referenceId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏗️</span>
                <h4 className="font-semibold text-green-800">Project Added to Permit Queue</h4>
              </div>
              <p className="text-sm text-green-700 mb-2">
                Your project has been automatically submitted to our permit tracking system with status <strong>&quot;Potential&quot;</strong>.
              </p>
              <div className="bg-white/60 rounded px-3 py-2 text-xs font-mono text-green-800">
                Reference ID: <strong>{referenceId}</strong>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Save this reference ID — it links your intake form to the permit tracking system.
              </p>
            </div>
          )}

          {/* Email Confirmation Status */}
          {emailSent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✉️</span>
                <h4 className="font-semibold text-blue-800">Confirmation Email Sent</h4>
              </div>
              <p className="text-sm text-blue-700">
                A detailed confirmation email has been sent to <strong>{data.email}</strong> with your submission summary, budget breakdown, and next steps.
              </p>
            </div>
          )}

          {emailError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚠️</span>
                <h4 className="font-semibold text-yellow-800">Email Delivery Issue</h4>
              </div>
              <p className="text-sm text-yellow-700">
                We couldn&apos;t send a confirmation email to <strong>{data.email}</strong> at this time. Don&apos;t worry — your submission has been recorded successfully. Our team will contact you within 2-3 business days.
              </p>
            </div>
          )}

          {!emailSent && !emailError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                📧 A confirmation email will be sent to <strong>{data.email}</strong>. 
                Our team will review your submission and contact you within 2-3 business days.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-800 text-sm mb-2">📋 Next Steps</h4>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Our team reviews your intake form and budget estimate</li>
              {photoAnalysis && <li>AI photo analysis findings are reviewed by our estimator</li>}
              <li>We verify property details and permit requirements</li>
              <li>You&apos;ll receive a call/email to discuss project scope</li>
              <li>Permit applications are prepared and submitted on your behalf</li>
            </ol>
          </div>

          {!referenceId && (
            <p className="text-xs text-gray-400 mb-4">
              Reference ID: SCE-{Date.now().toString(36).toUpperCase()}
            </p>
          )}

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
