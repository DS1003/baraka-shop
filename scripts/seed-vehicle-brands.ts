import prisma from "../lib/prisma";

const rawBrands = [
  "Audi", "Chevrolet", "Nissan", "Toyota", "Honda", "Volkswagen", "Mazda", "Ford", "BMW", "Acura", 
  "AIXAM", "Alfa Romeo", "Alpina", "Alpine", "AMC", "Asia Motors", "Aston Martin", "Austin", "Autobianchi", 
  "Autres", "baic", "beijing", "Bentley", "Buick", "byc", "byd", "Cadillac", "camping-car", "changan", 
  "Chery", "Chrysler", "Citroen", "Cord", "Corvette", "Dacia", "Daewoo", "Daihatsu", "Daily", "Datsun", 
  "DeLorean", "DeSoto", "DeTomaso", "Dodge", "Eagle", "Edsel", "Eurocargo", "Ferrari", "Fiat", "geely", 
  "Geo", "GMC", "Great Wall", "Hummer", "Hyundai", "Infinity", "International Harvester", "Isuzu", "Jaguar", 
  "Jeep", "jetour", "jmc", "kaiyi", "Kia", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln", 
  "Maserati", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Morris", "Nash", "Opel", "Other", "Peugeot", 
  "Porsche", "Range Rover", "Renault", "Rexton", "roewe", "S-WAY", "Saab", "Saturn", "Seat", "sinotruk", 
  "Skoda", "Smart", "Ssangyong", "Stralis", "Subaru", "Suzuki", "T-WAY", "Talbot", "Tata", "tesla", 
  "Trakker", "TVR", "Vauxhall", "Volvo", "X-WAY"
];

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Starting vehicle brands seeding...");
  
  // Deduplicate and clean
  const uniqueBrands = Array.from(new Set(rawBrands.map(b => b.trim()))).filter(Boolean);

  let added = 0;
  let skipped = 0;

  for (const brandName of uniqueBrands) {
    const slug = generateSlug(brandName);
    const existingBrand = await prisma.brand.findUnique({
      where: { slug }
    });

    if (!existingBrand) {
      // Also check by name just in case
      const existingByName = await prisma.brand.findUnique({
        where: { name: brandName }
      });

      if (!existingByName) {
        await prisma.brand.create({
          data: {
            name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
            slug
          }
        });
        added++;
        console.log(`Added: ${brandName}`);
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\nSeeding finished! Added ${added} new brands, skipped ${skipped} existing ones.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
