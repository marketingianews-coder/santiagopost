import { NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'
import { listDir, readFile } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')

  // Un borrador específico (para el editor)
  if (slug) {
    const f = await readFile(`borradores/${slug}.md`)
    if (!f) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    const { data } = matter(f.content)
    return NextResponse.json({ slug, frontmatter: data, content: f.content })
  }

  // Lista de borradores
  const files = (await listDir('borradores')).filter((n) => n.endsWith('.md'))
  const items = []
  for (const name of files) {
    const f = await readFile(`borradores/${name}`)
    if (!f) continue
    const { data } = matter(f.content)
    items.push({
      slug: name.replace(/\.md$/, ''),
      title: (data.title as string) || name,
      category: (data.category as string) || '',
      type: (data.type as string) || '',
      date: (data.date as string) || '',
      necesitaRevision: /NECESITA REVISIÓN HUMANA/i.test(f.content),
    })
  }
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return NextResponse.json(items)
}
