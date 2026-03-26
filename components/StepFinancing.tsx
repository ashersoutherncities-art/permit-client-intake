"use client";

import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  control: Control<FormData>;
}

export default function StepFinancing({ register, errors, control }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label-text">Financing Type <span className="text-red-500">*</span></label>
        <Controller
          name="financingType"
          control={control}
          render={({ field }) => (
            <select {...field} className={`input-field ${errors.financingType ? "error" : ""}`}>
              <option value="">Select financing type...</option>
              <option value="Cash">Cash</option>
              <option value="Hard Money">Hard Money</option>
              <option value="Traditional">Traditional Mortgage</option>
              <option value="Bridge">Bridge Loan</option>
              <option value="Other">Other</option>
            </select>
          )}
        />
        <FieldError error={errors.financingType} />
      </div>

      <div>
        <label className="label-text">Lender Name <span className="text-gray-400 font-normal">(if applicable)</span></label>
        <input {...register("lenderName")} className="input-field" placeholder="Bank or lender name" />
      </div>
    </div>
  );
}
