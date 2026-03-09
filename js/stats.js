// ── İstatistik sayfası — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

// İSTATİSTİK SAYFASI
// ══════════════════════════════════════════════
function showStatsPage() {
    showPage('stats-page');
    let total = 0, learned = 0, hard = 0, allWords = [];
    const lists = Object.keys(allData).filter(k => Array.isArray(allData[k]));
    lists.forEach(listName => {
        const list = allData[listName];
        if (!Array.isArray(list)) return; // Firestore bazen object döner — güvenli geç
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
    const streak = parseInt(localStorage.getItem(typeof getUserKey === 'function' ? getUserKey('streak') : 'ydt_streak') || '0');
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
                const ws = Array.isArray(allData[listName]) ? allData[listName] : [];
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
    // NOTE: showPage called once at the top of showStatsPage (removed duplicate)
}

// ══════════════════════════════════════════════
// → js/quiz.js (ayrı dosyaya taşındı)

// ── Window Exports (defer uyumluluğu) ────────────────────────────
window.showStatsPage = showStatsPage;
