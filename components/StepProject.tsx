"use client";

import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  control: Control<FormData>;
}

export default function StepProject({ register, errors, control }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label-text">Property Address <span className="text-red-500">*</span></label>
        <input {...register("propertyAddress")} className={`input-field ${errors.propertyAddress ? "error" : ""}`} placeholder="123 Main St, Charlotte, NC 28202" />
        <FieldError error={errors.propertyAddress} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-text">Square Footage <span className="text-red-500">*</span></label>
          <input {...register("squareFootage")} type="number" className={`input-field ${errors.squareFootage ? "error" : ""}`} placeholder="2,500" />
          <FieldError error={errors.squareFootage} />
        </div>
        <div>
          <label className="label-text">Number of Units <span className="text-red-500">*</span></label>
          <input {...register("numberOfUnits")} type="number" className={`input-field ${errors.numberOfUnits ? "error" : ""}`} placeholder="1" />
          <FieldError error={errors.numberOfUnits} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-text">Project Type <span className="text-red-500">*</span></label>
          <Controller
            name="projectType"
            control={control}
            render={({ field }) => (
              <select {...field} className={`input-field ${errors.projectType ? "error" : ""}`}>
                <option value="">Select type...</option>
                <option value="New Build">New Build</option>
                <option value="Renovation">Renovation</option>
                <option value="Site Improvements">Site Improvements</option>
              </select>
            )}
          />
          <FieldError error={errors.projectType} />
        </div>
        <div>
          <label className="label-text">Occupancy Type <span className="text-red-500">*</span></label>
          <Controller
            name="occupancyType"
            control={control}
            render={({ field }) => (
              <select {...field} className={`input-field ${errors.occupancyType ? "error" : ""}`}>
                <option value="">Select type...</option>
                <option value="Primary Residence">Primary Residence</option>
                <option value="Investment/Rental">Investment/Rental</option>
              </select>
            )}
          />
          <FieldError error={errors.occupancyType} />
        </div>
      </div>
    </div>
  );
}
