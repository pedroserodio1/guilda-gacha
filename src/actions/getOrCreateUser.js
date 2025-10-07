import { prisma } from '../database/prismaClient.js';

export async function getOrCreateUser(discordId, username) {
    const user = await prisma.user.upsert({
        where: { discordId },
        update: {username},
        create: { discordId, username }
    });
    return user;
}
