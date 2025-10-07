import { startVoiceTimer, stopVoiceTimer } from '../actions/voiceManager.js';

export async function handleVoiceStateUpdate(oldState, newState) {
    const member = newState.member;
    const userId = member.user.id; // Discord ID real
    const username = member.user.username;

    // entrou ou desmutou
    if ((!oldState.channel && newState.channel) || !newState.selfDeaf) {
        startVoiceTimer(userId, username, 30);
    }

    // saiu ou se mutou
    if ((oldState.channel && !newState.channel) || newState.selfDeaf) {
        stopVoiceTimer(userId, username);
    }


}