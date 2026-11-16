import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from '@/lib/store'

// Guarda/actualiza un borrador en borradores/{slug}.md (lo usa el editor y el agente).
export async function POST(req: NextRequest) {
  const { slug, content } = await req.json().catch(() => ({}))
  if (!slug || !content) return NextResponse.json({ error: 'Falta slug o content' }, { status: 400 })
  const safe = String(slug).replace(/[^a-z0-9-]/g, '')
  if (!safe) return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
  try {
    await writeFile(`borradores/${safe}.md`, content, `📝 Borrador: ${safe}`)
    return NextResponse.json({ ok: true, slug: safe })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al guardar' }, { status: 500 })
  }
}
