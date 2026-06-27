import type { Resource, Category } from "./types"

// When served from VPS (same origin), API_BASE is empty.
// When served from GitHub Pages (HTTPS), use tunnel URL.
const API_BASE = window.location.hostname === "hendrychou.github.io"
  ? "https://capability-announces-realtors-much.trycloudflare.com"
  : ""

export async function fetchResources(): Promise<Resource[]> {
  const res = await fetch(`${API_BASE}/api/resources`)
  if (!res.ok) throw new Error("Failed to fetch resources")
  return res.json()
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories`)
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export async function fetchResource(id: string): Promise<Resource> {
  const res = await fetch(`${API_BASE}/api/resource/${id}`)
  if (!res.ok) throw new Error("Resource not found")
  return res.json()
}

export { API_BASE }
