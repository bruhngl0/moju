import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { effectiveTournamentStatus } from '@/lib/tournaments'
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } })
  if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
  const user = await getCurrentUser()
  const registration = user ? await prisma.registration.findUnique({ where: { userId_tournamentId: { userId: user.id, tournamentId: tournament.id } }, select: { status: true } }) : null
  const [posts, chat] = await Promise.all([
    prisma.memePost.findMany({ where: { tournamentId: tournament.id, hidden: false }, orderBy: { createdAt: 'desc' }, take: 60, include: { author: { select: { name: true } }, reactions: true, votes: true } }),
    prisma.chatMessage.findMany({ where: { tournamentId: tournament.id, hidden: false }, orderBy: { createdAt: 'desc' }, take: 100, include: { reactions: true } }),
  ])
  const postData = posts.map((post) => ({ ...post, reactionCounts: post.reactions.reduce<Record<string, number>>((counts, reaction) => { counts[reaction.kind] = (counts[reaction.kind] || 0) + 1; return counts }, {}), voteCount: post.votes.length }))
  const chatData = chat.reverse().map((message) => ({ ...message, reactionCounts: message.reactions.reduce<Record<string, number>>((counts, reaction) => { counts[reaction.kind] = (counts[reaction.kind] || 0) + 1; return counts }, {}) }))
  const liveStatus = effectiveTournamentStatus(tournament)
  return NextResponse.json({ tournament: { ...tournament, status: liveStatus }, posts: postData, chat: chatData, canPost: registration?.status === 'CONFIRMED' })
}
