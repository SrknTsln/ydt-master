// ════════════════════════════════════════════════════
// motor.js  –  Tüm uygulama mantığı
// ════════════════════════════════════════════════════

// ── YDT Global Namespace ──────────────────────────────
// window.* kirliliğini azaltmak için merkezi namespace
// Kademeli migrasyon: eski window.X atamaları silinmeden
// önce burada da tutulur (backward compat için alias)
window.YDT = window.YDT || {
    // Arşiv state (en çok kullanılan window.* atamaları)
    aiArsiv:            [],
    aiGramerArsiv:      [],
    // Paragraf state
    paragraflar:        [],
    paragrafSorular:    {},
    // Save callback — Firebase sync
    save:               null,   // window._saveData yerine
    // Navigasyon state
    arsivGroupPage:     null,   // window._arsivGroupPage yerine
    arsivActiveSubList: null,   // window._arsivActiveSubList yerine
};

// --- GENEL DEĞİŞKENLER ---
let currentActiveList = "", studyIndex = 0, currentWord, score = 0, canAnswer = true, moduleStartTime = null;

// ══════════════════════════════════════════════
// FIREBASE SYNC (ES Module — index.html içinde
// <script type="module"> bloğu olarak eklenir)
// Bu fonksiyonlar window.* üzerinden global erişilir
// ══════════════════════════════════════════════
// NOT: Firebase başlatma kodu index.html içindeki
// <script type="module"> bloğunda kalmalıdır çünkü
// ES module import sözdizimi yalnızca o bağlamda çalışır.
// motor.js içindeki kodlar window._saveData aracılığıyla
// Firebase ile iletişim kurar.

// ══════════════════════════════════════════════
// SAYFA VE MODÜL YÖNETİMİ
// ══════════════════════════════════════════════
function _hideAllModulePages() {
    document.querySelectorAll('.container, .arsiv-full-page, .page-root').forEach(c => {
        c.classList.add('hidden'); c.style.display = 'none';
    });
    document.querySelectorAll('.cx-page, .sr-page, .tw-page').forEach(c => {
        c.classList.add('hidden'); c.style.display = 'none';
    });
}

function showPage(id) {
    const target = document.getElementById(id);

    // TÜM sayfa elementlerini kapat — sınıf değişse bile ID ile yakala
    // games.js container class'ı kaldırıyor, bu yüzden class bazlı seçici yetmez
    document.querySelectorAll('[id$="-page"]').forEach(c => {
        if (c.id !== id) {
            c.classList.add('hidden');
            c.style.display = 'none';
            c.classList.remove('page-fade-in');
        }
    });

    if (!target) return;

    target.classList.remove('hidden');

    if (target.classList.contains('cx-page') ||
        target.classList.contains('sr-page') ||
        target.classList.contains('tw-page')) {
        target.style.display = 'flex';
        target.style.flexDirection = 'column';
        setTimeout(() => { target.scrollTop = 0; window.scrollTo(0,0); }, 10);
    } else if (target.classList.contains('sp-page') ||
               target.classList.contains('page-root')) {
        target.style.display = 'flex';
    } else {
        target.style.display = '';
    }

    // Fade-in animasyonu
    requestAnimationFrame(() => {
        target.classList.remove('page-fade-in');
        requestAnimationFrame(() => target.classList.add('page-fade-in'));
    });

    setNavActive(id);
}

function startModule() { moduleStartTime = Date.now(); }

function exitModule() {
    if (moduleStartTime) {
        let sessionMins = (Date.now() - moduleStartTime) / 60000;
        stats.totalMinutes = (Number(stats.totalMinutes) || 0) + sessionMins;
        window._saveData && window._saveData();
        moduleStartTime = null;
    }
    updateIndexStats();
    showPage('index-page');
}

// ══════════════════════════════════════════════
// SIDEBAR / NAV YÖNETİMİ
// ══════════════════════════════════════════════
const NAV_MAP = {
    'index-page':         { sb: 'sb-home',                    di: 'di-home' },
    'stats-page':         { sb: 'sb-stats',                   di: 'di-stats' },
    'admin-page':         { sb: 'sb-admin',                   di: 'di-admin' },
    'games-page':         { sb: 'sb-games',                   di: 'di-games' },
    'kids-page':          { sb: 'sb-kids',                    di: 'di-kids'  },
    'exercise-page':      { sb: 'sb-typing',                  di: 'di-typing' },
    'typing-page':        { sb: 'sb-typing',                  di: 'di-typing' },
    'context-page':       { sb: 'sb-context',                 di: 'di-context' },
    'sm2-page':           { sb: 'sb-sm2',                     di: 'di-sm2' },
    'study-page':         { sb: 'sb-study',                   di: 'di-study' },
    'study-done-page':    { sb: 'sb-study',                   di: 'di-study' },
    'quiz-page':          { sb: 'sb-quiz',                    di: 'di-quiz' },
    'memory-page':        { sb: 'sb-games',                   di: 'di-games' },
    // Eksik rotalar eklendi
    'profil-page':        { sb: 'sb-profil',                  di: 'di-profil' },
    'paragraf-liste-page':{ sb: 'sb-paragraf',                di: 'di-paragraf' },
    'paragraf-page':      { sb: 'sb-paragraf',                di: 'di-paragraf' },
    'speaking-page':      { sb: 'sb-speaking',                di: 'di-speaking' },
    'ai-arsiv-page':      { sb: 'sb-arsiv',                   di: 'di-arsiv' },
    'grammar-page':       { sb: 'sb-grammar-tenses-m',        di: null },
    'modals-page':        { sb: 'sb-grammar-modals-m',        di: null },
    'pronouns-page':      { sb: 'sb-grammar-pronouns-m',      di: null },
    'passive-page':       { sb: 'sb-grammar-passive-m',       di: null },
    'conditionals-page':  { sb: 'sb-grammar-conditionals-m',  di: null },
    'relative-page':      { sb: 'sb-grammar-relative-m',      di: null },
    'noun-page':          { sb: 'sb-grammar-noun-m',          di: null },
    'conj-page':          { sb: 'sb-grammar-conj-m',          di: null },
    'gerund-page':        { sb: 'sb-grammar-gerund-m',        di: null },
    'adjadv-page':        { sb: 'sb-grammar-adjadv-m',        di: null },
    'tagquant-page':      { sb: 'sb-grammar-tagquant-m',      di: null },
};

function setNavActive(pageId) {
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(el => el.classList.remove('active'));
    const map = NAV_MAP[pageId];
    if (map) {
        const sb = document.getElementById(map.sb);
        const di = document.getElementById(map.di);
        if (sb) sb.classList.add('active');
        if (di) di.classList.add('active');
    }
}

function navTo(pageId) {
    if (pageId === 'stats-page') { showStatsPage(); return; }
    showPage(pageId);
    if (pageId === 'index-page') { updateIndexStats(); updateDailyGoalBar(); }
    if (pageId === 'admin-page') { adminCheckAccess(); }
}

// ══════════════════════════════════════════════
// → js/admin.js (ayrı dosyaya taşındı)
// → js/stats.js (ayrı dosyaya taşındı)
// → js/study.js (ayrı dosyaya taşındı)
// YÖNETİM & SENKRONİZASYON
// ══════════════════════════════════════════════
function exportData() {
    const blob = new Blob([JSON.stringify({ allData, stats })], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'ydt_master_yedek.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100); // prevent memory leak
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => _showAppToast('Dosya okunamadı!');
    reader.onload = function (ev) {
        try {
            const imp = JSON.parse(ev.target.result);
            if (!imp.allData || !imp.stats) {
                _showAppToast('Geçersiz yedek dosyası! allData veya stats eksik.'); return;
            }
            if (confirm("Tüm veriler yedekle değiştirilecek? Bu işlem geri alınamaz.")) {
                allData = imp.allData;
                stats   = imp.stats;
                window._saveData && window._saveData();
                location.reload();
            }
        } catch(err) {
            _showAppToast('JSON parse hatası: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function updateSelectors() {
    // Her zaman güncel user-scoped allData'yı oku
    if (typeof getUserKey === 'function') {
        const raw = localStorage.getItem(getUserKey('all_data'));
        if (raw) { try { allData = JSON.parse(raw); } catch(e) {} }
    }

    // Sadece array olan listeleri göster (Firestore bazen object döndürebilir)
    const keys = Object.keys(allData).filter(k => Array.isArray(allData[k]));

    ['list-selector', 'edit-list-selector', 'exercise-list-selector',
     'game-list-selector', 'ai-gen-target-list'].forEach(id => {
        const s = document.getElementById(id);
        if (!s) return;
        const prev = s.value;
        s.innerHTML = '';
        keys.forEach(n => s.add(new Option(n, n)));
        if (prev && allData[prev]) s.value = prev;
        else if (keys.length) s.value = keys[0];
    });

    // currentActiveList boşsa ilk listeye ata
    if ((!currentActiveList || !allData[currentActiveList]) && keys.length) {
        currentActiveList = keys[0];
    }

    updateIndexStats();
}

function updateIndexStats() {
    // Skeleton/KPI elementler opsiyonel — olmasa da analitik paneller çalışır
    ['idx-total','idx-learned','idx-accuracy'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    const streakEl0 = document.getElementById('idx-streak-val');
    if (streakEl0) streakEl0.innerHTML = '';

    // Veri oku — allData boşsa localStorage'dan fallback
    if (typeof getUserKey === 'function') {
        const rawAD = localStorage.getItem(getUserKey('all_data'));
        const rawST = localStorage.getItem(getUserKey('stats'));
        if (rawAD && Object.keys(window.allData || {}).length === 0) {
            try { allData = JSON.parse(rawAD); } catch(e) {}
        }
        if (rawST) {
            try { const s = JSON.parse(rawST); if (s) { stats = s; if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0; } } catch(e) {}
        }
    }

    let total = 0, learned = 0;
    Object.values(allData).forEach(list => {
        if (!Array.isArray(list)) return; // Firestore bazen object döner
        total += list.length;
        list.forEach(w => {
            if ((w.errorCount || 0) <= 0 && (w.correctStreak || 0) >= 2) learned++;
        });
    });

    // KPI elementleri varsa doldur (kaldırılmış olabilir)
    const elTotal = document.getElementById('idx-total');
    const elLearned = document.getElementById('idx-learned');
    const elAcc = document.getElementById('idx-accuracy');
    const elStreak = document.getElementById('idx-streak-val');

    if (elTotal)   elTotal.innerText   = total;
    if (elLearned) elLearned.innerText = learned;
    if (elAcc) {
        const acc = stats.totalAnswers > 0
            ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
        elAcc.innerText = acc + '%';
    }
    if (elStreak) {
        const today     = new Date().toDateString();
        const streakKey = typeof getUserKey === 'function' ? getUserKey('streak')   : 'ydt_streak';
        const dayKey    = typeof getUserKey === 'function' ? getUserKey('last_day') : 'ydt_last_day';
        const lastDay   = localStorage.getItem(dayKey);
        let streak      = parseInt(localStorage.getItem(streakKey) || '0');
        if (lastDay !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            streak = lastDay === yesterday ? streak + 1 : 1;
            localStorage.setItem(streakKey, streak);
            localStorage.setItem(dayKey, today);
        }
        elStreak.innerText = streak;
    }

    // Analitik paneller — her zaman çalışır, element bağımsız
    renderWeakWords();
    renderPerfChart();
    renderPOSChart();
    renderSoruStats();
    renderBankStats();
    renderGrammarProgress();
    renderSM2Plan();
}

// ════════════════════════════════════════════════
// → js/stats-widgets.js (ayrı dosyaya taşındı)
// → js/sm2-typing.js (ayrı dosyaya taşındı)
// → js/games.js (ayrı dosyaya taşındı)
// → js/paragraf.js (ayrı dosyaya taşındı)
// → js/ai.js (ayrı dosyaya taşındı)
// 🤖 AI KELİME ÜRETİCİ
// ══════════════════════════════════════════════
let aiGenWords = []; // üretilen önizleme kelimeler

// API Key kaydet
function saveApiKey(providerId, inputId) {
    const input = document.getElementById(inputId);
    const val   = (input?.value || '').trim();
    const p     = AI_PROVIDERS.find(x => x.id === providerId);
    if (!p) return;
    if (val && !val.startsWith('●')) {
        localStorage.setItem(p.lsKey, val);
        // Firestore'a da kaydet (cihazlar arası senkronizasyon)
        if (window.AuthModule) window.AuthModule.syncNow();
    }
    input.value = '';
    updateCascadeStatus();
    const btn = input.nextElementSibling;
    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = '#22c55e';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
}

// API Key sil
function removeApiKey(providerId) {
    const p = AI_PROVIDERS.find(x => x.id === providerId);
    if (!p || !confirm(`${p.name} anahtarı silinsin mi?`)) return;
    localStorage.removeItem(p.lsKey);
    updateCascadeStatus();
}

// Cascade durum göstergelerini güncelle
function updateCascadeStatus() {
    AI_PROVIDERS.forEach(p => {
        const has  = !!localStorage.getItem(p.lsKey);
        const dot  = document.getElementById(`co-dot-${p.id}`);
        const item = document.getElementById(`co-item-${p.id}`);
        const inp  = document.getElementById(`akey-${p.id}`);
        if (dot)  { dot.textContent = has ? '✓' : '—'; dot.style.color = has ? '#22c55e' : '#d1d5db'; }
        if (item) item.classList.toggle('co-active', has);
        if (inp)  inp.placeholder = has ? '●●●●●●● (kayıtlı)' : p.keyHint;
    });

    // Kayıtlı ibaresi güncelle
    AI_PROVIDERS.forEach(p => {
        const statusEl = document.getElementById(`adm-keystatus-${p.id}`);
        const cardEl   = document.getElementById(`adm-keycard-${p.id}`);
        const has = !!localStorage.getItem(p.lsKey);
        if (statusEl) statusEl.style.display = has ? 'inline-block' : 'none';
        if (cardEl)   cardEl.style.borderColor = has ? '#86efac' : '';
    });

    // Kaç servis aktif?
    const activeCount = AI_PROVIDERS.filter(p => localStorage.getItem(p.lsKey)).length;
    let warn = document.getElementById('cascade-warn');
    if (!warn) {
        warn = document.createElement('div');
        warn.id = 'cascade-warn';
        warn.className = 'cascade-warn';
        const orderEl = document.querySelector('.cascade-order');
        if (orderEl) orderEl.after(warn);
    }
    if (activeCount === 0) {
        warn.innerHTML = '⛔ Hiç anahtar girilmedi — AI özellikleri çalışmayacak.';
        warn.className = 'cascade-warn cascade-warn-danger';
        warn.style.display = '';
    } else if (activeCount === 1) {
        const name = AI_PROVIDERS.find(p => localStorage.getItem(p.lsKey)).name;
        warn.innerHTML = `⚠️ Sadece <strong>${name}</strong> aktif — kotası dolunca cascade çalışmaz. Groq veya OpenRouter da ekleyin (ücretsiz).`;
        warn.className = 'cascade-warn cascade-warn-yellow';
        warn.style.display = '';
    } else {
        warn.style.display = 'none';
    }
}

function aiGenSaveKey() {
    const key = (document.getElementById('ai-gen-api-key')?.value || '').trim();
    if (!key) return;
    // Save to Gemini provider key (primary provider in cascade)
    const geminiProvider = typeof AI_PROVIDERS !== 'undefined' ? AI_PROVIDERS.find(p => p.id === 'gemini') : null;
    const lsKey = geminiProvider ? geminiProvider.lsKey : 'ydt_gemini_api_key';
    localStorage.setItem(lsKey, key);
    const statusEl = document.getElementById('ai-gen-key-status');
    if (statusEl) statusEl.innerHTML = '<span style="color:#22c55e;font-weight:700;">✓ Kaydedildi</span>';
    updateCascadeStatus();
}

function navToAdmin() {
    navTo('admin-page');
    updateCascadeStatus();
    // target list selector doldur
    const sel = document.getElementById('ai-gen-target-list');
    if (sel) { sel.innerHTML = ''; Object.keys(allData).forEach(n => sel.add(new Option(n, n))); }
}

async function aiGenerateWords() {
    const topic = document.getElementById('ai-gen-topic').value.trim();
    const count = parseInt(document.getElementById('ai-gen-count').value) || 10;
    const level = document.getElementById('ai-gen-level').value;

    if (!topic) { alert('Lütfen bir konu girin!'); return; }

    const hasAnyKey = AI_PROVIDERS.some(p => localStorage.getItem(p.lsKey));
    if (!hasAnyKey) {
        alert('Lütfen Yönetim panelinden en az bir AI API anahtarı kaydedin.\n(🔑 AI API Anahtarları bölümü)');
        return;
    }

    document.getElementById('ai-gen-btn').disabled = true;
    document.getElementById('ai-gen-preview').style.display = 'none';
    document.getElementById('ai-gen-loading').style.display = 'block';
    document.getElementById('ai-gen-loading-text').innerText = `"${topic}" konusu için ${count} kelime üretiliyor...`;

    const prompt = `Sen YDT İngilizce sınav uzmanısın. "${topic}" konusunda, ${level} seviyesinde ${count} adet İngilizce kelime üret.

Her kelime için şu alanları doldur:
- eng: İngilizce kelime
- tr: Türkçe anlamı (kısa, net)
- mnemonic: Türk öğrencilerin kolayca hatırlayabileceği yaratıcı ve eğlenceli bir bellek ipucu (Türkçe, max 10 kelime)
- story: Kelimeyi kullanan kısa ve akılda kalıcı bir İngilizce cümle (max 12 kelime)

SADECE JSON array döndür, başka hiçbir şey yazma:
[{"eng":"...","tr":"...","mnemonic":"...","story":"..."},...]`;

    try {
        aiGenWords = await aiCall(prompt);
        document.getElementById('ai-gen-loading').style.display = 'none';
        document.getElementById('ai-gen-btn').disabled = false;
        renderAiGenPreview();
    } catch (e) {
        document.getElementById('ai-gen-loading').style.display = 'none';
        document.getElementById('ai-gen-btn').disabled = false;
        if (e.message !== 'no_api_key' && e.message !== 'all_failed') {
            alert('Hata: ' + e.message);
        }
    }
}

function renderAiGenPreview() {
    const list = document.getElementById('ai-gen-preview-list');
    list.innerHTML = '';
    // _esc() -> utils.js'de global tanimli
    aiGenWords.forEach((w, i) => {
        const card = document.createElement('div');
        card.className = 'ai-gen-word-card';
        card.id = `aig-card-${i}`;
        card.innerHTML = `
        <div class="aig-top">
            <span class="aig-eng">${_esc(w.eng)}</span>
            <span class="aig-tr">${_esc(w.tr)}</span>
            <button onclick="aiGenRemoveWord(${i})" class="aig-remove">✕</button>
        </div>
        <div class="aig-meta">🧠 ${_esc(w.mnemonic) || '—'}</div>
        <div class="aig-meta" style="color:var(--ink3);">📖 ${_esc(w.story) || '—'}</div>`;
        list.appendChild(card);
    });
    document.getElementById('ai-gen-preview-count').innerText = `${aiGenWords.length} kelime`;
    document.getElementById('ai-gen-preview').style.display = 'block';
}

function aiGenRemoveWord(i) {
    aiGenWords.splice(i, 1);
    renderAiGenPreview();
}

function aiGenDiscard() {
    aiGenWords = [];
    document.getElementById('ai-gen-preview').style.display = 'none';
}

function aiGenSaveToList() {
    if (!aiGenWords.length) return;
    const targetList = document.getElementById('ai-gen-target-list').value;
    if (!targetList || !allData[targetList]) {
        alert('Lütfen hedef liste seçin.');
        return;
    }
    const newWords = aiGenWords.map(w => ({
        eng: w.eng, tr: w.tr,
        mnemonic: w.mnemonic || '', story: w.story || '',
        errorCount: 0, correctStreak: 0
    }));
    allData[targetList].push(...newWords);

    window._saveData && window._saveData();
    updateSelectors();
    aiGenDiscard();
    document.getElementById('ai-gen-topic').value = '';

    // Bildirim
    const btn = document.getElementById('ai-gen-btn');
    btn.innerText = `✅ ${newWords.length} kelime eklendi!`;
    btn.style.background = '#22c55e';
    setTimeout(() => {
        btn.innerText = '✨ Kelimeleri Üret';
        btn.style.background = '';
    }, 2500);
}

// ══════════════════════════════════════════════
// → js/ai-daily.js (ayrı dosyaya taşındı)
// → js/utils.js (ayrı dosyaya taşındı)

// TODO: Kaldır — namespace migrasyon tamamlanınca
document.addEventListener('DOMContentLoaded', function() {
    console.log('[YDT] Namespace initialized:', Object.keys(window.YDT));
});

// ── Delegated nav listener (Task 8) ──────────────────────────────
(function _initNavDelegation() {
    document.addEventListener('click', function(e) {
        const navBtn = e.target.closest('[data-nav]');
        if (!navBtn) return;
        e.preventDefault();
        navTo(navBtn.dataset.nav);
    });
})();
