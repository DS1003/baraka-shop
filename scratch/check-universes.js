const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.popularUniverse.count();
  console.log('Count:', count);
  const items = await prisma.popularUniverse.findMany();
  console.log('Items:', JSON.stringify(items, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
