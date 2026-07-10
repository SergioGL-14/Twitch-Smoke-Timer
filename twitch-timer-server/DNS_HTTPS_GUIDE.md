# Configuración de Dominio y SSL/HTTPS (Certbot)

La API de Twitch requiere estrictamente que la URL de redirección (OAuth Redirect URI) utilice el protocolo seguro `https://` (la única excepción es `http://localhost` para entornos de desarrollo locales). Dado que las autoridades certificadoras no emiten certificados SSL para direcciones IP estáticas directamente, **es obligatorio asociar un dominio al servidor**.

Esta guía documenta cómo enlazar un dominio y provisionar un certificado SSL utilizando Let's Encrypt (Certbot).

---

## 1. Configuración del Dominio (Registros DNS)

Adquiera o registre un dominio (por ejemplo, a través de DuckDNS, Cloudflare, Namecheap, etc.).
1. Acceda al panel de administración de su proveedor de DNS.
2. Cree un registro de tipo **A** que apunte a la **IP Externa Pública** de su instancia (ej. `203.0.113.10`).
3. Espere a que los registros DNS se propaguen.

---

## 2. Actualización de Variables y Rutas

Debe actualizar las rutas en el código fuente y en la consola de desarrolladores de Twitch.

### 2.1 En el Servidor (Código Fuente)
Reemplace cualquier referencia a `localhost:3000` o IPs antiguas por su nuevo dominio en la interfaz cliente:
```bash
# Ejemplo usando sed. Reemplace "yourdomain.com" por su dominio real.
sed -i 's/http:\/\/localhost:3000/https:\/\/yourdomain.com/g' ~/twitch-timer/public/index.html
```

### 2.2 En Twitch Developers Console
1. Acceda a [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. Edite su aplicación.
3. En **OAuth Redirect URLs**, reemplace la URL existente por:
   **`https://yourdomain.com/auth/twitch/callback`**
4. Guarde los cambios.

---

## 3. Aprovisionamiento del Certificado SSL (Certbot)

Utilizaremos `certbot` para generar el certificado de Let's Encrypt y reescribir automáticamente la configuración de Nginx.

### 3.1 Instalación de Certbot
Ejecute los siguientes comandos en la terminal de su servidor:
```bash
sudo apt update
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 3.2 Emisión del Certificado SSL
Ejecute Certbot indicando su dominio:
```bash
# Reemplace yourdomain.com por su dominio real
sudo certbot --nginx -d yourdomain.com
```

El asistente interactivo le solicitará:
1. **Email:** Dirección de contacto para notificaciones de expiración.
2. **Términos de Servicio:** Aceptar (`Y`).
3. **Compartir email:** Opcional (`N` o `Y`).

Certbot modificará el archivo `/etc/nginx/sites-available/default` y reiniciará Nginx automáticamente para aplicar la configuración SSL en el puerto 443.

### 4. Renovación Automática
El paquete snap de Certbot incluye un temporizador systemd que renovará el certificado automáticamente antes de su expiración a los 90 días. No se requiere mantenimiento adicional.
