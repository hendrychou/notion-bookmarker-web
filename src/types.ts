export interface Resource {
  id: string
  name: string
  url: string
  summary: string
  status: string
  pinned: boolean
  date: string
  categories: string[]
  category_names: string[]
  emoji: string
  notion_url: string
}

export interface Category {
  id: string
  name: string
}

export interface ResourceResponse {
  total: number
  resources: Resource[]
}
