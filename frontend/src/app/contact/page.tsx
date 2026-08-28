import { fetchConfig } from "@/lib/api";

export const metadata = {
  title: "Scentra Ryv | Contact",
  description: "Contact Scentra Ryv for orders and support. WhatsApp and email available nationwide in Pakistan.",
};

export default async function ContactPage() {
  let config = {
    whatsapp_number: "923177478167",
    contact_email: "scentraryv@gmail.com",
  };
  try {
    config = await fetchConfig();
  } catch {
    /* defaults */
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="pb-10 text-center">
          <p className="section-eyebrow">Reach Us</p>
          <h1 className="section-heading mt-3">Contact Us</h1>
          <div className="gold-divider" />
          <p className="text-brand-mute">We&apos;d love to hear from you</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="feature-tile !p-10">
            <h3 className="font-serif text-xl text-brand-gold">WhatsApp</h3>
            <p className="mt-3 text-sm text-brand-mute">Fastest way for orders & support</p>
            <p className="mt-4 font-serif text-lg text-brand-cream">+92 317 7478167</p>
            <a href={`https://wa.me/${config.whatsapp_number}`} target="_blank" rel="noopener" className="btn-gold mt-6 inline-block">
              Chat on WhatsApp
            </a>
          </div>
          <div className="feature-tile !p-10">
            <h3 className="font-serif text-xl text-brand-gold">Email</h3>
            <p className="mt-3 text-sm text-brand-mute">For general inquiries</p>
            <a href={`mailto:${config.contact_email}`} className="mt-8 inline-block text-sm text-brand-gold hover:underline">
              {config.contact_email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
