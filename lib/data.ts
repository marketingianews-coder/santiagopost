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
  {
    id: '4',
    image: '/images/articles/4.jpg',
    slug: 'inflacion-rozaria-5-apuestas-alza-tasa-diciembre',
    title: 'La inflación rozaría el 5% y crecen las apuestas por un alza de tasa en diciembre',
    excerpt: 'Proyecciones privadas anticipan una inflación cercana al 5% anual y algunos bancos esperan que el Banco Central suba la tasa 25 puntos base en diciembre.',
    category: 'finanzas',
    type: 'noticia',
    author: 'Redacción Santiago Post',
    date: '2026-11-15',
    readTime: '3 min',
    tags: ['inflacion', 'ipc', 'tasa de interes', 'scotiabank', 'mercados'],
  },
  {
    id: '3',
    image: '/images/articles/3.jpg',
    slug: 'acusacion-constitucional-ministro-rabat-oficialismo-debate',
    title: 'Oposición presenta acusación constitucional contra el ministro Rabat y el oficialismo debate su rumbo',
    excerpt: 'La oposición ingresó una acusación constitucional contra el ministro Rabat por el caso de rebaja de condenas, mientras el oficialismo discute su estrategia.',
    category: 'politica',
    type: 'noticia',
    author: 'Redacción Santiago Post',
    date: '2026-11-15',
    readTime: '3 min',
    tags: ['acusacion constitucional', 'rabat', 'gobierno', 'congreso', 'oficialismo'],
  },
  {
    id: '2',
    image: '/images/articles/2.jpg',
    slug: 'cochilco-sube-proyeccion-cobre-6-18-caida-produccion',
    title: 'Cochilco sube la proyección del cobre a US$6,18 pese a una caída de 8,4% en la producción',
    excerpt: 'El organismo elevó a US$6,18 la libra su estimación de precio para 2026, mientras recorta la producción nacional a 4,94 millones de toneladas.',
    category: 'energia-y-mineria',
    type: 'noticia',
    author: 'Redacción Santiago Post',
    date: '2026-11-15',
    readTime: '3 min',
    tags: ['cobre', 'cochilco', 'codelco', 'mineria', 'litio'],
  },
  {
    id: '1',
    image: '/images/articles/1.jpg',
    slug: 'banco-central-tasa-4-5-mercado-no-espera-crecimiento-2026',
    title: 'Banco Central mantiene la tasa en 4,5% y el mercado ya no espera crecimiento para 2026',
    excerpt: 'El Consejo mantuvo la TPM en 4,5% y advirtió mayores riesgos para la inflación, mientras el mercado recortó a 0% su proyección de PIB para este año.',
    category: 'economia',
    type: 'noticia',
    author: 'Redacción Santiago Post',
    date: '2026-11-15',
    readTime: '3 min',
    tags: ['banco central', 'tpm', 'tasa de interes', 'pib', 'inflacion'],
  },
]

export const publishedArticles = () => articles.filter((a) => !a.draft)
export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug)
export const articlesByCategory = (slug: string) => publishedArticles().filter((a) => a.category === slug)
export const latestArticles = (n = 30) => publishedArticles().slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
