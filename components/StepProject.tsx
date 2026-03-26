"use client";

import { useCallback } from "react";
import { UseFormRegister, FieldErrors, Control, Controller, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormData } from "@/app/page";
import FieldError from "./FieldError";
import AddressAutocomplete from "./AddressAutocomplete";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

export default function StepProject({ register, errors, control, setValue, watch }: Props) {
  const propertyAddress = watch("propertyAddress") || "";

  const handleAddressChange = useCallback(
    (value: string) => {
      setValue("propertyAddress", value, { shouldValidate: true });
    },
    [setValue]
  );

  const handleAddressSelect = useCallback(
    (components: { streetAddress: string; city: string; state: string; zipCode: string }) => {
      setValue("propertyAddress", components.streetAddress, { shouldValidate: true });
      setValue("city", components.city, { shouldValidate: true });
      setValue("state", components.state, { shouldValidate: true });
      setValue("zipCode", components.zipCode, { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <div className="space-y-5">
      <div>
        <label className="label-text">Property Address <span className="text-red-500">*</span></label>
        <AddressAutocomplete
          value={propertyAddress}
          onChange={handleAddressChange}
          onAddressSelect={handleAddressSelect}
          hasError={!!errors.propertyAddress}
          placeholder="Start typing an address..."
        />
        <FieldError error={errors.propertyAddress} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="label-text">City <span className="text-red-500">*</span></label>
          <input {...register("city")} className={`input-field ${errors.city ? "error" : ""}`} placeholder="Charlotte" />
          <FieldError error={errors.city} />
        </div>
        <div>
          <label className="label-text">State <span className="text-red-500">*</span></label>
          <input {...register("state")} className={`input-field ${errors.state ? "error" : ""}`} placeholder="NC" />
          <FieldError error={errors.state} />
        </div>
        <div>
          <label className="label-text">ZIP Code <span className="text-red-500">*</span></label>
          <input {...register("zipCode")} className={`input-field ${errors.zipCode ? "error" : ""}`} placeholder="28202" />
          <FieldError error={errors.zipCode} />
        </div>
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
