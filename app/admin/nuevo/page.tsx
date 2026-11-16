'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { categorias } from '@/lib/categorias'

const TIPOS = ['noticia', 'analisis', 'reportaje', 'entrevista', 'opinion']

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export default function Nuevo() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tipo, setTipo] = useState('noticia')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const slug = slugify(title)

  async function crear() {
    if (!title || !category) { setMsg('Completa el título y la categoría.'); return }
    setBusy(true); setMsg('')
    const hoy = new Date().toISOString().slice(0, 10)
    const content = `---
title: '${title.replace(/'/g, "''")}'
slug: '${slug}'
description: ''
category: '${category}'
tags: []
type: '${tipo}'
date: '${hoy}'
updated: '${hoy}'
draft: true
keyword_principal: ''
fuentes: []
image: ''
---

# ${title}

Escribe aquí el contenido del artículo…
`
    const res = await fetch('/api/admin/guardar-borrador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, content }) })
    if (res.ok) router.push(`/admin/editar/${slug}`)
    else { setMsg('Error al crear el borrador.'); setBusy(false) }
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <button onClick={() => router.push('/admin')} className="text-sm text-slate-500 hover:text-slate-900 mb-4">← Volver a artículos</button>
      <h1 className="text-2xl font-bold mb-1">Nuevo artículo</h1>
      <p className="text-sm text-slate-500 mb-6">Crea un borrador en blanco. Luego lo editas con todo el editor.</p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Banco Central mantiene la tasa en 5%"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          {slug && <p className="text-xs text-slate-400 mt-1.5">URL: /articulo/<span className="font-mono text-slate-600">{slug}</span></p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
              <option value="">— elegir —</option>
              {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <div className="flex justify-end">
          <button onClick={crear} disabled={busy} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? 'Creando…' : 'Crear y editar'}
          </button>
        </div>
      </div>
    </div>
  )
}
