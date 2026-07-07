import prisma from './lib/prisma'

async function main() {
  const history = await prisma.syncHistory.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10
  })
  console.log(JSON.stringify(history, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
