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
    // accueil / étapes
    h1a: 'Photographie ton assiette.', h1b: 'On compte pour toi.',
    lead: 'Réponds à quelques questions : on calcule tes calories du jour, puis tu scannes tes repas en photo.',
    pill1: 'Calcul par photo', pill2: 'Alarme Sokkar Stop', pill3: 'Avant / après',
    start: 'Commencer', next: 'Continuer', back: 'Retour',
    codeLabel: 'Code d’activation', codeHelp: 'Tu le trouves avec ton flacon Sokkar Stop.', codeBtn: 'Valider',
    codeInvalid: 'Ce code n’existe pas. Vérifie les lettres et les chiffres.', codeUsed: 'Ce code est déjà utilisé sur un autre téléphone.',
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
    medNote: 'Estimation générale, pas un avis médical. Si tu es enceinte, si tu allaites ou si tu as une maladie, demande conseil à ton médecin.',
    calc: 'Continuer',
    errForm: 'Complète toutes les infos avec des valeurs correctes : âge de 14 à 90 ans, poids de 30 à 250 kg, taille de 120 à 230 cm.',
    // objectif
    gTitle: 'Ton objectif', resTitle: 'Ton objectif du jour', perDay: 'kcal par jour',
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
    goalLabel: 'Objectif du jour', goalHelp: 'Calories à ne pas dépasser chaque jour.', save: 'Enregistrer',
    unit: 'kcal', g: 'g', of: function (n) { return 'sur ' + fmt(n) + ' kcal'; },
    left: function (n) { return 'Il te reste ' + fmt(n) + ' kcal'; },
    over: function (n) { return 'Dépassé de ' + fmt(n) + ' kcal. Stop pour aujourd’hui.'; },
    goalBtn: function (n) { return 'Objectif : ' + fmt(n) + ' kcal'; },
    carbs: 'Glucides', protein: 'Protéines', fat: 'Lipides', sugarIn: 'dont sucres',
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
    enc: function (n) { return 'Tu as dépassé de ' + fmt(n) + ' kcal aujourd’hui. Pas de panique : tu peux tenir le coup. Demain tu repars à zéro et tu pourras remanger ce genre de plat.'; },
    rem_b: 'C’est l’heure du petit-déjeuner : prends ton assiette en photo.',
    rem_l: 'N’oublie pas d’envoyer une photo de ton déjeuner.',
    rem_d: 'Avant ton dîner, prends-le en photo : je te dis s’il rentre dans ta limite.',
    weighBanner: 'Ça fait plus d’une semaine : mets à jour ton poids pour voir ton score.',
    // photo repas
    tabGoal: 'Objectif', tabToday: 'Aujourd’hui', tabCal: 'Calendrier',
    snap: 'Photographier mon repas', camNow: 'Ouvrir directement l’appareil photo',
    analyzing: 'Analyse de ton repas…', cancel: 'Annuler', retry: 'Réessayer',
    portion: 'Portion', add: 'Ajouter à ma journée',
    estimate: 'Estimation faite à partir de la photo. Ajuste la portion si besoin.',
    lowConf: 'Photo peu claire : vérifie la portion.',
    pctCustom: function (n) { return n + ' %'; },
    wOver: function (n) { return 'Ce repas dépasse ton objectif de ' + fmt(n) + ' kcal.'; },
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
    aProj: function (n) { return 'Ce repas te fait dépasser ton objectif de ' + fmt(n) + ' kcal.'; },
    aAlready: 'Tu as déjà atteint ton objectif aujourd’hui.',
    aQuarter: function (k) { return 'Un quart · ' + k + ' kcal'; }, aHalf: function (k) { return 'La moitié · ' + k + ' kcal'; },
    aLimit: function (k) { return 'Rester dans ma limite · ' + k + ' kcal'; },
    aFits: 'dans ta limite', aSkip: 'Je ne mange pas ça', aAll: 'Je mange tout quand même',
    aFinal: function (n) { return 'Tu as dépassé ton objectif de ' + fmt(n) + ' kcal. On arrête les calories pour aujourd’hui.'; },
    aTip: 'Si l’envie de sucre est forte, utilise ton spray Sokkar Stop.',
    aOk: 'J’ai compris',
    // réglages
    sTitle: 'Réglages', sRem: 'Rappels', sNotif: 'Notifications', sNotifOn: 'Activées', sNotifOff: 'Désactivées',
    sRecalc: 'Recalculer avec mon profil', sInstall: 'Installer l’appli sur mon téléphone', sReset: 'Effacer mes données',
    sResetAsk: 'Appuie encore pour tout effacer', sResetNote: 'Efface ton profil, tes repas et tes photos sur ce téléphone.'
  },
  ar: {
    locale: 'ar-TN-u-nu-latn', soundOn: 'إيقاف الصوت', soundOff: 'تشغيل الصوت',
    h1a: 'صوّر صحنك.', h1b: 'ونحسب لك السعرات.',
    lead: 'جاوب على أسئلة قليلة ونحسبو سعراتك اليومية، ثم صوّر وجباتك.',
    pill1: 'حساب بالصورة', pill2: 'منبّه سكر ستوب', pill3: 'قبل / بعد',
    start: 'ابدأ', next: 'متابعة', back: 'رجوع',
    codeLabel: 'رمز التفعيل', codeHelp: 'تجده مع قارورة سكر ستوب.', codeBtn: 'تأكيد',
    codeInvalid: 'هذا الرمز غير موجود. تأكد من الحروف والأرقام.', codeUsed: 'هذا الرمز مستعمل على هاتف آخر.',
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
    medNote: 'تقدير عام وليس نصيحة طبية. إذا كنتِ حاملًا أو مرضعة أو لديك مرض، استشيري طبيبك.',
    calc: 'متابعة',
    errForm: 'أكمل كل المعلومات بقيم صحيحة: العمر من 14 إلى 90 سنة، الوزن من 30 إلى 250 كغ، الطول من 120 إلى 230 سم.',
    gTitle: 'هدفك', resTitle: 'هدفك اليومي', perDay: 'سعرة في اليوم',
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
    goalLabel: 'هدف اليوم', goalHelp: 'السعرات التي لا يجب تجاوزها كل يوم.', save: 'حفظ',
    unit: 'سعرة', g: 'غ', of: function (n) { return 'من ' + fmt(n) + ' سعرة'; },
    left: function (n) { return 'باقي لك ' + fmt(n) + ' سعرة'; },
    over: function (n) { return 'تجاوزت بـ ' + fmt(n) + ' سعرة. قف لهذا اليوم.'; },
    goalBtn: function (n) { return 'الهدف: ' + fmt(n) + ' سعرة'; },
    carbs: 'كربوهيدرات', protein: 'بروتين', fat: 'دهون', sugarIn: 'منها سكر',
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
    enc: function (n) { return 'تجاوزت اليوم بـ ' + fmt(n) + ' سعرة. لا تقلق، تقدر تصبر. غدًا تبدأ من الصفر وتقدر تأكل هذا النوع من الأكل مرة أخرى.'; },
    rem_b: 'حان وقت الفطور: صوّر صحنك.',
    rem_l: 'لا تنس إرسال صورة غدائك.',
    rem_d: 'قبل عشائك، صوّره: أقول لك إن كان يدخل في حدّك.',
    weighBanner: 'مرّ أكثر من أسبوع: حدّث وزنك لترى نتيجتك.',
    tabGoal: 'الهدف', tabToday: 'اليوم', tabCal: 'التقويم',
    snap: 'صوّر أكلك', camNow: 'افتح الكاميرا مباشرة',
    analyzing: 'نحلّل أكلك…', cancel: 'إلغاء', retry: 'أعد المحاولة',
    portion: 'الحصة', add: 'أضف إلى يومي',
    estimate: 'تقدير مبني على الصورة. عدّل الحصة عند الحاجة.',
    lowConf: 'الصورة غير واضحة: راجع الحصة.',
    pctCustom: function (n) { return n + ' %'; },
    wOver: function (n) { return 'هذه الوجبة تتجاوز هدفك بـ ' + fmt(n) + ' سعرة.'; },
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
    aProj: function (n) { return 'هذه الوجبة تجعلك تتجاوز هدفك بـ ' + fmt(n) + ' سعرة.'; },
    aAlready: 'لقد بلغت هدفك اليوم.',
    aQuarter: function (k) { return 'الربع · ' + k + ' سعرة'; }, aHalf: function (k) { return 'النصف · ' + k + ' سعرة'; },
    aLimit: function (k) { return 'أبقَ ضمن حدّي · ' + k + ' سعرة'; },
    aFits: 'ضمن حدّك', aSkip: 'لن آكل هذا', aAll: 'سآكل كل شيء رغم ذلك',
    aFinal: function (n) { return 'تجاوزت هدفك بـ ' + fmt(n) + ' سعرة. كفى سعرات لهذا اليوم.'; },
    aTip: 'إذا كانت الرغبة في السكر قوية، استعمل بخاخ سكر ستوب.',
    aOk: 'فهمت',
    sTitle: 'الإعدادات', sRem: 'التذكيرات', sNotif: 'الإشعارات', sNotifOn: 'مفعّلة', sNotifOff: 'غير مفعّلة',
    sRecalc: 'أعد الحساب من ملفي', sInstall: 'ثبّت التطبيق على هاتفي', sReset: 'احذف بياناتي',
    sResetAsk: 'اضغط مرة أخرى لحذف كل شيء', sResetNote: 'يحذف ملفك ووجباتك وصورك من هذا الهاتف.'
  }
};

/* ======================================================================
   État
   ====================================================================== */
var KEY = 'ss2_state';
function defaults() {
  return {
    v: 2, lang: ((navigator.language || '').indexOf('ar') === 0) ? 'ar' : 'fr', sound: true, device: uuid(),
    step: 'welcome', profile: null, goal: 2000, consent: false,
    weights: [], meals: [], dayGoal: {}, exceeded: {}, startDate: '',
    rem: { breakfast: true, lunch: true, dinner: true }, pushOn: false,
    gen: 'none', genErr: '', genLeft: null, photoRatio: 0.75,
    access: { expires: null }
  };
}
var S = (function () { var d = defaults(), s = jget(KEY) || {}; for (var k in s) { d[k] = s[k]; } return d; })();
if (S.gen === 'running') { S.gen = 'error'; S.genErr = 'interrupted'; }
function save() { jset(KEY, S); }
(function prune() {
  var cut = Date.now() - 400 * 86400000;
  S.meals = (S.meals || []).filter(function (m) { return m && m.t > cut; });
})();

var CFG = { requireCode: false, vapidPublic: '', loaded: false };
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
function loadImages() {
  return Promise.all(['before', 'after'].map(function (k) {
    return idb.get(k).then(function (v) { if (v) { mem[k] = v; return setBlobURL(k, v); } });
  }));
}

/* ---------- réseau ---------- */
function post(url, data) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); });
}
var API = (window.SS_API || '').replace(/\/?$/, '/');
var HAS_API = !!window.SS_API;
function api(action, data) {
  if (!HAS_API) { return Promise.reject({ code: 'offline' }); }
  var body = { device: S.device, action: action };
  for (var k in (data || {})) { body[k] = data[k]; }
  return post(API + 'sync.php', body).then(function (r) { return r.j; });
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
function remaining() { return S.goal - sumMeals(todayMeals()).kcal; }

function dayInfo(key) {
  var list = S.meals.filter(function (m) { return m.day === key; });
  if (!list.length) { return null; }
  var total = sumMeals(list).kcal, g = S.dayGoal[key] || S.goal, r = total / g;
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
    '<div class="codeform"><div class="inp"><input id="codeInput" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="XXXX-XXXX"></div>' +
    '<button class="btn" type="submit">' + esc(tx('codeBtn')) + '</button></div>' +
    (msg ? '<p class="' + (isErr ? 'err' : 'note') + '" role="alert">' + esc(msg) + '</p>' : '') + '</div></form>';
}
function viewWelcome() {
  var need = CFG.requireCode && !accessOk();
  var ok = CFG.requireCode && accessOk() ? '<p class="note">' + esc(tx('codeOk')(longDate(new Date(S.access.expires * 1000)))) + '</p>' : '';
  return '<div class="view">' + dots('welcome') +
    '<div class="hero"><h1>' + esc(tx('h1a')) + '<em>' + esc(tx('h1b')) + '</em></h1><p class="lead">' + esc(tx('lead')) + '</p>' +
    '<ul class="pills"><li>' + esc(tx('pill1')) + '</li><li>' + esc(tx('pill2')) + '</li><li>' + esc(tx('pill3')) + '</li></ul></div>' +
    (need ? codeForm(flash, true) : ok) +
    '<button class="btn big" type="button" data-act="welcome-next"' + (need ? ' disabled' : '') + '>' + esc(tx('start')) + '</button></div>';
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
    '<div class="field"><label for="pfAge">' + esc(tx('age')) + '</label><div class="inp"><input id="pfAge" type="number" inputmode="numeric" min="14" max="90" autocomplete="off"><span class="u">' + esc(tx('ageU')) + '</span></div></div>' +
    '<div class="field"><label for="pfWeight">' + esc(tx('weight')) + '</label><div class="inp"><input id="pfWeight" type="number" inputmode="decimal" min="30" max="250" step="0.1" autocomplete="off"><span class="u">' + esc(tx('weightU')) + '</span></div></div>' +
    '<div class="field"><label for="pfHeight">' + esc(tx('height')) + '</label><div class="inp"><input id="pfHeight" type="number" inputmode="numeric" min="120" max="230" autocomplete="off"><span class="u">' + esc(tx('heightU')) + '</span></div></div></div>' +
    '<div class="group"><div class="q" id="qAct">' + esc(tx('actQ')) + '</div><div class="stack" role="radiogroup" aria-labelledby="qAct">' +
    opt('act', 'sed', tx('sed'), tx('sedD'), false) + opt('act', 'light', tx('light'), tx('lightD'), true) + opt('act', 'mod', tx('mod'), tx('modD'), false) + opt('act', 'high', tx('high'), tx('highD'), false) + '</div></div>' +
    '<div class="group"><div class="q" id="qGoal">' + esc(tx('goalQ')) + '</div><div class="stack" role="radiogroup" aria-labelledby="qGoal">' +
    opt('goal', 'lose', tx('lose'), tx('loseD'), false) + opt('goal', 'keep', tx('keep'), tx('keepD'), false) + opt('goal', 'gain', tx('gain'), tx('gainD'), false) + '</div></div>' +
    '<p class="err" id="formErr" role="alert" hidden></p><p class="note">' + esc(tx('medNote')) + '</p>' +
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
    p.age >= 14 && p.age <= 90 && p.weight >= 30 && p.weight <= 250 && p.height >= 120 && p.height <= 230;
}
function submitProfile() {
  var p = readForm(), fe = $('formErr');
  if (!validProfile(p)) { fe.textContent = tx('errForm'); fe.hidden = false; return; }
  fe.hidden = true;
  var old = S.profile;
  p.startWeight = old && S.startDate ? old.startWeight : p.weight;
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
  var p = S.profile, r = compute(p), notes = [];
  if (r.minor) { notes.push(tx('minorNote')); } else if (p.forcedKeep) { notes.push(tx('noRoom')); } else { notes.push(tx(r.eff === 'lose' ? 'adjLose' : r.eff === 'gain' ? 'adjGain' : 'adjKeep')); }
  if (r.floored) { notes.push(tx('floorNote')(r.floor)); }
  var h = '<div class="view">' + dots('goal') + '<div class="res-card"><div class="res-title">' + esc(tx('resTitle')) + '</div><div class="res-num">' + fmt(r.target) + '</div><div class="res-title">' + esc(tx('perDay')) + '</div></div>' +
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
  S.goal = compute(S.profile).target;
  if (S.startDate) {                       // recalcul depuis l'accueil
    save();
    if (eligiblePhoto() && mem.before && S.gen !== 'running') { S.gen = 'stale'; }
    go('home'); syncState(); return;
  }
  save();
  go('remind');
}

/* ---------- 4. photo avant ---------- */
function viewPhoto() {
  var prev = BODY ? BODY.dataURL : (IMG.before || '');
  var h = '<div class="view"><div class="hero"><h1 style="font-size:1.9rem">' + esc(tx('pTitle')) + '</h1><p class="lead">' + esc(tx('pLead')) + '</p></div>';
  h += '<div class="panel">' + (prev ? '<img class="photo-prev" src="' + prev + '" alt="">' : '') +
    '<div class="upload"><label class="snap" for="bodyCam">' + ICON.camera + '<span>' + esc(prev ? tx('pAgain') : tx('pTake')) + '</span></label>' +
    '<label class="link" for="bodyPick">' + esc(tx('pPick')) + '</label></div>' +
    '<label class="check"><input type="checkbox" id="consent"' + (S.consent ? ' checked' : '') + '><span>' + esc(tx('pConsent')) + '</span></label>' +
    '<p class="note">' + esc(tx('pNote')) + '</p>' +
    '<button class="btn big" type="button" data-act="photo-next" id="photoNext"' + (prev && S.consent ? '' : ' disabled') + '>' + esc(tx('next')) + '</button></div>' +
    '<button class="link" type="button" data-act="photo-skip">' + esc(tx('pSkip')) + '</button></div>';
  return h;
}
function onBodyFile(input) {
  var f = input.files && input.files[0]; input.value = '';
  if (!f) { return; }
  shrink(f, 1280, 0.86).then(function (r) { BODY = r; renderMain(); }).catch(function () {});
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
    api('state', { date: k, total: sumMeals(list).kcal, goal: S.goal, count: list.length, byType: by, exceededAt: S.exceeded[k] || 0, lastExceededDate: ex, lang: S.lang, prefs: prefsPayload() }).catch(function () {});
  }, now ? 50 : 800);
}
function finishOnboarding() {
  S.startDate = dkey();
  S.weights = [{ d: S.startDate, kg: S.profile.startWeight }];
  S.step = 'home';
  var withPhoto = BODY && S.consent;
  var chain = withPhoto ? putImage('before', BODY.dataURL).then(function () { S.photoRatio = BODY.ratio; BODY = null; }) : Promise.resolve();
  chain.then(function () { save(); renderMain(); if (withPhoto && eligiblePhoto()) { generateAfter(); } });
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
  var h = '', r = S.photoRatio ? clamp(S.photoRatio, 0.55, 1.2) : 0.75;
  if (S.profile && S.profile.age >= 18) {
    if (S.gen === 'running' && IMG.before) {
      h += '<div class="ba gen" style="aspect-ratio:' + r + '"><img src="' + IMG.before + '" alt=""><div class="over"><span class="spinner"></span><span>' + esc(tx('heroGen')) + '</span><span style="font-weight:600;font-size:.9rem">' + esc(tx('heroGenSub')) + '</span></div></div>';
    } else {
      function side(cls, src, text) { return src ? '<img class="' + cls + '" src="' + src + '" alt="">' : '<div class="' + cls + ' ph"><span>' + esc(text) + '</span></div>'; }
      h += '<div class="card pad-sm"><h2>' + esc(tx('heroAddT')) + '</h2><p class="hint">' + esc(tx('heroAddP')) + '</p></div>' +
        '<div class="ba" id="ba" style="aspect-ratio:' + r + '">' + side('after', IMG.after, tx('phAfter')) + side('before', IMG.before, tx('phBefore')) +
        '<span class="tag l">' + esc(tx('before')) + '</span><span class="tag r">' + esc(tx('after')) + '</span><div class="line"></div>' +
        '<div class="knob" id="knob" role="slider" tabindex="0" aria-label="' + esc(tx('slideHint')) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' + ICON.arrows + '</div></div>';
      var em = '';
      if (S.gen === 'error' && S.genErr && S.genErr !== 'noai') { em = S.genErr === 'soon' ? tx('e_soon') : S.genErr === 'interrupted' ? tx('heroErrInt') : (S.genLeft === 0 ? tx('heroLimit') : tx('heroErr')); }
      h += (em ? '<p class="err" style="text-align:center">' + esc(em) + '</p>' : '') +
        '<div class="two-btns"><button class="btn ghost" type="button" data-act="goto-photo">' + esc(IMG.before ? tx('heroNew') : tx('heroAddBtn')) + '</button>' +
        (IMG.before && S.genLeft !== 0 ? '<button class="btn ghost" type="button" data-act="gen-retry">' + esc(IMG.after ? tx('heroRegen') : tx('heroRetry')) + '</button>' : '') + '</div>';
    }
  }
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
    var over = sumMeals(todayMeals()).kcal - S.goal;
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
  return h;
}
function refreshBanners() { var el = $('banners'); if (el) { el.innerHTML = bannersHTML(); } }

/* jauge du jour */
function refreshDay() {
  var el = $('day'); if (!el) { return; }
  var s = sumMeals(todayMeals()), goal = S.goal, ratio = goal ? s.kcal / goal : 0, u = tx('g');
  var cls = ratio > 1 ? ' bad' : (ratio >= 0.85 ? ' warn' : '');
  var open = $('goalPanel') && !$('goalPanel').hidden;
  function tile(c, label, v, extra) { return '<div class="tile ' + c + '"><div class="lbl">' + esc(label) + '</div><div class="val">' + v + '<small>' + u + '</small></div>' + (extra ? '<div class="sg">' + esc(extra) + '</div>' : '') + '</div>'; }
  var date = ''; try { var d = new Date().toLocaleDateString(tx('locale'), { weekday: 'long', day: 'numeric', month: 'long' }); date = d.charAt(0).toUpperCase() + d.slice(1); } catch (e) {}
  el.innerHTML = '<p class="date">' + esc(date) + '</p>' +
    '<div class="gauge' + cls + '" id="gauge" aria-live="polite"><div class="ring-wrap"><svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><circle class="track" cx="110" cy="110" r="88"/>' +
    '<circle class="prog" cx="110" cy="110" r="88" stroke-dasharray="552.92" stroke-dashoffset="' + (552.92 * (1 - Math.min(ratio, 1))) + '" transform="rotate(-90 110 110)"/></svg>' +
    '<div class="ring-center"><div class="num">' + fmt(s.kcal) + '</div><div class="sub">' + esc(tx('of')(goal)) + '</div></div></div>' +
    '<p class="remain">' + esc(ratio > 1 ? tx('over')(s.kcal - goal) : tx('left')(goal - s.kcal)) + '</p>' +
    '<button class="goal-btn" type="button" data-act="goal-toggle" aria-expanded="' + open + '" aria-controls="goalPanel">' + ICON.pencil + '<span>' + esc(tx('goalBtn')(goal)) + '</span></button>' +
    '<form class="goal-panel" id="goalPanel"' + (open ? '' : ' hidden') + '><label for="goalInput">' + esc(tx('goalLabel')) + '</label><p class="hint">' + esc(tx('goalHelp')) + '</p>' +
    '<div class="chips">' + [1500, 1800, 2000, 2200, 2500].map(function (n) { return '<button type="button" class="chip" data-act="goal-chip" data-v="' + n + '" aria-pressed="' + (n === goal) + '">' + n + '</button>'; }).join('') + '</div>' +
    '<div class="goal-row"><input id="goalInput" type="number" inputmode="numeric" min="800" max="6000" step="50" value="' + goal + '"><button class="btn" type="submit">' + esc(tx('save')) + '</button></div></form></div>' +
    '<div class="macros">' + tile('c', tx('carbs'), s.carbs, tx('sugarIn') + ' ' + s.sugar + ' ' + u) + tile('p', tx('protein'), s.protein, '') + tile('f', tx('fat'), s.fat, '') + '</div>';
}

/* repas du jour */
function refreshMeals() {
  var el = $('meals'); if (!el) { return; }
  var list = todayMeals(), u = tx('unit');
  el.innerHTML = '<h2>' + esc(tx('logTitle')) + '</h2>' + (list.length ? '<ul>' + list.map(function (m) {
    var d = new Date(m.t);
    return '<li class="meal"><span class="time">' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</span><span class="nm">' + esc(nameOf(m)) + '</span><span class="kc">' + m.kcal + ' ' + u + '</span>' +
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
  for (var d = 1; d <= days; d++) {
    var key = y + '-' + pad(m + 1) + '-' + pad(d), inf = dayInfo(key), cls = 'cal-cell' + (key === today ? ' today' : '') + (key > today ? ' future' : '');
    var label = d + ' ' + title.split(' ')[0] + ' : ' + (inf ? names[inf.status] : tx('dN'));
    cells += '<div class="' + cls + '" role="img" aria-label="' + esc(label) + '"><span class="d">' + d + '</span>' + (inf ? face(inf.status) : '<span class="dot"></span>') + '</div>';
  }
  var nowM = new Date(); var isCurrent = calMonth.getFullYear() === nowM.getFullYear() && calMonth.getMonth() === nowM.getMonth();
  var st = calStats();
  el.innerHTML = '<div class="card"><div class="cal-head"><h2>' + esc(title) + '</h2><div class="cal-nav"><button type="button" data-act="cal-prev" aria-label="' + esc(tx('calPrev')) + '">' + ICON.chevL + '</button>' +
    '<button type="button" data-act="cal-next" aria-label="' + esc(tx('calNext')) + '"' + (isCurrent ? ' disabled' : '') + '>' + ICON.chevR + '</button></div></div>' +
    '<div class="cal-grid">' + wd + cells + '</div>' +
    '<div class="legend"><span>' + face('good') + esc(tx('legG')) + '</span><span>' + face('mid') + esc(tx('legO')) + '</span><span>' + face('bad') + esc(tx('legR')) + '</span></div>' +
    '<div class="cal-stats"><div><b>' + st.good + '</b>' + esc(tx('calDays')) + '</div><div><b>' + st.streak + '</b>' + esc(tx('calStreak')) + '</div></div></div>';
}

/* réglages */
function refreshSettings() {
  var el = $('settings'); if (!el) { return; }
  var st = notifState(), msg = flash || notifMsg(st);
  el.innerHTML = '<div class="card"><h2>' + esc(tx('sTitle')) + '</h2>' +
    '<div><div class="switch-row"><span>' + esc(tx('sNotif')) + '<small>' + esc(S.pushOn ? tx('sNotifOn') : tx('sNotifOff')) + '</small></span>' +
    (st === 'ready' && !S.pushOn ? '<button class="btn" type="button" data-act="notif-enable" data-from="settings" style="min-height:44px">' + esc(tx('rEnable')) + '</button>' : (S.pushOn ? '<label class="switch"><input type="checkbox" data-act="push-toggle" checked aria-label="' + esc(tx('sNotif')) + '"><i></i></label>' : '')) + '</div>' +
    '<div>' + remindRows() + '</div></div>' + (msg && !S.pushOn ? '<p class="note" role="status">' + esc(msg) + '</p>' : '') +
    '<button class="btn ghost" type="button" data-act="recalc">' + esc(tx('sRecalc')) + '</button>' +
    (deferredInstall ? '<button class="btn ghost" type="button" data-act="install">' + esc(tx('sInstall')) + '</button>' : '') +
    '<button class="link" type="button" data-act="reset">' + esc(resetArmed ? tx('sResetAsk') : tx('sReset')) + '</button><p class="note" style="text-align:center">' + esc(tx('sResetNote')) + '</p></div>';
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
function generateAfter() {
  if (!HAS_API) { S.gen = 'error'; S.genErr = 'soon'; save(); refreshHero(); return; }
  var p = S.profile; if (!mem.before || !p) { return; }
  S.gen = 'running'; S.genErr = ''; save(); refreshHero();
  post(API + 'transform.php', { device: S.device, image: mem.before.split(',')[1], sex: p.sex, age: p.age, height: p.height, weight: p.startWeight, target: p.targetWeight, goal: p.goal })
    .then(function (r) {
      if (typeof r.j.left === 'number') { S.genLeft = r.j.left; }
      if (!r.ok || !r.j.image) { throw { code: r.j.error || 'upstream' }; }
      return reencode('data:' + (r.j.mime || 'image/png') + ';base64,' + r.j.image);
    })
    .then(function (url) { return putImage('after', url); })
    .then(function () { S.gen = 'done'; S.genErr = ''; save(); refreshHero(); })
    .catch(function (e) { S.gen = 'error'; S.genErr = (e && e.code) || 'network'; if (S.genErr === 'limit') { S.genLeft = 0; } save(); refreshHero(); });
}

var PORTIONS = [[0.25, '¼'], [0.5, '½'], [1, '1'], [1.5, '1½'], [2, '2']];
function mealBase() { return cur.items.reduce(function (a, i) { return a + i.kcal; }, 0); }
function mealKcal(mult) { return Math.round(mealBase() * mult); }
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
function closeCur() { if (cur && cur.ctl) { try { cur.ctl.abort(); } catch (e) {} } cur = null; }

function startAnalysis(file) {
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
  fetch(API + 'analyze.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined, body: JSON.stringify({ device: S.device, image: job.b64, mime: 'image/jpeg', lang: S.lang }) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
    .then(function (r) {
      if (cur !== job) { return; }
      if (!r.ok) { throw { code: r.j.error || 'generic' }; }
      var items = normalise(r.j);
      if (!items.length) { job.status = 'error'; job.err = 'notfood'; renderCapture(); return; }
      job.items = items; job.conf = r.j.confidence; job.mult = 1; job.status = 'result'; renderCapture();
      if (mealKcal(1) > remaining()) { job.alarmed = true; decisionAlarm(); }
    })
    .catch(function (e) {
      if (cur !== job || (e && e.name === 'AbortError')) { return; }
      var c = e && e.code; job.status = 'error';
      job.err = c === 'rate_limited' ? 'busy' : c === 'bad_image' ? 'badimg' : c === 'access' ? 'access' : c === 'config' ? 'config' : (e && e.name === 'TypeError' ? 'offline' : 'generic');
      if (job.err === 'access') { S.access.expires = null; save(); }
      renderCapture();
    });
}

function renderCapture() {
  var el = $('capture'); if (!el) { return; }
  var u = tx('unit'), g = tx('g');
  if (!cur) {
    el.innerHTML = '<label class="snap" for="foodPick" data-act="snap">' + ICON.camera + '<span>' + esc(tx('snap')) + '</span></label><label class="link" for="foodCam" data-act="snap">' + esc(tx('camNow')) + '</label>';
    return;
  }
  var thumb = cur.thumb ? '<img class="thumb" src="' + cur.thumb + '" alt="">' : '<span class="thumb"></span>';
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
  var t = totalsOf(cur.items, cur.mult), rem = remaining(), over = t.kcal - rem;
  var rows = cur.items.map(function (i) { return '<li><span>' + esc(nameOf(i)) + '</span><span class="k">' + Math.round(i.kcal * cur.mult) + ' ' + u + '</span></li>'; }).join('');
  var known = PORTIONS.some(function (p) { return p[0] === cur.mult; });
  var chips = PORTIONS.map(function (p) { return '<button type="button" class="chip' + (mealKcal(p[0]) <= rem ? ' fit' : '') + '" data-act="mult" data-v="' + p[0] + '" aria-pressed="' + (p[0] === cur.mult) + '">' + p[1] + '</button>'; }).join('') +
    (known ? '' : '<button type="button" class="chip" aria-pressed="true">' + esc(tx('pctCustom')(Math.round(cur.mult * 100))) + '</button>');
  var warn = '';
  if (over > 0) {
    var lm = limitMult();
    warn = '<div class="warn-box"><b>' + esc(tx('wOver')(over)) + '</b><span class="hint">' + esc(tx('wHelp')) + '</span><div class="chips">' +
      '<button type="button" class="chip" data-act="mult" data-v="0.25">' + esc(tx('cQuarter')) + '</button><button type="button" class="chip" data-act="mult" data-v="0.5">' + esc(tx('cHalf')) + '</button>' +
      (lm > 0 ? '<button type="button" class="chip" data-act="limit">' + esc(tx('cLimit')) + '</button>' : '<button type="button" class="chip" data-act="cancel">' + esc(tx('cSkip')) + '</button>') + '</div></div>';
  }
  el.innerHTML = '<div class="card"><div class="card-head">' + thumb + '<div><div class="kcal-big">' + t.kcal + '<small>' + u + '</small></div>' +
    '<div class="mini"><span>' + esc(tx('carbs')) + ' <b>' + t.carbs + ' ' + g + '</b></span><span>' + esc(tx('protein')) + ' <b>' + t.protein + ' ' + g + '</b></span><span>' + esc(tx('fat')) + ' <b>' + t.fat + ' ' + g + '</b></span></div></div></div>' +
    '<ul class="items">' + rows + '</ul>' + warn +
    '<div class="portion"><span class="t">' + esc(tx('portion')) + '</span>' + chips + '</div>' +
    '<p class="hint">' + esc(cur.conf === 'low' ? tx('lowConf') : tx('estimate')) + '</p>' +
    '<div class="actions"><button type="button" class="btn" data-act="add">' + esc(tx('add')) + '</button><button type="button" class="btn ghost" data-act="cancel">' + esc(tx('cancel')) + '</button></div></div>';
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
  var rem = remaining(), over = mealKcal(1) - rem, fits = tx('aFits'), ch = [];
  var q = mealKcal(0.25), h = mealKcal(0.5), lm = limitMult();
  ch.push({ act: 'dec-mult', v: 0.25, label: tx('aQuarter')(q), sub: q <= rem ? fits : '' });
  ch.push({ act: 'dec-mult', v: 0.5, label: tx('aHalf')(h), sub: h <= rem ? fits : '' });
  if (lm > 0) { ch.push({ act: 'dec-mult', v: lm, label: tx('aLimit')(mealKcal(lm)), sub: fits }); }
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
  var total = sumMeals(todayMeals()).kcal, over = total - S.goal;
  if (over > 0 && !S.exceeded[k]) { S.exceeded[k] = Math.floor(now / 1000); }
  save(); closeCur();
  refreshAll(); syncState(over > 0);
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  if (over > 0 && !wasAlarmed) { openAlarm(tx('aFinal')(over), [{ act: 'alarm-close', label: tx('aOk') }]); }
}

function applyPrefs() { save(); syncState(true); }

function handleClick(ev) {
  var b = ev.target.closest('[data-act]'); if (!b) { return; }
  var act = b.getAttribute('data-act');
  switch (act) {
    case 'snap': unlockAudio(); break;
    case 'tab':
      unlockAudio();
      var tv = b.getAttribute('data-v');
      if (tv === 'today' && tab === 'today' && !cur) { $('foodPick').click(); } else { showTab(tv); }
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
    case 'gen-retry': generateAfter(); break;
    case 'cancel': closeCur(); renderCapture(); break;
    case 'retry': if (cur) { runAnalysis(cur); } break;
    case 'mult': if (cur) { cur.mult = Number(b.getAttribute('data-v')); renderCapture(); } break;
    case 'limit': if (cur) { cur.mult = limitMult() || 0.25; renderCapture(); } break;
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
      if (open) { $('goalInput').value = S.goal; }
      break;
    case 'goal-chip': $('goalInput').value = b.getAttribute('data-v'); break;
    case 'recalc': S.step = 'profile'; save(); renderMain(); break;
    case 'cal-prev': calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); refreshCal(); break;
    case 'cal-next': calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); refreshCal(); break;
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
  if (!(BODY || IMG.before) || !S.consent) { return; }
  if (S.startDate) {                                      // photo ajoutée ou changée depuis l'accueil
    var fresh = !!BODY;
    var chain = fresh ? putImage('before', BODY.dataURL).then(function () { S.photoRatio = BODY.ratio; BODY = null; }) : Promise.resolve();
    chain.then(function () { save(); go('home'); if (eligiblePhoto() && (fresh || !IMG.after)) { generateAfter(); } });
    return;
  }
  go('remind');
}
function resetEverything() {
  try { navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription(); }).then(function (s) { if (s) { api('unsubscribe').catch(function () {}); return s.unsubscribe(); } }).catch(function () {}); } catch (e) {}
  try { localStorage.removeItem(KEY); } catch (e) {}
  idb.clear().then(function () { location.reload(); });
}

function handleChange(ev) {
  var t = ev.target;
  if (t.id === 'foodPick' || t.id === 'foodCam') { var f = t.files && t.files[0]; t.value = ''; if (f) { unlockAudio(); startAnalysis(f); } return; }
  if (t.id === 'bodyPick' || t.id === 'bodyCam') { onBodyFile(t); return; }
  if (t.id === 'consent') { S.consent = t.checked; save(); var n = $('photoNext'); if (n) { n.disabled = !((BODY || IMG.before) && S.consent); } return; }
  var act = t.getAttribute && t.getAttribute('data-act');
  if (act === 'rem-toggle') { S.rem[t.getAttribute('data-k')] = t.checked; applyPrefs(); }
  else if (act === 'push-toggle') {
    if (!t.checked) { S.pushOn = false; save(); api('unsubscribe').catch(function () {}); refreshSettings(); }
  }
}
function handleSubmit(ev) {
  var f = ev.target.id; if (!f) { return; }
  ev.preventDefault();
  if (f === 'profileForm') { submitProfile(); }
  else if (f === 'targetForm') {
    var p = S.profile, o = targetOptions(p), v = parseFloat($('tInput').value.replace(',', '.'));
    if (!isFinite(v) || v < o.lo || v > o.hi) { setTarget(isFinite(v) ? v : p.weight, true); return; }
    p.targetWeight = Math.round(v * 10) / 10; afterGoal();
  }
  else if (f === 'goalPanel') {
    S.goal = clamp(Math.round(Number($('goalInput').value) || S.goal), 800, 6000);
    var k = dkey(); if (S.dayGoal[k]) { S.dayGoal[k] = S.goal; }
    save(); refreshDay(); refreshCal(); syncState();
  }
  else if (f === 'weighForm') {
    var kg = parseFloat($('weighInput').value.replace(',', '.')), msg = $('weighMsg');
    if (!isFinite(kg) || kg < 30 || kg > 250) { msg.textContent = tx('weighBad'); msg.className = 'err'; return; }
    addWeight(Math.round(kg * 10) / 10); refreshHero(); refreshBanners();
    var m2 = $('weighMsg'); if (m2) { m2.textContent = tx('weighDone'); }
  }
  else if (f === 'codeForm') {
    var code = $('codeInput').value;
    api('activate', { code: code }).then(function (j) {
      if (j && j.ok) { S.access.expires = j.expires; save(); flash = ''; if (S.step === 'welcome') { renderMain(); } else if (cur) { runAnalysis(cur); } return; }
      flash = j && j.error === 'used' ? tx('codeUsed') : tx('codeInvalid');
      if (S.step === 'welcome') { renderMain(); flash = ''; } else { var c = $('codeForm'); if (c) { var pn = document.createElement('p'); pn.className = 'err'; pn.textContent = flash; c.appendChild(pn); } flash = ''; }
    }).catch(function () { flash = tx('e_offline'); if (S.step === 'welcome') { renderMain(); } flash = ''; });
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);
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

renderMain();
loadImages().then(function () { if (S.step === 'home') { refreshHero(); } else if (S.step === 'photo') { renderMain(); } });
ensureConfig().then(function () {
  if (S.step === 'welcome') { renderMain(); }
  if (CFG.requireCode) { api('status').then(function (j) { if (j && j.access) { S.access.expires = j.access.expires; if (typeof j.transformLeft === 'number') { S.genLeft = j.transformLeft; } save(); if (S.step === 'welcome') { renderMain(); } } }).catch(function () {}); }
}).catch(function () {});
})();
