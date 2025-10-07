import { prisma } from '../database/prismaClient.js';
import { getOrCreateUser } from '../actions/getOrCreateUser.js';
import { EmbedBuilder } from 'discord.js';
import moment from 'moment-timezone';
import 'moment/locale/pt-br.js';

function weightedRandom(characters) {
    console.log(`[ROLL][weightedRandom] Pool recebido: ${characters.map(c => c.name).join(', ')}`);
    const totalWeight = characters.reduce((sum, c) => sum + (c.rateUp ? 70 : 30), 0);
    console.log(`[ROLL][weightedRandom] Peso total calculado: ${totalWeight}`);

    let roll = Math.random() * totalWeight;
    console.log(`[ROLL][weightedRandom] Valor de roll gerado: ${roll.toFixed(2)}`);

    for (const c of characters) {
        roll -= c.rateUp ? 70 : 30;
        if (roll <= 0) {
            console.log(`[ROLL][weightedRandom] Personagem selecionado: ${c.name} (rateUp: ${c.rateUp})`);
            return c;
        }
    }

    console.log(`[ROLL][weightedRandom] Fallback acionado. Retornando primeiro personagem: ${characters[0].name}`);
    return characters[0]; // fallback
}

function getRarity() {
    const rand = Math.random();
    console.log(`[ROLL][getRarity] Número aleatório gerado: ${rand.toFixed(4)}`);

    if (rand < 0.02) {
        console.log('[ROLL][getRarity] Raridade selecionada: SSR');
        return 'SSR';
    }
    if (rand < 0.15) {
        console.log('[ROLL][getRarity] Raridade selecionada: SR');
        return 'SR';
    }

    console.log('[ROLL][getRarity] Raridade selecionada: R');
    return 'R';
}

const rarityData = {
    SSR: { color: 0xffd700, title: '✨ UAU! SSR!', description: 'TAPORRA TIROU UM GUILDER DOS FODAS EIM' },
    SR: { color: 0x00ff00, title: '🎉 SR!', description: 'Cacete, tirou um caba piquinha eim' },
    R: { color: 0x808080, title: '🙂 R', description: 'Você tirou um Guilder comunzaço' }
};

export async function handleRollCommand(interaction) {
    console.log('\n================ [ROLL] =================');
    console.log(`[ROLL] Comando iniciado por: ${interaction.user.tag} (ID: ${interaction.user.id})`);

    const bannerName = interaction.options.getString('banner') || 'padrão';
    console.log(`[ROLL] Banner selecionado: "${bannerName}"`);

    const user = await getOrCreateUser(interaction.user.id,  interaction.user.username);
    console.log(`[ROLL] Usuário encontrado: ${user.discordId}, Moedas: ${user.coins}`);

    if (user.coins < 120) {
        console.log(`[ROLL] Moedas insuficientes para ${user.discordId} (${user.coins} moedas)`);
        return interaction.reply('Você não tem moedas suficientes para rolar! (Custa 120 moedas)');
    }

    let charactersPool = [];

    if (bannerName === 'padrão') {
        charactersPool = await prisma.character.findMany({ where: { limited: false } });
        charactersPool = charactersPool.map(c => ({ ...c, rateUp: false }));
        console.log(`[ROLL] Pool padrão carregado: ${charactersPool.length} personagens`);
        console.log(`[ROLL] IDs carregados: ${charactersPool.map(c => c.id).join(', ')}`);
    } else {
        const banner = await prisma.banner.findFirst({
            where: { name: bannerName.toLowerCase() },
            include: { characters: { include: { character: true } } }
        });

        if (!banner) {
            console.log(`[ROLL] Banner não encontrado: ${bannerName}`);
            return interaction.reply(`❌ Banner **${bannerName}** não existe.`);
        }

        console.log(`[ROLL] Banner encontrado: ${banner.name} (ID: ${banner.id})`);

        const endDate = moment.tz(banner.endDate, 'America/Sao_Paulo');
        const now = moment.tz('America/Sao_Paulo');

        const endDateFormat = endDate.format('DD/MM/YYYY HH:mm');
        const nowFormat = now.format('DD/MM/YYYY HH:mm');

        console.log(`[ROLL] Data de término do banner: ${endDateFormat}`);
        console.log(`[ROLL] Data/hora atual: ${nowFormat}`);

        if (!banner.isActive || now.isAfter(endDate)) {
            return interaction.reply(`❌ O Banner **${bannerName}** não está mais disponível, acabou dia **${endDateFormat}**.`);
        }

        const limitedChars = (banner.characters || []).map(bc => ({
            ...bc.character,
            rateUp: bc.rateUp
        }));
        console.log(`[ROLL] Personagens limitados do banner: ${limitedChars.length}`);

        const unlimitedChars = await prisma.character.findMany({ where: { limited: false } });
        const unlimitedMapped = unlimitedChars.map(c => ({ ...c, rateUp: false }));
        console.log(`[ROLL] Personagens ilimitados adicionados: ${unlimitedMapped.length}`);

        charactersPool = [...limitedChars, ...unlimitedMapped];
        console.log(`[ROLL] Pool final carregado: ${charactersPool.length} personagens`);
    }

    const rarity = getRarity();
    const rarityPool = charactersPool.filter(c => c.rarity === rarity);
    console.log(`[ROLL] Pool filtrado por raridade (${rarity}): ${rarityPool.length} personagens`);

    if (rarityPool.length === 0) {
        console.log(`[ROLL] Nenhum personagem ${rarity} no banner ${bannerName}`);
        return interaction.reply(`❌ Não há personagens **${rarity}** nesse banner.`);
    }

    const chosen = weightedRandom(rarityPool);

    await prisma.inventory.create({ data: { userId: user.id, characterId: chosen.id } });
    console.log(`[ROLL] Personagem adicionado ao inventário: ${chosen.name} (ID: ${chosen.id})`);

    await prisma.user.update({ where: { id: user.id }, data: { coins: { decrement: 120 } } });
    console.log(`[ROLL] Moedas deduzidas. Novo saldo: ${user.coins - 120}`);

    const embed = new EmbedBuilder()
        .setTitle(rarityData[rarity].title)
        .setDescription(`${rarityData[rarity].description}\n\n**Personagem rolado:** ${chosen.name} (${chosen.rarity})`)
        .setImage(chosen.imageUrl)
        .setColor(rarityData[rarity].color)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    console.log('================ [ROLL] Finalizado =================\n');
}
