import { addCoinsCall } from '../actions/addCoinsCall.js';

export async function handleVoiceStateUpdate(oldState, newState) {
    const member = newState.member;

    // entrou em call
    if (!oldState.channel && newState.channel) {
        console.log(`${member.user.tag} entrou no canal ${newState.channel.name}`);

        // chama função externa passando os dados do usuário
        addCoinsCall(member.id, member.user.id, member.user.username, 30);
    }
}