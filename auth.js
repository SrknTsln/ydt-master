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

// ── Firebase Config (index.html ile aynı proje) ──
const firebaseConfig = {
    apiKey: "AIzaSyC94N6Y8hxXmpFLrK6TvgVP4k-F9N6qX8A",
    authDomain: "ydt-master.firebaseapp.com",
    databaseURL: "https://ydt-master-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ydt-master",
    storageBucket: "ydt-master.firebasestorage.app",
    messagingSenderId: "674787283521",
    appId: "1:674787283521:web:fccca6b20e174f9e79ecc0"
};

// Çift init önleme
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Timer (çalışma süresi) ────────────────────────
let timerInterval = null;

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (typeof stats !== 'undefined') {
            stats.totalMinutes = (stats.totalMinutes || 0) + 1;
            localStorage.setItem('ydt_stats', JSON.stringify(stats));
        }
    }, 60000); // her 1 dk
}

// ── Sync bar güncelle ─────────────────────────────
function setSyncBar(state, text) {
    const bar = document.getElementById('auth-sync-bar');
    if (!bar) return;
    bar.className = 'auth-sync-bar ' + state;
    const span = bar.querySelector('.auth-sync-text');
    if (span) span.textContent = text;
}

// ── Profil UI güncelle ────────────────────────────
function updateProfilUI(user) {
    // Fotoğraf
    const photo = document.getElementById('profil-gh-photo');
    const placeholder = document.getElementById('profil-gh-photo-placeholder');
    if (photo && user.photoURL) {
        photo.src = user.photoURL;
        photo.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }

    // İsim & email
    const displayName = user.displayName || 'Kullanıcı';
    const firstName   = displayName.split(' ')[0];

    const greetEl = document.getElementById('profil-gh-greeting-name');
    const nameEl  = document.getElementById('profil-gh-name');
    const emailEl = document.getElementById('profil-gh-email');

    if (greetEl) greetEl.textContent = firstName;
    if (nameEl)  nameEl.textContent  = displayName;
    if (emailEl) emailEl.textContent = user.email || '';

    // Stats güncelle
    updateAuthStats();
}

function updateAuthStats() {
    if (typeof stats === 'undefined') return;
    const total    = stats.totalAnswers  || 0;
    const correct  = stats.correctAnswers || 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const minutes  = stats.totalMinutes  || 0;

    const el1 = document.getElementById('auth-stat-total');
    const el2 = document.getElementById('auth-stat-accuracy');
    const el3 = document.getElementById('auth-stat-time');
    if (el1) el1.textContent = total;
    if (el2) el2.textContent = accuracy + '%';
    if (el3) el3.textContent = minutes + ' dk';
}

// ── Firestore'dan kullanıcı verisini yükle ────────
async function loadUserData(uid) {
    try {
        setSyncBar('syncing', 'Veriler yükleniyor…');
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            const data = snap.data();
            // allData
            if (data.allData && typeof allData !== 'undefined') {
                allData = data.allData;
                localStorage.setItem('ydt_all_data', JSON.stringify(allData));
            }
            // stats
            if (data.stats && typeof stats !== 'undefined') {
                stats = { ...stats, ...data.stats };
                if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
                localStorage.setItem('ydt_stats', JSON.stringify(stats));
            }
        }
        setSyncBar('synced', 'Veriler senkronize edildi');
        // UI yenile
        if (typeof updateSelectors === 'function') updateSelectors();
        if (typeof updateIndexStats === 'function') updateIndexStats();
        if (typeof updateDailyGoalBar === 'function') updateDailyGoalBar();
    } catch (e) {
        console.warn('Firestore yükleme hatası:', e);
        setSyncBar('synced', 'Yerel veriler kullanılıyor');
    }
}

// ── Firestore'a kullanıcı verisini kaydet ─────────
async function saveUserData(uid) {
    try {
        setSyncBar('syncing', 'Kaydediliyor…');
        const payload = {
            stats:     typeof stats   !== 'undefined' ? stats   : {},
            allData:   typeof allData !== 'undefined' ? allData : {},
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', uid), payload, { merge: true });
        setSyncBar('synced', 'Veriler senkronize edildi');
    } catch (e) {
        console.warn('Firestore kayıt hatası:', e);
        setSyncBar('synced', 'Yerel kaydedildi');
    }
}

// ── Login Overlay ─────────────────────────────────
function showLoginOverlay() {
    // Daha önce eklendiyse ekleme
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
                    <div class="login-feat-text">
                        <strong>Bulut Senkronizasyon</strong>
                        Her cihazda aynı ilerleme
                    </div>
                </div>
                <div class="login-feat-row">
                    <span class="login-feat-icon">📊</span>
                    <div class="login-feat-text">
                        <strong>Kişisel İstatistikler</strong>
                        Gelişimini takip et
                    </div>
                </div>
                <div class="login-feat-row">
                    <span class="login-feat-icon">🔒</span>
                    <div class="login-feat-text">
                        <strong>Güvenli & Özel</strong>
                        Sadece sen erişebilirsin
                    </div>
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

            <button class="btn-guest" id="btn-guest">
                Misafir olarak devam et
            </button>

            <div class="login-note">
                Giriş yaparak gizlilik politikamızı kabul etmiş olursunuz. Verileriniz yalnızca sizinle paylaşılır.
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Event listeners
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

// ── Google Sign In ────────────────────────────────
async function authSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged halleder
    } catch (e) {
        console.error('Giriş hatası:', e.code, e.message);
        if (e.code === 'auth/popup-blocked') {
            alert('Popup engellendi. Lütfen tarayıcının popup engelleyicisini kapatın.');
        }
    }
}

// ── Google Sign Out ───────────────────────────────
async function authSignOut() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const user = auth.currentUser;
    if (user) await saveUserData(user.uid);
    await signOut(auth);
    showLoginOverlay();
}

// ── Manuel Sync ───────────────────────────────────
async function syncNow() {
    const user = auth.currentUser;
    if (!user) { setSyncBar('synced', 'Giriş yapılmadı'); return; }
    await saveUserData(user.uid);
}

// ── Auth State Observer ───────────────────────────
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Giriş yapıldı
        hideLoginOverlay();
        updateProfilUI(user);
        await loadUserData(user.uid);
        startTimer();

        // Her 5 dk otomatik kaydet
        setInterval(() => saveUserData(user.uid), 5 * 60 * 1000);

        // Sayfa kapanırken kaydet
        window.addEventListener('beforeunload', () => saveUserData(user.uid));

        // window._saveData'yı override et (Firestore'a da yazsın)
        const originalSave = window._saveData;
        window._saveData = function() {
            if (typeof originalSave === 'function') originalSave();
            saveUserData(user.uid);
        };

    } else {
        // Oturum yok — overlay göster
        showLoginOverlay();
    }
});

// ── Public API ────────────────────────────────────
window.AuthModule = {
    authSignIn,
    authSignOut,
    syncNow,
    updateAuthStats
};
