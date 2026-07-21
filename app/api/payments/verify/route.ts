import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in before paying.' }, { status: 401 })
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = await request.json()
  const registration = await prisma.registration.findFirst({ where: { id: registrationId, userId: user.id }, include: { payment: true } })
  if (!registration?.payment) return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 })
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
  if (expected !== razorpay_signature || razorpay_order_id !== registration.payment.orderId) return NextResponse.json({ error: 'Payment signature could not be verified.' }, { status: 400 })
  await prisma.$transaction([
    prisma.payment.update({ where: { id: registration.payment.id }, data: { paymentId: razorpay_payment_id, signature: razorpay_signature, status: 'PAID' } }),
    prisma.registration.update({ where: { id: registration.id }, data: { status: 'CONFIRMED' } }),
  ])
  return NextResponse.json({ ok: true })
}
