import { notFound } from 'next/navigation'
import LiveArena from '@/components/LiveArena'
import { prisma } from '@/lib/prisma'
import { isTournamentLive } from '@/lib/tournaments'

export const dynamic = 'force-dynamic'

export default async function TournamentSandboxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tournament = await prisma.tournament.findUnique({ where: { slug }, select: { slug: true, status: true, startsAt: true, endsAt: true } })
  if (!tournament) notFound()
  if (!isTournamentLive(tournament)) return <main className="sandbox-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/tournaments" className="back-link">← tournament directory</a></header><section className="no-live-arena shell"><p className="eyebrow">Moju Meme Wars / Arena locked</p><h1>Not live<br /><em>yet.</em></h1><p>This tournament is not currently live. The memes are waiting in the wings.</p><a className="directory-register" href="/tournaments">back to schedule ↗</a></section></main>

  return <main className="sandbox-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/tournaments" className="back-link">← tournament directory</a></header><LiveArena slug={tournament.slug} /></main>
}
