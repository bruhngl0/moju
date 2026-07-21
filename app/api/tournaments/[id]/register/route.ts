import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { effectiveTournamentStatus } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in before registering.' }, { status: 401 })
  const tournament = await prisma.tournament.findUnique({ where: { id }, include: { _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } } } })
  if (!tournament || effectiveTournamentStatus(tournament) !== 'UPCOMING') return NextResponse.json({ error: 'This tournament is not open for registration.' }, { status: 400 })
  if (tournament._count.registrations >= tournament.maxPlayers) return NextResponse.json({ error: 'This bracket is full.' }, { status: 409 })
  const existing = await prisma.registration.findUnique({ where: { userId_tournamentId: { userId: user.id, tournamentId: tournament.id } }, include: { payment: true } })
  if (existing?.status === 'CONFIRMED') return NextResponse.json({ error: 'You are already in this bracket.' }, { status: 409 })

  if (tournament.entryFeePaise === 0) {
    const registration = existing ? await prisma.registration.update({ where: { id: existing.id }, data: { status: 'CONFIRMED' } }) : await prisma.registration.create({ data: { userId: user.id, tournamentId: tournament.id, status: 'CONFIRMED' } })
    return NextResponse.json({ registration, paid: true })
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: 'Razorpay test keys are missing from .env.local.' }, { status: 503 })
  let order
  try {
    const credentials = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: tournament.entryFeePaise, currency: 'INR', receipt: `moju_${user.id.slice(-8)}_${tournament.id.slice(-8)}` }) })
    if (!orderResponse.ok) {
      const razorpayError = await orderResponse.json().catch(() => null) as { error?: { description?: string } } | null
      throw new Error(razorpayError?.error?.description || 'Razorpay order creation failed')
    }
    order = await orderResponse.json() as { id: string; amount: number; currency: string }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Razorpay order creation failed'
    return NextResponse.json({ error: `Razorpay could not create the test order: ${reason}` }, { status: 503 })
  }
  const registration = existing ? await prisma.registration.update({ where: { id: existing.id }, data: { status: 'PENDING_PAYMENT' } }) : await prisma.registration.create({ data: { userId: user.id, tournamentId: tournament.id } })
  await prisma.payment.upsert({ where: { registrationId: registration.id }, update: { orderId: order.id, amountPaise: tournament.entryFeePaise, status: 'CREATED' }, create: { registrationId: registration.id, orderId: order.id, amountPaise: tournament.entryFeePaise } })
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, registrationId: registration.id })
}
