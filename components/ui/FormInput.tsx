"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  toggleable?: boolean;
}

export default function FormInput({
  label,
  type = "text",
  placeholder,
  registration,
  error,
  toggleable = false,
}: FormInputProps) {
  const [show, setShow] = useState(false);
  const inputType = toggleable ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="text-[#00a37b] font-semibold text-sm ml-1">{label}</label>
      <div className="relative">
        <input
          {...registration}
          type={inputType}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-sm rounded-2xl border bg-[#ebf2ff] focus:outline-none focus:ring-2 focus:ring-[#00a37b] transition-all placeholder:text-gray-300 ${
            toggleable ? "pr-11" : ""
          } ${error ? "border-red-400" : "border-transparent"}`}
        />
        {toggleable && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a37b] transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error.message}</p>}
    </div>
  );
}