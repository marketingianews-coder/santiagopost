import { NextRequest, NextResponse } from 'next/server'
import { readFile } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Lee el markdown de un artículo publicado: GET /api/admin/articulo?id=4
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })
  const safe = String(id).replace(/[^0-9]/g, '')
  const f = await readFile(`articulos/${safe}.md`)
  if (!f) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ id: safe, content: f.content })
}
