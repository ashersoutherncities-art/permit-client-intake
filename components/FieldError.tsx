"use client";

import { FieldError as FE } from "react-hook-form";

export default function FieldError({ error }: { error?: FE }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-500">{error.message}</p>;
}
