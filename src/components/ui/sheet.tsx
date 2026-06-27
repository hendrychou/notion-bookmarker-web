import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: "left" | "right"
  className?: string
}

function Sheet({ open, onClose, children, side = "right", className }: SheetProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 w-[420px] max-w-[90vw] bg-background border-l shadow-xl transition-transform duration-300 ease-in-out",
          side === "right" ? "right-0" : "left-0",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  )
}

export { Sheet }
