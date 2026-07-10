# Twitch Timer SaaS - Documentación Técnica

Esta es la documentación arquitectónica del proyecto **Twitch Timer** en su versión **Multi-Tenant SaaS**.

---

## 1. Arquitectura General (Multi-Tenant)

El sistema ha sido diseñado para alojar múltiples streamers simultáneamente en una única instancia, aislándolos por completo para que no compartan estado ni archivos.

*   **Motor (Node.js + Express):** Sirve los archivos estáticos y la API de administración.
*   **Tiempo Real (Socket.io):** Maneja la comunicación instantánea usando "Rooms" separadas por identificador de usuario.
*   **Gestión de Estado (`activeTimers` Map):** El reloj de cada streamer se ejecuta de forma independiente en la memoria del servidor mediante un mapa de objetos, optimizando el consumo de recursos.
*   **Conexión Twitch (`twurple`):** Se ha fijado la versión de la librería `@twurple` a la `6.2.1` para garantizar la compatibilidad con CommonJS.

---

## 2. Flujo de Datos y Conexiones (Sockets)

Cuando un usuario interactúa con la aplicación, el flujo es el siguiente:

1.  **Frontend (OBS o Panel):** El cliente se conecta a Socket.io y envía su `userId` o su Token de Twitch.
2.  **Rooms de Socket.io:** El servidor asigna a ese cliente a una sala privada (`obs_{userId}` o `panel_{userId}`).
3.  **Aislamiento:** Cualquier evento de Twitch que ocurra se emite únicamente a las salas de ese usuario concreto.

---

## 3. Base de Datos Integrada (SQLite)

Para la persistencia de configuraciones y usuarios, se utiliza **SQLite** (`database.sqlite`). 

### Tablas Principales:
*   **`usuarios`**: 
    *   `userId` (TEXT PRIMARY KEY): ID único de Twitch.
    *   `twitchName` (TEXT): Nombre en Twitch.
    *   `estado` (TEXT): `pendiente` o `aprobado` (para el sistema de Whitelist).
    *   `reglas` (TEXT): Objeto JSON con los tiempos configurados por el usuario.
*   **`config`**: Almacena variables globales del servidor (credenciales administrativas, estado del modo manual, etc.).

---

## 4. Seguridad y Administración Privada

El sistema cuenta con un sistema de **Whitelist (Aprobación Manual)** para despliegues públicos.

*   **Registro Seguro:** Cuando un usuario conecta su cuenta de Twitch, su estado en la base de datos se registra como `pendiente`. Su temporizador no iniciará hasta ser aprobado.
*   **Panel Administrativo:** El administrador del servidor tiene acceso a una URL configurable (por defecto `/adminconf`) protegida por credenciales básicas.
*   **Aprobación:** Desde el panel, el administrador aprueba las solicitudes. El sistema notifica al panel del usuario en tiempo real y el servidor inicializa el temporizador en memoria.

---

## 5. Personalización y Assets por Usuario

El sistema ofrece control a cada usuario sobre su propia instancia del temporizador:

*   **Toggles de Efectos:** Desde su panel de control, cada usuario puede activar o desactivar de forma independiente la aparición de imágenes (GIFs), las animaciones del reloj (CSS) y las alertas de sonido (MP3). Estas preferencias se guardan en la base de datos.
*   **Gestión de Archivos (`fs`):** El servidor crea dinámicamente una carpeta en `/uploads/{userId}/` cuando un usuario sube archivos de recursos personalizados.
*   **Comprobación Estática:** Al cargar el cliente de OBS, el servidor verifica la existencia de archivos personalizados. Si existen, provee la ruta a dichos archivos; en caso contrario, provee los recursos genéricos por defecto (`/public`).

---

## 6. Despliegue en Producción

El proyecto está preparado para ser desplegado en entornos Linux (VPS). Se recomienda revisar las siguientes guías (incluidas en el repositorio) para un despliegue seguro:

1.  **`GCP_SERVER_GUIDE.md`**: Guía de infraestructura (aplicable a Google Cloud e2-micro).
2.  **`UBUNTU_SETUP_GUIDE.md`**: Instalación de dependencias (Node.js, PM2, Nginx).
3.  **`DNS_HTTPS_GUIDE.md`**: Configuración de Dominio y Certificados SSL (Requerido por la API de Twitch).