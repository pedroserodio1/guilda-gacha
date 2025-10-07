import { addCoinsCall } from './addCoinsCall.js';

const activeTimers = new Map(); // key = discordId, value = timeoutId

// tempo de teste (15s)
//const TEMPO_EXECUCAO_MS = 15 * 1000;
//tempo real (15 min) ->
const TEMPO_EXECUCAO_MS = 15 * 60 * 1000;

export function startVoiceTimer(discordId, username, coins) {
  console.log(`[DEBUG] startVoiceTimer recebeu: discordId=${discordId}, username=${username}, coins=${coins}`);
  
  // se já tiver timer ativo, ignora
  if (activeTimers.has(discordId)) {
    console.log(`[IGNORADO] ${username} já tem timer ativo`);
    return;
  }

  console.log(`[TIMER] Iniciando timer de ${TEMPO_EXECUCAO_MS / 1000}s para ${username}. Timer vai disparar APENAS após esse tempo.`);

  // função que será executada APÓS o tempo
  const executar = async () => {
    console.log(`[EXECUTAR] ${TEMPO_EXECUCAO_MS / 1000}s passaram! Executando addCoinsCall para ${username}`);

    // chama addCoins e verifica se pode continuar
    const podeAgendar = await addCoinsCall(discordId, username, coins);

    if (podeAgendar) {
      console.log(`[RENOVADO] ${username} ainda pode receber coins. Reagendando em ${TEMPO_EXECUCAO_MS / 1000}s`);
      // agenda o próximo ciclo
      const novoTimeout = setTimeout(executar, TEMPO_EXECUCAO_MS);
      activeTimers.set(discordId, novoTimeout);
    } else {
      // remove da lista de timers ativos
      activeTimers.delete(discordId);
      console.log(`[FINALIZADO] ${username} atingiu o limite de 3 execuções hoje`);
    }
  };

  // agenda a PRIMEIRA execução para daqui a 15 segundos
  const timeoutId = setTimeout(executar, TEMPO_EXECUCAO_MS);
  activeTimers.set(discordId, timeoutId);
}

export function stopVoiceTimer(discordId, username) {
  const timeoutId = activeTimers.get(discordId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    activeTimers.delete(discordId);
    console.log(`[CANCELADO] Timer cancelado para ${username} - não receberá coins deste período`);
  } else {
    console.log(`[INFO] Nenhum timer ativo para ${username}`);
  }
}