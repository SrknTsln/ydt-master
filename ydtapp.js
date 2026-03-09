/**
 * ydtapp.js — YDT Master Pro Uygulama Katmanı
 *
 * Kapsam : Günün Görevi dashboard render, ydtDataReady event handler,
 *          data-nav merkezi delegation, starter-pack purge, ydtSignOut.
 * Bağımlılık : motor.js, utils.js, kelimeler.js (global state: allData, stats)
 * Taşıma notu: index.html içindeki üçüncü <script> bloğundan (satır 3719)
 *              ayrıştırılmıştır — CSP 'unsafe-inline' kaldırımının parçası.
 */

'use strict';

/* ════════════════════════════════════════════════════════════════════
   GÜNÜN GÖREVİ DASHBOARD
   ════════════════════════════════════════════════════════════════════ */

function initDashToday() {
    // allData yoksa veya boşsa localStorage'dan yükle (giriş yapan + misafir)
    if (!window.allData || Object.keys(window.allData).length === 0) {
        if (typeof loadUserScopedData === 'function') {
            loadUserScopedData();
        } else if (typeof getUserKey === 'function') {
            const key = getUserKey('all_data');
            if (key) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) { window.allData = JSON.parse(raw); allData = window.allData; }
                } catch (e) { /* bozuk veri — sessizce geç */ }
            }
        }
    }

    // Kullanıcı çıkış yaptıysa dashboard'u render etme
    if (!window._currentUser && (!window.allData || Object.keys(window.allData).length === 0)) return;

    const sm2Due  = (typeof countSM2Due === 'function') ? countSM2Due() : 0;
    const allKeys = Object.keys(window.allData || {});
    const totalW  = allKeys.reduce((s, k) => {
        const v = (window.allData || {})[k];
        return s + (Array.isArray(v) ? v.length : 0);
    }, 0);

    const titleEl   = document.getElementById('dash-today-title');
    const metaEl    = document.getElementById('dash-today-meta');
    const iconEl    = document.getElementById('dash-today-icon');
    const ctaLabel  = document.getElementById('dash-today-cta-label');
    const toggleBtn = document.getElementById('dash-lists-toggle');
    const toggleLbl = document.getElementById('dash-lists-toggle-label');
    const dropdown  = document.getElementById('dash-lists-dropdown');
    if (!titleEl) return;

    const hour  = new Date().getHours();
    const greet = hour < 12 ? 'Günaydın 🌅' : hour < 18 ? 'İyi günler ☀️' : 'İyi akşamlar 🌙';

    // Reset dropdown
    if (dropdown) { dropdown.innerHTML = ''; dropdown.style.display = 'none'; }
    if (toggleBtn) toggleBtn.style.display = 'none';

    if (sm2Due > 0) {
        titleEl.innerHTML    = `<strong>${sm2Due}</strong> kelime tekrar seni bekliyor`;
        metaEl.textContent   = 'SM-2 algoritması: bugünkü tekrarları tamamla';
        iconEl.textContent   = '🧠';
        ctaLabel.textContent = 'Tekrara Başla';
        window._dashCTAFn   = () => (typeof startSM2Review === 'function') && startSM2Review();

    } else if (totalW === 0) {
        const _pack = (typeof DEFAULT_VOCAB     !== 'undefined') ? DEFAULT_VOCAB
                    : (typeof YDT_STARTER_PACK  !== 'undefined') ? YDT_STARTER_PACK : null;
        if (_pack && Object.keys(_pack).length > 0) {
            Object.keys(_pack).forEach(k => { if (!window.allData[k]) window.allData[k] = _pack[k]; });
            allData = window.allData;
            if (typeof _saveData === 'function') _saveData();
            initDashToday();
            return;
        }
        titleEl.innerHTML    = 'YDT Starter Pack\'i <strong>yükle</strong>';
        metaEl.textContent   = '1300+ hazır kelimeyle hemen başla';
        iconEl.textContent   = '🚀';
        ctaLabel.textContent = 'Starter Pack Yükle';
        window._dashCTAFn   = () => {
            if (typeof YDT_STARTER_PACK !== 'undefined') {
                Object.keys(YDT_STARTER_PACK).forEach(k => {
                    if (!allData[k]) allData[k] = YDT_STARTER_PACK[k];
                });
                if (typeof _saveData === 'function') _saveData();
                initDashToday();
            }
        };

    } else {
        titleEl.innerHTML    = `${greet} — <strong>${totalW}</strong> kelime seni bekliyor`;
        metaEl.textContent   = '';
        iconEl.textContent   = '📖';
        ctaLabel.textContent = 'Öğrenmeye Başla';
        window._dashCTAFn   = () => (typeof startStudy === 'function') && startStudy();

        if (dropdown && allKeys.length > 0) {
            const chipsHtml = allKeys.map(k => {
                const cnt       = (allData[k] || []).length;
                const firstChar = k.trim().charAt(0);
                const hasEmoji  = /\p{Emoji}/u.test(firstChar);
                const label     = hasEmoji ? k : `📚 ${k}`;
                return `<span class="dash-list-chip">${label} <b>${cnt}</b></span>`;
            }).join('');
            dropdown.innerHTML = `<div class="dash-list-chips">${chipsHtml}</div>`;
        }

        if (toggleBtn && toggleLbl) {
            toggleLbl.textContent  = `📚 ${allKeys.length} liste`;
            toggleBtn.style.display = 'inline-flex';
        }
    }
}

function toggleDashLists() {
    const dropdown = document.getElementById('dash-lists-dropdown');
    const chev     = document.getElementById('dash-lists-chev');
    if (!dropdown) return;
    const open = dropdown.style.display !== 'none';
    dropdown.style.display = open ? 'none' : 'block';
    if (chev) chev.style.transform = open ? '' : 'rotate(180deg)';
}

function dashTodayCTA() {
    if (typeof window._dashCTAFn === 'function') window._dashCTAFn();
}

/* ════════════════════════════════════════════════════════════════════
   DATA READY EVENT
   ════════════════════════════════════════════════════════════════════ */

document.addEventListener('ydtDataReady', function () {
    initDashToday();
    if (typeof updateIndexStats    === 'function') updateIndexStats();
    if (typeof updateDailyGoalBar  === 'function') updateDailyGoalBar();
    if (typeof obRenderLevelBanner === 'function') obRenderLevelBanner();
}, { once: false });

// Fallback: module script DOM'dan sonra çalışır — DOMContentLoaded zaten geçmiş olabilir
(function startFallback() {
    let fired = false;
    document.addEventListener('ydtDataReady', () => { fired = true; }, { once: true });

    function tryFallback() {
        if (fired) return;
        try {
            const key = (typeof getUserKey === 'function') ? getUserKey('all_data') : 'ydt_guest_all_data';
            const raw = localStorage.getItem(key) || localStorage.getItem('ydt_all_data');
            if (raw) allData = JSON.parse(raw);
        } catch (e) {
            if (window.YDT?.logger) YDT.logger.warn('[startFallback] allData parse hatası, sıfırlandı:', e.message);
            allData = {};
        }
        document.dispatchEvent(new Event('ydtDataReady'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryFallback, 400));
    } else {
        setTimeout(tryFallback, 400);
    }
})();

/* ════════════════════════════════════════════════════════════════════
   MERKEZI SAYFA TEMIZLEYICI & DATA-NAV DELEGATION
   ════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    /* ── Fullscreen modül sayfalarını nav tıklamasında gizle ─────── */
    function hideFullScreenPages() {
        document.querySelectorAll('.cx-page, .sr-page, .tw-page').forEach(function (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
        });
    }
    const navSel = '.sb-btn:not(#sb-typing):not(#sb-context):not(#sb-sm2), .sb-btn-sub, .mob-drawer-btn:not(#di-typing):not(#di-context):not(#di-sm2)';
    document.querySelectorAll(navSel).forEach(function (btn) {
        btn.addEventListener('click', hideFullScreenPages);
    });

    /* ── data-nav butonları için merkezi click delegation ────────── */
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-nav]');
        if (!btn) return;
        if (btn.hasAttribute('onclick')) return; // Kendi onclick'i öncelikli
        const pageId = btn.getAttribute('data-nav');
        if (!pageId) return;
        e.preventDefault();
        if (typeof navTo     === 'function') navTo(pageId);
        else if (typeof showPage === 'function') showPage(pageId);
    });

});

/* ════════════════════════════════════════════════════════════════════
   ESKI BAŞLANGIÇ PAKETİ TEMİZLEYİCİ
   ════════════════════════════════════════════════════════════════════ */

/**
 * Eski / sistem listelerini allData'dan siler.
 * Kullanıcının kendi oluşturduğu listeler KORUNUR.
 * @param {Object} dataObj - window.allData referansı
 */
function _purgeAllDataLegacyLists(dataObj) {
    if (!dataObj || typeof dataObj !== 'object') return;

    const VALID_STARTER_LISTS = new Set([
        '🟢 A2 Temel', '🔵 B1 Orta', '🟡 B2 Orta-İleri', '🔴 C1 İleri', '🟣 C2 Üst-İleri'
    ]);

    const LEGACY_EXACT = new Set([
        'Genel Kelimeler', 'Örnek Liste', 'kidsPlayer', 'paragrafSorular',
        'aiArsiv', 'Mart V2', 'Mart V1', 'Şubat V2', 'Şubat V1',
        'Liste 1', 'Liste 2', 'Liste 3', 'Liste 4', 'Liste 5',
        'YDT A1', 'YDT A2', 'YDT B1', 'YDT B2', 'YDT C1',
        'A2 Temel', 'B1 Orta', 'B2 Orta-İleri', 'C1 İleri',
    ]);

    Object.keys(dataObj).forEach(key => {
        const isLegacyExact   = LEGACY_EXACT.has(key);
        const isLegacyPattern = /^Liste\s+\d+(\s*-|\s+\d)/.test(key);
        const isSystemKey     = ['paragrafSorular', 'aiArsiv', 'kidsPlayer'].includes(key);
        const isOldStarter    = !VALID_STARTER_LISTS.has(key) && (isLegacyExact || isLegacyPattern || isSystemKey);

        if (isOldStarter) {
            delete dataObj[key];
            if (window.YDT?.logger) YDT.logger.debug(`[purge] Eski liste silindi: "${key}"`);
        }
    });

    const pack = (typeof DEFAULT_VOCAB    !== 'undefined') ? DEFAULT_VOCAB
               : (typeof YDT_STARTER_PACK !== 'undefined') ? YDT_STARTER_PACK : null;
    if (pack) {
        Object.keys(pack).forEach(k => {
            if (!dataObj[k]) {
                dataObj[k] = pack[k];
                if (window.YDT?.logger) YDT.logger.debug(`[purge] Yeni liste eklendi: "${k}"`);
            }
        });
    }
}

/* ════════════════════════════════════════════════════════════════════
   AUTH YARDIMCISI
   ════════════════════════════════════════════════════════════════════ */

function ydtSignOut() {
    if (window.AuthModule && typeof window.AuthModule.authSignOut === 'function') {
        window.AuthModule.authSignOut();
    } else {
        setTimeout(function () {
            if (window.AuthModule && typeof window.AuthModule.authSignOut === 'function') {
                window.AuthModule.authSignOut();
            }
        }, 800);
    }
}

// ── Window Exports — data-action delegation için zorunlu ────────────
window.toggleDashLists = toggleDashLists;
window.dashTodayCTA    = dashTodayCTA;
window.ydtSignOut      = ydtSignOut;
