import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultShards = [
    { cardName: 'Paragon', cardPhoto: 'paragon.jpeg' },
    { cardName: 'Killer Queen', cardPhoto: 'killerQueen.jpeg' },
    { cardName: 'Ridge Hunter', cardPhoto: 'ridgeHunter.jpeg' },
    { cardName: 'Sea Wizard', cardPhoto: 'seaWizard.jpeg' },
    { cardName: 'Prime Angel', cardPhoto: 'angelPrime.jpeg' }
  ];

  for (const shard of defaultShards) {
    const existingShard = await prisma.cardShard.findFirst({
      where: { cardName: shard.cardName }
    });
  
    if (!existingShard) {
      await prisma.cardShard.create({
        data: {
          cardName: shard.cardName,
          cardPhoto: shard.cardPhoto
        }
      });
      console.log(`Shard ${shard.cardName} foi adicionado ao banco.`);
    } else {
      console.log(`Shard ${shard.cardName} já existe no banco.`);
    }
  }

  console.log('Shards inseridos com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
