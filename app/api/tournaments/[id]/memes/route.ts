import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { localRateLimit } from '@/lib/local-limit'
import { isTournamentLive } from '@/lib/tournaments'
export const dynamic = 'force-dynamic'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: 'Sign in to post a meme.' }, { status: 401 })
  const { imageData, caption } = await request.json()
  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) return NextResponse.json({ error: 'Please upload an image.' }, { status: 400 })
  if (imageData.length > 4_000_000) return NextResponse.json({ error: 'That meme is too thicc. Keep it under 3 MB.' }, { status: 413 })
  if (typeof caption !== 'string' || !caption.trim()) return NextResponse.json({ error: 'Give your meme a caption.' }, { status: 400 })
  const tournament = await prisma.tournament.findUnique({ where: { slug: id } }); if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
  if (!isTournamentLive(tournament)) return NextResponse.json({ error: 'This arena is not live yet.' }, { status: 409 })
  if (!localRateLimit(`meme:${user.id}:${tournament.id}`, 10, 60 * 60 * 1000)) return NextResponse.json({ error: 'Local limit reached: max 10 meme posts per player per hour.' }, { status: 429 })
  const registration = await prisma.registration.findUnique({ where: { userId_tournamentId: { userId: user.id, tournamentId: tournament.id } }, select: { status: true } })
  if (registration?.status !== 'CONFIRMED') return NextResponse.json({ error: 'Only registered tournament players can post memes. You can still vote, react, and chat.' }, { status: 403 })
  const post = await prisma.memePost.create({ data: { tournamentId: tournament.id, authorId: user.id, imageData, caption: caption.trim().slice(0, 280) }, include: { author: { select: { name: true } } } })
  return NextResponse.json({ post }, { status: 201 })
}
