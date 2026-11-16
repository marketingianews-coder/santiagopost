'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { nombreCategoria } from '@/lib/categorias'

type Borrador = { slug: string; title: string; category: string; type: string; date: string; necesitaRevision?: boolean }
type Publicado = { id: string; slug: string; title: string; category: string; type: string; date: string }
type Confirm = { tipo: 'borrador' | 'publicado'; slug?: string; id?: string; title: string } | null

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-0.5">{children}</span>
}

function Btn({ onClick, children, variant = 'ghost', disabled }: { onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50'
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ghost: 'border border-slate-200 text-slate-700 hover:bg-slate-100',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>{children}</button>
}

export default function Dashboard() {
  const [borradores, setBorradores] = useState<Borrador[]>([])
  const [publicados, setPublicados] = useState<Publicado[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    const [b, p] = await Promise.all([
      fetch('/api/admin/borradores').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/publicados').then((r) => r.json()).catch(() => []),
    ])
    setBorradores(Array.isArray(b) ? b : [])
    setPublicados(Array.isArray(p) ? p : [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function flash(m: string) { setToast(m); setTimeout(() => setToast(''), 3500) }

  async function publicarBorrador(slug: string) {
    setBusy(slug)
    try {
      const d = await fetch(`/api/admin/borradores?slug=${slug}`).then((r) => r.json())
      const content: string = d.content || ''
      const fm = Object.fromEntries(
        [...content.matchAll(/^(\w[\w_]*):\s*(.*)$/gm)].map((m) => [m[1], m[2].replace(/^["']|["']$/g, '').trim()])
      )
      const tagsM = content.match(/^tags:\s*\[(.*)\]/m)
      const tags = tagsM ? tagsM[1].split(',').map((t) => t.replace(/["'\s]/g, '')).filter(Boolean) : []
      const body = content.replace(/^---[\s\S]*?---\r?\n?/, '')
      const words = body.split(/\s+/).filter(Boolean).length
      const dataEntry = {
        slug: fm.slug, title: fm.title, excerpt: fm.description || '', category: fm.category, type: fm.type || 'noticia',
        date: fm.date || new Date().toISOString().slice(0, 10),
        readTime: `${Math.max(2, Math.round(words / 200))} min`, image: fm.image || '', tags,
      }
      const res = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, content, dataEntry }) })
      const r = await res.json()
      if (res.ok) { flash('✓ Publicado. Vercel desplegará en ~2 min.'); await cargar() }
      else flash(r.error || 'Error al publicar')
    } catch { flash('Error al publicar') }
    setBusy('')
  }

  async function eliminar() {
    if (!confirm) return
    setBusy('del')
    const res = await fetch('/api/admin/eliminar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(confirm) })
    const r = await res.json().catch(() => ({}))
    if (res.ok) { flash('✓ Eliminado.'); setConfirm(null); await cargar() }
    else flash(r.error || 'Error al eliminar')
    setBusy('')
  }

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Artículos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{borradores.length} borradores · {publicados.length} publicados</p>
        </div>
        <Link href="/admin/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Nuevo artículo
        </Link>
      </div>

      {toast && <div className="mb-4 rounded-lg bg-slate-900 text-white text-sm px-4 py-2.5">{toast}</div>}

      {loading ? (
        <p className="text-slate-400">Cargando…</p>
      ) : (
        <div className="space-y-8">
          {/* Borradores */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Borradores ({borradores.length})</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {borradores.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No hay borradores. El agente dejará aquí sus piezas.</p>
              ) : borradores.map((b) => (
                <div key={b.slug} className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Chip>{nombreCategoria(b.category)}</Chip>
                      {b.necesitaRevision && <span className="text-xs font-medium text-amber-600">⚠ Necesita revisión</span>}
                    </div>
                    <h3 className="font-medium text-slate-800 truncate">{b.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/editar/${b.slug}`}><Btn>Abrir</Btn></Link>
                    <Btn variant="primary" disabled={busy === b.slug} onClick={() => publicarBorrador(b.slug)}>{busy === b.slug ? 'Publicando…' : 'Publicar'}</Btn>
                    <Btn variant="danger" onClick={() => setConfirm({ tipo: 'borrador', slug: b.slug, title: b.title })}>Eliminar</Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Publicados */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Publicados ({publicados.length})</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {publicados.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">Aún no hay artículos publicados.</p>
              ) : publicados.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-xs font-mono text-slate-400 w-8">#{p.id}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1"><Chip>{nombreCategoria(p.category)}</Chip><span className="text-xs text-slate-400">{p.date}</span></div>
                    <h3 className="font-medium text-slate-800 truncate">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`/articulo/${p.slug}`} target="_blank"><Btn>Ver</Btn></a>
                    <Link href={`/admin/editar/${p.id}?fuente=publicado`}><Btn>Abrir</Btn></Link>
                    <Btn variant="danger" onClick={() => setConfirm({ tipo: 'publicado', id: p.id, title: p.title })}>Eliminar</Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar {confirm.tipo === 'borrador' ? 'borrador' : 'artículo publicado'}?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Vas a eliminar <span className="font-medium text-slate-900">“{confirm.title}”</span>.
              {confirm.tipo === 'publicado' ? ' Se quitará del sitio tras el redeploy.' : ' Esta acción no se puede deshacer.'}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Btn onClick={() => setConfirm(null)} disabled={busy === 'del'}>Cancelar</Btn>
              <button onClick={eliminar} disabled={busy === 'del'} className="rounded-lg bg-red-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {busy === 'del' ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
