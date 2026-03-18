import prisma from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  // SUPER ADMIN ROLE
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN" },
  });

  // ADMIN ROLE
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const password = await bcrypt.hash("admin123", 10);

  // SUPER ADMIN USER
  await prisma.admin.upsert({
    where: { email: "superadmin@test.com" },
    update: {},
    create: {
      email: "superadmin@test.com",
      name: "Super Admin",
      password,
      roleId: superAdminRole.id,
    },
  });

  // ADMIN USER
  await prisma.admin.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin",
      password,
      roleId: adminRole.id,
    },
  });

  console.log("🌱 Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
