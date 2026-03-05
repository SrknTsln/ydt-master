// ── Quiz sistemi — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

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
