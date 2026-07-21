import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { effectiveTournamentStatus } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  const tournaments = await prisma.tournament.findMany({ orderBy: { startsAt: 'asc' }, include: { _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } }, registrations: user ? { where: { userId: user.id }, select: { status: true } } : undefined } })
  const now = new Date()
  return NextResponse.json({ tournaments: tournaments.map((tournament) => ({ id: tournament.id, slug: tournament.slug, title: tournament.title, description: tournament.description, startsAt: tournament.startsAt, endsAt: tournament.endsAt, rules: tournament.rules, winnerPostId: tournament.winnerPostId, entryFeePaise: tournament.entryFeePaise, maxPlayers: tournament.maxPlayers, status: effectiveTournamentStatus(tournament, now), myRegistration: tournament.registrations?.[0]?.status || null, _count: tournament._count })) })
}
