import LiveArena from '@/components/LiveArena'
import { prisma } from '@/lib/prisma'
import { effectiveTournamentStatus } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

export default async function SandboxPage() {
  const now = new Date()
  const tournaments = await prisma.tournament.findMany({ orderBy: { startsAt: 'asc' }, select: { slug: true, status: true, startsAt: true, endsAt: true } })
  const tournament = tournaments.find((item) => effectiveTournamentStatus(item, now) === 'LIVE')

  return <main className="sandbox-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/tournaments" className="back-link">← tournament directory</a></header>{tournament ? <LiveArena slug={tournament.slug} /> : <section className="no-live-arena shell"><p className="eyebrow">Moju Meme Wars / Live sandbox</p><h1>No live<br /><em>chaos.</em></h1><p>Nothing is live right now. The memes are warming up in the hallway.</p><a className="directory-register" href="/tournaments">check tournament schedule ↗</a></section>}</main>
}
