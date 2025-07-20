import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden  rounded-full bg-gray-100", className)}
    {...props}
    >
      <ProgressPrimitive.Indicator
      className="h-full bg-blue-500 transition-all"
      style={{ width: `${value ?? 0}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
