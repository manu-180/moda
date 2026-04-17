import { createClient } from '@/lib/supabase/server'
import AdminSettings from '@/components/admin/AdminSettings'

async function getSettings() {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('*')
  const map: Record<string, unknown> = {}
  data?.forEach((row: { key: string; value: unknown }) => { map[row.key] = row.value })
  return map
}

export default async function SettingsPage() {
  const settings = await getSettings()
  return <AdminSettings initialSettings={settings} />
}
