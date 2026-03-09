// ── Profil Sayfası — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

// 👤 PROFİL SAYFASI
// ══════════════════════════════════════════════
function showProfilPage() {
    // Hero state — misafir/auth güncel yansıtsın
    const heroAuth  = document.getElementById('profil-hero-auth');
    const heroGuest = document.getElementById('profil-hero-guest');
    if (window._currentUser) {
        if (heroAuth)  heroAuth.style.display  = 'block';
        if (heroGuest) heroGuest.style.display = 'none';
    } else {
        if (heroAuth)  heroAuth.style.display  = 'none';
        if (heroGuest) heroGuest.style.display = 'block';
        // Giriş butonunu bağla
        const btn = document.getElementById('profil-guest-signin-btn');
        if (btn && !btn._bound) {
            btn._bound = true;
            btn.addEventListener('click', () => {
                if (window.AuthModule && typeof window.AuthModule.authSignIn === 'function') {
                    window.AuthModule.authSignIn();
                }
            });
        }
    }
    // UKM listelerini yenile
    if (typeof ukmRefresh === 'function') {
        ukmRefresh();
        if (typeof ukmRefreshAddTab === 'function') ukmRefreshAddTab();
    }
    // İstatistikleri yenile
    let total = 0, learned = 0;
    Object.values(allData).forEach(list => {
        if (!Array.isArray(list)) return;
        total += list.length;
        list.forEach(w => {
            if ((w.errorCount || 0) <= 0 && (w.correctStreak || 0) >= 2) learned++;
        });
    });
    const acc = stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
    const streak = parseInt(localStorage.getItem('ydt_streak') || '0');
    const earned = JSON.parse(localStorage.getItem('ydt_badges') || '[]');

    // Profil bilgilerini yükle
    const profile = JSON.parse(localStorage.getItem('ydt_profile') || '{}');
    const name    = profile.name  || 'Kullanıcı';
    const avatar  = profile.avatar || '🎓';
    const goal    = profile.goal   || 'YDT\'ye hazırlanıyorum';

    const el = id => document.getElementById(id);
    if (el('profil-avatar'))     el('profil-avatar').innerText   = avatar;
    if (el('profil-name'))       el('profil-name').innerText     = name;
    if (el('profil-goal'))       el('profil-goal').innerText     = goal;
    if (el('profil-name-inp'))   el('profil-name-inp').value     = name;
    if (el('profil-goal-inp'))   el('profil-goal-inp').value     = goal;
    if (el('profil-stat-words')) el('profil-stat-words').innerText = total;
    if (el('profil-stat-learn')) el('profil-stat-learn').innerText = learned;
    if (el('profil-stat-acc'))   el('profil-stat-acc').innerText  = acc + '%';
    if (el('profil-stat-streak'))el('profil-stat-streak').innerText = streak + ' 🔥';
    if (el('profil-stat-time'))  el('profil-stat-time').innerText = Math.floor(stats.totalMinutes) + ' dk';
    if (el('profil-stat-badges'))el('profil-stat-badges').innerText = earned.length;

    // Rozet ön izlemesi
    const badgeGrid = el('profil-badge-preview');
    if (badgeGrid) {
        badgeGrid.innerHTML = BADGE_DEFS.map(b => {
            const unlocked = earned.includes(b.id);
            return `<div class="profil-badge ${unlocked ? 'profil-badge-on' : 'profil-badge-off'}" title="${b.desc}">
                <span>${b.icon}</span>
                <span class="profil-badge-lbl">${b.name}</span>
            </div>`;
        }).join('');
    }

    showPage('profil-page');

    // Profil widget'larını güncelle (avatar, isim, rozet)
    if (window.AuthModule && typeof window.AuthModule.updateProfilWidgets === 'function') {
        window.AuthModule.updateProfilWidgets();
    }
}

function saveProfilInfo() {
    const name   = (document.getElementById('profil-name-inp').value   || '').trim() || 'Kullanıcı';
    const goal   = (document.getElementById('profil-goal-inp').value   || '').trim() || '';
    const avatar = document.querySelector('.avatar-opt.selected')?.dataset.av || '🎓';
    localStorage.setItem('ydt_profile', JSON.stringify({ name, goal, avatar }));
    document.getElementById('profil-name').innerText = name;
    document.getElementById('profil-goal').innerText = goal;
    document.getElementById('profil-avatar').innerText = avatar;

    const btn = document.getElementById('profil-save-btn');
    const orig = btn.innerText;
    btn.innerText = '✅ Kaydedildi!';
    btn.style.background = '#22c55e';
    setTimeout(() => { btn.innerText = orig; btn.style.background = ''; }, 2000);
}

function selectAvatar(el) {
    document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
    // Tüm selector'ları başlangıçta doldur
    updateSelectors();

    // Sidebar genişliğini CSS variable olarak ayarla
    function setSidebarWidth() {
        const sb = document.querySelector('.desktop-sidebar');
        if (sb) {
            const w = sb.getBoundingClientRect().width;
            document.documentElement.style.setProperty('--sb-w', w + 'px');
        }
    }
    setSidebarWidth();
    if (!window._profileResizeAttached) {
        window.addEventListener('resize', setSidebarWidth);
        window._profileResizeAttached = true;
    }

    // Profil butonunu sidebar'a ekle
    const sbBottom = document.querySelector('.sb-bottom');
    if (sbBottom) {
        const profBtnSb = document.createElement('button');
        profBtnSb.className = 'sb-btn';
        profBtnSb.id = 'sb-profil';
        profBtnSb.onclick = showProfilPage;
        const profile = JSON.parse(localStorage.getItem('ydt_profile') || '{}');
        profBtnSb.innerHTML = `<span aria-hidden="true" class="sb-icon">${profile.avatar || '👤'}</span> Profilim`;
        sbBottom.insertBefore(profBtnSb, sbBottom.firstChild);
    }

    // AI Vocabulary Test sayfasını DOM'a ekle — tam yeniden tasarım
    // position:fixed doğru çalışması için body'ye ekle, desktop-main'e değil
    const mainContainer = document.body;
    mainContainer.insertAdjacentHTML('beforeend', `
    <div class="container hidden" id="ai-quiz-page" style="padding:0;max-width:none;">

        <!-- ══ HEADER ══ -->
        <div class="aiq-header">
            <button class="aiq-back-btn" data-action="navTo('index-page')">←</button>
            <div class="aiq-header-center">
                <div class="aiq-header-title">🤖 AI Vocabulary Test</div>
                <div class="aiq-header-sub" id="ai-quiz-sub">YDT seviyesinde AI destekli sorular</div>
            </div>
            <div class="aiq-counter" id="ai-word-counter">— / —</div>
        </div>

        <!-- ══ BODY ══ -->
        <div class="aiq-body">

            <!-- ── Kontrol Paneli — ortalanmış tek kolon ── -->
            <div class="aiq-control-panel" id="aiq-control-panel">

                <!-- İstatistik kartları -->
                <div class="aiq-stats-row">
                    <div class="aiq-stat-card aiq-stat-total">
                        <div class="aiq-stat-num" id="aiq-stat-total">0</div>
                        <div class="aiq-stat-lbl">Toplam</div>
                    </div>
                    <div class="aiq-stat-card aiq-stat-correct">
                        <div class="aiq-stat-num" id="aiq-stat-correct">0</div>
                        <div class="aiq-stat-lbl">Doğru</div>
                    </div>
                    <div class="aiq-stat-card aiq-stat-wrong">
                        <div class="aiq-stat-num" id="aiq-stat-wrong">0</div>
                        <div class="aiq-stat-lbl">Yanlış</div>
                    </div>
                    <div class="aiq-stat-card aiq-stat-pct">
                        <div class="aiq-stat-num" id="aiq-stat-pct">—</div>
                        <div class="aiq-stat-lbl">Başarı</div>
                    </div>
                </div>

                <!-- Başarı bar -->
                <div class="aiq-success-bar-wrap">
                    <div class="aiq-success-bar-fill" id="aiq-success-bar"></div>
                </div>

                <!-- İki kolon: Kelime grubu + Test ayarları -->
                <div class="aiq-two-col">

                    <!-- SOL: Kelime Grubu -->
                    <div class="aiq-card">
                        <div class="aiq-section-label">📚 Kelime Grubu</div>
                        <div class="aiq-list-grid" id="aiq-list-grid">
                            <!-- JS ile doldurulur -->
                        </div>
                    </div>

                    <!-- SAĞ: Test Ayarları -->
                    <div class="aiq-card">
                        <div class="aiq-section-label">⚙️ Test Ayarları</div>
                        <div class="aiq-settings-grid">
                            <div class="aiq-setting-item">
                                <div class="aiq-setting-label">🔢 Soru Sayısı</div>
                                <div class="aiq-setting-chips" id="aiq-q-count-chips">
                                    <button class="aiq-chip active" data-val="10" data-action="aiqSetCount(this,10)">10</button>
                                    <button class="aiq-chip" data-val="20" data-action="aiqSetCount(this,20)">20</button>
                                    <button class="aiq-chip" data-val="30" data-action="aiqSetCount(this,30)">30</button>
                                    <button class="aiq-chip" data-val="0" data-action="aiqSetCount(this,0)">Tümü</button>
                                </div>
                            </div>
                            <div class="aiq-setting-item">
                                <div class="aiq-setting-label">🎯 Zorluk</div>
                                <div class="aiq-setting-chips">
                                    <button class="aiq-chip active" data-val="ydt" data-action="aiqSetDiff(this,'ydt')">YDT</button>
                                    <button class="aiq-chip" data-val="kolay" data-action="aiqSetDiff(this,'kolay')">Kolay</button>
                                    <button class="aiq-chip" data-val="zor" data-action="aiqSetDiff(this,'zor')">Zor</button>
                                </div>
                            </div>
                            <div class="aiq-setting-item">
                                <div class="aiq-setting-label">📝 Soru Tipi</div>
                                <div class="aiq-setting-chips">
                                    <button class="aiq-chip active" data-val="bosluk" data-action="aiqSetType(this,'bosluk')">Boşluk</button>
                                    <button class="aiq-chip" data-val="anlam" data-action="aiqSetType(this,'anlam')">Anlam</button>
                                    <button class="aiq-chip" data-val="karisik" data-action="aiqSetType(this,'karisik')">Karışık</button>
                                </div>
                            </div>
                        </div>

                        <!-- API key -->
                        <div id="ai-key-section" style="display:none;margin-top:14px;">
                            <div class="aiq-section-label">🔑 API Anahtarı</div>
                            <div class="aiq-key-box">
                                <input type="password" id="ai-api-key" class="aiq-key-input" placeholder="Gemini API anahtarını girin...">
                                <button class="aiq-key-save-btn" data-action="saveKeyAndStart()">Kaydet ve Başla →</button>
                            </div>
                        </div>
                    </div>

                </div>


                <!-- ── Bilgi & Motivasyon Paneli ── -->
                <div class="aiq-info-strip">

                    <div class="aiq-info-tile aiq-info-ai">
                        <div class="aiq-info-tile-icon">🤖</div>
                        <div class="aiq-info-tile-body">
                            <div class="aiq-info-tile-title">Yapay Zeka Destekli</div>
                            <div class="aiq-info-tile-desc">Her soru, seçtiğin kelime için Gemini AI tarafından anlık olarak üretilir. Robotik tekrar yok — her seferinde farklı bağlam.</div>
                        </div>
                    </div>

                    <div class="aiq-info-tile aiq-info-ydt">
                        <div class="aiq-info-tile-icon">🎯</div>
                        <div class="aiq-info-tile-body">
                            <div class="aiq-info-tile-title">YDT Sınav Formatı</div>
                            <div class="aiq-info-tile-desc">Sorular gerçek YDT tarzında — boşluk doldurma ve anlam sorularıyla sınavda göreceğin formata alışırsın.</div>
                        </div>
                    </div>

                    <div class="aiq-info-tile aiq-info-habit">
                        <div class="aiq-info-tile-icon">📅</div>
                        <div class="aiq-info-tile-body">
                            <div class="aiq-info-tile-title">Düzenlilik = Başarı</div>
                            <div class="aiq-info-tile-desc">Araştırmalar, her gün 10 dakika kelime çalışmanın haftada 1 saat çalışmaktan 3× daha etkili olduğunu gösteriyor.</div>
                        </div>
                    </div>

                    <div class="aiq-info-tile aiq-info-track">
                        <div class="aiq-info-tile-icon">📊</div>
                        <div class="aiq-info-tile-body">
                            <div class="aiq-info-tile-title">İlerleni Takip Et</div>
                            <div class="aiq-info-tile-desc">Üstteki Doğru / Yanlış / Başarı verileri tüm zamanların özetini gösterir. Hedefin: %80 başarı oranını korumak.</div>
                        </div>
                    </div>

                </div>

                <!-- Başla butonu -->
                <button class="aiq-start-btn" id="aiq-start-btn" data-action="aiqBeginTest()">
                    <span>🚀 Testi Başlat</span>
                    <span class="aiq-start-sub" id="aiq-start-sub">10 soru seçildi</span>
                </button>

            </div>

            <!-- ── Quiz Alanı ── -->
            <div class="aiq-quiz-area" id="ai-quiz-content" style="display:none;">

                <!-- Üst bilgi çubuğu -->
                <div class="aiq-q-topbar">
                    <span class="aiq-q-word-tag" id="ai-target-display">—</span>
                    <div class="aiq-q-progress-wrap">
                        <div class="aiq-q-progress-track">
                            <div class="aiq-q-progress-fill" id="ai-progress-bar"></div>
                        </div>
                        <span class="aiq-q-prog-label" id="aiq-q-prog-label">1/10</span>
                    </div>
                    <button class="aiq-stop-btn" data-action="aiqStopTest()">✕ Bitir</button>
                </div>

                <!-- Soru kartı -->
                <div class="aiq-q-card">
                    <div class="aiq-q-difficulty" id="aiq-q-difficulty">🎯 YDT Seviyesi</div>
                    <div class="aiq-q-text" id="ai-q-text">
                        <div class="aiq-loading">
                            <div class="aiq-loading-spinner"></div>
                            <div>AI soruyu hazırlıyor...</div>
                            <div class="aiq-loading-sub">Bu işlem birkaç saniye sürebilir</div>
                        </div>
                    </div>
                </div>

                <!-- Şıklar -->
                <div class="aiq-options" id="ai-options"></div>

                <!-- Açıklama -->
                <div class="aiq-explanation" id="ai-explanation" style="display:none;"></div>

                <!-- Sonraki buton -->
                <button id="ai-next-btn" class="aiq-next-btn hidden" data-action="nextAIQuestion()">
                    Sonraki Soru →
                </button>

                <!-- Test sonu özet -->
                <div class="aiq-finish-card" id="aiq-finish-card" style="display:none;">
                    <div class="aiq-finish-emoji" id="aiq-finish-emoji">🏆</div>
                    <div class="aiq-finish-title">Test Tamamlandı!</div>
                    <div class="aiq-finish-stats">
                        <div class="aiq-finish-stat">
                            <span class="aiq-finish-num" id="aiq-finish-correct">0</span>
                            <span class="aiq-finish-lbl">Doğru</span>
                        </div>
                        <div class="aiq-finish-stat">
                            <span class="aiq-finish-num" id="aiq-finish-wrong">0</span>
                            <span class="aiq-finish-lbl">Yanlış</span>
                        </div>
                        <div class="aiq-finish-stat">
                            <span class="aiq-finish-num aiq-finish-pct" id="aiq-finish-pct">0%</span>
                            <span class="aiq-finish-lbl">Başarı</span>
                        </div>
                    </div>
                    <button class="aiq-start-btn" data-action="aiqBeginTest()" style="margin-top:4px;">🔄 Yeniden Başlat</button>
                    <button class="aiq-ghost-btn" data-action="aiqStopTest()">← Panele Dön</button>
                </div>

            </div>

        </div><!-- /aiq-body -->

    </div>`);

    // AI butonlarını menülere ekle — artık statik HTML'de mevcut, sadece mobil profil ekle
    const mobNav = document.querySelector('.mob-drawer-nav');
    if (mobNav) {
        const secHesap = document.createElement('div');
        secHesap.className = 'mob-drawer-sec';
        secHesap.innerText = 'Hesap';
        const profBtnMob = document.createElement('button');
        profBtnMob.className = 'mob-drawer-btn';
        profBtnMob.id = 'di-profil';
        profBtnMob.onclick = () => { mobCloseDrawer(); showProfilPage(); };
        const profileMob = JSON.parse(localStorage.getItem('ydt_profile') || '{}');
        profBtnMob.innerHTML = `<span aria-hidden="true" class="mob-d-icon">${profileMob.avatar || '👤'}</span> Profilim`;
        mobNav.appendChild(secHesap);
        mobNav.appendChild(profBtnMob);
    }

    // AI istatistik bloğunu stats sayfasına ekle
    const statsPage = document.getElementById('stats-page');
    if (statsPage) {
        const box = document.createElement('div');
        box.innerHTML = `
        <div style="background: var(--white); border: 2px solid var(--border); border-radius: 12px; padding: 18px; margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--ink); margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">🤖 AI Vocabulary Test Performansı</h3>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem;">
                <span style="color: var(--ink2);">Çözülen: <span id="ai-stat-tot">0</span></span>
                <span style="color: var(--green);">Doğru: <span id="ai-stat-cor">0</span></span>
                <span style="color: var(--red);">Yanlış: <span id="ai-stat-wrg">0</span></span>
            </div>
        </div>`;
        const grid = statsPage.querySelector('.stats-grid');
        if (grid) grid.appendChild(box); else statsPage.appendChild(box);
        updateAIStatsDisplay();
    }

    // Selectors ve günlük hedef
    updateSelectors();
    updateDailyGoalBar();
    setTimeout(updateSM2Badge, 200);
    setTimeout(updateArsivBadge, 300);
});
// ==========================================
// YENİ: PARAGRAF VE OKUMA MODU İŞLEMLERİ
// ==========================================

// paragraflar is declared globally in paragraf.js — do not redeclare here
// window.paragraflar is initialized in paragraf.js


// ── Window Exports (defer uyumluluğu) ────────────────────────────
window.showProfilPage = showProfilPage;
window.saveProfilInfo = saveProfilInfo;
window.selectAvatar   = selectAvatar;
