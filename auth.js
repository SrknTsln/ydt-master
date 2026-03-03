// ════════════════════════════════════════════════════
// auth.js  —  YDT Master Google Auth + Firestore Sync
// ════════════════════════════════════════════════════
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC94N6Y8hxXmpFLrK6TvgVP4k-F9N6qX8A",
    authDomain: "ydt-master.firebaseapp.com",
    databaseURL: "https://ydt-master-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ydt-master",
    storageBucket: "ydt-master.firebasestorage.app",
    messagingSenderId: "674787283521",
    appId: "1:674787283521:web:fccca6b20e174f9e79ecc0"
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ════════════════════════════════════════════════════
// 🔑 KİŞİSEL localStorage NAMESPACE SİSTEMİ
//
// Her kullanıcının verisi kendi uid prefixi ile saklanır:
//   "ydt_stats"  →  "u_<uid>_ydt_stats"
//
// motor.js ve diğer dosyalar hâlâ "ydt_stats" gibi
// standart anahtarları kullanır. Biz burada localStorage'ı
// bir proxy ile sarıyoruz: kullanıcı girince kendi
// namespace'inden okur/yazar, çıkınca standart anahtarlar
// temizlenir.
// ════════════════════════════════════════════════════

// Kullanıcıya özel anahtarlar (tam eşleşme)
const PERSONAL_KEYS = [
    'ydt_stats',
    'ydt_all_data',
    'ydt_paragraflar',
    'ydt_paragraf_sorular',
    'ydt_streak',
    'ydt_last_day',
    'ydt_perf_hist',
    'ydt_daily',
    'ydt_gr_scores',
    'ydt_grammar_scores',
    'ydt_badges',
    'ydt_profile',
    'ydtai_tot',
    'ydtai_cor',
    'ydtai_wrg',
    'ydt_ai_arsiv',
    'ydt_gramer_arsiv',
];

// Prefix ile başlayan kişisel anahtarlar (ydt_daily_2025-01-01 gibi)
const PERSONAL_PREFIXES = [
    'ydt_daily_',
];

let _currentUID = null;

function _userKey(key) {
    if (!_currentUID) return key;
    return `u_${_currentUID}_${key}`;
}

function _isPersonalKey(key) {
    if (PERSONAL_KEYS.includes(key)) return true;
    return PERSONAL_PREFIXES.some(p => key.startsWith(p));
}

/**
 * localStorage proxy kurulumu.
 * Kullanıcı giriş yaptıktan sonra çağrılır.
 * motor.js ve diğer dosyalar localStorage.getItem/setItem
 * kullanmaya devam eder, biz altında sessizce uid-prefix ekleriz.
 */
function installLocalStorageProxy(uid) {
    _currentUID = uid;

    const _origGet    = Storage.prototype.getItem;
    const _origSet    = Storage.prototype.setItem;
    const _origRemove = Storage.prototype.removeItem;

    // Daha önce proxy kurulmuşsa tekrar kurma
    if (localStorage.__proxyInstalled) return;
    localStorage.__proxyInstalled = true;

    Storage.prototype.getItem = function(key) {
        if (this === localStorage && _currentUID && _isPersonalKey(key)) {
            const val = _origGet.call(this, _userKey(key));
            if (val !== null) return val;
            // Kullanıcıya özel veri yoksa eski paylaşımlı anahtara bak (ilk giriş geçiş desteği)
            return _origGet.call(this, key);
        }
        return _origGet.call(this, key);
    };

    Storage.prototype.setItem = function(key, value) {
        if (this === localStorage && _currentUID && _isPersonalKey(key)) {
            _origSet.call(this, _userKey(key), value);
            return;
        }
        _origSet.call(this, key, value);
    };

    Storage.prototype.removeItem = function(key) {
        if (this === localStorage && _currentUID && _isPersonalKey(key)) {
            _origRemove.call(this, _userKey(key));
            return;
        }
        _origRemove.call(this, key);
    };

    // Orijinal metodları sakla (logout için)
    localStorage.__origGet    = _origGet;
    localStorage.__origSet    = _origSet;
    localStorage.__origRemove = _origRemove;
}

/**
 * Kullanıcı çıkış yaptığında standart anahtarları sıfırla
 * ki bir sonraki kullanıcı temiz sayfa görünsün.
 */
function clearPersonalKeysFromStandard() {
    if (!localStorage.__origGet) return;
    const origGet    = localStorage.__origGet;
    const origRemove = localStorage.__origRemove;

    // Standart (prefix'siz) anahtarları temizle
    PERSONAL_KEYS.forEach(key => {
        origRemove.call(localStorage, key);
    });

    // Prefix'li günlük anahtarları temizle
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
    }
    allKeys.forEach(k => {
        if (k && PERSONAL_PREFIXES.some(p => k.startsWith(p)) && !k.startsWith('u_')) {
            origRemove.call(localStorage, k);
        }
    });
}

// ════════════════════════════════════════════════════
// TIMER
// ════════════════════════════════════════════════════
let timerInterval = null;
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (typeof stats !== 'undefined') {
            stats.totalMinutes = (stats.totalMinutes || 0) + 1;
            localStorage.setItem('ydt_stats', JSON.stringify(stats));
        }
    }, 60000);
}

// ════════════════════════════════════════════════════
// SYNC BAR
// ════════════════════════════════════════════════════
function setSyncBar(state, text) {
    const bar = document.getElementById('auth-sync-bar');
    if (!bar) return;
    bar.className = 'auth-sync-bar ' + state;
    const span = bar.querySelector('.auth-sync-text');
    if (span) span.textContent = text;
}

// ════════════════════════════════════════════════════
// PROFİL UI
// ════════════════════════════════════════════════════
function updateProfilUI(user) {
    const photo       = document.getElementById('profil-gh-photo');
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
    updateAuthStats();
}

function formatMinutes(mins) {
    const m = Math.round(mins) || 0;
    if (m < 60) return m + ' dk';
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? h + 's ' + r + 'dk' : h + 's';
}

function updateAuthStats() {
    if (typeof stats === 'undefined') return;
    const total    = stats.totalAnswers   || 0;
    const correct  = stats.correctAnswers || 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const minutes  = stats.totalMinutes   || 0;
    const el1 = document.getElementById('auth-stat-total');
    const el2 = document.getElementById('auth-stat-accuracy');
    const el3 = document.getElementById('auth-stat-time');
    if (el1) el1.textContent = total;
    if (el2) el2.textContent = accuracy + '%';
    if (el3) el3.textContent = formatMinutes(minutes);
    updateProfilWidgets();
}

function updateProfilWidgets() {
    if (typeof stats === 'undefined') return;
    const minutes = Math.round(stats.totalMinutes) || 0;
    const correct = stats.correctAnswers || 0;

    // XP & Seviye
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

    // Günlük hedef (20 soru)
    // Günlük anahtar artık proxy üzerinden uid-prefix alıyor
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

    // Takvim
    renderActivityCalendar();

    // Motivasyon
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

function renderActivityCalendar() {
    const cal = document.getElementById('pp-calendar');
    if (!cal) return;
    cal.innerHTML = '';
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = 'ydt_daily_' + d.toISOString().slice(0,10);
        // Proxy üzerinden uid-prefix'li anahtarı okur
        const count = parseInt(localStorage.getItem(key) || '0');
        const cell = document.createElement('div');
        cell.className = 'pp-cal-cell';
        cell.title = d.toLocaleDateString('tr-TR') + ': ' + count + ' soru';
        cell.dataset.intensity = count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 25 ? 3 : 4;
        cal.appendChild(cell);
    }
}

// ════════════════════════════════════════════════════
// FİRESTORE — YÜKLEME
// ════════════════════════════════════════════════════
async function loadUserData(uid) {
    try {
        setSyncBar('syncing', 'Veriler yükleniyor…');
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            const data = snap.data();

            // allData — kelime listeleri (kişiye özel)
            if (data.allData && typeof allData !== 'undefined') {
                allData = data.allData;
                localStorage.setItem('ydt_all_data', JSON.stringify(allData));
            }

            // stats — kişisel istatistikler
            if (data.stats && typeof stats !== 'undefined') {
                stats = { ...stats, ...data.stats };
                if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
                localStorage.setItem('ydt_stats', JSON.stringify(stats));
            }

            // Paragraflar — içerik (paylaşımlı, kişisel değil — üzerine yazma)
            if (data.paragraflar && Array.isArray(data.paragraflar) && data.paragraflar.length > 0) {
                // Paragraflar kişisel namespace DEĞİL, global içerik
                // Proxy'yi bypass ederek standart anahtara yaz
                const origSet = localStorage.__origSet || Storage.prototype.setItem;
                origSet.call(localStorage, 'ydt_paragraflar', JSON.stringify(data.paragraflar));
                window.paragraflar = data.paragraflar;
                if (typeof paragraflar !== 'undefined') {
                    paragraflar.splice(0, paragraflar.length);
                    data.paragraflar.forEach(function(p) { paragraflar.push(p); });
                }
            }

            if (data.paragrafSorular && typeof data.paragrafSorular === 'object') {
                const origSet = localStorage.__origSet || Storage.prototype.setItem;
                origSet.call(localStorage, 'ydt_paragraf_sorular', JSON.stringify(data.paragrafSorular));
                window.paragrafSorular = data.paragrafSorular;
            }

            // Kişisel aktivite geçmişi (streak, daily, perf_hist)
            if (data.userActivity) {
                const act = data.userActivity;
                if (act.streak !== undefined)   localStorage.setItem('ydt_streak',    String(act.streak));
                if (act.lastDay !== undefined)   localStorage.setItem('ydt_last_day',  act.lastDay);
                if (act.perfHist !== undefined)  localStorage.setItem('ydt_perf_hist', JSON.stringify(act.perfHist));
                if (act.daily !== undefined)     localStorage.setItem('ydt_daily',     JSON.stringify(act.daily));
                // Günlük tarih bazlı anahtarlar
                if (act.dailyDates && typeof act.dailyDates === 'object') {
                    Object.entries(act.dailyDates).forEach(([k, v]) => {
                        localStorage.setItem(k, String(v));
                    });
                }
            }

            // Grammar skorları (kişisel)
            if (data.grammarScores) {
                localStorage.setItem('ydt_gr_scores',       JSON.stringify(data.grammarScores.gr  || {}));
                localStorage.setItem('ydt_grammar_scores',  JSON.stringify(data.grammarScores.all || {}));
            }

            // AI arsiv (kişisel)
            if (data.aiArsiv) {
                localStorage.setItem('ydt_ai_arsiv',    JSON.stringify(data.aiArsiv.kelime || []));
                localStorage.setItem('ydt_gramer_arsiv', JSON.stringify(data.aiArsiv.gramer || []));
                window.aiArsiv       = data.aiArsiv.kelime || [];
                window.aiGramerArsiv = data.aiArsiv.gramer || [];
            }

            // AI soru istatistikleri
            if (data.aiStats) {
                localStorage.setItem('ydtai_tot', String(data.aiStats.tot || 0));
                localStorage.setItem('ydtai_cor', String(data.aiStats.cor || 0));
                localStorage.setItem('ydtai_wrg', String(data.aiStats.wrg || 0));
            }
        }

        if (typeof updateSelectors    === 'function') updateSelectors();
        if (typeof updateIndexStats   === 'function') updateIndexStats();
        if (typeof updateDailyGoalBar === 'function') updateDailyGoalBar();
        if (typeof _populateParagrafListesi === 'function') _populateParagrafListesi();
        if (typeof _updateRh2HeroStats      === 'function') _updateRh2HeroStats();
        if (typeof showProfilPage           === 'function') showProfilPage();
        setSyncBar('synced', 'Veriler yüklendi ✓');
    } catch (e) {
        console.warn('Firestore yükleme hatası:', e);
        setSyncBar('synced', 'Yerel veriler kullanılıyor');
    }
}

// ════════════════════════════════════════════════════
// FİRESTORE — KAYDETME
// ════════════════════════════════════════════════════
async function saveUserData(uid) {
    try {
        setSyncBar('syncing', 'Kaydediliyor…');

        // Günlük tarih bazlı anahtarları topla
        const dailyDates = {};
        const allStorageKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            allStorageKeys.push(localStorage.key(i));
        }
        allStorageKeys.forEach(k => {
            if (!k) return;
            // uid-prefix'li ydt_daily_ anahtarlarını bul
            const dailyPrefix = `u_${uid}_ydt_daily_`;
            if (k.startsWith(dailyPrefix)) {
                const shortKey = k.replace(`u_${uid}_`, '');
                dailyDates[shortKey] = localStorage.__origGet
                    ? localStorage.__origGet.call(localStorage, k)
                    : localStorage.getItem(k);
            }
        });

        // Grammar skorlarını oku (proxy üzerinden — uid-prefix'li)
        const grScores  = JSON.parse(localStorage.getItem('ydt_gr_scores')      || '{}');
        const allScores = JSON.parse(localStorage.getItem('ydt_grammar_scores') || '{}');

        // AI istatistikleri
        const aiTot = parseInt(localStorage.getItem('ydtai_tot') || '0');
        const aiCor = parseInt(localStorage.getItem('ydtai_cor') || '0');
        const aiWrg = parseInt(localStorage.getItem('ydtai_wrg') || '0');

        // Paragrafları — proxy bypass ile global anahtardan oku
        const origGet = localStorage.__origGet || Storage.prototype.getItem;
        const paragraflarData  = JSON.parse(origGet.call(localStorage, 'ydt_paragraflar') || '[]');
        const paragrafSorularData = JSON.parse(origGet.call(localStorage, 'ydt_paragraf_sorular') || '{}');

        // Aktivite verileri
        const streak  = localStorage.getItem('ydt_streak');
        const lastDay = localStorage.getItem('ydt_last_day');
        const perfHist = JSON.parse(localStorage.getItem('ydt_perf_hist') || '{}');
        const daily    = JSON.parse(localStorage.getItem('ydt_daily')     || '{}');

        await setDoc(doc(db, 'users', uid), {
            stats:           typeof stats   !== 'undefined' ? stats   : {},
            allData:         typeof allData !== 'undefined' ? allData : {},
            paragraflar:     paragraflarData,
            paragrafSorular: paragrafSorularData,
            updatedAt:       new Date().toISOString(),
            userActivity: {
                streak:     streak ? parseInt(streak) : 0,
                lastDay:    lastDay || '',
                perfHist:   perfHist,
                daily:      daily,
                dailyDates: dailyDates,
            },
            grammarScores: {
                gr:  grScores,
                all: allScores,
            },
            aiArsiv: {
                kelime: window.aiArsiv       || [],
                gramer: window.aiGramerArsiv || [],
            },
            aiStats: {
                tot: aiTot,
                cor: aiCor,
                wrg: aiWrg,
            },
        }, { merge: true });

        setSyncBar('synced', 'Veriler senkronize edildi ✓');
    } catch (e) {
        console.warn('Firestore kayıt hatası:', e);
        setSyncBar('synced', 'Yerel kaydedildi');
    }
}

// ════════════════════════════════════════════════════
// GİRİŞ OVERLAY
// ════════════════════════════════════════════════════
function showLoginOverlay() {
    if (document.getElementById('login-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.innerHTML = `
        <div class="login-card">
            <div class="login-logo">🎓</div>
            <div class="login-title">YDT Master Pro</div>
            <div class="login-sub">Devam etmek için Google hesabınla giriş yap — verilerini her cihazdan ulaş.</div>
            <div class="login-features">
                <div class="login-feat-row">
                    <span class="login-feat-icon">☁️</span>
                    <div class="login-feat-text"><strong>Bulut Senkronizasyon</strong>Her cihazda aynı ilerleme</div>
                </div>
                <div class="login-feat-row">
                    <span class="login-feat-icon">📊</span>
                    <div class="login-feat-text"><strong>Kişisel İstatistikler</strong>Gelişimini takip et</div>
                </div>
                <div class="login-feat-row">
                    <span class="login-feat-icon">🔒</span>
                    <div class="login-feat-text"><strong>Güvenli & Özel</strong>Sadece sen erişebilirsin</div>
                </div>
            </div>
            <button class="btn-google" id="btn-google-signin">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Giriş Yap
            </button>
            <div class="login-divider">veya</div>
            <button class="btn-guest" id="btn-guest">Misafir olarak devam et</button>
            <div class="login-note">Giriş yaparak gizlilik politikamızı kabul etmiş olursunuz.</div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('btn-google-signin').addEventListener('click', authSignIn);
    document.getElementById('btn-guest').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 400);
    });
}

function hideLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 400);
}

// ════════════════════════════════════════════════════
// AUTH İŞLEMLERİ
// ════════════════════════════════════════════════════
async function authSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (e) {
        console.error('Giriş hatası:', e.code, e.message);
    }
}

async function authSignOut() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const user = auth.currentUser;
    if (user) await saveUserData(user.uid);

    // Çıkışta standart anahtarları temizle — sonraki kullanıcı temiz görünsün
    clearPersonalKeysFromStandard();

    // stats ve allData'yı sıfırla (global değişkenler)
    if (typeof stats !== 'undefined') {
        stats.totalAnswers   = 0;
        stats.correctAnswers = 0;
        stats.totalMinutes   = 0;
    }

    // Proxy uid'ini sıfırla
    _currentUID = null;
    if (localStorage.__proxyInstalled) {
        // Proxy'yi kaldır (tekrar kurulabilmesi için)
        delete localStorage.__proxyInstalled;
    }

    await signOut(auth);
    showLoginOverlay();
}

async function syncNow() {
    const user = auth.currentUser;
    if (!user) { setSyncBar('synced', 'Giriş yapılmadı'); return; }
    await saveUserData(user.uid);
}

// ════════════════════════════════════════════════════
// ADMİN
// ════════════════════════════════════════════════════
const ADMIN_EMAIL = 'stasalan@gmail.com';

function updateAdminVisibility(email) {
    const isAdmin = email === ADMIN_EMAIL;
    const sbAdmin = document.getElementById('sb-admin');
    if (sbAdmin) sbAdmin.style.display = isAdmin ? '' : 'none';
    const diAdmin = document.getElementById('di-admin');
    if (diAdmin) diAdmin.style.display = isAdmin ? '' : 'none';
    const sbAdminBar = document.querySelector('.sb-admin-bar');
    if (sbAdminBar) {
        const adminBtn = sbAdminBar.querySelector('#sb-admin');
        if (adminBtn) adminBtn.style.display = isAdmin ? '' : 'none';
    }
    window._currentUser = isAdmin ? { email } : null;
}

// ════════════════════════════════════════════════════
// AUTH STATE — KULLANICI GİRİŞ/ÇIKIŞ DURUMU
// ════════════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
    if (user) {
        window._currentUser = user;
        updateAdminVisibility(user.email);

        // 1. Önce localStorage proxy'sini kur (uid namespace)
        installLocalStorageProxy(user.uid);

        // 2. Giriş overlay'ini gizle
        hideLoginOverlay();

        // 3. Profil UI'ı güncelle (şimdilik yerel stats ile)
        updateProfilUI(user);

        // 4. Firestore'dan kişisel verileri yükle
        await loadUserData(user.uid);

        // 5. Timer başlat
        startTimer();

        // 6. Otomatik kayıt (5 dk'da bir)
        setInterval(() => saveUserData(user.uid), 5 * 60 * 1000);

        // 7. Sayfa kapanırken kaydet
        window.addEventListener('beforeunload', () => saveUserData(user.uid));

        // 8. _saveData çağrıldığında Firestore'a da kaydet
        const originalSave = window._saveData;
        window._saveData = function() {
            if (typeof originalSave === 'function') originalSave();
            saveUserData(user.uid);
        };
    } else {
        window._currentUser = null;
        updateAdminVisibility(null);
        showLoginOverlay();
    }
});

window.AuthModule = { authSignIn, authSignOut, syncNow, updateAuthStats, updateProfilWidgets };
