# ⏱️ Twitch Timer SaaS (Multi-Tenant)

Bienvenido al motor en la nube de **Twitch Timer (El Reto del Pitillo)**. Esta versión ha sido completamente rediseñada para funcionar como un servicio **SaaS (Software as a Service) Privado**.

Esto significa que un único servidor puede alojar y gestionar los relojes de cientos de streamers, con un sistema férreo de seguridad basado en Whitelist y aprobación manual.

---

## 🚀 Características Principales

*   **Multi-Usuario Real:** Cada streamer tiene su propia sesión en memoria, aislada del resto.
*   **Archivos Personalizados por Streamer:** El sistema crea carpetas únicas en `/uploads/{TWITCH_ID}/` para que cada usuario pueda subir sus propias imágenes (GIF/JPG) y sonidos (MP3).
*   **Whitelist y Aprobación Manual:** Los nuevos registros entran en estado `pendiente` y no consumen recursos del reloj hasta que el administrador los aprueba.
*   **Panel de Administración Oculto:** Ruta configurable dinámicamente (`/adminconf` por defecto) protegida por contraseña para aprobar usuarios, ver estados, y cambiar credenciales maestras.
*   **Base de Datos Integrada:** Utiliza SQLite (`database.sqlite`) para persistir configuraciones de usuario (tiempos), estado de aprobación, nombres de Twitch reales y configuración del servidor.
*   **Integración Nativa Twitch:** Uso de `@twurple/eventsub-ws` para suscripciones ultrarrápidas a Bits, Subs y Follows a través de WebSockets de Twitch.

---

## 🛠️ Instalación y Pruebas (Local)

### 1. Prerrequisitos
- Node.js v18 o superior.
- Una aplicación registrada en [Twitch Developer Console](https://dev.twitch.tv/console).
  - La **OAuth Redirect URL** debe ser exactamente: `http://localhost:3000/auth/twitch/callback`

### 2. Pasos de Instalación
1. Clona el repositorio e instala las dependencias: `npm install`
2. Inicia el servidor Node: `node server.js`
3. Abre un navegador y visita **http://localhost:3000**
4. Haz clic en "Conectar con Twitch". Como el servidor tiene la lista blanca activada por defecto, verás un cartel de **Cuenta en Revisión**.
5. Abre otra pestaña y ve al panel de administrador: **http://localhost:3000/adminconf** (Usuario: `admin`, Pass: `1234`).
6. En la tabla de usuarios, pulsa **"✔️ Aprobar"** junto a tu nombre. Tu panel de control se desbloqueará mágicamente en la otra pestaña.

---

## 📂 Estructura del Proyecto

- `server.js`: El corazón de la aplicación. Maneja el servidor Express, las subidas de archivos, la BBDD SQLite, la API del admin y los Sockets.
- `twitch.js`: Gestiona las conexiones y escuchas a los eventos de Twitch a través de `@twurple`.
- `public/`: Archivos estáticos accesibles al mundo (`index.html`, `panel.html`, `overlay.html`).
- `private/`: Archivos protegidos (`admin.html`) que solo se envían si conoces la ruta secreta.
- `uploads/`: *(Se genera sola)*. Aquí se guardan los recursos subidos por los streamers.

---

## 📚 Índice de Documentación (Wiki)

El proyecto cuenta con una documentación exhaustiva dividida estratégicamente en los siguientes manuales:

1. 📖 **[Documentacion.md](Documentacion.md)**: La Biblia técnica del proyecto. Explica la arquitectura Multi-Tenant SaaS, la base de datos SQLite y cómo funciona la integración interna con Twitch.
2. ☁️ **[GCP_SERVER_GUIDE.md](GCP_SERVER_GUIDE.md)**: Guía de infraestructura para crear la máquina virtual 100% gratuita de por vida en Google Cloud.
3. 🐧 **[UBUNTU_SETUP_GUIDE.md](UBUNTU_SETUP_GUIDE.md)**: Guía de despliegue con comandos Linux para instalar Node.js, configurar PM2 (24/7), crear el proxy inverso Nginx y subir el código.
4. 🔒 **[DNS_HTTPS_GUIDE.md](DNS_HTTPS_GUIDE.md)**: Guía de seguridad para superar las estrictas restricciones de la API de Twitch obteniendo un dominio gratuito (DuckDNS) y un certificado HTTPS automático (Certbot).
5. 🚨 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**: Guía de resolución de problemas cubriendo facturación de GCP, caídas de Nginx (Error 502), errores de OAuth de Twitch y recuperación de contraseñas.
