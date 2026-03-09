// ── İstatistik Widget'ları — index sayfası — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats)

// 🚨 EN ZAYIF 5 KELİME
// ════════════════════════════════════════════════
function renderWeakWords() {
    const el = document.getElementById('idx-weak-words');
    if (!el) return;

    // Tüm kelimeleri topla, errorCount'a göre sırala
    const all = [];
    Object.entries(allData).forEach(([listName, list]) => {
        if (!Array.isArray(list)) return;
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
        if (!Array.isArray(list)) return;
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
        if (!Array.isArray(list)) return;
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
    const allWords = Object.values(allData).filter(Array.isArray).flat();
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
window.loadListToTextarea = loadListToTextarea;
window.createNewList      = createNewList;
window.saveCurrentList    = saveCurrentList;
window.deleteList         = deleteList;
window.renameList         = renameList;
window.forceSyncNow       = forceSyncNow;
