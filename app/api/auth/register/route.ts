import { NextResponse } from 'next/server'
import { createSession, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) return NextResponse.json({ error: 'Name, email, and an 8-character password are required.' }, { status: 400 })
  try {
    const user = await prisma.user.create({ data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await hashPassword(password) } })
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 })
    return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 })
  }
}
