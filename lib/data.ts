// Registro de artículos publicados (metadata). El panel inserta/edita aquí al publicar.
// El cuerpo de cada artículo vive en articulos/{id}.md.
export type Article = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string // slug de categorias.ts
  type: 'noticia' | 'analisis' | 'reportaje' | 'entrevista' | 'opinion'
  author: string
  date: string // YYYY-MM-DD
  readTime: string
  image?: string
  tags?: string[]
  draft?: boolean
}

export const articles: Article[] = [
]

export const publishedArticles = () => articles.filter((a) => !a.draft)
export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug)
export const articlesByCategory = (slug: string) => publishedArticles().filter((a) => a.category === slug)
export const latestArticles = (n = 30) => publishedArticles().slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
