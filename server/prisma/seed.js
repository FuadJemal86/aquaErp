const bcrypt = require('bcrypt');
const prisma = require('./prisma');


async function seed() {
    const adminEmail = 'admin@example.com';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('✅ Admin already exists');
        return;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    await prisma.user.create({
        data: {
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            phone: '1234567890',
            role: 'ADMIN',
            isActive: true,
            image: null,
        },
    });

    console.log('✅ Admin user seeded successfully');
}

seed()
    .catch((err) => {
        console.error('❌ Seeding failed:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
