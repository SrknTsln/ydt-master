import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    const firebaseConfig = {
        apiKey: "AIzaSyC94N6Y8hxXmpFLrK6TvgVP4k-F9N6qX8A",
        authDomain: "ydt-master.firebaseapp.com",
        projectId: "ydt-master",
        storageBucket: "ydt-master.firebasestorage.app",
        messagingSenderId: "674787283521",
        appId: "1:674787283521:web:fccca6b20e174f9e79ecc0"
    };

    /* ── Firestore Security Rules (Firebase Console > Firestore > Rules) ──
       Aşağıdaki kuralları Firebase Console'da uygulayın:

       rules_version = '2';
       service cloud.firestore {
         match /databases/{database}/documents {

           // Kullanıcı kendi dökümanına ve subcollection'larına erişebilir
           match /users/{userId} {
             allow read, write: if request.auth != null && request.auth.uid == userId;

             match /lists/{listId} {
               allow read, write: if request.auth != null && request.auth.uid == userId;
             }
             match /arsiv/{arsivId} {
               allow read, write: if request.auth != null && request.auth.uid == userId;
             }
             match /content/{contentId} {
               allow read, write: if request.auth != null && request.auth.uid == userId;
             }
           }

           // Paylaşımlı içerik: herkes okur, sadece admin custom claim'i olanlar yazar
           // Firebase Console > Firestore Rules > admin custom claim kontrolü:
           // allow write: if request.auth != null && request.auth.token.admin == true;
           match /shared/{docId} {
             allow read: if true;
             allow write: if request.auth != null && request.auth.token.admin == true;
           }
         }
       }
       ── */

    const firebaseApp = initializeApp(firebaseConfig);
    let syncTimeout = null;

    function setSyncStatus(s) {
        const map = {
            idle:    { color: '#aaa',    text: 'Yerel' },
            syncing: { color: '#f39c12', text: 'Senkronize ediliyor...' },
            ok:      { color: '#2ecc71', text: 'Senkronize ✓' },
            error:   { color: '#e74c3c', text: 'Bağlantı hatası' }
        };
        ['sync-dot', 'sync-dot-admin', 'sync-dot-drawer', 'sync-dot-mob'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.background = map[s].color;
        });
        ['sync-label', 'sync-lbl-drawer', 'sync-lbl-mob'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = map[s].text;
        });
    }

    window._saveData = function () {
        const uid = window._currentUser?.uid || 'guest';
        localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(window.allData));
        localStorage.setItem('ydt_all_data', JSON.stringify(window.allData));

        // ── Tüm yerel verileri localStorage'a yaz ──
        const _ls = (k, v) => { try { if (v !== undefined) localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
        _ls('ydt_paragraf_sorular',  window.paragrafSorular);
        _ls('ydt_ai_arsiv',          window.aiArsiv);
        _ls('ydt_ai_pasaj_arsiv',    window.aiPasajArsiv);
        _ls('ydt_gramer_arsiv',      window.aiGramerArsiv);
        _ls('ydt_cloze_arsiv',       window.aiClozeArsiv);
        _ls('ydt_yakin_arsiv',       window.aiYakinArsiv);
        _ls('ydt_diyalog_arsiv',     window.aiDiyalogArsiv);
        _ls('ydt_durum_arsiv',       window.aiDurumArsiv);
        _ls('ydt_paracom_arsiv',     window.aiParaComArsiv);
        _ls('ydt_paraboz_arsiv',     window.aiParaBozArsiv);
        _ls('ydt_paragraflar',       window.paragraflar);
        _ls('ydt_badges',            window.badges);
        _ls('ydt_profile',           window.userProfile);
        // gr_scores, grammar_scores, perf_hist, streak, daily — motor.js zaten yazıyor
        saveToFirebase();
    };
    // YDT namespace alias — window._saveData ile senkron kalır
    if (window.YDT) window.YDT.save = window._saveData;

    // ════════════════════════════════════════════════════════════════════
    // OFFLINE SYNC QUEUE — internet kesilince değişiklikler kaybolmasın
    // ════════════════════════════════════════════════════════════════════
    const PENDING_SYNC_KEY = 'ydt_pending_sync';
    let _syncRetryTimer = null;

    /** Bekleyen sync'i localStorage'a işaretle */
    function _markPendingSync() {
        try { localStorage.setItem(PENDING_SYNC_KEY, String(Date.now())); } catch(_) {}
    }
    /** Bekleyen sync bayrağını temizle */
    function _clearPendingSync() {
        try { localStorage.removeItem(PENDING_SYNC_KEY); } catch(_) {}
    }
    /** Bekleyen sync var mı? */
    function _hasPendingSync() {
        return !!localStorage.getItem(PENDING_SYNC_KEY);
    }

    /**
     * Çevrimiçi olunca otomatik sync yap
     * Sayfa açıkken internet kesilip tekrar geldiğinde çağrılır
     */
    async function _onNetworkRestore() {
        const uid = window._currentUser?.uid;
        if (!uid || !_hasPendingSync()) return;
        console.log('[YDT Sync] Bağlantı geri geldi — bekleyen sync gönderiliyor…');
        setSyncStatus('syncing');
        if (typeof showAIToast === 'function') showAIToast('☁️ Bağlantı sağlandı, veriler senkronize ediliyor…', 'info', 3000);
        try {
            if (window.AuthModule && typeof window.AuthModule.syncNow === 'function') {
                await window.AuthModule.syncNow();
            }
            _clearPendingSync();
            setSyncStatus('ok');
        } catch(e) {
            console.warn('[YDT Sync] Restore sync hatası:', e.message);
            setSyncStatus('error');
        }
    }

    // Ağ event listener'ları — sadece bir kez bağla
    if (!window._ytdNetworkListenersAdded) {
        window.addEventListener('online',  _onNetworkRestore);
        window.addEventListener('offline', () => {
            setSyncStatus('error');
            if (typeof showAIToast === 'function') showAIToast('📴 İnternet bağlantısı kesildi. Veriler yerel kayıt edilecek.', 'warn', 5000);
        });
        window._ytdNetworkListenersAdded = true;
    }

    function saveToFirebase() {
        // Artık Firestore üzerinden _saveUserData() kullanıyoruz.
        // Bu fonksiyon yalnızca window.AuthModule.syncNow() çağrısıyla tetiklenir.
        const uid = window._currentUser?.uid;
        if (!uid) return;

        // Çevrimdışıysa bekleyen sync olarak işaretle
        if (!navigator.onLine) {
            _markPendingSync();
            setSyncStatus('error');
            return;
        }

        _markPendingSync(); // Sync tamamlanana kadar işaretli kalsın
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(async () => {
            if (window.AuthModule && typeof window.AuthModule.syncNow === 'function') {
                try {
                    await window.AuthModule.syncNow();
                    _clearPendingSync(); // Başarılı → bayrağı kaldır
                } catch(e) {
                    console.warn('[YDT Sync] saveToFirebase hatası:', e.message);
                    // Bayrak kalır — online event tetiklenince tekrar denenecek
                }
            }
        }, 800);
    }

    async function initData() {
        // ── Sayfa açılışında sadece localStorage'dan yükle ──────────────────
        // Auth durumu henüz belli değil; Firebase'e gidersek rules hatası
        // "Bağlantı hatası" gösterir. Gerçek Firebase sync'i
        // onAuthStateChanged → _loadUserData() / _saveUserData() üstleniyor.
        document.getElementById('loading-overlay').style.display = 'flex';
        // Her anahtar bağımsız try/catch ile sarılı — biri bozuk olursa diğerleri çökmez
        try {
            const raw = localStorage.getItem('ydt_all_data');
            if (raw) window.allData = { ...(window.allData || {}), ...JSON.parse(raw) };
        } catch(e) {
            console.warn('[initData] ydt_all_data parse hatası, sıfırlandı:', e.message);
            localStorage.removeItem('ydt_all_data');
        }
        try {
            const rawP = localStorage.getItem('ydt_paragraf_sorular');
            if (rawP) window.paragrafSorular = JSON.parse(rawP);
        } catch(e) {
            console.warn('[initData] ydt_paragraf_sorular parse hatası, sıfırlandı:', e.message);
            window.paragrafSorular = {};
            localStorage.removeItem('ydt_paragraf_sorular');
        }
        try {
            const rawA = localStorage.getItem('ydt_ai_arsiv');
            if (rawA) window.aiArsiv = JSON.parse(rawA);
        } catch(e) {
            console.warn('[initData] ydt_ai_arsiv parse hatası, sıfırlandı:', e.message);
            localStorage.removeItem('ydt_ai_arsiv');
        }
        setSyncStatus('idle');
        document.getElementById('loading-overlay').style.display = 'none';
        if (typeof updateSelectors    === 'function') updateSelectors();
        if (typeof updateIndexStats   === 'function') updateIndexStats();
        if (typeof updateDailyGoalBar === 'function') updateDailyGoalBar();
    }

    window.saveToFirebase = saveToFirebase;
    initData();

    // ════════════════════════════════════════════════════
    // AUTH — Google Giriş / Çıkış
    // ════════════════════════════════════════════════════
    const {
        initializeAuth,
        browserLocalPersistence,
        indexedDBLocalPersistence,
        browserPopupRedirectResolver,
        GoogleAuthProvider,
        signInWithPopup,
        signOut,
        onAuthStateChanged
    } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
    const { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch }
        = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

    /**
     * initializeAuth — persistence zinciri [indexedDB, localStorage].
     * Android Chrome ve bazı desktop tarayıcılarda COOP header'ı popup'ı bloke eder.
     * Hem mobil hem desktop için signInWithRedirect kullanılır.
     */
    const auth = initializeAuth(firebaseApp, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
        popupRedirectResolver: browserPopupRedirectResolver,
    });
    const fsdb = getFirestore(firebaseApp);

    // ── Admin modülleri için global Firestore referansları ────────────────
    // admin.js ES module scope dışında olduğundan window üzerinden erişir.
    window._fsdb   = fsdb;
    window._doc    = doc;
    window._setDoc = setDoc;
    window._getDoc = getDoc;
    // ──────────────────────────────────────────────────────────────────────

    let authTimerInterval = null;
    let authSaveInterval  = null;

    function _authSyncBar(state, text) {
        const bar = document.getElementById('auth-sync-bar');
        if (!bar) return;
        bar.className = 'auth-sync-bar ' + state;
        const span = bar.querySelector('.auth-sync-text');
        if (span) span.textContent = text;
    }

    function _formatMinutes(mins) {
        const m = Math.round(mins) || 0;
        if (m < 60) return m + ' dk';
        const h = Math.floor(m / 60), r = m % 60;
        return r > 0 ? h + 's ' + r + 'dk' : h + 's';
    }

    function _updateAuthStats() {
        if (typeof window.stats === 'undefined') return;
        const total   = stats.totalAnswers   || 0;
        const correct = stats.correctAnswers || 0;
        const acc     = total > 0 ? Math.round((correct / total) * 100) : 0;
        const el1 = document.getElementById('auth-stat-total');
        const el2 = document.getElementById('auth-stat-accuracy');
        const el3 = document.getElementById('auth-stat-time');
        if (el1) el1.textContent = total;
        if (el2) el2.textContent = acc + '%';
        if (el3) el3.textContent = _formatMinutes(stats.totalMinutes || 0);
        _updateProfilWidgets();
    }

    function _updateProfilWidgets() {
        if (typeof window.stats === 'undefined') return;
        const minutes = Math.round(stats.totalMinutes) || 0;
        const correct = stats.correctAnswers || 0;
        const xp = correct * 10 + Math.floor(minutes / 5) * 5;
        const level = Math.floor(xp / 500) + 1;
        const xpInLevel = xp % 500;
        const xpPct = Math.min(100, Math.round((xpInLevel / 500) * 100));
        const lvlEl = document.getElementById('pp-level-num');
        const xpEl  = document.getElementById('pp-xp-val');
        const xpBar = document.getElementById('pp-xp-bar');
        if (lvlEl) lvlEl.textContent = level;
        if (xpEl)  xpEl.textContent  = xpInLevel + ' / 500 XP';
        if (xpBar) xpBar.style.width = xpPct + '%';

        const todayKey = 'ydt_daily_' + new Date().toISOString().slice(0,10);
        const todayAnswers = parseInt(localStorage.getItem(todayKey) || '0');
        const dailyGoal = 20;
        const dailyPct = Math.min(100, Math.round((todayAnswers / dailyGoal) * 100));
        const dEl  = document.getElementById('pp-daily-val');
        const dBar = document.getElementById('pp-daily-bar');
        const dLbl = document.getElementById('pp-daily-lbl');
        if (dEl)  dEl.textContent  = todayAnswers + ' / ' + dailyGoal + ' soru';
        if (dBar) dBar.style.width = dailyPct + '%';
        if (dLbl) dLbl.textContent = dailyPct >= 100 ? '🎉 Hedefe ulaştın!' : '%' + dailyPct + ' tamamlandı';

        _renderActivityCalendar();

        const msgs = [
            "Her gün 20 kelime = yılda 7.300 kelime. Başla! 💪",
            "YDT'ye hazırlanmak bir maraton, sprint değil. 🏃",
            "Bugün çalışmak, yarın özgüven demek. ✨",
            "Küçük adımlar, büyük başarılar getirir. 🚀",
            "Düzenlilik, yeteneği her zaman yener. 🔥",
            "Beyin bir kas gibidir — egzersiz yapmazsan zayıflar. 🧠",
            "En iyi zaman bugün. İkinci en iyi zaman da şimdi. ⚡",
        ];
        const mEl = document.getElementById('pp-motivation-text');
        if (mEl) mEl.textContent = msgs[new Date().getDay() % msgs.length];
    }

    function _renderActivityCalendar() {
        const cal = document.getElementById('pp-calendar');
        if (!cal) return;
        cal.innerHTML = '';
        const today = new Date();
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = 'ydt_daily_' + d.toISOString().slice(0,10);
            const count = parseInt(localStorage.getItem(key) || '0');
            const cell = document.createElement('div');
            cell.className = 'pp-cal-cell';
            cell.title = d.toLocaleDateString('tr-TR') + ': ' + count + ' soru';
            cell.dataset.intensity = count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 25 ? 3 : 4;
            cal.appendChild(cell);
        }
    }

    function _updateProfilUI(user) {
        // Hero switching — giriş yapılmışsa auth hero, yoksa guest hero
        const heroAuth  = document.getElementById('profil-hero-auth');
        const heroGuest = document.getElementById('profil-hero-guest');
        if (user) {
            if (heroAuth)  heroAuth.style.display  = 'block';
            if (heroGuest) heroGuest.style.display = 'none';
        } else {
            if (heroAuth)  heroAuth.style.display  = 'none';
            if (heroGuest) heroGuest.style.display = 'block';
            // Misafir giriş butonu
            const guestBtn = document.getElementById('profil-guest-signin-btn');
            if (guestBtn && !guestBtn._bound) {
                guestBtn._bound = true;
                guestBtn.addEventListener('click', _authSignIn);
            }
            return; // Misafir için profil alanları doldurma
        }

        const photo = document.getElementById('profil-gh-photo');
        const placeholder = document.getElementById('profil-gh-photo-placeholder');
        if (photo && user.photoURL) {
            photo.src = user.photoURL;
            photo.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }
        const displayName = user.displayName || 'Kullanıcı';
        const firstName   = displayName.split(' ')[0];
        const greetEl = document.getElementById('profil-gh-greeting-name');
        const nameEl  = document.getElementById('profil-gh-name');
        const emailEl = document.getElementById('profil-gh-email');
        if (greetEl) greetEl.textContent = firstName;
        if (nameEl)  nameEl.textContent  = displayName;
        if (emailEl) emailEl.textContent = user.email || '';
        _updateAuthStats();
    }

    async function _loadUserData(uid) {
        try {
            _authSyncBar('syncing', 'Veriler yükleniyor…');
            window.stats   = { totalAnswers: 0, correctAnswers: 0, totalMinutes: 0 };
            window.allData = {};
            _updateAuthStats();

            const _lsSet = (k, v) => { try { if (v !== null && v !== undefined) localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

            // ── Ana döküman ────────────────────────────────────────────────
            const snap = await getDoc(doc(fsdb, 'users', uid));
            if (snap.exists()) {
                const data = snap.data();
                if (data.stats)   { window.stats = { ...data.stats }; if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0; localStorage.setItem(`ydt_${uid}_stats`, JSON.stringify(window.stats)); }
                if (data.grScores)  { _lsSet('ydt_gr_scores', data.grScores); _lsSet('ydt_grammar_scores', data.grScores); }
                if (data.perfHist)  _lsSet('ydt_perf_hist', data.perfHist);
                if (data.badges)    { _lsSet('ydt_badges', data.badges); window.badges = data.badges; }
                if (data.profile)   { _lsSet('ydt_profile', data.profile); window.userProfile = data.profile; }
                if (data.streak)    localStorage.setItem('ydt_streak',   String(data.streak));
                if (data.lastDay)   localStorage.setItem('ydt_last_day', data.lastDay);
                if (data.ydtai_tot) localStorage.setItem('ydtai_tot', String(data.ydtai_tot));
                if (data.ydtai_cor) localStorage.setItem('ydtai_cor', String(data.ydtai_cor));
                if (data.ydtai_wrg) localStorage.setItem('ydtai_wrg', String(data.ydtai_wrg));
                // API anahtarları Firestore'dan OKUNMAZ — yalnızca localStorage'da tutulur.
                // Güvenlik: Firestore kuralı açığında anahtarlar sızmaz. (bkz. Güvenlik Audit #01)
            }

            // ── Kelime listeleri — subcollection ────────────────────────────
            try {
                const listsSnap = await getDocs(collection(fsdb, 'users', uid, 'lists'));
                if (!listsSnap.empty) {
                    listsSnap.forEach(listDoc => {
                        const d = listDoc.data();
                        const name = d.displayName || listDoc.id;
                        if (Array.isArray(d.words)) window.allData[name] = d.words;
                    });
                    _purgeAllDataLegacyLists(window.allData);
                    localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(window.allData));
                    console.info(`[load] ${Object.keys(window.allData).length} liste yüklendi`);
                } else {
                    // Subcollection boş — eski format fallback
                    const raw = localStorage.getItem(`ydt_${uid}_all_data`);
                    if (raw) { try { window.allData = JSON.parse(raw); _purgeAllDataLegacyLists(window.allData); } catch(e){} }
                }
            } catch(e) {
                console.warn('[load] Liste subcollection hatası:', e.message);
                const raw = localStorage.getItem(`ydt_${uid}_all_data`);
                if (raw) { try { window.allData = JSON.parse(raw); } catch(ex){} }
            }

            // ── AI Arşivleri — subcollection ────────────────────────────────
            try {
                const arsivMap = {
                    kelime:'ydt_ai_arsiv', pasaj:'ydt_ai_pasaj_arsiv', gramer:'ydt_gramer_arsiv',
                    cloze:'ydt_cloze_arsiv', yakin:'ydt_yakin_arsiv', diyalog:'ydt_diyalog_arsiv',
                    durum:'ydt_durum_arsiv', paracom:'ydt_paracom_arsiv', paraboz:'ydt_paraboz_arsiv'
                };
                const winMap = {
                    kelime:'aiArsiv', pasaj:'aiPasajArsiv', gramer:'aiGramerArsiv',
                    cloze:'aiClozeArsiv', yakin:'aiYakinArsiv', diyalog:'aiDiyalogArsiv',
                    durum:'aiDurumArsiv', paracom:'aiParaComArsiv', paraboz:'aiParaBozArsiv'
                };
                const arsivSnap = await getDocs(collection(fsdb, 'users', uid, 'arsiv'));
                arsivSnap.forEach(d => {
                    const tip = d.id;
                    const items = d.data().items || [];
                    if (arsivMap[tip]) _lsSet(arsivMap[tip], items);
                    if (winMap[tip])   window[winMap[tip]] = items;
                });
            } catch(e) { console.warn('[load] Arşiv subcollection hatası:', e.message); }

            // ── Paragraf & Sorular — subcollection ──────────────────────────
            try {
                const contentSnap = await getDocs(collection(fsdb, 'users', uid, 'content'));
                contentSnap.forEach(d => {
                    const id = d.id;
                    if (id === 'paragraflar') {
                        const items = d.data().items || [];
                        window.paragraflar = items;
                        _lsSet('ydt_paragraflar', items);
                    } else if (id === 'paragrafSorular') {
                        const data2 = d.data().data || {};
                        window.paragrafSorular = data2;
                        _lsSet('ydt_paragraf_sorular', data2);
                    } else if (id.startsWith('bank_')) {
                        const items = d.data().items || [];
                        const cat = id.replace('bank_','');
                        localStorage.setItem(`ydt_bank_${cat}`, JSON.stringify(items));
                    }
                });
            } catch(e) { console.warn('[load] Content subcollection hatası:', e.message); }

            // ── Stats fallback ───────────────────────────────────────────────
            if (!stats.totalAnswers && !stats.totalMinutes) {
                const rawST = localStorage.getItem(`ydt_${uid}_stats`) || localStorage.getItem('ydt_stats');
                if (rawST) { try { const s = JSON.parse(rawST); if (s) { window.stats = s; if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0; } } catch(e){} }
            }

            if (typeof updateSelectors    === 'function') updateSelectors();
            if (typeof updateIndexStats   === 'function') updateIndexStats();
            if (typeof updateDailyGoalBar === 'function') updateDailyGoalBar();
            _updateAuthStats();
            _authSyncBar('synced', 'Veriler yüklendi ✓');
            setSyncStatus('ok');

        } catch(e) {
            console.warn('Firestore yükleme hatası:', e);
            _authSyncBar('synced', 'Yerel veriler kullanılıyor');
            setSyncStatus('idle');
        }

        // ── Paylaşımlı (admin) içerikleri yükle ──────────────────────────
        // shared/content dökümanı: paragraflar + paragrafSorular + sharedLists
        try {
            const _lsSet2 = (k, v) => { try { if (v !== null && v !== undefined) localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
            const sharedSnap = await getDoc(doc(fsdb, 'shared', 'content'));
            if (sharedSnap.exists()) {
                const sharedData = sharedSnap.data();

                // ── Paragraflar ──────────────────────────────────────────────
                if (Array.isArray(sharedData.paragraflar) && sharedData.paragraflar.length > 0) {
                    const sharedPara = sharedData.paragraflar;
                    const current = window.paragraflar || [];
                    const sharedTitles = new Set(sharedPara.map(p => p.baslik));
                    const personalExtra = current.filter(p => !sharedTitles.has(p.baslik));
                    window.paragraflar = [...sharedPara, ...personalExtra];
                    _lsSet2('ydt_paragraflar', window.paragraflar);
                    console.log(`[shared] ${sharedPara.length} paylaşımlı paragraf yüklendi, ${personalExtra.length} kişisel ek`);
                }

                // ── Paragraf Soruları ────────────────────────────────────────
                if (sharedData.paragrafSorular && typeof sharedData.paragrafSorular === 'object') {
                    window.paragrafSorular = { ...sharedData.paragrafSorular, ...(window.paragrafSorular || {}) };
                    _lsSet2('ydt_paragraf_sorular', window.paragrafSorular);
                }

                // ── Paylaşımlı Kelime Listeleri ──────────────────────────────
                // Admin'in shared/content'e yüklediği listeler — tüm kullanıcılara merge edilir.
                // Kullanıcının kendi ilerlemesi (errorCount, correctStreak) korunur — overwrite olmaz.
                if (sharedData.sharedLists && typeof sharedData.sharedLists === 'object') {
                    let mergeCount = 0;
                    Object.entries(sharedData.sharedLists).forEach(([listName, words]) => {
                        if (!Array.isArray(words) || words.length === 0) return;
                        if (!window.allData[listName]) {
                            // Liste yok — direkt ekle
                            window.allData[listName] = words;
                            mergeCount++;
                        } else {
                            // Liste var — sadece eksik kelimeleri ekle, mevcut kelimelerin progress'ini koru
                            const existingEngSet = new Set(window.allData[listName].map(w => w.eng));
                            const newWords = words.filter(w => !existingEngSet.has(w.eng));
                            if (newWords.length > 0) {
                                window.allData[listName] = [...window.allData[listName], ...newWords];
                                mergeCount++;
                            }
                        }
                    });
                    if (mergeCount > 0) {
                        // Merge edilen veriyi localStorage'a yaz
                        const userKey = typeof getUserKey === 'function' ? getUserKey('all_data') : null;
                        if (userKey) localStorage.setItem(userKey, JSON.stringify(window.allData));
                        console.info(`[shared] ${mergeCount} kelime listesi merge edildi`);
                    }
                }

                if (typeof window._populateParagrafListesi === 'function') window._populateParagrafListesi();
            }
        } catch(e) {
            console.warn('[shared] Paylaşımlı içerik yüklenemedi:', e);
        } finally {
            document.dispatchEvent(new Event('ydtDataReady'));
        }
    }

    // Firestore field adları '.', '#', '$', '[', ']' içeremez — temizle
    function _fsCleanKey(k) { return String(k).replace(/[.#$\[\]]/g, '_'); }
    function _fsCleanObj(obj) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
        const out = {};
        Object.keys(obj).forEach(k => { out[_fsCleanKey(k)] = obj[k]; });
        return out;
    }

    async function _saveUserData(uid) {
        try {
            _authSyncBar('syncing', 'Kaydediliyor…');
            setSyncStatus('syncing');

            const _lsGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e){ return null; } };

            // ── Küçük alanlar — ana döküman (users/{uid}) ──────────────────
            // NOT: API anahtarları (Gemini, Groq, OpenRouter, Mistral) kasıtlı olarak
            // Firestore'a yazılmaz — yalnızca localStorage'da tutulur.
            // Firestore kuralı açığında anahtarların sızması önlenir. (Güvenlik Audit #01)
            const grScores = _lsGet('ydt_gr_scores') || _lsGet('ydt_grammar_scores') || {};
            const perfHist = _lsGet('ydt_perf_hist') || [];
            const badges   = _lsGet('ydt_badges')    || [];
            const profile  = _lsGet('ydt_profile')   || {};
            const streak   = parseInt(localStorage.getItem('ydt_streak')   || '0');
            const lastDay  = localStorage.getItem('ydt_last_day') || '';
            const ydtaiStats = {
                ydtai_tot: parseInt(localStorage.getItem('ydtai_tot') || '0'),
                ydtai_cor: parseInt(localStorage.getItem('ydtai_cor') || '0'),
                ydtai_wrg: parseInt(localStorage.getItem('ydtai_wrg') || '0'),
            };

            // Ana döküman — sadece küçük alanlar
            // API anahtarları (apiKeyData) kasıtlı olarak buraya dahil edilmiyor.
            await setDoc(doc(fsdb, 'users', uid), {
                stats:     typeof window.stats !== 'undefined' ? stats : {},
                grScores, perfHist, badges, profile, streak, lastDay,
                updatedAt: new Date().toISOString(),
                ...ydtaiStats
            }, { merge: true });

            // ── Kelime listeleri — subcollection: users/{uid}/lists/{listAdı} ──
            const currentAllData = typeof window.allData !== 'undefined' ? allData : {};
            const batch = writeBatch(fsdb);
            Object.keys(currentAllData).forEach(listName => {
                const words = currentAllData[listName];
                if (!Array.isArray(words) || words.length === 0) return;
                const safeKey = _fsCleanKey(listName);
                const listRef = doc(fsdb, 'users', uid, 'lists', safeKey);
                batch.set(listRef, { displayName: listName, words: words, updatedAt: new Date().toISOString() });
            });
            await batch.commit();

            // ── AI Arşivleri — subcollection: users/{uid}/arsiv/{tip} ──
            const arsivMap = {
                kelime:  window.aiArsiv        || _lsGet('ydt_ai_arsiv')       || [],
                pasaj:   window.aiPasajArsiv   || _lsGet('ydt_ai_pasaj_arsiv') || [],
                gramer:  window.aiGramerArsiv  || _lsGet('ydt_gramer_arsiv')   || [],
                cloze:   window.aiClozeArsiv   || _lsGet('ydt_cloze_arsiv')    || [],
                yakin:   window.aiYakinArsiv   || _lsGet('ydt_yakin_arsiv')    || [],
                diyalog: window.aiDiyalogArsiv || _lsGet('ydt_diyalog_arsiv')  || [],
                durum:   window.aiDurumArsiv   || _lsGet('ydt_durum_arsiv')    || [],
                paracom: window.aiParaComArsiv || _lsGet('ydt_paracom_arsiv')  || [],
                paraboz: window.aiParaBozArsiv || _lsGet('ydt_paraboz_arsiv')  || [],
            };
            const arsivBatch = writeBatch(fsdb);
            Object.entries(arsivMap).forEach(([tip, arr]) => {
                arsivBatch.set(doc(fsdb, 'users', uid, 'arsiv', tip),
                    { items: arr, updatedAt: new Date().toISOString() });
            });
            await arsivBatch.commit();

            // ── Paragraf & Sorular — subcollection: users/{uid}/content/{tip} ──
            const paragraflarData     = window.paragraflar     || _lsGet('ydt_paragraflar')      || [];
            const paragrafSorularData = window.paragrafSorular || _lsGet('ydt_paragraf_sorular') || {};
            const contentBatch = writeBatch(fsdb);
            contentBatch.set(doc(fsdb, 'users', uid, 'content', 'paragraflar'),
                { items: paragraflarData, updatedAt: new Date().toISOString() });
            contentBatch.set(doc(fsdb, 'users', uid, 'content', 'paragrafSorular'),
                { data: paragrafSorularData, updatedAt: new Date().toISOString() });
            await contentBatch.commit();

            // ── Soru Bankaları — subcollection: users/{uid}/content/bank_{cat} ──
            const bankBatch = writeBatch(fsdb);
            ['paragraf','gramer','cloze','yakin','diyalog','paratam','durum','parabut'].forEach(cat => {
                const v = _lsGet(`ydt_bank_${cat}`);
                if (v && v.length) {
                    bankBatch.set(doc(fsdb, 'users', uid, 'content', `bank_${cat}`),
                        { items: v, updatedAt: new Date().toISOString() });
                }
            });
            await bankBatch.commit();

            // ── Admin: shared/content güncelle — custom claim kontrolü ───────────
            let _isAdminForSync = false;
            try {
                const _tokenResult = await window._currentUser?.getIdTokenResult?.();
                _isAdminForSync = _tokenResult?.claims?.admin === true;
            } catch(_) {}
            if (_isAdminForSync && paragraflarData.length > 0) {
                try {
                    await setDoc(doc(fsdb, 'shared', 'content'), {
                        paragraflar:     paragraflarData,
                        paragrafSorular: paragrafSorularData,
                        updatedAt:       new Date().toISOString(),
                        updatedBy:       uid
                    }, { merge: true });
                    console.log(`[shared] ${paragraflarData.length} paragraf shared/content'e yazıldı`);
                } catch(sharedErr) {
                    console.warn('[shared] Admin paylaşım yazma hatası:', sharedErr);
                }
            }

            _authSyncBar('synced', 'Kaydedildi ✓');
            setSyncStatus('ok');
            localStorage.setItem(`ydt_${uid}_stats`,    JSON.stringify(window.stats || {}));
            localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(window.allData || {}));
        } catch(e) {
            console.warn('Firestore kayıt hatası:', e);
            setSyncStatus('idle');
            localStorage.setItem(`ydt_${uid}_stats`,    JSON.stringify(window.stats || {}));
            localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(window.allData || {}));
        }
    }

    function _showLoginOverlay() {
        if (document.getElementById('login-overlay')) return;
        if (_overlayOpen) return; // Zaten açık
        _overlayOpen = true;
        const overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.innerHTML = `
            <div class="lo-bg-layer" aria-hidden="true">
                <div class="lo-orb lo-orb-1"></div>
                <div class="lo-orb lo-orb-2"></div>
                <div class="lo-orb lo-orb-3"></div>
                <div class="lo-grid-lines"></div>
            </div>
            <div class="lo-card">
                <!-- Üst logo + marka -->
                <div class="lo-brand">
                    <div class="lo-logo-wrap">
                        <div class="lo-logo-ring"></div>
                        <span class="lo-logo-icon" aria-hidden="true">🎓</span>
                    </div>
                    <div class="lo-brand-text">
                        <span class="lo-brand-name">YDT Master Pro</span>
                        <span class="lo-brand-tag">by Serkan Hoca</span>
                    </div>
                </div>

                <!-- Başlık -->
                <div class="lo-headline">
                    <h1 class="lo-title">Kelime Ustası <span class="lo-title-accent">ol.</span></h1>
                    <p class="lo-subtitle">Hafıza teknikleriyle kalıcı İngilizce öğrenme</p>
                </div>

                <!-- Stats bar — pasaj sayısı Firestore'dan dinamik okunur -->
                <div class="lo-stats-row" aria-label="Uygulama istatistikleri">
                    <div class="lo-stat">
                        <span class="lo-stat-num">1300+</span>
                        <span class="lo-stat-lbl">Kelime</span>
                    </div>
                    <div class="lo-stat-div" aria-hidden="true"></div>
                    <div class="lo-stat">
                        <span class="lo-stat-num" id="lo-stat-pasaj">…</span>
                        <span class="lo-stat-lbl">Pasaj</span>
                    </div>
                    <div class="lo-stat-div" aria-hidden="true"></div>
                    <div class="lo-stat">
                        <span class="lo-stat-num">SM-2</span>
                        <span class="lo-stat-lbl">Algoritma</span>
                    </div>
                </div>

                <!-- Google giriş butonu -->
                <button class="lo-btn-google" id="btn-google-signin" aria-label="Google hesabınla giriş yap">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google ile Giriş Yap</span>
                    <span class="lo-btn-google-arrow" aria-hidden="true">→</span>
                </button>

                <!-- Fayda maddecikleri -->
                <div class="lo-perks" aria-label="Giriş yapmanın avantajları">
                    <div class="lo-perk">
                        <span class="lo-perk-dot" aria-hidden="true"></span>
                        <span>Her cihazda senkronize ilerleme</span>
                    </div>
                    <div class="lo-perk">
                        <span class="lo-perk-dot" aria-hidden="true"></span>
                        <span>Kişisel istatistik & streak takibi</span>
                    </div>
                    <div class="lo-perk">
                        <span class="lo-perk-dot" aria-hidden="true"></span>
                        <span>Admin'in paylaştığı tüm içeriklere erişim</span>
                    </div>
                </div>

                <!-- Ayırıcı -->
                <div class="lo-divider" aria-hidden="true"><span>ya da</span></div>

                <!-- Misafir butonu -->
                <button class="lo-btn-guest" id="btn-guest">
                    Misafir olarak devam et
                    <span class="lo-guest-note">İlerleme kaydedilmez</span>
                </button>

                <!-- Yasal not -->
                <p class="lo-legal">Giriş yaparak <a href="#" class="lo-legal-link">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.</p>
            </div>`;

        document.body.appendChild(overlay);

        // Animasyon — kartı sahneye sok
        requestAnimationFrame(() => overlay.classList.add('lo-ready'));

        // Pasaj sayısını dinamik yükle — her zaman Firestore'dan taze veri çek.
        // localStorage / window.paragraflar sadece Firestore erişilemezse fallback.
        (async () => {
            const el = document.getElementById('lo-stat-pasaj');
            if (!el) return;

            // Hemen yerel değeri göster (kullanıcı boş görmesin)
            const _localCount = (() => {
                if (Array.isArray(window.paragraflar) && window.paragraflar.length)
                    return window.paragraflar.length;
                try {
                    const c = localStorage.getItem('ydt_paragraflar');
                    const a = c ? JSON.parse(c) : null;
                    return Array.isArray(a) ? a.length : 0;
                } catch(_) { return 0; }
            })();
            if (_localCount > 0) el.textContent = _localCount;

            // Firestore'dan her zaman taze sayıyı çek ve override et
            try {
                // Firestore modülleri henüz hazır değilse bekle (max 4sn)
                if (!window._fsdb || !window._doc || !window._getDoc) {
                    await new Promise((resolve) => {
                        const _t0 = Date.now();
                        const _poll = () => {
                            if (window._fsdb && window._doc && window._getDoc) return resolve();
                            if (Date.now() - _t0 > 4000) return resolve();
                            setTimeout(_poll, 200);
                        };
                        _poll();
                    });
                }
                if (!window._fsdb || !window._doc || !window._getDoc) return;

                const snap = await window._getDoc(window._doc(window._fsdb, 'shared', 'content'));
                if (snap.exists()) {
                    const d = snap.data();
                    if (Array.isArray(d.paragraflar) && d.paragraflar.length > 0) {
                        el.textContent = d.paragraflar.length;
                    }
                }
            } catch(e) {
                console.warn('[lo-stat] Firestore pasaj sayısı alınamadı:', e.message);
            }
        })();

        // Google giriş
        document.getElementById('btn-google-signin').addEventListener('click', _authSignIn);

        // Misafir girişi
        document.getElementById('btn-guest').addEventListener('click', () => {
            overlay.classList.add('lo-exit');
            setTimeout(() => overlay.remove(), 380);

            // Starter Pack yükle — misafir verisi
            if (typeof loadUserScopedData === 'function') {
                loadUserScopedData();
            } else {
                try {
                    const raw = localStorage.getItem('ydt_guest_all_data') || localStorage.getItem('ydt_all_data');
                    if (raw) window.allData = JSON.parse(raw);
                } catch(e) { console.warn('[guest] parse hatası:', e.message); }
                if (!window.allData || Object.keys(window.allData).length === 0) {
                    if (typeof DEFAULT_VOCAB !== 'undefined') window.allData = { ...DEFAULT_VOCAB };
                    else if (typeof YDT_STARTER_PACK !== 'undefined') window.allData = { ...YDT_STARTER_PACK };
                }
            }

            // Misafir banner'ını göster — kayıt ol teşviki
            setTimeout(_showGuestBanner, 800);

            document.dispatchEvent(new Event('ydtDataReady'));
        });
    }

    /* ── Auth Guard — misafir AI özelliklerine erişmeye çalışırsa ─────── */
    /**
     * Kullanıcı giriş yapmışsa fn() çalıştırır.
     * Misafirse "Bu özellik için giriş gerekli" modal'ı gösterir.
     * @param {Function} fn       — Çalıştırılacak fonksiyon
     * @param {string}   label    — Özellik adı (modal başlığı için)
     */
    window._requireAuth = function(fn, label) {
        if (window._currentUser) {
            fn();
        } else {
            _showAuthRequiredModal(label || 'Bu özellik');
        }
    };

    function _showAuthRequiredModal(featureName) {
        if (document.getElementById('auth-required-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'auth-required-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Giriş Gerekli');
        modal.innerHTML = `
            <div class="arm-backdrop"></div>
            <div class="arm-card">
                <div class="arm-icon" aria-hidden="true">🔐</div>
                <h2 class="arm-title">Giriş Gerekli</h2>
                <p class="arm-desc">
                    <strong>${featureName}</strong> için Google hesabınla giriş yapman gerekiyor.
                    <br><span class="arm-sub">Veriler buluta kaydedilir, her cihazda erişebilirsin.</span>
                </p>
                <button class="arm-btn-google" id="arm-signin-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google ile Giriş Yap
                </button>
                <button class="arm-btn-cancel" id="arm-cancel-btn">Şimdi Değil</button>
            </div>`;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('arm-visible'));

        const close = () => {
            modal.classList.remove('arm-visible');
            setTimeout(() => modal.remove(), 280);
        };

        document.getElementById('arm-signin-btn').addEventListener('click', () => {
            close();
            // Mevcut AuthModule üzerinden giriş başlat
            if (window.AuthModule && typeof window.AuthModule.authSignIn === 'function') {
                window.AuthModule.authSignIn();
            } else if (typeof _authSignIn === 'function') {
                _authSignIn();
            }
        });
        document.getElementById('arm-cancel-btn').addEventListener('click', close);
        modal.querySelector('.arm-backdrop').addEventListener('click', close);
    }

    /* ── Misafir Banner — sayfa içinde sabit şerit ─────────────────────── */
    function _showGuestBanner() {
        if (document.getElementById('guest-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'guest-banner';
        banner.setAttribute('role', 'banner');
        banner.innerHTML = `
            <div class="gb-inner">
                <span class="gb-icon" aria-hidden="true">☁️</span>
                <div class="gb-text">
                    <strong>İlerlemen kaydedilmiyor</strong>
                    <span>Giriş yap — tüm veriler bulutta korunsun</span>
                </div>
                <button class="gb-btn" id="gb-signin-btn">Giriş Yap</button>
                <button class="gb-close" id="gb-close-btn" aria-label="Kapat">✕</button>
            </div>`;
        document.body.appendChild(banner);
        requestAnimationFrame(() => banner.classList.add('gb-visible'));

        document.getElementById('gb-signin-btn').addEventListener('click', () => {
            banner.remove();
            _showLoginOverlay();
        });
        document.getElementById('gb-close-btn').addEventListener('click', () => {
            banner.classList.remove('gb-visible');
            setTimeout(() => banner.remove(), 300);
        });
    }

    /**
     * _setSignInBtnState — Google giriş butonunun görsel durumunu günceller.
     * state: 'loading' | 'idle' | 'error'
     */
    function _setSignInBtnState(state, msg) {
        const btn = document.getElementById('btn-google-signin');
        if (!btn) return;
        if (state === 'loading') {
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.querySelector('span') && (btn.querySelector('span').textContent = 'Yükleniyor...');
        } else if (state === 'error') {
            btn.disabled = false;
            btn.style.opacity = '1';
            const sp = btn.querySelector('span');
            if (sp) sp.textContent = msg || 'Hata — tekrar dene';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            const sp = btn.querySelector('span');
            if (sp) sp.textContent = 'Google ile Giriş Yap';
        }
    }

    /** Tüm Google giriş butonları için durum güncelle */
    function _triggerAllGoogleBtns(state, msg) {
        ['btn-google-signin', 'pgh-btn-google', 'arm-btn-google'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = state === 'loading';
            el.style.opacity = state === 'loading' ? '0.7' : '1';
        });
        _setSignInBtnState(state, msg);
    }

    function _hideLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (!overlay) return;
        _overlayOpen = false;
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 400);
    }

    /**
     * _authSignIn — Ortama göre strateji seçer:
     *
     *  • localhost / 127.0.0.1 / 192.168.x.x  → signInWithPopup
     *    Redirect kullanılırsa Firebase, authDomain (firebaseapp.com) üzerinden
     *    döner ve token localhost'ta yakalanamaz. Popup bu durumda hatasız çalışır.
     *
     *  • Production (firebaseapp.com / özel domain) → signInWithRedirect
     *    COOP header'ı olan sunucularda popup bloke edilebilir; redirect daha güvenilir.
     */
    function _isLocalEnv() {
        const h = location.hostname;
        return h === 'localhost' || h === '127.0.0.1' || /^192\.168\.\d+\.\d+$/.test(h) || /^10\.\d+\.\d+\.\d+$/.test(h);
    }

    async function _authSignIn() {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        _triggerAllGoogleBtns('loading');
        try {
            // Her ortamda signInWithPopup — signInWithRedirect sayfayı yeniden
            // yükler ve onAuthStateChanged(null) → overlay döngüsüne girer.
            // Popup COOP header'ında bloke olsa bile Firebase kendi fallback'ini kullanır.
            await signInWithPopup(auth, provider, browserPopupRedirectResolver);
            _triggerAllGoogleBtns('idle');
        } catch(e) {
            _triggerAllGoogleBtns('idle');
            if (
                e.code === 'auth/popup-closed-by-user' ||
                e.code === 'auth/cancelled-popup-request' ||
                e.code === 'auth/redirect-cancelled-by-user'
            ) return; // Kullanıcı kapattı — sessizce geç
            const domain = location.hostname + (location.port ? ':' + location.port : '');
            if (e.code === 'auth/unauthorized-domain') {
                console.error(`[auth] Yetkisiz domain: "${domain}". Firebase Console → Authentication → Authorized domains.`);
                _triggerAllGoogleBtns('error', `"${domain}" yetkisiz`);
            } else {
                console.error('[auth] Giriş hatası:', e.code, e.message);
                _triggerAllGoogleBtns('error', 'Giriş başarısız — tekrar dene');
            }
        }
    }

    /**
     * _authReady — Firebase auth durumu netleşene kadar overlay açılmaz.
     *
     * Strateji:
     *   • Localhost/LAN  → signInWithPopup  → getRedirectResult null döner → hemen ready
     *   • Production     → signInWithRedirect → getRedirectResult user/null → sonra ready
     *
     * onAuthStateChanged(null) her iki durumda da ilk tetiklenişte overlay
     * açmamalı; auth durumu netleştikten sonra açmalı.
     */
    /**
     * Auth başlatma — tek kaynaktan, race-condition'sız.
     *
     * Firebase'in auth başlatma sırası:
     *   1. initializeAuth() çağrıldı — persistence (IndexedDB/localStorage) kontrol ediliyor
     *   2. onAuthStateChanged ilk tetiklenişi — user var mı yok mu belli oluyor
     *   3. (production only) getRedirectResult — redirect token'ı yakalar
     *
     * Çözüm: onAuthStateChanged'i TEK karar noktası yap.
     * _authInitDone flag'i ile ilk tetiklenişi bekle, o noktada karar ver.
     * getRedirectResult'ı sadece production'da, sessizce çalıştır.
     *
     * ── AUTH OVERLAY STRATEJİSİ ─────────────────────────────────────────
     * Sorun: onAuthStateChanged ilk ateşlemede null gelir (IndexedDB okunurken).
     * Bu "kullanıcı yok" anlamına gelmez — token doğrulanıyor olabilir.
     * Çözüm: İlk null'da 800ms bekle. Bu sürede user gelirse overlay açılmaz.
     *         Sonraki null'larda (gerçek çıkış) gecikme sıfır → anında açılır.
     * ────────────────────────────────────────────────────────────────────
     */

    // ── Auth durum flag'leri ─────────────────────────────────────────────
    let _isFirstAuthEvent  = true;   // İlk onAuthStateChanged tetiklenişi mi?
    let _overlayPending    = null;   // İlk null → geciktirilen timer referansı
    let _overlayOpen       = false;  // Overlay şu an DOM'da mı?

    // ── Admin görünürlüğü ────────────────────────────────────────────────
    async function _updateAdminVisibility(user) {
        let isAdmin = false;
        if (user) {
            try {
                const tokenResult = await user.getIdTokenResult();
                isAdmin = tokenResult.claims.admin === true;
            } catch(e) {
                console.warn('[auth] Admin claim kontrol hatası:', e.message);
            }
        }
        ['sb-admin','di-admin'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = isAdmin ? '' : 'none';
        });
        window._isAdmin = isAdmin;
    }

    // ── Çıkış ────────────────────────────────────────────────────────────
    async function _authSignOut() {
        if (authTimerInterval) { clearInterval(authTimerInterval); authTimerInterval = null; }
        if (authSaveInterval)  { clearInterval(authSaveInterval);  authSaveInterval  = null; }
        const user = auth.currentUser;
        if (user) await _saveUserData(user.uid);
        // Çıkışta: ilk event flag'ini koru (false) → gecikme olmadan overlay açılır
        _isFirstAuthEvent = false;
        await signOut(auth);
        // onAuthStateChanged(null) overlay'i açacak
    }

    // ── onAuthStateChanged — tek karar noktası ───────────────────────────
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // ── Kullanıcı var ────────────────────────────────────────────
            // Bekleyen overlay timer varsa iptal et — overlay hiç açılmasın
            if (_overlayPending) { clearTimeout(_overlayPending); _overlayPending = null; }
            _isFirstAuthEvent = false;
            _overlayOpen      = false;

            window._currentUser = user;
            window.stats        = { totalAnswers: 0, correctAnswers: 0, totalMinutes: 0 };
            window.allData      = {};

            _updateAuthStats();
            await _updateAdminVisibility(user);
            _hideLoginOverlay();
            _updateProfilUI(user);
            await _loadUserData(user.uid);
            if (typeof obCheckAndShow === 'function') obCheckAndShow();

            if (!authTimerInterval) {
                authTimerInterval = setInterval(() => {
                    if (typeof window.stats !== 'undefined') {
                        stats.totalMinutes = (stats.totalMinutes || 0) + 1;
                        _updateAuthStats();
                        const u = auth.currentUser;
                        if (u) localStorage.setItem(`ydt_${u.uid}_stats`, JSON.stringify(window.stats));
                    }
                }, 60000);
            }
            if (!authSaveInterval) {
                authSaveInterval = setInterval(() => _saveUserData(user.uid), 5 * 60 * 1000);
                window.addEventListener('beforeunload', () => _saveUserData(user.uid), { once: true });
            }

        } else {
            // ── Kullanıcı yok ────────────────────────────────────────────
            window._currentUser = null;
            window.stats        = { totalAnswers: 0, correctAnswers: 0, totalMinutes: 0 };
            _updateAuthStats();
            _updateAdminVisibility(null);
            _updateProfilUI(null);

            if (typeof loadUserScopedData === 'function') {
                loadUserScopedData();
            } else if (typeof DEFAULT_VOCAB !== 'undefined') {
                window.allData = { ...DEFAULT_VOCAB };
                allData = window.allData;
            } else {
                window.allData = {};
            }
            document.dispatchEvent(new Event('ydtDataReady'));

            // İlk event mi? → 800ms bekle (IndexedDB token okuma süresi)
            // Sonraki eventler (gerçek çıkış) → gecikme yok, anında aç
            const delay = _isFirstAuthEvent ? 800 : 0;
            _isFirstAuthEvent = false;

            if (_overlayPending) clearTimeout(_overlayPending);
            _overlayPending = setTimeout(() => {
                _overlayPending = null;
                // Son kontrol: bu sürede user gelmiş olabilir
                if (!window._currentUser && !_overlayOpen) {
                    _overlayOpen = true;
                    _showLoginOverlay();
                }
            }, delay);
        }
    });

    // ── Global erişim ────────────────────────────────────────────────────
    window.AuthModule = {
        authSignIn:          _authSignIn,
        authSignOut:         _authSignOut,
        syncNow:             async () => { const u = auth.currentUser; if (u) await _saveUserData(u.uid); },
        updateAuthStats:     _updateAuthStats,
        updateProfilWidgets: _updateProfilWidgets
    };

    // Çıkış butonuna direkt listener — data-action delegation'ın fallback'i
    const _bindLogoutBtn = () => {
        const btn = document.querySelector('.profil-gh-logout');
        if (btn && !btn._logoutBound) {
            btn._logoutBound = true;
            btn.addEventListener('click', _authSignOut);
        }
    };
    document.addEventListener('DOMContentLoaded', _bindLogoutBtn);
    _bindLogoutBtn();