import { NextResponse } from 'next/server'
import { readFile } from '@/lib/store'

export const dynamic = 'force-dynamic'

const unesc = (s: string) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\')

// Lee lib/data.ts (vía store/GitHub) y devuelve los artículos publicados, parseando el array.
export async function GET() {
  const f = await readFile('lib/data.ts')
  if (!f) return NextResponse.json([], { status: 200 })
  const re =
    /\{\s*id:\s*'([^']+)',[\s\S]*?slug:\s*'([^']*)',[\s\S]*?title:\s*'((?:[^'\\]|\\.)*)',[\s\S]*?category:\s*'([^']*)',[\s\S]*?type:\s*'([^']*)',[\s\S]*?date:\s*'([^']*)'/g
  const items: { id: string; slug: string; title: string; category: string; type: string; date: string }[] = []
  for (const m of f.content.matchAll(re)) {
    items.push({ id: m[1], slug: m[2], title: unesc(m[3]), category: m[4], type: m[5], date: m[6] })
  }
  items.sort((a, b) => Number(b.id) - Number(a.id))
  return NextResponse.json(items)
}
