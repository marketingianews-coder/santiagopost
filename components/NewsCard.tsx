import Link from 'next/link'
import type { Article } from '@/lib/data'
import { nombreCategoria } from '@/lib/categorias'

export default function NewsCard({ a }: { a: Article }) {
  return (
    <Link href={`/articulo/${a.slug}`} className="group block">
      <article className="h-full border border-tinta/10 rounded-lg overflow-hidden bg-white hover:border-rojo-oscuro/40 transition-colors">
        {a.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-tinta/5 to-rojo-oscuro/10" />
        )}
        <div className="p-4">
          <span className="text-xs font-sans font-semibold uppercase tracking-wide text-rojo-oscuro">{nombreCategoria(a.category)}</span>
          <h3 className="font-serif text-lg leading-snug mt-1 text-tinta group-hover:text-rojo-oscuro transition-colors">{a.title}</h3>
          <p className="text-sm text-tinta/60 mt-2 line-clamp-2">{a.excerpt}</p>
          <p className="text-xs text-tinta/40 mt-3 font-sans">{a.date} · {a.readTime}</p>
        </div>
      </article>
    </Link>
  )
}
