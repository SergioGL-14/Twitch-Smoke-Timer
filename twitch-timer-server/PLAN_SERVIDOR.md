# Plan de Implementación: Twitch-Timer Server (SaaS Multiusuario)

Este documento detalla la arquitectura y los pasos técnicos necesarios para convertir la versión base en un servicio alojado en la nube (ej. Render.com), capaz de dar servicio a múltiples canales de Twitch simultáneamente sin requerir instalación por parte del usuario final.

## 1. Arquitectura General

- **Hosting:** Render.com (Servicio Web en capa gratuita).
- **Backend:** Node.js + Express + Socket.IO.
- **Frontend:** HTML/CSS/JS clásico servido por Express.
- **Autenticación:** OAuth 2.0 (Authorization Code Flow) de Twitch.
- **Base de Datos:** SQLite o JSON dinámico (para mantenerlo simple y persistente).

## 2. Flujo de Usuario (Streamer)

1. El usuario entra a `https://[nuestro-dominio]/`.
2. Pulsa "Iniciar Sesión con Twitch".
3. Twitch redirige a la aplicación con un código temporal.
4. El backend cambia el código por un `AccessToken` y un `RefreshToken` y los guarda en la base de datos vinculados al `userId` del streamer.
5. El streamer es redirigido a `https://[nuestro-dominio]/panel/:userId`.
6. Desde el panel, puede copiar el link de su overlay: `https://[nuestro-dominio]/overlay/:userId`.

## 3. Cambios en el Código

### `server.js`
- **Rutas Express:**
  - Añadir rutas para OAuth: `/auth/twitch` y `/auth/twitch/callback`.
  - Modificar `/panel` y `/` para que requieran sesión.
  - Modificar `/overlay` para aceptar un ID de usuario.
- **Socket.IO (Salas / Rooms):**
  - Implementar "Salas" (`socket.join(userId)`) para que los eventos de tiempo solo se envíen al panel y overlay del usuario correspondiente, evitando que un evento en el Canal A sume tiempo en el Canal B.

### `twitch.js`
- **Autenticación Dinámica:**
  - Cambiar `StaticAuthProvider` por `RefreshingAuthProvider`.
  - Implementar lógica para que cuando un usuario inicie sesión, se inicie un `EventSubWsListener` dinámico para su canal.
- **Persistencia de Tokens:**
  - Crear un pequeño módulo (ej. `db.js`) para guardar y leer los `refresh_tokens` al arrancar el servidor (para que si el servidor se reinicia, todos los streamers sigan conectados automáticamente).

### Frontend (`public/`)
- Añadir un `login.html` simple.
- Actualizar `panel.html` y `index.html` para que el cliente Socket.IO se una a su sala específica (`socket.emit('unirse', userId)`).

## 4. Retos y Consideraciones
- **Límites de Conexión:** EventSub Websockets soporta hasta 100 suscripciones simultáneas por conexión. Si la app escala a cientos de streamers, habrá que implementar Webhooks en lugar de WebSockets en el backend.
- **Modo Suspensión (Render):** Los servidores gratuitos entran en reposo tras 15 mins sin llamadas HTTP. Habrá que implementar un ping automático (`setInterval`) desde el panel hacia el backend para mantenerlo despierto durante los directos.
