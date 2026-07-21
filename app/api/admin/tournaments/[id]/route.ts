import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const user = await getCurrentUser()
  return user?.isAdmin ? user : null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const data: { status?: 'UPCOMING' | 'LIVE' | 'COMPLETED'; startsAt?: Date; endsAt?: Date | null; rules?: string; winnerPostId?: string | null } = {}
  if (['UPCOMING', 'LIVE', 'COMPLETED'].includes(body.status)) data.status = body.status
  if (body.startsAt) data.startsAt = new Date(body.startsAt)
  if (body.endsAt !== undefined) data.endsAt = body.endsAt ? new Date(body.endsAt) : null
  if (typeof body.rules === 'string') data.rules = body.rules.trim().slice(0, 2000)
  if (body.winnerPostId !== undefined) data.winnerPostId = body.winnerPostId || null
  if ((data.startsAt && Number.isNaN(data.startsAt.getTime())) || (data.endsAt && Number.isNaN(data.endsAt.getTime()))) return NextResponse.json({ error: 'Invalid date supplied.' }, { status: 400 })
  try { const tournament = await prisma.tournament.update({ where: { id }, data }); return NextResponse.json({ tournament }) } catch { return NextResponse.json({ error: 'Tournament was not found or could not be updated.' }, { status: 404 }) }
}
