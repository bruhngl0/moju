const buckets = new Map<string, { startedAt: number; count: number }>()

export function localRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.startedAt >= windowMs) {
    buckets.set(key, { startedAt: now, count: 1 })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}
