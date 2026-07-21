import { NextResponse } from 'next/server'
import { createSession, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const user = await prisma.user.findUnique({ where: { email: email?.trim().toLowerCase() } })
  if (!user || !(await verifyPassword(password || '', user.passwordHash))) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })
  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
}
