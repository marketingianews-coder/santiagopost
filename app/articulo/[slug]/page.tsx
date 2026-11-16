import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { articleBySlug, publishedArticles } from '@/lib/data'
import { getArticleBody } from '@/lib/articles'
import { nombreCategoria } from '@/lib/categorias'
import { SITE } from '@/lib/site'

export function generateStaticParams() {
  return publishedArticles().map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = articleBySlug(params.slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: { title: a.title, description: a.excerpt, type: 'article', ...(a.image ? { images: [a.image] } : {}) },
  }
}

export default function ArticuloPage({ params }: { params: { slug: string } }) {
  const a = articleBySlug(params.slug)
  if (!a || a.draft) notFound()
  const body = getArticleBody(a.id)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    author: { '@type': 'Organization', name: a.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `https://${SITE.host}/articulo/${a.slug}`,
    ...(a.image ? { image: `https://${SITE.host}${a.image}` } : {}),
  }

  return (
    <div className="min-h-screen bg-papel font-serif">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs font-sans text-tinta/50 mb-4">
          <Link href="/" className="hover:text-rojo-oscuro">Inicio</Link> <span className="mx-1">/</span>{' '}
          <Link href={`/categoria/${a.category}`} className="hover:text-rojo-oscuro">{nombreCategoria(a.category)}</Link>
        </nav>

        <span className="text-xs font-sans font-semibold uppercase tracking-wide text-rojo-oscuro">{nombreCategoria(a.category)}</span>
        <h1 className="text-3xl md:text-5xl font-serif leading-tight mt-2">{a.title}</h1>
        <p className="text-tinta/50 mt-4 text-sm font-sans">{a.author} · {a.date} · {a.readTime}</p>

        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" className="w-full rounded-lg mt-6 border border-tinta/10" />
        )}

        {body ? (
          <div className="prose-article mt-8" dangerouslySetInnerHTML={{ __html: body.html }} />
        ) : (
          <p className="text-tinta/50 mt-8">No se encontró el contenido de este artículo.</p>
        )}

        <div className="mt-10 pt-6 border-t border-tinta/10">
          <Link href={`/categoria/${a.category}`} className="font-sans text-sm text-rojo-oscuro hover:underline">
            ← Más de {nombreCategoria(a.category)}
          </Link>
        </div>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  )
}
