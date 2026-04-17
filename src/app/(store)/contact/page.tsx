import type { Metadata } from 'next'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/store/ContactForm'

export const metadata: Metadata = {
  title: `Contacto | ${SITE_NAME}`,
  description: 'Ponete en contacto con nuestro equipo. Estamos para ayudarte con pedidos, consultas y todo lo que necesités.',
}

export default async function ContactPage() {
  const { contact, identity } = await getSiteConfig()

  const hasContactInfo = contact.email || contact.phone || contact.address || contact.hours

  return (
    <>
      {/* Page header */}
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Atención al cliente
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Contacto
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-md mx-auto">
            Estamos para ayudarte. Escribinos y te respondemos en menos de 24&nbsp;horas.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">

            {/* Left: contact info */}
            {hasContactInfo && (
              <aside className="lg:col-span-2 flex flex-col gap-10">
                <div>
                  <h2 className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mb-6">
                    Información de contacto
                  </h2>
                  <ul className="flex flex-col gap-6">
                    {contact.email && (
                      <li className="flex items-start gap-4">
                        <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border border-[#C4A265]/30 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-[#C4A265]" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-1">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="font-body text-[14px] text-charcoal hover:text-[#C4A265] transition-colors duration-200"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </li>
                    )}
                    {contact.phone && (
                      <li className="flex items-start gap-4">
                        <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border border-[#C4A265]/30 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-[#C4A265]" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-1">Teléfono</p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="font-body text-[14px] text-charcoal hover:text-[#C4A265] transition-colors duration-200"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </li>
                    )}
                    {contact.address && (
                      <li className="flex items-start gap-4">
                        <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border border-[#C4A265]/30 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-[#C4A265]" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-1">Dirección</p>
                          <p className="font-body text-[14px] text-charcoal">{contact.address}</p>
                        </div>
                      </li>
                    )}
                    {contact.hours && (
                      <li className="flex items-start gap-4">
                        <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border border-[#C4A265]/30 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-[#C4A265]" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-1">Horario</p>
                          <p className="font-body text-[14px] text-charcoal">{contact.hours}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#C4A265]/20" />
                  <span className="font-display text-[#C4A265]/40 text-lg">✦</span>
                  <div className="h-px flex-1 bg-[#C4A265]/20" />
                </div>

                <p className="font-body text-[13px] text-warm-gray italic leading-relaxed">
                  &ldquo;Cada consulta es una oportunidad de acompañarte en tu experiencia con {identity.store_name}.&rdquo;
                </p>
              </aside>
            )}

            {/* Right: form */}
            <div className={hasContactInfo ? 'lg:col-span-3' : 'lg:col-span-5 max-w-2xl mx-auto w-full'}>
              <h2 className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mb-8">
                Envianos un mensaje
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
