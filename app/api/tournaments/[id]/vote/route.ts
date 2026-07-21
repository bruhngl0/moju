import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTournamentLive } from '@/lib/tournaments'
export const dynamic = 'force-dynamic'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { postId, voterKey } = await request.json(); if (!postId || !voterKey) return NextResponse.json({ error: 'A voter key and meme are required.' }, { status: 400 })
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } }); const post = await prisma.memePost.findFirst({ where: { id: postId, tournamentId: tournament?.id } })
  if (!tournament || !post) return NextResponse.json({ error: 'Meme not found in this arena.' }, { status: 404 })
  if (!isTournamentLive(tournament)) return NextResponse.json({ error: 'Voting opens when the arena is live.' }, { status: 409 })
  await prisma.pollVote.upsert({ where: { tournamentId_voterKey: { tournamentId: tournament.id, voterKey } }, update: { postId }, create: { tournamentId: tournament.id, postId, voterKey } })
  return NextResponse.json({ ok: true })
}
