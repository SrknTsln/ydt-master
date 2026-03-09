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
    const user = window._currentUser || null;

    if (!user) {
        if (denied)  denied.style.display  = 'flex';
        if (content) content.style.display = 'none';
        return;
    }

    // Admin kontrolü: Firebase custom claim (admin: true)
    // Bu değer sunucu tarafında set edilir — client'ta sahtelenebilir değil
    try {
        const tokenResult = await user.getIdTokenResult();
        const isAdmin = tokenResult.claims.admin === true;
        if (isAdmin) {
            window._adminVerified = true;
            if (denied)  denied.style.display  = 'none';
            if (content) content.style.display = 'flex';
            content.style.flexDirection = 'column';
            adminUnlockPanel();
        } else {
            if (denied)  denied.style.display  = 'flex';
            if (content) content.style.display = 'none';
        }
    } catch(e) {
        console.error('[adminCheckAccess] Token kontrol hatası:', e.message);
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
    // Paragraf tab: selector + sayaçları doldur
    if (tabId === 'paragraf') {
        _admPopulateParaSelector();
        _admRefreshShareCounters();
    }
    // Kelimeler tab: share-list-selector + sayaçları doldur
    if (tabId === 'words') {
        const sel = document.getElementById('share-list-selector');
        if (sel) {
            while (sel.options.length > 1) sel.remove(1);
            Object.keys(window.allData || {}).forEach(name => {
                const opt = document.createElement('option');
                opt.value = name; opt.textContent = name;
                sel.appendChild(opt);
            });
        }
        _admRefreshShareCounters();
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
    // list-selector değerini al; boş/geçersizse currentActiveList veya ilk geçerli key'e düş
    const selEl = document.getElementById('list-selector');
    const selVal = selEl ? selEl.value : '';
    if (selVal && Array.isArray(allData[selVal]) && allData[selVal].length >= 4) {
        currentActiveList = selVal;
    } else if (currentActiveList && Array.isArray(allData[currentActiveList]) && allData[currentActiveList].length >= 4) {
        // currentActiveList geçerli, kullan
        if (selEl) selEl.value = currentActiveList;
    } else {
        // allData'dan ilk ≥4 kelimeli liste bul
        const firstKey = Object.keys(allData || {}).find(k => Array.isArray(allData[k]) && allData[k].length >= 4);
        if (firstKey) {
            currentActiveList = firstKey;
            if (selEl) selEl.value = firstKey;
        } else {
            if (typeof _showAppToast === 'function') _showAppToast('Quiz için en az 4 kelimeli liste gerekli.');
            navTo('index-page');
            return;
        }
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

// ════════════════════════════════════════════════════════════════
// PAYLAŞIM FONKSİYONLARI — admin → shared/content (Firestore)
// ════════════════════════════════════════════════════════════════

/**
 * _admSetShareStatus — paylaşım kartlarındaki durum mesajını yönetir.
 * @param {'words'|'para'} type
 * @param {'loading'|'ok'|'error'|'idle'} state
 * @param {string} [msg]
 */
function _admSetShareStatus(type, state, msg) {
    const idMap = {
        words: { btn: 'adm-share-btn',      status: 'adm-share-status'      },
        para:  { btn: 'adm-share-para-btn', status: 'adm-share-para-status' },
    };
    const ids = idMap[type];
    if (!ids) return;

    const btn    = document.getElementById(ids.btn);
    const status = document.getElementById(ids.status);

    if (btn) btn.disabled = state === 'loading';

    if (!status) return;
    const colorMap = { loading: '#f59e0b', ok: '#22c55e', error: '#e63946', idle: 'var(--ink3)' };
    status.style.color = colorMap[state] || 'var(--ink3)';
    status.textContent = msg || '';
}

/**
 * _admRefreshShareCounters — her iki tip için yerel ve Firestore sayılarını günceller.
 * Paragraf tabı açıldığında otomatik çağrılır.
 */
async function _admRefreshShareCounters() {
    // ── Kelimeler: Yerel ──────────────────────────────────────────
    const localListCount = Object.keys(window.allData || {}).filter(k => Array.isArray(window.allData[k])).length;
    const elWordsLocal   = document.getElementById('adm-words-local-count');
    if (elWordsLocal) elWordsLocal.textContent = localListCount;

    // ── Paragraflar: Yerel ────────────────────────────────────────
    const localParaCount = Array.isArray(window.paragraflar) ? window.paragraflar.length : 0;
    const elParaLocal    = document.getElementById('adm-para-local-count');
    if (elParaLocal) elParaLocal.textContent = localParaCount;

    // ── Her iki Paylaşılmış sayaç: Firestore'dan tek sorguda ──────
    try {
        if (!window._fsdb || !window._doc || !window._getDoc) return;
        const snap = await window._getDoc(window._doc(window._fsdb, 'shared', 'content'));
        if (!snap.exists()) return;
        const d = snap.data();

        // Kelime listeleri
        const sharedListCount = d.sharedLists ? Object.keys(d.sharedLists).length : 0;
        const elWordsShared   = document.getElementById('adm-words-shared-count');
        if (elWordsShared) elWordsShared.textContent = sharedListCount;

        // Pasajlar
        const sharedParaCount = Array.isArray(d.paragraflar) ? d.paragraflar.length : 0;
        const elParaShared    = document.getElementById('adm-para-shared-count');
        if (elParaShared) elParaShared.textContent = sharedParaCount;
    } catch(e) {
        console.warn('[adm-share] Firestore sayaç sorgusu başarısız:', e.message);
    }
}

/**
 * adminShareLists — seçili (veya tüm) kelime listelerini shared/content'e yazar.
 * Kelimeler tabındaki "☁️ Firestore'a Yükle" butonuna bağlı.
 */
async function adminShareLists() {
    if (!(await adminCheckAccess())) return;

    const selector = document.getElementById('share-list-selector');
    const note     = document.getElementById('adm-share-note');
    const selected = selector ? selector.value : '__ALL__';
    const data     = window.allData || {};

    // Paylaşılacak listeleri belirle
    let toShare = {};
    if (selected === '__ALL__') {
        Object.entries(data).forEach(([k, v]) => { if (Array.isArray(v) && v.length > 0) toShare[k] = v; });
    } else if (Array.isArray(data[selected]) && data[selected].length > 0) {
        toShare[selected] = data[selected];
    }

    const listCount = Object.keys(toShare).length;
    const wordCount = Object.values(toShare).reduce((s, v) => s + v.length, 0);

    if (listCount === 0) {
        _admSetShareStatus('words', 'error', '⚠️ Paylaşılacak kelime listesi bulunamadı.');
        return;
    }

    _admSetShareStatus('words', 'loading', '⏳ Yükleniyor...');
    if (note) note.textContent = `${listCount} liste · ${wordCount} kelime paylaşılıyor...`;

    try {
        await window._setDoc(
            window._doc(window._fsdb, 'shared', 'content'),
            {
                sharedLists: toShare,
                sharedListsUpdatedAt: new Date().toISOString(),
                sharedListsUpdatedBy: window._currentUser?.uid || 'admin',
            },
            { merge: true }
        );
        _admSetShareStatus('words', 'ok', `✅ ${listCount} liste (${wordCount} kelime) paylaşıldı.`);
        if (note) note.textContent = '';
        // Sayaçları güncelle
        const elShared = document.getElementById('adm-words-shared-count');
        if (elShared) elShared.textContent = listCount;
    } catch(e) {
        console.error('[adm-share] Kelime listesi paylaşım hatası:', e.message);
        _admSetShareStatus('words', 'error', '❌ Firestore yazma hatası: ' + (e.message || 'bilinmiyor'));
    }
}

/**
 * adminShareParagraflar — seçili (veya tüm) pasajları shared/content'e yazar.
 * Paragraf tabındaki "☁️ Firestore'a Yükle" butonuna bağlı.
 * Yazma tamamlandığında login overlay'deki lo-stat-pasaj sayacı canlı olarak güncellenir.
 */
async function adminShareParagraflar() {
    if (!(await adminCheckAccess())) return;

    const selector   = document.getElementById('share-para-selector');
    const note       = document.getElementById('adm-share-para-note');
    const selected   = selector ? selector.value : '__ALL__';
    const allParalar = Array.isArray(window.paragraflar) ? window.paragraflar : [];

    if (allParalar.length === 0) {
        _admSetShareStatus('para', 'error', '⚠️ Paylaşılacak pasaj bulunamadı.');
        return;
    }

    // Paylaşılacak pasajları belirle
    let toShare = [];
    if (selected === '__ALL__') {
        toShare = allParalar;
    } else {
        const found = allParalar.find(p => p.baslik === selected);
        if (found) toShare = [found];
    }

    if (toShare.length === 0) {
        _admSetShareStatus('para', 'error', '⚠️ Seçili pasaj bulunamadı.');
        return;
    }

    _admSetShareStatus('para', 'loading', '⏳ Yükleniyor...');
    if (note) note.textContent = `${toShare.length} pasaj Firestore'a yazılıyor...`;

    // paragrafSorular: mevcut window değeri — merge ile korunur
    const sorularData = (typeof window.paragrafSorular === 'object' && window.paragrafSorular)
        ? window.paragrafSorular : {};

    try {
        await window._setDoc(
            window._doc(window._fsdb, 'shared', 'content'),
            {
                paragraflar:           toShare,
                paragrafSorular:       sorularData,
                updatedAt:             new Date().toISOString(),
                updatedBy:             window._currentUser?.uid || 'admin',
            },
            { merge: true }
        );

        const count = toShare.length;
        _admSetShareStatus('para', 'ok', `✅ ${count} pasaj başarıyla paylaşıldı.`);
        if (note) note.textContent = '';

        // ── Sayaçları canlı güncelle ─────────────────────────────────
        const elParaShared = document.getElementById('adm-para-shared-count');
        if (elParaShared) elParaShared.textContent = count;

        // Login overlay'deki lo-stat-pasaj — sayfa açıksa anında güncelle
        const loStat = document.getElementById('lo-stat-pasaj');
        if (loStat) loStat.textContent = count;

    } catch(e) {
        console.error('[adm-share] Pasaj paylaşım hatası:', e.message);
        _admSetShareStatus('para', 'error', '❌ Firestore yazma hatası: ' + (e.message || 'bilinmiyor'));
    }
}

/**
 * _admPopulateParaSelector — share-para-selector'ı mevcut paragraflarla doldurur.
 * admSwitchTab('paragraf') çağrısından tetiklenir.
 */
function _admPopulateParaSelector() {
    const sel = document.getElementById('share-para-selector');
    if (!sel) return;

    // Mevcut dinamik seçenekleri temizle (ilk __ALL__ option'ı koru)
    while (sel.options.length > 1) sel.remove(1);

    const paralar = Array.isArray(window.paragraflar) ? window.paragraflar : [];
    paralar.forEach(p => {
        if (!p || !p.baslik) return;
        const opt = document.createElement('option');
        opt.value       = p.baslik;
        opt.textContent = p.baslik.length > 52 ? p.baslik.slice(0, 52) + '…' : p.baslik;
        sel.appendChild(opt);
    });
}

// ── Window Exports ────────────────────────────────────────────────
window.admLoadUserCount    = admLoadUserCount;
window.adminShareLists     = adminShareLists;
window.adminShareParagraflar = adminShareParagraflar;
window.showExerciseNav     = showExerciseNav;
