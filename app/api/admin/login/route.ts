import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (password && password === process.env.ADMIN_PASSWORD) {
    const token = await signAdminToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, token, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 60 * 24 * 30,
    })
    return res
  }
  return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
}
