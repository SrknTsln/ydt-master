// XSS koruma yardımcısı (paragraf.js'deki ile aynı)
function _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── SM2 Spaced Repetition + Sesli Telaffuz + Yazarak Cevap + Bağlam Cümlesi — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats)

// SESLİ TELAFFUZ
// ══════════════════════════════════════════════
// speakWord(word, btn?) → utils.js'de tanımlı (global)

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

let _confettiFiring = false;
function fireConfetti() {
    if (_confettiFiring) return; // prevent multiple rapid calls
    _confettiFiring = true;
    setTimeout(() => { _confettiFiring = false; }, 4500);

    const colors = ['#e63946', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6'];
    const frag = document.createDocumentFragment(); // batch DOM insertions
    for (let i = 0; i < 60; i++) {
        const p            = document.createElement('div');
        p.className        = 'confetti-piece';
        p.style.left       = Math.random() * 100 + 'vw';
        p.style.top        = '-10px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        p.style.animationDelay   = (Math.random() * 0.5) + 's';
        frag.appendChild(p);
        setTimeout(() => p.remove(), 4000);
    }
    document.body.appendChild(frag);
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
            // Only count words that have been reviewed at least once (have sm2_next set)
            // Unreviewed words are shown in study mode first, not SM2 review
            if (w.sm2_next && w.sm2_next <= now) count++;
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
            if (!w || typeof w !== 'object') return;
            // Farklı formatlarda saklanan İngilizce kelimeyi normalize et
            if (!w.eng) {
                w.eng = w.word || w.en || w.english || w.front || '';
            }
            if (!w.tr) {
                w.tr = w.meaning || w.turkish || w.back || w.translation || '';
            }
            // eng alanı hâlâ boşsa bu kelimeyi SM-2 havuzuna ekleme
            if (!w.eng) return;
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

const SM2State = { pool: [], idx: 0, known: 0, hard: 0, forgot: 0, streak: 0 };

function _srUpdate() {
    const total = SM2State.known + SM2State.hard + SM2State.forgot;
    const acc   = total ? Math.round(SM2State.known / total * 100) : 0;
    const q = id => document.getElementById(id);
    const s = (id,v) => { const e=q(id); if(e) e.textContent=v; };
    s('sr-streak-num', SM2State.streak);
    s('sr-known',   SM2State.known);
    s('sr-hard',    SM2State.hard);
    s('sr-forgot',  SM2State.forgot);
    s('sr-accuracy', total ? acc + '%' : '—');
    const fill = q('sr-prog-fill');
    if (fill && SM2State.pool.length) fill.style.width = (SM2State.idx / SM2State.pool.length * 100) + '%';
}
const _SR_MOTS = [
    ['🧠','Beyin antrenmanı devam ediyor!'],
    ['💡','Kalıcı öğrenmenin yolu tekrar!'],
    ['🎯','Her tekrar bir adım öne!'],
    ['⚡','SM-2 seni günlük tutuyor!'],
    ['🏆','Şampiyonlar böyle çalışır!'],
];
function _srMotivation() {
    const m = SM2State.streak >= 4
        ? ['🔥', SM2State.streak + ' üst üste bildin! Harika!']
        : _SR_MOTS[Math.floor(Math.random() * _SR_MOTS.length)];
    const e1 = document.getElementById('sr-mot-icon');
    const e2 = document.getElementById('sr-mot-text');
    if(e1) e1.textContent = m[0];
    if(e2) e2.textContent = m[1];
}
function startSM2Review() {
    SM2State.pool = getSM2DueWords();
    if (SM2State.pool.length === 0) {
        _showAppToast('Bugün tekrar edilecek kelime yok! 🎉 En erken: ' + getNextSM2DateStr()); return;
    }
    SM2State.idx = 0; SM2State.known = 0; SM2State.hard = 0; SM2State.forgot = 0; SM2State.streak = 0;
    startModule();
    const old = document.querySelector('.sm2-done-btn');
    if (old) old.remove();
    showPage('sm2-page');
    _srUpdate(); _srMotivation();
    loadSM2Q();
}

function loadSM2Q() {
    const w = SM2State.pool[SM2State.idx];
    if (!w) return;
    // Normalize — getSM2DueWords zaten yapıyor ama ekstra güvenlik
    const engText = w.eng || w.word || w.en || w.english || '?';
    const trText  = w.tr  || w.meaning || w.turkish || '?';
    document.getElementById('sm2-word').innerText             = engText;
    document.getElementById('sm2-mnemonic').innerText         = w.mnemonic ? '💡 ' + w.mnemonic : '';
    document.getElementById('sm2-progress').innerText         = (SM2State.idx + 1) + ' / ' + SM2State.pool.length;
    const sshow = document.getElementById('sm2-show-btn');
    if(sshow) sshow.style.display = '';
    const sfront = document.getElementById('sr-front');
    if(sfront) sfront.style.display = '';
    const sans = document.getElementById('sm2-answer-section');
    if(sans) sans.style.display = 'none';
    const sans2 = document.getElementById('sm2-answer');
    if(sans2) sans2.textContent = trText;
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
    const w = SM2State.pool[SM2State.idx];
    sm2_update(w, rating);
    if (rating >= 3) {
        stats.correctAnswers++; incrementDailyCount(); recordDailyPerf(true);
        if (rating === 5) { SM2State.known++; SM2State.streak++; }
        else              { SM2State.known++; SM2State.streak++; }
    } else if (rating === 2) {
        SM2State.hard++; SM2State.streak = 0; recordDailyPerf(false);
    } else {
        SM2State.forgot++; SM2State.streak = 0; recordDailyPerf(false);
    }
    stats.totalAnswers++;
    window._saveData && window._saveData();
    SM2State.idx++;
    _srUpdate();
    if (SM2State.idx >= SM2State.pool.length) {
        const q = id => document.getElementById(id);
        const s = (id,v) => { const e=q(id); if(e) e.textContent=v; };
        s('sm2-word','🎉 Tebrikler!');
        s('sm2-mnemonic', SM2State.pool.length + ' kelime tekrar edildi.');
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

const TypingState = { pool: [], idx: 0, score: 0, answered: false, streak: 0, correct: 0, wrong: 0, mode: 'full' }; // 'full' | 'letters' | 'context'

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
    TypingState.pool         = [...allData[listName]].sort(() => Math.random() - 0.5);
    TypingState.idx          = 0;
    TypingState.score        = 0;
    TypingState.streak       = 0;
    TypingState.correct = 0;
    TypingState.wrong   = 0;
    startModule();
    showPage('typing-page');
    _twUpdateStats();
    _twLoadQ();
}

function _twLoadQ() {
    if (TypingState.idx >= TypingState.pool.length) { _twFinish(); return; }
    TypingState.answered = false;
    const w    = TypingState.pool[TypingState.idx];
    // Normalize
    if (!w.eng) w.eng = w.word || w.en || w.english || w.front || '';
    if (!w.tr)  w.tr  = w.meaning || w.turkish || w.back || w.translation || '';
    TypingState.mode = _twPickMode(w);

    // Progress
    const pct = TypingState.pool.length ? (TypingState.idx / TypingState.pool.length * 100) : 0;
    document.getElementById('tw-progress-fill').style.width = pct + '%';
    document.getElementById('tw-q-num').textContent   = TypingState.idx + 1;
    document.getElementById('tw-q-total').textContent = TypingState.pool.length;

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
    document.getElementById('tw-qtype-icon').textContent  = modes[TypingState.mode].icon;
    document.getElementById('tw-qtype-label').textContent = modes[TypingState.mode].label;

    // Context & letter hint göster/gizle
    const ctxWrap    = document.getElementById('tw-context-wrap');
    const letWrap    = document.getElementById('tw-letter-hint-wrap');
    ctxWrap.style.display = 'none';
    letWrap.style.display = 'none';

    if (TypingState.mode === 'context' && w.story) {
        // XSS koruması: story önce escape edilir, sonra sadece blank span geri eklenir
        const safeStory = _esc(w.story);
        const story = safeStory.replace(new RegExp('\\b' + _esc(w.eng) + '\\b', 'gi'),
            '<span class="tw-context-blank">_____</span>');
        document.getElementById('tw-context-text').innerHTML = story;
        ctxWrap.style.display = '';
    } else if (TypingState.mode === 'letters') {
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
    const total = TypingState.correct + TypingState.wrong;
    let mot;
    if (total === 0) mot = ['🎯', 'Hazır mısın? Hadi başlayalım!'];
    else if (TypingState.streak >= 5) mot = ['🔥', TypingState.streak + ' üst üste doğru! Muhteşem seri!'];
    else if (TypingState.streak >= 3) mot = ['⚡', 'Harika! ' + TypingState.streak + ' seri devam ediyor!'];
    else {
        const accuracy = total ? Math.round(TypingState.correct / total * 100) : 0;
        if (accuracy >= 90) mot = ['🏆', 'İnanılmaz! %' + accuracy + ' başarı oranı!'];
        else if (accuracy >= 70) mot = ['💪', 'Güzel gidiyorsun, %' + accuracy + ' doğruluk!'];
        else mot = TW_MOTIVATIONS[Math.floor(Math.random() * TW_MOTIVATIONS.length)];
    }
    document.getElementById('tw-mot-emoji').textContent = mot[0];
    document.getElementById('tw-mot-text').textContent  = mot[1];
}

function _twUpdateStats() {
    document.getElementById('tw-score').textContent    = TypingState.score;
    document.getElementById('tw-streak').textContent   = TypingState.streak;
    document.getElementById('tw-correct').textContent  = TypingState.correct;
    document.getElementById('tw-wrong').textContent    = TypingState.wrong;
    const total = TypingState.correct + TypingState.wrong;
    document.getElementById('tw-accuracy').textContent = total ? Math.round(TypingState.correct/total*100) + '%' : '—';
}

function twCheck() {
    if (TypingState.answered) return;
    TypingState.answered = true;
    const w      = TypingState.pool[TypingState.idx];
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
        const bonus = TypingState.streak >= 4 ? 5 : TypingState.streak >= 2 ? 2 : 0;
        const pts   = 10 + bonus;
        TypingState.score        += pts;
        TypingState.streak++;
        TypingState.correct++;
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
        TypingState.streak = 0;
        TypingState.wrong++;
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
    TypingState.idx++;
    _twLoadQ();
}

function twSkip() {
    if (TypingState.answered) { twNext(); return; }
    TypingState.answered = true;
    TypingState.streak = 0;
    const w = TypingState.pool[TypingState.idx];
    const fb = document.getElementById('tw-feedback');
    fb.className = 'tw-feedback wrong';
    fb.innerHTML = '⏭️ Geçildi. Doğrusu: <strong>' + w.tr + '</strong>';
    document.getElementById('tw-btn-check').style.display = 'none';
    document.getElementById('tw-submit-btn').style.display = 'none';
    document.getElementById('tw-btn-skip').style.display = 'none';
    document.getElementById('tw-btn-next').style.display = '';
    document.getElementById('tw-input').disabled = true;
    TypingState.wrong++;
    _twUpdateStats();
    _twSetMotivation();
}

function _twFinish() {
    const total    = TypingState.correct + TypingState.wrong;
    const accuracy = total ? Math.round(TypingState.correct / total * 100) : 0;
    const maxScore = TypingState.pool.length * 10;
    const fb = document.getElementById('tw-feedback');
    fb.className = 'tw-feedback correct';
    fb.innerHTML = '🏁 <strong>Bitti!</strong> ' + TypingState.score + '/' + maxScore + ' puan · %' + accuracy + ' doğruluk';
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
const ContextState = { pool: [], idx: 0, totalScore: 0, answered: false, word: null, correct: 0, wrong: 0, streak: 0 };

function _cxUpdate() {
    const total = ContextState.correct + ContextState.wrong;
    const acc   = total ? Math.round(ContextState.correct / total * 100) : 0;
    const s = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
    s('cx-correct',  ContextState.correct);
    s('cx-wrong',    ContextState.wrong);
    s('cx-accuracy', total ? acc + '%' : '—');
    s('cx-streak',   ContextState.streak);
    s('ctx-score',   ContextState.totalScore);
    const fill = document.getElementById('cx-prog-fill');
    if(fill && ContextState.pool.length) fill.style.width = (ContextState.idx / ContextState.pool.length * 100) + '%';
}
const _CX_MOTS = [
    ['📖','Cümleyi oku, boşluğu doldur!'],
    ['🎯','Bağlamdan anlam çıkar!'],
    ['💡','Gerçek metinlerde kullanım!'],
    ['🔥','Harika gidiyorsun!'],
    ["🧠","YDT'de tam böyle çıkıyor!"],
];
function _cxMotivation() {
    const m = ContextState.streak >= 3
        ? ['🔥', ContextState.streak + ' üst üste doğru! Seri devam!']
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
    ContextState.pool       = [...allData[listName]].sort(() => Math.random() - 0.5);
    ContextState.idx        = 0; ContextState.totalScore = 0; ContextState.correct = 0; ContextState.wrong = 0; ContextState.streak = 0;
    startModule();
    showPage('context-page');
    _cxUpdate(); _cxMotivation();
    ctxLoadQ();
}

async function ctxLoadQ() {
    ContextState.answered = false;
    ContextState.word     = ContextState.pool[ContextState.idx];
    const w     = ContextState.word;
    // Normalize
    if (!w.eng) w.eng = w.word || w.en || w.english || w.front || '';
    if (!w.tr)  w.tr  = w.meaning || w.turkish || w.back || w.translation || '';
    document.getElementById('ctx-progress').innerText        = (ContextState.idx + 1) + ' / ' + ContextState.pool.length;
    document.getElementById('ctx-score').innerText           = ContextState.totalScore;
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
    if (!ContextState.word) return;
    document.getElementById('ctx-regen-btn').disabled        = true;
    document.getElementById('ctx-sentence').innerHTML        = '<em style="color:var(--ink3);">✨ Yeni cümle üretiliyor...</em>';
    ContextState.word.story = '';
    await ctxGenerateSentence(ContextState.word);
    document.getElementById('ctx-regen-btn').disabled = false;
}

function ctxCheck() {
    if (ContextState.answered) return;
    ContextState.answered     = true;
    const w         = ContextState.word;
    const typed     = document.getElementById('ctx-input').value.trim().toLowerCase();
    const target    = w.eng.trim().toLowerCase();
    document.getElementById('ctx-input').disabled = true;
    const perfect   = typed === target;
    const sentence  = w.story || '';
    const escaped   = w.eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re        = new RegExp(escaped, 'gi');

    if (perfect) {
        ContextState.totalScore += 10;
        w.correctStreak = (w.correctStreak || 0) + 1;
        w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
        ContextState.correct++; ContextState.streak++;
        const fbOk = document.getElementById('ctx-feedback');
        if(fbOk){ fbOk.textContent='✅ Doğru! +10 puan'; fbOk.className='cx-feedback cx-feedback-ok'; }
        document.getElementById('ctx-sentence').innerHTML =
            sentence.replace(re, `<strong style="color:var(--green);">${w.eng}</strong>`);
        incrementDailyCount();
    } else {
        w.errorCount    = (w.errorCount || 0) + 1;
        w.correctStreak = 0;
        ContextState.wrong++; ContextState.streak = 0;
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
    ContextState.idx++;
    if (ContextState.idx >= ContextState.pool.length) {
        const total = ContextState.correct + ContextState.wrong;
        const acc   = total ? Math.round(ContextState.correct/total*100) : 0;
        const fb2 = document.getElementById('ctx-feedback');
        if(fb2){ fb2.innerHTML = '🏁 Bitti! <strong>'+ContextState.totalScore+'/'+(ContextState.pool.length*10)+'</strong> puan &nbsp;·&nbsp; %'+acc+' başarı'; fb2.className='cx-feedback cx-feedback-ok'; }
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
