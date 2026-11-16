import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET || 'santiagopost-dev-secret-change-me')
export const COOKIE = 'admin_token'

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) return false
  try { await jwtVerify(token, SECRET); return true } catch { return false }
}

export async function isAuthed(req: NextRequest): Promise<boolean> {
  return verifyAdminToken(req.cookies.get(COOKIE)?.value)
}
