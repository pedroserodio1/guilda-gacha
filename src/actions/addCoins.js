import { prisma } from '../database/prismaClient.js'
import { getOrCreateUser } from './getOrCreateUser.js'

export async function addCoins(discordId, username, coins, message) {
    const user = await getOrCreateUser(discordId, username)

    if (!user) {
        message.reply('Paizao, algo deu errado, mas não consegui criar ou achar você no banco, comunique o serodinho ai')
    }

    await prisma.user.update({
        where: {
            discordId
        },
        data: {
            coins: { increment: coins }
        }
    })


    message.react('💎')



}