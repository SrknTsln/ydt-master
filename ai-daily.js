// JSON güvenli parse — bozuk veri, tarayıcı eklentisi veya AI hatası uygulamayı çökertemez
function safeJsonParse(str, fallback = null) {
    if (str == null) return fallback;
    try { return JSON.parse(str); } catch(e) { return fallback; }
}

// ── DOM Cache (ai-daily.js) — motor.js yüklüyse paylaşılan $id kullan ─────
// motor.js'den önce yüklenmesi durumuna karşı guard
const _aidDomCache = new Map();
function _aid$id(id) {
    // motor.js'nin $id fonksiyonu varsa onu kullan (tek cache havuzu)
    if (typeof $id === 'function') return $id(id);
    if (_aidDomCache.has(id)) {
        const cached = _aidDomCache.get(id);
        if (cached && document.contains(cached)) return cached;
        _aidDomCache.delete(id);
    }
    const el = document.getElementById(id);
    if (el) _aidDomCache.set(id, el);
    return el;
}

// ── Rozet Sistemi + Isı Haritası + AI Günlük Paragraflar + Çeviri Modu — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats)

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
    const grid    = $id('badges-grid');
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
    const sel    = $id('heatmap-list-sel');
    const grid   = $id('heatmap-grid');
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
        return `<div class="hm-cell ${cls}" title="${tooltip}" data-speak-hm data-eng="${w.eng.replace(/"/g,'&quot;')}" data-tr="${w.tr.replace(/"/g,'&quot;')}" data-err="${err}" data-str="${str}"></div>`;
    }).join('');
}

function hmShowWord(el, eng, tr, err, str) {
    // mevcut seçimi kaldır
    document.querySelectorAll('.hm-cell.hm-selected').forEach(c => c.classList.remove('hm-selected'));
    el.classList.add('hm-selected');

    // tooltip popup
    const old = $id('hm-popup');
    if (old) old.remove();
    const pop = document.createElement('div');
    pop.id = 'hm-popup';
    pop.className = 'hm-popup';
    pop.innerHTML = `<strong>${eng}</strong> — ${tr}<br><span style="font-size:.7rem;opacity:.8">${err} hata · ${str} doğru</span>`;
    $id('heatmap-grid').appendChild(pop);
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
        // Guard: max 5 second wait to avoid infinite polling if fetch failed
        await new Promise((r, j) => {
            const deadline = Date.now() + 5000;
            const t = setInterval(() => {
                if (_paketlerReady) { clearInterval(t); r(); }
                else if (Date.now() > deadline) { clearInterval(t); j(new Error('Paket verisi zaman aşımı')); }
            }, 50);
        }).catch(e => { console.warn('[ai-daily] _loadPaketler timeout:', e.message); });
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
            <button data-action="importSoruPaketi('${p.id}',this)" style="padding:8px 18px;border-radius:9px;border:none;background:${zatenVar?'#dcfce7':'linear-gradient(135deg,#6366f1,#8b5cf6)'};color:${zatenVar?'#16a34a':'#fff'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
                ${zatenVar?'↺ Yeniden':'📥 Yükle'}</button></div>`;
    }).join('');
    overlay.innerHTML = `<div style="background:var(--bg,#f8f8f8);border-radius:18px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div style="font-size:1rem;font-weight:900;color:var(--ink);">📥 Kelime Paketi Yükle</div>
            <button data-action="$id('import-modal-overlay').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--ink3);">✕</button>
        </div>${paketler}</div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); }, { once: true });
}

async function importSoruPaketi(paketId, btn) {
    if (!_paketlerReady) {
        // Guard: max 5 second wait to avoid infinite polling if fetch failed
        await new Promise((r, j) => {
            const deadline = Date.now() + 5000;
            const t = setInterval(() => {
                if (_paketlerReady) { clearInterval(t); r(); }
                else if (Date.now() > deadline) { clearInterval(t); j(new Error('Paket verisi zaman aşımı')); }
            }, 50);
        }).catch(e => { console.warn('[ai-daily] _loadPaketler timeout:', e.message); });
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
    setTimeout(() => { const ov=$id('import-modal-overlay'); if(ov) ov.remove(); if(typeof showAIArsiv==='function') showAIArsiv(); }, 900);
}


async function showImportParagrafModal() {
    if (!_paketlerReady) {
        // Guard: max 5 second wait to avoid infinite polling if fetch failed
        await new Promise((r, j) => {
            const deadline = Date.now() + 5000;
            const t = setInterval(() => {
                if (_paketlerReady) { clearInterval(t); r(); }
                else if (Date.now() > deadline) { clearInterval(t); j(new Error('Paket verisi zaman aşımı')); }
            }, 50);
        }).catch(e => { console.warn('[ai-daily] _loadPaketler timeout:', e.message); });
    }
    const overlay = document.createElement('div'); overlay.id = 'paragraf-import-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;'; const paketler = PARAGRAF_PAKETLERİ.map(pk => { const yuklu = pk.pasajlar.filter(p => { const k = `p_${(p.baslik||'').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.metin||'').length}`; return window.paragrafSorular && window.paragrafSorular[k];
        }).length;
        const tamam = yuklu===pk.pasajlar.length;
        return `<div style="background:var(--white);border:1.5px solid ${tamam?'#22c55e':'var(--border)'};border-radius:14px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div><div style="font-size:.88rem;font-weight:800;color:var(--ink);">${pk.baslik}</div>
            <div style="font-size:.74rem;color:var(--ink3);margin-top:3px;">${pk.aciklama}</div>
            ${tamam?'<div style="font-size:.7rem;color:#22c55e;font-weight:700;margin-top:4px;">✅ Tümü yüklendi</div>':yuklu>0?`<div style="font-size:.7rem;color:#f59e0b;font-weight:700;margin-top:4px;">⚡ ${yuklu}/${pk.pasajlar.length} yüklendi</div>`:''}</div>
            <button data-action="importParagrafPaketi('${pk.id}',this)" style="padding:8px 18px;border-radius:9px;border:none;background:${tamam?'#dcfce7':'linear-gradient(135deg,#10b981,#059669)'};color:${tamam?'#16a34a':'#fff'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
                ${tamam?'↺ Yeniden':'📖 Yükle'}</button></div>`;
    }).join('');
    overlay.innerHTML = `<div style="background:var(--bg,#f8f8f8);border-radius:18px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div style="font-size:1rem;font-weight:900;color:var(--ink);">📖 Paragraf Paketi Yükle</div>
            <button data-action="$id('paragraf-import-overlay').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--ink3);">✕</button>
        </div>${paketler}
        <div style="font-size:.72rem;color:var(--ink3);text-align:center;margin-top:12px;">Yüklenen pasajlar Paragraf Okuma ve Soru Bankası'nda görünür.</div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); }, { once: true });
}

async function importParagrafPaketi(paketId, btn) {
    if (!_paketlerReady) {
        // Guard: max 5 second wait to avoid infinite polling if fetch failed
        await new Promise((r, j) => {
            const deadline = Date.now() + 5000;
            const t = setInterval(() => {
                if (_paketlerReady) { clearInterval(t); r(); }
                else if (Date.now() > deadline) { clearInterval(t); j(new Error('Paket verisi zaman aşımı')); }
            }, 50);
        }).catch(e => { console.warn('[ai-daily] _loadPaketler timeout:', e.message); });
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
    setTimeout(() => { const ov=$id('paragraf-import-overlay'); if(ov) ov.remove(); renderArsiv(); }, 900);
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

async function aiDailyGenerateParagraflar(force) {
    const todayKey = getTodayKey();
    const cacheKey = `ydt_ai_daily_${todayKey}`;
    const listEl = $id('ai-daily-paragraf-list');
    const badgeEl = $id('ai-daily-date-badge');
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
            } catch(e) {
                console.warn('[AI Daily] Cache parse/render hatası, yeniden yüklenecek:', e.message);
            }
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

    // ÖNEMLİ: window.aiPasajArsiv global değişkenini güncelle
    // Böylece Firebase sync geldiğinde eski veriyle üzerine yazmaz
    window.aiPasajArsiv = arsiv;

    // paragraflar[] dizisine ekle + localStorage'a yaz
    const newEntry = {
        baslik   : passage.title,
        metin    : passage.text,
        kelimeler: passage.vocabulary || {}
    };
    if (typeof paragraflar !== 'undefined') {
        const alreadyIn = paragraflar.findIndex(p => p.baslik === passage.title);
        if (alreadyIn < 0) {
            // Başa ekle — Yüklü Pasajlar sekmesinde en son eklenen ilk sırada görünsün
            paragraflar.unshift(newEntry);
        }
    }
    // paragraflar'ı doğrudan localStorage'a yaz (motorun okuduğu key)
    // QuotaExceededError korumalı write
    if (window.YDT) {
        window.YDT.lsSet('ydt_paragraflar', paragraflar);
    } else {
        try {
            localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
        } catch(e) {
            console.warn('[AI Daily] paragraflar localStorage yazma hatası:', e.message);
        }
    }

    // Firebase'e hemen kaydet — senkron sonrası veri kaybını önler
    if (window._saveData) window._saveData();

    // UI'yı güncelle — Yüklü Pasajlar sayacı ve listesi
    const cnt = $id('reading-hub-saved-count');
    if (cnt) cnt.textContent = paragraflar.length > 0 ? `${paragraflar.length} pasaj` : '';
    const rh2stat = $id('rh2-stat-passages');
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

        return `<div class="rh2-card" id="ai-card-${i}" data-action="openAIDailyParagraf(${i})">
            <div class="rh2-card-accent rh2-card-accent-ai"></div>
            <div class="rh2-card-body">
                <div class="rh2-card-header">
                    <div class="rh2-card-icon rh2-card-icon-ai">${icons[i % icons.length]}</div>
                    <div class="rh2-card-titlemeta">
                        <div class="rh2-card-title">${p.title}</div>
                    </div>
                </div>
                <div class="rh2-card-statband">
                    <div class="rh2-sband-cell"><span class="rh2-sband-ico">⏱</span><span class="rh2-sband-num">${readMin} dk</span></div>
                    <div class="rh2-sband-div"></div>
                    <div class="rh2-sband-cell"><span class="rh2-sband-ico">📝</span><span class="rh2-sband-num">${totalWords}</span><span class="rh2-sband-lbl">KELİME</span></div>
                    <div class="rh2-sband-div"></div>
                    <div class="rh2-sband-cell"><span class="rh2-sband-ico">💬</span><span class="rh2-sband-num">${sentences.length}</span><span class="rh2-sband-lbl">CÜMLE</span></div>
                    <div class="rh2-sband-div"></div>
                    <div class="rh2-sband-cell rh2-sband-max"><span class="rh2-sband-maxlbl">MAX:</span><span class="rh2-sband-maxnum">${vocCount}</span><span class="rh2-sband-maxsub">KELİME</span></div>
                </div>
                <div class="rh2-card-preview">${preview}</div>
                <div class="rh2-card-footer">
                    ${vocCount > 0 ? `<span class="rh2-pill rh2-pill-word">📖 ${vocCount} kelime</span>` : ''}
                    <span class="rh2-pill rh2-pill-ai">🤖 AI</span>
                    ${vocPills}
                    <button class="rh2-card-save-btn ${arşivde?'saved':''}" id="ai-save-btn-${i}" data-stop="true" data-action="_saveAIPasaj(${i})">${arşivde?'✅ Arşivde':'🗂 Arşivle'}</button>
                </div>
            </div>
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
    const btn   = _aid$id(`ai-save-btn-${index}`);

    if (!saved) {
        if (btn) { btn.textContent = '✅ Arşivde'; btn.classList.add('saved'); }
        return;
    }

    // paragraflar listesine de ekle (Yüklü Pasajlar tab'ında görünsün)
    const tempP = { baslik: p.title, metin: p.text, kelimeler: p.vocabulary || {}, _aiSaved: true };
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    if (exists < 0) paragraflar.unshift(tempP); // başa ekle — yeni pasaj ilk sıraya geçsin

    // LocalStorage'a da yaz (kalıcı)
    const allParagraflar = JSON.parse(localStorage.getItem('ydt_paragraflar') || '[]');
    if (!allParagraflar.find(x => x.baslik === p.title)) {
        allParagraflar.unshift(tempP); // localStorage'da da başa ekle
        localStorage.setItem('ydt_paragraflar', JSON.stringify(allParagraflar));
    }

    if (btn) {
        btn.textContent = '✅ Arşivde';
        btn.classList.add('saved');
        btn.disabled = true;
    }

    // Badge güncelle
    const cnt = $id('reading-hub-saved-count');
    if (cnt) cnt.textContent = `${paragraflar.length} pasaj`;

    if (typeof _showAppToast === 'function') _showAppToast('📥 Pasaj arşive eklendi!');
}
window._saveAIPasaj = _saveAIPasaj;


async function openAIDailyParagraf(index) {
    const passages = window._aiDailyPassages;
    if (!passages || !passages[index]) return;
    let p = passages[index];

    // Lazy AI analizi — henüz analiz edilmediyse şimdi yap
    if (p._needsAI && p._articleRef) {
        // Kart üzerinde yükleniyor göstergesi
        const card = _aid$id(`ai-card-${index}`);
        const footer = card?.querySelector('.rh2-card-footer');
        if (footer) footer.innerHTML = `<span class="rh2-pill rh2-pill-ai" style="animation:pulse 1s infinite">🤖 Analiz ediliyor...</span>`;

        try {
            if (typeof aiCall === 'function') {
                const article = p._articleRef;
                const aiData = await Promise.race([
                    _analyzeWithAI(article._text || article.description || '', article.title || ''),
                    new Promise(res => setTimeout(() => res(null), 12000))
                ]);
                if (aiData) {
                    // Pasajı AI verisi ile güncelle
                    const updated = _toPassageSync(article, aiData);
                    passages[index] = { ...updated, _needsAI: false };
                    p = passages[index];

                    // Kartı güncelle
                    if (card && footer) {
                        const vocEntries = Object.entries(p.vocabulary || {});
                        const vocPills = vocEntries.slice(0, 5).map(([eng, tr]) =>
                            `<span class="rh2-pill rh2-pill-voc" title="${tr}">${eng}</span>`).join('');
                        footer.innerHTML = `
                            ${vocEntries.length > 0 ? `<span class="rh2-pill rh2-pill-word">📖 ${vocEntries.length} kelime</span>` : ''}
                            <span class="rh2-pill rh2-pill-level">${p.level || 'B2'}</span>
                            <span class="rh2-pill rh2-pill-ai">✅ AI Analiz</span>
                            ${vocPills}`;
                    }
                } else {
                    p._needsAI = false; // başarısız, tekrar deneme
                }
            }
        } catch(e) {
            p._needsAI = false;
            console.warn('[openAIDailyParagraf] AI analiz başarısız:', e.message);
        }
    }

    // Build a temporary paragraf object and show it
    // Vocabulary normalize + placeholder key temizle + translation cache onceden doldur
    const rawVoc = p.vocabulary || {};
    const PLACEHOLDER_KEYS = new Set(['word','english_word','english','turkish','tr','key','vocab','term','placeholder']);
    const normalizedVoc = {};
    for (const [eng, tr] of Object.entries(rawVoc)) {
        const k = eng.trim().toLowerCase();
        // Placeholder key'leri atla
        if (PLACEHOLDER_KEYS.has(k)) continue;
        if (k.length <= 2) continue;
        normalizedVoc[k]          = tr;
        normalizedVoc[eng.trim()] = tr;
        if (!_translationCache[k]) _translationCache[k] = tr;
    }
    const tempP = {
        baslik:    p.title,
        metin:     p.text,
        kelimeler: normalizedVoc
    };

    // Paragrafı geçici olarak diziye ekle — okuma moduna geçebilmek için
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    if (exists >= 0) {
        paragraflar[exists] = tempP; // güncelle
    } else {
        paragraflar.unshift(tempP); // başa ekle — arşivlenirse ilk sırada görünsün
    }

    // Async işlemlerden (Firebase, _saveData) index kaymasını önlemek için
    // push/update sonrası title'a göre index'i yeniden bul
    const finalIdx = paragraflar.findIndex(x => x.baslik === p.title);
    if (finalIdx >= 0) {
        showParagrafOku(finalIdx);
    }
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

window.aiDailyGenerateParagraflar = aiDailyGenerateParagraflar;
window.openAIDailyParagraf = openAIDailyParagraf;

// =====================================================================
// KELIME HOVER SISTEMI — Her zaman aktif, toggle yok
// c1-word : vocabulary kelimesi — data-tr aninda mevcut, CSS tooltip
// w-span  : diger kelimeler    — JS tooltip + AI fetch
// =====================================================================
let _translateTooltip = null;
let _translateBound   = false;
let _hoverTimer       = null;
const _translationCache = {};

/* Tooltip DOM elemanini bir kez olustur */
function _ensureTooltip() {
    if (_translateTooltip) return;
    _translateTooltip = document.createElement('div');
    _translateTooltip.id = 'translate-hover-tip';
    _translateTooltip.style.cssText = 'position:fixed;background:#1e293b;color:#fff;'
        + 'padding:6px 14px;border-radius:10px;font-size:.82rem;font-weight:700;'
        + 'pointer-events:none;z-index:99999;opacity:0;transition:opacity 0.15s;'
        + 'box-shadow:0 4px 20px rgba(0,0,0,.35);max-width:260px;'
        + 'white-space:normal;text-align:center;display:none';
    document.body.appendChild(_translateTooltip);
}

/* p-oku-metin uzerine listener'lari bir kez bagla */
function _bindWordHoverListeners(metinEl) {
    _ensureTooltip();
    if (_translateBound) return;
    metinEl.addEventListener('mouseover', _onWordHover);
    metinEl.addEventListener('mouseout',  _onWordOut);
    metinEl.addEventListener('click',     _onWordClick);
    _translateBound = true;
}

function _onWordHover(e) {
    clearTimeout(_hoverTimer);
    const el = e.target;
    // Sadece c1-word: vocabulary kelimesi — data-tr aninda mevcut
    if (el.classList.contains('c1-word')) {
        const tr = el.dataset.tr;
        if (tr) _showTranslateTip(el.dataset.word || el.textContent.trim(), e.clientX, e.clientY, false, tr);
    }
}

function _onWordOut(e) {
    clearTimeout(_hoverTimer);
    if (_translateTooltip) {
        _translateTooltip.style.opacity = '0';
        setTimeout(() => { if (_translateTooltip) _translateTooltip.style.display = 'none'; }, 160);
    }
}

function _onWordClick(e) {
    const el = e.target;
    // Sadece c1-word tiklama: tooltip'i pinle
    if (el.classList.contains('c1-word')) {
        const tr = el.dataset.tr;
        if (tr) _showTranslateTip(el.dataset.word || el.textContent.trim(), e.clientX, e.clientY, true, tr);
        return;
    }
    // p-sentence: Grammar X-Ray devralir — tooltip kapat
    if (el.classList.contains('p-sentence')) {
        if (_translateTooltip) { _translateTooltip.style.opacity = '0'; _translateTooltip.style.display = 'none'; }
    }
}

function _showTranslateTip(word, x, y, pinned, knownTr) {
    _ensureTooltip();
    if (!_translateTooltip) return;
    const key    = (word || '').toLowerCase();
    const p      = paragraflar[currentParagrafIndex];
    const vocTr  = p && p.kelimeler ? (p.kelimeler[key] || p.kelimeler[word]) : null;
    const cached = _translationCache[key];
    const display = knownTr || vocTr || cached || null;
    _translateTooltip.innerHTML = display
        ? '<span style="color:#94a3b8;font-size:.68rem;font-weight:600;letter-spacing:.04em;">TR</span><br>' + display
        : '<span style="color:#94a3b8;font-size:.68rem;">ceviriliyor...</span>';
    _translateTooltip.style.display = 'block';
    _translateTooltip.style.left    = Math.min(x + 12, window.innerWidth - 220) + 'px';
    _translateTooltip.style.top     = Math.max(y - 56, 8) + 'px';
    _translateTooltip.style.opacity = '1';
    if (!display) _fetchWordTranslation(word);
}

async function _fetchWordTranslation(word) {
    const key = (word || '').toLowerCase();
    if (_translationCache[key] && _translationCache[key] !== 'ceviriliyor...') return;
    const p     = paragraflar[currentParagrafIndex];
    const vocTr = p && p.kelimeler ? (p.kelimeler[key] || p.kelimeler[word]) : null;
    if (vocTr) { _translationCache[key] = vocTr; _updateTooltipIfShowing(key); return; }
    if (typeof aiCall !== 'function') { _translationCache[key] = '-'; return; }
    _translationCache[key] = 'ceviriliyor...';
    try {
        const result = await aiCall('Translate the English word "' + word + '" to Turkish. Reply ONLY with JSON: {"tr":"Turkish meaning (max 3 words)"}');
        _translationCache[key] = (result && result.tr ? result.tr : '-').trim();
    } catch(e) { _translationCache[key] = '-'; }
    _updateTooltipIfShowing(key);
}

function _updateTooltipIfShowing(key) {
    if (!_translateTooltip || _translateTooltip.style.opacity !== '1') return;
    const tr = _translationCache[key];
    if (tr && _translateTooltip.innerHTML.includes('ceviriliyor')) {
        _translateTooltip.innerHTML = '<span style="color:#94a3b8;font-size:.68rem;font-weight:600;letter-spacing:.04em;">TR</span><br>' + tr;
    }
}

/* Backward compat — buton varsa Acik goster */
function toggleTranslateMode() {
    const btn = $id('translate-mode-btn');
    if (btn) {
        btn.innerHTML = 'Ceviri: <span style="color:#10b981;font-weight:800;">Acik</span>';
        btn.style.borderColor = '#10b981';
        btn.style.background  = '#d1fae5';
        btn.style.color       = '#059669';
    }
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

// ── Window Exports (defer uyumluluğu) ────────────────────────────
window.toggleTranslateMode = toggleTranslateMode;
