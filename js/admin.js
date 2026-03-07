// JSON güvenli parse — bozuk veri, tarayıcı eklentisi veya AI hatası uygulamayı çökertemez
function safeJsonParse(str, fallback = null) {
    if (str == null) return fallback;
    try { return JSON.parse(str); } catch(e) { return fallback; }
}

// ── Admin paneli — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

// 🔐 YÖNETİM PANELİ — Worker üzerinden admin kontrolü
// Admin e-postası client-side kodda tutulmaz — Worker env'den kontrol edilir
// ══════════════════════════════════════════════

async function adminCheckAccess() {
    const denied  = document.getElementById('admin-access-denied');
    const content = document.getElementById('admin-panel-content');
    const user = (window.AuthModule && window._currentUser) ? window._currentUser : null;
    const email = user ? user.email : null;

    if (!email) {
        if (denied)  denied.style.display  = 'flex';
        if (content) content.style.display = 'none';
        return;
    }

    // Admin kontrolü Cloudflare Worker'a taşındı — e-posta client'ta saklanmaz
    try {
        const workerUrl = (typeof window._AI_WORKER_URL !== 'undefined')
            ? window._AI_WORKER_URL
            : 'https://autumn-hill-be24ydt-master.stasalan.workers.dev';
        const res = await fetch(`${workerUrl}/admin/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data && data.isAdmin === true) {
            window._adminVerified = true;  // rss_paragraf.js _isAdmin() için
            if (denied)  denied.style.display  = 'none';
            if (content) content.style.display = 'flex';
            content.style.flexDirection = 'column';
            adminUnlockPanel();
        } else {
            if (denied)  denied.style.display  = 'flex';
            if (content) content.style.display = 'none';
        }
    } catch(e) {
        console.error('[adminCheckAccess] Worker hatası:', e.message);
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
        if (!questions.length) { setStatus('⚠️ Soru formatı tanınamadı', 'warn'); input.value = ''; return; }

        // Bankaya ekle
        _admSaveToBank(questions, category);
        setStatus(`✅ ${questions.length} soru eklendi`, 'ok');
        adminUpdateBankCounts();
        input.value = ''; // reset after success

    } catch(e) {
        setStatus('❌ ' + e.message, 'err');
        console.error('admBankUpload:', e);
        input.value = ''; // always reset
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
    const existing = safeJsonParse(localStorage.getItem(key), []);
    const merged   = [...existing, ...questions];
    localStorage.setItem(key, JSON.stringify(merged));
    // Firebase sync
    if (window.AuthModule) window.AuthModule.syncNow();
}

function admBankGetCount(category) {
    const key = `ydt_bank_${category}`;
    return safeJsonParse(localStorage.getItem(key), []).length;
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
