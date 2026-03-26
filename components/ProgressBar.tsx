"use client";

interface Step {
  id: number;
  title: string;
  description: string;
}

export default function ProgressBar({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="w-full">
      {/* Mobile: Simple indicator */}
      <div className="sm:hidden flex items-center justify-center gap-2 mb-2">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`w-3 h-3 rounded-full transition-all ${
              s.id === currentStep
                ? "bg-[#C8A951] scale-125"
                : s.id < currentStep
                ? "bg-[#1B2A4A]"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="sm:hidden text-center text-sm text-gray-500">
        Step {currentStep} of {steps.length}
      </p>

      {/* Desktop: Full progress bar */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#C8A951] z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step.id === currentStep
                  ? "bg-[#C8A951] text-white ring-4 ring-[#C8A951]/20"
                  : step.id < currentStep
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.id < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                step.id === currentStep ? "text-[#C8A951]" : step.id < currentStep ? "text-[#1B2A4A]" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
