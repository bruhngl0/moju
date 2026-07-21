'use client'

import { FormEvent, useEffect, useState } from 'react'

type Registration = { id: string; status: string; user: { name: string; email: string } }
type Post = { id: string; caption: string; hidden: boolean; author: { name: string }; reports: { reason: string }[]; _count: { votes: number } }
type Message = { id: string; displayName: string; body: string; hidden: boolean; reports: { reason: string }[] }
type Tournament = { id: string; slug: string; title: string; description: string; startsAt: string; endsAt: string | null; status: string; rules: string; winnerPostId: string | null; registrations: Registration[]; memePosts: Post[]; chatMessages: Message[] }

const emptyForm = { title: '', slug: '', description: '', startsAt: '', endsAt: '', rules: '', entryFeePaise: '0', maxPlayers: '64' }

export default function AdminDashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const response = await fetch('/api/admin/tournaments')
    const data = await response.json()
    if (!response.ok) return setMessage(data.error || 'Admin access required.')
    setTournaments(data.tournaments || [])
  }
  useEffect(() => { load() }, [])

  const update = async (id: string, body: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/tournaments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await response.json()
    setMessage(response.ok ? 'Tournament updated.' : data.error || 'Could not update tournament.')
    if (response.ok) load()
  }
  const moderate = async (target: 'meme' | 'chat', targetId: string, action: 'hide' | 'show' | 'delete') => {
    const response = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, targetId, action }) })
    const data = await response.json()
    setMessage(response.ok ? `Content ${action}d.` : data.error || 'Moderation failed.')
    if (response.ok) load()
  }
  const create = async (event: FormEvent) => {
    event.preventDefault(); setMessage('Creating bracket...')
    const response = await fetch('/api/admin/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, entryFeePaise: Number(form.entryFeePaise), maxPlayers: Number(form.maxPlayers) }) })
    const data = await response.json()
    if (!response.ok) return setMessage(data.error || 'Could not create tournament.')
    setMessage('Bracket created. The chaos has a calendar entry.'); setForm(emptyForm); load()
  }

  return <section className="admin shell">
    <div className="admin-hero"><div><p className="eyebrow">Moju control room / local only</p><h1>Admin<br /><em>chaos.</em></h1><p>Create brackets, move them through their lifecycle, choose winners, and remove anything that got too weird.</p></div><a className="directory-register" href="/tournaments">view public directory ↗</a></div>
    {message && <p className="directory-message">{message}</p>}
    <div className="admin-grid">
      <form className="admin-card admin-create" onSubmit={create}><div className="panel-heading"><h2>New tournament.</h2><span>make a bracket</span></div><input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /><input placeholder="slug (e.g. caption-calamity-02)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /><textarea placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><div className="admin-two"><input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required /><input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></div><textarea placeholder="rules (optional)" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /><div className="admin-two"><input type="number" min="0" placeholder="entry fee paise" value={form.entryFeePaise} onChange={(e) => setForm({ ...form, entryFeePaise: e.target.value })} /><input type="number" min="1" placeholder="max players" value={form.maxPlayers} onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })} /></div><button className="directory-register" type="submit">create tournament ↗</button></form>
      <div className="admin-card"><div className="panel-heading"><h2>Brackets.</h2><span>{tournaments.length} total</span></div>{tournaments.length ? tournaments.map((tournament) => <article className="admin-tournament" key={tournament.id}><div><strong>{tournament.title}</strong><span>{tournament.slug}</span></div><select value={tournament.status} onChange={(e) => update(tournament.id, { status: e.target.value })}><option>UPCOMING</option><option>LIVE</option><option>COMPLETED</option></select><small>{new Date(tournament.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {tournament.registrations.filter((r) => r.status === 'CONFIRMED').length} confirmed</small><textarea value={tournament.rules} onChange={(e) => setTournaments(tournaments.map((item) => item.id === tournament.id ? { ...item, rules: e.target.value } : item))} onBlur={(e) => update(tournament.id, { rules: e.target.value })} />
        <div className="admin-content"><b>Memes / reports</b>{tournament.memePosts.length ? tournament.memePosts.map((post) => <div className="admin-row" key={post.id}><span>{post.author.name}: {post.caption} · {post._count.votes} votes{post.reports.length ? ` · ⚠ ${post.reports.length}` : ''}</span><button onClick={() => update(tournament.id, { winnerPostId: post.id })}>{tournament.winnerPostId === post.id ? 'winner ✓' : 'winner'}</button><button onClick={() => moderate('meme', post.id, post.hidden ? 'show' : 'hide')}>{post.hidden ? 'show' : 'hide'}</button><button onClick={() => moderate('meme', post.id, 'delete')}>delete</button></div>) : <small>none</small>}<b>Chat / reports</b>{tournament.chatMessages.length ? tournament.chatMessages.map((chat) => <div className="admin-row" key={chat.id}><span>{chat.displayName}: {chat.body}{chat.reports.length ? ` · ⚠ ${chat.reports.length}` : ''}</span><button onClick={() => moderate('chat', chat.id, chat.hidden ? 'show' : 'hide')}>{chat.hidden ? 'show' : 'hide'}</button><button onClick={() => moderate('chat', chat.id, 'delete')}>delete</button></div>) : <small>none</small>}</div>
      </article>) : <p className="database-note">No tournaments yet.</p>}</div>
    </div>
  </section>
}
