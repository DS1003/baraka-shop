import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'EPSON' } },
        { name: { contains: 'LONENE' } }
      ]
    },
    select: { id: true, name: true, price: true, stock: true }
  })
  console.log(JSON.stringify(products, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
