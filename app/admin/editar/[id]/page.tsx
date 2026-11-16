'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { categorias } from '@/lib/categorias'
import { SITE } from '@/lib/site'

const TIPOS = ['noticia', 'analisis', 'reportaje', 'entrevista', 'opinion']

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' })

function splitMd(md: string) {
  const m = md.match(/^(---\r?\n[\s\S]*?\r?\n---)\r?\n?([\s\S]*)$/)
  if (m) return { fm: m[1], body: m[2] }
  return { fm: '---\n---', body: md }
}
function getFM(fm: string, key: string): string {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : ''
}
function setFM(fm: string, key: string, value: string): string {
  const safe = String(value).replace(/'/g, "''")
  const line = `${key}: '${safe}'`
  if (new RegExp(`^${key}:`, 'm').test(fm)) return fm.replace(new RegExp(`^${key}:.*$`, 'm'), line)
  return fm.replace(/\r?\n---\s*$/, `\n${line}\n---`)
}

type Fuente = 'borrador' | 'publicado'

export default function Editor({ params }: { params: { id: string } }) {
  const router = useRouter()
  const key = params.id
  const bodyRef = useRef<HTMLDivElement>(null)

  const [fuente, setFuente] = useState<Fuente>('borrador')
  const [fm, setFm] = useState('---\n---')
  const [bodyMd, setBodyMd] = useState('')
  const [modo, setModo] = useState<'visual' | 'codigo'>('visual')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const title = getFM(fm, 'title')
  const description = getFM(fm, 'description')
  const slug = getFM(fm, 'slug')
  const category = getFM(fm, 'category')
  const tipo = getFM(fm, 'type')
  const image = getFM(fm, 'image')
  const setMeta = (k: string, v: string) => setFm((f) => setFM(f, k, v))

  useEffect(() => {
    const f: Fuente = new URLSearchParams(window.location.search).get('fuente') === 'publicado' ? 'publicado' : 'borrador'
    setFuente(f)
    const url = f === 'publicado' ? `/api/admin/articulo?id=${key}` : `/api/admin/borradores?slug=${key}`
    fetch(url).then((r) => r.json()).then((d) => {
      const content: string = d.content || '---\n---\n'
      const { fm, body } = splitMd(content)
      setFm(fm); setBodyMd(body.trim())
      setLoading(false)
    })
  }, [key])

  useEffect(() => {
    if (!loading && modo === 'visual' && bodyRef.current) {
      bodyRef.current.innerHTML = marked.parse(bodyMd, { async: false }) as string
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, modo])

  function syncFromVisual(): string {
    if (modo === 'visual' && bodyRef.current) {
      const md = td.turndown(bodyRef.current.innerHTML).trim()
      setBodyMd(md)
      return md
    }
    return bodyMd
  }

  function exec(cmd: string, val?: string) {
    bodyRef.current?.focus()
    document.execCommand(cmd, false, val)
  }
  function bloque(tag: string) { exec('formatBlock', tag) }

  function insertarLink() {
    const url = prompt('URL del enlace:')
    if (url) exec('createLink', url)
  }

  async function subirImagen(file: File, comoPortada: boolean) {
    setBusy(true); setMsg(comoPortada ? 'Subiendo portada…' : 'Subiendo imagen…')
    const dataUrl = await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.readAsDataURL(file) })
    const id = comoPortada ? (slug || key) : `${slug || key}-${Date.now()}`
    const r = await fetch('/api/admin/upload-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, dataUrl }) })
    const d = await r.json()
    if (r.ok) {
      if (comoPortada) { setMeta('image', d.image); setMsg('Portada lista.') }
      else { exec('insertImage', d.image); setMsg('Imagen insertada.') }
    } else setMsg(d.error || 'Error al subir')
    setBusy(false)
  }

  function buildContent(): string {
    const md = syncFromVisual()
    return `${fm}\n\n${md}\n`
  }

  async function guardar() {
    setBusy(true); setMsg('')
    const content = buildContent()
    if (fuente === 'publicado') {
      const res = await fetch('/api/admin/actualizar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, content }) })
      const d = await res.json(); setMsg(res.ok ? '✓ Actualizado. Vercel redesplegará.' : (d.error || 'Error'))
    } else {
      const res = await fetch('/api/admin/guardar-borrador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: key, content }) })
      setMsg(res.ok ? '✓ Borrador guardado.' : 'Error al guardar.')
    }
    setBusy(false)
  }

  async function publicar() {
    const content = buildContent()
    if (!title || !category || !slug) { setMsg('Falta meta título, URL o categoría.'); return }
    const words = bodyMd.split(/\s+/).filter(Boolean).length
    const tagsM = fm.match(/^tags:\s*\[(.*)\]/m)
    const tags = tagsM ? tagsM[1].split(',').map((t) => t.replace(/["'\s]/g, '')).filter(Boolean) : []
    const dataEntry = {
      slug, title, excerpt: description, category, type: tipo || 'noticia', author: SITE.author,
      date: getFM(fm, 'date') || new Date().toISOString().slice(0, 10),
      readTime: `${Math.max(2, Math.round(words / 200))} min`, image, tags,
    }
    setBusy(true); setMsg('Publicando…')
    const res = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: key, content, dataEntry }) })
    const d = await res.json()
    if (res.ok) { setMsg(`✓ ${d.message}`); setTimeout(() => router.push('/admin'), 1400) } else setMsg(d.error || 'Error al publicar')
    setBusy(false)
  }

  if (loading) return <div className="px-8 py-10 text-slate-400">Cargando…</div>

  const TB = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="h-8 min-w-8 px-2 rounded-md text-slate-600 hover:bg-slate-200 text-sm font-medium flex items-center justify-center">{children}</button>
  )
  const Sep = () => <span className="w-px h-5 bg-slate-200 mx-1" />

  return (
    <div className="px-8 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push('/admin')} className="text-sm text-slate-500 hover:text-slate-900">← Volver a artículos</button>
        <div className="flex items-center gap-2">
          <button onClick={guardar} disabled={busy} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">
            {fuente === 'publicado' ? 'Guardar cambios' : 'Guardar borrador'}
          </button>
          {fuente === 'borrador' && (
            <button onClick={publicar} disabled={busy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Publicar</button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 sticky top-0 z-10">
            <TB title="Modo visual / código" onClick={() => { if (modo === 'visual') syncFromVisual(); setModo(modo === 'visual' ? 'codigo' : 'visual') }}>
              {modo === 'visual' ? '</> Código' : '👁 Visual'}
            </TB>
            {modo === 'visual' && <>
              <Sep />
              <TB title="Negrita" onClick={() => exec('bold')}><b>B</b></TB>
              <TB title="Cursiva" onClick={() => exec('italic')}><i>I</i></TB>
              <Sep />
              <TB title="Título 2" onClick={() => bloque('H2')}>H2</TB>
              <TB title="Título 3" onClick={() => bloque('H3')}>H3</TB>
              <TB title="Párrafo" onClick={() => bloque('P')}>¶</TB>
              <Sep />
              <TB title="Lista con viñetas" onClick={() => exec('insertUnorderedList')}>• Lista</TB>
              <TB title="Lista numerada" onClick={() => exec('insertOrderedList')}>1. Lista</TB>
              <TB title="Cita" onClick={() => bloque('BLOCKQUOTE')}>❝</TB>
              <Sep />
              <TB title="Enlace" onClick={insertarLink}>🔗 Link</TB>
              <label title="Insertar imagen en el texto" className="h-8 px-2 rounded-md text-slate-600 hover:bg-slate-200 text-sm font-medium flex items-center cursor-pointer">
                🖼 Imagen
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f, false); e.currentTarget.value = '' }} />
              </label>
              <Sep />
              <TB title="Deshacer" onClick={() => exec('undo')}>↶</TB>
              <TB title="Rehacer" onClick={() => exec('redo')}>↷</TB>
            </>}
          </div>

          {modo === 'visual' ? (
            <div ref={bodyRef} contentEditable suppressContentEditableWarning
              className="prose-editor min-h-[62vh] px-6 py-5 outline-none text-slate-800 leading-relaxed" />
          ) : (
            <textarea value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} spellCheck={false}
              className="w-full min-h-[62vh] px-6 py-5 font-mono text-sm text-slate-800 outline-none resize-none" />
          )}
        </div>

        <aside className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 text-sm">
          <Field label="Meta título" help={`${title.length}/60`}>
            <input value={title} onChange={(e) => setMeta('title', e.target.value)} className="inp" />
          </Field>
          <Field label="Meta descripción" help={`${description.length}/160`}>
            <textarea value={description} onChange={(e) => setMeta('description', e.target.value)} rows={3} className="inp resize-none" />
          </Field>
          <Field label="URL final (slug)">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span>/articulo/</span>
            </div>
            <input value={slug} onChange={(e) => setMeta('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))} className="inp mt-1" />
          </Field>
          <Field label="Categoría">
            <select value={category} onChange={(e) => setMeta('category', e.target.value)} className="inp">
              <option value="">— elegir —</option>
              {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setMeta('type', e.target.value)} className="inp">
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Imagen de portada">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="portada" className="w-full h-32 object-cover rounded-lg border border-slate-200 mb-2" />
            ) : (
              <div className="w-full h-32 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400 mb-2">Sin portada (gradiente)</div>
            )}
            <label className="block text-center rounded-lg border border-slate-300 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer">
              {image ? 'Cambiar portada' : 'Subir portada'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f, true); e.currentTarget.value = '' }} />
            </label>
          </Field>

          {msg && <p className="text-indigo-600 text-sm border-t border-slate-100 pt-3">{msg}</p>}
        </aside>
      </div>

      <style jsx global>{`
        .inp { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.625rem; font-size: 0.875rem; color: #1e293b; outline: none; }
        .inp:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .prose-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 1.2rem 0 .6rem; }
        .prose-editor h3 { font-size: 1.2rem; font-weight: 600; margin: 1rem 0 .5rem; }
        .prose-editor p { margin: .6rem 0; }
        .prose-editor ul { list-style: disc; padding-left: 1.4rem; margin: .6rem 0; }
        .prose-editor ol { list-style: decimal; padding-left: 1.4rem; margin: .6rem 0; }
        .prose-editor blockquote { border-left: 3px solid #c7d2fe; padding-left: 1rem; color: #475569; font-style: italic; margin: .8rem 0; }
        .prose-editor a { color: #4f46e5; text-decoration: underline; }
        .prose-editor img { max-width: 100%; border-radius: .5rem; margin: .8rem 0; }
      `}</style>
    </div>
  )
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
        {help && <span className="text-xs text-slate-400">{help}</span>}
      </div>
      {children}
    </div>
  )
}
