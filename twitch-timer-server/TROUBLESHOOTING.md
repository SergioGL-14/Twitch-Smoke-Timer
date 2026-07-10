# Guía de Resolución de Problemas (Troubleshooting)

Este documento centraliza los problemas comunes y sus respectivas soluciones durante la operación del servidor.

---

## 1. Facturación y Google Cloud

**Problema: El panel de facturación indica cargos generados durante el mes actual.**
**Causa:** Google Cloud registra el uso bruto de recursos. Si la instancia (`e2-micro`) está en una región válida, el sistema aplica automáticamente un descuento equivalente ("Free Tier discount") al final del ciclo de facturación, resultando en un costo neto de $0.00.

**Problema: Consumo excesivo de red (egress) por ataques o picos de tráfico.**
**Causa:** La capa gratuita incluye 1 GB de tráfico de salida (egress) mensual gratuito. Exceder este límite generará cargos.
*Solución Preventiva:* Configure una alerta de presupuesto (Billing Alert) de bajo importe (ej. $0.50). Si se supera el límite gratuito, recibirá una notificación por correo electrónico, permitiéndole detener la instancia temporalmente.

---

## 2. Dominio y HTTPS

**Problema: El navegador muestra el error `ERR_CONNECTION_REFUSED` o `DNS_PROBE_FINISHED_NXDOMAIN`.**
**Causa:** La IP pública de la instancia de Google Cloud pudo haber cambiado (si la instancia fue detenida y reiniciada), o el proveedor de DNS dinámico no tiene la IP actualizada.
*Solución:* Acceda al panel de su proveedor de DNS (ej. DuckDNS, Cloudflare) y actualice el registro A para que apunte a la IP Externa actual de la instancia.

**Problema: El certificado SSL es inválido o ha caducado.**
**Causa:** Certbot automatiza la renovación, pero fallará si el servidor estuvo inactivo durante el período de renovación.
*Solución:* Ejecute la renovación manual desde la consola SSH:
```bash
sudo certbot renew
```

---

## 3. Integración con Twitch (OAuth y Login)

**Problema: Twitch muestra el error "Invalid Redirect URI" al intentar iniciar sesión.**
**Causa:** La URL desde la cual se está intentando iniciar sesión no coincide con la configurada en la consola de desarrollo de Twitch.
*Solución:* Verifique que la URL registrada en `https://dev.twitch.tv/console/apps` (sección **OAuth Redirect URLs**) sea exactamente la misma que la utilizada en la aplicación, incluyendo el protocolo `https://` y el dominio completo.

**Problema: Error de Twitch: "Es necesario el protocolo HTTPS para redirigir URI".**
**Causa:** Se está accediendo a la aplicación a través de la dirección IP directa usando HTTP en lugar del dominio seguro con HTTPS. Twitch bloquea las redirecciones no seguras en producción.
*Solución:* Asegúrese de acceder a la plataforma a través de su dominio seguro (ej. `https://yourdomain.com`).

---

## 4. Aplicación (Node.js y PM2)

**Problema: El navegador muestra una pantalla blanca con el error "502 Bad Gateway".**
**Causa:** Nginx está operativo, pero el proceso de Node.js ha fallado o se ha detenido.
*Solución:* Consulte los logs del proceso en la consola SSH:
```bash
pm2 logs twitch-timer
```
*(Pulse `Ctrl + C` para salir de los logs).*
Errores comunes identificables en los logs:
1.  **ERR_REQUIRE_ESM:** Se ha instalado una versión de Twurple exclusiva para ESM. Ejecute: `npm install @twurple/api@6.2.1 @twurple/auth@6.2.1 @twurple/eventsub-ws@6.2.1` y reinicie el proceso con `pm2 restart twitch-timer`.
2.  Ausencia del archivo `.env` o variables requeridas no definidas.

**Problema: Los cambios en el código fuente no se reflejan en el navegador.**
**Causa:** El proceso de Node.js mantiene en memoria la versión antigua del código.
*Solución:* Reinicie el proceso tras cualquier actualización:
```bash
pm2 restart twitch-timer
```

**Problema: Credenciales administrativas (panel oculto) extraviadas.**
**Causa:** Olvido de la contraseña temporal.
*Solución:* Lea el valor directamente de la base de datos ejecutando el siguiente comando:
```bash
sqlite3 database.sqlite "SELECT value FROM config WHERE key = 'admin_pass';"
```
