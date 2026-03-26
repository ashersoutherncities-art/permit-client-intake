"use client";

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
}

export default function StepContractor({ register, errors, watch }: Props) {
  const usingOwn = watch("usingOwnContractor");

  return (
    <div className="space-y-5">
      <div>
        <label className="label-text">Using Your Own Contractor?</label>
        <div className="mt-2 flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register("usingOwnContractor")}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:ring-4 peer-focus:ring-[#C8A951]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C8A951]" />
          </label>
          <span className="text-sm font-medium text-gray-700">
            {usingOwn ? "Yes, I have a contractor" : "No, I need Southern Cities to provide one"}
          </span>
        </div>
      </div>

      {usingOwn && (
        <div className="animate-fadeIn">
          <label className="label-text">Contractor Name <span className="text-red-500">*</span></label>
          <input
            {...register("contractorName")}
            className={`input-field ${errors.contractorName ? "error" : ""}`}
            placeholder="Contractor or company name"
          />
          <FieldError error={errors.contractorName} />
        </div>
      )}

      {!usingOwn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Southern Cities Enterprises will assign a licensed contractor for your project. Our team manages vetted subcontractors across all trades.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
