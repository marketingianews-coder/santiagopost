import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsCard from '@/components/NewsCard'
import { categorias, categoriaBySlug } from '@/lib/categorias'
import { articlesByCategory } from '@/lib/data'

export function generateStaticParams() {
  return categorias.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = categoriaBySlug(params.slug)
  if (!c) return {}
  return { title: c.nombre, description: c.descripcion }
}

export default function CategoriaPage({ params }: { params: { slug: string } }) {
  const c = categoriaBySlug(params.slug)
  if (!c) notFound()

  const posts = articlesByCategory(c.slug).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen bg-papel font-serif">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif">{c.nombre}</h1>
        <p className="text-lg text-tinta/60 mt-2 max-w-2xl">{c.descripcion}</p>

        <div className="mt-8">
          {posts.length === 0 ? (
            <p className="text-tinta/50">Aún no hay artículos en {c.nombre}. Pronto publicaremos los primeros.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((a) => <NewsCard key={a.id} a={a} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
