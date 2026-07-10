# Guía de Usuario: Timer Interactivo para Twitch

Esta guía detalla los pasos para iniciar, configurar e integrar el contador interactivo de Twitch en OBS Studio.

## 1. Iniciar la aplicación

1. Accede a la carpeta donde se han descomprimido los archivos de la aplicación.
2. Ejecuta el archivo `TwitchTimer.exe`.
3. Se abrirá una ventana de comandos del sistema. Cuando muestre el mensaje `¡Servidor funcionando! Abre http://localhost:3000`, la aplicación estará lista.
4. Mantén esta ventana abierta durante todo el tiempo que vayas a utilizar el contador en tu directo. Puedes minimizarla.

## 2. Conectar la cuenta de Twitch

Para que el sistema pueda leer las alertas del canal (follows, suscripciones, donaciones de bits), es necesario vincularlo a tu cuenta.

1. Abre tu navegador web y dirígete a: `http://localhost:3000`
2. En la pantalla inicial, haz clic en **Conectar con Twitch**.
3. Si el navegador lo requiere, introduce tus credenciales de Twitch.
4. Aparecerá una pantalla de autorización solicitando permiso para leer información del canal. Selecciona **Autorizar**.
5. Una vez autorizado, el navegador te redirigirá automáticamente al Panel de Control de la aplicación.

## 3. Configuración del temporizador

Desde el Panel de Control (`http://localhost:3000`) puedes ajustar el comportamiento del contador.

1. Dirígete a la sección **Reglas del Stream**.
2. Configura los siguientes parámetros según tus preferencias:
   - **Tiempo Inicial:** Duración base del contador en minutos.
   - **Follow:** Segundos que se suman por cada nuevo seguidor.
   - **Sub:** Segundos que se suman por cada suscripción.
   - **1 Bit:** Segundos que se suman por cada bit donado (Ejemplo: si estableces 1, una donación de 100 bits sumará 100 segundos).
3. Haz clic en **Guardar Configuración**. Estos datos se almacenarán para futuros directos.
4. Utiliza el botón **Reiniciar Reloj** para aplicar el tiempo inicial al contador.

## 4. Integración en OBS Studio

Para mostrar el contador en tu retransmisión, debes añadirlo como una Fuente de Navegador en OBS.

1. Abre OBS Studio.
2. En el panel de **Fuentes**, haz clic en el icono **+** y selecciona **Navegador**.
3. Asigna un nombre a la fuente (por ejemplo, "Contador Twitch") y pulsa Aceptar.
4. En la ventana de propiedades, configura los siguientes campos:
   - **URL:** `http://localhost:3000/`
   - **Ancho:** `400`
   - **Alto:** `300`
5. Desplázate hacia abajo en esa misma ventana y marca la opción **Actualizar el navegador cuando la escena se active**.
6. Haz clic en Aceptar.

El contador aparecerá en la vista previa de OBS con fondo transparente. Puedes arrastrarlo y redimensionarlo libremente desde los bordes para colocarlo en la posición deseada.

## 5. Pruebas de funcionamiento

Puedes verificar que la conexión funciona correctamente antes de iniciar el directo:
1. Desde el Panel de Control en el navegador, ve a la sección **Simulador Twitch**.
2. Haz clic en cualquiera de los botones de simulación (Simular Follow, Simular Sub).
3. Comprueba en OBS que el reloj reacciona, actualiza el tiempo y muestra la notificación correspondiente.

## 6. Personalización de recursos gráficos

El diseño visual y las alertas auditivas pueden modificarse sin necesidad de alterar el código del programa.

1. Navega hasta la carpeta `public` que se encuentra junto a `TwitchTimer.exe`.
2. Para cambiar el sonido de alerta, reemplaza el archivo `alerta.mp3` por tu propio archivo de audio, manteniendo exactamente el mismo nombre.
3. Para cambiar la animación visual, reemplaza el archivo `animacion.gif` por tu propia imagen, manteniendo exactamente el mismo nombre.
4. Los cambios se aplicarán la próxima vez que inicies `TwitchTimer.exe` o recargues la fuente en OBS.
