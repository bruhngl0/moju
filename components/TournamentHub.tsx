'use client'

import Script from 'next/script'
import { FormEvent, useEffect, useState } from 'react'

type Tournament = { id: string; title: string; description: string; startsAt: string; entryFeePaise: number; maxPlayers: number; status: string; _count: { registrations: number } }
type User = { id: string; name: string; email: string }

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } } }

export default function TournamentHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [tournamentResponse, userResponse] = await Promise.all([fetch('/api/tournaments'), fetch('/api/auth/me')])
      const tournamentData = await tournamentResponse.json()
      const userData = await userResponse.json()
      setTournaments(tournamentData.tournaments || [])
      setUser(userData.user)
    } catch { setMessage('The local database is still stretching. Run the setup commands below.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault(); setMessage('')
    const response = await fetch(`/api/auth/${authMode === 'login' ? 'login' : 'register'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) })
    const data = await response.json()
    if (!response.ok) return setMessage(data.error || 'Auth failed.')
    setUser(data.user); setMessage(`Welcome in, ${data.user.name}. Your meme career starts now.`)
  }

  const register = async (tournament: Tournament) => {
    setMessage('Checking the bracket...')
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/register`, { method: 'POST' })
      const raw = await response.text()
      let data: { error?: string; orderId?: string; keyId?: string; amount?: number; currency?: string; registrationId?: string; paid?: boolean } = {}
      try { data = raw ? JSON.parse(raw) : {} } catch { data = {} }
      if (response.status === 401) return setMessage('Create an account or sign in first. The memes need an identity.')
      if (!response.ok) return setMessage(data.error || 'Registration failed. Please try again.')
      if (data.paid && data.orderId && window.Razorpay) {
      const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: 'Moju Meme Wars', description: tournament.title, order_id: data.orderId, prefill: { name: user?.name, email: user?.email }, theme: { color: '#ff5d2e' }, handler: async (payment: Record<string, string>) => { const verify = await fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payment, registrationId: data.registrationId }) }); setMessage(verify.ok ? 'Payment verified. You are officially dangerous.' : 'Payment happened, but verification is still thinking.') }, modal: { ondismiss: () => setMessage('Payment dismissed. The bracket will understand.') } })
      checkout.open()
      } else { setMessage('You are in. Start warming up your reaction images.') }
      load()
    } catch { setMessage('The registration server is having a tiny existential crisis. Please try again.') }
  }

  return <section className="tournament-hub shell" id="tournaments">
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    <div className="tournament-head"><div><p className="eyebrow">Moju Meme Wars</p><h2>Enter the<br /><em>arena.</em></h2><p>Organised chaos, lovingly bracketed. Register for a tournament, bring your best memes, and try not to get ratioed by a stranger.</p></div><div className="bracket-doodle"><span>MEME</span><b>VS</b><span>MEME</span><i>↘</i></div></div>
    <div className="tournament-body">
      <div className="tournament-list">{loading ? <div className="database-note">loading brackets from the local database...</div> : tournaments.map((tournament) => <article className="tournament-card" key={tournament.id}><div className="tournament-card-top"><span className="live-pill">● {tournament.status === 'LIVE' ? 'LIVE' : 'OPEN'}</span><span>{tournament._count.registrations}/{tournament.maxPlayers} players</span></div><h3>{tournament.title}</h3><p>{tournament.description}</p><div className="tournament-meta"><span>{new Date(tournament.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><strong>{tournament.entryFeePaise ? `₹${tournament.entryFeePaise / 100}` : 'FREE'}</strong></div><button className="arena-button" onClick={() => register(tournament)}>{user ? 'join this bracket ↗' : 'sign in to join ↗'}</button></article>)}</div>
      <aside className="auth-card"><div className="auth-tabs"><button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>new player</button><button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>returning player</button></div>{user ? <div className="signed-in"><p className="eyebrow">Player profile</p><h3>{user.name}</h3><p>{user.email}</p><p className="auth-message">{message || 'Your meme credentials are valid.'}</p><button className="mini-button" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); setMessage('Logged out. The arena misses you already.') }}>log out</button></div> : <form onSubmit={submitAuth}><p className="eyebrow">{authMode === 'register' ? 'Create your player tag' : 'Welcome back, warrior'}</p>{authMode === 'register' && <input placeholder="your name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />}<input type="email" placeholder="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required /><input type="password" placeholder="password (8+ characters)" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} minLength={8} required /><button className="arena-button" type="submit">{authMode === 'register' ? 'create account ↗' : 'sign in ↗'}</button><p className="auth-message">{message}</p></form>}</aside>
    </div>
  </section>
}
