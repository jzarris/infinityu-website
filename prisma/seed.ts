import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'jack@nyx0.dev';
  const adminPassword = 'InfinityU@2026!Adm';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists, skipping...`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Jack Zarris',
      role: 'admin',
      password: hashedPassword,
      isActive: true,
      totpEnabled: false,
    },
  });

  console.log(`Admin user created: ${adminEmail}`);
  console.log('IMPORTANT: Change your password and enable 2FA after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
