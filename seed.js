const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding MVP users...');

    // 환자 테스트 계정
    const patient = await prisma.user.upsert({
        where: { username: 'patient1' },
        update: {},
        create: {
            username: 'patient1',
            password: '123',
            name: '홍길동',
            role: '환자',
        },
    });

    // 의사 테스트 계정
    const doctor = await prisma.user.upsert({
        where: { username: 'doctor1' },
        update: {},
        create: {
            username: 'doctor1',
            password: '123',
            name: '김철수',
            role: '의사',
        },
    });

    console.log('Seed completed:', { patient, doctor });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
