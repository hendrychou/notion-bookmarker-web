import type { Resource, Category } from "./types"

const API_BASE = ""

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
