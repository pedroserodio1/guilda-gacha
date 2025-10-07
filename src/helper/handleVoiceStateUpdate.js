import { startVoiceTimer, stopVoiceTimer } from '../actions/voiceManager.js';

export async function handleVoiceStateUpdate(oldState, newState) {
    const member = newState.member;
    const userId = member.user.id; // Discord ID real
    const username = member.user.username;

    // entrou
    if (!oldState.channel && newState.channel) {
        console.log(`${member.user.tag} entrou em ${newState.channel.name}`);
        startVoiceTimer(userId, username, 30);
    }

    // saiu
    if (oldState.channel && !newState.channel) {
        console.log(`${member.user.tag} saiu de ${oldState.channel.name}`);
        stopVoiceTimer(userId, username);
    }
}