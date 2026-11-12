Serveur de l'appli Sokkar Stop (Cloudflare Worker).
Secrets à définir dans Cloudflare (Settings > Variables and Secrets) : ANTHROPIC_API_KEY, GEMINI_API_KEY, ADMIN_TOKEN.
Aucune clé ne doit jamais être écrite dans ce dépôt.

Comptes (e-mail + mot de passe) : route POST /account (register, login, save, load, logout, reset = mot de passe oublié avec code de récupération, recovery = nouveau code, delete = suppression du compte et de l'historique ; recovery et delete redemandent le mot de passe).
Analyse d'un repas : POST /analyze accepte une photo (`image`) ou une description en texte (`text`, 300 caractères max).
Suppression d'un compte demandée par e-mail : GET /deluser?token=ADMIN_TOKEN&email=adresse (réservé à l'administrateur).
Codes d'accès : GET /codes?token=ADMIN_TOKEN&n=10&days=30 (30 jours par défaut, variable CODE_DAYS).
Les mots de passe sont stockés hachés (PBKDF2-SHA256, 100 000 tours, sel aléatoire), jamais en clair.
L'historique (repas, poids, objectif, profil) est sauvegardé dans le même espace KV. Aucun nouveau secret n'est nécessaire.
Déploiement : depuis ce dossier, `npx wrangler deploy` (ou coller src/index.js dans l'éditeur du Worker sur Cloudflare).
Tant que le Worker n'est pas redéployé, l'appli masque simplement la section « compte ».
