// ════════════════════════════════════════════════════════════════
// onboarding.js  —  YDT Master Pro  Karşılama & Seviye Testi
// Adım 1: Yaş grubu seç  →  Adım 2: Seviye testi (16+ için)
//         → Adım 3: Sonuç & Yönlendirme
// Zorunlu değil — "Atla" her zaman mevcut
// ════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════
   SORULAR  —  Offline, hazır, 10 adet
   Her soruya CEFRLevel atandı (A1-C1)
   Doğru cevap sayısına göre seviye hesaplanır
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════
   OB_QUESTION_POOL — 100 soruluk havuz (A1×20, A2×20, B1×20, B2×20, C1×20)
   Her test oturumunda her seviyeden 2 soru rastgele seçilir → toplam 10 soru.
   Kullanıcı her girişte farklı sorularla karşılaşır.
   ════════════════════════════════════════════════════════════════ */
const OB_QUESTION_POOL = {
    A1: [
        { q: 'She ___ to school every day.',               blank:true,  opts:['go','goes','going','gone'],                                       ans:1 },
        { q: 'They ___ football every Saturday.',          blank:true,  opts:['play','plays','playing','played'],                                 ans:0 },
        { q: 'What is the meaning of "happy"?',            blank:false, opts:['Sad','Angry','Joyful','Tired'],                                    ans:2 },
        { q: 'I ___ a student.',                           blank:true,  opts:['am','is','are','be'],                                             ans:0 },
        { q: 'She ___ a book right now.',                  blank:true,  opts:['read','reads','is reading','has read'],                            ans:2 },
        { q: 'What does "big" mean?',                      blank:false, opts:['Small','Fast','Large','Cold'],                                     ans:2 },
        { q: 'There ___ a cat on the roof.',               blank:true,  opts:['am','is','are','be'],                                             ans:1 },
        { q: 'He ___ coffee every morning.',               blank:true,  opts:['drink','drinks','drinking','drank'],                               ans:1 },
        { q: 'The opposite of "hot" is ___.',              blank:false, opts:['Warm','Cool','Cold','Wet'],                                        ans:2 },
        { q: 'We ___ to the cinema yesterday.',            blank:true,  opts:['go','goes','went','gone'],                                         ans:2 },
        { q: 'What is a "chair" used for?',                blank:false, opts:['Eating','Sitting','Sleeping','Writing'],                           ans:1 },
        { q: 'She ___ not like spicy food.',               blank:true,  opts:['do','does','did','is'],                                           ans:1 },
        { q: 'I have ___ brothers.',                       blank:true,  opts:['two','a','an','much'],                                            ans:0 },
        { q: 'The sun ___ in the east.',                   blank:true,  opts:['rise','rises','rising','rose'],                                    ans:1 },
        { q: 'What does "fast" mean?',                     blank:false, opts:['Slow','Quick','Heavy','Quiet'],                                    ans:1 },
        { q: '___ you speak English?',                     blank:true,  opts:['Do','Does','Are','Is'],                                           ans:0 },
        { q: 'My mother ___ dinner every evening.',        blank:true,  opts:['cook','cooks','cooking','cooked'],                                 ans:1 },
        { q: 'What is the plural of "child"?',             blank:false, opts:['Childs','Childen','Children','Childrens'],                         ans:2 },
        { q: 'He ___ football yesterday.',                 blank:true,  opts:['play','plays','played','playing'],                                 ans:2 },
        { q: 'What does "cold" mean?',                     blank:false, opts:['Very hot','Not warm','Wet','Loud'],                                ans:1 },
    ],
    A2: [
        { q: 'I have lived here ___ ten years.',           blank:true,  opts:['since','for','from','during'],                                     ans:1 },
        { q: 'What is the meaning of "ancient"?',          blank:false, opts:['Very new','Very old','Very large','Very fast'],                    ans:1 },
        { q: 'She ___ to Paris three times.',              blank:true,  opts:['has been','have been','was','been'],                               ans:0 },
        { q: 'If you ___ harder, you will pass.',          blank:true,  opts:['study','studied','studying','studies'],                            ans:0 },
        { q: 'The book ___ by Orwell.',                    blank:true,  opts:['write','wrote','was written','is writing'],                        ans:2 },
        { q: 'What does "exhausted" mean?',                blank:false, opts:['Very happy','Extremely tired','Very strong','Well-rested'],         ans:1 },
        { q: 'He asked me ___ I was fine.',                blank:true,  opts:['that','if','what','which'],                                        ans:1 },
        { q: 'I ___ in London since 2015.',                blank:true,  opts:['live','lived','have lived','am living'],                           ans:2 },
        { q: 'She ___ when the phone rang.',               blank:true,  opts:['cooks','was cooking','cooked','has cooked'],                       ans:1 },
        { q: '"Curious" means someone who ___.',           blank:false, opts:['Dislikes others','Wants to know things','Is very shy','Sleeps a lot'], ans:1 },
        { q: 'They ___ the project by Friday.',            blank:true,  opts:['finish','finished','will have finished','are finishing'],           ans:2 },
        { q: 'What does "nervous" mean?',                  blank:false, opts:['Angry','Excited','Worried or anxious','Bored'],                    ans:2 },
        { q: 'He ___ to the store, so he\'s not here.',   blank:true,  opts:['goes','went','has gone','had gone'],                               ans:2 },
        { q: '"Generous" means someone who ___.',          blank:false, opts:['Is selfish','Gives freely to others','Is very shy','Talks too much'], ans:1 },
        { q: 'I wish I ___ speak French.',                 blank:true,  opts:['can','could','will','would'],                                      ans:1 },
        { q: 'The report ___ before the meeting.',         blank:true,  opts:['finish','finished','was finished','finishing'],                     ans:2 },
        { q: 'What does "rare" mean?',                     blank:false, opts:['Common','Unusual or not often seen','Cheap','Loud'],               ans:1 },
        { q: 'She ___ her homework before dinner.',        blank:true,  opts:['finish','finishes','had finished','has finished'],                  ans:3 },
        { q: '"Fortunate" is closest in meaning to ___.',  blank:false, opts:['Unlucky','Wealthy','Lucky','Miserable'],                           ans:2 },
        { q: 'He told me not ___ late.',                   blank:true,  opts:['be','to be','being','been'],                                       ans:1 },
    ],
    B1: [
        { q: 'By the time we arrived, the film ___ started.', blank:true,  opts:['has','had','was','is'],                                        ans:1 },
        { q: 'If I ___ rich, I would travel the world.',   blank:true,  opts:['am','was','were','be'],                                           ans:2 },
        { q: '"Eloquent" means someone who is ___.',        blank:false, opts:['Very strong','Well-spoken','Extremely lazy','Easily confused'],    ans:1 },
        { q: 'Despite ___ hard, he failed the exam.',      blank:true,  opts:['study','studied','studying','studies'],                            ans:2 },
        { q: 'She suggested ___ a taxi.',                  blank:true,  opts:['take','to take','taking','took'],                                  ans:2 },
        { q: '"Ambiguous" means something that ___.',       blank:false, opts:['Is very clear','Has more than one meaning','Is expensive','Moves quickly'], ans:1 },
        { q: 'He would have passed if he ___ studied.',    blank:true,  opts:['has','had','was','were'],                                          ans:1 },
        { q: 'The results are ___ than expected.',         blank:true,  opts:['more better','worse','more worse','gooder'],                       ans:1 },
        { q: '"Inevitable" is closest in meaning to ___.',  blank:false, opts:['Avoidable','Certain to happen','Very expensive','Easy to forget'], ans:1 },
        { q: 'She ___ the task before he arrived.',        blank:true,  opts:['completes','completed','had completed','will complete'],           ans:2 },
        { q: 'Not only ___ he arrive late, but he forgot the report.', blank:true, opts:['did','had','was','were'],                              ans:0 },
        { q: '"Skeptical" describes someone who ___.',      blank:false, opts:['Believes everything','Questions and doubts','Is very social','Is always cheerful'], ans:1 },
        { q: 'The sooner we start, ___ we finish.',        blank:true,  opts:['the sooner','the soon','sooner','soon'],                          ans:0 },
        { q: '"Diligent" means someone who ___.',           blank:false, opts:['Is very lazy','Works hard and carefully','Speaks fast','Is distracted'], ans:1 },
        { q: 'I had my car ___.',                          blank:true,  opts:['repair','repaired','repairing','to repair'],                       ans:1 },
        { q: 'She is used to ___ early.',                  blank:true,  opts:['wake','wakes','waking','woken'],                                   ans:2 },
        { q: '"Substantial" is closest in meaning to ___.',blank:false, opts:['Very small','Quite large or significant','Extremely fast','Barely noticeable'], ans:1 },
        { q: 'Rarely ___ so motivated.',                   blank:true,  opts:['I feel','I have felt','have I felt','do I feel'],                  ans:2 },
        { q: '"Persevere" means to ___.',                  blank:false, opts:['Give up quickly','Continue despite difficulty','Change your mind','Avoid challenges'], ans:1 },
        { q: 'The experiment ___ by the team overnight.',  blank:true,  opts:['conduct','conducted','was conducted','is conducting'],             ans:2 },
    ],
    B2: [
        { q: 'The project was completed ___ schedule.',    blank:true,  opts:['ahead of','in front of','on top of','in spite of'],                ans:0 },
        { q: 'Choose the sentence in passive voice:',      blank:false, opts:['They built the bridge in 1990.','The bridge was built in 1990.','Building took years.','Bridge building ended in 1990.'], ans:1 },
        { q: '"Pragmatic" describes someone who ___.',     blank:false, opts:['Is very idealistic','Deals with things practically','Is overly emotional','Avoids responsibility'], ans:1 },
        { q: 'Had I known earlier, I ___ differently.',   blank:true,  opts:['act','acted','would have acted','will act'],                        ans:2 },
        { q: '"Superficial" means something that ___.',    blank:false, opts:['Is very deep','Only deals with the surface','Is extremely important','Is permanent'], ans:1 },
        { q: 'The findings ___ further investigation.',    blank:true,  opts:['warrant','warrants','warranted','warranting'],                      ans:0 },
        { q: '"Verbose" describes writing or speech that is ___.',blank:false, opts:['Brief and clear','Using too many words','Very poetic','Technically precise'], ans:1 },
        { q: 'She managed to ___ all expectations.',       blank:true,  opts:['surpass','bypass','overpass','underpass'],                         ans:0 },
        { q: '"Tenacious" describes someone who ___.',     blank:false, opts:['Gives up easily','Holds on firmly to goals','Changes opinions often','Is overly emotional'], ans:1 },
        { q: 'The proposal was met with ___ criticism.',   blank:true,  opts:['scathing','scathe','scathed','scathingly'],                        ans:0 },
        { q: '"Coherent" means an argument that is ___.',  blank:false, opts:['Confusing and unclear','Logical and well-organized','Very emotional','Heavily biased'], ans:1 },
        { q: 'The policy aims to ___ inequality.',         blank:true,  opts:['mitigate','mitigating','mitigated','mitigates'],                   ans:0 },
        { q: '"Ephemeral" means something that ___.',      blank:false, opts:['Lasts forever','Lasts a very short time','Is very large','Is very important'], ans:1 },
        { q: 'The journalist ___ the story with great care.', blank:true, opts:['broke','break','breaking','broken'],                            ans:0 },
        { q: '"Plausible" describes a story that is ___.',blank:false, opts:['Clearly false','Seemingly reasonable','Very complicated','Emotionally moving'], ans:1 },
        { q: 'No sooner ___ sat down than the alarm rang.',blank:true, opts:['I had','had I','I have','have I'],                                  ans:1 },
        { q: '"Clandestine" describes activities done ___.',blank:false, opts:['Openly and proudly','In secret','Very noisily','With great skill'], ans:1 },
        { q: 'The committee ___ its decision tomorrow.',   blank:true,  opts:['will announce','announced','has announced','announces'],            ans:0 },
        { q: '"Altruistic" describes someone who ___.',    blank:false, opts:['Acts only for personal gain','Acts for the benefit of others','Is very aggressive','Avoids social contact'], ans:1 },
        { q: 'The evidence was ___ to support the claim.', blank:true, opts:['insufficient','sufficiently','sufficient','insuf'],                 ans:0 },
    ],
    C1: [
        { q: '"Meticulous" is closest in meaning to ___.',  blank:false, opts:['Careless','Extremely thorough','Somewhat interested','Overly emotional'], ans:1 },
        { q: 'The findings were so ___ they challenged decades of theory.', blank:true, opts:['mundane','ambiguous','groundbreaking','redundant'], ans:2 },
        { q: '"Equivocal" describes a statement that is ___.',blank:false, opts:['Very direct','Deliberately vague or ambiguous','Extremely rude','Very enthusiastic'], ans:1 },
        { q: 'The policy has far-reaching ___ for education.', blank:true, opts:['implications','implication','implicate','implicating'],         ans:0 },
        { q: '"Obfuscate" means to ___.',                   blank:false, opts:['Make very clear','Make unnecessarily confusing','Strongly disagree','Carefully organize'], ans:1 },
        { q: 'Her argument was ___ by her failure to cite evidence.', blank:true, opts:['undermined','undermine','undermining','is undermined'], ans:0 },
        { q: '"Recalcitrant" describes someone who ___.',   blank:false, opts:['Is very cooperative','Stubbornly resists authority','Is extremely talented','Speaks very eloquently'], ans:1 },
        { q: 'The legislation ___ widespread controversy among academics.', blank:true, opts:['precipitated','precipitate','precipitating','has precipitate'], ans:0 },
        { q: '"Inimical" means something that is ___.',     blank:false, opts:['Very friendly','Harmful or adverse to','Extremely useful','Widely accepted'], ans:1 },
        { q: 'The philosopher\'s works ___ the intellectual landscape.', blank:true, opts:['permeated','permeate','permeating','had permeate'],   ans:0 },
        { q: '"Solipsistic" thinking involves ___.',         blank:false, opts:['Considering others\' views','Belief only in one\'s own existence','Critical analysis','Scientific reasoning'], ans:1 },
        { q: 'The analysis was ___ by incomplete data.',    blank:true,  opts:['confounded','confound','confounding','confounds'],                ans:0 },
        { q: '"Inveterate" describes a habit that is ___.',  blank:false, opts:['Easily broken','Deeply established over time','Recently acquired','Very beneficial'], ans:1 },
        { q: 'Only by ___ can we hope to resolve systemic inequality.', blank:true, opts:['collaboration','collaborate','collaborating','collaborated'], ans:0 },
        { q: '"Perspicacious" describes someone with ___.',  blank:false, opts:['Poor judgment','Keen insight and understanding','A very loud personality','A tendency to procrastinate'], ans:1 },
        { q: 'The study\'s conclusions were ___ by its narrow sample.', blank:true, opts:['circumscribed','circumscribe','circumscribing','circumscribe'], ans:0 },
        { q: '"Didactic" literature primarily aims to ___.',  blank:false, opts:['Entertain without teaching','Instruct or teach a moral','Provoke emotions','Describe history objectively'], ans:1 },
        { q: 'The diplomat\'s remarks were deliberately ___.',blank:true,  opts:['elliptical','ellipse','elliptically','ellipting'],              ans:0 },
        { q: '"Iconoclast" refers to someone who ___.',      blank:false, opts:['Upholds tradition','Attacks cherished beliefs','Is deeply religious','Studies ancient symbols'], ans:1 },
        { q: 'The evidence ___ the prosecution\'s case beyond doubt.', blank:true, opts:['corroborated','corroborate','corroborating','corroborates'], ans:0 },
    ]
};

/**
 * _obBuildTestSet — Her test oturumunda havuzdan rastgele 2 soru/seviye seçer.
 * Toplam: A1×2 + A2×2 + B1×2 + B2×2 + C1×2 = 10 soru, kolaydan zora.
 * Fisher-Yates shuffle ile her seviye havuzu karıştırılır, ilk 2 alınır.
 */
function _obBuildTestSet() {
    const selected = [];
    ['A1','A2','B1','B2','C1'].forEach(lvl => {
        const pool = OB_QUESTION_POOL[lvl].map((q,i) => ({...q, level:lvl}));
        for (let i = pool.length-1; i > 0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [pool[i],pool[j]] = [pool[j],pool[i]];
        }
        selected.push(...pool.slice(0,2));
    });
    return selected; // A1→C1 sırası korunuyor
}

// Aktif test seti — obRenderStep2'de her seferinde yenilenir
let OB_QUESTIONS = _obBuildTestSet();

/* Doğru sayısına göre seviye */
const OB_LEVEL_MAP = [
    { min: 0,  max: 2,  code: 'A1', label: 'Başlangıç',    color: '#64748b', badge: 'ob-badge-a1', desc: 'Temel kelime ve gramerle başlayalım. Adım adım ilerleyeceksin!', recommend: 'Kelime Öğren modülünden "Örnek Liste" ile başla.' },
    { min: 3,  max: 4,  code: 'A2', label: 'Temel',        color: '#0ea5e9', badge: 'ob-badge-a2', desc: 'Temel yapıları biliyorsun. Vocabulary ve Grammar modülleri sana çok şey katacak.', recommend: 'Vocabulary Test + English Tenses modülüne odaklan.' },
    { min: 5,  max: 6,  code: 'B1', label: 'Orta',         color: '#22c55e', badge: 'ob-badge-b1', desc: 'İyi bir temel var! Şimdi B2 hedefliyoruz — paragraf okuma ve AI testleri tam sana göre.', recommend: 'Paragraf Okuma ve AI Vocabulary Test\'i dene.' },
    { min: 7,  max: 8,  code: 'B2', label: 'Orta-İleri',   color: '#f59e0b', badge: 'ob-badge-b2', desc: 'Güçlü bir seviyedesin! YDT\'ye hazırlanmak için AI testler ve Grammar modülleri ile devam et.', recommend: 'AI Vocabulary Test + Grammar modüllerini tamamla.' },
    { min: 9,  max: 10, code: 'C1', label: 'İleri',        color: '#8b5cf6', badge: 'ob-badge-c1', desc: 'Harika! C1 seviyesindesin. Akademik kelime hazineni genişletmek için devam et.', recommend: 'C1/C2 Paragraf Okuma ve Speaking modülünü keşfet.' }
];

/* ════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════ */
const OB = {
    step:        1,       // 1=yaş, 2=quiz, 3=sonuç
    ageGroup:    null,    // '4-8' | '9-12' | '16+'
    quizIdx:     0,
    quizScore:   0,
    answered:    false,
    levelResult: null,
    skipQuiz:    false,

    STORAGE_KEY:  'ydt_onboarding_done',
    PROFILE_KEY:  'ydt_user_profile',

    /* Daha önce tamamlandı mı? */
    isDone() {
        const uid = window._currentUser?.uid || 'guest';
        return !!localStorage.getItem(`${this.STORAGE_KEY}_${uid}`);
    },

    /* Profili kaydet */
    saveProfile(extra = {}) {
        const uid = window._currentUser?.uid || 'guest';
        const existing = this.getProfile();
        const profile = { ...existing, ageGroup: this.ageGroup, ...extra, updatedAt: Date.now() };
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem(`${this.PROFILE_KEY}_${uid}`, JSON.stringify(profile));
        if (this.levelResult) {
            profile.level = this.levelResult.code;
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
            localStorage.setItem(`${this.PROFILE_KEY}_${uid}`, JSON.stringify(profile));
        }
    },

    /* Profili oku */
    getProfile() {
        const uid = window._currentUser?.uid || 'guest';
        const raw = localStorage.getItem(`${this.PROFILE_KEY}_${uid}`)
                 || localStorage.getItem(this.PROFILE_KEY);
        try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
    },

    /* Tamamlandı olarak işaretle */
    markDone() {
        const uid = window._currentUser?.uid || 'guest';
        localStorage.setItem(`${this.STORAGE_KEY}_${uid}`, '1');
    }
};

/* ════════════════════════════════════════════
   AÇILIŞ KONTROLÜ
   index.html'deki auth onAuthStateChanged
   tamamlandıktan sonra çağrılır
   ════════════════════════════════════════════ */
function obCheckAndShow() {
    if (OB.isDone()) {
        obApplySavedProfile(); // banner render içeriyor
        return;
    }
    // Henüz test yapılmamış — önce banner'ı "test yap" modunda göster
    setTimeout(obRenderLevelBanner, 150);
    obShow();
}

/* Kaydedilmiş profili uygula (her sayfada sidebar vb.) */
function obApplySavedProfile() {
    const p = OB.getProfile();
    if (p.ageGroup) obApplySidebar(p.ageGroup);
    // Banner render — auth hazır olduğunda çağrılıyor
    setTimeout(obRenderLevelBanner, 100);
}

/* ════════════════════════════════════════════
   OVERLAY OLUŞTUR & GÖSTER
   ════════════════════════════════════════════ */
function obShow() {
    if (document.getElementById('onboarding-overlay')) return;

    const el = document.createElement('div');
    el.id = 'onboarding-overlay';
    el.innerHTML = obBuildStep1();
    document.body.appendChild(el);
}

function obClose(skipAll = false) {
    const el = document.getElementById('onboarding-overlay');
    if (!el) return;

    // "Atla" ile çıkıldıysa 16+ olarak kaydet — tüm modüller açık olsun
    if (skipAll && !OB.ageGroup) {
        OB.ageGroup = '16+';
    }

    OB.saveProfile();
    OB.markDone();
    if (OB.ageGroup) obApplySidebar(OB.ageGroup);
    el.classList.add('ob-fade-out');
    setTimeout(() => el.remove(), 420);

    // Dashboard güncelle + banner render et
    if (typeof initDashToday === 'function') setTimeout(initDashToday, 100);
    setTimeout(obRenderLevelBanner, 200);

    // Starter Pack: kelime yoksa otomatik yükle
    setTimeout(() => {
        if (typeof allData === 'undefined') return;
        const totalW = Object.keys(allData).reduce((s, k) => s + (allData[k] || []).length, 0);
        if (totalW === 0 && typeof YDT_STARTER_PACK !== 'undefined') {
            Object.keys(YDT_STARTER_PACK).forEach(k => { allData[k] = YDT_STARTER_PACK[k]; });
            if (typeof _saveData === 'function') _saveData();
            if (typeof initDashToday === 'function') initDashToday();
            obShowStarterToast();
        }
    }, 500);

    // 16+ + seviye testi tamamlandıysa yönlendirme
    if (!skipAll && OB.levelResult && OB.ageGroup === '16+') {
        obDoRedirect();
    }
    // 4-8 → Kids
    if (!skipAll && OB.ageGroup === '4-8') {
        setTimeout(() => {
            if (typeof KW !== 'undefined' && KW.open) KW.open();
        }, 500);
    }
    // 9-12 → study
    if (!skipAll && OB.ageGroup === '9-12') {
        setTimeout(() => {
            if (typeof startStudy === 'function') startStudy();
        }, 500);
    }
}

/* ════════════════════════════════════════════
   ADIM 1 — Yaş Grubu Seç
   ════════════════════════════════════════════ */
function obBuildStep1() {
    // Giriş yapan kullanıcının adını al (varsa)
    const user = window._currentUser;
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : null;
    const welcomeTitle = firstName
        ? `Hoş Geldin, ${firstName}! 🎉`
        : 'Hoş Geldin! 🎉';

    return `
    <div class="ob-card ob-step">
        <div class="ob-header">
            <div class="ob-logo">🎓</div>
            <div class="ob-title">${welcomeTitle}</div>
            <div class="ob-sub">YDT Master Pro'ya ilk girişin bu — sana özel bir<br>deneyim oluşturmak için <strong>yaş grubunu</strong> seç.</div>
            <div class="ob-welcome-note" style="
                margin:12px auto 0;
                max-width:340px;
                background:rgba(99,102,241,.12);
                border:1px solid rgba(99,102,241,.25);
                border-radius:10px;
                padding:10px 14px;
                font-size:.8rem;
                color:var(--ink2, #a0a8c0);
                line-height:1.5;
            ">
                💡 Bu adım isteğe bağlı — <em>Atla</em> butonuyla doğrudan<br>tüm içeriklere erişebilirsin.
            </div>
            <div class="ob-dots" style="margin-top:14px;">
                <div class="ob-dot active"></div>
                <div class="ob-dot"></div>
                <div class="ob-dot"></div>
            </div>
        </div>
        <div class="ob-body">
            <div class="ob-age-grid">
                <div class="ob-age-card" onclick="obSelectAge('4-8', this)">
                    <div class="ob-age-emoji">🌈</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">4 – 8 Yaş</div>
                        <div class="ob-age-desc">Oyunlu öğrenme, resimli kelimeler, eğlenceli aktiviteler</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">🎮 Oyunlar</span>
                            <span class="ob-age-tag">🌍 Kids English</span>
                            <span class="ob-age-tag">🔊 Sesli</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
                <div class="ob-age-card" onclick="obSelectAge('9-12', this)">
                    <div class="ob-age-emoji">🎒</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">9 – 12 Yaş</div>
                        <div class="ob-age-desc">Temel kelimeler, basit gramerde alıştırmalar, kelime oyunları</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">📖 Kelime</span>
                            <span class="ob-age-tag">🎯 Quiz</span>
                            <span class="ob-age-tag">🎮 Oyunlar</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
                <div class="ob-age-card" onclick="obSelectAge('16+', this)">
                    <div class="ob-age-emoji">🎓</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">13 Yaş ve Üzeri</div>
                        <div class="ob-age-desc">YDT hazırlık, tam grammar modülleri, AI testler, paragraf okuma</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">🤖 AI Test</span>
                            <span class="ob-age-tag">📐 Grammar</span>
                            <span class="ob-age-tag">📄 Paragraf</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
            </div>
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" id="ob-next-1" onclick="obStep1Next()" disabled>
                Devam Et →
            </button>
            <div class="ob-skip-link">
                <button class="ob-skip-btn" onclick="obClose(true)">⚡ Atla — direkt siteye git</button>
            </div>
        </div>
    </div>`;
}

function obSelectAge(group, el) {
    OB.ageGroup = group;
    document.querySelectorAll('.ob-age-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('ob-next-1');
    if (btn) btn.disabled = false;
}

function obStep1Next() {
    if (!OB.ageGroup) return;

    // 4-8 ve 9-12 → doğrudan kapat/yönlendir
    if (OB.ageGroup !== '16+') {
        obClose(false);
        return;
    }

    // 16+ → Seviye testini sor
    obRenderStep2();
}

/* ════════════════════════════════════════════
   ADIM 2 — Seviye Testi (16+ için)
   ════════════════════════════════════════════ */
function obRenderStep2() {
    OB.step = 2;
    OB.quizIdx = 0;
    OB.quizScore = 0;
    OB.answered = false;
    // Her test başında havuzdan yeni rastgele soru seti oluştur
    OB_QUESTIONS = _obBuildTestSet();

    const card = document.querySelector('.ob-card');
    if (!card) return;

    card.innerHTML = `
        <div class="ob-header">
            <div class="ob-logo">🧠</div>
            <div class="ob-title">Seviye Testi</div>
            <div class="ob-sub">10 kısa soru — yaklaşık <strong>2 dakika</strong>.<br>Cevaplarına göre sana özel içerik önereceğiz.</div>
            <div class="ob-welcome-note" style="
                margin:8px auto 0;
                max-width:320px;
                background:rgba(99,102,241,.1);
                border:1px solid rgba(99,102,241,.2);
                border-radius:8px;
                padding:8px 12px;
                font-size:.78rem;
                color:var(--ink2,#a0a8c0);
            ">⚡ Testi geçmek istersen <strong>Testi Atla</strong>'ya tıkla — tüm içeriklere anında erişirsin.</div>
            <div class="ob-dots" style="margin-top:12px;">
                <div class="ob-dot done"></div>
                <div class="ob-dot active"></div>
                <div class="ob-dot"></div>
            </div>
        </div>
        <div class="ob-body" id="ob-quiz-body">
            ${obBuildQuizQ(0)}
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" id="ob-quiz-btn" onclick="obQuizAction()" disabled>
                Cevapla
            </button>
            <div class="ob-skip-link">
                <button class="ob-skip-btn" onclick="obSkipQuiz()">Testi atla</button>
            </div>
        </div>`;

    card.classList.remove('ob-step');
    void card.offsetWidth;
    card.classList.add('ob-step');
}

function obBuildQuizQ(idx) {
    const q = OB_QUESTIONS[idx];
    const letters = ['A', 'B', 'C', 'D'];
    const pct = Math.round((idx / OB_QUESTIONS.length) * 100);

    const questionHtml = q.blank
        ? q.q.replace('___', '<em>___</em>')
        : q.q;

    return `
        <div class="ob-quiz-progress-wrap">
            <div class="ob-quiz-progress-top">
                <span class="ob-quiz-progress-lbl">Soru</span>
                <span class="ob-quiz-progress-num">${idx + 1} / ${OB_QUESTIONS.length}</span>
            </div>
            <div class="ob-quiz-progress-track">
                <div class="ob-quiz-progress-fill" style="width:${pct}%"></div>
            </div>
        </div>
        <div class="ob-quiz-level-badge">
            <span>📊</span> ${q.level} Seviye Soru
        </div>
        <div class="ob-quiz-question">${questionHtml}</div>
        <div class="ob-quiz-options" id="ob-quiz-opts">
            ${q.opts.map((opt, i) => `
                <button class="ob-quiz-opt" onclick="obSelectOpt(${i}, this)">
                    <span class="ob-quiz-opt-letter">${letters[i]}</span>
                    ${opt}
                </button>`).join('')}
        </div>
        <div class="ob-quiz-feedback" id="ob-quiz-fb"></div>`;
}

let _obSelectedOpt = -1;

function obSelectOpt(idx, el) {
    if (OB.answered) return;
    _obSelectedOpt = idx;
    document.querySelectorAll('.ob-quiz-opt').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('ob-quiz-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Cevapla'; }
}

function obQuizAction() {
    if (!OB.answered) {
        obCheckAnswer();
    } else {
        obNextQuestion();
    }
}

function obCheckAnswer() {
    if (_obSelectedOpt < 0) return;
    OB.answered = true;

    const q = OB_QUESTIONS[OB.quizIdx];
    const correct = _obSelectedOpt === q.ans;
    if (correct) OB.quizScore++;

    const opts = document.querySelectorAll('.ob-quiz-opt');
    opts.forEach((b, i) => {
        b.disabled = true;
        if (i === q.ans) b.classList.add('ob-opt-correct');
        else if (i === _obSelectedOpt && !correct) b.classList.add('ob-opt-wrong');
    });

    const fb = document.getElementById('ob-quiz-fb');
    if (fb) {
        fb.className = 'ob-quiz-feedback ' + (correct ? 'correct' : 'wrong');
        fb.textContent = correct ? '✓ Doğru!' : `✗ Doğru cevap: ${q.opts[q.ans]}`;
    }

    const btn = document.getElementById('ob-quiz-btn');
    if (btn) {
        const isLast = OB.quizIdx >= OB_QUESTIONS.length - 1;
        btn.textContent = isLast ? 'Sonuçları Gör →' : 'Sonraki Soru →';
        btn.disabled = false;
    }
}

function obNextQuestion() {
    OB.quizIdx++;
    OB.answered = false;
    _obSelectedOpt = -1;

    if (OB.quizIdx >= OB_QUESTIONS.length) {
        obShowResult();
        return;
    }

    const body = document.getElementById('ob-quiz-body');
    if (body) {
        body.classList.remove('ob-step');
        body.innerHTML = obBuildQuizQ(OB.quizIdx);
        void body.offsetWidth;
        body.classList.add('ob-step');
    }

    const btn = document.getElementById('ob-quiz-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Cevapla'; }
}

function obSkipQuiz() {
    OB.skipQuiz = true;
    obClose(false);
}

/* ════════════════════════════════════════════
   ADIM 3 — Sonuç
   ════════════════════════════════════════════ */
function obShowResult() {
    OB.step = 3;

    // Seviyeyi hesapla
    const score = OB.quizScore;
    OB.levelResult = OB_LEVEL_MAP.find(l => score >= l.min && score <= l.max)
                  || OB_LEVEL_MAP[OB_LEVEL_MAP.length - 1];

    OB.saveProfile({ level: OB.levelResult.code, quizScore: score });

    const total = OB_QUESTIONS.length;
    const pct   = Math.round((score / total) * 100);

    const card = document.querySelector('.ob-card');
    if (!card) return;

    card.innerHTML = `
        <div class="ob-header">
            <div class="ob-logo">🏆</div>
            <div class="ob-title">Sonucun Hazır!</div>
            <div class="ob-sub">Testi tamamladın. İşte seviye değerlendirmen:</div>
            <div class="ob-dots">
                <div class="ob-dot done"></div>
                <div class="ob-dot done"></div>
                <div class="ob-dot active"></div>
            </div>
        </div>
        <div class="ob-body">
            <div class="ob-result-hero">
                <div class="ob-result-badge ${OB.levelResult.badge}">
                    ${OB.levelResult.code}
                    <span class="ob-result-level-name">${OB.levelResult.label}</span>
                </div>
                <div class="ob-result-title">${obResultTitle(OB.levelResult.code)}</div>
                <div class="ob-result-desc">${OB.levelResult.desc}</div>
            </div>
            <div class="ob-result-stats">
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val">${score}/${total}</div>
                    <div class="ob-result-stat-lbl">Doğru</div>
                </div>
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val">%${pct}</div>
                    <div class="ob-result-stat-lbl">Başarı</div>
                </div>
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val" style="color:${OB.levelResult.color}">${OB.levelResult.code}</div>
                    <div class="ob-result-stat-lbl">Seviye</div>
                </div>
            </div>
            <div class="ob-recommend-box">
                <div class="ob-recommend-icon">💡</div>
                <div class="ob-recommend-text">
                    <div class="ob-recommend-title">Öneri</div>
                    <div class="ob-recommend-desc">${OB.levelResult.recommend}</div>
                </div>
            </div>
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" onclick="obCheckStarterPack()">
                🚀 Öğrenmeye Başla
            </button>
        </div>`;

    card.classList.remove('ob-step');
    void card.offsetWidth;
    card.classList.add('ob-step');
}

/* ════════════════════════════════════════════
   ADIM 4 — Starter Pack (yeni kullanıcı için)
   ════════════════════════════════════════════ */
function obCheckStarterPack() {
    const allKeys = (typeof allData !== 'undefined') ? Object.keys(allData) : [];
    const totalW  = allKeys.reduce((s, k) => s + (allData[k] || []).length, 0);
    if (totalW > 0) { obClose(false); return; }
    obShowStarterPack();
}

function obShowStarterPack() {
    OB.step = 4;
    const card = document.querySelector('.ob-card');
    if (!card) return;

    let packInfo = { total: 0, lists: [] };
    if (typeof YDT_STARTER_PACK !== 'undefined') {
        Object.keys(YDT_STARTER_PACK).forEach(k => {
            const cnt = YDT_STARTER_PACK[k].length;
            packInfo.total += cnt;
            packInfo.lists.push({ name: k, count: cnt });
        });
    }

    const listRows = packInfo.lists.slice(0, 4).map(l =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:.82rem;font-weight:700;color:var(--ink);">${l.name}</span>
            <span style="font-size:.75rem;font-weight:800;color:#0ea5e9;background:#f0f9ff;padding:2px 9px;border-radius:20px;">${l.count} kelime</span>
        </div>`
    ).join('');

    card.innerHTML = `
        <div class="ob-header">
            <div class="ob-logo" style="background:linear-gradient(135deg,#0ea5e9,#0284c7);">🚀</div>
            <div class="ob-title">Hemen Başlayalım!</div>
            <div class="ob-sub">Hiç kelimen yok. YDT için hazırlanmış <strong>${packInfo.total} kelimeyi</strong> tek tıkla yükle.</div>
            <div class="ob-dots">
                <div class="ob-dot done"></div>
                <div class="ob-dot done"></div>
                <div class="ob-dot done"></div>
                <div class="ob-dot active" style="background:#0ea5e9;"></div>
            </div>
        </div>
        <div class="ob-body">
            <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:14px;padding:16px 18px;margin-bottom:16px;">
                <div style="font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.6px;color:#0369a1;margin-bottom:10px;">📦 Paket İçeriği</div>
                ${listRows}
                ${packInfo.lists.length > 4 ? `<div style="font-size:.72rem;color:#0369a1;font-weight:700;padding-top:6px;">+${packInfo.lists.length - 4} liste daha...</div>` : ''}
            </div>
            <div style="display:flex;gap:8px;">
                <div style="flex:1;background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:12px;text-align:center;">
                    <div style="font-size:1.1rem;font-weight:900;color:#16a34a;">${packInfo.total}</div>
                    <div style="font-size:.62rem;font-weight:800;color:#15803d;text-transform:uppercase;">Toplam Kelime</div>
                </div>
                <div style="flex:1;background:#fefce8;border:1.5px solid #fde047;border-radius:12px;padding:12px;text-align:center;">
                    <div style="font-size:1.1rem;font-weight:900;color:#ca8a04;">${packInfo.lists.length}</div>
                    <div style="font-size:.62rem;font-weight:800;color:#92400e;text-transform:uppercase;">Liste</div>
                </div>
                <div style="flex:1;background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:12px;padding:12px;text-align:center;">
                    <div style="font-size:1.1rem;font-weight:900;color:#7c3aed;">YDT</div>
                    <div style="font-size:.62rem;font-weight:800;color:#6d28d9;text-transform:uppercase;">Odaklı</div>
                </div>
            </div>
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" id="ob-sp-load-btn" onclick="obLoadStarterPack()" style="background:linear-gradient(135deg,#0ea5e9,#0284c7);box-shadow:0 4px 14px rgba(14,165,233,.3);">
                📥 Starter Pack'i Yükle (${packInfo.total} kelime)
            </button>
            <button class="ob-btn-secondary" onclick="obClose(false)">Atla, boş başlayacağım</button>
        </div>`;

    card.classList.remove('ob-step');
    void card.offsetWidth;
    card.classList.add('ob-step');
}

function obLoadStarterPack() {
    const btn = document.getElementById('ob-sp-load-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Yükleniyor...'; }

    if (typeof YDT_STARTER_PACK !== 'undefined') {
        if (typeof allData === 'undefined') window.allData = {};
        Object.keys(YDT_STARTER_PACK).forEach(k => {
            if (!allData[k]) allData[k] = YDT_STARTER_PACK[k];
        });
        if (typeof _saveData === 'function') _saveData();
    }

    if (btn) { btn.textContent = '✅ Yüklendi!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#059669)'; }
    setTimeout(() => { obClose(false); }, 700);
}

function obResultTitle(code) {
    const titles = {
        A1: 'Güzel bir başlangıç! 🌱',
        A2: 'İyi gidiyorsun! ✨',
        B1: 'Orta seviyedesin! 💪',
        B2: 'Çok iyi! 🎯',
        C1: 'Mükemmel! 🏆'
    };
    return titles[code] || 'Harika! 🎉';
}

/* ════════════════════════════════════════════
   YÖNLENDİRME — seviye bazlı
   ════════════════════════════════════════════ */
function obDoRedirect() {
    const code = OB.levelResult?.code;
    if (!code) return;
    setTimeout(() => {
        if (code === 'A1' || code === 'A2') {
            if (typeof startStudy === 'function') startStudy();
        } else if (code === 'B1' || code === 'B2') {
            if (typeof showParagrafListesi === 'function') showParagrafListesi();
        } else {
            if (typeof startAIQuizMode === 'function') startAIQuizMode();
        }
    }, 600);
}

/* ════════════════════════════════════════════
   SİDEBAR ADAPTASYONU
   ════════════════════════════════════════════ */
function obApplySidebar(ageGroup) {
    const sidebar   = document.getElementById('desktop-sidebar');
    const drawer    = document.getElementById('mob-drawer');
    const bottomnav = document.querySelector('.mob-bottomnav');

    if (!sidebar) return;

    // Tüm yaş gruplarında İstatistik her zaman görünür
    ['sb-stats', 'di-stats', 'bn-stats'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.removeProperty('display');
    });

    if (ageGroup === '4-8') {
        sidebar.classList.add('sb-kids-mode');
        if (drawer)    drawer.classList.add('mob-kids-mode');
        if (bottomnav) bottomnav.classList.add('bn-kids-mode');

        const titleEl = document.getElementById('dash-title-text');
        const subEl   = document.getElementById('dash-sub-text');
        if (titleEl) titleEl.innerHTML = 'Merhaba! <em>Birlikte öğrenelim!</em>';
        if (subEl)   subEl.textContent = 'Renkli dünyada İngilizce keşfet 🌈';

    } else if (ageGroup === '9-12') {
        // 9-12: AI YDT, Paragraf, Speaking, Grammar gizle
        // Soru Bankası (sb-arsiv / di-arsiv) ve İstatistik görünür KALIR
        const toHide = [
            'sb-ai-ydt', 'sb-paragraf', 'sb-speaking',
            'sb-grammar-toggle-main', 'sb-grammar-list-main',
            'di-ai-ydt', 'di-paragraf', 'di-speaking',
            'di-grammar-toggle-main', 'di-grammar-list-main'
        ];
        toHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

    }
    // 16+: hiçbir şeyi gizleme — Soru Bankası + İstatistik zaten görünür
}

/* ════════════════════════════════════════════
   PROFİL SAYFASI ENTEGRASYONu
   obAddProfilWidget() — profil sayfasında çağrılır
   ════════════════════════════════════════════ */
function obAddProfilWidget() {
    const section = document.querySelector('.admin-section, .pp-section');
    if (!section) return;

    const existing = document.getElementById('ob-profil-widget');
    if (existing) { obUpdateProfilWidget(); return; }

    const p = OB.getProfile();
    const ageLabels = { '4-8': '🌈 4-8 Yaş', '9-12': '🎒 9-12 Yaş', '16+': '🎓 13+ Yaş' };
    const ageLabel = p.ageGroup ? (ageLabels[p.ageGroup] || p.ageGroup) : 'Belirlenmedi';
    const levelLabel = p.level ? `${p.level} Seviye` : 'Test yapılmadı';

    const widget = document.createElement('div');
    widget.id = 'ob-profil-widget';
    widget.className = 'pp-section';
    widget.style.marginTop = '12px';
    widget.innerHTML = `
        <div class="pp-section-title">🎯 Profil & Seviye</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:10px 16px;flex:1;text-align:center;min-width:100px;">
                <div style="font-size:1.1rem;font-weight:900;color:var(--ink);" id="ob-pw-age">${ageLabel}</div>
                <div style="font-size:.62rem;font-weight:700;color:var(--ink3);text-transform:uppercase;margin-top:3px;">Yaş Grubu</div>
            </div>
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:10px 16px;flex:1;text-align:center;min-width:100px;">
                <div style="font-size:1.1rem;font-weight:900;color:#8b5cf6;" id="ob-pw-level">${levelLabel}</div>
                <div style="font-size:.62rem;font-weight:700;color:var(--ink3);text-transform:uppercase;margin-top:3px;">Seviye</div>
            </div>
        </div>
        <button class="ob-restart-btn" onclick="obRestartOnboarding()">
            🔄 Yaş / Seviye Testi Yeniden Yap
        </button>`;

    // profil-basari'nın hemen altına ekle (en üst görünür bölüm)
    const basari = document.querySelector('.profil-basari');
    if (basari) basari.insertAdjacentElement('afterend', widget);
    else {
        const statsRow = document.querySelector('.profil-stats-row');
        if (statsRow) statsRow.insertAdjacentElement('afterend', widget);
        else document.getElementById('profil-page')?.appendChild(widget);
    }
}

function obUpdateProfilWidget() {
    const p = OB.getProfile();
    const ageLabels = { '4-8': '🌈 4-8 Yaş', '9-12': '🎒 9-12 Yaş', '16+': '🎓 13+ Yaş' };
    const ageEl   = document.getElementById('ob-pw-age');
    const levelEl = document.getElementById('ob-pw-level');
    if (ageEl)   ageEl.textContent   = p.ageGroup ? (ageLabels[p.ageGroup] || p.ageGroup) : 'Belirlenmedi';
    if (levelEl) levelEl.textContent = p.level ? `${p.level} Seviye` : 'Test yapılmadı';
}

/* Profil sayfasından yeniden onboarding başlat */
function obRestartOnboarding() {
    const uid = window._currentUser?.uid || 'guest';
    localStorage.removeItem(`${OB.STORAGE_KEY}_${uid}`);
    localStorage.removeItem(`${OB_BANNER_KEY}_${uid}`);
    OB.step = 1; OB.ageGroup = null; OB.quizIdx = 0;
    OB.quizScore = 0; OB.answered = false; OB.levelResult = null;

    // Mevcut sidebar sınıflarını temizle
    document.getElementById('desktop-sidebar')?.classList.remove('sb-kids-mode');
    document.getElementById('mob-drawer')?.classList.remove('mob-kids-mode');
    document.querySelector('.mob-bottomnav')?.classList.remove('bn-kids-mode');

    obShow();
}

/* ════════════════════════════════════════════
   OTOMATIK BAŞLATMA
   Auth modülü window._currentUser'ı set ettiğinde
   çağrılır. index.html'deki onAuthStateChanged
   callback'ine şu satırı ekliyoruz:
       obCheckAndShow();
   Ancak onboarding.js bağımsız çalışabilir —
   DOMContentLoaded'da da tetiklenir (guest mod)
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Auth yüklenmesini kısa bekle, sonra guest kontrolü
    setTimeout(() => {
        if (!OB.isDone()) obShow();
        else { obApplySavedProfile(); if (typeof initDashToday === 'function') setTimeout(initDashToday, 300); setTimeout(obRenderLevelBanner, 400); }

        // Profil sayfası açıldığında widget ekle (MutationObserver)
        const profilPage = document.getElementById('profil-page');
        if (profilPage) {
            const mo = new MutationObserver(() => {
                if (!profilPage.classList.contains('hidden')) {
                    obAddProfilWidget();
                }
            });
            mo.observe(profilPage, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }, 1200);
});


/* ════════════════════════════════════════════
   SEVİYE BANNER — dashboard'da gösterilir
   Test çözülene kadar kalır, sonra kaybolur
   ════════════════════════════════════════════ */

const OB_BANNER_KEY = 'ydt_level_banner_dismissed';

// Seviyeye göre banner içerikleri
const OB_BANNER_DATA = {
    'none': {
        // Hiç test yapılmamış
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: '🎯',
        badge: null,
        title: 'İngilizce seviyeni öğren',
        desc: 'Kısa bir seviye testiyle sana en uygun çalışma planını oluşturalım. Test sadece 10 soru, 3 dakika sürer.',
        cta: 'Seviye Testini Başlat →',
        ctaFn: 'obRestartOnboarding()',
        dismissable: false   // Test yapılmadan kapatılamaz
    },
    'A1': {
        gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        icon: '🌱',
        badge: 'A1 Başlangıç',
        badgeColor: '#0984e3',
        title: 'Merhaba! Temelden başlıyoruz.',
        desc: 'Henüz yolun başındasın — bu harika! A1 seviyesinde günlük yaygın kelimeler, basit cümleler ve temel gramer yapıları seni hızla ilerletir. Günde 20 kelime ile 3 ayda A2\'ye ulaşabilirsin.',
        cta: 'Kelime Öğrenmeye Başla →',
        ctaFn: 'startStudy()',
        dismissable: true
    },
    'A2': {
        gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
        icon: '📗',
        badge: 'A2 Temel',
        badgeColor: '#00b894',
        title: 'İyi bir temel kurdun. Şimdi genişletme zamanı.',
        desc: 'A2\'de basit konuşmaları takip edebilir, günlük metinleri anlayabilirsin. Şimdi hedef: kelime dağarcığını 1000\'e çıkarmak ve present perfect, past simple gibi yapıları otomatik kullanmak.',
        cta: 'Vocab Test ile Pekiştir →',
        ctaFn: 'startQuiz()',
        dismissable: true
    },
    'B1': {
        gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
        icon: '📘',
        badge: 'B1 Orta',
        badgeColor: '#e17055',
        title: 'Orta seviyedesin — YDT hedefine yaklaşıyorsun.',
        desc: 'B1\'de bildik konularda kendini ifade edebilir, genel metinleri anlayabilirsin. YDT için kritik adım: paragraf okuma hızını artırmak ve B2 kelimelerini aktif kullanmak. AI testleriyle gerçek sınav deneyimi yaşa.',
        cta: 'AI YDT Testini Dene →',
        ctaFn: 'startAIQuizMode()',
        dismissable: true
    },
    'B2': {
        gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
        icon: '📙',
        badge: 'B2 Orta-İleri',
        badgeColor: '#e84393',
        title: 'Güçlü bir seviyedesin. YDT\'de üst dilime girme vakti.',
        desc: 'B2\'de karmaşık metinleri anlayabilir, akıcı konuşabilirsin. YDT\'de 85+ almak için C1 kelimelerini tanımak ve paragraf sorularındaki çıkarım tekniklerini geliştirmek şart. Paragraf modülü senin için hazır.',
        cta: 'Paragraf Oku →',
        ctaFn: 'showParagrafListesi()',
        dismissable: true
    },
    'C1': {
        gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
        icon: '🏆',
        badge: 'C1 İleri',
        badgeColor: '#6c5ce7',
        title: 'İleri seviyesin — YDT\'de maksimum puana çok yakınsın.',
        desc: 'C1\'de akademik ve profesyonel metinleri rahatlıkla anlayabilirsin. YDT\'de 95+ için: okuma hızını artır, zaman yönetimini mükemmelleştir ve nadir C1 kelimelerini tara. AI test ile eksiklerini bul.',
        cta: 'AI Test ile Eksik Bul →',
        ctaFn: 'startAIQuizMode()',
        dismissable: true
    }
};

function obRenderLevelBanner() {
    const bannerEl = document.getElementById('ob-level-banner');
    if (!bannerEl) return;

    const uid = window._currentUser?.uid || 'guest';
    const dismissedKey = `${OB_BANNER_KEY}_${uid}`;

    const p = OB.getProfile();
    const level = p.level || 'none';
    const data = OB_BANNER_DATA[level] || OB_BANNER_DATA['none'];

    // Seviyesi olan kullanıcı dismiss ettiyse gizle
    // Seviyesi olmayan (none): HER ZAMAN göster
    if (data.dismissable && localStorage.getItem(dismissedKey)) {
        bannerEl.style.display = 'none';
        return;
    }

    const closeBtn = data.dismissable
        ? `<button onclick="obDismissBanner()" aria-label="Kapat" style="
            position:absolute;top:12px;right:12px;
            background:rgba(255,255,255,0.2);border:none;color:white;
            width:28px;height:28px;border-radius:50%;cursor:pointer;
            font-size:14px;display:flex;align-items:center;justify-content:center;
            line-height:1;flex-shrink:0;">✕</button>`
        : '';

    const badgeHtml = data.badge
        ? `<span style="
            display:inline-block;background:rgba(255,255,255,0.25);
            color:white;font-size:.62rem;font-weight:900;letter-spacing:1.2px;
            text-transform:uppercase;padding:3px 10px;border-radius:99px;
            margin-bottom:8px;">${data.badge}</span><br>`
        : '';

    bannerEl.style.display = 'block';
    bannerEl.innerHTML = `
        <div style="
            position:relative;
            background:${data.gradient};
            border-radius:16px;
            padding:16px 18px 14px;
            color:white;
            overflow:hidden;
            box-shadow:0 4px 16px rgba(0,0,0,0.13);">

            <!-- Dekoratif daire -->
            <div aria-hidden="true" style="
                position:absolute;top:-25px;right:-25px;
                width:110px;height:110px;
                background:rgba(255,255,255,0.09);
                border-radius:50%;pointer-events:none;"></div>

            ${closeBtn}

            <!-- İkon + rozet + etiket -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <span style="font-size:1.6rem;line-height:1;flex-shrink:0;" aria-hidden="true">${data.icon}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:.58rem;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;opacity:.75;margin-bottom:2px;">
                        ${data.badge ? data.badge + ' · Seviyene Özel' : 'Seviye Testi'}
                    </div>
                    <div style="font-size:.92rem;font-weight:800;line-height:1.25;">
                        ${data.title}
                    </div>
                </div>
            </div>

            <!-- Açıklama -->
            <div style="font-size:.76rem;line-height:1.6;opacity:.9;margin-bottom:12px;">
                ${data.desc}
            </div>

            <!-- CTA -->
            <button onclick="${data.ctaFn}" style="
                background:rgba(255,255,255,0.22);
                border:1.5px solid rgba(255,255,255,0.45);
                color:white;font-weight:800;font-size:.78rem;
                padding:8px 16px;border-radius:9px;cursor:pointer;
                transition:background .15s;letter-spacing:.2px;"
                onmouseover="this.style.background='rgba(255,255,255,0.35)'"
                onmouseout="this.style.background='rgba(255,255,255,0.22)'">
                ${data.cta}
            </button>
        </div>`;
}

function obDismissBanner() {
    const uid = window._currentUser?.uid || 'guest';
    localStorage.setItem(`${OB_BANNER_KEY}_${uid}`, '1');
    const bannerEl = document.getElementById('ob-level-banner');
    if (!bannerEl) return;
    bannerEl.style.transition = 'opacity .2s, max-height .3s';
    bannerEl.style.overflow = 'hidden';
    bannerEl.style.opacity = '0';
    bannerEl.style.maxHeight = bannerEl.offsetHeight + 'px';
    requestAnimationFrame(() => {
        bannerEl.style.maxHeight = '0';
        bannerEl.style.marginTop = '0';
    });
    setTimeout(() => { bannerEl.style.display = 'none'; }, 320);
}

/* ════════════════════════════════════════════
   GLOBAL API
   ════════════════════════════════════════════ */
window.OB = OB;


/* ════════════════════════════════════════════
   STARTER PACK TOAST
   ════════════════════════════════════════════ */
function obShowStarterToast() {
    const total = typeof YDT_STARTER_PACK !== 'undefined'
        ? Object.values(YDT_STARTER_PACK).reduce((s, arr) => s + arr.length, 0)
        : 500;

    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed','bottom:80px','left:50%','transform:translateX(-50%) translateY(20px)',
        'background:linear-gradient(135deg,#16a34a,#059669)','color:#fff',
        'padding:14px 22px','border-radius:16px','font-size:.88rem','font-weight:700',
        'box-shadow:0 8px 28px rgba(22,163,74,.35)','z-index:99999',
        'display:flex','align-items:center','gap:10px',
        'opacity:0','transition:opacity .3s, transform .3s','pointer-events:none',
        'max-width:340px','white-space:normal'
    ].join(';');
    toast.innerHTML = `<span style="font-size:1.4rem;flex-shrink:0">🚀</span><span>${total} YDT kelimesi yüklendi!<br><small style="opacity:.85;font-weight:600">Starter Pack hazır, öğrenmeye başlayabilirsin.</small></span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

window.obCheckAndShow      = obCheckAndShow;
window.obApplySavedProfile = obApplySavedProfile;
window.obRestartOnboarding = obRestartOnboarding;
window.obAddProfilWidget   = obAddProfilWidget;
