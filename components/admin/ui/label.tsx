"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Base layout - matches Puck's _Input-label_bsxfo_5
        "flex items-center gap-1 pb-3",
        // Typography - matches Puck's label styles
        "text-[14px] font-semibold leading-none",
        // Colors - matches Puck's grey-04 (#5a5a5a)
        "text-[#5a5a5a] dark:text-[#ababab]",
        // Disabled states
        "select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
