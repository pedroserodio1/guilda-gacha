import { prisma } from '../database/prismaClient.js';
import { getOrCreateUser } from '../actions/getOrCreateUser.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export async function handleInventoryCommand(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

    const inventory = await prisma.inventory.findMany({
        where: { userId: user.id },
        include: { character: true }
    });

    if (inventory.length === 0) return interaction.reply('Seu inventário está vazio!');

    // Agrupa por personagem
    const counts = {};
    inventory.forEach(i => {
        const key = i.character.id; // usar id para referência única
        counts[key] = counts[key] || { ...i.character, qty: 0 };
        counts[key].qty += 1;
    });

    const characters = Object.values(counts);
    let currentIndex = 0;

    const generateEmbed = (index) => {
        const c = characters[index];
        return new EmbedBuilder()
            .setTitle(`${c.name} (${c.rarity})`)
            .setDescription(`Quantidade: ${c.qty}`)
            .setImage(c.imageUrl)
            .setColor(c.rarity === 'SSR' ? 0xffd700 : c.rarity === 'SR' ? 0x00ff00 : 0x808080)
            .setFooter({ text: `Guilder ${index + 1} de ${characters.length}` });
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
        embeds: [generateEmbed(currentIndex)],
        components: [row],
        withResponse: true
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000 // 2 minutos para navegação
    });

    collector.on('collect', (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({ content: 'Esses botões são apenas para você!', ephemeral: true });
        }

        if (btnInteraction.customId === 'next') {
            currentIndex = (currentIndex + 1) % characters.length;
        } else if (btnInteraction.customId === 'prev') {
            currentIndex = (currentIndex - 1 + characters.length) % characters.length;
        }

        btnInteraction.update({
            embeds: [generateEmbed(currentIndex)],
            components: [row]
        });
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
    });
}
