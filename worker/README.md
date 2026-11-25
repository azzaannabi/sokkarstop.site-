Serveur de l'appli Sokkar Stop (Cloudflare Worker).
Secrets à définir dans Cloudflare (Settings > Variables and Secrets) : ANTHROPIC_API_KEY, GEMINI_API_KEY, ADMIN_TOKEN.
Aucune clé ne doit jamais être écrite dans ce dépôt.

Comptes (e-mail + mot de passe) : route POST /account (register, login, save, load, logout, reset = mot de passe oublié avec code de récupération, recovery = nouveau code, delete = suppression du compte et de l'historique ; recovery et delete redemandent le mot de passe).
Analyse d'un repas : POST /analyze accepte une photo (`image`) ou une description en texte (`text`, 300 caractères max).
Suppression d'un compte demandée par e-mail : GET /deluser?email=adresse (réservé à l'administrateur). Les routes admin n'acceptent plus que l'en-tête `Authorization: Bearer ADMIN_TOKEN` (plus de `?token=` dans l'URL ; ex. `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://.../codes?n=10`).
Codes à 6 chiffres (boîte Sokkar Stop, 1 code = 2 téléphones au plus, 30 jours, 6 à 8 chiffres) : GET /pins?n=1500 (à faire une seule fois ; la liste reste sur le serveur, jamais dans le dépôt). Option `&len=8` pour des codes à 8 chiffres. Essais limités (6 par heure et par IP, 60 par heure au total). REQUIRE_CODE vaut `true` par défaut ; mets `false` seulement pour désactiver l'obligation de code. Pour les relecteurs Google/Apple, crée un code de démonstration avec /codes.
Codes d'accès longs : GET /codes?n=10&days=30 (30 jours par défaut, variable CODE_DAYS).
Les mots de passe sont stockés hachés (PBKDF2-SHA256, 100 000 tours, sel aléatoire), jamais en clair.
L'historique (repas, poids, objectif, profil) est sauvegardé dans le même espace KV. Aucun nouveau secret n'est nécessaire.
Déploiement : depuis ce dossier, `npx wrangler deploy` (ou coller src/index.js dans l'éditeur du Worker sur Cloudflare).
Tant que le Worker n'est pas redéployé, l'appli masque simplement la section « compte ».

Synchronisation : chaque appareil reçoit un jeton secret (`tk`) à son premier échange ; il est exigé pour sync, rappels et analyse. L'action sync `erase` supprime l'appareil, ses rappels et son résumé (bouton « Effacer mes données »).
