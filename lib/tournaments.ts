import { TournamentStatus } from '@prisma/client'

export function effectiveTournamentStatus(tournament: { status: TournamentStatus; startsAt: Date; endsAt: Date | null }, now = new Date()): TournamentStatus {
  if (tournament.status === 'COMPLETED') return 'COMPLETED'
  if (tournament.endsAt && tournament.endsAt <= now) return 'COMPLETED'
  if (tournament.status === 'LIVE' || tournament.startsAt <= now) return 'LIVE'
  return 'UPCOMING'
}

export function isTournamentLive(tournament: { status: TournamentStatus; startsAt: Date; endsAt: Date | null }, now = new Date()) {
  return effectiveTournamentStatus(tournament, now) === 'LIVE'
}
