# Twitch Timer SaaS (Multi-Tenant)

Este repositorio contiene el código fuente para desplegar un servicio SaaS (Software as a Service) privado que gestiona temporizadores interactivos para múltiples streamers de Twitch simultáneamente.

El sistema se basa en listas blancas (whitelist) y aprobación manual de usuarios.

## Características Principales

*   **Multi-Usuario Real:** Cada streamer dispone de su propia sesión en memoria, aislada mediante namespaces de socket.
*   **Archivos Personalizados por Streamer:** El sistema genera directorios únicos en `/uploads/{TWITCH_ID}/` para almacenar assets (GIF/JPG y MP3) individuales.
*   **Aprobación Manual:** Los nuevos registros se marcan como `pendiente` y no consumen recursos hasta ser aprobados.
*   **Panel de Administración Oculto:** Ruta de administración protegida por contraseña para gestionar usuarios y parámetros globales.
*   **Base de Datos Integrada:** Utilización de SQLite (`database.sqlite`) para persistir configuraciones, estados y variables del servidor.
*   **Integración EventSub:** Implementación de `@twurple/eventsub-ws` para recepcionar eventos de Twitch (Bits, Subs, Follows) vía WebSockets.

## Configuración de la API de Twitch (Requisito Previo)

Antes de inicializar el servidor, es imperativo registrar la aplicación para obtener credenciales de acceso.

1. Acceder a `dev.twitch.tv/console` y registrar una nueva aplicación.
2. Configurar la **OAuth Redirect URI**:
   - Entorno de desarrollo (Local): `http://localhost:3000/auth/twitch/callback`
   - Entorno de producción (SaaS): Obligatorio HTTPS (ej. `https://dominio.com/auth/twitch/callback`).
3. Generar el `Client ID` y `Client Secret`.
4. Insertar estas credenciales en el archivo `.env` del servidor.

El flujo de autenticación implementado utiliza OAuth2 para solicitar scopes (`bits:read`, `channel:read:subscriptions`) y generar tokens de acceso para instanciar la conexión EventSub.

## Instalación y Pruebas (Entorno Local)

1. Requisitos: Node.js v18+.
2. Clonar el repositorio e instalar dependencias: `npm install`.
3. Iniciar el demonio de Node: `node server.js`.
4. Acceder vía navegador a `http://localhost:3000`.
5. Ejecutar login con Twitch. Al estar la whitelist activada, el usuario quedará en estado de revisión.
6. Acceder al panel de administración en `http://localhost:3000/adminconf` (Credenciales por defecto: `admin` / `1234`).
7. Aprobar al usuario en la tabla de registros para habilitar su panel de control.

## Estructura del Proyecto

- `server.js`: Módulo principal. Instancia Express, rutas HTTP, BBDD SQLite, API administrativa y servidor Socket.io.
- `twitch.js`: Módulo de conexión. Gestiona EventSub y WebSockets de Twitch mediante `@twurple`.
- `public/`: Archivos estáticos accesibles públicamente (`index.html`, `panel.html`, `overlay.html`).
- `private/`: Directorio restringido que contiene `admin.html`.
- `uploads/`: Directorio dinámico autogenerado para assets estáticos de usuarios.

## Índice de Documentación de Despliegue

Para proceder con el despliegue del código en un servidor en producción, ejecutar la lectura de los siguientes manuales técnicos en orden secuencial:

1. **Documentacion.md**: Arquitectura interna Multi-Tenant, persistencia de datos (SQLite) y gestión de memoria (Map).
2. **GCP_SERVER_GUIDE.md**: Provisión de máquina virtual e2-micro en Google Cloud Platform.
3. **UBUNTU_SETUP_GUIDE.md**: Securización de SO, instalación de Node.js, dependencias base y Nginx.
4. **SERVER_GUIDE.md**: Clonación de repositorio, setup de variables de entorno y ejecución persistente mediante PM2.
5. **DNS_HTTPS_GUIDE.md**: Configuración de registros DNS y provisión de certificados TLS (Certbot) para habilitar HTTPS.
6. **TROUBLESHOOTING.md**: Comandos operativos de mantenimiento, revisión de logs de sistema y resolución de fallos.
