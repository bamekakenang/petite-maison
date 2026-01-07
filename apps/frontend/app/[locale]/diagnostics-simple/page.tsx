import { getTranslations } from 'next-intl/server';

export default async function DiagnosticsPage() {
  const t = await getTranslations();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">🔍 Configuration du Déploiement</h1>
      
      <div className="mb-8 p-4 bg-blue-100 border border-blue-400 rounded-lg">
        <p className="text-sm">
          <strong>ℹ️ Information:</strong> Cette page affiche la configuration serveur.
        </p>
      </div>

      <div className="space-y-4">
        {/* Configuration */}
        <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-400">
          <h3 className="font-bold text-lg">ℹ️ Configuration</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><strong>NEXT_PUBLIC_API_URL:</strong></p>
            <code className="bg-gray-100 px-2 py-1 rounded block mt-1">
              {apiUrl}
            </code>
            <p className="mt-2 text-xs text-gray-600">
              Doit pointer vers: https://petitemaison-api.azurewebsites.net/api/v1
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg border-2 bg-yellow-50 border-yellow-400">
          <h3 className="font-bold text-lg">⚠️ Tests Manuels Recommandés</h3>
          <div className="mt-2 space-y-2 text-sm">
            <p><strong>1. Tester le backend directement:</strong></p>
            <code className="bg-gray-100 px-2 py-1 rounded block text-xs mt-1">
              curl {apiUrl}/health
            </code>
            
            <p className="mt-3"><strong>2. Ouvrir la console du navigateur (F12):</strong></p>
            <p className="text-xs">Chercher les erreurs Network ou CORS</p>
            
            <p className="mt-3"><strong>3. Vérifier l'onglet Network:</strong></p>
            <p className="text-xs">Voir si les requêtes à l'API retournent 200 ou 502</p>
          </div>
        </div>

        {/* Si correct */}
        <div className="p-4 rounded-lg border-2 bg-green-50 border-green-400">
          <h3 className="font-bold text-lg">✅ Si NEXT_PUBLIC_API_URL est correct</h3>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
            <li>La boutique devrait charger les produits</li>
            <li>Le panier devrait fonctionner (fallback localStorage)</li>
            <li>Les erreurs 502 signifient que le backend Azure n'est pas accessible</li>
          </ul>
        </div>

        {/* Actions si 502 */}
        <div className="p-4 rounded-lg border-2 bg-red-50 border-red-400">
          <h3 className="font-bold text-lg">❌ Si Erreur 502 Bad Gateway</h3>
          <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
            <li>Vérifier que le backend est déployé sur Azure Portal</li>
            <li>Cliquer sur Restart sur petitemaison-api</li>
            <li>Vérifier CORS_ORIGIN = https://petitemaison-web.azurewebsites.net</li>
            <li>Attendre 2-3 minutes après redémarrage</li>
            <li>Lire le fichier FIX-502-AZURE.md du projet</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
