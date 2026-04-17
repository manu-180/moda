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

interface Props { initialSettings: Record<string, any> }

export default function AdminSettings({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, any>>(initialSettings)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  function set(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function get(key: string, fallback: any = '') {
    return settings[key] ?? fallback
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const entries = Object.entries(settings)
    for (const [key, value] of entries) {
      await supabase.from('site_settings').upsert(
        { key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    }
    setDirty(false)
    setSaving(false)
  }

  // ── TAB: GENERAL ───────────────────────
  const generalTab = (
    <div className="space-y-6">
      <Card title="Información de la tienda">
        <div className="space-y-5">
          <Input label="Nombre de la tienda" id="store_name" value={get('store_name', 'MAISON ÉLARA')}
            onChange={(e) => set('store_name', e.target.value)} />
          <Textarea label="Descripción" id="store_desc" value={get('store_description', '')}
            onChange={(e) => set('store_description', e.target.value)} autoResize />
          <Input label="Correo de contacto" id="contact_email" type="email" value={get('contact_email', '')}
            onChange={(e) => set('contact_email', e.target.value)} />
          <Select label="Moneda" options={[
            { label: 'USD ($)', value: 'USD' },
            { label: 'EUR (€)', value: 'EUR' },
            { label: 'ARS ($)', value: 'ARS' },
          ]} value={get('store_currency', 'USD')} onChange={(v) => set('store_currency', v)} />
        </div>
      </Card>

      <Card title="Redes sociales">
        <div className="space-y-5">
          <Input label="URL de Instagram" id="social_ig" value={get('social_instagram', '')}
            onChange={(e) => set('social_instagram', e.target.value)} />
          <Input label="URL de Pinterest" id="social_pin" value={get('social_pinterest', '')}
            onChange={(e) => set('social_pinterest', e.target.value)} />
          <Input label="URL de X (Twitter)" id="social_x" value={get('social_twitter', '')}
            onChange={(e) => set('social_twitter', e.target.value)} />
          <Input label="URL de TikTok" id="social_tt" value={get('social_tiktok', '')}
            onChange={(e) => set('social_tiktok', e.target.value)} />
        </div>
      </Card>
    </div>
  )

  // ── TAB: SHIPPING ──────────────────────
  const shippingTab = (
    <div className="space-y-6">
      <Card title="Tarifas de envío">
        <div className="space-y-5">
          <Input label="Envío estándar (USD)" id="ship_std" type="number"
            value={get('shipping_standard', '15')}
            onChange={(e) => set('shipping_standard', e.target.value)} />
          <Input label="Mínimo para envío gratis (USD)" id="ship_free" type="number"
            value={get('free_shipping_threshold', '500')}
            onChange={(e) => set('free_shipping_threshold', e.target.value)} />
          <Input label="Envío express (USD)" id="ship_exp" type="number"
            value={get('shipping_express', '35')}
            onChange={(e) => set('shipping_express', e.target.value)} />
        </div>
      </Card>

      <Card title="Zonas de envío">
        <div className="space-y-4">
          {[
            { zone: 'Argentina', key: 'zone_ar' },
            { zone: 'Américas', key: 'zone_americas' },
            { zone: 'Europa', key: 'zone_europe' },
            { zone: 'Resto del mundo', key: 'zone_row' },
          ].map(({ zone, key }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-pale-gray last:border-0">
              <span className="font-body text-[13px] text-charcoal">{zone}</span>
              <div className="w-[120px]">
                <Input id={key} type="number" value={get(`shipping_${key}`, '15')}
                  onChange={(e) => set(`shipping_${key}`, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  // ── TAB: NOTIFICATIONS ─────────────────
  const notificationsTab = (
    <Card title="Notificaciones por correo">
      <div className="space-y-6">
        <Toggle checked={get('notify_new_order', true)} label="Correo ante nuevo pedido"
          onChange={(v) => set('notify_new_order', v)} />
        <Toggle checked={get('notify_low_stock', true)} label="Correo ante stock bajo"
          onChange={(v) => set('notify_low_stock', v)} />
        <div className="w-[200px]">
          <Input label="Umbral de stock bajo" id="low_threshold" type="number"
            value={get('low_stock_threshold', '5')}
            onChange={(e) => set('low_stock_threshold', e.target.value)} />
        </div>
      </div>
    </Card>
  )

  // ── TAB: ACCOUNT ───────────────────────
  const accountTab = (
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

      <Card title="Autenticación en dos pasos">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-[13px] text-charcoal">Verificación en dos pasos</p>
            <p className="font-body text-[12px] text-warm-gray mt-1">Una capa extra de seguridad</p>
          </div>
          <Toggle checked={get('2fa_enabled', false)} onChange={(v) => set('2fa_enabled', v)} />
        </div>
      </Card>

      <div className="bg-white border border-muted-red/30 rounded-lg p-6">
        <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-muted-red mb-3">Zona de peligro</h3>
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
      <Tabs tabs={[
        { id: 'general', label: 'General', content: generalTab },
        { id: 'shipping', label: 'Envíos', content: shippingTab },
        { id: 'notifications', label: 'Avisos', content: notificationsTab },
        { id: 'account', label: 'Cuenta', content: accountTab },
      ]} />

      {/* Save bar */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-pale-gray px-8 py-4 flex items-center justify-between">
          <span className="font-body text-[12px] text-warm-gray italic">Cambios sin guardar</span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setSettings(initialSettings); setDirty(false) }}>Descartar</Button>
            <Button loading={saving} onClick={handleSave}>Guardar cambios</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable card wrapper
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">{title}</h3>
      {children}
    </div>
  )
}
