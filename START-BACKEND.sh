#!/bin/bash

echo "========================================="
echo "🚀 Démarrage Backend Petite Maison"
echo "========================================="
echo ""

cd backend

echo "📦 Installation des dépendances..."
npm install

echo ""
echo "🗄️ Génération du client Prisma..."
npm run prisma:generate

echo ""
echo "🔧 Application des migrations..."
npm run prisma:migrate deploy

echo ""
echo "🌱 Peuplement de la base de données..."
npm run prisma:seed

echo ""
echo "========================================="
echo "✅ Backend prêt!"
echo "========================================="
echo ""
echo "🎯 Pour démarrer le serveur:"
echo "   npm run dev"
echo ""
echo "📝 Comptes de test:"
echo "   Admin:  admin@petitemaison.fr / password123"
echo "   Client: client@example.fr / password123"
echo ""
echo "📚 Documentation:"
echo "   README:      backend/README.md"
echo "   QuickStart:  backend/QUICKSTART.md"
echo "   Architecture: backend/ARCHITECTURE.md"
echo ""
