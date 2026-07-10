const { StaticAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');
const { EventSubWsListener } = require('@twurple/eventsub-ws');

const clientId = '1q4kk0nescqqe478we8c3wvphny1un';

async function iniciarTwitch(notificarEventoCallback, accessToken) {
    console.log('Iniciando conexión con Twitch...');

    const authProvider = new StaticAuthProvider(clientId, accessToken);
    const apiClient = new ApiClient({ authProvider });

    let tokenInfo;
    try {
        tokenInfo = await apiClient.getTokenInfo();
    } catch (err) {
        console.error(`❌ Token inválido o expirado. Vuelve a iniciar sesión.`);
        return;
    }
    const user = await apiClient.users.getUserById(tokenInfo.userId);
    if (!user) {
        console.error(`❌ No se pudo obtener la información del usuario logueado.`);
        return;
    }
    console.log(`✅ Conectado a Twitch como: ${user.displayName}`);

    const listener = new EventSubWsListener({ apiClient });
    listener.start();
    console.log('🎧 Escuchando eventos (Reglas dinámicas activadas)...');

    // Avisamos al servidor del tipo de evento en lugar de los segundos fijos
    listener.onChannelFollow(user.id, user.id, (event) => {
        console.log(`👤 Follow de ${event.userName}!`);
        notificarEventoCallback('follow', 1, event.userName); 
    });

    listener.onChannelCheer(user.id, (event) => {
        console.log(`💎 ${event.userName} donó ${event.bits} bits!`);
        notificarEventoCallback('bit', event.bits, event.userName); 
    });
    
    listener.onChannelSubscription(user.id, (event) => {
        console.log(`⭐ Suscripción de ${event.userName}!`);
        notificarEventoCallback('sub', 1, event.userName); 
    });
}

module.exports = { iniciarTwitch };