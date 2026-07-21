import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { effectiveTournamentStatus } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

async function admin() {
  const user = await getCurrentUser()
  return user?.isAdmin ? user : null
}

export async function GET() {
  if (!await admin()) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const tournaments = await prisma.tournament.findMany({ orderBy: { startsAt: 'asc' }, include: { registrations: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } }, memePosts: { orderBy: { createdAt: 'desc' }, take: 30, select: { id: true, caption: true, hidden: true, author: { select: { name: true } }, reports: { where: { status: 'OPEN' }, select: { reason: true } }, _count: { select: { votes: true } } } }, chatMessages: { orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, displayName: true, body: true, hidden: true, reports: { where: { status: 'OPEN' }, select: { reason: true } } } } } })
  const now = new Date()
  return NextResponse.json({ tournaments: tournaments.map((tournament) => ({ ...tournament, status: effectiveTournamentStatus(tournament, now) })) })
}

export async function POST(request: Request) {
  if (!await admin()) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const body = await request.json()
  if (typeof body.title !== 'string' || typeof body.slug !== 'string' || typeof body.description !== 'string' || !body.startsAt) return NextResponse.json({ error: 'Title, slug, description, and start time are required.' }, { status: 400 })
  const startsAt = new Date(body.startsAt); const endsAt = body.endsAt ? new Date(body.endsAt) : null
  if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime())) || (endsAt && endsAt <= startsAt)) return NextResponse.json({ error: 'Start/end times are invalid. End must be after start.' }, { status: 400 })
  try {
    const tournament = await prisma.tournament.create({ data: { title: body.title.trim().slice(0, 120), slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'), description: body.description.trim().slice(0, 500), startsAt, endsAt, rules: typeof body.rules === 'string' ? body.rules.trim().slice(0, 2000) : undefined, entryFeePaise: Number(body.entryFeePaise) || 0, maxPlayers: Math.max(Number(body.maxPlayers) || 64, 1) } })
    return NextResponse.json({ tournament }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Could not create tournament. Check that the slug is unique.' }, { status: 409 }) }
}
