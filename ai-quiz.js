// JSON güvenli parse — bozuk veri, tarayıcı eklentisi veya AI hatası uygulamayı çökertemez
function safeJsonParse(str, fallback = null) {
    if (str == null) return fallback;
    try { return JSON.parse(str); } catch(e) { return fallback; }
}

// ── XSS Koruması: AI açıklama çıktısını sanitize et ──────────────
// Sadece güvenli tag'lere (b, strong, em, br) izin ver, diğer HTML'i escape et
function _sanitizeExplanation(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.textContent = html; // tüm HTML'i önce escape et
    // Sadece whitelist'teki tag'leri geri aç
    return tmp.innerHTML
        .replace(/&lt;b&gt;/g,        '<b>')
        .replace(/&lt;\/b&gt;/g,      '</b>')
        .replace(/&lt;strong&gt;/g,   '<strong>')
        .replace(/&lt;\/strong&gt;/g, '</strong>')
        .replace(/&lt;em&gt;/g,       '<em>')
        .replace(/&lt;\/em&gt;/g,     '</em>')
        .replace(/&lt;br&gt;/g,       '<br>')
        .replace(/&lt;br \/&gt;/g,    '<br>')
        .replace(/&lt;br\/&gt;/g,     '<br>');
}

// ── AI YDT Sınav Modu + SM2 Badge — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

// ── SM2+Typing+Context+Memory+AIQuiz — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

// SM-2 BADGE & BAŞLANGIÇ
// ══════════════════════════════════════════════
function updateSM2Badge() {
    const due = countSM2Due();
    ['sb-sm2-badge', 'di-sm2-badge', 'mt-sm2-badge', 'bn-sm2-badge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.innerText = due; el.style.display = 'none'; } // badge sidebar'da gizli
    });
}

// ══════════════════════════════════════════════
// AI YDT SINAV MODU
// ══════════════════════════════════════════════
const AiQuizState = { currentList: [], currentIndex: 0, pageCorrect: '', answered: false };
let aiCurrentWord  = null; // mevcut sorunun kelime+veri referansı

// Arşiv global
window.aiArsiv      = safeJsonParse(localStorage.getItem('ydt_ai_arsiv'), []);
window.aiGramerArsiv = safeJsonParse(localStorage.getItem('ydt_gramer_arsiv'), []);

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
const AiQuizCfg = { count: 10, diff: 'ydt', type: 'bosluk', selectedList: null };
let _aiqSessionCorrect = 0, _aiqSessionWrong = 0, _aiqSessionTotal = 0;

function aiqSetCount(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    AiQuizCfg.count = val;
    _aiqUpdateStartBtn();
}
function aiqSetDiff(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    AiQuizCfg.diff = val;
}
function aiqSetType(btn, val) {
    btn.closest('.aiq-setting-chips').querySelectorAll('.aiq-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    AiQuizCfg.type = val;
}
function _aiqUpdateStartBtn() {
    const sub = document.getElementById('aiq-start-sub');
    if (!sub) return;
    const pool = AiQuizCfg.selectedList ? (allData[AiQuizCfg.selectedList] || []) : [];
    const cnt  = AiQuizCfg.count === 0 ? pool.length : Math.min(AiQuizCfg.count, pool.length);
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
    const aiqPage = document.getElementById('ai-quiz-page');
    if (!aiqPage) { console.warn('[ai-quiz] ai-quiz-page elementi bulunamadı'); return; }
    aiqPage.classList.remove('hidden');

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
        btn.className = 'aiq-list-btn' + (name === AiQuizCfg.selectedList ? ' active' : '');
        btn.innerHTML = `<span class="aiq-list-name">${name}</span><span class="aiq-list-count">${count} kelime</span>`;
        btn.onclick = () => _aiqSelectList(name);
        grid.appendChild(btn);
    });
}

function _aiqSelectList(name) {
    AiQuizCfg.selectedList = name;
    document.querySelectorAll('.aiq-list-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.aiq-list-btn').forEach(b => {
        if (b.querySelector('.aiq-list-name')?.textContent === name) b.classList.add('active');
    });
    _aiqUpdateStartBtn();
    const sub = document.getElementById('ai-quiz-sub');
    if (sub) sub.textContent = `${name} — ${allData[name]?.length || 0} kelime`;
}

function aiqBeginTest() {
    if (!AiQuizCfg.selectedList || !allData[AiQuizCfg.selectedList]) {
        alert('Lütfen bir kelime grubu seçin!'); return;
    }
    const hasKey = true; // Puter.js her zaman mevcut
    if (!hasKey) {
        const keySection = document.getElementById('ai-key-section');
        if (keySection) { keySection.style.display = 'block'; keySection.scrollIntoView({behavior:'smooth'}); }
        return;
    }

    // Listeyi hazırla
    const pool = [...allData[AiQuizCfg.selectedList]].sort(() => Math.random() - .5);
    const cnt  = AiQuizCfg.count === 0 ? pool.length : Math.min(AiQuizCfg.count, pool.length);
    AiQuizState.currentList  = pool.slice(0, cnt);
    AiQuizState.currentIndex = 0;
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
    if (AiQuizState.currentIndex >= AiQuizState.currentList.length) {
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

    AiQuizState.answered = false;
    const currentItem = AiQuizState.currentList[AiQuizState.currentIndex];
    const targetWord  = currentItem.word || currentItem.eng || currentItem.en;
    aiCurrentWord = { word: targetWord, tr: currentItem.tr || currentItem.meaning || '', listName: AiQuizCfg.selectedList || '' };

    const cnt = AiQuizState.currentList.length;
    document.getElementById('ai-word-counter').textContent = `${AiQuizState.currentIndex + 1} / ${cnt}`;
    const lbl = document.getElementById('aiq-q-prog-label');
    if (lbl) lbl.textContent = `${AiQuizState.currentIndex + 1}/${cnt}`;

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
    const diffTxt = diffMap[AiQuizCfg.diff] || 'YDT seviyesinde';
    const typeTxt = AiQuizCfg.type === 'anlam' ? 'Bu kelimenin Türkçe anlamını soran çoktan seçmeli'
        : AiQuizCfg.type === 'karisik' ? (Math.random() > .5 ? 'boşluk doldurma' : 'anlam sorusu')
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
    const idx = AiQuizState.currentIndex + 1;
    if (targetEl) targetEl.textContent = `SORU ${idx}`;

    // Zorluk etiketi
    const diffLabels = { ydt:'🎯 YDT Seviyesi', kolay:'🟢 Kolay', zor:'🔴 Zor' };
    const diffEl = document.getElementById('aiq-q-difficulty');
    if (diffEl) diffEl.textContent = diffLabels[AiQuizCfg.diff] || '🎯 YDT Seviyesi';

    // Progress bar
    const cnt = AiQuizState.currentList.length;
    const pb  = document.getElementById('ai-progress-bar');
    if (pb) pb.style.width = Math.round((AiQuizState.currentIndex / cnt) * 100) + '%';
    document.getElementById('ai-word-counter').textContent = `${AiQuizState.currentIndex + 1} / ${cnt}`;
    const lbl = document.getElementById('aiq-q-prog-label');
    if (lbl) lbl.textContent = `${AiQuizState.currentIndex + 1}/${cnt}`;

    document.getElementById('ai-q-text').textContent = qData.question;

    const optsContainer = document.getElementById('ai-options');
    optsContainer.innerHTML = '';
    AiQuizState.pageCorrect = qData.correct;

    for (const [key, val] of Object.entries(qData.options)) {
        const btn = document.createElement('button');
        btn.className = 'ai-opt-btn aiq-opt';
        btn.dataset.key = key;
        btn.innerHTML = `<span class="aiq-opt-letter">${key}</span><span>${val}</span>`;
        btn.onclick = () => checkAIPageAnswer(btn, key, qData);
        optsContainer.appendChild(btn);
    }

    // Açıklama hazırla ama gizle — AI çıktısı sanitize edilir (XSS koruması)
    const expDiv = document.getElementById('ai-explanation');
    expDiv.style.display = 'none';
    expDiv.innerHTML = `<div class="aiq-exp-header">💡 Çözüm ve Çeviri</div>${_sanitizeExplanation(qData.explanation)}`;
}

function checkAIPageAnswer(btn, selectedKey, qData) {
    if (AiQuizState.answered) return;
    AiQuizState.answered      = true;
    const isCorrect = (selectedKey === AiQuizState.pageCorrect);
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
        if (k === AiQuizState.pageCorrect) b.classList.add('aiq-opt-correct');
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
    AiQuizState.currentIndex++;
    fetchAIQuestionForCurrentWord();
}

// ── Arşive kaydet ────────────────────────────────────
function saveToAiArsiv(qData, selectedKey, isCorrect) {
    if (!qData || !qData.question) return;
    const wordVal  = (aiCurrentWord?.word  || '').trim() || (aiCurrentWord?.tr || '').trim() || '';
    const wordTrVal = (aiCurrentWord?.tr   || '').trim();
    if (!wordVal && !wordTrVal) return; // kelime bilgisi yoksa arşive ekleme
    const entry = {
        id:        Date.now(),
        date:      new Date().toISOString(),
        word:      wordVal,
        wordTr:    wordTrVal,
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
    if (el) { el.textContent = total; el.style.display = 'none'; } // badge sidebar'da gizli
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
    const saved = safeJsonParse(localStorage.getItem('ydt_gramer_arsiv'), []);
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
    const saved = safeJsonParse(localStorage.getItem('ydt_gramer_arsiv'), []);
    if (saved.length > 0) { window.aiGramerArsiv = saved; return; }
    window.aiGramerArsiv = GRAMMAR_SORULARI.map((s, idx) => ({
        id:          s.no || (idx + 1),
        question:    s.question,
        options:     s.options,  // {A,B,C,D,E} — bank.js uses Object.entries, compatible
        correct:     s.correct,
        explanation: s.explanation || ''
    }));
})();
window._arsivGroupPage     = window._arsivGroupPage     || 1; // 10'luk sayfa
// → js/bank.js (ayrı dosyaya taşındı)
