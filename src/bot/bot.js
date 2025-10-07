import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { handleRollCommand } from '../commands/roll.js';
import { handleInventoryCommand } from '../commands/inventory.js';
import { handleActiveBannersCommand } from '../commands/banners.js';
import { prisma } from '../database/prismaClient.js';
import { handleGrantCoinsCommand } from '../commands/grantCoins.js';
import { handleAddCharacters } from '../commands/addCharacters.js';
import { addCoins } from '../actions/addCoins.js';
import { addCoinsCall } from '../actions/addCoinsCall.js';

const cooldowns = {};
const callTime = {}

const client = new Client({
    intents:
        [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages]
});

client.once('clientReady', () => {
    console.log(`Bot online como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    const userId = message.author.id;

    if (cooldowns[userId]) return

    cooldowns[userId] = true;

    addCoins(message.author.id, message.author.username, 1, message)


    setTimeout(() => {
        delete cooldowns[userId];
        console.log('o user foi apagado')
    }, 30 * 1000);

})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'roll') {
        await handleRollCommand(interaction);
    } else if (interaction.commandName === 'inventory') {
        await handleInventoryCommand(interaction);
    } else if (interaction.commandName === 'banners') {
        await handleActiveBannersCommand(interaction)
    } else if (interaction.commandName === 'grant-coins') {
        await handleGrantCoinsCommand(interaction)
    } else if (interaction.commandName === 'adicionar-personagem') {
        await handleAddCharacters(interaction)
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const member = newState.member; // Usuário que mudou de estado

    // Entrou em um canal de voz
    if (!oldState.channel && newState.channel) {
        addCoinsCall(member.id, member.user.id, member.user.username, 30);
    }

    // Saiu do canal de voz
    if (oldState.channel && !newState.channel) {
        console.log(`${member.user.tag} [${member.id}] saiu do canal de voz: ${oldState.channel.name}`);
    }

    // Mudou de canal de voz
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        console.log(`${member.user.tag} [${member.id}] mudou do canal ${oldState.channel.name} para ${newState.channel.name}`);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // Checa se é um botão de banner
    if (interaction.customId.startsWith('banner_')) {
        const bannerId = interaction.customId.replace('banner_', '');

        // Aqui você pode buscar o banner no DB e mostrar detalhes ou personagens
        const banner = await prisma.banner.findUnique({
            where: { id: bannerId },
            include: {
                characters: {
                    include: { character: true }
                }
            }
        });

        if (!banner) {
            return interaction.reply({ content: '❌ Banner não encontrado.', ephemeral: true });
        }

        // Exemplo: mostrar personagens do banner
        const chars = banner.characters.map(bc => bc.character.name).join(', ') || 'Nenhum personagem';
        await interaction.reply({ content: `🎯 Personagens do banner **${banner.name}**: ${chars}`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
