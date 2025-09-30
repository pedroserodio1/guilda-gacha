import { prisma } from '../database/prismaClient.js'

async function lerJsonDaUrl(url) {
    try {
        const resp = await fetch(url, { method: 'GET' });
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await resp.json();
            return data;
        } else {
            const text = await resp.text();
            return JSON.parse(text);
        }
    } catch (err) {
        console.error('Falha ao ler JSON:', err);
        throw err;
    }
}

export async function handleAddCharacters(interaction) {
    const arquivo = interaction.options.getAttachment('arquivo')
    const isLimitado = interaction.options.getString('limitados') === 'S' ? true : false

    console.log(isLimitado)

    if (!arquivo.contentType.includes('application/json')) {
        return interaction.reply('Apenas arquivos .json')
    }
    
    const personagens = await lerJsonDaUrl(arquivo.url)
    // console.log(personagens)

    if (!isLimitado) {

        const savedUnlimited = [];

        personagens.forEach(async c => {
            console.log(`Salvando: ${c.name}`)
            try {
                const saved = await prisma.character.upsert({
                    where: { name: c.name },
                    update: { imageUrl: c.imageUrl, limited: false },
                    create: c
                });
                savedUnlimited.push(saved);
            } catch (e) {
                return interaction.reply(`O personagem ${c.name} deu erro: ${e.message}`)
            }


        })

        return interaction.reply('✅ Todos os personagens ilimitados foram criados com sucesso, verifique com /personagens')
    }




}