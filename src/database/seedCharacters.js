import { prisma } from './prismaClient.js';

async function main() {
    // 🔹 Personagens ilimitados (para banner padrão)
    const unlimitedCharacters = [
        { name: 'Lucao', rarity: 'SSR', imageUrl: 'https://i.imgur.com/5YGOFeB.jpg', limited: false },
        { name: 'HeyVenas', rarity: 'SSR', imageUrl: 'https://i.imgur.com/oj9eI2b.jpeg', limited: false },
        { name: 'ADM', rarity: 'SSR', imageUrl: 'https://i.imgur.com/uBsSQhp.png', limited: false },
        { name: 'Cebola', rarity: 'SR', imageUrl: 'https://i.imgur.com/IRsdMbX.jpeg', limited: false },
        { name: 'BloodBornePC', rarity: 'SR', imageUrl: 'https://i.imgur.com/tRDb2aP.png', limited: false },
        { name: 'Inaa', rarity: 'SR', imageUrl: 'https://i.imgur.com/9hEq0B7.png', limited: false },
        { name: 'Anthony', rarity: 'R', imageUrl: 'https://i.imgur.com/oUqtP77.png', limited: false },
        { name: 'Gustavo', rarity: 'R', imageUrl: 'https://i.imgur.com/dUGQUO2.jpeg', limited: false },
        { name: 'Power', rarity: 'R', imageUrl: 'https://i.imgur.com/Y0mcjYA.jpeg', limited: false }
    ];

    const savedUnlimited = [];
    for (const char of unlimitedCharacters) {
        const saved = await prisma.character.upsert({
            where: { name: char.name },
            update: { imageUrl: char.imageUrl, limited: false },
            create: char
        });
        savedUnlimited.push(saved);
    }

    console.log('Personagens ilimitados criados.');

    // 🔹 Banner especial Pikirito
    const limitedBanner = await prisma.banner.upsert({
        where: { name: 'pikirito' },
        update: {name: 'pikirito'},
        create: { name: 'pikirito' }
    });

    const limitedCharacters = [
        { name: 'Pikirito de Camiseta', rarity: 'SSR', imageUrl: 'https://i.imgur.com/Sc6RQBV.jpg', rateUp: true },
        { name: 'Kawaiirito', rarity: 'SR', imageUrl: 'https://i.imgur.com/Q4n6lkr.png', rateUp: true },
        { name: 'Ninja Gaidenrito', rarity: 'R', imageUrl: 'https://i.imgur.com/AwOM7Jx.png', rateUp: false }
    ];

    const savedLimited = [];
    for (const char of limitedCharacters) {
        // Cria ou atualiza personagem (sem rateUp aqui!)
        const saved = await prisma.character.upsert({
            where: { name: char.name },
            update: { imageUrl: char.imageUrl, limited: true },
            create: { name: char.name, rarity: char.rarity, imageUrl: char.imageUrl, limited: true }
        });
        savedLimited.push(saved);
    }

    // 🔹 Vincula os personagens ao banner com rateUp (aqui sim)
    for (const char of savedLimited) {
        const bc = limitedCharacters.find(c => c.name === char.name);

        // tenta achar
        const existing = await prisma.bannerCharacter.findFirst({
            where: {
                bannerId: limitedBanner.id,
                characterId: char.id
            }
        });

        if (existing) {
            await prisma.bannerCharacter.update({
                where: { id: existing.id },
                data: { rateUp: bc.rateUp }
            });
        } else {
            await prisma.bannerCharacter.create({
                data: {
                    bannerId: limitedBanner.id,
                    characterId: char.id,
                    rateUp: bc.rateUp
                }
            });
        }
    }

    console.log('Banner Pikirito criado com personagens limitados.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
