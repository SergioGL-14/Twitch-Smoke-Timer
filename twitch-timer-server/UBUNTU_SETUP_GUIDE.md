# Configuración del Entorno (Ubuntu Server)

Esta guía documenta los pasos para configurar el servidor Ubuntu, instalar las dependencias necesarias y desplegar la aplicación en producción.

---

## 1. Actualización e Instalación de Paquetes

Actualice los repositorios e instale Node.js, NPM, Nginx y la herramienta de descompresión.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm nginx unzip -y
sudo npm install -g pm2
```

---

## 2. Preparación y Subida del Código

Comprima los archivos del servidor en un archivo `.zip` omitiendo la carpeta `node_modules` para agilizar la transferencia.

1. Transfiera el archivo `codigo.zip` al servidor mediante SSH o SCP.
2. Descomprima y prepare el directorio de trabajo ejecutando estos comandos:

```bash
mkdir ~/twitch-timer
cd ~/twitch-timer
mv ~/codigo.zip .
unzip codigo.zip
```

---

## 3. Instalación de Dependencias (Node.js)

> [!IMPORTANT]
> El proyecto está escrito en CommonJS. La librería `@twurple` se mantiene intencionalmente en la versión `6.2.1` en el `package.json` para garantizar la compatibilidad (las versiones 7+ son exclusivas de ESM).

Instale las dependencias locales:
```bash
npm install
```

---

## 4. Arranque del Proceso (PM2)

Utilice PM2 para asegurar la disponibilidad continua de la aplicación.

```bash
# Iniciar la aplicación
pm2 start server.js --name "twitch-timer"

# Generar el script de inicio automático del SO
pm2 startup
```

Ejecute el comando proporcionado por la salida de `pm2 startup` (generalmente comienza con `sudo env PATH...`) y guarde la configuración:
```bash
pm2 save
```

---

## 5. Configuración del Proxy Inverso (Nginx)

Nginx gestionará el tráfico en el puerto 80 (HTTP) y lo redirigirá al puerto 3000 de la aplicación, soportando conexiones de WebSockets.

1. Edite el archivo de configuración de Nginx:
```bash
sudo nano /etc/nginx/sites-available/default
```

2. Localice el bloque `location / {` y reemplace su contenido por las siguientes directivas:

```nginx
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
```

3. Guarde los cambios y reinicie Nginx:

```bash
sudo systemctl restart nginx
```

---

## 6. Resolución de Problemas (Troubleshooting)

### Error 502 Bad Gateway
Un código 502 indica que Nginx está operativo pero la instancia de Node.js no está respondiendo (crash o proceso detenido).

Para consultar el registro de errores de PM2:
```bash
pm2 logs twitch-timer
```
*(Presione `Ctrl + C` para salir del modo de lectura de logs).*
