"use client";

import { UseFormRegister } from "react-hook-form";
import { FormData } from "@/app/page";

interface Props {
  register: UseFormRegister<FormData>;
}

const permits = [
  {
    name: "permitElectrical" as const,
    label: "Electrical Permit",
    desc: "Required for any electrical wiring, panel upgrades, or new circuits",
    icon: "⚡",
  },
  {
    name: "permitMechanical" as const,
    label: "Mechanical Permit",
    desc: "Required for plumbing, gas lines, and mechanical systems",
    icon: "🔧",
  },
  {
    name: "permitHVAC" as const,
    label: "HVAC Permit",
    desc: "Required for heating, ventilation, and air conditioning installation",
    icon: "❄️",
  },
];

export default function StepPermits({ register }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">Select all permits required for your project:</p>
      {permits.map((p) => (
        <label
          key={p.name}
          className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#C8A951] hover:bg-[#C8A951]/5 transition-all group"
        >
          <input
            type="checkbox"
            {...register(p.name)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#C8A951] focus:ring-[#C8A951] cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.icon}</span>
              <span className="font-semibold text-gray-800 group-hover:text-[#1B2A4A]">{p.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
