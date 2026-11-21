# Publier « Sokkar Stop App » sur l'App Store (iPhone)

À lire d'abord : **Apple n'accepte pas une PWA telle quelle**. Il faut un vrai paquet iOS. Et Apple refuse souvent les « simples sites dans une coquille » (règle 4.2, fonctionnalités minimales) : l'appli doit apporter plus qu'un site (ici : photo du repas, rappels, alarme sonore, mode hors-ligne, comptes). Prévois un premier refus possible et une correction.

## 1. Ce que tu dois faire toi-même (paiement et identité)

1. **Apple Developer Program** : https://developer.apple.com/programs/enroll/ . **99 USD par an**, carte bancaire internationale. Il faut un identifiant Apple (Apple ID) avec double authentification.
2. Type de compte : **Individuel** (rapide, ton nom apparaît comme éditeur) ou **Organisation** (numéro D-U-N-S et site web, plus long, mais le nom de ta société apparaît).
3. Vérification d'identité : pièce d'identité, parfois un appel d'Apple. Compte une à deux semaines.

## 2. Il faut un Mac (ou un service de build dans le cloud)

Un paquet iOS se compile avec Xcode, qui ne tourne que sur Mac. Deux solutions :
- Un Mac à toi (ou emprunté) avec Xcode 16 ou plus récent.
- Sans Mac : un service de build cloud (Codemagic, Expo EAS, Bitrise). Je peux préparer le projet pour ça.

## 3. Fabriquer l'appli

On enveloppe l'appli web dans **Capacitor** (gratuit) :
1. Identifiant de paquet : `site.sokkarstop.app` (le même que sur Android).
2. L'appli pointe vers `https://sokkarstop.site/app/` : une mise à jour du site est visible tout de suite. Apple tolère cela tant que l'appli ne change pas de nature.
3. Plugins à ajouter pour passer la règle 4.2 : notifications locales (rappels de repas), appareil photo, retour haptique.
4. Les notifications « push » web ne marchent pas dans une coquille iOS : il faut les notifications natives (APNs). Les rappels actuels viennent du serveur ; à adapter dans un second temps.

## 4. App Store Connect

1. https://appstoreconnect.apple.com : **Mes apps, puis Nouvelle app**. Nom : « Sokkar Stop App », langue principale : français, identifiant `site.sokkarstop.app`.
2. **Captures d'écran** : Apple exige les tailles iPhone 6,9" (1320×2868) et 6,5" (1284×2778). Les captures de `play-store/screenshots/` servent de base ; je peux les régénérer aux bonnes tailles.
3. Icône 1024×1024 sans transparence (à partir de `app/icons/icon-512.png`).
4. **Confidentialité** : URL `https://sokkarstop.site/app/confidentialite.html`, plus le questionnaire « étiquettes de confidentialité » (e-mail, données de santé et forme, photos, identifiant d'appareil).
5. **Suppression de compte dans l'appli** : obligatoire pour Apple, déjà présente (Objectif, Compte).
6. **Classification d'âge** : 17+ à cause de la santé et de la nutrition (à confirmer dans le questionnaire).
7. **Compte de démonstration** pour le relecteur : si `REQUIRE_CODE` est actif, fournis un code à 6 chiffres de test dans « Informations de connexion », sinon l'appli est bloquée pour lui.

## 5. Textes de la fiche (français)

- **Nom** (30 car.) : `Sokkar Stop App`
- **Sous-titre** (30 car.) : `Compte tes glucides en photo`
- **Mots-clés** (100 car.) : `glucides,sucre,calories,régime,nutrition,diabète,photo repas,alarme,Tunisie`
- **Texte promotionnel** : `Photographie ton repas, vois tes glucides du jour et laisse l'alarme Sokkar Stop te dire stop.`
- **Description** : reprendre la description de `GUIDE.md` (section 6), sans la phrase sur le flacon si Apple la juge commerciale.
- **Avertissement santé** à garder : estimations indicatives, ne remplace pas un médecin ou un diététicien.

## 6. Points de vigilance

- **Santé** : Apple regarde de près les applis de nutrition. Pas de promesse de perte de poids garantie, pas de diagnostic. L'image « avant / après » est une simulation : garde la mention.
- **Paiement** : si un jour l'abonnement payant se fait dans l'appli, Apple impose son achat intégré (commission 15 à 30 %). Un code offert avec un produit physique (le flacon) est accepté.
- **Délais** : revue Apple 1 à 3 jours en général ; prévoir 2 à 4 semaines au total avec le compte.
