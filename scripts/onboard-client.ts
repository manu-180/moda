/**
 * Onboarding script para nuevas tiendas.
 *
 * Uso:
 *   npx tsx scripts/onboard-client.ts clientes/nombre-tienda.json
 *
 * Qué hace:
 *   1. Lee y valida el JSON del cliente
 *   2. Crea el usuario admin en Supabase Auth
 *   3. Inserta todos los site_settings en la DB
 *   4. Genera el archivo .env.local listo para Vercel
 *   5. Imprime un checklist de entrega
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientConfig {
  slug: string
  supabase_url: string
  supabase_anon_key: string
  admin_email: string
  admin_password: string
  settings: Record<string, unknown>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`  ${msg}`) }
function ok(msg: string) { console.log(`  ✓ ${msg}`) }
function fail(msg: string) { console.error(`  ✗ ${msg}`); process.exit(1) }
function section(title: string) { console.log(`\n── ${title} ──────────────────────────────────────`) }

function validate(config: Partial<ClientConfig>): asserts config is ClientConfig {
  const required: (keyof ClientConfig)[] = [
    'slug',
    'supabase_url',
    'supabase_anon_key',
    'admin_email',
    'admin_password',
    'settings',
  ]
  for (const field of required) {
    if (!config[field]) fail(`Campo requerido faltante: "${field}"`)
  }
  if (typeof config.settings !== 'object' || Array.isArray(config.settings)) {
    fail('"settings" debe ser un objeto')
  }
  if (!/^[a-z0-9-]+$/.test(config.slug!)) {
    fail('"slug" solo puede contener letras minúsculas, números y guiones')
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2]
  if (!jsonPath) {
    console.error('\nUso: npx tsx scripts/onboard-client.ts clientes/<tienda>.json\n')
    process.exit(1)
  }

  section('LEYENDO CONFIGURACIÓN')

  let config: ClientConfig
  try {
    const raw = readFileSync(resolve(process.cwd(), jsonPath), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ClientConfig>
    validate(parsed)
    config = parsed
    ok(`JSON cargado: ${jsonPath}`)
    ok(`Slug: ${config.slug}`)
    ok(`Admin: ${config.admin_email}`)
    ok(`Settings: ${Object.keys(config.settings).length} claves`)
  } catch (err: unknown) {
    if (err instanceof Error) fail(err.message)
    fail('Error leyendo el archivo JSON')
    return
  }

  // ─── Supabase admin client ─────────────────────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    fail('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno. Ejecutá: export SUPABASE_SERVICE_ROLE_KEY=<key>')
  }
  const supabase = createClient(config.supabase_url, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ─── 1. Crear usuario admin ────────────────────────────────────────────────
  section('CREANDO USUARIO ADMIN')

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: config.admin_email,
    password: config.admin_password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      log(`⚠ El usuario ya existe, continuando...`)
    } else {
      fail(`Error creando usuario: ${authError.message}`)
    }
  } else {
    ok(`Usuario creado: ${authData.user.id}`)
  }

  // ─── 2. Insertar site_settings ────────────────────────────────────────────
  section('INSERTANDO SITE_SETTINGS')

  const entries = Object.entries(config.settings)
  let inserted = 0
  let failed = 0

  for (const [key, value] of entries) {
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      console.error(`  ✗ [${key}] ${error.message}`)
      failed++
    } else {
      inserted++
    }
  }

  ok(`${inserted} settings insertados`)
  if (failed > 0) log(`⚠ ${failed} settings fallaron — revisá los errores arriba`)

  // ─── 3. Generar .env.local ────────────────────────────────────────────────
  section('GENERANDO .env.local')

  const envContent = [
    `# Generado por onboard-client.ts — ${new Date().toISOString()}`,
    `# Tienda: ${config.slug}`,
    ``,
    `NEXT_PUBLIC_SUPABASE_URL=${config.supabase_url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabase_anon_key}`,
  ].join('\n')

  const envPath = `.env.local.${config.slug}`
  writeFileSync(resolve(process.cwd(), envPath), envContent, 'utf-8')
  ok(`Archivo generado: ${envPath}`)

  // ─── 4. Checklist final ───────────────────────────────────────────────────
  section('CHECKLIST DE ENTREGA')
  console.log(`
  [ ] Subir logo e imágenes a Supabase Storage > bucket "public-assets"
  [ ] Copiar ${envPath} → Variables de entorno en Vercel
  [ ] Deploy en Vercel (conectar repo, agregar las dos env vars)
  [ ] Verificar dominio personalizado del cliente
  [ ] Enviar credenciales al cliente:
        URL Admin: https://<vercel-domain>/admin
        Email:     ${config.admin_email}
        Password:  ${config.admin_password}
  [ ] Confirmar que el cliente puede hacer login y editar settings
  [ ] Marcar proyecto como entregado en tu sistema de tracking
  `)
}

main().catch((err) => {
  console.error('\n✗ Error inesperado:', err)
  process.exit(1)
})
