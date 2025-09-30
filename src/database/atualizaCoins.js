import { prisma } from './prismaClient.js';

// Pega os argumentos passados no terminal
// Ex: node atualizaCoins.js --discord 910237821903 --coins 10000
const args = process.argv.slice(2);

const discordArgIndex = args.indexOf('--discord');
const coinsArgIndex = args.indexOf('--coins');

if (discordArgIndex === -1 || coinsArgIndex === -1) {
    console.error('Uso: node atualizaCoins.js --discord <discordId> --coins <valor>');
    process.exit(1);
}

const discordId = args[discordArgIndex + 1];
const coins = parseInt(args[coinsArgIndex + 1]);

if (isNaN(coins)) {
    console.error('O valor de coins precisa ser um número.');
    process.exit(1);
}

async function main() {
    const user = await prisma.user.findUnique({ where: { discordId } });

    if (!user) {
        console.error('Usuário não encontrado no banco.');
        process.exit(1);
    }

    await prisma.user.update({
        where: { discordId },
        data: { coins }
    });

    console.log(`Coins do usuário ${discordId} atualizados para ${coins}!`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
