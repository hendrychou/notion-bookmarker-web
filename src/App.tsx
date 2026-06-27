import { useState, useEffect, useCallback, useMemo } from "react"
import { LeftSidebar } from "@/components/LeftSidebar"
import { ResourceGrid } from "@/components/ResourceGrid"
import { ResourceDetail } from "@/components/ResourceDetail"
import { fetchResources, fetchCategories } from "@/api"
import type { Resource, Category } from "@/types"

export default function App() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [res, cats] = await Promise.all([fetchResources(), fetchCategories()])
        setResources(res)
        setCategories(cats)
      } catch (e) {
        console.error("Failed to load:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute category counts
  const resourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of resources) {
      for (const cat of r.category_names) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    }
    return counts
  }, [resources])

  // Filter resources
  const filteredResources = useMemo(() => {
    let result = resources

    // Filter by category
    if (selectedCategory) {
      result = result.filter((r) => r.category_names.includes(selectedCategory))
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.category_names.some((c) => c.toLowerCase().includes(q))
      )
    }

    // Sort: pinned first, then by name
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return a.name.localeCompare(b.name)
    })
  }, [resources, selectedCategory, searchQuery])

  const handleSelectResource = useCallback((r: Resource) => {
    setSelectedResource(r)
    setDetailOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false)
    // Delay clearing resource so animation plays
    setTimeout(() => setSelectedResource(null), 300)
  }, [])

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <LeftSidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
        resourceCounts={resourceCounts}
      />

      {/* Center Grid */}
      <ResourceGrid
        resources={filteredResources}
        loading={loading}
        onSelect={handleSelectResource}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Right Detail Panel */}
      <ResourceDetail
        resource={selectedResource}
        open={detailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
