import { prisma } from '../database/prismaClient.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export async function handleActiveBannersCommand(interaction) {
    // Pega banners ativos
    const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { endDate: 'asc' } // opcional
    });

    if (!banners.length) return interaction.reply('Não há banners ativos no momento.');

    let currentBannerIndex = 0;

    const getBannerEmbed = (banner) => {
        return new EmbedBuilder()
            .setTitle(banner.name)
            .setDescription(`Termina em: ${new Date(banner.endDate).toLocaleString('pt-BR')}`)
            .setImage(banner.imageUrl || null)
            .setColor(0x00ffff)
            .setTimestamp();
    };

    const getBannerButtons = () => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prevBanner')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('nextBanner')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('viewCharacters')
                .setLabel('Ver Personagens')
                .setStyle(ButtonStyle.Success)
        );
    };

    // Envia embed inicial
    await interaction.reply({
        embeds: [getBannerEmbed(banners[currentBannerIndex])],
        components: [getBannerButtons()],
        withResponse: true // ✅ substitui fetchReply
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 120000 }); // 2 min

    let inCharacterView = false;
    let characterIndex = 0;
    let characters = [];

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) return btnInteraction.reply({ content: 'Apenas você pode usar esses botões.', ephemeral: true });

        if (!inCharacterView) {
            switch (btnInteraction.customId) {
                case 'prevBanner':
                    currentBannerIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
                    await btnInteraction.update({ embeds: [getBannerEmbed(banners[currentBannerIndex])] });
                    break;
                case 'nextBanner':
                    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
                    await btnInteraction.update({ embeds: [getBannerEmbed(banners[currentBannerIndex])] });
                    break;
                case 'viewCharacters':
                    // Carrega personagens do banner
                    characters = await prisma.bannerCharacter.findMany({
                        where: { bannerId: banners[currentBannerIndex].id },
                        include: { character: true }
                    });
                    if (!characters.length) return btnInteraction.reply({ content: 'Nenhum personagem nesse banner.', ephemeral: true });

                    inCharacterView = true;
                    characterIndex = 0;

                    const charEmbed = new EmbedBuilder()
                        .setTitle(characters[characterIndex].character.name)
                        .setDescription(`Raridade: ${characters[characterIndex].character.rarity}\nRate Up: ${characters[characterIndex].rateUp ? 'Sim' : 'Não'}`)
                        .setImage(characters[characterIndex].character.imageUrl)
                        .setColor(0xffd700)
                        .setTimestamp();

                    const charButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('prevChar')
                            .setLabel('◀️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('nextChar')
                            .setLabel('▶️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('backBanners')
                            .setLabel('Voltar aos Banners')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await btnInteraction.update({ embeds: [charEmbed], components: [charButtons] });
                    break;
            }
        } else {
            // Carrossel de personagens
            switch (btnInteraction.customId) {
                case 'prevChar':
                    characterIndex = (characterIndex - 1 + characters.length) % characters.length;
                    break;
                case 'nextChar':
                    characterIndex = (characterIndex + 1) % characters.length;
                    break;
                case 'backBanners':
                    inCharacterView = false;
                    await btnInteraction.update({ embeds: [getBannerEmbed(banners[currentBannerIndex])], components: [getBannerButtons()] });
                    return;
            }

            const charEmbed = new EmbedBuilder()
                .setTitle(characters[characterIndex].character.name)
                .setDescription(`Raridade: ${characters[characterIndex].character.rarity}\nRate Up: ${characters[characterIndex].rateUp ? 'Sim' : 'Não'}`)
                .setImage(characters[characterIndex].character.imageUrl)
                .setColor(0xffd700)
                .setTimestamp();

            await btnInteraction.update({ embeds: [charEmbed] });
        }
    });

    collector.on('end', async () => {
        try {
            await message.edit({ components: [] }); // remove botões
        } catch { }
    });
}
