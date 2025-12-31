"use client";

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { currencyForLocale } from '../../lib/currency';

// Données mockées pour les numéros du fanzine
const fanzineIssues = [
  {
    id: 1,
    number: 42,
    title: "Numéro Spécial Lovecraft",
    date: "2024-10",
    description: "Plongée dans l'univers cosmique de H.P. Lovecraft",
    available: true
  },
  {
    id: 2,
    number: 41,
    title: "Cinéma Italien des Années 70",
    date: "2024-07", 
    description: "Focus sur le giallo et l'horreur italienne",
    available: true
  },
  {
    id: 3,
    number: 40,
    title: "Heroic Fantasy Moderne",
    date: "2024-04",
    description: "Les nouvelles voies de la fantasy contemporaine",
    available: true
  },
  {
    id: 4,
    number: 39,
    title: "Horreur Japonaise",
    date: "2024-01",
    description: "J-Horror: du folklore aux films modernes",
    available: false
  }
];

const subscriptionPlans = [
  {
    id: 'digital',
    type: 'digital',
    price: 24.99,
    duration: 'an',
    benefits: ['4 numéros par an', 'Version numérique', 'Accès immédiat', 'Archive complète']
  },
  {
    id: 'paper',
    type: 'paper', 
    price: 39.99,
    duration: 'an',
    benefits: ['4 numéros par an', 'Version papier premium', 'Livraison gratuite', 'Contenus exclusifs']
  },
  {
    id: 'complete',
    type: 'complete',
    price: 54.99,
    duration: 'an',
    benefits: ['4 numéros par an', 'Versions papier + numérique', 'Livraison gratuite', 'Archive complète', 'Goodies exclusifs']
  }
];

export function FanzinePageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribeToStripe(plan: typeof subscriptionPlans[0]) {
    try {
      setLoading(plan.id);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            sku: `subscription-${plan.type}`,
            title: t(`pages.fanzine.plans.${plan.type}.name`),
            price: plan.price,
            qty: 1
          }],
          currency: currencyForLocale(locale),
          locale,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });
      const data = await res.json();
      if (res.status === 401 && data?.login) {
        window.location.href = data.login;
        return;
      }
      if (!res.ok || !data?.url) throw new Error(data?.error || 'checkout_failed');
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      // Fallback: go to login then back to fanzine
      window.location.href = `/${locale}/connexion?next=/${locale}/fanzine`;
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('pages.fanzine.title')}</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-6">
          {t('pages.fanzine.description')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-500">
          <span>• {t('pages.fanzine.frequency')}</span>
          <span>• {t('pages.fanzine.since')}</span>
          <span>• {t('pages.fanzine.genres')}</span>
        </div>
      </div>

      {/* Derniers numéros */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t('pages.fanzine.latestIssues')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fanzineIssues.map(issue => (
            <article key={issue.id} className="border rounded-2xl p-4 bg-white text-neutral-900">
              <div className="aspect-[3/4] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl mb-4 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold">#{issue.number}</div>
                  <div className="text-sm opacity-75">{issue.date}</div>
                </div>
              </div>
              <h3 className="font-semibold mb-2">{issue.title}</h3>
              <p className="text-sm text-neutral-600 mb-4">{issue.description}</p>
              {issue.available ? (
                <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800">
                  {t('pages.fanzine.readOnline')}
                </button>
              ) : (
                <span className="text-sm text-neutral-400">{t('pages.fanzine.soldOut')}</span>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Plans d'abonnement */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('pages.fanzine.subscriptionTitle')}</h2>
          <p className="text-neutral-600">{t('pages.fanzine.subscriptionSubtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map(plan => (
            <div key={plan.id} className={`border-2 rounded-2xl p-6 text-neutral-900 ${
              plan.type === 'complete' 
                ? 'border-neutral-900 bg-neutral-50' 
                : 'border-neutral-200 bg-white'
            }`}>
              {plan.type === 'complete' && (
                <div className="text-center mb-4">
                  <span className="bg-neutral-900 text-white px-3 py-1 rounded-full text-sm">
                    {t('pages.fanzine.popular')}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">
                  {t(`pages.fanzine.plans.${plan.type}.name`)}
                </h3>
                <div className="text-3xl font-bold">
                  {plan.price.toFixed(2)}€
                  <span className="text-sm font-normal text-neutral-600">
                    /{t(`pages.fanzine.plans.${plan.type}.duration`)}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <button 
                disabled={loading === plan.id}
                onClick={() => subscribeToStripe(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 ${
                  plan.type === 'complete'
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {loading === plan.id ? '...' : t('pages.fanzine.subscribe')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* À propos du fanzine */}
      <section className="bg-neutral-50 rounded-2xl p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('pages.fanzine.about.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">{t('pages.fanzine.about.historyTitle')}</h3>
              <p className="text-neutral-600 mb-4">{t('pages.fanzine.about.historyText')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t('pages.fanzine.about.contentTitle')}</h3>
              <p className="text-neutral-600 mb-4">{t('pages.fanzine.about.contentText')}</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500">{t('pages.fanzine.about.team')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}