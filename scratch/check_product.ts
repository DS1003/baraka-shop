import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'SENNHEISER' } },
    include: {
      category: true,
      subCategory: true,
      thirdLevelCategory: true
    }
  });
  console.log(JSON.stringify(product, null, 2));
}

main().finally(() => prisma.$disconnect());
