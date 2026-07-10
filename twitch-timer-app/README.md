# ⏱️ Twitch Timer App (Versión Local / Escritorio)

Esta es una versión **standalone y empaquetada** de un contador de tiempo interactivo para directos de Twitch. Está diseñada para que streamers (o usuarios sin conocimientos técnicos) puedan ejecutar el servidor en su propio ordenador con un simple "doble clic" sin tener que instalar Node.js, dependencias ni realizar configuraciones en consola.

## ✨ Características Principales

*   **100% Portable:** El motor del servidor está incrustado en el archivo `.exe`.
*   **Conexión Dinámica (OAuth):** No es necesario configurar tokens ni nombres de usuario en el código. El streamer inicia sesión a través de una interfaz gráfica de navegador y la aplicación detecta su canal automáticamente de forma segura.
*   **Eventos de Twitch Integrados:** 
    *   Suma tiempo automáticamente por nuevos **Follows**.
    *   Suma tiempo automáticamente por **Suscripciones**.
    *   Suma tiempo automáticamente por **Cheers (Bits)** (escalable, por ejemplo 1 segundo por bit).
*   **Panel de Control en Vivo:** Interfaz para sumar o restar tiempo manualmente y configurar las reglas del temporizador (persistencia de datos incluida).
*   **Diseño Personalizable:** Los recursos gráficos (imágenes, GIF, audios) y el HTML se leen desde la carpeta externa `public`, permitiendo modificarlos en cualquier momento sin necesidad de recompilar la aplicación.
*   **Integración con OBS:** Listo para usarse como una "Fuente de Navegador" (Browser Source) con fondo transparente.

---

## 🚀 Guía de Instalación y Uso (Para el Streamer)

Para utilizar la aplicación en tu ordenador o enviársela a un amigo, **solo necesitas la carpeta `dist`**. Todo lo demás es código fuente para desarrollo.

### 1. Iniciar la Aplicación
1. Entra en la carpeta `dist`.
2. Haz doble clic en el archivo **`TwitchTimer.exe`**.
3. Se abrirá una ventana negra de consola que mantendrá el servidor en funcionamiento local, indicando `¡Servidor funcionando!`. ¡No cierres esta ventana mientras estés en directo!

### 2. Conectar y Configurar
1. Abre tu navegador web habitual y entra en: [http://localhost:3000](http://localhost:3000) (o haz clic en el botón superior del Panel si estás en él).
2. Verás una pantalla pidiendo **"Conectar con Twitch"**. Haz clic, autoriza la aplicación para que pueda leer las alertas de tu canal (suscripciones, follows) y serás redirigido al **Panel de Control**.
3. En el Panel, puedes establecer:
    *   **Tiempo inicial** del directo.
    *   **Segundos por Follow, Sub o Bit**.
    *   Usar botones rápidos para modificar el reloj en tiempo real.
    *   *Nota: La configuración se guardará automáticamente en un archivo `config.json` para tus futuros directos.*

### 3. Ponerlo en OBS
1. Abre OBS Studio (o Streamlabs).
2. Crea una nueva fuente de tipo **Navegador** (Browser Source).
3. En la URL pon: `http://localhost:3000/`
4. Ajusta el tamaño (ej: Ancho 800, Alto 600) y marca (si quieres) la casilla para que actualice la fuente al activarse.
5. El temporizador aparecerá en pantalla con el fondo transparente.

---

## 🎨 Personalización (¡Sin programar!)

Si quieres cambiar el diseño del timer, los sonidos o la animación:
1. Ve a la carpeta `dist/public/`.
2. Reemplaza el archivo `animacion.gif` por el tuyo propio (asegúrate de que se llame igual).
3. Reemplaza el archivo `alerta.mp3` por el sonido que prefieras.
4. Si sabes algo de CSS/HTML, puedes abrir `index.html` con un bloc de notas y editar los colores, fuentes y posición libremente.

---

## 🛠️ Notas para Desarrolladores

Si deseas realizar cambios estructurales profundos al código fuente de la App:

*   **Instalación:** `npm install`
*   **Compilación:** Para generar un nuevo `.exe` se utilizan `esbuild` y `pkg`.
    ```bash
    npx esbuild server.js --bundle --platform=node --outfile=dist/bundle.js
    npx pkg dist/bundle.js --targets node18-win-x64 --output dist/TwitchTimer.exe
    ```
*   **Librerías principales:** Express, Socket.IO, @twurple/api, @twurple/auth, @twurple/eventsub-ws. 
*   **OAuth:** Se utiliza Implicit Flow hacia `http://localhost:3000/auth/twitch/callback`, siendo el panel frontend quien extrae el token de la URL y se lo transfiere al servidor backend vía WebSockets.
