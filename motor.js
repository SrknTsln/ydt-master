// ════════════════════════════════════════════════════
// motor.js  –  Tüm uygulama mantığı
// ════════════════════════════════════════════════════

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

function startStudy() {
    currentActiveList = document.getElementById('list-selector').value;
    if (!allData[currentActiveList] || !allData[currentActiveList].length) {
        _showAppToast('Liste boş veya seçili değil!'); return;
    }
    studyKnownSet.clear();
    studyAgainIdx = [];
    studyQueue    = allData[currentActiveList].map((_, i) => i);
    studyQueuePos = 0;
    studyIndex    = 0;
    startModule();
    showPage('study-page');
    _populateStudySwitcher();
    renderStudyCard();
}

function startStudyFromNav() {
    currentActiveList = document.getElementById('list-selector').value;
    if (!currentActiveList || !allData[currentActiveList] || !allData[currentActiveList].length) {
        navTo('index-page'); return;
    }
    startStudy();
}

// Study page topbar'daki liste switcher'ı doldur
function _populateStudySwitcher() {
    const sel = document.getElementById('study-list-switcher');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '';
    Object.keys(allData).forEach(name => {
        const opt = new Option(name, name);
        if (name.startsWith('📌 ')) opt.style.fontWeight = '800';
        sel.add(opt);
    });
    sel.value = currentActiveList || (Object.keys(allData)[0] || '');
}

// Liste switcher'dan yeni liste seç — kartı sıfırla
function switchStudyList(name) {
    if (!name || !allData[name] || !allData[name].length) {
        _showAppToast('Bu liste boş!'); 
        const sel = document.getElementById('study-list-switcher');
        if (sel) sel.value = currentActiveList;
        return;
    }
    currentActiveList = name;
    // Ana selector'ı da güncelle
    const mainSel = document.getElementById('list-selector');
    if (mainSel) mainSel.value = name;
    // Çalışmayı sıfırla
    studyKnownSet.clear();
    studyAgainIdx = [];
    studyQueue    = allData[name].map((_, i) => i);
    studyQueuePos = 0;
    studyIndex    = 0;
    renderStudyCard();
    showAIToast(`📚 ${name}`, 'info', 1500);
}

function renderStudyCard() {
    const list  = allData[currentActiveList];
    const total = studyQueue.length;
    const pos   = studyQueuePos;
    studyIndex  = studyQueue[pos];
    const w     = list[studyIndex];

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
    document.getElementById('study-list-tag').innerText = currentActiveList;
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
        const result = await aiCall(prompt);
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
        listEl.innerHTML = '<div style="font-size:.75rem;color:#ef4444;padding:4px 0;">❌ Cümle üretilemedi.</div>';
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
    studyKnownSet.add(studyQueue[studyQueuePos]);
    // SM-2 hafif puan
    const w = allData[currentActiveList][studyQueue[studyQueuePos]];
    w.correctStreak = (w.correctStreak || 0) + 1;
    w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
    studyAdvance();
}

function studyMarkAgain() {
    const idx = studyQueue[studyQueuePos];
    studyKnownSet.delete(idx);
    if (!studyAgainIdx.includes(idx)) studyAgainIdx.push(idx);
    // hafif ceza
    const w = allData[currentActiveList][idx];
    w.errorCount    = (w.errorCount || 0) + 1;
    w.correctStreak = 0;
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
    studyQueue    = allData[currentActiveList].map((_, i) => i);
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


async function renderBankStats() {
    if (!_grammarSorulariReady) {
        await new Promise(r => { const t = setInterval(() => {
            if (_grammarSorulariReady) { clearInterval(t); r(); }
        }, 50); });
    }
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
    Object.values(allData).forEach(list => {
        if (!Array.isArray(list)) return;
        list.forEach(w => {
            if (!w.sm2_next || w.sm2_next <= now) count++;
        });
    });
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
    Object.values(allData).forEach(list => {
        if (!Array.isArray(list)) return;
        list.forEach(w => {
            if (!w.sm2_next || w.sm2_next <= now) words.push(w);
        });
    });
    return words.sort(() => Math.random() - 0.5);
}

function getNextSM2DateStr() {
    let minNext = Infinity;
    Object.values(allData).forEach(list => {
        if (!Array.isArray(list)) return;
        list.forEach(w => {
            if (w.sm2_next && w.sm2_next > Date.now()) minNext = Math.min(minNext, w.sm2_next);
        });
    });
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
    const hasKey = true; // Puter.js her zaman mevcut
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
    const hasKey = true; // Puter.js her zaman mevcut
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
// GRAMMAR_SORULARI — dışa taşındı → /data/grammar-sorulari.json
let GRAMMAR_SORULARI = [];
let _grammarSorulariReady = false;
(async function _loadGrammarSorulari() {
    try {
        const r = await fetch('./data/grammar-sorulari.json');
        GRAMMAR_SORULARI = await r.json();
        _grammarSorulariReady = true;
    } catch(e) {
        console.warn('[motor] grammar-sorulari.json yüklenemedi:', e.message);
    }
})();

// Gramer sorularını aiGramerArsiv'e yükle (localStorage'da yoksa)
window.aiGramerArsiv = (function() {
    const saved = JSON.parse(localStorage.getItem('ydt_gramer_arsiv') || '[]');
    if (saved.length > 0) return saved;
    // GRAMMAR_SORULARI henüz fetch ile yükleniyor — _initGramerArsiv tamamlaninca doldurulur
    return [];
})();
// GRAMMAR_SORULARI yüklenince aiGramerArsiv'i doldur (ilk kez)
(async function _initGramerArsiv() {
    if (window.aiGramerArsiv.length > 0) return;
    await new Promise(r => { const t = setInterval(() => {
        if (_grammarSorulariReady) { clearInterval(t); r(); }
    }, 50); });
    const saved = JSON.parse(localStorage.getItem('ydt_gramer_arsiv') || '[]');
    if (saved.length > 0) { window.aiGramerArsiv = saved; return; }
    window.aiGramerArsiv = GRAMMAR_SORULARI.map(s => ({
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
    // UKM listelerini yenile
    if (typeof ukmRefresh === 'function') {
        ukmRefresh();
        if (typeof ukmRefreshAddTab === 'function') ukmRefreshAddTab();
    }
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

    const total      = paragraflar.length;
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

        // Kartlar
        for (let i = startIdx; i < endIdx; i++) {
            html += _buildPasajKartHTML(paragraflar[i], i);
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
    const aiList      = document.getElementById('ai-daily-paragraf-list');
    const savedList   = document.getElementById('paragraf-listesi-kutu');
    const generatePnl = document.getElementById('ai-generate-panel');
    const refreshBtn  = document.getElementById('ai-daily-refresh-btn');
    const tabAI       = document.getElementById('rh-tab-ai');
    const tabSaved    = document.getElementById('rh-tab-saved');
    const tabGen      = document.getElementById('rh-tab-generate');

    // Tab aktif durumu
    [tabAI, tabSaved, tabGen].forEach(el => { if (el) { el.classList.remove('rh-tab-active', 'rh2-tab-active'); } });
    if (type === 'ai'       && tabAI)   { tabAI.classList.add('rh-tab-active', 'rh2-tab-active'); }
    if (type === 'saved'    && tabSaved){ tabSaved.classList.add('rh-tab-active', 'rh2-tab-active'); }
    if (type === 'generate' && tabGen)  { tabGen.classList.add('rh-tab-active', 'rh2-tab-active'); }

    // Panel görünürlüğü
    if (aiList)      aiList.style.display      = (type === 'ai')       ? 'grid' : 'none';
    if (savedList)   savedList.style.display   = (type === 'saved')    ? 'grid' : 'none';
    if (generatePnl) generatePnl.style.display = (type === 'generate') ? 'block' : 'none';
    if (refreshBtn)  refreshBtn.style.display  = (type === 'ai')       ? 'flex' : 'none';

    if (type === 'ai')       { generateAIDailyParagraflar(false); }
    else if (type === 'saved')    { _populateParagrafListesi(); }
    else if (type === 'generate') { _aigInitTopics(); }
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
        id: 'puter', name: 'Puter.js (GPT-4o)', icon: '🆓',
        lsKey: 'ydt_puter_enabled',  // her zaman true sayılır
        note: 'Ücretsiz · API key gerektirmez · GPT-4o',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            if (typeof puter === 'undefined' || !puter?.ai?.chat) throw new Error('puter_not_loaded');
            const resp = await puter.ai.chat(
                [{ role: 'system', content: 'You must respond with valid JSON only. No markdown, no explanation.' },
                 { role: 'user',   content: prompt }],
                { model: 'gpt-4o-mini' }
            );
            // response.message.content: string (GPT) veya array (Claude)
            const content = resp?.message?.content;
            const raw = Array.isArray(content) ? (content[0]?.text || '') :
                        (typeof content === 'string' ? content :
                        (typeof resp === 'string' ? resp : ''));
            const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (!match) throw new Error('Puter: JSON bulunamadı → ' + raw.slice(0, 60));
            return JSON.parse(match[0]);
        }
    },
    {
        id: 'gemini', name: 'Gemini', icon: '✨',
        lsKey: 'ydt_gemini_api_key',
        note: 'Free: 1.500 istek/gün · Gemini 1.5 Flash',
        keyHint: 'AIza...',
        keyLink: 'https://aistudio.google.com/app/apikey',
        async call(prompt) {
            const key = localStorage.getItem(this.lsKey);
            if (!key) throw new Error('no_key');

            // gemini-2.0-flash önce, olmazsa 1.5-flash
            let resp, data;
            for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
                resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                    { method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ contents:[{parts:[{text: prompt + '\n\nReturn ONLY valid JSON. No markdown fences.'}]}] }) }
                );
                data = await resp.json();
                // 404 = bu model yok, diğerini dene
                if (data.error?.code === 404 || data.error?.status === 'NOT_FOUND') continue;
                break; // ya başarılı ya da quota/auth hatası — döngüyü kır
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
    // Puter.js her zaman kullanılabilir (key gerektirmez), diğerleri key varsa eklenir
    const puter_provider = AI_PROVIDERS.find(p => p.id === 'puter');
    const keyed = AI_PROVIDERS.filter(p => p.id !== 'puter' && localStorage.getItem(p.lsKey));
    const available = (puter_provider ? [puter_provider] : []).concat(keyed);

    if (!available.length) {
        alert('AI özelliği şu an kullanılamıyor.\nYönetim paneli → 🔑 AI API Anahtarları bölümüne gidin.');
        throw new Error('no_api_key');
    }

    if (available.length === 1) {
        console.info('[AI Cascade] ⚠ Sadece 1 servis aktif:', available[0].name);
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
// SORU_PAKETLERİ + PARAGRAF_PAKETLERİ — dışa taşındı → /data/*.json
let SORU_PAKETLERİ     = [];
let PARAGRAF_PAKETLERİ = [];
let _paketlerReady     = false;
(async function _loadPaketler() {
    try {
        const [sq, pq] = await Promise.all([
            fetch('./data/soru-paketleri.json').then(r => r.json()),
            fetch('./data/paragraf-paketleri.json').then(r => r.json())
        ]);
        SORU_PAKETLERİ     = sq;
        PARAGRAF_PAKETLERİ = pq;
        _paketlerReady     = true;
    } catch(e) {
        console.warn('[motor] Paket verileri yüklenemedi:', e.message);
    }
})();

// ── Kelime import modal ───────────────────────────────────────────
async function showImportSorularModal() {
    if (!_paketlerReady) {
        await new Promise(r => { const t = setInterval(() => {
            if (_paketlerReady) { clearInterval(t); r(); }
        }, 50); });
    }
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

async function importSoruPaketi(paketId, btn) {
    if (!_paketlerReady) {
        await new Promise(r => { const t = setInterval(() => {
            if (_paketlerReady) { clearInterval(t); r(); }
        }, 50); });
    }
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
    localStorage.setItem('ydt_gramer_arsiv', JSON.stringify(window.aiGramerArsiv || []));
    if (window.updateArsivBadge) window.updateArsivBadge();
    btn.textContent = '✅ Yüklendi!'; btn.style.background='#dcfce7'; btn.style.color='#16a34a';
    setTimeout(() => { const ov=document.getElementById('import-modal-overlay'); if(ov) ov.remove(); if(typeof showAIArsiv==='function') showAIArsiv(); }, 900);
}


async function showImportParagrafModal() {
    if (!_paketlerReady) {
        await new Promise(r => { const t = setInterval(() => {
            if (_paketlerReady) { clearInterval(t); r(); }
        }, 50); });
    }
    const overlay = document.createElement('div'); overlay.id = 'paragraf-import-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;'; const paketler = PARAGRAF_PAKETLERİ.map(pk => { const yuklu = pk.pasajlar.filter(p => { const k = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`; return window.paragrafSorular && window.paragrafSorular[k];
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

async function importParagrafPaketi(paketId, btn) {
    if (!_paketlerReady) {
        await new Promise(r => { const t = setInterval(() => {
            if (_paketlerReady) { clearInterval(t); r(); }
        }, 50); });
    }
    const pk = PARAGRAF_PAKETLERİ.find(p => p.id === paketId);
    if (!pk) return;
    if (typeof paragraflar === 'undefined') window.paragraflar = [];
    window.paragrafSorular = window.paragrafSorular || {};
    pk.pasajlar.forEach(p => {
        const key = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`;
        const already = paragraflar.findIndex(x => `p_${(x.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(x.metin||'').length}` === key);
        const entry = { baslik:p.baslik, metin:p.metin, kelimeler:p.kelimeler||{} };
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

        // Use app's cascade AI system (Puter → Gemini → Groq → ...)
        const result = await aiCall(prompt);
        passages = result.passages || (Array.isArray(result) ? result : null);

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
    if (arsiv.length > 100) arsiv.length = 100;
    localStorage.setItem('ydt_ai_pasaj_arsiv', JSON.stringify(arsiv));

    // paragraflar[] dizisine ekle + localStorage'a yaz
    const newEntry = {
        baslik   : passage.title,
        metin    : passage.text,
        kelimeler: passage.vocabulary || {}
    };
    if (typeof paragraflar !== 'undefined') {
        const alreadyIn = paragraflar.findIndex(p => p.baslik === passage.title);
        if (alreadyIn < 0) {
            paragraflar.push(newEntry);
        }
    }
    // paragraflar'ı doğrudan localStorage'a yaz (motorun okuduğu key)
    try {
        localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    } catch(e) {}

    // UI'yı güncelle — Yüklü Pasajlar sayacı ve listesi
    const cnt = document.getElementById('reading-hub-saved-count');
    if (cnt) cnt.textContent = paragraflar.length > 0 ? `${paragraflar.length} pasaj` : '';
    const rh2stat = document.getElementById('rh2-stat-passages');
    if (rh2stat) rh2stat.textContent = paragraflar.length || '—';

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
    const tempP = { baslik: p.title, metin: p.text, kelimeler: p.vocabulary || {}, _aiSaved: true };
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    if (exists < 0) paragraflar.push(tempP);

    // LocalStorage'a da yaz (kalıcı)
    const allParagraflar = JSON.parse(localStorage.getItem('ydt_paragraflar') || '[]');
    if (!allParagraflar.find(x => x.baslik === p.title)) {
        allParagraflar.push(tempP);
        localStorage.setItem('ydt_paragraflar', JSON.stringify(allParagraflar));
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
        const result = await aiCall(`Translate "${word}" to Turkish. Reply ONLY with JSON: {"tr":"Turkish meaning (max 3 words)"}`);
        _translationCache[key] = (result.tr || '—').trim();
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
            const entry = { baslik: p.baslik, metin: p.metin, kelimeler: p.kelimeler || {} };
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
// AI PARAGRAF ÜRETİCİ — Kullanıcı isteğiyle tek paragraf üretir
// ═══════════════════════════════════════════════════════════════

const AIG_TOPICS = [
    { icon: '🔬', label: 'Biology',      query: 'biology and genetics' },
    { icon: '🤖', label: 'AI & Tech',    query: 'artificial intelligence and robotics' },
    { icon: '🎮', label: 'Gaming',        query: 'video game design and psychology' },
    { icon: '🌌', label: 'Space',         query: 'space exploration and astrophysics' },
    { icon: '🧠', label: 'Neuroscience', query: 'neuroscience and human cognition' },
    { icon: '⚡', label: 'Energy',        query: 'renewable energy and climate tech' },
    { icon: '🏛️', label: 'History',       query: 'ancient civilizations and archaeology' },
    { icon: '💊', label: 'Medicine',      query: 'medical breakthroughs and biotech' },
    { icon: '🌊', label: 'Ocean',         query: 'ocean science and marine biology' },
    { icon: '🎭', label: 'Psychology',    query: 'psychology and behavioral science' },
    { icon: '🔭', label: 'Physics',       query: 'quantum physics and particle science' },
    { icon: '🕹️', label: 'Indie Games',   query: 'indie game development and storytelling' },
];

let _aigSelectedTopic = null;
let _aigGeneratedPassage = null;

function _aigInitTopics() {
    const grid = document.getElementById('aig-topics-grid');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = AIG_TOPICS.map((t, i) =>
        `<button class="aig-topic-chip" data-idx="${i}" onclick="aigSelectTopic(${i})">
            <span class="aig-tc-icon">${t.icon}</span>${t.label}
        </button>`
    ).join('');
    // Kota bilgisini panel başına ekle (admin hariç)
    if (!_isAdminUser()) {
        const quota = _aigGetQuota();
        const remaining = AIG_DAILY_LIMIT - quota.count;
        const subEl = document.querySelector('.aig-panel-sub');
        if (subEl && !document.getElementById('aig-panel-quota')) {
            const quotaSpan = document.createElement('div');
            quotaSpan.id = 'aig-panel-quota';
            quotaSpan.style.cssText = 'margin-top:6px;font-size:.7rem;font-weight:800;';
            quotaSpan.innerHTML = remaining > 0
                ? `<span style="color:var(--c-green)">✅ Bugün ${remaining}/${AIG_DAILY_LIMIT} hakkın var</span>`
                : `<span style="color:#dc2626">⛔ Günlük limit doldu — yarın tekrar gel</span>`;
            subEl.after(quotaSpan);
        }
        if (remaining <= 0) {
            const btn = document.getElementById('aig-gen-btn');
            if (btn) btn.disabled = true;
        }
    }
}

function aigSelectTopic(idx) {
    _aigSelectedTopic = idx;
    document.querySelectorAll('.aig-topic-chip').forEach((el, i) =>
        el.classList.toggle('active', i === idx));
    // Custom inputu temizle
    const inp = document.getElementById('aig-custom-topic');
    if (inp) inp.value = '';
}

// ── Paragraf üretim kotası ──────────────────────
const AIG_QUOTA_KEY = () => getUserKey ? getUserKey('aig_quota') : 'ydt_aig_quota';
const AIG_DAILY_LIMIT = 5;

function _aigGetQuota() {
    try {
        const raw = localStorage.getItem(AIG_QUOTA_KEY());
        if (raw) { const q = JSON.parse(raw); if (q.date === _ukmToday()) return q; }
    } catch(e) {}
    return { date: _ukmToday(), count: 0 };
}
function _aigSaveQuota(q) { localStorage.setItem(AIG_QUOTA_KEY(), JSON.stringify(q)); }
function _isAdminUser() {
    const email = window._currentUser?.email || '';
    return email === ADMIN_EMAIL;
}

async function aiGenerateParagraf(random = false) {
    const btn = document.getElementById('aig-gen-btn');
    const lblEl = document.getElementById('aig-gen-btn-label');
    const previewEl = document.getElementById('aig-preview');

    // ── Kota kontrolü (admin hariç 5/gün) ──
    if (!_isAdminUser()) {
        const quota = _aigGetQuota();
        if (quota.count >= AIG_DAILY_LIMIT) {
            showAIToast(`Günlük ${AIG_DAILY_LIMIT} paragraf limitine ulaştınız. Yarın tekrar deneyin.`, 'warn');
            return;
        }
    }

    // Konu belirle
    let topic = '';
    if (random) {
        const t = AIG_TOPICS[Math.floor(Math.random() * AIG_TOPICS.length)];
        topic = t.query;
        // Chip seç
        const idx = AIG_TOPICS.indexOf(t);
        aigSelectTopic(idx);
    } else {
        const customInp = (document.getElementById('aig-custom-topic')?.value || '').trim();
        if (customInp) {
            topic = customInp;
            // Chip seçimini kaldır
            document.querySelectorAll('.aig-topic-chip').forEach(el => el.classList.remove('active'));
            _aigSelectedTopic = null;
        } else if (_aigSelectedTopic !== null) {
            topic = AIG_TOPICS[_aigSelectedTopic].query;
        } else {
            showAIToast('Lütfen bir konu seçin veya yazın!', 'warn'); return;
        }
    }

    // Loading state
    btn.disabled = true;
    lblEl.innerHTML = '<span class="aig-btn-spinner"></span> Üretiliyor…';
    previewEl.style.display = 'none';

    const prompt = `You are an expert English language teacher. Create ONE original C1/C2 level reading passage about: "${topic}".

Requirements:
- Exactly 6-8 sentences, 130-170 words
- Sophisticated academic vocabulary
- Engaging and informative
- Clear topic sentence
- Include 8-12 key vocabulary words from the text

Respond ONLY with valid JSON:
{
  "title": "Concise descriptive title (max 7 words)",
  "text": "The full passage text here...",
  "vocabulary": {
    "word1": "Türkçe karşılık",
    "word2": "Türkçe karşılık"
  }
}`;

    try {
        const result = await aiCall(prompt);

        if (!result.title || !result.text) throw new Error('Geçersiz yanıt');

        _aigGeneratedPassage = {
            title: result.title,
            text: result.text,
            vocabulary: result.vocabulary || {},
            topic
        };

        // Kota artır (admin hariç)
        if (!_isAdminUser()) {
            const quota = _aigGetQuota();
            quota.count++;
            _aigSaveQuota(quota);
            // Badge güncelle
            _aigUpdateQuotaBadge();
        }

        _aigRenderPreview(_aigGeneratedPassage);
        previewEl.style.display = 'block';
        setTimeout(() => previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

    } catch(e) {
        showAIToast('Paragraf üretilemedi: ' + (e.message || ''), 'error');
    }

    btn.disabled = false;
    lblEl.textContent = '✨ Paragraf Oluştur';
}

function _aigRenderPreview(p) {
    const previewEl = document.getElementById('aig-preview');
    if (!previewEl) return;

    const vocab = Object.entries(p.vocabulary || {});
    const wordCount = p.text.trim().split(/\s+/).length;
    const sentences = p.text.match(/[^.!?]+[.!?]+/g) || [];
    const readMin   = Math.ceil(wordCount / 180);

    // Kelime highlight — c1-word span ile (mevcut CSS kullanılıyor)
    let highlightedText = p.text;
    vocab.forEach(([eng, tr]) => {
        const regex = new RegExp(`\\b(${eng.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex,
            `<span class="c1-word" data-tr="${tr}" style="cursor:pointer;">$1</span>`);
    });

    // Cümleleri paragrafSentences[] global'e yaz — analyzeGrammarXRay okuyabilsin
    const rawSentences = p.text.match(/[^.!?]+[.!?]+/g) || [];
    paragrafSentences = rawSentences.map(s => s.trim());

    // Cümleleri tıklanabilir yap (Grammar X-Ray çağırıyor)
    let sentIdx = 0;
    const sentHighlight = highlightedText.replace(/([^.!?]+[.!?]+)/g, (match) => {
        const idx = sentIdx++;
        return `<span class="p-sentence" data-idx="${idx}" onclick="aigPreviewGrammarXRay(${idx})" style="cursor:pointer;" title="Tıkla: Grammar X-Ray">` + match + `</span> `;
    });

    const vocPills = vocab.map(([eng, tr]) =>
        `<span class="aig-vocab-pill" data-tr="${tr}" title="${tr}">${eng}</span>`
    ).join('');

    const vocCheckboxes = vocab.map(([eng, tr]) =>
        `<label class="aig-wl-chip"><input type="checkbox" class="aig-wl-check" value="${eng}" data-tr="${tr}" checked><span class="aig-wl-eng">${eng}</span><span class="aig-wl-tr">${tr}</span></label>`
    ).join('');

    const isAdmin = _isAdminUser();
    const quota   = _aigGetQuota();
    const remaining = AIG_DAILY_LIMIT - quota.count;
    const quotaHTML = !isAdmin ? `<div class="aig-quota-info">${remaining > 0 ? `<span style="color:var(--c-green)">✅ Bugün ${remaining} paragraf hakkın kaldı</span>` : `<span style="color:#dc2626">⚠️ Günlük limit doldu (${AIG_DAILY_LIMIT}/${AIG_DAILY_LIMIT})</span>`}</div>` : '';

    const ukmLists = Object.keys(_ukmGetLists());
    const listOptions = ukmLists.length
        ? ukmLists.map(n => `<option value="${n}">${n}</option>`).join('')
        : `<option value="">— Önce Profil'den liste oluşturun —</option>`;

    previewEl.innerHTML = `
    <div class="aig-result-card">
        <div class="aig-result-hero">
            <div class="aig-result-badge">✨ AI Üretim · C1/C2</div>
            <div class="aig-result-title">${p.title}</div>
            <div class="aig-result-meta">⏱ ${readMin} dk · ${wordCount} kelime · ${sentences.length} cümle · ${vocab.length} voc</div>
        </div>
        <div class="aig-result-body">
            <div class="aig-result-text">${sentHighlight}</div>
            ${vocab.length > 0 ? `
            <div class="aig-wordlist-section">
                <div class="aig-vocab-title" style="margin-bottom:10px;">📌 Kelime Listene Ekle</div>
                <div class="aig-wl-chips">${vocCheckboxes}</div>
                <div class="aig-wl-actions">
                    <select id="aig-wl-target" class="aig-wl-select"><option value="">— Liste seçin —</option>${listOptions}</select>
                    <button class="aig-action-btn primary" onclick="aigAddWordsToList()" style="flex:0 0 auto;padding:9px 14px;">➕ Seçilenleri Ekle</button>
                </div>
                <div id="aig-wl-result" style="font-size:.72rem;font-weight:700;color:var(--c-green);margin-top:6px;display:none;"></div>
            </div>` : ''}

            <!-- ── Grammar X-Ray Panel (inline, aynı sayfada) ── -->
            <div id="aig-grammar-panel" style="display:none; margin-top:16px; padding-top:16px; border-top:1.5px solid var(--border);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <div class="aig-vocab-title" style="margin:0;">⚙️ Grammar X-Ray</div>
                    <button onclick="document.getElementById('aig-grammar-panel').style.display='none'"
                        style="border:none;background:none;cursor:pointer;font-size:.8rem;color:var(--ink3);font-family:inherit;font-weight:700;">✕ Kapat</button>
                </div>
                <div id="aig-grammar-content">
                    <div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:16px;">
                        Bir cümleye tıkla → Grammar X-Ray analizi
                    </div>
                </div>
            </div>
        </div>
        <div class="aig-result-actions">
            <button class="aig-action-btn primary" onclick="aigOpenReading()">📖 Okumaya Başla</button>
            <button class="aig-action-btn" onclick="aigSavePassage()" id="aig-save-btn">💾 Arşive Kaydet</button>
            <button class="aig-action-btn" onclick="aiGenerateParagraf(true)">🎲 Yeniden Üret</button>
        </div>
        ${quotaHTML}
    </div>`;
}

// Üretilen pasajı okuma moduna aç
function aigOpenReading() {
    if (!_aigGeneratedPassage) return;
    const p = _aigGeneratedPassage;
    const tempP = { baslik: p.title, metin: p.text, kelimeler: p.vocabulary };
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    let idx;
    if (exists >= 0) { idx = exists; }
    else { paragraflar.push(tempP); idx = paragraflar.length - 1; }
    showParagrafOku(idx);
}

// Arşive kaydet
function aigSavePassage() {
    if (!_aigGeneratedPassage) return;
    const saved = saveAIPasajToArsiv(_aigGeneratedPassage);
    const btn = document.getElementById('aig-save-btn');
    if (saved) {
        showAIToast('✅ Yüklü Pasajlara kaydedildi!', 'info', 2500);
        if (btn) { btn.textContent = '✅ Kaydedildi'; btn.disabled = true; }
    } else {
        showAIToast('Bu pasaj zaten arşivde.', 'warn', 2000);
        if (btn) { btn.textContent = '✅ Zaten Kayıtlı'; btn.disabled = true; }
    }
}

// ── Paragraftan kelime listesine ekle ────────────────────────
function aigAddWordsToList() {
    const targetSel = document.getElementById('aig-wl-target');
    const listName  = targetSel?.value;
    if (!listName) { showAIToast('Önce bir liste seçin!', 'warn'); return; }

    const checks = document.querySelectorAll('.aig-wl-check:checked');
    if (!checks.length) { showAIToast('Eklenecek kelime seçmediniz!', 'warn'); return; }

    const lists = _ukmGetLists();
    if (!lists[listName]) { showAIToast('Liste bulunamadı!', 'warn'); return; }

    let added = 0, skipped = 0;
    checks.forEach(cb => {
        const eng = cb.value;
        const tr  = cb.dataset.tr || '—';
        if (lists[listName].length >= UKM_MAX_WORDS_PER_LIST) { skipped++; return; }
        if (lists[listName].some(w => w.eng.toLowerCase() === eng.toLowerCase())) { skipped++; return; }
        lists[listName].push({
            eng, tr, pos: 'n', level: 'C1',
            phonetic: '', mnemonic: '', story: '',
            errorCount: 0, correctStreak: 0,
            sm2_ef: 2.5, sm2_interval: 0, sm2_next: null
        });
        added++;
    });

    _ukmSaveLists(lists);

    const resultEl = document.getElementById('aig-wl-result');
    if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.textContent = added > 0
            ? `✅ ${added} kelime "${listName}" listesine eklendi!${skipped > 0 ? ` (${skipped} zaten vardı/limit)` : ''}`
            : `⚠️ Hiç kelime eklenemedi — limit dolu veya zaten mevcut.`;
        resultEl.style.color = added > 0 ? 'var(--c-green)' : '#dc2626';
    }
    if (added > 0) showAIToast(`✅ ${added} kelime eklendi!`, 'info', 2000);
}

// ── Kota badge güncelle ──────────────────────────────────────
function _aigUpdateQuotaBadge() {
    if (_isAdminUser()) return;
    const quota = _aigGetQuota();
    const remaining = AIG_DAILY_LIMIT - quota.count;
    const el = document.getElementById('aig-quota-info');
    if (!el) return;
    el.innerHTML = remaining > 0
        ? `<span style="color:var(--c-green)">✅ Bugün ${remaining} paragraf hakkın kaldı</span>`
        : `<span style="color:#dc2626">⚠️ Günlük limit doldu (${AIG_DAILY_LIMIT}/${AIG_DAILY_LIMIT})</span>`;
}

// Kota badge helper

// ── AI Preview — Inline Grammar X-Ray ──────────────────────
async function aigPreviewGrammarXRay(sentenceIdx) {
    const sentence = paragrafSentences[sentenceIdx];
    if (!sentence || sentence.trim().length < 6) return;

    // Aktif cümleyi vurgula
    document.querySelectorAll('#aig-preview .p-sentence.psa').forEach(s => s.classList.remove('psa'));
    const activeSpan = document.querySelector(`#aig-preview .p-sentence[data-idx="${sentenceIdx}"]`);
    if (activeSpan) activeSpan.classList.add('psa');

    const panel   = document.getElementById('aig-grammar-panel');
    const content = document.getElementById('aig-grammar-content');
    if (!panel || !content) return;

    panel.style.display = 'block';
    content.innerHTML = '<div class="p-grammar-loading"><span style="font-size:1.5rem;animation:spin 1s linear infinite;display:inline-block">⚙️</span><span>Analiz ediliyor...</span></div>';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

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
