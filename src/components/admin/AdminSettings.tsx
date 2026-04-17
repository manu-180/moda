'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Modal from '@/components/ui/Modal'

interface Props { initialSettings: Record<string, unknown> }

const DEFAULT_FEATURES = {
  show_editorial_strip: true,
  show_editorial_section: true,
  show_press_strip: false,
  show_instagram_feed: true,
  show_newsletter_cta: true,
  show_announcement_bar: false,
}

const DEFAULT_COLORS = { primary: '#C4A265', accent: '#A47764' }

function validateHexColor(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}
const DEFAULT_ANNOUNCEMENT = { text: '', active: false, link: '' }

export default function AdminSettings({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, unknown>>(initialSettings)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  function set(key: string, value: unknown) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function get(key: string, fallback: unknown = '') {
    const v = settings[key]
    return v !== undefined && v !== null ? v : fallback
  }

  function getFeature(key: string): boolean {
    const f = settings['features'] as Record<string, boolean> | undefined
    return f?.[key] ?? DEFAULT_FEATURES[key as keyof typeof DEFAULT_FEATURES] ?? false
  }

  function setFeature(key: string, value: boolean) {
    const f = { ...DEFAULT_FEATURES, ...(settings['features'] as object ?? {}) }
    set('features', { ...f, [key]: value })
  }

  function getColor(key: 'primary' | 'accent'): string {
    const c = settings['brand_colors'] as Record<string, string> | undefined
    return c?.[key] ?? DEFAULT_COLORS[key]
  }

  function setColor(key: 'primary' | 'accent', value: string) {
    const c = { ...DEFAULT_COLORS, ...(settings['brand_colors'] as object ?? {}) }
    set('brand_colors', { ...c, [key]: value })
  }

  function getAnnouncement(key: string): unknown {
    const a = settings['announcement_bar'] as Record<string, unknown> | undefined
    return a?.[key] ?? DEFAULT_ANNOUNCEMENT[key as keyof typeof DEFAULT_ANNOUNCEMENT]
  }

  function setAnnouncement(key: string, value: unknown) {
    const a = { ...DEFAULT_ANNOUNCEMENT, ...(settings['announcement_bar'] as object ?? {}) }
    set('announcement_bar', { ...a, [key]: value })
  }

  async function handleSave() {
    const colors = settings['brand_colors'] as Record<string, string> | undefined
    if (colors) {
      if (!validateHexColor(colors.primary)) throw new Error(`Color primario inválido: "${colors.primary}"`)
      if (!validateHexColor(colors.accent))  throw new Error(`Color de acento inválido: "${colors.accent}"`)
    }

    setSaving(true)
    const supabase = createClient()
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert(
        { key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    }
    setDirty(false)
    setSaving(false)
  }

  // ── TAB: IDENTIDAD ─────────────────────────────────────────────
  const identidadTab = (
    <div className="space-y-6">
      <Card title="Tienda">
        <div className="space-y-5">
          <Input label="Nombre de la tienda" id="store_name"
            value={get('store_name') as string}
            onChange={(e) => set('store_name', e.target.value)} />
          <Input label="Tagline (frase corta bajo el logo)" id="store_tagline"
            value={get('store_tagline') as string}
            onChange={(e) => set('store_tagline', e.target.value)} />
          <Textarea label="Descripción corta" id="store_description"
            value={get('store_description') as string}
            onChange={(e) => set('store_description', e.target.value)} autoResize />
        </div>
      </Card>
      <Card title="Imágenes de marca">
        <p className="font-body text-[12px] text-warm-gray mb-5">
          Subí las imágenes a Supabase Storage y pegá la URL pública acá.
        </p>
        <div className="space-y-5">
          <Input label="URL del logo" id="logo_url"
            value={get('logo_url') as string}
            onChange={(e) => set('logo_url', e.target.value)} />
          <Input label="URL del favicon (.ico o .png 32×32)" id="favicon_url"
            value={get('favicon_url') as string}
            onChange={(e) => set('favicon_url', e.target.value)} />
        </div>
      </Card>
    </div>
  )

  // ── TAB: CONTACTO ──────────────────────────────────────────────
  const contactoTab = (
    <Card title="Datos de contacto">
      <div className="space-y-5">
        <Input label="Correo electrónico" id="contact_email" type="email"
          value={get('contact_email') as string}
          onChange={(e) => set('contact_email', e.target.value)} />
        <Input label="Teléfono" id="contact_phone" type="tel"
          value={get('contact_phone') as string}
          onChange={(e) => set('contact_phone', e.target.value)} />
        <Input label="WhatsApp (URL completa con número)" id="contact_whatsapp"
          value={get('contact_whatsapp') as string}
          onChange={(e) => set('contact_whatsapp', e.target.value)} />
        <Input label="Dirección física (opcional)" id="contact_address"
          value={get('contact_address') as string}
          onChange={(e) => set('contact_address', e.target.value)} />
        <Input label="Horario de atención" id="contact_hours"
          value={get('contact_hours') as string}
          onChange={(e) => set('contact_hours', e.target.value)} />
      </div>
    </Card>
  )

  // ── TAB: REDES ─────────────────────────────────────────────────
  const redesTab = (
    <Card title="Redes sociales">
      <div className="space-y-5">
        <Input label="Instagram (URL completa)" id="social_instagram"
          value={get('social_instagram') as string}
          onChange={(e) => set('social_instagram', e.target.value)} />
        <Input label="Instagram handle (sin @)" id="instagram_handle"
          value={get('instagram_handle') as string}
          onChange={(e) => set('instagram_handle', e.target.value)} />
        <Input label="Pinterest (URL)" id="social_pinterest"
          value={get('social_pinterest') as string}
          onChange={(e) => set('social_pinterest', e.target.value)} />
        <Input label="X / Twitter (URL)" id="social_twitter"
          value={get('social_twitter') as string}
          onChange={(e) => set('social_twitter', e.target.value)} />
        <Input label="Facebook (URL)" id="social_facebook"
          value={get('social_facebook') as string}
          onChange={(e) => set('social_facebook', e.target.value)} />
        <Input label="TikTok (URL)" id="social_tiktok"
          value={get('social_tiktok') as string}
          onChange={(e) => set('social_tiktok', e.target.value)} />
      </div>
    </Card>
  )

  // ── TAB: HOME ──────────────────────────────────────────────────
  const homeTab = (
    <div className="space-y-6">
      <Card title="Barra de anuncio">
        <div className="space-y-5">
          <Toggle
            checked={getAnnouncement('active') as boolean}
            label="Mostrar barra de anuncio"
            onChange={(v) => setAnnouncement('active', v)}
          />
          <Input label="Texto del anuncio" id="ann_text"
            value={getAnnouncement('text') as string}
            onChange={(e) => setAnnouncement('text', e.target.value)} />
          <Input label="Enlace al hacer clic (opcional)" id="ann_link"
            value={getAnnouncement('link') as string}
            onChange={(e) => setAnnouncement('link', e.target.value)} />
        </div>
      </Card>

      <Card title="Hero principal">
        <div className="space-y-5">
          <Input label="Etiqueta de temporada (ej: Colección 2025)" id="hero_season_label"
            value={get('hero_season_label') as string}
            onChange={(e) => set('hero_season_label', e.target.value)} />
          <Input label="Título del hero" id="hero_title"
            value={get('hero_title') as string}
            onChange={(e) => set('hero_title', e.target.value)} />
          <Textarea label="Subtítulo" id="hero_subtitle"
            value={get('hero_subtitle') as string}
            onChange={(e) => set('hero_subtitle', e.target.value)} autoResize />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Texto del botón CTA" id="hero_cta_text"
              value={get('hero_cta_text') as string}
              onChange={(e) => set('hero_cta_text', e.target.value)} />
            <Input label="Enlace del botón CTA" id="hero_cta_href"
              value={get('hero_cta_href') as string}
              onChange={(e) => set('hero_cta_href', e.target.value)} />
          </div>
          <Input label="URL de imagen del hero (Supabase Storage)" id="hero_image_url"
            value={get('hero_image_url') as string}
            onChange={(e) => set('hero_image_url', e.target.value)} />
        </div>
      </Card>

      <Card title="Franja editorial">
        <div className="space-y-5">
          <Input label="Título" id="editorial_strip_title"
            value={get('editorial_strip_title') as string}
            onChange={(e) => set('editorial_strip_title', e.target.value)} />
          <Input label="Subtítulo" id="editorial_strip_subtitle"
            value={get('editorial_strip_subtitle') as string}
            onChange={(e) => set('editorial_strip_subtitle', e.target.value)} />
        </div>
      </Card>

      <Card title="Sección editorial (colección destacada)">
        <div className="space-y-5">
          <Input label="Etiqueta de temporada" id="editorial_season_label"
            value={get('editorial_season_label') as string}
            onChange={(e) => set('editorial_season_label', e.target.value)} />
          <Input label="Título" id="editorial_title"
            value={get('editorial_title') as string}
            onChange={(e) => set('editorial_title', e.target.value)} />
          <Textarea label="Descripción" id="editorial_description"
            value={get('editorial_description') as string}
            onChange={(e) => set('editorial_description', e.target.value)} autoResize />
          <Input label="Enlace del botón (ej: /collections/verano-2025)" id="editorial_cta_href"
            value={get('editorial_cta_href') as string}
            onChange={(e) => set('editorial_cta_href', e.target.value)} />
        </div>
      </Card>

      <Card title="Newsletter">
        <div className="space-y-5">
          <Input label="Título" id="newsletter_title"
            value={get('newsletter_title') as string}
            onChange={(e) => set('newsletter_title', e.target.value)} />
          <Input label="Subtítulo" id="newsletter_subtitle"
            value={get('newsletter_subtitle') as string}
            onChange={(e) => set('newsletter_subtitle', e.target.value)} />
        </div>
      </Card>
    </div>
  )

  // ── TAB: COMERCIAL ─────────────────────────────────────────────
  const comercialTab = (
    <div className="space-y-6">
      <Card title="Moneda y localización">
        <div className="space-y-5">
          <Select label="Moneda" options={[
            { label: 'USD ($)', value: 'USD' },
            { label: 'EUR (€)', value: 'EUR' },
            { label: 'ARS ($)', value: 'ARS' },
            { label: 'GBP (£)', value: 'GBP' },
          ]} value={get('store_currency', 'USD') as string} onChange={(v) => set('store_currency', v)} />
          <Select label="Formato de números" options={[
            { label: 'en-US → $1,234.56', value: 'en-US' },
            { label: 'es-AR → $1.234,56', value: 'es-AR' },
            { label: 'de-DE → €1.234,56', value: 'de-DE' },
          ]} value={get('store_locale', 'en-US') as string} onChange={(v) => set('store_locale', v)} />
        </div>
      </Card>

      <Card title="Envíos e impuestos">
        <div className="space-y-5">
          <Input label="Costo de envío estándar" id="ship_std" type="number"
            value={get('shipping_standard', 15) as number}
            onChange={(e) => set('shipping_standard', Number(e.target.value))} />
          <Input label="Mínimo de compra para envío gratis" id="ship_free" type="number"
            value={get('free_shipping_threshold', 500) as number}
            onChange={(e) => set('free_shipping_threshold', Number(e.target.value))} />
          <Input label="Tasa de impuesto (0.21 = 21% / 0 = sin impuesto)" id="tax_rate"
            type="number" step="0.01" min="0" max="1"
            value={get('tax_rate', 0.21) as number}
            onChange={(e) => set('tax_rate', Number(e.target.value))} />
          <Input label="Año de copyright (pie de página)" id="copyright_year" type="number"
            value={get('footer_copyright_year', new Date().getFullYear()) as number}
            onChange={(e) => set('footer_copyright_year', Number(e.target.value))} />
        </div>
      </Card>
    </div>
  )

  // ── TAB: APARIENCIA ────────────────────────────────────────────
  const aparienciaTab = (
    <Card title="Colores de marca">
      <p className="font-body text-[12px] text-warm-gray mb-6 leading-relaxed">
        Estos colores reemplazan el dorado y terracota del demo. El cambio se refleja en toda la tienda sin hacer rebuild — se inyectan como CSS variables.
      </p>
      <div className="space-y-8">
        <ColorPicker
          label="Color primario (botones, líneas de acento, elementos dorados)"
          value={getColor('primary')}
          onChange={(v) => setColor('primary', v)}
        />
        <ColorPicker
          label="Color de acento (hover states, elementos secundarios)"
          value={getColor('accent')}
          onChange={(v) => setColor('accent', v)}
        />
      </div>
      <div className="mt-8 p-4 bg-cream rounded border border-pale-gray">
        <p className="font-body text-[11px] text-warm-gray uppercase tracking-[0.1em] mb-3">Vista previa</p>
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 rounded" style={{ backgroundColor: getColor('primary') }} />
          <div className="h-8 w-24 rounded" style={{ backgroundColor: getColor('accent') }} />
          <span className="font-body text-[12px] text-dark-gray">
            {getColor('primary')} · {getColor('accent')}
          </span>
        </div>
      </div>
    </Card>
  )

  // ── TAB: SEO ───────────────────────────────────────────────────
  const seoTab = (
    <div className="space-y-6">
      <Card title="Página de inicio">
        <div className="space-y-5">
          <Input label="Título SEO (aparece en la pestaña del navegador)" id="seo_home_title"
            value={get('seo_home_title') as string}
            onChange={(e) => set('seo_home_title', e.target.value)} />
          <Textarea label="Descripción meta" id="seo_home_description"
            value={get('seo_home_description') as string}
            onChange={(e) => set('seo_home_description', e.target.value)} autoResize />
        </div>
      </Card>

      <Card title="Páginas de producto y colección">
        <div className="space-y-5">
          <Textarea label="Descripción meta — Catálogo de productos" id="seo_products_description"
            value={get('seo_products_description') as string}
            onChange={(e) => set('seo_products_description', e.target.value)} autoResize />
          <Textarea label="Descripción meta — Colecciones" id="seo_collections_description"
            value={get('seo_collections_description') as string}
            onChange={(e) => set('seo_collections_description', e.target.value)} autoResize />
        </div>
      </Card>

      <Card title="Open Graph (compartir en redes)">
        <Input label="URL de imagen OG (1200×630 px recomendado)" id="seo_og_image"
          value={get('seo_og_image') as string}
          onChange={(e) => set('seo_og_image', e.target.value)} />
      </Card>
    </div>
  )

  // ── TAB: SECCIONES ─────────────────────────────────────────────
  const seccionesTab = (
    <Card title="Secciones visibles en el Home">
      <p className="font-body text-[12px] text-warm-gray mb-6 leading-relaxed">
        Activá o desactivá secciones según el cliente. El cambio aplica de inmediato.
      </p>
      <div className="space-y-5">
        {[
          { key: 'show_announcement_bar', label: 'Barra de anuncio (parte superior de la página)' },
          { key: 'show_editorial_strip', label: 'Franja editorial (debajo del hero)' },
          { key: 'show_editorial_section', label: 'Sección editorial (colección destacada)' },
          { key: 'show_press_strip', label: 'Franja de prensa / menciones en medios' },
          { key: 'show_instagram_feed', label: 'Feed de Instagram' },
          { key: 'show_newsletter_cta', label: 'Bloque de suscripción al newsletter' },
        ].map(({ key, label }) => (
          <Toggle
            key={key}
            checked={getFeature(key)}
            label={label}
            onChange={(v) => setFeature(key, v)}
          />
        ))}
      </div>
    </Card>
  )

  // ── TAB: CUENTA ────────────────────────────────────────────────
  const cuentaTab = (
    <div className="space-y-6">
      <Card title="Cambiar contraseña">
        <div className="space-y-5">
          <Input label="Contraseña actual" id="cur_pw" type="password"
            value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          <Input label="Nueva contraseña" id="new_pw" type="password"
            value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <Input label="Confirmar nueva contraseña" id="conf_pw" type="password"
            value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
            error={confirmPw && newPw !== confirmPw ? 'Las contraseñas no coinciden' : ''} />
          <Button size="sm" variant="secondary" disabled={!newPw || newPw !== confirmPw}>
            Actualizar contraseña
          </Button>
        </div>
      </Card>

      <div className="bg-white border border-muted-red/30 rounded-lg p-6">
        <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-muted-red mb-3">
          Zona de peligro
        </h3>
        <p className="font-body text-[13px] text-dark-gray mb-4">
          Eliminar tu cuenta y todos los datos asociados de forma permanente.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
          Eliminar cuenta
        </Button>
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Eliminar cuenta" size="sm">
        <p className="font-body text-[14px] text-dark-gray mb-6">
          ¿Seguro? Esta acción es <strong>permanente</strong> y no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger">Eliminar definitivamente</Button>
        </div>
      </Modal>
    </div>
  )

  return (
    <div className="pb-24">
      <Tabs
        tabs={[
          { id: 'identidad', label: 'Identidad', content: identidadTab },
          { id: 'contacto', label: 'Contacto', content: contactoTab },
          { id: 'redes', label: 'Redes', content: redesTab },
          { id: 'home', label: 'Home', content: homeTab },
          { id: 'comercial', label: 'Comercial', content: comercialTab },
          { id: 'apariencia', label: 'Apariencia', content: aparienciaTab },
          { id: 'seo', label: 'SEO', content: seoTab },
          { id: 'secciones', label: 'Secciones', content: seccionesTab },
          { id: 'cuenta', label: 'Cuenta', content: cuentaTab },
        ]}
      />

      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-pale-gray px-8 py-4 flex items-center justify-between shadow-lg">
          <span className="font-body text-[12px] text-warm-gray italic">Cambios sin guardar</span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setSettings(initialSettings); setDirty(false) }}>
              Descartar
            </Button>
            <Button loading={saving} onClick={handleSave}>Guardar cambios</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">{title}</h3>
      {children}
    </div>
  )
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="font-body text-[12px] text-charcoal mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded border border-pale-gray cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value
            if (val === '' || /^#[0-9a-fA-F]{0,6}$/.test(val)) onChange(val)
          }}
          className="flex-1 border-b border-pale-gray pb-2 font-body text-[13px] text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-charcoal transition-colors duration-300 uppercase"
          placeholder="#C4A265"
        />
      </div>
    </div>
  )
}
