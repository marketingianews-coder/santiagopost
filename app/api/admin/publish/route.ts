import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, deleteFile } from '@/lib/store'
import { esCategoriaValida } from '@/lib/categorias'
import { SITE } from '@/lib/site'

type Entry = {
  slug: string; title: string; excerpt: string; category: string; type: string
  author?: string; date: string; readTime?: string; image?: string; tags?: string[]
}

const esc = (s: string) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")

function buildEntry(id: string, d: Entry): string {
  const tags = (d.tags ?? []).map((t) => `'${esc(t)}'`).join(', ')
  return `  {
    id: '${id}',
    slug: '${esc(d.slug)}',
    title: '${esc(d.title)}',
    excerpt: '${esc(d.excerpt)}',
    category: '${esc(d.category)}',
    type: '${esc(d.type)}',
    author: '${esc(d.author || SITE.author)}',
    date: '${esc(d.date)}',
    readTime: '${esc(d.readTime || '4 min')}',
    tags: [${tags}],${d.image ? `\n    image: '${esc(d.image)}',` : ''}
  },`
}

export async function POST(req: NextRequest) {
  const { slug, content, dataEntry } = (await req.json().catch(() => ({}))) as { slug?: string; content?: string; dataEntry?: Entry }
  if (!slug || !content || !dataEntry) return NextResponse.json({ error: 'Falta slug, content o dataEntry' }, { status: 400 })

  if (!esCategoriaValida(dataEntry.category)) {
    return NextResponse.json({ error: `Categoría inválida: "${dataEntry.category}". Debe ser un slug de lib/categorias.ts.` }, { status: 400 })
  }

  try {
    // 1. Calcular ID real desde lib/data.ts (fuente de verdad)
    const dataFile = await readFile('lib/data.ts')
    if (!dataFile) return NextResponse.json({ error: 'No se pudo leer lib/data.ts' }, { status: 500 })
    const ids = Array.from(dataFile.content.matchAll(/id:\s*'(\d+)'/g), (m) => Number(m[1]))
    const id = String((ids.length ? Math.max(...ids) : 0) + 1)

    // 2. Commit del artículo (aseguramos draft:false en el frontmatter)
    const mdContent = content.replace(/^(\s*draft:\s*).+$/m, '$1false')
    await writeFile(`articulos/${id}.md`, mdContent, `✨ Publica artículo ${id}: ${dataEntry.title.slice(0, 50)}`)

    // 3. Insertar entrada en el array `articles` de lib/data.ts
    const start = dataFile.content.indexOf('export const articles')
    if (start === -1) return NextResponse.json({ error: "No se encontró 'export const articles' en lib/data.ts" }, { status: 500 })
    const closeRel = dataFile.content.indexOf('\n]', start)
    if (closeRel === -1) return NextResponse.json({ error: 'No se encontró el cierre del array articles' }, { status: 500 })
    const closeIdx = closeRel + 1 // posición del ']'
    const newData = dataFile.content.slice(0, closeIdx) + buildEntry(id, dataEntry) + '\n' + dataFile.content.slice(closeIdx)
    await writeFile('lib/data.ts', newData, `📊 Metadata: publica ${id}`, dataFile.sha)

    // 4. Borrar el borrador
    await deleteFile(`borradores/${slug}.md`, `🗑️ Borrador publicado: ${slug}`)

    return NextResponse.json({ ok: true, id, message: 'Publicado. Vercel desplegará en ~2 minutos.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al publicar' }, { status: 500 })
  }
}
