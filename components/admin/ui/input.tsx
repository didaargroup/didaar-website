import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles from _Input-input
        "w-full max-w-full rounded-[4px] border border-[var(--puck-color-grey-09)] bg-[var(--puck-color-white)] px-[15px] py-3 text-base",
        "font-sans transition-[border-color] duration-[50ms] ease-in",
        "md:text-[14px]",
        // Focus states
        "focus:border-[var(--puck-color-grey-05)] focus:outline-[2px] focus:outline-[var(--puck-color-azure-05)] focus:outline-offset-0",
        // Readonly state
        "read-only:bg-[var(--puck-color-grey-11)] read-only:border-[var(--puck-color-grey-09)] read-only:text-[var(--puck-color-grey-04)] read-only:cursor-default read-only:outline-none",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Select element specific
        "max-w-lg",
        className
      )}
      {...props} 
    />
  )
}

export { Input }
