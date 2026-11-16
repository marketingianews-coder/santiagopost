import { NextRequest, NextResponse } from 'next/server'
import { writeBinary } from '@/lib/store'

// Sube una portada (data URL base64) a public/images/articles/{id}.{ext}.
export async function POST(req: NextRequest) {
  const { id, dataUrl } = await req.json().catch(() => ({}))
  if (!id || !dataUrl) return NextResponse.json({ error: 'Falta id o dataUrl' }, { status: 400 })

  const m = String(dataUrl).match(/^data:image\/(png|jpe?g|webp|avif);base64,(.+)$/)
  if (!m) return NextResponse.json({ error: 'Formato de imagen no soportado (png/jpg/webp/avif)' }, { status: 400 })
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
  const base64 = m[2]
  const safeId = String(id).replace(/[^a-z0-9-]/gi, '')

  try {
    const repoPath = `public/images/articles/${safeId}.${ext}`
    await writeBinary(repoPath, base64, `🖼️ Portada artículo ${safeId}`)
    return NextResponse.json({ ok: true, image: `/images/articles/${safeId}.${ext}` })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al subir imagen' }, { status: 500 })
  }
}
