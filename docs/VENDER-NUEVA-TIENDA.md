# Playbook: Vender una Nueva Tienda MAISON ÉLARA

> **Para uso interno — APEX / theapexweb.com**
> Seguí este checklist cada vez que cerrás un cliente nuevo. Paso a paso, sin saltear nada.

---

## Antes de empezar

Tené a mano:
- Acceso a [dashboard.supabase.com](https://dashboard.supabase.com)
- Acceso a [vercel.com](https://vercel.com)
- El repo de MAISON ÉLARA (el mismo repo base para todos los clientes)
- Los datos del cliente: nombre de la tienda, slug, email de admin

---

## Paso 1 — Crear el proyecto en Supabase

1. Entrá a [dashboard.supabase.com](https://dashboard.supabase.com) → **New Project**
2. Elegí la organización correcta
3. Nombre del proyecto: usá el slug del cliente (ej: `vanesa-boutique`)
4. Región: **South America (São Paulo)** — siempre, para menor latencia desde Argentina
5. Generá una contraseña fuerte para la DB y **guardala en tu gestor de contraseñas**
6. Esperá que el proyecto termine de provisionar (tarda ~2 minutos)

---

## Paso 2 — Correr el schema en el SQL Editor

1. Dentro del proyecto de Supabase, abrí **SQL Editor**
2. Copiá el contenido de `supabase/base.sql` y ejecutalo
   - Esto crea todas las tablas: `products`, `categories`, `orders`, `site_settings`, etc.
   - Vas a ver "Success. No rows returned" — eso es correcto
3. Verificá en **Table Editor** que las tablas aparezcan

> **Nota:** No corras `seed-demo.sql` acá. El onboard-client script se encarga de todo eso.

---

## Paso 3 — Crear el JSON del cliente

Creá el archivo `clientes/{slug}.json`. Por ejemplo, para Vanesa:

```bash
touch clientes/vanesa.json
```

Estructura del JSON:

```json
{
  "slug": "vanesa",
  "supabaseUrl": "https://xxxxxxxxxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGc...",
  "supabaseServiceKey": "eyJhbGc...",
  "settings": {
    "store_name": "Vanesa Boutique",
    "store_tagline": "Moda con identidad",
    "admin_email": "vanesa@ejemplo.com",
    "admin_temp_password": "CambiaMe2024!"
  }
}
```

Para conseguir las keys:
- `supabaseUrl` y `supabaseAnonKey`: **Project Settings → API → Project URL / anon key**
- `supabaseServiceKey`: **Project Settings → API → service_role key** (secreta, no la expongas nunca en el front)

---

## Paso 4 — Correr el script de onboarding

Desde la raíz del repo:

```bash
npm run onboard-client clientes/vanesa.json
```

Este script hace todo lo siguiente de forma automática:
- Conecta al proyecto de Supabase del cliente via service key
- Corre `supabase/seed-empty-client.sql` (datos vacíos, listos para que el cliente cargue los suyos)
- Inserta la configuración inicial en `site_settings` con los valores del JSON
- Crea el usuario admin con el email y contraseña temporal

Vas a ver logs en la consola. Si algo falla, el script lo indica con el paso exacto.

---

## Paso 5 — Crear el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Importá el **mismo repo** de MAISON ÉLARA (no clones, no forks — mismo repo)
3. Nombre del proyecto en Vercel: `maison-elara-{slug}` (ej: `maison-elara-vanesa`)
4. Framework: **Next.js** (Vercel lo detecta solo)
5. **No toques nada más** — hacé click en **Deploy** y dejá que falle (va a fallar porque no tiene las env vars todavía)

---

## Paso 6 — Agregar las variables de entorno en Vercel

Después del primer deploy (fallido), andá a:

**Project Settings → Environment Variables**

Agregá exactamente estas 2 variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | La URL del proyecto Supabase del cliente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La anon key del proyecto Supabase del cliente |

> Solo estas 2. Nada más. Todo lo demás (nombre, colores, textos) vive en `site_settings`.

Después de agregar las env vars, hacé **Redeploy** desde la pestaña Deployments.

---

## Paso 7 — Apuntar el dominio propio (opcional)

Si el cliente tiene dominio propio:

1. En Vercel → **Project Settings → Domains** → Add Domain
2. Ingresá el dominio (ej: `vanesa-boutique.com`)
3. Vercel te va a dar los registros DNS a configurar:
   - Si es dominio raíz: registro `A` apuntando a Vercel
   - Si es subdominio: registro `CNAME`
4. El cliente configura esos registros en su proveedor de dominio (NIC.ar, Namecheap, GoDaddy, etc.)
5. Vercel gestiona el SSL automáticamente (Let's Encrypt)

> Si el cliente no tiene dominio todavía, puede usar el subdominio de Vercel que viene por defecto: `maison-elara-vanesa.vercel.app`

---

## Paso 8 — Entregar credenciales al cliente

Mandá al cliente:

```
URL de tu tienda: https://tu-dominio.com (o la URL de Vercel)
URL del panel admin: https://tu-dominio.com/auth/login
Email: vanesa@ejemplo.com
Contraseña temporal: CambiaMe2024!

IMPORTANTE: Cambiá la contraseña al primer ingreso.
```

Hacelo por un canal seguro (WhatsApp, email con contraseña separada, o 1Password sharing).

---

## Paso 9 — Acompañar al cliente en la configuración inicial

Hacé una videollamada de 30-45 minutos o grabá un Loom. El cliente tiene que:

1. Entrar a `/auth/login` y cambiar la contraseña
2. Ir a **Admin → Configuración General** y setear:
   - Nombre de la tienda
   - Tagline y descripción
3. Subir el logo y el favicon en **Admin → Apariencia**
4. Elegir los colores de marca en el color picker
5. Cargar al menos 3-5 productos para que la tienda no quede vacía
6. Configurar links de redes sociales
7. Revisar el hero de la home y ajustar el texto del CTA

> **Tranquilidad:** Si el cliente no configura nada todavía, el sitio muestra los defaults de MAISON ÉLARA. Es seguro deployar antes de que el cliente haya tocado nada. No se rompe.

---

## Paso 10 — Checklist final antes de "cerrar" el proyecto

Antes de dar el proyecto por entregado, verificá todo esto:

### Técnico
- [ ] El sitio carga sin errores en producción
- [ ] Las 2 env vars están en Vercel (no más, no menos)
- [ ] El dominio propio resuelve correctamente (si aplica)
- [ ] El SSL está activo (candado verde en el browser)
- [ ] El admin panel es accesible en `/auth/login`
- [ ] El cliente puede loguearse con sus credenciales

### Contenido mínimo
- [ ] Nombre de la tienda configurado (no dice "MAISON ÉLARA" si el cliente tiene otro nombre)
- [ ] Al menos 1 producto cargado
- [ ] Logo subido (o al menos el nombre de la tienda visible en el header)

### Entregables al cliente
- [ ] URL de la tienda
- [ ] URL del admin
- [ ] Email y contraseña (cambiada por el cliente)
- [ ] Link al `MANUAL-CLIENTE.md` o versión PDF
- [ ] Datos de facturación / contrato firmado

---

## Troubleshooting rápido

**El sitio muestra "MAISON ÉLARA" en vez del nombre del cliente**
→ Las settings no se cargaron. Verificá que `onboard-client` corrió sin errores y que `site_settings` tiene filas en Supabase.

**Error 500 en el deploy de Vercel**
→ Revisá que las 2 env vars estén bien escritas (sin espacios, sin comillas en el valor).

**El script de onboard falla**
→ Verificá que el `supabaseServiceKey` en el JSON sea la key de `service_role`, no la `anon key`.

**El cliente no puede loguearse al admin**
→ Verificá que el script creó el usuario. En Supabase → Authentication → Users, el email del cliente tiene que aparecer.

---

*APEX / theapexweb.com — Documento interno, no compartir con clientes.*
