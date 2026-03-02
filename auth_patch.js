// ════════════════════════════════════════════════════
// auth.js  —  PATCH DOSYASI
// Aşağıdaki 3 fonksiyonu mevcut auth.js'deki
// karşılıklarıyla değiştir.
// ════════════════════════════════════════════════════

// ── 1. loadUserData ───────────────────────────────
async function loadUserData(uid) {
    try {
        setSyncBar('syncing', 'Veriler yükleniyor…');

        const snap = await getDoc(doc(db, 'users', uid));

        if (snap.exists()) {
            const data    = snap.data();
            const cloudTs = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
            const localTs = parseInt(localStorage.getItem(`ydt_${uid}_updatedAt`) || '0');

            if (cloudTs >= localTs) {
                // Cloud daha yeni → cloud'u yükle
                if (data.allData) {
                    allData = data.allData;
                    localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(allData));
                }
                if (data.stats) {
                    stats = { ...stats, ...data.stats };
                    if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
                    localStorage.setItem(`ydt_${uid}_stats`, JSON.stringify(stats));
                }
            } else {
                // Local daha yeni → local'i koru, cloud'a yaz
                console.info('[Auth] Local data is newer, keeping local.');
                await saveUserData(uid);
            }

            // Paragraf verisi (her zaman cloud kazanır)
            if (data.paragraflar?.length > 0) {
                localStorage.setItem('ydt_paragraflar', JSON.stringify(data.paragraflar));
                window.paragraflar = data.paragraflar;
                if (typeof paragraflar !== 'undefined') {
                    paragraflar.splice(0, paragraflar.length);
                    data.paragraflar.forEach(p => paragraflar.push(p));
                }
            }
            if (data.paragrafSorular) {
                localStorage.setItem('ydt_paragraf_sorular', JSON.stringify(data.paragrafSorular));
                window.paragrafSorular = data.paragrafSorular;
            }
        }

        if (typeof updateSelectors          === 'function') updateSelectors();
        if (typeof updateIndexStats         === 'function') updateIndexStats();
        if (typeof updateDailyGoalBar       === 'function') updateDailyGoalBar();
        if (typeof _populateParagrafListesi === 'function') _populateParagrafListesi();
        if (typeof _updateRh2HeroStats      === 'function') _updateRh2HeroStats();
        if (typeof showProfilPage           === 'function') showProfilPage();

        setSyncBar('synced', 'Veriler senkronize edildi');

    } catch (e) {
        console.warn('Firestore yükleme hatası:', e);
        setSyncBar('synced', 'Yerel veriler kullanılıyor');
    }
}

// ── 2. saveUserData ───────────────────────────────
async function saveUserData(uid) {
    try {
        setSyncBar('syncing', 'Kaydediliyor…');
        const now = new Date().toISOString();

        const paragraflarData     = JSON.parse(localStorage.getItem('ydt_paragraflar')      || '[]');
        const paragrafSorularData = JSON.parse(localStorage.getItem('ydt_paragraf_sorular') || '{}');

        await setDoc(doc(db, 'users', uid), {
            stats:           stats   || {},
            allData:         allData || {},
            paragraflar:     paragraflarData,
            paragrafSorular: paragrafSorularData,
            updatedAt:       now
        }, { merge: true });

        localStorage.setItem(`ydt_${uid}_updatedAt`, Date.now().toString());
        setSyncBar('synced', 'Veriler senkronize edildi');

    } catch (e) {
        console.warn('Firestore kayıt hatası:', e);
        setSyncBar('synced', 'Yerel kaydedildi');
    }
}

// ── 3. onAuthStateChanged ─────────────────────────
onAuthStateChanged(auth, async (user) => {
    if (user) {
        window._currentUser = user;
        updateAdminVisibility(user.email);
        hideLoginOverlay();

        // Kullanıcıya özel veriyi yükle
        if (typeof loadUserScopedData === 'function') loadUserScopedData();

        updateProfilUI(user);
        await loadUserData(user.uid);
        startTimer();

        // Otomatik kayıt — 5 dakikada bir
        const autoSaveInterval = setInterval(
            () => saveUserData(user.uid), 5 * 60 * 1000
        );

        // beforeunload yerine visibilitychange (güvenilir + async-safe)
        const onHide = () => {
            if (document.visibilityState === 'hidden') saveUserData(user.uid);
        };
        document.addEventListener('visibilitychange', onHide);

        // _saveData hook: tüm modüller bunu çağırınca Firestore da tetiklenir
        window._saveData = function () {
            localStorage.setItem(`ydt_${user.uid}_all_data`, JSON.stringify(allData));
            localStorage.setItem(`ydt_${user.uid}_stats`,    JSON.stringify(stats));
            saveUserData(user.uid);
        };

        // Çıkışta temizlik
        window._authCleanup = () => {
            clearInterval(autoSaveInterval);
            document.removeEventListener('visibilitychange', onHide);
        };

    } else {
        window._currentUser = null;
        updateAdminVisibility(null);

        if (typeof window._authCleanup === 'function') window._authCleanup();

        // Guest moduna dön
        if (typeof loadUserScopedData === 'function') loadUserScopedData();

        showLoginOverlay();
    }
});
