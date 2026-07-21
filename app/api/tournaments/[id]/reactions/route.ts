import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTournamentLive } from '@/lib/tournaments'
export const dynamic = 'force-dynamic'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { target, targetId, visitorKey, kind } = await request.json(); if (!targetId || !visitorKey || !kind || !['meme', 'chat'].includes(target)) return NextResponse.json({ error: 'Reaction is missing a target.' }, { status: 400 })
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } }); if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
  if (!isTournamentLive(tournament)) return NextResponse.json({ error: 'Reactions open when the arena is live.' }, { status: 409 })
  if (target === 'meme') { const post = await prisma.memePost.findFirst({ where: { id: targetId, tournamentId: tournament.id } }); if (!post) return NextResponse.json({ error: 'Meme not found.' }, { status: 404 }); await prisma.memeReaction.upsert({ where: { postId_visitorKey_kind: { postId: targetId, visitorKey, kind } }, update: {}, create: { postId: targetId, visitorKey, kind } }) }
  else { const message = await prisma.chatMessage.findFirst({ where: { id: targetId, tournamentId: tournament.id } }); if (!message) return NextResponse.json({ error: 'Chat message not found.' }, { status: 404 }); await prisma.chatReaction.upsert({ where: { messageId_visitorKey_kind: { messageId: targetId, visitorKey, kind } }, update: {}, create: { messageId: targetId, visitorKey, kind } }) }
  return NextResponse.json({ ok: true })
}
