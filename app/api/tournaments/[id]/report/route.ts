import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { localRateLimit } from '@/lib/local-limit'
import { isTournamentLive } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { target, targetId, reporterKey, reason } = await request.json()
  if (!['meme', 'chat'].includes(target) || typeof targetId !== 'string' || typeof reporterKey !== 'string' || typeof reason !== 'string' || !reason.trim()) return NextResponse.json({ error: 'A report target and reason are required.' }, { status: 400 })
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } })
  if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
  if (!isTournamentLive(tournament)) return NextResponse.json({ error: 'Reports open when the arena is live.' }, { status: 409 })
  if (!localRateLimit(`report:${reporterKey}:${tournament.id}`, 20, 60 * 60 * 1000)) return NextResponse.json({ error: 'Local report limit reached.' }, { status: 429 })
  if (target === 'meme') {
    const post = await prisma.memePost.findFirst({ where: { id: targetId, tournamentId: tournament.id } })
    if (!post) return NextResponse.json({ error: 'Meme not found.' }, { status: 404 })
    await prisma.memeReport.upsert({ where: { postId_reporterKey: { postId: targetId, reporterKey } }, update: { reason: reason.trim().slice(0, 240), status: 'OPEN' }, create: { postId: targetId, reporterKey, reason: reason.trim().slice(0, 240) } })
  } else {
    const message = await prisma.chatMessage.findFirst({ where: { id: targetId, tournamentId: tournament.id } })
    if (!message) return NextResponse.json({ error: 'Chat message not found.' }, { status: 404 })
    await prisma.chatReport.upsert({ where: { messageId_reporterKey: { messageId: targetId, reporterKey } }, update: { reason: reason.trim().slice(0, 240), status: 'OPEN' }, create: { messageId: targetId, reporterKey, reason: reason.trim().slice(0, 240) } })
  }
  return NextResponse.json({ ok: true })
}
