import { prisma } from '../database/prismaClient.js'; // seu prisma client
import { getOrCreateUser } from './getOrCreateUser.js';

export async function addCoinsCall(userId, discordId, username, coins) {
    const TEMPO_EXECUCAO_MS = 15 * 1000; // 15s para teste
    // const TEMPO_EXECUCAO_MS = 15 * 60 * 1000; // 15 min no real

    console.log(`[INICIO] addCoinsCall para ${username} (${discordId})`);
    
    // agenda a execução após o tempo
    setTimeout(async () => {
        // garante que o usuário existe
        const user = await getOrCreateUser(discordId, username);
        console.log(`[ACAO] Usuario garantido: ${user.username} (${user.id})`);

        // busca registro atualizado
        let registro = await prisma.userAction.findUnique({ where: { userId: user.id } });
        console.log(`Registro atual: ${registro ? JSON.stringify(registro) : 'nenhum registro encontrado'}`);

        // checa limite diário
        if (registro && registro.count >= 3) {
            console.log(`[LIMITE] ${username} (${userId}) atingiu limite diário`);
            return;
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
                data: { count: registro.count + 1, lastAction: new Date() },
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
            console.log(`[CREATE] Novo registro de ação criado para ${username} (${userId})`);
        }

        // agenda próxima execução se ainda não atingiu 3x
        if (registro.count < 3) {
            console.log(`[TIMER] Próxima execução em ${TEMPO_EXECUCAO_MS / 1000}s`);
            addCoinsCall(userId, discordId, username, coins);
        } else {
            console.log(`[FINAL] ${username} atingiu 3 execuções, não será agendado mais`);
        }
    }, TEMPO_EXECUCAO_MS);

    console.log(`[AGENDADO] Primeira execução para ${username} em ${TEMPO_EXECUCAO_MS / 1000}s`);
}

