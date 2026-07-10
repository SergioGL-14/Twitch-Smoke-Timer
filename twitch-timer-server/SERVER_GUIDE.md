# ☁️ Guía Maestra de Despliegue en Oracle Cloud

Esta guía documenta el proceso paso a paso para desplegar la aplicación **Twitch Timer SaaS** en un servidor VPS gratuito de Oracle Cloud, incluyendo soluciones a los problemas más comunes de la plataforma.

---

## Fase 1: Preparación y Red (VCN)

Oracle Cloud a veces tiene problemas asignando IPs públicas si creas la red a la vez que la máquina virtual. Por ello, lo mejor es crear la red (VCN) primero.

1. Inicia sesión en el panel de Oracle Cloud.
2. Ve al menú principal (3 rayas arriba a la izquierda) -> **Networking** -> **Virtual Cloud Networks**.
3. Haz clic en **Start VCN Wizard** (importante, no le des a "Create VCN" a secas).
4. Selecciona **Create VCN with Internet Connectivity** y dale a iniciar.
5. Ponle un nombre (ej. `Developer-Projects`).
6. Deja todos los números de IPs por defecto, baja del todo y dale a **Next** y luego a **Create**.

*Resultado:* Tendrás una red pública y otra privada listas para funcionar sin tener que configurar rutas manualmente.

---

## Fase 2: Creación del Servidor (Instancia)

1. Ve al menú principal -> **Compute** -> **Instances** y haz clic en **Create Instance**.
2. **Name:** Ponle nombre a tu máquina (ej. `Twitch-Timer-Pro`).
3. **Image and Shape:**
   - **Image:** Selecciona **Canonical Ubuntu 20.04** (o superior). Es el estándar más estable para Node.js.
   - **Shape:** Por defecto viene AMD (Micro). Si te da error de capacidad (ver Problemas Comunes abajo), pulsa *Change Shape*, ve a la pestaña *Ampere* y selecciona `VM.Standard.A1.Flex` con 1 OCPU y 6GB de RAM (es 100% gratis).
4. **Networking:**
   - Selecciona **Select existing virtual cloud network** y elige tu red `Developer-Projects`.
   - Selecciona **Select existing subnet** y asegúrate de elegir la que empieza por `public subnet...`.
   - Abajo, verifica que en *Public IPv4 address assignment* esté activada la opción para asignar una IP pública (ahora sí te dejará).
5. **Add SSH Keys (¡CRÍTICO!):** 
   - Asegúrate de que está marcado "Generate a key pair for me".
   - Pulsa **Download private key** y guárdala a buen recaudo (ej. en `C:\Users\TuUsuario\Downloads\llave.key`). **Sin esta llave, jamás podrás entrar al servidor.**
6. Pulsa **Create** abajo del todo.
7. Espera unos minutos hasta que el recuadro naranja de "PROVISIONING" pase a verde **"RUNNING"**.
8. Apunta tu **Public IP Address** (ej. `51.170.61.123`).

> [!WARNING] Problema Común: Out of capacity
> **Error:** *"Out of capacity for shape..."*
> **Causa:** Oracle no tiene espacio físico libre en ese centro de datos para la capa gratuita.
> **Solución:** Alterna entre procesadores (AMD Micro o Ampere A1). Si ambos fallan, el centro de datos está totalmente lleno. Tendrás que reintentar darle a "Create" pasados unos minutos, o probar al día siguiente por la mañana cuando se liberan recursos.

---

## Fase 3: Conexión Inicial por SSH

Para conectarte al servidor no se usa el navegador, se usa la terminal de tu ordenador conectándose de forma encriptada mediante la llave- **IP Pública:** `79.72.49.3`
- **Usuario OS:** `ubuntu`

Para conectarte desde la terminal (PowerShell o VS Code), usa el siguiente comando, asegurándote de poner la ruta correcta donde descargaste tu llave `.key`:

```bash
ssh -i "C:\Ruta\A\Tu\llave.key" ubuntu@79.72.49.3
```
*(Sustituye la IP por tu IP Pública real).*

3. La primera vez que te conectes te saldrá un aviso: `Are you sure you want to continue connecting (yes/no/[fingerprint])?`.
4. Escribe **`yes`** y pulsa Enter.

> [!CAUTION] Problema Común en Windows: Permisos de la llave
> Si usas Windows, es muy probable que al ejecutar el comando te dé un error diciendo: **"Permissions are too open"** o *"WARNING: UNPROTECTED PRIVATE KEY FILE!"*.
> 
> SSH te bloquea por seguridad porque considera que tu archivo `.key` puede ser leído por otros usuarios de tu ordenador. 
> 
> **Solución:**
> 1. Haz clic derecho en tu archivo `.key` -> Propiedades -> Seguridad -> Opciones Avanzadas.
> 2. Dale a "Deshabilitar herencia" y elimina todos los permisos heredados.
> 3. Borra todos los usuarios de la lista.
> 4. Añade ÚNICAMENTE a tu propio usuario de Windows dándole permisos de "Lectura".
> 5. Aplica los cambios y vuelve a ejecutar el comando SSH. ¡Ahora sí entrarás!

---

*(Siguientes pasos en desarrollo: Instalación de Nginx, Node.js y PM2...)*
