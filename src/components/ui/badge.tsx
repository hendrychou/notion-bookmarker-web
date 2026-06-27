import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant || "default"],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
