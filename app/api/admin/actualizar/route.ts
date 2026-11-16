import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from '@/lib/store'
import { esCategoriaValida } from '@/lib/categorias'
import { SITE } from '@/lib/site'

const esc = (s: string) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const getFM = (md: string, k: string) => (md.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1] || '').replace(/^["']|["']$/g, '').trim()

function buildEntry(id: string, d: Record<string, string>, tags: string[], readTime: string): string {
  const t = tags.map((x) => `'${esc(x)}'`).join(', ')
  return `  {
    id: '${id}',
    slug: '${esc(d.slug)}',
    title: '${esc(d.title)}',
    excerpt: '${esc(d.description)}',
    category: '${esc(d.category)}',
    type: '${esc(d.type || 'noticia')}',
    author: '${esc(SITE.author)}',
    date: '${esc(d.date)}',
    readTime: '${esc(readTime)}',
    tags: [${t}],${d.image ? `\n    image: '${esc(d.image)}',` : ''}
  },`
}

// Actualiza un artículo publicado: reescribe articulos/{id}.md y su entrada en lib/data.ts.
export async function POST(req: NextRequest) {
  const { id, content } = (await req.json().catch(() => ({}))) as { id?: string; content?: string }
  if (!id || !content) return NextResponse.json({ error: 'Falta id o content' }, { status: 400 })
  const safeId = String(id).replace(/[^0-9]/g, '')

  const fm = { slug: getFM(content, 'slug'), title: getFM(content, 'title'), description: getFM(content, 'description'), category: getFM(content, 'category'), type: getFM(content, 'type'), image: getFM(content, 'image'), date: getFM(content, 'date') }
  if (!esCategoriaValida(fm.category)) return NextResponse.json({ error: `Categoría inválida: "${fm.category}"` }, { status: 400 })

  const body = content.replace(/^---[\s\S]*?---\r?\n?/, '')
  const words = body.split(/\s+/).filter(Boolean).length
  const readTime = `${Math.max(2, Math.round(words / 200))} min`
  const tagsM = content.match(/^tags:\s*\[(.*)\]/m)
  const tags = tagsM ? tagsM[1].split(',').map((t) => t.replace(/["'\s]/g, '')).filter(Boolean) : []

  try {
    const mdContent = content.replace(/^(\s*draft:\s*).+$/m, '$1false')
    await writeFile(`articulos/${safeId}.md`, mdContent, `✏️ Actualiza artículo ${safeId}: ${fm.title.slice(0, 40)}`)

    const dataFile = await readFile('lib/data.ts')
    if (!dataFile) return NextResponse.json({ error: 'No se pudo leer lib/data.ts' }, { status: 500 })
    const blockRe = new RegExp(`\\n\\s*\\{\\s*\\n\\s*id:\\s*'${safeId}',[\\s\\S]*?\\n\\s*\\},`, '')
    if (!blockRe.test(dataFile.content)) return NextResponse.json({ error: `No se encontró el artículo ${safeId} en lib/data.ts` }, { status: 404 })
    const newData = dataFile.content.replace(blockRe, '\n' + buildEntry(safeId, fm, tags, readTime))
    await writeFile('lib/data.ts', newData, `📊 Actualiza metadata de ${safeId}`, dataFile.sha)

    return NextResponse.json({ ok: true, message: 'Actualizado. Vercel redesplegará en ~2 minutos.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al actualizar' }, { status: 500 })
  }
}
