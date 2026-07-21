import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tournament = await prisma.tournament.findUnique({ where: { slug } })
  if (!tournament) notFound()
  const posts = await prisma.memePost.findMany({ where: { tournamentId: tournament.id, hidden: false }, include: { author: { select: { name: true } }, _count: { select: { votes: true } } }, orderBy: { createdAt: 'asc' } })
  const ranked = posts.sort((a, b) => b._count.votes - a._count.votes)
  const winner = tournament.winnerPostId ? ranked.find((post) => post.id === tournament.winnerPostId) : ranked[0]
  return <main className="directory-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/tournaments" className="back-link">← tournament directory</a></header><section className="results shell"><p className="eyebrow">Moju Meme Wars / final results</p><h1>{tournament.title}<br /><em>is cooked.</em></h1><p className="results-copy">The people have voted. The leaderboard has spoken. The group chat remains unconvinced.</p>{winner ? <article className="winner-card"><span className="eyebrow">winner / people’s champion</span><h2>{winner.author.name}</h2><p>{winner.caption}</p><strong>{winner._count.votes} votes</strong></article> : <div className="empty-arena">No submitted memes yet. A clean sweep by nobody.</div>}<div className="results-list">{ranked.map((post, index) => <div key={post.id}><span>#{index + 1}</span><strong>{post.author.name}</strong><p>{post.caption}</p><b>{post._count.votes} votes</b></div>)}</div></section></main>
}
