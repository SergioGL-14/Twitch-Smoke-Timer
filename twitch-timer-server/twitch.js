const { StaticAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');
const { EventSubWsListener } = require('@twurple/eventsub-ws');

const clientId = '1q4kk0nescqqe478we8c3wvphny1un';
const activeListeners = new Map();

async function iniciarTwitch(notificarEventoCallback, accessToken) {
    const authProvider = new StaticAuthProvider(clientId, accessToken);
    const apiClient = new ApiClient({ authProvider });

    let tokenInfo;
    try {
        tokenInfo = await apiClient.getTokenInfo();
    } catch (err) {
        console.error(`❌ Token inválido o expirado.`);
        return null;
    }
    
    const user = await apiClient.users.getUserById(tokenInfo.userId);
    if (!user) return null;

    const userId = user.id;

    // Evitar múltiples conexiones WebSocket si el usuario recarga el panel
    if (activeListeners.has(userId)) {
        return { id: userId, name: user.displayName };
    }

    console.log(`✅ [${userId}] Conectando a Twitch como: ${user.displayName}`);

    const listener = new EventSubWsListener({ apiClient });
    listener.start();
    activeListeners.set(userId, listener);

    listener.onChannelFollow(userId, userId, (event) => {
        notificarEventoCallback(userId, 'follow', 1, event.userName); 
    });

    listener.onChannelCheer(userId, (event) => {
        notificarEventoCallback(userId, 'bit', event.bits, event.userName); 
    });
    
    listener.onChannelSubscription(userId, (event) => {
        notificarEventoCallback(userId, 'sub', 1, event.userName); 
    });

    return { id: userId, name: user.displayName };
}

module.exports = { iniciarTwitch };