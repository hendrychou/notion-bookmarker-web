import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid, List, ExternalLink, Pin } from "lucide-react"
import type { Resource } from "@/types"

interface ResourceGridProps {
  resources: Resource[]
  loading: boolean
  onSelect: (r: Resource) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function ResourceGrid({ resources, loading, onSelect, viewMode, onViewModeChange }: ResourceGridProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${resources.length} resources`}
        </p>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-4 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg">No resources found</p>
            <p className="text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === "grid" ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} onSelect={onSelect} />
                ))}
              </motion.div>
            ) : (
              <motion.div layout className="space-y-2">
                {resources.map((r) => (
                  <ResourceRow key={r.id} resource={r} onSelect={onSelect} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function ResourceCard({ resource: r, onSelect }: { resource: Resource; onSelect: (r: Resource) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(r)}
      className="group relative rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all duration-200 p-4"
    >
      {r.pinned && (
        <Pin className="absolute top-2 right-2 h-3.5 w-3.5 fill-primary text-primary" />
      )}
      <div className="text-2xl mb-3">{r.emoji}</div>
      <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{r.name}</h3>
      {r.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{r.summary}</p>
      )}
      <div className="flex flex-wrap gap-1 mt-auto">
        {r.category_names.slice(0, 2).map((cat) => (
          <Badge key={cat} variant="secondary" className="text-[10px]">
            {cat}
          </Badge>
        ))}
      </div>
      {r.url && (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      )}
    </motion.div>
  )
}

function ResourceRow({ resource: r, onSelect }: { resource: Resource; onSelect: (r: Resource) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      onClick={() => onSelect(r)}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all duration-200"
    >
      <span className="text-xl shrink-0">{r.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{r.name}</span>
          {r.pinned && <Pin className="h-3 w-3 fill-primary text-primary shrink-0" />}
        </div>
        {r.summary && (
          <p className="text-xs text-muted-foreground truncate">{r.summary}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        {r.category_names.slice(0, 1).map((cat) => (
          <Badge key={cat} variant="secondary" className="text-[10px]">
            {cat}
          </Badge>
        ))}
      </div>
      {r.url && (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
    </motion.div>
  )
}
