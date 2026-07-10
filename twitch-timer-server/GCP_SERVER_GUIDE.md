# Despliegue en Google Cloud Platform (GCP)

Esta guía documenta los pasos para provisionar una instancia de servidor utilizando la capa gratuita (Always Free) de Google Cloud Platform.

> [!IMPORTANT]
> Para ser elegible para la capa gratuita de Compute Engine, la instancia debe ser creada en una de las siguientes regiones de EE. UU.:
> - **us-central1** (Iowa)
> - **us-east1** (South Carolina)
> - **us-west1** (Oregon)

---

## 1. Aprovisionamiento de la Máquina Virtual

1. Acceda a [Google Cloud Console](https://console.cloud.google.com/).
2. Seleccione o cree un proyecto.
3. Navegue a **Compute Engine** -> **VM instances** y haga clic en **Crear Instancia**.
4. **Configuración Básica:**
   - **Nombre:** (ej. `twitch-timer-server`).
   - **Región:** `us-east1` (South Carolina).
   - **Configuración de la máquina:**
     - Serie: **E2**.
     - Tipo de máquina: **`e2-micro`** (2 vCPU, 1 GB RAM).
5. **Disco de arranque:**
   - Haga clic en **Cambiar**.
   - Sistema operativo: **Ubuntu**.
   - Versión: **Ubuntu 24.04 LTS (x86-64)**.
   - Tipo de disco: **Disco persistente estándar** (Standard persistent disk).
   - Tamaño: **30 GB**.
   - Haga clic en **Seleccionar**.
6. **Firewall:**
   - Marque **Permitir tráfico HTTP**.
   - Marque **Permitir tráfico HTTPS**.
7. **Observabilidad:**
   - En opciones avanzadas de observabilidad, deshabilite el agente de Ops (Ops Agent) para reducir el consumo de RAM en instancias e2-micro.
8. Haga clic en **Crear**.

> [!NOTE]
> La interfaz mostrará un costo estimado mensual. En la capa gratuita, Google Cloud factura el uso y aplica un descuento equivalente ("Free Tier discount") que cubre el 100% del costo base, resultando en un cargo final de $0.00. [Documentación Oficial](https://cloud.google.com/free/docs/free-cloud-features?hl=en#compute).

> [!TIP]
> Se recomienda configurar una alerta de facturación (Billing Alert) de bajo importe (ej. $0.50) para prevenir sobrecostos por exceder los límites de ancho de banda.

---

## 2. Acceso SSH

Una vez aprovisionada la instancia:
1. Navegue a la lista de "Instancias de VM".
2. Localice la instancia recién creada (anote la **IP Externa** asignada).
3. Haga clic en el botón **SSH** para abrir la consola web integrada de GCP.

Continúe con el proceso de configuración del servidor operativo detallado en la siguiente guía.
