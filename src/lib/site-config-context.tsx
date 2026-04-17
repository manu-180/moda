'use client'

import { createContext, useContext } from 'react'
import { type SiteConfig, SITE_CONFIG_DEFAULTS } from './site-config-types'

const SiteConfigContext = createContext<SiteConfig>(SITE_CONFIG_DEFAULTS)

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig
  children: React.ReactNode
}) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext)
}
