// ── Utils + UKM — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

// PATCH: Uygulama geneli toast (alert yerine kullanılır)
// ════════════════════════════════════════════════════════
function _showAppToast(msg) {
    const existing = document.getElementById('_app_toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = '_app_toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:12px;font-size:.84rem;font-weight:700;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.3);max-width:80vw;text-align:center;pointer-events:none;';
    t.textContent = '⚠️ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ════════════════════════════════════════════════════════
// PATCH: Bottom nav tab'larını aktif sayfa ile senkronize et
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
    const _origSetNavActive = window.setNavActive || setNavActive;
    function _patchedSetNavActive(pageId) {
        _origSetNavActive(pageId);
        // Bottom nav aktif state
        document.querySelectorAll('.mob-tab').forEach(t => t.classList.remove('active'));
        const bnId = BN_MAP[pageId];
        if (bnId) {
            const btn = document.getElementById(bnId);
            if (btn) btn.classList.add('active');
        }
    }
    window.setNavActive = _patchedSetNavActive;
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
// ═══════════════════════════════════════════════════════════
(function initTheme() {
    const saved = localStorage.getItem('ydtTheme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    _syncThemeUI();
})();

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
    el.innerHTML = `
        <div class="empty-state" role="status" aria-label="${title}">
            <div class="empty-state-icon" aria-hidden="true">${icon}</div>
            <div class="empty-state-title">${title}</div>
            ${sub  ? `<div class="empty-state-sub">${sub}</div>` : ''}
            ${cta  ? `<button class="empty-state-cta btn" onclick="(${onCta && onCta.toString()})()">${cta}</button>` : ''}
        </div>`;
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
    } catch(e) {}
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
        " onclick="ukmSelectList('${name.replace(/'/g,"\\'")}')">
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
            <button onclick="event.stopPropagation();ukmDeleteList('${name.replace(/'/g,"\\'")}');"
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
            <button class="ukm-word-del" onclick="ukmDeleteWord(${i})" title="Sil">✕</button>
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
            (phonetic  ? `🔊 <em>${phonetic}</em>` : '') +
            (syllables ? ` · ${syllables} hece`  : '') +
            ` · ${pos.toUpperCase()} · ${level}` +
            (engDef   ? `<br><span style="color:var(--ink2)">📖 ${engDef}</span>` : '') +
            (mnemonic ? `<br>🧠 ${mnemonic}` : '') +
            (example  ? `<br><span style="color:var(--ink3)">💬 ${example}</span>` : '');

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
