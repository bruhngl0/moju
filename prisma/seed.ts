import { PrismaClient, TournamentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tournaments = [
    {
      slug: 'caption-calamity-01',
      title: 'Caption Calamity #01',
      description: 'Three rounds. One image. Absolutely no context.',
      startsAt: new Date('2026-08-01T18:00:00+05:30'),
      entryFeePaise: 9900,
      maxPlayers: 64,
      status: TournamentStatus.UPCOMING,
    },
    {
      slug: 'reaction-royale-01',
      title: 'Reaction Royale #01',
      description: 'Bring your most devastatingly specific reaction image.',
      startsAt: new Date('2026-08-15T18:00:00+05:30'),
      entryFeePaise: 0,
      maxPlayers: 32,
      status: TournamentStatus.UPCOMING,
    },
    {
      slug: 'test-arena-now',
      title: 'Test Arena: Already Chaos',
      description: 'A past-start tournament for testing the live arena without waiting like a responsible adult.',
      startsAt: new Date('2026-07-21T09:00:00+05:30'),
      entryFeePaise: 0,
      maxPlayers: 16,
      status: TournamentStatus.UPCOMING,
    },
  ]

  for (const tournament of tournaments) {
    await prisma.tournament.upsert({
      where: { slug: tournament.slug },
      update: tournament,
      create: tournament,
    })
  }

  await prisma.user.updateMany({ where: { email: 'aditya@gmail.com' }, data: { isAdmin: true } })
}

main().finally(() => prisma.$disconnect())
