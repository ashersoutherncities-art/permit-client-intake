"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function StepScope({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label-text">High-Level Scope of Work <span className="text-red-500">*</span></label>
        <textarea
          {...register("scopeOfWork")}
          className={`input-field min-h-[120px] resize-y ${errors.scopeOfWork ? "error" : ""}`}
          placeholder="Describe the project scope in detail: what work needs to be done, materials involved, structural changes, etc."
          rows={5}
        />
        <FieldError error={errors.scopeOfWork} />
      </div>

      <div>
        <label className="label-text">Estimated Project Cost <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input {...register("estimatedCost")} type="text" className="input-field pl-8" placeholder="250,000" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-text">Desired Start Date</label>
          <input {...register("startDate")} type="date" className={`input-field ${errors.startDate ? "error" : ""}`} />
        </div>
        <div>
          <label className="label-text">Estimated Completion Date</label>
          <input {...register("completionDate")} type="date" className={`input-field ${errors.completionDate ? "error" : ""}`} />
          <FieldError error={errors.completionDate} />
        </div>
      </div>
    </div>
  );
}
