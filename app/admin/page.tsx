import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return <main className="admin-page"><header className="directory-nav shell"><a href="/" className="directory-wordmark">moju<span>.</span></a><a href="/tournaments" className="back-link">← tournament directory</a></header><AdminDashboard /></main>
}
