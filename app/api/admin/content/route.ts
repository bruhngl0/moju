import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const { target, targetId, action } = await request.json()
  if (!['meme', 'chat'].includes(target) || typeof targetId !== 'string' || !['hide', 'show', 'delete'].includes(action)) return NextResponse.json({ error: 'Invalid moderation action.' }, { status: 400 })
  if (target === 'meme') {
    if (action === 'delete') await prisma.memePost.delete({ where: { id: targetId } })
    else await prisma.memePost.update({ where: { id: targetId }, data: { hidden: action === 'hide' } })
    await prisma.memeReport.updateMany({ where: { postId: targetId, status: 'OPEN' }, data: { status: 'RESOLVED' } })
  } else {
    if (action === 'delete') await prisma.chatMessage.delete({ where: { id: targetId } })
    else await prisma.chatMessage.update({ where: { id: targetId }, data: { hidden: action === 'hide' } })
    await prisma.chatReport.updateMany({ where: { messageId: targetId, status: 'OPEN' }, data: { status: 'RESOLVED' } })
  }
  return NextResponse.json({ ok: true })
}
