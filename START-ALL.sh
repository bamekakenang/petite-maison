#!/bin/bash

echo "========================================="
echo "🚀 Démarrage Backend + Frontend"
echo "========================================="
echo ""

# Check if tmux is available
if ! command -v tmux &> /dev/null; then
    echo "⚠️  tmux n'est pas installé. Installation avec brew..."
    brew install tmux
fi

# Kill existing sessions
tmux kill-session -t petite-maison 2>/dev/null

# Create new session
tmux new-session -d -s petite-maison -n backend

# Backend window
tmux send-keys -t petite-maison:backend "cd backend" C-m
tmux send-keys -t petite-maison:backend "echo '🔧 Démarrage Backend (port 3000)...'" C-m
tmux send-keys -t petite-maison:backend "npm run dev" C-m

# Frontend window
tmux new-window -t petite-maison -n frontend
tmux send-keys -t petite-maison:frontend "cd apps/frontend" C-m
tmux send-keys -t petite-maison:frontend "echo '🎨 Démarrage Frontend (port 3001)...'" C-m
tmux send-keys -t petite-maison:frontend "sleep 3 && npm run dev" C-m

echo ""
echo "✅ Démarrage en cours dans tmux session 'petite-maison'"
echo ""
echo "📋 Commandes utiles:"
echo "   tmux attach -t petite-maison    # Voir les logs"
echo "   Ctrl+B puis D                   # Détacher (laisser tourner)"
echo "   Ctrl+B puis W                   # Changer de fenêtre"
echo "   tmux kill-session -t petite-maison  # Arrêter tout"
echo ""
echo "🌐 URLs:"
echo "   Backend:  http://localhost:3000/api/v1/health"
echo "   Frontend: http://localhost:3001/fr"
echo ""
echo "Attaching to session in 5 seconds..."
sleep 5

tmux attach -t petite-maison
