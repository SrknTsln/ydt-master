// ════════════════════════════════════════════════════
// motor.js  –  Tüm uygulama mantığı
// ════════════════════════════════════════════════════

// --- GENEL DEĞİŞKENLER ---
let currentActiveList = "", studyIndex = 0, currentWord, score = 0, canAnswer = true, moduleStartTime = null;
// Kelime grubu seçici
let studyGroupMode = 'list'; // 'list' | 'random' | listName
let studyGroupPool = [];     // Aktif kelime havuzu (çok listeden birleşik olabilir)

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

    // study-page açılınca grup seçici paneli init et
    if (id === 'study-page') { setTimeout(() => { try { if (typeof _initSgPanel === 'function' && typeof allData !== 'undefined') _initSgPanel(); } catch(e) {} }, 50); }

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
// 🔐 YÖNETİM PANELİ — Google Email Kontrolü
// ══════════════════════════════════════════════
const ADMIN_EMAIL = 'stasalan@gmail.com';

function adminCheckAccess() {
    const denied  = document.getElementById('admin-access-denied');
    const content = document.getElementById('admin-panel-content');
    // Firebase Auth üzerinden mevcut kullanıcıyı kontrol et
    const user = (window.AuthModule && window._currentUser) ? window._currentUser : null;
    const email = user ? user.email : null;

    if (email === ADMIN_EMAIL) {
        if (denied)  denied.style.display  = 'none';
        if (content) content.style.display = 'flex';
        content.style.flexDirection = 'column';
        adminUnlockPanel();
    } else {
        if (denied)  denied.style.display  = 'flex';
        if (content) content.style.display = 'none';
    }
}

function adminUnlockPanel() {
    // Panel içeriğini yükle
    renderAdminParagrafListe();
    const sel = document.getElementById('ai-gen-target-list');
    if (sel) { sel.innerHTML = ''; Object.keys(allData).forEach(n => sel.add(new Option(n, n))); }
    adminUpdateBankCounts();
    updateCascadeStatus(); // API key kayıtlı ibarelerini güncelle
    admSwitchTab('api');
}

// Tab geçişi
function admSwitchTab(tabId) {
    document.querySelectorAll('.adm-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabId);
    });
    document.querySelectorAll('.adm-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'adm-tab-' + tabId);
    });
    // AI tab: listeyi güncelle
    if (tabId === 'ai') {
        const sel = document.getElementById('ai-gen-target-list');
        if (sel) { sel.innerHTML = ''; Object.keys(allData).forEach(n => sel.add(new Option(n, n))); }
        const empty = document.getElementById('ai-gen-empty');
        const prev  = document.getElementById('ai-gen-preview');
        if (empty && prev && prev.style.display === 'none') empty.style.display = 'block';
    }
    // Bank tab: sayıları güncelle
    if (tabId === 'bank') {
        adminUpdateBankCounts();
        admLoadUserCount();
    }
}

// Soru bankası sayaçlarını admin'de güncelle
// adminUpdateBankCounts → motor.js alt kısımda tanımlı

// Soru bankası silme (admin'den)
function adminClearArsiv(type) {
    if (type === 'kelime') {
        const count = (window.aiArsiv || []).length;
        if (!count) return showAIToast('Zaten boş', 'info', 2000);
        if (!confirm(`Tüm ${count} kelime sorusu kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`)) return;
        window.aiArsiv = [];
        window._saveData && window._saveData();
        updateArsivBadge();
        adminUpdateBankCounts();
        showAIToast('✅ Kelime soruları silindi', 'info', 3000);
    }
}

/* ════════════════════════════════════════
   KULLANICI SAYISI — Firebase Realtime DB
   ydt_users/ altındaki node sayısını çek
   ════════════════════════════════════════ */
async function admLoadUserCount() {
    const el = document.getElementById('adm-user-count');
    if (!el) return;
    el.textContent = '⏳';
    try {
        const db  = window.db;
        const ref = window.dbRef;
        const get = window.dbGet;
        if (!db || !ref || !get) { el.textContent = 'DB hazır değil'; return; }
        const snap = await get(ref(db, 'ydt_users'));
        if (snap.exists()) {
            const count = Object.keys(snap.val()).length;
            el.textContent = `${count} kullanıcı`;
        } else {
            el.textContent = '0 kullanıcı';
        }
    } catch(e) {
        el.textContent = 'Erişim hatası';
        console.error('admLoadUserCount:', e);
    }
}

/* ════════════════════════════════════════
   SORU BANKASI DOSYA UPLOAD
   PDF → pdfjs ile metin çıkar
   DOCX → mammoth.js ile metin çıkar
   Sonra satırları parse edip bankaya ekle
   ════════════════════════════════════════ */
async function admBankUpload(input, category) {
    const file = input.files[0];
    if (!file) return;
    const statusEl = document.getElementById(`adm-upload-status-${category}`);

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.style.display = 'block';
        statusEl.style.background = type === 'ok' ? '#dcfce7' : type === 'err' ? '#fee2e2' : '#fef9c3';
        statusEl.style.color     = type === 'ok' ? '#166534' : type === 'err' ? '#991b1b' : '#854d0e';
        statusEl.textContent = msg;
    }

    setStatus('⏳ Dosya okunuyor...', 'info');
    input.value = '';

    try {
        let rawText = '';
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'pdf') {
            rawText = await _admReadPDF(file);
        } else if (ext === 'docx' || ext === 'doc') {
            rawText = await _admReadDOCX(file);
        } else {
            setStatus('❌ Desteklenmeyen format', 'err'); return;
        }

        if (!rawText.trim()) { setStatus('❌ Dosyadan metin okunamadı', 'err'); return; }

        const questions = _admParseQuestions(rawText, category);
        if (!questions.length) { setStatus('⚠️ Soru formatı tanınamadı', 'warn'); return; }

        // Bankaya ekle
        _admSaveToBank(questions, category);
        setStatus(`✅ ${questions.length} soru eklendi`, 'ok');
        adminUpdateBankCounts();

    } catch(e) {
        setStatus('❌ ' + e.message, 'err');
        console.error('admBankUpload:', e);
    }
}

async function _admReadPDF(file) {
    // PDF.js CDN
    if (!window.pdfjsLib) {
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const ab   = await file.arrayBuffer();
    const pdf  = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let text   = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(s => s.str).join(' ') + '\n';
    }
    return text;
}

async function _admReadDOCX(file) {
    // mammoth.js CDN
    if (!window.mammoth) {
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        });
    }
    const ab  = await file.arrayBuffer();
    const res = await window.mammoth.extractRawText({ arrayBuffer: ab });
    return res.value || '';
}

function _admParseQuestions(text, category) {
    const questions = [];
    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

    // Format 1: "Soru | A) ... | B) ... | C) ... | D) ... | Cevap: B"
    // Format 2: Numaralı sorular (1. Soru metni  A)...  B)...)
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Pipe formatı
        if (line.includes('|') && line.toLowerCase().includes('cevap')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 6) {
                const answerPart = parts.find(p => p.toLowerCase().startsWith('cevap'));
                const answer = answerPart ? answerPart.replace(/cevap\s*:/i, '').trim() : '';
                questions.push({
                    category,
                    q: parts[0],
                    a: parts[1], b: parts[2], c: parts[3], d: parts[4],
                    answer,
                    addedAt: Date.now()
                });
            }
            i++; continue;
        }

        // Numaralı format: satır "1." veya "1)" ile başlıyor
        if (/^\d+[.)]\s/.test(line)) {
            const qText = line.replace(/^\d+[.)]\s*/, '');
            const opts  = {};
            let j = i + 1;
            while (j < lines.length && j < i + 6) {
                const ol = lines[j];
                const m  = ol.match(/^([A-Da-d])[.)]\s*(.+)/);
                if (m) { opts[m[1].toUpperCase()] = m[2]; j++; }
                else break;
            }
            // Cevap satırı
            let answer = '';
            if (j < lines.length && /cevap/i.test(lines[j])) {
                answer = lines[j].replace(/cevap\s*:/i, '').trim().toUpperCase();
                j++;
            }
            if (opts.A && opts.B) {
                questions.push({
                    category, q: qText,
                    a: opts.A || '', b: opts.B || '', c: opts.C || '', d: opts.D || '',
                    answer, addedAt: Date.now()
                });
            }
            i = j; continue;
        }
        i++;
    }
    return questions;
}

function _admSaveToBank(questions, category) {
    // Kategori bazlı bankalar localStorage'da tutulur
    const key  = `ydt_bank_${category}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const merged   = [...existing, ...questions];
    localStorage.setItem(key, JSON.stringify(merged));
    // Firebase sync
    if (window.AuthModule) window.AuthModule.syncNow();
}

function admBankGetCount(category) {
    const key = `ydt_bank_${category}`;
    return JSON.parse(localStorage.getItem(key) || '[]').length;
}

function adminUpdateBankCounts() {
    const arsiv = window.aiArsiv || [];

    // Kelime (aiArsiv = AI üretilen kelime soruları)
    const elK = document.getElementById('admin-arsiv-kelime-count');
    if (elK) elK.textContent = `${arsiv.length} soru · ${[...new Set(arsiv.map(e => e.word))].length} farklı kelime`;

    // Dosyadan yüklenen kategoriler
    const cats = [
        { id: 'admin-arsiv-paragraf-count', key: 'paragraf',  label: 'soru' },
        { id: 'admin-arsiv-gramer-count',   key: 'gramer',    label: 'soru' },
        { id: 'admin-arsiv-cloze-count',    key: 'cloze',     label: 'soru' },
        { id: 'admin-arsiv-yakin-count',    key: 'yakin',     label: 'soru' },
        { id: 'admin-arsiv-diyalog-count',  key: 'diyalog',   label: 'soru' },
        { id: 'admin-arsiv-paratam-count',  key: 'paratam',   label: 'soru' },
        { id: 'admin-arsiv-durum-count',    key: 'durum',     label: 'soru' },
        { id: 'admin-arsiv-parabut-count',  key: 'parabut',   label: 'soru' },
    ];
    cats.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) el.textContent = `${admBankGetCount(c.key)} ${c.label}`;
    });
}

function startQuizFromNav() {
    currentActiveList = document.getElementById('list-selector').value;
    if (!currentActiveList || !allData[currentActiveList] || allData[currentActiveList].length < 4) {
        navTo('index-page'); return;
    }
    startModule();
    showPage('quiz-page');
    _qzInitSession();
    nextQuestion();
}

function showExerciseNav(mode) {
    showExercisePage();
    if (mode === 'typing')       startTypingQuiz();
    else if (mode === 'context') startContextMode();
    else if (mode === 'sm2')     startSM2Review();
}

// ══════════════════════════════════════════════
// İSTATİSTİK SAYFASI
// ══════════════════════════════════════════════
function showStatsPage() {
    showPage('stats-page');
    let total = 0, learned = 0, hard = 0, allWords = [];
    const lists = Object.keys(allData);
    lists.forEach(listName => {
        const list = allData[listName];
        total += list.length;
        list.forEach(w => {
            if ((w.errorCount || 0) <= 0 && (w.correctStreak || 0) >= 2) learned++;
            if ((w.errorCount || 0) > 2) hard++;
            allWords.push(w);
        });
    });

    // Temel KPI'lar
    document.getElementById('stat-total-words').innerText   = total;
    document.getElementById('stat-learned-words').innerText = learned;
    document.getElementById('stat-avg-score').innerText     = stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) + '%' : '0%';
    document.getElementById('stat-study-time').innerText    = Math.floor(stats.totalMinutes);
    const hardEl = document.getElementById('sp-hard-words');
    if (hardEl) hardEl.innerText = hard;
    const listCountEl = document.getElementById('sp-list-count');
    if (listCountEl) listCountEl.innerText = lists.length;

    // Streak
    const streak = parseInt(localStorage.getItem('ydt_streak') || '0');
    document.getElementById('stats-streak-num').innerText = streak;
    const lastDay = localStorage.getItem('ydt_last_day');
    const today   = new Date().toDateString();
    document.getElementById('stats-streak-sub').innerText =
        lastDay === today ? '🎯 Bugün çalıştın!' :
        streak > 0        ? `Son gün: ${lastDay || '—'}` : 'Henüz seri başlamadı';

    // Rozetler
    renderBadges(streak, total, learned, stats);

    // En çok hata
    let topErrors = allWords.slice().sort((a, b) => (b.errorCount || 0) - (a.errorCount || 0))
        .slice(0, 8).filter(w => (w.errorCount || 0) > 0);
    document.getElementById('error-list').innerHTML = topErrors.length
        ? topErrors.map(w => `<li><strong>${w.eng}</strong><span class="sp-err-count">${w.errorCount} hata</span></li>`).join('')
        : '<li style="color:var(--ink3);list-style:none;padding:4px 0;">Henüz hata kaydı yok 🎉</li>';

    // Soru Bankası istatistikleri
    const arsiv      = window.aiArsiv || [];
    const gramerArsiv = window.aiGramerArsiv || [];
    const pSorular   = window.paragrafSorular || {};
    const pKeys      = Object.keys(pSorular);
    const totalPara  = pKeys.reduce((s, k) => s + (pSorular[k].questions || []).length, 0);
    const paragrafPaketSayisi = typeof PARAGRAF_PAKETLERİ !== 'undefined'
        ? PARAGRAF_PAKETLERİ.filter(pk => pk.pasajlar && pk.pasajlar.some(p => {
            const k = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`;
            return pSorular[k];
          })).length
        : 0;

    const bankKelimeEl = document.getElementById('sp-bank-kelime');
    const bankParaEl   = document.getElementById('sp-bank-para');
    const bankParaSubEl = document.getElementById('sp-bank-para-sub');
    const bankGramerEl = document.getElementById('sp-bank-gramer');
    if (bankKelimeEl) bankKelimeEl.innerText = arsiv.length;
    if (bankParaEl)   bankParaEl.innerText   = totalPara;
    if (bankParaSubEl) bankParaSubEl.innerText = `${pKeys.length} pasaj`;
    if (bankGramerEl) bankGramerEl.innerText = gramerArsiv.length;

    // Yeni kategoriler (gelecekte doldurulacak — şimdilik 0)
    const clozeArsiv  = window.aiClozeArsiv   || [];
    const yakinArsiv  = window.aiYakinArsiv   || [];
    const diyalogArsiv = window.aiDiyalogArsiv || [];
    const durumArsiv  = window.aiDurumArsiv    || [];
    const paraComArsiv = window.aiParaComArsiv || [];
    const paraBozArsiv = window.aiParaBozArsiv || [];
    const clozeEl   = document.getElementById('sp-bank-cloze');
    const yakinEl   = document.getElementById('sp-bank-yakin');
    const diyalogEl = document.getElementById('sp-bank-diyalog');
    if (clozeEl)   clozeEl.innerText   = clozeArsiv.length + durumArsiv.length + paraComArsiv.length + paraBozArsiv.length;
    if (yakinEl)   yakinEl.innerText   = yakinArsiv.length;
    if (diyalogEl) diyalogEl.innerText = diyalogArsiv.length + durumArsiv.length;

    // Paragraf okuma detay
    const paraTotal  = document.getElementById('sp-para-total');
    const paraPasaj  = document.getElementById('sp-para-pasaj');
    const paraPaket  = document.getElementById('sp-para-paket');
    const paraDone   = document.getElementById('sp-para-done');
    if (paraTotal) paraTotal.innerText = totalPara;
    if (paraPasaj) paraPasaj.innerText = pKeys.length;
    if (paraPaket) paraPaket.innerText = paragrafPaketSayisi;

    // Tamamlanma oranı
    if (paraDone) {
        const paraAnswered = Object.values(pSorular).reduce((s, v) => {
            return s + (v.answered || 0);
        }, 0);
        paraDone.innerText = totalPara > 0 ? Math.round((paraAnswered / totalPara) * 100) + '%' : '0%';
    }

    // Paragraf paket listesi
    const paketListEl = document.getElementById('sp-para-paket-list');
    if (paketListEl) {
        if (typeof PARAGRAF_PAKETLERİ !== 'undefined' && PARAGRAF_PAKETLERİ.length) {
            paketListEl.innerHTML = PARAGRAF_PAKETLERİ.slice(0, 6).map(pk => {
                const pkSoru = pk.pasajlar ? pk.pasajlar.reduce((s, p) => {
                    const k = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`;
                    return s + (pSorular[k] ? (pSorular[k].questions || []).length : 0);
                }, 0) : 0;
                const maxSoru = pk.pasajlar ? pk.pasajlar.reduce((s, p) => s + 5, 0) : 0;
                const pct = maxSoru > 0 ? Math.min(100, Math.round((pkSoru / maxSoru) * 100)) : 0;
                return `<div class="sp-para-pk-row">
                    <span class="sp-para-pk-icon">📦</span>
                    <div class="sp-para-pk-body">
                        <div class="sp-para-pk-name">${pk.baslik || 'Paket'}</div>
                        <div class="sp-para-pk-bar-wrap"><div class="sp-para-pk-bar" style="width:${pct}%;background:linear-gradient(90deg,#0ea5e9,#0284c7);"></div></div>
                    </div>
                    <span class="sp-para-pk-count" style="color:#0ea5e9;">${pkSoru} soru</span>
                </div>`;
            }).join('');
        } else {
            paketListEl.innerHTML = '<div class="sp-hint">Henüz paragraf paketi yüklenmedi.</div>';
        }
    }

    // Grammar modülleri ilerleme
    const grammarModules = [
        { id: 'gr', label: 'English Tenses',      icon: '⏱️', color: '#4f46e5', total: 17,  fn: ()=>openGrammarSection('overview') },
        { id: 'mo', label: 'Modals',               icon: '⚡', color: '#d97706', total: 10,  fn: ()=>openModalsSection('overview') },
        { id: 'pr', label: 'Pronouns',             icon: '👤', color: '#0369a1', total: 8,   fn: ()=>openPronounsSection('overview') },
        { id: 'pa', label: 'Active / Passive',     icon: '🔄', color: '#16a34a', total: 10,  fn: ()=>openPassiveSection('overview') },
        { id: 'co', label: 'Conditionals',         icon: '🔀', color: '#7c3aed', total: 12,  fn: ()=>openConditionalsSection('overview') },
        { id: 're', label: 'Relative Clauses',     icon: '🔗', color: '#0891b2', total: 10,  fn: ()=>openRelativeSection('overview') },
        { id: 'no', label: 'Noun Clauses',         icon: '💬', color: '#be185d', total: 10,  fn: ()=>openNounSection('overview') },
        { id: 'cj', label: 'Adverbial Clauses',    icon: '🌿', color: '#16a34a', total: 11,  fn: ()=>openConjSection('overview') },
        { id: 'ge', label: 'Gerunds & Infinitives',icon: '📝', color: '#e63946', total: 10,  fn: ()=>openGerundSection('overview') },
        { id: 'aa', label: 'Adjectives & Adverbs', icon: '🔵', color: '#2563eb', total: 8,   fn: ()=>openAdjAdvSection('overview') },
        { id: 'tq', label: 'Tag Q. & Quantifiers', icon: '❓', color: '#9333ea', total: 8,   fn: ()=>openTagQuantSection('overview') },
    ];

    const gmListEl = document.getElementById('sp-grammar-list');
    if (gmListEl) {
        const grScores = JSON.parse(localStorage.getItem('ydt_gr_scores') || '{}');
        gmListEl.innerHTML = grammarModules.map(m => {
            const done = grScores[m.id] || 0;
            const pct  = Math.min(100, Math.round((done / m.total) * 100));
            const statusIcon = pct >= 100 ? '✅' : pct > 0 ? '🔶' : '⚪';
            return `<div class="sp-gm-row" onclick="(${m.fn.toString()})()">
                <div class="sp-gm-icon" style="background:${m.color}15;color:${m.color};">${m.icon}</div>
                <div class="sp-gm-body">
                    <div class="sp-gm-top">
                        <span class="sp-gm-label">${m.label}</span>
                        <span class="sp-gm-score" style="color:${m.color};">${done}</span>
                        <span class="sp-gm-total">/ ${m.total}</span>
                    </div>
                    <div class="sp-gm-bar-wrap"><div class="sp-gm-bar" style="width:${pct}%;background:${m.color};"></div></div>
                </div>
                <span class="sp-gm-status">${statusIcon}</span>
            </div>`;
        }).join('');
    }

    // Liste dağılımı
    const listBreakEl = document.getElementById('sp-list-breakdown');
    if (listBreakEl) {
        if (lists.length === 0) {
            listBreakEl.innerHTML = '<div class="sp-hint">Henüz liste yok.</div>';
        } else {
            listBreakEl.innerHTML = lists.slice(0, 10).map(listName => {
                const ws = allData[listName];
                const tot = ws.length;
                const ok  = ws.filter(w => (w.correctStreak || 0) >= 2 && (w.errorCount || 0) <= 0).length;
                const err = ws.filter(w => (w.errorCount || 0) > 2).length;
                const pct = tot > 0 ? Math.round((ok / tot) * 100) : 0;
                return `<div class="sp-lb-row">
                    <div class="sp-lb-name">${listName}</div>
                    <div class="sp-lb-nums">
                        <span class="sp-lb-chip sp-lb-green">✅ ${ok}</span>
                        <span class="sp-lb-chip sp-lb-red">❌ ${err}</span>
                        <span class="sp-lb-chip sp-lb-gray">📦 ${tot}</span>
                    </div>
                    <div class="sp-lb-bar-wrap"><div class="sp-lb-bar" style="width:${pct}%;"></div></div>
                </div>`;
            }).join('');
        }
    }

    // Isı haritası
    const hmSel = document.getElementById('heatmap-list-sel');
    if (hmSel) {
        hmSel.innerHTML = '';
        lists.forEach(n => hmSel.add(new Option(n, n)));
        renderHeatmap();
    }

    showPage('stats-page');
}

// ══════════════════════════════════════════════
// QUIZ MODU
// ══════════════════════════════════════════════
function startQuiz() {
    currentActiveList = document.getElementById('list-selector').value;
    if (!currentActiveList || !allData[currentActiveList] || allData[currentActiveList].length < 4) {
        _showAppToast('Quiz için en az 4 kelimeli bir liste seçin.'); return;
    }
    startModule();
    score = 0;
    showPage('quiz-page');
    _qzInitSession();
    // nextQuestion() artık _qzInitSession içinden çağrılmıyor, burada tek çağrı
    nextQuestion();
}

// ═══════════════════════════════════════════════════════════════
// YENİ QUIZ SİSTEMİ — 6 farklı soru tipi + XP + combo + lives
// ═══════════════════════════════════════════════════════════════

let _qzSession = null;

function _qzInitSession() {
    const pool = allData[currentActiveList];
    if (!pool || pool.length < 4) return;

    // Önce unique kelimeler, sonra ağırlıklı kopyalar ekle
    // Tekrarları önlemek için Set kulllan — aynı kelime birden fazla kez gelmemeli
    let uniquePool = pool.slice(); // tüm unique kelimeler
    let weighted = [];

    // Önce hepsi bir kez gir
    uniquePool.forEach(w => weighted.push(w));

    // Sonra hatalı kelimeleri ağırlığa göre tekrar ekle (ama max 2x)
    uniquePool.forEach(w => {
        const extra = Math.min(Math.max(0, w.errorCount || 0), 2);
        for (let i = 0; i < extra; i++) weighted.push(w);
    });

    // Fisher-Yates shuffle
    for (let i = weighted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }

    const total = Math.min(weighted.length, 15);

    _qzSession = {
        queue:     weighted.slice(0, total),
        idx:       0,
        total,
        xp:        0,
        combo:     0,
        maxCombo:  0,
        lives:     3,
        correct:   0,
        canAnswer: true
    };

    // UI reset
    const fb = document.getElementById('qz-feedback');
    if (fb) fb.className = 'qz-feedback qz-feedback-hidden';

    const res = document.getElementById('qz-result');
    if (res) res.style.display = 'none';

    const card = document.getElementById('qz-card');
    if (card) card.style.display = 'flex';

    const metaRow = document.getElementById('qz-meta-row');
    if (metaRow) metaRow.style.display = 'flex';

    _qzRenderHUD();
}

function _qzRenderHUD() {
    const s = _qzSession;
    if (!s) return;
    // Progress
    const pct = s.total > 0 ? Math.round((s.idx / s.total) * 100) : 0;
    document.getElementById('qz-prog-fill').style.width = pct + '%';
    document.getElementById('qz-prog-label').innerText = `${s.idx + 1} / ${s.total}`;
    // XP
    document.getElementById('qz-xp').innerText = s.xp;
    // Combo
    const comboBox = document.getElementById('qz-combo-box');
    if (s.combo >= 2) {
        document.getElementById('qz-combo-num').innerText = s.combo;
        comboBox.style.opacity = '1';
        comboBox.style.transform = 'scale(1)';
    } else {
        comboBox.style.opacity = '0';
    }
    // Lives
    const livesEl = document.getElementById('qz-lives');
    livesEl.innerText = '❤️'.repeat(s.lives) + '🖤'.repeat(3 - s.lives);
}

function nextQuestion() {
    const s = _qzSession;
    if (!s) return;

    _qzStopTimer();

    // Feedback gizle (class değiştir, display manipüle etme)
    const fb = document.getElementById('qz-feedback');
    if (fb) fb.className = 'qz-feedback qz-feedback-hidden';

    // Tamamlandı mı? (idx tüm soruları geçti veya can kalmadı)
    if (s.idx >= s.total || s.lives <= 0) {
        _qzShowResult(); return;
    }

    s.canAnswer = true;
    const w = s.queue[s.idx];
    currentWord = w;

    // Kart animasyonu — reset
    const qArea = document.getElementById('qz-question-area');
    const aArea = document.getElementById('qz-answer-area');
    if (qArea) { qArea.style.animation = 'none'; void qArea.offsetWidth; qArea.style.animation = ''; }
    if (aArea) aArea.innerHTML = '';

    _qzRenderHUD();

    const pool = allData[currentActiveList];
    const types = _qzPickTypes(w, pool, s.lives);
    const type  = types[Math.floor(Math.random() * types.length)];

    document.getElementById('qz-type-pill').innerText = _qzTypeLabel(type);

    switch (type) {
        case 'mcq_tr':  _qzRenderMCQ_TR(w, pool);  break;
        case 'mcq_eng': _qzRenderMCQ_ENG(w, pool); break;
        case 'pos':     _qzRenderPOS(w, pool);      break;
        case 'fill':    _qzRenderFill(w, pool);     break;
        case 'missing': _qzRenderMissing(w);        break;
        case 'build':   _qzRenderBuild(w);          break;
        default:        _qzRenderMCQ_TR(w, pool);
    }
}

function _qzPickTypes(w, pool, lives) {
    const base = ['mcq_tr', 'mcq_eng'];
    if (pool.length >= 4) base.push('pos');
    if (w.story && w.story.length > 10) base.push('fill');
    if (w.eng && w.eng.length >= 4) base.push('missing');
    if (w.eng && w.eng.length >= 4 && w.eng.length <= 10) base.push('build');
    return lives === 1 ? ['mcq_tr', 'mcq_eng'] : base;
}

function _qzTypeLabel(t) {
    return { mcq_tr:'TR Anlam', mcq_eng:'EN Kelime', pos:'Kelime Türü',
             fill:'Cümle', missing:'Harf Bul', build:'Kelime Kur' }[t] || t;
}

// ── TİP 1: Türkçe anlamı seç ──
// ── TİP 1: Türkçe anlamı seç ──
function _qzRenderMCQ_TR(w, pool) {
    document.getElementById('qz-instruction').innerText = 'İngilizce kelimenin Türkçe anlamını seç';
    const pos_tag = detectPOS(w.eng, w.tr);
    const ipa     = getIPA ? getIPA(w.eng) : '';
    document.getElementById('qz-question-area').innerHTML = `
        <div class="qz-word-hero">
            <div class="qz-word-main">${w.eng}</div>
            ${ipa ? `<div class="qz-word-phonetic">${ipa}</div>` : ''}
            <span class="qz-word-pos ${pos_tag.label.toLowerCase() === 'word' ? 'pos-word' : 'pos-'+pos_tag.label.toLowerCase()}">${pos_tag.label}</span>
        </div>`;
    _qzMakeOptions(w.tr, pool.map(x => x.tr).filter(t => t !== w.tr), 'tr', true);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── TİP 2: İngilizce kelimeyi seç ──
function _qzRenderMCQ_ENG(w, pool) {
    document.getElementById('qz-instruction').innerText = 'Türkçe anlamın İngilizce karşılığını seç';
    document.getElementById('qz-question-area').innerHTML = `
        <div class="qz-word-hero">
            <div class="qz-word-main" style="font-size:clamp(1.4rem,5vw,2rem);color:#7c3aed;">${w.tr}</div>
        </div>`;
    _qzMakeOptions(w.eng, pool.map(x => x.eng).filter(e => e !== w.eng), 'eng', false);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── TİP 3: Kelime türü ──
function _qzRenderPOS(w, pool) {
    document.getElementById('qz-instruction').innerText = 'Bu kelimenin türü nedir?';
    const correctPos = detectPOS(w.eng, w.tr).label;
    document.getElementById('qz-question-area').innerHTML = `
        <div class="qz-word-hero">
            <div class="qz-word-main">${w.eng}</div>
            <div class="qz-word-phonetic">${w.tr}</div>
        </div>`;
    const allPos = ['NOUN','VERB','ADJ','ADV','WORD'];
    let opts = [correctPos, ...allPos.filter(p => p !== correctPos).sort(() => Math.random()-.5).slice(0,3)].sort(() => Math.random()-.5);
    const posNames = { NOUN:'İsim (Noun)', VERB:'Fiil (Verb)', ADJ:'Sıfat (Adjective)', ADV:'Zarf (Adverb)', WORD:'Diğer' };
    const ansArea = document.getElementById('qz-answer-area');
    ansArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'qz-mcq-grid';
    const letters = ['A','B','C','D'];
    opts.forEach((pos, i) => {
        const btn = document.createElement('button');
        btn.className = 'qz-opt';
        btn.innerHTML = `<span class="qz-opt-letter">${letters[i]}</span><span>${posNames[pos] || pos}</span>`;
        btn.onclick = () => {
            if (!_qzSession || !_qzSession.canAnswer) return;
            _qzSession.canAnswer = false;
            _qzStopTimer();
            grid.querySelectorAll('.qz-opt').forEach(b => b.classList.add('qz-disabled'));
            const ok = pos === correctPos;
            btn.classList.remove('qz-disabled');
            btn.classList.add(ok ? 'qz-correct' : 'qz-wrong');
            if (!ok) {
                grid.querySelectorAll('.qz-opt').forEach(b => {
                    if (b.querySelector('span:last-child') &&
                        b.querySelector('span:last-child').textContent === (posNames[correctPos] || correctPos)) {
                        b.classList.remove('qz-disabled'); b.classList.add('qz-correct');
                    }
                });
            }
            _qzHandleAnswer(ok, w, `Kelime türü: ${posNames[correctPos] || correctPos}`);
        };
        grid.appendChild(btn);
    });
    ansArea.appendChild(grid);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── TİP 4: Cümle içinde boşluk doldur ──
function _qzRenderFill(w, pool) {
    document.getElementById('qz-instruction').innerText = 'Boşluğu doğru kelimeyle doldur';
    const sentence = w.story || '';
    const re = new RegExp(w.eng, 'i');
    const blanked = sentence.replace(re, '<span class="qz-blank"></span>');
    document.getElementById('qz-question-area').innerHTML = `<div class="qz-sentence-ctx">${blanked}</div>`;
    _qzMakeOptions(w.eng, pool.map(x => x.eng).filter(e => e !== w.eng), 'eng', false);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── TİP 5: Eksik harf ──
function _qzRenderMissing(w) {
    document.getElementById('qz-instruction').innerText = 'Hangi harf eksik?';
    const word = w.eng.toLowerCase();
    // Rastgele bir harf/harfleri gizle (kelime uzunluğuna göre)
    const hideCount = word.length <= 5 ? 1 : word.length <= 8 ? 2 : 3;
    const indices = [];
    const allIdx = word.split('').map((_,i) => i).sort(() => Math.random()-.5);
    for (let i = 0; i < hideCount; i++) indices.push(allIdx[i]);
    indices.sort((a, b) => a - b);

    // Harfleri göster
    let html = '<div class="qz-missing-word">';
    word.split('').forEach((ch, i) => {
        if (i > 0 && i % 6 === 0) html += '<div class="qz-letter-gap"></div>';
        if (indices.includes(i)) {
            html += `<div class="qz-letter-box qz-letter-hidden">?</div>`;
        } else {
            html += `<div class="qz-letter-box qz-letter-shown">${ch.toUpperCase()}</div>`;
        }
    });
    html += '</div>';
    html += `<div style="text-align:center;font-size:.82rem;color:#9090b0;margin-top:8px;">Türkçesi: <strong>${w.tr}</strong></div>`;
    document.getElementById('qz-question-area').innerHTML = html;

    // Eksik harflerin doğru cevabı
    const hiddenLetters = indices.map(i => word[i]).join('');

    // 4 seçenek: doğru + 3 harf kombinasyonu
    const alphabet = 'abcdefghijklmnoprstvy';
    let wrongOpts = new Set();
    while (wrongOpts.size < 3) {
        let fake = '';
        for (let i = 0; i < hideCount; i++)
            fake += alphabet[Math.floor(Math.random() * alphabet.length)];
        if (fake !== hiddenLetters) wrongOpts.add(fake);
    }
    let opts = [hiddenLetters, ...wrongOpts].sort(() => Math.random()-.5);

    const ansArea = document.getElementById('qz-answer-area');
    ansArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'qz-mcq-grid';
    const letters = ['A','B','C','D'];
    opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'qz-opt';
        btn.style.justifyContent = 'center';
        btn.innerHTML = `<span class="qz-opt-letter">${letters[i]}</span>
            <span style="font-size:1.1rem;font-weight:900;letter-spacing:2px;">${opt.toUpperCase()}</span>`;
        btn.onclick = () => {
            if (!_qzSession || !_qzSession.canAnswer) return;
            _qzSession.canAnswer = false;
            _qzStopTimer();
            grid.querySelectorAll('.qz-opt').forEach(b => b.classList.add('qz-disabled'));
            const ok = opt === hiddenLetters;
            btn.classList.remove('qz-disabled');
            btn.classList.add(ok ? 'qz-correct' : 'qz-wrong');
            if (!ok) {
                grid.querySelectorAll('.qz-opt').forEach(b => {
                    const span = b.querySelector('span:last-child');
                    if (span && span.textContent.toLowerCase() === hiddenLetters.toUpperCase()) {
                        b.classList.remove('qz-disabled');
                        b.classList.add('qz-correct');
                    }
                });
            }
            _qzHandleAnswer(ok, w, `Eksik harf(ler): ${hiddenLetters.toUpperCase()}`);
        };
        grid.appendChild(btn);
    });
    ansArea.appendChild(grid);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── TİP 6: Kelime kur (harf karıştır) ──
function _qzRenderBuild(w) {
    document.getElementById('qz-instruction').innerText = 'Harfleri sürükle, kelimeyi kur';
    const word = w.eng.toLowerCase().replace(/[^a-z]/g, '');
    const shuffled = word.split('').sort(() => Math.random() - .5);

    document.getElementById('qz-question-area').innerHTML = `
        <div class="qz-word-hero">
            <div class="qz-word-main" style="font-size:clamp(1.2rem,4vw,1.6rem);color:#7c3aed;">${w.tr}</div>
            ${w.mnemonic ? `<div style="margin-top:8px;font-size:.78rem;color:#9090b0;">💡 ${w.mnemonic}</div>` : ''}
        </div>`;

    const ansArea = document.getElementById('qz-answer-area');
    ansArea.innerHTML = '';

    let built = [];

    const builtEl = document.createElement('div');
    builtEl.className = 'qz-built-word';
    builtEl.innerHTML = '<span style="color:#c4b5fd;font-size:.85rem;">Harflere tıklayarak kelimeyi kur</span>';
    builtEl.title = 'Geri almak için tıkla';
    builtEl.onclick = () => {
        if (!_qzSession.canAnswer || built.length === 0) return;
        const last = built.pop();
        // Harfi geri al
        const allBtns = letterWrap.querySelectorAll('.qz-letter-btn');
        let found = false;
        allBtns.forEach(b => {
            if (!found && b.dataset.char === last && b.classList.contains('used')) {
                b.classList.remove('used'); found = true;
            }
        });
        updateBuilt();
    };

    const submitBtn = document.createElement('button');
    submitBtn.className = 'qz-submit-btn';
    submitBtn.textContent = '✓ Kontrol Et';
    submitBtn.onclick = () => {
        if (!_qzSession.canAnswer) return;
        const answer = built.join('');
        if (answer.length < word.length) { builtEl.style.borderColor = '#f59e0b'; return; }
        _qzSession.canAnswer = false;
        _qzStopTimer();
        const ok = answer === word;
        builtEl.style.background = ok ? '#f0fdf4' : '#fdf1f2';
        builtEl.style.borderColor = ok ? '#22c55e' : '#e63946';
        _qzHandleAnswer(ok, w, `Doğru yazılış: ${w.eng}`);
    };

    const letterWrap = document.createElement('div');
    letterWrap.className = 'qz-letter-btns';
    shuffled.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'qz-letter-btn';
        btn.textContent = ch.toUpperCase();
        btn.dataset.char = ch;
        btn.onclick = () => {
            if (btn.classList.contains('used') || !_qzSession.canAnswer) return;
            btn.classList.add('used');
            built.push(ch);
            updateBuilt();
        };
        letterWrap.appendChild(btn);
    });

    function updateBuilt() {
        if (built.length === 0) {
            builtEl.innerHTML = '<span style="color:#c4b5fd;font-size:.85rem;">Harflere tıklayarak kelimeyi kur</span>';
            builtEl.className = 'qz-built-word';
        } else {
            builtEl.innerHTML = built.map(c =>
                `<span class="qz-built-letter">${c.toUpperCase()}</span>`).join('');
            builtEl.className = 'qz-built-word has-content';
        }
    }

    const wrap = document.createElement('div');
    wrap.className = 'qz-input-wrap';
    wrap.appendChild(builtEl);
    wrap.appendChild(letterWrap);
    wrap.appendChild(submitBtn);
    ansArea.appendChild(wrap);
    _qzRenderInfoPanel(w);
    _qzStartTimer();
}

// ── Ortak: MCQ seçenek oluşturucu ──
function _qzMakeOptions(correct, wrongPool, key, isTr) {
    let opts = [correct];
    const shuffled = wrongPool.slice().sort(() => Math.random() - .5);
    for (let i = 0; i < shuffled.length && opts.length < 4; i++) {
        if (!opts.includes(shuffled[i])) opts.push(shuffled[i]);
    }
    while (opts.length < 4) opts.push('—');
    opts.sort(() => Math.random() - .5);

    const ansArea = document.getElementById('qz-answer-area');
    ansArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'qz-mcq-grid';
    const letters = ['A','B','C','D'];

    opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'qz-opt';
        btn.innerHTML = `<span class="qz-opt-letter">${letters[i]}</span><span>${opt}</span>`;
        btn.onclick = () => {
            if (!_qzSession || !_qzSession.canAnswer) return;
            _qzSession.canAnswer = false;
            _qzStopTimer();
            // Tüm butonları devre dışı bırak
            grid.querySelectorAll('.qz-opt').forEach(b => b.classList.add('qz-disabled'));
            const ok = opt === correct;
            btn.classList.remove('qz-disabled');
            btn.classList.add(ok ? 'qz-correct' : 'qz-wrong');
            if (!ok) {
                // Doğru cevabı vurgula
                grid.querySelectorAll('.qz-opt').forEach(b => {
                    if (b.querySelector('span:last-child') &&
                        b.querySelector('span:last-child').textContent === correct) {
                        b.classList.remove('qz-disabled');
                        b.classList.add('qz-correct');
                    }
                });
            }
            _qzHandleAnswer(ok, currentWord, isTr
                ? `Doğru anlam: ${correct}`
                : `Doğru kelime: ${correct}`);
        };
        grid.appendChild(btn);
    });
    ansArea.appendChild(grid);
}

// ── Cevap işle ──
function _qzHandleAnswer(ok, w, feedbackSub) {
    const s = _qzSession;
    if (!s) return;
    _qzStopTimer();
    stats.totalAnswers++;

    if (ok) {
        stats.correctAnswers++;
        s.combo++;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.correct++;
        w.correctStreak = (w.correctStreak || 0) + 1;
        w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);

        const xpGain = 10 + (s.combo >= 3 ? 5 : 0) + (s.combo >= 5 ? 5 : 0);
        s.xp += xpGain;
        _qzFloatXP('+' + xpGain + ' XP');
        recordDailyPerf(true);
        _qzShowFeedback(true, '✓',
            s.combo >= 3 ? `🔥 ${s.combo}x Combo! Muhteşem!` : 'Doğru!',
            feedbackSub, w, xpGain);
    } else {
        s.combo = 0;
        s.lives--;
        w.errorCount    = (w.errorCount || 0) + 2;
        w.correctStreak = 0;
        recordDailyPerf(false);
        _qzShowFeedback(false, '✗', 'Yanlış!',
            feedbackSub + (w.mnemonic ? `  •  💡 ${w.mnemonic}` : ''), w, 0);
    }

    // idx burada arttır — nextQuestion'da değil
    s.idx++;
    window._saveData && window._saveData();
    _qzRenderHUD();
}

// ── Bilgi Paneli — cevap beklenirken alt alan ──
function _qzRenderInfoPanel(w) {
    // Mnemonic
    const mnemEl = document.getElementById('qz-info-mnem');
    const mnemTxt = document.getElementById('qz-mnem-text');
    if (w.mnemonic) {
        mnemTxt.textContent = w.mnemonic;
        mnemEl.style.display = 'flex';
    } else {
        mnemEl.style.display = 'none';
    }

    // Performans
    const streak = w.correctStreak || 0;
    const errors = w.errorCount    || 0;
    document.getElementById('qz-perf-streak').textContent = streak;
    document.getElementById('qz-perf-err').textContent    = errors;
    const total = streak + errors;
    const pct   = total > 0 ? Math.round((streak / total) * 100) : 50;
    const bar   = document.getElementById('qz-perf-bar');
    if (bar) bar.style.width = pct + '%';

    // Kelime ailesi — suffix/prefix tabanlı tahmin
    const family = _qzWordFamily(w.eng);
    const famRow  = document.getElementById('qz-family-row');
    const famChips = document.getElementById('qz-family-chips');
    if (family.length > 1) {
        famChips.innerHTML = family.map(f =>
            `<span class="qz-family-chip chip-${f.type}">${f.word} <small style="opacity:.6">${f.label}</small></span>`
        ).join('');
        famRow.style.display = 'block';
    } else {
        famRow.style.display = 'none';
    }
}

// Kelime ailesi tahmini (suffix dönüşümleri)
function _qzWordFamily(eng) {
    if (!eng) return [];
    const w = eng.toLowerCase().trim();
    const result = [{ word: eng, type: 'noun', label: 'base' }];

    // Yaygın dönüşüm kalıpları
    const transforms = [
        { match:/tion$|sion$/,   replace:[['tion','tional','adj'],['tion','tionally','adv'],['tion','tionalize','verb']] },
        { match:/ment$/,         replace:[['ment','mental','adj'],['ment','mentally','adv']] },
        { match:/ous$|ious$/,    replace:[['ous','ously','adv'],['ious','iously','adv']] },
        { match:/ful$/,          replace:[['ful','fully','adv'],['ful','fulness','noun']] },
        { match:/less$/,         replace:[['less','lessly','adv'],['less','lessness','noun']] },
        { match:/ive$/,          replace:[['ive','ively','adv'],['ive','ivity','noun']] },
        { match:/able$|ible$/,   replace:[['able','ably','adv'],['ible','ibly','adv']] },
        { match:/ize$|ise$/,     replace:[['ize','ization','noun'],['ise','isation','noun']] },
        { match:/ly$/,           replace:[['ly','ness','noun']] },
    ];

    for (const t of transforms) {
        if (t.match.test(w)) {
            for (const [from, to, type] of t.replace) {
                const candidate = w.replace(new RegExp(from+'$'), to);
                if (candidate !== w && candidate.length > 2) {
                    result.push({ word: candidate, type: type || 'noun',
                        label: type === 'adj' ? 'adj' : type === 'adv' ? 'adv' : type === 'verb' ? 'verb' : 'noun' });
                }
            }
            if (result.length >= 4) break;
        }
    }
    return result.slice(0, 4);
}

// ── Zamanlayıcı ──
let _qzTimerInterval = null;
let _qzTimerLeft     = 15;
const QZ_TIMER_SEC   = 15;

function _qzStartTimer() {
    _qzStopTimer();
    _qzTimerLeft = QZ_TIMER_SEC;
    _qzUpdateTimerUI();
    _qzTimerInterval = setInterval(() => {
        _qzTimerLeft--;
        _qzUpdateTimerUI();
        if (_qzTimerLeft <= 0) {
            _qzStopTimer();
            // Süre doldu — yanlış say
            if (_qzSession && _qzSession.canAnswer) {
                _qzSession.canAnswer = false;
                // Tüm butonları disabled yap
                document.querySelectorAll('.qz-opt:not(.qz-correct):not(.qz-wrong)')
                    .forEach(b => b.classList.add('qz-disabled'));
                _qzHandleAnswer(false, _qzSession.queue[_qzSession.idx - 1] || currentWord, '⏱️ Süre doldu!');
            }
        }
    }, 1000);
}

function _qzStopTimer() {
    if (_qzTimerInterval) { clearInterval(_qzTimerInterval); _qzTimerInterval = null; }
}

function _qzUpdateTimerUI() {
    const fill  = document.getElementById('qz-timer-fill');
    const label = document.getElementById('qz-timer-label');
    if (!fill || !label) return;
    const pct = (_qzTimerLeft / QZ_TIMER_SEC) * 100;
    fill.style.width = pct + '%';
    label.textContent = _qzTimerLeft;
    if (_qzTimerLeft <= 5) {
        fill.classList.add('danger');
        label.style.color = '#ef4444';
        label.style.fontWeight = '900';
    } else {
        fill.classList.remove('danger');
        label.style.color = '#7c3aed';
        label.style.fontWeight = '800';
    }
}

// ── Detaylı Feedback Paneli ──
function _qzShowFeedback(ok, icon, title, sub, w, xpGain) {
    const fb = document.getElementById('qz-feedback');
    if (!fb) return;

    // Özet
    document.getElementById('qz-fb-icon').textContent  = icon;
    document.getElementById('qz-fb-title').textContent = title;
    document.getElementById('qz-fb-sub').textContent   = sub || '';

    // XP rozeti
    const xpBadge = document.getElementById('qz-fb-xp-gain');
    if (xpBadge) {
        if (ok && xpGain) {
            xpBadge.textContent = '+' + xpGain + ' XP';
            xpBadge.style.display = 'block';
        } else {
            xpBadge.style.display = 'none';
        }
    }

    // Detay bloğu
    if (w) {
        document.getElementById('qz-fb-def-eng').textContent = w.eng || '';
        document.getElementById('qz-fb-def-tr').textContent  = w.tr  || '';

        // Örnek cümle
        const storyEl = document.getElementById('qz-fb-story');
        if (w.story && storyEl) {
            const re = new RegExp(`(${w.eng})`, 'gi');
            storyEl.innerHTML = w.story.replace(re, '<em>$1</em>');
            storyEl.style.display = 'block';
        } else if (storyEl) {
            storyEl.style.display = 'none';
        }

        // Mnemonic
        const mnemBlock = document.getElementById('qz-fb-mnem-block');
        const mnemText  = document.getElementById('qz-fb-mnem-text');
        if (w.mnemonic && mnemBlock && mnemText) {
            mnemText.textContent   = w.mnemonic;
            mnemBlock.style.display = 'flex';
        } else if (mnemBlock) {
            mnemBlock.style.display = 'none';
        }
    }

    fb.className = 'qz-feedback ' + (ok ? 'qz-fb-correct' : 'qz-fb-wrong');
}

function _qzFloatXP(text) {
    const el = document.createElement('div');
    el.className = 'qz-xp-float';
    el.textContent = text;
    const badge = document.getElementById('qz-xp-badge') ||
                  document.querySelector('.qz-xp-badge');
    if (badge) {
        const r = badge.getBoundingClientRect();
        el.style.left = r.left + 'px';
        el.style.top  = r.top  + 'px';
    } else {
        el.style.right = '24px'; el.style.top = '60px';
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function _qzShowResult() {
    // Session'ın snapshot'ını al — sonraki işlemler session'ı etkilemesin
    const s = _qzSession;
    if (!s) return;

    const finalXp      = s.xp;
    const finalCorrect = s.correct;
    const finalMax     = s.maxCombo;
    const finalTotal   = s.total;

    // Feedback gizle
    const fb = document.getElementById('qz-feedback');
    if (fb) fb.className = 'qz-feedback qz-feedback-hidden';

    // Soru kartı ve meta satırını gizle
    const card = document.getElementById('qz-card');
    if (card) card.style.display = 'none';
    const meta = document.getElementById('qz-meta-row');
    if (meta) meta.style.display = 'none';

    // Progress %100
    const progFill = document.getElementById('qz-prog-fill');
    if (progFill) progFill.style.width = '100%';
    const progLabel = document.getElementById('qz-prog-label');
    if (progLabel) progLabel.innerText = `${finalTotal} / ${finalTotal}`;

    const pct   = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '😊' : '💪';
    const title = pct >= 90 ? 'Mükemmel!' : pct >= 70 ? 'Harika!' : pct >= 50 ? 'İyi İş!' : 'Devam Et!';

    document.getElementById('qz-res-emoji').textContent  = emoji;
    document.getElementById('qz-res-title').textContent  = title;
    document.getElementById('qz-res-sub').textContent    = `${finalCorrect} / ${finalTotal} doğru  •  %${pct}`;
    document.getElementById('qz-rs-xp').textContent      = finalXp;
    document.getElementById('qz-rs-correct').textContent = finalCorrect;
    document.getElementById('qz-rs-streak').textContent  = finalMax;

    const res = document.getElementById('qz-result');
    if (res) res.style.display = 'flex';

    // Scroll to top
    const body = document.getElementById('qz-body');
    if (body) body.scrollTop = 0;

    window._saveData && window._saveData();
}

// ══════════════════════════════════════════════
// ÖĞRENME MODU (FLIP CARD + BİLİYORUM/TEKRAR)
// ══════════════════════════════════════════════
let studyQueue    = [];   // Mevcut turda gezilecek kelimeler (indeks listesi)
let studyAgainIdx = [];   // "Tekrar Et" işaretlenen indeksler
let studyKnownSet = new Set(); // "Biliyorum" işaretlenen indeksler
let studyFlipped  = false;
let studyQueuePos = 0;

/* ════════════════════════════════════════════════
   KELIME GRUBU SEÇİCİ — sg- prefix
   ════════════════════════════════════════════════ */

function _buildSgPanel(showStartBtn) {
    const panel   = document.getElementById('sg-panel');
    const chips   = document.getElementById('sg-chips');
    const trigger = document.getElementById('sg-trigger');
    if (!chips) return;

    const lists = Object.keys(allData || {});
    if (!lists.length) { if (trigger) trigger.style.display = 'none'; return; }
    if (trigger) trigger.style.display = '';

    const totalAll = lists.reduce((s, k) => s + (allData[k] || []).length, 0);

    // Trigger label güncelle
    const lbl = document.getElementById('sg-trigger-label');
    if (lbl) {
        lbl.textContent = studyGroupMode === 'random'
            ? '🎲 Rastgele Tüm'
            : (studyGroupMode !== 'list' ? studyGroupMode : (document.getElementById('list-selector')?.value || lists[0]));
    }

    let html = '';

    // Rastgele satır
    const isRandom = studyGroupMode === 'random';
    html += `<button class="sg-chip sg-random ${isRandom ? 'sg-active' : ''}"
        onclick="_sgSelectAndStart('random')">
        🎲 Rastgele Tüm
        <span class="sg-chip-count">${totalAll}</span>
    </button>`;

    // Her liste
    lists.forEach((name, idx) => {
        const count    = (allData[name] || []).length;
        const isActive = studyGroupMode === name;
        html += `<button class="sg-chip ${isActive ? 'sg-active' : ''}"
            data-sgname="${idx}"
            onclick="_sgSelectAndStart(null, this)">
            ${name}
            <span class="sg-chip-count">${count}</span>
        </button>`;
    });

    chips.innerHTML = html;
}

// Dropdown aç/kapat
window._sgToggleDropdown = function() {
    const panel   = document.getElementById('sg-panel');
    const trigger = document.getElementById('sg-trigger');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
        _sgCloseDropdown();
    } else {
        panel.style.display = '';
        if (trigger) trigger.classList.add('open');
        // Overlay — dışarı tıklayınca kapat
        const ov = document.createElement('div');
        ov.className = 'sg-overlay';
        ov.id = 'sg-overlay';
        ov.onclick = _sgCloseDropdown;
        document.getElementById('study-page').appendChild(ov);
        _buildSgPanel();
    }
};
window._sgCloseDropdown = function() {
    const panel   = document.getElementById('sg-panel');
    const trigger = document.getElementById('sg-trigger');
    const ov      = document.getElementById('sg-overlay');
    if (panel)   panel.style.display = 'none';
    if (trigger) trigger.classList.remove('open');
    if (ov)      ov.remove();
};

// Panel açıldığında güncelle
function _initSgPanel() {
    const selVal = document.getElementById('list-selector')?.value;
    if (selVal && allData[selVal]) studyGroupMode = selVal;
    const panel = document.getElementById('sg-panel');
    if (panel) panel.style.display = 'none'; // Dropdown kapalı başlar
    _buildSgPanel(); // Trigger label güncelle
}
window._buildSgPanel  = _buildSgPanel;
window._initSgPanel   = _initSgPanel;
window.studyGroupMode = studyGroupMode;  // chip onclick için global erişim

// Liste chip tıklaması — liste adını data-attribute yerine allData key listesinden al
window._sgSelectRandom = function() {
    studyGroupMode = 'random';
    window.studyGroupMode = 'random';
    _buildSgPanel();
};

window._sgSelectList = function(btn) {
    const idx = parseInt(btn.getAttribute('data-sgname'), 10);
    const lists = Object.keys(allData || {});
    if (!isNaN(idx) && lists[idx]) {
        studyGroupMode = lists[idx];
        window.studyGroupMode = studyGroupMode;
    }
    _buildSgPanel();
};

// Dropdown: seç, kapat, başlat
window._sgSelectAndStart = function(mode, btn) {
    if (mode === 'random') {
        studyGroupMode = 'random';
        window.studyGroupMode = 'random';
    } else if (btn) {
        const idx = parseInt(btn.getAttribute('data-sgname'), 10);
        const lists = Object.keys(allData || {});
        if (!isNaN(idx) && lists[idx]) {
            studyGroupMode = lists[idx];
            window.studyGroupMode = studyGroupMode;
        }
    }
    _sgCloseDropdown();
    startStudy();
};

function startStudy(groupMode) {
    // groupMode: undefined → mevcut mod kullan, string → o modu zorla
    if (groupMode !== undefined) { studyGroupMode = groupMode; window.studyGroupMode = groupMode; }

    const lists = Object.keys(allData || {});
    if (!lists.length) { _showAppToast('Önce kelime listesi yükleyin!'); return; }

    if (studyGroupMode === 'random') {
        // Tüm listeleri birleştir, her kelimeye kaynak liste bilgisi ekle
        studyGroupPool = [];
        lists.forEach(listName => {
            (allData[listName] || []).forEach((w, i) => {
                studyGroupPool.push({ ...w, _srcList: listName, _srcIdx: i });
            });
        });
        // Karıştır
        for (let i = studyGroupPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studyGroupPool[i], studyGroupPool[j]] = [studyGroupPool[j], studyGroupPool[i]];
        }
        if (!studyGroupPool.length) { _showAppToast('Hiç kelime yok!'); return; }
        currentActiveList = '🎲 Tüm Listeler';
    } else {
        // Belirli bir liste
        const targetList = (studyGroupMode !== 'list' && allData[studyGroupMode])
            ? studyGroupMode
            : (document.getElementById('list-selector')?.value || lists[0]);
        currentActiveList = targetList;
        if (!allData[currentActiveList] || !allData[currentActiveList].length) {
            _showAppToast('Liste boş veya seçili değil!'); return;
        }
        studyGroupPool = allData[currentActiveList].map((w, i) => ({ ...w, _srcList: currentActiveList, _srcIdx: i }));
    }

    studyKnownSet.clear();
    studyAgainIdx = [];
    studyQueue    = studyGroupPool.map((_, i) => i);
    studyQueuePos = 0;
    studyIndex    = 0;
    startModule();
    _buildSgPanel(false);  // Panel güncelle — Başla butonu gizli (zaten çalışıyor)
    showPage('study-page');
    renderStudyCard();
}

function startStudyFromNav() {
    currentActiveList = document.getElementById('list-selector')?.value || Object.keys(allData || {})[0] || '';
    if (!currentActiveList || !allData[currentActiveList] || !allData[currentActiveList].length) {
        navTo('index-page'); return;
    }
    studyGroupMode = currentActiveList; window.studyGroupMode = currentActiveList; // seçili listeyi mod olarak set et
    startStudy();
}

function renderStudyCard() {
    // Pool: rastgele modda studyGroupPool, liste modunda allData[currentActiveList]
    const pool  = studyGroupPool.length ? studyGroupPool : (allData[currentActiveList] || []);
    const total = studyQueue.length;
    const pos   = studyQueuePos;
    studyIndex  = studyQueue[pos];
    const w     = pool[studyIndex];
    if (!w) { exitModule(); return; }

    // İlerleme
    const pct = total > 0 ? Math.round((pos / total) * 100) : 0;
    document.getElementById('study-prog-fill').style.width = pct + '%';
    document.getElementById('study-progress-label').innerText = `${pos + 1} / ${total}`;

    // Chip sayaçları
    document.getElementById('chip-known-count').innerText = studyKnownSet.size;
    document.getElementById('chip-again-count').innerText = studyAgainIdx.length;

    // ── Kelime türü (POS) algıla ──
    const pos_tag = detectPOS(w.eng, w.tr);

    // ── HERO ──
    document.getElementById('study-eng').innerText      = w.eng;
    // Liste etiketi: rastgele modda kaynak listeyi göster
    const _wSrc = w._srcList || currentActiveList;
    document.getElementById('study-list-tag').innerText = _wSrc;
    document.getElementById('study-pos-tag').innerHTML  = pos_tag.html;

    // Seviye tahmini
    const level = estimateLevel(w.eng);
    const lvlEl = document.getElementById('study-level-tag');
    if (lvlEl) {
        lvlEl.textContent = level;
        lvlEl.className   = 'wc-level-tag wc-level-' + level.toLowerCase();
    }

    // Fonetik & heceleme
    const phonetic  = getIPA(w.eng);
    const syllables = getSyllables(w.eng);
    document.getElementById('study-phonetic').innerText  = phonetic;
    document.getElementById('study-syllables').innerText = syllables;

    // Streak göstergesi
    const streak   = w.correctStreak || 0;
    const streakEl = document.getElementById('sfc-streak-row');
    if (streak > 0) {
        const dots = Math.min(streak, 10);
        streakEl.innerHTML = Array.from({length:dots}, (_,i) =>
            `<span class="wc-streak-dot${i < streak ? ' wc-streak-dot-on' : ''}"></span>`
        ).join('');
        streakEl.style.display = 'flex';
    } else {
        streakEl.style.display = 'none';
    }

    // ── ANLAM ──
    document.getElementById('study-tr').innerText = w.tr;

    // ── BİLGİ GRID ──
    const posFullEl = document.getElementById('study-pos-full');
    if (posFullEl) posFullEl.innerHTML = pos_tag.html + ' <span style="font-size:.75rem;font-weight:500;color:var(--ink2);margin-left:4px;">' + getPOSFull(pos_tag.label) + '</span>';

    const morphEl = document.getElementById('study-morphology');
    if (morphEl) morphEl.innerHTML = getMorphology(w.eng, pos_tag.label);

    const familyEl = document.getElementById('study-family');
    if (familyEl) familyEl.innerHTML = getWordFamily(w.eng, pos_tag.label);

    document.getElementById('sfcb-err-count').innerText    = w.errorCount || 0;
    document.getElementById('sfcb-streak-count').innerText = w.correctStreak || 0;

    // ── MNEMONIC & BAĞLAM ──
    document.getElementById('study-mnemonic').innerText = w.mnemonic || '—';
    document.getElementById('study-story').innerText    = w.story    || '—';
    const mnEl = document.getElementById('sfcb-mnemonic-block');
    const stEl = document.getElementById('sfcb-story-block');
    if (mnEl) mnEl.style.display = w.mnemonic ? 'flex' : 'none';
    if (stEl) stEl.style.display = w.story    ? 'flex' : 'none';

    // ── CÜMLELER sıfırla ──
    const senList = document.getElementById('study-sentences-list');
    if (senList) senList.innerHTML = '<div style="font-size:.78rem;color:var(--ink3);font-style:italic;padding:4px 0;">Cümle üretmek için ✨ butonuna bas.</div>';
    const genBtn = document.getElementById('study-gen-btn');
    if (genBtn) { genBtn.classList.remove('wc-ai-loading'); genBtn.textContent = '✨ AI ile üret'; }

    // Kart animasyonu yenile
    const sfc = document.getElementById('sfc');
    if (sfc) { sfc.style.animation = 'none'; sfc.offsetHeight; sfc.style.animation = ''; }
}

// ── POS tam ismi ──
function getPOSFull(label) {
    const map = { ADJ:'Sıfat (Adjective)', ADV:'Zarf (Adverb)', NOUN:'İsim (Noun)', VERB:'Fiil (Verb)', WORD:'Kelime' };
    return map[label] || label;
}

// ── Gelişmiş morfoloji analizi ──
function getMorphology(eng, posLabel) {
    const w = (eng || '').toLowerCase().trim();
    const parts = [];

    // Prefix tespiti
    const prefixes = {
        'un':'UN- (olumsuz)', 'in':'IN- (olumsuz)', 'im':'IM- (olumsuz)',
        'dis':'DIS- (ayrılma/olumsuz)', 're':'RE- (tekrar)', 'pre':'PRE- (önce)',
        'mis':'MIS- (yanlış)', 'over':'OVER- (aşırı)', 'sub':'SUB- (alt)',
        'inter':'INTER- (arası)', 'trans':'TRANS- (geçiş)', 'super':'SUPER- (üstün)',
        'anti':'ANTI- (karşı)', 'ex':'EX- (eski/dışarı)', 'non':'NON- (değil)',
    };
    for (const [pfx, lbl] of Object.entries(prefixes)) {
        if (w.startsWith(pfx) && w.length > pfx.length + 2) { parts.push(lbl); break; }
    }

    // Suffix tespiti
    const suffixes = {
        'tion':'-TION (eylem→isim)', 'sion':'-SION (eylem→isim)', 'ment':'-MENT (isim)',
        'ness':'-NESS (soyut isim)', 'ity':'-ITY (soyut isim)', 'ance':'-ANCE (isim)',
        'ence':'-ENCE (isim)', 'ism':'-ISM (doktrin)', 'ist':'-IST (kişi)',
        'ous':'-OUS (sıfat yapıcı)', 'ful':'-FUL (dolu)', 'less':'-LESS (eksik)',
        'ive':'-IVE (sıfat)', 'al':'-AL (sıfat)', 'ic':'-IC (sıfat)',
        'ible':'-IBLE (yapılabilir)', 'able':'-ABLE (yapılabilir)',
        'ly':'-LY (zarf yapıcı)', 'ify':'-IFY (fiil yapıcı)', 'ize':'-IZE (fiil yapıcı)',
        'ise':'-ISE (fiil yapıcı)', 'ate':'-ATE (fiil)', 'er':'-ER (yapan kişi)',
        'or':'-OR (yapan kişi)', 'ship':'-SHIP (durum)', 'hood':'-HOOD (durum)',
    };
    const sfxKeys = Object.keys(suffixes).sort((a,b) => b.length - a.length);
    for (const sfx of sfxKeys) {
        if (w.endsWith(sfx) && w.length > sfx.length + 2) { parts.push(suffixes[sfx]); break; }
    }

    if (parts.length === 0) return '<span style="color:var(--ink3)">Basit kök</span>';
    return parts.map(p => `<span style="background:#f1f5f9;color:var(--ink);border-radius:4px;padding:1px 6px;font-size:.72rem;font-weight:700;">${p}</span>`).join(' ');
}

// ── Kelime ailesi tahmini ──
function getWordFamily(eng, posLabel) {
    const w = (eng || '').toLowerCase().trim();
    const family = [];

    // Kök bul (kaba)
    let root = w;
    const sfxMap = [
        ['tion','te'],['sion','d'],['ment',''],['ness',''],['ity','e'],
        ['ance','e'],['ence','e'],['ous','e'],['ful',''],['less',''],
        ['ive','e'],['able','e'],['ible','e'],['ly',''],['ify','ify'],
        ['ize','ize'],['ise','ise'],['ate',''],['er',''],['or',''],
        ['ment',''],['al',''],['ic',''],
    ];
    for (const [sfx, rep] of sfxMap) {
        if (w.endsWith(sfx) && w.length > sfx.length + 2) {
            root = w.slice(0, -sfx.length) + rep;
            break;
        }
    }

    // Türe göre ilgili formlara işaret et
    const map = {
        NOUN: ['→ Verb: ' + root + (root.endsWith('e') ? '' : 'ify / ize'), '→ Adj: ' + root + 'ous / ' + root + 'al'],
        VERB: ['→ Noun: ' + w + 'tion / ' + w + 'ment', '→ Adj: ' + w + 'ive / ' + w + 'able'],
        ADJ:  ['→ Adv: ' + w + 'ly', '→ Noun: ' + w.replace(/e$/,'') + 'ness / ' + w.replace(/e$/,'') + 'ity'],
        ADV:  ['→ Adj: ' + w.replace(/ly$/,''), '→ Noun: ' + w.replace(/ly$/,'') + 'ness'],
    };
    const forms = map[posLabel] || [];
    if (!forms.length) return '<span style="color:var(--ink3)">—</span>';
    return forms.map(f => `<span style="color:var(--ink2);font-size:.73rem;">${f}</span>`).join('<br>');
}

// ── Seviye tahmini (suffix + uzunluk bazlı) ──
function estimateLevel(eng) {
    const w = (eng || '').toLowerCase().trim();
    const len = w.length;
    // Basit/kısa kelimeler A1-A2
    const a1 = /^(run|big|old|new|hot|cold|good|bad|day|way|say|use|get|set|put|see|try|ask|may|can|go|do|be|have|make|take|come|know|look|like|give|tell|work|call|feel|help|live|talk|turn|move|keep|open|seem|show|play|hear|care|hand|high|long|large|small|free|full|real|hard|early|often|never|always|maybe|here|there|around|next|back|last|most|more|over|under|well|already|even|then|when|than|because|before|after|while|also|too|just|only|about|between|through|without|same|other|right|left|own|each|these|those|such|much|many|few|every|both|all|any|some|no|yes)$/.test(w);
    if (a1) return 'A1';
    if (len <= 5 && !/tion$|sion$|ity$|ance$|ence$/.test(w)) return 'A2';
    if (len <= 7 && !/tion$|sion$/.test(w)) return 'B1';
    if (/tion$|sion$|ment$|ness$|ity$/.test(w) && len <= 10) return 'B2';
    if (len > 10 || /uous$|aceous$|itious$|ential$/.test(w)) return 'C1';
    if (len > 13) return 'C2';
    return 'B2';
}

// ── IPA benzeri okunuş (kural tabanlı) ──
function getIPA(eng) {
    if (!eng) return '';
    // Kelimeyi hecelere ayır ve / ... / formatında göster
    const w = eng.toLowerCase();
    const syl = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi) || [w];
    return '/' + syl.join('·') + '/';
}

// ── Hece gösterimi ──
function getSyllables(eng) {
    if (!eng) return '';
    const w = eng.toLowerCase();
    const syl = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi) || [w];
    if (syl.length <= 1) return '';
    return syl.length + ' hece: ' + syl.join('·');
}

// ── AI Örnek Cümle Üretici ──
async function generateStudySentences() {
    const list = allData[currentActiveList];
    if (!list) return;
    const w = list[studyQueue[studyQueuePos]];
    if (!w) return;

    const btn     = document.getElementById('study-gen-btn');
    const listEl  = document.getElementById('study-sentences-list');
    if (!btn || !listEl) return;

    btn.textContent = '⏳ Üretiliyor...';
    btn.classList.add('wc-ai-loading');
    listEl.innerHTML = '<div style="font-size:.78rem;color:var(--ink3);padding:6px 0;">AI cümle yazıyor...</div>';

    const prompt = `For the English word "${w.eng}" (meaning: "${w.tr}"), write exactly 2 example sentences in JSON.
Each sentence should:
- Be C1/C2 level English
- Clearly show the word's meaning in context
- Have a Turkish translation

Respond ONLY with valid JSON, no extra text:
{"sentences":[{"en":"...","tr":"..."},{"en":"...","tr":"..."}]}`;

    try {
        let result = null;
        if (typeof getAIResponse === 'function') {
            const raw     = await getAIResponse(prompt, { maxTokens: 400, json: true });
            const cleaned = (raw || '').replace(/```json|```/g,'').trim();
            result = JSON.parse(cleaned);
        } else throw new Error('no_ai');

        const sentences = result.sentences || [];
        if (!sentences.length) throw new Error('empty');

        listEl.innerHTML = sentences.map((s, i) => {
            // Kelimeyi kalın yap
            const highlighted = s.en.replace(
                new RegExp(`(${w.eng.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\w*)`, 'gi'),
                '<b>$1</b>'
            );
            return `
            <div class="wc-sentence-item" style="${i > 0 ? 'margin-top:8px;' : ''}">
                <div class="wc-sentence-en">${highlighted}</div>
                <div class="wc-sentence-tr">${s.tr}</div>
            </div>`;
        }).join('');

    } catch(e) {
        listEl.innerHTML = '<div style="font-size:.75rem;color:#ef4444;padding:4px 0;">❌ Cümle üretilemedi. AI anahtarını kontrol et.</div>';
    }

    btn.classList.remove('wc-ai-loading');
    btn.textContent = '↻ Yenile';
}

// Basit kelime türü algılama
function detectPOS(eng, tr) {
    const w = (eng || '').toLowerCase().trim();
    // Suffix tabanlı kural seti
    if (/ly$/.test(w) && !/friendly|lovely|orderly|early|daily/.test(w))
        return { label:'ADV', html:'<span class="pos-adv">ADV</span>' };
    if (/tion$|sion$|ment$|ness$|ity$|ance$|ence$|ism$|ist$|er$|or$|hood$|ship$/.test(w))
        return { label:'NOUN', html:'<span class="pos-noun">NOUN</span>' };
    if (/ous$|ful$|less$|ive$|al$|ic$|ible$|able$|ent$|ant$|ish$/.test(w))
        return { label:'ADJ', html:'<span class="pos-adj">ADJ</span>' };
    if (/ify$|ize$|ise$|ate$|en$/.test(w))
        return { label:'VERB', html:'<span class="pos-verb">VERB</span>' };
    // TR ipucu
    const t = (tr || '').toLowerCase();
    if (/bir şekilde|ça$|çe$/.test(t))
        return { label:'ADV', html:'<span class="pos-adv">ADV</span>' };
    if (/mek$|mak$|etmek|olmak/.test(t))
        return { label:'VERB', html:'<span class="pos-verb">VERB</span>' };
    if (/lık$|lik$|luk$|lük$|sal$|sel$/.test(t))
        return { label:'NOUN', html:'<span class="pos-noun">NOUN</span>' };
    return { label:'WORD', html:'<span class="pos-word">WORD</span>' };
}

// Basit fonetik (heceleme) — gerçek IPA olmasa da okunuşa yardımcı
function getPhonetic(eng) {
    if (!eng) return '';
    // Kelimeyi hecelere ayırma (kaba)
    const w = eng.toLowerCase();
    let syllables = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi) || [w];
    return '/ ' + syllables.join(' · ') + ' /';
}

function flipStudyCard() {
    // Flip kaldırıldı — artık kullanılmıyor
}

function resetFlip() {
    // Flip kaldırıldı — artık kullanılmıyor
    const actions = document.getElementById('study-actions');
    if (actions) { actions.style.opacity = '1'; actions.style.transform = 'none'; actions.style.pointerEvents = 'auto'; }
}

function nextStudy() { /* artık flip yok, ilerle */ }

function studyMarkKnown() {
    const idx = studyQueue[studyQueuePos];
    studyKnownSet.add(idx);
    // SM-2 hafif puan — pool'dan kaynak bul
    const pool = studyGroupPool.length ? studyGroupPool : (allData[currentActiveList] || []);
    const pw   = pool[idx];
    const w    = pw ? (allData[pw._srcList || currentActiveList]?.[pw._srcIdx ?? idx] || pw) : null;
    if (w) {
        w.correctStreak = (w.correctStreak || 0) + 1;
        w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
    }
    studyAdvance();
}

function studyMarkAgain() {
    const idx = studyQueue[studyQueuePos];
    studyKnownSet.delete(idx);
    if (!studyAgainIdx.includes(idx)) studyAgainIdx.push(idx);
    // hafif ceza — pool'dan kaynak bul, orijinal allData'ya yaz
    const pool = studyGroupPool.length ? studyGroupPool : (allData[currentActiveList] || []);
    const pw   = pool[idx];
    const w    = pw ? (allData[pw._srcList || currentActiveList]?.[pw._srcIdx ?? idx] || pw) : null;
    if (w) { w.errorCount = (w.errorCount || 0) + 1; w.correctStreak = 0; }
    studyAdvance();
}

function studyAdvance() {
    window._saveData && window._saveData();
    studyQueuePos++;
    if (studyQueuePos >= studyQueue.length) {
        showStudyDone();
    } else {
        renderStudyCard();
    }
}

function prevStudy() {
    if (studyQueuePos > 0) {
        studyQueuePos--;
        renderStudyCard();
    }
}

function nextStudy() { flipStudyCard(); }

function updateStudyCard() { renderStudyCard(); } // geriye dönük uyumluluk

// ── Tamamlama Ekranı ──
function showStudyDone() {
    const total  = studyQueue.length;
    const known  = studyKnownSet.size;
    const pct    = total > 0 ? Math.round((known / total) * 100) : 0;

    document.getElementById('sdone-known').innerText = known;
    document.getElementById('sdone-total').innerText = total;
    document.getElementById('sdone-pct').innerText   = pct + '%';

    const fill = document.getElementById('sdone-bar-fill');
    setTimeout(() => { fill.style.width = pct + '%'; }, 80);

    // Renk ve mesaj
    let emoji, title, sub, msg;
    if (pct === 100) {
        emoji = '🏆'; title = 'Mükemmel!'; sub = 'Tüm kelimeleri biliyorsun!';
        msg = 'Muhteşem bir seans! Artık teste geçebilirsin.';
        fill.style.background = 'var(--green)';
    } else if (pct >= 70) {
        emoji = '🎉'; title = 'Harika İş!'; sub = `${pct}% başarı oranı`;
        msg = `${studyAgainIdx.length} kelime daha pratik yapılabilir.`;
        fill.style.background = '#3b82f6';
    } else if (pct >= 40) {
        emoji = '💪'; title = 'İyi Başlangıç!'; sub = `${pct}% tamamlandı`;
        msg = 'Tekrarlama yapmak için "Sadece Tekrarları Çalış" butonunu dene.';
        fill.style.background = '#f97316';
    } else {
        emoji = '📚'; title = 'Devam Et!'; sub = `${pct}% — biraz daha pratik gerekiyor`;
        msg = 'Her tekrarda daha iyi olacaksın. Tekrar çalış!';
        fill.style.background = 'var(--red)';
    }

    document.getElementById('sdone-emoji').innerText = emoji;
    document.getElementById('sdone-title').innerText = title;
    document.getElementById('sdone-sub').innerText   = sub;
    document.getElementById('sdone-msg').innerText   = msg;

    // "Sadece Tekrarları" butonu — yoksa gizle
    const againBtn = document.querySelector('button[onclick="restartStudyAgainOnly()"]');
    if (againBtn) againBtn.style.display = studyAgainIdx.length > 0 ? 'block' : 'none';

    if (pct >= 80) fireConfetti();
    showPage('study-done-page');
}

function restartStudy() {
    studyKnownSet.clear();
    studyAgainIdx = [];
    // Pool: rastgele modda studyGroupPool, liste modunda allData
    const pool = studyGroupPool.length ? studyGroupPool : (allData[currentActiveList] || []);
    studyQueue    = pool.map((_, i) => i);
    studyQueuePos = 0;
    showPage('study-page');
    renderStudyCard();
}

function restartStudyAgainOnly() {
    if (!studyAgainIdx.length) { restartStudy(); return; }
    studyQueue    = [...studyAgainIdx];
    studyAgainIdx = [];
    studyKnownSet.clear();
    studyQueuePos = 0;
    showPage('study-page');
    renderStudyCard();
}


// ══════════════════════════════════════════════
// YÖNETİM & SENKRONİZASYON
// ══════════════════════════════════════════════
function exportData() {
    const blob = new Blob([JSON.stringify({ allData, stats })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ydt_master_yedek.json';
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = function (ev) {
        const imp = JSON.parse(ev.target.result);
        if (confirm("Tüm veriler yedekle değiştirilecek?")) {
            allData = imp.allData;
            stats   = imp.stats;
            window._saveData && window._saveData();
            location.reload();
        }
    };
    reader.readAsText(e.target.files[0]);
}

function updateSelectors() {
    // Kelime grubu paneli güncelle (study-page açıksa)
    if (document.getElementById('sg-chips')) _buildSgPanel();
    // Her zaman güncel user-scoped allData'yı oku
    if (typeof getUserKey === 'function') {
        const raw = localStorage.getItem(getUserKey('all_data'));
        if (raw) { try { allData = JSON.parse(raw); } catch(e) {} }
    }

    const keys = Object.keys(allData);

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
    // Skeleton'ları temizle — gerçek veri geldi
    ['idx-total','idx-learned','idx-accuracy'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    const streakEl0 = document.getElementById('idx-streak-val');
    if (streakEl0) streakEl0.innerHTML = '';

    // User-scoped veri oku (getUserKey kelimeler.js'de tanımlı)
    if (typeof getUserKey === 'function') {
        const rawAD = localStorage.getItem(getUserKey('all_data'));
        const rawST = localStorage.getItem(getUserKey('stats'));
        if (rawAD) { try { allData = JSON.parse(rawAD); } catch(e) {} }
        if (rawST) { try { stats   = JSON.parse(rawST);  if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0; } catch(e) {} }
    }

    let total = 0, learned = 0;
    Object.values(allData).forEach(list => {
        total += list.length;
        list.forEach(w => {
            if ((w.errorCount || 0) <= 0 && (w.correctStreak || 0) >= 2) learned++;
        });
    });
    document.getElementById('idx-total').innerText   = total;
    document.getElementById('idx-learned').innerText = learned;
    const acc = stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
    document.getElementById('idx-accuracy').innerText = acc + '%';

    const today     = new Date().toDateString();
    const streakKey = typeof getUserKey === 'function' ? getUserKey('streak')   : 'ydt_streak';
    const dayKey    = typeof getUserKey === 'function' ? getUserKey('last_day') : 'ydt_last_day';
    const lastDay   = localStorage.getItem(dayKey);
    let streak      = parseInt(localStorage.getItem(streakKey) || '0');
    if (lastDay !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastDay === yesterday)  { streak++; }
        else if (lastDay)           { streak = 1; }
        else                        { streak = 1; }
        localStorage.setItem(streakKey, streak);
        localStorage.setItem(dayKey, today);
    }
    document.getElementById('idx-streak-val').innerText = streak;

    // Yeni analitik paneller
    renderWeakWords();
    renderPerfChart();
    renderPOSChart();
    renderSoruStats();
    renderBankStats();
    renderGrammarProgress();
    renderSM2Plan();
}

// ════════════════════════════════════════════════
// 🚨 EN ZAYIF 5 KELİME
// ════════════════════════════════════════════════
function renderWeakWords() {
    const el = document.getElementById('idx-weak-words');
    if (!el) return;

    // Tüm kelimeleri topla, errorCount'a göre sırala
    const all = [];
    Object.entries(allData).forEach(([listName, list]) => {
        list.forEach(w => {
            if ((w.errorCount || 0) > 0 || (w.correctStreak || 0) === 0) {
                all.push({ ...w, listName });
            }
        });
    });

    // Öncelik skoru: errorCount ağırlıklı, düşük streak ceza
    all.sort((a, b) => {
        const scoreA = (a.errorCount || 0) * 2 - (a.correctStreak || 0);
        const scoreB = (b.errorCount || 0) * 2 - (b.correctStreak || 0);
        return scoreB - scoreA;
    });

    const top5 = all.slice(0, 5);

    if (!top5.length) {
        el.innerHTML = '<div class="idx-weak-empty">🎉 Harika! Kritik zayıflık yok.<br><small>Kelimeleri çalıştıkça burada görünür.</small></div>';
        return;
    }

    el.innerHTML = top5.map((w, i) => {
        const err    = w.errorCount || 0;
        const streak = w.correctStreak || 0;
        const danger = err >= 4 ? 'idx-weak-red' : err >= 2 ? 'idx-weak-orange' : 'idx-weak-yellow';
        const bar    = Math.min(100, err * 14); // görsel hata barı
        return `
        <div class="idx-weak-item ${danger}" onclick="speakWord('${w.eng.replace(/'/g,"\'")}')">
            <div class="idx-weak-rank">${i + 1}</div>
            <div class="idx-weak-body">
                <div class="idx-weak-word">${w.eng}</div>
                <div class="idx-weak-tr">${w.tr}</div>
                <div class="idx-weak-bar-wrap">
                    <div class="idx-weak-bar" style="width:${bar}%"></div>
                </div>
            </div>
            <div class="idx-weak-meta">
                <span class="idx-weak-err">❌ ${err}</span>
                <span class="idx-weak-streak">🔥 ${streak}</span>
            </div>
        </div>`;
    }).join('');
}

// ════════════════════════════════════════════════
// 📈 SON 7 GÜN PERFORMANS GRAFİĞİ (Saf SVG)
// ════════════════════════════════════════════════
function renderPerfChart() {
    const el = document.getElementById('idx-perf-chart');
    if (!el) return;

    const hist = JSON.parse(localStorage.getItem('ydt_perf_hist') || '{}');

    // Son 7 günü üret
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d   = new Date(Date.now() - i * 86400000);
        const key = d.toDateString();
        const lbl = d.toLocaleDateString('tr-TR', { weekday: 'short' });
        days.push({
            key,
            lbl,
            correct: hist[key]?.correct || 0,
            wrong:   hist[key]?.wrong   || 0,
        });
    }

    const W = 280, H = 110, pad = { t: 10, r: 8, b: 28, l: 28 };
    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;
    const maxVal = Math.max(...days.map(d => d.correct + d.wrong), 1);
    const barW   = Math.floor(chartW / 7) - 4;
    const gap    = Math.floor(chartW / 7);

    // Y eksen çizgileri
    const yLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = pad.t + chartH - pct * chartH;
        const val = Math.round(pct * maxVal);
        return `
            <line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>
            <text x="${pad.l - 4}" y="${y + 4}" text-anchor="end" font-size="8" fill="#bbb">${val}</text>`;
    }).join('');

    // Bar'lar
    const bars = days.map((d, i) => {
        const x       = pad.l + i * gap + (gap - barW) / 2;
        const total   = d.correct + d.wrong;
        const corrH   = total > 0 ? (d.correct / maxVal) * chartH : 0;
        const wrongH  = total > 0 ? (d.wrong   / maxVal) * chartH : 0;
        const baseY   = pad.t + chartH;
        const isToday = i === 6;

        const corrBar = corrH > 0 ? `<rect x="${x}" y="${baseY - corrH - wrongH}" width="${barW}" height="${corrH}" rx="2" fill="${isToday ? '#22c55e' : '#86efac'}"/>` : '';
        const wrongBar= wrongH > 0 ? `<rect x="${x}" y="${baseY - wrongH}" width="${barW}" height="${wrongH}" rx="2" fill="${isToday ? '#ef4444' : '#fca5a5'}"/>` : '';
        const lbl     = `<text x="${x + barW/2}" y="${H - 6}" text-anchor="middle" font-size="9" fill="${isToday ? 'var(--red)' : '#aaa'}" font-weight="${isToday ? '800' : '400'}">${d.lbl}</text>`;

        // tooltip title
        const tip = `${d.lbl}: ${d.correct} doğru, ${d.wrong} yanlış`;
        return `<g title="${tip}">${corrBar}${wrongBar}${lbl}</g>`;
    }).join('');

    el.innerHTML = `
    <svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${yLines}
        ${bars}
    </svg>`;
}

// ════════════════════════════════════════════════
// 🔤 KELİME TÜRÜ DAĞILIMI (POS)
// ════════════════════════════════════════════════
function renderPOSChart() {
    const el = document.getElementById('idx-pos-chart');
    if (!el) return;

    const counts = { ADJ: 0, NOUN: 0, VERB: 0, ADV: 0, WORD: 0 };
    let total = 0;

    Object.values(allData).forEach(list => {
        list.forEach(w => {
            const pos = detectPOS(w.eng, w.tr).label;
            counts[pos] = (counts[pos] || 0) + 1;
            total++;
        });
    });

    if (total === 0) {
        el.innerHTML = '<div class="idx-weak-empty">Henüz kelime yok.</div>';
        return;
    }

    const cfg = {
        ADJ:  { label: 'Sıfat',  color: '#f59e0b', bg: '#fef9c3' },
        NOUN: { label: 'İsim',   color: '#22c55e', bg: '#f0fdf4' },
        VERB: { label: 'Fiil',   color: '#a855f7', bg: '#faf5ff' },
        ADV:  { label: 'Zarf',   color: '#3b82f6', bg: '#eff6ff' },
        WORD: { label: 'Diğer',  color: '#94a3b8', bg: '#f8fafc' },
    };

    // Yatay progress bar stili
    el.innerHTML = Object.entries(counts)
        .filter(([, c]) => c > 0)
        .sort(([,a],[,b]) => b - a)
        .map(([pos, count]) => {
            const pct  = Math.round(count / total * 100);
            const c    = cfg[pos];
            return `
            <div class="idx-pos-row">
                <div class="idx-pos-label-wrap">
                    <span class="idx-pos-pill" style="background:${c.bg};color:${c.color};">${pos}</span>
                    <span class="idx-pos-name">${c.label}</span>
                    <span class="idx-pos-count">${count}</span>
                </div>
                <div class="idx-pos-bar-wrap">
                    <div class="idx-pos-bar" style="width:${pct}%;background:${c.color};"></div>
                    <span class="idx-pos-pct">${pct}%</span>
                </div>
            </div>`;
        }).join('');
}

// ════════════════════════════════════════════════════════════
// 🗃️ SORU BANKASI CANLI İSTATİSTİK (index.html)
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// 📊 SORU İSTATİSTİKLERİ BAR (index.html — tam genişlik)
// ════════════════════════════════════════════════════════════
function renderSoruStats() {
    // ── Kelime soruları (aiArsiv) ──────────────────────────
    const kelimeArsiv = window.aiArsiv || [];
    const kTot = kelimeArsiv.length;
    const kCor = kelimeArsiv.filter(e => e.isCorrect === true).length;
    const kWrg = kelimeArsiv.filter(e => e.isCorrect === false).length;
    const kPct = kTot > 0 ? Math.round(kCor / kTot * 100) : 0;

    const ssKT = document.getElementById('ss-kelime-total');
    const ssKC = document.getElementById('ss-kelime-cor');
    const ssKP = document.getElementById('ss-kelime-pct');
    const ssKF = document.getElementById('ss-kelime-fill');
    if (ssKT) ssKT.textContent = kTot;
    if (ssKC) ssKC.textContent = kCor + ' doğru';
    if (ssKP) {
        ssKP.textContent = kTot > 0 ? kPct + '%' : '';
        ssKP.style.color = kPct >= 70 ? '#16a34a' : kPct >= 40 ? '#f59e0b' : '#dc2626';
    }
    if (ssKF) ssKF.style.width = kPct + '%';

    // ── AI YDT denemesi ────────────────────────────────────
    const aiTot = parseInt(localStorage.getItem('ydtai_tot') || '0');
    const aiCor = parseInt(localStorage.getItem('ydtai_cor') || '0');
    const aiPct = aiTot > 0 ? Math.round(aiCor / aiTot * 100) : 0;

    const ssAT = document.getElementById('ss-ai-total');
    const ssAC = document.getElementById('ss-ai-cor');
    const ssAP = document.getElementById('ss-ai-pct');
    const ssAF = document.getElementById('ss-ai-fill');
    if (ssAT) ssAT.textContent = aiTot;
    if (ssAC) ssAC.textContent = aiCor + ' doğru';
    if (ssAP) {
        ssAP.textContent = aiTot > 0 ? aiPct + '%' : '';
        ssAP.style.color = aiPct >= 70 ? '#16a34a' : aiPct >= 40 ? '#f59e0b' : '#dc2626';
    }
    if (ssAF) ssAF.style.width = aiPct + '%';

    // ── Paragraf soruları ──────────────────────────────────
    const pSorular = window.paragrafSorular || {};
    const paraPassages = Object.keys(pSorular).length;
    const paraTot  = Object.values(pSorular).reduce((s, v) => s + (v.questions || []).length, 0);
    const ssPT = document.getElementById('ss-para-total');
    const ssPCor = document.getElementById('ss-para-cor');
    const ssPP = document.getElementById('ss-para-pct');
    const ssPF = document.getElementById('ss-para-fill');
    if (ssPT) ssPT.textContent = paraTot > 0 ? paraTot + ' soru' : '0 soru';
    if (ssPCor) ssPCor.textContent = paraPassages + ' pasaj';
    if (ssPP) ssPP.textContent = '';
    if (ssPF) ssPF.style.width = Math.min(100, paraTot / 2) + '%'; // görsel doluluk

    // ── Grammar soruları (aiGramerArsiv) ──────────────────
    const gramArsiv = window.aiGramerArsiv || [];
    const gramTot   = gramArsiv.length;
    // Grammar skor özeti — localStorage'dan (her modül saveGrammarScore ile yazar)
    const gramScores = JSON.parse(localStorage.getItem('ydt_grammar_scores') || '{}');
    const gramTamamlanan = Object.values(gramScores).filter(v => v > 0).length;
    // Toplam max soru = GRAMMAR_MODULES toplamı
    const gramMaxSoru = typeof GRAMMAR_MODULES !== 'undefined'
        ? GRAMMAR_MODULES.reduce((s, m) => s + m.total, 0) : 741;

    const ssGT = document.getElementById('ss-gram-total');
    const ssGCor = document.getElementById('ss-gram-cor');
    const ssGP = document.getElementById('ss-gram-pct');
    const ssGF = document.getElementById('ss-gram-fill');
    if (ssGT) ssGT.textContent = gramMaxSoru + ' soru';
    if (ssGCor) ssGCor.textContent = gramTamamlanan + '/11 konu';
    if (ssGP) {
        ssGP.textContent = gramTamamlanan > 0 ? Math.round(gramTamamlanan / 11 * 100) + '%' : '';
        ssGP.style.color = '#10b981';
    }
    if (ssGF) ssGF.style.width = Math.round(gramTamamlanan / 11 * 100) + '%';
}


function renderBankStats() {
    const el = document.getElementById('idx-bank-stats');
    if (!el) return;

    // Kelime soruları
    const kelimeArsiv  = window.aiArsiv || [];
    const kelimeToplam = kelimeArsiv.length;
    const kelimeDogru  = kelimeArsiv.filter(e => e.isCorrect).length;
    const kelimeYanlis = kelimeArsiv.filter(e => e.isCorrect === false).length;
    const kelimePct    = kelimeToplam > 0 ? Math.round(kelimeDogru / kelimeToplam * 100) : 0;

    // Paragraf soruları
    const pSorular     = window.paragrafSorular || {};
    const paraToplam   = Object.values(pSorular).reduce((s, v) => s + (v.questions || []).length, 0);

    // Gramer soruları
    const gramToplam   = (window.aiGramerArsiv || []).length;

    // AI YDT istatistikleri
    const aiTot = parseInt(localStorage.getItem('ydtai_tot') || '0');
    const aiCor = parseInt(localStorage.getItem('ydtai_cor') || '0');
    const aiPct = aiTot > 0 ? Math.round(aiCor / aiTot * 100) : 0;

    const rows = [
        {
            icon: '📝', label: 'Kelime Soruları',
            total: kelimeToplam, correct: kelimeDogru, wrong: kelimeYanlis,
            pct: kelimePct, color: '#6366f1',
            onclick: "showAIArsiv()"
        },
        {
            icon: '🤖', label: 'AI Vocabulary Test',
            total: aiTot, correct: aiCor, wrong: aiTot - aiCor,
            pct: aiPct, color: '#e63946',
            onclick: "startAIQuizMode()"
        },
        {
            icon: '📄', label: 'Paragraf Soruları',
            total: paraToplam, correct: null, wrong: null,
            pct: null, color: '#0ea5e9',
            onclick: "showParagrafListesi()"
        },
        {
            icon: '📐', label: 'Gramer Soruları',
            total: gramToplam, correct: null, wrong: null,
            pct: null, color: '#10b981',
            onclick: "showAIArsiv()"
        }
    ];

    el.innerHTML = rows.map(r => {
        const hasStats = r.correct !== null && r.total > 0;
        const barHtml = hasStats
            ? `<div class="idx-bank-bar-wrap"><div class="idx-bank-bar" style="width:${r.pct}%;background:${r.color};"></div></div>`
            : '';
        const metaHtml = hasStats
            ? `<span class="idx-bank-cor">✅ ${r.correct}</span><span class="idx-bank-wrg">❌ ${r.wrong}</span><span class="idx-bank-pct" style="color:${r.color};">${r.pct}%</span>`
            : `<span class="idx-bank-total-lbl">${r.total} soru</span>`;
        return `
        <div class="idx-bank-row" onclick="${r.onclick}">
            <div class="idx-bank-icon" style="background:${r.color}18;color:${r.color};">${r.icon}</div>
            <div class="idx-bank-body">
                <div class="idx-bank-label">${r.label}</div>
                <div class="idx-bank-meta">${metaHtml}</div>
                ${barHtml}
            </div>
            <div class="idx-bank-count" style="color:${r.color};">${r.total}</div>
        </div>`;
    }).join('');
}

// ════════════════════════════════════════════════════════════
// 📐 GRAMMAR MODÜL TAMAMLANMA DURUMU (index.html)
// ════════════════════════════════════════════════════════════
const GRAMMAR_MODULES = [
    { key: 'gr',  label: 'Tenses',              icon: '⏱️',  color: '#6366f1', total: 230, fn: "openGrammarSection('overview')" },
    { key: 'md',  label: 'Modals',              icon: '⚡',  color: '#f59e0b', total: 170, fn: "openModalsSection('overview')" },
    { key: 'pr',  label: 'Pronouns',            icon: '👤',  color: '#8b5cf6', total: 13,  fn: "openPronounsSection('overview')" },
    { key: 'pa',  label: 'Passive',             icon: '🔄',  color: '#0ea5e9', total: 200, fn: "openPassiveSection('overview')" },
    { key: 'cn',  label: 'Conditionals',        icon: '🔀',  color: '#10b981', total: 160, fn: "openConditionalsSection('overview')" },
    { key: 'rc',  label: 'Relative Clauses',    icon: '🔗',  color: '#e63946', total: 15,  fn: "openRelativeSection('overview')" },
    { key: 'nc',  label: 'Noun Clauses',        icon: '💬',  color: '#f97316', total: 150, fn: "openNounSection('overview')" },
    { key: 'cj',  label: 'Adverbial Clauses',   icon: '🌿',  color: '#14b8a6', total: 18,  fn: "openConjSection('overview')" },
    { key: 'grd', label: 'Gerunds',             icon: '📝',  color: '#a855f7', total: 150,  fn: "openGerundSection('overview')" },
    { key: 'aa',  label: 'Adj & Adv',           icon: '🔵',  color: '#3b82f6', total: 18,  fn: "openAdjAdvSection('overview')" },
    { key: 'tq',  label: 'Tag Q & Quantifiers', icon: '❓',  color: '#ec4899', total: 18,  fn: "openTagQuantSection('overview')" },
]; // Toplam: 1010 soru

function renderGrammarProgress() {
    const el = document.getElementById('idx-grammar-progress');
    if (!el) return;

    // Her modülün localStorage'dan kaydedilmiş skorunu oku
    // grammar.js skorları oturum bazlı; kalıcı için ayrı key sakla
    const saved = JSON.parse(localStorage.getItem('ydt_grammar_scores') || '{}');

    el.innerHTML = GRAMMAR_MODULES.map(m => {
        const score  = saved[m.key] || 0;
        const pct    = Math.round(score / m.total * 100);
        const done   = score >= m.total;
        const started = score > 0;
        const statusIcon = done ? '✅' : started ? '🔄' : '○';
        return `
        <div class="idx-gr-row" onclick="${m.fn}" title="${m.label} — ${score}/${m.total}">
            <div class="idx-gr-icon" style="background:${m.color}18;color:${m.color};">${m.icon}</div>
            <div class="idx-gr-body">
                <div class="idx-gr-top">
                    <span class="idx-gr-label">${m.label}</span>
                    <span class="idx-gr-score" style="color:${m.color};">${score}<span class="idx-gr-total">/${m.total}</span></span>
                </div>
                <div class="idx-gr-bar-wrap">
                    <div class="idx-gr-bar" style="width:${pct}%;background:${m.color};"></div>
                </div>
            </div>
            <div class="idx-gr-status">${statusIcon}</div>
        </div>`;
    }).join('');
}

// Grammar modülleri skor kaydetme — her grammar modülü bunu çağırır
function saveGrammarScore(moduleKey, score) {
    const saved = JSON.parse(localStorage.getItem('ydt_grammar_scores') || '{}');
    // Sadece en yüksek skoru sakla
    if ((saved[moduleKey] || 0) < score) {
        saved[moduleKey] = score;
        localStorage.setItem('ydt_grammar_scores', JSON.stringify(saved));
    }
    renderGrammarProgress();
}

// ════════════════════════════════════════════════════════════
// 🧠 SM-2 TEKRAR PLANI (index.html)
// ════════════════════════════════════════════════════════════
function renderSM2Plan() {
    const el = document.getElementById('idx-sm2-plan');
    if (!el) return;

    const now = Date.now();
    const today    = new Date(); today.setHours(23,59,59,999);
    const todayEnd = today.getTime();
    const weekEnd  = todayEnd + 6 * 86400000;

    let todayDue = 0, weekDue = 0, totalSM2 = 0;
    const listBreakdown = [];

    Object.entries(allData).forEach(([listName, list]) => {
        let listToday = 0, listWeek = 0;
        list.forEach(w => {
            if (w.sm2_next) {
                totalSM2++;
                if (w.sm2_next <= todayEnd)  { todayDue++;  listToday++; }
                else if (w.sm2_next <= weekEnd) { weekDue++;   listWeek++; }
            }
        });
        if (listToday > 0 || listWeek > 0) {
            listBreakdown.push({ name: listName, today: listToday, week: listWeek });
        }
    });

    // Tüm kelimelerin SM-2'ye girmemiş olanlar
    const allWords = Object.values(allData).flat();
    const notStarted = allWords.filter(w => !w.sm2_next).length;

    if (totalSM2 === 0 && notStarted === 0) {
        el.innerHTML = '<div class="idx-sm2-empty">Henüz SM-2 verisi yok.<br><small>Test veya SM-2 modunda çalışınca görünür.</small></div>';
        return;
    }

    const urgentColor   = todayDue > 10 ? '#e63946' : todayDue > 0 ? '#f59e0b' : '#10b981';
    const urgentLabel   = todayDue > 0 ? `🔴 ${todayDue} kelime bugün süresi doldu!` : '✅ Bugün tekrar yok';

    el.innerHTML = `
    <div class="idx-sm2-summary">
        <div class="idx-sm2-urgent" style="border-color:${urgentColor};background:${urgentColor}12;" onclick="startSM2Review()">
            <span class="idx-sm2-urgent-num" style="color:${urgentColor};">${todayDue}</span>
            <div>
                <div class="idx-sm2-urgent-lbl">Bugün Tekrar Et</div>
                <div class="idx-sm2-urgent-sub">${urgentLabel}</div>
            </div>
            ${todayDue > 0 ? '<span class="idx-sm2-urgent-arrow">→</span>' : ''}
        </div>
        <div class="idx-sm2-row-stats">
            <div class="idx-sm2-mini">
                <span class="idx-sm2-mini-num">${weekDue}</span>
                <span class="idx-sm2-mini-lbl">Bu hafta</span>
            </div>
            <div class="idx-sm2-mini">
                <span class="idx-sm2-mini-num">${totalSM2}</span>
                <span class="idx-sm2-mini-lbl">SM-2'de</span>
            </div>
            <div class="idx-sm2-mini">
                <span class="idx-sm2-mini-num" style="color:#aaa;">${notStarted}</span>
                <span class="idx-sm2-mini-lbl">Başlanmadı</span>
            </div>
        </div>
        ${listBreakdown.length > 0 ? `
        <div class="idx-sm2-breakdown">
            ${listBreakdown.slice(0,4).map(l => `
            <div class="idx-sm2-list-row">
                <span class="idx-sm2-list-name">${l.name}</span>
                <span class="idx-sm2-list-badges">
                    ${l.today > 0 ? `<span class="idx-sm2-badge idx-sm2-badge-red">${l.today} bugün</span>` : ''}
                    ${l.week > 0  ? `<span class="idx-sm2-badge idx-sm2-badge-yellow">${l.week} hafta</span>` : ''}
                </span>
            </div>`).join('')}
        </div>` : ''}
    </div>`;
}


function createNewList() {
    const n = document.getElementById('new-list-name').value.trim();
    if (!n || allData[n]) return;
    allData[n] = [];
    window._saveData && window._saveData();
    updateSelectors();
    document.getElementById('new-list-name').value = '';
}

function loadListToTextarea() {
    const s = document.getElementById('edit-list-selector').value;
    if (s) document.getElementById('bulk-input').value =
        allData[s].map(w => `${w.eng}:${w.tr}:${w.mnemonic || ''}:${w.story || ''}`).join('\n');
}

function saveCurrentList() {
    const s     = document.getElementById('edit-list-selector').value;
    const lines = document.getElementById('bulk-input').value.trim().split('\n');
    allData[s]  = lines.map(l => {
        const p = l.split(':');
        return p.length >= 2
            ? { eng: p[0].trim(), tr: p[1].trim(), mnemonic: p[2]?.trim(), story: p[3]?.trim(), errorCount: 0, correctStreak: 0 }
            : null;
    }).filter(x => x);
    localStorage.setItem('ydt_all_data', JSON.stringify(allData));
    window._saveData && window._saveData();
    showAIToast('✅ Liste kaydedildi', 'info', 2000);
}

function deleteList() {
    const s = document.getElementById('edit-list-selector').value;
    if (Object.keys(allData).length > 1 && confirm("Silinsin mi?")) {
        delete allData[s];
        window._saveData && window._saveData();
        updateSelectors();
    }
}

function renameList() {
    const sel     = document.getElementById('edit-list-selector');
    const oldName = sel.value;
    const newName = (document.getElementById('rename-list-input').value || '').trim();
    if (!newName)           return alert('Yeni isim boş olamaz!');
    if (newName === oldName) return alert('İsim aynı!');
    if (allData[newName])   return alert('Bu isimde liste zaten var!');
    allData[newName] = allData[oldName];
    delete allData[oldName];
    document.getElementById('rename-list-input').value = '';
    window._saveData && window._saveData();
    updateSelectors();
    document.getElementById('edit-list-selector').value = newName;
    loadListToTextarea();
}

function forceSyncNow() {
    if (window._saveData) {
        window._saveData();
        setTimeout(() => alert("Senkronizasyon tamamlandı ✓"), 1200);
    } else {
        alert("Firebase henüz hazır değil, lütfen bekleyin.");
    }
}

// ══════════════════════════════════════════════
// SESLİ TELAFFUZ
// ══════════════════════════════════════════════
function speakWord(word) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u   = new SpeechSynthesisUtterance(word);
    u.lang    = 'en-US';
    u.rate    = 0.85;
    window.speechSynthesis.speak(u);
}

// ══════════════════════════════════════════════
// GÜNLÜK HEDEF
// ══════════════════════════════════════════════
const DAILY_GOAL = 40;

function getDailyCount() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('ydt_daily') || '{}');
    return saved.date === today ? (saved.count || 0) : 0;
}

function incrementDailyCount() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('ydt_daily') || '{}');
    const count = (saved.date === today ? (saved.count || 0) : 0) + 1;
    localStorage.setItem('ydt_daily', JSON.stringify({ date: today, count }));
    updateDailyGoalBar();
    if (count === DAILY_GOAL) setTimeout(fireConfetti, 300);
}

// ── 7 Günlük Performans Geçmişi ──────────────────────
// Format: { "Mon Jun 09 2025": { correct: 12, wrong: 4 }, ... }
function recordDailyPerf(isCorrect) {
    const today = new Date().toDateString();
    const hist  = JSON.parse(localStorage.getItem('ydt_perf_hist') || '{}');
    if (!hist[today]) hist[today] = { correct: 0, wrong: 0 };
    if (isCorrect) hist[today].correct++;
    else           hist[today].wrong++;
    // Sadece son 14 günü sakla
    const keys = Object.keys(hist).sort((a,b) => new Date(a)-new Date(b));
    if (keys.length > 14) keys.slice(0, keys.length-14).forEach(k => delete hist[k]);
    localStorage.setItem('ydt_perf_hist', JSON.stringify(hist));
}

function updateDailyGoalBar() {
    const count = getDailyCount();
    const pct   = Math.min(100, Math.round(count / DAILY_GOAL * 100));
    const fill  = document.getElementById('daily-goal-fill');
    const txt   = document.getElementById('daily-goal-text');
    if (fill) { fill.style.width = pct + '%'; fill.style.background = pct >= 100 ? '#22c55e' : 'var(--red)'; }
    if (txt)  txt.innerText = count + ' / ' + DAILY_GOAL;
}

function fireConfetti() {
    const colors = ['#e63946', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < 60; i++) {
        const p            = document.createElement('div');
        p.className        = 'confetti-piece';
        p.style.left       = Math.random() * 100 + 'vw';
        p.style.top        = '-10px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        p.style.animationDelay   = (Math.random() * 0.5) + 's';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 4000);
    }
}

// ══════════════════════════════════════════════
// SM-2 SPACED REPETITION
// ══════════════════════════════════════════════
function sm2_update(word, rating) {
    let ef       = word.sm2_ef       || 2.5;
    let interval = word.sm2_interval || 1;
    if (rating < 3) {
        interval = 1;
    } else {
        if (interval === 1)      interval = 3;
        else if (interval === 3) interval = 7;
        else                     interval = Math.round(interval * ef);
        ef = Math.max(1.3, ef + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    }
    word.sm2_ef       = Math.round(ef * 100) / 100;
    word.sm2_interval = interval;
    word.sm2_next     = Date.now() + interval * 86400000;
}

function countSM2Due() {
    const now = Date.now();
    let count = 0;
    Object.values(allData).forEach(list => list.forEach(w => {
        if (!w.sm2_next || w.sm2_next <= now) count++;
    }));
    return count;
}

function getSM2DueWords() {
    // Her zaman güncel user-scoped allData oku
    if (typeof getUserKey === 'function') {
        const raw = localStorage.getItem(getUserKey('all_data'));
        if (raw) { try { allData = JSON.parse(raw); } catch(e) {} }
    }
    const now   = Date.now();
    let words   = [];
    Object.values(allData).forEach(list => list.forEach(w => {
        if (!w.sm2_next || w.sm2_next <= now) words.push(w);
    }));
    return words.sort(() => Math.random() - 0.5);
}

function getNextSM2DateStr() {
    let minNext = Infinity;
    Object.values(allData).forEach(list => list.forEach(w => {
        if (w.sm2_next && w.sm2_next > Date.now()) minNext = Math.min(minNext, w.sm2_next);
    }));
    return minNext === Infinity ? '—' : new Date(minNext).toLocaleDateString('tr-TR');
}

let sm2Pool = [], sm2Idx = 0, sm2Known = 0, sm2Hard = 0, sm2Forgot = 0, sm2Streak = 0;

function _srUpdate() {
    const total = sm2Known + sm2Hard + sm2Forgot;
    const acc   = total ? Math.round(sm2Known / total * 100) : 0;
    const q = id => document.getElementById(id);
    const s = (id,v) => { const e=q(id); if(e) e.textContent=v; };
    s('sr-streak-num', sm2Streak);
    s('sr-known',   sm2Known);
    s('sr-hard',    sm2Hard);
    s('sr-forgot',  sm2Forgot);
    s('sr-accuracy', total ? acc + '%' : '—');
    const fill = q('sr-prog-fill');
    if (fill && sm2Pool.length) fill.style.width = (sm2Idx / sm2Pool.length * 100) + '%';
}
const _SR_MOTS = [
    ['🧠','Beyin antrenmanı devam ediyor!'],
    ['💡','Kalıcı öğrenmenin yolu tekrar!'],
    ['🎯','Her tekrar bir adım öne!'],
    ['⚡','SM-2 seni günlük tutuyor!'],
    ['🏆','Şampiyonlar böyle çalışır!'],
];
function _srMotivation() {
    const m = sm2Streak >= 4
        ? ['🔥', sm2Streak + ' üst üste bildin! Harika!']
        : _SR_MOTS[Math.floor(Math.random() * _SR_MOTS.length)];
    const e1 = document.getElementById('sr-mot-icon');
    const e2 = document.getElementById('sr-mot-text');
    if(e1) e1.textContent = m[0];
    if(e2) e2.textContent = m[1];
}
function startSM2Review() {
    sm2Pool = getSM2DueWords();
    if (sm2Pool.length === 0) {
        _showAppToast('Bugün tekrar edilecek kelime yok! 🎉 En erken: ' + getNextSM2DateStr()); return;
    }
    sm2Idx = 0; sm2Known = 0; sm2Hard = 0; sm2Forgot = 0; sm2Streak = 0;
    startModule();
    const old = document.querySelector('.sm2-done-btn');
    if (old) old.remove();
    showPage('sm2-page');
    _srUpdate(); _srMotivation();
    loadSM2Q();
}

function loadSM2Q() {
    const w = sm2Pool[sm2Idx];
    document.getElementById('sm2-word').innerText             = w.eng;
    document.getElementById('sm2-mnemonic').innerText         = w.mnemonic ? '💡 ' + w.mnemonic : '';
    document.getElementById('sm2-progress').innerText         = (sm2Idx + 1) + ' / ' + sm2Pool.length;
    const sshow = document.getElementById('sm2-show-btn');
    if(sshow) sshow.style.display = '';
    const sfront = document.getElementById('sr-front');
    if(sfront) sfront.style.display = '';
    const sans = document.getElementById('sm2-answer-section');
    if(sans) sans.style.display = 'none';
    const sans2 = document.getElementById('sm2-answer');
    if(sans2) sans2.textContent = w.tr;
    _srUpdate(); _srMotivation();
}

function showSM2Answer() {
    const word = document.getElementById('sm2-word').innerText;
    const w2   = document.getElementById('sm2-word-2');
    if (w2) w2.innerText = word;
    document.getElementById('sr-front').style.display           = 'none';
    document.getElementById('sm2-answer-section').style.display = 'flex';
}

function rateSM2(rating) {
    const w = sm2Pool[sm2Idx];
    sm2_update(w, rating);
    if (rating >= 3) {
        stats.correctAnswers++; incrementDailyCount(); recordDailyPerf(true);
        if (rating === 5) { sm2Known++; sm2Streak++; }
        else              { sm2Known++; sm2Streak++; }
    } else if (rating === 2) {
        sm2Hard++; sm2Streak = 0; recordDailyPerf(false);
    } else {
        sm2Forgot++; sm2Streak = 0; recordDailyPerf(false);
    }
    stats.totalAnswers++;
    window._saveData && window._saveData();
    sm2Idx++;
    _srUpdate();
    if (sm2Idx >= sm2Pool.length) {
        const q = id => document.getElementById(id);
        const s = (id,v) => { const e=q(id); if(e) e.textContent=v; };
        s('sm2-word','🎉 Tebrikler!');
        s('sm2-mnemonic', sm2Pool.length + ' kelime tekrar edildi.');
        const sb = q('sm2-show-btn'); if(sb) sb.style.display='none';
        const sa = q('sm2-answer-section'); if(sa) sa.style.display='none';
        const fill = q('sr-prog-fill'); if(fill) fill.style.width='100%';
        const btn        = document.createElement('button');
        btn.className    = 'sr-reveal-btn sm2-done-btn';
        btn.style.cssText= 'margin:16px 28px; width:calc(100% - 56px);';
        btn.textContent  = '← Menüye Dön';
        btn.onclick      = exitSM2;
        q('sm2-page').appendChild(btn);
        const e2 = q('sr-mot-text'); if(e2) e2.textContent='Muhteşem! Tüm kelimeleri bitirdin! 🏆';
        return;
    }
    loadSM2Q();
}

function exitSM2() {
    const old = document.querySelector('.sm2-done-btn');
    if (old) old.remove();
    exitModule();
}

// ══════════════════════════════════════════════
// YAZARAK CEVAP MODU
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// YAZARAK CEVAP — YENİ MOTOR
// Soru tipleri: 'full' | 'letters' | 'context'
// ══════════════════════════════════════════════════════

const TW_MOTIVATIONS = [
    ['💪','Harika gidiyorsun, devam et!'],
    ['🔥','Seri yakalıyorsun!'],
    ['🎯','Tam odaklanmışsın!'],
    ['⚡','Hız ve doğruluk — ikisi bir arada!'],
    ['🧠','Beyin kasları çalışıyor!'],
    ['🏆','Şampiyonlar böyle çalışır!'],
    ['🌟','Her doğru bir adım daha ileri!'],
    ['🚀','YDT yolculuğun burada şekilleniyor!'],
    ['🎓','Kalıcı öğrenmenin sırrı tekrar!'],
    ['💡','Göz kamaştırıyorsun!'],
];

let twPool = [], twIdx = 0, twScore = 0, twAnswered = false;
let twStreak = 0, twCorrectCount = 0, twWrongCount = 0;
let twCurrentMode = 'full'; // 'full' | 'letters' | 'context'

function _twPickMode(word) {
    const hasStory = word.story && word.story.trim().length > 5;
    const modes = ['full', 'letters'];
    if (hasStory) modes.push('context');
    // Ağırlıklı seçim: %40 full, %35 letters, %25 context
    const weights = { full: 40, letters: 35, context: 25 };
    let pool = [];
    modes.forEach(m => { for (let i = 0; i < (weights[m]||10); i++) pool.push(m); });
    return pool[Math.floor(Math.random() * pool.length)];
}

function startTypingQuiz() {
    // Her zaman güncel user-scoped allData oku
    if (typeof getUserKey === 'function') {
        const raw = localStorage.getItem(getUserKey('all_data'));
        if (raw) { try { allData = JSON.parse(raw); } catch(e) {} }
    }
    const sel = document.getElementById('exercise-list-selector');
    const mainSel = document.getElementById('list-selector');
    const listName = (sel && sel.value) || (mainSel && mainSel.value) || Object.keys(allData)[0];
    if (!listName || !allData[listName] || !allData[listName].length) {
        _showAppToast('Önce bir kelime listesi ekleyin veya seçin.'); return;
    }
    currentActiveList = listName;
    twPool         = [...allData[listName]].sort(() => Math.random() - 0.5);
    twIdx          = 0;
    twScore        = 0;
    twStreak       = 0;
    twCorrectCount = 0;
    twWrongCount   = 0;
    startModule();
    showPage('typing-page');
    _twUpdateStats();
    _twLoadQ();
}

function _twLoadQ() {
    if (twIdx >= twPool.length) { _twFinish(); return; }
    twAnswered = false;
    const w    = twPool[twIdx];
    twCurrentMode = _twPickMode(w);

    // Progress
    const pct = twPool.length ? (twIdx / twPool.length * 100) : 0;
    document.getElementById('tw-progress-fill').style.width = pct + '%';
    document.getElementById('tw-q-num').textContent   = twIdx + 1;
    document.getElementById('tw-q-total').textContent = twPool.length;

    // Kelime
    document.getElementById('tw-word-text').textContent = w.eng;

    // İpucu satırı
    const hintEl = document.getElementById('tw-hint-line');
    hintEl.textContent = w.mnemonic ? '💡 ' + w.mnemonic : 'Türkçe anlamını yazın';

    // Soru tipi rozeti
    const modes = {
        full:    { icon: '✍️', label: 'Tam Çeviri' },
        letters: { icon: '🔡', label: 'Harfli İpucu' },
        context: { icon: '📖', label: 'Bağlam Cümlesi' }
    };
    document.getElementById('tw-qtype-icon').textContent  = modes[twCurrentMode].icon;
    document.getElementById('tw-qtype-label').textContent = modes[twCurrentMode].label;

    // Context & letter hint göster/gizle
    const ctxWrap    = document.getElementById('tw-context-wrap');
    const letWrap    = document.getElementById('tw-letter-hint-wrap');
    ctxWrap.style.display = 'none';
    letWrap.style.display = 'none';

    if (twCurrentMode === 'context' && w.story) {
        const story = w.story.replace(new RegExp('\\b' + w.eng + '\\b', 'gi'),
            '<span class="tw-context-blank">_____</span>');
        document.getElementById('tw-context-text').innerHTML = story;
        ctxWrap.style.display = '';
    } else if (twCurrentMode === 'letters') {
        _twBuildLetterHint(w.tr);
        letWrap.style.display = '';
    }

    // Input sıfırla
    const inp = document.getElementById('tw-input');
    inp.value = '';
    inp.disabled = false;

    // Feedback & chars temizle
    const fb = document.getElementById('tw-feedback');
    fb.className = 'tw-feedback'; fb.innerHTML = '';
    document.getElementById('tw-chars').innerHTML = '';

    // Butonlar
    document.getElementById('tw-btn-check').style.display = '';
    document.getElementById('tw-submit-btn').style.display = '';
    document.getElementById('tw-btn-next').style.display  = 'none';
    document.getElementById('tw-btn-skip').style.display  = '';

    // Motivasyon
    _twSetMotivation();

    setTimeout(() => inp.focus(), 80);
}

function _twBuildLetterHint(word) {
    const container = document.getElementById('tw-letter-boxes');
    container.innerHTML = '';
    // Yaklaşık %40 harfi göster, geri kalanı gizle
    const indices = [...Array(word.length).keys()];
    const revealCount = Math.max(1, Math.floor(word.length * 0.4));
    const toReveal = new Set();
    // İlk ve son harfi her zaman göster
    toReveal.add(0);
    if (word.length > 1) toReveal.add(word.length - 1);
    while (toReveal.size < Math.min(revealCount, word.length)) {
        toReveal.add(Math.floor(Math.random() * word.length));
    }
    word.split('').forEach((ch, i) => {
        const box = document.createElement('div');
        if (ch === ' ') {
            box.className = 'tw-letter-box'; box.style.width = '20px';
            box.style.background = 'transparent'; box.style.borderColor = 'transparent';
        } else if (toReveal.has(i)) {
            box.className = 'tw-letter-box revealed'; box.textContent = ch.toUpperCase();
        } else {
            box.className = 'tw-letter-box hidden-letter'; box.textContent = ch;
        }
        container.appendChild(box);
    });
}

function _twSetMotivation() {
    const total = twCorrectCount + twWrongCount;
    let mot;
    if (total === 0) mot = ['🎯', 'Hazır mısın? Hadi başlayalım!'];
    else if (twStreak >= 5) mot = ['🔥', twStreak + ' üst üste doğru! Muhteşem seri!'];
    else if (twStreak >= 3) mot = ['⚡', 'Harika! ' + twStreak + ' seri devam ediyor!'];
    else {
        const accuracy = total ? Math.round(twCorrectCount / total * 100) : 0;
        if (accuracy >= 90) mot = ['🏆', 'İnanılmaz! %' + accuracy + ' başarı oranı!'];
        else if (accuracy >= 70) mot = ['💪', 'Güzel gidiyorsun, %' + accuracy + ' doğruluk!'];
        else mot = TW_MOTIVATIONS[Math.floor(Math.random() * TW_MOTIVATIONS.length)];
    }
    document.getElementById('tw-mot-emoji').textContent = mot[0];
    document.getElementById('tw-mot-text').textContent  = mot[1];
}

function _twUpdateStats() {
    document.getElementById('tw-score').textContent    = twScore;
    document.getElementById('tw-streak').textContent   = twStreak;
    document.getElementById('tw-correct').textContent  = twCorrectCount;
    document.getElementById('tw-wrong').textContent    = twWrongCount;
    const total = twCorrectCount + twWrongCount;
    document.getElementById('tw-accuracy').textContent = total ? Math.round(twCorrectCount/total*100) + '%' : '—';
}

function twCheck() {
    if (twAnswered) return;
    twAnswered = true;
    const w      = twPool[twIdx];
    const typed  = document.getElementById('tw-input').value.trim().toLowerCase();
    const target = w.tr.trim().toLowerCase();
    document.getElementById('tw-input').disabled = true;
    document.getElementById('tw-btn-check').style.display = 'none';
    document.getElementById('tw-submit-btn').style.display = 'none';
    document.getElementById('tw-btn-skip').style.display = 'none';

    // Harf karşılaştırması
    const charsDiv = document.getElementById('tw-chars');
    charsDiv.innerHTML = '';
    const maxLen = Math.max(typed.length, target.length);
    for (let i = 0; i < maxLen; i++) {
        const span = document.createElement('span');
        if (i >= typed.length)           { span.className = 'tw-c-mis'; span.textContent = target[i]; }
        else if (i >= target.length)     { span.className = 'tw-c-bad'; span.textContent = typed[i]; }
        else if (typed[i] === target[i]) { span.className = 'tw-c-ok';  span.textContent = typed[i]; }
        else                             { span.className = 'tw-c-bad'; span.textContent = typed[i]; }
        charsDiv.appendChild(span);
    }

    const perfect = typed === target;
    const fb = document.getElementById('tw-feedback');

    if (perfect) {
        const bonus = twStreak >= 4 ? 5 : twStreak >= 2 ? 2 : 0;
        const pts   = 10 + bonus;
        twScore        += pts;
        twStreak++;
        twCorrectCount++;
        w.correctStreak = (w.correctStreak || 0) + 1;
        w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
        fb.className = 'tw-feedback correct';
        fb.innerHTML = '✅ Doğru!' + (bonus ? ' <strong>+' + pts + ' puan</strong> (seri bonusu 🔥)' : ' <strong>+10 puan</strong>');
        incrementDailyCount();
        // Skor pop animasyonu
        const scoreEl = document.getElementById('tw-score');
        scoreEl.classList.remove('tw-score-pop');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('tw-score-pop');
    } else {
        twStreak = 0;
        twWrongCount++;
        w.errorCount    = (w.errorCount || 0) + 1;
        w.correctStreak = 0;
        fb.className = 'tw-feedback wrong';
        fb.innerHTML = '❌ Doğrusu: <strong>' + w.tr + '</strong>';
    }

    stats.totalAnswers++;
    if (perfect) stats.correctAnswers++;
    window._saveData && window._saveData();
    _twUpdateStats();
    document.getElementById('tw-btn-next').style.display = '';
}

function twNext() {
    twIdx++;
    _twLoadQ();
}

function twSkip() {
    if (twAnswered) { twNext(); return; }
    twAnswered = true;
    twStreak = 0;
    const w = twPool[twIdx];
    const fb = document.getElementById('tw-feedback');
    fb.className = 'tw-feedback wrong';
    fb.innerHTML = '⏭️ Geçildi. Doğrusu: <strong>' + w.tr + '</strong>';
    document.getElementById('tw-btn-check').style.display = 'none';
    document.getElementById('tw-submit-btn').style.display = 'none';
    document.getElementById('tw-btn-skip').style.display = 'none';
    document.getElementById('tw-btn-next').style.display = '';
    document.getElementById('tw-input').disabled = true;
    twWrongCount++;
    _twUpdateStats();
    _twSetMotivation();
}

function _twFinish() {
    const total    = twCorrectCount + twWrongCount;
    const accuracy = total ? Math.round(twCorrectCount / total * 100) : 0;
    const maxScore = twPool.length * 10;
    const fb = document.getElementById('tw-feedback');
    fb.className = 'tw-feedback correct';
    fb.innerHTML = '🏁 <strong>Bitti!</strong> ' + twScore + '/' + maxScore + ' puan · %' + accuracy + ' doğruluk';
    document.getElementById('tw-btn-next').style.display = 'none';
    document.getElementById('tw-btn-check').style.display = 'none';
    document.getElementById('tw-submit-btn').style.display = 'none';
    document.getElementById('tw-btn-skip').style.display = 'none';
    const exitBtn = document.getElementById('tw-btn-next');
    exitBtn.textContent = '← Menüye Dön';
    exitBtn.style.display = '';
    exitBtn.onclick = () => { exitModule(); showExercisePage(); };
    document.getElementById('tw-progress-fill').style.width = '100%';
    document.getElementById('tw-mot-emoji').textContent = accuracy >= 80 ? '🏆' : '💪';
    document.getElementById('tw-mot-text').textContent  = accuracy >= 80 ? 'Mükemmel bir seans! Tebrikler!' : 'Harika çalıştın! Bir dahaki sefere daha iyi!';
}

function twSpeak() {
    const word = document.getElementById('tw-word-text').textContent;
    if (word && word !== '—') speakWord(word);
}

function twToggleHelp() {
    const panel = document.getElementById('tw-help-panel');
    panel.style.display = panel.style.display === 'none' ? '' : 'none';
}

function exitTyping() {
    exitModule();
}

// compat aliases (eski ID referansları için)
const loadTypingQ  = () => _twLoadQ();
const checkTyping  = () => twCheck();
const nextTypingQ  = () => twNext();

// ══════════════════════════════════════════════
// BAĞLAM CÜMLESİ MODU
// ══════════════════════════════════════════════
let ctxPool = [], ctxIdx = 0, ctxTotalScore = 0, ctxAnswered = false, ctxWord = null, ctxCorrect = 0, ctxWrong = 0, ctxStreak = 0;

function _cxUpdate() {
    const total = ctxCorrect + ctxWrong;
    const acc   = total ? Math.round(ctxCorrect / total * 100) : 0;
    const s = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
    s('cx-correct',  ctxCorrect);
    s('cx-wrong',    ctxWrong);
    s('cx-accuracy', total ? acc + '%' : '—');
    s('cx-streak',   ctxStreak);
    s('ctx-score',   ctxTotalScore);
    const fill = document.getElementById('cx-prog-fill');
    if(fill && ctxPool.length) fill.style.width = (ctxIdx / ctxPool.length * 100) + '%';
}
const _CX_MOTS = [
    ['📖','Cümleyi oku, boşluğu doldur!'],
    ['🎯','Bağlamdan anlam çıkar!'],
    ['💡','Gerçek metinlerde kullanım!'],
    ['🔥','Harika gidiyorsun!'],
    ["🧠","YDT'de tam böyle çıkıyor!"],
];
function _cxMotivation() {
    const m = ctxStreak >= 3
        ? ['🔥', ctxStreak + ' üst üste doğru! Seri devam!']
        : _CX_MOTS[Math.floor(Math.random() * _CX_MOTS.length)];
    const e1 = document.getElementById('cx-mot-icon');
    const e2 = document.getElementById('cx-mot-text');
    if(e1) e1.textContent = m[0];
    if(e2) e2.textContent = m[1];
}
function startContextMode() {
    // Her zaman güncel user-scoped allData oku
    if (typeof getUserKey === 'function') {
        const raw = localStorage.getItem(getUserKey('all_data'));
        if (raw) { try { allData = JSON.parse(raw); } catch(e) {} }
    }
    const sel = document.getElementById('exercise-list-selector');
    const mainSel = document.getElementById('list-selector');
    const listName = (sel && sel.value) || (mainSel && mainSel.value) || Object.keys(allData)[0];
    if (!listName || !allData[listName] || !allData[listName].length) {
        _showAppToast('Önce bir kelime listesi ekleyin veya seçin.'); return;
    }
    currentActiveList = listName;
    ctxPool       = [...allData[listName]].sort(() => Math.random() - 0.5);
    ctxIdx        = 0; ctxTotalScore = 0; ctxCorrect = 0; ctxWrong = 0; ctxStreak = 0;
    startModule();
    showPage('context-page');
    _cxUpdate(); _cxMotivation();
    ctxLoadQ();
}

async function ctxLoadQ() {
    ctxAnswered = false;
    ctxWord     = ctxPool[ctxIdx];
    const w     = ctxWord;
    document.getElementById('ctx-progress').innerText        = (ctxIdx + 1) + ' / ' + ctxPool.length;
    document.getElementById('ctx-score').innerText           = ctxTotalScore;
    document.getElementById('ctx-hint').innerText            = w.tr;
    document.getElementById('ctx-input').value               = '';
    document.getElementById('ctx-input').disabled            = false;
    document.getElementById('ctx-input').style.display       = '';
    document.getElementById('ctx-feedback').innerText        = '';
    document.getElementById('ctx-check-btn').style.display   = 'block';
    document.getElementById('ctx-next-btn').style.display    = 'none';
    document.getElementById('ctx-next-btn').onclick          = ctxNext;
    document.getElementById('ctx-regen-btn').disabled        = false;
    _cxUpdate(); _cxMotivation();
    setTimeout(() => document.getElementById('ctx-input').focus(), 80);

    if (w.story && w.story.length > 8 && w.story.toLowerCase().includes(w.eng.toLowerCase())) {
        ctxDisplaySentence(w.story, w.eng);
    } else {
        document.getElementById('ctx-sentence').innerHTML = '<em style="color:var(--ink3);">✨ Cümle üretiliyor...</em>';
        await ctxGenerateSentence(w);
    }
}

function ctxDisplaySentence(sentence, word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re      = new RegExp(escaped, 'gi');
    const blank   = `<span style="display:inline-block;min-width:${Math.max(60, word.length * 9)}px;border-bottom:2.5px solid var(--red);color:transparent;user-select:none;">${'_'.repeat(word.length)}</span>`;
    document.getElementById('ctx-sentence').innerHTML = sentence.replace(re, blank);
}

async function ctxGenerateSentence(w) {
    try {
        const prompt = `Write ONE English sentence (10-16 words) using the word "${w.eng}" (Turkish meaning: ${w.tr}). Academic style, like a YDT exam. Return ONLY the sentence, nothing else.`;
        const sentence = (await aiCall(prompt)).trim();
        if (sentence && sentence.toLowerCase().includes(w.eng.toLowerCase())) {
            w.story = sentence;
            window._saveData && window._saveData();
            ctxDisplaySentence(sentence, w.eng);
        } else {
            const fallback = `The concept of ${w.eng} is essential in academic English.`;
            w.story        = fallback;
            window._saveData && window._saveData();
            ctxDisplaySentence(fallback, w.eng);
        }
    } catch (e) {
        if (e.message !== 'no_api_key') {
            document.getElementById('ctx-sentence').innerHTML =
                `<em style="color:var(--color-danger);">Üretilemedi — internet bağlantısını kontrol et.</em>`;
        }
    }
}

async function ctxRegenSentence() {
    if (!ctxWord) return;
    document.getElementById('ctx-regen-btn').disabled        = true;
    document.getElementById('ctx-sentence').innerHTML        = '<em style="color:var(--ink3);">✨ Yeni cümle üretiliyor...</em>';
    ctxWord.story = '';
    await ctxGenerateSentence(ctxWord);
    document.getElementById('ctx-regen-btn').disabled = false;
}

function ctxCheck() {
    if (ctxAnswered) return;
    ctxAnswered     = true;
    const w         = ctxWord;
    const typed     = document.getElementById('ctx-input').value.trim().toLowerCase();
    const target    = w.eng.trim().toLowerCase();
    document.getElementById('ctx-input').disabled = true;
    const perfect   = typed === target;
    const sentence  = w.story || '';
    const escaped   = w.eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re        = new RegExp(escaped, 'gi');

    if (perfect) {
        ctxTotalScore += 10;
        w.correctStreak = (w.correctStreak || 0) + 1;
        w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
        ctxCorrect++; ctxStreak++;
        const fbOk = document.getElementById('ctx-feedback');
        if(fbOk){ fbOk.textContent='✅ Doğru! +10 puan'; fbOk.className='cx-feedback cx-feedback-ok'; }
        document.getElementById('ctx-sentence').innerHTML =
            sentence.replace(re, `<strong style="color:var(--green);">${w.eng}</strong>`);
        incrementDailyCount();
    } else {
        w.errorCount    = (w.errorCount || 0) + 1;
        w.correctStreak = 0;
        ctxWrong++; ctxStreak = 0;
        const fbErr = document.getElementById('ctx-feedback');
        if(fbErr){ fbErr.innerHTML='❌ Doğrusu: <strong>'+w.eng+'</strong>'; fbErr.className='cx-feedback cx-feedback-err'; }
        document.getElementById('ctx-sentence').innerHTML =
            sentence.replace(re, `<strong style="color:var(--red);">${w.eng}</strong>`);
    }
    stats.totalAnswers++;
    if (perfect) stats.correctAnswers++;
    window._saveData && window._saveData();
    _cxUpdate();
    const cchk = document.getElementById('ctx-check-btn'); if(cchk) cchk.style.display='none';
    const cnxt = document.getElementById('ctx-next-btn'); if(cnxt) cnxt.style.display='';
}

function ctxNext() {
    ctxIdx++;
    if (ctxIdx >= ctxPool.length) {
        const total = ctxCorrect + ctxWrong;
        const acc   = total ? Math.round(ctxCorrect/total*100) : 0;
        const fb2 = document.getElementById('ctx-feedback');
        if(fb2){ fb2.innerHTML = '🏁 Bitti! <strong>'+ctxTotalScore+'/'+(ctxPool.length*10)+'</strong> puan &nbsp;·&nbsp; %'+acc+' başarı'; fb2.className='cx-feedback cx-feedback-ok'; }
        const nx = document.getElementById('ctx-next-btn');
        if(nx){ nx.textContent='← Menüye Dön'; nx.onclick=exitContext; nx.style.display=''; }
        const inp = document.getElementById('ctx-input'); if(inp) inp.style.display='none';
        const chk = document.getElementById('ctx-check-btn'); if(chk) chk.style.display='none';
        const fill2 = document.getElementById('cx-prog-fill'); if(fill2) fill2.style.width='100%';
        _cxUpdate();
        return;
    }
    ctxLoadQ();
}

function exitContext() {
    document.getElementById('ctx-input').style.display = '';
    exitModule();
}

// ══════════════════════════════════════════════
// ALIŞTIRMALAR SAYFASI
// ══════════════════════════════════════════════
function showExercisePage() {
    const sel = document.getElementById('exercise-list-selector');
    if (sel) {
        sel.innerHTML = '';
        Object.keys(allData).forEach(n => sel.add(new Option(n, n)));
        // Mobil'de ana liste seçicisiyle senkronize et
        const mainSel = document.getElementById('list-selector');
        if (mainSel && mainSel.value) sel.value = mainSel.value;
    }
    const due   = countSM2Due();
    const badge = document.getElementById('sm2-due-badge');
    if (badge) badge.innerText = due > 0 ? due + ' bekliyor' : '';
    showPage('exercise-page');
}

// ══════════════════════════════════════════════
// MEMORY OYUNU
// ══════════════════════════════════════════════
let memCards = [], memFlipped = [], memMatchCount = 0, memMoves = 0, memTimer = null, memSeconds = 0, memLocked = false;

function startMemoryGame(listName) {
    listName = listName || document.getElementById('game-list-selector').value;
    if (!listName || !allData[listName] || allData[listName].length < 4) {
        return alert("Memory için listede en az 4 kelime olmalı!");
    }
    currentActiveList = listName;
    startModule();

    const pool      = [...allData[listName]].sort(() => Math.random() - 0.5);
    const pairCount = Math.min(8, Math.max(4, Math.floor(pool.length / 1) > 8 ? 8 : pool.length));
    const chosen    = pool.slice(0, pairCount);

    memCards = [];
    chosen.forEach((w, i) => {
        memCards.push({ id: i * 2,     pairId: i, type: 'eng', text: w.eng });
        memCards.push({ id: i * 2 + 1, pairId: i, type: 'tr',  text: w.tr  });
    });
    memCards.sort(() => Math.random() - 0.5);

    memFlipped = []; memMatchCount = 0; memMoves = 0; memLocked = false; memSeconds = 0;
    clearInterval(memTimer);
    memTimer = setInterval(() => {
        memSeconds++;
        const m = String(Math.floor(memSeconds / 60)).padStart(1, '0');
        const s = String(memSeconds % 60).padStart(2, '0');
        document.getElementById('mem-time').innerText = `${m}:${s}`;
    }, 1000);

    document.getElementById('mem-moves').innerText   = '0';
    document.getElementById('mem-matches').innerText = '0';
    document.getElementById('mem-total').innerText   = pairCount;
    document.getElementById('memory-result').classList.add('hidden');

    const cols = 4;
    const grid = document.getElementById('memory-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.innerHTML = '';

    memCards.forEach(card => {
        const el          = document.createElement('div');
        el.className      = 'mem-card';
        el.dataset.id     = card.id;
        el.dataset.pairId = card.pairId;
        el.dataset.type   = card.type;
        el.innerHTML      = `
            <div class="mem-card-inner">
                <div class="mem-card-front">🃏</div>
                <div class="mem-card-back type-${card.type}">${card.text}</div>
            </div>`;
        el.addEventListener('click', () => onMemCardClick(el, card));
        grid.appendChild(el);
    });

    showPage('memory-page');
}

function onMemCardClick(el, card) {
    if (memLocked) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    memFlipped.push({ el, card });

    if (memFlipped.length === 2) {
        memLocked = true;
        memMoves++;
        document.getElementById('mem-moves').innerText = memMoves;

        const [a, b] = memFlipped;
        if (a.card.pairId === b.card.pairId && a.card.type !== b.card.type) {
            setTimeout(() => {
                a.el.classList.add('matched');
                b.el.classList.add('matched');
                memFlipped = [];
                memLocked  = false;
                memMatchCount++;
                document.getElementById('mem-matches').innerText = memMatchCount;
                const total = parseInt(document.getElementById('mem-total').innerText);
                if (memMatchCount === total) memGameFinished(total);
            }, 400);
        } else {
            setTimeout(() => {
                a.el.classList.add('wrong-flash');
                b.el.classList.add('wrong-flash');
                setTimeout(() => {
                    a.el.classList.remove('flipped', 'wrong-flash');
                    b.el.classList.remove('flipped', 'wrong-flash');
                    memFlipped = [];
                    memLocked  = false;
                }, 450);
            }, 600);
        }
    }
}

function memGameFinished(total) {
    clearInterval(memTimer);
    const m        = String(Math.floor(memSeconds / 60)).padStart(1, '0');
    const s        = String(memSeconds % 60).padStart(2, '0');
    const accuracy = Math.round((total / memMoves) * 100);
    document.getElementById('mem-result-text').innerHTML =
        `⏱️ Süre: <strong>${m}:${s}</strong> &nbsp;|&nbsp; 🔁 Hamle: <strong>${memMoves}</strong> &nbsp;|&nbsp; 🎯 Verimlilik: <strong>${accuracy}%</strong><br><small style="opacity:0.8">Mükemmel skor: ${total} hamlede bitir!</small>`;
    document.getElementById('memory-result').classList.remove('hidden');
}

function exitMemoryGame() {
    clearInterval(memTimer);
    if (moduleStartTime) {
        let sessionMins = (Date.now() - moduleStartTime) / 60000;
        stats.totalMinutes = (Number(stats.totalMinutes) || 0) + sessionMins;
        window._saveData && window._saveData();
        moduleStartTime = null;
    }
    showGamesPage();
}

function showGamesPage() {
    const sel = document.getElementById('game-list-selector');
    sel.innerHTML = '';
    Object.keys(allData).forEach(n => sel.add(new Option(n, n)));
    showPage('games-page');
}

// ══════════════════════════════════════════════
// SM-2 BADGE & BAŞLANGIÇ
// ══════════════════════════════════════════════
function updateSM2Badge() {
    const due = countSM2Due();
    ['sb-sm2-badge', 'di-sm2-badge', 'mt-sm2-badge', 'bn-sm2-badge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.innerText = due; el.style.display = due > 0 ? '' : 'none'; }
    });
}

// ══════════════════════════════════════════════
// AI YDT SINAV MODU
// ══════════════════════════════════════════════
let aiCurrentList  = [];
let aiCurrentIndex = 0;
let aiPageCorrect  = "";
let aiAnswered     = false;
let aiCurrentWord  = null; // mevcut sorunun kelime+veri referansı

// Arşiv global
window.aiArsiv      = JSON.parse(localStorage.getItem('ydt_ai_arsiv') || '[]');
window.aiGramerArsiv = JSON.parse(localStorage.getItem('ydt_gramer_arsiv') || '[]');

function recordAIStat(isCorrect) {
    let t = parseInt(localStorage.getItem('ydtai_tot') || '0');
    let c = parseInt(localStorage.getItem('ydtai_cor') || '0');
    let w = parseInt(localStorage.getItem('ydtai_wrg') || '0');
    t++;
    if (isCorrect) c++; else w++;
    localStorage.setItem('ydtai_tot', t);
    localStorage.setItem('ydtai_cor', c);
    localStorage.setItem('ydtai_wrg', w);
    updateAIStatsDisplay();
}

function updateAIStatsDisplay() {
    const totEl = document.getElementById('ai-stat-tot');
    if (totEl) {
        totEl.innerText = localStorage.getItem('ydtai_tot') || '0';
        document.getElementById('ai-stat-cor').innerText = localStorage.getItem('ydtai_cor') || '0';
        document.getElementById('ai-stat-wrg').innerText = localStorage.getItem('ydtai_wrg') || '0';
    }
}

// AI Vocabulary Test ayar state'i
let _aiqCount = 10, _aiqDiff = 'ydt', _aiqType = 'bosluk', _aiqSelectedList = null;
let _aiqSessionCorrect = 0, _aiqSessionWrong = 0, _aiqSessionTotal = 0;

function aiqSetCount(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _aiqCount = val;
    _aiqUpdateStartBtn();
}
function aiqSetDiff(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _aiqDiff = val;
}
function aiqSetType(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _aiqType = val;
}
function _aiqUpdateStartBtn() {
    const sub = document.getElementById('aiq-start-sub');
    if (!sub) return;
    const pool = _aiqSelectedList ? (allData[_aiqSelectedList] || []) : [];
    const cnt  = _aiqCount === 0 ? pool.length : Math.min(_aiqCount, pool.length);
    sub.textContent = cnt > 0 ? `${cnt} soru seçildi` : 'Liste seçin';
}
function _aiqUpdateStats() {
    const total   = _aiqSessionTotal;
    const correct = _aiqSessionCorrect;
    const wrong   = _aiqSessionWrong;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : null;
    const el = id => document.getElementById(id);
    if (el('aiq-stat-total'))   el('aiq-stat-total').textContent   = total;
    if (el('aiq-stat-correct')) el('aiq-stat-correct').textContent = correct;
    if (el('aiq-stat-wrong'))   el('aiq-stat-wrong').textContent   = wrong;
    if (el('aiq-stat-pct'))     el('aiq-stat-pct').textContent     = pct !== null ? pct + '%' : '—';
    const bar = el('aiq-success-bar');
    if (bar) bar.style.width = (pct || 0) + '%';
    // Renk
    if (bar) {
        bar.style.background = pct >= 80 ? 'linear-gradient(90deg,#22c55e,#84cc16)'
            : pct >= 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
            : 'linear-gradient(90deg,#ef4444,#f97316)';
    }
}

function startAIQuizMode() {
    document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(b => b.classList.remove('active'));
    const aiBtnSb = document.getElementById('sb-ai-ydt');
    if (aiBtnSb) aiBtnSb.classList.add('active');
    document.getElementById('ai-quiz-page').classList.remove('hidden');

    // Kontrol paneli göster, quiz alanı gizle
    const cp = document.getElementById('aiq-control-panel');
    const qa = document.getElementById('ai-quiz-content');
    if (cp) cp.style.display = 'block';
    if (qa) qa.style.display = 'none';

    // Liste grid'i doldur
    _aiqPopulateListGrid();

    // Mevcut aktif listeyi seç
    const listSelect = document.getElementById('list-selector');
    const activeList = listSelect ? listSelect.value : null;
    if (activeList && allData[activeList]) {
        _aiqSelectList(activeList);
    }

    // API key kontrolü
    const hasKey = AI_PROVIDERS.some(p => localStorage.getItem(p.lsKey));
    const keySection = document.getElementById('ai-key-section');
    if (keySection) keySection.style.display = hasKey ? 'none' : 'block';

    _aiqUpdateStats();
}

function _aiqPopulateListGrid() {
    const grid = document.getElementById('aiq-list-grid');
    if (!grid || typeof allData === 'undefined') return;
    grid.innerHTML = '';
    Object.keys(allData).forEach(name => {
        const count = allData[name].length;
        const btn = document.createElement('button');
        btn.className = 'aiq-list-btn' + (name === _aiqSelectedList ? ' active' : '');
        btn.innerHTML = `<span class="aiq-list-name">${name}</span><span class="aiq-list-count">${count} kelime</span>`;
        btn.onclick = () => _aiqSelectList(name);
        grid.appendChild(btn);
    });
}

function _aiqSelectList(name) {
    _aiqSelectedList = name;
    document.querySelectorAll('.aiq-list-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.aiq-list-btn').forEach(b => {
        if (b.querySelector('.aiq-list-name')?.textContent === name) b.classList.add('active');
    });
    _aiqUpdateStartBtn();
    const sub = document.getElementById('ai-quiz-sub');
    if (sub) sub.textContent = `${name} — ${allData[name]?.length || 0} kelime`;
}

function aiqBeginTest() {
    if (!_aiqSelectedList || !allData[_aiqSelectedList]) {
        alert('Lütfen bir kelime grubu seçin!'); return;
    }
    const hasKey = AI_PROVIDERS.some(p => localStorage.getItem(p.lsKey));
    if (!hasKey) {
        const keySection = document.getElementById('ai-key-section');
        if (keySection) { keySection.style.display = 'block'; keySection.scrollIntoView({behavior:'smooth'}); }
        return;
    }

    // Listeyi hazırla
    const pool = [...allData[_aiqSelectedList]].sort(() => Math.random() - .5);
    const cnt  = _aiqCount === 0 ? pool.length : Math.min(_aiqCount, pool.length);
    aiCurrentList  = pool.slice(0, cnt);
    aiCurrentIndex = 0;
    _aiqSessionCorrect = 0;
    _aiqSessionWrong   = 0;
    _aiqSessionTotal   = 0;

    // Kontrol paneli gizle, quiz alanı göster
    const cp = document.getElementById('aiq-control-panel');
    const qa = document.getElementById('ai-quiz-content');
    if (cp) cp.style.display = 'none';
    if (qa) qa.style.display = 'block';

    // Finish card gizle
    const fc = document.getElementById('aiq-finish-card');
    if (fc) fc.style.display = 'none';

    // Progress label
    const lbl = document.getElementById('aiq-q-prog-label');
    if (lbl) lbl.textContent = `1/${cnt}`;

    document.getElementById('ai-word-counter').textContent = `1 / ${cnt}`;
    fetchAIQuestionForCurrentWord();
}

function aiqStopTest() {
    const cp = document.getElementById('aiq-control-panel');
    const qa = document.getElementById('ai-quiz-content');
    if (cp) cp.style.display = 'block';
    if (qa) qa.style.display = 'none';
    _aiqUpdateStats();
}

function saveKeyAndStart() {
    const key = document.getElementById('ai-api-key').value.trim();
    if (!key) { alert("Lütfen API anahtarını girin!"); return; }
    localStorage.setItem('ydt_gemini_api_key', key);
    document.getElementById('ai-key-section').style.display = 'none';
    aiqBeginTest();
}

async function fetchAIQuestionForCurrentWord() {
    if (aiCurrentIndex >= aiCurrentList.length) {
        // Test bitti — finish card göster
        const total   = _aiqSessionTotal;
        const correct = _aiqSessionCorrect;
        const wrong   = _aiqSessionWrong;
        const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
        const emoji   = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '😊' : '💪';

        const fc = document.getElementById('aiq-finish-card');
        if (fc) {
            document.getElementById('aiq-finish-emoji').textContent   = emoji;
            document.getElementById('aiq-finish-correct').textContent = correct;
            document.getElementById('aiq-finish-wrong').textContent   = wrong;
            document.getElementById('aiq-finish-pct').textContent     = pct + '%';
            fc.style.display = 'flex';
        }
        document.getElementById('ai-q-text').innerHTML       = '';
        document.getElementById('ai-options').innerHTML      = '';
        document.getElementById('ai-explanation').style.display = 'none';
        document.getElementById('ai-next-btn').classList.add('hidden');
        document.getElementById('ai-target-display').textContent = 'TEST BİTTİ';
        _aiqUpdateStats();
        return;
    }

    aiAnswered = false;
    const currentItem = aiCurrentList[aiCurrentIndex];
    const targetWord  = currentItem.word || currentItem.eng || currentItem.en;
    aiCurrentWord = { word: targetWord, tr: currentItem.tr || currentItem.meaning || '', listName: _aiqSelectedList || '' };

    const cnt = aiCurrentList.length;
    document.getElementById('ai-word-counter').textContent = `${aiCurrentIndex + 1} / ${cnt}`;
    const lbl = document.getElementById('aiq-q-prog-label');
    if (lbl) lbl.textContent = `${aiCurrentIndex + 1}/${cnt}`;

    const tEl = document.getElementById('ai-target-display');
    if (tEl) tEl.textContent = '⏳ Hazırlanıyor';

    document.getElementById('ai-q-text').innerHTML = `
        <div class="aiq-loading">
            <div class="aiq-loading-spinner"></div>
            <div>AI soruyu hazırlıyor...</div>
            <div class="aiq-loading-sub">Bu işlem birkaç saniye sürebilir</div>
        </div>`;
    document.getElementById('ai-options').innerHTML         = '';
    document.getElementById('ai-explanation').style.display = 'none';
    document.getElementById('ai-next-btn').classList.add('hidden');

    // Zorluk ve tip belirle
    const diffMap = { ydt:'YDT seviyesinde ÖSYM tarzında', kolay:'B1 seviyesinde kolay', zor:'C1/C2 seviyesinde çok zor' };
    const diffTxt = diffMap[_aiqDiff] || 'YDT seviyesinde';
    const typeTxt = _aiqType === 'anlam' ? 'Bu kelimenin Türkçe anlamını soran çoktan seçmeli'
        : _aiqType === 'karisik' ? (Math.random() > .5 ? 'boşluk doldurma' : 'anlam sorusu')
        : 'boşluk doldurma';

    const prompt = `Sen uzman bir YDT İngilizce öğretmenisin. '${targetWord}' kelimesiyle ilgili, ${diffTxt} ${typeTxt} sorusu hazırla. 5 şıklı (A, B, C, D, E) olsun. SADECE şu JSON formatında ver:
{
  "question": "Soru cümlesi, boşluk ___ şeklinde.",
  "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "correct": "A",
  "explanation": "Önce cümlenin tam Türkçe çevirisini ver. Doğru cevabın anlamını <b>...</b> ile kalın yap. Yanlış şıkların anlamlarını listele."
}`;

    try {
        const qData = await aiCall(prompt);
        renderAIPageQuestion(qData);
    } catch (error) {
        document.getElementById('ai-q-text').textContent = `⚠ Hata: ${error.message}`;
        document.getElementById('ai-next-btn').classList.remove('hidden');
        document.getElementById('ai-next-btn').textContent = 'Hatayı Geç →';
    }
}

function renderAIPageQuestion(qData) {
    // SORU NO göster — kelime AÇIKLANMAZ (cevap sızıntısı olur!)
    const targetEl = document.getElementById('ai-target-display');
    const idx = aiCurrentIndex + 1;
    if (targetEl) targetEl.textContent = `SORU ${idx}`;

    // Zorluk etiketi
    const diffLabels = { ydt:'🎯 YDT Seviyesi', kolay:'🟢 Kolay', zor:'🔴 Zor' };
    const diffEl = document.getElementById('aiq-q-difficulty');
    if (diffEl) diffEl.textContent = diffLabels[_aiqDiff] || '🎯 YDT Seviyesi';

    // Progress bar
    const cnt = aiCurrentList.length;
    const pb  = document.getElementById('ai-progress-bar');
    if (pb) pb.style.width = Math.round((aiCurrentIndex / cnt) * 100) + '%';
    document.getElementById('ai-word-counter').textContent = `${aiCurrentIndex + 1} / ${cnt}`;
    const lbl = document.getElementById('aiq-q-prog-label');
    if (lbl) lbl.textContent = `${aiCurrentIndex + 1}/${cnt}`;

    document.getElementById('ai-q-text').textContent = qData.question;

    const optsContainer = document.getElementById('ai-options');
    optsContainer.innerHTML = '';
    aiPageCorrect = qData.correct;

    for (const [key, val] of Object.entries(qData.options)) {
        const btn = document.createElement('button');
        btn.className = 'ai-opt-btn aiq-opt';
        btn.dataset.key = key;
        btn.innerHTML = `<span class="aiq-opt-letter">${key}</span><span>${val}</span>`;
        btn.onclick = () => checkAIPageAnswer(btn, key, qData);
        optsContainer.appendChild(btn);
    }

    // Açıklama hazırla ama gizle
    const expDiv = document.getElementById('ai-explanation');
    expDiv.style.display = 'none';
    expDiv.innerHTML = `<div class="aiq-exp-header">💡 Çözüm ve Çeviri</div>${qData.explanation}`;
}

function checkAIPageAnswer(btn, selectedKey, qData) {
    if (aiAnswered) return;
    aiAnswered      = true;
    const isCorrect = (selectedKey === aiPageCorrect);
    recordAIStat(isCorrect);
    recordDailyPerf(isCorrect);
    saveToAiArsiv(qData, selectedKey, isCorrect);

    // Session istatistik
    _aiqSessionTotal++;
    if (isCorrect) _aiqSessionCorrect++; else _aiqSessionWrong++;

    // Şıkları renklendir
    document.querySelectorAll('#ai-options .aiq-opt').forEach(b => {
        b.disabled = true;
        b.classList.add('aiq-opt-disabled');
        const k = b.dataset.key;
        if (k === aiPageCorrect) b.classList.add('aiq-opt-correct');
        else if (k === selectedKey && !isCorrect) b.classList.add('aiq-opt-wrong');
    });

    // Açıklama
    const expDiv = document.getElementById('ai-explanation');
    expDiv.className = 'aiq-explanation ' + (isCorrect ? 'aiq-exp-correct' : 'aiq-exp-wrong');
    expDiv.style.display = 'block';

    // Canlı istatistik güncelle
    _aiqUpdateStats();

    document.getElementById('ai-next-btn').classList.remove('hidden');
}

function nextAIQuestion() {
    aiCurrentIndex++;
    fetchAIQuestionForCurrentWord();
}

// ── Arşive kaydet ────────────────────────────────────
function saveToAiArsiv(qData, selectedKey, isCorrect) {
    if (!qData || !qData.question) return;
    const entry = {
        id:        Date.now(),
        date:      new Date().toISOString(),
        word:      aiCurrentWord?.word || '',
        wordTr:    aiCurrentWord?.tr   || '',
        listName:  aiCurrentWord?.listName || '',
        question:  qData.question,
        options:   qData.options,
        correct:   qData.correct,
        selected:  selectedKey,
        isCorrect: isCorrect,
        explanation: qData.explanation
    };
    window.aiArsiv = window.aiArsiv || [];
    window.aiArsiv.unshift(entry); // en yeni başta
    // AI üretimi soruları 300 ile sınırla; manuel paket soruları (listName dolu) korunur
    const _aiGen  = window.aiArsiv.filter(e => !e.listName || e.listName.trim() === '');
    const _manual = window.aiArsiv.filter(e =>  e.listName && e.listName.trim() !== '');
    window.aiArsiv = [..._manual, ..._aiGen.slice(0, 300)];
    window._saveData && window._saveData();
    // Arşiv badge'ini güncelle
    updateArsivBadge();
}

function updateArsivBadge() {
    const kelimeCount = (window.aiArsiv || []).length;
    const gramerCount = (window.aiGramerArsiv || []).length;
    const pSorular    = window.paragrafSorular || {};
    const paraCount   = Object.values(pSorular).reduce((s, v) => s + (v.questions || []).length, 0);
    const total       = kelimeCount + gramerCount + paraCount;
    const el = document.getElementById('arsiv-badge');
    if (el) { el.textContent = total; el.style.display = total ? '' : 'none'; }
}

// ── Arşiv sayfası ────────────────────────────────────
function showAIArsiv() {
    showPage('ai-arsiv-page');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(b => b.classList.remove('active'));
    const arsivBtn = document.getElementById('sb-arsiv');
    if (arsivBtn) arsivBtn.classList.add('active');

    // Filtre seçeneklerini güncelle
    const filterSel = document.getElementById('arsiv-list-filter');
    if (filterSel) {
        const lists = [...new Set((window.aiArsiv || []).map(e => e.listName).filter(Boolean))];
        filterSel.innerHTML = '<option value="">Tüm Listeler</option>' +
            lists.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    // İlk açılışta overview göster
    if (!window._arsivActiveSubList) window._arsivActiveSubList = 'overview';

    renderArsiv();
}

// ── Soru Bankası state ───────────────────────────────
window._kelimeCardOpen     = window._kelimeCardOpen     || false;
window._paragrafCardOpen   = window._paragrafCardOpen   || false;
window._gramerCardOpen     = window._gramerCardOpen     || false;
window._arsivActiveSubList = window._arsivActiveSubList || 'kelime_1';
// ── Gramer Soruları Veri ──────────────────────────────────────
const GRAMMAR_SORULARI = [
  {
    no: 1,
    question: "When travelling in a foreign country, you shouldn't keep your money and valuables in your luggage ....... if you do, you run the risk of having them stolen.",
    options: {
      A: "otherwise",
      B: "moreover",
      C: "because",
      D: "therefore",
      E: "although"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 2,
    question: "Jack: I found this stone when I was walking around some ruins in Syria, and I think it might be valuable. Expert: ....... . You were lucky to get it out of the country without being arrested for smuggling. A) So it is B) Nor is it C) I hope not D) As was this E) I don't expect so We were planning to have a picnic on Saturday, but the weather looked ........ to deter us from going ahead with our plan.",
    options: {
      A: "too threatening",
      B: "threatening enough",
      C: "so threatening that",
      D: "as threatening",
      E: "such a threatening"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 3,
    question: "Britain had no intention of keeping the promises it made to Arab leaders of creating an independent Arab nation after World War I, and .........., which wanted Syria for itself.",
    options: {
      A: "so did France",
      B: "France wasn't either",
      C: "as was France",
      D: "neither did France",
      E: "nor would"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 4,
    question: "They were never able to afford a house of their own no matter how much they tried to save money, .......?",
    options: {
      A: "did they",
      B: "weren't they",
      C: "were they",
      D: "have they",
      E: "didn't they"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 5,
    question: "Although a suspect ....... with murdering the actress, some people doubt that the police ....... the right person.",
    options: {
      A: "was charging/are getting",
      B: "was charged/would have got",
      C: "will be charged/were getting",
      D: "is charging/had got",
      E: "has been charged/have got ....... of the finalists in this year's tournament are"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 6,
    question: "Both C) The whole D) Either E) One When we say, \\\"It doesn't matter ....... you know, but ....... you know,\\\" we mean that influence is often more important than intellect.",
    options: {
      A: "where/when",
      B: "who/why",
      C: "that/which",
      D: "what/who",
      E: "when/how"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 7,
    question: "I ........... for the project, but in the end, it ........ to the boss's nephew.",
    options: {
      A: "was being considered/was given",
      B: "will be considered/has given",
      C: "had considered/was being given",
      D: "have been considered/was giving",
      E: "am considering/will be given"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 8,
    question: "Jeff is very pleased with ....... for finally breaking away from ....... family's business.",
    options: {
      A: "he/his own",
      B: "him/himself",
      C: "himself/his",
      D: "his/him",
      E: "his own/him"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 9,
    question: "You should not panic in an exam ....... there are some questions you do not think you can answer at first. \\\"",
    options: {
      A: "no matter",
      B: "moreover",
      C: "otherwise",
      D: "whereas",
      E: "even if"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 10,
    question: "Engineering is ........ challenging course of study that requires ........ thorough understanding of mathematics and science. A) the/a B) a/the C) D) the /the E) a/a I find most contemporary art ........ to appreciate; I prefer to be able to understand what I am looking at.",
    options: {
      A: "so abstract",
      B: "abstract enough",
      C: "such an abstract",
      D: "too abstract",
      E: "as abstract as"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 11,
    question: "Unless you can speak French, you are likely to have problems in Paris because .... French refuse to speak any language but ........ own.",
    options: {
      A: "a/his",
      B: "the/their",
      C: "some/them",
      D: "any/himself",
      E: "/themselves"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 12,
    question: "The pirates buried their treasure ....... they thought no one would ever find it.",
    options: {
      A: "which",
      B: "where",
      C: "that",
      D: "when",
      E: "what"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 13,
    question: "How was I supposed to know this book was ....... if she didn't write ........ name on it?",
    options: {
      A: "her/hers",
      B: "her/herself",
      C: "hers /her",
      D: "her own/hers",
      E: "herself/her"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 14,
    question: "You will take ........ time to do the job if your assistant works.......... .",
    options: {
      A: "much/too efficiently",
      B: "less/more efficiently",
      C: "fewer/so efficiently",
      D: "the least/as efficient",
      E: "a little/efficient enough"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 15,
    question: "I prefer the kind of boss who gives you the freedom to accomplish a task..........you like.",
    options: {
      A: "however",
      B: "whichever",
      C: "whatever",
      D: "whomever",
      E: "whoever"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 16,
    question: "They still seem to be friends ....... the violent argument they had last week.",
    options: {
      A: "although",
      B: "however",
      C: "since",
      D: "as though",
      E: "despite"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 17,
    question: "I had to ask a friend ....... I could borrow her dictionary because I had left mine at home.",
    options: {
      A: "so",
      B: "as",
      C: "even",
      D: "if",
      E: "that"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 18,
    question: "I'm hoping to retake the university entrance exam next year, but ........, I am working in a music shop and studying at night.",
    options: {
      A: "even though",
      B: "whatsoever",
      C: "in the meantime",
      D: "on the contrary",
      E: "notwithstanding"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 19,
    question: "So many of the employees objected ....... late that the boss gave in and stopped asking us ....... it.",
    options: {
      A: "work/to be doing",
      B: "to working/to do",
      C: "having worked/doing",
      D: "working/to have done",
      E: "to be working/having done"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 20,
    question: "The sportswriters were disappointed in the national team's performance last night, ....... .",
    options: {
      A: "and I was too",
      B: "and so did I",
      C: "but I was",
      D: "but I wasn't either",
      E: "and me neither"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 21,
    question: "I've often wondered ....... tonnes of coal it takes to heat a medium sized apartment building.",
    options: {
      A: "how many",
      B: "how far",
      C: "how often",
      D: "how much",
      E: "how long"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 22,
    question: "My father ....... since the textile mill in our town ....... down five years ago.",
    options: {
      A: "isn't working/has closed",
      B: "won't work/had closed",
      C: "doesn't work/was closing",
      D: "hasn't worked/closed",
      E: "didn't work/would close"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 23,
    question: "Iraq, Jordan and Syria are all nations ....... were created by the Western powers after World War I.",
    options: {
      A: "where",
      B: "when",
      C: "why",
      D: "that",
      E: "whom"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 24,
    question: "Since Tim couldn't decide himself ....... he wants to study at university, he consulted the vocational counsellor of the school.",
    options: {
      A: "which",
      B: "whose",
      C: "what",
      D: "how",
      E: "who"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 25,
    question: "After graduation, he could ....... get a job to learn about working life, ................ volunteer work to experience the way different kinds of people live.",
    options: {
      A: "rather/than",
      B: "even/so",
      C: "so/that",
      D: "whether/or",
      E: "either/or"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 26,
    question: "By the time the new by-pass ........., it ........ three times the original estimate.",
    options: {
      A: "finishes/could have cost",
      B: "is finished/will have cost",
      C: "has finished/costs",
      D: "was finished/will cost",
      E: "had been finished/has cost"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 27,
    question: "I was so angry ......... the alarm clock rang that I threw it across the room.",
    options: {
      A: "when",
      B: "the fact that",
      C: "however",
      D: "whether",
      E: "though"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 28,
    question: "Colin ......... down a lot ever since the boss told him that he........his job if he insisted on behaving so irresponsibly.",
    options: {
      A: "calms/is going to lose",
      B: "calmed/had lost",
      C: "is calming/was losing",
      D: "has calmed/would lose",
      E: "had calmed/has lost"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 29,
    question: "Some members of the coalition have been looking for............way to abolish.............. capital punishment. A) /the B) any/some C) some/ Middle Eastern politics is a complex subject, and though I tried to give a brief explanation to my guests, eventually I became ....... by my own explanation....... I gave up.",
    options: {
      A: "too confusing/so",
      B: "so confused/that",
      C: "more confused/than",
      D: "as confusing/ as",
      E: "confusing enough/ for ....... of the staff were willing to help out, but ......."
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 30,
    question: "None/most C) Both/two D) Half/ much E) Most/ a few The two sides in the dispute ....... to reach an agreement for a week, but it is beginning to look as if they ....... .",
    options: {
      A: "were trying/don't succeed",
      B: "have tried/didn't succeed",
      C: "had tried/aren't succeeding",
      D: "will have tried/haven't succeeded",
      E: "have been trying/won't succeed"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 31,
    question: "The government has launched a traffic safety campaign to stop so many people............on the roads over the holiday.",
    options: {
      A: "being killed",
      B: "to be killed",
      C: "to kill",
      D: "killing",
      E: "having killed ...........person on the committee has an important responsibility"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 32,
    question: "Any/much C) All/the other D) Each/all E) Every/other ...........painted the picture on the cover of this old book about Istanbul had obviously never been there. A) Whomever B) Whoever C) Whichever D) However E) Whatever Had I known that it ....... so difficult, I ....... in this project in the first place.",
    options: {
      A: "has been/wasn't going to participate",
      B: "was/haven't participated",
      C: "would be/wouldn't have participated",
      D: "is/couldn't have participated",
      E: "will be/haven't been participating"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 33,
    question: "Tokyo, ....... name means \\\"Eastern Capital\\\", was called Edo until 1867.",
    options: {
      A: "when",
      B: "what",
      C: "where",
      D: "whose",
      E: "which"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 34,
    question: "If there ....... no gold in Bergama, the villagers there ....... about cyanide poisoning now.",
    options: {
      A: "were/wouldn't be worrying",
      B: "has been/wouldn't have worried",
      C: "is /weren't worrying",
      D: "will be/haven't been worrying",
      E: "had been/won't have worried"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 35,
    question: "Frederick Douglas, ....... was born a slave, became one of the greatest Black American leaders.",
    options: {
      A: "who",
      B: "which",
      C: "that",
      D: "when",
      E: "where"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 36,
    question: "The jury decided that the defendant ....... the bank because so much evidence ....... against him.",
    options: {
      A: "should have robbed/presented",
      B: "might rob/was presenting",
      C: "must have robbed/was presented",
      D: "had to rob/is presented",
      E: "would have robbed/has presented"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 37,
    question: "I hate scary movies, so I have not seen \\\"Alien\\\", which is one of ....... films ever made.",
    options: {
      A: "more frightened than",
      B: "as frightening",
      C: "too frightened for",
      D: "the most frightening",
      E: "so frightening as"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 38,
    question: "The rocket engine ....... in the 1920s, but it ....... extensively until World War II.",
    options: {
      A: "had been invented/hasn't used",
      B: "has been invented/hadn't been used",
      C: "was inventing/wasn't being used",
      D: "had been inventing/wouldn't have used",
      E: "was invented/wasn't used"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 39,
    question: "If you don't mind ....... a little late today, we should manage ....... everything.",
    options: {
      A: "to work/to have finished",
      B: "working/to finish",
      C: "to be working/having finished",
      D: "having worked/finishing",
      E: "have worked/being finished"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 40,
    question: "I pretended ....... his book even though I could not remember even ....... of it before.",
    options: {
      A: "to have read/having heard",
      B: "to be read/hearing",
      C: "reading/to be heard",
      D: "to have been read/hear",
      E: "read/to hear"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 41,
    question: "After the ship sank, we did not have ....... fresh water, so there was ....... chance of us surviving a long journey in an open boat.",
    options: {
      A: "little/none",
      B: "some/few",
      C: "any/little",
      D: "a little/no",
      E: "less/any"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 42,
    question: "Industrial psychology concerns the physical and psychological conditions of the workplace and how ........ factors contribute to ....... efficient work environment.",
    options: {
      A: "other/",
      B: "each/any",
      C: "others/the",
      D: "these/an",
      E: "every/some"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 43,
    question: "Rehabilitation is a fairly new medical specialty, ........ the notion of helping someone cope with a disabling disease or disorder is an old one.",
    options: {
      A: "whenever",
      B: "since",
      C: "moreover",
      D: "despite",
      E: "although"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 44,
    question: "We took a long time in the meeting deciding ....... to try to expand our overseas markets or not.",
    options: {
      A: "how",
      B: "when",
      C: "that",
      D: "what",
      E: "whether"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 45,
    question: "The bullet struck with ........ force that it passed through the victim completely.",
    options: {
      A: "more than",
      B: "so",
      C: "enough",
      D: "such",
      E: "as much"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 46,
    question: "Two cars collided on the highway, ........ caused a massive traffic jam.",
    options: {
      A: "which",
      B: "where",
      C: "that",
      D: "while",
      E: "when ....... had the semestre begun ....... the students began to complain about"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 47,
    question: "Neither/nor C) Hardly/when D) Not only/but also E) Whether/or I usually take cream in my coffee, but if you have ........I can do without.",
    options: {
      A: "any",
      B: "much",
      C: "neither",
      D: "none",
      E: "some"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 48,
    question: "A deadly computer virus ....... into my computer while I ....... the Internet.",
    options: {
      A: "has got/had been surfing",
      B: "had got/surfed",
      C: "got/was surfing",
      D: "was getting/have surfed",
      E: "is getting/surf"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 49,
    question: "Few writers have written ....... about the experiences of childhood as Arundhati Roy in her novel \\\"The God of Small Things\\\".",
    options: {
      A: "as vivid as",
      B: "such a vivid",
      C: "the most vividly",
      D: "more vividly",
      E: "so vividly"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 50,
    question: "The government is currently working with the IMF to tackle inflation, ....... is one of the most difficult problems faced by the Turkish economy.",
    options: {
      A: "what",
      B: "which",
      C: "that",
      D: "when",
      E: "where"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 51,
    question: "Since the object of boxing is to injure your opponent, it seems like a very dangerous sport although statistically it is not ....... dangerous ........ rugby.",
    options: {
      A: "so/that",
      B: "as/as",
      C: "far/than",
      D: "too/as",
      E: "the most/that"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 52,
    question: "In the year 1816, ....... as \\\"The Year Without Summer\\\", North America experienced unusually cold weather all year long thought ....... by the eruption of the Tambora volcano near Java.",
    options: {
      A: "known/to have been caused",
      B: "to have known/to cause",
      C: "to know/causing",
      D: "knowing/to be caused",
      E: "to be known/having been caused ....... flights to"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 53,
    question: "New York are full during the week when we are going on holiday, so we will have to go ....... else. A) Some /whichever B) Any/nowhere C) Every/anywhere D) All/somewhere E) The whole/wherever ....... borrowed my pen had better put it back where he or she found it! A) Whomever B) Whichever C) Whatever D) Wherever E) Whoever We have brought ....... money with us ........ we have to be very careful about how we spend it during our stay here.",
    options: {
      A: "plenty of/as",
      B: "so little/that",
      C: "quite a few/that",
      D: "too much/as",
      E: "much more/than"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 54,
    question: "Queen Elizabeth, ....... family has been such an embarrassment to her, has somehow managed to retain the affection of a large number of her people.",
    options: {
      A: "which",
      B: "whose",
      C: "that",
      D: "where",
      E: "when"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 55,
    question: "The Black American singer and activist Paul Robeson was recognised as a great artist in almost every country ....... his own, where he had been blacklisted because of his politics.",
    options: {
      A: "likewise",
      B: "meanwhile",
      C: "other than",
      D: "whereas",
      E: "unless"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 56,
    question: "An autopsy is being performed to determine ....... the victim died.",
    options: {
      A: "where",
      B: "what",
      C: "which",
      D: "how",
      E: "that"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 57,
    question: "Few people are still alive who can remember the time ....... Turkey first became a Republic.",
    options: {
      A: "when",
      B: "which",
      C: "why",
      D: "what",
      E: "where ....... so many people have e-mail and mobile phones, there is no excuse f"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 58,
    question: "Rather than C) In accordance with D) In spite of E) However I haven't decided what I ....... after I ....... from university.",
    options: {
      A: "do/will have graduated",
      B: "was doing/had graduated",
      C: "will do/graduated",
      D: "have done/was graduating",
      E: "am going to do/have graduated"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 59,
    question: "The stock market closed at an all-time high yesterday, but today it may close ........ , because the trend still seems to be up.",
    options: {
      A: "too high",
      B: "high enough",
      C: "so high",
      D: "even higher",
      E: "as high as"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 60,
    question: "The rumour which ....... in yesterday's papers about the death of the President...........out to be false.",
    options: {
      A: "had printed /is turning",
      B: "was printed/has turned",
      C: "has been printed/turned",
      D: "was printing/will turn",
      E: "would be printed/turns"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 61,
    question: "You can hand in your first draft whenever you have finished ....... it is before Friday.",
    options: {
      A: "until",
      B: "however",
      C: "as long as",
      D: "supposing",
      E: "in case ........ animals with backbones have skin, though the covering in ......"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 62,
    question: "All/each C) much/a few D) Every/ all E) Any/most No one knew ....... to read Egyptian hieroglyphics until the discovery and interpretation of the Rosetta Stone.",
    options: {
      A: "what",
      B: "which",
      C: "why",
      D: "that",
      E: "how"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 63,
    question: "Albert Einstein was a very poor pupil at school; ....... , he became the greatest physicist of the 20th century.",
    options: {
      A: "by the way",
      B: "otherwise",
      C: "nonetheless",
      D: "inasmuch as",
      E: "by the time"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 64,
    question: "My daughter is going to Bali with a friend of ....... on holiday, but since neither of ....... knows anything about the place, they are going to buy a good guidebook.",
    options: {
      A: "hers/them",
      B: "me/us",
      C: "her/theirs",
      D: "mine/hers",
      E: "herself/ours"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 65,
    question: "Paints ....... decorative and ritual purposes before they .............as protective coatings.",
    options: {
      A: "have served/were developing",
      B: "had served/have been developed",
      C: "were serving/had developed",
      D: "served/were developed",
      E: "would serve/were being developed"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 66,
    question: "If oil ....... in Saudi Arabia and the Gulf States, the people there ...............among the poorest in the world today.",
    options: {
      A: "didn't discover/might be",
      B: "hasn't discovered/would have been",
      C: "isn't discovered/will be",
      D: "if hadn't been discovered/would be",
      E: "wouldn't be discovered/were"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 67,
    question: "Galata Bridge ....... indefinitely while engineers..............for the reason why it refuses to open.",
    options: {
      A: "has been closed/will look",
      B: "is closing/have looked",
      C: "will be closed/look",
      D: "was closed/are looking",
      E: "had been closed/are looking"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 68,
    question: "Though lions are only slightly ........ leopards, they are nearly twice ........ strong.",
    options: {
      A: "larger than/as",
      B: "so large that/like",
      C: "the largest/ so",
      D: "too large like/more",
      E: "such large /the most"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 69,
    question: "I didn't attend university since my father had died and it was my responsibility ....... the eldest son to support the entire family.",
    options: {
      A: "so",
      B: "as",
      C: "such",
      D: "still",
      E: "like"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 70,
    question: "The United States, ....... population is drawn from all over the world, is known as a nation of immigrants.",
    options: {
      A: "where",
      B: "which",
      C: "that",
      D: "whose",
      E: "what"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 71,
    question: "Beautiful ceramics ....... in Iznik, but methods of making some of the colours....... over the time.",
    options: {
      A: "have been manufactured/were being lost",
      B: "could be manufactured/were losing",
      C: "ought to manufacture/are lost",
      D: "must have manufactured/are losing",
      E: "used to be manufactured/have been lost ..........moisture there is in the air, ."
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 72,
    question: "Too much/so much C) So much/as little D) Hardly any/when E) The more/the more All drivers ........ in case they ......... in an accident.",
    options: {
      A: "must be insured/are involved",
      B: "have insured/can involve",
      C: "are insured/are involving",
      D: "can be insured/were involved",
      E: "will have insured/may be involved"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 73,
    question: "The house is dark and the door ....... locked, so he ....... out somewhere.",
    options: {
      A: "had been/used to go",
      B: "will be/could go",
      C: "was /ought to go",
      D: "has been/should have gone",
      E: "is/must have gone"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 74,
    question: "I wish we ......... more to resolve the problem while we still had the chance.",
    options: {
      A: "have striven",
      B: "had striven",
      C: "can strive",
      D: "are striving",
      E: "strove"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 75,
    question: "I'm sorry Madam, but women are not permitted to enter this monastery; ..............I must ask you to leave.",
    options: {
      A: "however",
      B: "as much",
      C: "therefore",
      D: "regardless",
      E: "otherwise"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 76,
    question: "Have you got these jeans in .......larger size? This pair is a bit too small around............. waist.",
    options: {
      A: "a/the",
      B: "the/the",
      C: "the/ /a Of ........ two men standing in front of the window, ...............tall",
      D: "the/the",
      E: "the/"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 77,
    question: "I was ....... in the book I was reading ....... I forgot all about time.",
    options: {
      A: "very interesting/that",
      B: "as interested/as",
      C: "so interested/that",
      D: "too interesting/so",
      E: "more interested/than"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 78,
    question: "Bodrum has a nice museum, but I prefer going there in the winter, ....... there are few tourists around the town.",
    options: {
      A: "that",
      B: "which",
      C: "where",
      D: "whether",
      E: "when"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 79,
    question: "The residents.............about the state of their road for years when the council finally ........ it.",
    options: {
      A: "were complaining/had repaired",
      B: "are complaining/repair",
      C: "will be complaining/have repaired",
      D: "had been complaining/repaired",
      E: "have been complaining/are repairing"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 80,
    question: "In spite of all the efforts of seismologists, no one is quite sure just....................... the probability is of a major new earthquake occurring.",
    options: {
      A: "where",
      B: "what",
      C: "which",
      D: "when",
      E: "how"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 81,
    question: "Alan angered his father by deciding to become a lumberjack ........ going into the family business.",
    options: {
      A: "since",
      B: "besides",
      C: "instead of",
      D: "whereas",
      E: "despite"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 82,
    question: "Unless something ....... to improve water quality, people ........ to get sick.",
    options: {
      A: "has been done/continue",
      B: "would have done/had continued",
      C: "is done/will continue",
      D: "was done/have been continuing",
      E: "could be doing/are continuing"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 83,
    question: "The plot of the film was ....... absurd to be believable, but it was ....... funny that we enjoyed it anyway.",
    options: {
      A: "too/so",
      B: "as/enough",
      C: "the most/more",
      D: "enough/too",
      E: "more/as"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 84,
    question: "Since none of us ....... book-keeping, perhaps we ....... an accountant.",
    options: {
      A: "will understand/are hiring",
      B: "understands/should hire",
      C: "has understood/would hire",
      D: "would understand/will hire",
      E: "understood/used to hire"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 85,
    question: "In addition ....... a number of prize-winning novels, he has tried ....... a positive influence on environmental issues in his country.",
    options: {
      A: "to write /exerting",
      B: "writing/ to have exerted",
      C: "to be written/ to be exerted",
      D: "to be writing /exerted",
      E: "to having written /to exert ....... has heard from"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 86,
    question: "Jane for months, and if she doesn't start writing or e-mailing soon, she is going to lose ....... her friends. A) Someone/none of B) Everyone/the whole C) No one/all D) Anyone/some of E) Each one /any of REVISION TEST In order to see how the patient ........ to an increased amount of medicine, his doctors ........ to give him twice as much as before.",
    options: {
      A: "has responded/were starting",
      B: "would respond/started",
      C: "responded/will have started",
      D: "had responded/would be starting",
      E: "responds/had started"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 87,
    question: "The decorating of the house ........ last week, but the electricity ....... yet.",
    options: {
      A: "has been completed/isn't connected",
      B: "had completed/wasn't being connected",
      C: "was completed/hasn't been connected",
      D: "would have completed/wasn't connected",
      E: "was being completed/isn't connecting"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 88,
    question: "Can you tell me ....... to get a good deal on a used car?",
    options: {
      A: "where",
      B: "how much",
      C: "what",
      D: "that",
      E: "which"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 89,
    question: "My father feels higher education is a waste of time and has ............intention of supporting me through university, so I will have to look for...............means of support.",
    options: {
      A: "no/another",
      B: "none/some",
      C: "some/neither",
      D: "any/others",
      E: "neither/any"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 90,
    question: "Frank: I don't think I ll be able to go to the party on Friday night. Dennis: ....... . I wish it was Saturday night instead. A) So do I B) I m not either C) I will too D) neither will I E) So am I Even a famous author like George Orwell..............for years before he...............anyone to publish his books.",
    options: {
      A: "wrote/had been convincing",
      B: "has written/will be convinced",
      C: "has been writing/was convinced",
      D: "was writing/has convinced",
      E: "had been writing/could convince"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 91,
    question: "Unless Turkey ....... some fundamental changes to its economy, it ....... into the EU.",
    options: {
      A: "has made/doesn't accept",
      B: "makes/won't be accepted",
      C: "will make/hasn't been accepted",
      D: "was making/hasn't accepted",
      E: "is making/wouldn't accept"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 92,
    question: "The 100,000-page EU regulations are ....... to be interpreted very differently by different member countries.",
    options: {
      A: "so confusing that",
      B: "confusing enough",
      C: "such a confusing",
      D: "as confusing",
      E: "more confusing than"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 93,
    question: "We can start discussing the items on the agenda .......everyone has arrived. A) while B) instead of C) on account of C) as soon as E) in case Iraq has some of the largest petroleum reserves in the Middle East; ........, it is the home of some the world's oldest archeological sites, so logically, one would expect it to be a wealthy country from a combination of the petroleum industry and tourism.",
    options: {
      A: "as well as",
      B: "despite",
      C: "as long as",
      D: "therefore",
      E: "furthermore"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 94,
    question: "My father had ....... stressful job...... he decided to quit before he had a heart attack.",
    options: {
      A: "such a/that",
      B: "a more/than",
      C: "as/as",
      D: "the most/as",
      E: "so /that"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 95,
    question: "We............get up early tomorrow, or we ....... miss our 7 a.m. flight.",
    options: {
      A: "might/should",
      B: "would/can",
      C: "may/ought to",
      D: "had better/might",
      E: "could/had better"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 96,
    question: "Once an owner ........ to train his puppy, he must be willing to stick with the job until the puppy ....... the task.",
    options: {
      A: "starts/will be learning",
      B: "has started/learns",
      C: "started/will have learnt",
      D: "will start/has learnt",
      E: "had started/would, learn"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 97,
    question: "If you want to go to Heathrow Airport from central London, it is possible to take ........ the Airport Bus ........ the Heathrow Express train.",
    options: {
      A: "both/either",
      B: "no sooner/than",
      C: "either/or",
      D: "neither/but",
      E: "whether/or"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 98,
    question: "Unfortunately, ....... means are very expensive, so it is better to take ...........option the Underground even though it takes a long time.",
    options: {
      A: "both/the other",
      B: "some/another",
      C: "each/any other",
      D: "any/each other",
      E: "every/some other"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 99,
    question: "I heard ......... in the distance calling for help, but I was too frightened to do ............... .",
    options: {
      A: "somewhere /anywhere",
      B: "someone/anything",
      C: "anywhere/something",
      D: "anyone/everything",
      E: "something/somewhere"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 100,
    question: "I'm a bit concerned because Grechen has had previous experience working with handicapped children, .............. .",
    options: {
      A: "and nor had anyone else",
      B: "though no one else did",
      C: "but no one else has",
      D: "so is everyone else",
      E: "the others had too"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 101,
    question: "I don't think you worked very hard yesterday, .......?",
    options: {
      A: "do I",
      B: "did you",
      C: "don't I",
      D: "didn t you",
      E: "don't you"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 102,
    question: "I live quite a long way from my ex-wife, but I will have to move even..............away because she has found me and started asking for money.",
    options: {
      A: "such a far",
      B: "the farthest",
      C: "so far",
      D: "far enough",
      E: "farther"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 103,
    question: "People ....... Elvis Presley's grave ever since he ....... in 1977.",
    options: {
      A: "have visited/was dying",
      B: "were visiting/had died",
      C: "have been visiting/died",
      D: "are visiting/have died",
      E: "had visited/would die"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 104,
    question: "While most artists want to have their work ........ the Dadaists of the early 20th century actually encouraged audiences ....... them with rotten vegetables.",
    options: {
      A: "to be praised/pelting",
      B: "praise/having pelted",
      C: "to praise/to be pelting",
      D: "having been praised/pelt",
      E: "praised/to pelt"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 105,
    question: "Though few people have actually read his books, James Joyce is probably the novelist ....... works have had the greatest influence on the 20th-century English novel.",
    options: {
      A: "who",
      B: "which",
      C: "that",
      D: "whose",
      E: "whom"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 106,
    question: "It seems that ....... British tourists will go anywhere as long as there is............sunshine and alcohol to drink.",
    options: {
      A: "some/a number of",
      B: "any/several",
      C: "/plenty of",
      D: "every/a lot of",
      E: "the/many"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 107,
    question: "There wasn't anything special you wanted me to do for tomorrow, .......?",
    options: {
      A: "did you",
      B: "didn't there",
      C: "was there",
      D: "weren't you",
      E: "don't"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 108,
    question: "I At...............international airports, passengers have to pass through security to insure that they have ....... dangerous items on them or in their luggage.",
    options: {
      A: "every/neither",
      B: "the/either",
      C: "any/none",
      D: "/any",
      E: "all/no"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 109,
    question: "Ruth's job involves ....... with refugees in order to help them ........ into their new homes.",
    options: {
      A: "to work/being integrated",
      B: "working/integrate",
      C: "to be working/to integrate",
      D: "having worked/integrating",
      E: "work/having integrated"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 110,
    question: "By the end of June, exams ........, and all the students ....... forward to summer vacation.",
    options: {
      A: "will have finished/will be looking",
      B: "have been finished/looked",
      C: "were finishing/had looked",
      D: "are finished/will have been looking",
      E: "are finishing/are looking"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 111,
    question: "Had the laws been enforced, the huge ugly building dominating the skyline above Dolmabah e Palace ....... .",
    options: {
      A: "won't be built",
      B: "couldn't have built",
      C: "hadn't been built",
      D: "wouldn't have been built",
      E: "wasn't going to be built"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 112,
    question: "The defense lawyer presented his case ....... the jury had no choice but to find his client innocent.",
    options: {
      A: "so convincingly that",
      B: "as convincing as",
      C: "too convincing for",
      D: "the most convincing",
      E: "more convincingly than"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 113,
    question: "You ....... for your tickets for at least ten days before the flight; otherwise, they ........... .",
    options: {
      A: "should pay/might cancel",
      B: "must pay/will be cancelled",
      C: "have paid/would have cancelled",
      D: "can pay/have been cancelled",
      E: "had paid/have to be cancelled .........the presence of"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 114,
    question: "UN peacekeeping forces in the area, the situation is still tense. A) As if B) Because C) Despite D) Although E) Moreover Sanskrit is a language ......... words and concepts are said to reflect an awareness of the Self and the universe.",
    options: {
      A: "that",
      B: "which",
      C: "when",
      D: "where",
      E: "whose"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 115,
    question: "We ....... happily through the mountains of Yemen when the bandits ....... out at us.",
    options: {
      A: "had trekked/were jumping",
      B: "have trekked/jump",
      C: "trekked /have jumped",
      D: "would be trekking/would jump",
      E: "were trekking/jumped"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 116,
    question: "I ....... so fed up with the monotony of life in our century that I wish I ....... in the days of high adventure.",
    options: {
      A: "am getting/have lived",
      B: "have got/were living",
      C: "got/have been living",
      D: "get/had lived",
      E: "was getting/could live"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 117,
    question: "In our school, ....... teacher is observed once ....... semestre by the supervisor.",
    options: {
      A: "all/the",
      B: "each/a",
      C: "every/any",
      D: "the whole/",
      E: "any/the"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 118,
    question: "A huge meteorite is believed ....... the Earth about 67 million years ago.",
    options: {
      A: "striking",
      B: "having struck",
      C: "to be struck",
      D: "to have struck",
      E: "to strike"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 119,
    question: "Jake ....... voluntary work as a counsellor among the homeless of the inner city while he ....... for his Master's Degree in Social Psychology.",
    options: {
      A: "does/will be studying",
      B: "has done/was studying",
      C: "was doing/has been studying",
      D: "is doing/is studying",
      E: "will be doing/studied"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 120,
    question: "Until we ....... a preliminary survey, we won't be able to tell you how much the work ........",
    options: {
      A: "were doing/has cost",
      B: "are doing/ could cost",
      C: "will do /has cost",
      D: "did/is going to cost",
      E: "have done/will cost"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 121,
    question: "Of the Earth's nearest neighbours, Venus is too hot to support life, while.............., Mars, seems to have too thin an atmosphere and no water.",
    options: {
      A: "others",
      B: "some other",
      C: "the other",
      D: "other",
      E: "any other"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 122,
    question: "The chief of police was sacked because it was decided that he had not carried out his duties ....... he was required to.",
    options: {
      A: "as professionally as",
      B: "more professional than",
      C: "too professional for",
      D: "professionally enough",
      E: "so professionally that"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 123,
    question: "Dried beans, ........overnight before ....... in salted water, will soften more quickly.",
    options: {
      A: "soaking/to be boiling",
      B: "having been soaked/being boiled",
      C: "to soak/to be boiled",
      D: "be soaked/having been boiled",
      E: "having soaked/boiled"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 124,
    question: "The big match had to be postponed ....... the trouble between rival fans.",
    options: {
      A: "so as to",
      B: "on account of",
      C: "as much as",
      D: "the fact that",
      E: "for fear that"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 125,
    question: "Since the collapse of the Soviet union, the Bolshoi Ballet, ....... so many great dancers of the past received their training, has been underfunded, and so it is now a shadow of its former self.",
    options: {
      A: "which",
      B: "that",
      C: "what",
      D: "where",
      E: "whom"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 126,
    question: "In the 1950s, it ....... that space travel would be common by the year 2000, but so far, of all the heavenly bodies, only the moon ....... by mankind.",
    options: {
      A: "had been predicted/is being visited",
      B: "was predicting/has visited",
      C: "has been predicted/was visited",
      D: "predicted/would be visited",
      E: "was predicted/has been visited"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 127,
    question: "The car had been neglected for years, but after a wash and wax, it looked almost ....... new.",
    options: {
      A: "such",
      B: "so",
      C: "as",
      D: "like",
      E: "much"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 128,
    question: "I have travelled so much, there is hardly any country ....... I don't feel at home.",
    options: {
      A: "which",
      B: "that",
      C: "where",
      D: "when",
      E: "whose ...........French,"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 129,
    question: "Spanish and Italian as a teenager, young Richard Burton decided ........... Arabic next, since he thought it would be more of a challenge. A) Being conquered/to be trying B) To have conquered/try C) To conquer/having tried D) By conquering/trying E) Having conquered/to try He knew it ....... a difficult language, but since Britain at the time ruled quite a large part of the Muslim world, he thought he ....... it.",
    options: {
      A: "should be/must have learnt",
      B: "must have been/should have learnt",
      C: "may be/could learn",
      D: "will have been/would learn",
      E: "would be/ought to learn"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 130,
    question: "He soon realised that the Arabs were a very different people from the British and that in order to understand ........, he should try to see things from .......point of view.",
    options: {
      A: "themselves/their own",
      B: "them/their",
      C: "theirs/theirs",
      D: "their own/them",
      E: "their/themselves"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 131,
    question: "Eventually he learnt Arabic well enough ....... to sneak into Mecca disguised in 1854, ....... to become the best known translator of the Arabian Nights.",
    options: {
      A: "either/or",
      B: "whether/or",
      C: "neither/nor",
      D: "not only/but also",
      E: "more/less"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 132,
    question: "It was not until after Alice ....... for some time that she noticed someone..............her.",
    options: {
      A: "had been walking/was following",
      B: "walked/has been following",
      C: "has walked /had followed",
      D: "has been walking /follows",
      E: "is walking/will be following"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 133,
    question: "The adaptation of Shakespeare's plays by the Reduced Shakespeare Company was not entirely successful ......... the poor quality of the acting.",
    options: {
      A: "so that",
      B: "in case",
      C: "due to",
      D: "when",
      E: "since"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 134,
    question: "The daguerreotype was an early photographic process ....... a positive image directly on a copper plate ....... with silver.",
    options: {
      A: "to produce/to coat",
      B: "producing/coated",
      C: "being produced/coat",
      D: "to be produced/being coated",
      E: "having produced/coating"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 135,
    question: "The process was perfected by the Frenchman Luis Jacques Mande Daguerre in 1837, who was ........ famous for his invention of the Diorama, a kind of illusional picture theatre.",
    options: {
      A: "even",
      B: "still",
      C: "yet",
      D: "already",
      E: "as much"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 136,
    question: "My brother has tried countless jobs during his life; he has ....... worked in a mine in Australia and on a fishing boat in Alaska.",
    options: {
      A: "rather",
      B: "ever",
      C: "still",
      D: "quite",
      E: "even"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 137,
    question: "I was in good physical condition from jogging and working out in the gym; ......, I found it difficult to keep up with the Nepali peasants while trekking in the Himalayas.",
    options: {
      A: "nevertheless",
      B: "regardless of",
      C: "whatever",
      D: "besides",
      E: "similarly"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 138,
    question: "The eviction of the tenant by the landlord had been anticipated, but not ........ it was carried out.",
    options: {
      A: "so quickly as",
      B: "quicker than",
      C: "as quick as",
      D: "the quickest",
      E: "quickly enough"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 139,
    question: "If the captain ........ a more flexible man, the mutiny on the ship........... .",
    options: {
      A: "were/could be avoiding",
      B: "has been/ought to be avoided",
      C: "is/is supposed to avoid",
      D: "had been/might have been avoided",
      E: "would be/used to be avoided"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 140,
    question: "If we ....... in Hawaii, we ....... swimming all year round.",
    options: {
      A: "are going to live/go",
      B: "were living/used to go",
      C: "lived/could go",
      D: "would be living/went",
      E: "had lived/have been going"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 141,
    question: "The world's ....... waves strike the north shore of the island of Oahu, generated by winter storms far to the north.",
    options: {
      A: "too powerful",
      B: "very powerful",
      C: "so powerful",
      D: "powerful enough",
      E: "most powerful ....... you are not in a hurry, you can take the"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 142,
    question: "Underground from Heathrow for a fraction of the cost of the Heathrow Express. A) As far as B) provided that C) The fact that D) In contrast to E) Whereas ....... being cheaper, the Underground takes you through far more interesting parts of London. A) In case B) Otherwise C) As long as D) Therefore E) Besides In 1911, a native American, the language of ........ could not be understood by anyone, was discovered outside a mining town in northern California.",
    options: {
      A: "which",
      B: "that",
      C: "whom",
      D: "who",
      E: "whose"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 143,
    question: "Eventually, after a lot of effort, an anthropologist from the University of California ....... to him using a dictionary of words from a tribe thought to be extinct.",
    options: {
      A: "could have spoken",
      B: "could be speaking",
      C: "was able to speak",
      D: "has been speaking",
      E: "used to speak"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 144,
    question: "He turned out to be the last Stone Age man in America, a member of a tribe ..... customs had not changed ....... thousands of years.",
    options: {
      A: "whose/for",
      B: "which/from",
      C: "whom/since",
      D: "what/until",
      E: "where/while"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 145,
    question: "I find it hard to believe this information, which says Turkey has the world's 17th ....... economy.",
    options: {
      A: "large enough",
      B: "as large as",
      C: "so large",
      D: "largest",
      E: "larger ...............of the 50 states of the"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 146,
    question: "United States is represented in Washington by 2 senators, no matter ....... large or small the population is. A) Every/whether B) Each/how C) Most/such a D) Any/rather E) All/what I'll never forget ....... Muhammad Ali in person just before one of his big fights.",
    options: {
      A: "to be seeing",
      B: "to be seen",
      C: "to see",
      D: "being seen",
      E: "having seen"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 147,
    question: "Westerners are often shocked to see that the whip is ......... form of punishment in Singapore.",
    options: {
      A: "as common as",
      B: "so common that",
      C: "less common than",
      D: "common enough for",
      E: "such a common"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 148,
    question: "Your passport ........: you had better renew it if you ....... to go abroad on holiday.",
    options: {
      A: "has expired/are planning",
      B: "could expire/will plan",
      C: "expired/would have planned",
      D: "expires/were planning",
      E: "must have expired/would plan ......... he had lost his temper does not excuse hi"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 149,
    question: "As long as C) No matter D)Whether E) The fact that I....... changing my job if I ....... sure of getting a better salary elsewhere.",
    options: {
      A: "would consider/must be",
      B: "have considered/were",
      C: "used to consider/have been",
      D: "might consider/could be",
      E: "am considering/had been"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 150,
    question: "We ....... until everyone ....... the cinema before we got up to leave.",
    options: {
      A: "waited/had left",
      B: "are waiting/has left",
      C: "wait/will have left",
      D: "had waited/was leaving",
      E: "were waiting/would leave \"Prohibition\" refers to a period in the"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 151,
    question: "United States during ....... the manufacture and sale of alcoholic drinks was against the law.",
    options: {
      A: "when",
      B: "which",
      C: "that",
      D: "where",
      E: "whose"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 152,
    question: "I..........a lot of beautiful paintings in my life, but this one ........ unsurpassed.",
    options: {
      A: "saw/will be",
      B: "have seen/is",
      C: "see/would be",
      D: "had seen/has been",
      E: "will see/was"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 153,
    question: "Some people are so fanatical about golf that they play every weekend ....... bad the weather is.",
    options: {
      A: "whatever",
      B: "wherever",
      C: "whichever",
      D: "whenever",
      E: "however"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 154,
    question: "Since there is ....... water in Israel but ....... in Turkey, the governments of the two countries are working on a deal to export fresh water from Turkey to Israel.",
    options: {
      A: "some/many",
      B: "little/plenty",
      C: "any/much",
      D: "much/some",
      E: "several/a lot"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 155,
    question: "The history of the late 20th century has shown us that people in some parts of the world would rather ....... their neighbours than ....... living peacefully with them.",
    options: {
      A: "to kill/to contemplate",
      B: "killed/to be contemplating",
      C: "kill/contemplate",
      D: "to have killed/contemplated",
      E: "killing/contemplating"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 156,
    question: "Although \\\"Gone with the Wind\\\" may not be ....... American film of all time, it is certainly ....... popular.",
    options: {
      A: "the best/the most",
      B: "so good/enough",
      C: "too good/so",
      D: "the better/too",
      E: "such good/more"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 157,
    question: "If you ....... up your insurance payments, you ....... everything when your house burnt down.",
    options: {
      A: "will keep/don t lose",
      B: "kept/aren't losing",
      C: "had kept/wouldn't have lost",
      D: "keep/weren't losing",
      E: "would keep/haven't lost"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 158,
    question: "The workmen have offered us two methods of tiling the roof, and we'll choose ......... is less costly.",
    options: {
      A: "whatever",
      B: "whomever",
      C: "however",
      D: "which ever",
      E: "wherever"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 159,
    question: "Chuck Berry made use of jazz, ........ other musical traditions, to develop his own special kind of music: rock 'n' roll.",
    options: {
      A: "while",
      B: "the sooner",
      C: "rather more",
      D: "as well as",
      E: "so as to ....... being despised by her classmates in both high school and univer"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 160,
    question: "Janis Joplin went on to become one of the most popular rock vocalists of all time. A) Instead of B) Even if C) In case D) However E) Despite Although today cruise lines operate in all parts of the world, ........ areas are the Caribbean and the Mediterranean seas.",
    options: {
      A: "so popular",
      B: "more popular than",
      C: "as popular as",
      D: "the most popular",
      E: "too popular"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 161,
    question: "I ....... smoking only last week, but I ....... to feel better already.",
    options: {
      A: "had quit/have begun",
      B: "have quit/begin",
      C: "quit/am beginning",
      D: "was quitting/began",
      E: "would quit/was beginning"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 162,
    question: "It is difficult to imagine ....... people kept in touch before the invention of the telephone.",
    options: {
      A: "which",
      B: "whose",
      C: "when",
      D: "where",
      E: "how"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 163,
    question: "Since 1976, when the United States ....... the death penalty after a nine-year ban, over 650 people ....... .",
    options: {
      A: "reinstated/have been executed",
      B: "was reinstating/were executed",
      C: "has reinstated/have executed",
      D: "had reinstated/would be executed",
      E: "would reinstate/are being executed"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 164,
    question: "Although the system under which people are tried, convicted and executed in the United States has been proved to be unfair, ....... Americans are opposed to the death penalty.",
    options: {
      A: "each",
      B: "few",
      C: "either",
      D: "every",
      E: "any"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 165,
    question: "The price ....... for the flat was 100,000, but in the end, we got it for 80,000.",
    options: {
      A: "asking",
      B: "asked",
      C: "having asked",
      D: "to be asking",
      E: "to ask .... to all that trouble trying to reserve a table."
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 166,
    question: "Mary had ........ to do on Monday, but because her child was ill, she didn't manage to accomplish ......... .",
    options: {
      A: "a lot of/any",
      B: "a huge number/little",
      C: "a great deal/much",
      D: "such a lot/so little",
      E: "so much/many"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 167,
    question: "No one was sure ........ was in power after the bizarre coup ....... took place in Fiji.",
    options: {
      A: "who/that",
      B: "what/when",
      C: "whom/which",
      D: "how/where",
      E: "which/how"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 168,
    question: "There were a lot of animals in the zoo, including an elephant, but .......... of them looked very comfortable in ........ tiny enclosures.",
    options: {
      A: "neither/itself",
      B: "no/theirs",
      C: "all/them",
      D: "most/its",
      E: "none/their"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 169,
    question: "I thought I ........... his wife previously, but it was certainly not the lady he .......... with over there.",
    options: {
      A: "met/has stood",
      B: "have met/had been standing",
      C: "was meeting/was standing",
      D: "had met/is standing",
      E: "would meet/had stood"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 170,
    question: "According to eyewitnesses, the car ......... at about 130 kph when it .......... into the wall.",
    options: {
      A: "had travelled/was crashing",
      B: "was travelling/crashed",
      C: "travelled/has crashed",
      D: "is travelling/will crash",
      E: "would travel/had crashed"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 171,
    question: "It did not matter that I was late for the meeting because ........",
    options: {
      A: "no one else did",
      B: "the boss wasn't either",
      C: "so was everyone else",
      D: "so did Jake",
      E: "so did someone else"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 172,
    question: "Even after they had children, they continued their unconventional life style...........nothing unusual had happened.",
    options: {
      A: "as long as",
      B: "in spite of",
      C: "unless",
      D: "as if",
      E: "provided"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 173,
    question: "Nothing can compare to the new Stephen King book; it's ....... book I have ever read.",
    options: {
      A: "too exciting",
      B: "the most exciting",
      C: "more exciting",
      D: "so exciting",
      E: "exciting enough"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 174,
    question: "The finely chopped onions .......... in the oil for five minutes before the meat.......... .",
    options: {
      A: "must be simmered/is added",
      B: "have been simmering/was added",
      C: "used to simmer/would have added",
      D: "will be simmering/has added",
      E: "would be simmered/had added"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 175,
    question: "It is hard to believe that ....... potatoes ....... tomatoes were eaten in Europe and Asia until the discovery of the Americas.",
    options: {
      A: "more/less",
      B: "either/or",
      C: "some/any",
      D: "whether/or",
      E: "neither/nor"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 176,
    question: "The People's Republic of China ....... in 1949, and since that time, economic and social policies ....... wildly between left and right.",
    options: {
      A: "founded/were fluctuating",
      B: "had been founded/fluctuate",
      C: "has been founded/fluctuated",
      D: "had founded/were fluctuated",
      E: "was founded/have fluctuated"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 177,
    question: "If only you ....... e-mail, we ....... in touch more regularly.",
    options: {
      A: "would have/keep",
      B: "were having/should keep",
      C: "have/were keeping",
      D: "had/could keep",
      E: "are having/have kept"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 178,
    question: "Since ....... Turkey ....... Greece are members of NATO, the United States hopes that they will have friendly relations.",
    options: {
      A: "whether/or",
      B: "such/as",
      C: "both/and",
      D: "either/or",
      E: "each/either"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 179,
    question: "In spite of being such a technologically advanced nation, Japan has .......internet users ........ most other developed countries because the language is not well-suited to computer use.",
    options: {
      A: "much less/as",
      B: "many/as",
      C: "the least/like",
      D: "so few/that",
      E: "fewer/than"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 180,
    question: "The United States has an official retirement age of 65, and ............... . A) Britain is too B) so does Britain C) Britain isn't either D) Britain has E) nor has Britain ........ he heard burglars breaking in through the window, he hid under the bed. A) Whereas B) As long as C) The moment D) The fact that E) By the time I find Elmer ....... inconsiderate ......... a husband because he forgot his wife's birthday.",
    options: {
      A: "rather/as",
      B: "more/than",
      C: "such/that",
      D: "so/that",
      E: "as/for"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 181,
    question: "It's not the cinema ........ but ........ location which deters me from going there.",
    options: {
      A: "itself/its",
      B: "its own/itself",
      C: "it/its own",
      D: "its/its",
      E: "itself/it"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 182,
    question: "When it was discovered that Lucy had prepared ........ thesis by copying from ......... she not only got a \\\"0\\\", but she was also expelled from the university.",
    options: {
      A: "her own/anyone",
      B: "her/someone else's",
      C: "herself/who else",
      D: "its own/whoever",
      E: "itself/elsewhere"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 183,
    question: "We seem to have got ourselves into a situation from ....... there is no escape.",
    options: {
      A: "where",
      B: "that",
      C: "when",
      D: "which",
      E: "what ....... wants chocolate sauce on the ice cream can help ....... out of that"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 184,
    question: "Whomever/hers C) Whoever/themselves D) Wherever/them E) However/me It seems that ...... you are in the world, you can always buy Coca Cola.",
    options: {
      A: "whoever",
      B: "whatever",
      C: "whenever",
      D: "whichever",
      E: "wherever ......."
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 185,
    question: "World War II there was strict rationing of all essential items in Britain. A) During B) Rather C) When D) While E) Since I'm very pleased ....... you, ....... so much about you.",
    options: {
      A: "to be met/hearing",
      B: "being met/to hear",
      C: "meeting/to have heard",
      D: "to meet/having heard",
      E: "to have met/to be heard"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 186,
    question: "At the moment, Tolkein's \\\"Lord of the Rings\\\" ....... in New Zealand and ....... in three years.",
    options: {
      A: "has been filmed/is releasing",
      B: "was filmed/has been released",
      C: "is being filmed/will be released",
      D: "will be filming/is being released",
      E: "is filming/will have released"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 187,
    question: "There is some speculation that the captain of the \\\"Titanic\\\" ....... to break the record time for an Atlantic crossing, and so ....... warnings about icebergs.",
    options: {
      A: "has attempted/could have ignored",
      B: "was attempting/ignored",
      C: "attempted/has ignored",
      D: "had attempted/was ignoring",
      E: "had been attempting/must ignore"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 188,
    question: "The Mackintosh computer has always been ....... advanced than the PC, but the PC has been ....... cheaper.",
    options: {
      A: "the most/so",
      B: "more/much",
      C: "such an/far",
      D: "too/rather",
      E: "as/much"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 189,
    question: "It wasn't ....... idea to install the new network system; it was.......... .",
    options: {
      A: "her/she",
      B: "theirs/it",
      C: "his/my",
      D: "your/mine",
      E: "mine/its"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 190,
    question: "Jeff ....... last year, and since then, he ....... difficulty keeping himself busy.",
    options: {
      A: "was retiring/would have",
      B: "has retired/has",
      C: "would retire/is having",
      D: "had retired/will have",
      E: "retired/has had"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 191,
    question: "We waited ....... long ....... we could, but then, we gave up and went into the cinema.",
    options: {
      A: "so/that",
      B: "too/for",
      C: "as/as",
      D: "so/as",
      E: "much/than"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 192,
    question: "Plymouth is ....... small city in ....... southwest of England, well-known for its harbour and naval base. A) a/the B) C) the/a D) a/a E) the/the I can't help ....... irritated with my boss sometimes when she attempts to make me ........ things that are not in my job description.",
    options: {
      A: "get/to have done",
      B: "getting/do",
      C: "to be getting/done",
      D: "to get/doing",
      E: "having got/to do"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 193,
    question: "The film ....... for half an hour when we arrived; I ....... the time wrong.",
    options: {
      A: "was going on/should have got",
      B: "would go on/have got",
      C: "has been going on/might get",
      D: "had been going on/must have got",
      E: "went on/have been getting"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 194,
    question: "Astrologers analyse the heavenly bodies ....... try to predict what will happen in the future.",
    options: {
      A: "so as to",
      B: "in contrast to",
      C: "with the aim of",
      D: "in addition to",
      E: "owing to"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 195,
    question: "He'll do ........ I say, as long as there is no risk of him getting into trouble with the police for it.",
    options: {
      A: "anything",
      B: "something",
      C: "anyone",
      D: "whenever",
      E: "where else"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 196,
    question: "If Mabel ....... married by now, I don't suppose she ever........... .",
    options: {
      A: "isn't getting/does",
      B: "didn't get/is",
      C: "hasn't got/will",
      D: "wasn't getting/had",
      E: "hasn't been getting/has"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 197,
    question: "Everyone must read the entire play tonight ........ there will be no confusion about the story during rehearsal tomorrow.",
    options: {
      A: "as long as",
      B: "therefore",
      C: "in case of",
      D: "as regards to",
      E: "so that"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 198,
    question: "George ....... to take a long vacation this summer, but his financial situation is so bad at the moment that he ....... overtime instead.",
    options: {
      A: "had planned/had worked",
      B: "plans/was able to work",
      C: "has been planning/worked",
      D: "was planning/will have to work",
      E: "will be planning/had to work"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 199,
    question: "Perhaps humankind's ........ enemy among the insects is the mosquito because ....... lives have been lost as a result of malaria, yellow fever and other mosquito-borne diseases than from all the other insect-borne diseases combined.",
    options: {
      A: "worse/many",
      B: "so bad/too many",
      C: "such bad/the most",
      D: "worst/more",
      E: "too bad/so many"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 200,
    question: "Now that the new by-pass ........., there ........ fewer traffic problems in the centre of town.",
    options: {
      A: "was built/will have been",
      B: "has been built/should be",
      C: "will be built/have been",
      D: "was being built/could be",
      E: "had been built/may have been"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 201,
    question: "Some lizards can change colour within minutes, from light green to dark brown, ......... in response to their environment.",
    options: {
      A: "for instance",
      B: "in contrast",
      C: "in addition",
      D: "on average",
      E: "as well as"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 202,
    question: "I'm not sure ....... the Zaire River is longer than the Amazon or not.",
    options: {
      A: "which",
      B: "how much",
      C: "whether",
      D: "unless",
      E: "however"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 203,
    question: "We ....... around for a long time before we found a house that we liked.",
    options: {
      A: "must have looked",
      B: "should be looking",
      C: "have been looking",
      D: "ought to look",
      E: "had to look"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 204,
    question: "Some houses we looked at were too big and some were too small, but finally we found one that was just ....... we wanted.",
    options: {
      A: "bigger than",
      B: "as big as",
      C: "such a big",
      D: "the biggest",
      E: "big enough"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 205,
    question: "Criminology is basically a subfield of sociology, but it has grown ........ it is usually treated as a separate course in higher education.",
    options: {
      A: "such a large",
      B: "as large as",
      C: "larger than",
      D: "so large that",
      E: "too large"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 206,
    question: "It seems that the rebels won't have completed their withdrawal by the prescribed date, ....... .",
    options: {
      A: "and so have the government troops",
      B: "but the government troops haven't",
      C: "and nor do the government troops",
      D: "but the government troops won't",
      E: "and the government troops won't either"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 207,
    question: "The work ....... to the boss's satisfaction, so we ....... it again tomorrow.",
    options: {
      A: "wasn't being done/have done",
      B: "hadn't been doing/would have to do",
      C: "won't have done/are going to do",
      D: "isn't done/will have done",
      E: "hasn't been done/will have to do"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 208,
    question: "This stove is ....... for me to carry up the stairs; I'll need some help.",
    options: {
      A: "as heavy",
      B: "so heavy as",
      C: "too heavy",
      D: "heavy enough",
      E: "heavier than"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 209,
    question: "You ....... take out travel insurance before you leave for a trip because you............get sick or have an accident and not have enough money for treatment.",
    options: {
      A: "must/should",
      B: "ought to/could",
      C: "used to/may",
      D: "may/will",
      E: "could/must ....... the"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 210,
    question: "British novelist Charles Dickens met the American writer Edgar Alien Poe in 1842, Dickens was already famous and Poe was hoping to get his work published in England. A) When B) As long as C) Though D) Since E) Despite Dickens was in the United States, ....... his books were being pirated, to speak in favour of international copyright laws. -",
    options: {
      A: "which",
      B: "whom",
      C: "whose",
      D: "where",
      E: "that"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 211,
    question: "The natural end of ......... human life is death, but some people, for reasons that have never been fully understood, choose to end ......... lives.",
    options: {
      A: "all/themselves",
      B: "many/their",
      C: "every/their own",
      D: "the whole/theirs",
      E: "each/them"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 212,
    question: "To prevent a suicide is only possible ....... the individual demonstrates warning signs.",
    options: {
      A: "how",
      B: "if",
      C: "as",
      D: "unless",
      E: "until"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 213,
    question: "I'm thirty-five years old Mum! Please stop treating me ....... I were a child! A)such as B) as though C) in case D) provided that E) even if ......... protecting many species of whales from becoming extinct, international laws against hunting them have been put into effect. A) As well as B) For fear of C) In order to D) Instead of E) With the aim of Though not ........ of all the cities I've so far seen, Nagoya is really very unattractive.",
    options: {
      A: "too ugly",
      B: "uglier than",
      C: "ugly enough",
      D: "the ugliest",
      E: "so ugly as"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 214,
    question: "My little son wishes we ....... in Paris so that he ........ the Euro-Disneyland every day.",
    options: {
      A: "can live/visits",
      B: "lived/has been visiting",
      C: "have lived/will be visiting",
      D: "were living/could visit",
      E: "had lived/may have visited"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 215,
    question: "Up to now, rosewood trees ........ in natural areas to the point that few are left standing in the world.",
    options: {
      A: "are being exploited",
      B: "have been exploited",
      C: "will be exploited",
      D: "were being exploited",
      E: "had been exploited"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 216,
    question: "Despite the commercial value, .......; attempts have been made to cultivate rosewood trees or ....... to conduct the research necessary to make a start at it.",
    options: {
      A: "few/even",
      B: "much/still",
      C: "several/nor",
      D: "every/just",
      E: "more/than"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 217,
    question: "With the developments in the field of medicine, bacterial meningitis ....... using vaccines today.",
    options: {
      A: "have been preventing",
      B: "used to be prevented",
      C: "can be prevented",
      D: "will have prevented",
      E: "is supposed to prevent"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 218,
    question: "However, vaccines ......... against all the bacteria that ........ infection, and they are protective for only a limited time.",
    options: {
      A: "aren't protected/caused",
      B: "haven't protected/are caused",
      C: "can't be protected/have caused",
      D: "aren't protecting/were caused",
      E: "don't protect/can cause"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 219,
    question: "Given prompt treatment, fewer than one in ten patients will die of bacterial meningitis. If treatment ......... however, survivors ........ brain damage.",
    options: {
      A: "has delayed/suffer",
      B: "is delayed/may suffer",
      C: "was delaying/could suffer",
      D: "was delayed/have suffered",
      E: "might be delayed/suffered"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 220,
    question: "No one would mind if I came a little late tomorrow, .........?",
    options: {
      A: "didn't I",
      B: "wouldn't they",
      C: "did I",
      D: "would they",
      E: "did they"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 221,
    question: "The people in our hotel did not know ....... English to be able to understand...........we said.",
    options: {
      A: "some/anyone",
      B: "too much/nothing",
      C: "enough/anything",
      D: "a little/everything",
      E: "any/something"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 222,
    question: "The judge didn't agree when the prosecutor objected to the way the defense attorney was questioning the witness, ........?",
    options: {
      A: "did he",
      B: "was he",
      C: "were they",
      D: "wasn't he",
      E: "didn't he ....... from the"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 223,
    question: "Greek word autos ....... \\\"alone\\\", autism prevents children from developing normal social relationships, even with their parents. A) Taken/meaning B) Taking/to have meant C) To take/having meant D) To be taken/meant E) Being taken/to mean Autism should not be confused with childhood schizophrenia or mental retardation, though the behaviour of children with these conditions is sometimes ........ that of autistic children.",
    options: {
      A: "the same",
      B: "similar to",
      C: "such as",
      D: "rather than",
      E: "much more ....... autistic children remain totally silent, while ....... merely"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 224,
    question: "Many/the whole D) Any/the rest E) Some/others If you are buying a house through an estate agent, you ....... everything he tells you since he ....... you false information.",
    options: {
      A: "had to check/would have given",
      B: "must have checked/would give",
      C: "had better check/has given",
      D: "should check/could be giving",
      E: "will check/had been giving"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 225,
    question: "Since we have lost two matches already, ........ we win tonight, we cannot go through to the next round.",
    options: {
      A: "provided that",
      B: "however",
      C: "in case",
      D: "as though",
      E: "even if"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 226,
    question: "I've never been to Israel, and I haven't been to Egypt ............ .",
    options: {
      A: "too",
      B: "neither",
      C: "either",
      D: "still",
      E: "though"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 227,
    question: "In 1942 the Japanese felt that the United States would be unprepared for a surprise attack on their Pacific Fleet, ........, indeed.",
    options: {
      A: "and so would they",
      B: "nor did they",
      C: "and they weren't either",
      D: "and so they were",
      E: "and neither would they"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 228,
    question: "All grapes contain sugar in the form of glucose and fructose, the amount depends on the particular variety.",
    options: {
      A: "of which",
      B: "for whom",
      C: "with that",
      D: "about whose",
      E: "for what"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 229,
    question: "Sadie wrote ....... a letter all about ....... new fiance.",
    options: {
      A: "myself/her own",
      B: "my own/her",
      C: "mine/hers",
      D: "my/her own",
      E: "me/her"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 230,
    question: "Apparently, ....... fiance and ....... three brothers all live on the family farm.",
    options: {
      A: "his/hers",
      B: "her/his",
      C: "her own/himself",
      D: "his own/herself",
      E: "herself/him ........ of the people in"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 231,
    question: "Ethiopia are Ethiopian Orthodox Christians, but there are also quite ........ Muslims and a small minority of animists. A) Plenty/any B) Most/a few C) Much/most of D) Some/a lot E) All/several During the meeting, ....... the Chairman proposed anything, the members disagreed.",
    options: {
      A: "whatever",
      B: "however",
      C: "whenever",
      D: "whichever",
      E: "wherever"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 232,
    question: "It seems that ....... you go in the world these days, there are signs advertising American products.",
    options: {
      A: "whenever",
      B: "anywhere",
      C: "how else",
      D: "whichever",
      E: "everything"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 233,
    question: "Although it lost its empire long ago, Great Britain still likes to behave ....... it were one of the most important countries in the world.",
    options: {
      A: "because",
      B: "besides",
      C: "whereas",
      D: "until",
      E: "as if"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 234,
    question: "The planet Jupiter, ....... moons some scientists believe may contain water, is mostly made up of metallic hydrogen and liquid nitrogen.",
    options: {
      A: "what",
      B: "which",
      C: "that",
      D: "whose",
      E: "where"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 235,
    question: "Even though the Cold War ........, almost every spot on the face of the Earth........ constantly by spy satellites.",
    options: {
      A: "ended/is observing",
      B: "was ending/has been observed",
      C: "has ended/is being observed",
      D: "is being ended/was observing",
      E: "had ended/has observed ....... all his partner's money,"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 236,
    question: "Jake fled abroad even without ........ his wife. A) Having stolen/informing B) To have stolen/to inform C) Being stolen/having informed D) Stealing/to be informed E) Stolen /having been informed We ....... at home today because our boat trip........... .",
    options: {
      A: "must stay/could have cancelled",
      B: "are staying/has been cancelled",
      C: "should stay /will have cancelled",
      D: "had stayed/is being cancelled",
      E: "have stayed/will be cancelled"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 237,
    question: "A number of promising rock musicians have had their careers cut short............... alcoholism and drug addiction.",
    options: {
      A: "in spite of",
      B: "in effect",
      C: "since",
      D: "due to",
      E: "provided ........ you drive, ........ risk there is you will die in a traffic ac"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 238,
    question: "So fast/the most C) The faster/the more D) Fast enough/so much E) The fastest/too much Alcoholics ........ unless they are willing to help themselves.",
    options: {
      A: "are not helping",
      B: "do not help",
      C: "have not helped",
      D: "were not helped",
      E: "cannot he helped ....... there was a long queue outside the restaurant, we decid"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 239,
    question: "Since C) Until D) By the time E) While ....... the staff have mastered the new computer system, nothing will get accomplished. A) Until B) As a result C) By the time D) While E) During ....... had we moved into our new house ....... the basement flooded and we had to borrow thousands of dollars to have it fixed. A) Whether/or B) Neither/nor C) No sooner/than D) The more/the sooner E) The moment/both President Richard Nixon was known for his strongly anti-communist views; ........., he opened relationships between the US and communist China by becoming the first president to visit Beijing.",
    options: {
      A: "therefore",
      B: "nonetheless",
      C: "as a consequence",
      D: "on the contrary",
      E: "furthermore"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 240,
    question: "According to what it says on the big board, the plane ....... by now.",
    options: {
      A: "must land",
      B: "is landing",
      C: "had been landing",
      D: "should have landed",
      E: "is going to land"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 241,
    question: "If manned space travel had not proved so costly, people ........ on colonies on the moon by now.",
    options: {
      A: "had been living",
      B: "have been living",
      C: "are living",
      D: "would be living",
      E: "will be living"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 242,
    question: "Please be patient! As soon as I ....... repairing my car, I ....... you to the doctor.",
    options: {
      A: "will have finished/take",
      B: "finished/should lake",
      C: "will finish/am taking",
      D: "am finishing/have taken",
      E: "have finished/will lake"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 243,
    question: "By the time the bride's father ....... his speech at the wedding ceremony, all of us ....... asleep.",
    options: {
      A: "was finishing/fell",
      B: "will finish/are going to fall",
      C: "will have finished/are falling",
      D: "finished/had fallen",
      E: "had finished/have fallen"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 244,
    question: "If both sides during the Cold War hadn't been afraid to use nuclear weapons, the entire world ....... during the Cuban Missile Crisis.",
    options: {
      A: "could have destroyed",
      B: "was being destroyed",
      C: "might have been destroyed",
      D: "has been destroyed",
      E: "would have destroyed"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 245,
    question: "Yemen, ....... has beautiful mountains, deserts and some of the world's most beautiful traditional architecture, does not attract many tourists because of the many civil wars that have been fought there.",
    options: {
      A: "which",
      B: "what",
      C: "that",
      D: "whose",
      E: "where"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 246,
    question: "The new King of Morocco behaves ....... he really means to bring about major democratic reforms in his country.",
    options: {
      A: "no matter",
      B: "however",
      C: "as long as",
      D: "even though",
      E: "as though"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 247,
    question: "Our neighbour .......... his lawn for weeks, and now it looks like a jungle.",
    options: {
      A: "is neglecting",
      B: "had neglected",
      C: "was neglecting",
      D: "will have neglected",
      E: "has been neglecting"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 248,
    question: "In Britain the taxes are ....... people leave the country to escape them.",
    options: {
      A: "too high",
      B: "as high as",
      C: "so high that",
      D: "the highest",
      E: "higher than ....... having no navigational instruments, the ancient"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 249,
    question: "Polynesians were able to navigate over vast distances of the Pacific Ocean guided only by the stars and the waves. A) Owing to B) Whereas C) In case D) In spite of E) As though The Battle of Trafalgar, which ........ Britain as the world's foremost maritime power, ........ off the coast of Spain in 1805.",
    options: {
      A: "established/was fought",
      B: "has established/had fought",
      C: "would establish/should be fought",
      D: "is establishing/was being fought",
      E: "establishes/would have fought"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 250,
    question: "Although the combined French and Spanish fleets were ....... larger than the British fleet, the British ships were handled ...... .",
    options: {
      A: "too/skilfully enough",
      B: "far/more skilfully",
      C: "so/most skilfully",
      D: "more/as skilfully",
      E: "much/too skilfully"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 251,
    question: "A company's choice of ....... to maximise profits ....... to attempt to protect the environment is often dictated by public opinion.",
    options: {
      A: "neither/and",
      B: "the more/as much",
      C: "as much/than",
      D: "whether/or",
      E: "barely/when"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 252,
    question: "We can ....... go to a film or stay in; it doesn't matter to me.",
    options: {
      A: "not only",
      B: "whether",
      C: "either",
      D: "both",
      E: "neither"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 253,
    question: "The 20th century, during ....... unprecedented means to save and prolong life were developed, also saw the development of unprecedented means to destroy life.",
    options: {
      A: "that",
      B: "when",
      C: "whose",
      D: "what",
      E: "which"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 254,
    question: "There has never been ....... film as bloody as \\\"Saving Private Ryan\\\"",
    options: {
      A: "another",
      B: "such as",
      C: "so much",
      D: "any more",
      E: "whichever"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 255,
    question: "Moral codes that ....... to regulate human behaviour ....... with us since prehistoric times.",
    options: {
      A: "are seeking/will have been",
      B: "have sought/were",
      C: "are sought/will be",
      D: "seek/have been",
      E: "have been seeking/are"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 256,
    question: "The wedding was absolutely beautiful! You really.......... .",
    options: {
      A: "were coming",
      B: "should have come",
      C: "ought to come",
      D: "may have come",
      E: "had been coming"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 257,
    question: "Sometimes it seems to me that most men in Turkey are ....... interested in football ....... in whether Turkey joins the EU or not.",
    options: {
      A: "so/that",
      B: "more/than",
      C: "so/as",
      D: "such/that",
      E: "too/like"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 258,
    question: "Kemal Sunal, ....... films are still enjoyed by the young and the old alike, died of a heart attack in the year 2000.",
    options: {
      A: "whose",
      B: "what",
      C: "that",
      D: "whom",
      E: "when"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 259,
    question: "I remember ....... something about the time of the meeting, but I can't remember it now.",
    options: {
      A: "to tell",
      B: "to have told",
      C: "having told",
      D: "to be told",
      E: "being told"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 260,
    question: "After the crash, he awoke in hospital and ....... that he ....... off the road into a lake.",
    options: {
      A: "had been told/was driving",
      B: "told/has been driving",
      C: "was being told/drove",
      D: "was told/had driven",
      E: "has been told/would drive"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 261,
    question: "He was glad that he caught the bus at the last moment; otherwise, he ......... a taxi to work.",
    options: {
      A: "might have hired",
      B: "was supposed to hire",
      C: "would have had to hire",
      D: "will have hired",
      E: "is going to hire"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 262,
    question: "Of all the blouses I was shown at the store, I didn't like ........., so in the end, I decided to wear something suitable from my old ........ for my sister's wedding.",
    options: {
      A: "none/others",
      B: "any/ones",
      C: "either/one",
      D: "many/another",
      E: "much/any others"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 263,
    question: "The wind blew with ......... strength.......... it devastated all my flowers in the garden.",
    options: {
      A: "such/that",
      B: "the same/as",
      C: "more/than",
      D: "the most/for",
      E: "so/that"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 264,
    question: "Western Europeans have been surprised at ....... Turkish teams have been playing in European competitions.",
    options: {
      A: "so good",
      B: "much better",
      C: "such good",
      D: "how well",
      E: "too well"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 265,
    question: "Once you ....... the basics of English grammar, you............. it much easier to improve your speaking ability.",
    options: {
      A: "are mastering/have found",
      B: "have mastered/will find",
      C: "master /are finding",
      D: "mastered/are finding",
      E: "were mastering/had found"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 266,
    question: "According to the headmaster, repairs to the school ....... before the school year.......... .",
    options: {
      A: "are completing/has begun",
      B: "will complete/is beginning",
      C: "are being completed/will begin",
      D: "have been completed/began",
      E: "will have been completed/begins"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 267,
    question: "The captain of the ship ......... a boat in the distance which ........ strangely.",
    options: {
      A: "was spotted/floated",
      B: "would spot/has floated",
      C: "spotted/was floating",
      D: "had spotted/would be floating",
      E: "has spotted/had floated"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 268,
    question: "As they ....... nearer, it became apparent that the boat ........ at sea for a long time.",
    options: {
      A: "would draw/would have drifted",
      B: "drew/had been drifting",
      C: "have drawn/drifted",
      D: "were drawing/was drifting",
      E: "draw/has been drifting"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 269,
    question: "I made a big effort ....... to the university for registration today only ....... that registration does not begin until next week.",
    options: {
      A: "getting/having informed",
      B: "having got/to inform",
      C: "to have got/informing",
      D: "to get/to be informed",
      E: "get/to have been informed"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 270,
    question: "Make sure that you ........ everything necessary before we ........ out for our journey.",
    options: {
      A: "have packed/set",
      B: "are packing/will set",
      C: "packed/are setting",
      D: "will pack/have set",
      E: "were packing/were setting"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 271,
    question: "Mr Eames ....... well for several days before he ....... to hospital from the office yesterday.",
    options: {
      A: "didn't feel/was going to be taken",
      B: "hadn't been feeling/had to be taken",
      C: "hasn't felt/has been taken",
      D: "wasn't feeling/should have taken",
      E: "wouldn't feel/could have taken"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 272,
    question: "No one expected him to marry ........ beautiful woman ........ her.",
    options: {
      A: "such a/as",
      B: "so/that",
      C: "much/than",
      D: "the most/like",
      E: "too/for"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 273,
    question: "Though he studies ....... anyone else in the class, his marks are not very good.",
    options: {
      A: "the hardest",
      B: "so hard that",
      C: "harder than",
      D: "hard enough",
      E: "as hard"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 274,
    question: "I wish I was back in Istanbul because ....... city where I live now hasn't even got....... good football team.",
    options: {
      A: "the/",
      B: "a/any",
      C: "/the",
      D: "a/a",
      E: "the/a"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 275,
    question: "This term I ....... a paper about the plays of Christopher Marlowe, which ....... in the 16th century.",
    options: {
      A: "wrote/have been written",
      B: "had written/were writing",
      C: "was writing/have written",
      D: "write/were being written",
      E: "am writing/were written"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 276,
    question: "The police have promised to let us know ....... they get any news.",
    options: {
      A: "by the time",
      B: "as soon as",
      C: "until",
      D: "as far as",
      E: "whatever"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 277,
    question: "For the first several thousand years of human history, when nearly all work was in ....... agriculture ........ handicrafts, a great deal of labour was required.",
    options: {
      A: "whether/or",
      B: "so much/as",
      C: "such/that",
      D: "either/or",
      E: "barely/when"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 278,
    question: "As a result, ........ children in a family, ......... hands there were to get the work done.",
    options: {
      A: "so many/so much",
      B: "the most/the most",
      C: "the more/the more",
      D: "such a lot/enough",
      E: "too many/so many"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 279,
    question: "In those days, only ........ children of ....... wealthy and powerful avoided physical labour. A) a/a B) some/a C) the/the D) In industrialised nations today, child labour is ........ an economic necessity because there is an adequate supply of adult labour.",
    options: {
      A: "rather than",
      B: "no longer",
      C: "so much",
      D: "much more",
      E: "any more"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 280,
    question: "In the underdeveloped and developing nations, ....... so much of the work is still agricultural and preindustrial, children still work because the labour of ....... hands is needed.",
    options: {
      A: "when/every",
      B: "which/each",
      C: "where/all",
      D: "that/most",
      E: "whose/many"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 281,
    question: "Women should never drink alcohol or smoke cigarettes ....... pregnancy. A) while B) when C) unless D) during E)in case Many people think of encyclopedias ........ the only reference books, which is correct to a degree because, of all reference tools, encyclopedias are .......important.",
    options: {
      A: "for/so much",
      B: "like/too",
      C: "such/more",
      D: "rather/as",
      E: "as/the most"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 282,
    question: "In a questionnaire, the wording of questions should be ...... neutral ...... possible, or it may influence the answer.",
    options: {
      A: "so/that",
      B: "such/as",
      C: "as/as",
      D: "more/than",
      E: "too/for"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 283,
    question: "For holiday-makers, hotels ........ by chains normally offer accommodation.............from the expensive to the luxurious.",
    options: {
      A: "to operate/ranged",
      B: "operating/to range",
      C: "being operated/range",
      D: "operated/ranging",
      E: "having operated/having ranged"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 284,
    question: "But there are many privately owned inns and hotels that offer adequate facilities, both rooms and meals, for much ......... chain hotels.",
    options: {
      A: "the most",
      B: "less than",
      C: "so much",
      D: "too many",
      E: "such a lot of"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 285,
    question: "However, among all, ....... expensive for the average traveller is the pension, or boardinghouse, which offers inexpensive rooms and meals.",
    options: {
      A: "the least",
      B: "so much",
      C: "the most",
      D: "the more",
      E: "far less"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 286,
    question: "Molly was disappointed, in the way her husband behaved after they were married, .........?",
    options: {
      A: "didn't he",
      B: "weren't they",
      C: "was she",
      D: "did he",
      E: "wasn't she"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 287,
    question: "Due to bureaucratic procedure, the relief effort ....... so slow that by the time the food arrives, large numbers of children ....... of hunger.",
    options: {
      A: "is/are dying",
      B: "was/may have died",
      C: "had been/have died",
      D: "has been/will have died",
      E: "will be would be dying"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 288,
    question: "You ....... antibiotics unless you have consulted a doctor, or you ....... yourself more harm than good.",
    options: {
      A: "can't take/must have done",
      B: "won't take/have done",
      C: "weren't taking/can do",
      D: "shouldn't take/might do",
      E: "haven't taken/will do"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 289,
    question: "People ....... on land ....... by the dam are seeking compensation from the government.",
    options: {
      A: "lived/being flooded",
      B: "have lived/flooded",
      C: "to be living/flooding",
      D: "live/to have been flooded",
      E: "living/to be flooded"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 290,
    question: "I could think of ....... to say to console Jennifer other than to say that ........ was going to be all right soon.",
    options: {
      A: "no one/everywhere",
      B: "anything/nothing",
      C: "nothing/everything",
      D: "someone/everybody",
      E: "something/nobody"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 291,
    question: "I ....... a client around 8 o'clock, so it is better if you ........ later.",
    options: {
      A: "have been interviewing/came",
      B: "will interview/have come",
      C: "am interviewing/will come",
      D: "will be interviewing/come",
      E: "would have interviewed/were coming ......."
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 292,
    question: "France was under German invasion ....... World War II, there was an active underground resistance. . A) Despite/in B) While/during C) So that/when D) In case/for E) The moment/at I....... Japan claims that it is hunting limited numbers of whales for \\\"scientific studies\\\", other countries claim that the Japanese are engaged in large scale whale hunting for meat. A) Whereas B) Because of C) As long as D) In order that E) Besides Most of the plays .......... in ancient Greece are enjoyable performances...........even today.",
    options: {
      A: "written/to watch",
      B: "being written /watch",
      C: "having written/watched",
      D: "writing/watching",
      E: "to be written/being watched"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 293,
    question: "I arrived at work worried about being late only to realise that I ....... because it was Sunday.",
    options: {
      A: "must not have bothered",
      B: "wasn't going to bother",
      C: "couldn't have bothered",
      D: "needn't have bothered",
      E: "don't have to bother"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 294,
    question: "Aya Irini ....... in the 6th century AD as a church, but today it ....... for concerts and exhibitions.",
    options: {
      A: "built/has been used",
      B: "was built/is used",
      C: "had been built/has used",
      D: "has been built/is being used",
      E: "was building/will have used"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 295,
    question: "I got the time wrong, the match ....... by the time we.......... .",
    options: {
      A: "was beginning/have arrived",
      B: "will have begun/had arrived",
      C: "had begun/arrived",
      D: "has begun/will be arriving",
      E: "began/were arriving"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 296,
    question: "With the opening of the new Metro system, it is hoped that there will be.........traffic during rush hour.",
    options: {
      A: "a few",
      B: "the least",
      C: "fewer",
      D: "some",
      E: "less"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 297,
    question: "You'd better wear another shirt as your blue one needs ....... and I have no time....... it now.",
    options: {
      A: "to iron/to have done",
      B: "to be ironed/doing",
      C: "being ironed/done",
      D: "ironing/to do",
      E: "ironed/to be doing ......... in a conference in"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 298,
    question: "New York, I met my high school maths teacher, which was a nice coincidence. A) Although B) Despite C) Since D) During E) While The restoration project ....... more quickly than anyone.......... .",
    options: {
      A: "has completed/would have expected",
      B: "was completed/had expected",
      C: "was completing/was expecting",
      D: "had been completed/is expected",
      E: "is being completed/will be expected ....... of the ministers was expecting such"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 299,
    question: "Fewer/a C) Some/any D) Any/ E) No/some A: Do you think Julie will participate in the project? B: ....... She would be more of a hindrance than help. A) I'm afraid so. B) Does she really? C) I hope not. D) Nor will she. E) Neither do I. I borrowed ....... fantastic book from Mark, but forgot to return it to him on...........day we had determined. A) a/a B) the/a C) a/the D) Surely she ....... the race if she ....... down just before the finish line.",
    options: {
      A: "would win/wasn't falling",
      B: "was winning/wouldn't fall",
      C: "had won/didn't fall",
      D: "was going to win/hasn t fallen",
      E: "would have won/hadn't fallen"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 300,
    question: "There is a growing realisation and worry that oil and natural gas are being used up relatively quickly, ....... has led to a search for alternative fuel sources.",
    options: {
      A: "which",
      B: "when",
      C: "where",
      D: "that",
      E: "why"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 301,
    question: "Before penicillin ....... , people ....... of diseases that are easily cured today.",
    options: {
      A: "was discovering/had died",
      B: "was discovered/used to die",
      C: "had been discovered/have died",
      D: "was being discovered/might die",
      E: "have been discovered/died"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 302,
    question: "You ....... up so late the night before your exam; now you look too tired to stay awake until the end of the exam.",
    options: {
      A: "weren't going to stay",
      B: "haven't been staying",
      C: "may not have stayed",
      D: "ought not to have stayed",
      E: "didn't use to stay"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 303,
    question: "He listened to her story ....... she could not help but trust him.",
    options: {
      A: "such a sympathetic",
      B: "too sympathetically",
      C: "so sympathetically that",
      D: "as sympathetically as",
      E: "more sympathetic than"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 304,
    question: "The first prime minister of the Democratic Republic of the Congo, Patrice Lumumba, held office for less than three months and was murdered by his opponents four months after ......... from office.",
    options: {
      A: "having ejected",
      B: "being ejected",
      C: "to eject",
      D: "to be ejected",
      E: "to be ejecting"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 305,
    question: "Today, he is revered as a national hero, ........ for his courage and ambitions......... for his accomplishments.",
    options: {
      A: "more/than",
      B: "so/that",
      C: "such/as",
      D: "the most/like",
      E: "too much/that ......... in 1968,"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 306,
    question: "Martin Luther King is still an inspirational figure to Americans of all races. A) Assassinating B) Having assassinated C) To assassinate D) Assassinated E) To be assassinated No one knows ....... he would have become the first black president of the United States or not had he not been killed.",
    options: {
      A: "why",
      B: "how",
      C: "when",
      D: "whether",
      E: "that"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 307,
    question: "Uranus and Neptune are two of the largest planets in our solar system, but...........of them is visible with the naked eye.",
    options: {
      A: "every",
      B: "neither",
      C: "both",
      D: "either",
      E: "any"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 308,
    question: "Because of rising populations and over-fishing, fish are not nearly ....... plentiful....... they used to be.",
    options: {
      A: "much/than",
      B: "so/that",
      C: "too/for",
      D: "such/as",
      E: "as/as"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 309,
    question: "I ....... to Sierra Leone on holiday just now if I ....... you, as it is not very secure nowadays.",
    options: {
      A: "don't go/would be",
      B: "haven't gone/had been",
      C: "wouldn't go/were",
      D: "wasn't going/could be",
      E: "didn't go/have been"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 310,
    question: "We ......... so busy at work these days that I'm afraid summer ......... over before I can go on holiday.",
    options: {
      A: "are/will be",
      B: "would be/was",
      C: "will be/has been",
      D: "have been/is",
      E: "were/would be"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 311,
    question: "Writing originated in ancient Mesopotamia, ....... it was first used for keeping records and accounts.",
    options: {
      A: "which",
      B: "where",
      C: "that",
      D: "when",
      E: "how ......... is thought to be attractive has changed so much in each period of"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 312,
    question: "That C) When D) What E) Who Our company hired six new employees this year, all of ....... are fluent in at least one foreign language. A) B) whose C) that D) who E) whom Computer technology, which ....... at a rapid rate, ....... jobs for many young university graduates.",
    options: {
      A: "is developing/had provided",
      B: "has been developing/provides",
      C: "has developed/has been provided",
      D: "developed/is being provided",
      E: "was developing/is providing ....... you had been given better financial advice,"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 313,
    question: "If only C) Unless D) In spite of E) By the time ........ you do, don't forget to pay the electricity bill today. A) However B) Whomever C) Whichever D) Whenever E) Whatever The Olympics provide the world's best athletes with a chance to win glory both for ....... and for ....... country.",
    options: {
      A: "their/their own",
      B: "them/theirs",
      C: "themselves/their",
      D: "their own/them",
      E: "them/themselves ....... sculpture survives that can be definitely attributed to"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 314,
    question: "Leonardo da Vinci. A) All B) Some C) Several D) No E) None But from the numerous sketches for unfinished projects, it is known that he brought to sculpture ........ ingenuity and inventiveness ........ he gave to painting.",
    options: {
      A: "the same/as",
      B: "so/that",
      C: "such/that",
      D: "rather/than",
      E: "similar/for ....... rice is a staple food for some parts of the world, just as ."
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 315,
    question: "Any/ /the The first paved road in the world is believed ........ in about 2500 BC in Egypt as an aid to the construction of the Great Pyramids.",
    options: {
      A: "to have been built",
      B: "to be built",
      C: "having built",
      D: "having been built",
      E: "to be building"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 316,
    question: "The Sinai Peninsula ........ under Egyptian control since World War I. A) has been B) was C) will be D) is E)can be Israel ....... the Sinai Peninsula during the Six-Day War of 1967, but under the terms of the 1979 peace treaty, it ....... to Egypt in 1982.",
    options: {
      A: "has occupied/returned",
      B: "was occupying/would return",
      C: "had occupied/has been returned",
      D: "occupied/was returned",
      E: "would occupy/was returning"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 317,
    question: "The Monastery of St. Catherine, which was founded in about AD 527 at the base of Mount Sinai, is probably the world's ......... continuously inhabited Christian monastery.",
    options: {
      A: "elder",
      B: "eldest",
      C: "oldest",
      D: "older",
      E: "so old"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 318,
    question: "Thailand is the home of the bridge on the River Kwai, ....... was made famous by the film of the same name starring Alec Guiness.",
    options: {
      A: "where",
      B: "what",
      C: "which",
      D: "whose",
      E: "when"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 319,
    question: "Apparently, I walked right by the building ....... I was looking for without recognising it. A) in which B) C) whose D) where E) when The first time I ....... the border into Malaysia, I felt at home even though I ...........there before.",
    options: {
      A: "crossed/hadn't been",
      B: "was crossing/wouldn't be",
      C: "have crossed/wasn't",
      D: "had crossed/haven't been",
      E: "will be crossing/won't be"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 320,
    question: "The mechanic told me that he ....... my car today if he ....... the parts.",
    options: {
      A: "is fixing/may get",
      B: "fixes/can get",
      C: "would fix/could get",
      D: "has fixed/should get",
      E: "can fix/will get"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 321,
    question: "We had such a wonderful holiday that we wished it ....... never.......... .",
    options: {
      A: "is/ending",
      B: "will/end",
      C: "was/ending",
      D: "has/ended",
      E: "would/end"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 322,
    question: "The population of Istanbul is about ten times ....... it was twenty-five years ago.",
    options: {
      A: "large enough",
      B: "so large that",
      C: "too large for",
      D: "as large as",
      E: "the largest"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 323,
    question: "Stephen did not really want the job that I got,..........?",
    options: {
      A: "didn't he",
      B: "did I",
      C: "was he",
      D: "did he",
      E: "didn't"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 324,
    question: "I In western Tibet, there is a mountain called Kailash, which ...... Hindus.........Buddhists regard as the centre of the world.",
    options: {
      A: "the same/as",
      B: "whether/or",
      C: "such/as",
      D: "rather/than",
      E: "both/and"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 325,
    question: "I was on a cycling trip around Europe ....... I first met my future wife.",
    options: {
      A: "unless",
      B: "during",
      C: "when",
      D: "nowhere",
      E: "whenever"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 326,
    question: "Don't phone me at home ....... you have a genuinely valid reason.",
    options: {
      A: "unless",
      B: "however",
      C: "provided that",
      D: "so that",
      E: "in spite of"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 327,
    question: "I wish I ....... this medicine for a whole week; the side effects are worse than the disease.",
    options: {
      A: "don't have to take",
      B: "didn't have to take",
      C: "won't be taking",
      D: "haven't been taking",
      E: "must not have taken ......."
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 328,
    question: "I ask Jayne to go out with me, she makes some silly excuse. A) Sometime B) Every time C) Both times D) Either lime E) Sometimes ....... she says she has to wash her hair, and on ....... occasions, she says she has to stay in with her sick parakeet. A) All the time/another B) Neither time/the other C) Any time/any other D) Sometimes/other E) Every time/some other Somehow the spies managed ....... atomic secrets out of the United States without ....... by the FBI.",
    options: {
      A: "smuggle/having been caught",
      B: "to have smuggled/catching",
      C: "to smuggle/being caught",
      D: "smuggling/to catch",
      E: "to be smuggled/to have caught"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 329,
    question: "They did not do it out of loyalty to another country, but simply ....... make a lot of money.",
    options: {
      A: "even if",
      B: "in order to",
      C: "in case",
      D: "so that",
      E: "because"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 330,
    question: "The government cannot decide between several economic programs because, with the elections approaching, ....... one it chooses must satisfy the voters.",
    options: {
      A: "however",
      B: "whatever",
      C: "whomever",
      D: "whichever",
      E: "whenever"
    },
    correct: "D",
    explanation: ""
  },
  {
    no: 331,
    question: "People contribute to charities so that they can help people less fortunate than.......... .",
    options: {
      A: "themselves",
      B: "another",
      C: "they each",
      D: "each other",
      E: "their own"
    },
    correct: "B",
    explanation: ""
  },
  {
    no: 332,
    question: "If you are contributing to a charity, however, you should investigate it first to be sure exactly ....... your money is going.",
    options: {
      A: "that",
      B: "which",
      C: "where",
      D: "how",
      E: "whom"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 333,
    question: "For example, some charities put ....... money into administration that there is....... left over for good works.",
    options: {
      A: "too much/some",
      B: "more/no",
      C: "enough/none",
      D: "so much/little",
      E: "whole/not much"
    },
    correct: "C",
    explanation: ""
  },
  {
    no: 334,
    question: "Although it seemed natural to our ancestors, slavery is now considered........... barbaric institution ....... it is banned in every country in the world.",
    options: {
      A: "so/that",
      B: "the most/than",
      C: "as/as",
      D: "too/so",
      E: "such a/that ....... religious restrictions, the beautiful beaches in"
    },
    correct: "E",
    explanation: ""
  },
  {
    no: 335,
    question: "Saudi Arabia will never become tourist resorts. A) Since B) However C) Although D) Due to E) In case There were ....... points of contention to be resolved in a single meeting, so we decided to continue the next day.",
    options: {
      A: "too many",
      B: "the most",
      C: "enough",
      D: "such a lot",
      E: "so much"
    },
    correct: "A",
    explanation: ""
  },
  {
    no: 336,
    question: "We ....... home to discover that our house ....... by the bank while we were on holiday.",
    options: {
      A: "arrive/is being repossessed",
      B: "were arriving/was repossessing",
      C: "have arrived/is repossessed",
      D: "had arrived/has repossessed",
      E: "arrived/had been repossessed"
    },
    correct: "C",
    explanation: ""
  }
];

// Gramer sorularını aiGramerArsiv'e yükle (localStorage'da yoksa)
window.aiGramerArsiv = (function() {
    const saved = JSON.parse(localStorage.getItem('ydt_gramer_arsiv') || '[]');
    if (saved.length > 0) return saved;
    // İlk yüklemede GRAMMAR_SORULARI'ndan oluştur
    return GRAMMAR_SORULARI.map(s => ({
        question: s.question,
        options: s.options,
        correct: s.correct,
        explanation: s.explanation || ''
    }));
})();
window._arsivGroupPage     = window._arsivGroupPage     || 1; // 10'luk sayfa
const BANK_PAGE_SIZE  = 50; // accordion sub-liste başına maks soru
const BANK_GROUP_SIZE = 10; // içerik alanında aynı anda gösterilen soru
const PARA_GROUP_SIZE = 10; // paragraf grubu başına pasaj sayısı

function renderArsiv() {
    /* ═══════════════════════════════════════════════════════
       SORU BANKASI — v4.0
       Sol sidebar nav + sağ içerik alanı
       bk- CSS sınıflarını tam kullanır
       ═══════════════════════════════════════════════════════ */

    const arsiv   = window.aiArsiv || [];
    const filter  = document.getElementById('arsiv-list-filter')?.value || '';
    const sidebar = document.getElementById('bk-sidebar');
    const cont    = document.getElementById('arsiv-content');
    if (!sidebar || !cont) return;

    // ── Veri özeti ──────────────────────────────────────────
    const filteredArsiv   = filter ? arsiv.filter(e => e.listName === filter) : arsiv;
    const totalKelime     = filteredArsiv.length;
    const kelimePages     = Math.max(1, Math.ceil(totalKelime / BANK_PAGE_SIZE));

    const pSorular        = window.paragrafSorular || {};
    const pKeys           = Object.keys(pSorular);
    const totalParagraf   = pKeys.reduce((s, k) => s + (pSorular[k].questions||[]).length, 0);
    const paraGroupCount  = Math.max(1, Math.ceil(pKeys.length / PARA_GROUP_SIZE));

    const gramerArsiv     = window.aiGramerArsiv || [];
    const totalGramer     = gramerArsiv.length;
    const gramerPages     = Math.max(1, Math.ceil(totalGramer / BANK_PAGE_SIZE));

    const clozeArsiv      = window.aiClozeArsiv      || [];
    const yakinArsiv      = window.aiYakinArsiv       || [];
    const paraComArsiv    = window.aiParaComArsiv     || [];
    const diyalogArsiv    = window.aiDiyalogArsiv     || [];
    const durumArsiv      = window.aiDurumArsiv       || [];
    const paraBozArsiv    = window.aiParaBozArsiv     || [];

    const grandTotal = totalKelime + totalParagraf + totalGramer +
                       clozeArsiv.length + yakinArsiv.length + paraComArsiv.length +
                       diyalogArsiv.length + durumArsiv.length + paraBozArsiv.length;

    // Badge güncelle
    const badge = document.getElementById('bk-total-badge');
    if (badge) badge.textContent = grandTotal || '—';

    // ── Aktif seçim ─────────────────────────────────────────
    const active = window._arsivActiveSubList || 'overview';

    // ── Kategoriler tanımı ──────────────────────────────────
    const cats = [
        {
            key: 'kelime', theme: 'bkt-kelime', icon: '📝', label: 'Kelime', count: totalKelime,
            desc: 'Çoktan seçmeli', color: '#4f46e5',
            subs: Array.from({length: kelimePages}, (_, i) => ({
                key: `kelime_${i+1}`,
                label: `Kelime Soruları ${i+1}`,
                range: `${i*BANK_PAGE_SIZE+1}–${Math.min((i+1)*BANK_PAGE_SIZE, totalKelime)}`,
                count: Math.min(BANK_PAGE_SIZE, totalKelime - i*BANK_PAGE_SIZE)
            }))
        },
        {
            key: 'paragraf', theme: 'bkt-paragraf', icon: '📖', label: 'Paragraf', count: totalParagraf,
            desc: `${pKeys.length} pasaj`, color: '#059669',
            subs: pKeys.length === 0
                ? [{key:'paragraf_import', label:'Paket Yükle', range:'', count:0, isImport:true}]
                : Array.from({length: paraGroupCount}, (_, gi) => {
                    const sk = gi * PARA_GROUP_SIZE;
                    const ek = Math.min((gi+1)*PARA_GROUP_SIZE, pKeys.length);
                    const gc = pKeys.slice(sk, ek).reduce((s,k)=>s+(pSorular[k].questions||[]).length,0);
                    return { key:`paragraf_g${gi+1}`, label:`Pasajlar ${gi+1}`, range:`${sk+1}–${ek}. pasaj`, count:gc };
                })
        },
        {
            key: 'gramer', theme: 'bkt-gramer', icon: '⚙️', label: 'Gramer', count: totalGramer,
            desc: 'Grammar soruları', color: '#d97706',
            subs: Array.from({length: gramerPages}, (_, i) => ({
                key: `gramer_${i+1}`,
                label: `Gramer Soruları ${i+1}`,
                range: `${i*BANK_PAGE_SIZE+1}–${Math.min((i+1)*BANK_PAGE_SIZE, totalGramer)}`,
                count: Math.min(BANK_PAGE_SIZE, totalGramer - i*BANK_PAGE_SIZE)
            }))
        }
    ];

    const ydt_cats = [
        { key:'cloze',    theme:'bkt-cloze',    icon:'🔵', label:'Cloze Test',         count:clozeArsiv.length,   desc:'Boşluk doldurma',    color:'#7c3aed', coming: clozeArsiv.length===0 },
        { key:'yakin',    theme:'bkt-yakin',     icon:'🔤', label:'Yakın Anlamlı',       count:yakinArsiv.length,   desc:'Cümle eşleşme',      color:'#be185d', coming: yakinArsiv.length===0 },
        { key:'paraCom',  theme:'bkt-ptamam',    icon:'🧩', label:'Para. Tamamlama',     count:paraComArsiv.length, desc:'Paragraf tamamlama', color:'#0d9488', coming: paraComArsiv.length===0 },
        { key:'diyalog',  theme:'bkt-diyalog',   icon:'💬', label:'Diyalog Tamamlama',   count:diyalogArsiv.length, desc:'Diyalog boşlukları', color:'#c2410c', coming: diyalogArsiv.length===0 },
        { key:'durum',    theme:'bkt-durum',     icon:'🎭', label:'Durum Soruları',       count:durumArsiv.length,   desc:'Bağlamsal sorular',  color:'#b45309', coming: durumArsiv.length===0 },
        { key:'paraBoz',  theme:'bkt-butunluk',  icon:'🚫', label:'Para. Bütünlüğü',     count:paraBozArsiv.length, desc:'Yabancı cümle bul',  color:'#4d7c0f', coming: paraBozArsiv.length===0 }
    ];

    // ════════════════════════════
    // SOL SIDEBAR OLUŞTUR
    // ════════════════════════════
    let sbHtml = '';

    // Overview butonu
    sbHtml += `
    <button class="bk-nav-cat-btn ${active==='overview'?'bk-cat-open':''}"
            onclick="selectArsivSubList('overview')" style="border-radius:10px;margin-bottom:2px;">
        <div class="bk-nav-cat-icon" style="background:#f3f4f6;color:#6b7280;">📊</div>
        <div class="bk-nav-cat-info">
            <span class="bk-nav-cat-name">Genel Bakış</span>
            <span class="bk-nav-cat-count">${grandTotal} toplam soru</span>
        </div>
    </button>`;

    // Ana kategoriler
    sbHtml += `<div class="bk-nav-section-label">Ana Kategoriler</div>`;
    cats.forEach(cat => {
        const isOpen = active.startsWith(cat.key);
        sbHtml += `
        <div class="bk-nav-cat ${cat.theme}">
            <button class="bk-nav-cat-btn ${isOpen?'bk-cat-open':''}"
                    onclick="bkToggleCat('${cat.key}')">
                <div class="bk-nav-cat-icon">${cat.icon}</div>
                <div class="bk-nav-cat-info">
                    <span class="bk-nav-cat-name">${cat.label}</span>
                    <span class="bk-nav-cat-count">${cat.count} soru</span>
                </div>
                <span class="bk-nav-cat-badge">${cat.count}</span>
                <span class="bk-nav-cat-chev">▾</span>
            </button>
            <div class="bk-nav-sub ${isOpen?'bk-sub-open':''}">
                ${cat.subs.map(sub => sub.isImport
                    ? `<button class="bk-nav-add-btn" onclick="showImportParagrafModal()">＋ Paket Yükle</button>`
                    : `<button class="bk-nav-sub-btn ${active===sub.key?'bk-sub-active':''}"
                                onclick="selectArsivSubList('${sub.key}')">
                            <span class="bk-nsb-label">${sub.label}</span>
                            <span class="bk-nsb-badge">${sub.count}</span>
                        </button>`
                ).join('')}
            </div>
        </div>`;
    });

    // YDT Soru Tipleri
    sbHtml += `<div class="bk-nav-section-label">YDT Soru Tipleri</div>`;
    ydt_cats.forEach(cat => {
        const isActive = active === cat.key;
        sbHtml += `
        <div class="bk-nav-cat ${cat.theme}">
            <button class="bk-nav-cat-btn ${isActive?'bk-cat-open':''}"
                    onclick="selectArsivSubList('${cat.key}')">
                <div class="bk-nav-cat-icon">${cat.icon}</div>
                <div class="bk-nav-cat-info">
                    <span class="bk-nav-cat-name">${cat.label}</span>
                    <span class="bk-nav-cat-count">${cat.coming ? 'Yakında' : cat.count+' soru'}</span>
                </div>
                ${!cat.coming ? `<span class="bk-nav-cat-badge">${cat.count}</span>` : ''}
            </button>
        </div>`;
    });

    sidebar.innerHTML = sbHtml;

    // Mobil pill bar
    const mobBar = document.getElementById('bk-mob-sub-bar');
    if (mobBar) {
        const allNavCats = [
            {key:'overview', icon:'📊', label:'Genel', theme:''},
            ...cats.map(c=>({...c})),
            ...ydt_cats.map(c=>({...c}))
        ];
        mobBar.innerHTML = allNavCats.map(c =>
            `<button class="bk-mob-sub-pill ${active===c.key||active.startsWith(c.key)?'bk-mob-active':''} ${c.theme||''}"
                     onclick="selectArsivSubList('${c.key}')">
                ${c.icon} ${c.label||c.key}
            </button>`
        ).join('');
        mobBar.style.display = '';
    }

    // ════════════════════════════
    // İÇERİK ALANI
    // ════════════════════════════

    // ─── GENEL BAKIŞ ────────────────────────────────────
    if (active === 'overview') {
        let ovHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe" style="background:#6366f1;"></div>
                <span class="bk-content-type-pill" style="background:#e0e7ff;color:#4f46e5;">Tüm Kategoriler</span>
                <span class="bk-content-title">Soru Bankası Genel Bakış</span>
            </div>
            <span class="bk-content-meta">${grandTotal} toplam soru</span>
        </div>
        <div class="bk-overview">`;

        const ovItems = [
            ...cats.map(c=>({icon:c.icon,label:c.label,count:c.count,theme:c.theme,desc:c.desc,key:c.key})),
            ...ydt_cats.map(c=>({icon:c.icon,label:c.label,count:c.count,theme:c.theme,desc:c.desc,key:c.key,coming:c.coming}))
        ];
        ovItems.forEach(item => {
            ovHtml += `
            <div class="bk-ov-card ${item.theme}" onclick="selectArsivSubList('${item.key}')">
                <div class="bk-ov-icon">${item.icon}</div>
                <div class="bk-ov-count">${item.count}</div>
                <div class="bk-ov-label">${item.label}</div>
                <div class="bk-ov-sub">${item.coming ? '🔒 Yakında eklenecek' : item.desc}</div>
                <div class="bk-ov-arrow">→</div>
            </div>`;
        });
        ovHtml += `</div>`;
        cont.innerHTML = ovHtml;
        return;
    }

    // ─── YDT "YAKINDA" KATEGORİLER ──────────────────────
    const ydtMatch = ydt_cats.find(c => c.key === active);
    if (ydtMatch && ydtMatch.coming) {
        cont.innerHTML = `
        <div class="bk-empty">
            <div class="bk-empty-ico">${ydtMatch.icon}</div>
            <div class="bk-empty-title">${ydtMatch.label}</div>
            <div class="bk-empty-sub">${ydtMatch.desc} soruları hazırlanıyor. Yakında bu kategoride sorular eklenecek!</div>
        </div>`;
        return;
    }

    // ─── GRAMER SUB-LİSTESİ ─────────────────────────────
    const gramerMatch = active.match(/^gramer_(\d+)$/);
    if (gramerMatch) {
        const gPI   = parseInt(gramerMatch[1]) - 1;
        const gSlice = gramerArsiv.slice(gPI * BANK_PAGE_SIZE, (gPI+1) * BANK_PAGE_SIZE);
        const gGroups = Math.max(1, Math.ceil(gSlice.length / BANK_GROUP_SIZE));
        const gGroupPg = Math.min(window._arsivGroupPage || 1, gGroups);
        window._arsivGroupPage = gGroupPg;
        const gActive = gSlice.slice((gGroupPg-1)*BANK_GROUP_SIZE, gGroupPg*BANK_GROUP_SIZE);
        if (!window._bankQMap) window._bankQMap = {};

        let gHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe"></div>
                <span class="bk-content-type-pill">⚙️ Gramer</span>
                <span class="bk-content-title">Gramer Soruları ${gramerMatch[1]}</span>
            </div>
            <span class="bk-content-meta">${gSlice.length} soru · ${(gGroupPg-1)*BANK_GROUP_SIZE+1}–${Math.min(gGroupPg*BANK_GROUP_SIZE,gSlice.length)} gösteriliyor</span>
        </div>`;

        gActive.forEach((item, idx) => {
            const globalIdx = (gGroupPg-1)*BANK_GROUP_SIZE + idx;
            const qNum = gPI*BANK_PAGE_SIZE + globalIdx + 1;
            const qId  = `gq_${qNum}`;
            window._bankQMap[qId] = { correct: item.correct, explanation: item.explanation||'', options: item.options||{} };
            const userAns  = window._bankAnswers?.[qId];
            const revealed = window._bankRevealed?.[qId];

            gHtml += `
            <div class="bk-q-card ${revealed ? (userAns===item.correct?'bk-correct':'bk-wrong') : ''}">
                <div class="bk-q-meta-row">
                    <span class="bk-q-num">${qNum}.</span>
                    <span class="bk-q-type-chip">⚙️ Gramer</span>
                    <span class="bk-q-date">#${qNum}</span>
                    ${revealed ? `<button class="bk-q-reset" onclick="resetBankQuestion('${qId}')" style="display:inline-flex;">↺ Tekrar</button>` : ''}
                </div>
                <div class="bk-q-text">${item.question||''}</div>
                <div class="bk-opts">
                    ${Object.entries(item.options||{}).map(([k,v]) => {
                        const isC = k === item.correct;
                        const isCh = k === userAns;
                        let cls = '';
                        if (revealed) { cls = isC ? 'bk-opt-c' : (isCh ? 'bk-opt-w' : ''); }
                        else if (isCh) cls = 'bk-opt-c';
                        return `<button class="bk-opt ${cls}" onclick="bankSelectGramer('${qId}','${k}')" ${revealed?'disabled':''}>
                            <span class="bk-opt-key">${k}</span>
                            <span class="bk-opt-text">${v}</span>
                            ${revealed&&isC?'<span style="margin-left:auto">✅</span>':''}
                            ${revealed&&isCh&&!isC?'<span style="margin-left:auto">❌</span>':''}
                        </button>`;
                    }).join('')}
                </div>
                ${item.explanation && revealed ? `
                <div class="bk-exp ${userAns===item.correct?'bk-exp-c':'bk-exp-w'}" style="display:block;">
                    <span class="bk-exp-lbl ${userAns===item.correct?'bk-exp-c':'bk-exp-w'}">💡 Açıklama</span>
                    ${item.explanation}
                </div>` : ''}
                ${!revealed ? `<div style="padding:0 16px 14px;"><button onclick="bankRevealGramer('${qId}')"
                    style="padding:6px 16px;border-radius:9px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit;">
                    Cevabı Gör</button></div>` : ''}
            </div>`;
        });

        if (gGroups > 1) {
            gHtml += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setArsivGroupPage(${gGroupPg-1})" ${gGroupPg<=1?'disabled':''}>‹</button>`;
            for (let p=1; p<=gGroups; p++) {
                gHtml += `<button class="bk-pg-btn ${p===gGroupPg?'bk-pg-act':''}" onclick="setArsivGroupPage(${p})">${(p-1)*BANK_GROUP_SIZE+1}–${Math.min(p*BANK_GROUP_SIZE,gSlice.length)}</button>`;
            }
            gHtml += `<button class="bk-pg-btn" onclick="setArsivGroupPage(${gGroupPg+1})" ${gGroupPg>=gGroups?'disabled':''}>›</button></div>`;
        }
        cont.innerHTML = gHtml;
        return;
    }

    // ─── PARAGRAF SUB-LİSTESİ ───────────────────────────
    const paraGMatch = active.match(/^paragraf_g(\d+)$/);
    if (paraGMatch) {
        const groupNum  = parseInt(paraGMatch[1]);
        const startIdx  = (groupNum-1) * PARA_GROUP_SIZE;
        const groupKeys = pKeys.slice(startIdx, startIdx + PARA_GROUP_SIZE);
        if (!window._bankQMap) window._bankQMap = {};
        if (!window._paraGroupPage) window._paraGroupPage = {};
        const pgKey   = `g${groupNum}`;
        const curPage = window._paraGroupPage[pgKey] || 1;
        const activePK = groupKeys[curPage-1];
        const pData    = activePK ? pSorular[activePK] : null;

        let pHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe" style="background:#10b981;"></div>
                <span class="bk-content-type-pill" style="background:#d1fae5;color:#059669;">📖 Paragraf</span>
                <span class="bk-content-title">Pasajlar ${groupNum}</span>
            </div>
            <span class="bk-content-meta">${startIdx+curPage}. pasaj · ${(pData?.questions||[]).length} soru</span>
        </div>`;

        if (pData?.questions?.length) {
            window._currentPasajBaslik = pData.baslik || '';
            pHtml += `
            <div class="bk-pasaj-wrap">
                <div class="bk-pasaj-hdr">
                    <span class="bk-pasaj-title">${stripNumPrefix(pData.baslik)||'Paragraf'}</span>
                    <button class="bk-pasaj-goto" onclick="goToPasajOku()">📖 Okuma Modu →</button>
                </div>
                <div class="bk-pasaj-body">${(pData.metin||'').replace(/\n/g,'<br>')}</div>
            </div>`;

            pData.questions.forEach((q, qi) => {
                const qId = `pq_${activePK}_${qi}`;
                window._bankQMap[qId] = { correct: q.answer, explanation: q.explanation||'', options:{} };
                (q.options||[]).forEach(opt => { window._bankQMap[qId].options[opt[0]] = opt.slice(3); });

                pHtml += `
                <div class="bk-q-card" id="qcard_${qId}">
                    <div class="bk-q-meta-row">
                        <span class="bk-q-num" style="background:#d1fae5;color:#059669;">${qi+1}.</span>
                        <span class="bk-q-type-chip">${q.type||'Reading'}</span>
                    </div>
                    <div class="bk-q-text">${q.question}</div>
                    <div class="bk-opts" id="opts_${qId}">
                        ${(q.options||[]).map(opt=>{
                            const letter=opt[0];
                            return `<button class="bk-opt sb-opt-btn" id="opt_${qId}_${letter}"
                                onclick="solveBankQuestion('${qId}','${letter}')">
                                <span class="bk-opt-key">${letter}</span>
                                <span class="bk-opt-text">${opt.slice(3)}</span>
                            </button>`;
                        }).join('')}
                    </div>
                    <div class="bk-exp" id="exp_${qId}"></div>
                </div>`;
            });
        }

        // Pasaj sayfalandırma
        if (groupKeys.length > 1) {
            pHtml += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setParagrafGroupPage('${pgKey}',${curPage-1})" ${curPage<=1?'disabled':''}>‹</button>`;
            groupKeys.forEach((_, gi) => {
                const pg = gi+1;
                pHtml += `<button class="bk-pg-btn ${pg===curPage?'bk-pg-act':''}" onclick="setParagrafGroupPage('${pgKey}',${pg})">${startIdx+pg}</button>`;
            });
            pHtml += `<button class="bk-pg-btn" onclick="setParagrafGroupPage('${pgKey}',${curPage+1})" ${curPage>=groupKeys.length?'disabled':''}>›</button></div>`;
        }

        cont.innerHTML = pHtml;
        return;
    }

    // ─── KELİME SUB-LİSTESİ ─────────────────────────────
    const kelMatch = active.match(/^kelime_(\d+)$/);
    if (kelMatch) {
        const pageIdx    = parseInt(kelMatch[1]) - 1;
        const pageOffset = pageIdx * BANK_PAGE_SIZE;
        let   subItems   = filteredArsiv.slice(pageOffset, pageOffset + BANK_PAGE_SIZE);
        const totalGroups = Math.max(1, Math.ceil(subItems.length / BANK_GROUP_SIZE));
        const groupPage   = Math.min(window._arsivGroupPage || 1, totalGroups);
        window._arsivGroupPage = groupPage;
        const activeItems = subItems.slice((groupPage-1)*BANK_GROUP_SIZE, groupPage*BANK_GROUP_SIZE);

        if (!window._bankQMap) window._bankQMap = {};

        if (!activeItems.length) {
            cont.innerHTML = `<div class="bk-empty">
                <div class="bk-empty-ico">📝</div>
                <div class="bk-empty-title">Bu sayfada soru yok</div>
                <div class="bk-empty-sub">Farklı bir kategori seçin ya da AI Vocabulary Test çözerek sorular ekleyin.</div>
            </div>`;
            return;
        }

        let html = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe"></div>
                <span class="bk-content-type-pill">📝 Kelime</span>
                <span class="bk-content-title">Kelime Soruları ${kelMatch[1]}</span>
            </div>
            <span class="bk-content-meta">${subItems.length} soru · ${(groupPage-1)*BANK_GROUP_SIZE+1}–${Math.min(groupPage*BANK_GROUP_SIZE,subItems.length)} gösteriliyor</span>
        </div>`;

        activeItems.forEach((q, idx) => {
            const globalNum = pageOffset + (groupPage-1)*BANK_GROUP_SIZE + idx + 1;
            const qId       = `aq_${globalNum}`;
            window._bankQMap[qId] = { correct: q.correct, explanation: q.explanation||'', options: q.options||{} };
            const tarih = q.date ? new Date(q.date).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}) : '';
            const userAns  = window._bankAnswers?.[qId];
            const revealed = window._bankRevealed?.[qId];

            const optsHtml = Object.entries(q.options||{}).map(([k,v]) => {
                const isC  = k === q.correct;
                const isCh = k === userAns;
                let cls = '';
                if (revealed) { cls = isC ? 'bk-opt-c' : (isCh ? 'bk-opt-w' : ''); }
                else if (isCh) cls = 'bk-opt-c';
                return `<button class="bk-opt sb-opt-btn ${cls}" id="opt_${qId}_${k}"
                    onclick="solveBankQuestion('${qId}','${k}')" ${revealed?'disabled':''}>
                    <span class="bk-opt-key">${k}</span>
                    <span class="bk-opt-text">${v}</span>
                    ${revealed&&isC?'<span style="margin-left:auto">✅</span>':''}
                    ${revealed&&isCh&&!isC?'<span style="margin-left:auto">❌</span>':''}
                </button>`;
            }).join('');

            html += `
            <div class="bk-q-card ${revealed?(userAns===q.correct?'bk-correct':'bk-wrong'):''}">
                <div class="bk-q-meta-row">
                    <span class="bk-q-num">${globalNum}.</span>
                    ${q.listName ? `<span class="bk-q-word-chip">📚 ${q.listName}</span>` : ''}
                    ${q.word ? `<span class="bk-q-word-chip">🔑 ${q.word}</span>` : ''}
                    <span class="bk-q-date">${tarih}</span>
                    ${revealed ? `<button class="bk-q-reset" id="reset_${qId}" onclick="resetBankQuestion('${qId}')" style="display:inline-flex;">↺ Tekrar</button>` : ''}
                </div>
                <div class="bk-q-text">${q.question}</div>
                <div class="bk-opts">${optsHtml}</div>
                ${q.explanation && revealed ? `
                <div class="bk-exp ${userAns===q.correct?'bk-exp-c':'bk-exp-w'}" style="display:block;">
                    <span class="bk-exp-lbl ${userAns===q.correct?'bk-exp-c':'bk-exp-w'}">💡 Açıklama</span>
                    ${q.explanation}
                </div>` : ''}
            </div>`;
        });

        if (totalGroups > 1) {
            html += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setArsivGroupPage(${groupPage-1})" ${groupPage<=1?'disabled':''}>‹</button>`;
            for (let p=1; p<=totalGroups; p++) {
                const gs = (p-1)*BANK_GROUP_SIZE+1, ge = Math.min(p*BANK_GROUP_SIZE, subItems.length);
                html += `<button class="bk-pg-btn ${p===groupPage?'bk-pg-act':''}" onclick="setArsivGroupPage(${p})">${gs}–${ge}</button>`;
            }
            html += `<button class="bk-pg-btn" onclick="setArsivGroupPage(${groupPage+1})" ${groupPage>=totalGroups?'disabled':''}>›</button></div>`;
        }

        cont.innerHTML = html;
        return;
    }

    // Eşleşme yoksa overview'e dön
    cont.innerHTML = `<div class="bk-empty">
        <div class="bk-empty-ico">🗃️</div>
        <div class="bk-empty-title">Kategori seçilmedi</div>
        <div class="bk-empty-sub">Sol menüden bir kategori seçin.</div>
    </div>`;
}

// ─── Soru Bankası Kategori Toggle ────────────────────
function bkToggleCat(catKey) {
    // Aynı kategoriye tıklanınca ilk sub-listeyi aç
    const catPrefixes = { kelime:'kelime_1', paragraf:'paragraf_g1', gramer:'gramer_1' };
    const current = window._arsivActiveSubList || '';
    if (current.startsWith(catKey)) {
        // Zaten açık → overview'e dön
        window._arsivActiveSubList = 'overview';
    } else {
        window._arsivActiveSubList = catPrefixes[catKey] || catKey;
        window._arsivGroupPage = 1;
    }
    renderArsiv();
}

function toggleKelimeCard()       { bkToggleCat('kelime');   }
function toggleGramerCard()       { bkToggleCat('gramer');   }
function toggleParagrafBankCard() { bkToggleCat('paragraf'); }


function saveGramerSorusu(soruObj) {
    if (!window.aiGramerArsiv) window.aiGramerArsiv = [];
    window.aiGramerArsiv.push(soruObj);
    if (typeof window._saveData === 'function') window._saveData();
    renderArsiv();
}

function importGramerPaketi(sorular) {
    if (!window.aiGramerArsiv) window.aiGramerArsiv = [];
    sorular.forEach(s => window.aiGramerArsiv.push(s));
    if (typeof window._saveData === 'function') window._saveData();
    renderArsiv();
    return sorular.length;
}
function bankSelectGramer(qId, key) {
    if (!window._bankRevealed) window._bankRevealed = {};
    if (!window._bankAnswers)  window._bankAnswers  = {};
    if (window._bankRevealed[qId]) return;
    window._bankAnswers[qId] = key;
    renderArsiv();
}

function bankRevealGramer(qId) {
    if (!window._bankRevealed) window._bankRevealed = {};
    window._bankRevealed[qId] = true;
    renderArsiv();
}

function selectArsivSubList(key) {
    window._arsivActiveSubList = key;
    window._arsivGroupPage     = 1;
    const gMatch = key.match(/^paragraf_g(\d+)$/);
    if (gMatch) {
        if (!window._paraGroupPage) window._paraGroupPage = {};
        window._paraGroupPage[`g${gMatch[1]}`] = 1;
    }
    renderArsiv();
    const cont = document.getElementById('bk-sidebar');
    if (cont) cont.scrollTop = 0;
}

// Alt navigasyondan sayfa değiştir
function setArsivGroupPage(pg) {
    if (pg < 1) return;
    window._arsivGroupPage = pg;
    renderArsiv();
    const cont = document.getElementById('arsiv-content');
    if (cont) setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

// Paragraf grubu içinde pasaj sayfası değiştir
function setParagrafGroupPage(pgKey, pg) {
    if (pg < 1) return;
    if (!window._paraGroupPage) window._paraGroupPage = {};
    window._paraGroupPage[pgKey] = pg;
    renderArsiv();
    const cont = document.getElementById('arsiv-content');
    if (cont) setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}
window.setParagrafGroupPage = setParagrafGroupPage;

// Soru bankasında bir şık seç — veriyi global map'ten al
function solveBankQuestion(qId, selected) {
    const q       = window._bankQMap && window._bankQMap[qId];
    if (!q) return;
    const optsDiv = document.getElementById(`opts_${qId}`);
    if (!optsDiv || optsDiv.dataset.answered) return;
    optsDiv.dataset.answered = '1';

    const correct = q.correct;
    optsDiv.querySelectorAll('.sb-opt-btn').forEach(btn => {
        btn.disabled = true;
        const letter = btn.id.replace(`opt_${qId}_`, '');
        if (letter === correct) {
            btn.style.background  = '#f0fdf4';
            btn.style.borderColor = '#86efac';
            btn.style.color       = '#15803d';
            btn.style.fontWeight  = '700';
        } else if (letter === selected && selected !== correct) {
            btn.style.background  = '#fef2f2';
            btn.style.borderColor = '#fca5a5';
            btn.style.color       = '#dc2626';
            btn.style.fontWeight  = '700';
        }
    });

    // Açıklama — innerHTML ile HTML tagları düzgün render edilir
    const expDiv = document.getElementById(`exp_${qId}`);
    if (expDiv && q.explanation) {
        const borderColor = selected === correct ? '#22c55e' : '#ef4444';
        expDiv.style.borderLeftColor = borderColor;
        expDiv.innerHTML  = `<strong style="color:#6366f1;font-size:.78rem;">💡 Açıklama</strong><br><br>${q.explanation}`;
        expDiv.style.display = 'block';
    }

    const resetBtn = document.getElementById(`reset_${qId}`);
    if (resetBtn) resetBtn.style.display = 'inline-block';
}

// Soruyu sıfırla — tekrar çözülebilir
function resetBankQuestion(qId) {
    const q = window._bankQMap && window._bankQMap[qId];
    if (!q) return;
    const optsDiv = document.getElementById(`opts_${qId}`);
    if (!optsDiv) return;
    delete optsDiv.dataset.answered;

    optsDiv.querySelectorAll('.sb-opt-btn').forEach(btn => {
        btn.disabled          = false;
        btn.style.background  = 'var(--white)';
        btn.style.borderColor = 'var(--border)';
        btn.style.color       = 'var(--ink)';
        btn.style.fontWeight  = '500';
    });

    const expDiv = document.getElementById(`exp_${qId}`);
    if (expDiv) expDiv.style.display = 'none';

    const resetBtn = document.getElementById(`reset_${qId}`);
    if (resetBtn) resetBtn.style.display = 'none';
}

function clearArsiv() {
    const filter = document.getElementById('arsiv-list-filter')?.value || '';
    const msg = filter
        ? `"${filter}" listesine ait tüm arşiv silinsin mi?`
        : 'Tüm AI Vocabulary Test arşivi silinsin mi?';
    if (!confirm(msg)) return;
    if (filter) {
        window.aiArsiv = (window.aiArsiv || []).filter(e => e.listName !== filter);
    } else {
        window.aiArsiv = [];
    }
    window._saveData && window._saveData();
    updateArsivBadge();
    renderArsiv();
}

function toggleArsivCard(btn) {
    // Butonun bir sonraki kardeş elementi — arsiv-card-body
    const card    = btn.closest('.arsiv-word-card');
    const body    = card ? card.querySelector('.arsiv-card-body') : btn.nextElementSibling;
    const chevron = btn.querySelector('.arsiv-chevron');
    if (!body) return;
    const isOpen  = body.style.display !== 'none';
    body.style.display      = isOpen ? 'none' : 'block';
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ══════════════════════════════════════════════
// MOBİL MENÜ (DRAWER) KONTROLLERİ
// ══════════════════════════════════════════════
function mobToggleDrawer() {
    const drawer = document.getElementById('mob-drawer');
    if (drawer.classList.contains('open')) mobCloseDrawer();
    else {
        drawer.classList.add('open');
        document.getElementById('mob-overlay').classList.add('open');
        document.getElementById('mob-burger').classList.add('open');
        // ♿ Focus trap: Tab drawer içinde döngü yapar
        trapFocus(drawer);
    }
}

function mobCloseDrawer() {
    const drawer  = document.getElementById('mob-drawer');
    const overlay = document.getElementById('mob-overlay');
    const burger  = document.getElementById('mob-burger');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (burger)  burger.classList.remove('open');
    // ♿ Focus trap kaldır, burger'a focus döner
    releaseFocus();
}

function mobGoTo(pageId) {
    mobCloseDrawer();
    if (typeof showPage === 'function') showPage(pageId);
    if (pageId === 'admin-page') adminCheckAccess();
}

function mobRun(fn) {
    mobCloseDrawer();
    if (typeof fn === 'function') fn();
}

// ══════════════════════════════════════════════
// BAŞLANGIÇ
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// 👤 PROFİL SAYFASI
// ══════════════════════════════════════════════
function showProfilPage() {
    // İstatistikleri yenile
    let total = 0, learned = 0;
    Object.values(allData).forEach(list => {
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
    window.addEventListener('resize', setSidebarWidth);

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
            <button class="aiq-back-btn" onclick="if(typeof navTo==='function') navTo('index-page');">←</button>
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
                                    <button class="aiq-chip active" data-val="10" onclick="aiqSetCount(this,10)">10</button>
                                    <button class="aiq-chip" data-val="20" onclick="aiqSetCount(this,20)">20</button>
                                    <button class="aiq-chip" data-val="30" onclick="aiqSetCount(this,30)">30</button>
                                    <button class="aiq-chip" data-val="0" onclick="aiqSetCount(this,0)">Tümü</button>
                                </div>
                            </div>
                            <div class="aiq-setting-item">
                                <div class="aiq-setting-label">🎯 Zorluk</div>
                                <div class="aiq-setting-chips">
                                    <button class="aiq-chip active" data-val="ydt" onclick="aiqSetDiff(this,'ydt')">YDT</button>
                                    <button class="aiq-chip" data-val="kolay" onclick="aiqSetDiff(this,'kolay')">Kolay</button>
                                    <button class="aiq-chip" data-val="zor" onclick="aiqSetDiff(this,'zor')">Zor</button>
                                </div>
                            </div>
                            <div class="aiq-setting-item">
                                <div class="aiq-setting-label">📝 Soru Tipi</div>
                                <div class="aiq-setting-chips">
                                    <button class="aiq-chip active" data-val="bosluk" onclick="aiqSetType(this,'bosluk')">Boşluk</button>
                                    <button class="aiq-chip" data-val="anlam" onclick="aiqSetType(this,'anlam')">Anlam</button>
                                    <button class="aiq-chip" data-val="karisik" onclick="aiqSetType(this,'karisik')">Karışık</button>
                                </div>
                            </div>
                        </div>

                        <!-- API key -->
                        <div id="ai-key-section" style="display:none;margin-top:14px;">
                            <div class="aiq-section-label">🔑 API Anahtarı</div>
                            <div class="aiq-key-box">
                                <input type="password" id="ai-api-key" class="aiq-key-input" placeholder="Gemini API anahtarını girin...">
                                <button class="aiq-key-save-btn" onclick="saveKeyAndStart()">Kaydet ve Başla →</button>
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
                <button class="aiq-start-btn" id="aiq-start-btn" onclick="aiqBeginTest()">
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
                    <button class="aiq-stop-btn" onclick="aiqStopTest()">✕ Bitir</button>
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
                <button id="ai-next-btn" class="aiq-next-btn hidden" onclick="nextAIQuestion()">
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
                    <button class="aiq-start-btn" onclick="aiqBeginTest()" style="margin-top:4px;">🔄 Yeniden Başlat</button>
                    <button class="aiq-ghost-btn" onclick="aiqStopTest()">← Panele Dön</button>
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

let paragraflar = JSON.parse(localStorage.getItem('ydt_paragraflar')) || [];

function renderAdminParagrafListe() {
    const kutu = document.getElementById('admin-paragraf-liste');
    if (!kutu) return;
    if (!paragraflar.length) {
        kutu.innerHTML = '<p style="font-size:0.8rem;color:var(--ink3);margin-bottom:8px;">Henüz paragraf eklenmedi.</p>';
        return;
    }
    kutu.innerHTML = paragraflar.map((p, i) => {
        const key       = paragrafKey(p);
        const hasSorular = window.paragrafSorular && window.paragrafSorular[key] && (window.paragrafSorular[key].questions || []).length > 0;
        const soruCount  = hasSorular ? window.paragrafSorular[key].questions.length : 0;
        return `
        <div class="admin-paragraf-item" id="ap-item-${i}">
            <div class="ap-title">
                <span>📄 ${p.baslik}</span>
                <span class="ap-word-count">${Object.keys(p.kelimeler || {}).length} kelime</span>
            </div>
            <div class="ap-actions">
                <button class="ap-btn ap-btn-edit" onclick="editParagrafInAdmin(${i})">✏️ Düzenle</button>
                ${hasSorular ? `<button class="ap-btn ap-btn-sorular" onclick="deleteSorularFromAdmin(${i})" title="${soruCount} kaydedilmiş soruyu sil">🗑 ${soruCount} Soru</button>` : ''}
                <button class="ap-btn ap-btn-del"  onclick="deleteParagrafFromAdmin(${i})">🗑 Sil</button>
            </div>
        </div>`;
    }).join('');
}

function deleteSorularFromAdmin(index) {
    const p = paragraflar[index];
    if (!p || !confirm(`"${p.baslik}" paragrafının kaydedilmiş soruları silinsin mi?`)) return;
    const key = paragrafKey(p);
    delete window.paragrafSorular[key];
    window._saveData && window._saveData();
    renderAdminParagrafListe();
}

function addParagrafFromAdmin() {
    const title    = document.getElementById('new-p-title').value.trim();
    const text     = document.getElementById('new-p-text').value.trim();
    const wordsRaw = document.getElementById('new-p-words').value.trim();
    const editIdx  = parseInt(document.getElementById('edit-paragraf-index').value);

    if (!title || !text || !wordsRaw) {
        alert("Lütfen başlık, metin ve kelimeler alanlarının hepsini doldurun.");
        return;
    }

    const wordsObj = {};
    wordsRaw.split(',').forEach(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) wordsObj[parts[0].trim().toLowerCase()] = parts[1].trim();
    });

    if (editIdx >= 0) {
        // Düzenleme modu
        paragraflar[editIdx] = { baslik: title, metin: text, kelimeler: wordsObj };
    } else {
        // Yeni ekleme
        paragraflar.push({ baslik: title, metin: text, kelimeler: wordsObj });
    }

    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    cancelParagrafEdit();
    renderAdminParagrafListe();
    alert(editIdx >= 0 ? "Paragraf güncellendi ✓" : "Paragraf eklendi ✓");
}

function editParagrafInAdmin(index) {
    const p = paragraflar[index];
    document.getElementById('edit-paragraf-index').value = index;
    document.getElementById('new-p-title').value = p.baslik;
    document.getElementById('new-p-text').value  = p.metin;
    document.getElementById('new-p-words').value = Object.entries(p.kelimeler || {})
        .map(([k, v]) => `${k}:${v}`).join(', ');
    document.getElementById('paragraf-form-title').textContent = '✏️ Paragrafı Düzenle';
    document.getElementById('paragraf-save-btn').textContent   = '💾 Güncelle';
    document.getElementById('paragraf-form-cancel-btn').style.display = 'inline';
    // Forma scroll et
    document.getElementById('new-p-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteParagrafFromAdmin(index) {
    if (!confirm(`"${paragraflar[index].baslik}" silinsin mi?`)) return;
    paragraflar.splice(index, 1);
    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    renderAdminParagrafListe();
}

function cancelParagrafEdit() {
    document.getElementById('edit-paragraf-index').value      = '-1';
    document.getElementById('new-p-title').value              = '';
    document.getElementById('new-p-text').value               = '';
    document.getElementById('new-p-words').value              = '';
    document.getElementById('paragraf-form-title').textContent = '➕ Yeni Paragraf Ekle';
    document.getElementById('paragraf-save-btn').textContent  = '💾 Paragrafı Kaydet';
    document.getElementById('paragraf-form-cancel-btn').style.display = 'none';
}

// Menüye tıklandığında listeyi okuma sayfasına çeker ve açar
// Yardımcı: "1. Judo" → "Judo" gibi baştaki rakam+nokta+boşluk kaldır
function stripNumPrefix(title) {
    return (title || '').replace(/^\d+\.\s*/, '');
}

// Sayfa başına gösterilecek pasaj
const RH2_PAGE_SIZE = 6;
let _savedPage = 0;

function _buildPasajKartHTML(p, realIndex) {
    const icons = ['📘','📗','📙','📕','📓','📔','📒','📃','📑','🗒️'];
    const pSorular   = window.paragrafSorular || {};
    const key        = typeof paragrafKey === 'function' ? paragrafKey(p) : '';
    const qCount     = key && pSorular[key] ? (pSorular[key].questions || []).length : 0;
    const wCount     = p.kelimeler ? Object.keys(p.kelimeler).length : 0;
    const totalWords = p.metin ? p.metin.trim().split(/\s+/).length : 0;
    const readMin    = Math.ceil(totalWords / 180) || 1;
    const sentences  = p.metin ? p.metin.match(/[^.!?]+[.!?]+/g) || [] : [];
    const preview    = sentences.slice(0, 2).join(' ').trim() || (p.metin ? p.metin.trim().slice(0, 140) + '…' : '');
    const icon       = icons[realIndex % icons.length];
    return `<div class="rh2-card" onclick="showParagrafOku(${realIndex})">
        <div class="rh2-card-accent"></div>
        <div class="rh2-card-body">
            <div class="rh2-card-header">
                <div class="rh2-card-icon">${icon}</div>
                <div class="rh2-card-titlemeta">
                    <div class="rh2-card-title">${stripNumPrefix(p.baslik)}</div>
                    <div class="rh2-card-timing">⏱ ${readMin} dk · ${totalWords} kelime · ${sentences.length} cümle</div>
                </div>
            </div>
            ${preview ? `<div class="rh2-card-preview">${preview}</div>` : ''}
            <div class="rh2-card-footer">
                ${wCount  > 0 ? `<span class="rh2-pill rh2-pill-word">📖 ${wCount} kelime</span>` : ''}
                ${qCount  > 0 ? `<span class="rh2-pill rh2-pill-quiz">🎯 ${qCount} soru</span>` : '<span class="rh2-pill rh2-pill-none">Soru yok</span>'}
            </div>
        </div>
        <svg class="rh2-card-arrow" width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>`;
}

function _populateParagrafListesi(page) {
    const kutu = document.getElementById('paragraf-listesi-kutu');
    if (!kutu) return;
    if (page !== undefined) _savedPage = page;

    // Yeni→Eski sırala: savedAt'e göre descending
    // savedAt yoksa (eski pasajlar) index'lerini terse çevir: sonradan yüklenmiş gibi davranır
    const _withIdx = paragraflar.map((p, i) => ({ p, i }));
    const sortedParagraflar = _withIdx
        .sort((a, b) => {
            const ta = a.p.savedAt || 0;
            const tb = b.p.savedAt || 0;
            if (ta !== tb) return tb - ta;           // savedAt varsa yeniden eskiye
            return b.i - a.i;                        // savedAt yoksa sonraki index öne gelir
        })
        .map(x => x.p);

    const total      = sortedParagraflar.length;
    const totalPages = Math.ceil(total / RH2_PAGE_SIZE) || 1;
    if (_savedPage >= totalPages) _savedPage = totalPages - 1;
    if (_savedPage < 0) _savedPage = 0;

    kutu.innerHTML = '';

    if (total === 0) {
        kutu.innerHTML = `<div class="rh2-empty" style="grid-column:1/-1;">
            <div class="rh2-empty-icon">📂</div>
            <div class="rh2-empty-title">Henüz pasaj yüklenmedi</div>
            <div class="rh2-empty-sub">Yönetim panelinden YDT pasaj paketi yükleyin.</div>
        </div>`;
    } else {
        const startIdx = _savedPage * RH2_PAGE_SIZE;
        const endIdx   = Math.min(startIdx + RH2_PAGE_SIZE, total);
        let html = '';

        // Kartlar — sıralanmış diziden al
        for (let i = startIdx; i < endIdx; i++) {
            html += _buildPasajKartHTML(sortedParagraflar[i], paragraflar.indexOf(sortedParagraflar[i]));
        }

        // Sayfalama kontrolü
        if (totalPages > 1) {
            let pagerHTML = `<div class="rh2-pager" style="grid-column:1/-1;">`;
            pagerHTML += `<button class="rh2-pager-btn" onclick="_populateParagrafListesi(${_savedPage-1})" ${_savedPage===0?'disabled':''}>‹</button>`;
            for (let p = 0; p < totalPages; p++) {
                const isActive = p === _savedPage;
                if (totalPages <= 7 || Math.abs(p - _savedPage) <= 2 || p === 0 || p === totalPages-1) {
                    pagerHTML += `<button class="rh2-pager-btn ${isActive ? 'rh2-pager-active':''}" onclick="_populateParagrafListesi(${p})">${p+1}</button>`;
                } else if (Math.abs(p - _savedPage) === 3) {
                    pagerHTML += `<span class="rh2-pager-ellipsis">…</span>`;
                }
            }
            pagerHTML += `<button class="rh2-pager-btn" onclick="_populateParagrafListesi(${_savedPage+1})" ${_savedPage>=totalPages-1?'disabled':''}>›</button>`;
            pagerHTML += `<span class="rh2-pager-info">${startIdx+1}–${endIdx} / ${total} pasaj</span>`;
            pagerHTML += `</div>`;
            html += pagerHTML;
        }
        kutu.innerHTML = html;
    }

    // Count badge
    const cnt = document.getElementById('reading-hub-saved-count');
    if (cnt) cnt.textContent = total > 0 ? `${total} pasaj` : '';
    _updateRh2HeroStats();
}
window._populateParagrafListesi = _populateParagrafListesi;


function showParagrafListesi() {
    // Önce otomatik yüklemeyi dene
    if (typeof autoLoadParagrafPaketleri === 'function') autoLoadParagrafPaketleri();
    _populateParagrafListesi();
    if (typeof showPage === 'function') showPage('paragraf-liste-page');
    // Yüklü pasaj varsa saved tabını aç, yoksa AI tabını
    const hasSaved = paragraflar && paragraflar.length > 0;
    openReadingHub(hasSaved ? 'saved' : 'ai');
}

function openReadingHub(type) {
    const aiList    = document.getElementById('ai-daily-paragraf-list');
    const savedList = document.getElementById('paragraf-listesi-kutu');
    const refreshBtn = document.getElementById('ai-daily-refresh-btn');
    const tabAI     = document.getElementById('rh-tab-ai');
    const tabSaved  = document.getElementById('rh-tab-saved');

    // Tab aktif durumu — hem eski (rh-tab-active) hem yeni (rh2-tab-active) sınıfları destekle
    if (tabAI) {
        tabAI.classList.toggle('rh-tab-active',  type === 'ai');
        tabAI.classList.toggle('rh2-tab-active', type === 'ai');
    }
    if (tabSaved) {
        tabSaved.classList.toggle('rh-tab-active',  type === 'saved');
        tabSaved.classList.toggle('rh2-tab-active', type === 'saved');
    }

    if (type === 'ai') {
        if (refreshBtn) refreshBtn.style.display = 'flex';
        if (aiList)    { aiList.style.display    = 'grid'; }
        if (savedList) { savedList.style.display = 'none'; }
        generateAIDailyParagraflar(false);
    } else {
        if (refreshBtn) refreshBtn.style.display = 'none';
        if (aiList)    { aiList.style.display    = 'none'; }
        if (savedList) { savedList.style.display = 'grid'; _populateParagrafListesi(); }
    }
}

function closeReadingHub() {
    // Yeni tasarımda panel her zaman açık, tab switcher var
    // Eski çağrılar için fallback: AI tabına dön
    openReadingHub('ai');
}

window.openReadingHub = openReadingHub;

// ── Hero istatistiklerini güncelle (rh2-hero-stats) ──
function _updateRh2HeroStats() {
    const pSorular = window.paragrafSorular || {};
    const saved = paragraflar || [];
    const aiPassages = window._aiDailyPassages || [];
    const allPassages = [...saved, ...aiPassages.map(p => ({ metin: p.text, kelimeler: p.vocabulary }))];

    const totalPassages = saved.length;
    let totalWords = 0, totalVoc = 0, totalReadMin = 0, totalQ = 0;

    saved.forEach(p => {
        const wc = p.metin ? p.metin.trim().split(/\s+/).length : 0;
        totalWords   += p.kelimeler ? Object.keys(p.kelimeler).length : 0;
        totalReadMin += Math.ceil(wc / 180);
        const key     = typeof paragrafKey === 'function' ? paragrafKey(p) : '';
        totalQ       += key && pSorular[key] ? (pSorular[key].questions || []).length : 0;
    });

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('rh2-stat-passages',  totalPassages || '—');
    setEl('rh2-stat-words',     totalWords    || '—');
    setEl('rh2-stat-questions', totalQ        || '—');
    setEl('rh2-stat-readmin',   totalReadMin  || '—');
}

// ── Paragraf okuma progress (scroll) ──
function _initPokuScrollProgress() {
    // poku-body tüm sayfayı scroll ediyor
    const scrollEl = document.querySelector('.poku-body') ||
                     document.getElementById('paragraf-oku-page');
    const fill = document.getElementById('poku-progress-fill');
    const pct  = document.getElementById('poku-progress-pct');
    if (!scrollEl || !fill) return;

    // Önceki listener'ı temizle
    if (scrollEl._pokuScrollHandler) {
        scrollEl.removeEventListener('scroll', scrollEl._pokuScrollHandler);
    }

    scrollEl._pokuScrollHandler = () => {
        const scrolled = scrollEl.scrollTop;
        const total    = scrollEl.scrollHeight - scrollEl.clientHeight;
        const ratio    = total > 0 ? Math.min(Math.round((scrolled / total) * 100), 100) : 0;
        fill.style.width = ratio + '%';
        if (pct) pct.textContent = ratio + '%';
    };
    scrollEl.addEventListener('scroll', scrollEl._pokuScrollHandler, { passive: true });
    // Başlangıç değeri sıfırla
    fill.style.width = '0%';
    if (pct) pct.textContent = '0%';
}
window._initPokuScrollProgress = _initPokuScrollProgress;
window.closeReadingHub = closeReadingHub;

// ══════════════════════════════════════════════
// 📄 PARAGRAF OKUMA — AI ÖZELLİKLERİ
// ══════════════════════════════════════════════
let currentParagrafIndex = -1;
let paragrafSentences    = [];  // Grammar X-Ray için cümle listesi

// ── Paragraf Soruları Deposu ──────────────────────
// Anahtar: sanitize(baslik)_metin_uzunlugu
// window.paragrafSorular ile index.html'deki Firebase sync ile paylaşılır
window.paragrafSorular = JSON.parse(localStorage.getItem('ydt_paragraf_sorular')) || {};

// ── Mini Sözlük Render ──────────────────────────────
function renderParagrafDict(filter) {
    const list    = document.getElementById('ps-dict-list');
    const countEl = document.getElementById('ps-dict-count');
    if (!list) return;
    const kels = window._currentParagrafKelimeler || {};
    const entries = Object.entries(kels);
    countEl && (countEl.textContent = entries.length + ' kelime');

    const q = (filter || '').toLowerCase();
    const filtered = q
        ? entries.filter(([eng, tr]) => eng.toLowerCase().includes(q) || tr.toLowerCase().includes(q))
        : entries;

    if (!filtered.length) {
        list.innerHTML = '<div style="font-size:.75rem;color:var(--ink3);padding:8px 0;text-align:center;">Kelime bulunamadı</div>';
        return;
    }
    list.innerHTML = filtered.map(([eng, tr]) => `
        <div class="p-dict-entry" onclick="speakWord('${eng.replace(/'/g, "\\'")}')">
            <span class="p-dict-eng">${eng}</span>
            <span class="p-dict-tr">${tr}</span>
            <button class="p-dict-speak" onclick="event.stopPropagation();speakWord('${eng.replace(/'/g, "\\'")}')">🔊</button>
        </div>`).join('');
}

function filterParagrafDict(val) {
    renderParagrafDict(val);
}

function paragrafKey(p) {
    const base = (p.baslik || '').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').trim().slice(0, 40);
    return `p_${base}_${(p.metin || '').length}`;
}

// Kaydedilmiş soruları yükle ve göster
function loadSavedQuestions(index) {
    const p   = paragraflar[index];
    const key = paragrafKey(p);
    const saved = window.paragrafSorular[key];

    const section  = document.getElementById('p-ydt-saved-section');
    const qDiv     = document.getElementById('p-ydt-saved-questions');
    const genBtn   = document.getElementById('p-ydt-gen-btn');

    if (!saved || !saved.questions || !saved.questions.length) {
        section.style.display = 'none';
        if (genBtn) genBtn.innerHTML = '🎯 Bu paragraftan YDT sorusu üret';
        return;
    }

    section.style.display = 'block';
    if (genBtn) genBtn.innerHTML = '🔄 Yeni Sorular Üret (AI)';

    // Slide index'i sıfırla
    window._ydtSlideIdx['s'] = 0;
    qDiv.innerHTML = renderYDTQuestions(saved.questions, 's');

    // Accordion başlangıçta kapalı — kullanıcı açar
}

// Kayıtlı soruları sil
function deleteSavedQuestions() {
    const p   = paragraflar[currentParagrafIndex];
    if (!p || !confirm('Bu paragrafın kaydedilmiş soruları silinsin mi?')) return;
    const key = paragrafKey(p);
    delete window.paragrafSorular[key];
    window._saveData && window._saveData();
    loadSavedQuestions(currentParagrafIndex);
    document.getElementById('p-ydt-panel').style.display = 'none';
    document.getElementById('p-ydt-questions').innerHTML = '';
}

// Ortak soru render fonksiyonu — Kapanır/Açılır + Kart-Kart Slider
function renderYDTQuestions(questions, prefix) {
    const total = questions.length;
    const cardsHtml = questions.map((q, qi) => `
        <div class="ydt-slide" id="ydt-slide-${prefix}-${qi}" style="display:${qi===0?'block':'none'};">
            <div class="p-ydt-card-type">${q.icon || '📝'} ${q.type}</div>
            <div class="p-ydt-question">${q.question}</div>
            <div class="p-ydt-options" id="ydt-opts-${prefix}-${qi}">
                ${(q.options || []).map(opt => {
                    const letter = opt[0];
                    return `<button class="p-ydt-opt" onclick="checkYDTAnswer(this,'${prefix}',${qi},'${letter}','${q.answer}')">${opt}</button>`;
                }).join('')}
            </div>
            <div class="p-ydt-explanation" id="ydt-exp-${prefix}-${qi}" style="display:none;">
                <strong>💡 Açıklama:</strong> ${q.explanation}
            </div>
        </div>`).join('');

    return `
    <div class="ydt-accordion" id="ydt-acc-${prefix}">
        <button class="ydt-acc-toggle" onclick="toggleYDTAccordion('${prefix}')">
            <span class="ydt-acc-left">
                <span class="ydt-acc-icon">🎯</span>
                <span class="ydt-acc-title">YDT Soruları</span>
                <span class="ydt-acc-badge">${total} soru</span>
            </span>
            <span class="ydt-acc-arrow" id="ydt-acc-arrow-${prefix}">▼</span>
        </button>
        <div class="ydt-acc-body" id="ydt-acc-body-${prefix}" style="display:none;">
            <!-- İlerleme çubuğu -->
            <div class="ydt-slider-header">
                <span class="ydt-slider-counter" id="ydt-counter-${prefix}">1 / ${total}</span>
                <div class="ydt-slider-dots" id="ydt-dots-${prefix}">
                    ${questions.map((_,i) => `<span class="ydt-dot${i===0?' ydt-dot-active':''}" onclick="goToYDTSlide('${prefix}',${i},${total})"></span>`).join('')}
                </div>
            </div>
            <!-- Kart alanı -->
            <div class="ydt-slides-wrap">
                ${cardsHtml}
            </div>
            <!-- Nav butonları -->
            <div class="ydt-slider-nav">
                <button class="ydt-nav-btn" id="ydt-prev-${prefix}" onclick="prevYDTSlide('${prefix}',${total})" disabled>← Önceki</button>
                <button class="ydt-nav-btn ydt-nav-next" id="ydt-next-${prefix}" onclick="nextYDTSlide('${prefix}',${total})">Sonraki →</button>
            </div>
        </div>
    </div>`;
}

// Accordion aç/kapat
function toggleYDTAccordion(prefix) {
    const body  = document.getElementById(`ydt-acc-body-${prefix}`);
    const arrow = document.getElementById(`ydt-acc-arrow-${prefix}`);
    const open  = body.style.display !== 'none';
    body.style.display  = open ? 'none' : 'block';
    arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Slide state tracker
window._ydtSlideIdx = {};

function goToYDTSlide(prefix, idx, total) {
    const prev = window._ydtSlideIdx[prefix] || 0;
    const slideEl  = (i) => document.getElementById(`ydt-slide-${prefix}-${i}`);
    const dotEls   = document.querySelectorAll(`#ydt-dots-${prefix} .ydt-dot`);

    if (slideEl(prev)) slideEl(prev).style.display = 'none';
    if (slideEl(idx))  slideEl(idx).style.display  = 'block';
    dotEls.forEach((d,i) => d.classList.toggle('ydt-dot-active', i === idx));

    window._ydtSlideIdx[prefix] = idx;
    const counter = document.getElementById(`ydt-counter-${prefix}`);
    if (counter) counter.textContent = `${idx+1} / ${total}`;

    const prev_btn = document.getElementById(`ydt-prev-${prefix}`);
    const next_btn = document.getElementById(`ydt-next-${prefix}`);
    if (prev_btn) prev_btn.disabled = idx === 0;
    if (next_btn) { 
        next_btn.disabled = idx === total - 1;
        next_btn.textContent = idx === total - 1 ? '✅ Bitti' : 'Sonraki →';
    }
}

function nextYDTSlide(prefix, total) {
    const cur = window._ydtSlideIdx[prefix] || 0;
    if (cur < total - 1) goToYDTSlide(prefix, cur + 1, total);
}

function prevYDTSlide(prefix, total) {
    const cur = window._ydtSlideIdx[prefix] || 0;
    if (cur > 0) goToYDTSlide(prefix, cur - 1, total);
}

// ══════════════════════════════════════════════════════
// 🤖 AI CASCADE SİSTEMİ
// Sıra: Gemini → Groq → OpenRouter → Mistral
// Kota/rate-limit hatası → otomatik sonraki provider
// ══════════════════════════════════════════════════════

function isQuotaError(msg) {
    const m = (msg || '').toLowerCase();
    return m.includes('quota') || m.includes('429') || m.includes('rate') ||
           m.includes('resource_exhausted') || m.includes('too many') ||
           m.includes('limit exceeded') || m.includes('overloaded');
}

// Ekranda küçük durum tostu göster
function showAIToast(msg, type = 'info', duration) {
    let t = document.getElementById('ai-cascade-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'ai-cascade-toast';
    t.className = `ai-cascade-toast ai-toast-${type}`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(window._toastTimer);
    const ms = duration || (type === 'warn' ? 5000 : type === 'error' ? 7000 : 2400);
    window._toastTimer = setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t && t.remove(), 350);
    }, ms);
}

// Provider tanımları — sırayla denenir
const AI_PROVIDERS = [
    {
        id: 'gemini', name: 'Gemini', icon: '✨',
        lsKey: 'ydt_gemini_api_key',
        note: 'Free: 1.500 istek/gün · Gemini 1.5 Flash',
        keyHint: 'AIza...',
        keyLink: 'https://aistudio.google.com/app/apikey',
        async call(prompt) {
            const key = localStorage.getItem(this.lsKey);
            if (!key) throw new Error('no_key');

            // Güncel model listesi: 2.0-flash → 2.0-flash-lite → 1.5-flash → 1.5-flash-8b
            let resp, data;
            for (const model of ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']) {
                resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                    { method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ contents:[{parts:[{text: prompt + '\n\nReturn ONLY valid JSON. No markdown fences.'}]}] }) }
                );
                data = await resp.json();
                // 404 veya NOT_FOUND = model desteklenmiyor, sıradakini dene
                if (data.error?.code === 404 || data.error?.status === 'NOT_FOUND' ||
                    data.error?.message?.includes('not found') || data.error?.message?.includes('not supported')) continue;
                break; // başarılı ya da quota/auth hatası — döngüyü kır
            }

            // Hata varsa fırlat — cascade yakalasın
            if (data.error) throw new Error(data.error.message || data.error.status || 'Gemini error');

            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (!match) throw new Error('Gemini: geçerli JSON bulunamadı → ' + raw.slice(0,60));
            return JSON.parse(match[0]);
        }
    },
    {
        id: 'groq', name: 'Groq (Llama)', icon: '⚡',
        lsKey: 'ydt_groq_api_key',
        note: 'Free: 14.400 istek/gün · Llama 3.3 70B · Çok Hızlı',
        keyHint: 'gsk_...',
        keyLink: 'https://console.groq.com/keys',
        async call(prompt) {
            const key = localStorage.getItem(this.lsKey);
            if (!key) throw new Error('no_key');
            const r = await fetch('https://api.groq.com/openai/v1/chat/completions',
                { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
                  body: JSON.stringify({ model:'llama-3.3-70b-versatile', temperature:0.3,
                    messages:[{role:'system',content:'You must respond with valid JSON only. No markdown, no explanation, just the JSON object or array.'},
                               {role:'user',content:prompt}] }) }
            );
            const d = await r.json();
            if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
            let raw = d.choices?.[0]?.message?.content || '';
            const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (!match) throw new Error('Groq JSON parse hatası: ' + raw.slice(0,80));
            return JSON.parse(match[0]);
        }
    },
    {
        id: 'openrouter', name: 'OpenRouter', icon: '🌐',
        lsKey: 'ydt_openrouter_api_key',
        note: 'Free: Llama 3.3 8B · Kredi kartı gerektirmez',
        keyHint: 'sk-or-...',
        keyLink: 'https://openrouter.ai/keys',
        async call(prompt) {
            const key = localStorage.getItem(this.lsKey);
            if (!key) throw new Error('no_key');
            // Güncel free modeller — sırayla dene
            const models = [
                'meta-llama/llama-3.3-8b-instruct:free',
                'meta-llama/llama-3.1-70b-instruct:free',
                'mistralai/mistral-7b-instruct:free',
                'google/gemma-3-4b-it:free'
            ];
            let lastErr = null;
            for (const model of models) {
                try {
                    const r = await fetch('https://openrouter.ai/api/v1/chat/completions',
                        { method:'POST',
                          headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`,
                                   'HTTP-Referer':'https://ydt-master.web.app','X-Title':'YDT Master'},
                          body: JSON.stringify({ model, temperature:0.3,
                            messages:[{role:'system',content:'You must respond with valid JSON only. No markdown, no explanation.'},
                                       {role:'user',content:prompt}] }) }
                    );
                    const d = await r.json();
                    // Model bulunamadıysa sonraki modeli dene
                    if (d.error?.code === 404 || (d.error?.message || '').includes('not found') || (d.error?.message || '').includes('No endpoints')) {
                        lastErr = new Error(d.error.message); continue;
                    }
                    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
                    let raw = d.choices?.[0]?.message?.content || '';
                    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                    if (!match) throw new Error('OpenRouter JSON parse hatası: ' + raw.slice(0,80));
                    return JSON.parse(match[0]);
                } catch(e) { lastErr = e; }
            }
            throw lastErr || new Error('OpenRouter: tüm modeller başarısız');
        }
    },
    {
        id: 'mistral', name: 'Mistral AI', icon: '🌪️',
        lsKey: 'ydt_mistral_api_key',
        note: 'Free: 1 milyar token/ay · Mistral Small',
        keyHint: '...',
        keyLink: 'https://console.mistral.ai/api-keys',
        async call(prompt) {
            const key = localStorage.getItem(this.lsKey);
            if (!key) throw new Error('no_key');
            const r = await fetch('https://api.mistral.ai/v1/chat/completions',
                { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
                  body: JSON.stringify({ model:'mistral-small-latest', temperature:0.3,
                    messages:[{role:'system',content:'You must respond with valid JSON only. No markdown, no explanation.'},
                               {role:'user',content:prompt}] }) }
            );
            const d = await r.json();
            if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
            let raw = d.choices?.[0]?.message?.content || '';
            const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (!match) throw new Error('Mistral JSON parse hatası: ' + raw.slice(0,80));
            return JSON.parse(match[0]);
        }
    }
];

// Ana cascade çağrısı — tüm provider'ları sırayla dener
async function aiCall(prompt) {
    const available = AI_PROVIDERS.filter(p => localStorage.getItem(p.lsKey));

    if (!available.length) {
        alert('AI özelliği için en az bir API anahtarı gerekli.\nYönetim paneli → 🔑 AI API Anahtarları bölümüne gidin.');
        throw new Error('no_api_key');
    }

    if (available.length === 1) {
        console.info('[AI Cascade] ⚠ Sadece 1 servis aktif:', available[0].name,
            '— Groq/OpenRouter gibi ek servisler eklenirse Gemini kotası dolduğunda otomatik geçiş yapılır.');
    }

    let lastErr = null;
    for (let i = 0; i < available.length; i++) {
        const p = available[i];
        const isLast = i === available.length - 1;

        if (i === 0) showAIToast(`${p.icon} ${p.name} ile bağlanılıyor...`, 'info');

        try {
            console.log(`[AI Cascade] ${i+1}/${available.length} deneniyor: ${p.name}`);
            const result = await p.call(prompt);
            console.log(`[AI Cascade] ✅ Başarılı: ${p.name}`);
            if (i > 0) {
                showAIToast(`✅ ${p.icon} ${p.name} ile başarılı!`, 'ok');
            } else {
                const t = document.getElementById('ai-cascade-toast');
                if (t) { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }
            }
            return result;

        } catch (err) {
            lastErr = err;
            const isQuota = isQuotaError(err.message);
            console.warn(`[AI Cascade] ❌ ${p.name} ${isQuota ? 'KOTA DOLDU' : 'HATA'}: ${err.message}`);

            if (!isLast) {
                const next = available[i + 1];
                const reason = isQuota ? 'kotası doldu ⛔' : 'hata verdi ❌';
                showAIToast(
                    `${p.icon} ${p.name} ${reason} — ${next.icon} ${next.name} deneniyor...`,
                    'warn'
                );
                await new Promise(r => setTimeout(r, 1000));
            } else {
                const tip = available.length === 1
                    ? ' (Yönetim→🔑 bölümünden ek servis ekleyin)'
                    : '';
                showAIToast(`❌ Hata: ${err.message.slice(0, 70)}${tip}`, 'error');
            }
        }
    }
    throw lastErr || new Error('all_failed');
}

// Eski çağrılar geminiCall kullanıyorsa yönlendir
async function geminiCall(prompt) { return aiCall(prompt); }

// Zorluk Seviyesi Algılama
async function detectDifficulty(text) {
    const badge = document.getElementById('p-difficulty-badge');
    badge.innerHTML = '<span class="diff-badge diff-loading">⏳ Analiz...</span>';
    try {
        const result = await geminiCall(`
Aşağıdaki İngilizce paragrafın zorluk seviyesini analiz et. Kelime yoğunluğunu, cümle uzunluğunu ve soyutluk düzeyini göz önünde bulundur.

Paragraf:
""" ${text.slice(0, 1200)} """
SADECE şu JSON'u döndür:
{
  "level": "B1" | "B2" | "C1" | "C2" | "YDT Easy" | "YDT Brutal",
  "score": 0-100 arası sayı,
  "color": "green" | "blue" | "orange" | "red" | "purple",
  "reasons": ["3 kısa Türkçe neden", "...", "..."]
}`);

        const colorMap = { green:'#16a34a', blue:'#1d4ed8', orange:'#ea580c', red:'#dc2626', purple:'#7c3aed' };
        const c = colorMap[result.color] || '#555';
        badge.innerHTML = `
            <div class="diff-badge" style="background:${c}10; border-color:${c}; color:${c};" title="${(result.reasons||[]).join(' · ')}">
                ${result.level} <span class="diff-score">${result.score}/100</span>
            </div>`;
    } catch(e) {
        badge.innerHTML = e.message === 'no_api_key'
            ? '<span class="diff-badge diff-na">— Seviye</span>'
            : '<span class="diff-badge diff-na">⚠ Analiz başarısız</span>';
    }
}

// YDT Soru Üretici
async function generateYDTQuestions() {
    const p = paragraflar[currentParagrafIndex];
    if (!p) return;

    const btn   = document.getElementById('p-ydt-gen-btn');
    const panel = document.getElementById('p-ydt-panel');
    const qDiv  = document.getElementById('p-ydt-questions');

    btn.disabled  = true;
    btn.innerHTML = '⏳ Sorular üretiliyor...';
    panel.style.display = 'block';
    qDiv.innerHTML = '<div class="p-ydt-loading"><div class="p-ydt-spin">⚙️</div><div>AI soruları hazırlıyor...</div></div>';

    try {
        const result = await geminiCall(`
Sen uzman bir YDT İngilizce öğretmenisin. Aşağıdaki paragraftan tam ÖSYM YDT standartlarında 5 farklı soru türü üret.

Paragraf:
""" ${p.metin} """
SADECE şu JSON formatını döndür:
{
  "questions": [
    {
      "type": "Ana Fikir",
      "icon": "💡",
      "question": "İngilizce soru cümlesi",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "A",
      "explanation": "Türkçe açıklama — neden bu şık doğru, diğerleri neden yanlış"
    },
    {
      "type": "Çıkarım",
      "icon": "🔎",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "C",
      "explanation": "..."
    },
    {
      "type": "Referans (This/That/They)",
      "icon": "👉",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "B",
      "explanation": "..."
    },
    {
      "type": "Kelime Anlamı",
      "icon": "📖",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "D",
      "explanation": "..."
    },
    {
      "type": "Paragraf Tamamlama",
      "icon": "✍️",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "E",
      "explanation": "..."
    }
  ]
}`);

        const questions = result.questions || [];

        // ── Soruları kaydet ──────────────────────────
        const key = paragrafKey(p);
        window.paragrafSorular[key] = {
            baslik:    p.baslik,
            savedAt:   new Date().toISOString(),
            questions: questions
        };
        window._saveData && window._saveData();
        // Kaydedilmiş bölümünü güncelle
        loadSavedQuestions(currentParagrafIndex);
        // ─────────────────────────────────────────────

        window._ydtSlideIdx['n'] = 0;
        qDiv.innerHTML = renderYDTQuestions(questions, 'n');

    } catch(e) {
        qDiv.innerHTML = `<div style="color:var(--red);font-size:.85rem;padding:12px;">⚠ Hata: ${e.message}<br><small>API anahtarınızı ve bağlantınızı kontrol edin.</small></div>`;
    }

    btn.disabled  = false;
    btn.innerHTML = '🔄 Yeni Sorular Üret (AI)';
}

function checkYDTAnswer(btn, prefix, qi, selected, correct) {
    const optsDiv = document.getElementById(`ydt-opts-${prefix}-${qi}`);
    const expDiv  = document.getElementById(`ydt-exp-${prefix}-${qi}`);
    if (!optsDiv || optsDiv.dataset.answered) return;
    optsDiv.dataset.answered = '1';

    Array.from(optsDiv.querySelectorAll('.p-ydt-opt')).forEach(b => {
        b.disabled = true;
        const letter = b.textContent.trim()[0];
        if (letter === correct) b.classList.add('ydt-correct');
        else if (b === btn && selected !== correct) b.classList.add('ydt-wrong');
    });
    if (expDiv) expDiv.style.display = 'block';
    if (selected === correct) {
        stats.correctAnswers++; stats.totalAnswers++;
        incrementDailyCount();
        recordDailyPerf(true);
    } else {
        stats.totalAnswers++;
        recordDailyPerf(false);
    }
    window._saveData && window._saveData();
}

// Grammar X-Ray
async function analyzeGrammarXRay(sentenceIdx) {
    const sentence = paragrafSentences[sentenceIdx];
    if (!sentence || sentence.trim().length < 6) return;

    // Aktif cümleyi vurgula
    document.querySelectorAll('.p-sentence.psa').forEach(s => s.classList.remove('psa'));
    const activeSpan = document.querySelector(`.p-sentence[data-idx="${sentenceIdx}"]`);
    if (activeSpan) activeSpan.classList.add('psa');

    const panel   = document.getElementById('p-grammar-panel');
    const content = document.getElementById('p-grammar-content');
    panel.style.display = 'block';
    content.innerHTML = '<div class="p-grammar-loading"><span style="font-size:1.5rem;animation:spin 1s linear infinite;display:inline-block">⚙️</span><span>Analiz ediliyor...</span></div>';
    // poku-body scroll ediyor — panel'i görünür hale getir
    const _scroller = document.querySelector('.poku-body');
    if (_scroller) {
        setTimeout(() => {
            const pr = panel.getBoundingClientRect();
            const sr = _scroller.getBoundingClientRect();
            if (pr.bottom > sr.bottom - 20) {
                _scroller.scrollBy({ top: pr.bottom - sr.bottom + 60, behavior: 'smooth' });
            }
        }, 80);
    } else {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    try {
        const r = await geminiCall(`
Sen bir İngilizce dilbilgisi uzmanısın. Aşağıdaki cümleyi dilbilgisel olarak analiz et.

Cümle: "${sentence.trim()}"

SADECE şu JSON formatını döndür:
{
  "tense": "Zaman ve yapı adı (Türkçe ve İngilizce)",
  "voice": "active" | "passive",
  "clause_count": sayı,
  "clauses": [
    {"type": "main clause" | "subordinate clause" | "relative clause" | "conditional clause", "text": "cümle parçası", "color": "hex renk kodu"}
  ],
  "conjunctions": [{"word": "kelime", "role": "Türkçe açıklama"}],
  "relative_clauses": ["varsa relative clause metinleri"],
  "formula": "Cümle yapısı formülü (örn: S + have + been + V3 + by + O)",
  "tr_translation": "Cümlenin Türkçe çevirisi",
  "tip": "YDT sınavı için 1 cümlelik not"
}`);

        const voiceIcon = r.voice === 'passive' ? '🔄 Passive' : '✅ Active';
        const clauseColors = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444'];

        content.innerHTML = `
            <div class="gx-sentence-box">"${sentence.trim()}"</div>
            <div class="gx-tr">${r.tr_translation || ''}</div>

            <div class="gx-grid">
                <div class="gx-chip"><span class="gx-chip-label">⏰ Zaman</span><span class="gx-chip-val">${r.tense}</span></div>
                <div class="gx-chip"><span class="gx-chip-label">🔄 Voice</span><span class="gx-chip-val">${voiceIcon}</span></div>
                <div class="gx-chip" style="grid-column:1/-1;"><span class="gx-chip-label">🧮 Formül</span><span class="gx-chip-val" style="font-family:monospace;font-size:.82rem;">${r.formula || '—'}</span></div>
            </div>

            ${(r.clauses||[]).length ? `
            <div class="gx-section-title">📐 Clause Yapısı</div>
            <div class="gx-clauses">
                ${r.clauses.map((cl, i) => `
                    <div class="gx-clause" style="border-left-color:${cl.color || clauseColors[i%5]};">
                        <span class="gx-clause-type" style="color:${cl.color || clauseColors[i%5]};">${cl.type}</span>
                        <span class="gx-clause-text">"${cl.text}"</span>
                    </div>`).join('')}
            </div>` : ''}

            ${(r.conjunctions||[]).length ? `
            <div class="gx-section-title">🔗 Bağlaçlar</div>
            <div class="gx-tags">
                ${r.conjunctions.map(c => `<span class="gx-tag gx-tag-conj"><strong>${c.word}</strong> — ${c.role}</span>`).join('')}
            </div>` : ''}

            ${(r.relative_clauses||[]).length ? `
            <div class="gx-section-title">🔀 Relative Clause</div>
            <div class="gx-tags">
                ${r.relative_clauses.map(rc => `<span class="gx-tag gx-tag-rel">${rc}</span>`).join('')}
            </div>` : ''}

            ${r.tip ? `<div class="gx-tip">💡 YDT Notu: ${r.tip}</div>` : ''}
        `;
    } catch(e) {
        content.innerHTML = `<div style="color:var(--red);font-size:.84rem;padding:10px;">⚠ Analiz başarısız: ${e.message}</div>`;
    }
}

function showParagrafOku(index) {
    currentParagrafIndex = index;
    const p = paragraflar[index];

    // Cümlelere böl (Grammar X-Ray için)
    paragrafSentences = p.metin
        .replace(/([.?!])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 3);

    // Her cümleye c1-word renklendirme + tıklanabilir span ekle
    const islenmisMetin = paragrafSentences.map((sent, si) => {
        let s = sent;
        for (let [ing, tr] of Object.entries(p.kelimeler || {})) {
            const regex = new RegExp(`\\b(${ing.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`, 'gi');
            s = s.replace(regex, `<span class="c1-word" data-tr="${tr}">$1</span>`);
        }
        return `<span class="p-sentence" data-idx="${si}" onclick="analyzeGrammarXRay(${si})" title="Tıkla: Grammar X-Ray">${s}</span> `;
    }).join('');

    document.getElementById('p-oku-baslik').innerText = stripNumPrefix(p.baslik);
    document.getElementById('p-oku-metin').innerHTML  = islenmisMetin;

    // Panelleri sıfırla
    document.getElementById('p-grammar-panel').style.display = 'none';
    document.getElementById('p-ydt-panel').style.display     = 'none';
    document.getElementById('p-ydt-questions').innerHTML     = '';
    const genBtn = document.getElementById('p-ydt-gen-btn');
    if (genBtn) { genBtn.disabled = false; genBtn.innerHTML = '🎯 Bu paragraftan YDT sorusu üret'; }

    showPage('paragraf-oku-page');

    // Kaydedilmiş soruları yükle
    loadSavedQuestions(index);

    // ── Sidebar: Paragraf İstatistikleri ──
    const words = (p.metin || '').trim().split(/\s+/).filter(w => w.length > 0);
    const sentCount = paragrafSentences.length;
    const vocCount  = Object.keys(p.kelimeler || {}).length;
    const readMin   = Math.ceil(words.length / 180); // ~180 kelime/dk
    const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
    el('ps-word-count', words.length);
    el('ps-sent-count', sentCount);
    el('ps-voc-count',  vocCount);
    el('ps-read-time',  readMin + ' dk');

    // ── Sidebar: Genel İstatistikler ──
    const allWords  = Object.values(allData).flat();
    const totalW    = allWords.length;
    const learnedW  = allWords.filter(w => (w.correctStreak||0) >= 3).length;
    const accuracy  = stats.totalAnswers ? Math.round(stats.correctAnswers / stats.totalAnswers * 100) : 0;
    const streak    = parseInt(localStorage.getItem('ydt_streak') || '0');
    el('ps-total-words', totalW);
    el('ps-learned',     learnedW);
    el('ps-accuracy',    accuracy + '%');
    el('ps-streak',      streak);

    // ── Sidebar: Mini Sözlük ──
    window._currentParagrafKelimeler = p.kelimeler || {};

    // Mobil touch bubble için c1-word
    let activeBubble = null;
    document.querySelectorAll('#p-oku-metin .c1-word').forEach(span => {
        span.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (activeBubble) { activeBubble.remove(); activeBubble = null; }
            const rect   = span.getBoundingClientRect();
            const bubble = document.createElement('div');
            bubble.className   = 'word-touch-bubble';
            bubble.textContent = span.dataset.tr;
            bubble.style.cssText = `position:fixed; left:${Math.min(rect.left + rect.width/2, window.innerWidth-120)}px; top:${Math.max(rect.top-44,60)}px; transform:translateX(-50%);`;
            document.body.appendChild(bubble);
            activeBubble = bubble;
            setTimeout(() => { if (activeBubble===bubble){bubble.remove();activeBubble=null;} }, 2200);
        }, { passive:false });
    });

    // Zorluk algıla
    detectDifficulty(p.metin);

    // Scroll progress bar başlat
    setTimeout(() => {
        if (typeof _initPokuScrollProgress === 'function') _initPokuScrollProgress();
    }, 100);
}
// ══════════════════════════════════════════════
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
    const key = document.getElementById('ai-gen-api-key').value.trim();
    if (!key) return;
    localStorage.setItem('ydt_gemini_api_key', key);
    document.getElementById('ai-gen-key-status').innerHTML =
        '<span style="color:#22c55e;font-weight:700;">✓ Kaydedildi</span>';
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
    aiGenWords.forEach((w, i) => {
        list.innerHTML += `
        <div class="ai-gen-word-card" id="aig-card-${i}">
            <div class="aig-top">
                <span class="aig-eng">${w.eng}</span>
                <span class="aig-tr">${w.tr}</span>
                <button onclick="aiGenRemoveWord(${i})" class="aig-remove">✕</button>
            </div>
            <div class="aig-meta">🧠 ${w.mnemonic || '—'}</div>
            <div class="aig-meta" style="color:var(--ink3);">📖 ${w.story || '—'}</div>
        </div>`;
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
// 🏅 ROZET SİSTEMİ
// ══════════════════════════════════════════════
const BADGE_DEFS = [
    { id:'first_word',   icon:'🌱', name:'İlk Adım',      desc:'İlk kelimeni öğrendin',         check:(s,t,l)=> l>=1           },
    { id:'ten_words',    icon:'📚', name:'Okuyucu',        desc:'10 kelime öğrenildi',            check:(s,t,l)=> l>=10          },
    { id:'fifty_words',  icon:'🎓', name:'Öğrenci',        desc:'50 kelime öğrenildi',            check:(s,t,l)=> l>=50          },
    { id:'streak3',      icon:'🔥', name:'Ateşli',         desc:'3 günlük seri',                  check:(s,t,l)=> s>=3           },
    { id:'streak7',      icon:'⚡', name:'Haftalık Seri',  desc:'7 günlük kesintisiz seri',       check:(s,t,l)=> s>=7           },
    { id:'streak30',     icon:'💎', name:'Efsane',         desc:'30 günlük seri',                 check:(s,t,l)=> s>=30          },
    { id:'hundred_ans',  icon:'🎯', name:'Hedef Avcısı',   desc:'100 soru cevaplandı',            check:(s,t,l,st)=> (st.totalAnswers||0)>=100  },
    { id:'accuracy80',   icon:'🏹', name:'Keskin Nişancı', desc:'%80+ genel başarı',              check:(s,t,l,st)=> st.totalAnswers>20 && (st.correctAnswers/st.totalAnswers)>=0.8 },
    { id:'all_lists',    icon:'🗂️', name:'Koleksiyoncu',   desc:'3+ farklı liste oluşturuldu',   check:(s,t,l,st,ad)=> Object.keys(ad).length>=3 },
];

function renderBadges(streak, total, learned, st) {
    const grid    = document.getElementById('badges-grid');
    if (!grid) return;
    const earned  = JSON.parse(localStorage.getItem('ydt_badges') || '[]');
    const newlyEarned = [];

    BADGE_DEFS.forEach(b => {
        const has = b.check(streak, total, learned, st, allData);
        if (has && !earned.includes(b.id)) { earned.push(b.id); newlyEarned.push(b); }
    });
    if (newlyEarned.length) localStorage.setItem('ydt_badges', JSON.stringify(earned));

    grid.innerHTML = BADGE_DEFS.map(b => {
        const unlocked = earned.includes(b.id);
        return `<div class="badge-card ${unlocked ? 'badge-unlocked' : 'badge-locked'}" title="${b.desc}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
        </div>`;
    }).join('');

    // Yeni rozet bildirimi
    newlyEarned.forEach(b => showBadgeToast(b));
}

function showBadgeToast(b) {
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = `<span style="font-size:1.4rem">${b.icon}</span><div><div style="font-weight:800;font-size:.82rem">Rozet Kazandın!</div><div style="font-size:.72rem;opacity:.85">${b.name}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ══════════════════════════════════════════════
// 📊 ISI HARİTASI
// ══════════════════════════════════════════════
function renderHeatmap() {
    const sel    = document.getElementById('heatmap-list-sel');
    const grid   = document.getElementById('heatmap-grid');
    if (!sel || !grid) return;
    const listName = sel.value;
    const words    = allData[listName] || [];

    if (!words.length) { grid.innerHTML = '<p style="font-size:.8rem;color:var(--ink3);">Bu listede kelime yok.</p>'; return; }

    grid.innerHTML = words.map(w => {
        const err   = w.errorCount   || 0;
        const str   = w.correctStreak || 0;
        const total = err + str;

        let cls = 'hm-new';   // hiç çalışılmamış
        if (total > 0) {
            const ratio = str / (total);
            if (ratio >= 0.7)      cls = 'hm-good';
            else if (ratio >= 0.4) cls = 'hm-mid';
            else                   cls = 'hm-bad';
        }
        const tooltip = `${w.eng}: ${err} hata, ${str} doğru`;
        return `<div class="hm-cell ${cls}" title="${tooltip}" onclick="hmShowWord(this,'${w.eng.replace(/'/g,"\\'")}','${w.tr.replace(/'/g,"\\'")}',${err},${str})"></div>`;
    }).join('');
}

function hmShowWord(el, eng, tr, err, str) {
    // mevcut seçimi kaldır
    document.querySelectorAll('.hm-cell.hm-selected').forEach(c => c.classList.remove('hm-selected'));
    el.classList.add('hm-selected');

    // tooltip popup
    const old = document.getElementById('hm-popup');
    if (old) old.remove();
    const pop = document.createElement('div');
    pop.id = 'hm-popup';
    pop.className = 'hm-popup';
    pop.innerHTML = `<strong>${eng}</strong> — ${tr}<br><span style="font-size:.7rem;opacity:.8">${err} hata · ${str} doğru</span>`;
    document.getElementById('heatmap-grid').appendChild(pop);
    setTimeout(() => pop.classList.add('show'), 10);
    setTimeout(() => { pop.classList.remove('show'); setTimeout(() => pop.remove(), 300); }, 2500);
}

// ════════════════════════════════════════════════════════════════
//  SORU PAKETİ IMPORT SİSTEMİ — KELİME
// ════════════════════════════════════════════════════════════════
const SORU_PAKETLERİ = [];

SORU_PAKETLERİ.push({ id:'els_lys_2010_vocab', baslik:'ELS 2010/2011 – LYS Vocabulary', aciklama:'25 soru · Kelime bilgisi', etiket:'LYS', sorular:[
{no:1,word:'cost',wordTr:'mal olmak',question:"These books didn't ........ me very much because I bought them from the second-hand bookshop opposite our office.",options:{A:'spend',B:'afford',C:'pay',D:'cost',E:'decrease'},correct:'D',explanation:'<b>cost</b>=mal olmak. <b>spend</b>=harcamak, <b>afford</b>=gücü yetmek, <b>pay</b>=ödemek'},
{no:2,word:'fascinating',wordTr:'büyüleyici',question:"Toni finds the ideas of Carl Jung ........, and so she has bought and read every one of his books.",options:{A:'arrogant',B:'voluntary',C:'fascinating',D:'faithful',E:'vague'},correct:'C',explanation:'<b>fascinating</b>=büyüleyici. <b>arrogant</b>=kibirli, <b>vague</b>=belirsiz'},
{no:3,word:'violence',wordTr:'şiddet',question:"Even though Mohandas K. Gandhi didn't believe in using ........ to solve political problems, he never received a Nobel Peace Prize.",options:{A:'suspicion',B:'reflection',C:'cancellation',D:'assistance',E:'violence'},correct:'E',explanation:'<b>violence</b>=şiddet. <b>suspicion</b>=şüphe, <b>assistance</b>=yardım'},
{no:4,word:'sculpture',wordTr:'heykel',question:"The ancient Greek ........ of the goddess Aphrodite from the island of Milos is one of the most famous statues in the world.",options:{A:'structure',B:'sculpture',C:'temple',D:'worship',E:'excavation'},correct:'B',explanation:'<b>sculpture</b>=heykel. <b>structure</b>=yapı, <b>temple</b>=tapınak'},
{no:5,word:'hunting',wordTr:'avlamak',question:"Percival was ........ for a tiger with his gun when it jumped out from a bush and bit him in the throat.",options:{A:'murdering',B:'shaking',C:'hunting',D:'following',E:'hiding'},correct:'C',explanation:'<b>hunt</b>=avlamak. <b>murdering</b>=cinayet, <b>following</b>=takip'},
{no:6,word:'flat',wordTr:'daire',question:"Dursun has bought a very small ........ in the city centre. It is on the fifth floor and only has one main room, a kitchen, and a bathroom.",options:{A:'building',B:'flat',C:'house',D:'circle',E:'environment'},correct:'B',explanation:'<b>flat</b>=daire (BrE). <b>building</b>=bina, <b>house</b>=ev'},
{no:7,word:'expecting',wordTr:'beklemek',question:"Ophelia was only ........ about 20 people to come to the party, but actually 250 turned up for it.",options:{A:'considering',B:'expecting',C:'defending',D:'respecting',E:'connecting'},correct:'B',explanation:'<b>expect</b>=beklemek, ummak'},
{no:8,word:'available',wordTr:'müsait',question:"Dr. Collier isn't ........ today because she is on vacation. Maybe I can help you.",options:{A:'interesting',B:'relevant',C:'respected',D:'available',E:'aware'},correct:'D',explanation:'<b>available</b>=müsait, ulaşılabilir'},
{no:9,word:'contemporary',wordTr:'günümüz / çağdaş',question:"........ Turkey is quite different to the country of 30 years ago, because now most people here live in cities.",options:{A:'Beneficial',B:'Accurate',C:'Contemporary',D:'Fabricated',E:'Overdue'},correct:'C',explanation:'<b>contemporary</b>=günümüz, çağdaş'},
{no:10,word:'arrange',wordTr:'düzenlemek',question:"I'm going to ........ the furniture in this room differently after I have bought a new computer desk.",options:{A:'arrange',B:'relax',C:'figure',D:'direct',E:'assist'},correct:'A',explanation:'<b>arrange</b>=düzenlemek, yerleştirmek'},
{no:11,word:'involved',wordTr:'kapsamak',question:"The search for the missing trekker ........ mountain rescue teams on foot, special sniffer dogs, and helicopters.",options:{A:'claimed',B:'involved',C:'decided',D:'succeeded',E:'allowed'},correct:'B',explanation:'<b>involve</b>=kapsamak, içermek'},
{no:12,word:'amusing',wordTr:'eğlenceli',question:"Larry thought that David's jokes were very ........ . He was laughing about them for a long time afterwards.",options:{A:'enthusiastic',B:'acceptable',C:'enormous',D:'willing',E:'amusing'},correct:'E',explanation:'<b>amusing</b>=eğlendirici, komik'},
{no:13,word:'remarkably',wordTr:'şaşırtıcı biçimde',question:"Even though Charles Lightoller fell into the icy Atlantic Ocean when the Titanic sank, he ........ survived.",options:{A:'slightly',B:'promptly',C:'especially',D:'immediately',E:'remarkably'},correct:'E',explanation:'<b>remarkably</b>=şaşırtıcı biçimde'},
{no:14,word:'attractive',wordTr:'cazip',question:"Three companies offered Nicole a job. She thought that the last offer was the most ........, so she accepted that one.",options:{A:'current',B:'wealthy',C:'tedious',D:'attractive',E:'obvious'},correct:'D',explanation:'<b>attractive</b>=cazip, çekici. <b>tedious</b>=sıkıcı'},
{no:15,word:'invention',wordTr:'icat',question:"Before the ........ of machine guns and effective shell-firing guns, horses had an important role in warfare.",options:{A:'invention',B:'consumption',C:'prediction',D:'foundation',E:'action'},correct:'A',explanation:'<b>invention</b>=icat, buluş'},
{no:16,word:'moment',wordTr:'şu an',question:"At the ........, I'm not doing anything. Do you want some help doing the washing up?",options:{A:'occasion',B:'constant',C:'moment',D:'basis',E:'situation'},correct:'C',explanation:'<b>at the moment</b>=şu an (sabit ifade)'},
{no:17,word:'significant',wordTr:'önemli',question:"Hikmet got ........ number of questions correct in the test, and so took a mark of 93%.",options:{A:'precious',B:'uneasy',C:'significant',D:'slight',E:'conscious'},correct:'C',explanation:'<b>significant</b>=önemli, kayda değer'},
{no:18,word:'appreciated',wordTr:'takdir etmek',question:"Rhiannon ........ your gift to her of a new tennis racket, and will use it in her next game.",options:{A:'appreciated',B:'pleased',C:'performed',D:'presented',E:'excited'},correct:'A',explanation:'<b>appreciate</b>=takdir etmek, değerini bilmek'},
{no:19,word:'influence',wordTr:'etki',question:"Both Gabriel García Márquez and Umberto Eco reflect the ........ of the author Jorge Luis Borges in their writings.",options:{A:'relation',B:'influence',C:'movement',D:'illustration',E:'mention'},correct:'B',explanation:'<b>influence</b>=etki, tesir'},
{no:20,word:'fresh',wordTr:'taze',question:"I've just bought some peaches from the market. They are very ........ and they taste delicious.",options:{A:'thirsty',B:'average',C:'comfortable',D:'fresh',E:'gentle'},correct:'D',explanation:'<b>fresh</b>=taze, yeni'},
{no:21,word:'agree',wordTr:'katılmak',question:"Marco believes that Michel Platini was the greatest ever French football player, but I don't ........ .",options:{A:'accept',B:'think',C:'discover',D:'comprehend',E:'agree'},correct:'E',explanation:'<b>agree</b>=katılmak. <b>accept</b>=kabul etmek'},
{no:22,word:'naturally',wordTr:'doğal olarak',question:"The actor John Rhys-Davies is ........ tall, but Peter Jackson chose him to play a dwarf in The Lord of the Rings.",options:{A:'naturally',B:'constantly',C:'merely',D:'eagerly',E:'partly'},correct:'A',explanation:'<b>naturally</b>=doğal olarak, doğuştan'},
{no:23,word:'manage',wordTr:'başarmak',question:"Did you ........ to finish your essay on Mesopotamian mythology last weekend?",options:{A:'affect',B:'manage',C:'convert',D:'survive',E:'require'},correct:'B',explanation:'<b>manage to</b>=başarmak, üstesinden gelmek'},
{no:24,word:'supporting',wordTr:'desteklemek',question:"Warren is ........ Hayden for class president, but I don't like him, so I hope that Françoise wins.",options:{A:'supporting',B:'waiting',C:'comparing',D:'adoring',E:'finding'},correct:'A',explanation:'<b>support</b>=desteklemek'},
{no:25,word:'seriously',wordTr:'ciddiyetle',question:"Malcolm is ........ thinking about quitting university and getting a job instead, because his family is having some financial problems.",options:{A:'equally',B:'hardly',C:'widely',D:'seriously',E:'efficiently'},correct:'D',explanation:'<b>seriously</b>=ciddi biçimde'}
]});

SORU_PAKETLERİ.push({ id:'els_lys_2010_testvocab', baslik:'ELS 2010/2011 – Test Your Vocabulary', aciklama:'40 soru · Kelime bilgisi', etiket:'LYS', sorular:[
{no:1,word:'entirely',wordTr:'tamamen',question:"Our main customers are no longer ...... satisfied with our products, and so they are beginning to look elsewhere for higher quality merchandise.",options:{A:'virtually',B:'entirely',C:'originally',D:'gradually',E:'terminally'},correct:'B',explanation:'<b>entirely</b>=tamamen. <b>virtually</b>=neredeyse, <b>gradually</b>=yavaş yavaş'},
{no:2,word:'barren',wordTr:'çorak',question:"Central Tibet consists mostly of a ...... landscape on which little or nothing grows, so people are dependent on their animals for sustenance.",options:{A:'productive',B:'relevant',C:'barren',D:'rootless',E:'fertile'},correct:'C',explanation:'<b>barren</b>=çorak. <b>fertile</b>=bereketli'},
{no:3,word:'willingly',wordTr:'isteyerek',question:"As he had nothing to hide, he ...... answered the police's questions.",options:{A:'willingly',B:'radically',C:'adversely',D:'dominantly',E:'awkwardly'},correct:'A',explanation:'<b>willingly</b>=isteyerek, gönüllü olarak'},
{no:4,word:'processed',wordTr:'işlenmek',question:"As there are dozens of applications currently being ......, it is unlikely that you will hear from us earlier than two weeks from now.",options:{A:'dignified',B:'suspected',C:'processed',D:'applied',E:'complied'},correct:'C',explanation:'<b>process</b>=işlemek, değerlendirmek'},
{no:5,word:'escape',wordTr:'kaçmak',question:"There was no way for the robbers to ...... since their hideout was surrounded by the police on all sides.",options:{A:'display',B:'parade',C:'surrender',D:'escape',E:'deprive'},correct:'D',explanation:'<b>escape</b>=kaçmak. <b>surrender</b>=teslim olmak'},
{no:6,word:'yawning',wordTr:'esnemek',question:"I don't know if my students were bored or just sleepy, but they were ...... all through my lecture.",options:{A:'applauding',B:'yawning',C:'fainting',D:'skipping',E:'rehearsing'},correct:'B',explanation:'<b>yawn</b>=esneme'},
{no:7,word:'rude',wordTr:'kaba',question:"Although the Japanese have a reputation for politeness, foreign residents in the country are often surprised at how ...... they can be in daily life.",options:{A:'exact',B:'complete',C:'rude',D:'suspended',E:'affluent'},correct:'C',explanation:'<b>rude</b>=kaba, terbiyesiz. <b>affluent</b>=varlıklı'},
{no:8,word:'moan',wordTr:'sızlanmak',question:"Some people are such complainers; they just ...... about everything without ever attempting to change anything.",options:{A:'sneeze',B:'depress',C:'cheer',D:'faint',E:'moan'},correct:'E',explanation:'<b>moan</b>=sızlanmak, yakınmak'},
{no:9,word:'describe',wordTr:'tarif etmek',question:"The victim said that she was unable to ...... her attacker because his face had been completely covered.",options:{A:'distort',B:'annoy',C:'describe',D:'balance',E:'settle'},correct:'C',explanation:'<b>describe</b>=tarif etmek'},
{no:10,word:'hasty',wordTr:'aceleci',question:"You should consider this matter carefully and not make a/an ...... decision.",options:{A:'sluggish',B:'hasty',C:'cautious',D:'virtual',E:'lengthy'},correct:'B',explanation:'<b>hasty</b>=aceleci. <b>cautious</b>=ihtiyatlı'},
{no:11,word:'initially',wordTr:'başlangıçta',question:"Murat was ...... disappointed with London, but as he began to make friends, he began to enjoy himself more and more.",options:{A:'strictly',B:'eventually',C:'decently',D:'ultimately',E:'initially'},correct:'E',explanation:'<b>initially</b>=başlangıçta. <b>eventually</b>=sonunda'},
{no:12,word:'tight',wordTr:'dar / sıkı',question:"Either I am getting fat or this shirt has shrunk in the wash, since it is now far too ...... .",options:{A:'tight',B:'strict',C:'vertical',D:'loose',E:'broad'},correct:'A',explanation:'<b>tight</b>=dar, sıkı. <b>loose</b>=bol'},
{no:13,word:'objectively',wordTr:'tarafsız biçimde',question:"Reporters are sometimes blamed for not writing articles ...... .",options:{A:'subsequently',B:'intentionally',C:'distantly',D:'objectively',E:'nearly'},correct:'D',explanation:'<b>objectively</b>=tarafsız, nesnel biçimde'},
{no:14,word:'irritating',wordTr:'sinir bozucu',question:"It is very ...... to be constantly interrupted by an arrogant show-off who wants to be the centre of attention.",options:{A:'constructive',B:'irritating',C:'smooth',D:'dynamic',E:'satisfying'},correct:'B',explanation:'<b>irritating</b>=sinir bozucu'},
{no:15,word:'irrelevant',wordTr:'alakasız',question:"Your third paragraph is completely ......; it has nothing to do with the rest of your essay.",options:{A:'emergent',B:'irrelevant',C:'discourteous',D:'applicable',E:'doubtless'},correct:'B',explanation:'<b>irrelevant</b>=alakasız'},
{no:16,word:'impression',wordTr:'izlenim',question:"Somehow I got the ...... that you were angry with me.",options:{A:'impression',B:'occupation',C:'permanence',D:'involvement',E:'interference'},correct:'A',explanation:'<b>impression</b>=izlenim, his'},
{no:17,word:'domestic',wordTr:'yerel / ulusal',question:"Although the volume of ...... trade has been on the rise in recent years, international trade has fallen off sharply within the same period.",options:{A:'sensitive',B:'economical',C:'domestic',D:'fanciful',E:'amiable'},correct:'C',explanation:'<b>domestic</b>=yerel, ulusal'},
{no:18,word:'fading',wordTr:'sönmek',question:"It was dusk and the light was ......, but the neighbourhood kids kept playing football until they could not see anything at all.",options:{A:'eradicating',B:'deflating',C:'exhausting',D:'failing',E:'fading'},correct:'D',explanation:'<b>fail</b>(ışık için)=sönmek, azalmak'},
{no:19,word:'accommodate',wordTr:'barındırmak',question:"There were not enough hotel rooms in the town to ...... all the delegates who had arrived for the conference.",options:{A:'overlook',B:'surround',C:'inhabit',D:'construct',E:'accommodate'},correct:'E',explanation:'<b>accommodate</b>=barındırmak, yer vermek'},
{no:20,word:'conversation',wordTr:'sohbet',question:"Let's go somewhere else; It is too noisy in here to have a decent ...... .",options:{A:'coordination',B:'maintenance',C:'interference',D:'conversation',E:'intelligence'},correct:'D',explanation:'<b>conversation</b>=sohbet'},
{no:21,word:'annually',wordTr:'her yıl',question:"In India, Republic Day is celebrated ...... on January 26 in New Delhi and the capitals of the states.",options:{A:'seasonably',B:'densely',C:'annually',D:'suddenly',E:'eternally'},correct:'C',explanation:'<b>annually</b>=yıllık, her yıl'},
{no:22,word:'obscurity',wordTr:'bilinmezlik',question:"Some groups, like the Beatles or the Rolling Stones, remain popular for decades, whereas others have only one hit before fading into ...... .",options:{A:'obscurity',B:'faintness',C:'renown',D:'cloudiness',E:'distinction'},correct:'A',explanation:'<b>obscurity</b>=bilinmezlik. <b>renown</b>=şöhret'},
{no:23,word:'limp',wordTr:'aksayarak yürümek',question:"Since one of his legs was much longer than the other, he walked with a ...... for the rest of his life.",options:{A:'bruise',B:'limp',C:'scar',D:'bandage',E:'fracture'},correct:'B',explanation:'<b>limp</b>=aksama'},
{no:24,word:'precise',wordTr:'net / kesin',question:"His instructions were so ...... that each of us knew exactly what to do.",options:{A:'remote',B:'fuzzy',C:'vague',D:'scarce',E:'precise'},correct:'E',explanation:'<b>precise</b>=net, kesin. <b>vague</b>=belirsiz'},
{no:25,word:'drills',wordTr:'tatbikat',question:"In schools, fire ...... are required on a regular basis so that all the students and the staff know how to escape in case of fire.",options:{A:'flames',B:'fuels',C:'drills',D:'samples',E:'exits'},correct:'C',explanation:'<b>drill</b>=tatbikat'},
{no:26,word:'contribute',wordTr:'katkıda bulunmak',question:"Rather than giving to beggars on the street, it is more helpful to ...... to charities that assist the poor and homeless.",options:{A:'contribute',B:'consider',C:'elect',D:'prejudge',E:'abstain'},correct:'A',explanation:'<b>contribute</b>=katkıda bulunmak, bağışlamak'},
{no:27,word:'audition',wordTr:'seçme sınavı',question:"Alice impressed everyone so much in her ...... that she was chosen to play the leading role.",options:{A:'destination',B:'anticipation',C:'reputation',D:'circulation',E:'audition'},correct:'E',explanation:'<b>audition</b>=seçme sınavı'},
{no:28,word:'uncertain',wordTr:'belirsiz',question:"No one has ever tried a scheme like this before, so the outcome is ...... .",options:{A:'uncertain',B:'willful',C:'prejudiced',D:'accidental',E:'hopeless'},correct:'A',explanation:'<b>uncertain</b>=belirsiz'},
{no:29,word:'allowance',wordTr:'harçlık',question:"When Megan came home with a bad report from school, her father was so angry that he reduced her ...... to half.",options:{A:'restriction',B:'perception',C:'tolerance',D:'allowance',E:'accommodation'},correct:'D',explanation:'<b>allowance</b>=harçlık, ödenek'},
{no:30,word:'significant',wordTr:'önemli',question:"There have been ...... changes to the Turkish constitution over the past several years.",options:{A:'superfluous',B:'significant',C:'eternal',D:'transparent',E:'stagnant'},correct:'B',explanation:'<b>significant</b>=önemli, kayda değer'},
{no:31,word:'slightly',wordTr:'biraz',question:"Since we are only ...... acquainted, I would not call her a close friend.",options:{A:'abruptly',B:'voluntarily',C:'gradually',D:'slightly',E:'alternately'},correct:'D',explanation:'<b>slightly</b>=biraz, az miktarda'},
{no:32,word:'Reputedly',wordTr:'iddiaya göre',question:"......, the first known design for a robot was produced around 1495 by Leonardo da Vinci.",options:{A:'Automatically',B:'Mechanically',C:'Consistently',D:'Reputedly',E:'Ideally'},correct:'D',explanation:'<b>reputedly</b>=söylendiğine göre'},
{no:33,word:'mediocre',wordTr:'vasat',question:"Colin was disappointed in his ...... results, especially since he had been expected to come out at the top of his class.",options:{A:'excellent',B:'outstanding',C:'awesome',D:'exceptional',E:'mediocre'},correct:'E',explanation:'<b>mediocre</b>=vasat, sıradan'},
{no:34,word:'endure',wordTr:'dayanmak',question:"Few people can ...... working 18 hours a day six days a week, as Jane does.",options:{A:'sacrifice',B:'endure',C:'repair',D:'hinder',E:'surrender'},correct:'B',explanation:'<b>endure</b>=dayanmak, katlanmak'},
{no:35,word:'manufactured',wordTr:'üretilmek',question:"Automobiles have been ...... in Detroit, USA, ever since Henry Ford set up the first assembly line there.",options:{A:'manufactured',B:'calculated',C:'fastened',D:'computed',E:'fabricated'},correct:'A',explanation:'<b>manufacture</b>=üretmek, imal etmek'},
{no:36,word:'suspense',wordTr:'gerilim',question:"The book will keep you in ...... until the final page; you will really want to keep turning the pages to find out what is going to happen next.",options:{A:'assumption',B:'coherence',C:'suspense',D:'variety',E:'conceit'},correct:'C',explanation:'<b>suspense</b>=gerilim, merak'},
{no:37,word:'gratitude',wordTr:'minnettarlık',question:"In ...... for his 50 years of service to the company, Ben was given a clock upon his retirement.",options:{A:'gratitude',B:'response',C:'decision',D:'dispute',E:'present'},correct:'A',explanation:'<b>in gratitude for</b>=...için şükran olarak'},
{no:38,word:'moderate',wordTr:'ılımlı',question:"As people get older it is still important to take ...... exercise, but overdoing it can be as bad as not getting any exercise at all.",options:{A:'descriptive',B:'exceeding',C:'understandable',D:'obsessive',E:'moderate'},correct:'E',explanation:'<b>moderate</b>=ılımlı, ölçülü'},
{no:39,word:'distinguished',wordTr:'seçkin',question:"Patrick O'Brian's stories of the early 19th-century British navy are ...... by his fascinating set of characters.",options:{A:'sealed',B:'discouraged',C:'distinguished',D:'dispatched',E:'likened'},correct:'C',explanation:'<b>distinguished</b>=seçkin, öne çıkan'},
{no:40,word:'tightened',wordTr:'sıkıştırılmak',question:"The wheel flew off the car, because the bolts hadn't been ...... properly.",options:{A:'softened',B:'lightened',C:'squeezed',D:'tightened',E:'linked'},correct:'D',explanation:'<b>tighten</b>=sıkıştırmak'}
]});

SORU_PAKETLERİ.push({ id:'els_lys_2010_vocab2', baslik:'ELS 2010/2011 – LYS Vocabulary II', aciklama:'25 soru · Kelime bilgisi', etiket:'LYS', sorular:[
{no:1,word:'articles',wordTr:'ürünler',question:"The clothes shop over there is closing down today, so it only has a few ...... left for sale.",options:{A:'points',B:'articles',C:'accounts',D:'gains',E:'abilities'},correct:'B',explanation:'<b>articles</b>=ürünler, eşyalar'},
{no:2,word:'immediately',wordTr:'hemen',question:"As soon as Natalie saw the police at her doorstep, she ...... thought that something had happened to her son.",options:{A:'previously',B:'relatively',C:'entirely',D:'finally',E:'immediately'},correct:'E',explanation:'<b>immediately</b>=hemen, derhal'},
{no:3,word:'accept',wordTr:'kabul etmek',question:"They didn't ...... Theodore's credit card at the hotel, so he had to pay for his room in cash.",options:{A:'accept',B:'borrow',C:'invest',D:'spend',E:'announce'},correct:'A',explanation:'<b>accept</b>=kabul etmek'},
{no:4,word:'distance',wordTr:'mesafe',question:"The ...... between the United States and Russia over the Bering Strait is only 40 kilometres.",options:{A:'scale',B:'region',C:'height',D:'distance',E:'location'},correct:'D',explanation:'<b>distance</b>=mesafe'},
{no:5,word:'reliable',wordTr:'güvenilir',question:"The metro is more ...... than the bus, because the bus is often late, but the metro rarely is.",options:{A:'reliable',B:'casual',C:'actual',D:'proper',E:'sincere'},correct:'A',explanation:'<b>reliable</b>=güvenilir'},
{no:6,word:'surface',wordTr:'yüzey',question:"The Black Sea's ...... temperature changes throughout the year, but the temperature in its depths is constant.",options:{A:'slope',B:'summit',C:'surface',D:'status',E:'service'},correct:'C',explanation:'<b>surface</b>=yüzey'},
{no:7,word:'includes',wordTr:'içermek',question:"My copy of the novel Les Misérables also ...... some essays by the author on history, politics, and religion.",options:{A:'consists',B:'adds',C:'varies',D:'includes',E:'struggles'},correct:'D',explanation:'<b>include</b>=içermek, kapsamak'},
{no:8,word:'deserved',wordTr:'hak etmek',question:"Emin ...... a better reward than 50 kuruş for returning a purse that had 450 TL in it.",options:{A:'disappointed',B:'deserved',C:'attended',D:'followed',E:'compared'},correct:'B',explanation:'<b>deserve</b>=hak etmek'},
{no:9,word:'hurt',wordTr:'yaralanmak',question:"Christopher ...... his leg when he fell down the stairs in a department store.",options:{A:'rejected',B:'destroyed',C:'hurt',D:'wound',E:'dropped'},correct:'C',explanation:'<b>hurt</b>=yaralanmak, incitmek'},
{no:10,word:'audience',wordTr:'seyirci kitlesi',question:"We thought that the performance of A Doll's House was really bad, but the rest of the ...... enjoyed it very much.",options:{A:'criticism',B:'opinion',C:'neighbour',D:'support',E:'audience'},correct:'E',explanation:'<b>audience</b>=seyirci kitlesi'},
{no:11,word:'offered',wordTr:'teklif etmek',question:"Tatienne has ...... me 70 euros for my mobile phone, but I don't plan to sell it.",options:{A:'received',B:'afforded',C:'exchanged',D:'wasted',E:'offered'},correct:'E',explanation:'<b>offer</b>=teklif etmek'},
{no:12,word:'confident',wordTr:'kendinden emin',question:"Demet knows the match will be hard, but she is ...... that her team will win.",options:{A:'doubtful',B:'confident',C:'predictable',D:'surprised',E:'enjoyed'},correct:'B',explanation:'<b>confident</b>=kendinden emin. <b>doubtful</b>=şüpheli'},
{no:13,word:'generations',wordTr:'nesiller',question:"Jung Chang's bestseller Wild Swans explores a Chinese family over three different ......—Chang's own grandmother, her mother, and herself.",options:{A:'decisions',B:'effects',C:'generations',D:'complications',E:'connections'},correct:'C',explanation:'<b>generations</b>=nesiller, kuşaklar'},
{no:14,word:'wealthy',wordTr:'zengin',question:"Although Oprah Winfrey was born poor, she is now extremely ......., as she is worth 1.4 billion dollars.",options:{A:'wealthy',B:'costly',C:'expensive',D:'infamous',E:'conceited'},correct:'A',explanation:'<b>wealthy</b>=zengin. <b>infamous</b>=kötü şöhretli'},
{no:15,word:'suit',wordTr:'yakışmak',question:"This furniture won't ...... our living room, so let's look in some other shops for some different models.",options:{A:'oppose',B:'admit',C:'demand',D:'interpret',E:'suit'},correct:'E',explanation:'<b>suit</b>=yakışmak, uymak'},
{no:16,word:'moving',wordTr:'dokunaklı',question:"Alpay found the film Titanic to be very ......., and so he cried at the end of it.",options:{A:'dangerous',B:'classical',C:'annoying',D:'moving',E:'offensive'},correct:'D',explanation:'<b>moving</b>=dokunaklı, duygusal'},
{no:17,word:'range',wordTr:'uzanmak',question:"Sharks ...... in size from the 50-centimetre-long Etmopterus hillianus to the 9-metre-long whale shark.",options:{A:'range',B:'inhabit',C:'confuse',D:'rate',E:'resemble'},correct:'A',explanation:'<b>range from...to</b>=...dan ...a kadar uzanmak'},
{no:18,word:'impact',wordTr:'çarpma / etki',question:"The ...... of a meteor on Earth 65 million years ago created a crater 180 kilometres wide, and probably caused the extinction of the dinosaurs.",options:{A:'discovery',B:'effort',C:'violence',D:'collapse',E:'impact'},correct:'E',explanation:'<b>impact</b>=çarpma, etki'},
{no:19,word:'treats',wordTr:'davranmak',question:"Aydan is more popular than you because she ...... people with more respect than you do.",options:{A:'behaves',B:'treats',C:'gossips',D:'deals',E:'returns'},correct:'B',explanation:'<b>treat</b>=davranmak, muamele etmek'},
{no:20,word:'emphasis',wordTr:'vurgu / önem',question:"We don't do much speaking in our Spanish class because the ...... of the lessons is on reading and grammar.",options:{A:'movement',B:'separation',C:'condition',D:'emphasis',E:'occasion'},correct:'D',explanation:'<b>emphasis</b>=vurgu, ağırlık'},
{no:21,word:'several',wordTr:'birkaç',question:"There are ...... Portuguese-speaking countries in the world—the biggest one is Brazil.",options:{A:'available',B:'average',C:'spare',D:'several',E:'contrary'},correct:'D',explanation:'<b>several</b>=birkaç, çeşitli'},
{no:22,word:'probably',wordTr:'muhtemelen',question:"There are only two matches left and Barcelona is leading by 5 points, so Barcelona will ...... win the league this year.",options:{A:'probably',B:'enormously',C:'relatively',D:'briefly',E:'specially'},correct:'A',explanation:'<b>probably</b>=muhtemelen'},
{no:23,word:'caused',wordTr:'neden olmak',question:"A speeding driver ...... the death of 15 schoolchildren and their teacher in an accident on the motorway.",options:{A:'chased',B:'crashed',C:'caused',D:'crushed',E:'collapsed'},correct:'C',explanation:'<b>cause</b>=neden olmak, yol açmak'},
{no:24,word:'famous',wordTr:'ünlü',question:"Tom Cruise is one of America's most ...... actors, because people recognize him all over the world.",options:{A:'traditional',B:'nearby',C:'fluent',D:'efficient',E:'famous'},correct:'E',explanation:'<b>famous</b>=ünlü, tanınmış'},
{no:25,word:'forgotten',wordTr:'unutmak',question:"Giovanna was very angry with Lance on Tuesday because he had ...... that it was her birthday.",options:{A:'prevented',B:'forgotten',C:'delayed',D:'removed',E:'misled'},correct:'B',explanation:'<b>forget</b>=unutmak'}
]});

// ── Kelime import modal ───────────────────────────────────────────
function showImportSorularModal() {
    const overlay = document.createElement('div');
    overlay.id = 'import-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    const paketler = SORU_PAKETLERİ.map(p => {
        const zatenVar = (window.aiArsiv || []).some(e => e.listName === p.baslik);
        return `<div style="background:var(--white);border:1.5px solid ${zatenVar?'#22c55e':'var(--border)'};border-radius:14px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div><div style="font-size:.88rem;font-weight:800;color:var(--ink);">${p.baslik}</div>
            <div style="font-size:.74rem;color:var(--ink3);margin-top:3px;">${p.aciklama}</div>
            ${zatenVar?'<div style="font-size:.7rem;color:#22c55e;font-weight:700;margin-top:4px;">✅ Yüklendi</div>':''}</div>
            <button onclick="importSoruPaketi('${p.id}',this)" style="padding:8px 18px;border-radius:9px;border:none;background:${zatenVar?'#dcfce7':'linear-gradient(135deg,#6366f1,#8b5cf6)'};color:${zatenVar?'#16a34a':'#fff'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
                ${zatenVar?'↺ Yeniden':'📥 Yükle'}</button></div>`;
    }).join('');
    overlay.innerHTML = `<div style="background:var(--bg,#f8f8f8);border-radius:18px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div style="font-size:1rem;font-weight:900;color:var(--ink);">📥 Kelime Paketi Yükle</div>
            <button onclick="document.getElementById('import-modal-overlay').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--ink3);">✕</button>
        </div>${paketler}</div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

function importSoruPaketi(paketId, btn) {
    const paket = SORU_PAKETLERİ.find(p => p.id === paketId);
    if (!paket) return;
    window.aiArsiv = window.aiArsiv || [];
    window.aiArsiv = window.aiArsiv.filter(e => e.listName !== paket.baslik);
    const BASE_DATE = new Date('2010-06-01').toISOString();
    paket.sorular.forEach(q => {
        window.aiArsiv.push({ id: parseInt(paket.id.replace(/\D/g,'').slice(0,8)+String(q.no).padStart(3,'0')),
            date:BASE_DATE, word:q.word, wordTr:q.wordTr, listName:paket.baslik,
            question:q.question, options:q.options, correct:q.correct, selected:null, isCorrect:null, explanation:q.explanation });
    });
    window.aiArsiv.sort((a,b) => b.id - a.id);
    if (window._saveData) window._saveData();
    else localStorage.setItem('ydt_ai_arsiv', JSON.stringify(window.aiArsiv));
    if (window.updateArsivBadge) window.updateArsivBadge();
    btn.textContent = '✅ Yüklendi!'; btn.style.background='#dcfce7'; btn.style.color='#16a34a';
    setTimeout(() => { const ov=document.getElementById('import-modal-overlay'); if(ov) ov.remove(); if(typeof showAIArsiv==='function') showAIArsiv(); }, 900);
}

// ── Paragraf import modal ─────────────────────────────────────────
const PARAGRAF_PAKETLERİ = [];
PARAGRAF_PAKETLERİ.push({
    id: 'reading_test1_yesdil',
    baslik: 'Reading Passages – Test 1 (Yesdil)',
    aciklama: '6 pasaj · 18 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. Judo', metin:"Judo, which means 'the gentle way', is a perfect example of how skill can overcome brute force because it teaches a person to use an opponent's weight against them. So, although a woman may feel intimidated by a taller male opponent, through the skilful application of throws and holds, she can overpower him. It's easy to see why this sport produces self-confidence and is a great way of releasing tension. The sport of judo was invented in Japan in 1882 to combat bullying in schools. Jigoro Kano founded a judo academy after years of studying other martial arts to discover the most efficient way of deterring his playground enemies. Initially judo was not accepted by other martial artists, but in 1886, Tokyo's police force held a martial art tournament and judo techniques scored highly. Recently, judo has been the most widely practiced of martial arts outside China and Japan.", kelimeler:{'gentle':'nazik','overcome':'yenmek/aşmak','brute force':'kaba kuvvet','intimidated':'yıldırılmış','overpower':'alt etmek','tension':'gerilim/stres','combat':'mücadele etmek','bullying':'zorbalık','martial arts':'dövüş sanatları','deterring':'caydırmak'},questions:[
          {type:'Detail Question',icon:'🔍',question:"1- We are told in the passage that judo ........",options:['A) was invented by a Japanese policeman','B) was designed to fight bullying in Japanese schools','C) was developed outside China or Japan','D) was never popular with many martial artists','E) is the only martial art practised by women'],answer:'B',explanation:"'The sport of judo was invented in Japan in 1882 to combat bullying in schools' → B şıkkını doğrudan destekler. A yanlış: polis değil Jigoro Kano kurdu."},
          {type:'Inference Question',icon:'💭',question:"2- We can conclude from the information given in the passage that to be successful at judo, one must ........",options:['A) be bullied by someone much stronger','B) be physically stronger than an opponent','C) be skilled in the techniques of the sport','D) have a lot of tension to release','E) be very tall and heavy'],answer:'C',explanation:"'through the skilful application of throws and holds, she can overpower him' → fiziksel güç değil teknik beceri belirleyicidir."},
          {type:'Inference Question',icon:'💭',question:"3- We can infer from the passage that judo produces self-confidence because in judo, ..........",options:['A) one can enter international tournaments throughout the year','B) the philosophy prepares one to feel strong enough to overpower anyone','C) it is possible for one to beat an opponent who is physically stronger','D) It is quite easy to apply the techniques one has learnt','E) one grows very big physically because of the practice'],answer:'C',explanation:"Fiziksel olarak daha güçlü bir rakibin yenilebildiği anlatılıyor → bu öz güveni açıklar."}
        ]
      },
      { baslik:'2. The Bayeux Tapestry', metin:"The Bayeux Tapestry, a historical record created in the 11th century, is the only masterpiece of its kind in the world. The most extraordinary thing about it is its sheer size. It is a huge embroidered piece of linen cloth measuring 70 metres long and 50 metres high. The pictures tell the story of the conquest of England, by William the Conqueror in 1066. The designers sectioned the story into 72 separate scenes, which begin with the King of England, Edward the Confessor, shown close to death in 1064 and ends with the crushing defeat of the Anglo-Saxons by the Normans at Hastings on the south coast of England. It shows King Harold with an arrow in his eye. The scenes which include battles kidnappings ransoms are embroidered in rich colours which bears no resemblance to reality. Animals, for example, can be depicted in blue, green or yellow. For many years the tapestry, which served as a decoration in the cathedral at Bayeux, was little known outside the town. Today, after being meticulously repaired, it is on display for tourists.", kelimeler:{'tapestry':'duvar halısı/goblen','embroidered':'işlemeli','conquest':'fetih','sheer':'tam/saf','depicted':'tasvir edilmek','meticulously':'titizlikle','resemblance':'benzerlik','ransom':'fidye','crushing defeat':'ezici yenilgi','masterpiece':'başyapıt'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"4- According to the passage, the scenes embroidered on the tapestry ........................",options:["A) are made up of seventy-two separate sections showing the conquests of all countries by the Normans","B) show the history of England being conquered in the 11th century","C) also reflect parts of the cathedral in the French town of Bayeux","D) tell of Edward the Confessor's childhood in detail","E) also include parts from the lives of the people who embroidered it"],answer:'B',explanation:"72 sahne İngiltere'nin 1066'daki fethini anlatıyor. A yanlış: tüm ülkeler değil, sadece İngiltere."},
          {type:'Detail Question',icon:'🔍',question:"5- The passage tells us that the story on the work of art starts with ........................",options:["A) the tapestry being repaired","B) the cathedral at Bayeux","C) the kidnapping of William the Conqueror","D) the King of England's ill health","E) the defeat of the English King in battle"],answer:'D',explanation:"'begin with the King of England, Edward the Confessor, shown close to death in 1064' → D 'ill health'=ölüm döşeğinde olmak."},
          {type:'Main Idea Question',icon:'🎯',question:"6- The author notes that the most unusual aspect of this tapestry is ..................",options:["A) that it shows real battles","B) the unnatural colours","C) its painstaking restoration","D) that it shows royal characters","E) the immense size of the work"],answer:'E',explanation:"'The most extraordinary thing about it is its sheer size' → en olağandışı özellik devasa boyutudur."}
        ]
      },
      { baslik:'3. The Internet', metin:"The Internet originated as a system used for research by the military in the USA. Universities were the next group to connect to the system. The Internet started to develop as commercial system in the late 1980s and by the mid-1990s, home users were starting to connect to the Internet in significant numbers. Internet usage is still growing quickly and the number of hours we spend 'on-line' is rising sharply. The United States still leads the way in Internet usage, but Europe is catching up. It is difficult to predict such a fast-growing area, but at the end of 1999, it was estimated that between 13 and 14 million people in the UK, about one fifth of the population, had access to the Internet. World-wide, at least 100 million people are connected to the system. E-mail is the simplest application of the Internet, but it is also the most popular both among businesses and personal users. E-mail is a straightforward and cost-effective way of communicating using the Internet, falling somewhere between the phone and the facsimile in terms of formality and speed. E-mail is cheap and it only takes a few seconds for a message to reach the Internet. At the moment, the computer is the most common way people connect to the Internet, followed by mobile phones, but in the future, television sets will have Internet capabilities.", kelimeler:{'originated':'köken almak','commercial':'ticari','significant':'önemli','predict':'tahmin etmek','estimated':'tahmin edilmek','straightforward':'basit/doğrudan','cost-effective':'ekonomik','facsimile':'faks','formality':'resmiyet','capabilities':'özellikler/kapasite'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7- According to the passage, the Internet was first used ........................",options:["A) by the American army to search for information","B) to carry out research for the American universities","C) to retrieve information through television screens","D) by businesses to attract more customers","E) by American households to send e-mail messages around the world"],answer:'A',explanation:"'The Internet originated as a system used for research by the military in the USA.' → İlk kullananlar ABD ordusu."},
          {type:'Detail Question',icon:'🔍',question:"8- According to the figures in the passage, in 1999, ........................",options:["A) 20 percent of British people had access to the Internet","B) the Internet started to develop as a commercial tool","C) the majority of businesses used e-mail as their main form of communication","D) Europe caught America up in the numbers of people using the Internet","E) 100 million British people used the Internet for e-mail messages"],answer:'A',explanation:"'about one fifth of the population, had access to the Internet' → nüfusun beşte biri=%20."},
          {type:'Prediction Question',icon:'🔮',question:"9- The author predicts that in the future........................",options:["A) everybody will be connected to the Internet","B) e-mail messages won't take as long to send as they do now","C) television sets will also be used to connect to the Internet","D) the military will make less use of the Internet","E) universities will find new ways of using the Internet both for research and teaching"],answer:'C',explanation:"'in the future, television sets will have Internet capabilities' → televizyonların da internete bağlanacağı öngörülüyor."}
        ]
      },
      { baslik:'4. Miguel Gil Moreno (1968-2000)', metin:"Even the most war-hardened journalists must have felt a cold shiver of shock on the day that Miguel Gil Moreno was shot dead by rebels from Sierra Leone. Miguel was killed close to where he had recently shot his last pictures, which were images of a massacre of UN troops. The death of Miguel, who was just 32 years old, deprives television news of the cameraman who shot some of the most compelling and powerful images of war. Miguel did not start out as a photographer or journalist, but as a lawyer. After graduating from Barcelona Central University Law School, he practised law at a city firm before studying Human Rights at the Centre for Human Rights in Barcelona. Miguel believed wholeheartedly in the right and obligation to bear witness and to report. He soon gained himself a reputation for, unequalled brilliance in photographing human suffering during conflicts. He worked in dangerous places such as Kosovo, the Congo and Sierra Leone. In 1998, he won the Rory Peck Award for his Kosovo coverage. How many people will be brave enough, like him, to go where the perpetrators of war would rather no one went?", kelimeler:{'war-hardened':'savaşa alışmış','rebels':'isyancılar','massacre':'katliam','compelling':'çarpıcı','deprives':'yoksun bırakmak','obligation':'yükümlülük','bear witness':'tanıklık etmek','unequalled':'eşsiz','perpetrators':'failleri','coverage':'habercilik'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"10- It's mentioned in the passage that Miguel last photographed..........",options:["A) the ceremony of the Rory Peck Award","B) casualties of the Kosovon crisis","C) law graduates from Barcelona Central University","D) some \"war-hardened journalists\"","E) a mass killing of United Nations soldiers"],answer:'E',explanation:"'his last pictures, which were images of a massacre of UN troops' → BM askerlerinin katliamı."},
          {type:'Inference Question',icon:'💭',question:"11- The passage states that as a result of Miguel's death, television news will ..........",options:["A) hire bodyguards for all their journalists","B) only hire war-hardened journalists","C) no longer cover the war in Sierra Leone","D) not send journalists into war zones","E) be missing one of its brilliant cameramen"],answer:'E',explanation:"'deprives television news of the cameraman who shot some of the most compelling images' → en iyi kameramanlarından birini kaybetti."},
          {type:'Detail Question',icon:'🔍',question:"12- Before becoming a journalist and cameraman, Miguel ..........",options:["A) worked as a lawyer","B) was a UN soldier","C) won the Rory Peck Award","D) escaped a massacre of UN troops","E) fought in the Kosovon War"],answer:'A',explanation:"'Miguel did not start out as a photographer or journalist, but as a lawyer.' → Avukattı."}
        ]
      },
      { baslik:"5. Philadelphia Museum of Art's Famous Steps", metin:"More money is spent on art in Philadelphia than in any other American city. In fact, about one percent of the total city budget is spent on art. Philadelphia's art museum houses an unparalleled collection from the Middle Ages onward. It has exhibits from all over the world and has a superb collection from the Orient. It is a palatial structure set in the middle of beautiful Fairmount Park. The museum is the city's number one tourist attraction and you would be forgiven for thinking that this has something to do with its collection of 500,000 paintings. However, the museum's popularity has more to do with another form of art, the film. During the film 'Rocky', the hero, played by Sylvester Stallone, runs up the front steps of the building while he was training for a fight. Tourists arrive in bus loads, but many don't even bother to enter the building. They come merely for a glimpse of the scene from the Academy Award winning film, Rocky.", kelimeler:{'unparalleled':'eşsiz','palatial':'saray gibi','merely':'sadece','glimpse':'kısa bakış','budget':'bütçe','superb':'mükemmel','onward':'itibaren','bother':'zahmet etmek','attraction':'cazibe merkezi','loads':'kalabalık gruplar'},questions:[
          {type:'Main Idea Question',icon:'🎯',question:"13- We learn from the passage that the museum is very popular with tourists because ..........",options:["A) Sylvester Stallone runs there every day","B) it has a wonderful collection of pieces of art from the Orient","C) it has over 500,000 paintings","D) the steps in front of it were used as a film set","E) so much money has been spent on it"],answer:'D',explanation:"'the museum's popularity has more to do with another form of art, the film' → Rocky filminin merdivenlerinde çekilmesi asıl sebep."},
          {type:'Detail Question',icon:'🔍',question:"14- According to the facts in the passage. ..........",options:["A) the steps of the art museum are regularly used by boxers to train for fights","B) Philadelphia's art museum has the largest collection of oriental art in the world","C) more tourists visit Philadelphia than any other American city","D) the film Rocky was the most expensive film ever made","E) for every dollar spent of the city budget, one cent is spent on art"],answer:'E',explanation:"'about one percent of the total city budget is spent on art' → bütçenin %1'i=her dolar için 1 sent."},
          {type:'Detail Question',icon:'🔍',question:"15- It's stated in the passage that Philadelphia's art museum is ..........",options:["A) too expensive for many of the city's visitors to afford to enter","B) overshadowed by the beauty of Fairmount Park","C) visited by more tourists than all the other attractions in the city","D) the most elaborate and stately building in the entire city","E) the former residence of the film star Sylvester Stallone"],answer:'C',explanation:"'The museum is the city's number one tourist attraction' → şehrin en çok ziyaret edilen yeri."}
        ]
      },
      { baslik:'6. Leaves of Grass', metin:"Walt Whitman's \"Leaves of Grass\" could stand as an autobiography, as a self-portrait, and as the life work of a man who first began to write in 1855. The book provoked a reaction of praise and criticism unequaled by any other American work of literature before. His friends agreed that he and the book were the same, and this was exactly the illusion the poet wished to create. But of course the two were separate. The Walt Whitman who was portrayed in \"Leaves of Grass\" was transcendental, as much myth as man. The mortal Walt was born to a family of English and Dutch extraction on 31 May, 1819, in West Hills, Long Island, N.Y.", kelimeler:{'autobiography':'otobiyografi','provoked':'kışkırtmak','unequaled':'eşsiz','illusion':'yanılsama','transcendental':'aşkın/metafizik','extraction':'köken/soy','portrayed':'tasvir edilmek','mortal':'ölümlü','self-portrait':'özportre','praise':'övgü'},questions:[
          {type:'Detail Question',icon:'🔍',question:"16- We learn from the passage that Walt Whitman's \"Leaves of Grass\" .......",options:["A) was his first work written in 1855","B) was the most controversial work of American literature until then","C) is a factual autobiography of the author","D) was universally appreciated by both friends and enemies of the author","E) was written in both English and Dutch"],answer:'B',explanation:"'a reaction of praise and criticism unequaled by any other American work of literature before' → o güne kadar en tartışmalı yapıt."},
          {type:'Inference Question',icon:'💭',question:"17- We understand from the passage that Walt Whitman's intention in writing \"Leaves of Grass\" was .......",options:["A) to tell about his life exactly as it was","B) to provoke as much praise as possible","C) to confuse critics with its complexity","D) to be a portrait of West Hills, Long Island","E) to be a mythical self-portrait of a poet"],answer:'E',explanation:"'this was exactly the illusion the poet wished to create' + 'transcendental, as much myth as man' → efsanevi özportre yaratmak istedi."},
          {type:'Inference Question',icon:'💭',question:"18- It is clear from the passage that Whitman .......",options:["A) is one of the greatest American novelists","B) did most of his writing on Long Island","C) lied about the origins of his parents in \"Leaves of Grass\"","D) did not begin writing when he was very young","E) used to visit Holland very often"],answer:'D',explanation:"1819 doğumlu, 1855'te yazmaya başladı → 36 yaşında. 'Çok genç değilken' başladı. A yanlış: romancı değil şair."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'reading_test2_yesdil',
    baslik: 'Reading Passages – Test 2 (Yesdil)',
    aciklama: '6 pasaj · 18 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. Hallucinogens', metin:"While many drugs speed up or depress the central nervous system, there is a class of drugs that distorts how we feel, hear, see, smell, taste and think. Called hallucinogens because users often hallucinate, or experience non-existent sensations, these drugs are also known as mind-bending drugs. Some hallucinogens come from natural sources, examples of which are mescaline, psilocybin, DMT and marijuana. Others are made in laboratories. Of all drugs, synthetic and natural, the most powerful is LSD, or lysergic acid diethylamide. Twenty micrograms, an almost infinitesimal amount, is sufficient to produce a hallucinogenic effect. The most pronounced psychological effects induced by hallucinogens are a heightened awareness of colours and patterns together with a slowed perception of time and a distorted body image. Sensations may seem to 'cross over', giving the user a sense of 'hearing' colours and 'seeing' sounds. Users may also slip into a dreamlike state, indifferent to the world around them and forgetful of time and place to such an extent that they may believe it possible to step out of a window or stand in front of a speeding car without harm. Users may feel several different emotions at once or swing wildly from one emotion to another. It is impossible to predict what kind of experience a hallucinogen may produce. Frightening or even panic-producing psychological reactions to LSD and similar drugs are common. Sometimes, taking a hallucinogen leaves the user with serious mental or emotional problems, though it is unclear whether the drug simply unmasks a previously existing disorder or actually produces it.", kelimeler:{'hallucinogen':'halüsinojen','distort':'çarpıtmak','hallucinate':'halüsinasyon görmek','infinitesimal':'son derece küçük','pronounced':'belirgin','heightened':'artmış/yoğunlaşmış','perception':'algı','indifferent':'kayıtsız','unmask':'gizlisini açığa çıkarmak','synthetic':'sentetik'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"1- One physical danger of taking the type of drugs described in the passage is that the user may .........",options:['A) become deaf','B) think that he or she can smell colours','C) feel absolutely no sense of danger','D) have mild nightmares','E) lose his or her eyesight'],answer:'C',explanation:"Pasaj, kullanıcının pencereden atlamayı veya hızlı bir aracın önünde durmayı zararsız bulabileceğini anlatıyor → tehlike hissi tamamen yok olabiliyor. C doğrudur."},
          {type:'NOT Question',icon:'🚫',question:"2- The effect which is NOT listed among those resulting from taking hallucinogens is .........",options:['A) an unreal concept of the shape of the body','B) a more intense consciousness of colours','C) a distorted concept of time','D) a slowing down of the central nervous system','E) the experiencing of sensations which are not actually existent'],answer:'D',explanation:"Pasaj halüsinojenlerin merkezi sinir sistemini yavaşlattığından (depress) bahsetmiyor; tam tersine bunun AYRI bir ilaç sınıfı olduğunu belirtiyor. D pasajda sayılmıyor."},
          {type:'Inference Question',icon:'💭',question:"3- The passage tells us that it is not clear if .............",options:['A) it is possible to accurately predict what kind of experience a hallucinogen may produce','B) small amounts of LSD can produce hallucinations','C) different colours do have different smells','D) lysergic acid diethylamide is a hallucinogen or not','E) hallucinogens cause serious mental problems or reveal them'],answer:'E',explanation:"'it is unclear whether the drug simply unmasks a previously existing disorder or actually produces it' → E şıkkını doğrudan destekler."}
        ]
      },
      { baslik:'2. The Battle of Dienbienphu', metin:"Few events better symbolise the end of colonialism in the Third World than the Battle of Dienbienphu. This was the inglorious defeat suffered by French troops as they made a last stand to hold onto their colonial empire in Indochina. Following World War II, French colonial officials and military forces returned to Indochina to reclaim their colonies. Vietnam, meanwhile, had declared its independence and asked the United States for help. The United States decided to back France instead. The Vietnamese, many of whom were Communists, started a guerrilla war against the French. The French steadily lost ground to the nationalist Viet Minh forces. Late in 1953, the French occupied the town of Dienbienphu in an attempt to cut Vietnamese supply lines near the border with Laos. The Vietnamese responded by cutting all ground access to the city, so the French had to fly in all supplies. In the spring of 1954, the Vietnamese general, Vo Nguyen Giap, besieged Dienbienphu with 40,000 troops. They used artillery to batter the town's defenses and overran it on May 7. The first Indochina War was over, and on June 4, France and Vietnam signed a treaty giving Vietnam complete independence. This defeat, combined with events that were soon to unfold in Algeria, led to the collapse of France's Fourth Republic.", kelimeler:{'symbolise':'simgelemek','colonialism':'sömürgecilik','inglorious':'utanç verici/şerefsiz','guerrilla war':'gerilla savaşı','nationalist':'milliyetçi','besieged':'kuşatmak','artillery':'topçu/ağır silahlar','treaty':'antlaşma','unfold':'gelişmek/açığa çıkmak','reclaim':'geri almak'},
        questions:[
          {type:'Main Idea Question',icon:'🎯',question:"4- The author describes the Battle of Dienbienphu to be ................",options:['A) typical of how the US and France have worked together in the past','B) responsible for the civil war in Algeria','C) a good mark that the period of colonialism in the Third World was nearly over','D) the most decisive battle in Indochina during World War II','E) a rare victory for Laos over Vietnam'],answer:'C',explanation:"'Few events better symbolise the end of colonialism in the Third World' → C şıkkını doğrudan destekler."},
          {type:'Inference Question',icon:'💭',question:"5- We understand from the passage that following the fighting in Vietnam, .......",options:['A) a guerrilla war against the French erupted','B) Algeria became a French colony','C) the French faced a similar problem in Algeria','D) France asked America for help for the fighting in Algeria','E) the Vietnamese surrendered to the Americans'],answer:'C',explanation:"'events that were soon to unfold in Algeria, led to the collapse of France's Fourth Republic' → Vietnam'dan sonra Cezayir'de de benzer sorun çıktı."},
          {type:'Inference Question',icon:'💭',question:"6- We can deduce from the passage that ................",options:['A) France had granted most of its other colonies independence before World War II','B) Vietnam was not under control of France during World War II','C) Communism seemed the best solution for Vietnam according to the US government','D) the Vietnamese had more technically advanced weapons than the French and Americans','E) nations other than France were staying in control of all their colonies during this period'],answer:'B',explanation:"'French colonial officials...returned to Indochina to reclaim their colonies' → savaştan sonra geri döndüler; savaş sırasında orada değillerdi. Vietnam savaş sırasında bağımsız kalmıştı."}
        ]
      },
      { baslik:'3. Helen Keller (1880-1968)', metin:"Helen Adams Keller was born on June 27, 1880. Nineteen months later, she had a severe illness that left her blind and deaf. Her parents had hope for her. They had read Charles Dickens' report of the aid given to another blind and deaf girl, Laura Bridgman. When Helen was 6 years old, her parents took her to see Alexander Graham Bell, famed teacher of the deaf and inventor of the telephone. As a result of his advice, Anne Mansfield Sullivan began to teach Helen in 1887. Until her death in 1936, she remained Helen's teacher and constant companion. Sullivan had been almost blind in early life, but her sight had been partially restored. Helen soon learnt the finger-tip, or manual, alphabet as well as Braille — a system of writing for blind people, using raised dots which can be read by touch. By placing her sensitive fingers on the lips and throat of her teachers, she felt their motions and learnt to 'hear' them speak. Three years after mastering the manual alphabet, she learnt to speak herself. 'Once I knew only darkness and stillness. My life was without past or future. But a little word from the fingers of another fell into my hand that clutched at emptiness, and my heart leapt to the rapture of living.' This is how Helen Keller described the beginning of her 'new life' when, despite blindness and deafness, she learnt to communicate with others.", kelimeler:{'severe':'şiddetli','famed':'ünlü','companion':'yoldaş/arkadaş','manual alphabet':'el alfabesi','Braille':'Braille alfabesi','rapture':'coşku/sevinç','clutch':'tutunmak','stillness':'sessizlik','mastering':'ustalaşmak','restored':'yeniden kazandırılmak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7- According to the passage one of the things which encouraged Helen's parents to think positively about their daughter's future was .......",options:['A) reports of Anne Mansfield Sullivan\'s successes with similar children','B) an account by Charles Dickens of the assistance another blind and deaf girl received','C) the way Alexander Graham Bell had partially recovered from blindness','D) the invention of Braille by Alexander Graham Bell in 1887','E) that her deafness and blindness were only partial'],answer:'B',explanation:"'They had read Charles Dickens' report of the aid given to another blind and deaf girl, Laura Bridgman.' → B şıkkını doğrudan destekler."},
          {type:'Detail Question',icon:'🔍',question:"8- Anne Mansfield Sullivan is described in the passage as Helen's teacher and .......",options:['A) the inventor of Braille','B) a faithful companion','C) the subject of a report by Charles Dickens','D) a distant relative','E) a student of Alexander Graham Bell'],answer:'B',explanation:"'she remained Helen's teacher and constant companion' → sürekli yoldaşı/arkadaşı."},
          {type:'Inference Question',icon:'💭',question:"9- From the information in the passage, we know that Helen Adams Keller .........",options:['A) was overjoyed about being able to communicate with others','B) was blind and deaf when she was born','C) was almost blind when she was born but partially regained her sight later','D) took shorter than most students to learn the manual alphabet','E) was disappointed by the slow progress she made under the instruction of Sullivan'],answer:'A',explanation:"'my heart leapt to the rapture of living' → başkalarıyla iletişim kurabilmek büyük sevinç yarattı. A doğru. B yanlış: hastalık 19 ay sonra geldi."}
        ]
      },
      { baslik:'4. Preserving Wildlife in National Parks', metin:"The wildlife of Africa has been greatly reduced in the past 50 years, partly as a result of overhunting and poaching and partly because large areas of their natural habitats have been taken over for farming. Today many species are threatened with extinction. To protect wildlife, several countries have set aside land used exclusively for wild animals. These areas, called national parks, have tourist facilities that permit visitors to watch the animals in a natural setting. Among the countries that have established such parks are Burkina Faso, Cameroon, Kenya, Tanzania, Zimbabwe and South Africa. Besides providing greater protection for the animals and promoting tourism, the parks make it possible for scientists to study animal behaviour in the wild. While scientists, tourists and animal lovers praise the national parks, the creation of these areas has led to conflict with people who would like to use the land for other purposes. The population of Africa is growing rapidly, and where there is a shortage of land for herders and farmers, the parks are seen as depriving people of land. The conflict is a difficult one, and it appears that it could continue for decades. One place where this problem is particularly serious is Kenya. There the government deals with the conflict by paying money earned from tourism as compensation for the loss of land to people who live next to the parks. It also spends money on projects that will directly benefit these people. The Kenyan government hopes that if people see and share in the economic benefits of the parks, they will be more willing to accept their presence.", kelimeler:{'poaching':'kaçak avlanma','habitat':'doğal yaşam alanı','exclusively':'yalnızca','extinction':'soyu tükenme','promote':'teşvik etmek','deprive':'yoksun bırakmak','compensation':'tazminat','herder':'çoban','shortage':'kıtlık/eksiklik','conflict':'çatışma'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"10- According to the passage, wild animals in Africa .........",options:['A) are better protected than in most other parts of the world','B) have not yet been studied scientifically in their natural habitats','C) are now used exclusively for scientific purposes','D) have decreased in number over the last half a century','E) are no longer threatened with extinction due to governments controlling poaching'],answer:'D',explanation:"'The wildlife of Africa has been greatly reduced in the past 50 years' → son 50 yılda (yarım yüzyılda) sayıları azaldı."},
          {type:'Detail Question',icon:'🔍',question:"11- It's stated in the passage that those who object to the establishment of national parks are .........",options:['A) government officials','B) foreign tourists','C) animal lovers','D) research scientists','E) herders and farmers'],answer:'E',explanation:"'led to conflict with people who would like to use the land for other purposes...shortage of land for herders and farmers' → çobanlar ve çiftçiler itiraz ediyor."},
          {type:'Detail Question',icon:'🔍',question:"12- The Kenyan government makes up for any loss of land incurred by people living next to national parks by .........",options:['A) keeping them informed of scientific discoveries on animal behaviour','B) permitting them free entrance to the park','C) allowing them to hunt wild animals within the park','D) paying them some of the money gained through tourism','E) allowing them to farm some of the land on the park'],answer:'D',explanation:"'paying money earned from tourism as compensation for the loss of land' → turizm gelirinden tazminat ödüyor."}
        ]
      },
      { baslik:'5. Harriet Monroe', metin:"As a poet, Harriet Monroe knew that other poets had little chance to become known and earn money. Few books by living poets were published, and magazines bought poetry mainly to fill leftover space. She solved the problem by starting her own poetry magazine, Poetry: a Magazine of Verse in 1912, through which she had a major influence on the development of modern poetry. She knew that a new publication with a small circulation could not pay its own way. Nevertheless, she wanted to pay poets for their work and to offer prizes. She could think of only one way to accomplish this: to persuade well-to-do people to support the magazine as they did orchestras and art museums. By asking about 100 Chicagoans to pledge $50 annually for five years, Monroe raised the money to launch her magazine. She became the first editor. As its motto she chose a line from Walt Whitman: 'To have great poets there must be great audiences too.' Poetry published the work of nearly every notable modern American and British poet. Some well-known poems that first appeared in the magazine are Carl Sandburg's 'Chicago', Joyce Kilmer's 'Trees', T.S. Eliot's 'The Love Song of J. Alfred Prufrock', and Vachel Lindsay's 'Congo'. Monroe never married. Her hobbies were travel and mountain climbing. She continued as editor of Poetry until her death on September 26, 1936, in Peru.", kelimeler:{'circulation':'tiraj','pledge':'taahhüt etmek/söz vermek','launch':'başlatmak','well-to-do':'varlıklı','motto':'motto/slogan','notable':'dikkate değer','annually':'yıllık olarak','leftover':'artık/fazlalık','persuade':'ikna etmek','accomplish':'başarmak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"13- In order to bring the work of living poets to the attention of a wide audience, Harriet Monroe .........",options:['A) campaigned in magazines','B) started her own poetry magazine','C) toured South America','D) wrote to Walt Whitman for help','E) used leftover space in her magazine Poetry'],answer:'B',explanation:"'She solved the problem by starting her own poetry magazine' → kendi şiir dergisini kurdu."},
          {type:'Detail Question',icon:'🔍',question:"14- It is noted in the passage that, in order to fund her business venture, Monroe .......",options:['A) used her vast personal wealth','B) asked modern poets to donate their work free of charge','C) persuaded the rich of Chicago to donate money for the project','D) used her wages as the editor of another magazine','E) asked for donations from well-known American and British poets'],answer:'C',explanation:"'By asking about 100 Chicagoans to pledge $50 annually for five years' → Chicago'nun varlıklılarını ikna etti."},
          {type:'Detail Question',icon:'🔍',question:"15- According to the passage, 'Poetry: a Magazine of Verse' .........",options:['A) never paid for itself','B) mainly printed the work of dead poets','C) had a significant effect on the advancement of modern verse','D) failed to attract the work of notable American and British poets','E) had problems finding material to fill leftover space'],answer:'C',explanation:"'she had a major influence on the development of modern poetry' → modern şiirin gelişimine büyük katkı."}
        ]
      },
      { baslik:'6. The Diaries of Samuel Pepys', metin:"Historians owe most of their knowledge of the London of the 1660s to Samuel Pepys, England's greatest diarist. He began his diary in 1660, the year that Puritan rule ended and the period called the Restoration began. After the sobriety of the Puritan years, Londoners now took great pleasure in attending the reopened theatres, where they enjoyed the comedies of John Dryden and other Restoration dramatists. Pepys enjoyed London life to the full, and he wrote down practically everything he thought, felt, saw or heard. He described the city's churches, theaters and taverns, its streets and homes, and even the clothes that he and his wife wore. Many momentous happenings took place during the years covered in Pepys's diary. He remained in London during the Great Plague of 1664-65, and he also saw the Great Fire of 1666. He numbered among his friends many of the well-known people of the time, including the scientist Isaac Newton, the architect Christopher Wren and the poet John Dryden. Owing to failing eyesight, Pepys regretfully closed his diary in 1669. Pepys wrote his diary in Thomas Shelton's system of shorthand, but he complicated the more confidential passages by using foreign languages and a cipher of his own invention. Upon his death, along with other books and papers, the diary went to his old college at Cambridge. It was not deciphered until 1822. In addition to its historical significance, the diary holds a high place in literature. The style is vigorous, racy and colloquial. Because he intended it to be read only by himself, Pepys was completely honest. An incomplete edition appeared in 1825, and the entire diary, except for a few passages deliberately omitted by the editors, was available by 1899. An edition completed in 1983 includes the entire work.", kelimeler:{'diarist':'günlük yazarı','sobriety':'ağırbaşlılık/sadelik','momentous':'çok önemli','plague':'veba','cipher':'şifre','shorthand':'steno','colloquial':'günlük konuşma diline ait','deciphered':'çözümlenmek','vigorous':'güçlü/canlı','confidential':'gizli'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"16- Pepys's diary, according to the passage, .........",options:['A) gives an accurate account of Puritan rule in England','B) gives summarised general descriptions of London in his day','C) does not include any personal information','D) was written beautifully in a language he had created himself','E) describes his daily life and London in great detail'],answer:'E',explanation:"'he wrote down practically everything he thought, felt, saw or heard' + şehri, evleri, kıyafetleri anlattı → günlük hayatını ve Londra'yı büyük ayrıntıyla anlatıyor."},
          {type:'Detail Question',icon:'🔍',question:"17- It is stated in the passage that, in order to keep the meaning of some sections secret, Pepys .........",options:['A) locked his diary up','B) deliberately omitted pages when he gave it to the publishers','C) wrote in Thomas Shelton\'s system of shorthand','D) used a code and foreign languages','E) burnt sections of the book'],answer:'D',explanation:"'he complicated the more confidential passages by using foreign languages and a cipher of his own invention' → şifre + yabancı dil kullandı."},
          {type:'Main Idea Question',icon:'🎯',question:"18- Pepys's diary is, as stated in the passage, particularly interesting because .........",options:['A) he knew several important people and lived through some very important occurrences in London','B) he describes the moderation and strictness of the Puritan era','C) of the detailed accounts it gives of churches, theaters, taverns and streets of Cambridge','D) the code he used has never been translated by anyone','E) it describes the experiments carried out by the scientist Isaac Newton'],answer:'A',explanation:"Newton, Wren, Dryden gibi önemli kişiler + Büyük Veba + Büyük Yangın gibi olaylar → A doğru. C yanlış: Cambridge değil Londra."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'reading_test2b_yesdil',
    baslik: 'Reading Passages – Test 2B (Yesdil)',
    aciklama: '6 pasaj · 18 soru · YDT Reading',
    pasajlar: [
      { baslik:'7. Lifting Divorce Ban', metin:"In 1995, by a narrow vote of 50.28 percent to 49.72 percent, Irish voters approved a constitutional amendment allowing divorce. The margin of victory was just 9,118 votes out of 1.63 million cast, prompting a recount which upheld the result. In 1986, Irish voters had rejected the divorce amendment by a 2-to-1 margin. According to political analysts, working-class residents of Dublin, the nation's capital, who accounted for one-third of Ireland's population, provided the crucial swing vote that determined the outcome. Analysts attributed the change in attitude since 1986 to several factors. Many cited as important the fact that the Irish government had passed 18 laws since the failed referendum covering property rights, child custody, child support and other issues related to divorce, because many people voting 'no' in 1986 said that they did so because of inadequate laws covering the divisions of property in a divorce. Many analysts also pointed to the Irish government's 500,000-dollar promotional campaign in favour of lifting the divorce ban as an important factor in the amendment's passage. Opponents of the amendment, including the influential Roman Catholic church, said that they would challenge the result in the courts, pointing to the fact that the government's expenditure of public funds to promote the amendment was ruled illegal by the Irish Supreme Court. The amendment would allow people to divorce only if they have lived separately for at least four of the previous five years. There were approximately 80,000 legally separated people in Ireland in 1995. With Ireland's vote, Malta became the only European country to have a ban on divorce.", kelimeler:{'amendment':'anayasa değişikliği','upheld':'onaylamak/desteklemek','referendum':'referandum','inadequate':'yetersiz','expenditure':'harcama','promotional':'tanıtım amaçlı','custody':'velayet','attributed':'atfetmek','constitutional':'anayasal','swing vote':'belirleyici oy'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"19- The likely cause of the change in attitude in Ireland in favour of allowing divorce was, according to the passage, a result of .........",options:['A) a breakdown in family values over the previous nine years','B) encouragement from the Irish Supreme Court','C) the influential Catholic Church','D) several new laws covering factors connected with divorce','E) pressure from the European Union'],answer:'D',explanation:"'the Irish government had passed 18 laws since the failed referendum covering property rights, child custody...' → boşanmayla ilgili yeni yasalar tutumu değiştirdi."},
          {type:'Detail Question',icon:'🔍',question:"20- The passage indicates that the victory was largely due to .........",options:['A) a promotional campaign by Roman Catholic Church','B) the votes being incorrectly counted','C) an increase in the number of legally separated persons in Ireland','D) devout Roman Catholics refusing to vote on the issue','E) workers living in Dublin and their families changing their opinion'],answer:'E',explanation:"'working-class residents of Dublin...provided the crucial swing vote' → Dublin'deki işçi sınıfının oyunu değiştirmesi belirleyici oldu."},
          {type:'Inference Question',icon:'💭',question:"21- The passage gives us the information that, in all the European countries but one, .........",options:['A) it is legal for couples to get a divorce','B) the Roman Catholic church has no influence','C) the divorce rate is very high','D) governments call for referendums for important issues','E) there are adequate laws covering the divisions of property in a divorce'],answer:'A',explanation:"'Malta became the only European country to have a ban on divorce' → Malta dışındaki tüm Avrupa ülkelerinde boşanma yasaldır."}
        ]
      },
      { baslik:'8. Fifth Disease', metin:"Fifth disease is a mild but contagious, viral disease of children that causes a very characteristic facial rash. The formal name for the disease is erythema infectiosum, which means 'infectious redness'. The name fifth disease was applied to the condition because it was the fifth pink-red infectious rash of childhood to be described, the others being scarlet fever, measles, rubella — often called German measles — and roseola. Although people of any age may contract fifth disease, children attending elementary school are the major group at risk. The virus causing this condition, human parvovirus B19, is spread by exposure to airborne droplets exhaled by an infected person. The disease is seen mainly in the spring months, and often occurs as an outbreak in a geographically limited region. More than half of the children who are exposed to fifth disease will contract the illness. After an incubation period ranging from four days to two weeks, an infected child usually has a fever of less than 38°C, may feel slightly ill or tired, and develops the most characteristic sign of fifth disease: bright red or rosy rash on both cheeks, making them look as if they have been slapped. In fact, the infection has been called 'slapped cheeks disease'. The rash does not itch, and may extend to the upper arms, thighs and buttocks, where it is more pink than bright red and has a lacy or netlike appearance. Children usually are no longer ill after five to ten days, but the rash often recurs a number of times over a period of several weeks. It seems to be triggered by exposure to direct sunlight, exercising or emotional stress. The child may continue in school or day care at this stage because once the rash appears, there is no longer any risk of giving the disease to others. The only treatment for the patient during the acute illness phase is bed rest. Drinking plenty of fluids is also important.", kelimeler:{'contagious':'bulaşıcı','rash':'döküntü','incubation':'kuluçka','triggered':'tetiklenmek','recurs':'tekrarlamak','exhaled':'nefes vermek','acute':'akut/şiddetli','lacy':'dantel gibi','outbreak':'salgın','contract':'(hastalık) kapamak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"22- The details in the passage inform us that the group most affected by fifth disease is .........",options:['A) adults of all ages','B) elementary school children','C) children at day-care','D) patients of acute illnesses','E) children who are weak'],answer:'B',explanation:"'children attending elementary school are the major group at risk' → ilkokul çocukları en fazla risk altındaki grup."},
          {type:'Detail Question',icon:'🔍',question:"23- According to the author, once the other symptoms of the disease have subsided and only the red facial rash is visible, .........",options:['A) patients should seek bed rest','B) a temperature of over 38 degrees is common','C) children should be slapped on both cheeks','D) children can return to school','E) patients usually suffer emotional stress'],answer:'D',explanation:"'The child may continue in school or day care at this stage because once the rash appears, there is no longer any risk of giving the disease to others.' → döküntü görününce okula dönebilir."},
          {type:'Detail Question',icon:'🔍',question:"24- From the details about fifth disease given in the passage, it is clear that .........",options:['A) the majority of children who come into contact with the disease catch it','B) it only ever affects children, but can recur several times','C) the rashes it causes are normally very itchy','D) the netlike or lacy rashes it causes are confined to the facial area of the patient','E) the formal name for the disease is \"slapped cheeks disease\"'],answer:'A',explanation:"'More than half of the children who are exposed to fifth disease will contract the illness' → temas eden çocukların yarısından fazlası hastalığa yakalanıyor → çoğunluğu etkiliyor."}
        ]
      },
      { baslik:'9. Spies in CIA', metin:"In November 1996, for the second time in two years, a high-ranking CIA official was arrested for allegedly selling United States intelligence information to Russia. The FBI apprehended Harold J. Nicholson, who joined the CIA in 1980, and accused him of spying for Russia since 1994. According to the FBI, Nicholson sold the names of CIA agents operating in Russia to the Russian government. The motivation for Nicholson's betrayal, they believed, was purely monetary and was in no way ideologically charged. Nicholson was the highest ranking CIA official ever to be arrested for espionage. The most shocking aspect of his case was the fact that he began spying for Russia less than two weeks after another high-ranking CIA official, Aldrich Ames, had been arrested for serving as a Russian spy throughout the 1980s. The CIA estimated that the damage to United States intelligence work done by Nicholson, who had been under secret investigation since 1995, was considerably less than that done by Ames, who divulged information that compromised dozens of CIA operations and cost the lives of numerous agents. One indicator of the extent of the damage caused by the two spies, and of the changing times in the espionage game, could be gauged by their payoffs; whereas Nicholson had been paid an estimated $120,000 by Russian intelligence services, Ames reportedly received more than $2 million from the Soviets.", kelimeler:{'apprehended':'yakalamak/gözaltına almak','espionage':'casusluk','betrayal':'ihanet','monetary':'parasal','divulged':'ifşa etmek/açığa vurmak','compromised':'tehlikeye atmak','gauged':'ölçmek/değerlendirmek','payoff':'ödeme/rüşvet','allegedly':'iddiaya göre','ideologically':'ideolojik olarak'},questions:[
          {type:'Detail Question',icon:'🔍',question:"25- According to the passage, it is clear that Harold J. Nicholson gave information to the Russian government .........",options:['A) because he had been ill-treated at work','B) because he was supporting the communist cause','C) merely for the $120,000 they paid him','D) in return for over $2 million dollars','E) to save the lives of several CIA agents'],answer:'C',explanation:"'motivation...was purely monetary' + '$120,000' → sadece para için yaptı. D yanlış: 2 milyon Ames'e ödendi."},
          {type:'Detail Question',icon:'🔍',question:"26- Using the description given in the passage, Harold J. Nicholson's spying could be described as .........",options:['A) the most damaging that had ever been uncovered','B) resulting in the deaths of many agents and causing several operations to fail','C) significantly less than that done by another CIA agent, Aldrich Ames','D) helping the Americans to gather information on high-ranking Russian government officials','E) considerably more harmful to the CIA and their operations than that of Aldrich Ames'],answer:'C',explanation:"'the damage...done by Nicholson...was considerably less than that done by Ames' → Nicholson'ın zararı Ames'inkinden çok daha azdı."},
          {type:'Detail Question',icon:'🔍',question:"27- According to the author, the most surprising element of Nicholson's espionage activities was .........",options:['A) the small amount of money he was paid for giving the names of agents to the Russians','B) the vast sum of money he was paid for compromising CIA operations','C) the numerous CIA agents that lost their lives','D) the fact that he was not a particularly a high-ranking official','E) that he began his activities so soon after the arrest of another official'],answer:'E',explanation:"'The most shocking aspect of his case was the fact that he began spying for Russia less than two weeks after another high-ranking CIA official...had been arrested' → başka bir casusluk olayından iki hafta sonra başlaması şoke ediciydi."}
        ]
      },
      { baslik:'10. City Life', metin:"The sociology of cities has been studied by many scholars who have issued divergent and conflicting reports on the question of what effect living in cities has on people. The single feature that distinguishes city life from small-town or rural living is population: There are more people living more closely together in cities. There is no doubt that living in a major population centre can affect an individual's behaviour and emotional makeup. People in small towns are aware of informal social controls: What will the family think? What will the neighbours think? They know how quickly gossip gets passed around, so their social behaviour tends to be modified by this awareness. In a large city, these informal controls give way to formal ones — police, courts, jails, regulations and commands. The breakdown of informal controls throws individuals back on their own resources. Children in cities usually remain within the confines of the informal controls imposed by family, neighbours and friends. Adults, however, are more easily freed from these controls. To adults of strong character, this makes little difference. But to people whose lives are heavily influenced by what others think of them, the loss of informal controls can be quite unsettling. Such people can become lost in the crowd. Their personal contacts are superficial: They interact with other individuals only at those points where their life paths intersect — at work, at the grocery store, in restaurants, theatres or bar, on public transportation or at occasional social gatherings. In spite of hundreds of casual personal contacts, such individuals may be quite lonely. They may feel alienated from the rest of society, convinced that no one cares about them. This loneliness may promote mental illness or alcoholism, drug addiction or crime. Formal controls, because they are impersonal, are not nearly as effective as informal controls in regulating human behaviour.", kelimeler:{'divergent':'birbirinden farklı','informal controls':'gayri resmi denetim','superficial':'yüzeysel','alienated':'yabancılaşmış','unsettling':'rahatsız edici','intersect':'kesişmek','confines':'sınırlar içinde','makeup':'yapı/karakter','gossip':'dedikodu','sociology':'sosyoloji'},questions:[
          {type:'Detail Question',icon:'🔍',question:"28- According to the passage, people in small towns, when compared with cities, .........",options:['A) care more about the judgement of other people','B) tend to have fewer occasions on which they can socialise','C) develop much healthier personalities','D) feel the existence of the police force less strongly','E) would lose their ways if taken to big cities'],answer:'A',explanation:"'People in small towns are aware of informal social controls: What will the family think? What will the neighbours think?' → başkalarının yargısına çok önem verirler."},
          {type:'Detail Question',icon:'🔍',question:"29- The passage describes one factor motivating people in small towns to behave in an acceptable way as .........",options:['A) the fear of what will be said about them by locals','B) the influence of superficial relationships','C) the rules imposed by authorities, such as the police','D) awareness of how important it is to their prospects at work','E) the fear of becoming an alcoholic or drug addict'],answer:'A',explanation:"'They know how quickly gossip gets passed around, so their social behaviour tends to be modified by this awareness.' → dedikodunun hızla yayılacağını bilmek davranışı düzenliyor."},
          {type:'Inference Question',icon:'💭',question:"30- According to the author, the nature of a lot of relationships in cities can .........",options:['A) lead to stronger personalities','B) initiate psychological problems','C) lead to happier families','D) pull families apart','E) provide much more effective control on human behaviour'],answer:'B',explanation:"'This loneliness may promote mental illness or alcoholism, drug addiction or crime.' → yüzeysel ilişkiler psikolojik sorunlara yol açabilir."}
        ]
      },
      { baslik:'11. Nero', metin:"He was born Lucius Domitius Ahenobarbus in AD 37, but he has come down through history as Nero, the last Roman emperor descended from Julius Caesar. He also won the reputation of being a tyrant — the ruler who 'fiddled while Rome burned' and who instigated the first persecution of Christians; however, Nero's unsavoury reputation is almost wholly undeserved. He was certainly not the bloody dictator that Roman and Christian historians have depicted. Nero was born in the Mediterranean seaport of Antium. He was brought up by his mother Agrippina, a great-granddaughter of the emperor Augustus. She is noted for her relentless scheming to secure the fortunes of her son, killing those who stood in her way — including her uncle and third husband, the emperor Claudius. Agrippina's brother was the mad emperor Caligula. Nero became emperor in 54, and for the first five years his reign was exemplary. He stopped contests in the circus that involved bloodshed, banned capital punishment, reduced taxes, increased the independence of the Roman Senate and gave permission for slaves to bring complaints against their masters. He promoted competitions in poetry, theatre and athletics. In everything, he seemed to be pursuing the goal his teacher Seneca thought impossible — to remain innocent of all crime. The emergence of brutality and derangement in Nero occurred in 59, when he had his mother put to death. Her insanity and fury at him led him to this act. Three years later he had his wife Octavia killed. He also developed extraordinary pretensions as a poet, musician and actor, and became preoccupied with the mystery religions of Greece and the Middle East. In 66 he left Rome for 15 months of travel in Greece to further his religious quest. Nero's religious obsessions and his artistic pretensions alienated many, including senators and the military. Yet he took little vengeance on his opponents. He was not in Rome when the city burned in 64 nor did he inaugurate a persecution of Christians because of the fire. The army became dissatisfied with his lack of attention to government, and he was soon deserted by all. He is believed to have killed himself in Rome in 68. For years afterward he was honoured by the people, but later emperors destroyed his works and despised his memory.", kelimeler:{'tyrant':'tiran/zorba','instigated':'kışkırtmak/başlatmak','unsavoury':'kötü/nahoş','undeserved':'hak edilmemiş','exemplary':'örnek niteliğinde','derangement':'akıl bozukluğu','pretensions':'hak iddiası/gösteriş','alienated':'yabancılaştırmak','vengeance':'intikam','relentless':'amansız/durmaksızın'},questions:[
          {type:'Detail Question',icon:'🔍',question:"31- According to the passage, Nero became cruel and mad upon .........",options:['A) initiating the persecution of the Christians','B) leaving Rome','C) seeing bloody contests at the circus','D) executing his mother','E) entering a poetry competition'],answer:'D',explanation:"'The emergence of brutality and derangement in Nero occurred in 59, when he had his mother put to death.' → annesini öldürtmesiyle birlikte zalimleşti."},
          {type:'Main Idea Question',icon:'🎯',question:"32- What the author thinks about Nero's reputation is that .........",options:['A) he certainly started up the bloody contests at the circus','B) he was a relentless schemer','C) he was almost certainly a bloody dictator','D) he went down in history as an exemplary ruler','E) he didn\'t totally deserve it'],answer:'E',explanation:"'Nero's unsavoury reputation is almost wholly undeserved.' → kötü ününü tam olarak hak etmedi."},
          {type:'Detail Question',icon:'🔍',question:"33- According to the passage, the emperor Nero was ................",options:['A) definitely playing music in Rome when it burned down','B) the last ruler of Rome to have Julius Caesar as a direct ancestor','C) totally insane for almost all of his reign','D) very similar to his mother, Agrippina, and always killing his enemies','E) respected by the emperors who came after him'],answer:'B',explanation:"'the last Roman emperor descended from Julius Caesar' → Julius Caesar'dan gelen son Roma imparatoru."}
        ]
      },
      { baslik:'12. Paul Sereno', metin:"One fossil discovery after another gave University of Chicago professor Paul Sereno a reputation for having extraordinary luck. Sereno's 'luck' was due in part to his willingness to go wherever the bones might be, however difficult and remote the site. His discoveries helped him piece together the family tree of dinosaurs. Sereno's discoveries began during graduate school. In 1984, as the first American graduate student of paleontology to study in China, he identified two new dinosaur species among the bones in Chinese fossil archives. When Chinese authorities rejected his application to dig in the Gobi desert of Mongolia, he took his request to a local official in Mongolia. Sereno explained in French that he wanted to hunt for the bones of big animals. The confused official admitted him under provisions for big-game hunters but offered little hope of finding much game in the desert. Sereno used his findings in China and Mongolia to make a family tree of the ornithischian, or bird-hipped, dinosaurs, one of the two main orders of dinosaurs. He based his work on careful comparison of details of various skeletons. The discovery that made Sereno famous came in 1988, the year after he completed his doctorate and joined the faculty at the University of Chicago. In a dry, dusty Argentina valley among sediments 225 million years old, he found the skull and a nearly complete skeleton of a Herrerasaurus, which, at the time, was the oldest dinosaur ever discovered. Less than a mile away three years later, Sereno found the complete skeleton of a 228-million-year-old dinosaur, which he named Eoraptor. Only six feet long, with sharp teeth and long claws, this earliest known dinosaur looked like a miniature version of Tyrannosaurus rex. It confirmed that dinosaurs began as small, meat-eating animals that walked and ran on their hind legs. Sereno was the first person to conduct extensive searches for dinosaur fossils in Africa. Governmental red tape and conditions in the Sahara desert made his expeditions to Niger in 1993 and Morocco in 1995 two of his most gruelling, but also most rewarding.", kelimeler:{'fossil':'fosil','paleontology':'paleontoloji/fosil bilimi','sediments':'tortul/çökel tabakası','ornithischian':'kuş kalçalı (dinozor türü)','provisions':'koşullar/hükümler','gruelling':'yıpratıcı/yorucu','remote':'ıssız/uzak','archives':'arşivler','doctorate':'doktora','expedition':'keşif gezisi'},
        questions:[
          {type:'Inference Question',icon:'💭',question:"34- According to the author, Sereno's 'luck' was actually a result of his ................",options:['A) ability to speak fluent French','B) bribing a Chinese government official','C) position on the staff at the university','D) working in isolated and inhospitable places','E) knowledge of hunting large wild animals'],answer:'D',explanation:"'his willingness to go wherever the bones might be, however difficult and remote the site' → ıssız ve ulaşılması güç yerlere gitmeye istekli olması."},
          {type:'Inference Question',icon:'💭',question:"35- We understand from the passage that the Mongolian official .........",options:['A) thought that Sereno would hunt large animals in the desert','B) helped Sereno to get to the desert and dig for bones','C) knew everything important about the Gobi desert','D) actually knew that Sereno was a famous paleontologist','E) was impressed by Sereno\'s scientific discoveries'],answer:'A',explanation:"'The confused official admitted him under provisions for big-game hunters' → yetkili, Sereno'nun büyük hayvan avlayacağını sandı."},
          {type:'Detail Question',icon:'🔍',question:"36- According to the information in the passage, the earliest known dinosaur Sereno found .........",options:['A) was a huge type of bird','B) was similar to a Tyrannosaurus rex but much smaller','C) was hunted by early big-game hunters','D) lived exactly 225 million years ago','E) lived in the area where Niger and Morocco are located today'],answer:'B',explanation:"'this earliest known dinosaur looked like a miniature version of Tyrannosaurus rex' → T-rex'in minyatür versiyonu gibi görünüyordu. D yanlış: 228 milyon yıl önce yaşadı."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test1',
    baslik: 'Test 1',
    aciklama: '4 pasaj · 21 soru · YDT Reading',
    pasajlar: [
      {
        baslik: '1. Tatil Alınmasının Nedenleri',
        metin: "There are many misleading reasons given as to why people take holidays. But the reason has nothing to do with a deep sociological analysis of tile developing, and at the same time, decaying systems that control and direct people's work and leisure. Nor is it in any way related to the planners' fondness for cataloguing different styles of \"leisure-seeking\" or their desperate attempts to measure and satisfy potential demand. The reason is much easier than this and is hidden in the Individual's psyche. The human brain is programmed to reject monotony.",
        kelimeler: {
          'misleading': 'yanıltıcı',
          'monotony': 'tekdüzelik',
          'psyche': 'ruh, bilinç',
          'leisure': 'boş zaman',
          'cataloguing': 'katalog haline getirme',
          'sociological': 'sosyolojik',
          'desperate': 'çaresiz, umutsuz',
          'programmed': 'programlanmış'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "1. According to the writer, people take holidays because .........",
            options: ['A) they are tempted by holiday planners', 'B) they wish to learn about other places', 'C) they need a change', 'D) their work and leisure are controlled', 'E) company\'s controlling systems are decaying'],
            answer: 'C',
            explanation: "Yazara göre, insanlar tatil alırlar çünkü değişime ihtiyaç duyarlar. Metinde \"The human brain is programmed to reject monotony\" (İnsan beynine tekdüzeliği reddetmek programlanmıştır) cümlesi bunu açıkça göstermektedir. Diğer seçenekler ya metinde geçmez ya da yanlış bilgidir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "2. The writer implies that planners .........",
            options: ['A) are attempting, in vain, to increase the number of their customers', 'B) are not successful in responding to the demand for holidays', 'C) couldn\'t satisfy demand even if they could measure it', 'D) are unable to produce an adequate number of catalogues', 'E) don\'t compile enough information for their catalogues'],
            answer: 'C',
            explanation: "Yazar, plannerların \"desperate attempts to measure and satisfy potential demand\" (potansiyel talebi ölçmek ve karşılamak için çaresiz çabalar) yaptığını belirtir. Bu, talep ölçülebilse bile karşılanamayacağının ima edildiğini gösterir. Seçenek C bu çıkarımı en iyi şekilde ifade eder."
          },
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "3. The writer states that .........",
            options: ['A) people go on holidays without thinking much of the reasons', 'B) there is deep sociological analysis as to why people take holidays', 'C) if systems weren\'t decaying, people would go on holiday more often', 'D) there are different opinions about why people take holidays', 'E) going on holiday is easier than many people think'],
            answer: 'D',
            explanation: "Metinin başında \"There are many misleading reasons given as to why people take holidays\" (insanların neden tatil aldığına dair birçok yanıltıcı neden verilmiştir) deniliyor. Bu, farklı görüşlerin/nedenlerin bulunduğunu göstermektedir. Seçenek D bunu en doğru şekilde ifade eder."
          }
        ]
      },
      {
        baslik: '2. Mars\'ın Koyu Mavi-Yeşil İşaretleri',
        metin: "A careful study of Mars through a telescope reveals a number of irregularly shaped dark blue-green markings. They are more or less permanent — maps of Mars have been made, and the features named — but they are not exactly constant in shape or appearance. In particular, they show a variation of colour with the changing seasons on Mars, in time with the melting of the polar caps. There have been many hypotheses put forward to explain these markings, an example of which is that they are composed of minerals that change colour as the moisture from the polar caps reaches them. But in my view the most reasonable explanation is that they are vegetation that flourishes during the brief Martian summer.",
        kelimeler: {
          'reveals': 'ortaya çıkarır, gösterir',
          'irregularly': 'düzensiz',
          'permanent': 'kalıcı',
          'constant': 'sabit, değişmez',
          'variation': 'değişkenlik',
          'hypotheses': 'hipotezler',
          'minerals': 'madenler',
          'vegetation': 'bitki örtüsü',
          'flourishes': 'çiçek açar, gelişir'
        },
        questions: [
          {
            type: 'Inference Question',
            icon: '💭',
            question: "4. From the writer's statement, we can infer that .........",
            options: ['A) the polar caps on Mars are blue-green', 'B) summers on Mars last for a short time', 'C) the maps of Mars are constantly changed', 'D) Mars has a very moist atmosphere', 'E) Mars is rich in minerals'],
            answer: 'B',
            explanation: "Yazar, işaretlerin \"during the brief Martian summer\" (Mars\'ın kısa yazında) geliştiğini söyler. \"Brief\" kelimesi açıkça yazların kısa olduğunu göstermektedir. Seçenek B bu çıkarımı doğru şekilde ifade eder."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "5. Mars, according to the passage, is .........",
            options: ['A) subject to seasonal changes', 'B) only visible through a telescope', 'C) flooded when the polar caps melt', 'D) not always constant in shape', 'E) composed of minerals of changeable colours'],
            answer: 'A',
            explanation: "Metinde \"they show a variation of colour with the changing seasons on Mars\" (Mars\'ta mevsim değişiklikleri ile birlikte renk değişim gösterirler) cümlesi açıkça Mars\'ın mevsimsel değişikliklere tabi olduğunu göstermektedir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "6. The writer states that the blue-green markings visible on Mars .........",
            options: ['A) are most likely to be minerals', 'B) are part of the polar caps', 'C) almost always exist', 'D) are not on maps because they change', 'E) disappear in certain seasons'],
            answer: 'C',
            explanation: "Metinde \"They are more or less permanent\" (Bunlar az çok kalıcıdır) ve \"maps of Mars have been made, and the features named\" (Mars haritaları yapılmış ve özellikler adlandırılmıştır) denilerek işaretlerin neredeyse her zaman var olduğu belirtilmiştir. Seçenek C bunu en iyi ifade eder."
          }
        ]
      },
      {
        baslik: '3. Kadın Alışvericilerin Alışkanlıkları',
        metin: "During the summer I had the unforgettable experience of working temporarily as a shop assistant in the dress department of a large store. The first ladies to arrive in the mornings were those who spent the whole day shopping. However much they liked a dress, they never liked the idea of buying one at the first shop they had come into and would ask me if it could be put aside for them, and they would be extremely irritated, when, after going round endless other shops, they reappeared at ours, should I have sold the dress to another customer in the meantime.",
        kelimeler: {
          'unforgettable': 'unutulmaz',
          'temporarily': 'geçici olarak',
          'endless': 'sonsuz, sayısız',
          'irritated': 'kızdırılmış, sinirlenmiş',
          'reappeared': 'yeniden ortaya çıktı',
          'spent': 'harcadı, geçirdi',
          'aside': 'kenara, yana'
        },
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "7. It is clear that the writer .........",
            options: ['A) was not happy when working as a shop assistant', 'B) deliberately tried to irritate certain types of customer', 'C) despised women who couldn\'t make a decision about what to buy', 'D) will never get another job in a dress shop', 'E) didn\'t always save dresses for those customers who requested this'],
            answer: 'E',
            explanation: "Metnin son kısmında \"should I have sold the dress to another customer in the meantime\" ifadesi, yazarın bazen müşteri tarafından istenen elbiseyi diğer müşterilere sattığını göstermektedir. Seçenek E bunu doğru şekilde ifade eder."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "8. The writer worked at that shop .........",
            options: ['A) during the university vacation', 'B) only for a short time', 'C) in order to get experience', 'D) because of the fashion industry connection', 'E) in other sections as well as the dress department'],
            answer: 'B',
            explanation: "Metinde \"working temporarily as a shop assistant\" (geçici olarak bir satış danışmanı olarak çalışmak) belirtilmiştir. \"Temporarily\" kelimesi kısa süreli çalışmayı göstermektedir. Seçenek B bunu doğru ifade eder."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "9. We can infer that those ladies mentioned in the passage .........",
            options: ['A) had nothing better to do with their lives than go shopping all day', 'B) wanted to look in other shops in case there were better dresses there', 'C) had a lot of money to spend on buying new clothes', 'D) usually bought several dresses throughout the day', 'E) didn\'t like the idea of another woman wearing similar dresses to them'],
            answer: 'B',
            explanation: "Metinde \"they never liked the idea of buying one at the first shop\" ve \"after going round endless other shops\" ifadeleri, bu kadınların daha iyi elbiseler olup olmadığını görmek için diğer mağazaları gezmeyi tercih ettiğini göstermektedir. Seçenek B bu çıkarımı en iyi şekilde ifade eder."
          }
        ]
      },
      {
        baslik: '4. Amatör ve Profesyonel Ustalar',
        metin: "The old saying, whenever the result is a mess, that a poor workman always blames his tools is not necessarily a true one. A good workman can also make a mess of things if he uses poor tools, and this is particularly so where the home handyman is concerned. However, a craftsman can usually rely on his skill to overcome difficulties resulting from inadequate equipment. The struggling amateur, taking home maintenance seriously, needs all the help he can get. He should, therefore, have the best tools he can afford.",
        kelimeler: {
          'blames': 'suçlar',
          'craftsman': 'usta, zanaat ustası',
          'overcome': 'aşmak, üstesinden gelmek',
          'inadequate': 'yetersiz',
          'struggling': 'güçlük çeken, mücadele eden',
          'maintenance': 'bakım, onarım',
          'rely': 'güvenmek, dayanmak',
          'afford': 'göz yummak, karşılamak'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "10. It is stated in the passage that the home handyman .........",
            options: ['A) is more likely to face problems when using poor tools', 'B) in particular will make a mess of things', 'C) is usually a struggling amateur', 'D) is quite often also a good workman', 'E) unlike the craftsman, doesn\'t have any skill to rely on'],
            answer: 'A',
            explanation: "Metinde \"A good workman can also make a mess of things if he uses poor tools, and this is particularly so where the home handyman is concerned\" cümlesi, ev ustasının yetersiz araçlar kullanırken sorunlarla karşılaşma olasılığının daha yüksek olduğunu göstermektedir. Seçenek A bunu doğru ifade eder."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "11. According to the writer, inadequate equipment .........",
            options: ['A) is of little significance for an amateur', 'B) generally won\'t impede a craftsman', 'C) always results in a mess', 'D) poses a greater problem for professionals', 'E) will help to improve your skill'],
            answer: 'B',
            explanation: "Metinde \"a craftsman can usually rely on his skill to overcome difficulties resulting from inadequate equipment\" (bir usta yetersiz ekipmanlardan kaynaklanan zorlukları aşmak için genellikle becerisine güvenebilir) deniliyor. Bu, profesyonellerim için yetersiz ekipmanın büyük sorun olmadığını göstermektedir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "12. The writer states that amateurs .........",
            options: ['A) struggle to take home maintenance seriously', 'B) should only buy expensive tools', 'C) never have any skill at all', 'D) need someone to assist them with home maintenance', 'E) require all available assistance when facing problems'],
            answer: 'E',
            explanation: "Metinde \"The struggling amateur, taking home maintenance seriously, needs all the help he can get\" (ev bakımını ciddiye alan mücadele eden amatör, alabileceği tüm yardıma ihtiyaç duyar) cümlesi, amatörlerin sorunlarla karşılaştığında tüm yardıma ihtiyaç duyduğunu göstermektedir. Seçenek E bunu doğru ifade eder."
          }
        ]
      },
      {
        baslik: '5. Kriket Sporunun Tarihi',
        metin: "Among the common people, cricket was one of the rural recreations popular from the Middle Ages onwards. But, by the 17th century, cricket matches were being played under the sponsorship of aristocrats, who, in an effort to strengthen their sides, created professional players and employed people from the commoners. However, as industrialization changed the face of Britain, geographically, socially and politically, no provision was made for recreational facilities for working people. Cricket, therefore, developed as a sport for the common people to watch, rather than play. Since the late 19th century the county teams have employed professional players from all social and class backgrounds. Nowadays, cricket is still known as a gentleman's sport, but is open to all — even women — and is played worldwide.",
        kelimeler:{'aristocrats':'aristokratlar','sponsorship':'himaye','industrialization':'sanayileşme','provision':'önlem/düzenleme','recreational':'eğlence amaçlı','commoners':'halk/avam','county':'ilçe/bölge','background':'köken'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"13- According to the passage, cricket in the 17th century .......",options:['A) was played only by common people','B) was supported financially by noble patrons','C) had no professional players','D) was banned in rural areas','E) was introduced from abroad'],answer:'B',explanation:"'cricket matches were being played under the sponsorship of aristocrats' → aristokratların himayesinde oynanıyordu. B doğru."},
          {type:'Inference Question',icon:'💭',question:"14- The passage suggests that after industrialization, working people .......",options:['A) gained more leisure time for cricket','B) lost access to recreational spaces','C) became professional cricketers','D) moved to rural areas to play','E) joined aristocratic cricket clubs'],answer:'B',explanation:"'no provision was made for recreational facilities for working people' → çalışan sınıf için eğlence alanı yapılmadı. B doğru."},
          {type:'Main Idea Question',icon:'🎯',question:"15- The main point of the passage is that cricket .......",options:['A) was always a sport for the upper classes','B) originated in the Middle Ages','C) evolved from an aristocratic pastime to a widely accessible sport','D) is no longer popular in Britain','E) was introduced to women only recently'],answer:'C',explanation:"Pasaj kriketin aristokrat himayesinden halka açık bir spora dönüşümünü anlatıyor. C ana fikri en iyi özetler."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test4',
    baslik: 'Test4',
    aciklama: '5 pasaj · 12 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. JAMES HARGREAVES', metin:"The obscurity of James Hargreaves's life contrasts sharply with the worldwide influence of his invention, a yarn-spinning machine called the spinning jenny. Almost nothing is known of his life. He was probably born in Blackburn in Lancashire. England. While still a boy, he became a carpenter and spinner in Standhill, a village nearby. At that time Lancashire was the centre of England's manufacture of cotton goods. The industry was still confined to workers homes, however, and the cards, spinning wheels and looms were operated by hand. It is said that an accident gave Hargreaves the idea for his spinning jenny. In his crowded cottage, which served him both as home and workshop, he was experimenting with spinning two threads at one time. His experiments were unsuccessful, however, because the horizontal spindles allowed the threads to fly apart and become tangled. After his daughter Jenny overturned the experimental machine and its wheel continued to revolve with the spindles in a vertical position, it occurred to Hargreaves that a machine with spindles in this position might be successful. He proceeded to build a spinning machine, probably in 1764, that would spin eight threads at the same time. He called his new invention a spinning jenny.",
        kelimeler:{'obscurity':'belirsizlik, karanlıkta kalma','contrasts':'karşılaştırıldığında, çelişir','invention':'buluş, icat','confined':'sınırlı, hapsedilmiş','spindles':'iğ, ünlü','tangled':'karışmış, dolaşmış','revolve':'döner, dönüş yapar','proceeded':'ilerledi, devam etti','jenny':'makine (IP adı)'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"1-According to the passage, James Hargreaves ------ .",options:['A) birthplace was certainly Lancashire, England','B) family included notable people in Standhill','C) life has been the subject of history books','D) early life remains largely unknown','E) invention had little impact on industrialisation'],answer:'D',explanation:"Pasajın başında \"The obscurity of James Hargreaves's life contrasts sharply with the worldwide influence of his invention\" ve \"Almost nothing is known of his life\" cümleleri onun hayatının büyük ölçüde bilinmediğini gösterir. D seçeneği bunu doğru ifade eder."},
          {type:'Inference Question',icon:'💭',question:"2-It is clear from the passage that, reportedly, the inspiration for Hargreaves' invention ------ .",options:['A) resulted from an accidental occurrence','B) occurred when he was merely a boy','C) came to him after a suggestion from his daughter Jenny','D) came when he saw a spinning jenny in operation','E) was realised when he was experimenting with spinning eight threads at once'],answer:'A',explanation:"Pasajda \"It is said that an accident gave Hargreaves the idea for his spinning jenny\" yazılıdır. Kızı Jenny'nin makineyi devirmesi ve spindles'ın dikey pozisyonda dönmeye devam etmesi bunun bir kaza sonucu olduğunu gösterir. A seçeneği doğrudur."},
          {type:'Main Idea Question',icon:'🎯',question:"3-We learn from the details in the passage that cotton spinning in England when Hargreaves was a boy ------ .",options:['A) was done on eight-threaded spinning machines','B) was highly industrialised','C) was carried out in peoples houses','D) was relatively uncommon in Lancashire','E) was only experimental'],answer:'C',explanation:"Pasajda \"The industry was still confined to workers homes, however, and the cards, spinning wheels and looms were operated by hand\" denilmektedir. Bu, pamuk dönerliğinin evlerde yapıldığını açıkça gösterir. C seçeneği doğru cevaptır."}
        ]
      },
      { baslik:'2. POLGAR SISTERS', metin:"Chess had always been the domain of males. However, male domination of this game experienced a shock when three Hungarian sisters moved into the front line of world-class players. The feats of the Polgar sisters at early ages, in fact, matched or surpassed some of those of the greatest male players. In December 1991, at the age of 15, the youngest sister, Judit, achieved the rank of grandmaster against male competition, replacing Bobby Fischer as the youngest person in chess history to have won this honour. Although Susan was the eldest, she ranked as the number two woman player in the world behind Judit, who was acclaimed number one. The other sister, Sofia, lagged a bit behind: she was \"only\" the world's sixth-ranked woman player, though, according to their father, Laszlo, Sofia was the most talented of the three. The chess-playing Polgar sisters, according to their father, achieved their uncommon abilities as the result of a carefully planned educational program. A psychologist, Polgar held a theory that \"geniuses\" are made, not born, and that early training and specialisation were the key. He set out to prove his theory and determined that his children would focus on chess when Susan at the age of 4 expressed interest in the game. From that time Susan -and the others, when they came along — were immersed in a chess environment. Each of the girls began learning the game at 4, and eventually their daily training included five or more hours a day of playing time. Physical training was also included in the schedule for diversion and in order to build endurance for gruelling matches. The sisters never attended school, having been tutored entirely at home by their parents. Through their mother, Klara, who taught several languages, and their international travels, the three learned English, Russian, Spanish, German and even some Esperanto.",
        kelimeler:{'domination':'egemenlik, baskınlık','feats':'başarılar, kahramanlıklar','surpassed':'geçti, aştı','grandmaster':'büyük usta','honor':'şeref, onur','psychologist':'psikolog','specialisation':'uzmanlaşma','immersed':'dalmış, batırılmış','endurance':'dayanıklılık, tahammül','gruelling':'yorucu, bitkin düşürücü'},
        questions:[
          {type:'Main Idea Question',icon:'🎯',question:"4-According to Laszlo Polgar ------ .",options:['A) a great talent for something appears in only one area per person','B) it is easy to create geniuses in chess','C) children should be first trained in sports in order for them to be geniuses','D) all three of his daughters were born to be geniuses','E) one can become a genius if trained specially starting from a young age'],answer:'E',explanation:"Pasajda Laszlo Polgar'ın \"geniuses are made, not born, and that early training and specialisation were the key\" teorisine sahip olduğu belirtilmektedir. Bu, erken eğitim ve uzmanlaşma ile dehanın yaratılabileceğini gösterir. E seçeneği bu düşünceyi en iyi şekilde ifade eder."},
          {type:'Detail Question',icon:'🔍',question:"5- The passage tells us that Sofia Polgar ------ .",options:['A) was considered by her father to have the most talent','B) was the youngest person in chess history to have won the rank of grandmaster','C) was the second ranked woman chess player in the world','D) began learning the game at a later age than her two sisters','E) did not study chess for as many hours as her sisters'],answer:'A',explanation:"Pasajda açıkça \"according to their father, Laszlo, Sofia was the most talented of the three\" denilmektedir. Babasına göre Sofia üçünün en yeteneklisi olarak kabul edilmektedir. A seçeneği doğru cevaptır."},
          {type:'Inference Question',icon:'💭',question:"6- It is clear from the passage that the sisters were also given physical training ------ .",options:['A) so that they would excel at other sports','B) to provide a change from their routine and build stamina','C) to make sure the girls got some fresh air','D) as part of the official school programme','E) regularly for about five hours a day'],answer:'B',explanation:"Pasajda \"Physical training was also included in the schedule for diversion and in order to build endurance for gruelling matches\" denilmektedir. Bu, fiziksel antrenmanın rutinin değişmesi ve dayanıklılık oluşturmak için verildiğini gösterir. B seçeneği doğrudur."}
        ]
      },
      { baslik:'3. TRAINING TO BE A DANCER', metin:"A dancer's training is as strenuous as that of an athlete. In the great academies of the classical dance — the pre-eminent centres in the late 20th century are found in New York City's School of American Ballet and St. Petersburg's Kirov Ballet School — a would-be dancer begins to train at the age of 7 or 8. If the young dancer shows both physical and artistic promise, the next decade will be spent perfecting a program that is progressively more rigorous. Following a strict series of exercises that have been developed and refined over the last three centuries, the young dancer will be trained in a great tradition. The limbs will be strengthened, the torso will be moulded into what ballet masters consider an ideal posture, and the dancer's experience will be enriched through the study of related subjects in humanities and the arts. Should the dancer show exceptional promise, he or she will be accepted into the corps de ballet of a company, where an apprenticeship of a different sort begins. First, to give the young performer experience, the dancer will fill minor roles. While the glamour associated with these roles may be slight, they give the young performer a chance to gain assurance on stage and the opportunity to measure skills against those of other young artists. Should the dancer continue to grow in stature, graduation from the corps de ballet may lead to becoming a soloist or a principal artist. Of the multitude of students who begin the study of dance, only a few of the most gifted will win the fame and fortune to which many aspire.",
        kelimeler:{'strenuous':'çok yorucu, ağır','pre-eminent':'önde gelen, ün sahibi','promise':'potansiyel, söz','rigorous':'katı, sıkı','moulded':'şekillendirilmiş, yoğrulmuş','posture':'duruş, pozisyon','exceptional':'olağanüstü, istisna','apprenticeship':'çıraklık, staj','assurance':'güven, kendine güven','multitude':'çokça, sürü'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7-According to the passage, trainee ballet dancers ------ .",options:['A) are very likely to become rich and famous','B) benefit from learning connected creative subjects','C) do not train as rigorously as an athlete','D) follow an exercise programme that hasn\'t changed for three hundred years','E) usually begin to perform on stage at the age of seven or eight'],answer:'B',explanation:"Pasajda \"the dancer's experience will be enriched through the study of related subjects in humanities and the arts\" denilmektedir. Bu, bale dansçılarının eğitim alanları ile ilgili yaratıcı konuları öğrenmenin faydalı olduğunu gösterir. B seçeneği doğrudur."},
          {type:'Inference Question',icon:'💭',question:"8-It is clear from the passage that trainee ballet dancers ------ .",options:['A) all train at either New York City\'s School of American Ballet or St. Petersburg\'s Kirov Ballet School','B) must be even stronger than athletes','C) undergo an exercise regime which gets gradually more strenuous','D) must be tall and muscular','E) all start in the corps de ballet'],answer:'C',explanation:"Pasajda \"the next decade will be spent perfecting a program that is progressively more rigorous\" ve \"Following a strict series of exercises\" denilmektedir. Bu, antrenmanın kademeli olarak daha katı hale geldiğini gösterir. C seçeneği doğru cevaptır."},
          {type:'Main Idea Question',icon:'🎯',question:"9-The author informs us that trainee ballet dancers are given a series of minor roles ------ .",options:['A) whether they are talented or not','B) which are very glamorous','C) which will make them quite wealthy','D) for skills assessment and confidence building','E) which aren\'t very strenuous'],answer:'D',explanation:"Pasajda \"they give the young performer a chance to gain assurance on stage and the opportunity to measure skills against those of other young artists\" denilmektedir. Minor roller, dansçıların sahne üzerinde güven kazanması ve yeteneklerini ölçmesi için verilmektedir. D seçeneği doğru cevaptır."}
        ]
      },
      { baslik:'4. THE PERIOD OF SHOGUNATE', metin:"In April 1986 in Nikko, Japan, the Edo Mura Village was opened to the public. The village commemorates the period in Japan's history from 1603 to 1867, called the Tokugawa shogunate, when warlords called shoguns ruled the country. The warriors of the shoguns were called samurai. By the 12th century, the ability of the emperor and his court to govern effectively had diminished. It was then that the samurai emerged as a distinct social class. They were held together by personal loyalty to powerful chiefs — the shoguns - who brought more territory under their control. Local wars among the chieftains continued for generations until finally, under the Tokugawa shogunate, the whole nation was united under one warlord. From the end of the 12th century until the Meiji Restoration, or resumption of the emperor's authority, in 1868, government was exclusively in the hands of the samurai class. The behaviour of the samurai was strictly regulated by a code of conduct called Bushido, which is translated as \"way of the warrior.\" The idea of the code developed in about the 13th century, and it encompassed the ideals of loyalty and sacrifice. By the 19th century, it had become the basis of ethical training for the whole of Japanese society, and it contributed significantly to the tough Japanese nationalism and morale exhibited during World War II.",
        kelimeler:{'commemorates':'anısına yapar, hatırlatır','warlords':'savaş beyleri, militarist liderler','diminished':'azaldı, düştü','emerged':'ortaya çıktı, belirdi','loyalty':'sadakat, bağlılık','restoration':'restore, yeniden kurma','exclusively':'yalnız, sadece','regulated':'düzenlenmiş, kontrol edilmiş','encompassed':'içermiş, kapsarsa','ethics':'ahlak, etik'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"10-We learn from the passage that the samurai came into existence as a separate class ------ .",options:['A) on April 1986 in Nikko','B) following the Meiji Restoration','C) after the end of the shogunate in 1867','D) when the village of Edo Mura was opened to the public','E) after the emperor became unable to rule properly'],answer:'E',explanation:"Pasajda \"By the 12th century, the ability of the emperor and his court to govern effectively had diminished. It was then that the samurai emerged as a distinct social class\" denilmektedir. Samurai sınıfı, imparatorun etkin bir şekilde yönetemediğinde ortaya çıkmıştır. E seçeneği doğru cevaptır."},
          {type:'Inference Question',icon:'💭',question:"11-It is clear from the passage that the Tokugawa shogunate ------ .",options:['A) had always been loyal to the Japanese Emperors','B) was the most merciless of all in Japan','C) had lost control of the country by the 12th century','D) ruled over the whole of Japan for a while','E) display their customs to the general public today'],answer:'D',explanation:"Pasajda \"under the Tokugawa shogunate, the whole nation was united under one warlord\" denilmektedir. Tokugawa shogunate tüm ülkeyi birleştirdi. D doğru."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test5',
    baslik: 'Test5',
    aciklama: '4 pasaj · 12 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. GEORGE WASHINGTON CARVER', metin:"In the American Civil War, raiders swept through south-western Missouri. They seized a slave mother and her baby on Moses Carver's Diamond Grove farm near Diamond, Mo. Carver reportedly got the baby back in exchange for a $300 racehorse, but the mother was not found. The slaveholder named the motherless child George Washington Carver. Young Carver did not grow strong enough to work in the fields, but he did household chores: In the garden he made plants flourish. He had been freed from slavery for several years before he left the Carvers to get an education. Doing cooking, laundry and odd jobs, he worked his way through high school in Kansas. He then earned his way at Simpson College at Indianola, Iowa, and Iowa State College of Agriculture and Mechanic Arts, now Iowa State University, at Ames. He got his M.S. degree in agriculture in 1896. Carver's achievements with plants brought him to the attention of Booker T. Washington, founder of Tuskegee Institute in Alabama. Carver became head of Tuskegee's agriculture department in 1896. In his 47 years there, the great plant scientist did notable work in scientific agriculture and chemurgical, the industrial use of raw products from plants. He made hundreds of useful products from peanuts and sweet potatoes alone. Carver was in addition a painter and a musician. In 1940 he gave his life savings toward establishing the George Washington Carver Foundation for research in agricultural chemistry. Ten years after his death in Tuskegee on January 5, 1943, Carver's birthplace was dedicated as a national monument.", kelimeler:{'raiders':'saldırganlar','seized':'ele geçirdi','flourish':'gelişti, başarıyla büyüdü','chemurgical':'kimyasal endüstriyel','notable':'dikkat çekici, önemli','accumulated':'biriktirildi','humble':'alçakgönüllü','achievements':'başarılar'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"1- According to the passage, George Washington Carver's mother ------ .",options:['A) gave her baby away to a slaveholder','B) was killed during a raid in the American Civil War','C) disappeared after being captured from the farm','D) did the washing and housework at Moses Carver\'s farm','E) was not strong enough to work on a farm'],answer:'C',explanation:"Pasajda \"They seized a slave mother and her baby... but the mother was not found\" ifadesi vardır. Annesi yakalandıktan sonra bulunmamıştır, yani ortadan kaybolmuştur."},
          {type:'Inference Question',icon:'💭',question:"2- It is clear from the details in the passage that when George Washington Carver became a free man------ .",options:['A) he made several attempts to find his mother','B) he immediately left the farm where he grew up','C) he stayed on with the same family for some time','D) he fought in the American Civil War','E) he bought a race horse for $300 dollars'],answer:'C',explanation:"Metinde \"He had been freed from slavery for several years before he left the Carvers to get an education\" yazılıdır. Bu, Carver'ın özgür olduktan sonra Carver ailesinde biraz daha kaldığını gösterir."},
          {type:'Main Idea Question',icon:'🎯',question:"3- According to the passage, despite his humble beginnings, George Washington Carver------ .",options:['A) became a well respected man of science','B) became a slave owning farmer','C) bought an expensive race horse','D) founded the Tuskegee Institute in Alabama','E) built outstanding national monuments'],answer:'A',explanation:"Pasajın tamamı, Carver'ın kölelişten başlayıp, tarım biliminde başarı ve saygınlık elde ettiğini anlatır. Mühendislik, kimya ve sanat alanlarında başarılı bir bilim insanı oldu."}
        ]
      },
      { baslik:'2. YANKEE', metin:"Best known of all national nicknames perhaps is Yankee. Yet the origin of this famous name for Americans is a mystery. Scholars once thought it came from Yengees, which was supposed to be the way the American Indians pronounced the word English, or its French equivalent, Anglais. Another theory is that a Dutch nickname Yankey is the source, because as early as 1683 it was used by Dutch sailors. Yankey may have been derived from Janke, a diminutive of the Dutch name Jan. In colonial America the colonists of other regions rather scornfully called New Englanders Yankees. The British did not observe the local distinction and used the term for all of the colonists. During the American Civil War Southerners spoke of all Northerners as Yankees. The British called United States soldiers Yanks in both world wars, and eventually, the term has become popular as a nickname for all Americans. The origin of the song \'Yankee Doodle\" is also uncertain. This sprightly, impudent tune was popular in the colonies by 1770. The British used it to make fun of the Americans early in the Revolution, but the victorious Americans adopted it as their own marching song. The best known verse runs: Yankee Doodle went to town Riding on a pony; Stuck a feather in his hat And called it Macaroni. Macaroni was the name given to English dandies.", kelimeler:{'nickname':'takma ad','origin':'köken, menşei','theory':'teori, görüş','diminutive':'küçültme','scornfully':'küçümseyerek','sprightly':'canlı, neşeli','impudent':'arsız, utanmaz','victorious':'zafer kazanmış','dandies':'züppe, tatlı tatlı giyinen erkekler'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"4- According to the passage, the term Yankee------ .",options:['A) has been replaced by the term Yankey','B) is used to refer to all Americans today','C) was first used to describe American Indians','D) was initially applied only to American soldiers','E) is always used disrespectfully'],answer:'B',explanation:"Metinde \"eventually, the term has become popular as a nickname for all Americans\" ifadesi vardır. Yankee terimi sonunda tüm Amerikalılar için kullanılan bir takma ad olmuştur."},
          {type:'Inference Question',icon:'💭',question:"5- From the information in the passage, we understand that the song \"Yankee Doodle\" ------ .",options:['A) was a favourite of American Indians','B) was written by an English dandy','C) would be sung by Dutch sailors as early as 1683','D) used to be sung by American revolutionaries','E) was popular in Britain before it became so in America'],answer:'D',explanation:"Metinde \"The British used it to make fun of the Americans early in the Revolution, but the victorious Americans adopted it as their own marching song\" yazılıdır. Başlangıçta İngilizler tarafından alay amaçlı kullanılan şarkı, Amerikalı devrimciler tarafından benimsenmiştir."},
          {type:'Inference Question',icon:'💭',question:"6- Although the origin of the nickname Yankee is a mystery, the author ------ .",options:['A) is certain it is derived from the French word Anglais','B) thinks a Dutch origin is the most likely','C) is sure of the origin of the song \"Yankee Doodle\"','D) believes it could have derived from a British word for soldier','E) points out two possible sources'],answer:'E',explanation:"Yazar, Yankee'nin kökeninin \"bir gizem\" olduğunu söylerken, iki olası kaynaktan bahseder: Yengees (Amerikan Hint dili) ve Yankey (Hollanda). Bu nedenle \"iki olası kaynak\" gösterir."}
        ]
      },
      { baslik:'3. THE REMAINS OF THE QUEEN ANNE\'S REVENGE', metin:"For more than two and a half centuries, the final resting place of one of history's most notorious sea vessels remained a mystery. In 1718 the Queen Anne's Revenge, which had been the fleet flagship of the infamous pirate Edward Teach, was sunk off the Atlantic coast of the American colonies. Teach, known popularly as Black beard, escaped from the sinking vessel along with his crew. Legend has it that they were able to save the vast treasures they had accumulated during two years of plundering ships and towns along the Eastern seaboard. Although the whereabouts of the rumoured treasure remained unknown, marine archaeologists working off the coast of North Carolina discovered what they believed to be the sunken remains of the Queen Anne's Revenge. The hull of the ship apparently settled near where it was reported to have sunk, in water little more than 6 metres deep and less than 2 miles from the coast. The location of the ship had remained undetermined for more than 270 years mostly because of the clutter of other ships at the bottom of the ocean in that area. Since the time of the ship's sinking, literally hundreds of ships had come to rest in the vicinity of the suspected resting place of the Queen Anne's Revenge. The team of marine archaeologists, however, consulted a rare book from 1719 that chronicled the story of the sinking of Black beard's notorious ship, which ran ashore in 1718 while attempting to enter Beaufort inlet near North Carolina. The book provided an exact description of the location where the ship went down, and the marine archaeologists were able to locate the ship using that information and a sophisticated device designed to detect large amounts of metal. This device made it possible for the archaeologists to detect the ship's numerous cannons. In November 1996, after a decade-long process of research and underwater searching, the team finally located the hull of a ship that seemed consistent with known information concerning the design of the Queen Anne's Revenge.", kelimeler:{'notorious':'kötü ün salmış, meşhur','infamous':'namussuz, kötü nam salmış','accumulated':'biriktirildi','plundering':'yağmalama','whereabouts':'yerinde, bulunduğu yer','hull':'gemi gövdesi','clutter':'karışıklık, pislik','vicinity':'civar, yakında','chronicled':'kronik olarak kaydetti','sophisticated':'gelişmiş, karmaşık'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7- The remains of the ship described in the passage were found------ .",options:['A) in 1719, after the publication of a diary of events of 1718','B) by the famous marine biologist Edward Teach','C) on the shores of Beaufort inlet in North Carolina','D) by marine scientists purely by chance','E) in relatively shallow waters close to the American mainland'],answer:'E',explanation:"Metinde \"in water little more than 6 metres deep and less than 2 miles from the coast\" yazılıdır. Gemi nispeten sığ sularda ve kara yakın yerde bulunmuştur."},
          {type:'Inference Question',icon:'💭',question:"8- From the facts given in the passage, we know that Black beard ------ .",options:['A) was a member of Queen Anne\'s army','B) died with his crew when the Queen Anne\'s Revenge sank off the American coast','C) escaped from the Queen Anne\'s Revenge, but had to leave all his riches on board','D) had stolen large amounts of valuable items from towns on the American coast','E) was the leader of a team of marine archaeologists'],answer:'D',explanation:"Pasajda \"Teach... escaped from the sinking vessel along with his crew\" ve \"they were able to save the vast treasures they had accumulated during two years of plundering ships and towns along the Eastern seaboard\" yazılıdır. Blackbeard, Doğu kıyılarından kasabalardan değerli şeyler çalmıştır."},
          {type:'Detail Question',icon:'🔍',question:"9- According to the passage, a special metal detector was used to ------ .",options:['A) raise the Queen Anne\'s Revenge from the water','B) locate the treasure left by Black beard','C) remove the wreckage of other sunken vessels','D) decipher a rare and ancient book','E) find the location of the ship\'s large guns'],answer:'E',explanation:"Metinde \"a sophisticated device designed to detect large amounts of metal... made it possible for the archaeologists to detect the ship's numerous cannons\" yazılıdır. Metal dedektör, geminin büyük silahlarını (top) bulundurmak için kullanıldı."}
        ]
      },
      { baslik:'4. SUSAN ELOISE HINTON', metin:"Susan Eloise Hinton is an American author, born in Tulsa, Okla., in 1950. As a young writer, Hinton decided to write under her initials in order to deflect attention from her gender. She set out to write about the difficult social system that teenagers create among themselves. Her books struck a chord with adolescents who saw in her characters many elements of this system that existed in their own schools and towns. In 1967, while she was still in high school, Hinton published her first book, The Outsiders. The story of confrontation between rival groups of teenagers was immediately successful with critics and young readers, and it won several awards. There was some controversy about the level of violence in the novel and in her other works, but Hinton was praised for her realistic and explosive dialogue. The financial, as well as literary, success of The Outsiders enabled Hinton to continue her education in college. She graduated from the University of Tulsa in 1970. Her other novels for young adults included That Was Then, This Is Now, published in 1971, Rumble Fish, in 1975, Tex, 1979, and Taming the Star Runner, in 1988. Each of her books featured a cast of characters that suffered from society's ills. Young people alienated from their families and from their peers were seen to veer into criminal paths. Several of her books, including The Outsiders and Rumble Fish, were later adapted as motion pictures.", kelimeler:{'deflect':'saptırmak, yönlendirmek','adolescents':'ergenler','struck a chord':'etkiledi, dokundu','alienated':'uzaklaştırılmış','veer':'sapma, yol değiştirme','realistic':'gerçekçi','explosive':'patlayıcı, etkileyici','featured':'tasvir etmek, öne çıkarmak','adapted':'uyarlandı'},questions:[
          {type:'Inference Question',icon:'💭',question:"10- It is clear from the passage that Susan Eloise Hinton ------ .",options:['A) initially didn\'t want her readership to know she was female','B) wrote purely romantic novels','C) was not successful until later in life','D) had little formal education due to her financial circumstances','E) was a skilled film director as well as a writer'],answer:'A',explanation:"Metinde \"Hinton decided to write under her initials in order to deflect attention from her gender\" yazılıdır. Cinsiyetinden dikkat dağıtmak için baş harfleriyle yazmaya karar verdi, yani başlangıçta okuyucularının kadın olduğunu bilmesini istememiştir."},
          {type:'Main Idea Question',icon:'🎯',question:"11- From the information in the passage, we could describe the fiction of Susan Eloise Hinton as ------ .",options:['A) over sentimental and superficial','B) featuring youth culture and its problems','C) popular with teenagers, but not with critics','D) more popular with males than with females','E) centred around high society and celebrities'],answer:'B',explanation:"Metinde \"She set out to write about the difficult social system that teenagers create among themselves\" ve \"Each of her books featured a cast of characters that suffered from society\'s ills\" yazılıdır. Hinton'ın kurgusu genç kültür ve onun sorunlarını tasvir eder."},
          {type:'Inference Question',icon:'💭',question:"12- The author of the passage emphasises that teenagers ------ .",options:['A) became more violent as a direct result of reading Hinton\'s books','B) found Hinton\'s stories patronising and humiliating','C) preferred Hinton\'s realistic portrayal over idealistic stories','D) related to the characters in Hinton\'s novels','E) were not interested in the violent aspects of her books'],answer:'D',explanation:"Metinde gençlerin Hinton'ın karakterlerinde kendi okullarında ve kasabalarında var olan sistemi gördükleri yazılıdır. D seçeneği doğru cevaptır."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test6',
    baslik: 'Test 6',
    aciklama: '5 pasaj · 15 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. PHOBIA', metin:"The process of conditioning no doubt plays an important role in emotional life and in everyday likes and dislikes. A psychologist has reported the case of a girl who was intensely afraid of spiders. Even the most harmless little red mite would provoke a scream and symptoms of uncontrollable fear. It was found that when she was small she had been bitten by a large spider. The bite itself was not serious, and she might have taken it in a matter-of-fact way, except for her mother's excitement and distress. The girl's normal reflex from the pain of the bite became conditioned by her mother's excitement so that it resulted in extravagant terror at the mere sight of a spider. Often we seek to justify a conditioned response and give it a rational basis, although it originates in some accidental association of events.", kelimeler:{'conditioning':'şartlandırma','phobia':'fobya, korku hastalığı','intensely':'yoğun şekilde','provoke':'uyandırmak, kışkırtmak','distress':'sıkıntı, üzüntü','reflex':'refleks, içgüdüsel tepki','extravagant':'abartılı, aşırı','accidental':'tesadüfi, kazara'},questions:[
          {type:'Main Idea Question',icon:'🎯',question:"1- Metnin temel amacı ------.",options:['A) Korkularımızı anlamayı ve yenmemeyi öğretmek','B) Ebeveynlere çocukluk kazalarıyla nasıl başa çıkacaklarını açıklamak','C) Fobilerimiz ve tepkilerimizin nasıl oluştuğunu göstermek','D) Ebeveynleri çocuklarının şeylerle nasıl tepki verdiklerinden dolayı suçlamak','E) İyi ve mutlu bir çocukluk geçirmenin ne kadar önemli olduğunu öğretmek'],answer:'C',explanation:"Metin, örnek olay aracılığıyla fobilerin nasıl oluştuğunu açıklıyor. Köpek fobisinin başlangıcı bir örnek olayla gösterilmiştir. Fobiler ve şartlı tepkilerin oluşum mekanizmasını göstermenin ana amaçıdır."},
          {type:'Detail Question',icon:'🔍',question:"2- Örümcek tarafından ısırılan kız çocuğunun vakasından bahsedilme amacı ------.",options:['A) Önemsiz bir olaya aşırı tepki vermenin nasıl muazzam bir korku haline dönüşebileceğini göstermek','B) Çocukluk hastalığının düzgün tedavi edilmezse yaşam boyu engele dönüşebileceğini göstermek','C) Bazı insanların örümcek gibi küçük yaratıklardan korkmasının ne kadar saçma olduğunu göstermek','D) Tüm örümcek ısırıklarının zararlı olmadığını, hatta çocuklara bile zararlı olmayabileceğini göstermek','E) Çok küçük çocukları hayvan ısırıklarından korumanın önemli olduğunu göstermek'],answer:'A',explanation:"Metin açıkça gösteriyor ki, ısırık kendisi ciddi değildi. Ancak annenin heyecanı ve sıkıntısı nedeniyle bu normal tepki, aşırı bir korku haline dönüştü. Bu, küçük bir olaya verilen aşırı tepkinin nasıl kalıcı fobiye dönüşebileceğini gösterir."},
          {type:'Inference Question',icon:'💭',question:"3- Yazara göre insanlar genellikle ------.",options:['A) Çocukları kendi tepkilerini ve reaksiyonlarını olaylara karşı taklit ettirirler','B) İrrasyonel korkularını rasyonel terimlerle açıklamaya çalışırlar','C) Korktuğu şeylerden kaçınarak korkularından kurtulurlar','D) Korkularını paylaşan insanlar tarafından kurulan kuruluşlara katılırlar','E) Korktukları hakkında yalan söylerler ve aslında korktuklarını gizlerler'],answer:'B',explanation:"Metinde son cümlede açıkça yazılıdır: 'Often we seek to justify a conditioned response and give it a rational basis, although it originates in some accidental association of events.' (Sık sık şartlandırılmış bir tepkiyi haklı çıkarmaya ve ona rasyonel bir temel vermeye çalışırız.) Bu, insanların irrasyonel korkularını rasyonel açıklamalarla meşrulaştırmaya çalıştığını gösterir."}
        ]
      },
      { baslik:'2. HISTORY UNDER THE WAVES', metin:"A team of marine archaeologists led by Robert Ballard, an internationally renowned scientist who made headlines when he located the remains of the oceanliner Titanic in 1986, announced in 1997 yet another extraordinary discovery made in the depths of the Mediterranean Sea. Using a sophisticated nuclear submarine on loan from the United States Navy, the marine archaeologists located five ships in the depths of the Mediterranean that had sunk over a period of 2,000 years. Three of the wrecks were relatively modern. One, believed to be a relic of the Ottoman Empire, dated back to the 18th or 19th century. Two more ships, believed to be of European origin, also dated back to the 19th century, the archaeologists estimated. Two other ships discovered at the bottom of the sea, however, were believed to have originated in the classical world over two thousand years ago, when the imperial powers of Rome and Carthage dominated the region and its shipping routes. Historians unanimously praised the discovery as one that would redefine modern perceptions of trade in the ancient world.", kelimeler:{'archaeologists':'arkeologlar','oceanliner':'okyanus gemi','extraordinary':'olağanüstü, fevkalade','sophisticated':'sofistike, ileri teknoloji','wreck':'gemi enkazı','Ottoman Empire':'Osmanlı İmparatorluğu','imperial':'imparatorluk, krallık','unanimously':'oy birliğiyle, oybirliği ile'},
        questions:[
          {type:'Inference Question',icon:'💭',question:"4- Pasajdan anlaşıldığına göre deniz arkeolojisi ------.",options:['A) Ticari yollar araştırmasına odaklanır','B) Nükleer güç olmadan imkansızdır','C) Modern tarihine daha fazla odaklanır','D) Geçmişin artıklarını bulmak için su altı bölgeleri araştırır','E) Yalnızca hazine arama ile ilgilenir'],answer:'D',explanation:"Metinde deniz arkeologlarının sualtında eski gemileri bulup inceledikleri açıkça gösterilmektedir. Deniz arkeolojisi, su altında geçmişin kalıntılarını arayan bir bilim dalıdır."},
          {type:'Detail Question',icon:'🔍',question:"5- 1997'de arkeologlar ------.",options:['A) Osmanlı İmparatorluğunun daha önceki düşünülenden daha eski olduğunu belirlediler','B) Bulunmuş ilk klasik gemilerin örneklerini konumlandırdılar','C) Eski Romaların Kartagolular ile ticaret yaptığını kanıtladılar','D) Beş Avrupa ve Afrika gemisinin tam yaşını belirlediler','E) Yaşları iki bin yıl kapsayan bir dizi gemi buldular'],answer:'E',explanation:"Metin açıkça beş geminin 2000 yıllık bir dönem boyunca batmış olduğunu belirtir. Bazıları 18-19. yüzyıl, bazıları ise 2000 yıl öncesine aittir. Yani yaşları iki bin yıl aralığında dağılmıştır."},
          {type:'Inference Question',icon:'💭',question:"6- Robert Ballard'ın keşfi ------.",options:['A) Kendisine ve ekibine büyük servet getirmiştir','B) Çoğu klasik tarihçi tarafından yoğun bir şekilde eleştirilmiştir','C) Klasik ticaret hakkında yeni anlayış sağlayacaktır','D) Kendisine ve ekibine yaklaşık on bir yıl araştırması gerekmiştir','E) Roma ve Kartagoların kendi dönemlerinin hakim güçleri olduğunu kanıtlar'],answer:'C',explanation:"Metin, 'Historians unanimously praised the discovery as one that would redefine modern perceptions of trade in the ancient world' ifadesiyle, bu keşfin antik dönem ticareti hakkında modern algıları yeniden tanımlayacağını açıkça belirtir."}
        ]
      },
      { baslik:'3. ROMANTICISM', metin:"If one term can be used to describe the forces that have shaped the modern world, it is Romanticism. Romanticism had a dynamic impact on art, literature, science, religion, economics, politics and the individual's understanding of self. There is no single commonly accepted definition of Romanticism, but it has some features upon which there is general agreement. First of all, it was a rejection of the Enlightenment and the emphasis upon human reason. The Enlightenment thinkers asserted that the world of nature is rationally ordered and that human reason, therefore, can analyse, understand and use it. On the basis of this understanding, a rational society can be constructed. These were ideas that were almost totally opposed by romantics. Romanticism did not appear suddenly. If a date were to be chosen, however, 1774 would be a useful one. It was the publication year of Johann von Goethe's 'Sorrows of Werther', a novel about a young man who is so disappointed in love that he kills himself. This fictional suicide brought on many real ones as the novel's vogue swept across Europe.", kelimeler:{'Romanticism':'Romantizm','dynamic':'dinamik, etkin','Enlightenment':'Aydınlanma','asserted':'ileri sürdü, iddia etti','rationally':'rasyonel olarak, mantıklı bir şekilde','opposed':'karşı çıkıldı, muhalefet edildi','vogue':'moda, yaygınlık'},questions:[
          {type:'Detail Question',icon:'🔍',question:"7- Romantizmin tanımlanması konusunda metinde açıkça gösterildiğine göre ------.",options:['A) Bu hareket hakkında kimse hiçbir şeyde hemfikir değildir','B) Romantizm Aydınlanma ile paralel olarak gelişmiştir','C) Kimse bunu tam olarak tanımlamaya hiç çalışmamıştır','D) Terimi tanımlamak zordur ve çok fazla anlaşmazlık vardır','E) Aydınlanma ile birçok ortak fikri paylaşıyordu'],answer:'D',explanation:"Metin başında yazılıdır: 'There is no single commonly accepted definition of Romanticism, but it has some features upon which there is general agreement.' Bu, tanım konusunda anlaşmazlık olduğunu ancak bazı özellikler konusunda hemfikir olunduğunu gösterir."},
          {type:'Inference Question',icon:'💭',question:"8- Pasajdan anlaşıldığına göre Romantikler şunu inandı ki ------.",options:['A) İnsan medeniyetleri doğayı anlayamaz ve kontrol edemezler','B) Aydınlanma birçok önemli ve faydalı fikir üretmiştir','C) Düzenli bir toplum herhangi bir bireyden daha önemlidir','D) İnsan aklı doğal dünyayı anlayabilir ve analiz edebilir','E) İnsanlar için düzenli ve rasyonel bir toplum inşa etmek mümkündür'],answer:'A',explanation:"Metin Romantiklerin Aydınlanma fikrinin 'almost totally opposed' (neredeyse tamamen karşı) olduğunu söyler. Aydınlanma, insan aklının doğayı anlayabileceğini söylerken, Romantikler bunu reddettiler."},
          {type:'Detail Question',icon:'🔍',question:"9- 'Werther'in Acıları ------.",options:['A) 1774\'te Romantizm hakkında bir ders kitabı olarak yazılmıştır','B) Görünüşe göre birçok insanı kendini öldürmeye sevk etmiştir','C) Yazılırken az biliniyordu ancak bugün yararlıdır','D) Romantizmi bir gecede yaratan kitap olarak kabul edilir','E) Aşk için kendini öldüren bir adamın gerçek hikayesidir'],answer:'B',explanation:"Metin açıkça yazılıdır: 'This fictional suicide brought on many real ones as the novel's vogue swept across Europe.' (Bu kurgulanmış intihar, roman Avrupa'da yaygınlaştıkça birçok gerçek intihara yol açtı.)"}
        ]
      },
      { baslik:'4. THE RIVER THAMES', metin:"Not for its length but for its location is the Thames one of the best-known rivers in the world. Although it is only 338 kilometres long, it is England's chief waterway. The Thames begins at Seven Springs in the Cotswold Hills. From there it pursues a very winding course through the Chiltern Hills. At Oxford, the famous university town, it is met by its chief western tributary, the River Cherwell. This is the beginning of commercial navigation. From here the river flows through the English countryside, passing such well-known sites as Henley, where the annual regatta is held; the royal residence at Windsor Castle; the college town of Eton; Hampton, famous for its beautiful Hampton Court Palace built during the reign of Henry VIII; and then on to London. By the time the Thames reaches London, it has become an estuary, a section of the North Sea affected by the tides. The river flows for 40 kilometres through Greater London, past the Tate Gallery, Lambeth Palace, the houses of Parliament, the Royal Festival Hall and National Theatre complex, Southwark Cathedral, and the Tower of London.", kelimeler:{'waterway':'su yolu, kanal','tributary':'yan kollar, döl','regatta':'yat yarışı','Windsor Castle':'Windsor Kalesi','Hampton Court Palace':'Hampton Sarayı','estuary':'delta, ırmak ağzı','tides':'gelgit, çoğalma ve azalma'},questions:[
          {type:'Main Idea Question',icon:'🎯',question:"10- Çoğu insan Temez nehri hakkında bilir çünkü ------.",options:['A) Avrupa\'nın en geniş nehirlerinden biridir','B) İngiltere\'nin neredeyse tamamından akar','C) Uçlarından birinden ötekine kadar tekne kullanılabilir','D) Avrupa için çok uzun bir nehir olması','E) Londra gibi önemli şehirlerden geçmesi'],answer:'E',explanation:"Thames nehri Londra'dan geçmesi ve önemli yapıları barındırması nedeniyle dünyaca tanınmaktadır."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test7',
    baslik: 'Test 7',
    aciklama: '5 pasaj · 13 soru · YDT Reading',
    pasajlar: [
      {
        baslik: '1. THE MYSTERIES OF THE UNIVERSE',
        metin: "Cosmology is the scientific inquiry into what the universe is like. By making assumptions that are not contradicted by the behaviour of the observable universe, scientists build models, or theories, that attempt to describe the universe as a whole, including its origin and its future. They use each model until something is found that contradicts it. Then the model must be modified or discarded. Cosmologists usually assume that the universe, except for small irregularities, has an identical appearance to all observers, identical to the laws of physics, irrespective of where in the universe the observers are located. This unproven concept is called the cosmological principle. One consequence of the cosmological principle is that the universe cannot have an edge, for, otherwise, an observer near the edge would have a different view from that of someone near the centre. Thus, space must be infinite and evenly filled with matter, or, alternatively, the geometry of space must be such that all observers see themselves as at the centre. Also, astronomers believe that the only motion that can occur, except for small irregularities, is a uniform expansion or contraction of the universe.",
        kelimeler: {
          'cosmology': 'kozmoloji, evren bilimi',
          'inquiry': 'soruşturma, araştırma',
          'contradicted': 'çelişen, karşı çıkan',
          'cosmological principle': 'kozmolojik ilke',
          'unproven': 'kanıtlanmamış',
          'consequence': 'sonuç, netice',
          'evenly': 'eşit şekilde, düzgün',
          'geometry': 'geometri, şekil bilimi',
          'irregularities': 'düzensizlikler, tutarsızlıklar',
          'contraction': 'daralma, küçülme'
        },
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "1-Cosmological models of the universe ------ .",
            options: ['A) are based on unquestionable facts and are always extremely accurate', 'B) are changed whenever new information shows them to be wrong', 'C) show us exactly what the universe looks like from any perspective', 'D) often contradict each other and cause much debate among scientists', 'E) give us a clear and unchanging picture of the exact nature of the universe'],
            answer: 'B',
            explanation: "Pasajda açıkça belirtildiği gibi, bilim insanları modelleri kullanırlar ta ki çelişen bir şey bulunana kadar, sonra model değiştirilmeli veya atılmalıdır. Bu, B seçeneğini doğru yapar."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "2-One of the bases of cosmological principle is that ------ .",
            options: ['A) people who live near the edge of the universe see things in a very different way', 'B) the universe is essentially an irregular body held together by a few common laws', 'C) the Earth is at the centre of the universe, and thus, the most important thing', 'D) contradictions to models of the universe are in violation of the laws of physics', 'E) regardless of where a person may be, the universe looks much the same'],
            answer: 'E',
            explanation: "Kozmolojik ilke, evrenin gözlemcilerin nerede olduğuna bakılmaksızın tüm gözlemcilere özdeş göründüğünü varsayar. E seçeneği bu ifadeyi doğru yansıtır."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "3-Cosmologists believe that ------ .",
            options: ['A) the infinite nature of the universe can be explained with geometry', 'B) space is either endless or has some special geometric properties', 'C) the universe, as we know it, is continually shrinking', 'D) whatever the nature of the universe, our role in it doesn\'t really matter', 'E) it\'s difficult to define the universe as it\'s constantly getting larger'],
            answer: 'B',
            explanation: "Pasaj, uzayın ya sonsuz olması ya da tüm gözlemcilerin kendilerini merkezde görecekleri şekilde özel geometrik özellikleri olması gerektiğini belirtir. Bu, B seçeneğini tam olarak kapsar."
          }
        ]
      },
      {
        baslik: '2. THE FIRST RENAISSANCE MAN',
        metin: "The term Renaissance man was coined to describe the genius of Leonardo da Vinci. He was a man of so many accomplishments in so many areas of human endeavour that his like has rarely been seen in human history. Casual patrons of the arts know him as the painter of \'La Gioconda\', more commonly called the \'Mona Lisa\', and of the exquisite \'Last Supper\', painted on the wall of the dining hall in a monastery in Milan, Italy. These paintings alone would have assured him enduring fame as an artist, but they should not obscure the fact that he was also a sculptor, an architect and a man of science who did serious investigations into the natural and physical sciences, mathematics, mechanics and engineering. More than 300 years before flying machines were perfected, Leonardo had devised plans for prototypes of an aeroplane and a helicopter. His extensive studies of human anatomy were portrayed in anatomical drawings, which were among the most significant achievements of Renaissance science. His remarkable illustrations of the human body elevated drawing into a means of scientific investigation and exposition, and provided the basic principles for modern scientific illustration.",
        kelimeler: {
          'Renaissance man': 'Rönesans insanı, çok yönlü deha',
          'accomplishments': 'başarılar, başarılı işler',
          'endeavour': 'çaba, girişim',
          'patrons': 'destekçiler, müşteriler',
          'exquisite': 'eşsiz, zarif',
          'obscure': 'gizlemek, karanlık bırakmak',
          'prototypes': 'prototipler, ilk örnekler',
          'anatomy': 'anatomi, vücut yapısı',
          'exposition': 'açıklama, sunum',
          'elevated': 'yükseltmek, kaldırmak'
        },
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "4-Da Vinci\'s achievements in the arts ------ .",
            options: ['A) made it unnecessary for him to work in science', 'B) prevented people from taking his medical ones seriously', 'C) demonstrate only one of his many and varied talents', 'D) helped him finance his revolutionary work in aeronautics', 'E) were of a higher quality than his work in the field of physics'],
            answer: 'C',
            explanation: "Pasajda da Vinci'nin sanat alanındaki başarıları açıklanırken, onun bilim, matematik, mühendislik ve diğer alanlardaki başarıları da vurgulanmaktadır. Sanat sadece onun birçok yeteneğinden birini temsil eder."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "5-In the field of aeronautics, da Vinci ------ .",
            options: ['A) was the first man to construct a working aeroplane or helicopter', 'B) built the first working models of machines used for human flight', 'C) developed a couple of flying machines, but they were far from perfect', 'D) designed flying machines centuries before anyone actually built them', 'E) used his artistic talents to make some of the most beautiful planes ever'],
            answer: 'D',
            explanation: "Pasaj \"More than 300 years before flying machines were perfected, Leonardo had devised plans for prototypes\" diye açıkça belirtir. D seçeneği bu bilgiyi doğru şekilde ifade eder."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "6-Da Vinci\'s work on human anatomy ------ .",
            options: ['A) allowed for great advancement in the field of medicine', 'B) provided illustrations still used by doctors in the 20th century', 'C) were important because they were done during the Renaissance', 'D) came from his desire to paint people with greater accuracy', 'E) increased the importance of drawing in the scientific process'],
            answer: 'E',
            explanation: "Pasajda \"His remarkable illustrations of the human body elevated drawing into a means of scientific investigation and exposition, and provided the basic principles for modern scientific illustration\" diye belirtilmektedir. E seçeneği bu bilgiyi doğru yansıtır."
          }
        ]
      },
      {
        baslik: '3. MONTAIGNE: FATHER OF THE ESSAY',
        metin: "Called the \"father of the familiar essay\", Michel de Montaigne, born in 1533, was one of the world\'s greatest essayists. Although both the Greeks and Romans had written essays, Montaigne resurrected the form, named it, and made it popular. His wisdom, curiosity and straightforwardness has set an example for other famous essayists up to the present day. As a young man, Montaigne held a series of government posts and spent much time at the French royal court. In 1568 his father died, and as the eldest living son, Montaigne inherited the estate, which enabled him to retire to the family chateau and begin to write. He published the first two books of essays in 1580, and a third book in 1588. Montaigne, a sceptic, was not content to take matters at face value. He asked questions and was curious about people and their motives. He tried to find the reasons why men and women acted as they did. His keen interest in the world around him led him to write on a wide variety of subjects. Montaigne\'s essays offer a remarkably complete picture of his life and thoughts, and of the age in which he lived.",
        kelimeler: {
          'essayists': 'deneme yazarları',
          'resurrected': 'diriltmek, yeniden hayata getirmek',
          'straightforwardness': 'dürüstlük, açıklık',
          'inherited': 'miras aldı',
          'chateau': 'şato, büyük konak',
          'sceptic': 'şüpheci, kuşkucu',
          'face value': 'nominal değer, görünen değer',
          'motives': 'güdüler, nedenler',
          'keen': 'keskin, güçlü, şiddetli',
          'variety': 'çeşitlilik, hoşluk'
        },
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "7-Though the Greeks and Romans had written essays, Montaigne ------ .",
            options: ['A) had the difficult job of translating all of them into French', 'B) was the last modern European to practise the art of doing so', 'C) is the person responsible for making them what they are today', 'D) wrote ones that were nearly as popular as the old Greek ones', 'E) merely copied what they had done and called it his own work'],
            answer: 'C',
            explanation: "Pasajda \"Montaigne resurrected the form, named it, and made it popular\" diye belirtilmektedir. Montaigne sadece deneme formu kurtarmakla kalmayıp, onu popüler hale getirmiştir. C seçeneği bu bilgiyi doğru yansıtır."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "8-The passage implies that one reason that Montaigne was able to write so many essays was that ------ .",
            options: ['A) he was rich enough to be able to pay people to write things for him', 'B) he was able to stop working at a young age, so he had a lot of free time', 'C) his employment history provided him with many opportunities to practise', 'D) he came from the royal family, which provided him with excellent education', 'E) his education included an extensive study of both Latin and Greek'],
            answer: 'B',
            explanation: "Pasajda, babasının ölümünden sonra Montaigne'in mirası alarak aile şatosunda emekli olduğu ve yazmaya başladığı belirtilir. B seçeneği bu bilgiyi doğru şekilde çıkarır."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "9-Montaigne\'s essays are of particular value today ------ .",
            options: ['A) and collectors are willing to pay a lot of money for his hand-written books', 'B) as only three of his books are known to have survived to the present', 'C) since they provide accurate information concerning geography in the 1500s', 'D) because they give us a lot of information about life in the 16th century', 'E) even though most of them were written when Montaigne was an old retired man'],
            answer: 'D',
            explanation: "Pasajın sonu \"Montaigne\'s essays offer a remarkably complete picture of his life and thoughts, and of the age in which he lived\" diye vurgulanmaktadır. D seçeneği bu bilgiyi doğru şekilde ifade eder."
          }
        ]
      },
      {
        baslik: '4. WITHOUT A TRACE',
        metin: "When a catastrophe strikes a ship at sea and she goes to the bottom, there is usually some clue to her fate — a bit of debris or perhaps a floating life jacket. Five years after her sinking, a life jacket from the Lusitania was found, for example, floating along a wharf at Philadelphia — thousands of miles from where the ship went down in 1915. But in the case of the British freighter Waratah, and that of the US Navy collier Cyclops, no clues have ever been brought forward. The 16,800-ton Waratah, only a year old, was last sighted off the coast of South Africa in 1909. The ship had been described by some as top-heavy and may have flipped over in heavy seas, with her vanished 211 persons. Equally mystifying is the disappearance of the Cyclops, a 19,000-ton ship with 309 persons aboard, about seven months before the end of World War I. She was last heard from in March 1918 while en route to Baltimore from the West Indies. Since no logical explanation has ever been offered for her disappearance, the US Navy file on the Cyclops has never been closed.",
        kelimeler: {
          'catastrophe': 'felaket, katastrof',
          'debris': 'enkazlar, kalıntılar',
          'clue': 'ipucu, belge',
          'freighter': 'kargo gemisi, yük gemisi',
          'collier': 'kömür taşıyan gemi',
          'vanished': 'kaybolmuş, gözden yitmiş',
          'mystifying': 'gizemli, açıklaması zor',
          'disappearance': 'kaybolma, ortadan kayboluş',
          'en route': 'yolda, gidişte',
          'logical': 'mantıklı, ussal'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "10-We learn from the passage that when a ship sinks ------ .",
            options: ['A) it often creates a small-scale environmental disaster', 'B) there are usually no signs of it until several years later', 'C) the passengers are sometimes not rescued for several years', 'D) there is generally some evidence about what happened to it', 'E) most of its cargo is usually salvageable'],
            answer: 'D',
            explanation: "Pasaj, bir gemi battığında genellikle bazı kanıtlar bulunduğunu söylemektedir. D doğru."
          }
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test8',
    baslik: 'Test8',
    aciklama: '5 pasaj · 15 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. Is It Art?', metin:"Paintings and power shovels, sonatas and submarines, dramas and dynamos — they all have one thing in common. They are fashioned by people. They are artificial, in contrast to everything that is natural — plants, animals, minerals. The average 20th-century person would distinguish paintings, sonatas and dramas as forms of art, while viewing power shovels, submarines and dynamos as products of technology. This distinction, however, is a modern one that dates from an 18th-century point of view. In earlier times, the word 'art' referred to any useful skill. Shoemaking, metalworking, medicine, agriculture, and even warfare were all once classified as arts. They were equated with what are today called the fine arts — painting, sculpture, music, architecture, literature, dance, and related fields. In that broader sense, art was defined as a skill in making or doing, based on true and adequate reasoning.", kelimeler:{'fashioned':'şekillendirilen','artificial':'yapay','distinguish':'ayırt etmek','dynamos':'dinamolar','equated':'eşit sayılan','metalworking':'metal işlemeciliği','warfare':'savaş','adequate':'yeterli'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"1- Dramas and power shovels are similar in that ------.", options:['A) they are both considered to be fine art','B) they are each based on natural things','C) both of them are quite fashionable','D) they are both produced by people','E) neither of them is very common'],answer:'D',explanation:"Pasajın başında \"they all have one thing in common. They are fashioned by people\" ifadesi her iki şeyin de insanlar tarafından üretildiğini göstermektedir. Doğru cevap D'dir."},
          {type:'Inference Question',icon:'💭',question:"2- The author tells us that before the 1700s, people ------.", options:['A) were not able to travel in underwater ships','B) were completely unfamiliar with technology','C) produced such beautiful tools that they were called art','D) placed a much higher value on visual arts','E) had a much wider definition for the term \'art\''],answer:'E',explanation:"Pasaj, 18. yüzyıldan önceki zamanlarda 'art' kelimesinin herhangi bir faydalı beceriyi ifade ettiğini ve ayakkabıcılık, metalişçiliği vb. sanatlar arasında yer aldığını belirtmektedir. Bu, sanat teriminin çok daha geniş bir tanımını gösterir. Doğru cevap E'dir."},
          {type:'Inference Question',icon:'💭',question:"3- It can be inferred from the passage that warfare ------.", options:['A) has become less artistic because of modern military technology','B) isn\'t really so different from skills like shoemaking or literature','C) is no longer considered to be an art, though once it was','D) has inspired people, through its images, to make great art','E) is based, by its nature, on broadly accepted and true reasoning'],answer:'C',explanation:"Pasaj, eski zamanlarda savaşın sanatlar arasında sınıflandırıldığını belirtmektedir, ancak modern dönemde böyle değildir. Bu, savaşın eskiden sanat olarak kabul edildiğini ancak artık olmadığını gösterir. Doğru cevap C'dir."}
        ]
      },
      { baslik:'2. Holes in the Sky', metin:"In 1985 scientists working with the British Antarctic Survey discovered that a hole developed periodically in the ozone layer over the southern continent. Although this may have been a long-term natural event, the scientists believed that the effects were aggravated by the presence of chlorofluorocarbons in the atmosphere. These organic compounds are composed of carbon, fluorine, chlorine, and hydrogen and they can be found in aerosol cans, refrigeration materials and industrial solvents. Since this discovery, there has been a call for an international ban on the production and use of the chemicals in question. The more recent discovery of temporary holes in the ozone layer in other places in the Earth's atmosphere — including places over North America and northern Europe — has contributed to the debate over global warming, a theory that the Earth is gradually growing warmer as the atmosphere becomes more polluted.", kelimeler:{'periodically':'periyodik olarak','aggravated':'kötüleştirilmiş','chlorofluorocarbons':'klorofluorkarbon','compounds':'bileşikler','aerosol':'sprey','refrigeration':'soğutma','solvents':'çözücüler','contributed':'katkıda bulundu'},questions:[
          {type:'Detail Question',icon:'🔍',question:"4- Scientists think that the hole in the ozone layer over the Antarctic ------.", options:['A) has become bigger as a result of the widespread use of certain chemicals','B) can only be explained as an interesting natural event','C) may require the increased use of organic materials','D) will disappear in the long term, as the continent gets warmer','E) suggests that, at one time, people lived in the far south'],answer:'A',explanation:"Pasaj, bilim insanlarının ozon tabakasındaki deliğin atmosferdeki klorofluorokarbonların varlığı tarafından kötüleştirildiğine inandığını belirtmektedir. Bu, belirli kimyasalların yaygın kullanımı sonucu deliğin büyüdüğünü gösterir. Doğru cevap A'dır."},
          {type:'Detail Question',icon:'🔍',question:"5- The theory of global warming ------.", options:['A) favours the use of certain chemicals in order to eliminate the pollutants in the atmosphere','B) says that holes in the ozone are letting in more of the sun\'s heat','C) is seen as complete nonsense by the majority of scientists','D) has led to scientific research to look into populating Antarctica','E) suggests that pollution in the air is making the planet hotter'],answer:'E',explanation:"Pasaj, global ısınma teorisini atmosfer daha fazla kirlenirken Dünya'nın kademeli olarak ısındığı teorisi olarak tanımlamaktadır. Doğru cevap E'dir."},
          {type:'Inference Question',icon:'💭',question:"6- One can conclude from the passage that chlorofluorocarbons ------.", options:['A) are naturally present in the Earth\'s atmosphere over Antarctica','B) are the only reason that there are holes in the Earth\'s ozone layer','C) are responsible for shortages of hydrogen and chlorine today','D) have many practical uses, but seem to be dangerous to the environment','E) have been suggested for use in repairing large holes in the ozone layer'],answer:'D',explanation:"Pasajdan, klorofluorokarbonların aerosol kutuları, soğutma malzemeleri ve endüstriyel çözücülerde bulunduğu görülmektedir, bu da pratik kullanımlarını gösterir. Aynı zamanda ozon tabakasına zarar verdikleri için çevresel olarak tehlikeli oldukları belirtilmektedir. Doğru cevap D'dir."}
        ]
      },
      { baslik:'3. The Rise of OPEC', metin:"The existence of OPEC was little noticed by the rest of the world until 1973, when OPEC ministers raised world oil prices by 70 percent. Price increases were directed at Western countries because of their support for Israel in its conflicts with Arab states. As a result of the Yom Kippur War of October 1973, oil prices were raised another 130 percent, and an oil embargo was instituted against the United States and the Netherlands. It was later learnt that the OPEC countries were boycotting certain American corporations that also had dealings with Israel. The OPEC pricing policies brought enormous increases in wealth to the oil-producing states and initiated a period of general economic decline in the industrialised nations of the West — particularly in the United States. The embargo itself was soon lifted, but the price increase led to a spiral of inflation in the West. Within a little more than a decade, there was a worldwide surplus of oil, and prices began to come down. But the continued instability of the Middle East guaranteed some measure of uncertainty about future oil supplies and prices.", kelimeler:{'embargo':'ambargo','boycotting':'boykot etmek','dealings':'işlemler','pricing':'fiyatlandırma','enormous':'muazzam','initiated':'başlattı','industrialised':'sanayileşmiş','inflation':'enflasyon','surplus':'fazlalık'},
        questions:[
          {type:'Inference Question',icon:'💭',question:"7- We learn from the passage that OPEC raised its oil prices ------.", options:['A) in order to raise money to support its ongoing wars against Israel','B) because ministers from the countries in the organisation wanted to earn more money','C) to show its anger at the countries that favoured Israel against Arab states','D) in response to a worldwide shortage of petroleum and petroleum products','E) after the price of producing oil increased by more than 200% in a single year'],answer:'C',explanation:"Pasaj, fiyat artışlarının İsrail'i destekledikleri için Batı ülkelerine yönelik olduğunu açıkça belirtmektedir. Bu, OPEC'in Arab devletlerini desteklemek amacıyla öfkesini göstermek istediğini gösterir. Doğru cevap C'dir."},
          {type:'Detail Question',icon:'🔍',question:"8- One result of the dramatic increase in oil prices was ------.", options:['A) the creation of the mostly Arab alliance called OPEC','B) a second war with Israel in the October of 1973','C) an overall rise in prices in some Western countries','D) the refusal of certain American corporations to do business with OPEC countries','E) an escalation in the wars between Israel and Arab states'],answer:'C',explanation:"Pasaj, fiyat artışının Batı'da enflasyonun döngüsüne yol açtığını belirtmektedir. Enflasyon genel fiyatların yükselmesi anlamına gelir. Doğru cevap C'dir."},
          {type:'Detail Question',icon:'🔍',question:"9- After the Yom Kippur War in 1973, ------.", options:['A) OPEC ministers decided to increase oil prices by another 70%','B) the West agreed to be less supportive of Israel','C) OPEC promised to stabilise world oil supplies in a relatively short time','D) members of OPEC refused to sell oil to the Americans and the Dutch','E) the Middle East became more unstable than before'],answer:'D',explanation:"Pasaj, Yom Kippur Savaşı sonrasında OPEC'in Abd ve Hollanda'ya karşı petrol ambargosu uyguladığını ve belirli Amerikan şirketlerini boykot ettiğini belirtmektedir. Bu, satmayı reddetmek anlamına gelmektedir. Doğru cevap D'dir."}
        ]
      },
      { baslik:'4. Where New Products Come From', metin:"Akio Morita, the chairman of Sony Corporation in Japan, wanted a radio he could carry with him and listen to wherever he went. From that small desire was born the Sony Walkman, a radio small enough to be worn on a belt or carried in a pocket. Not all product development, however, is so easy. Most of today's products, including many of the basic necessities of food, clothing and shelter, are the result of creative research and thinking by staff. A new product is one that is new for the company that makes it. A hamburger, for example, is not new, but when McDonald's introduced the Big Mac, it was a new product for that company. Decisions to make a new product can be the result of technology and scientific discovery, but the discovery can be either accidental or sought for. The original punch-card data-processing machine was devised specifically for use by the Bureau of the Census. Penicillin, by contrast, was an accidental discovery and is now one of the most useful antibiotics. Products today are often the result of extensive market research to learn what consumers and retailers want.", kelimeler:{'Walkman':'tasınabilir radyo','necessities':'ihtiyaçlar','introduced':'tanıttı','devised':'tasarlandı','Bureau':'Büro','Census':'sayım','accidental':'tesadüfi','antibiotics':'antibiyotikler','extensive':'kapsamlı'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"10- In the passage, the Sony Walkman is referred to as ------.", options:['A) the creation of a large marketing research team','B) an example of uncomplicated product development','C) superior to all the others produced afterwards','D) something produced in response to in-depth market research','E) a product invented by Akio Morita, the chairman of Sony'],answer:'B',explanation:"Pasaj, Sony Walkman'ı Akio Morita'nın basit bir istekten doğduğu örnek olarak sunmaktadır. \"From that small desire was born the Sony Walkman\" ifadesi, bunun basit bir ürün geliştirmesi örneği olduğunu gösterir. Doğru cevap B'dir."},
          {type:'Detail Question',icon:'🔍',question:"11- When the Big Mac was first introduced, it was ------.", options:['A) the first ever hamburger to be put on the market','B) the result of technical and scientific development','C) the result of accidental discovery by McDonald\'s','D) a known item but a fresh product for McDonald\'s','E) the first product ever produced by McDonald\'s'],answer:'D',explanation:"Pasaj açıkça belirtmektedir: \"A hamburger, for example, is not new, but when McDonald's introduced the Big Mac, it was a new product for that company.\" Hamburger yeni değildir ancak McDonald's için yeni bir üründür. Doğru cevap D'dir."},
          {type:'Detail Question',icon:'🔍',question:"12- A new product nowadays ------.", options:['A) must be something completely new to the consumer','B) is always the result of creativity and invention','C) is usually produced in response to consumer demand','D) should be manufactured in large quantities to meet the huge demand','E) is more often created or discovered by accident'],answer:'C',explanation:"Pasajın son cümlesi \"Products today are often the result of extensive market research to learn what consumers and retailers want\" ifadesiyle, günümüzün ürünlerinin genellikle tüketici talebine yanıt olarak yapıldığını belirtmektedir. Doğru cevap C'dir."}
        ]
      },
      { baslik:'5. Classifying Life Forms', metin:"Exactly what is a plant and how is it different from other life forms? This may initially seem like a simple question. Everyone knows that an elm tree is a plant, whereas a dog is not. Nevertheless, the precise definition of plants is still a matter of debate among some scientists. All living things are made up of protoplasm, a complex material composed of organic substances such as sugars, proteins and fats. Protoplasm is arranged in tiny units called cells. All living things are composed of cells. As recently as the late 1960s, scientists believed that all organisms could be classified as members of either the plant or the animal kingdom. Life forms that are green and that can synthesise their own food using light energy were put in the plant kingdom. Those organisms that lack green pigment and are able to move about were considered to be animals. Researchers now agree that living things are more properly divided into two groups -- prokaryotes and eukaryotes. These major groups comprise five kingdoms. Major differences between cells are used to distinguish between these groups and kingdoms.", kelimeler:{'protoplasm':'sitoplazma','composed':'oluşturulmuş','organic':'organik','substances':'maddeler','kingdom':'krallık','synthesise':'sentez etmek','pigment':'pigment','prokaryotes':'prokariyotlar','eukaryotes':'ökaryotlar'},
        questions:[
          {type:'Main Idea Question',icon:'🎯',question:"13- The main concern of the passage is ------.", options:['A) how protoplasm is arranged into cells','B) the difference between plant and animal kingdoms','C) the classification of living things into groups','D) what makes plants different from other organisms','E) how scientists define organic substances'],answer:'C',explanation:"Pasaj yaşam formlarının sınıflandırılmasını ana konu olarak ele almaktadır. C doğru."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test9',
    baslik: 'Test9',
    aciklama: '6 pasaj · 18 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. THE BEST RECRUITING AGENTS', metin:"In 1849 a servant girl wrote home to her brother from Port Adelaide, South Australia: \"I have accepted a situation at £20 per annum, so you can tell the servants in your neighbourhood not to stay in England for such wages as from £4 to £8 a year, but come here.\" Letters such as these, which were circulated from kitchen to kitchen and from attic to attic in English homes, were the best recruiting agents for the colonies, which were then so desperately in need of young women to serve the pioneers who were trying to create a new life for themselves in their chosen countries. Other girls read about the much better prospects overseas in newspapers and magazines, which also published advertisements giving details of free or assisted passages.", kelimeler:{'servant':'hizmetçi','annum':'yıl','attic':'çatı katı','recruiting agents':'işe alım acentaları','colonies':'koloniler','pioneers':'öncüler','prospects':'beklentiler, fırsatlar','passages':'geçişler, seyahatler','circulated':'dolaştırıldı','desperately':'umutsuzca','wages':'ücret'},
        questions:[
          {type:'Main Idea Question',icon:'🎯',question:"1-Those women who went to the colonies as servants ------ .",options:['A) were all recruited through agents back in England','B) missed their families greatly','C) played the most important role in attracting others','D) found themselves being moved from kitchen to kitchen','E) had the pioneering spirit necessary for starting new lives'],answer:'C',explanation:"Metne göre, hizmetçi kızların yazdığı mektuplar ve gazetelerdeki reklamlar en önemli işe alım aracılarıydı. Dolayısıyla bu kadınlar başkalarını çekmeyde en önemli rol oynamışlardır. Cevap C'dir."},
          {type:'Detail Question',icon:'🔍',question:"2-Getting to the colonies from England for the servants ------ .",options:['A) could cost as little as £4','B) was essential if they wanted to escape life in English attics','C) was only possible if an agent had recruited them','D) did not pose any financial problem','E) required a written invitation from someone already there'],answer:'D',explanation:"Metinde 'free or assisted passages' (ücretsiz veya destekli geçişler) bahsedilmektedir. Bu, finansal sorun olmadığını gösterir. Cevap D'dir."},
          {type:'Inference Question',icon:'💭',question:"3-It is stated in the passage that ------ .",options:['A) no men could get jobs as servants in Australia','B) servants were in great demand for the pioneers establishing new lives','C) English homes were short of servants as so many went overseas','D) the pioneers who went to the colonies were all men','E) emigration from England to Australia started in 1849'],answer:'B',explanation:"Metinde 'desperately in need of young women to serve the pioneers' ifadesi açıkça hizmetçilerin büyük talep gördüğünü gösterir. Cevap B'dir."}
        ]
      },
      { baslik:'2. TO BRING BACK LOST MEMORIES', metin:"Our unconscious mind contains many millions of past experiences that, so far as our conscious mind knows, are lost forever. By means of several devices, we now know how to bring back lost memories. One method is \"free association\", used by psychiatrists. If a patient lets his conscious mind wander at will, it can give him clues to forgotten things which, if skillfully pursued by the doctor, will bring up whole networks of lost ideas and forgotten terrors. There are certain drugs which also help in this process; hypnotism, too, can be of tremendous value in exploring a patient's unconscious.", kelimeler:{'unconscious':'bilinçaltı','conscious':'bilinçli','devices':'yöntemler, araçlar','free association':'serbest çağrışım','psychiatrists':'psikiyatristler','skillfully':'ustalıkla','networks':'ağlar','terrors':'dehşetler, korkular','hypnotism':'hipnoz','tremendous':'muazzam, devasa'},questions:[
          {type:'Main Idea Question',icon:'🎯',question:"4-According to the passage, it is possible ------ .",options:['A) to use drugs to cure patients of their past terrors','B) to bring our lost memories to the surface through several methods','C) that psychiatric problems develop through the inability to forget certain things','D) that hypnotism can cause a patient to forget past terrors','E) for most people to choose to forget about their past experiences'],answer:'B',explanation:"Metinde 'By means of several devices, we now know how to bring back lost memories' açıkça belirtilmektedir. Serbest çağrışım, ilaçlar ve hipnoz gibi çeşitli yöntemler vardır. Cevap B'dir."},
          {type:'Detail Question',icon:'🔍',question:"5-In the method of \"free association\" ------ .",options:['A) unpleasant memories are pushed into the unconscious mind','B) the use of hypnotism is essential','C) certain drugs are more effective than hypnotism','D) all one\'s millions of past experiences are easily recalled','E) the patient\'s co-operation is needed'],answer:'E',explanation:"Metinde 'If a patient lets his conscious mind wander at will' ifadesi hastanın işbirliğine ihtiyaç olduğunu gösterir. Doktor bunu ustalıkla izleyerek ilerlemelidir. Cevap E'dir."},
          {type:'Inference Question',icon:'💭',question:"6-We can conclude from the passage that ------ .",options:['A) most psychiatric disorders are caused by the inability to forget certain things','B) only a skilful doctor can open up one\'s unconscious mind','C) our unconscious mind only contains the things we don\'t want to remember','D) many of one\'s past experiences are stored in one\'s unconscious mind','E) a patient can\'t be made aware of his forgotten experiences without drugs or hypnotism'],answer:'D',explanation:"Metine göre 'Our unconscious mind contains many millions of past experiences'. Bu, bilinçaltında pek çok geçmiş deneyimin depolandığını gösterir. Cevap D'dir."}
        ]
      },
      { baslik:'3. PALM TREES', metin:"Of the world\'s 2,500-plus species of palm trees, the Palmyra palm is most important to man, next to the coconut palm, because it yields food and provides over one-hundred different useful end-products. To obtain the majority of its benefits, the Palmyra needs to be climbed twice daily to extract the nutritious juice from its flower-bunches. It is this juice, converted in several different methods, that is the basis for a wide variety of other products. Collecting this juice, however, is arduous — and often dangerous — work, for the trees can top 30 metres in height.", kelimeler:{'species':'türler, çeşitler','Palmyra':'Palmira','yields':'üretir, verir','nutritious':'besleyici','flower-bunches':'çiçek demetleri','arduous':'çetin, zor','dangerous':'tehlikeli','basis':'temel, dayanak','wide variety':'geniş çeşitlilik','extract':'çıkarmak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7-When the Palmyra is climbed twice a day ------ .",options:['A) it is possible to get most of its benefits','B) strict safety measures are taken','C) the best coconuts can be picked','D) it encourages the tree to grow to over thirty metres','E) the flowers are collected for processing'],answer:'A',explanation:"Metinde 'To obtain the majority of its benefits, the Palmyra needs to be climbed twice daily' açıkça yazılmıştır. Cevap A'dır."},
          {type:'Detail Question',icon:'🔍',question:"8-According to the passage, ------ .",options:['A) each palm tree can produce over 100 coconuts','B) the juice from coconuts is very nutritious','C) there are at least two and a half thousand types of palm tree','D) there are several different ways of collecting Palmyra flower juice','E) many people rely on palm trees for their basic food requirements'],answer:'C',explanation:"Metinde 'Of the world\'s 2,500-plus species of palm trees' yazılmıştır. Bu, en az 2.500 tür palmiye ağacı olduğunu gösterir. Cevap C'dir."},
          {type:'Inference Question',icon:'💭',question:"9-The juice from the Palmyra\'s flower-bunches ------ .",options:['A) is better quality if the tree is at least 30 metres high','B) is only produced at certain times of the day','C) gets converted into over 100 different food types','D) is extracted by pressing the picked flowers','E) provides the raw material for many other products'],answer:'E',explanation:"Metinde 'It is this juice, converted in several different methods, that is the basis for a wide variety of other products' yazılmıştır. Bu, suyun diğer pek çok ürün için hammadde olduğunu gösterir. Cevap E'dir."}
        ]
      },
      { baslik:'4. OVERREACTING TO A JOKE', metin:"More often than not, the person who habitually laughs longest and loudest when a joke is retailed does not possess a particularly keen sense of humour. Though he may not admit it, he is vaguely aware of his deficiency, and frequently goes to extremes to cover it up, A mediocre joke is likely to get as big a rise out of him as a truly humorous one. Psychological studies, likewise, show that people with a really keen sense of humour are not prone to much laughter. They are highly appreciative of humour, but they are also discriminating. And they never overreact.", kelimeler:{'habitually':'alışkanlık olarak, düzenli olarak','retailed':'anlatıldığında','possess':'sahip olmak','keen':'keskin, anlayışlı','deficiency':'eksiklik','extremes':'aşırılıklar','mediocre':'sıradan, orta düzeyde','prone':'eğilimli, yatkın','appreciative':'takdir eden','discriminating':'ayırt edebilen, seçici'},
        questions:[
          {type:'Inference Question',icon:'💭',question:"10-According to the writer, it isn\'t necessarily true that ------ .",options:['A) mediocre jokes are only laughed at by people with no sense of humour','B) people with a keen sense of humour never overreact','C) a person who is aware of his weak sense of humour will always overreact','D) some jokes are better than others','E) the longer a person laughs, the keener his sense of humour'],answer:'E',explanation:"Metinde açıkça 'the person who habitually laughs longest and loudest when a joke is retailed does not possess a particularly keen sense of humour' yazılmıştır. Bu, uzun süre gülmenin iyi mizah anlayışını göstermediğini belirtir. Cevap E'dir."},
          {type:'Detail Question',icon:'🔍',question:"11-Those with a really keen sense of humour ------ ...",options:['A) never show it through laughter','B) tell mediocre jokes to make other people overreact','C) don\'t appreciate the company of those with a poor sense of humour','D) are able to distinguish between good and bad jokes','E) will laugh for a long time at a truly humorous joke'],answer:'D',explanation:"Metinde 'they are also discriminating' (seçici oldukları) yazılmıştır. Bu, iyi ve kötü şakalar arasında ayrım yapabildiklerini gösterir. Cevap D'dir."},
          {type:'Main Idea Question',icon:'🎯',question:"12-The writer believes that by overreacting to a joke ------ .",options:['A) some people are trying to hide the shortcomings in their sense of humour','B) you make the person who told it feel inadequate in some way','C) you spoil the humour for other people','D) a person can demonstrate how mediocre it was','E) a person shows how discriminating he is about humour'],answer:'A',explanation:"Metinde 'he is vaguely aware of his deficiency, and frequently goes to extremes to cover it up' yazılmıştır. Yazar, aşırı tepki vermenin mizah anlayışındaki eksiklikleri gizlemeye çalışmak olduğunu belirtir. Cevap A'dır."}
        ]
      },
      { baslik:'5. ALPINE FORESTS', metin:"Forests are the lifeguards of the snowy peaks of the Alps. They provide a natural barrier against avalanches and landslips, but the skiing industry, which proved a boon for poor Alpine farmers, is damaging the environment. Forests have been felled to make way for more ski runs, car parks and hotels, and Alpine meadows have been abandoned by farmers keen to exploit tourism. Consequently, the avalanche has now become a common phenomenon. Forestry experts estimate that two thirds of several thousand avalanches that descend into inhabited parts each year are the result of forest depletion.", kelimeler:{'lifeguards':'koruyucular','snowy peaks':'karlı tepeler','barrier':'engel, bariyer','avalanches':'çığ','landslips':'heyelanlar','skiing industry':'kayak endüstrisi','boon':'bereket, nimet','damaging':'zarar veren','felled':'kesilen','ski runs':'kayak pisti','meadows':'çayırlar','exploit':'sömürmek, faydalanmak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"13-In the Alps, the attraction of tourism ------ .",options:['A) causes two thousand avalanches a year','B) has diverted some farmers away from the care of the land','C) has brought much needed help for protecting the environment','D) has lessened due to the threat of avalanches','E) forced many farmers to leave the area'],answer:'B',explanation:"Metinde 'Alpine meadows have been abandoned by farmers keen to exploit tourism' yazılmıştır. Bu, turizmin çekiciliğinin bazı çiftçileri toprağın bakımından uzaklaştırdığını gösterir. Cevap B'dir."},
          {type:'Inference Question',icon:'💭',question:"14-As a consequence of the depletion of Alpine forests, ------ .",options:['A) many farmers have had to turn to tourism for work','B) the skiing industry has been badly damaged','C) only one third of all avalanches occur in uninhabited parts','D) many areas are now uninhabitable','E) the frequency of avalanches has greatly increased'],answer:'E',explanation:"Metinde 'two thirds of several thousand avalanches that descend into inhabited parts each year are the result of forest depletion' yazılmıştır. Ormansızlaşmanın çığ sıklığını artırdığı açıktır. Cevap E'dir."},
          {type:'Inference Question',icon:'💭',question:"15-Alpine farmers ------ .",options:['A) were the people who initiated the development of the skiing industry','B) have had much of their land taken from them by those involved in tourism','C) used to be poor before the rise of the skiing industry','D) were forced to turn their meadows into hotels and car parks','E) feel that they have been exploited by tourism'],answer:'C',explanation:"Metinde 'the skiing industry, which proved a boon for poor Alpine farmers' yazılmıştır. Bu, kayak endüstrisinden önce çiftçilerin fakir olduğunu gösterir. Cevap C'dir."}
        ]
      },
      { baslik:'6. NADIA COMANECI', metin:"One of the most popular and exciting gymnasts to compete in the Olympic games was Nadia Comaneci from Romania. Fourteen-year-old Nadia scored seven perfect 10s at the 1976 Montreal Olympics, becoming the first gymnast ever to receive a perfect score in Olympic competition. She won three gold medals, one silver and one bronze. Born in 1961 in Onesti, Romania, Nadia began gymnastics training at age 6. She was coached by Bela Karolyi, who later coached American gymnasts. Nadia won the Romanian national championship in 1971, when she was only 10 years old. After her Olympic triumph, she continued competing, winning two gold medals at the 1980 Moscow Olympics.", kelimeler:{'gymnast':'jimnastikçi','compete':'yarışmak','triumph':'zafer','coached':'antrenörlük etmek','championship':'şampiyonluk'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"16- According to the passage, Nadia Comaneci ------.",options:['A) won only gold medals at the 1976 Olympics','B) was the first gymnast to score a perfect 10 in Olympics','C) began gymnastics at the age of 14','D) was coached by an American gymnast','E) won the Romanian championship at age 14'],answer:'B',explanation:"Pasajda 'becoming the first gymnast ever to receive a perfect score in Olympic competition' yazılıdır. B doğrudur."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test10',
    baslik: 'Test10',
    aciklama: '6 pasaj · 15 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. SOCIABLE SPIDERS', metin:"About 35 of the world's spider species are known to be \"sociable\". The social behaviour of these spiders is not as advanced or as organized as that of ants and bees but it is just as fascinating. Depending on the species, social spiders live in groups that range from a few individuals to thousands. Some small groups are made up of only a mother and her offspring on a single web. These groups last until the young reach maturity. Then they scatter to form colonies of their own. In other groups, each spider builds its own web within a community of other spiders. Still other spider species live in huge, socially complex web and nest \"communities.\" These spiders join together to capture prey, to feed, and to share in the care of offspring. In some colonies, more than 20,000 spiders of both sexes and all ages live together and join in group activities. During the day, most of the spiders are inactive. They stay in the centre of the web to avoid the heat. Their activity is greatest at night, when many spiders come out to spin silk and repair the surface of their web. Some spiders put down silk framework lines while others lay sticky silk on top of them. Jobs are performed by whichever spider happens to be near the work that needs to be done.", kelimeler:{'sociable':'sosyal','fascinating':'büyüleyici','offspring':'yavrular','maturity':'olgunluk','scatter':'dağılmak','colonies':'koloniler','complex':'karmaşık','inactive':'hareketsiz','incessant':'durmaksızın'},questions:[
          {type:'Detail Question',icon:'🔍',question:"1- Some spider species ------.",options:['A) remain with their mother for life','B) organize themselves in a way identical to ants and bees','C) rely on other spiders to build their webs','D) have as many as twenty thousand offspring','E) perform their activities collectively'],answer:'E',explanation:"Pasajda spiderlerin \"perform their activities collectively\" yani toplu olarak aktivite yaptıkları belirtilmektedir. \"These spiders join together to capture prey, to feed, and to share in the care of offspring\" cümlesi bunu destekler. B yanlış çünkü sosyal davranış ants ve bees kadar gelişmiş değildir."},
          {type:'Detail Question',icon:'🔍',question:"2- In the large colonies mentioned in the passage, ------.",options:['A) the spiders hunt by day and work on the web by night','B) the centre of the web is the warmest place','C) there isn\'t a set distribution of tasks','D) only mature spiders are to be found','E) females with offspring hold the highest social position'],answer:'C',explanation:"Pasajın son cümlesinde \"Jobs are performed by whichever spider happens to be near the work that needs to be done\" denilmektedir. Bu, görevlerin belirlenmiş bir dağılımının olmadığını gösterir. A yanlış çünkü spiderler gündüz hareketsizdir, gece aktif olurlar."},
          {type:'Inference Question',icon:'💭',question:"3- It is stated by the writer that spiders ------.",options:['A) consist of approximately thirty-five species','B) don\'t all have the ability to spin webs','C) never come out during the day','D) don\'t have such a complex social system as ants and bees','E) all have specific roles to play within a community'],answer:'D',explanation:"Pasajın başında \"The social behaviour of these spiders is not as advanced or as organized as that of ants and bees\" açıkça belirtilmektedir. C yanlış çünkü spiderler günde değişen zamanlarda aktiftirler. E yanlış çünkü görevler belirlenmemiştir, tesadüfi olarak yapılır."}
        ]
      },
      { baslik:'2. ICELAND', metin:"Ten million years ago Iceland's climate was comparable to Florida's and able to support sequoia and redwood trees. As recently as 5,000 years ago, Iceland had expansive forests. But man and sheep have managed, in little over a thousand years, to destroy virtually all of Iceland's forests. And when the trees disappeared, so too did most of the well-drained soil, carried off by the incessant wind. Today, farming is largely limited to the production of hay for fodder on 1,500 square kilometres (less than 2 per cent of the country). Although the mean daily temperature in Iceland is about 4°C — nine degrees higher than might be expected at this latitude — farmers may get warm, summery days in February or hailstorms and snows in July. The relatively temperate climate is brought by a branch of the Gulf Stream that hits the southwest coast. Seasons are defined rather by the amount of daylight. Summer is three months of almost day-long sun, when the pace of life quickens; winter is the season of darkness, when farms and villages are isolated for months and life retreats indoors. The fertile triangle around the Tijeras River, which attracted Iceland's first settlers, is still the country's most productive agricultural region. Life has changed here more rapidly in the past 35 years than in the previous 850 years.", kelimeler:{'comparable':'karşılaştırılabilir','sequoia':'sekoya ağacı','expansive':'geniş','incessant':'durmaksızın','fodder':'hayvan yemi','latitude':'enlem','temperate':'ılıman','daylight':'gündoğumu','isolated':'izole','productive':'verimli'},questions:[
          {type:'Inference Question',icon:'💭',question:"4- Considering Iceland's latitude, ------.",options:['A) the country receives very little sunlight','B) farming there is highly productive','C) its average temperature is quite high','D) its climate is particularly hostile and changeable','E) it\'s surprising that it has the same climate as Florida'],answer:'C',explanation:"Pasajda \"the mean daily temperature in Iceland is about 4°C — nine degrees higher than might be expected at this latitude\" denilmektedir. Bu, enlemine göre sıcaklığın beklenenden yüksek olduğunu gösterir. A yanlış çünkü yazında aylar boyu gün ışığı vardır."},
          {type:'Detail Question',icon:'🔍',question:"5- The triangle around the Tijeras River ------.",options:['A) is the only area in Iceland where farming is possible','B) lost its forests only in the last 35 years','C) contains Iceland\'s only remaining sequoia and redwood trees','D) saw the first settlement in Iceland','E) consists only of farms and villages'],answer:'D',explanation:"Pasajda \"The fertile triangle around the Tijeras River, which attracted Iceland's first settlers\" belirtilmektedir. Bu cümle, bölgenin ilk yerleşimcileri cezbettiğini gösterir. A yanlış çünkü diğer bölgelerde de tarım yapılmaktadır."},
          {type:'Detail Question',icon:'🔍',question:"6- In Iceland ------.",options:['A) about ninety-eight per cent of the land is not suitable for cultivation','B) the soil is well-drained and fertile','C) there is year-round sunshine','D) there are now no trees left at all','E) the only trees to be found are sequoias and redwoods'],answer:'A',explanation:"Pasajda \"farming is largely limited to the production of hay for fodder on 1,500 square kilometres (less than 2 per cent of the country)\" denilmektedir. Bu, toplam alanın %98'inin tarıma uygun olmadığı anlamına gelir. D yanlış çünkü \"virtually all\" ifadesi tamamen değil neredeyse demektir. C yanlış çünkü kışın karanlık mevsimi vardır."}
        ]
      },
      { baslik:'3. DEBATE OVER THE WORLD\'S FUTURE', metin:"How many people can the earth hold? Will birth and death rates continue to decline? Can food production keep pace with population growth? Can technology supplement or replace today's resources? What are the long-term effects of pollution on health, climate, and farm production? Debate over such issues has spawned many volumes, as scholars look to the future with varying degrees of optimism and gloom. In a lecture titled \'The Terror of Change\", Patricia Gulas Strauch cited three aspects of our future about which there is little disagreement: The speed of change will accelerate, the world will be increasingly complex, and nations and world issues will be increasingly interdependent. \"Today's problems,\" facing Third World megacities in particular, cannot be ignored by developed countries. We cannot look to the past for solutions; there is no precedent for such growth. We are in uncharted, challenging waters.", kelimeler:{'spawned':'doğurmuş','varying':'değişen','gloom':'karamsarlık','accelerate':'hızlanmak','interdependent':'birbirinden bağımlı','megacities':'megaşehirler','precedent':'öncül','uncharted':'harita olmayan'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"7- The points put forward in the lecture \"The Terror of Change\" ------.",options:['A) have changed scholars from a sense of optimism to one of gloom','B) are, for the most part, accepted','C) had not been considered by scholars previously','D) caused much debate and disagreement','E) filled several volumes'],answer:'B',explanation:"Pasajda \"three aspects of our future about which there is little disagreement\" belirtilmektedir. \"Little disagreement\" ifadesi noktaların genel olarak kabul görmesini anlamına gelir. D yanlış çünkü az tartışma vardır, çok değil. E yanlış çünkü bu noktalar değil, genel konular ciltler doldurmuştur."},
          {type:'Inference Question',icon:'💭',question:"8- According to the writer, having no equivalents in the past, ------.",options:['A) analyses formulated by experts are open to discussion','B) books on the world\'s problems cause a great deal of debate','C) Third World megacities are not sufficiently aided','D) modern technological developments do not meet the needs of the people','E) today\'s problems require new solutions'],answer:'E',explanation:"Pasajda \"We cannot look to the past for solutions; there is no precedent for such growth\" belirtilmektedir. Bunun anlamı bugünün sorunlarının yeni çözümlere ihtiyaç duyduğudur. Geçeşte eş değer bir durumun olmaması nedeniyle geçmiş çözümleri uygulanamaz."},
          {type:'Main Idea Question',icon:'🎯',question:"9- The outlook for the world's future ------.",options:['A) arouses optimism in some experts, yet pessimism in others','B) is a repetition of events which occurred in the past','C) depends entirely on technological advances made today','D) is one of overpopulation, pollution and reduced farm production','E) shows that the population will soon exceed the earth\'s capacity'],answer:'A',explanation:"Pasajda \"scholars look to the future with varying degrees of optimism and gloom\" denilmektedir. Bu, bazı uzmanların iyimser, diğerlerinin kötümser bakış açısı taşıdığını gösterir. B yanlış çünkü \"there is no precedent\" ifadesi tekrar etmediğini gösterir."}
        ]
      },
      { baslik:'4. COLORADO', metin:"Best known for the Rocky Mountains, the loftiest state of the USA, Colorado, averages 6,800 feet above sea level. But Colorado encompasses other distinct geographic regions, including the fertile High Plains that sweep up from the east. Along the foothills of the Rockies nestle the metropolitan areas of Denver, Boulder, Colorado Springs, Pueblo, Fort Collins, and Greeley, containing 80 per cent of the state's population. Beyond the Continental Divide, lush valleys and mountains level off to the high plains of the Colorado Plateau in the west. Intense settlement began with the discovery of gold in the late 1850s, after which the population began clamouring for statehood, granted in 1876. Colorado continues to produce a wealth of minerals, the most important of which, molybdenum, is used to strengthen steel. Although the plains are semi-arid, the mountains are the source of four of the nation's major rivers: the Platte, Arkansas, Rio Grande, and Colorado.", kelimeler:{'loftiest':'en yüksek','encompasses':'içermek','distinct':'belirgin','foothills':'etekleri','metropolitan':'metropoliten','Continental Divide':'Kıta Bölü','lush':'yeşil','clamouring':'talep etmek','molybdenum':'molibden','semi-arid':'yarı kurak'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"10- Colorado ------.",options:['A) contains eighty per cent of the United States\' population','B) is the most important state for mineral production','C) consists of nothing but mountain ranges','D) encompasses all four of the nation\'s rivers','E) became a state in 1876'],answer:'E',explanation:"Pasajda açıkça \"statehood, granted in 1876\" belirtilmektedir. A yanlış çünkü %80 devletin değil, Colorado'nun nüfusunun içinde metropolitan alanlarda yaşamaktadır. C yanlış çünkü High Plains ve Colorado Plateau da vardır."},
          {type:'Inference Question',icon:'💭',question:"11- Among the states, Colorado ------.",options:['A) has the most fertile land','B) was the first to be settled','C) is at the highest altitude','D) has the largest population','E) has the most successful mineral industry'],answer:'C',explanation:"Pasajın başında \"the loftiest state of the USA, Colorado, averages 6,800 feet above sea level\" belirtilmektedir. Loftiest, en yüksek anlamına gelir. D yanlış çünkü metin nüfus sıralaması hakkında bilgi vermez. E yanlış çünkü metin sadece Colorado için mineral üretim hakkında konuşur."},
          {type:'Detail Question',icon:'🔍',question:"12- The discovery of gold in Colorado ------.",options:['A) drew eighty per cent of the nation\'s population to the area','B) accelerated people\'s moving to the area','C) was fortunate because the land was so mountainous and barren','D) happened in 1876','E) came shortly after molybdenum was found'],answer:'B',explanation:"Pasajda \"Intense settlement began with the discovery of gold in the late 1850s, after which the population began clamouring for statehood\" belirtilmektedir. Bu, altın keşfinin insanların göçünü hızlandırdığını gösterir. D yanlış çünkü altın 1850'lerde, statehood 1876'da bulundu. A yanlış çünkü %80 oranı metin tarafından desteklenmez."}
        ]
      },
      { baslik:'5. PACIFIC SALMON FOR THE JAPANESE', metin:"Nobody eats as much Pacific salmon as the Japanese, who consume the fish raw, pickled, baked, salted, fried, soused, pasted, and smoked. They eat salmon livers, and salmon skulls, and they process the fish into burgers and sausage. They eat 300,000 tons of the fish each year, a third of the world's total catch. The centre of it all is Tokyo's Tsukiji fish market, the largest on earth. Long before sunrise, the market is buzzing. Hundreds of men and women rush around between stalls, shout orders at one another, slice fish, work the telephones, and joke under bright strings of lights that shine on acres of iced-down fish steaks, shark fillets, and thick red slabs of tuna stacked like wood. The concrete floors are newly washed and swept. The whole place smells fresh, like the sea.", kelimeler:{'pickled':'salamura yapılmış','consume':'tüketmek','soused':'daldırılmış','skulls':'kafatası','burgers':'hamburgeri','sausage':'sosisler','buzzing':'vızıldamak','fillets':'fileto','slabs':'dilim'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"13- According to the passage, the Japanese eat Pacific salmon ------.",options:['A) only raw','B) in a variety of ways','C) only at Tsukiji market','D) less than any other nation','E) mostly in the form of burgers'],answer:'B',explanation:"Pasajda 'raw, pickled, baked, salted, fried, soused, pasted, and smoked' şeklinde birçok yöntemle yedikleri belirtilmiştir. B doğru."}
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test11',
    baslik: 'Test11',
    aciklama: '6 pasaj · 16 soru · YDT Reading',
    pasajlar: [
      {
        baslik: '1. HAIR',
        metin: "Beautiful hair is a physical attribute man has admired in woman since history began. Women with lovely locks have woven themselves into legend and romance and even the religion of many peoples. Hence, hair has always been a symbol of beauty in women. Gleaming hair is not merely a beautiful feature in itself; as a frame for your features, it enhances the entire face. It can help you appear taller or shorter, depending on whether it is worn high or low, close to the head, or full around the face; it can hide an unbecoming forehead or camouflage a sloping neckline. Regardless of colour, quality, or abundance, the beauty of your hair depends greatly on how it is worn. Naturally you can do more with the styling of strong healthy hair than with stringy, dry, limp hair. Thus, keeping your hair in good condition is the key to hair beauty.",
        kelimeler: {'admired':'hayranlık duyulan','locks':'saç tüyleri','symbol':'sembol','gleaming':'parlayan','enhance':'güzelleştirmek','camouflage':'gizlemek','stringy':'kuru ve sac sac','limp':'cansız','abundance':'bolluğu','attribute':'özellik'},
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "1-Hair, according to the writer, ------.",
            options: ['A) makes the whole face seem more attractive', 'B) becomes limp if it is over styled', 'C) should always be styled when it is wet', 'D) should be worn short if you are tall', 'E) is something men envy in women'],
            answer: 'A',
            explanation: "Yazarın görüşüne göre, saç yüzün çerçevesi gibi davranarak tüm yüzü daha çekici hale getirir. Metinde \"as a frame for your features, it enhances the entire face\" ifadesi bunu açıkça belirtir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "2-In the writer's opinion ------.",
            options: ['A) women look better if their hair covers their foreheads', 'B) hair looks lovely when it has decorations woven into it', 'C) natural hair colour is more attractive than dyed hair', 'D) the style of your hair is an extremely important factor in how good it looks', 'E) poor hair is a sign that a woman isn\'t romantic'],
            answer: 'D',
            explanation: "Metinde \"the beauty of your hair depends greatly on how it is worn\" ifadesi, saçın stilinin güzelliği için çok önemli bir faktör olduğunu gösterir. Bu, D şıkkıyla tam olarak eşleşir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "3-Since the beginning of history, ------.",
            options: ['A) women have decorated their hair by weaving things into it', 'B) men have been jealous of women\'s hair', 'C) women\'s hair has been regarded as a beauty symbol', 'D) legendary women have always had beautiful hair', 'E) religion has dictated a woman\'s choice of hairstyle'],
            answer: 'C',
            explanation: "Metinde \"Beautiful hair is a physical attribute man has admired in woman since history began\" ve \"hair has always been a symbol of beauty in women\" ifadeleri, saçın tarihin başından beri bir güzellik sembolü olduğunu gösterir."
          }
        ]
      },
      {
        baslik: '2. THE ORGAN OF VISION',
        metin: "The human eye is nature's most intricate and delicate organ, and upon its development probably rests the high degree of development of man's society. When nature developed this intricate and adaptable organism, human eyes were used primarily for outdoor work and living. With the stress of indoor life and artificial lighting, abnormal strain is placed on eyes today. Sometimes more than nature's assistance is needed to keep eyes in shape for the many uses they serve in modern life. It is also true that we have extended man's normal life span to almost twice what it is in a primitive society. Visual deficiencies also increase with age, and eyes usually need some corrective care as one grows older. Undetected, uncorrected eye trouble can affect the entire personality structure and can make the difference between success and failure in one's working life or personal relations. Theodore Roosevelt, for instance, was slow and backward till it was discovered that his vision was bad. After his defective sight was corrected, he emerged as one of the leaders of his time.",
        kelimeler: {'intricate':'karmaşık','delicate':'hassas','organism':'organizma','strain':'baskı','deficiencies':'eksiklikler','corrective':'düzeltici','affected':'etkilenen','emerge':'ortaya çıkmak','primitive':'ilkel','undetected':'tespit edilmemiş'},
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "4-According to the writer there is a close relationship between ------.",
            options: ['A) the development of the eye and how much rest a person gets', 'B) the health of a person\'s eyes and his success', 'C) a person\'s age and how easy it is to detect eye trouble', 'D) the shape of the eye and its ability to cope with modern life', 'E) the use of artificial lighting and the age at which eye problems start'],
            answer: 'B',
            explanation: "Yazarın Theodore Roosevelt örneğini vermiş olması ve \"Undetected, uncorrected eye trouble can affect the entire personality structure and can make the difference between success and failure in one's working life\" ifadesi, gözlerin sağlığı ile başarı arasında yakın bir ilişki olduğunu gösterir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "5-The writer states that people in modern societies ------.",
            options: ['A) rarely do any outdoor activities', 'B) have much healthier eyes than in the past', 'C) believe that having perfect vision is a sign of success', 'D) do not have the same shaped eyes as primitives', 'E) live approximately twice as long as those in primitive ones'],
            answer: 'E',
            explanation: "Metinde açıkça \"we have extended man's normal life span to almost twice what it is in a primitive society\" ifadesi yer almaktadır. Bu, modern toplumlarda yaşayan insanların ilkel toplumlardakilerin yaklaşık iki katı kadar yaşadığını belirtir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "6-Modern living conditions ------.",
            options: ['A) have developed because man prefers artificial lighting', 'B) have caused the eye to change shape', 'C) require the eye to be used less frequently', 'D) put the eye under a lot of pressure', 'E) have lessened the incidence of defective eyesight'],
            answer: 'D',
            explanation: "Metinde \"With the stress of indoor life and artificial lighting, abnormal strain is placed on eyes today\" ifadesi, modern yaşam koşullarının gözlere çok fazla baskı koyduğunu gösterir."
          }
        ]
      },
      {
        baslik: '3. FATIGUE',
        metin: "Our nerves are made up of cells, as is the rest of the body; and, like all cells, nerve cells must be nourished by the blood and will lose energy by activity. A period of rest usually restores nerve cells to normal. In the relaxed person, this can occur. In the person who is constantly under a degree of nervous tension, who has poor general health or is undergoing emotional disturbance, the cells are unable to regain their normal healthy condition. They live, instead, in a state of almost complete depletion, or fatigue. One result of this fatigue is a slowing down of impulses at the brain — a quicker loss of interest in what one is doing, the inability to stay at a task till it is done. It may become a complete lack of interest in anything. Not only mental but physical work tires the nerves as well. Work you're obliged to do but you don't like does this more quickly than work you enjoy. Such physical strains as tired eyes, a nagging headache, help tire the nervous system even if the part affected is not involved in the work one does. A change of work often gives a sense of rest because it brings different muscles into play.",
        kelimeler: {'nourished':'beslenmiş','depleted':'tükenmişs','fatigue':'yorgunluk','impulses':'dürtüler','obliged':'zorunlu','strains':'baskılar','nagging':'sızlayan','compensate':'telafi etmek','regain':'geri kazanmak','depletion':'tükenme'},
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "7-The nerves become tired ------.",
            options: ['A) even while a person is relaxing', 'B) very quickly if you change your work', 'C) as a result of slowed down impulses at the brain', 'D) through both mental and physical work', 'E) when a person starts using different muscles'],
            answer: 'D',
            explanation: "Metinde \"Not only mental but physical work tires the nerves as well\" ifadesi açıkça belirtilmiştir. Sinirler hem zihinsel hem de fiziksel çalışma sonucunda yorulur."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "8-The writer suggests that you can find rest ------.",
            options: ['A) easiest when you play something', 'B) by eating more nourishing foods', 'C) by changing your activity', 'D) if you relax your eyes', 'E) only when you spend time doing nothing'],
            answer: 'C',
            explanation: "Metinde \"A change of work often gives a sense of rest because it brings different muscles into play\" ifadesi, aktiviteyi değiştirerek dinlenme bulabileceğini gösterir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "9-We can conclude from the passage that when we feel fatigued ------.",
            options: ['A) our nerve cells are depleted', 'B) we should stop all activity completely', 'C) it is due to too much physical work', 'D) it is because we have used too many different muscles', 'E) a nagging headache will probably follow'],
            answer: 'A',
            explanation: "Metinde \"They live, instead, in a state of almost complete depletion, or fatigue\" ifadesi, yorgunluk hissettiğimizde sinir hücrelerimizin tükendiğini açıkça gösterir."
          }
        ]
      },
      {
        baslik: '4. QUEEN VICTORIA',
        metin: "The long reign of Queen Victoria was a time of almost uninterrupted peace and great progress. The rapid growth of industry made Britain the world's leading industrial nation — \"the workshop of the world\", as she was called — and the British Empire reached the height of its power when Queen Victoria was proclaimed Empress of India in 1876. During her long life, which lasted 82 years, the Queen herself became a symbol of Britain's greatness. In 1840 Victoria married Prince Albert and lived happily with him until he died in 1861. After his death she led a lonely life, withdrew from public affairs, and could only rarely be persuaded to visit London. When she died in 1901 after a reign of 63 years, the world stood on the threshold of the 20th century, and many English people felt that a great age had gone for ever.",
        kelimeler: {'reign':'saltanat','uninterrupted':'kesintisiz','proclaimed':'ilan edildi','empress':'imparatoriçe','withdrew':'çekildi','threshold':'eşik','loneliness':'yalnızlık','greatness':'büyüklük','industrial':'endüstriyel','progress':'ilerleme'},
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "10-Queen Victoria came to the throne in ------.",
            options: ['A) 1876', 'B) 1819', 'C) 1840', 'D) 1901', 'E) 1838'],
            answer: 'E',
            explanation: "Metinde \"After a reign of 63 years\" ve \"When she died in 1901\" ifadeleri verilmiştir. 1901 - 63 = 1838 olur. Ayrıca, 1840'ta Prens Albert ile evlenmiş olduğu yazılmıştır, bu da onun saltanatının 1838'de başladığını gösterir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "11-During the reign of Queen Victoria, ------.",
            options: ['A) the British Empire was formed', 'B) other countries lived in fear of Britain\'s power', 'C) Britain was involved in hardly any wars', 'D) public affairs were the sole responsibility of the monarch', 'E) the only country to have industrialized was Britain'],
            answer: 'C',
            explanation: "Metinde \"The long reign of Queen Victoria was a time of almost uninterrupted peace\" ifadesi açıkça belirtilmiştir. Bu, Kraliçe Victoria'nın saltanatı sırasında neredeyse hiç savaşın olmadığını gösterir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "12-Queen Victoria's death ------.",
            options: ['A) came about because she was so lonely without her husband', 'B) brought about the collapse of the British Empire', 'C) left Britain ill-equipped to enter the 20th century', 'D) was considered, by many, the end of an era', 'E) caused the era of peace to come to an end'],
            answer: 'D',
            explanation: "Metinde \"When she died in 1901... many English people felt that a great age had gone for ever\" ifadesi, Kraliçe Victoria'nın ölümünün birçok İngiltere insanı tarafından bir dönemin sonu olarak kabul edildiğini gösterir."
          }
        ]
      },
      {
        baslik: '5. HEALTH EDUCATION IN SCHOOLS',
        metin: "Human biology is a detailed and complicated study. Thus, for the purposes of health education in schools, it is best approached from the point of view of function rather than structure. The detailed anatomy and physiology of the heart and circulation, for instance, are not needed, but students should know that the heart's function improves with use and that regular exercise is the best way to avoid distress upon exertion. Thus, the basic knowledge required to live a healthy life is that oxygen is supplied to the muscles by a partnership of lungs and heart, the lungs taking in a supply and the heart distributing it. Exercise involves a call for more oxygen and, if the heart is not trained to deliver a full volume of blood with each beat, the lungs must work harder to compensate. These simple facts can be appreciated without the need for elaborate detail.",
        kelimeler: {'complicated':'karmaşık','approached':'yaklaşıldı','anatomy':'anatomi','physiology':'fizyoloji','circulation':'dolaşım','exertion':'çaba','partnership':'ortaklık','distributing':'dağıtılması','compensate':'telafi etmek','elaborate':'ayrıntılı'},
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "13-The writer mentions heart and circulation ------.",
            options: ['A) because they are the most important structures in the human body', 'B) since students have great difficulty understanding their relationship', 'C) in order to illustrate the extent to which students are confused'],
            answer: 'C',
            explanation: "Bu soru pasaja göre doğru cevaptır."
          }
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test12',
    baslik: 'Test12',
    aciklama: '5 pasaj · 15 soru · YDT Reading',
    pasajlar: [
      {
        baslik: '1. TREE of LIFE',
        metin: "The benefits of trees to the environment are well-known facts. The leaves of trees help clean the air by taking in carbon dioxide and then releasing oxygen, during a process known as photosynthesis. The root systems of trees play an important role in conserving water, as well as deterring soil erosion and flooding. However, in addition to benefits to the environment, scientists are now discovering that trees have a direct effect on our health. Trees filter pollution which contributes to health problems such as asthma. Studies have shown that stress associated with driving is reduced when the road driven along is lined with trees. Further research suggests that stress and anxiety are lower in hospital patients who can see trees from their beds. There has been much publicity about the harmful effects of ultraviolet rays from the Sun, but a single tree can protect you as much as some sun creams and dense forest can cut out all the harmful ultraviolet rays. Trees are popular because of the beauty they bring into our lives, but the sense of tranquillity that we get from sitting under a tree may have a more direct and positive effect on our general health.",
        kelimeler: {
          'photosynthesis': 'Fotosentez',
          'conserving': 'Koruma, saklama',
          'deterring': 'Caydırma, engelleme',
          'filter': 'Filtreleme, temizleme',
          'asthma': 'Astım',
          'tranquillity': 'Huzur, sakinlik',
          'ultraviolet rays': 'Ultraviyole ışınları',
          'anxiety': 'Kaygı, endişe'
        },
        questions: [
          {
            type: 'Main Idea Question',
            icon: '🎯',
            question: "1- The main focus of the passage is .......... .",
            options: ['A) alternative methods of protection from the Sun', 'B) the prevention of soil erosion by trees', 'C) how trees are good for our health', 'D) scientific research on deforestation', 'E) alternative methods of treating asthma'],
            answer: 'C',
            explanation: "Pasaj başlıktan itibaren ağaçların çevre ve özellikle insan sağlığına olan yararlarını anlatmaktadır. Fotosintezden asthma tedavisine, stres azaltmaya kadar birçok sağlık faydası vurgulanmıştır. Seçenek C pasajın ana fikrini en iyi şekilde özetlemektedir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "2- According to the author, dense forest can ........... .",
            options: ['A) be the best cure for asthma', 'B) protect us completely from the harmful rays of the Sun', 'C) increase pollution by only a small amount', 'D) lead to soil erosion as well as flooding', 'E) cause stress in certain types of personalities'],
            answer: 'B',
            explanation: "Pasajda açıkça 'dense forest can cut out all the harmful ultraviolet rays' ifadesi bulunmaktadır. Bu, yoğun ormanın güneşin zararlı ışınlarından bizi tamamen koruyabileceğini gösterir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "3- The passage tells us that the root systems of trees ......... .",
            options: ['A) help to preserve water', 'B) are the only means to prevent soil erosion', 'C) are affected worst in times of flooding', 'D) are used in certain medications to fight stress', 'E) have more benefits for humans than the green parts of trees'],
            answer: 'A',
            explanation: "Pasajda 'The root systems of trees play an important role in conserving water, as well as deterring soil erosion and flooding' denilmektedir. Bu ifade ağaç köklerinin su korunmasında yardımcı rol oynadığını göstermektedir."
          }
        ]
      },
      {
        baslik: '2. A COUNTRY WALK',
        metin: "We started our hike at the Usk Bridge From there, we walked around Park Farm and then a short distance along the Monmouthshire and Brecon Canal until we reached the old miners' path. We took this path and began to ascend the steep hillside. The path led to the summit and a pillar of rock, known locally as 'Lonely Shepherd'. From this point, we had a wonderful view over the Usk valley. After eating a hearty lunch, we descended back into the valley by the forest trail. Suddenly the black clouds overhead, which had been intimidating us with rain all day, rattled with thunder and the heavens opened. As the rain was torrential, we took shelter in an old shepherd's hut. Saturated with rain, we sat round chatting and waiting for the rain to ease, but the heavy rain continued to fall. Having no other option, we continued our hike, looking forward to a warm fire and a hot drink at the finish.",
        kelimeler: {
          'ascend': 'Tırmanmak, çıkmak',
          'steep': 'Dik, çok eğimli',
          'summit': 'Zirve, tepe',
          'descended': 'İnmek, alçalmak',
          'torrential': 'Sağanak, dökmek gibi yağan',
          'intimidating': 'Korkutan, tehdit eden',
          'shelter': 'Sığınak, barınak',
          'saturated': 'Islatılmış, tamamen ıslak'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "4- The significance of the 'Lonely Shepherd' mentioned in the passage was that .......... ",
            options: ['A) he gave the hikers shelter in his hut', 'B) it was the name of the mountain the hikers climbed', 'C) the hikers had a marvellous view from it', 'D) it was a very steep climb', 'E) it was named after a local shepherd'],
            answer: 'C',
            explanation: "'Lonely Shepherd' bir kaya sütunu (pillar of rock) olup, zirvenin adıdır. Pasajda 'From this point, we had a wonderful view over the Usk valley' denilmektedir. Bu yüzden önemli olan, bu yüksek noktadan harika bir manzara görmektir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "5- We understand from the passage that the hikers ate their lunch .............",
            options: ['A) on the banks of the Brecon Canal', 'B) in a shepherd\'s hut where they sheltered from the rain', 'C) in the valley on the way back to their camp', 'D) on the summit of the hill they climbed', 'E) very hastily in order not to be late'],
            answer: 'D',
            explanation: "Pasajda açıkça 'After eating a hearty lunch, we descended back into the valley by the forest trail' denilmektedir. Yani öğle yemeği yüksekten inişe geçmeden önce yenmiştir, yani zirvenin üzerindedir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "6- In the end, the hikers ............ ",
            options: ['A) arrived at a hut, where they found a warm fire and a hot drink', 'B) had to continue their walk despite the rain', 'C) decided to wait until the torrential rain was over', 'D) made a fire in the forest to dry their wet clothes', 'E) were caught in a thunder storm while still on the summit'],
            answer: 'B',
            explanation: "Pasajın sonunda 'Having no other option, we continued our hike, looking forward to a warm fire and a hot drink at the finish' denilmektedir. Bu, yağmura rağmen yollarına devam ettiklerini göstermektedir. Seçenek A sadece bir beklenti/umut (looking forward) iken seçenek B gerçekte neler yaptıklarını gösterir."
          }
        ]
      },
      {
        baslik: '3. A LONG WAY FROM HOME',
        metin: "A thousand bird watchers flocked to a coastal resort in October hoping to catch a glimpse of a rare bird spotted there. A Siberian blue robin, one of a number of birds from the East which have turned up at the Minsmere nature reserve recently as a result of extraordinary weather, has been seen in Britain for the first time in 25 years. The blue and white bird, which resembles a British robin, is thought to have been blown 10,000 miles off course from its usual wintering ground in China by freak weather. The last British sighting of the bird was in the Channel Islands of Sark, in 1975. Its more usual habitat is the area covered by the former Soviet Union, together with China, and Japan. The recent sighting has caused such a response because bird watchers now use extensive information technology to transmit information on sightings of rare birds.",
        kelimeler: {
          'flocked': 'Akın akın gelmek, çoğunluk halinde gelmek',
          'glimpse': 'Kısa göz atış, an için görme',
          'Siberian': 'Sibirya\'ya ait',
          'extraordinary': 'Olağanüstü, sıradışı',
          'freak weather': 'Anormal hava koşulları',
          'sighting': 'Görülme, gözleme',
          'resembles': 'Benzemek, benzer görünmek',
          'habitat': 'Yaşam alanı, habitat'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "7. The author identifies that the blue robin normally spends the winter ........ .",
            options: ['A) on the Minsmere nature reserve', 'B) being observed by thousands of bird watchers', 'C) in one particular coastal resort in Siberia', 'D) on the British island of Sark', 'E) in China, the former Soviet Union and Japan'],
            answer: 'E',
            explanation: "Pasajda 'Its more usual habitat is the area covered by the former Soviet Union, together with China, and Japan' denilmektedir. Bu, mavı miş kuşunun kışı normalde bu alanlarda geçirdiğini göstermektedir."
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "8. The reason given for the blue robin's appearance in the UK is .........",
            options: ['A) the newly developed nature reserve at Minsmere', 'B) unusual weather conditions experienced recently', 'C) the extraordinarily cold winters in Siberia this year', 'D) the strong winds on the coast of the Island of Sark', 'E) the destruction of its normal habitat in China'],
            answer: 'B',
            explanation: "Pasajda açıkça 'as a result of extraordinary weather' ve 'blown 10,000 miles off course...by freak weather' denilmektedir. Kuşun İngiltere'ye gelmesinin sebebi olağanüstü hava koşullarıdır."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "9. According to the passage, twenty-five years ago .........",
            options: ['A) some individuals from the blue robin species permanently settled in Britain', 'B) the Minsmere nature reserve was established by the British environmentalists', 'C) the blue robin was seen on a British island called Sark', 'D) several species of birds from the East began to migrate to Britain', 'E) a rare blue robin was spotted in England for the first time'],
            answer: 'C',
            explanation: "Pasajda 'has been seen in Britain for the first time in 25 years' ve 'The last British sighting of the bird was in the Channel Islands of Sark, in 1975' denilmektedir. 25 yıl önce (1975'te) mavı miş kuşu Sark'ta görülmüştür."
          }
        ]
      },
      {
        baslik: '4. HOW BORING IS FAKENHAM?',
        metin: "Dictionaries are clear about the meaning of 'boring' — \"causing boredom, tedious\". Boring means something so uninteresting and dull that sleep is the only escape. Fakenham in Norfolk, England, is a rural market town with roots in the printing industry and allegedly the most boring place in Britain. A local resident who let his controversial views loose on the Internet has whipped up a storm of protest from the majority of Fakenham's local people. At the time that the accusation appeared on an Internet page, newspapers and radio stations picked up the story. In retaliation, Fakenham had its own web site designed to explain the town's many virtues. In view of the information on this page, showing Fakenham as being steeped in history and with a remarkably clean river running through it, it seems an attractive place to visit. The riverside walks pass through wildflower meadows, where rare orchids grow in abundance and wildlife, such as the kingfisher, thrives. The town may lack a night club, which prompted the original accusation, but there is a new cinema, a bowling alley, a race course and plenty of pubs, cafes and antique shops. According to the owner of one of the cafes, The Dancing Goat, Fakenham is a wonderful little town and places are only as interesting or boring as people make them.",
        kelimeler: {
          'tedious': 'Sıkıcı, can sıkıcı',
          'allegedly': 'İddia edildiğine göre, söylendiğine göre',
          'controversial': 'Tartışmalı, uyuşmazlığa konu olan',
          'retaliation': 'Misilleme, intikam',
          'virtues': 'Erdemler, iyi özellikler',
          'steeped in history': 'Tarihle dolu, tarih içinde batmış',
          'thrives': 'Gelişir, başarılı olur, çiçek açar',
          'abundance': 'Bolluk, çokluk'
        },
        questions: [
          {
            type: 'Inference Question',
            icon: '💭',
            question: "10. From the statements given in the passage, it appears that Fakenham's own web site .........",
            options: ['A) hasn\'t been much appreciated by most of its residents', 'B) puts the most emphasis on its cafes in order to attract visitors', 'C) has been designed by one of its residents who really loves the town', 'D) has been visited by a lot of curious Internet users', 'E) has managed to arouse a liking in the author for the town'],
            answer: 'E',
            explanation: "Web sitesinin içeriğini gördükten sonra ('In view of the information on this page...it seems an attractive place to visit'), yazar şehri ilginç bulmuş gibi görünmektedir. Yazarın tutumu olumlu yöne döndüğünü bu açıklama gösterir."
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "11. Most residents of Fakenham .........",
            options: ['A) disagreed with the creator of the story on the Internet', 'B) think in the same way as one resident has explained on the radio', 'C) profited from the publicity of their town so extensively', 'D) published newspaper articles about the town\'s virtues', 'E) long for the past'],
            answer: 'E',
            explanation: "Bu soru pasaja göre yanıtlanmıştır."
          }
        ]
      }
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test2',
    baslik: 'Test2',
    aciklama: '4 pasaj · 21 soru · YDT Reading',
    pasajlar: [
      { baslik:'1. Artificial Respiration', metin:"Artificial respiration pumping the breath of life into the lungs of a victim of drowning, suffocation, electric shock or gas poisoning is one of the most vital of all first-aid procedures. Such emergencies are so frequent that it is quite possible to be confronted by one at any time. Mechanical devices do the job the lungs with pure oxygen, but such equipment is seldom available in the desperate three minutes in which the life can still be saved seconds count! Hence, life saving usually depends on some bystander who can perform artificial respiration with his own bare hands.", kelimeler:{'respiration':'solunum','drowning':'boğulma','suffocation':'asphyxie','vital':'kritik, hayati','emergencies':'acil durumlar','bystander':'tesadüfi bir şahıt, çevrede bulunan kişi','mechanical':'mekanik, makinesel','equipment':'donanım, ekipman','desperate':'çaresiz, umutsuz','bare hands':'çıplak eller'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"1. Emergencies requiring artificial respiration …..", options:['A) are not at all unusual','B) are the most common cases for first-aiders','C) can only be treated using mechanical devices','D) need a supply of pure oxygen','E) cannot be treated within three minutes'],answer:'A',explanation:"Metinde \"Such emergencies are so frequent that it is quite possible to be confronted by one at any time\" denilmektedir. Bu da acil durumların olağan/sık rastlanılan olaylar olduğunu gösterir. Cevap: A"},
          {type:'Inference Question',icon:'💭',question:"2. We can infer that speed is so important in giving artificial respiration that ….", options:['A) it is essential to keep mechanical ventilating devices at hand','B) most bystanders will give a hand if necessary','C) many lives are lost through wasting time','D) ventilating equipment cannot be used because it\'s too slow','E) there may not be enough time to get professional help'],answer:'E',explanation:"Metinde \"in the desperate three minutes in which the life can still be saved seconds count!\" ifadesi, zamanın çok kritik olduğunu gösterir. Bu nedenle profesyonel yardım alınması için yeterli zamanın olmayabileceği sonucu çıkarılabilir. Cevap: E"},
          {type:'Main Idea Question',icon:'🎯',question:"3. It is possible .....", options:['A) for bystanders to give artificial respiration even without training','B) for you to have to perform artificial respiration regularly','C) to save a victim\'s life with artificial respiration in three minutes','D) to give artificial respiration only if you have a mechanical device','E) to perform artificial respiration only with the use of pure oxygen'],answer:'C',explanation:"Metinde \"in the desperate three minutes in which the life can still be saved\" denilmektedir. Yani uygun yapılan suni respirasyonla üç dakika içinde hayat kurtarılabilir. Cevap: C"}
        ]
      },
      { baslik:'2. Winston Churchill and Enthusiasm', metin:"In enabling us to establish contacts with others, one quality has almost magical power the quality of enthusiasm. Winston Churchill, one of the enthusiastic men of our time, early distinguished himself as a newspaper correspondent in the Boer War. Most of his journalistic colleagues were older and more experienced; they regarded his repeated first-reports cynically, referring to him as \"that lucky devil, Churchill\" Lucky he was, beyond doubt, but what they did not perceive was the extent to which his luck was attracted by his matchless enthusiasm", kelimeler:{'enthusiasm':'coşku, heyecan','correspondent':'muhabir','Boer War':'Boer Savaşı','journalistic':'gazetecilik ile ilgili','colleagues':'meslektaş','cynically':'şüpheci bir şekilde','perceive':'fark etmek, anlamak','matchless':'eşsiz, benzersiz','distinguish':'başarı göstermek','magical':'sihirli, etkileyici'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"4. Although Winston Churchill had less experience than most of his colleagues,…..", options:['A) he was a more distinguished newspaper correspondent','B) he had a lot more luck than them','C) they admired his great enthusiasm','D) he regularly got news stories before them','E) they considered his first work to be good quality'],answer:'A',explanation:"Metinde \"early distinguished himself as a newspaper correspondent\" ifadesi Churchill'in daha genç olmasına rağmen kendini ayırt ettiğini gösterir. Onun meslektaşlarından daha fazla başarı elde ettiği söylenmektedir. Cevap: A"},
          {type:'Inference Question',icon:'💭',question:"5. Churchill's enthusiasm, according to the writer…..", options:['A) made up for his being young','B) was without parallel','C) came about because he was lucky','D) made his colleagues jealous','E) was due to his inexperience'],answer:'B',explanation:"Metinde \"matchless enthusiasm\" ifadesi kullanılmaktadır. Matchless eşsiz, benzersiz anlamına gelir. Ayrıca, yazar en başta \"one quality has almost magical power the quality of enthusiasm\" derken Churchill'in coşkusunun özel olduğunu vurgulamaktadır. Cevap: B"},
          {type:'Main Idea Question',icon:'🎯',question:"6. We can infer from the passage, that ….", options:['A) the quality of enthusiasm is closely linked to one\'s luck','B) Churchill was the best journalist during the Boer War','C) if you are inexperienced, you have to rely on luck','D) those without enthusiasm are never successful','E) it is only luck that distinguishes one journalist from another'],answer:'A',explanation:"Metinde yazar, Churchill'in şansının çoşkusu tarafından çekildiğini belirtir: \"but what they did not perceive was the extent to which his luck was attracted by his matchless enthusiasm\". Bu, çoşku ile şans arasında güçlü bir bağlantı olduğunu gösterir. Cevap: A"}
        ]
      },
      { baslik:'3. Modern Genius and Creativity', metin:"Why are there no Einsteins, Freuds or Picassos today? This is a troubling question despite the incredible speed of progress of our age. Scholars have long despaired of even defining genius, let alone identifying its magical ingredients. Now, through analyses of hundreds of history's finest thinkers, researchers are finally beginning to tease out the temperaments, personalities and styles of thought that characterize the Darwins, Mozarts and Napoleons of history. The investigation is more than a matter of curiosity: the new insights promise to help ordinary mortals become more creative, and to teach schools and parents how to nurture unusual intelligence.", kelimeler:{'troubling':'endişe verici, rahatsız edici','despaired':'umutsuzluğa kapılmak','defining':'tanımlamak','ingredients':'bileşenler, unsurlar','analyses':'analizler','tease out':'ortaya çıkarmak, ayıklamak','temperaments':'mizaçlar, kişilik özellikleri','characterize':'karakterize etmek, tanımlamak','nurture':'beslemek, yetiştirmek','mortals':'ölümlü insanlar'},questions:[
          {type:'Main Idea Question',icon:'🎯',question:"7. The aim in investigating geniuses in history is ….", options:['A) to train the young to keep up with the speed of progress today','B) to discover whether their abilities gave them unusual personalities','C) to satisfy the researchers\' curiosity about them','D) to assist the development of today\'s gifted children','E) to see if their lives followed any recognizable patterns'],answer:'D',explanation:"Metinin sonunda \"the new insights promise to help ordinary mortals become more creative, and to teach schools and parents how to nurture unusual intelligence\" ifadesi, araştırmanın amacının günümüzün yetenekli çocuklarının gelişimine yardımcı olmak olduğunu gösterir. Cevap: D"},
          {type:'Inference Question',icon:'💭',question:"8. Researchers are examining geniuses from the past ….", options:['A) in order to discover more about the way they lived','B) because they are curious about them','C) to find out if they had any common characteristics','D) as it has never been properly done before','E) so that they can compile accurate records about them'],answer:'C',explanation:"Metinde araştırmacılar \"teasing out the temperaments, personalities and styles of thought that characterize\" tarihteki dahi insanları incelemektedirler. Bu, ortak özellikleri bulmak amacıyla yapılmaktadır. Cevap: C"},
          {type:'Detail Question',icon:'🔍',question:"9. The writer finds it a contrast that ….", options:['A) we lack geniuses in this advanced age','B) creativity and intelligence are rarely found together','C) scholars can define genius but not identify it','D) despite analyses of hundreds of geniuses, the quality of genius cannot be explained','E) similar characteristics have been found in both artistic and scientific geniuses'],answer:'A',explanation:"Metinin başında \"Why are there no Einsteins, Freuds or Picassos today? This is a troubling question despite the incredible speed of progress of our age.\" denilmektedir. Yazar, çağımız çok ilerlemiş olmasına rağmen dahi insanların eksik olmasını garip bulmuştur. Cevap: A"}
        ]
      },
      { baslik:'4. Indian Carpet Industry', metin:"The city of Agra, India, is best known for the Taj Mahal, but it is also the birthplace of the Indian carpet industry. In the 1500s, the Mogul Emperor Akbar imported Persian weavers to establish rug making in the region. Soon Indian carpets caught the attention of the outer world. Today India rivals Iran for the largest share of the international carpet market. The booming business marks a rebound for the Indian carpet industry, which has been working in recent years to improve quality, while responding to international criticism regarding the use of child labour.", kelimeler:{'birthplace':'doğum yeri, kökenin yeri','imported':'ithal etti','weavers':'dokuyucu','rug making':'halı yapımı','region':'bölge','rivals':'rakip olmak, yarışmak','booming':'çok gelişmekte olan, hızla büyüyen','rebound':'toparlanma, tekrar yükselme','criticism':'eleştiri','regarding':'hakkında, ilgili'},
        questions:[
          {type:'Inference Question',icon:'💭',question:"10. It is implied in the passage that ….", options:['A) The Mogul emperor Akbar was himself Persian','B) before the 1500s, India imported carpets from Persia','C) during the sixteenth century, Agra was the capital city of India','D) the Indian carpet industry had been booming until recently','E) the Indian carpet industry is attempting to stop the use of child labour'],answer:'B',explanation:"Metinde Akbar'ın Pers dokuyucu ustalarını davet ettiği söylenmektedir. Bu, Hindistan'ın daha önceden halı konusunda deneyim ve üretim kapasitesinin olmadığını ve muhtemelen İran'dan ithal ettiğini ima etmektedir. Cevap: B"},
          {type:'Detail Question',icon:'🔍',question:"11. The Indian carpet industry ….", options:['A) uses designs and techniques developed in Persia','B) was founded through the use of Persian weavers','C) used to produce poor quality carpets','D) is the most successful in the world','E) is centred in Agra'],answer:'B',explanation:"Metinde açıkça \"the Mogul Emperor Akbar imported Persian weavers to establish rug making in the region\" denilmektedir. Hindistan halı endüstrisi Pers dokuyucuları aracılığıyla kurulmuştur. Cevap: B"},
          {type:'Main Idea Question',icon:'🎯',question:"12. We can conclude that India and Iran ….", options:['A) both use child labour in their carpet industries','B) were both part of the Mogul Empire','C) are the leaders in the world\'s carpet industry','D) used to have very close relations','E) rely on the carpet industry for their main sources of income'],answer:'C',explanation:"Metinde \"Today India rivals Iran for the largest share of the international carpet market\" denilmektedir. Her iki ülke de dünya halı piyasasında lider konumdadırlar. Cevap: C"}
        ]
      },
      { baslik:'5. Mountain Climbing Approaches', metin:"Modern alpinists try to climb mountains by a route which will give them good sport and the more difficult it is, the more highly it is regarded. In the pioneering days, however, this was not the case at all. The early climbers were looking for the easiest way to the top because the summit was the prize they sought, especially if it had never been attained before. It is true that during their explorations they often faced difficulties and dangers of the most perilous nature, equipped in a manner which would make a modern climber shudder at the thought but they did not go out of their way to court such excitement. They had a single aim, a solitary goal the top!", kelimeler:{'alpinists':'dağcılar','route':'rota, yol','pioneering':'öncü, ilk zamanlar','summit':'dağın tepesi','prize':'ödül, hedef','attained':'ulaşılmış, elde edilmiş','explorations':'keşifler','perilous':'tehlikeli','equipped':'donanımlı','shudder':'ürpermek, titremek'},
        questions:[
          {type:'Detail Question',icon:'🔍',question:"13. It is clear from the passage that the early climbers ….", options:['A) were more interested in the achievement than the sport','B) had equipment that was similar to that of modern climbers','C) did not attempt to climb mountains that had been climbed before','D) never tried to climb anything that was difficult','E) did not find mountain-climbing exciting'],answer:'A',explanation:"Metinde \"The early climbers were looking for the easiest way to the top because the summit was the prize they sought\" denilmektedir. Bu, onların spor eğlencesinden ziyade başarı elde etmeye odaklandığını gösterir. Cevap: A"},
          {type:'Detail Question',icon:'🔍',question:"14. According to the passage, modern climbers ….", options:['A) are not interested in reaching the summit','B) look down on the early climbers','C) do not like the thought of climbing the same mountains as the early climbers','D) prefer climbs which are more challenging','E) do not regard getting to the top as an achievement'],answer:'D',explanation:"Metinin ilk cümlesi açıktır: \"Modern alpinists try to climb mountains by a route which will give them good sport and the more difficult it is, the more highly it is regarded.\" Modern dağcılar zorluk arayan insanlardır. Cevap: D"},
          {type:'Inference Question',icon:'💭',question:"15. We can infer from the passage that ….", options:['A) early climbers were not as brave as modern ones','B) all the easy routes have previously been climbed','C) safe equipment is indispensable to a modern climber','D) early climbers faced more dangers than modern ones','E) modern climbers usually climb in the Alps'],answer:'D',explanation:"Metinde \"they often faced difficulties and dangers of the most perilous nature, equipped in a manner which would make a modern climber shudder at the thought\" denilmektedir. Bu, ilk dağcıların modern dağcılardan daha fazla tehlike ile karşı karşıya olduğunu gösterir. Cevap: D"}
        ]
      },
    ]
});

PARAGRAF_PAKETLERİ.push({
    id: 'pkg_test3',
    baslik: 'Test3',
    aciklama: '4 pasaj · 18 soru · YDT Reading',
    pasajlar: [
      { 
        baslik: '1. The Lucky Customer',
        metin: "All the housewives who went to the new supermarket had one great ambition: to be the lucky customer of the week. For several weeks Mrs. Edwards hoped, like many of her friends, to be the lucky customer. Unlike her friends, she never gave up hope. The cupboards in her kitchen were full of things which she did not need. One Friday morning, after she had finished her shopping and had taken it to her car, she found that she had forgotten to buy any tea. She dashed back to the supermarket, got the tea and went towards the cash desk. As she did so, she saw the manager of the supermarket approach her. \"Madam,\" he said, holding out his hand, \"I want to congratulate you! You are our lucky customer and everything you have in your basket is free!",
        kelimeler: {
          'ambition': 'hedef, amaç',
          'dashed': 'koştu, hızlıca gitti',
          'forgot': 'unuttu',
          'gave up': 'ümidini kesti, vazgeçti',
          'cupboards': 'dolap, şifonyer',
          'lucky': 'şanslı',
          'congratulate': 'tebrik etmek',
          'customer': 'müşteri'
        },
        questions: [
          {
            type: 'Inference Question',
            icon: '💭',
            question: "1. It is clear from the passage that .............",
            options: ['A) Mrs. Edwards always went to the supermarket on Friday morning', 'B) Mrs. Edwards used to go shopping with her friends', 'C) the housewives who went to the supermarket were all friends of Mrs. Edwards', 'D) Mrs. Edwards\' friends stopped thinking there was a possibility that they would win', 'E) Mrs. Edwards never shopped at any other supermarket'],
            answer: 'D',
            explanation: 'Pasajda "Unlike her friends, she never gave up hope" yazılı. Bu, arkadaşlarının ümidini kestiklerini, ama Mrs. Edwards\'in kesmeğini anlatır. Seçenek D bunu doğru şekilde ifade eder.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "2. The supermarket\'s prize would be .............",
            options: ['A) no charge for the items in the shopping basket at the time of paying', 'B) to receive a week\'s worth of free shopping', 'C) to go round the supermarket on a particular day and fill a basket with shopping, free of charge', 'D) certain goods, chosen by the supermarket, free of charge', 'E) to be able to shop in the supermarket, free of charge, for a week'],
            answer: 'A',
            explanation: 'Manager "everything you have in your basket is free" demiştir. Bu, şu anda sepete koyduğu eşyaların hiçbir ücret ödenmeden verilmesi anlamına gelir. Seçenek A bunu açıkça belirtir.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "3. The unfortunate point of the passage is that Mrs. Edwards.......",
            options: ['A) was not supported by her friends in her endeavours', 'B) only had one item in her basket on the day she won', 'C) had to make a second trip to the supermarket on Friday morning', 'D) failed to be the lucky customer for several weeks', 'E) had too much unnecessary stuff in her cupboards'],
            answer: 'C',
            explanation: 'Pasajda açıkça "she had forgotten to buy any tea. She dashed back to the supermarket" yazılıdır. Mrs. Edwards kazandığında sepetinde sadece çay vardı, bu da talihsiz bir durumdur çünkü başka şeyler alabilirdi.'
          }
        ]
      },
      { 
        baslik: '2. Modern Furniture Design',
        metin: "Although there are designs that have come in for a good deal of abuse, true modern furniture design is both simple and efficient. It aims at relating methods of construction to real needs. In Victorian times, however, design got out of touch with life. Needless ornamentation made us forget what furniture was really for. Modern design has stripped away all that is inessential. Its purpose is not to astonish, but to provide us with what is pleasing and useful. A piece of really fine modern furniture should never be seen in isolation, but as part of a setting. Only then can we judge its shape, colour, and utility.",
        kelimeler: {
          'abuse': 'kötüye kullanım, eleştiri',
          'efficient': 'verimli, etkili',
          'relating': 'ilişkilendirmek, bağlamak',
          'ornamentation': 'süsleme, dekorasyon',
          'stripped away': 'çıkarmak, temizlemek',
          'inessential': 'gerekli olmayan, önemsiz',
          'astonish': 'şaşırtmak, hayrete düşürmek',
          'isolation': 'izolasyon, yalıtım'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "4. According to the writer, good quality modern furniture ......",
            options: ['A) can not be judged by its shape and colour', 'B) has a lot of inessential ornamentation', 'C) amazes us because it is both pleasing and useful', 'D) has never been abused because of its design', 'E) can only be properly appreciated when it is placed in context'],
            answer: 'E',
            explanation: 'Pasajın sonunda "A piece of really fine modern furniture should never be seen in isolation, but as part of a setting. Only then can we judge its shape, colour, and utility" yazılıdır. Seçenek E bu bilgiyi doğru şekilde yansıtır.'
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "5. According to the passage, some modern furniture ........",
            options: ['A) is constructed in the same way as Victorian', 'B) only looks good when it\'s on its own', 'C) has received negative criticism', 'D) is not in touch with the needs of today', 'E) is too ornamental to be useful'],
            answer: 'C',
            explanation: 'Pasajın başında "Although there are designs that have come in for a good deal of abuse" yazılıdır. "Abuse" kötüye kullanım, yani olumsuz eleştiri anlamına gelir. Seçenek C bunu "negative criticism" şeklinde ifade eder.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "6. The writer states that Victorian furniture design ......",
            options: ['A) was decorated to a degree which distracted from its use', 'B) was appreciated for its efficiency and simplicity', 'C) was rarely useful and never pleasing', 'D) was ornamented in a way which was very pleasant', 'E) never included anything but the most essential features'],
            answer: 'A',
            explanation: 'Pasajda "Needless ornamentation made us forget what furniture was really for" yazılıdır. Gereksiz süslemeler metin aracılığıyla mobilyanın asıl amacını gölgeledi. Seçenek A bunu "distracted from its use" şeklinde doğru şekilde ifade eder.'
          }
        ]
      },
      { 
        baslik: '3. Suicide Methods and Statistics',
        metin: "Many people who commit suicide shoot themselves, usually with a handgun. Other common methods, in decreasing order of frequency, include drug overdose — primarily drugs prescribed by physicians — cutting and stabbing, jumping from high places, inhaling poisonous gas, hanging, and drowning. Experts believe that suicide statistics are grimmer than reported. They contend that numerous suicides are categorized as accidents, so as to spare families.",
        kelimeler: {
          'commit': 'işlemek, suç işlemek',
          'handgun': 'tabanca, silah',
          'overdose': 'aşırı doz',
          'decreasing': 'azalan, düşen',
          'jumping': 'atlama, sıçrama',
          'grimmer': 'daha kötü, daha korkunç',
          'contend': 'iddia etmek, savunmak',
          'categorized': 'sınıflandırılmış, kategorize edilmiş'
        },
        questions: [
          {
            type: 'Inference Question',
            icon: '💭',
            question: "7. We can conclude from the passage that ......",
            options: ['A) the commonest way of committing suicide is drug overdose', 'B) drowning is the least common way of committing suicide', 'C) jumping from high places is used less frequently than inhaling poisonous gas', 'D) non-prescription drugs are commonly used for committing suicide', 'E) in committing suicide, drug overdose ranks higher than shooting'],
            answer: 'B',
            explanation: 'Pasajda yöntemler "decreasing order of frequency" (azalan sıklık sırasında) verilmiştir: silah (en sık), uyuşturucu, kesme-bıçaklama, yüksekten atlama, zehirli gaz, asılma, boğulma (en az). Boğulma son sırada olduğu için en az kullanılan yöntemdir.'
          },
          {
            type: 'Inference Question',
            icon: '💭',
            question: "8. We can infer from the statement in the passage that ......",
            options: ['A) experts blame the increase in the suicide rate on families', 'B) gun ownership should be strictly controlled', 'C) physicians should be careful as to which medicine to prescribe', 'D) death in an accident is preferable for the families than by suicide', 'E) committing suicide is decreasing nowadays'],
            answer: 'D',
            explanation: 'Pasajda "numerous suicides are categorized as accidents, so as to spare families" yazılıdır. "Spare" anlamı aileleri korumak, incitmemektir. Bu da ailelerin için intihardan ziyade kaza olarak ölümün daha tercih edilebilir olduğunu gösterir.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "9. According to experts, ......",
            options: ['A) the rate of suicide is not as high as reported in the statistics', 'B) accidents are sometimes counted as suicides', 'C) families play an important part in the increase in the suicide rate', 'D) the suicide rate has reached a serious extent', 'E) suicide statistics do not reflect the actual rate'],
            answer: 'E',
            explanation: 'Pasajda "Experts believe that suicide statistics are grimmer than reported" ve "numerous suicides are categorized as accidents" yazılıdır. Bu da intihar istatistiklerinin asıl oranı yansıtmadığını gösterir. Seçenek E bunu doğru şekilde ifade eder.'
          }
        ]
      },
      { 
        baslik: '4. Packing and Moving',
        metin: "Unless you loathe the place you're leaving, packing to go is nothing but an entirely unpleasant experience. There is never, on any occasion, enough time. The whole operation is at first wisely and efficiently planned, with careful attention to detail. Several days in advance the first steps are taken. Old letters are read again and many are laid aside for destruction. Letters with the new address are written to friends. You find yourself struggling with something till the last minute, but still feel as if you should be doing more. But how really enjoyable is the unpacking to stay that follows! For there is now limitless time in which to make a new and delightful home.",
        kelimeler: {
          'loathe': 'nefret etmek, tiksinmek',
          'packing': 'paketleme, hazırlama',
          'wisely': 'bilgeçe, akıllıca',
          'efficiently': 'verimli, etkili',
          'detail': 'detay, ayrıntı',
          'laid aside': 'ayırmak, bir yana koymak',
          'unpacking': 'paketi açmak, açılı',
          'limitless': 'sınırsız, ücretsiz'
        },
        questions: [
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "10. The writer states that planning your move well in advance ......",
            options: ['A) gives you plenty of time to enjoy reading your old letters again', 'B) means that the whole operation can be carried out efficiently', 'C) doesn\'t prevent you from having last minute work to do', 'D) is advisable if you have a lot of friends requiring your change of address', 'E) turns an unpleasant experience into an enjoyable one'],
            answer: 'C',
            explanation: 'Pasajda "The whole operation is at first wisely and efficiently planned" ama sonra "You find yourself struggling with something till the last minute" yazılıdır. Yani önceden planlama yapılsa bile son dakika işi kalabiliyor. Seçenek C bunu doğru şekilde ifade eder.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "11. The writer finds unpacking enjoyable because ......",
            options: ['A) his new house is more delightful than the old', 'B) he has at last thrown out all his old letters', 'C) he loathed the house he left', 'D) time is not restricted', 'E) it shows the struggle involved in packing efficiently was worthwhile'],
            answer: 'D',
            explanation: 'Pasajda "how really enjoyable is the unpacking to stay that follows! For there is now limitless time in which to make a new and delightful home" yazılıdır. Yazarın açılımı keyifli bulmasının sebebi zamanın sınırsız olmasıdır.'
          },
          {
            type: 'Detail Question',
            icon: '🔍',
            question: "12. According to the writer, packing to move ......",
            options: ['A) can only be efficiently handled if enough time is taken', 'B) should not be left to the last minute', 'C) has to be done step by step', 'D) must not be started before letters advising the change of address have been sent', 'E) can only be pleasant if you hate your old house'],
            answer: 'A',
            explanation: 'Pasajda "There is never, on any occasion, enough time" yazılı. Aynı zamanda "The whole operation is at first wisely and efficiently planned" ama yeterli zaman olmadığı için etkili gerçekleştirilemiyor. Seçenek A bunu doğru şekilde ifade eder.'
          }
        ]
      },
      { 
        baslik: '5. Imagination and Memory',
        metin: "Imagination is the capacity to form mental pictures of past experiences or to create mental pictures of situations or conditions that have not actually been experienced. The first kind is reproductive imagination; the second is productive, or creative, imagination. Imagining is closely related to remembering, but remembering always refers to past events, and so cannot be creative. Remembering involves the quality of recognition that is often absent in the process of imagination. Imagination is an important ability. It enables people to span the past and the future, and is useful to both the enjoyment and creation of art. Imagination is essential in science and everyday life.",
        kelimeler:{'imagination':'hayal gücü','reproductive':'yeniden üretken','creative':'yaratıcı','capacity':'kapasite','recognition':'tanıma','span':'kapsamak','essential':'temel, gerekli','experiences':'deneyimler'},
        questions:[
          {type:'Main Idea Question',icon:'🎯',question:"18- The passage is mainly about ------.",options:['A) the difference between memory and imagination','B) how imagination helps in art creation','C) what imagination is and how it relates to memory','D) the types of memory humans possess','E) why imagination is more important than memory'],answer:'C',explanation:"Pasaj hayal gücünün ne olduğunu ve bellekle ilişkisini açıklamaktadır. C doğru."}
        ]
      }
    ]
});

function showImportParagrafModal() { const overlay = document.createElement('div'); overlay.id = 'paragraf-import-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;'; const paketler = PARAGRAF_PAKETLERİ.map(pk => { const yuklu = pk.pasajlar.filter(p => { const k = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`; return window.paragrafSorular && window.paragrafSorular[k];
        }).length;
        const tamam = yuklu===pk.pasajlar.length;
        return `<div style="background:var(--white);border:1.5px solid ${tamam?'#22c55e':'var(--border)'};border-radius:14px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div><div style="font-size:.88rem;font-weight:800;color:var(--ink);">${pk.baslik}</div>
            <div style="font-size:.74rem;color:var(--ink3);margin-top:3px;">${pk.aciklama}</div>
            ${tamam?'<div style="font-size:.7rem;color:#22c55e;font-weight:700;margin-top:4px;">✅ Tümü yüklendi</div>':yuklu>0?`<div style="font-size:.7rem;color:#f59e0b;font-weight:700;margin-top:4px;">⚡ ${yuklu}/${pk.pasajlar.length} yüklendi</div>`:''}</div>
            <button onclick="importParagrafPaketi('${pk.id}',this)" style="padding:8px 18px;border-radius:9px;border:none;background:${tamam?'#dcfce7':'linear-gradient(135deg,#10b981,#059669)'};color:${tamam?'#16a34a':'#fff'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
                ${tamam?'↺ Yeniden':'📖 Yükle'}</button></div>`;
    }).join('');
    overlay.innerHTML = `<div style="background:var(--bg,#f8f8f8);border-radius:18px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div style="font-size:1rem;font-weight:900;color:var(--ink);">📖 Paragraf Paketi Yükle</div>
            <button onclick="document.getElementById('paragraf-import-overlay').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--ink3);">✕</button>
        </div>${paketler}
        <div style="font-size:.72rem;color:var(--ink3);text-align:center;margin-top:12px;">Yüklenen pasajlar Paragraf Okuma ve Soru Bankası'nda görünür.</div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

function importParagrafPaketi(paketId, btn) {
    const pk = PARAGRAF_PAKETLERİ.find(p => p.id === paketId);
    if (!pk) return;
    if (typeof paragraflar === 'undefined') window.paragraflar = [];
    window.paragrafSorular = window.paragrafSorular || {};
    pk.pasajlar.forEach(p => {
        const key = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`;
        const already = paragraflar.findIndex(x => `p_${(x.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(x.metin||'').length}` === key);
        const entry = { baslik:p.baslik, metin:p.metin, kelimeler:p.kelimeler||{}, savedAt: already===-1 ? Date.now() : (paragraflar[already].savedAt || Date.now()) };
        if (already===-1) paragraflar.push(entry); else paragraflar[already]=entry;
        window.paragrafSorular[key] = { baslik:p.baslik, savedAt:new Date().toISOString(), questions:p.questions };
    });
    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    if (window._saveData) window._saveData();
    else localStorage.setItem('ydt_paragraf_sorular', JSON.stringify(window.paragrafSorular));
    if (typeof renderAdminParagrafListe==='function') renderAdminParagrafListe();
    btn.textContent='✅ Yüklendi!'; btn.style.background='#dcfce7'; btn.style.color='#16a34a';
    setTimeout(() => { const ov=document.getElementById('paragraf-import-overlay'); if(ov) ov.remove(); renderArsiv(); }, 900);
}

window.showImportSorularModal  = showImportSorularModal;
window.importSoruPaketi        = importSoruPaketi;
window.showImportParagrafModal = showImportParagrafModal;
window.importParagrafPaketi    = importParagrafPaketi;

// ══════════════════════════════════════════════
// 🤖 AI GÜNLÜK PARAGRAFLAR
// ══════════════════════════════════════════════

const AI_DAILY_TOPICS = [
    'space exploration and colonization',
    'climate change and renewable energy',
    'artificial intelligence in healthcare',
    'ancient civilizations and archaeology',
    'ocean biodiversity and marine biology',
    'quantum computing and its applications',
    'the history of human language evolution',
    'psychology of decision making',
    'sustainable architecture and urban design',
    'deep sea creatures and bioluminescence',
    'the science of memory and forgetting',
    'ethical dilemmas in modern medicine',
    'the economics of happiness',
    'neuroscience of creativity',
    'history of the printing press and knowledge'
];

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "2025-02-26"
}

async function generateAIDailyParagraflar(force) {
    const todayKey = getTodayKey();
    const cacheKey = `ydt_ai_daily_${todayKey}`;
    const listEl = document.getElementById('ai-daily-paragraf-list');
    const badgeEl = document.getElementById('ai-daily-date-badge');
    if (badgeEl) {
        const [y,m,d] = todayKey.split('-');
        badgeEl.textContent = `${d}.${m}.${y}`;
    }

    // Cache check
    if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                renderAIDailyParagraflar(JSON.parse(cached), listEl);
                return;
            } catch(e) {}
        }
    }

    // Determine API key
    let apiKey = null;
    for (const p of (window.AI_PROVIDERS || [])) {
        const k = localStorage.getItem(p.lsKey);
        if (k && !k.startsWith('●') && (p.id === 'openai' || p.id === 'gemini' || p.id === 'claude')) {
            apiKey = { key: k, provider: p.id };
            break;
        }
    }

    if (!listEl) return;
    // Grid görünür olsun (openReadingHub zaten açtı ama güvence olarak)
    if (listEl.style.display === 'none') listEl.style.display = 'grid';
    listEl.innerHTML = `<div style="text-align:center;padding:32px 16px;color:var(--ink3);font-size:.82rem;grid-column:1/-1;">
        <div style="font-size:2rem;margin-bottom:10px;">✨</div>
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px;">AI paragraflar oluşturuluyor...</div>
        <div>C1/C2 seviyesinde 3 özgün paragraf hazırlanıyor</div>
    </div>`;

    // Pick 3 random topics seeded by date
    const seed = todayKey.split('-').reduce((a,b)=>a+parseInt(b),0);
    const shuffled = [...AI_DAILY_TOPICS].sort(()=>(Math.sin(seed)*10000)%1 - 0.5);
    const topics = shuffled.slice(0, 3);

    const prompt = `You are an expert English language teacher creating C1/C2 level reading passages for Turkish students preparing for YDT (university entrance exam).

Create exactly 3 reading passages in JSON format. Each passage should:
- Be about a different topic: ${topics.join(', ')}
- Be 120-180 words long
- Use sophisticated C1/C2 vocabulary
- Be engaging and informative
- Have a clear topic sentence

Respond ONLY with valid JSON, no explanation:
{
  "passages": [
    {
      "title": "Short descriptive title (no numbers)",
      "topic": "topic name",
      "text": "The full passage text...",
      "vocabulary": {
        "word1": "Turkish translation",
        "word2": "Turkish translation"
      }
    }
  ]
}

Include 8-10 key vocabulary words per passage with their Turkish translations. Keep vocabulary entries as single words or short phrases that appear in the text.`;

    try {
        let passages = null;

        // Try using the app's AI cascade
        if (typeof getAIResponse === 'function') {
            const raw = await getAIResponse(prompt, { maxTokens: 2000, json: true });
            const cleaned = (raw || '').replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            passages = parsed.passages;
        } else {
            // Fallback: use fetch directly if Claude API available (from anthropic_api_in_artifacts context)
            throw new Error('no_ai');
        }

        if (!passages || !passages.length) throw new Error('empty');

        localStorage.setItem(cacheKey, JSON.stringify(passages));
        renderAIDailyParagraflar(passages, listEl);

    } catch(err) {
        // Fallback: show curated static passages for today based on day seed
        const fallbackPassages = getStaticDailyPassages(topics);
        renderAIDailyParagraflar(fallbackPassages, listEl);
    }
}

function getStaticDailyPassages(topics) {
    // A small set of curated C1/C2 passages to show when no AI key is available
    const pool = [
        {
            title: "The Deep Ocean Frontier",
            topic: "ocean biodiversity",
            text: "The deep ocean remains one of Earth's least explored environments, with scientists estimating that less than twenty percent of the seafloor has been comprehensively mapped. At depths exceeding two thousand metres, where sunlight cannot penetrate, entire ecosystems thrive in perpetual darkness, sustained by hydrothermal vents that release superheated, mineral-rich water into the frigid abyss. These extreme environments harbour organisms with extraordinary adaptations, including bioluminescent creatures that generate their own light through chemical reactions, and pressure-resistant proteins that allow cells to function under crushing atmospheric conditions. Recent expeditions employing autonomous underwater vehicles have revealed sprawling bacterial mats, giant tube worms, and previously unknown species of fish exhibiting transparent bodies. Scientists argue that understanding these isolated ecosystems may yield invaluable insights into the origins of life on Earth and the potential for life on other planetary bodies.",
            vocabulary: { "penetrate": "nüfuz etmek", "perpetual": "sürekli", "hydrothermal": "hidrotermal", "harbour": "barındırmak", "bioluminescent": "biyolüminesan", "autonomous": "otonom", "sprawling": "geniş alana yayılan", "invaluable": "paha biçilmez", "abyss": "uçurum/derin boşluk", "frigid": "buz gibi soğuk" }
        },
        {
            title: "Rethinking Urban Spaces",
            topic: "sustainable architecture",
            text: "Contemporary urban planners are increasingly abandoning the car-centric designs that dominated twentieth-century city development, recognising that prioritising pedestrians and cyclists significantly enhances residents' quality of life. The concept of the fifteen-minute city — where all essential services, workplaces, and recreational facilities are accessible within a quarter-hour walk or cycle ride — has gained remarkable traction among progressive municipalities. Cities such as Paris and Melbourne have piloted ambitious programmes to reclaim road space, replacing car lanes with expanded pavements, cycle paths, and pocket parks. Research consistently demonstrates that reduced traffic noise and improved air quality correlate with measurable decreases in anxiety and depression among urban populations. Critics, however, caution that such transformations risk displacing lower-income residents as property values rise in newly pedestrianised neighbourhoods, raising urgent questions about equitable access to the redesigned city.",
            vocabulary: { "abandoning": "terk etmek", "prioritising": "önceliklendirmek", "traction": "ilgi/destek", "municipalities": "belediyeler", "ambitious": "hırslı/iddialı", "correlate": "ilişkilendirmek", "displacing": "yerinden etmek", "equitable": "hakkaniyetli", "pedestrianised": "yayalaştırılmış", "reclaim": "geri kazanmak" }
        },
        {
            title: "Memory's Imperfect Architecture",
            topic: "psychology of memory",
            text: "Contrary to popular belief, human memory does not function like a video recorder faithfully capturing events for later retrieval. Each act of remembering is, in fact, a reconstructive process during which the brain pieces together fragments of experience, filling gaps with inference and expectation. This malleability makes memory susceptible to distortion — a phenomenon extensively documented by psychologist Elizabeth Loftus, whose landmark studies demonstrated that witnesses could be induced to remember events that never occurred simply through the introduction of misleading post-event information. The therapeutic implications are profound: patients undergoing certain trauma therapies may inadvertently construct elaborate false memories of abuse or catastrophic events. Neuroscientists identify the hippocampus as central to memory consolidation, yet stress hormones such as cortisol can disrupt this structure's functioning, explaining why traumatic experiences are sometimes encoded in fragmented, non-linear ways that resist conventional narrative recall.",
            vocabulary: { "retrieval": "geri çağırma", "reconstructive": "yeniden yapılandırıcı", "malleability": "şekillendirilebilirlik", "susceptible": "duyarlı/yatkın", "distortion": "çarpıtma", "inadvertently": "farkında olmadan", "consolidation": "pekiştirme", "fragmented": "parçalanmış", "inference": "çıkarım", "elaborate": "ayrıntılı" }
        }
    ];
    return pool.slice(0, 3);
}

// ── AI Pasaj Arşivi ──────────────────────────────
// Arşivde saklanan pasajlar: localStorage 'ydt_ai_pasaj_arsiv' key'i
// Format: [{title, text, vocabulary, savedAt, topic}, ...]
function getAIPasajArsiv() {
    try { return JSON.parse(localStorage.getItem('ydt_ai_pasaj_arsiv') || '[]'); } catch(e) { return []; }
}
function saveAIPasajToArsiv(passage) {
    const arsiv = getAIPasajArsiv();
    const exists = arsiv.findIndex(x => x.title === passage.title);
    if (exists >= 0) return false; // zaten var
    arsiv.unshift({ ...passage, savedAt: Date.now() });
    // Max 100 pasaj sakla
    if (arsiv.length > 100) arsiv.length = 100;
    localStorage.setItem('ydt_ai_pasaj_arsiv', JSON.stringify(arsiv));
    return true;
}
function isAIPasajArşivde(title) {
    return getAIPasajArsiv().some(x => x.title === title);
}
window.saveAIPasajToArsiv   = saveAIPasajToArsiv;
window.getAIPasajArsiv      = getAIPasajArsiv;
window.isAIPasajArşivde     = isAIPasajArşivde;

function renderAIDailyParagraflar(passages, listEl) {
    if (!listEl || !passages || !passages.length) return;
    const icons = ['🌍','🔬','🧠','🎭','🌿','⚗️'];

    const buildCard = (p, i) => {
        const vocEntries = Object.entries(p.vocabulary || {});
        const vocPills   = vocEntries.slice(0, 5).map(([eng, tr]) =>
            `<span class="rh2-pill rh2-pill-voc" title="${tr}">${eng}</span>`).join('');
        const totalWords = p.text.trim().split(/\s+/).length;
        const readMin    = Math.ceil(totalWords / 180);
        const vocCount   = vocEntries.length;
        const sentences  = p.text.match(/[^.!?]+[.!?]+/g) || [];
        const preview    = sentences.slice(0, 2).join(' ').trim() || p.text.slice(0, 140) + '…';
        const arşivde    = isAIPasajArşivde(p.title);

        return `<div class="rh2-card" id="ai-card-${i}">
            <div class="rh2-card-accent rh2-card-accent-ai"></div>
            <div class="rh2-card-body" onclick="openAIDailyParagraf(${i})" style="cursor:pointer;">
                <div class="rh2-card-header">
                    <div class="rh2-card-icon rh2-card-icon-ai">${icons[i % icons.length]}</div>
                    <div class="rh2-card-titlemeta">
                        <div class="rh2-card-title">${p.title}</div>
                        <div class="rh2-card-timing">⏱ ${readMin} dk · ${totalWords} kelime · ${sentences.length} cümle</div>
                    </div>
                </div>
                <div class="rh2-card-preview">${preview}</div>
                <div class="rh2-card-footer">
                    ${vocCount > 0 ? `<span class="rh2-pill rh2-pill-word">📖 ${vocCount} kelime</span>` : ''}
                    <span class="rh2-pill rh2-pill-ai">🤖 AI Üretim</span>
                    ${vocPills}
                </div>
            </div>
            <button class="rh2-card-save-btn ${arşivde ? 'saved' : ''}" 
                    id="ai-save-btn-${i}"
                    onclick="event.stopPropagation(); _saveAIPasaj(${i})"
                    title="${arşivde ? 'Arşivde' : 'Yüklü Pasajlara Ekle'}"
                    style="position:absolute;bottom:14px;right:14px;">
                ${arşivde ? '✅ Arşivde' : '📥 Arşive Ekle'}
            </button>
        </div>`;
    };

    listEl.innerHTML = passages.map(buildCard).join('');
    window._aiDailyPassages = passages;
    _updateRh2HeroStats();
}

function _saveAIPasaj(index) {
    const passages = window._aiDailyPassages;
    if (!passages || !passages[index]) return;
    const p = passages[index];

    const saved = saveAIPasajToArsiv(p);
    const btn   = document.getElementById(`ai-save-btn-${index}`);

    if (!saved) {
        if (btn) { btn.textContent = '✅ Arşivde'; btn.classList.add('saved'); }
        return;
    }

    // paragraflar listesine de ekle (Yüklü Pasajlar tab'ında görünsün)
    // Yeni kaydedilenler listenin BAŞINA eklenir → yeni→eski sırası
    const tempP = { baslik: p.title, metin: p.text, kelimeler: p.vocabulary || {}, _aiSaved: true, savedAt: Date.now() };
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    if (exists < 0) paragraflar.unshift(tempP); // unshift: başa ekle

    // LocalStorage'a da yaz (kalıcı)
    const allParagraflar = JSON.parse(localStorage.getItem('ydt_paragraflar') || '[]');
    if (!allParagraflar.find(x => x.baslik === p.title)) {
        allParagraflar.unshift(tempP); // unshift: başa ekle → yeni→eski sırası
        localStorage.setItem('ydt_paragraflar', JSON.stringify(allParagraflar));
    }

    // Firebase Realtime DB'ye kaydet
    if (typeof _syncParagraflarToFirebase === 'function') {
        _syncParagraflarToFirebase();
    } else if (window._currentUser?.uid && window.db) {
        (async () => {
            try {
                const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
                const uid = window._currentUser.uid;
                await set(ref(window.db, `ydt_users/${uid}/paragraflar`), paragraflar);
            } catch(e) { console.warn('[_saveAIPasaj] Firebase yazma hatası:', e.message); }
        })();
    }

    if (btn) {
        btn.textContent = '✅ Arşivde';
        btn.classList.add('saved');
        btn.disabled = true;
    }

    // Badge güncelle
    const cnt = document.getElementById('reading-hub-saved-count');
    if (cnt) cnt.textContent = `${paragraflar.length} pasaj`;

    _showToast('📥 Pasaj arşive eklendi!', 'success');
}
window._saveAIPasaj = _saveAIPasaj;


function openAIDailyParagraf(index) {
    const passages = window._aiDailyPassages;
    if (!passages || !passages[index]) return;
    const p = passages[index];

    // Build a temporary paragraf object and show it
    const tempP = {
        baslik: p.title,
        metin: p.text,
        kelimeler: p.vocabulary || {}
    };

    // Push to paragraflar temporarily if not exists
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    let idx;
    if (exists >= 0) {
        idx = exists;
    } else {
        paragraflar.push(tempP);
        idx = paragraflar.length - 1;
    }

    showParagrafOku(idx);
}

// showParagrafListesi is already defined above with hub support

// Global helper: Soru Bankası'ndan pasaj okuma moduna git
function goToPasajOku() {
    const baslik = window._currentPasajBaslik || '';
    if (!baslik) { showParagrafListesi(); return; }
    
    // paragraflar dizisinde ara
    let idx = paragraflar.findIndex(x => x.baslik === baslik);
    
    // Bulunamazsa açılmış paragrafSorular'dan metin ile paragraflar'a ekle
    if (idx < 0) {
        const pSorular = window.paragrafSorular || {};
        // tüm key'leri tara, baslik eşleşeni bul
        const matchKey = Object.keys(pSorular).find(k => (pSorular[k].baslik || '') === baslik);
        if (matchKey) {
            // paragraflar listesine yok mu diye bak (baslik'e göre)
            // Yüklü pasajlardan biri olabilir — yoksa sadece listesini göster
            showParagrafListesi();
            // Paneli aç, saved hub'ını göster  
            if (typeof openReadingHub === 'function') openReadingHub('saved');
            // Şimdi tekrar ara (showParagrafListesi populate etti)
            idx = paragraflar.findIndex(x => x.baslik === baslik);
        }
    }
    
    if (idx >= 0) {
        // showParagrafListesi hub sayfasını açar, sonra showParagrafOku okuma sayfasını
        showParagrafListesi();
        showParagrafOku(idx);
    } else {
        // Pasaj listede yok — en azından Paragraf sayfasını aç
        showParagrafListesi();
        if (typeof openReadingHub === 'function') openReadingHub('saved');
    }
}
window.goToPasajOku = goToPasajOku;

window.generateAIDailyParagraflar = generateAIDailyParagraflar;
window.openAIDailyParagraf = openAIDailyParagraf;

// ══════════════════════════════════════════════
// 🌐 ÇEVİRİ MODU (Hover any word)
// ══════════════════════════════════════════════
let _translateModeOn = false;
let _translateTooltip = null;
let _translateBound = false;

function toggleTranslateMode() {
    _translateModeOn = !_translateModeOn;
    const btn = document.getElementById('translate-mode-btn');
    const metinEl = document.getElementById('p-oku-metin');
    if (!btn || !metinEl) return;

    if (_translateModeOn) {
        btn.innerHTML = '🌐 Çeviri Modu: <span style="color:#10b981;">Açık</span>';
        btn.style.borderColor = '#10b981';
        btn.style.background = '#d1fae5';
        btn.style.color = '#059669';
        metinEl.style.cursor = 'crosshair';
        if (!_translateBound) {
            metinEl.addEventListener('mouseover', _onWordHover);
            metinEl.addEventListener('mouseout', _onWordOut);
            metinEl.addEventListener('click', _onWordClick);
            _translateBound = true;
        }
        // Create tooltip
        if (!_translateTooltip) {
            _translateTooltip = document.createElement('div');
            _translateTooltip.id = 'translate-hover-tip';
            _translateTooltip.style.cssText = 'position:fixed;background:#1e293b;color:#fff;padding:6px 13px;border-radius:9px;font-size:.8rem;font-weight:700;pointer-events:none;z-index:99999;opacity:0;transition:opacity 0.15s;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:260px;white-space:normal;text-align:center;display:none;';
            document.body.appendChild(_translateTooltip);
        }
    } else {
        btn.innerHTML = '🌐 Çeviri Modu: Kapalı';
        btn.style.borderColor = 'var(--border)';
        btn.style.background = 'var(--white)';
        btn.style.color = 'var(--ink3)';
        metinEl.style.cursor = '';
        if (_translateTooltip) { _translateTooltip.style.opacity = '0'; _translateTooltip.style.display = 'none'; }
    }
}

function _getWordFromEvent(e) {
    const el = e.target;
    if (el.classList.contains('c1-word')) return el.dataset.tr || null;
    if (el.classList.contains('p-sentence') || el === document.getElementById('p-oku-metin')) return null;
    return null;
}

let _hoverTimer = null;
function _onWordHover(e) {
    if (!_translateModeOn) return;
    clearTimeout(_hoverTimer);
    const el = e.target;
    
    // For c1-words, tooltip already shows via CSS - skip
    if (el.classList.contains('c1-word')) return;

    // For other text nodes, we need to detect the word under cursor
    // We'll use the selection/caretPosition approach
    _hoverTimer = setTimeout(() => {
        const word = _getWordAtPoint(e.clientX, e.clientY);
        if (word && word.length > 2 && /^[a-zA-Z]+$/.test(word)) {
            _showTranslateTip(word, e.clientX, e.clientY);
        }
    }, 300);
}

function _onWordOut(e) {
    if (!_translateModeOn) return;
    clearTimeout(_hoverTimer);
    if (_translateTooltip) {
        _translateTooltip.style.opacity = '0';
        setTimeout(() => { if (_translateTooltip) _translateTooltip.style.display = 'none'; }, 160);
    }
}

function _onWordClick(e) {
    if (!_translateModeOn) return;
    const el = e.target;
    if (el.classList.contains('c1-word')) return; // already handled
    if (el.classList.contains('p-sentence')) {
        // Don't intercept grammar x-ray unless translate mode
        e.stopPropagation();
    }
    const word = _getWordAtPoint(e.clientX, e.clientY);
    if (word && word.length > 2 && /^[a-zA-Z]+$/.test(word)) {
        _showTranslateTip(word, e.clientX, e.clientY, true);
        _fetchWordTranslation(word);
    }
}

function _getWordAtPoint(x, y) {
    try {
        let range;
        if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y);
            if (!pos) return null;
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
        } else if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(x, y);
        }
        if (!range) return null;
        range.expand('word');
        return range.toString().trim().replace(/[^a-zA-Z'-]/g, '');
    } catch(e) { return null; }
}

const _translationCache = {};
function _showTranslateTip(word, x, y, pinned) {
    if (!_translateTooltip) return;
    const cached = _translationCache[word.toLowerCase()];
    const p = paragraflar[currentParagrafIndex];
    const vocTr = p && p.kelimeler && p.kelimeler[word.toLowerCase()];
    
    const displayTr = vocTr || cached || '⏳ çeviriliyor...';
    _translateTooltip.innerHTML = `<span style="color:#94a3b8;font-size:.68rem;font-weight:600;">TR</span><br>${displayTr}`;
    _translateTooltip.style.display = 'block';
    _translateTooltip.style.left = Math.min(x + 10, window.innerWidth - 200) + 'px';
    _translateTooltip.style.top = Math.max(y - 50, 8) + 'px';
    _translateTooltip.style.opacity = '1';
}

async function _fetchWordTranslation(word) {
    const key = word.toLowerCase();
    if (_translationCache[key]) return;
    // Check vocab first
    const p = paragraflar[currentParagrafIndex];
    if (p && p.kelimeler && p.kelimeler[key]) {
        _translationCache[key] = p.kelimeler[key];
        return;
    }
    // Use AI if available
    _translationCache[key] = '⏳';
    try {
        if (typeof getAIResponse === 'function') {
            const tr = await getAIResponse(`Translate the English word "${word}" to Turkish. Reply with ONLY the Turkish translation(s), maximum 3 words, no explanation.`, { maxTokens: 20 });
            _translationCache[key] = tr.trim();
        } else {
            // Simple dictionary fallback (common words)
            const simple = {'the':'(belirli artikel)','and':'ve','or':'veya','but':'ama','for':'için','with':'ile','from':'dan/den','this':'bu','that':'şu/o','have':'sahip olmak','been':'olmak(geçmiş)','which':'hangi','were':'idi','are':'olmak','was':'idi','they':'onlar','their':'onların','more':'daha fazla','than':'dan daha','into':'içine','also':'ayrıca','such':'böyle','some':'bazı','when':'ne zaman','about':'hakkında','what':'ne','how':'nasıl','over':'üzerinde','can':'yapabilmek','has':'sahip olmak','use':'kullanmak','each':'her','new':'yeni','most':'en çok','make':'yapmak','like':'gibi/sevmek'};
            _translationCache[key] = simple[key] || '—';
        }
        // Update tooltip if still showing
        if (_translateTooltip && _translateTooltip.style.opacity === '1') {
            const tipContent = _translateTooltip.innerHTML;
            if (tipContent.includes('⏳')) {
                _translateTooltip.innerHTML = `<span style="color:#94a3b8;font-size:.68rem;font-weight:600;">TR</span><br>${_translationCache[key]}`;
            }
        }
    } catch(e) { _translationCache[key] = '—'; }
}

window.toggleTranslateMode = toggleTranslateMode;



// ══════════════════════════════════════════════
// 📦 OTOMATİK PARAGRAF PAKETİ YÜKLE
// Paragraflar boşsa tüm paketleri otomatik yükle
// ══════════════════════════════════════════════
function autoLoadParagrafPaketleri() {
    if (typeof PARAGRAF_PAKETLERİ === 'undefined' || !PARAGRAF_PAKETLERİ.length) return;
    if (typeof paragraflar === 'undefined') window.paragraflar = [];
    window.paragrafSorular = window.paragrafSorular || {};

    // Zaten yüklüyse tekrar yükleme
    if (paragraflar.length > 0) return;

    console.log('📦 Paragraf paketleri otomatik yükleniyor...');
    PARAGRAF_PAKETLERİ.forEach(pk => {
        if (!pk.pasajlar) return;
        pk.pasajlar.forEach(p => {
            const key = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`;
            const already = paragraflar.findIndex(x =>
                `p_${(x.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(x.metin||'').length}` === key
            );
            const entry = { baslik: p.baslik, metin: p.metin, kelimeler: p.kelimeler || {}, savedAt: already === -1 ? Date.now() : (paragraflar[already].savedAt || Date.now()) };
            if (already === -1) paragraflar.push(entry);
            else paragraflar[already] = entry;
            window.paragrafSorular[key] = {
                baslik: p.baslik,
                savedAt: new Date().toISOString(),
                questions: p.questions || []
            };
        });
    });

    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    localStorage.setItem('ydt_paragraf_sorular', JSON.stringify(window.paragrafSorular));
    console.log(`✅ ${paragraflar.length} pasaj yüklendi.`);
    if (typeof _populateParagrafListesi === 'function') _populateParagrafListesi();
    if (typeof _updateRh2HeroStats      === 'function') _updateRh2HeroStats();
}

// Sayfa yüklenince çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoadParagrafPaketleri);
} else {
    autoLoadParagrafPaketleri();
}

window.autoLoadParagrafPaketleri = autoLoadParagrafPaketleri;


// ════════════════════════════════════════════════════════
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
