/* Sokkar Stop : appli de calories par photo (PWA). Aucune dépendance. */
(function () {
'use strict';

/* ======================================================================
   Outils
   ====================================================================== */
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function kgs(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }
function jget(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function uuid() {
  if (window.crypto && crypto.randomUUID) { return crypto.randomUUID(); }
  var a = new Uint8Array(16); crypto.getRandomValues(a);
  return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}
function reduceMotion() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

/* ======================================================================
   Textes
   ====================================================================== */
var T = {
  fr: {
    locale: 'fr-TN', soundOn: 'Couper le son', soundOff: 'Activer le son',
    accTitle: 'Sauvegarde ton historique', accIntro: 'Crée un compte avec ton e-mail : tes repas et tes résultats restent enregistrés et tu les retrouves sur n’importe quel téléphone.',
    accTitleW: 'Tu as déjà un compte ?', accIntroW: 'Connecte-toi pour retrouver ton historique.',
    accEmail: 'E-mail', accPass: 'Mot de passe (8 caractères minimum)', accCreate: 'Créer mon compte', accLogin: 'Me connecter', accLogout: 'Me déconnecter',
    accIn: function (e) { return 'Connecté : ' + e; }, accSynced: 'Ton historique est sauvegardé automatiquement.', accOutNote: 'Tes données restent sur ce téléphone après la déconnexion.',
    accBadEmail: 'Adresse e-mail invalide.', accWeak: 'Mot de passe trop court : 8 caractères minimum.', accExists: 'Un compte existe déjà avec cet e-mail. Touche « Me connecter ».',
    accInvalid: 'E-mail ou mot de passe incorrect.', accRate: 'Trop d’essais. Réessaie dans un moment.', accErr: 'Impossible de joindre le serveur. Réessaie plus tard.', accBusy: 'Un instant…',
    accInApp: 'Tu utilises le navigateur intégré d’une autre appli (Instagram, TikTok…) : il garde ses propres données, séparées de ton navigateur habituel. Crée un compte pour tout retrouver partout.',
    accInvite: 'Ne perds plus ton historique : crée ton compte gratuit.', accInviteBtn: 'Créer mon compte',
    histTitle: 'Détail du jour', histTap: 'Touche un jour du calendrier pour voir tes repas.',
    accForgot: 'Mot de passe oublié ?', accFTitle: 'Retrouver mon compte', accFIntro: 'Entre ton e-mail, ton code de récupération et choisis un nouveau mot de passe.',
    accRecPh: 'Code de récupération (XXXX-XXXX-XXXX)', accNewPass: 'Nouveau mot de passe (8 caractères minimum)', accFGo: 'Changer mon mot de passe', accBack: 'Retour',
    accRecBad: 'E-mail ou code de récupération incorrect.',
    recTitle: 'Note ton code de récupération', recText: 'Il te permet de retrouver ton compte si tu oublies ton mot de passe. Garde-le dans un endroit sûr (capture d’écran, papier) : il ne sera plus affiché.',
    recCopy: 'Copier', recCopied: 'Copié', recDone: 'Je l’ai noté',
    recNone: 'Tu n’as pas encore de code de récupération : génère-en un pour pouvoir retrouver ton compte si tu oublies ton mot de passe.', recGen: 'Générer un code de récupération', recNew: 'Nouveau code de récupération',
    recOld: 'Un nouveau code annule l’ancien.', accPassNow: 'Ton mot de passe actuel', accOk: 'Valider',
    delOpen: 'Supprimer mon compte', delWarn: 'Ton compte et ton historique sauvegardé seront supprimés définitivement de nos serveurs. Tes données restent sur ce téléphone tant que tu ne les supprimes pas (bouton « Effacer mes données »).', delGo: 'Supprimer définitivement', delDone: 'Ton compte a été supprimé.',
    legalPriv: 'Confidentialité', legalDel: 'Supprimer mon compte et mes données', welcomeGift: '1 mois d’accès offert avec chaque flacon Sokkar Stop.',
    txtBtn: 'Écrire mon repas', manBtn: 'Ajout rapide', txtTitle: 'Décris ton repas', txtHelp: 'Ex. : 2 briks au thon et une salade, ou un thé à la menthe avec 2 sucres.', txtPh: 'Qu’as-tu mangé ou bu ?', txtGo: 'Calculer', txtShort: 'Écris au moins un mot.',
    manTitle: 'Ajout rapide', manHelp: 'Tu connais déjà les glucides ? Entre-les directement.', manName: 'Nom (ex. : pain, jus…)', manKcal: 'Glucides (g)', manGo: 'Continuer', entryClose: 'Annuler',
    itEdit: 'Modifier', itDel: 'Retirer', itAdd: 'Ajouter un aliment', itName: 'Nom', itKcal: 'Glucides (g)', itSave: 'Valider', itBad: 'Entre un nom et des glucides entre 0 et 1 000 g.',
    manualHint: 'Glucides saisis par toi : les calories sont estimées (4 kcal par g).', textHint: 'Estimation d’après ton texte : précise les quantités pour être plus juste.', e_badtext: 'Décris ton repas avec quelques mots de plus.',
    trTitle: 'Tendances', tr7: '7 jours', tr30: '30 jours', trNone: 'Aucun repas enregistré sur cette période.', trGoal: 'Objectif', trAvg: 'Moyenne par jour sur les jours enregistrés',
    trLogged: function (n, t) { return n + ' jour' + (n > 1 ? 's' : '') + ' sur ' + t; }, trKcal: 'kcal', trCarbs: 'Glucides', trProt: 'Protéines', trFat: 'Lipides', trWeight: 'Poids',
    trChart: function (n, avg) { return 'Glucides par jour sur ' + n + ' jours, moyenne ' + avg + ' g.'; },
    // accueil / étapes
    h1a: 'Photographie ton assiette.', h1b: 'On compte tes glucides.',
    lead: 'Réponds à quelques questions : on calcule ton objectif de glucides du jour, puis tu scannes tes repas en photo.',
    pill1: 'Glucides par photo', pill2: 'Alarme Sokkar Stop', pill3: 'Avant / après',
    start: 'Commencer', next: 'Continuer', back: 'Retour',
    codeLabel: 'Code d’activation', codeHelp: 'Le code à 6 chiffres est dans la boîte Sokkar Stop. Il fonctionne sur 2 téléphones au plus (en cas de changement de téléphone).', codeBtn: 'Valider', codeChecking: 'Vérification…', codeHelpLink: 'Un problème avec ton code ? Écris-nous', codeRate: 'Trop d’essais pour le moment. Réessaie dans une heure, ou écris-nous : on t’aide tout de suite.',
    codeInvalid: 'Ce code n’est pas reconnu. Vérifie les 6 chiffres sur la carte dans la boîte.', codeUsed: 'Ce code est déjà utilisé sur un autre téléphone.',
    codeOk: function (d) { return 'Accès actif jusqu’au ' + d + '.'; }, codeNeed: 'Entre ton code pour commencer.',
    formTitle: 'Calcule ton objectif du jour',
    sexQ: 'Tu es', female: 'Une femme', male: 'Un homme',
    age: 'Âge', ageU: 'ans', weight: 'Poids', weightU: 'kg', height: 'Taille', heightU: 'cm',
    actQ: 'Ton activité',
    sed: 'Sédentaire', sedD: 'Travail de bureau, peu de marche',
    light: 'Légère', lightD: 'Marche ou sport 1 à 3 fois par semaine',
    mod: 'Modérée', modD: 'Sport 3 à 5 fois par semaine',
    high: 'Intense', highD: 'Sport presque tous les jours',
    goalQ: 'Ton but',
    lose: 'Perdre du poids', loseD: 'Environ 0,5 kg par semaine',
    keep: 'Garder mon poids', keepD: 'Rester stable',
    gain: 'Prendre du poids', gainD: 'Environ 0,25 kg par semaine',
    medNote: 'Estimation générale, pas un avis médical. Si tu es enceinte, si tu allaites, si tu as un diabète ou une autre maladie, demande conseil à ton médecin.',
    calc: 'Continuer',
    errForm: 'Complète toutes les infos avec des valeurs correctes : âge de 18 à 90 ans, poids de 40 à 250 kg, taille de 140 à 215 cm.',
    adultOnly: 'Réservé aux adultes (18 ans et plus).',
    medShort: 'Estimation générale, pas un avis médical. Si tu as un diabète, si tu es enceinte ou si tu as un trouble alimentaire, demande conseil à un professionnel de santé. Si manger te cause de l’angoisse, parles-en à un médecin.',
    goalMin: 'Minimum conseillé : 130 g par jour.',
    aiConsentTitle: 'Avant d’analyser ton repas',
    aiConsentText: 'Ta photo (ou ton texte) est envoyée à un service d’intelligence artificielle tiers (Google Gemini ou Anthropic Claude), hébergé hors de Tunisie, uniquement pour estimer les glucides. Sokkar Stop ne la conserve pas. Tu peux retirer ton accord à tout moment dans les réglages.',
    aiConsentYes: 'J’accepte', aiConsentNo: 'Annuler', aiConsentOff: 'Retirer mon accord pour l’analyse par IA',
    e_timeout: 'L’analyse prend trop de temps. Réessaie.', e_network: 'Le serveur ne répond pas. Réessaie dans un moment.',
    sExport: 'Télécharger mes données',
    pTitle: 'Ta photo du jour 1', pLead: 'Prends-toi en photo en entier, de la tête aux pieds, de face. Ce sera ton point de départ : on te rappellera de refaire la même photo après 2 semaines, 1 mois, 2 mois et 3 mois pour voir ton évolution.',
    evoT: 'Mon évolution', evoP: 'Compare tes photos : glisse le trait pour voir la différence entre ta première photo et la plus récente.',
    evoNext: 'Ta prochaine photo', evoFirst: 'Ta première photo',
    evoPriv: 'Tes photos restent uniquement sur ton téléphone. Personne d’autre n’y a accès : ni nous, ni aucun autre utilisateur, ni aucun service d’intelligence artificielle.',
    tipsT: 'Pour une comparaison fiable, à chaque fois :', tip1: 'Au même endroit (même mur, même fond).', tip2: 'Avec la même lumière et à la même heure.', tip3: 'Avec la même tenue (ou une tenue ajustée similaire), de face, pieds au même endroit.', tip4: 'Même distance du téléphone, à hauteur de poitrine, en entier de la tête aux pieds.',
    sl_d1: 'Jour 1', sl_w2: 'Après 2 semaines', sl_m1: 'Après 1 mois', sl_m2: 'Après 2 mois', sl_m3: 'Après 3 mois',
    slotAvail: function (d) { return 'À partir du ' + d; }, slotRetake: 'Refaire', slotDel: 'Supprimer', phTake: 'Prendre la photo', phDelAsk: 'Supprimer cette photo de ton téléphone ?', heroGoal: 'Cet objectif de poids est trop éloigné pour créer une image réaliste. Choisis un poids cible plus proche (2 à 25 % de différence).',
    // objectif
    gTitle: 'Ton objectif', resTitle: 'Ton objectif de glucides', perDay: 'g de glucides par jour',
    carbNote: function (p, k) { return 'C’est ' + p + ' % de ton énergie du jour (' + fmt(k) + ' kcal), dans les repères de l’OMS (45 à 75 %). L’alarme sonne quand tu dépasses cette limite.'; },
    sugarNote: function (g) { return 'Côté sucres, l’OMS conseille moins de 10 % de l’énergie en sucres libres, soit environ ' + g + ' g par jour (idéalement moins de 5 %).'; },
    adjLose: 'Pour perdre du poids, ton objectif est de 500 kcal sous ta dépense.',
    adjGain: 'Pour prendre du poids, ton objectif est de 300 kcal au-dessus de ta dépense.',
    adjKeep: 'Pour garder ton poids, ton objectif est égal à ta dépense.',
    floorNote: function (n) { return 'Objectif relevé au minimum conseillé de ' + fmt(n) + ' kcal par jour.'; },
    minorNote: 'Moins de 18 ans : objectif pour garder ton poids. Demande conseil à un médecin ou un diététicien.',
    noRoom: 'Ton poids est déjà proche du minimum sain pour ta taille : ton but devient « garder mon poids ».',
    tLose: 'Combien de kilos veux-tu perdre ?', tGain: 'Combien de kilos veux-tu prendre ?',
    tField: 'Poids visé', tHelp: 'Un objectif réaliste et sain : environ 0,5 kg perdu par semaine.',
    tHelpGain: 'Un objectif réaliste et sain : environ 0,25 kg pris par semaine.',
    tEst: function (w, d) { return 'Environ ' + w + ' semaine' + (w > 1 ? 's' : '') + ', vers ' + d + '.'; },
    tBad: function (a, b) { return 'Choisis un poids entre ' + a + ' et ' + b + ' kg.'; },
    // photo avant
    pTitle: 'Ta photo pour l’avant / après',
    pLead: 'Prends-toi en photo en entier, de la tête aux pieds, de face, avec de la lumière. On crée ton image objectif et tu verras ton avant / après à chaque ouverture.',
    pTake: 'Prendre ma photo', pPick: 'Choisir dans la galerie', pAgain: 'Changer de photo',
    pConsent: 'J’accepte que ma photo soit envoyée à un service d’intelligence artificielle pour créer mon image objectif. Elle reste enregistrée sur mon téléphone.',
    pSkip: 'Passer cette étape', pNote: 'Réservé aux adultes. L’image objectif est une simulation réaliste, pas une promesse de résultat.',
    // rappels
    rTitle: 'Active les rappels', rLead: 'Reçois un message pour penser à photographier tes repas, et un coup de pouce quand tu dépasses ton objectif.',
    rB: 'Petit-déjeuner', rBt: 'entre 8 h et 9 h', rL: 'Déjeuner', rLt: 'entre 13 h et 14 h', rD: 'Dîner', rDt: 'entre 19 h 30 et 20 h 30',
    rEnable: 'Activer les notifications', rLater: 'Plus tard', rOk: 'Notifications activées.',
    rDenied: 'Les notifications sont bloquées. Autorise-les dans les réglages du navigateur pour ce site.',
    rUnsup: 'Ce navigateur ne gère pas les notifications. Essaie avec Chrome (Android) ou Safari (iPhone).',
    rIos: 'Sur iPhone : touche le bouton Partager de Safari, puis « Sur l’écran d’accueil ». Ouvre ensuite l’appli depuis l’écran d’accueil pour activer les notifications.',
    rFail: 'Impossible d’activer les notifications pour le moment. Réessaie plus tard.',
    // accueil
    goalLabel: 'Objectif de glucides du jour', goalHelp: 'Glucides à ne pas dépasser chaque jour.', goalRec: function (n) { return 'Conseillé : ' + n + ' g'; }, save: 'Enregistrer',
    unit: 'kcal', g: 'g', of: function (n) { return 'sur ' + fmt(n) + ' g de glucides'; },
    left: function (n) { return 'Il te reste ' + fmt(n) + ' g de glucides'; },
    over: function (n) { return 'Dépassé de ' + fmt(n) + ' g de glucides. Stop pour aujourd’hui.'; },
    goalBtn: function (n) { return 'Objectif : ' + fmt(n) + ' g de glucides'; },
    carbs: 'Glucides', protein: 'Protéines', fat: 'Lipides', sugarIn: 'dont sucres', sugars: 'Sucres', sugarRef: function (n) { return 'repère : ' + n + ' g max'; }, calories: 'Calories', gCarbs: 'g de glucides', kcalInfo: function (n) { return '≈ ' + fmt(n) + ' kcal aujourd’hui'; },
    before: 'Avant', after: 'Objectif', slideHint: 'Glisse pour comparer',
    phBefore: 'Ta photo actuelle', phAfter: 'Ton objectif atteint',
    heroAddT: 'Mon avant / après', heroAddP: 'Ajoute ta photo actuelle (en pied) : on crée l’image de toi avec ton objectif atteint. Glisse le trait pour comparer.', heroAddBtn: 'Ajouter ma photo',
    heroGen: 'Création de ton image objectif…', heroGenSub: 'Cela prend environ une minute.',
    heroErr: 'L’image objectif n’a pas pu être créée.', heroErrInt: 'La création a été interrompue.', heroLimit: 'Tu as utilisé toutes tes créations d’image.',
    heroRetry: 'Réessayer', heroRegen: 'Recréer mon image objectif', heroNew: 'Changer ma photo',
    scoreT: 'Score de résultat', scoreSince: function (d) { return 'depuis ton inscription le ' + d; },
    scoreLoss: function (a, t) { return a + ' kg perdus sur ' + t + ' kg visés'; },
    scoreGain: function (a, t) { return a + ' kg pris sur ' + t + ' kg visés'; },
    scoreKeep: function (a) { return 'Écart avec ton poids de départ : ' + a + ' kg'; },
    scoreNow: 'Poids actuel', scoreGoalW: 'Poids visé',
    weighLabel: 'Mon poids aujourd’hui', weighBtn: 'Enregistrer', weighBad: 'Entre un poids entre 30 et 250 kg.', weighDone: 'Poids enregistré.',
    calT: 'Mon calendrier', legG: 'Dans ma limite', legO: 'Léger dépassement', legR: 'Dépassement', legN: 'Pas de repas',
    calDays: 'Jours réussis', calStreak: 'Série en cours', calPrev: 'Mois précédent', calNext: 'Mois suivant',
    dG: 'dans ta limite', dO: 'léger dépassement', dR: 'dépassement', dN: 'aucun repas',
    enc: function (n) { return 'Tu as dépassé de ' + fmt(n) + ' g de glucides aujourd’hui. Pas de panique : tu peux tenir le coup. Demain tu repars à zéro et tu pourras remanger ce genre de plat.'; },
    rem_b: 'C’est l’heure du petit-déjeuner : prends ton assiette en photo.',
    rem_l: 'N’oublie pas d’envoyer une photo de ton déjeuner.',
    rem_d: 'Avant ton dîner, prends-le en photo : je te dis s’il rentre dans ta limite.',
    weighBanner: 'Ça fait plus d’une semaine : mets à jour ton poids pour voir ton score.',
    // photo repas
    tabGoal: 'Objectif', tabToday: 'Aujourd’hui', tabCal: 'Calendrier',
    snap: 'Photographier mon repas', camNow: 'Choisir une photo dans la galerie',
    analyzing: 'Analyse de ton repas…', cancel: 'Annuler', retry: 'Réessayer',
    portion: 'Portion', add: 'Ajouter à ma journée',
    estimate: 'Estimation faite à partir de la photo. Ajuste la portion si besoin.',
    lowConf: 'Photo peu claire : vérifie la portion.',
    pctCustom: function (n) { return n + ' %'; },
    wOver: function (n) { return 'Ce repas dépasse ton objectif de ' + fmt(n) + ' g de glucides.'; },
    wHelp: 'Pour rester dans ta limite :',
    cQuarter: 'Un quart', cHalf: 'La moitié', cLimit: 'Rester dans ma limite', cSkip: 'Je ne le mange pas',
    logTitle: 'Mes repas du jour', empty: 'Aucun repas pour l’instant. Prends ton premier repas en photo.',
    del: 'Supprimer',
    e_notfood: 'Je ne vois pas de nourriture sur cette photo. Essaie de cadrer l’assiette.',
    e_busy: 'Trop de demandes. Réessaie dans un moment.',
    e_badimg: 'Cette photo ne peut pas être lue. Essaie une autre photo.',
    e_access: 'Ton accès est terminé. Entre un nouveau code pour continuer.',
    e_offline: 'Pas de connexion internet. Vérifie ton réseau puis réessaie.',
    e_config: 'Le service n’est pas encore configuré. Préviens Sokkar Stop.',
    e_soon: 'L’analyse photo arrive très bientôt. Ton profil est déjà enregistré.',
    e_generic: 'L’analyse a échoué. Réessaie ou prends une autre photo.',
    // alarme
    aTitle: 'Sokkar Stop',
    aProj: function (n) { return 'Ce repas te fait dépasser ton objectif de ' + fmt(n) + ' g de glucides.'; },
    aAlready: 'Tu as déjà atteint ton objectif de glucides aujourd’hui.',
    aQuarter: function (k) { return 'Un quart · ' + k + ' g'; }, aHalf: function (k) { return 'La moitié · ' + k + ' g'; },
    aLimit: function (k) { return 'Rester dans ma limite · ' + k + ' g'; },
    aFits: 'dans ta limite', aSkip: 'Je ne mange pas ça', aAll: 'Je mange tout quand même',
    aFinal: function (n) { return 'Tu as dépassé ton objectif de ' + fmt(n) + ' g de glucides. On arrête les glucides pour aujourd’hui.'; },
    aTip: 'Si l’envie de sucre est forte, utilise tes gouttes Sokkar Stop.',
    aOk: 'J’ai compris',
    // réglages
    sTitle: 'Réglages', sRem: 'Rappels', sNotif: 'Notifications', sNotifOn: 'Activées', sNotifOff: 'Désactivées',
    sRecalc: 'Recalculer avec mon profil', sInstall: 'Installer l’appli sur mon téléphone', sReset: 'Effacer mes données',
    sResetAsk: 'Appuie encore pour tout effacer', sResetNote: 'Efface ton profil, tes repas et tes photos sur ce téléphone, et tes rappels sur le serveur. Ton code d’accès reste valable.'
  },
  ar: {
    locale: 'ar-TN-u-nu-latn', soundOn: 'إيقاف الصوت', soundOff: 'تشغيل الصوت',
    accTitle: 'احفظ سجلّك', accIntro: 'أنشئ حساباً ببريدك الإلكتروني: تبقى وجباتك ونتائجك محفوظة وتجدها على أي هاتف.',
    accTitleW: 'عندك حساب؟', accIntroW: 'سجّل الدخول لاسترجاع سجلّك.',
    accEmail: 'البريد الإلكتروني', accPass: 'كلمة السر (8 أحرف على الأقل)', accCreate: 'إنشاء حسابي', accLogin: 'تسجيل الدخول', accLogout: 'تسجيل الخروج',
    accIn: function (e) { return 'متصل: ' + e; }, accSynced: 'سجلّك يُحفظ تلقائياً.', accOutNote: 'تبقى بياناتك على هذا الهاتف بعد تسجيل الخروج.',
    accBadEmail: 'بريد إلكتروني غير صالح.', accWeak: 'كلمة السر قصيرة: 8 أحرف على الأقل.', accExists: 'يوجد حساب بهذا البريد. اضغط «تسجيل الدخول».',
    accInvalid: 'البريد أو كلمة السر غير صحيحة.', accRate: 'محاولات كثيرة. أعد المحاولة بعد قليل.', accErr: 'تعذّر الاتصال بالخادم. أعد المحاولة لاحقاً.', accBusy: 'لحظة…',
    accInApp: 'أنت تستعمل المتصفح المدمج في تطبيق آخر (إنستغرام، تيك توك…): يحتفظ ببياناته بمعزل عن متصفحك المعتاد. أنشئ حساباً لتجد كل شيء في أي مكان.',
    accInvite: 'لا تفقد سجلّك بعد اليوم: أنشئ حسابك المجاني.', accInviteBtn: 'إنشاء حسابي',
    histTitle: 'تفاصيل اليوم', histTap: 'اضغط على يوم في التقويم لترى وجباته.',
    accForgot: 'نسيت كلمة السر؟', accFTitle: 'استرجاع حسابي', accFIntro: 'أدخل بريدك الإلكتروني ورمز الاسترجاع واختر كلمة سر جديدة.',
    accRecPh: 'رمز الاسترجاع (XXXX-XXXX-XXXX)', accNewPass: 'كلمة السر الجديدة (8 أحرف على الأقل)', accFGo: 'تغيير كلمة السر', accBack: 'رجوع',
    accRecBad: 'البريد أو رمز الاسترجاع غير صحيح.',
    recTitle: 'دوّن رمز الاسترجاع', recText: 'يسمح لك باسترجاع حسابك إذا نسيت كلمة السر. احفظه في مكان آمن (لقطة شاشة أو ورقة): لن يظهر مرة أخرى.',
    recCopy: 'نسخ', recCopied: 'تم النسخ', recDone: 'دوّنته',
    recNone: 'ليس لديك رمز استرجاع بعد: أنشئ واحداً لتتمكن من استرجاع حسابك إذا نسيت كلمة السر.', recGen: 'إنشاء رمز استرجاع', recNew: 'رمز استرجاع جديد',
    recOld: 'الرمز الجديد يلغي القديم.', accPassNow: 'كلمة السر الحالية', accOk: 'تأكيد',
    delOpen: 'حذف حسابي', delWarn: 'سيُحذف حسابك وسجلّك المحفوظ نهائياً من خوادمنا. تبقى بياناتك على هذا الهاتف حتى تحذفها (زر «احذف بياناتي»).', delGo: 'حذف نهائي', delDone: 'تم حذف حسابك.',
    legalPriv: 'الخصوصية', legalDel: 'حذف حسابي وبياناتي', welcomeGift: 'شهر مجاني من الاستعمال مع كل قارورة سكر ستوب.',
    txtBtn: 'اكتب وجبتك', manBtn: 'إضافة سريعة', txtTitle: 'صف وجبتك', txtHelp: 'مثال: 2 بريك بالتونة وسلطة، أو شاي بالنعناع بسكرتين.', txtPh: 'ماذا أكلت أو شربت؟', txtGo: 'احسب', txtShort: 'اكتب كلمة واحدة على الأقل.',
    manTitle: 'إضافة سريعة', manHelp: 'تعرف الكربوهيدرات؟ أدخلها مباشرة.', manName: 'الاسم (مثال: خبز، عصير…)', manKcal: 'الكربوهيدرات (غ)', manGo: 'متابعة', entryClose: 'إلغاء',
    itEdit: 'تعديل', itDel: 'إزالة', itAdd: 'إضافة صنف', itName: 'الاسم', itKcal: 'الكربوهيدرات (غ)', itSave: 'تأكيد', itBad: 'أدخل اسماً وكربوهيدرات بين 0 و1000 غ.',
    manualHint: 'كربوهيدرات أدخلتها بنفسك: السعرات تقديرية (4 سعرات لكل غرام).', textHint: 'تقدير حسب نصّك: حدّد الكميات لتكون النتيجة أدق.', e_badtext: 'صف وجبتك بكلمات أكثر قليلاً.',
    trTitle: 'الاتجاهات', tr7: '7 أيام', tr30: '30 يوماً', trNone: 'لا توجد وجبات مسجّلة في هذه الفترة.', trGoal: 'الهدف', trAvg: 'المعدل اليومي في الأيام المسجّلة',
    trLogged: function (n, t) { return n + ' من ' + t + ' يوماً'; }, trKcal: 'سعرة', trCarbs: 'كربوهيدرات', trProt: 'بروتين', trFat: 'دهون', trWeight: 'الوزن',
    trChart: function (n, avg) { return 'الكربوهيدرات اليومية خلال ' + n + ' يوماً، المعدل ' + avg + ' غ.'; },
    h1a: 'صوّر صحنك.', h1b: 'ونحسب لك الكربوهيدرات.',
    lead: 'جاوب على أسئلة قليلة ونحسبو هدفك اليومي من الكربوهيدرات، ثم صوّر وجباتك.',
    pill1: 'كربوهيدرات بالصورة', pill2: 'منبّه سكر ستوب', pill3: 'قبل / بعد',
    start: 'ابدأ', next: 'متابعة', back: 'رجوع',
    codeLabel: 'رمز التفعيل', codeHelp: 'رمز من 6 أرقام داخل علبة سكر ستوب. يعمل على هاتفين على الأكثر (في حال تغيير الهاتف).', codeBtn: 'تأكيد', codeChecking: 'جارٍ التحقق…', codeHelpLink: 'مشكلة في رمزك؟ راسلنا', codeRate: 'محاولات كثيرة حاليًا. أعد المحاولة بعد ساعة، أو راسلنا لنساعدك فورًا.',
    codeInvalid: 'هذا الرمز غير موجود. تأكد من الأرقام الستة.', codeUsed: 'هذا الرمز مستعمل على هاتف آخر.',
    codeOk: function (d) { return 'الاشتراك فعّال حتى ' + d + '.'; }, codeNeed: 'أدخل رمزك للبدء.',
    formTitle: 'احسب هدفك اليومي',
    sexQ: 'أنت', female: 'امرأة', male: 'رجل',
    age: 'العمر', ageU: 'سنة', weight: 'الوزن', weightU: 'كغ', height: 'الطول', heightU: 'سم',
    actQ: 'نشاطك',
    sed: 'خامل', sedD: 'عمل مكتبي ومشي قليل',
    light: 'خفيف', lightD: 'مشي أو رياضة من 1 إلى 3 مرات في الأسبوع',
    mod: 'متوسط', modD: 'رياضة من 3 إلى 5 مرات في الأسبوع',
    high: 'مكثف', highD: 'رياضة تقريبًا كل يوم',
    goalQ: 'هدفك',
    lose: 'خسارة الوزن', loseD: 'حوالي 0,5 كغ في الأسبوع',
    keep: 'الحفاظ على وزني', keepD: 'البقاء مستقرًا',
    gain: 'زيادة الوزن', gainD: 'حوالي 0,25 كغ في الأسبوع',
    medNote: 'تقدير عام وليس نصيحة طبية. إذا كنتِ حاملًا أو مرضعة أو لديك السكري أو أي مرض آخر، استشيري طبيبك.',
    calc: 'متابعة',
    errForm: 'أكمل كل المعلومات بقيم صحيحة: العمر من 18 إلى 90 سنة، الوزن من 40 إلى 250 كغ، الطول من 140 إلى 215 سم.',
    adultOnly: 'للبالغين فقط (18 سنة فما فوق).',
    medShort: 'تقدير عام وليس رأيًا طبيًا. إذا كان لديك سكري أو كنتِ حاملًا أو تعانين من اضطراب في الأكل، استشر مختصًا في الصحة. وإذا كان الأكل يسبب لك قلقًا، تحدث إلى طبيب.',
    goalMin: 'الحد الأدنى المنصوح به: 130 غ في اليوم.',
    aiConsentTitle: 'قبل تحليل وجبتك',
    aiConsentText: 'ترسل صورتك (أو نصك) إلى خدمة ذكاء اصطناعي خارجية (Google Gemini أو Anthropic Claude) مستضافة خارج تونس، فقط لتقدير الكربوهيدرات. لا يحتفظ بها سكر ستوب. يمكنك سحب موافقتك في أي وقت من الإعدادات.',
    aiConsentYes: 'أوافق', aiConsentNo: 'إلغاء', aiConsentOff: 'سحب موافقتي على التحليل بالذكاء الاصطناعي',
    e_timeout: 'التحليل يستغرق وقتًا طويلًا. أعد المحاولة.', e_network: 'الخادم لا يستجيب. أعد المحاولة بعد قليل.',
    sExport: 'نزّل بياناتي',
    pTitle: 'صورتك في اليوم الأول', pLead: 'صوّر نفسك كاملًا من الرأس إلى القدمين ومن الأمام. ستكون نقطة البداية: سنذكّرك بإعادة الصورة نفسها بعد أسبوعين وشهر وشهرين و3 أشهر لترى تطورك.',
    evoT: 'تطورك', evoP: 'قارن صورك: حرّك الخط لترى الفرق بين أول صورة وأحدثها.',
    evoNext: 'صورتك القادمة', evoFirst: 'أول صورة لك',
    evoPriv: 'صورك تبقى على هاتفك فقط. لا أحد غيرك يمكنه الاطلاع عليها: لا نحن ولا أي مستخدم آخر ولا أي خدمة ذكاء اصطناعي.',
    tipsT: 'للحصول على مقارنة دقيقة، في كل مرة:', tip1: 'في المكان نفسه (الجدار والخلفية نفسها).', tip2: 'بالإضاءة نفسها وفي الوقت نفسه من اليوم.', tip3: 'باللباس نفسه (أو لباس مشابه ملائم)، من الأمام وبوضعية القدمين نفسها.', tip4: 'على المسافة نفسها من الهاتف وبمستوى الصدر، كاملًا من الرأس إلى القدمين.',
    sl_d1: 'اليوم الأول', sl_w2: 'بعد أسبوعين', sl_m1: 'بعد شهر', sl_m2: 'بعد شهرين', sl_m3: 'بعد 3 أشهر',
    slotAvail: function (d) { return 'ابتداءً من ' + d; }, slotRetake: 'أعد', slotDel: 'احذف', phTake: 'التقط الصورة', phDelAsk: 'حذف هذه الصورة من هاتفك؟', heroGoal: 'هدف الوزن بعيد جدًا لإنشاء صورة واقعية. اختر وزنًا مستهدفًا أقرب (فرق من 2 إلى 25٪).',
    gTitle: 'هدفك', resTitle: 'هدفك من الكربوهيدرات', perDay: 'غ كربوهيدرات في اليوم',
    carbNote: function (p, k) { return 'هذا ' + p + '٪ من طاقتك اليومية (' + fmt(k) + ' سعرة)، ضمن توصيات منظمة الصحة العالمية (45 إلى 75٪). ينطلق المنبّه عندما تتجاوز هذا الحد.'; },
    sugarNote: function (g) { return 'بالنسبة للسكر، توصي المنظمة بأقل من 10٪ من الطاقة من السكريات الحرة، أي حوالي ' + g + ' غ في اليوم (والأفضل أقل من 5٪).'; },
    adjLose: 'لخسارة الوزن، هدفك أقل بـ 500 سعرة من إنفاقك.',
    adjGain: 'لزيادة الوزن، هدفك أكثر بـ 300 سعرة من إنفاقك.',
    adjKeep: 'للحفاظ على وزنك، هدفك يساوي إنفاقك.',
    floorNote: function (n) { return 'تم رفع الهدف إلى الحد الأدنى الموصى به: ' + fmt(n) + ' سعرة في اليوم.'; },
    minorNote: 'أقل من 18 سنة: هدف للحفاظ على الوزن. استشر طبيبًا أو أخصائي تغذية.',
    noRoom: 'وزنك قريب أصلًا من الحد الأدنى الصحي لطولك: هدفك يصبح «الحفاظ على وزني».',
    tLose: 'كم كيلو تريد أن تخسر؟', tGain: 'كم كيلو تريد أن تزيد؟',
    tField: 'الوزن المستهدف', tHelp: 'هدف واقعي وصحي: حوالي 0,5 كغ في الأسبوع.',
    tHelpGain: 'هدف واقعي وصحي: حوالي 0,25 كغ في الأسبوع.',
    tEst: function (w, d) { return 'حوالي ' + w + ' أسبوعًا، نحو ' + d + '.'; },
    tBad: function (a, b) { return 'اختر وزنًا بين ' + a + ' و ' + b + ' كغ.'; },
    pTitle: 'صورتك لـ قبل / بعد',
    pLead: 'صوّر نفسك كاملًا من الرأس إلى القدمين، من الأمام وبإضاءة جيدة. ننشئ صورة هدفك وتراها قبل / بعد كل مرة تفتح فيها التطبيق.',
    pTake: 'التقط صورتي', pPick: 'اختر من المعرض', pAgain: 'غيّر الصورة',
    pConsent: 'أوافق على إرسال صورتي إلى خدمة ذكاء اصطناعي لإنشاء صورة هدفي. تبقى الصورة محفوظة على هاتفي.',
    pSkip: 'تخطَّ هذه الخطوة', pNote: 'للبالغين فقط. صورة الهدف محاكاة واقعية وليست وعدًا بنتيجة.',
    rTitle: 'فعّل التذكيرات', rLead: 'تصلك رسالة لتتذكر تصوير وجباتك، وكلمة تشجيع عندما تتجاوز هدفك.',
    rB: 'الفطور', rBt: 'بين 8 و 9 صباحًا', rL: 'الغداء', rLt: 'بين 13 و 14', rD: 'العشاء', rDt: 'بين 19:30 و 20:30',
    rEnable: 'تفعيل الإشعارات', rLater: 'لاحقًا', rOk: 'تم تفعيل الإشعارات.',
    rDenied: 'الإشعارات محظورة. اسمح بها من إعدادات المتصفح لهذا الموقع.',
    rUnsup: 'هذا المتصفح لا يدعم الإشعارات. جرّب Chrome على أندرويد أو Safari على آيفون.',
    rIos: 'على آيفون: اضغط زر المشاركة في Safari ثم «إضافة إلى الشاشة الرئيسية». افتح التطبيق بعدها من الشاشة الرئيسية لتفعيل الإشعارات.',
    rFail: 'تعذّر تفعيل الإشعارات الآن. أعد المحاولة لاحقًا.',
    goalLabel: 'هدف الكربوهيدرات اليوم', goalHelp: 'الكربوهيدرات التي لا يجب تجاوزها كل يوم.', goalRec: function (n) { return 'المقترح: ' + n + ' غ'; }, save: 'حفظ',
    unit: 'سعرة', g: 'غ', of: function (n) { return 'من ' + fmt(n) + ' غ كربوهيدرات'; },
    left: function (n) { return 'باقي لك ' + fmt(n) + ' غ كربوهيدرات'; },
    over: function (n) { return 'تجاوزت بـ ' + fmt(n) + ' غ كربوهيدرات. قف لهذا اليوم.'; },
    goalBtn: function (n) { return 'الهدف: ' + fmt(n) + ' غ كربوهيدرات'; },
    carbs: 'كربوهيدرات', protein: 'بروتين', fat: 'دهون', sugarIn: 'منها سكر', sugars: 'السكر', sugarRef: function (n) { return 'المرجع: ' + n + ' غ كحد أقصى'; }, calories: 'السعرات', gCarbs: 'غ كربوهيدرات', kcalInfo: function (n) { return '≈ ' + fmt(n) + ' سعرة اليوم'; },
    before: 'قبل', after: 'الهدف', slideHint: 'اسحب للمقارنة',
    phBefore: 'صورتك الحالية', phAfter: 'هدفك محقّق',
    heroAddT: 'قبل / بعد', heroAddP: 'أضف صورة كاملة لك: ننشئ صورة هدفك.', heroAddBtn: 'أضف صورتي',
    heroGen: 'نصنع صورة هدفك…', heroGenSub: 'يستغرق ذلك حوالي دقيقة.',
    heroErr: 'تعذّر إنشاء صورة الهدف.', heroErrInt: 'تم إيقاف الإنشاء.', heroLimit: 'استعملت كل محاولات إنشاء الصورة.',
    heroRetry: 'أعد المحاولة', heroRegen: 'أعد إنشاء صورة هدفي', heroNew: 'غيّر صورتي',
    scoreT: 'نتيجتك', scoreSince: function (d) { return 'منذ تسجيلك يوم ' + d; },
    scoreLoss: function (a, t) { return 'خسرت ' + a + ' كغ من ' + t + ' كغ مستهدفة'; },
    scoreGain: function (a, t) { return 'زدت ' + a + ' كغ من ' + t + ' كغ مستهدفة'; },
    scoreKeep: function (a) { return 'الفارق عن وزن البداية: ' + a + ' كغ'; },
    scoreNow: 'الوزن الحالي', scoreGoalW: 'الوزن المستهدف',
    weighLabel: 'وزني اليوم', weighBtn: 'حفظ', weighBad: 'أدخل وزنًا بين 30 و 250 كغ.', weighDone: 'تم حفظ الوزن.',
    calT: 'تقويمي', legG: 'ضمن حدّي', legO: 'تجاوز خفيف', legR: 'تجاوز', legN: 'بلا وجبات',
    calDays: 'أيام ناجحة', calStreak: 'السلسلة الحالية', calPrev: 'الشهر السابق', calNext: 'الشهر التالي',
    dG: 'ضمن حدّك', dO: 'تجاوز خفيف', dR: 'تجاوز', dN: 'بلا وجبات',
    enc: function (n) { return 'تجاوزت اليوم بـ ' + fmt(n) + ' غ كربوهيدرات. لا تقلق، تقدر تصبر. غدًا تبدأ من الصفر وتقدر تأكل هذا النوع من الأكل مرة أخرى.'; },
    rem_b: 'حان وقت الفطور: صوّر صحنك.',
    rem_l: 'لا تنس إرسال صورة غدائك.',
    rem_d: 'قبل عشائك، صوّره: أقول لك إن كان يدخل في حدّك.',
    weighBanner: 'مرّ أكثر من أسبوع: حدّث وزنك لترى نتيجتك.',
    tabGoal: 'الهدف', tabToday: 'اليوم', tabCal: 'التقويم',
    snap: 'صوّر أكلك', camNow: 'اختر صورة من المعرض',
    analyzing: 'نحلّل أكلك…', cancel: 'إلغاء', retry: 'أعد المحاولة',
    portion: 'الحصة', add: 'أضف إلى يومي',
    estimate: 'تقدير مبني على الصورة. عدّل الحصة عند الحاجة.',
    lowConf: 'الصورة غير واضحة: راجع الحصة.',
    pctCustom: function (n) { return n + ' %'; },
    wOver: function (n) { return 'هذه الوجبة تتجاوز هدفك بـ ' + fmt(n) + ' غ كربوهيدرات.'; },
    wHelp: 'لتبقى ضمن حدّك:',
    cQuarter: 'الربع', cHalf: 'النصف', cLimit: 'أبقَ ضمن حدّي', cSkip: 'لن آكلها',
    logTitle: 'وجباتي اليوم', empty: 'لا توجد وجبات بعد. صوّر وجبتك الأولى.',
    del: 'حذف',
    e_notfood: 'ما نجمش نشوف أكل في هذه الصورة. حاول تصوّر الصحن بوضوح.',
    e_busy: 'طلبات كثيرة. أعد المحاولة بعد قليل.',
    e_badimg: 'لا يمكن قراءة هذه الصورة. جرّب صورة أخرى.',
    e_access: 'انتهى اشتراكك. أدخل رمزًا جديدًا للمتابعة.',
    e_offline: 'لا يوجد اتصال بالإنترنت. تحقق من الشبكة ثم أعد المحاولة.',
    e_config: 'الخدمة غير مهيأة بعد. أخبر سكر ستوب.',
    e_soon: 'تحليل الصور قادم قريباً. تم حفظ ملفك.',
    e_generic: 'فشل التحليل. أعد المحاولة أو صوّر مرة أخرى.',
    aTitle: 'سكر ستوب',
    aProj: function (n) { return 'هذه الوجبة تجعلك تتجاوز هدفك بـ ' + fmt(n) + ' غ كربوهيدرات.'; },
    aAlready: 'لقد بلغت هدفك من الكربوهيدرات اليوم.',
    aQuarter: function (k) { return 'الربع · ' + k + ' غ'; }, aHalf: function (k) { return 'النصف · ' + k + ' غ'; },
    aLimit: function (k) { return 'أبقَ ضمن حدّي · ' + k + ' غ'; },
    aFits: 'ضمن حدّك', aSkip: 'لن آكل هذا', aAll: 'سآكل كل شيء رغم ذلك',
    aFinal: function (n) { return 'تجاوزت هدفك بـ ' + fmt(n) + ' غ كربوهيدرات. كفى كربوهيدرات لهذا اليوم.'; },
    aTip: 'إذا كانت الرغبة في السكر قوية، استعمل قطرات سكر ستوب.',
    aOk: 'فهمت',
    sTitle: 'الإعدادات', sRem: 'التذكيرات', sNotif: 'الإشعارات', sNotifOn: 'مفعّلة', sNotifOff: 'غير مفعّلة',
    sRecalc: 'أعد الحساب من ملفي', sInstall: 'ثبّت التطبيق على هاتفي', sReset: 'احذف بياناتي',
    sResetAsk: 'اضغط مرة أخرى لحذف كل شيء', sResetNote: 'يحذف ملفك ووجباتك وصورك من هذا الهاتف، وتذكيراتك من الخادم. يبقى رمز الدخول صالحًا.'
  }
};

/* ======================================================================
   État
   ====================================================================== */
var KEY = 'ss2_state';
function defaults() {
  return {
    v: 2, lang: ((navigator.language || '').indexOf('ar') === 0) ? 'ar' : 'fr', sound: true, device: (jget('ss2_dev') || {}).device || uuid(),
    step: 'welcome', profile: null, goal: 2000, carbGoal: 0, dayCarbGoal: {}, consent: false,
    weights: [], meals: [], dayGoal: {}, exceeded: {}, startDate: '',
    rem: { breakfast: true, lunch: true, dinner: true }, pushOn: false,
    gen: 'none', genErr: '', genLeft: null, photoRatio: 0.75, photos: [],
    access: (jget('ss2_dev') || {}).access || { expires: null }
  };
}
var S = (function () { var d = defaults(), s = jget(KEY) || {}; for (var k in s) { d[k] = s[k]; } return d; })();
if (S.gen === 'running') { S.gen = 'error'; S.genErr = 'interrupted'; }
var mirrorT = null;
function mirrorState() { clearTimeout(mirrorT); mirrorT = setTimeout(function () { try { if (typeof idb !== 'undefined' && S.profile) { idb.set('state', JSON.stringify(S)); } } catch (e) {} }, 400); }
function save() { S.updatedAt = Date.now(); jset(KEY, S); jset('ss2_dev', { device: S.device, access: S.access }); mirrorState(); pushAcc(); }
(function prune() {
  var cut = Date.now() - 400 * 86400000;
  S.meals = (S.meals || []).filter(function (m) { return m && m.t > cut; });
})();

var CFG = { requireCode: false, vapidPublic: '', accounts: false, loaded: false };

/* ---------- compte (e-mail + mot de passe) : l'historique suit la personne ---------- */
var ACC_KEY = 'ss2_acc', ACC = jget(ACC_KEY), accMsg = '', accBusy = false, accEmailVal = '', pushT = null, applying = false;
var SYNC_FIELDS = ['lang', 'sound', 'step', 'profile', 'goal', 'carbGoal', 'weights', 'meals', 'dayGoal', 'dayCarbGoal', 'exceeded', 'startDate', 'rem', 'photoRatio'];
var IN_APP = /Instagram|FBAN|FBAV|FB_IAB|musical_ly|TikTok|BytedanceWebview|Snapchat|Line\//i.test(navigator.userAgent || '');
function accOn() { return !!(CFG.accounts && HAS_API); }
function accPost(action, data) { var b = { action: action }; for (var k in (data || {})) { b[k] = data[k]; } return post(API + 'account', b); }
function pushAcc(now) {
  if (!ACC || applying || !HAS_API) { return; }
  clearTimeout(pushT);
  pushT = setTimeout(function () {
    var st = { updatedAt: S.updatedAt || Date.now() };
    SYNC_FIELDS.forEach(function (k) { st[k] = S[k]; });
    accPost('save', { token: ACC.token, state: st }).then(function (r) { if (r.status === 401) { accDrop(); } }).catch(function () {});
  }, now ? 50 : 1500);
}
function accDrop() { ACC = null; try { localStorage.removeItem(ACC_KEY); } catch (e) {} if ($('account')) { refreshAccount(); } }
function applyRemote(rs) {
  if (!rs || typeof rs !== 'object') { return; }
  var m = {}, w = {}, k;
  (rs.meals || []).concat(S.meals || []).forEach(function (x) { if (x && x.id) { m[x.id] = x; } });
  (rs.weights || []).concat(S.weights || []).forEach(function (x) { if (x && x.d) { w[x.d] = x; } });
  var takeRemote = !!rs.profile && (!S.profile || (rs.updatedAt || 0) >= (S.updatedAt || 0));
  if (takeRemote) {
    ['lang', 'sound', 'profile', 'goal', 'carbGoal', 'startDate', 'rem', 'photoRatio'].forEach(function (f) { if (rs[f] !== undefined) { S[f] = rs[f]; } });
    if (!(rs.carbGoal > 0)) { S.carbGoal = 0; }          // ancien compte (calories seulement) : l’objectif glucides est recalculé
    S.step = 'home';
  }
  S.meals = Object.keys(m).map(function (i) { return m[i]; }).sort(function (a, b) { return a.t - b.t; });
  S.weights = Object.keys(w).map(function (i) { return w[i]; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  var dg = {}, ex = {}, dc = {};
  for (k in (rs.dayGoal || {})) { dg[k] = rs.dayGoal[k]; } for (k in (S.dayGoal || {})) { dg[k] = S.dayGoal[k]; }
  for (k in (rs.dayCarbGoal || {})) { dc[k] = rs.dayCarbGoal[k]; } for (k in (S.dayCarbGoal || {})) { dc[k] = S.dayCarbGoal[k]; }
  for (k in (rs.exceeded || {})) { ex[k] = rs.exceeded[k]; } for (k in (S.exceeded || {})) { ex[k] = S.exceeded[k]; }
  S.dayGoal = dg; S.dayCarbGoal = dc; S.exceeded = ex;
  ensureCarb();
}
function accErr(r) {
  var e = r && r.j && r.j.error;
  return e === 'bad_email' ? tx('accBadEmail') : e === 'weak_password' ? tx('accWeak') : e === 'exists' ? tx('accExists') : e === 'invalid' ? tx('accInvalid') : e === 'invalid_recovery' ? tx('accRecBad') : e === 'rate_limited' ? tx('accRate') : tx('accErr');
}
var accMode = '', accPanel = '', recShow = '', accNote = '';
function afterAuth(r, mode) {
  ACC = { email: r.j.email, token: r.j.token, hasRec: mode === 'register' || mode === 'reset' ? true : !!r.j.hasRecovery }; jset(ACC_KEY, ACC);
  recShow = r.j.recovery || '';
  if (r.j.device && r.j.device !== S.device) { S.device = r.j.device; S.pushOn = false; S.access = { expires: null }; }
  applying = true; applyRemote(r.j.state); applying = false;
  accMsg = ''; accNote = ''; accEmailVal = ''; accMode = ''; accPanel = ''; save(); pushAcc(true);
  if (CFG.requireCode) { api('status').then(function (j) { if (j && j.access) { S.access.expires = j.access.expires; save(); } }).catch(function () {}); }
  renderMain();
  if (recShow && S.step === 'home') {                 // le code de récupération est dans l'onglet Objectif : on y va
    showTab('goal');
    setTimeout(function () { var a = $('account'); if (a && a.scrollIntoView) { a.scrollIntoView({ block: 'start' }); } }, 60);
  }
}
function doAuth(mode) {
  if (accBusy) { return; }
  var em = $('accEmail'), pw = $('accPass'); if (!em || !pw) { return; }
  var email = em.value.trim().toLowerCase(), pass = pw.value; accEmailVal = email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { accMsg = tx('accBadEmail'); refreshAccount(); return; }
  if (pass.length < 8) { accMsg = tx('accWeak'); refreshAccount(); return; }
  accBusy = true; accMsg = ''; accNote = ''; refreshAccount();
  accPost(mode, { email: email, password: pass, device: S.device }).then(function (r) {
    accBusy = false;
    if (!r.ok || !r.j || !r.j.ok) { accMsg = accErr(r); refreshAccount(); return; }
    afterAuth(r, mode);
  }).catch(function () { accBusy = false; accMsg = tx('accErr'); refreshAccount(); });
}
function doForgot() {
  if (accBusy) { return; }
  var em = $('fEmail'), rc = $('fRec'), pw = $('fPass'); if (!em || !rc || !pw) { return; }
  var email = em.value.trim().toLowerCase(), rec = rc.value, pass = pw.value; accEmailVal = email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { accMsg = tx('accBadEmail'); refreshAccount(); return; }
  if (rec.replace(/[^A-Za-z0-9]/g, '').length !== 12) { accMsg = tx('accRecBad'); refreshAccount(); return; }
  if (pass.length < 8) { accMsg = tx('accWeak'); refreshAccount(); return; }
  accBusy = true; accMsg = ''; refreshAccount();
  accPost('reset', { email: email, recovery: rec, password: pass }).then(function (r) {
    accBusy = false;
    if (!r.ok || !r.j || !r.j.ok) { accMsg = accErr(r); refreshAccount(); return; }
    afterAuth(r, 'reset');
  }).catch(function () { accBusy = false; accMsg = tx('accErr'); refreshAccount(); });
}
/* actions qui redemandent le mot de passe : nouveau code de récupération, suppression du compte */
function doSecure(kind) {
  if (accBusy || !ACC) { return; }
  var pw = $('secPass'); if (!pw) { return; }
  if (pw.value.length < 8) { accMsg = tx('accInvalid'); refreshAccount(); return; }
  accBusy = true; accMsg = ''; refreshAccount();
  accPost(kind, { token: ACC.token, password: pw.value }).then(function (r) {
    accBusy = false;
    if (r.status === 401 && r.j && r.j.error === 'session') { accDrop(); accMsg = tx('accInvalid'); refreshAccount(); return; }
    if (!r.ok || !r.j || !r.j.ok) { accMsg = accErr(r); refreshAccount(); return; }
    accMsg = '';
    if (kind === 'recovery') { ACC.hasRec = true; jset(ACC_KEY, ACC); recShow = r.j.recovery || ''; accPanel = ''; refreshAccount(); return; }
    ACC = null; try { localStorage.removeItem(ACC_KEY); } catch (e) {}
    S.pushOn = false; accPanel = ''; accMode = ''; recShow = ''; accNote = tx('delDone'); save();
    renderMain();
  }).catch(function () { accBusy = false; accMsg = tx('accErr'); refreshAccount(); });
}
function accLogout() {
  if (ACC) { accPost('logout', { token: ACC.token }).catch(function () {}); }
  accDrop(); accPanel = ''; recShow = ''; renderMain();
}
function copyText(t, btn) {
  function ok() { if (btn) { btn.textContent = tx('recCopied'); } }
  function fallback() {
    try { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var done = document.execCommand('copy'); document.body.removeChild(ta); if (done) { ok(); } } catch (e) {}
  }
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok, fallback); } else { fallback(); } } catch (e) { fallback(); }
}
function legalLinks() {
  return '<p class="legal"><a href="confidentialite.html" target="_blank" rel="noopener">' + esc(tx('legalPriv')) + '</a><span aria-hidden="true"> · </span><a href="suppression-compte.html" target="_blank" rel="noopener">' + esc(tx('legalDel')) + '</a></p>';
}
function secForm(kind) {
  var del = kind === 'delete';
  return '<form class="sec" id="' + (del ? 'delForm' : 'recForm') + '" novalidate>' +
    '<p class="note">' + esc(del ? tx('delWarn') : tx('recOld')) + '</p>' +
    '<div class="inp"><input id="secPass" type="password" autocomplete="current-password" placeholder="' + esc(tx('accPassNow')) + '" dir="ltr"></div>' +
    (accMsg ? '<p class="err" role="alert">' + esc(accMsg) + '</p>' : '') + (accBusy ? '<p class="note" role="status">' + esc(tx('accBusy')) + '</p>' : '') +
    '<div class="acc-row"><button class="btn' + (del ? ' danger' : '') + '" type="submit"' + (accBusy ? ' disabled' : '') + '>' + esc(del ? tx('delGo') : tx('accOk')) + '</button>' +
    '<button class="btn ghost" type="button" data-act="acc-panel-close">' + esc(tx('entryClose')) + '</button></div></form>';
}
function accountInner(where) {
  if (!accOn()) { return ''; }
  if (recShow) {
    return '<div class="card acc rec"><h2>' + esc(tx('recTitle')) + '</h2><p class="note">' + esc(tx('recText')) + '</p><div class="rec-code" dir="ltr" translate="no">' + esc(recShow) + '</div>' +
      '<div class="acc-row"><button class="btn ghost" type="button" data-act="rec-copy">' + esc(tx('recCopy')) + '</button><button class="btn" type="button" data-act="rec-done">' + esc(tx('recDone')) + '</button></div></div>';
  }
  if (ACC) {
    return '<div class="card acc"><h2>' + esc(tx('accTitle')) + '</h2><p class="note"><b>' + esc(tx('accIn')(ACC.email)) + '</b><br>' + esc(tx('accSynced')) + '</p>' +
      '<button class="btn ghost" type="button" data-act="acc-logout" style="min-height:46px">' + esc(tx('accLogout')) + '</button><p class="note">' + esc(tx('accOutNote')) + '</p>' +
      (ACC.hasRec === false && accPanel !== 'rec' ? '<p class="note"><b>' + esc(tx('recNone')) + '</b></p>' : '') +
      (accPanel === 'rec' ? secForm('recovery') : '<button class="link" type="button" data-act="acc-rec-open">' + esc(ACC.hasRec === false ? tx('recGen') : tx('recNew')) + '</button>') +
      (accPanel === 'del' ? secForm('delete') : '<button class="link danger" type="button" data-act="acc-del-open">' + esc(tx('delOpen')) + '</button>') + '</div>';
  }
  if (accMode === 'forgot') {
    return '<form class="card acc" id="forgotForm" novalidate><h2>' + esc(tx('accFTitle')) + '</h2><p class="note">' + esc(tx('accFIntro')) + '</p>' +
      '<div class="inp"><input id="fEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="' + esc(tx('accEmail')) + '" value="' + esc(accEmailVal) + '" dir="ltr"></div>' +
      '<div class="inp"><input id="fRec" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="' + esc(tx('accRecPh')) + '" dir="ltr"></div>' +
      '<div class="inp"><input id="fPass" type="password" autocomplete="new-password" placeholder="' + esc(tx('accNewPass')) + '" dir="ltr"></div>' +
      (accMsg ? '<p class="err" role="alert">' + esc(accMsg) + '</p>' : '') + (accBusy ? '<p class="note" role="status">' + esc(tx('accBusy')) + '</p>' : '') +
      '<div class="acc-row"><button class="btn" type="submit"' + (accBusy ? ' disabled' : '') + '>' + esc(tx('accFGo')) + '</button><button class="btn ghost" type="button" data-act="acc-back">' + esc(tx('accBack')) + '</button></div></form>';
  }
  var w = where === 'welcome';
  return '<form class="card acc" id="accForm" novalidate><h2>' + esc(tx(w ? 'accTitleW' : 'accTitle')) + '</h2><p class="note">' + esc(tx(w ? 'accIntroW' : 'accIntro')) + '</p>' +
    (accNote ? '<p class="note" role="status"><b>' + esc(accNote) + '</b></p>' : '') +
    (IN_APP ? '<p class="note"><b>' + esc(tx('accInApp')) + '</b></p>' : '') +
    '<div class="inp"><input id="accEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="' + esc(tx('accEmail')) + '" value="' + esc(accEmailVal) + '" dir="ltr"></div>' +
    '<div class="inp"><input id="accPass" type="password" autocomplete="current-password" placeholder="' + esc(tx('accPass')) + '" dir="ltr"></div>' +
    (accMsg ? '<p class="err" role="alert">' + esc(accMsg) + '</p>' : '') + (accBusy ? '<p class="note" role="status">' + esc(tx('accBusy')) + '</p>' : '') +
    '<div class="acc-row"><button class="btn" type="button" data-act="acc-register"' + (accBusy ? ' disabled' : '') + '>' + esc(tx('accCreate')) + '</button>' +
    '<button class="btn ghost" type="button" data-act="acc-login"' + (accBusy ? ' disabled' : '') + '>' + esc(tx('accLogin')) + '</button></div>' +
    '<button class="link" type="button" data-act="acc-forgot">' + esc(tx('accForgot')) + '</button></form>';
}
function refreshAccount() { var el = $('account'); if (el) { el.innerHTML = accountInner(S.step === 'home' ? 'home' : 'welcome'); } }
function syncFromServer() {
  if (!ACC || !accOn()) { return; }
  accPost('load', { token: ACC.token }).then(function (r) {
    if (r.status === 401) { accDrop(); return; }
    if (!r.j || !r.j.ok) { return; }
    if (ACC && typeof r.j.hasRecovery === 'boolean' && ACC.hasRec !== r.j.hasRecovery) { ACC.hasRec = r.j.hasRecovery; jset(ACC_KEY, ACC); if ($('account')) { refreshAccount(); } }
    var before = S.meals.length;
    applying = true; applyRemote(r.j.state); applying = false;
    save(); pushAcc(true);
    if (S.step === 'home' && !cur) { refreshAll(); } else if (before !== S.meals.length || S.step === 'welcome') { renderMain(); }
  }).catch(function () {});
}
var calDay = '', trendDays = 7;
var cur = null;          // photo de repas en cours
var BODY = null;         // photo "avant" en cours de choix
var sliderPos = 50, introPlayed = false;
var calMonth = new Date(); calMonth.setDate(1);
var tab = 'today';        // onglet ouvert : goal | today | cal (on arrive sur l’objectif : avant / après)
var resetArmed = false, flash = '';
var audioCtx = null, siren = null, deferredInstall = null;

function tx(k) { var v = T[S.lang][k]; return v === undefined ? T.fr[k] : v; }

/* ---------- photos : IndexedDB ---------- */
var mem = {}, IMG = { before: null, after: null };
var idb = {
  db: null,
  open: function () {
    var self = this;
    if (self.db) { return Promise.resolve(self.db); }
    return new Promise(function (res, rej) {
      var r = indexedDB.open('ss2', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { self.db = r.result; res(self.db); };
      r.onerror = function () { rej(r.error); };
    });
  },
  get: function (k) {
    return this.open().then(function (db) {
      return new Promise(function (res, rej) { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { rej(q.error); }; });
    }).catch(function () { return null; });
  },
  set: function (k, v) {
    return this.open().then(function (db) {
      return new Promise(function (res, rej) { var tr = db.transaction('kv', 'readwrite'); tr.objectStore('kv').put(v, k); tr.oncomplete = res; tr.onerror = function () { rej(tr.error); }; });
    }).catch(function () {});
  },
  clear: function () {
    return this.open().then(function (db) {
      return new Promise(function (res) { var tr = db.transaction('kv', 'readwrite'); tr.objectStore('kv').clear(); tr.oncomplete = res; tr.onerror = res; });
    }).catch(function () {});
  }
};
function setBlobURL(k, dataURL) {
  return fetch(dataURL).then(function (r) { return r.blob(); }).then(function (b) {
    if (IMG[k] && IMG[k].indexOf('blob:') === 0) { URL.revokeObjectURL(IMG[k]); }
    IMG[k] = URL.createObjectURL(b);
  }).catch(function () { IMG[k] = dataURL; });
}
function putImage(k, dataURL) { mem[k] = dataURL; return idb.set(k, dataURL).then(function () { return setBlobURL(k, dataURL); }); }
var PURL = {}, pendingSlot = null;
var SLOTS = [['d1', 0], ['w2', 14], ['m1', 30], ['m2', 60], ['m3', 90]];
function purlSet(id, dataURL) {
  return fetch(dataURL).then(function (r) { return r.blob(); }).then(function (b) {
    if (PURL[id] && PURL[id].indexOf('blob:') === 0) { URL.revokeObjectURL(PURL[id]); }
    PURL[id] = URL.createObjectURL(b);
  }).catch(function () { PURL[id] = dataURL; });
}
function photoOf(slot) { return (S.photos || []).filter(function (p) { return p.slot === slot; })[0]; }
function loadImages() {
  S.photos = S.photos || [];
  var mig = Promise.resolve();
  if (!S.photos.length) {                      // ancienne photo « avant » : devient la photo du jour 1
    mig = idb.get('before').then(function (v) {
      if (!v) { return; }
      var id = 'm' + Date.now();
      return idb.set('ph:' + id, v).then(function () { S.photos.push({ id: id, slot: 'd1', t: Date.now(), day: S.startDate || dkey() }); save(); });
    });
  }
  return mig.then(function () { return Promise.all(S.photos.map(function (ph) { return idb.get('ph:' + ph.id).then(function (v) { if (v) { return purlSet(ph.id, v); } }); })); });
}
function addPhoto(slot, r) {
  var old = photoOf(slot), id = 'p' + Date.now();
  return idb.set('ph:' + id, r.dataURL).then(function () {
    if (old) { idb.set('ph:' + old.id, null); S.photos = S.photos.filter(function (x) { return x.id !== old.id; }); }
    S.photos.push({ id: id, slot: slot, t: Date.now(), day: dkey() });
    S.photoRatio = r.ratio; save();
    return purlSet(id, r.dataURL);
  });
}
function slotLabel(k) { return tx('sl_' + k); }
function slotDueDate(days) { var d = new Date((S.startDate || dkey()) + 'T12:00:00'); d.setDate(d.getDate() + days); return d; }
function slotDue(days) { return dkey(slotDueDate(days)) <= dkey(); }

/* ---------- réseau ---------- */
function post(url, data, keep) {
  return fetch(url, { method: 'POST', keepalive: !!keep, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); });
}
var API = (window.SS_API || '').replace(/\/?$/, '/');
var HAS_API = !!window.SS_API;
function tkv() { return (S.access && S.access.tk) || ''; }
function api(action, data, keep) {
  if (!HAS_API) { return Promise.reject({ code: 'offline' }); }
  var body = { device: S.device, tk: tkv(), action: action };
  for (var k in (data || {})) { body[k] = data[k]; }
  return post(API + 'sync.php', body, keep).then(function (r) { if (r.j && r.j.tk) { S.access = S.access || { expires: null }; S.access.tk = r.j.tk; save(); } return r.j; });
}
function ensureConfig() {
  if (CFG.loaded) { return Promise.resolve(CFG); }
  return api('config').then(function (j) { for (var k in j) { CFG[k] = j[k]; } CFG.loaded = true; return CFG; });
}

/* ======================================================================
   Calculs
   ====================================================================== */
var ACT = { sed: 1.2, light: 1.375, mod: 1.55, high: 1.725 };
function compute(p) {
  var bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  var tdee = bmr * ACT[p.act];
  var eff = p.age < 18 ? 'keep' : p.goal;
  var adj = eff === 'lose' ? -500 : eff === 'gain' ? 300 : 0;
  var floor = p.sex === 'm' ? 1500 : 1200;
  var raw = tdee + adj, target = Math.max(floor, raw);
  return { bmr: Math.round(bmr / 10) * 10, tdee: Math.round(tdee / 10) * 10, target: Math.round(target / 10) * 10, eff: eff, minor: p.age < 18, floored: raw < floor, floor: floor };
}
/* Objectif glucides : une part de l'énergie du jour, dans les repères de l'OMS (45 à 75 % de l'énergie).
   On reste dans le bas de la fourchette : 45 % pour perdre du poids, 50 % pour garder, 55 % pour prendre.
   Plancher 130 g/jour (besoin minimal du cerveau). Sucres libres : moins de 10 % de l'énergie (OMS). */
var CARB_PCT = { lose: 0.45, keep: 0.50, gain: 0.55 }, CARB_MIN = 130, CARB_MAX = 450;
function carbPlan(kcal, eff) {
  var g = clamp(Math.round(kcal * (CARB_PCT[eff] || 0.5) / 4 / 5) * 5, CARB_MIN, CARB_MAX);
  return { g: g, pct: Math.round(g * 4 / kcal * 100), sugar: Math.round(kcal * 0.10 / 4) };
}
function planNow() { return carbPlan(S.goal || 2000, S.profile ? compute(S.profile).eff : 'keep'); }
function ensureCarb() {
  if (!(S.carbGoal > 0)) { S.carbGoal = planNow().g; }      // comptes créés avant le passage aux glucides
  if (!S.dayCarbGoal) { S.dayCarbGoal = {}; }
}
ensureCarb();
function targetOptions(p) {
  var hm = p.height / 100, minW = Math.ceil(20 * hm * hm), maxW = Math.floor(29 * hm * hm), opts, lo, hi;
  if (p.goal === 'lose') {
    var maxLoss = Math.floor(Math.min(p.weight * 0.25, p.weight - minW));
    opts = [3, 5, 8, 10, 15, 20].filter(function (d) { return d <= maxLoss; });
    lo = Math.max(minW, Math.ceil(p.weight * 0.75)); hi = p.weight - 1;
    return { dir: -1, opts: opts, lo: lo, hi: hi, rate: 0.45 };
  }
  var maxGain = Math.floor(Math.min(p.weight * 0.25, maxW - p.weight));
  opts = [2, 4, 6, 8].filter(function (d) { return d <= maxGain; });
  lo = p.weight + 1; hi = Math.min(maxW, Math.floor(p.weight * 1.25));
  return { dir: 1, opts: opts, lo: lo, hi: hi, rate: 0.25 };
}
function eligiblePhoto() { var p = S.profile; return !!p && p.age >= 18 && (p.goal === 'lose' || p.goal === 'gain') && p.targetWeight && p.targetWeight !== p.startWeight; }

function todayMeals() { var k = dkey(); return S.meals.filter(function (m) { return m.day === k; }).sort(function (a, b) { return a.t - b.t; }); }
function sumMeals(list) {
  var s = { kcal: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 };
  list.forEach(function (m) { s.kcal += m.kcal; s.carbs += m.carbs; s.protein += m.protein; s.fat += m.fat; s.sugar += m.sugar; });
  return s;
}
function mealType(ts) { var h = new Date(ts).getHours(); return h < 11 ? 'b' : (h < 17 ? 'l' : 'd'); }
function nameOf(o) { return S.lang === 'ar' ? (o.ar || o.fr) : (o.fr || o.ar); }
function remaining() { return S.carbGoal - sumMeals(todayMeals()).carbs; }

function dayInfo(key) {
  var list = S.meals.filter(function (m) { return m.day === key; });
  if (!list.length) { return null; }
  var total = sumMeals(list).carbs, g = S.dayCarbGoal[key] || S.carbGoal, r = total / g;
  return { total: total, goal: g, status: r <= 1 ? 'good' : (r <= 1.15 ? 'mid' : 'bad') };
}
function calStats() {
  var good = 0, streak = 0, d = new Date(), started = S.startDate || dkey();
  for (var i = 0; i < 400; i++) {
    var k = dkey(d), inf = dayInfo(k);
    if (inf && inf.status === 'good') { good++; }
    d.setDate(d.getDate() - 1);
  }
  d = new Date();
  var first = true;
  for (var j = 0; j < 400; j++) {
    var kk = dkey(d), info = dayInfo(kk);
    if (info && info.status === 'good') { streak++; }
    else if (!(first && !info)) { break; }   // aujourd'hui sans repas ne coupe pas la série
    first = false;
    d.setDate(d.getDate() - 1);
  }
  return { good: good, streak: streak };
}
function scoreInfo() {
  var p = S.profile; if (!p || !S.weights.length) { return null; }
  var start = p.startWeight, target = p.targetWeight || start, cur_ = S.weights[S.weights.length - 1].kg, pct;
  if (Math.abs(start - target) > 0.05) { pct = Math.round(clamp((start - cur_) / (start - target), 0, 1) * 100); }
  else { pct = Math.round(clamp(100 - Math.max(0, Math.abs(cur_ - start) - 1) * 25, 0, 100)); }
  return { pct: pct, start: start, target: target, cur: cur_, delta: Math.round((start - cur_) * 10) / 10 };
}
function lastWeighAge() {
  if (!S.weights.length) { return 0; }
  var d = new Date(S.weights[S.weights.length - 1].d + 'T12:00:00');
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
function longDate(d) { try { return d.toLocaleDateString(tx('locale'), { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return dkey(d); } }

/* ======================================================================
   Icônes
   ====================================================================== */
var ICON = {
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5L6 17z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 9.5a4.5 3 0 0 1 7 0M12 9.5l1.6-1.6"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>',
  arrows: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/></svg>'
};
function face(st) {
  var c = st === 'good' ? '#3E8E5E' : st === 'mid' ? '#E08A1E' : '#C62828';
  var mouth = st === 'good' ? 'M8 14.2q4 4 8 0' : st === 'mid' ? 'M8.5 15.5h7' : 'M8 16.8q4-4.2 8 0';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="' + c + '"/><circle cx="8.6" cy="9.6" r="1.4" fill="#fff"/><circle cx="15.4" cy="9.6" r="1.4" fill="#fff"/><path d="' + mouth + '" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/></svg>';
}

/* ======================================================================
   Structure et rendu
   ====================================================================== */
var STEPS = ['welcome', 'profile', 'goal', 'remind'];
function dots(step) {
  var i = STEPS.indexOf(step), h = '<div class="dots" aria-hidden="true">';
  for (var n = 0; n < STEPS.length; n++) { h += '<i' + (n <= i ? ' class="on"' : '') + '></i>'; }
  return h + '</div>';
}

function renderStatic() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-act="setlang"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === S.lang)); });
  var sb = $('soundBtn');
  sb.setAttribute('aria-label', S.sound ? tx('soundOn') : tx('soundOff'));
  sb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/>' +
    (S.sound ? '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>') + '</svg>';
}

function renderMain() {
  renderStatic();
  var v = S.step;
  if (v !== 'home' && v !== 'photo' && !STEPS.some(function (s) { return s === v; })) { v = S.step = 'welcome'; }
  if (v === 'home' && !S.profile) { v = S.step = 'welcome'; }
  var html = v === 'welcome' ? viewWelcome() : v === 'profile' ? viewProfile() : v === 'goal' ? viewGoal() : v === 'photo' ? viewPhoto() : v === 'remind' ? viewRemind() : viewHome();
  $('main').innerHTML = html;
  if (v === 'profile') { fillForm(formDraft || S.profile); formDraft = null; }
  if (v === 'goal') { bindGoalStep(); }
  if (v === 'home') { refreshAll(); } else { renderTabbar(); }
  try { window.scrollTo(0, 0); } catch (e) {}
}
function go(step) { S.step = step; save(); renderMain(); }

/* ---------- 1. bienvenue ---------- */
function accessOk() { return !CFG.requireCode || (S.access.expires && S.access.expires * 1000 > Date.now()); }
function codeForm(msg, isErr) {
  return '<form class="panel" id="codeForm"><div class="group"><label class="q" for="codeInput">' + esc(tx('codeLabel')) + '</label>' +
    '<p class="hint">' + esc(tx('codeHelp')) + '</p>' +
    '<div class="codeform"><div class="inp"><input id="codeInput" dir="ltr" type="text" inputmode="numeric" pattern="[0-9 ]*" autocomplete="one-time-code" maxlength="7" placeholder="000 000" aria-describedby="codeMsg" autofocus></div>' +
    '<button class="btn" id="codeBtn" type="submit" disabled>' + esc(tx('codeBtn')) + '</button></div>' +
    '<p class="' + (isErr ? 'err' : 'note') + '" id="codeMsg" role="alert" aria-live="polite">' + (msg ? esc(msg) : '') + '</p>' +
    '<p class="hint"><a href="mailto:sokkarstop@gmail.com?subject=Code%20Sokkar%20Stop">' + esc(tx('codeHelpLink')) + '</a></p></div></form>';
}
function viewWelcome() {
  var need = CFG.requireCode && !accessOk();
  var ok = CFG.requireCode && accessOk() ? '<p class="note">' + esc(tx('codeOk')(longDate(new Date(S.access.expires * 1000)))) + '</p>' : '';
  return '<div class="view">' + dots('welcome') +
    '<div class="hero"><h1>' + esc(tx('h1a')) + '<em>' + esc(tx('h1b')) + '</em></h1><p class="lead">' + esc(tx('lead')) + '</p>' +
    '<ul class="pills"><li>' + esc(tx('pill1')) + '</li><li>' + esc(tx('pill2')) + '</li><li>' + esc(tx('pill3')) + '</li></ul><p class="gift">' + esc(tx('welcomeGift')) + '</p></div>' +
    (need ? codeForm(flash, true) : ok) +
    '<button class="btn big" type="button" data-act="welcome-next"' + (need ? ' disabled' : '') + '>' + esc(tx('start')) + '</button>' +
    '<div id="account">' + accountInner('welcome') + '</div>' + legalLinks() + '</div>';
}

/* ---------- 2. profil ---------- */
function opt(name, val, title, desc, checked) {
  return '<label class="opt"><input type="radio" name="' + name + '" value="' + val + '"' + (checked ? ' checked' : '') + '><span class="opt-body"><b>' + esc(title) + '</b>' + (desc ? '<small>' + esc(desc) + '</small>' : '') + '</span></label>';
}
function viewProfile() {
  return '<div class="view">' + dots('profile') + '<form class="panel" id="profileForm" novalidate><h2>' + esc(tx('formTitle')) + '</h2>' +
    '<div class="group"><div class="q" id="qSex">' + esc(tx('sexQ')) + '</div><div class="seg" role="radiogroup" aria-labelledby="qSex">' +
    opt('sex', 'f', tx('female'), '', false) + opt('sex', 'm', tx('male'), '', false) + '</div></div>' +
    '<div class="fields">' +
    '<div class="field"><label for="pfAge">' + esc(tx('age')) + '</label><div class="inp"><input id="pfAge" type="number" inputmode="numeric" min="18" max="90" autocomplete="off"><span class="u">' + esc(tx('ageU')) + '</span></div></div>' +
    '<div class="field"><label for="pfWeight">' + esc(tx('weight')) + '</label><div class="inp"><input id="pfWeight" type="number" inputmode="decimal" min="40" max="250" step="0.1" autocomplete="off"><span class="u">' + esc(tx('weightU')) + '</span></div></div>' +
    '<div class="field"><label for="pfHeight">' + esc(tx('height')) + '</label><div class="inp"><input id="pfHeight" type="number" inputmode="numeric" min="140" max="215" autocomplete="off"><span class="u">' + esc(tx('heightU')) + '</span></div></div></div>' +
    '<div class="group"><div class="q" id="qAct">' + esc(tx('actQ')) + '</div><div class="stack" role="radiogroup" aria-labelledby="qAct">' +
    opt('act', 'sed', tx('sed'), tx('sedD'), false) + opt('act', 'light', tx('light'), tx('lightD'), true) + opt('act', 'mod', tx('mod'), tx('modD'), false) + opt('act', 'high', tx('high'), tx('highD'), false) + '</div></div>' +
    '<div class="group"><div class="q" id="qGoal">' + esc(tx('goalQ')) + '</div><div class="stack" role="radiogroup" aria-labelledby="qGoal">' +
    opt('goal', 'lose', tx('lose'), tx('loseD'), false) + opt('goal', 'keep', tx('keep'), tx('keepD'), false) + opt('goal', 'gain', tx('gain'), tx('gainD'), false) + '</div></div>' +
    '<p class="err" id="formErr" role="alert" hidden></p><p class="note"><b>' + esc(tx('adultOnly')) + '</b> ' + esc(tx('medNote')) + '</p>' +
    '<button class="btn big" type="submit">' + esc(tx('calc')) + '</button></form>' +
    (S.startDate ? '<button class="link" type="button" data-act="to-home">' + esc(tx('back')) + '</button>' : '') + '</div>';
}
var formDraft = null;
function stashForm() {
  if (!$('pfAge')) { return; }
  function g(n) { var r = document.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  formDraft = { sex: g('sex'), act: g('act'), goal: g('goal'), age: $('pfAge').value, weight: $('pfWeight').value, height: $('pfHeight').value };
}
function fillForm(p) {
  if (!p) { return; }
  $('pfAge').value = p.age; $('pfWeight').value = p.weight; $('pfHeight').value = p.height;
  ['sex', 'act', 'goal'].forEach(function (n) { var r = document.querySelector('input[name="' + n + '"][value="' + p[n] + '"]'); if (r) { r.checked = true; } });
}
function readForm() {
  function checked(n) { var r = document.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  return { sex: checked('sex'), act: checked('act'), goal: checked('goal'), age: Math.round(Number($('pfAge').value)), weight: Math.round(Number($('pfWeight').value) * 10) / 10, height: Math.round(Number($('pfHeight').value)) };
}
function validProfile(p) {
  return (p.sex === 'f' || p.sex === 'm') && ACT[p.act] && (p.goal === 'lose' || p.goal === 'keep' || p.goal === 'gain') &&
    p.age >= 18 && p.age <= 90 && p.weight >= 40 && p.weight <= 250 && p.height >= 140 && p.height <= 215;
}
function submitProfile() {
  var p = readForm(), fe = $('formErr');
  if (!validProfile(p)) { fe.textContent = tx('errForm'); fe.hidden = false; return; }
  fe.hidden = true;
  var old = S.profile;
  p.startWeight = old && S.startDate && old.goal === p.goal ? old.startWeight : p.weight;
  p.forcedKeep = false;
  if (p.age < 18) { p.goal = 'keep'; }
  if (p.goal !== 'keep' && !targetOptions(p).opts.length) { p.goal = 'keep'; p.forcedKeep = true; }
  p.targetWeight = (old && S.startDate && old.goal === p.goal && old.targetWeight) ? old.targetWeight : p.weight;
  if (p.goal === 'keep') { p.targetWeight = p.startWeight; }
  S.profile = p;
  if (S.startDate && p.weight !== (S.weights.length ? S.weights[S.weights.length - 1].kg : 0)) { addWeight(p.weight); }
  save();
  go('goal');
}

/* ---------- 3. objectif ---------- */
function viewGoal() {
  var p = S.profile, r = compute(p), cp = carbPlan(r.target, r.eff), notes = [tx('carbNote')(cp.pct, r.target), tx('sugarNote')(cp.sugar)];
  if (r.minor) { notes.push(tx('minorNote')); } else if (p.forcedKeep) { notes.push(tx('noRoom')); } else { notes.push(tx(r.eff === 'lose' ? 'adjLose' : r.eff === 'gain' ? 'adjGain' : 'adjKeep')); }
  if (r.floored) { notes.push(tx('floorNote')(r.floor)); }
  var h = '<div class="view">' + dots('goal') + '<div class="res-card"><div class="res-title">' + esc(tx('resTitle')) + '</div><div class="res-num">' + fmt(cp.g) + '</div><div class="res-title">' + esc(tx('perDay')) + '</div></div>' +
    '<div>' + notes.map(function (n) { return '<p class="note">' + esc(n) + '</p>'; }).join('') + '</div>';
  if (p.goal === 'lose' || p.goal === 'gain') {
    var o = targetOptions(p), dir = o.dir;
    var cur_ = Math.round(Math.abs(p.targetWeight - p.startWeight));
    h += '<form class="panel" id="targetForm"><h2>' + esc(tx(p.goal === 'lose' ? 'tLose' : 'tGain')) + '</h2><div class="chips" id="tChips">' +
      o.opts.map(function (d) { return '<button type="button" class="chip" data-act="t-chip" data-v="' + (Math.round((p.weight + dir * d) * 10) / 10) + '" aria-pressed="false">' + (dir < 0 ? '−' : '+') + d + ' kg</button>'; }).join('') + '</div>' +
      '<div class="field"><label for="tInput">' + esc(tx('tField')) + '</label><div class="inp"><input id="tInput" type="number" inputmode="decimal" step="0.1" min="' + o.lo + '" max="' + o.hi + '"><span class="u">kg</span></div></div>' +
      '<p class="est" id="tEst" aria-live="polite"></p><p class="note" id="tHelp">' + esc(tx(p.goal === 'lose' ? 'tHelp' : 'tHelpGain')) + '</p>' +
      '<p class="err" id="tErr" role="alert" hidden></p><button class="btn big" type="submit">' + esc(tx('next')) + '</button></form>';
  } else {
    h += '<button class="btn big" type="button" data-act="goal-next">' + esc(tx('next')) + '</button>';
  }
  return h + '<button class="link" type="button" data-act="to-profile">' + esc(tx('back')) + '</button></div>';
}
function bindGoalStep() {
  var p = S.profile;
  if (p.goal === 'keep') { return; }
  var o = targetOptions(p);
  var def = (p.targetWeight && p.targetWeight !== p.startWeight && p.targetWeight >= o.lo && p.targetWeight <= o.hi) ? p.targetWeight : (p.weight + o.dir * o.opts[Math.min(1, o.opts.length - 1)]);
  setTarget(def);
  $('tInput').addEventListener('input', function () { var v = parseFloat(this.value.replace(',', '.')); if (isFinite(v)) { setTarget(v, true); } });
}
function setTarget(w, fromInput) {
  var p = S.profile, o = targetOptions(p);
  w = Math.round(w * 10) / 10;
  if (!fromInput) { $('tInput').value = w; }
  var ok = w >= o.lo && w <= o.hi;
  $('tErr').hidden = ok; $('tErr').textContent = ok ? '' : tx('tBad')(o.lo, o.hi);
  document.querySelectorAll('#tChips .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(Number(c.getAttribute('data-v')) === w)); });
  if (ok) {
    p.targetWeight = w;
    var diff = Math.abs(w - p.weight), weeks = Math.max(1, Math.ceil(diff / o.rate)), d = new Date(Date.now() + weeks * 7 * 86400000);
    var when = d.toLocaleDateString(tx('locale'), { month: 'long', year: 'numeric' });
    $('tEst').textContent = tx('tEst')(weeks, when);
  } else { $('tEst').textContent = ''; }
}
function afterGoal() {
  var c = compute(S.profile);
  S.goal = c.target; S.carbGoal = carbPlan(c.target, c.eff).g;
  if (S.dayCarbGoal[dkey()]) { S.dayCarbGoal[dkey()] = S.carbGoal; }
  if (S.startDate) {                       // recalcul depuis l'accueil
    save();
    go('home'); syncState(); return;
  }
  save();
  go('remind');
}

/* ---------- 4. photo avant ---------- */
function viewPhoto() {
  var prev = BODY ? BODY.dataURL : '';
  var h = '<div class="view"><div class="hero"><h1 style="font-size:1.9rem">' + esc(tx('pTitle')) + '</h1><p class="lead">' + esc(tx('pLead')) + '</p></div>';
  h += '<div class="panel">' + (prev ? '<img class="photo-prev" src="' + prev + '" alt="">' : '') + tipsHTML() +
    '<div class="upload"><button type="button" class="snap" data-act="body-cam">' + ICON.camera + '<span>' + esc(prev ? tx('pAgain') : tx('pTake')) + '</span></button>' +
    '<button type="button" class="link" data-act="body-pick">' + esc(tx('pPick')) + '</button></div>' +
    '<p class="note">' + esc(tx('evoPriv')) + '</p>' +
    '<button class="btn big" type="button" data-act="photo-next" id="photoNext"' + (prev ? '' : ' disabled') + '>' + esc(tx('next')) + '</button></div>' +
    '<button class="link" type="button" data-act="photo-skip">' + esc(tx('pSkip')) + '</button></div>';
  return h;
}
function tipsHTML() {
  return '<div class="tips"><b>' + esc(tx('tipsT')) + '</b><ul><li>' + esc(tx('tip1')) + '</li><li>' + esc(tx('tip2')) + '</li><li>' + esc(tx('tip3')) + '</li><li>' + esc(tx('tip4')) + '</li></ul></div>';
}
function onBodyFile(input) {
  var f = input.files && input.files[0]; input.value = '';
  if (!f) { return; }
  shrink(f, 1280, 0.86).then(function (r) {
    if (pendingSlot && S.step === 'home') { var sl = pendingSlot; pendingSlot = null; return addPhoto(sl, r).then(function () { refreshHero(); }); }
    BODY = r; renderMain();
  }).catch(function () {});
}

/* ---------- 5. rappels ---------- */
function notifState() {
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (ios && !standalone) { return 'ios'; }
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) { return 'unsupported'; }
  if (Notification.permission === 'denied') { return 'denied'; }
  return 'ready';
}
function switchRow(act, key, title, sub, on) {
  return '<div class="switch-row"><span>' + esc(title) + '<small>' + esc(sub) + '</small></span><label class="switch"><input type="checkbox" data-act="' + act + '" data-k="' + key + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(title) + '"><i></i></label></div>';
}
function remindRows() {
  return switchRow('rem-toggle', 'breakfast', tx('rB'), tx('rBt'), S.rem.breakfast) + switchRow('rem-toggle', 'lunch', tx('rL'), tx('rLt'), S.rem.lunch) + switchRow('rem-toggle', 'dinner', tx('rD'), tx('rDt'), S.rem.dinner);
}
function notifMsg(st) {
  return st === 'ios' ? tx('rIos') : st === 'unsupported' ? tx('rUnsup') : st === 'denied' ? tx('rDenied') : '';
}
function viewRemind() {
  var st = notifState(), msg = flash || notifMsg(st);
  return '<div class="view">' + dots('remind') + '<div class="hero"><h1 style="font-size:1.9rem">' + esc(tx('rTitle')) + '</h1><p class="lead">' + esc(tx('rLead')) + '</p></div>' +
    '<div class="panel"><div>' + remindRows() + '</div>' + (msg ? '<p class="note" role="status">' + esc(msg) + '</p>' : '') +
    (st === 'ready' ? '<button class="btn big" type="button" data-act="notif-enable" data-from="onboarding">' + esc(tx('rEnable')) + '</button>' : '') +
    '<button class="' + (st === 'ready' ? 'link' : 'btn big') + '" type="button" data-act="finish">' + esc(st === 'ready' ? tx('rLater') : tx('start')) + '</button></div></div>';
}
function b64uToBytes(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) { s += '='; } var raw = atob(s), a = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) { a[i] = raw.charCodeAt(i); } return a; }
function prefsPayload() { return { on: !!S.pushOn, breakfast: !!S.rem.breakfast, lunch: !!S.rem.lunch, dinner: !!S.rem.dinner }; }
function enableNotifications() {
  var st = notifState();
  if (st !== 'ready') { return Promise.resolve(st); }
  return Promise.resolve(Notification.requestPermission()).then(function (perm) {
    if (perm !== 'granted') { return 'denied'; }
    return Promise.all([navigator.serviceWorker.ready, ensureConfig()]).then(function (x) {
      var reg = x[0], key = b64uToBytes(x[1].vapidPublic);
      return reg.pushManager.getSubscription().then(function (sub) {
        return sub || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }).catch(function () {
          return reg.pushManager.getSubscription().then(function (s) { return s ? s.unsubscribe() : null; }).then(function () { return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }); });
        });
      }).then(function (sub) {
        S.pushOn = true; save();
        return api('register', { subscription: sub.toJSON(), lang: S.lang, prefs: prefsPayload() });
      }).then(function (j) {
        if (j && j.error) { S.pushOn = false; save(); return 'fail'; }
        syncState(true); return 'ok';
      });
    });
  }).catch(function () { return 'fail'; });
}
var syncT = null;
function syncState(now) {
  if (!S.pushOn) { return; }
  clearTimeout(syncT);
  syncT = setTimeout(function () {
    var k = dkey(), list = todayMeals(), by = { b: false, l: false, d: false };
    list.forEach(function (m) { by[m.type || mealType(m.t)] = true; });
    var ex = Object.keys(S.exceeded).sort().pop() || '';
    api('state', { date: k, total: sumMeals(list).carbs, goal: S.carbGoal, count: list.length, byType: by, exceededAt: S.exceeded[k] || 0, lastExceededDate: ex, lang: S.lang, prefs: prefsPayload() }).catch(function () {});
  }, now ? 50 : 800);
}
function finishOnboarding() {
  S.startDate = dkey();
  S.weights = [{ d: S.startDate, kg: S.profile.startWeight }];
  S.step = 'home';
  var chain = BODY ? addPhoto('d1', BODY).then(function () { BODY = null; }) : Promise.resolve();
  chain.then(function () { save(); renderMain(); });
}

/* ---------- accueil ---------- */
function viewHome() {
  return '<div class="view pane" id="pane-goal"><div id="hero"></div><div id="settings"></div></div>' +
    '<div class="view pane" id="pane-today"><div id="capture" class="capture"></div><div id="day" class="view"></div><div id="meals" class="log"></div><div id="banners"></div></div>' +
    '<div class="view pane" id="pane-cal"><div id="cal"></div></div>';
}
var TABICON = {
  goal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>'
};
function renderTabbar() {
  var nav = $('tabbar'); if (!nav) { return; }
  var on = S.step === 'home' && !!S.profile;
  nav.hidden = !on; document.body.classList.toggle('has-tabs', on);
  if (!on) { return; }
  function t(id, icon, label, big) { return '<button type="button" class="tab' + (big ? ' big' : '') + '" data-act="tab" data-v="' + id + '" aria-pressed="' + (tab === id) + '"' + (tab === id ? ' aria-current="page"' : '') + '><span class="ic">' + icon + '</span><span class="lb">' + esc(label) + '</span></button>'; }
  nav.innerHTML = t('goal', TABICON.goal, tx('tabGoal')) + t('today', ICON.camera, tx('tabToday'), true) + t('cal', TABICON.cal, tx('tabCal'));
}
function showTab(id) {
  tab = id;
  ['goal', 'today', 'cal'].forEach(function (k) { var el = $('pane-' + k); if (el) { el.hidden = k !== id; } });
  renderTabbar();
  try { window.scrollTo(0, 0); } catch (e) {}
}
function refreshAll() { showTab(tab); refreshHero(); refreshBanners(); refreshDay(); renderCapture(); refreshMeals(); refreshCal(); refreshSettings(); }

/* avant / après + score */
function refreshHero() {
  var el = $('hero'); if (!el) { return; }
  var r = S.photoRatio ? clamp(S.photoRatio, 0.55, 1.2) : 0.75, h = '';
  var list = SLOTS.map(function (sl) { return photoOf(sl[0]); }).filter(function (x) { return x && PURL[x.id]; });
  function side(cls, src, text) { return src ? '<img class="' + cls + '" src="' + src + '" alt="">' : '<div class="' + cls + ' ph"><span>' + esc(text) + '</span></div>'; }
  var first = list[0], last = list.length > 1 ? list[list.length - 1] : null;
  h += '<div class="card pad-sm"><h2>' + esc(tx('evoT')) + '</h2><p class="hint">' + esc(tx('evoP')) + '</p></div>';
  h += '<div class="ba" id="ba" style="aspect-ratio:' + r + '">' + side('after', last ? PURL[last.id] : '', tx('evoNext')) + side('before', first ? PURL[first.id] : '', tx('evoFirst')) +
    '<span class="tag l">' + esc(first ? slotLabel(first.slot) : tx('before')) + '</span><span class="tag r">' + esc(last ? slotLabel(last.slot) : tx('after')) + '</span><div class="line"></div>' +
    '<div class="knob" id="knob" role="slider" tabindex="0" aria-label="' + esc(tx('slideHint')) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' + ICON.arrows + '</div></div>';
  h += '<div class="slots">' + SLOTS.map(function (sl) {
    var ph = photoOf(sl[0]), due = slotDue(sl[1]), k = sl[0];
    var thumb = ph && PURL[ph.id] ? '<img src="' + PURL[ph.id] + '" alt="' + esc(slotLabel(k)) + '">' : '<div class="empty" aria-hidden="true">+</div>';
    var date = ph ? longDate(new Date(ph.t)) : (due ? '' : tx('slotAvail')(longDate(slotDueDate(sl[1]))));
    var acts = '';
    if (ph) { acts = '<button type="button" class="link" data-act="ph-cam" data-v="' + k + '">' + esc(tx('slotRetake')) + '</button><button type="button" class="link" data-act="ph-del" data-v="' + k + '">' + esc(tx('slotDel')) + '</button>'; }
    else if (due) { acts = '<button type="button" class="btn ghost sm" data-act="ph-cam" data-v="' + k + '">' + esc(tx('phTake')) + '</button><button type="button" class="link" data-act="ph-pick" data-v="' + k + '">' + esc(tx('pPick')) + '</button>'; }
    return '<div class="slot' + (due || ph ? '' : ' wait') + '">' + thumb + '<b>' + esc(slotLabel(k)) + '</b><small>' + esc(date) + '</small>' + acts + '</div>';
  }).join('') + '</div>';
  h += '<div class="card pad-sm">' + tipsHTML() + '<p class="note"><b>' + esc(tx('evoPriv')) + '</b></p></div>';
  el.innerHTML = h + scoreHTML();
  bindSlider();
}
function scoreHTML() {
  var sc = scoreInfo(); if (!sc) { return ''; }
  var p = S.profile, meta;
  if (p.goal === 'lose') { meta = tx('scoreLoss')(kgs(Math.max(0, sc.delta)), kgs(Math.abs(sc.start - sc.target))); }
  else if (p.goal === 'gain') { meta = tx('scoreGain')(kgs(Math.max(0, -sc.delta)), kgs(Math.abs(sc.start - sc.target))); }
  else { meta = tx('scoreKeep')(kgs(Math.abs(sc.delta))); }
  return '<div class="card score"><div class="score-top"><div><div class="lbl">' + esc(tx('scoreT')) + '</div><div class="score-num">' + sc.pct + '<small>%</small></div></div>' +
    '<div class="score-meta">' + esc(kgs(sc.cur)) + ' kg<span>' + esc(tx('scoreNow')) + '</span></div></div>' +
    '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + sc.pct + '" aria-label="' + esc(tx('scoreT')) + '"><i style="width:' + sc.pct + '%"></i></div>' +
    '<p class="hint">' + esc(meta) + ' · ' + esc(tx('scoreSince')(longDate(new Date(S.startDate + 'T12:00:00')))) + '</p>' +
    '<form id="weighForm"><label class="hint" for="weighInput" style="display:block;margin-bottom:6px;font-weight:700">' + esc(tx('weighLabel')) + '</label><div class="weigh"><div class="inp"><input id="weighInput" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="' + esc(kgs(sc.cur)) + '"><span class="u">kg</span></div>' +
    '<button class="btn" type="submit">' + esc(tx('weighBtn')) + '</button></div><p class="note" id="weighMsg" role="status"></p></form></div>';
}
function addWeight(kg) {
  var k = dkey();
  S.weights = S.weights.filter(function (w) { return w.d !== k; });
  S.weights.push({ d: k, kg: kg });
  S.weights.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  if (S.profile) { S.profile.weight = kg; }
  save();
}
function bindSlider() {
  var box = $('ba'), knob = $('knob'); if (!box || !knob) { return; }
  var dragging = false;
  function setPos(p) { sliderPos = clamp(p, 3, 97); box.style.setProperty('--pos', sliderPos + '%'); knob.setAttribute('aria-valuenow', String(Math.round(sliderPos))); }
  function fromEvent(e) { var r = box.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); }
  box.addEventListener('pointerdown', function (e) { dragging = true; try { box.setPointerCapture(e.pointerId); } catch (x) {} fromEvent(e); });
  box.addEventListener('pointermove', function (e) { if (dragging) { fromEvent(e); } });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { box.addEventListener(n, function () { dragging = false; }); });
  knob.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { setPos(sliderPos - 5); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { setPos(sliderPos + 5); e.preventDefault(); }
    else if (e.key === 'Home') { setPos(3); e.preventDefault(); }
    else if (e.key === 'End') { setPos(97); e.preventDefault(); }
  });
  setPos(sliderPos);
  if (!introPlayed && !reduceMotion()) {
    introPlayed = true;
    var t0 = null, dur = 1700;
    var step = function (t) {
      if (dragging) { return; }
      if (t0 === null) { t0 = t; }
      var k = Math.min(1, (t - t0) / dur), v = 50 + Math.sin(k * Math.PI * 2) * 24 * (1 - k * 0.2);
      setPos(v);
      if (k < 1) { requestAnimationFrame(step); } else { setPos(50); }
    };
    requestAnimationFrame(step);
  }
}

/* bannières */
function bannersHTML() {
  var h = '', key = dkey(), ex = S.exceeded[key], now = new Date(), min = now.getHours() * 60 + now.getMinutes();
  if (ex) {
    var over = sumMeals(todayMeals()).carbs - S.carbGoal;
    if (over > 0) { return '<div class="banner enc">' + ICON.heart + '<p>' + esc(tx('enc')(over)) + '</p></div>'; }
  }
  var by = { b: false, l: false, d: false };
  todayMeals().forEach(function (m) { by[m.type || mealType(m.t)] = true; });
  var slots = [['b', 8 * 60, 10 * 60], ['l', 13 * 60, 15 * 60], ['d', 19 * 60 + 30, 21 * 60 + 30]];
  var names = { b: 'breakfast', l: 'lunch', d: 'dinner' };
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i];
    if (min >= s[1] && min < s[2] && !by[s[0]] && S.rem[names[s[0]]]) { return '<div class="banner remind">' + ICON.bell + '<p>' + esc(tx('rem_' + s[0])) + '</p></div>'; }
  }
  if (S.weights.length && lastWeighAge() >= 7) { h = '<div class="banner info">' + ICON.scale + '<p>' + esc(tx('weighBanner')) + '</p></div>'; }
  if (accOn() && !ACC && S.meals.length) {
    h += '<div class="banner info"><div><p>' + esc(tx('accInvite')) + '</p><button class="btn" type="button" data-act="acc-go" style="min-height:44px;margin-top:10px">' + esc(tx('accInviteBtn')) + '</button></div></div>';
  }
  return h;
}
function refreshBanners() { var el = $('banners'); if (el) { el.innerHTML = bannersHTML(); } }

/* jauge du jour */
function refreshDay() {
  var el = $('day'); if (!el) { return; }
  var s = sumMeals(todayMeals()), goal = S.carbGoal, ratio = goal ? s.carbs / goal : 0, u = tx('g'), pl = planNow();
  var cls = ratio > 1 ? ' bad' : (ratio >= 0.85 ? ' warn' : '');
  var open = $('goalPanel') && !$('goalPanel').hidden;
  function tile(c, label, v, extra) { return '<div class="tile ' + c + '"><div class="lbl">' + esc(label) + '</div><div class="val">' + v + '<small>' + u + '</small></div>' + (extra ? '<div class="sg">' + esc(extra) + '</div>' : '') + '</div>'; }
  var date = ''; try { var d = new Date().toLocaleDateString(tx('locale'), { weekday: 'long', day: 'numeric', month: 'long' }); date = d.charAt(0).toUpperCase() + d.slice(1); } catch (e) {}
  el.innerHTML = '<p class="date">' + esc(date) + '</p>' +
    '<div class="gauge' + cls + '" id="gauge" aria-live="polite"><div class="ring-wrap"><svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><circle class="track" cx="110" cy="110" r="88"/>' +
    '<circle class="prog" cx="110" cy="110" r="88" stroke-dasharray="552.92" stroke-dashoffset="' + (552.92 * (1 - Math.min(ratio, 1))) + '" transform="rotate(-90 110 110)"/></svg>' +
    '<div class="ring-center"><div class="num">' + fmt(s.carbs) + '</div><div class="sub">' + esc(tx('of')(goal)) + '</div></div></div>' +
    '<p class="remain">' + esc(ratio > 1 ? tx('over')(s.carbs - goal) : tx('left')(goal - s.carbs)) + '</p>' +
    '<p class="kcal-line">' + esc(tx('kcalInfo')(s.kcal)) + '</p>' +
    '<button class="goal-btn" type="button" data-act="goal-toggle" aria-expanded="' + open + '" aria-controls="goalPanel">' + ICON.pencil + '<span>' + esc(tx('goalBtn')(goal)) + '</span></button>' +
    '<form class="goal-panel" id="goalPanel"' + (open ? '' : ' hidden') + '><label for="goalInput">' + esc(tx('goalLabel')) + '</label><p class="hint">' + esc(tx('goalHelp') + ' ' + tx('goalMin')) + '</p>' +
    '<div class="chips">' + [pl.g].concat([150, 200, 250, 300].filter(function (n) { return n !== pl.g; })).map(function (n, i) { return '<button type="button" class="chip" data-act="goal-chip" data-v="' + n + '" aria-pressed="' + (n === goal) + '">' + (i === 0 ? esc(tx('goalRec')(n)) : n) + '</button>'; }).join('') + '</div>' +
    '<div class="goal-row"><input id="goalInput" type="number" inputmode="numeric" min="130" max="600" step="5" value="' + goal + '"><button class="btn" type="submit">' + esc(tx('save')) + '</button></div></form></div>' +
    '<div class="macros">' + tile('c', tx('sugars'), s.sugar, tx('sugarRef')(pl.sugar)) + tile('p', tx('protein'), s.protein, '') + tile('f', tx('fat'), s.fat, '') + '</div>' +
    '<p class="note med-note">' + esc(tx('medShort')) + '</p>';
}

/* repas du jour */
function refreshMeals() {
  var el = $('meals'); if (!el) { return; }
  var list = todayMeals();
  el.innerHTML = '<h2>' + esc(tx('logTitle')) + '</h2>' + (list.length ? '<ul>' + list.map(function (m) {
    var d = new Date(m.t);
    return '<li class="meal"><span class="time">' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</span><span class="nm">' + esc(nameOf(m)) + '</span><span class="kc">' + m.carbs + ' ' + tx('g') + '</span>' +
      '<button type="button" class="del" data-act="del" data-id="' + esc(m.id) + '" aria-label="' + esc(tx('del')) + '">&times;</button></li>';
  }).join('') + '</ul>' : '<p class="empty">' + esc(tx('empty')) + '</p>');
}

/* calendrier */
function refreshCal() {
  var el = $('cal'); if (!el) { return; }
  var loc = tx('locale'), y = calMonth.getFullYear(), m = calMonth.getMonth(), today = dkey();
  var first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  var title = ''; try { title = calMonth.toLocaleDateString(loc, { month: 'long', year: 'numeric' }); } catch (e) {}
  var wd = '';
  for (var i = 0; i < 7; i++) { var dd = new Date(2026, 0, 5 + i); var w = ''; try { w = dd.toLocaleDateString(loc, { weekday: 'narrow' }); } catch (e) { w = ''; } wd += '<div class="wd" aria-hidden="true">' + esc(w) + '</div>'; }
  var cells = '';
  for (var b = 0; b < lead; b++) { cells += '<div></div>'; }
  var names = { good: tx('dG'), mid: tx('dO'), bad: tx('dR') };
  var selDay = '';
  if (calDay && calDay.slice(0, 7) === y + '-' + pad(m + 1) && dayInfo(calDay)) { selDay = calDay; }
  else { for (var q = days; q >= 1; q--) { var qk = y + '-' + pad(m + 1) + '-' + pad(q); if (qk <= today && dayInfo(qk)) { selDay = qk; break; } } }
  for (var d = 1; d <= days; d++) {
    var key = y + '-' + pad(m + 1) + '-' + pad(d), inf = dayInfo(key), cls = 'cal-cell' + (key === today ? ' today' : '') + (key > today ? ' future' : '');
    var label = d + ' ' + title.split(' ')[0] + ' : ' + (inf ? names[inf.status] : tx('dN'));
    if (inf) { cells += '<button type="button" class="' + cls + ' has' + (key === selDay ? ' sel' : '') + '" data-act="cal-day" data-k="' + key + '" aria-label="' + esc(label) + '"><span class="d">' + d + '</span>' + face(inf.status) + '</button>'; }
    else { cells += '<div class="' + cls + '" role="img" aria-label="' + esc(label) + '"><span class="d">' + d + '</span><span class="dot"></span></div>'; }
  }
  var nowM = new Date(); var isCurrent = calMonth.getFullYear() === nowM.getFullYear() && calMonth.getMonth() === nowM.getMonth();
  var st = calStats();
  el.innerHTML = '<div class="card"><div class="cal-head"><h2>' + esc(title) + '</h2><div class="cal-nav"><button type="button" data-act="cal-prev" aria-label="' + esc(tx('calPrev')) + '">' + ICON.chevL + '</button>' +
    '<button type="button" data-act="cal-next" aria-label="' + esc(tx('calNext')) + '"' + (isCurrent ? ' disabled' : '') + '>' + ICON.chevR + '</button></div></div>' +
    '<div class="cal-grid">' + wd + cells + '</div>' +
    '<div class="legend"><span>' + face('good') + esc(tx('legG')) + '</span><span>' + face('mid') + esc(tx('legO')) + '</span><span>' + face('bad') + esc(tx('legR')) + '</span></div>' +
    '<div class="cal-stats"><div><b>' + st.good + '</b>' + esc(tx('calDays')) + '</div><div><b>' + st.streak + '</b>' + esc(tx('calStreak')) + '</div></div></div>' + dayDetail(selDay) + trendsHTML();
}

/* tendances : calories par jour (7 ou 30 jours), moyennes, courbe de poids */
function trendsHTML() {
  var n = trendDays, loc = tx('locale'), days = [], d = new Date(), i;
  d.setHours(12, 0, 0, 0);
  for (i = 0; i < n; i++) {
    var key = dkey(d), list = S.meals.filter(function (m) { return m.day === key; });
    days.unshift({ k: key, date: new Date(d.getTime()), inf: dayInfo(key), sum: sumMeals(list), has: list.length > 0 });
    d.setDate(d.getDate() - 1);
  }
  var logged = days.filter(function (x) { return x.has; }), cnt = logged.length;
  var head = '<div class="tr-head"><h2>' + esc(tx('trTitle')) + '</h2><div class="seg-tr" role="group" aria-label="' + esc(tx('trTitle')) + '">' +
    '<button type="button" data-act="trend" data-v="7" aria-pressed="' + (n === 7) + '">' + esc(tx('tr7')) + '</button><button type="button" data-act="trend" data-v="30" aria-pressed="' + (n === 30) + '">' + esc(tx('tr30')) + '</button></div></div>';
  if (!cnt) { return '<div class="card tr" style="margin-top:14px">' + head + '<p class="note">' + esc(tx('trNone')) + '</p>' + weightTrend() + '</div>'; }
  var tot = { kcal: 0, carbs: 0, protein: 0, fat: 0 };
  logged.forEach(function (x) { tot.kcal += x.sum.kcal; tot.carbs += x.sum.carbs; tot.protein += x.sum.protein; tot.fat += x.sum.fat; });
  var avg = { kcal: Math.round(tot.kcal / cnt), carbs: Math.round(tot.carbs / cnt), protein: Math.round(tot.protein / cnt), fat: Math.round(tot.fat / cnt) };
  var W = 320, H = 150, top = 12, base = 118, mx = S.carbGoal * 1.25;
  logged.forEach(function (x) { if (x.sum.carbs * 1.08 > mx) { mx = x.sum.carbs * 1.08; } });
  var slot = W / n, bw = Math.max(4, slot * (n === 7 ? 0.56 : 0.64)), svg = '';
  function yOf(v) { return base - (v / mx) * (base - top); }
  days.forEach(function (x, idx) {
    var cx = idx * slot + slot / 2;
    if (x.has) {
      var y = yOf(x.sum.carbs), col = x.inf.status === 'good' ? 'var(--ok)' : (x.inf.status === 'mid' ? 'var(--warn)' : 'var(--bad)');
      svg += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(2, base - y).toFixed(1) + '" rx="3" style="fill:' + col + '"/>';
    } else {
      svg += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + (base - 3) + '" width="' + bw.toFixed(1) + '" height="3" rx="1.5" style="fill:var(--line)"/>';
    }
    if (n === 7) {
      var wd = ''; try { wd = x.date.toLocaleDateString(loc, { weekday: 'narrow' }); } catch (e) { wd = ''; }
      svg += '<text x="' + cx.toFixed(1) + '" y="' + (base + 18) + '" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">' + esc(wd) + '</text>';
    }
  });
  if (n === 30) {
    [0, 14, 29].forEach(function (idx) { var x = days[idx]; svg += '<text x="' + (idx === 0 ? 2 : idx === 29 ? W - 2 : idx * slot + slot / 2).toFixed(1) + '" y="' + (base + 18) + '" text-anchor="' + (idx === 0 ? 'start' : idx === 29 ? 'end' : 'middle') + '" style="fill:var(--muted);font-size:11px;font-weight:700">' + x.date.getDate() + '/' + (x.date.getMonth() + 1) + '</text>'; });
  }
  var gy = yOf(S.carbGoal);
  svg += '<line x1="0" x2="' + W + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke-dasharray="5 4" style="stroke:var(--ink);stroke-width:1.2;opacity:.55"/>';
  var u = tx('unit'), gg = tx('g');
  return '<div class="card tr" style="margin-top:14px">' + head +
    '<svg class="tr-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(tx('trChart')(n, avg.carbs)) + '" dir="ltr">' + svg + '</svg>' +
    '<p class="note tr-key"><i aria-hidden="true"></i>' + esc(tx('trGoal')) + ' : ' + fmt(S.carbGoal) + ' ' + esc(gg) + ' · ' + esc(tx('trLogged')(cnt, n)) + '</p>' +
    '<p class="note">' + esc(tx('trAvg')) + '</p>' +
    '<div class="tr-stats"><div><b>' + avg.carbs + ' ' + esc(tx('g')) + '</b>' + esc(tx('trCarbs')) + '</div><div><b>' + fmt(avg.kcal) + '</b>' + esc(u) + '</div><div><b>' + avg.protein + ' ' + esc(tx('g')) + '</b>' + esc(tx('trProt')) + '</div><div><b>' + avg.fat + ' ' + esc(tx('g')) + '</b>' + esc(tx('trFat')) + '</div></div>' +
    weightTrend() + '</div>';
}
function weightTrend() {
  var w = (S.weights || []).slice(-12);
  if (w.length < 2) { return ''; }
  var lo = Infinity, hi = -Infinity, k;
  w.forEach(function (x) { if (x.kg < lo) { lo = x.kg; } if (x.kg > hi) { hi = x.kg; } });
  lo -= 0.5; hi += 0.5;
  var W = 320, H = 70, pts = w.map(function (x, i) { return [(6 + (W - 12) * i / (w.length - 1)), 8 + (H - 16) * (1 - (x.kg - lo) / (hi - lo))]; });
  var line = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), last = pts[pts.length - 1];
  var first = w[0].kg, end = w[w.length - 1].kg, delta = Math.round((end - first) * 10) / 10;
  return '<div class="tr-weight"><div class="tr-wh"><b>' + esc(tx('trWeight')) + '</b><span dir="ltr">' + first + ' → ' + end + ' kg (' + (delta > 0 ? '+' : '') + delta + ')</span></div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(tx('trWeight') + ' ' + first + ' → ' + end + ' kg') + '" dir="ltr"><polyline points="' + line + '" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--accent);stroke-width:2.5"/>' +
    '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="4.5" style="fill:var(--accent)"/></svg></div>';
}
function dayDetail(key) {
  if (!key) { return '<p class="note" style="text-align:center;margin-top:12px">' + esc(tx('histTap')) + '</p>'; }
  var list = S.meals.filter(function (m) { return m.day === key; }).sort(function (a, b) { return a.t - b.t; }), u = tx('g'), inf = dayInfo(key), dt = key;
  try { var p = key.split('-'); dt = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(tx('locale'), { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) {}
  return '<div class="card log" style="margin-top:14px"><h2>' + esc(tx('histTitle')) + ' : ' + esc(dt) + '</h2><p class="note"><b>' + fmt(inf.total) + '</b> / ' + fmt(inf.goal) + ' ' + esc(u) + '</p><ul>' + list.map(function (m) {
    var d = new Date(m.t);
    return '<li class="meal"><span class="time">' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</span><span class="nm">' + esc(nameOf(m)) + '</span><span class="kc">' + m.carbs + ' ' + esc(u) + '</span></li>';
  }).join('') + '</ul></div>';
}

/* réglages */
function refreshSettings() {
  var el = $('settings'); if (!el) { return; }
  var st = notifState(), msg = flash || notifMsg(st);
  el.innerHTML = (accOn() ? '<div id="account">' + accountInner('home') + '</div>' : '') + '<div class="card"><h2>' + esc(tx('sTitle')) + '</h2>' +
    '<div><div class="switch-row"><span>' + esc(tx('sNotif')) + '<small>' + esc(S.pushOn ? tx('sNotifOn') : tx('sNotifOff')) + '</small></span>' +
    (st === 'ready' && !S.pushOn ? '<button class="btn" type="button" data-act="notif-enable" data-from="settings" style="min-height:44px">' + esc(tx('rEnable')) + '</button>' : (S.pushOn ? '<label class="switch"><input type="checkbox" data-act="push-toggle" checked aria-label="' + esc(tx('sNotif')) + '"><i></i></label>' : '')) + '</div>' +
    '<div>' + remindRows() + '</div></div>' + (msg && !S.pushOn ? '<p class="note" role="status">' + esc(msg) + '</p>' : '') +
    '<button class="btn ghost" type="button" data-act="recalc">' + esc(tx('sRecalc')) + '</button>' +
    (deferredInstall ? '<button class="btn ghost" type="button" data-act="install">' + esc(tx('sInstall')) + '</button>' : '') +
    '<button class="btn ghost" type="button" data-act="export">' + esc(tx('sExport')) + '</button>' + (S.aiConsent ? '<button class="link" type="button" data-act="ai-off">' + esc(tx('aiConsentOff')) + '</button>' : '') + '<button class="link" type="button" data-act="reset">' + esc(resetArmed ? tx('sResetAsk') : tx('sReset')) + '</button><p class="note" style="text-align:center">' + esc(tx('sResetNote')) + '</p>' + legalLinks() + '</div>';
}

/* ======================================================================
   Photos : réduction, analyse, avant / après
   ====================================================================== */
function shrink(file, max, q) {
  return new Promise(function (res, rej) {
    function draw(src, w, h) {
      var k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      var url = c.toDataURL('image/jpeg', q);
      res({ dataURL: url, b64: url.split(',')[1], mime: 'image/jpeg', ratio: c.width / c.height });
    }
    var viaImg = function () {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { draw(im, im.naturalWidth, im.naturalHeight); URL.revokeObjectURL(u); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    };
    if (window.createImageBitmap) {
      createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (b) { draw(b, b.width, b.height); }).catch(viaImg);
    } else { viaImg(); }
  });
}
function reencode(dataURL) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () {
      var k = Math.min(1, 1280 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.88));
    };
    im.onerror = function () { rej(new Error('img')); };
    im.src = dataURL;
  });
}

var PORTIONS = [[0.25, '¼'], [0.5, '½'], [1, '1'], [1.5, '1½'], [2, '2']];
function mealBase() { return cur.items.reduce(function (a, i) { return a + i.carbs; }, 0); }
function mealCarbs(mult) { return Math.round(mealBase() * mult); }
function limitMult() {
  var rem = remaining(), full = mealBase();
  if (rem <= 0 || !full) { return 0; }
  var m = Math.floor(Math.min(1, rem / full) * 20) / 20;
  return m < 0.1 ? 0 : m;
}
function totalsOf(items, mult) {
  function s(k) { return Math.round(items.reduce(function (a, i) { return a + i[k]; }, 0) * mult); }
  return { kcal: s('kcal'), carbs: s('carbs'), protein: s('protein'), fat: s('fat'), sugar: s('sugar') };
}
function num(v) { var n = Math.round(Number(v)); return isFinite(n) && n > 0 ? Math.min(n, 5000) : 0; }
function normalise(data) {
  if (!data || data.is_food === false || !Array.isArray(data.items)) { return []; }
  return data.items.slice(0, 8).map(function (it) {
    var carbs = num(it.carbs_g), sugar = num(it.sugar_g); if (carbs) { sugar = Math.min(sugar, carbs); }
    return { fr: String(it.fr || it.ar || '').slice(0, 60), ar: String(it.ar || it.fr || '').slice(0, 60), kcal: num(it.kcal), carbs: carbs, protein: num(it.protein_g), fat: num(it.fat_g), sugar: sugar };
  }).filter(function (i) { return i.fr && i.kcal > 0; });
}
var entry = '', entryErr = '';      // saisie sans photo : '' | 'text' | 'manual'
function closeCur() { consentAsk = false; if (cur && cur.ctl) { try { cur.ctl.abort(); } catch (e) {} } cur = null; entry = ''; entryErr = ''; }

var consentAsk = false, consentPending = null;
function consentCard() {
  return '<div class="card" role="dialog" aria-labelledby="aiT"><h2 id="aiT">' + esc(tx('aiConsentTitle')) + '</h2><p>' + esc(tx('aiConsentText')) + '</p>' +
    '<div class="actions"><button type="button" class="btn" data-act="ai-yes">' + esc(tx('aiConsentYes')) + '</button><button type="button" class="btn ghost" data-act="ai-no">' + esc(tx('aiConsentNo')) + '</button></div></div>';
}
function startAnalysis(file) {
  if (!S.aiConsent) { consentPending = function () { startAnalysis(file); }; closeCur(); consentAsk = true; renderCapture(); return; }
  closeCur();
  var job = cur = { status: 'analyzing', items: [], mult: 1, conf: '', thumb: '', ctl: null, alarmed: false };
  renderCapture();
  shrink(file, 1280, 0.82).then(function (r) { if (cur !== job) { return; } job.thumb = r.dataURL; job.b64 = r.b64; renderCapture(); runAnalysis(job); })
    .catch(function () { if (cur !== job) { return; } job.status = 'error'; job.err = 'badimg'; renderCapture(); });
}
function runAnalysis(job) {
  if (!HAS_API) { job.status = 'error'; job.err = 'soon'; renderCapture(); return; }
  job.status = 'analyzing'; job.err = ''; renderCapture();
  var ctl = job.ctl = (window.AbortController ? new AbortController() : null);
  job.timedOut = false; clearTimeout(job.timer); job.timer = setTimeout(function () { job.timedOut = true; if (ctl) { try { ctl.abort(); } catch (e) {} } }, 45000);
  fetch(API + 'analyze.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined, body: JSON.stringify(job.text ? { device: S.device, tk: tkv(), text: job.text, lang: S.lang } : { device: S.device, tk: tkv(), image: job.b64, mime: 'image/jpeg', lang: S.lang }) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
    .then(function (r) {
      clearTimeout(job.timer);
      if (cur !== job) { return; }
      if (!r.ok) { throw { code: r.j.error || 'generic' }; }
      var items = normalise(r.j);
      if (!items.length) { job.status = 'error'; job.err = 'notfood'; renderCapture(); return; }
      job.items = items; job.conf = r.j.confidence; job.mult = 1; job.status = 'result'; renderCapture();
      if (mealCarbs(1) > 0 && mealCarbs(1) > remaining()) { job.alarmed = true; decisionAlarm(); }
    })
    .catch(function (e) {
      clearTimeout(job.timer);
      if (cur !== job || (e && e.name === 'AbortError' && !job.timedOut)) { return; }
      var c = e && e.code; job.status = 'error';
      job.err = c === 'rate_limited' ? 'busy' : c === 'bad_image' ? 'badimg' : c === 'bad_text' ? 'badtext' : c === 'access' ? 'access' : c === 'config' ? 'config' : (job.timedOut ? 'timeout' : (e && e.name === 'TypeError' ? (navigator.onLine === false ? 'offline' : 'network') : 'generic'));
      if (job.err === 'access') { S.access.expires = null; save(); }
      renderCapture();
    });
}

/* repas décrit en texte, ou ajout rapide nom + calories */
function startTextAnalysis(desc) {
  if (!S.aiConsent) { consentPending = function () { startTextAnalysis(desc); }; closeCur(); consentAsk = true; renderCapture(); return; }
  closeCur();
  var job = cur = { status: 'analyzing', items: [], mult: 1, conf: '', thumb: '', text: desc, ctl: null, alarmed: false };
  renderCapture(); runAnalysis(job);
}
function startManual(name, carbs) {
  closeCur();
  var job = cur = { status: 'result', items: [{ fr: name, ar: name, kcal: carbs * 4, carbs: carbs, protein: 0, fat: 0, sugar: 0 }], mult: 1, conf: 'manual', thumb: '', manual: true, ctl: null, alarmed: false };
  renderCapture();
  if (mealCarbs(1) > 0 && mealCarbs(1) > remaining()) { job.alarmed = true; decisionAlarm(); }
}
function readCarb(v) { var n = Math.round(parseFloat(String(v).replace(',', '.'))); return isFinite(n) && n >= 0 && n <= 1000 ? n : -1; }
function applyItemForm() {
  if (!cur || cur.status !== 'result') { return; }
  var nm = $('itName'), kc = $('itKcal'); if (!nm || !kc) { return; }
  var name = nm.value.replace(/\s+/g, ' ').trim().slice(0, 60), shown = readCarb(kc.value), mult = cur.mult > 0 ? cur.mult : 1;
  if (!name || shown < 0) { cur.editErr = tx('itBad'); renderCapture(); return; }
  var base = shown / mult;                       // la valeur saisie est celle affichée pour la portion choisie
  if (cur.edit === 'new') {
    if (cur.items.length >= 12) { cur.edit = undefined; renderCapture(); return; }
    cur.items.push({ fr: name, ar: name, kcal: base * 4, carbs: base, protein: 0, fat: 0, sugar: 0 });
  } else {
    var it = cur.items[cur.edit]; if (!it) { cur.edit = undefined; renderCapture(); return; }
    var same = nameOf(it) === name;       // les glucides changent : les calories suivent (4 kcal par g), le reste ne bouge pas
    cur.items[cur.edit] = { fr: same ? it.fr : name, ar: same ? it.ar : name, kcal: Math.max(0, it.kcal + (base - it.carbs) * 4), carbs: base, protein: it.protein, fat: it.fat, sugar: it.carbs > 0 ? Math.min(base, it.sugar * base / it.carbs) : 0 };
  }
  cur.edit = undefined; cur.editErr = ''; renderCapture();
}
function itemRow(i, idx, mult, u) {
  var shown = Math.round(i.carbs * mult), multi = cur.items.length > 1;
  return '<li><span>' + esc(nameOf(i)) + '</span><span class="k">' + shown + ' ' + tx('g') + '</span><span class="row-act">' +
    '<button type="button" class="ico-btn" data-act="it-edit" data-i="' + idx + '" aria-label="' + esc(tx('itEdit') + ' : ' + nameOf(i)) + '">' + ICON.pencil + '</button>' +
    (multi ? '<button type="button" class="ico-btn" data-act="it-del" data-i="' + idx + '" aria-label="' + esc(tx('itDel') + ' : ' + nameOf(i)) + '">&times;</button>' : '') + '</span></li>';
}
function itemForm(idx, mult) {
  var it = idx === 'new' ? null : cur.items[idx];
  return '<li class="edit"><form id="itemForm" novalidate>' +
    '<div class="inp"><input id="itName" type="text" maxlength="60" autocomplete="off" aria-label="' + esc(tx('itName')) + '" placeholder="' + esc(tx('itName')) + '" value="' + esc(it ? nameOf(it) : '') + '"></div>' +
    '<div class="inp"><input id="itKcal" type="number" inputmode="numeric" min="0" max="1000" step="1" aria-label="' + esc(tx('itKcal')) + '" placeholder="' + esc(tx('itKcal')) + '" value="' + (it ? Math.round(it.carbs * mult) : '') + '" dir="ltr"><span class="u">' + esc(tx('g')) + '</span></div>' +
    (cur.editErr ? '<p class="err" role="alert">' + esc(cur.editErr) + '</p>' : '') +
    '<div class="acc-row"><button class="btn" type="submit" style="min-height:44px">' + esc(tx('itSave')) + '</button><button class="btn ghost" type="button" data-act="it-cancel" style="min-height:44px">' + esc(tx('entryClose')) + '</button></div></form></li>';
}
function entryForm() {
  if (entry === 'text') {
    return '<form class="card" id="txtForm" novalidate><h2>' + esc(tx('txtTitle')) + '</h2><p class="hint">' + esc(tx('txtHelp')) + '</p>' +
      '<div class="inp area"><textarea id="txtIn" rows="3" maxlength="300" autocomplete="off" aria-label="' + esc(tx('txtTitle')) + '" placeholder="' + esc(tx('txtPh')) + '"></textarea></div>' +
      (entryErr ? '<p class="err" role="alert">' + esc(entryErr) + '</p>' : '') +
      '<div class="actions"><button type="submit" class="btn">' + esc(tx('txtGo')) + '</button><button type="button" class="btn ghost" data-act="entry-close">' + esc(tx('entryClose')) + '</button></div></form>';
  }
  return '<form class="card" id="manForm" novalidate><h2>' + esc(tx('manTitle')) + '</h2><p class="hint">' + esc(tx('manHelp')) + '</p>' +
    '<div class="inp"><input id="manName" type="text" maxlength="60" autocomplete="off" aria-label="' + esc(tx('manName')) + '" placeholder="' + esc(tx('manName')) + '"></div>' +
    '<div class="inp"><input id="manKcal" type="number" inputmode="numeric" min="0" max="1000" step="1" aria-label="' + esc(tx('manKcal')) + '" placeholder="' + esc(tx('manKcal')) + '" dir="ltr"><span class="u">' + esc(tx('g')) + '</span></div>' +
    (entryErr ? '<p class="err" role="alert">' + esc(entryErr) + '</p>' : '') +
    '<div class="actions"><button type="submit" class="btn">' + esc(tx('manGo')) + '</button><button type="button" class="btn ghost" data-act="entry-close">' + esc(tx('entryClose')) + '</button></div></form>';
}
function renderCapture() {
  var el = $('capture'); if (!el) { return; }
  var u = tx('unit'), g = tx('g');
  if (consentAsk) { el.innerHTML = consentCard(); return; }
  if (!cur) {
    if (entry) { el.innerHTML = entryForm(); var fi = $(entry === 'text' ? 'txtIn' : 'manName'); if (fi) { fi.focus(); } return; }
    el.innerHTML = '<button type="button" class="snap" data-act="snap-cam">' + ICON.camera + '<span>' + esc(tx('snap')) + '</span></button><button type="button" class="link" data-act="snap-pick">' + esc(tx('camNow')) + '</button>' +
      '<div class="alt-row"><button type="button" class="btn ghost" data-act="entry-text">' + ICON.pencil + '<span>' + esc(tx('txtBtn')) + '</span></button><button type="button" class="btn ghost" data-act="entry-manual"><b aria-hidden="true">+</b><span>' + esc(tx('manBtn')) + '</span></button></div>';
    return;
  }
  var thumb = cur.thumb ? '<img class="thumb" src="' + cur.thumb + '" alt="">' : (cur.text || cur.manual ? '<span class="thumb txt" aria-hidden="true">' + ICON.pencil + '</span>' : '<span class="thumb"></span>');
  if (cur.status === 'analyzing') {
    el.innerHTML = '<div class="card"><div class="card-head">' + thumb + '<div class="status"><span class="spinner" aria-hidden="true"></span><span>' + esc(tx('analyzing')) + '</span></div></div>' +
      '<div class="actions"><button type="button" class="btn ghost" data-act="cancel">' + esc(tx('cancel')) + '</button></div></div>';
    return;
  }
  if (cur.status === 'error') {
    var gate = cur.err === 'access' ? codeForm('', false) : '';
    el.innerHTML = '<div class="card"><div class="card-head">' + thumb + '<p class="err">' + esc(tx('e_' + cur.err)) + '</p></div>' + gate +
      '<div class="actions">' + (cur.err === 'access' || cur.err === 'soon' || cur.err === 'notfood' || cur.err === 'badimg' || cur.err === 'config' ? '' : '<button type="button" class="btn" data-act="retry">' + esc(tx('retry')) + '</button>') +
      '<button type="button" class="btn ghost" data-act="cancel">' + esc(tx('cancel')) + '</button></div></div>';
    return;
  }
  var t = totalsOf(cur.items, cur.mult), rem = remaining(), over = t.carbs - rem;
  var rows = cur.items.map(function (i, idx) { return cur.edit === idx ? itemForm(idx, cur.mult) : itemRow(i, idx, cur.mult, u); }).join('') +
    (cur.edit === 'new' ? itemForm('new', cur.mult) : (cur.edit === undefined && cur.items.length < 12 ? '<li class="add-row"><button type="button" class="link add-it" data-act="it-add">+ ' + esc(tx('itAdd')) + '</button></li>' : ''));
  var known = PORTIONS.some(function (p) { return p[0] === cur.mult; });
  var chips = PORTIONS.map(function (p) { return '<button type="button" class="chip' + (mealCarbs(p[0]) <= rem ? ' fit' : '') + '" data-act="mult" data-v="' + p[0] + '" aria-pressed="' + (p[0] === cur.mult) + '">' + p[1] + '</button>'; }).join('') +
    (known ? '' : '<button type="button" class="chip" aria-pressed="true">' + esc(tx('pctCustom')(Math.round(cur.mult * 100))) + '</button>');
  var warn = '';
  if (over > 0) {
    var lm = limitMult();
    warn = '<div class="warn-box"><b>' + esc(tx('wOver')(over)) + '</b><span class="hint">' + esc(tx('wHelp')) + '</span><div class="chips">' +
      '<button type="button" class="chip" data-act="mult" data-v="0.25">' + esc(tx('cQuarter')) + '</button><button type="button" class="chip" data-act="mult" data-v="0.5">' + esc(tx('cHalf')) + '</button>' +
      (lm > 0 ? '<button type="button" class="chip" data-act="limit">' + esc(tx('cLimit')) + '</button>' : '<button type="button" class="chip" data-act="cancel">' + esc(tx('cSkip')) + '</button>') + '</div></div>';
  }
  el.innerHTML = '<div class="card"><div class="card-head">' + thumb + '<div><div class="kcal-big">' + t.carbs + '<small>' + esc(tx('gCarbs')) + '</small></div>' +
    '<div class="mini"><span>' + esc(tx('calories')) + ' <b>' + t.kcal + ' ' + u + '</b></span><span>' + esc(tx('protein')) + ' <b>' + t.protein + ' ' + g + '</b></span><span>' + esc(tx('fat')) + ' <b>' + t.fat + ' ' + g + '</b></span></div></div></div>' +
    '<ul class="items">' + rows + '</ul>' + warn +
    '<div class="portion"><span class="t">' + esc(tx('portion')) + '</span>' + chips + '</div>' +
    '<p class="hint">' + esc(cur.manual ? tx('manualHint') : (cur.conf === 'low' ? tx('lowConf') : (cur.text ? tx('textHint') : tx('estimate')))) + '</p>' +
    '<div class="actions"><button type="button" class="btn" data-act="add">' + esc(tx('add')) + '</button><button type="button" class="btn ghost" data-act="cancel">' + esc(tx('cancel')) + '</button></div></div>';
  if (cur.edit !== undefined) { var nf = $('itName'); if (nf) { nf.focus(); } }
}

/* ======================================================================
   Alarme
   ====================================================================== */
function unlockAudio() {
  try {
    if (!audioCtx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) { audioCtx = new AC(); } }
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
  } catch (e) {}
}
function startSiren() {
  if (!S.sound || !audioCtx) { return; }
  try {
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'square'; gain.gain.value = 0.05; osc.connect(gain); gain.connect(audioCtx.destination);
    var t0 = audioCtx.currentTime;
    for (var i = 0; i < 16; i++) { osc.frequency.setValueAtTime(i % 2 ? 980 : 660, t0 + i * 0.4); }
    osc.start(t0); osc.stop(t0 + 6.4); siren = osc;
  } catch (e) {}
}
function stopSiren() { try { if (siren) { siren.stop(); } } catch (e) {} siren = null; }
function openAlarm(text, choices) {
  $('alarmTitle').textContent = tx('aTitle');
  $('alarmText').textContent = text;
  $('alarmTip').textContent = tx('aTip');
  $('alarmChoices').innerHTML = choices.map(function (c) {
    return '<button type="button" data-act="' + c.act + '"' + (c.v !== undefined ? ' data-v="' + c.v + '"' : '') + (c.out ? ' class="out"' : '') + '>' + esc(c.label) + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</button>';
  }).join('');
  $('alarm').hidden = false;
  var first = $('alarmChoices').querySelector('button'); if (first) { try { first.focus(); } catch (e) {} }
  startSiren();
  try { if (navigator.vibrate) { navigator.vibrate([300, 150, 300, 150, 300]); } } catch (e) {}
}
function closeAlarm() { $('alarm').hidden = true; stopSiren(); }
function decisionAlarm() {
  var rem = remaining(), over = mealCarbs(1) - rem, fits = tx('aFits'), ch = [];
  var q = mealCarbs(0.25), h = mealCarbs(0.5), lm = limitMult();
  ch.push({ act: 'dec-mult', v: 0.25, label: tx('aQuarter')(q), sub: q <= rem ? fits : '' });
  ch.push({ act: 'dec-mult', v: 0.5, label: tx('aHalf')(h), sub: h <= rem ? fits : '' });
  if (lm > 0) { ch.push({ act: 'dec-mult', v: lm, label: tx('aLimit')(mealCarbs(lm)), sub: fits }); }
  ch.push({ act: 'dec-skip', label: tx('aSkip') });
  ch.push({ act: 'dec-all', label: tx('aAll'), out: true });
  openAlarm(rem <= 0 ? tx('aAlready') : tx('aProj')(over), ch);
}

/* ======================================================================
   Actions
   ====================================================================== */
function addMeal() {
  unlockAudio();
  var t = totalsOf(cur.items, cur.mult), now = Date.now(), k = dkey();
  function joined(l) { return cur.items.map(function (i) { return i[l] || i.fr; }).join(' + ').slice(0, 90); }
  var wasAlarmed = cur.alarmed;
  S.meals.push({ id: String(now) + Math.random().toString(36).slice(2, 6), t: now, day: k, type: mealType(now), fr: joined('fr'), ar: joined('ar'), kcal: t.kcal, carbs: t.carbs, protein: t.protein, fat: t.fat, sugar: t.sugar });
  if (!S.dayGoal[k]) { S.dayGoal[k] = S.goal; }
  if (!S.dayCarbGoal[k]) { S.dayCarbGoal[k] = S.carbGoal; }
  var total = sumMeals(todayMeals()).carbs, over = total - S.carbGoal;
  if (over > 0 && !S.exceeded[k]) { S.exceeded[k] = Math.floor(now / 1000); }
  save(); closeCur();
  refreshAll(); syncState(over > 0);
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  if (t.carbs > 0 && over > 0 && !wasAlarmed) { openAlarm(tx('aFinal')(over), [{ act: 'alarm-close', label: tx('aOk') }]); }
}

function applyPrefs() { save(); syncState(true); }

function handleClick(ev) {
  var b = ev.target.closest('[data-act]'); if (!b) { return; }
  var act = b.getAttribute('data-act');
  switch (act) {
    case 'snap': unlockAudio(); break;
    case 'body-cam': if ($('bodyCam')) { $('bodyCam').click(); } break;
    case 'body-pick': if ($('bodyPick')) { $('bodyPick').click(); } break;
    case 'snap-pick': unlockAudio(); if ($('foodPick')) { $('foodPick').click(); } break;
    case 'snap-cam': unlockAudio(); if ($('foodCam')) { $('foodCam').click(); } break;
    case 'ai-yes': S.aiConsent = Date.now(); save(); consentAsk = false; var _p = consentPending; consentPending = null; if (_p) { _p(); } else { renderCapture(); } break;
    case 'ai-no': consentAsk = false; consentPending = null; renderCapture(); break;
    case 'ai-off': S.aiConsent = 0; save(); refreshSettings(); break;
    case 'export': exportData(); break;
    case 'tab':
      unlockAudio();
      var tv = b.getAttribute('data-v');
      if (tv === 'today' && tab === 'today' && !cur) { $('foodCam').click(); } else { showTab(tv); }
      break;
    case 'welcome-next': go('profile'); break;
    case 'to-profile': go('profile'); break;
    case 'to-home': go('home'); break;
    case 'goal-next': afterGoal(); break;
    case 't-chip': setTarget(Number(b.getAttribute('data-v'))); break;
    case 'photo-next': finishPhotoStep(); break;
    case 'photo-skip': BODY = null; go(S.startDate ? 'home' : 'remind'); break;
    case 'notif-enable':
      b.disabled = true;
      enableNotifications().then(function (r) {
        flash = r === 'ok' ? '' : (r === 'denied' ? tx('rDenied') : r === 'fail' ? tx('rFail') : '');
        if (b.getAttribute('data-from') === 'onboarding' && r === 'ok') { finishOnboarding(); }
        else if (S.step === 'remind') { renderMain(); } else { refreshSettings(); }
        flash = '';
      });
      break;
    case 'finish': finishOnboarding(); break;
    case 'goto-photo': S.step = 'photo'; save(); renderMain(); break;
    case 'ph-cam': pendingSlot = b.getAttribute('data-v'); if ($('bodyCam')) { $('bodyCam').click(); } break;
    case 'ph-pick': pendingSlot = b.getAttribute('data-v'); if ($('bodyPick')) { $('bodyPick').click(); } break;
    case 'ph-del': var dp = photoOf(b.getAttribute('data-v')); if (dp && window.confirm(tx('phDelAsk'))) { idb.set('ph:' + dp.id, null); S.photos = S.photos.filter(function (x) { return x.id !== dp.id; }); delete PURL[dp.id]; save(); refreshHero(); } break;
    case 'cancel': closeCur(); renderCapture(); break;
    case 'retry': if (cur) { runAnalysis(cur); } break;
    case 'mult': if (cur) { cur.mult = Number(b.getAttribute('data-v')); cur.alarmed = false; renderCapture(); } break;
    case 'limit': if (cur) { cur.mult = limitMult() || 0.25; cur.alarmed = false; renderCapture(); } break;
    case 'add': if (cur && cur.status === 'result') { addMeal(); } break;
    case 'dec-mult': if (cur) { cur.mult = Number(b.getAttribute('data-v')); } closeAlarm(); renderCapture(); break;
    case 'dec-skip': closeAlarm(); closeCur(); renderCapture(); break;
    case 'dec-all': closeAlarm(); break;
    case 'alarm-close': closeAlarm(); break;
    case 'del':
      var id = b.getAttribute('data-id');
      S.meals = S.meals.filter(function (m) { return m.id !== id; });
      save(); refreshDay(); refreshMeals(); refreshCal(); refreshBanners(); syncState();
      break;
    case 'goal-toggle':
      var p = $('goalPanel'), open = p.hidden; p.hidden = !open; b.setAttribute('aria-expanded', String(open));
      if (open) { $('goalInput').value = S.carbGoal; }
      break;
    case 'goal-chip': $('goalInput').value = b.getAttribute('data-v'); break;
    case 'recalc': S.step = 'profile'; save(); renderMain(); break;
    case 'cal-day': calDay = b.getAttribute('data-k'); refreshCal(); break;
    case 'entry-text': if (!cur) { entry = 'text'; entryErr = ''; renderCapture(); } break;
    case 'entry-manual': if (!cur) { entry = 'manual'; entryErr = ''; renderCapture(); } break;
    case 'entry-close': entry = ''; entryErr = ''; renderCapture(); break;
    case 'it-edit': if (cur && cur.status === 'result') { cur.edit = Number(b.getAttribute('data-i')); cur.editErr = ''; renderCapture(); } break;
    case 'it-add': if (cur && cur.status === 'result') { cur.edit = 'new'; cur.editErr = ''; renderCapture(); } break;
    case 'it-cancel': if (cur) { cur.edit = undefined; cur.editErr = ''; renderCapture(); } break;
    case 'it-del':
      if (cur && cur.status === 'result' && cur.items.length > 1) { cur.items.splice(Number(b.getAttribute('data-i')), 1); cur.edit = undefined; renderCapture(); }
      break;
    case 'trend': trendDays = Number(b.getAttribute('data-v')) === 30 ? 30 : 7; refreshCal(); break;
    case 'acc-forgot': accMode = 'forgot'; accMsg = ''; accNote = ''; refreshAccount(); break;
    case 'acc-back': accMode = ''; accMsg = ''; refreshAccount(); break;
    case 'acc-rec-open': accPanel = 'rec'; accMsg = ''; refreshAccount(); break;
    case 'acc-del-open': accPanel = 'del'; accMsg = ''; refreshAccount(); break;
    case 'acc-panel-close': accPanel = ''; accMsg = ''; refreshAccount(); break;
    case 'rec-copy': copyText(recShow, b); break;
    case 'rec-done': recShow = ''; refreshAccount(); break;
    case 'acc-register': doAuth('register'); break;
    case 'acc-login': doAuth('login'); break;
    case 'acc-logout': accLogout(); break;
    case 'acc-go': showTab('goal'); setTimeout(function () { var a = $('account'); if (a && a.scrollIntoView) { a.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 60); break;
    case 'cal-prev': calDay = ''; calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); refreshCal(); break;
    case 'cal-next': calDay = ''; calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); refreshCal(); break;
    case 'install': if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; refreshSettings(); } break;
    case 'reset':
      if (!resetArmed) { resetArmed = true; refreshSettings(); setTimeout(function () { resetArmed = false; if ($('settings')) { refreshSettings(); } }, 5000); }
      else { resetEverything(); }
      break;
    case 'sound': S.sound = !S.sound; if (!S.sound) { stopSiren(); } save(); renderStatic(); break;
    case 'setlang':
      stashForm(); S.lang = b.getAttribute('data-v') === 'ar' ? 'ar' : 'fr'; save(); renderMain(); syncState(true); break;
  }
}
function finishPhotoStep() {
  if (!BODY) { return; }
  var fresh = BODY;
  if (S.startDate) { addPhoto('d1', fresh).then(function () { BODY = null; save(); go('home'); }); return; }
  go('remind');
}
function exportData() {
  var o = { app: 'Sokkar Stop', exportedAt: new Date().toISOString(), profile: S.profile, carbGoal: S.carbGoal, goal: S.goal, startDate: S.startDate, weights: S.weights, meals: S.meals, dayCarbGoal: S.dayCarbGoal, dayGoal: S.dayGoal, exceeded: S.exceeded };
  try {
    var url = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = 'sokkar-stop-mes-donnees.json'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  } catch (e) {}
}
function resetEverything() {
  if (HAS_API) { api('erase', null, true).catch(function () {}); }
  try { navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription(); }).then(function (s) { if (s) { api('unsubscribe').catch(function () {}); return s.unsubscribe(); } }).catch(function () {}); } catch (e) {}
  if (ACC) { accPost('logout', { token: ACC.token }).catch(function () {}); }
  try { localStorage.removeItem(KEY); localStorage.removeItem(ACC_KEY); } catch (e) {}
  idb.clear().then(function () { location.reload(); });
}

function handleChange(ev) {
  var t = ev.target;
  if (t.id === 'foodPick' || t.id === 'foodCam') { var f = t.files && t.files[0]; t.value = ''; if (f) { unlockAudio(); startAnalysis(f); } return; }
  if (t.id === 'bodyPick' || t.id === 'bodyCam') { onBodyFile(t); return; }
  var act = t.getAttribute && t.getAttribute('data-act');
  if (act === 'rem-toggle') { S.rem[t.getAttribute('data-k')] = t.checked; applyPrefs(); }
  else if (act === 'push-toggle') {
    if (!t.checked) { S.pushOn = false; save(); api('unsubscribe').catch(function () {}); try { navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription(); }).then(function (sb) { if (sb) { sb.unsubscribe(); } }).catch(function () {}); } catch (e2) {} refreshSettings(); }
  }
}
function handleSubmit(ev) {
  var f = ev.target.id; if (!f) { return; }
  ev.preventDefault();
  if (f === 'accForm') { doAuth('login'); return; }
  if (f === 'forgotForm') { doForgot(); return; }
  if (f === 'recForm') { doSecure('recovery'); return; }
  if (f === 'delForm') { doSecure('delete'); return; }
  if (f === 'itemForm') { applyItemForm(); return; }
  if (f === 'txtForm') {
    var tv = ($('txtIn').value || '').replace(/\s+/g, ' ').trim();
    if (tv.length < 2) { entryErr = tx('txtShort'); renderCapture(); return; }
    startTextAnalysis(tv.slice(0, 300)); return;
  }
  if (f === 'manForm') {
    var mn = ($('manName').value || '').replace(/\s+/g, ' ').trim().slice(0, 60), mk = readCarb($('manKcal').value);
    if (!mn || mk < 0) { entryErr = tx('itBad'); renderCapture(); return; }
    startManual(mn, mk); return;
  }
  if (f === 'profileForm') { submitProfile(); }
  else if (f === 'targetForm') {
    var p = S.profile, o = targetOptions(p), v = parseFloat($('tInput').value.replace(',', '.'));
    if (!isFinite(v) || v < o.lo || v > o.hi) { setTarget(isFinite(v) ? v : p.weight, true); return; }
    p.targetWeight = Math.round(v * 10) / 10; afterGoal();
  }
  else if (f === 'goalPanel') {
    S.carbGoal = clamp(Math.round(Number($('goalInput').value) || S.carbGoal), CARB_MIN, 600);
    var k = dkey(); if (S.dayCarbGoal[k]) { S.dayCarbGoal[k] = S.carbGoal; }
    save(); refreshDay(); refreshCal(); syncState();
  }
  else if (f === 'weighForm') {
    var kg = parseFloat($('weighInput').value.replace(',', '.')), msg = $('weighMsg');
    if (!isFinite(kg) || kg < 30 || kg > 250) { msg.textContent = tx('weighBad'); msg.className = 'err'; return; }
    addWeight(Math.round(kg * 10) / 10); refreshHero(); refreshBanners();
    var m2 = $('weighMsg'); if (m2) { m2.textContent = tx('weighDone'); }
  }
  else if (f === 'codeForm') {
    var code = String($('codeInput').value).replace(/\D/g, '');
    if (code.length !== 6) { var em = $('codeMsg'); if (em) { em.className = 'err'; em.textContent = tx('codeInvalid'); } return; }
    var cb = $('codeBtn'); if (cb) { cb.disabled = true; cb.textContent = tx('codeChecking'); }
    api('activate', { code: code }).then(function (j) {
      if (j && j.ok) { S.access.expires = j.expires; save(); flash = ''; if (S.step === 'welcome') { renderMain(); } else if (cur) { runAnalysis(cur); } return; }
      flash = j && j.error === 'used' ? tx('codeUsed') : (j && j.error === 'rate_limited' ? tx('codeRate') : tx('codeInvalid'));
      if (S.step === 'welcome') { renderMain(); flash = ''; } else { var c = $('codeForm'); if (c) { var pn = document.createElement('p'); pn.className = 'err'; pn.textContent = flash; c.appendChild(pn); } flash = ''; }
    }).catch(function () { flash = tx('e_offline'); if (S.step === 'welcome') { renderMain(); } else { var c2 = $('codeForm'); if (c2) { var p2 = document.createElement('p'); p2.className = 'err'; p2.textContent = flash; c2.appendChild(p2); var b2 = $('codeBtn'); if (b2) { b2.disabled = false; b2.textContent = tx('codeBtn'); } } } flash = ''; });
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);
document.addEventListener('input', function (ev) {
  var t = ev.target; if (!t || t.id !== 'codeInput') { return; }
  var d = String(t.value).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); }).replace(/\D/g, '').slice(0, 6);
  t.value = d.length > 3 ? d.slice(0, 3) + ' ' + d.slice(3) : d;
  var b = $('codeBtn'); if (b) { b.disabled = d.length !== 6; }
  var m = $('codeMsg'); if (m && d.length) { m.textContent = ''; }
  if (d.length === 6 && b && ev.inputType !== 'deleteContentBackward') { var fm = $('codeForm'); if (fm && fm.requestSubmit) { fm.requestSubmit(); } else { b.click(); } }
});
document.addEventListener('submit', handleSubmit);
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; if ($('settings')) { refreshSettings(); } });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('alarm').hidden) { var ob = $('alarmChoices').querySelector('[data-act="dec-all"],[data-act="alarm-close"]'); if (ob) { ob.click(); } } });

/* ======================================================================
   Démarrage
   ====================================================================== */
var lastDay = dkey();
function tick() {
  if (dkey() !== lastDay) { lastDay = dkey(); calMonth = new Date(); calMonth.setDate(1); if (S.step === 'home') { refreshAll(); } return; }
  if (S.step === 'home') { refreshBanners(); }
}
setInterval(tick, 60000);
document.addEventListener('visibilitychange', function () { if (!document.hidden) { tick(); } });

if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) { navigator.serviceWorker.register('sw.js').catch(function () {}); }

if (!S.profile) {
  idb.get('state').then(function (raw) {
    if (!raw || S.profile) { return; }
    var r = null; try { r = JSON.parse(raw); } catch (e) {}
    if (!r || !r.profile) { return; }
    for (var k in r) { S[k] = r[k]; }
    S.access = (jget('ss2_dev') || {}).access || r.access || S.access;
    jset(KEY, S); renderMain();
  });
}
renderMain();
loadImages().then(function () { if (S.step === 'home') { refreshHero(); } else if (S.step === 'photo') { renderMain(); } });
try { if (navigator.storage && navigator.storage.persist) { navigator.storage.persist(); } } catch (e) {}
document.addEventListener('visibilitychange', function () { if (document.hidden) { pushAcc(true); } });
ensureConfig().then(function () {
  syncFromServer();
  if (S.step === 'home') { refreshBanners(); if (!cur) { refreshSettings(); } }
  if (S.step === 'welcome') { renderMain(); }
  if (CFG.requireCode) { api('status').then(function (j) { if (j && j.access) { S.access.expires = j.access.expires; if (typeof j.transformLeft === 'number') { S.genLeft = j.transformLeft; } save(); if (S.step === 'welcome') { renderMain(); } } }).catch(function () {}); }
}).catch(function () {});
})();
