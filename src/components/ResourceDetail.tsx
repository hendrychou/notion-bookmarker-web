import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Calendar, Clock, Pin, Hash, Globe, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Resource } from "@/types"

interface ResourceDetailProps {
  resource: Resource | null
  open: boolean
  onClose: () => void
}

export function ResourceDetail({ resource, open, onClose }: ResourceDetailProps) {
  return (
    <AnimatePresence>
      {open && resource && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Detail panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[440px] max-w-[90vw] bg-background border-l shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{resource.emoji}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {resource.id.slice(0, 8)}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <h2 className="text-xl font-semibold leading-tight">{resource.name}</h2>
                    {resource.category_names.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {resource.category_names.map((cat) => (
                          <Badge key={cat} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status & meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {resource.status && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>Status: <span className="text-foreground font-medium">{resource.status}</span></span>
                      </div>
                    )}
                    {resource.pinned && (
                      <div className="flex items-center gap-2 text-sm">
                        <Pin className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-primary font-medium">Pinned</span>
                      </div>
                    )}
                    {resource.date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{resource.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {resource.summary && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="h-4 w-4" />
                        Summary
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {resource.summary}
                      </p>
                    </div>
                  )}

                  {/* External URL */}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1">{resource.url}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  )}

                  {/* Notion link */}
                  <a
                    href={resource.notion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in Notion
                  </a>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
