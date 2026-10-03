import { fetchConfigSafe, WHATSAPP_DISPLAY } from "@/lib/api";

export const metadata = {
  title: "Scentra Ryv | Contact",
  description: "Contact Scentra Ryv for orders and support. WhatsApp and email available nationwide in Pakistan.",
};

export default async function ContactPage() {
  const config = await fetchConfigSafe();

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-hero fade-section visible pb-8!">
          <p className="section-eyebrow">Reach Us</p>
          <h1 className="section-heading mt-3">Contact Us</h1>
          <div className="gold-divider" />
          <p className="text-brand-mute">We&apos;d love to hear from you</p>
        </div>
        <div className="fade-section visible mt-8 grid gap-5 sm:grid-cols-2">
          <div className="feature-tile group p-10!">
            <div className="feature-tile__icon">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-brand-gold">WhatsApp</h3>
            <p className="mt-3 text-sm text-brand-mute">Fastest way to reach us for orders &amp; support</p>
            <p className="mt-4 font-serif text-lg text-brand-cream">{WHATSAPP_DISPLAY}</p>
            <a href={`https://wa.me/${config.whatsapp_number}`} target="_blank" rel="noopener" className="btn-gold mt-6 inline-block">
              Chat on WhatsApp
            </a>
          </div>
          <div className="feature-tile group p-10!">
            <div className="feature-tile__icon">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-brand-gold">Email</h3>
            <p className="mt-3 text-sm text-brand-mute">For general inquiries</p>
            <a href={`mailto:${config.contact_email}`} className="mt-8 inline-block text-sm text-brand-gold transition hover:underline">
              {config.contact_email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
