import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const defaultCommands = [
    new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rola um personagem do banner')
        .addStringOption(option =>
            option
                .setName('banner')
                .setDescription('Escolha o banner. Se não escolher, será usado o banner padrão.')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Mostra seu inventário de personagens'),
    new SlashCommandBuilder()
        .setName('banners')
        .setDescription('Todos os banners ativos')
].map(cmd => cmd.toJSON());

// Comando exclusivo do servidor admin
const adminCommands = [
    new SlashCommandBuilder()
        .setName('adicionar-personagem')
        .setDescription('Adicionar um personagem ao inventário de um usuário')
        .addAttachmentOption(
            option => option.setName('arquivo')
                .setDescription('Arquivos de personagens para adicionar no gacha')
                .setRequired(true)
        )
        .addStringOption(
            option => option.setName('limitados')
                .setDescription('Selecione se vão ser personagens limitados?')
                .setRequired(true)
                .addChoices({ name: 'Sim', value: 'S' }, { name: 'Não', value: 'N' })
        )
        .addStringOption(
            option => option.setName('bannerid')
                .setDescription('Caso forem personagens ilimitados, coloque o id do banner aqui')
        ),
    new SlashCommandBuilder()
        .setName('grant-coins')
        .setDescription('Adicionar moedas a um usuário (somente admin)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Usuário que vai receber moedas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Quantidade de moedas a adicionar')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    // Registrar comandos "normais" no servidor principal
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: defaultCommands }
    );
    console.log('✅ Comandos padrão registrados!');

    // Registrar comandos exclusivos no servidor admin
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.ADMIN_SERVER_ID),
        { body: adminCommands }
    );
    console.log('✅ Comandos admin registrados!');
} catch (err) {
    console.error(err);
}
