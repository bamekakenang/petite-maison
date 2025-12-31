import { currentUser } from '../../../lib/auth';
import { LogoutButton } from '../../../components/auth/LogoutButton';
import Link from 'next/link';

export default async function AccountPage({ params:{locale} }:{ params:{locale:string} }) {
  const user = await currentUser();
  const orders = user ? await (await import('../../../lib/prisma')).prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }) : [];
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {!user ? (
        <div className="text-center bg-black/40 border border-white/10 p-8 rounded-2xl">
          <p className="mb-4">Vous n’êtes pas connecté.</p>
          <Link href={`/${locale}/connexion`} className="inline-block px-4 py-2 rounded-xl bg-white text-black">Se connecter</Link>
        </div>
      ) : (
        <>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span aria-hidden className="avatar-initials inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-900 via-red-600 to-black text-white font-semibold uppercase tracking-wide ring-2 ring-red-500/40 shadow-[0_0_14px_rgba(220,38,38,0.5)] text-lg">
                {(user.name || user.email).split('@')[0].split(/[_.\-\s]+/).slice(0,2).map(p=>p[0]).join('').slice(0,2).toUpperCase()}
              </span>
              <div>
                <h1 className="text-2xl font-semibold">Mon compte</h1>
                <p className="text-neutral-300">{user.name || user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
          <div id="orders" className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Mes commandes</h2>
            {orders.length === 0 ? (
              <p className="text-neutral-400 text-sm">Aucune commande pour l’instant.</p>
            ) : (
              <ul className="space-y-3">
                {orders.map(o => (
                  <li key={o.id} className="flex items-center justify-between text-sm">
                    <span>Commande #{o.id} • {new Date(o.createdAt).toLocaleDateString()} • {o.status}</span>
                    <span className="font-semibold">{(o.totalCents/100).toFixed(2)}€</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </main>
  );
}
