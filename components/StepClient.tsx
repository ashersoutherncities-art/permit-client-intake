"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
}

export default function StepClient({ register, errors, onFileChange, fileName }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-text">First Name <span className="text-red-500">*</span></label>
          <input {...register("firstName")} className={`input-field ${errors.firstName ? "error" : ""}`} placeholder="John" />
          <FieldError error={errors.firstName} />
        </div>
        <div>
          <label className="label-text">Last Name <span className="text-red-500">*</span></label>
          <input {...register("lastName")} className={`input-field ${errors.lastName ? "error" : ""}`} placeholder="Doe" />
          <FieldError error={errors.lastName} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-text">Email <span className="text-red-500">*</span></label>
          <input {...register("email")} type="email" className={`input-field ${errors.email ? "error" : ""}`} placeholder="john@example.com" />
          <FieldError error={errors.email} />
        </div>
        <div>
          <label className="label-text">Phone <span className="text-red-500">*</span></label>
          <input {...register("phone")} type="tel" className={`input-field ${errors.phone ? "error" : ""}`} placeholder="(704) 555-0123" />
          <FieldError error={errors.phone} />
        </div>
      </div>

      <div>
        <label className="label-text">TIN / EIN <span className="text-red-500">*</span></label>
        <input {...register("tinEin")} className={`input-field ${errors.tinEin ? "error" : ""}`} placeholder="XX-XXXXXXX" />
        <FieldError error={errors.tinEin} />
      </div>

      <div>
        <label className="label-text">Articles of Organization <span className="text-red-500">*</span></label>
        <div className="mt-1">
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            errors.articlesOfOrg ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#C8A951]"
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {fileName ? (
                <>
                  <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-600 font-medium">{fileName}</p>
                  <p className="text-xs text-gray-500">Click to change</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500"><span className="font-semibold text-[#C8A951]">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">PDF, JPEG, PNG (max 10MB)</p>
                </>
              )}
            </div>
            <input
              {...register("articlesOfOrg")}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => {
                register("articlesOfOrg").onChange(e);
                onFileChange(e);
              }}
            />
          </label>
        </div>
        <FieldError error={errors.articlesOfOrg as any} />
      </div>
    </div>
  );
}
