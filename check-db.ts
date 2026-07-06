import { config } from 'dotenv'
config()

async function main() {
  const { default: prisma } = await import('./lib/prisma.js');
  
  // Publier uniquement les produits qui ont des images (= produits complets)
  const result = await prisma.product.updateMany({
    where: {
      NOT: { images: { isEmpty: true } }
    },
    data: { isPublished: true }
  })
  
  console.log(`✅ ${result.count} produit(s) avec images republié(s)`)

  const publishedCount = await prisma.product.count({ where: { isPublished: true } })
  const unpublishedCount = await prisma.product.count({ where: { isPublished: false } })
  
  console.log(`Publiés: ${publishedCount} | Dépubliés: ${unpublishedCount}`)
  
  process.exit(0)
}
main().catch(console.error)
