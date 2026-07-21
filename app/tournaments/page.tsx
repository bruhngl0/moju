import TournamentDirectory from '@/components/TournamentDirectory'

export const dynamic = 'force-dynamic'

export default function TournamentsPage() {
  return <main className="directory-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/" className="back-link">← back to moju</a></header><TournamentDirectory /></main>
}
