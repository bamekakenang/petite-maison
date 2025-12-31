import '../../app/globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {Locale} from '../../i18n'; // not required but ok if exists
import {LocaleSwitcher} from '../../components/LocaleSwitcher';
import {Logo} from '../../components/Logo';
import Link from 'next/link';
import { CartProvider } from '../../components/cart/CartProvider';
import { CartLink } from '../../components/cart/CartLink';
import { MiniCart } from '../../components/cart/MiniCart';
import { MiniCartToggle } from '../../components/cart/MiniCartToggle';
import { currentUser } from '../../lib/auth';
import { UserMenu } from '../../components/auth/UserMenu';

export const metadata = {
  title: 'La Petite Maison — Boutique horreur & fanzine',
  description: 'Figurines, Blu-ray, fanzine et pépites horreur sélectionnées par des passionnés.'
};

async function Header({locale}:{locale:string}){
  const t = await getTranslations();
  const user = await currentUser();

  const getInitials = (input?: string | null) => {
    if (!input) return '?';
    const str = String(input).trim();
    // If email, take the part before @
    const base = str.includes('@') ? str.split('@')[0] : str;
    const cleaned = base.replace(/[_\.-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return cleaned.slice(0, 2).toUpperCase();
  };
  
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">
        Aller au contenu
      </a>
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3 mr-auto">
            <Logo size={28} />
            <span className="text-lg font-semibold">La Petite Maison</span>
          </Link>
          <form role="search" className="hidden md:block" action={`/${locale}/recherche`}>
            <label className="sr-only" htmlFor="q">{t('search.placeholder')}</label>
            <input id="q" name="q" placeholder={t('search.placeholder')} className="w-72 border rounded-xl px-3 py-2"/>
          </form>
          <nav className="flex items-center gap-3">
            <Link href={`/${locale}`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">{t('nav.home')}</Link>
            <Link href={`/${locale}/produits`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">{t('nav.shop')}</Link>
            <Link href={`/${locale}/fanzine`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">{t('nav.zine')}</Link>
            <Link href={`/${locale}/contact`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">{t('nav.contact')}</Link>
            {user ? (
              <UserMenu 
                locale={locale}
                displayName={user.name || user.email}
                accountLabel={t('account')}
                ordersLabel={t('nav.orders')}
                unsubscribeLabel={t('nav.unsubscribe')}
              />
            ) : (
              <Link href={`/${locale}/connexion`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">{t('nav.login')}</Link>
            )}
            <MiniCartToggle />
            <LocaleSwitcher/>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer(){
  return (
    <footer className="border-t border-white/10 bg-black/30 mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-600">
        © {new Date().getFullYear()} La Petite Maison — Prototype
      </div>
    </footer>
  );
}

export default async function RootLayout({children, params:{locale}}:{children:React.ReactNode, params:{locale:string}}){
  const messages = await getMessages();
  return (
    <html lang={locale} dir={['ar'].includes(locale) ? 'rtl' : 'ltr'}>
      <body className="min-h-screen text-neutral-100 horror-film">
        <CartProvider>
          <Header locale={locale}/>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div id="content">{children}</div>
          </NextIntlClientProvider>
          <Footer />
          <MiniCart />
        </CartProvider>
      </body>
    </html>
  );
}
