'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

type Tournament = { id: string; slug: string; title: string; description: string; startsAt: string; endsAt?: string | null; rules?: string; winnerPostId?: string | null; entryFeePaise: number; maxPlayers: number; status: string; myRegistration?: string | null; _count: { registrations: number } }
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } } }

const dateFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
const timeFormatter = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata', timeZoneName: 'short' })
const countdown = (milliseconds: number) => { const totalMinutes = Math.max(Math.floor(milliseconds / 60000), 0); const days = Math.floor(totalMinutes / 1440); const hours = Math.floor((totalMinutes % 1440) / 60); const minutes = totalMinutes % 60; return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m` }

export default function TournamentDirectory() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => Date.now())

  const load = async () => {
    const response = await fetch('/api/tournaments')
    const data = await response.json()
    setTournaments(data.tournaments || [])
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const register = async (tournament: Tournament) => {
    setMessage('Checking your meme credentials...')
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/register`, { method: 'POST' })
      const raw = await response.text()
      let data: { error?: string; orderId?: string; keyId?: string; amount?: number; currency?: string; registrationId?: string; paid?: boolean } = {}
      try { data = raw ? JSON.parse(raw) : {} } catch { data = {} }
      if (response.status === 401) return setMessage('Please sign in on the homepage first, then come back here.')
      if (!response.ok) return setMessage(data.error || 'Registration failed. Please try again.')
      if (data.orderId) {
        if (!window.Razorpay) return setMessage('Razorpay checkout is still loading. Refresh the page and try again.')
        const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: 'Moju Meme Wars', description: tournament.title, order_id: data.orderId, handler: async (payment: Record<string, string>) => { const verification = await fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payment, registrationId: data.registrationId }) }); setMessage(verification.ok ? 'Payment successful. You are registered in the bracket.' : 'Payment completed, but verification needs another minute.') } })
        checkout.open()
      } else if (tournament.entryFeePaise > 0) return setMessage(data.error || 'Payment order was not created. Please try again.')
      else setMessage('Registered. Go make your memes fear you.')
      load()
    } catch { setMessage('The registration server is having a tiny existential crisis. Please try again.') }
  }

  return <section className="directory shell"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onError={() => setMessage('Razorpay checkout could not load. Check your internet connection and refresh.')} /><div className="directory-hero"><p className="eyebrow">Moju Meme Wars / Tournament directory</p><h1>Pick your<br /><em>battle.</em></h1><p>All brackets. All the details. None of the dignity.</p></div><div className="directory-grid">{tournaments.map((tournament) => {
    const startsAt = new Date(tournament.startsAt)
    const isCompleted = tournament.status === 'COMPLETED' || Boolean(tournament.endsAt && now >= new Date(tournament.endsAt).getTime())
    const isLive = !isCompleted && tournament.status === 'LIVE'
    const available = Math.max(tournament.maxPlayers - tournament._count.registrations, 0)
    return <article className={`directory-card${isLive ? ' is-live' : ''}`} key={tournament.id}>
      <div className="directory-card-top"><span className={`directory-status${isLive ? ' live' : ''}`}>● {isCompleted ? 'COMPLETED' : isLive ? 'LIVE NOW' : 'SCHEDULED'}</span><span>#{tournament.id.slice(-4)}</span></div>
      <h2>{tournament.title}</h2>
      <p>{tournament.description}</p>
      <div className="scheduled-time"><span>scheduled launch</span><strong>{dateFormatter.format(startsAt)}</strong><b>{timeFormatter.format(startsAt)}</b>{!isLive && !isCompleted && <small>starts in {countdown(startsAt.getTime() - now)}</small>}</div>
      <div className="slots-row"><div><strong>{available}</strong><span>slots available</span></div><div><strong>{tournament._count.registrations}</strong><span>registered</span></div><div><strong>{tournament.entryFeePaise ? `₹${tournament.entryFeePaise / 100}` : 'FREE'}</strong><span>entry fee</span></div></div>
      {isLive && !isCompleted ? <a className="directory-register enter-arena" href={`/sandbox/${tournament.slug}`}>live now — enter the arena ↗</a> : isCompleted ? <a className="directory-register" href={`/tournaments/${tournament.slug}/results`}>view results ↗</a> : <button className="directory-register" onClick={() => register(tournament)} disabled={tournament.myRegistration === 'CONFIRMED'}>{tournament.myRegistration === 'CONFIRMED' ? 'registered ✓' : tournament.myRegistration === 'PENDING_PAYMENT' ? 'payment pending ↗' : 'register now ↗'}</button>}
    </article>
  })}</div>{message && <p className="directory-message">{message}</p>}</section>
}
