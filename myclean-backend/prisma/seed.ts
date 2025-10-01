import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // Upsert a user (safe to re-run multiple times)
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", name: "Alice" },
  });

  // Upsert a service (using a fixed id for re-runs)
  const stdClean = await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "House Cleaning",
      description: "2-hour full house cleaning",
      durationMin: 120,
      priceCents: 8000
    },
  });

  console.log("✅ Seeded:", { alice, stdClean });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



