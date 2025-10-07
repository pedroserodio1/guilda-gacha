import { prisma } from '../database/prismaClient.js';
import { getOrCreateUser } from './getOrCreateUser.js';

export async function addCoinsCall(discordId, username, coins) {
    console.log(`[INICIO] addCoinsCall para ${username} (${discordId})`);

    // garante que o usuário existe
    const user = await getOrCreateUser(discordId, username);
    console.log(`[ACAO] Usuario garantido: ${user.username} (${user.id})`);

    // busca registro atualizado
    let registro = await prisma.userAction.findUnique({ where: { userId: user.id } });
    console.log(`Registro atual: ${registro ? JSON.stringify(registro) : 'nenhum registro encontrado'}`);

    // função pra comparar datas no horário local do Brasil
    const isSameLocalDay = (date1, date2) => {
        const d1 = new Date(date1).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const d2 = new Date(date2).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        return d1 === d2;
    };

    // se houver registro, checa se é do mesmo dia (em horário local)
    if (registro && registro.lastAction) {
        const ultimaAcao = new Date(registro.lastAction);
        const agora = new Date();

        if (!isSameLocalDay(ultimaAcao, agora)) {
            // reseta o count se for de outro dia
            registro = await prisma.userAction.update({
                where: { userId: user.id },
                data: { count: 0, lastAction: new Date() },
            });
            console.log(`[RESET] Contador resetado (última ação era de outro dia local).`);
        }
    }

    // checa limite diário ANTES de adicionar coins
    if (registro && registro.count >= 3) {
        console.log(`[LIMITE] ${username} (${discordId}) JÁ atingiu limite diário de 3 execuções`);
        return false; // não pode mais agendar
    }

    // dá os coins
    await prisma.user.update({
        where: { discordId },
        data: { coins: { increment: coins } },
    });
    console.log(`[UPDATE] Adicionados ${coins} coins para ${username} (${discordId})`);

    // atualiza ou cria registro
    if (registro) {
        registro = await prisma.userAction.update({
            where: { userId: user.id },
            data: { 
                count: { increment: 1 },
                lastAction: new Date() 
            },
        });
        console.log(`[UPDATE] Registro do usuário atualizado: count=${registro.count}`);
    } else {
        registro = await prisma.userAction.create({
            data: {
                userId: user.id,
                count: 1,
                lastAction: new Date(),
            },
        });
        console.log(`[CREATE] Novo registro de ação criado para ${username} - count=1`);
    }

    // retorna TRUE se ainda pode agendar novamente (count < 3)
    const podeAgendar = registro.count < 3;
    console.log(`[RETORNO] Count atual: ${registro.count}/3 - Pode agendar novamente? ${podeAgendar}`);
    
    return podeAgendar;
}