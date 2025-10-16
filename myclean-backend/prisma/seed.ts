// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPass = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@myclean.com" },
    update: { role: "ADMIN" },
    create: { name: "Admin", email: "admin@myclean.com", passwordHash: adminPass, role: "ADMIN" },
  });

  // Only create services if none exist yet
  const svcCount = await prisma.service.count();
  if (svcCount === 0) {
    await prisma.service.createMany({
      data: [
        { title: "House Cleaning", description: "Standard clean", durationMin: 120, priceCents: 12000 },
        { title: "Deep Clean", description: "Deep clean & scrub", durationMin: 180, priceCents: 18000 },
        { title: "End of Lease", description: "Bond back clean", durationMin: 240, priceCents: 26000 },
      ],
    });
  }

  // One sample customer
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice", email: "alice@example.com", passwordHash: await bcrypt.hash("Alice@123", 10), role: "CUSTOMER" },
  });

  // One sample booking
  const svc = await prisma.service.findFirst();
  if (svc) {
    await prisma.booking.create({
      data: {
        userId: alice.id,
        serviceId: svc.id,
        startTime: new Date(Date.now() + 24 * 3600 * 1000),
        endTime: new Date(Date.now() + 26 * 3600 * 1000),
        address: "123 Sample St",
      },
    });
  }

  console.log("Seeded users, services (if empty), and a booking ✔");
}

main().finally(() => prisma.$disconnect());
