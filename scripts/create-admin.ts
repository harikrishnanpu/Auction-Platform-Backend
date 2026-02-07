// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@hm.com';
    const password = 'admin123';
    const name = 'Admin User';
    const phone = '+1234567890';
    const address = 'Admin Address';

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            address,
            password_hash: passwordHash,
            is_blocked: false,
            is_verified: true,
            UserRole: {
                create: {
                    role: 'ADMIN'
                }
            }
        }
    });

}

createAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());