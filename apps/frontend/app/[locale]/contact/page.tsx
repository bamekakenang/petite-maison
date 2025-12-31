import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ContactPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('pages.contact.title')}</h1>
      <p className="text-neutral-300 mb-8">{t('pages.contact.subtitle')}</p>

      <div className="grid md:grid-cols-2 gap-8">
        <form className="bg-white text-neutral-900 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">{t('pages.contact.form.name')}</label>
            <input id="name" name="name" className="w-full border rounded-xl px-3 py-2" placeholder={t('pages.contact.form.name')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">{t('pages.contact.form.email')}</label>
            <input id="email" name="email" type="email" className="w-full border rounded-xl px-3 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="message">{t('pages.contact.form.message')}</label>
            <textarea id="message" name="message" rows={6} className="w-full border rounded-xl px-3 py-2" placeholder={t('pages.contact.form.message')} />
          </div>
          <button type="submit" className="rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800">{t('pages.contact.form.send')}</button>
        </form>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">{t('pages.contact.info.title')}</h2>
          <ul className="space-y-2 text-neutral-200">
            <li>{t('pages.contact.info.email')}: contact@petitemaison.local</li>
            <li>{t('pages.contact.info.hours')}: 10:00 - 18:00</li>
            <li>{t('pages.contact.info.address')}: 13 Rue des Chauves-Souris, Paris</li>
          </ul>
          <div className="mt-6">
            <Link href="/" className="inline-block px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10">{t('pages.contact.backHome')}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
