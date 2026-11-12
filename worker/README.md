Serveur de l'appli Sokkar Stop (Cloudflare Worker).
Secrets à définir dans Cloudflare (Settings > Variables and Secrets) : ANTHROPIC_API_KEY, GEMINI_API_KEY, ADMIN_TOKEN.
Aucune clé ne doit jamais être écrite dans ce dépôt.

Comptes (e-mail + mot de passe) : route POST /account (register, login, save, load, logout).
Les mots de passe sont stockés hachés (PBKDF2-SHA256, 100 000 tours, sel aléatoire), jamais en clair.
L'historique (repas, poids, objectif, profil) est sauvegardé dans le même espace KV. Aucun nouveau secret n'est nécessaire.
Déploiement : depuis ce dossier, `npx wrangler deploy` (ou coller src/index.js dans l'éditeur du Worker sur Cloudflare).
Tant que le Worker n'est pas redéployé, l'appli masque simplement la section « compte ».
