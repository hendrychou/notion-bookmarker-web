import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/types"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface LeftSidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (name: string | null) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  loading: boolean
  resourceCounts: Record<string, number>
}

export function LeftSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  loading,
  resourceCounts,
}: LeftSidebarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div className="w-64 h-full border-r bg-sidebar flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-sidebar-foreground mb-3">Resources</h2>
        <div className={cn(
          "relative transition-all duration-200",
          searchFocused && "scale-[1.02]"
        )}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-8 h-9 text-sm bg-muted/50 border-0"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category list */}
      <ScrollArea className="flex-1 p-2">
        {/* All items */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            !selectedCategory
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground"
          )}
        >
          <span className="flex-1 text-left">All Resources</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {Object.values(resourceCounts).reduce((a, b) => a + b, 0) || 0}
          </Badge>
        </button>

        <div className="h-px bg-border my-2" />

        {/* Individual categories */}
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))
        ) : (
          categories
            .filter((c) => (resourceCounts[c.name] || 0) > 0)
            .sort((a, b) => (resourceCounts[b.name] || 0) - (resourceCounts[a.name] || 0))
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  selectedCategory === cat.name
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <span className="flex-1 text-left truncate">{cat.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  {resourceCounts[cat.name] || 0}
                </Badge>
              </button>
            ))
        )}
      </ScrollArea>
    </div>
  )
}
