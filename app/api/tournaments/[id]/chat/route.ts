import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { localRateLimit } from '@/lib/local-limit'
import { isTournamentLive } from '@/lib/tournaments'
export const dynamic = 'force-dynamic'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { body, displayName } = await request.json(); if (typeof body !== 'string' || !body.trim()) return NextResponse.json({ error: 'Say something first.' }, { status: 400 })
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } }); if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
  if (!isTournamentLive(tournament)) return NextResponse.json({ error: 'Chat opens when the arena goes live.' }, { status: 409 })
  const user = await getCurrentUser(); const visitorKey = user?.id || request.headers.get('x-forwarded-for') || 'guest'; if (!localRateLimit(`chat:${visitorKey}:${tournament.id}`, 12, 60 * 60 * 1000)) return NextResponse.json({ error: 'Local chat limit reached. Take a tiny hydration break.' }, { status: 429 }); const message = await prisma.chatMessage.create({ data: { tournamentId: tournament.id, userId: user?.id, displayName: (user?.name || displayName || 'Anonymous Goblin').trim().slice(0, 60), body: body.trim().slice(0, 500) } })
  return NextResponse.json({ message }, { status: 201 })
}
