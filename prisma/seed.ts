import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shards = [
    { cardName: 'Paragon', cardPhoto: 'paragon.jpg' },
    { cardName: 'Archdeva', cardPhoto: 'archDeva.jpg'  },
    { cardName: 'Faen Fistborn', cardPhoto: 'faenFistborn.jpg' },
    { cardName: 'Abaddon', cardPhoto: 'abaddon.jpg' },
    { cardName: 'Angel Prime', cardPhoto: 'angelPrime.jpg' },
  ];

  for (const shard of shards) {
    await prisma.cardShard.upsert({
      where: { cardName: shard.cardName },
      update: {},
      create: shard,
    });
  }

  console.log('Shards populados com sucesso!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());