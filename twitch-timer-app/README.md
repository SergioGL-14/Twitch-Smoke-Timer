# Twitch Timer App (Versión Local)

Esta es una versión standalone empaquetada de un contador de tiempo interactivo para Twitch. Está diseñada para ejecución local sin requerir instalación previa de Node.js ni configuración mediante consola.

## Características Principales

- **Ejecución Portable:** El servidor web y la lógica de backend están incrustados en un ejecutable binario (`.exe`).
- **Conexión OAuth2:** Autenticación dinámica sin necesidad de insertar tokens estáticos en el código fuente. El cliente inicia sesión mediante la interfaz web y el sistema hereda los permisos de acceso.
- **EventSub Integrado:** 
  - Adición de tiempo por **Follows**.
  - Adición de tiempo por **Suscripciones**.
  - Adición de tiempo por **Cheers (Bits)**.
- **Panel de Control:** Interfaz web local para modificar variables del temporizador en tiempo real y establecer la configuración base (con persistencia en JSON local).
- **Assets Dinámicos:** Los recursos gráficos y de audio se cargan desde el directorio externo `public`, posibilitando la modificación de los mismos sin recompilar el binario.
- **Transparencia OBS:** El endpoint raíz está formateado para actuar como Browser Source en OBS Studio con fondo transparente.

## Despliegue Local

Para ejecutar el programa en un entorno de producción local, únicamente es necesario el contenido del directorio `dist`.

1. Acceder al directorio `dist`.
2. Ejecutar el binario `TwitchTimer.exe`.
3. El proceso levantará el servidor HTTP local. La ventana de comandos debe permanecer activa durante la ejecución.

## Configuración y Enlace

1. Acceder a `http://localhost:3000` vía navegador web.
2. Ejecutar el flujo de autorización OAuth2 haciendo clic en el enlace provisto.
3. Tras la autorización, el sistema redirigirá al Panel de Control.
4. En el Panel de Control se definen las siguientes variables operativas:
   - Tiempo de inicio.
   - Incremento en segundos por evento (Follow, Sub, Bit).
   - Configuración almacenada persistentemente en `config.json`.

## Integración en Software de Transmisión (OBS)

1. Crear una nueva fuente de tipo **Browser Source**.
2. Establecer URL a `http://localhost:3000/`.
3. Dimensionar resolución estándar (ej. 800x600) y habilitar la actualización de la fuente al activarse la escena.

## Gestión de Assets Locales

Las modificaciones visuales y auditivas se realizan reemplazando los archivos en `dist/public/`:
1. `animacion.gif`: Reemplazo directo manteniendo nombre de archivo.
2. `alerta.mp3`: Reemplazo directo manteniendo nombre de archivo.
3. `index.html`: Modificable mediante editor de texto para alteraciones estructurales o CSS.

## Compilación (Desarrollo)

Para modificaciones sobre el código fuente de la aplicación, el proceso de compilación requiere:

1. Instalación de dependencias: `npm install`
2. Generación del binario mediante `esbuild` y `pkg`:
   ```bash
   npx esbuild server.js --bundle --platform=node --outfile=dist/bundle.js
   npx pkg dist/bundle.js --targets node18-win-x64 --output dist/TwitchTimer.exe
   ```
