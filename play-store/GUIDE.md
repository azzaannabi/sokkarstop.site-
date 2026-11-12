# Publier « Sokkar Stop App » sur Google Play

L'appli est une PWA (https://sokkarstop.site/app/). On la met sur Google Play sous forme de **TWA** (Trusted Web Activity) : un petit paquet Android qui ouvre l'appli web en plein écran. Conséquence pratique : **toute mise à jour du site/de l'appli est visible tout de suite**, sans republier sur Google Play (il ne faut republier que pour changer l'icône, le nom ou le paquet).

## 0. Ce qui est déjà prêt dans ce dépôt

| Besoin Google Play | Où |
|---|---|
| Politique de confidentialité (URL publique) | https://sokkarstop.site/app/confidentialite.html |
| Page de suppression de compte (URL publique, obligatoire) | https://sokkarstop.site/app/suppression-compte.html |
| Suppression de compte dans l'appli | Objectif → Compte → « Supprimer mon compte » |
| Icône 512×512 | `app/icons/icon-512.png` |
| Image de présentation 1024×500 | `play-store/feature-graphic-1024x500.png` |
| Captures d'écran téléphone 1080×1920 | `play-store/screenshots/` |
| `.nojekyll` (pour que `/.well-known/` soit servi par GitHub Pages) | racine du dépôt |
| Modèle de `assetlinks.json` | `play-store/assetlinks.template.json` |

## 1. Créer le compte développeur

1. https://play.google.com/console → connecte-toi avec un compte Google (idéalement un compte dédié à Sokkar Stop).
2. **Frais uniques : 25 USD**, par carte Visa / Mastercard / American Express (Visa Electron hors États-Unis), non remboursables. La Tunisie fait partie des pays où l'inscription développeur est possible. Il faut une carte qui accepte les paiements internationaux en dollars (carte bancaire internationale, ou carte virtuelle).
3. Type de compte : **Personnel** (le plus simple) ou **Organisation** (demande un numéro D-U-N-S ; évite l'obligation de test fermé ci-dessous mais prend plus de temps).
4. Vérification d'identité : pièce d'identité officielle + le nom sur la carte doivent correspondre. Numéro de téléphone et e-mail vérifiés.

## 2. Test fermé obligatoire (compte personnel récent)

Google exige pour les comptes personnels créés après le 13 novembre 2023 : **un test fermé avec au moins 12 testeurs inscrits en continu pendant 14 jours**, avant de demander l'accès à la production. Compte donc **environ 3 semaines** pour un premier lancement (14 jours + examen). Recrute 15 à 20 personnes avec un téléphone Android (clients, famille, amis) pour garder de la marge ; ils doivent rester inscrits sans interruption. Vérifie la règle actuelle dans la console, elle peut évoluer.

## 3. Fabriquer le paquet Android (.aab) avec PWABuilder (gratuit)

1. Va sur https://www.pwabuilder.com, entre `https://sokkarstop.site/app/`, lance l'analyse (le manifest, le service worker et les icônes sont prêts).
2. **Package for stores → Android → Google Play**. Réglages :
   - **Package ID** : par exemple `site.sokkarstop.app` (⚠️ définitif, impossible à changer ensuite).
   - App name : `Sokkar Stop App`, short name : `Sokkar Stop`.
   - Version : 1 (code de version 1), host : `sokkarstop.site`, start URL : `/app/`.
   - Laisse activées les **notifications** (délégation de notifications) pour que les rappels fonctionnent.
   - Clé de signature : « Create new » (PWABuilder la génère).
3. Télécharge le ZIP : il contient le `.aab`, la clé de signature (`signing.keystore`), son mot de passe et un `assetlinks.json`. **Sauvegarde la clé et le mot de passe à plusieurs endroits** : sans eux, tu ne peux plus mettre à jour l'appli.

## 4. Créer l'appli dans la Play Console

1. **Créer une appli** : nom « Sokkar Stop App », langue par défaut français, type Appli, **Gratuite**.
2. Active **Play App Signing** (proposé par défaut) et téléverse le `.aab` dans **Test fermé → Créer une version**.
3. **Fiche Play Store** : textes ci-dessous, icône 512, image 1024×500, au moins 2 captures (on en fournit 4).
4. **Contenu de l'appli** (menu « Politique et applications ») : voir les réponses recommandées plus bas.
5. Ajoute tes testeurs (liste d'e-mails ou Google Group), envoie-leur le lien de test.

## 5. Lier l'appli au site (Digital Asset Links) — étape indispensable

Sans cela, l'appli affiche une barre d'adresse Chrome au lieu de s'ouvrir en plein écran.

1. Dans la Play Console : **Configuration → Intégrité de l'appli → Signature de l'appli** : copie l'empreinte **SHA-256** du « certificat de clé de signature de l'appli ».
2. Prends aussi l'empreinte SHA-256 de la clé de téléversement (visible dans l'`assetlinks.json` fourni par PWABuilder).
3. Remplis `play-store/assetlinks.template.json` (ton Package ID + les deux empreintes) et enregistre-le sous **`.well-known/assetlinks.json`** à la racine du dépôt (à côté de `index.html`). Pousse sur GitHub.
4. Vérifie que https://sokkarstop.site/.well-known/assetlinks.json s'ouvre bien, puis réinstalle l'appli de test : plus de barre d'adresse.

## 6. Textes de la fiche

**Titre (30 car. max)** : `Sokkar Stop App`

**Description courte (80 car. max)** : `Compte tes calories en photo ou en texte. Objectifs, historique, tendances.`

**Description complète (FR)** :

> Sokkar Stop App compte tes calories sans prise de tête.
>
> • Photographie ton repas : l'appli estime les calories, les glucides, les protéines et les lipides.
> • Ou écris-le en quelques mots, ou ajoute-le rapidement avec son nombre de calories.
> • Corrige chaque aliment (nom, calories) et choisis ta portion : ¼, ½, 1, 1½ ou 2.
> • Calcule ton objectif de calories du jour d'après ton profil.
> • Alarme Sokkar Stop quand un repas te ferait dépasser ton objectif.
> • Calendrier avec un visage par jour, détail des repas, série de jours réussis.
> • Tendances sur 7 et 30 jours : moyenne de calories, glucides, protéines, lipides et courbe de poids.
> • Rappels de repas (facultatifs).
> • Compte gratuit (e-mail + mot de passe) pour retrouver ton historique sur un autre téléphone.
> • Français et arabe.
>
> Avec chaque flacon Sokkar Stop, 1 mois d'accès offert.
>
> Les calories sont des estimations indicatives. L'appli ne remplace pas l'avis d'un médecin ou d'un diététicien.

**Description complète (AR)** : ajoute une traduction arabe de la fiche (Fiche Play Store → Gérer les traductions). Reprends le même texte.

## 7. Réponses recommandées dans « Contenu de l'appli »

Ce sont des propositions fondées sur ce que fait réellement l'appli ; relis chaque question de la console avant de valider, les formulaires évoluent.

- **Politique de confidentialité** : `https://sokkarstop.site/app/confidentialite.html`
- **Accès à l'appli** : tout est accessible sans identifiants (le compte est facultatif).
- **Publicités** : non.
- **Public cible** : **18 ans et plus** (la fonction « image après » est réservée aux adultes ; évite aussi les règles « Familles »).
- **Classification du contenu** : questionnaire IARC, catégorie utilitaire/santé ; aucune violence, aucun contenu sensible → classification tous publics.
- **Applications de santé** : l'appli suit la nutrition et le poids : coche la déclaration correspondante, précise que ce n'est **pas un dispositif médical** et ne fait pas de diagnostic.
- **Suppression de compte** : la console demande une URL : `https://sokkarstop.site/app/suppression-compte.html` (suppression aussi possible dans l'appli).
- **Sécurité des données** (réponses proposées) :
  - Données collectées : **adresse e-mail** (compte, facultatif) ; **informations de santé et de forme** (poids, repas, calories ; sauvegardées seulement si le compte est créé) ; **photos** (repas et photo « avant », envoyées pour traitement par IA, non conservées) ; **identifiant d'appareil** (aléatoire, limitation des abus et activation du code).
  - Finalité : fonctionnement de l'appli ; gestion du compte. Pas de publicité, pas d'analyse marketing.
  - Partage : les fournisseurs techniques (Cloudflare, Google Gemini) traitent les données pour notre compte ; vérifie dans l'aide de la console si ce cas est à déclarer comme « partage ».
  - Chiffrement en transit : **oui** (HTTPS). Suppression possible par l'utilisateur : **oui**.
- **Autorisations** : notifications (rappels, facultatif), appareil photo (via le sélecteur de photo du système).

## 8. Passer en production

1. Quand les 12 testeurs sont restés 14 jours : **Tableau de bord → Demander l'accès à la production**, réponds au court questionnaire (cite les retours des testeurs et les corrections faites).
2. Examen Google (souvent quelques jours), puis **Production → Créer une version** avec le même `.aab` → publication.
3. Après la publication, modifie le site/l'appli normalement : les changements apparaissent dans l'appli Android sans nouvelle version Google Play.

## 9. Ce qu'il faut garder à l'esprit

- Google refuse les « simples sites dans une coquille ». L'appli a de vraies fonctions (analyse, comptes, rappels, hors-ligne), mentionne-les dans la fiche.
- Le mois d'accès offert fonctionne avec les codes d'activation (variable `REQUIRE_CODE` du serveur). Si tu actives l'obligation de code, prévois une explication dans la fiche (« code fourni avec le flacon ») et un moyen d'essayer l'appli pour les relecteurs de Google (par exemple un code de test fourni dans les « Instructions d'accès » de la console).
- Garde la clé de signature PWABuilder, le mot de passe et l'accès au compte Google de la console en lieu sûr.
