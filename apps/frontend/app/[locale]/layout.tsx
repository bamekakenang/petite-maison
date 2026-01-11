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
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch (error) {
    // In production/Azure, cookies() might fail during initial render
    console.error('Failed to get current user:', error);
  }
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.email;

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
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded z-50">
        Aller au contenu
      </a>
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Logo + Search Bar (Desktop) */}
          <div className="flex items-center gap-4 mb-3 lg:mb-0">
            <Link href={`/${locale}`} className="flex items-center gap-2 lg:gap-3">
              <Logo size={24} />
              <span className="text-base lg:text-lg font-semibold whitespace-nowrap">La Petite Maison</span>
            </Link>
            <form role="search" className="hidden lg:block flex-1 max-w-md ml-auto" action={`/${locale}/produits`} method="get">
              <label className="sr-only" htmlFor="q">{t('search.placeholder')}</label>
              <input id="q" name="q" placeholder={t('search.placeholder')} className="w-full border rounded-xl px-3 py-2 text-sm"/>
            </form>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2 lg:gap-3 flex-wrap">
            {/* Desktop Links */}
            <div className="hidden lg:flex gap-3">
              <Link href={`/${locale}`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm">{t('nav.home')}</Link>
              <Link href={`/${locale}/produits`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm">{t('nav.shop')}</Link>
              <Link href={`/${locale}/fanzine`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm">{t('nav.zine')}</Link>
              <Link href={`/${locale}/contact`} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm">{t('nav.contact')}</Link>
            </div>
            
            {/* Mobile Links (Abbreviated) */}
            <div className="lg:hidden flex gap-2">
              <Link href={`/${locale}/produits`} className="px-2 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-semibold" title={t('nav.shop')}>🛍️</Link>
              <Link href={`/${locale}/contact`} className="px-2 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs" title={t('nav.contact')}>✉️</Link>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              {user ? (
                <UserMenu 
                  locale={locale}
                  displayName={displayName}
                  accountLabel={t('account')}
                  ordersLabel={t('nav.orders')}
                  unsubscribeLabel={t('nav.unsubscribe')}
                  addProductLabel={t('nav.addProduct')}
                  canManageProducts={!!user}
                />
              ) : (
                <Link href={`/${locale}/connexion`} className="px-2 lg:px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs lg:text-sm">{t('nav.login')}</Link>
              )}
              <MiniCartToggle />
              <LocaleSwitcher/>
            </div>
          </nav>
          
          {/* Mobile Search */}
          <form role="search" className="lg:hidden mt-3" action={`/${locale}/produits`} method="get">
            <label className="sr-only" htmlFor="q-mobile">{t('search.placeholder')}</label>
            <input id="q-mobile" name="q" placeholder={t('search.placeholder')} className="w-full border rounded-xl px-3 py-2 text-sm"/>
          </form>
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
