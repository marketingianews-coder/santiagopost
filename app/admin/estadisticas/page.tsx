'use client'
import { useEffect, useState } from 'react'
import { categorias, nombreCategoria } from '@/lib/categorias'

type Pub = { id: string; category: string; date: string }

export default function Estadisticas() {
  const [pub, setPub] = useState<Pub[]>([])
  const [borr, setBorr] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/publicados').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/borradores').then((r) => r.json()).catch(() => []),
    ]).then(([p, b]) => { setPub(Array.isArray(p) ? p : []); setBorr(Array.isArray(b) ? b : []); setLoading(false) })
  }, [])

  const porCat = categorias.map((c) => ({ ...c, n: pub.filter((p) => p.category === c.slug).length }))
  const maxN = Math.max(1, ...porCat.map((c) => c.n))

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Estadísticas</h1>
      <p className="text-sm text-slate-500 mb-6">Resumen del contenido y visitas del sitio.</p>

      {loading ? <p className="text-slate-400">Cargando…</p> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Publicados" value={pub.length} />
            <Card label="Borradores" value={borr.length} />
            <Card label="Categorías con contenido" value={porCat.filter((c) => c.n > 0).length} />
            <Card label="Total artículos" value={pub.length + borr.length} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Artículos publicados por categoría</h2>
            <div className="space-y-2.5">
              {porCat.map((c) => (
                <div key={c.slug} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-slate-600 truncate">{nombreCategoria(c.slug)}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.n / maxN) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-slate-700">{c.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Visitas del sitio</h2>
            <p className="text-sm text-slate-500 mb-4">
              Las visitas se miden con <strong>Vercel Web Analytics</strong> (ya activado en el sitio). El detalle en vivo
              —páginas más vistas, visitantes, referidos— se ve en el panel de Vercel.
            </p>
            <a href="https://vercel.com/tomas-projects-esbuenisimo/santiagopost/analytics" target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Ver visitas en Vercel
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17L17 7M17 7H8M17 7v9" /></svg>
            </a>
            <p className="text-xs text-slate-400 mt-3">Nota: la recolección parte desde ahora; los datos se van llenando con el tráfico real.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}
