// ── Utils + UKM — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

/**
 * HTML entity encode — AI/user input'u innerHTML'e yazmadan önce uygula
 * Sadece &  < > " ' karakterlerini encode eder; emoji ve Unicode bozulmaz.
 * @param {*} s - sanitize edilecek değer
 * @returns {string} güvenli HTML string
 */
function _esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// PATCH: Uygulama geneli toast (alert yerine kullanılır)
// ════════════════════════════════════════════════════════
function _showAppToast(msg, type = 'warn') {
    // showAIToast ai.js'de tanımlı — her zaman sonra yükleniyor
    if (typeof showAIToast === 'function') {
        showAIToast(msg, type);
    } else {
        // Fallback: ai.js henüz yüklenmediyse (edge case)
        if (window.YDT) window.YDT.log.warn('[Toast]', msg);
        else console.warn('[YDT Toast]', msg);
    }
}

// ════════════════════════════════════════════════════════
// PATCH: Bottom nav tab'larını aktif sayfa ile senkronize et
// Lazy pattern: motor.js defer ile sonradan yükleniyor olabilir.
// DOMContentLoaded'da patch uygula — o noktada setNavActive kesinlikle tanımlı.
// ════════════════════════════════════════════════════════
(function _patchBottomNavSync() {
    const BN_MAP = {
        'index-page':          'bn-home',
        'study-page':          'bn-study',
        'study-done-page':     'bn-study',
        'quiz-page':           'bn-quiz',
        'stats-page':          'bn-stats',
        'exercise-page':       'bn-exercise',
        'typing-page':         'bn-exercise',
        'context-page':        'bn-exercise',
        'sm2-page':            'bn-exercise',
    };

    let _patchAttempts = 0;
    const _PATCH_MAX_ATTEMPTS = 60; // 60 × 50ms = 3 saniye timeout

    function _applyPatch() {
        // window.setNavActive bu noktada motor.js tarafından tanımlanmış olmalı
        if (typeof window.setNavActive !== 'function') {
            _patchAttempts++;
            if (_patchAttempts >= _PATCH_MAX_ATTEMPTS) {
                // motor.js yüklenemedi veya setNavActive tanımsız — sessizce çık
                console.warn('[YDT] _applyPatch: setNavActive tanımsız, max retry aşıldı. motor.js yüklendi mi?');
                return;
            }
            setTimeout(_applyPatch, 50);
            return;
        }
        const _orig = window.setNavActive;
        window.setNavActive = function _patchedSetNavActive(pageId) {
            _orig(pageId);
            document.querySelectorAll('.mob-tab').forEach(t => t.classList.remove('active'));
            const bnId = BN_MAP[pageId];
            if (bnId) {
                const btn = document.getElementById(bnId);
                if (btn) btn.classList.add('active');
            }
        };
    }

    // defer script'ler DOMContentLoaded'dan önce tamamlanır —
    // ama sıra garantisi için readyState kontrolü yapıyoruz.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _applyPatch);
    } else {
        _applyPatch();
    }
})();

// ══════════════════════════════════════════════
// ♿ FOCUS TRAP — WCAG 2.1 SC 2.1.2
// ══════════════════════════════════════════════
// Kullanım: trapFocus(el) → drawer/modal açılışında
//           releaseFocus() → kapanışında
// ──────────────────────────────────────────────
const FOCUSABLE = [
    'a[href]','button:not([disabled])','input:not([disabled])',
    'select:not([disabled])','textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

let _trapEl     = null;   // aktif trap container
let _trapBefore = null;   // trap öncesi focus'lu eleman (restore için)
let _trapHandler = null;  // aktif keydown listener ref

function trapFocus(el) {
    if (!el) return;
    releaseFocus(); // önceki trap varsa temizle

    _trapEl     = el;
    _trapBefore = document.activeElement;

    // İlk focusable elemana odaklan
    const focusables = Array.from(el.querySelectorAll(FOCUSABLE));
    if (focusables.length) focusables[0].focus();

    _trapHandler = function(e) {
        if (e.key !== 'Tab') return;
        const items = Array.from(el.querySelectorAll(FOCUSABLE));
        if (!items.length) { e.preventDefault(); return; }

        const first = items[0];
        const last  = items[items.length - 1];

        if (e.shiftKey) {
            // Shift+Tab: ilkteyse sona dön
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            // Tab: sondaysa başa dön
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    document.addEventListener('keydown', _trapHandler);
}

function releaseFocus() {
    if (_trapHandler) {
        document.removeEventListener('keydown', _trapHandler);
        _trapHandler = null;
    }
    // Drawer kapanınca burger'a ya da önceki elemana dön
    if (_trapBefore && typeof _trapBefore.focus === 'function') {
        _trapBefore.focus();
    }
    _trapEl     = null;
    _trapBefore = null;
}

// ⌨️  ESCAPE KEY — drawer & modal kapat
// ══════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;

    // 1. Mobil drawer
    const drawer = document.getElementById('mob-drawer');
    if (drawer && drawer.classList.contains('open')) {
        mobCloseDrawer();
        return;
    }

    // 2. Dinamik overlay modal'lar (import, paragraf-import, login vb.)
    const overlayIds = ['import-modal-overlay', 'paragraf-import-overlay', 'login-overlay'];
    for (const id of overlayIds) {
        const el = document.getElementById(id);
        if (el) { el.remove(); return; }
    }

    // 3. Herhangi bir fixed overlay (z-index yüksek)
    const anyOverlay = document.querySelector('[id$="-overlay"]:not(#mob-overlay)');
    if (anyOverlay) { anyOverlay.remove(); return; }
});

// ═══════════════════════════════════════════════════════════
// 🌙 THEME TOGGLE — Aydınlık / Karanlık Mod
// data-theme="dark" | "light" | (unset = sistem tercihi)
// NOT: initTheme IIFE kaldırıldı — ydt-theme.js üstlendi (FOUC prevention).
//      Burası sadece toggleTheme() ve _syncThemeUI() tanımlar.
// ═══════════════════════════════════════════════════════════

function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let next;
    if (!current) {
        next = sysDark ? 'light' : 'dark';
    } else {
        next = current === 'dark' ? 'light' : 'dark';
    }
    root.setAttribute('data-theme', next);
    localStorage.setItem('ydtTheme', next);
    _syncThemeUI();
}

function _syncThemeUI() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (!theme && sysDark);

    const icon    = document.getElementById('theme-icon');
    const sbIcon  = document.getElementById('sb-theme-icon');
    const sbLabel = document.getElementById('sb-theme-label');

    const emoji = isDark ? '☀️' : '🌙';
    if (icon)    icon.textContent    = emoji;
    if (sbIcon)  sbIcon.textContent  = emoji;
    if (sbLabel) sbLabel.textContent = isDark ? 'Aydınlık Mod' : 'Karanlık Mod';
}

// Sistem tercihi değişirse senkronize et
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _syncThemeUI);

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE UTILITY  — buildEmptyState(el, {icon,title,sub,cta})
// Tüm modüller bu fonksiyonu kullanır, tutarlı boş durum sağlanır
// ═══════════════════════════════════════════════════════════════

/**
 * Bir container'a standart boş durum içeriği yazar.
 * @param {HTMLElement|string} target - Element veya id string
 * @param {object} opts
 *   opts.icon  {string}   — Emoji veya HTML
 *   opts.title {string}   — Kısa başlık
 *   opts.sub   {string}   — Açıklama metni (opsiyonel)
 *   opts.cta   {string}   — CTA buton metni (opsiyonel)
 *   opts.onCta {function} — CTA tıklaması (opsiyonel)
 */
function buildEmptyState(target, opts = {}) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;

    const { icon = '📭', title = 'Henüz veri yok', sub = '', cta = '', onCta = null } = opts;

    el.setAttribute('aria-busy', 'false');
    // Use textContent for user-provided strings to prevent XSS
    const _wrapper = document.createElement('div');
    _wrapper.className = 'empty-state';
    _wrapper.setAttribute('role', 'status');
    _wrapper.setAttribute('aria-label', title);

    const _icon = document.createElement('div');
    _icon.className = 'empty-state-icon';
    _icon.setAttribute('aria-hidden', 'true');
    _icon.innerHTML = icon; // icons are app-controlled emojis/HTML

    const _titleEl = document.createElement('div');
    _titleEl.className = 'empty-state-title';
    _titleEl.textContent = title;

    _wrapper.appendChild(_icon);
    _wrapper.appendChild(_titleEl);

    if (sub) {
        const _sub = document.createElement('div');
        _sub.className = 'empty-state-sub';
        _sub.textContent = sub;
        _wrapper.appendChild(_sub);
    }
    if (cta && onCta) {
        const _ctaBtn = document.createElement('button');
        _ctaBtn.className = 'empty-state-cta btn';
        _ctaBtn.textContent = cta;
        _ctaBtn.addEventListener('click', onCta);
        _wrapper.appendChild(_ctaBtn);
    }
    el.innerHTML = '';
    el.appendChild(_wrapper);
}

/**
 * aria-busy yönetimi yardımcısı.
 * setLoading(el, true)  → skeleton gösterilirken busy=true
 * setLoading(el, false) → veri gelince busy=false
 */
function setLoading(target, busy) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    el.setAttribute('aria-busy', busy ? 'true' : 'false');
}

// Dashboard KPI ve today-card: veri gelince aria-busy=false yap
document.addEventListener('ydtDataReady', () => {
    setLoading('dash-kpi-row',    false);
    setLoading('dash-today-card', false);
    setLoading('idx-weak-words',  false);
    setLoading('idx-grammar-progress', false);
    setLoading('idx-sm2-plan',    false);
});

// ═══════════════════════════════════════════════════════════════
// KİŞİSEL KELİME YÖNETİCİSİ (UKM)
// Günlük 1 liste, liste başına 20 kelime limiti
// AI ile otomatik kelime bilgisi doldurma
// ═══════════════════════════════════════════════════════════════

const UKM_MAX_LISTS_PER_DAY = 1;
const UKM_MAX_WORDS_PER_LIST = 20;
const UKM_LISTS_KEY = () => getUserKey ? getUserKey('ukm_lists') : 'ydt_ukm_lists';
const UKM_QUOTA_KEY = () => getUserKey ? getUserKey('ukm_quota') : 'ydt_ukm_quota';

// Bugünün tarihi (YYYY-MM-DD)
function _ukmToday() {
    return new Date().toISOString().slice(0, 10);
}

// Kota: { date, listsCreated }
function _ukmGetQuota() {
    try {
        const raw = localStorage.getItem(UKM_QUOTA_KEY());
        if (raw) {
            const q = JSON.parse(raw);
            if (q.date === _ukmToday()) return q;
        }
    } catch(e) { log.debug("[UKM] quota read hatası, sıfırlandı"); }
    return { date: _ukmToday(), listsCreated: 0 };
}

function _ukmSaveQuota(q) {
    localStorage.setItem(UKM_QUOTA_KEY(), JSON.stringify(q));
}

// Tüm kişisel listeleri getir: { listName: [words...] }
function _ukmGetLists() {
    try {
        const raw = localStorage.getItem(UKM_LISTS_KEY());
        return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
}

function _ukmSaveLists(lists) {
    localStorage.setItem(UKM_LISTS_KEY(), JSON.stringify(lists));
    // allData'ya da senkronize et — Kelime Öğren görebilsin
    _ukmSyncToAllData(lists);
}

// allData'ya kişisel listeleri "📌 " prefix'i ile yaz
function _ukmSyncToAllData(lists) {
    // Önce eski UKM listelerini temizle
    Object.keys(allData).forEach(k => {
        if (k.startsWith('📌 ')) delete allData[k];
    });
    // Yenilerini ekle
    Object.entries(lists).forEach(([name, words]) => {
        if (words.length > 0) allData['📌 ' + name] = words;
    });
    if (window._saveData) window._saveData();
    if (typeof updateSelectors === 'function') updateSelectors();
}

// ── NAVİGASYON ──────────────────────────────────
function goToMyWords() {
    navTo('profil-page');
    if (typeof showProfilPage === 'function') showProfilPage();
    setTimeout(() => {
        const el = document.getElementById('ukm-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    ukmRefresh();
}

// ── TAB GEÇİŞİ ──────────────────────────────────
function ukmTab(tab) {
    ['lists', 'add'].forEach(t => {
        document.getElementById('ukm-tab-' + t)?.classList.toggle('active', t === tab);
        document.getElementById('ukm-panel-' + t)?.classList.toggle('active', t === tab);
    });
    if (tab === 'add') ukmRefreshAddTab();
}

// ── SAYFAYI YENİLE ───────────────────────────────
function ukmRefresh() {
    const quota = _ukmGetQuota();
    const lists = _ukmGetLists();
    const listCount = Object.keys(lists).length;
    const atLimit = quota.listsCreated >= UKM_MAX_LISTS_PER_DAY;

    // Kota badge
    const badge = document.getElementById('ukm-quota-badge');
    if (badge) {
        badge.textContent = `${quota.listsCreated} / ${UKM_MAX_LISTS_PER_DAY} liste`;
        badge.classList.toggle('full', atLimit);
    }

    // Kota uyarısı
    const warn = document.getElementById('ukm-quota-warn');
    if (warn) warn.classList.toggle('show', atLimit);

    // Oluştur butonu
    const createBtn = document.getElementById('ukm-create-btn');
    if (createBtn) createBtn.disabled = atLimit;

    // Liste container
    _ukmRenderLists(lists);
}

function _ukmRenderLists(lists) {
    const container = document.getElementById('ukm-lists-container');
    if (!container) return;

    const keys = Object.keys(lists);
    if (keys.length === 0) {
        container.innerHTML = '<div class="ukm-empty">Henüz kişisel listeniz yok.<br>Yukarıdan yeni bir liste oluşturun.</div>';
        return;
    }

    container.innerHTML = keys.map(name => {
        const words = lists[name];
        const pct = Math.round((words.length / UKM_MAX_WORDS_PER_LIST) * 100);
        return `
        <div class="ukm-list-item" style="
            display:flex;align-items:center;gap:10px;
            padding:10px 12px;border-radius:12px;
            border:1.5px solid var(--border);
            margin-bottom:8px;background:var(--white);
            cursor:pointer;transition:all .15s;
        " data-action="ukmSelectList('__NM__')" data-list-name="${name}">
            <span style="font-size:1.1rem">📌</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:.8rem;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                    <div style="flex:1;height:4px;background:var(--border);border-radius:4px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:var(--color-primary);border-radius:4px;transition:width .3s;"></div>
                    </div>
                    <span style="font-size:.65rem;font-weight:700;color:var(--ink3);white-space:nowrap;">${words.length}/${UKM_MAX_WORDS_PER_LIST}</span>
                </div>
            </div>
            <button data-stop="true" data-action="ukmDeleteList('__NM__')" data-list-name="${name}"
                style="width:28px;height:28px;border-radius:8px;border:1.5px solid var(--border);
                       background:transparent;cursor:pointer;color:var(--ink3);font-size:.85rem;
                       flex-shrink:0;transition:all .15s;"
                title="Listeyi sil">🗑</button>
        </div>`;
    }).join('');
}

// ── YENİ LİSTE OLUŞTUR ──────────────────────────
function ukmCreateList() {
    const nameEl = document.getElementById('ukm-new-name');
    const name = (nameEl?.value || '').trim();
    if (!name) { _showAppToast('Liste adı boş olamaz!'); return; }

    const quota = _ukmGetQuota();
    if (quota.listsCreated >= UKM_MAX_LISTS_PER_DAY) {
        showAIToast('Günlük liste limitine ulaştınız (1/gün).', 'warn'); return;
    }

    const lists = _ukmGetLists();
    if (lists[name]) { _showAppToast('Bu isimde liste zaten var!'); return; }

    lists[name] = [];
    _ukmSaveLists(lists);

    quota.listsCreated++;
    _ukmSaveQuota(quota);

    nameEl.value = '';
    ukmRefresh();
    // Kelime ekleme tabına geç ve bu listeyi seç
    ukmTab('add');
    setTimeout(() => {
        const sel = document.getElementById('ukm-target-list');
        if (sel) { sel.value = name; ukmLoadWordList(); }
    }, 100);
    _showAppToast(`✅ "${name}" listesi oluşturuldu!`);
}

// ── LİSTE SİL ───────────────────────────────────
function ukmDeleteList(name) {
    if (!confirm(`"${name}" listesi silinsin mi?`)) return;
    const lists = _ukmGetLists();
    delete lists[name];
    _ukmSaveLists(lists);
    ukmRefresh();
    _showAppToast(`🗑 "${name}" silindi.`);
}

// ── LİSTEYİ SEÇ (listeler tabından) ─────────────
function ukmSelectList(name) {
    ukmTab('add');
    setTimeout(() => {
        const sel = document.getElementById('ukm-target-list');
        if (sel) { sel.value = name; ukmLoadWordList(); }
    }, 80);
}

// ── ADD TAB YENİLE ───────────────────────────────
function ukmRefreshAddTab() {
    const lists = _ukmGetLists();
    const sel = document.getElementById('ukm-target-list');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Liste seçin —</option>';
    Object.keys(lists).forEach(n => sel.add(new Option(n, n)));
    if (prev && lists[prev]) sel.value = prev;
    ukmLoadWordList();
}

// ── SEÇİLİ LİSTENİN KELİMELERİNİ GÖSTER ─────────
function ukmLoadWordList() {
    const sel = document.getElementById('ukm-target-list');
    const name = sel?.value;
    const lists = _ukmGetLists();
    const words = name && lists[name] ? lists[name] : [];

    // Sayaç badge
    const badge = document.getElementById('ukm-word-count-badge');
    if (badge) {
        const full = words.length >= UKM_MAX_WORDS_PER_LIST;
        badge.textContent = `${words.length} / ${UKM_MAX_WORDS_PER_LIST}`;
        badge.style.color = full ? '#dc2626' : 'var(--ink3)';
    }

    // Form disable/enable
    const atWordLimit = words.length >= UKM_MAX_WORDS_PER_LIST;
    ['ukm-ai-btn', 'ukm-manual-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = atWordLimit || !name;
    });

    // Kelime listesi
    const listEl = document.getElementById('ukm-word-list');
    if (!listEl) return;
    if (words.length === 0) {
        listEl.innerHTML = '<div class="ukm-empty">Bu listede henüz kelime yok.</div>';
        return;
    }
    listEl.innerHTML = words.map((w, i) => `
        <div class="ukm-word-item">
            <span class="ukm-word-item-eng">${w.eng}</span>
            <span class="ukm-word-item-tr">${w.tr || '—'}</span>
            <button class="ukm-word-del" data-action="ukmDeleteWord(${i})" title="Sil">✕</button>
        </div>`).join('');
}

// ── KELİME SİL ───────────────────────────────────
function ukmDeleteWord(idx) {
    const sel = document.getElementById('ukm-target-list');
    const name = sel?.value;
    if (!name) return;
    const lists = _ukmGetLists();
    if (!lists[name]) return;
    lists[name].splice(idx, 1);
    _ukmSaveLists(lists);
    ukmLoadWordList();
}

// ── AI İLE DOLDUR ────────────────────────────────
let _ukmPendingWord = null;

// ── FREE DICTIONARY API: api.dictionaryapi.dev (API key yok, limit yok) ──────────────
async function _ukmFetchDictionary(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data) || !data[0]) return null;
    const entry   = data[0];
    const meaning = entry.meanings?.[0];
    const def     = meaning?.definitions?.[0];
    const phonObj = entry.phonetics?.find(p => p.text) || {};
    const audioObj= entry.phonetics?.find(p => p.audio && p.audio.includes('us')) ||
                    entry.phonetics?.find(p => p.audio) || {};
    return {
        phonetic : phonObj.text  || entry.phonetic || '',
        audio    : audioObj.audio ? (audioObj.audio.startsWith('//') ? 'https:' + audioObj.audio : audioObj.audio) : '',
        pos      : meaning?.partOfSpeech || 'n',
        definition: def?.definition || '',
        example  : def?.example || '',
        synonyms : meaning?.synonyms?.slice(0, 4) || []
    };
}

// ── DATAMUSE API: api.datamuse.com (API key yok, 100k/gün) ───────────────────────────
async function _ukmFetchDatamuse(word) {
    const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=spfd&max=1&qe=sp`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data[0]) return null;
    const tags = data[0].tags || [];
    const syllableTag = tags.find(t => t.startsWith('sc:'));
    return {
        syllables: syllableTag ? parseInt(syllableTag.replace('sc:', '')) : null,
        freq     : data[0].score || 0
    };
}

function _ukmEstimateCEFR(freq) {
    if (freq >= 50000) return 'A1';
    if (freq >= 20000) return 'A2';
    if (freq >= 8000)  return 'B1';
    if (freq >= 3000)  return 'B2';
    if (freq >= 800)   return 'C1';
    return 'C2';
}

let _ukmPendingAudio = '';

async function ukmFetchAI() {
    const eng = (document.getElementById('ukm-eng')?.value || '').trim();
    if (!eng) { _showAppToast('İngilizce kelimeyi girin!'); return; }
    const sel = document.getElementById('ukm-target-list');
    if (!sel?.value) { _showAppToast('Önce bir liste seçin!'); return; }

    const loadEl    = document.getElementById('ukm-ai-loading');
    const previewEl = document.getElementById('ukm-preview-card');
    if (loadEl) loadEl.classList.add('show');
    if (previewEl) previewEl.classList.remove('show');
    document.getElementById('ukm-ai-btn').disabled = true;

    try {
        // 1) Free Dictionary API + Datamuse — API key gerekmez
        const [dictRes, damuRes] = await Promise.allSettled([
            _ukmFetchDictionary(eng),
            _ukmFetchDatamuse(eng)
        ]);
        const dict = dictRes.status === 'fulfilled' ? dictRes.value : null;
        const damu = damuRes.status === 'fulfilled'  ? damuRes.value  : null;

        const phonetic  = dict?.phonetic  || '';
        const audio     = dict?.audio     || '';
        const pos       = dict?.pos       || 'n';
        const engDef    = dict?.definition|| '';
        const example   = dict?.example   || '';
        const syllables = damu?.syllables || null;
        const level     = damu ? _ukmEstimateCEFR(damu.freq) : 'B1';

        // 2) Türkçe anlam — kullanıcı girdiyse kullan, yoksa AI'ya sor
        let tr = (document.getElementById('ukm-tr')?.value || '').trim();
        let mnemonic = '';
        if (!tr) {
            const hasKey = typeof puter !== 'undefined' || (typeof AI_PROVIDERS !== 'undefined' && AI_PROVIDERS.some(p => localStorage.getItem(p.lsKey)));
            if (hasKey) {
                const ctx = engDef ? `Definition: "${engDef}"` : '';
                const prompt = `${ctx}\nIngilizce "${eng}" kelimesinin Türkçe karşılığını VE Türk öğrenciler için kısa bellek ipucu yaz.\nSADECE JSON: {"tr":"...","mnemonic":"..."}`;
                try { const r = await aiCall(prompt); tr = r.tr || '—'; mnemonic = r.mnemonic || ''; }
                catch(e) { tr = '—'; }
            } else { tr = '—'; }
        }

        _ukmPendingWord = { eng, tr, pos, level, phonetic, audio, mnemonic, story: example, syllables, engDef, errorCount: 0, correctStreak: 0, sm2_ef: 2.5, sm2_interval: 0, sm2_next: null };
        _ukmPendingAudio = audio;

        document.getElementById('ukm-preview-eng').textContent = eng;
        document.getElementById('ukm-preview-tr').textContent  = tr;
        document.getElementById('ukm-preview-meta').innerHTML  =
            (phonetic  ? `🔊 <em>${_esc(phonetic)}</em>` : '') +
            (syllables ? ` · ${_esc(syllables)} hece`  : '') +
            ` · ${_esc(pos.toUpperCase())} · ${_esc(level)}` +
            (engDef   ? `<br><span style="color:var(--ink2)">📖 ${_esc(engDef)}</span>` : '') +
            (mnemonic ? `<br>🧠 ${_esc(mnemonic)}` : '') +
            (example  ? `<br><span style="color:var(--ink3)">💬 ${_esc(example)}</span>` : '');

        if (previewEl) previewEl.classList.add('show');
    } catch(e) {
        showAIToast('Kelime bulunamadı: ' + (e.message || ''), 'error');
    }
    if (loadEl) loadEl.classList.remove('show');
    document.getElementById('ukm-ai-btn').disabled = false;
}
// ── MANUEL EKLE ─────────────────────────────────
function ukmAddManual() {
    const eng = (document.getElementById('ukm-eng')?.value || '').trim();
    const tr  = (document.getElementById('ukm-tr')?.value  || '').trim();
    if (!eng) { _showAppToast('İngilizce kelimeyi girin!'); return; }

    _ukmPendingWord = {
        eng, tr: tr || '—', pos: 'n', level: 'B1',
        phonetic: '', mnemonic: '', story: '',
        errorCount: 0, correctStreak: 0,
        sm2_ef: 2.5, sm2_interval: 0, sm2_next: null
    };

    document.getElementById('ukm-preview-eng').textContent = eng;
    document.getElementById('ukm-preview-tr').textContent  = tr || '—';
    document.getElementById('ukm-preview-meta').innerHTML  = '<em style="color:var(--ink3)">AI bilgisi olmadan eklendi</em>';
    document.getElementById('ukm-preview-card')?.classList.add('show');
}

// ── ÖNEP: LİSTEYE EKLE ──────────────────────────
function ukmConfirmAdd() {
    if (!_ukmPendingWord) return;
    const sel = document.getElementById('ukm-target-list');
    const name = sel?.value;
    if (!name) { _showAppToast('Önce bir liste seçin!'); return; }

    const lists = _ukmGetLists();
    if (!lists[name]) { _showAppToast('Liste bulunamadı!'); return; }
    if (lists[name].length >= UKM_MAX_WORDS_PER_LIST) {
        showAIToast(`Liste dolu (max ${UKM_MAX_WORDS_PER_LIST} kelime)!`, 'warn'); return;
    }

    // Aynı kelime zaten var mı?
    if (lists[name].some(w => w.eng.toLowerCase() === _ukmPendingWord.eng.toLowerCase())) {
        showAIToast('Bu kelime listede zaten var!', 'warn'); return;
    }

    lists[name].push(_ukmPendingWord);
    _ukmSaveLists(lists);
    _ukmPendingWord = null;

    // Form ve preview temizle
    document.getElementById('ukm-eng').value = '';
    document.getElementById('ukm-tr').value  = '';
    document.getElementById('ukm-preview-card')?.classList.remove('show');

    ukmLoadWordList();
    ukmRefresh();
    _showAppToast(`✅ "${lists[name].at(-1).eng}" eklendi!`);
}

function ukmClearPreview() {
    _ukmPendingWord = null;
    document.getElementById('ukm-preview-card')?.classList.remove('show');
}

// ── SAYFA AÇILIŞINDA UKM LİSTELERİNİ SENKRONIZE ET ──
document.addEventListener('ydtDataReady', () => {
    const lists = _ukmGetLists();
    if (Object.keys(lists).length > 0) _ukmSyncToAllData(lists);
    if (document.getElementById('ukm-section')) ukmRefresh();
});

// ═══════════════════════════════════════════════════════════════
// → js/aig.js (ayrı dosyaya taşındı)

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS  (games.js + kids.js + sm2-typing.js'den taşındı)
// ═══════════════════════════════════════════════════════════════

/** Fisher-Yates shuffle — yeni dizi döner, orijinale dokunmaz */
function shuffle(a) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Diziden rastgele n eleman seç */
function pick(a, n) { return shuffle(a).slice(0, n); }

/**
 * Birleşik speakWord — kids.js (btn destekli) + sm2-typing.js versiyonları birleştirildi
 * @param {string} word  - Okunacak İngilizce kelime
 * @param {Element|null} btn - Opsiyonel buton; aktifken kw-listen-active class'ı alır
 */
function speakWord(word, btn = null) {
    if (!window.speechSynthesis) {
        if (typeof toast === 'function') toast('Bu tarayıcı sesi desteklemiyor 😔', 'bad');
        return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang  = 'en-US';
    utt.rate  = 0.85;
    utt.pitch = 1.1;
    if (btn) {
        btn.classList.add('kw-listen-active');
        utt.onend = () => btn.classList.remove('kw-listen-active');
    }
    window.speechSynthesis.speak(utt);
}

// ════════════════════════════════════════════════════════════════════════
// YDT NAMESPACE — window.* kirliliğini önler
// Yeni özellikler window.YDT.xxx ile eklenir
// Mevcut global fonksiyonlar geriye dönük uyumluluk için korunur
// ════════════════════════════════════════════════════════════════════════
(function _initYDTNamespace() {
    if (window.YDT) return; // Zaten var
    window.YDT = {
        version: '4.7',

        // ── Production-Aware Logger ────────────────────────────────────────
        // isDev: localhost / 127.0.0.1 ortamında debug logları görünür.
        // Production'da log.debug sessizdir; log.warn ve log.error her zaman aktif.
        isDev: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
        log: {
            debug: function() { if (window.YDT.isDev) console.log.apply(console, ['[YDT]'].concat(Array.from(arguments))); },
            warn:  function() { console.warn.apply(console,  ['[YDT]'].concat(Array.from(arguments))); },
            error: function() { console.error.apply(console, ['[YDT]'].concat(Array.from(arguments))); },
        },

        // ── Merkezi localStorage yardımcıları ──────────────────────────
        /**
         * Güvenli localStorage.setItem — QuotaExceededError yakalar
         * @param {string} key
         * @param {*} value  — JSON.stringify ile serialize edilir
         * @returns {boolean} başarı durumu
         */
        lsSet(key, value) {
            try {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.code === 22) {
                    log.warn('[YDT] localStorage dolu — temizleniyor…', key);
                    _lsPurgeOldCache(); // En eski RSS cache'lerini sil
                    try {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        return true;
                    } catch (e2) {
                        log.error('[YDT] localStorage kurtarma başarısız:', key, e2.message);
                        if (typeof showAIToast === 'function') {
                            showAIToast('💾 Depolama alanı doldu. Eski veriler temizlendi.', 'warn');
                        }
                    }
                } else {
                    log.error('[YDT] localStorage.setItem hatası:', key, e.message);
                }
                return false;
            }
        },

        /**
         * Güvenli localStorage.getItem — JSON parse hatası yakalar
         * @param {string} key
         * @param {*} fallback  — parse hatasında döner
         */
        lsGet(key, fallback = null) {
            try {
                const raw = localStorage.getItem(key);
                if (raw === null) return fallback;
                return JSON.parse(raw);
            } catch (_) {
                return fallback;
            }
        },

        // ── AI Rate Limiter ─────────────────────────────────────────────
        /**
         * AI çağrısı debounce/rate limit — aynı key için min ms bekleme
         * @param {string} key       — hangi operasyon (ör: 'analyze', 'generate')
         * @param {number} minMs     — ms cinsinden minimum bekleme (default 1000ms)
         * @returns {boolean}  true → çağrıya izin, false → too soon
         */
        _aiLastCall: {},
        _aiInFlight: {},
        canAICall(key, minMs = 1000) {
            const now = Date.now();
            if (this._aiInFlight[key]) return false;      // Zaten uçuşta
            if ((now - (this._aiLastCall[key] || 0)) < minMs) return false; // Çok erken
            return true;
        },
        markAICall(key) {
            this._aiLastCall[key] = Date.now();
            this._aiInFlight[key] = true;
        },
        doneAICall(key) {
            this._aiInFlight[key] = false;
        },
    };

    // ── Alias: eski global isimlere köprü ────────────────────────────
    // Geriye dönük uyumluluk — mevcut kodlar bozulmasın
    window._lsSet = window.YDT.lsSet.bind(window.YDT);
    window._lsGet = window.YDT.lsGet.bind(window.YDT);

    // ── Global log alias — tüm dosyalarda log.debug / log.warn / log.error
    window.log = window.YDT.log;

    window.YDT.log.debug('[YDT Namespace] ✅ v4.7 yüklendi — YDT.lsSet / YDT.lsGet / YDT.canAICall / YDT.log hazır');
})();

// ── localStorage QuotaExceededError temizleyici ────────────────────────
// RSS cache slot'larını tarihe göre sıralayıp en eskilerini siler
function _lsPurgeOldCache() {
    try {
        const rssKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('ydt_rss_cache_') || k.startsWith('ydt_ai_arsiv'))) {
                rssKeys.push(k);
            }
        }
        // En eski yarısını sil (tarih yoksa doğrusal sırayla)
        rssKeys.sort();
        rssKeys.slice(0, Math.max(1, Math.floor(rssKeys.length / 2))).forEach(k => {
            try { localStorage.removeItem(k); } catch (_) { log.debug('[YDT] removeItem hatası:', k); }
        });
        log.debug(`[YDT] localStorage temizlendi: ${rssKeys.length} cache slot → ${Math.ceil(rssKeys.length / 2)} kaldı`);
    } catch (_) { log.warn('[YDT] Purge genel hata'); }
}

// ── Window Exports (defer uyumluluğu) ────────────────────────────
window.goToMyWords    = goToMyWords;
window.speakWord      = speakWord;
window.toggleTheme    = toggleTheme;
window.ukmAddManual   = ukmAddManual;
window.ukmClearPreview = ukmClearPreview;
window.ukmConfirmAdd  = ukmConfirmAdd;
window.ukmCreateList  = ukmCreateList;
window.ukmFetchAI     = ukmFetchAI;
window.ukmTab         = ukmTab;
