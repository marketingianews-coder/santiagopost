import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, deleteFile } from '@/lib/store'

// Elimina un borrador o un artículo publicado.
export async function POST(req: NextRequest) {
  const { tipo, slug, id } = (await req.json().catch(() => ({}))) as {
    tipo?: string; slug?: string; id?: string
  }

  try {
    if (tipo === 'borrador') {
      if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
      const safe = String(slug).replace(/[^a-z0-9-]/g, '')
      await deleteFile(`borradores/${safe}.md`, `🗑️ Elimina borrador: ${safe}`)
      return NextResponse.json({ ok: true })
    }

    if (tipo === 'publicado') {
      if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })
      const safeId = String(id).replace(/[^0-9]/g, '')
      const dataFile = await readFile('lib/data.ts')
      if (!dataFile) return NextResponse.json({ error: 'No se pudo leer lib/data.ts' }, { status: 500 })
      const blockRe = new RegExp(`\\n\\s*\\{\\s*\\n\\s*id:\\s*'${safeId}',[\\s\\S]*?\\n\\s*\\},`, '')
      if (!blockRe.test(dataFile.content)) {
        return NextResponse.json({ error: `No se encontró el artículo ${safeId} en lib/data.ts` }, { status: 404 })
      }
      const newData = dataFile.content.replace(blockRe, '')
      await writeFile('lib/data.ts', newData, `🗑️ Elimina artículo ${safeId} del índice`, dataFile.sha)
      await deleteFile(`articulos/${safeId}.md`, `🗑️ Elimina articulos/${safeId}.md`)
      return NextResponse.json({ ok: true, message: 'Artículo eliminado. Vercel redesplegará en ~2 minutos.' })
    }

    return NextResponse.json({ error: 'tipo inválido (borrador | publicado)' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al eliminar' }, { status: 500 })
  }
}
