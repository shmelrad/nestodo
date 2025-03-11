import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
    const testEmail = process.env.TEST_EMAIL;
    const testUsername = process.env.TEST_USERNAME;
    const testPassword = process.env.TEST_PASSWORD;

    if (!testEmail || !testUsername || !testPassword) {
        throw new Error('TEST_EMAIL, TEST_USERNAME, and TEST_PASSWORD must be set');
    }

    const hashedPassword = await bcrypt.hash(testPassword, 10);

    await prisma.user.upsert({
        where: { email: testEmail },
        update: {},
        create: {
            email: testEmail,
            username: testUsername,
            passwordHash: hashedPassword
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })