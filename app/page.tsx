"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProgressBar from "@/components/ProgressBar";
import StepClient from "@/components/StepClient";
import StepProject from "@/components/StepProject";
import StepScope from "@/components/StepScope";
import StepContractor from "@/components/StepContractor";
import StepPermits from "@/components/StepPermits";
import StepFinancing from "@/components/StepFinancing";
import BudgetResult from "@/components/BudgetResult";
import SuccessPage from "@/components/SuccessPage";
import { generateBudget, BudgetBreakdown } from "@/lib/budgetEngine";
import { generatePDF } from "@/lib/pdfGenerator";
import { createPermitEntry } from "@/lib/permitIntegration";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const formSchema = z.object({
  // Client
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  tinEin: z.string().min(9, "Valid TIN/EIN is required"),
  articlesOfOrg: z.any().refine((f) => f && f.length > 0, "Articles of Organization is required"),

  // Project
  propertyAddress: z.string().min(5, "Property address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  squareFootage: z.string().min(1, "Square footage is required"),
  projectType: z.enum(["New Build", "Renovation", "Site Improvements"], {
    message: "Project type is required",
  }),
  occupancyType: z.enum(["Primary Residence", "Investment/Rental"], {
    message: "Occupancy type is required",
  }),
  numberOfUnits: z.string().min(1, "Number of units is required"),

  // Scope
  scopeOfWork: z.string().min(20, "Please provide a detailed scope of work (min 20 chars)"),
  estimatedCost: z.string().optional(),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),

  // Contractor
  usingOwnContractor: z.boolean(),
  contractorName: z.string().optional(),

  // Permits
  permitElectrical: z.boolean(),
  permitMechanical: z.boolean(),
  permitHVAC: z.boolean(),

  // Financing
  financingType: z.enum(["Cash", "Hard Money", "Traditional", "Bridge", "Other"], {
    message: "Financing type is required",
  }),
  lenderName: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.completionDate) {
      return new Date(data.completionDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: "Completion date must be after start date", path: ["completionDate"] }
).refine(
  (data) => {
    if (data.usingOwnContractor && (!data.contractorName || data.contractorName.trim() === "")) {
      return false;
    }
    return true;
  },
  { message: "Contractor name is required when using own contractor", path: ["contractorName"] }
);

export type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Client Info", description: "Your details" },
  { id: 2, title: "Project", description: "Property details" },
  { id: 3, title: "Scope & Budget", description: "Work scope" },
  { id: 4, title: "Contractor", description: "Contractor info" },
  { id: 5, title: "Permits", description: "Required permits" },
  { id: 6, title: "Financing", description: "Payment details" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [permitReferenceId, setPermitReferenceId] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usingOwnContractor: false,
      permitElectrical: false,
      permitMechanical: false,
      permitHVAC: false,
    },
    mode: "onTouched",
  });

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["firstName", "lastName", "email", "phone", "tinEin", "articlesOfOrg"],
    2: ["propertyAddress", "city", "state", "zipCode", "squareFootage", "projectType", "occupancyType", "numberOfUnits"],
    3: ["scopeOfWork", "estimatedCost", "startDate", "completionDate"],
    4: ["usingOwnContractor", "contractorName"],
    5: ["permitElectrical", "permitMechanical", "permitHVAC"],
    6: ["financingType", "lenderName"],
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep];
    const valid = await trigger(fields as any);
    if (valid) {
      if (currentStep < 6) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or image file (JPEG, PNG, GIF, WebP)");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File must be under 10MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateBudget = async () => {
    const values = getValues();
    setIsGenerating(true);
    try {
      const result = generateBudget({
        scopeOfWork: values.scopeOfWork,
        squareFootage: parseInt(values.squareFootage) || 0,
        projectType: values.projectType,
        occupancyType: values.occupancyType,
        permits: {
          electrical: values.permitElectrical,
          mechanical: values.permitMechanical,
          hvac: values.permitHVAC,
        },
        estimatedCost: values.estimatedCost ? parseFloat(values.estimatedCost.replace(/[^0-9.]/g, "")) : undefined,
      });
      setBudget(result);
    } catch {
      alert("Error generating budget. Please try again.");
    }
    setIsGenerating(false);
  };

  const onSubmit = async (data: FormData) => {
    // Store in localStorage
    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: { ...data, articlesOfOrg: fileName },
      fileBase64,
      budget,
    };

    const existing = JSON.parse(localStorage.getItem("permit-submissions") || "[]");
    existing.push(submission);
    localStorage.setItem("permit-submissions", JSON.stringify(existing));

    // Generate PDF
    try {
      generatePDF(data, budget, fileName);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }

    // Create permit entry in permit-manager's localStorage
    try {
      const refId = createPermitEntry(data, budget);
      setPermitReferenceId(refId);

      // Send confirmation email
      try {
        const emailPayload = {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            propertyAddress: data.propertyAddress,
            squareFootage: data.squareFootage,
            projectType: data.projectType,
            occupancyType: data.occupancyType,
            scopeOfWork: data.scopeOfWork,
            estimatedCost: data.estimatedCost,
            startDate: data.startDate,
            completionDate: data.completionDate,
            usingOwnContractor: data.usingOwnContractor,
            contractorName: data.contractorName,
            permitElectrical: data.permitElectrical,
            permitMechanical: data.permitMechanical,
            permitHVAC: data.permitHVAC,
            financingType: data.financingType,
            lenderName: data.lenderName,
          },
          budget,
          referenceId: refId,
        };

        const res = await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (res.ok) {
          setEmailSent(true);
        } else {
          console.error("Email API error:", await res.text());
          setEmailError(true);
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        setEmailError(true);
      }
    } catch (e) {
      console.error("Permit integration failed:", e);
    }

    setSubmitted(true);
  };

  if (submitted) {
    return <SuccessPage data={getValues()} budget={budget} referenceId={permitReferenceId} emailSent={emailSent} emailError={emailError} />;
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <span className="text-[#C8A951] text-xl font-bold">SC</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Southern Cities Enterprises</h1>
              <p className="text-sm text-gray-500">Permit & Project Intake Portal</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar steps={STEPS} currentStep={currentStep} />

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            {/* Step Title */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1B2A4A]">
                Step {currentStep}: {STEPS[currentStep - 1].title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{STEPS[currentStep - 1].description}</p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <StepClient register={register} errors={errors} onFileChange={handleFileChange} fileName={fileName} />
            )}
            {currentStep === 2 && <StepProject register={register} errors={errors} control={control} setValue={setValue} watch={watch} />}
            {currentStep === 3 && <StepScope register={register} errors={errors} />}
            {currentStep === 4 && <StepContractor register={register} errors={errors} watch={watch} />}
            {currentStep === 5 && <StepPermits register={register} />}
            {currentStep === 6 && <StepFinancing register={register} errors={errors} control={control} />}

            {/* Budget Generation (show on step 6) */}
            {currentStep === 6 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleGenerateBudget}
                  disabled={isGenerating}
                  className="w-full py-3 bg-[#1B2A4A] text-white rounded-lg font-semibold hover:bg-[#243660] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating Budget Estimate...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Generate AI Budget Estimate
                    </>
                  )}
                </button>
                {budget && <BudgetResult budget={budget} clientEstimate={getValues().estimatedCost} />}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button type="button" onClick={handleBack} className="step-btn-secondary">
                  ← Back
                </button>
              ) : (
                <div />
              )}
              {currentStep < 6 ? (
                <button type="button" onClick={handleNext} className="step-btn-primary">
                  Next →
                </button>
              ) : (
                <button type="submit" className="step-btn bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg">
                  Submit Application ✓
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Southern Cities Enterprises. All rights reserved.
        </p>
      </div>
    </main>
  );
}
