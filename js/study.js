// ── Kelime öğren — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

// ÖĞRENME MODU (FLIP CARD + BİLİYORUM/TEKRAR)
// ══════════════════════════════════════════════
const StudyState = {
    queue:    [],        // Mevcut turda gezilecek kelimeler (indeks listesi)
    againIdx: [],        // "Tekrar Et" işaretlenen indeksler
    knownSet: new Set(), // "Biliyorum" işaretlenen indeksler
    flipped:  false,
    queuePos: 0,
    index:    0          // Aktif kelime indeksi (allData içinde)
};

function startStudy() {
    currentActiveList = document.getElementById('list-selector').value;
    if (!allData[currentActiveList] || !allData[currentActiveList].length) {
        _showAppToast('Liste boş veya seçili değil!'); return;
    }
    StudyState.knownSet.clear();
    StudyState.againIdx = [];
    StudyState.queue    = allData[currentActiveList].map((_, i) => i);
    StudyState.queuePos = 0;
    StudyState.index    = 0;
    startModule();
    showPage('study-page');
    _populateStudySwitcher();
    renderStudyCard();
}

function startStudyFromNav() {
    // list-selector değerini al; boş/geçersizse currentActiveList veya ilk geçerli key'e düş
    const selEl = document.getElementById('list-selector');
    const selVal = selEl ? selEl.value : '';
    if (selVal && Array.isArray(allData[selVal]) && allData[selVal].length) {
        currentActiveList = selVal;
    } else if (currentActiveList && Array.isArray(allData[currentActiveList]) && allData[currentActiveList].length) {
        // currentActiveList geçerli, kullan
    } else {
        // allData'dan ilk geçerli array key'i bul
        const firstKey = Object.keys(allData || {}).find(k => Array.isArray(allData[k]) && allData[k].length);
        if (firstKey) {
            currentActiveList = firstKey;
            if (selEl) selEl.value = firstKey;
        } else {
            if (typeof _showAppToast === 'function') _showAppToast('Önce bir kelime listesi yükleyin.');
            navTo('index-page');
            return;
        }
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
    StudyState.knownSet.clear();
    StudyState.againIdx = [];
    StudyState.queue    = allData[name].map((_, i) => i);
    StudyState.queuePos = 0;
    StudyState.index    = 0;
    renderStudyCard();
    showAIToast(`📚 ${name}`, 'info', 1500);
}

function renderStudyCard() {
    const list  = allData[currentActiveList];
    if (!list || !StudyState.queue.length) { showPage('index-page'); return; }
    const total = StudyState.queue.length;
    const pos   = StudyState.queuePos;
    if (pos >= total) { showStudyDone(); return; } // guard against out-of-bounds
    StudyState.index  = StudyState.queue[pos];
    const w     = list[StudyState.index];
    if (!w) { console.warn('renderStudyCard: word not found at index', StudyState.index); return; }

    // İlerleme
    const pct = total > 0 ? Math.round((pos / total) * 100) : 0;
    document.getElementById('study-prog-fill').style.width = pct + '%';
    document.getElementById('study-progress-label').innerText = `${pos + 1} / ${total}`;

    // Chip sayaçları
    document.getElementById('chip-known-count').innerText = StudyState.knownSet.size;
    document.getElementById('chip-again-count').innerText = StudyState.againIdx.length;

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
    const w = list[StudyState.queue[StudyState.queuePos]];
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

function studyMarkKnown() {
    StudyState.knownSet.add(StudyState.queue[StudyState.queuePos]);
    // SM-2 hafif puan
    const w = allData[currentActiveList][StudyState.queue[StudyState.queuePos]];
    w.correctStreak = (w.correctStreak || 0) + 1;
    w.errorCount    = Math.max(0, (w.errorCount || 0) - 1);
    studyAdvance();
}

function studyMarkAgain() {
    const idx = StudyState.queue[StudyState.queuePos];
    StudyState.knownSet.delete(idx);
    if (!StudyState.againIdx.includes(idx)) StudyState.againIdx.push(idx);
    // hafif ceza
    const w = allData[currentActiveList][idx];
    w.errorCount    = (w.errorCount || 0) + 1;
    w.correctStreak = 0;
    studyAdvance();
}

function studyAdvance() {
    window._saveData && window._saveData();
    StudyState.queuePos++;
    if (StudyState.queuePos >= StudyState.queue.length) {
        showStudyDone();
    } else {
        renderStudyCard();
    }
}

function prevStudy() {
    if (StudyState.queuePos > 0) {
        StudyState.queuePos--;
        renderStudyCard();
    }
}

function nextStudy() { flipStudyCard(); }

function updateStudyCard() { renderStudyCard(); } // geriye dönük uyumluluk

// ── Tamamlama Ekranı ──
function showStudyDone() {
    const total  = StudyState.queue.length;
    const known  = StudyState.knownSet.size;
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
        msg = `${StudyState.againIdx.length} kelime daha pratik yapılabilir.`;
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
    if (againBtn) againBtn.style.display = StudyState.againIdx.length > 0 ? 'block' : 'none';

    if (pct >= 80) fireConfetti();
    showPage('study-done-page');
}

function restartStudy() {
    StudyState.knownSet.clear();
    StudyState.againIdx = [];
    StudyState.queue    = allData[currentActiveList].map((_, i) => i);
    StudyState.queuePos = 0;
    showPage('study-page');
    renderStudyCard();
}

function restartStudyAgainOnly() {
    if (!StudyState.againIdx.length) { restartStudy(); return; }
    StudyState.queue    = [...StudyState.againIdx];
    StudyState.againIdx = [];
    StudyState.knownSet.clear();
    StudyState.queuePos = 0;
    showPage('study-page');
    renderStudyCard();
}


// ══════════════════════════════════════════════

// ── Window Exports (defer uyumluluğu) ────────────────────────────
window.generateStudySentences  = generateStudySentences;
window.prevStudy               = typeof prevStudy !== 'undefined' ? prevStudy : null;
window.restartStudy            = restartStudy;
window.restartStudyAgainOnly   = restartStudyAgainOnly;
window.startStudyFromNav       = startStudyFromNav;
window.studyMarkAgain          = studyMarkAgain;
window.studyMarkKnown          = studyMarkKnown;
