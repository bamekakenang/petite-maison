'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticsPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const newResults: Record<string, any> = {};

      // 1. Check NEXT_PUBLIC_API_URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      newResults['NEXT_PUBLIC_API_URL'] = {
        value: apiUrl,
        status: 'info'
      };

      // 2. Test backend health
      try {
        const healthRes = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        newResults['Backend Health'] = {
          status: healthRes.ok ? 'success' : 'error',
          code: healthRes.status,
          ok: healthRes.ok
        };
      } catch (e) {
        newResults['Backend Health'] = {
          status: 'error',
          error: e instanceof Error ? e.message : String(e)
        };
      }

      // 3. Test products endpoint
      try {
        const productsRes = await fetch(`${apiUrl}/products`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await productsRes.json();
        newResults['Backend /products'] = {
          status: productsRes.ok ? 'success' : 'error',
          code: productsRes.status,
          count: productsRes.ok ? (data.data || []).length : 0,
          ok: productsRes.ok
        };
      } catch (e) {
        newResults['Backend /products'] = {
          status: 'error',
          error: e instanceof Error ? e.message : String(e)
        };
      }

      // 4. Test cart save endpoint
      try {
        const cartRes = await fetch('/api/cart/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] })
        });
        newResults['Frontend /api/cart/save'] = {
          status: cartRes.ok ? 'success' : 'error',
          code: cartRes.status,
          ok: cartRes.ok
        };
      } catch (e) {
        newResults['Frontend /api/cart/save'] = {
          status: 'error',
          error: e instanceof Error ? e.message : String(e)
        };
      }

      // 5. Test cart load endpoint
      try {
        const loadRes = await fetch('/api/cart/load', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        newResults['Frontend /api/cart/load'] = {
          status: loadRes.ok ? 'success' : 'error',
          code: loadRes.status,
          ok: loadRes.ok
        };
      } catch (e) {
        newResults['Frontend /api/cart/load'] = {
          status: 'error',
          error: e instanceof Error ? e.message : String(e)
        };
      }

      // 6. Environment info
      newResults['Node Environment'] = {
        env: typeof window !== 'undefined' ? 'Browser' : 'Server'
      };

      setResults(newResults);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">🔍 Diagnostics en cours...</h1>
        <p className="text-neutral-600">Veuillez patienter...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">🔍 Diagnostics de Connectivité</h1>
      
      <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> Cette page teste la connexion entre le frontend et le backend.
          Les résultats vous aident à diagnostiquer les problèmes de déploiement Azure.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([key, result]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border-2 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-400'
                : result.status === 'error'
                ? 'bg-red-50 border-red-400'
                : 'bg-blue-50 border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : 'ℹ️'} {key}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  {result.status && <p><strong>Status:</strong> {result.status}</p>}
                  {result.code && <p><strong>HTTP Code:</strong> {result.code}</p>}
                  {result.count !== undefined && <p><strong>Products Found:</strong> {result.count}</p>}
                  {result.error && <p className="text-red-600"><strong>Error:</strong> {result.error}</p>}
                  {result.value && <p><strong>Value:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.value}</code></p>}
                  {result.env && <p><strong>Environment:</strong> {result.env}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-bold mb-2">🔧 Troubleshooting</h2>
        <ul className="text-sm space-y-2">
          {results['Backend Health']?.status === 'error' && (
            <>
              <li>❌ <strong>Backend Health échoue:</strong></li>
              <li className="ml-4">
                ➜ Vérifier que le backend Azure est déployé et fonctionnel
              </li>
              <li className="ml-4">
                ➜ Vérifier que NEXT_PUBLIC_API_URL pointe vers la bonne URL
              </li>
              <li className="ml-4">
                ➜ Vérifier les logs Azure Portal: petitemaison-api
              </li>
            </>
          )}
          {results['Backend /products']?.status === 'error' && (
            <>
              <li>❌ <strong>/products échoue:</strong></li>
              <li className="ml-4">
                ➜ Vérifier que le backend API est en cours d'exécution
              </li>
              <li className="ml-4">
                ➜ Vérifier CORS_ORIGIN en Configuration Backend
              </li>
            </>
          )}
          {results['Frontend /api/cart/save']?.status === 'error' && (
            <>
              <li>❌ <strong>/api/cart/save échoue:</strong></li>
              <li className="ml-4">
                ➜ Cela devrait fonctionner même sans cookies serveur
              </li>
              <li className="ml-4">
                ➜ Vérifier que NODE_ENV=production
              </li>
            </>
          )}
          {results['Backend Health']?.status === 'success' && (
            <li>✅ <strong>Backend connecté avec succès!</strong></li>
          )}
        </ul>
      </div>
    </div>
  );
}
