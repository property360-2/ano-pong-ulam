const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.recipe.count();
  console.log('Total recipes in DB:', count);
  const recipes = await prisma.recipe.findMany({ take: 5 });
  console.log('Sample recipes:', recipes.map(r => ({ id: r.id.toString(), title: r.title })));
  const plans = await prisma.mealPlan.findMany();
  console.log('Sample plans:', plans);
}

main().catch(console.error).finally(() => prisma.$disconnect());
