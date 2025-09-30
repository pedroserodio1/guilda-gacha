import { prisma } from '../database/prismaClient.js';
import { getOrCreateUser } from '../helper/getOrCreateUser.js';
import { EmbedBuilder, MessageFlags, InteractionResponseType } from 'discord.js';

export async function handleGrantCoinsCommand(interaction) {
    console.log(`[GRANT] Comando iniciado por ${interaction.user.tag}`);

    // 🔹 Checa se é você
    if (interaction.user.id !== process.env.MY_DISCORD_ID) {
        console.log(`[GRANT] Usuário ${interaction.user.tag} tentou usar sem permissão`);
        const message = '❌ Você não tem permissão para usar este comando.';
        return interaction.reply({
            content: message,
            flags: MessageFlags.Ephemeral
        });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');


    console.log(targetUser)

    console.log(`[GRANT] Usuário alvo: ${targetUser.tag}, Quantidade: ${amount}`);

    if (amount <= 0) {
        console.log('[GRANT] Quantidade inválida');
        return interaction.reply({ content: '❌ A quantidade deve ser maior que zero.', ephemeral: true });
    }

    // 🔹 Atualiza ou cria usuário
    const user = await prisma.user.upsert({
        where: { discordId: targetUser.id },
        update: { coins: { increment: amount }, username: targetUser.username },
        create: { discordId: targetUser.id, coins: amount, username: targetUser.username }
    });

    console.log(`[GRANT] Moedas adicionadas com sucesso. Novo saldo: ${user.coins}`);

    // 🔹 Cria embed de resposta
    const embed = new EmbedBuilder()
        .setTitle('✅ Moedas concedidas!')
        .setDescription(`Usuário: **${targetUser.tag}**\nQuantidade: **${amount}**\nNovo saldo: **${user.coins}**`)
        .setColor(0x00ff00)
        .setTimestamp();

    return interaction.reply({
        embeds: [embed]
    });
}
