import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const cookieName = 'moju_session'
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'local-moju-secret-change-me')

export async function hashPassword(password: string) { return hash(password, 12) }
export async function verifyPassword(password: string, passwordHash: string) { return compare(password, passwordHash) }

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret)
  const cookieStore = await cookies()
  cookieStore.set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' })
}

export async function clearSession() { const cookieStore = await cookies(); cookieStore.set(cookieName, '', { httpOnly: true, maxAge: 0, path: '/' }) }

export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    if (typeof payload.userId !== 'string') return null
    return prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, isAdmin: true } })
  } catch { return null }
}
