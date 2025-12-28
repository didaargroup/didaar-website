"use client";

import { useRef, memo } from "react";
import { getTextDirection } from "@/lib/text-direction";
import { Type } from "lucide-react";
import { FieldLabel } from "@measured/puck";

interface RTLTextInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: "text" | "textarea";
  rows?: number;
  className?: string;
}

/**
 * A text input component with intelligent RTL/LTR auto-detection
 * Automatically switches direction based on the text content
 * Compatible with Puck's field system
 * 
 * Uses refs to avoid re-renders and focus loss
 * Memoized to prevent unnecessary re-renders from parent
 * Uses Puck's FieldLabel component with custom Tailwind styling
 */
const RTLTextInputInner = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder = "",
  type = "text",
  rows = 3,
  className = "",
}: RTLTextInputProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Update direction immediately on input (synchronous, no re-render)
    const direction = getTextDirection(newValue);
    if (direction && e.target) {
      e.target.setAttribute("dir", direction);
    }
  };

  // Initialize direction on mount
  const initialDirection = getTextDirection(value || "");

  const inputElement =
    type === "textarea" ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        id={id}
        name={name}
        value={value || ""}
        onChange={handleChange}
        dir={initialDirection}
        placeholder={placeholder}
        rows={rows}
        className="bg-white border border-[--puck-color-grey-09] rounded px-[15px] py-3 text-base w-full max-w-full transition-colors duration-75 focus:border-[--puck-color-grey-05] focus:outline-2 focus:outline-[--puck-color-azure-05] focus:outline-offset-[-2px] hover:border-[--puck-color-grey-05] hover:transition-none focus:transition-none mb-[-4px]"
        autoComplete="off"
        title={label || name}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id={id}
        name={name}
        type="text"
        value={value || ""}
        onChange={handleChange}
        dir={initialDirection}
        placeholder={placeholder}
        className="bg-white border border-[var(--puck-color-grey-09)] rounded px-[15px] py-3 text-base w-full max-w-full transition-colors duration-75 focus:border-[var(--puck-color-grey-05)] focus:outline-2 focus:outline-[var(--puck-color-azure-05)] focus:outline-offset-[-2px] hover:border-[var(--puck-color-grey-05)] hover:transition-none focus:transition-none min-[458px]:text-sm"
        autoComplete="off"
        title={label || name}
      />
    );

  // If label is provided, use Puck's FieldLabel component
  if (label) {
    return (
      <div className="last:pb-4">
        <FieldLabel icon={<Type width={16} height={16} />} label={label} />
        <div className="mt-3">
          {inputElement}
        </div>
      </div>
    );
  }

  return (
    <div className="last:pb-4">
      {inputElement}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const RTLTextInput = memo(RTLTextInputInner);
