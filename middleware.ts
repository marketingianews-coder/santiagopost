import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET || 'santiagopost-dev-secret-change-me')

async function authed(req: NextRequest): Promise<boolean> {
  const t = req.cookies.get('admin_token')?.value
  if (!t) return false
  try { await jwtVerify(t, SECRET); return true } catch { return false }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next()
  }
  if (await authed(req)) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const url = req.nextUrl.clone()
  url.pathname = '/admin/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
