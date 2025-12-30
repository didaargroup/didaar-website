import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles from _Input-input
        "w-full max-w-full rounded-sm border border-(--puck-color-grey-09) bg-(--puck-color-white) px-3.75 py-3 text-base",
        "font-sans transition-[border-color] duration-50 ease-in",
        "md:text-[14px]",
        // Focus states
        "focus:border-(--puck-color-grey-05) focus:outline-2 focus:outline-(--puck-color-azure-05) focus:outline-offset-0",
        // Readonly state
        "read-only:bg-(--puck-color-grey-11) read-only:border-(--puck-color-grey-09) read-only:text-(--puck-color-grey-04) read-only:cursor-default read-only:outline-none",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Select element specific
        className
      )}
      {...props} 
    />
  )
}

export { Input }
