// ════════════════════════════════════════════════════════════════
//  rss_paragraf.js  —  YDT Master  v3.0
//
//  • Her çekimde 6 paragraf (RSS + gerekirse statik tamamlama)
//  • CORS proxy'ler paralel denenir, 4 sn timeout
//  • AI ile kelime + seviye analizi
//  • localStorage günlük cache
//  • Firebase Realtime DB tam sync:
//      ydt_users/{uid}/rssArsiv       ← tüm çekilen pasajlar (max 300)
//      ydt_users/{uid}/paragraflar    ← arşive eklenenler
//      ydt_users/{uid}/paragrafSorular ← mevcut sistem zaten yazıyor
// ════════════════════════════════════════════════════════════════

/* ── RSS Kaynakları ─────────────────────────────────────────── */
const RSS_SOURCES = [
    { name: 'BBC Science',     url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', icon: '🌿' },
    { name: 'The Guardian',    url: 'https://www.theguardian.com/science/rss',                       icon: '🧪' },
    { name: 'NASA News',       url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',                icon: '🚀' },
    { name: 'NPR Science',     url: 'https://feeds.npr.org/1007/rss.xml',                            icon: '📡' },
    { name: 'Sci. American',   url: 'https://rss.sciam.com/ScientificAmerican-Global',               icon: '🔬' },
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/stories.rss',                  icon: '🤖' }
];

/* ── CORS Proxy'leri ────────────────────────────────────────── */
const RSS_PROXIES = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`
];

/* ── Yardımcılar ────────────────────────────────────────────── */
function _rssToday() { return new Date().toISOString().slice(0, 10); }

function _parseXML(xmlStr) {
    try {
        const doc   = new DOMParser().parseFromString(xmlStr, 'text/xml');
        const items = Array.from(doc.querySelectorAll('item'));
        return items.map(el => {
            const g = tag => {
                const node = el.querySelector(tag);
                return node ? (node.textContent || '').replace(/<[^>]+>/g, '').trim() : '';
            };
            return { title: g('title'), description: g('description'), link: g('link'), pubDate: g('pubDate') };
        }).filter(i => i.title && i.description.length > 60);
    } catch(_) { return []; }
}

function _parseRSS2JSON(data) {
    if (!data || !data.items) return [];
    return data.items.map(i => ({
        title:       (i.title       || '').replace(/<[^>]+>/g, '').trim(),
        description: (i.description || i.content || '').replace(/<[^>]+>/g, '').trim(),
        link:        i.link || '',
        pubDate:     i.pubDate || ''
    })).filter(i => i.title && i.description.length > 60);
}

/* ── Tek kaynaktan paralel proxy ile çek (4 sn timeout) ─────── */
async function _fetchOneSource(source) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), 4000);
    const tries = RSS_PROXIES.map(async makeProxy => {
        try {
            const res  = await fetch(makeProxy(source.url), { signal: controller.signal });
            if (!res.ok) return null;
            const data = await res.json();
            if (data.items) {
                const items = _parseRSS2JSON(data);
                if (items.length) return { source, items };
            }
            const xml = data.contents || (typeof data === 'string' ? data : null);
            if (xml) {
                const items = _parseXML(xml);
                if (items.length) return { source, items };
            }
        } catch(_) {}
        return null;
    });
    try {
        const winner = await Promise.any(tries);
        clearTimeout(timer);
        return winner;
    } catch(_) {
        clearTimeout(timer);
        return null;
    }
}

/* ── Tüm kaynaklardan paralel çek → count kadar makale ─────── */
async function _fetchAllRSS(count) {
    const results  = await Promise.allSettled(RSS_SOURCES.map(_fetchOneSource));
    const articles = [];
    const seed     = _rssToday().split('-').reduce((a, b) => a + parseInt(b), 0);
    for (const r of results) {
        if (articles.length >= count) break;
        if (r.status !== 'fulfilled' || !r.value) continue;
        const { source, items } = r.value;
        const pick = items[seed % items.length] || items[0];
        if (pick) articles.push({ ...pick, sourceName: source.name, sourceIcon: source.icon });
    }
    return articles;
}

/* ── Ham metni temizle ──────────────────────────────────────── */
function _cleanText(article) {
    let t = (article.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length < 100) t = article.title + '. ' + t;
    if (t.length > 700) t = t.slice(0, 700).replace(/\s\S+$/, '') + '…';
    return t;
}

/* ── Min 4 cümle kontrolü ───────────────────────────────────── */
function _hasMinSentences(text, min = 4) {
    const sentences = (text || '').match(/[^.!?]+[.!?]+/g) || [];
    return sentences.length >= min;
}

/* ── AI: kelime + seviye analizi ────────────────────────────── */
async function _analyzeWithAI(text, title) {
    const prompt =
`You are an expert English teacher for Turkish YDT exam students.
Analyze this passage and return ONLY valid JSON (no markdown).

Title: "${title}"
Text: "${text}"

Return exactly: {"level":"C1","levelNote":"Akademik söz varlığı yoğun","vocabulary":{"english_word":"Türkçe karşılık"}}

Rules:
- level: A2/B1/B2/C1/C2
- levelNote: max 8 Turkish words
- vocabulary: 8-10 hardest words FROM the text with accurate Turkish translations`;
    try {
        if (typeof getAIResponse === 'function') {
            const raw = await getAIResponse(prompt, { maxTokens: 500, json: true });
            return JSON.parse((raw || '').replace(/```json|```/g, '').trim());
        }
    } catch(_) {}
    return _vocabFallback(text);
}

const _SW = new Set('the a an and or but in on at to of for is are was were be been have has had do does did will would could should may might must can that this these those with from by as it its they their we our you your he she him her his i me my not no so if then than when where which who what how all any each more also about into after before during through because although however therefore thus'.split(' '));

function _vocabFallback(text) {
    const words = text.replace(/[^a-zA-Z\s]/g, '').toLowerCase().split(/\s+/)
                      .filter(w => w.length >= 7 && !_SW.has(w));
    const vocab = {};
    [...new Set(words)].slice(0, 10).forEach(w => { vocab[w] = '—'; });
    return { level: 'B2', levelNote: 'AI bağlantısı gerekli', vocabulary: vocab };
}

/* ── Makaleyi passage nesnesine dönüştür ────────────────────── */
async function _toPassage(article) {
    const text   = _cleanText(article);
    const aiData = await _analyzeWithAI(text, article.title);
    return {
        title:      article.title,
        topic:      article.sourceName,
        text,
        vocabulary: aiData.vocabulary || {},
        level:      aiData.level      || 'B2',
        levelNote:  aiData.levelNote  || '',
        sourceIcon: article.sourceIcon || '📰',
        sourceName: article.sourceName || '',
        link:       article.link       || '',
        pubDate:    article.pubDate    || new Date().toISOString(),
        savedAt:    Date.now(),
        _fromRSS:   true
    };
}

/* ══════════════════════════════════════════════════════════════
   FIREBASE SYNC
   ══════════════════════════════════════════════════════════════ */
async function _syncRSSToFirebase(passages) {
    try {
        const uid = window._currentUser?.uid;
        if (!uid || !window.db) return;
        const { ref, set, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

        // rssArsiv: yeni + eski birleştir (max 300)
        let existing = [];
        try {
            const snap = await get(ref(window.db, `ydt_users/${uid}/rssArsiv`));
            if (snap.exists()) existing = snap.val() || [];
        } catch(_) {}
        const merged = [...passages];
        existing.forEach(p => { if (!merged.some(m => m.title === p.title)) merged.push(p); });
        if (merged.length > 300) merged.length = 300;
        await set(ref(window.db, `ydt_users/${uid}/rssArsiv`), merged);

        // paragraflar (yüklü pasajlar)
        if (typeof paragraflar !== 'undefined' && paragraflar.length > 0) {
            await set(ref(window.db, `ydt_users/${uid}/paragraflar`), paragraflar);
        }

        // paragrafSorular (güvence)
        if (window.paragrafSorular && Object.keys(window.paragrafSorular).length > 0) {
            await set(ref(window.db, `ydt_users/${uid}/paragrafSorular`), window.paragrafSorular);
        }

        console.log(`[rss_paragraf] ✅ Firebase: ${merged.length} pasaj yazıldı`);
    } catch(e) {
        console.warn('[rss_paragraf] Firebase yazma hatası:', e.message);
    }
}

/* ── Firebase'den rssArsiv + paragraflar yükle ─────────────── */
async function _loadRSSFromFirebase() {
    try {
        const uid = window._currentUser?.uid;
        if (!uid || !window.db) return;
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

        // rssArsiv
        const snapRSS = await get(ref(window.db, `ydt_users/${uid}/rssArsiv`));
        if (snapRSS.exists()) {
            const remote = snapRSS.val() || [];
            localStorage.setItem(`ydt_${uid}_rss_arsiv`, JSON.stringify(remote));
            console.log(`[rss_paragraf] Firebase'den ${remote.length} RSS pasajı yüklendi`);
        }

        // paragraflar (yüklü pasajlar) — motor.js'deki diziye yaz
        const snapPara = await get(ref(window.db, `ydt_users/${uid}/paragraflar`));
        if (snapPara.exists()) {
            const remotePara = snapPara.val() || [];
            if (remotePara.length > 0) {
                localStorage.setItem('ydt_paragraflar', JSON.stringify(remotePara));
                // motor.js'deki paragraflar dizisine merge et
                if (typeof paragraflar !== 'undefined') {
                    remotePara.forEach(p => {
                        if (!paragraflar.some(x => x.baslik === p.baslik)) paragraflar.push(p);
                    });
                }
                console.log(`[rss_paragraf] Firebase'den ${remotePara.length} yüklü pasaj alındı`);
            }
        }
    } catch(e) {
        console.warn('[rss_paragraf] Firebase okuma hatası:', e.message);
    }
}

/* ── localStorage'a yaz ─────────────────────────────────────── */
function _saveToLS(passages) {
    const uid      = window._currentUser?.uid || 'guest';
    localStorage.setItem(`ydt_rss_cache_${_rssToday()}`, JSON.stringify(passages));
    let arsiv = [];
    try { arsiv = JSON.parse(localStorage.getItem(`ydt_${uid}_rss_arsiv`) || '[]'); } catch(_) {}
    passages.forEach(p => { if (!arsiv.some(a => a.title === p.title)) arsiv.unshift({ ...p, savedAt: Date.now() }); });
    if (arsiv.length > 300) arsiv.length = 300;
    localStorage.setItem(`ydt_${uid}_rss_arsiv`, JSON.stringify(arsiv));
}

/* ══════════════════════════════════════════════════════════════
   ANA FONKSİYON — motor.js generateAIDailyParagraflar override
   ══════════════════════════════════════════════════════════════ */
async function generateAIDailyParagraflar(force) {
    const todayKey = _rssToday();
    const cacheKey = `ydt_rss_cache_${todayKey}`;
    const listEl   = document.getElementById('ai-daily-paragraf-list');
    const badgeEl  = document.getElementById('ai-daily-date-badge');

    if (badgeEl) {
        const [y, m, d] = todayKey.split('-');
        badgeEl.textContent = `${d}.${m}.${y}`;
    }

    // Cache varsa hemen göster
    if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const p = JSON.parse(cached);
                if (p && p.length >= 1) { renderAIDailyParagraflar(p, listEl); return; }
            } catch(_) {}
        }
    }

    if (!listEl) return;
    if (listEl.style.display === 'none') listEl.style.display = 'grid';

    // Loading UI
    listEl.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:28px 16px;">
        <div style="font-size:2rem;margin-bottom:8px;">📰</div>
        <div style="font-weight:800;color:var(--ink);font-size:.9rem;margin-bottom:4px;">6 güncel haber yükleniyor…</div>
        <div style="font-size:.75rem;color:var(--ink3);margin-bottom:10px;">RSS kaynakları paralel taranıyor</div>
        <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">
          ${RSS_SOURCES.map(s => `<span style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:3px 9px;font-size:.65rem;font-weight:700;">${s.icon} ${s.name}</span>`).join('')}
        </div>
      </div>`;

    let passages = [];

    try {
        // RSS çek (paralel, hard 5 sn)
        const articles = await Promise.race([
            _fetchAllRSS(6),
            new Promise(res => setTimeout(() => res([]), 5000))
        ]);

        if (articles && articles.length > 0) {
            listEl.innerHTML = `
              <div style="grid-column:1/-1;text-align:center;padding:20px 16px;">
                <div style="font-size:1.4rem;margin-bottom:6px;">🤖</div>
                <div style="font-weight:800;color:var(--ink);font-size:.85rem;">AI kelime analizi yapılıyor…</div>
                <div style="font-size:.72rem;color:var(--ink3);margin-top:4px;">${articles.length} makale bulundu, işleniyor</div>
              </div>`;

            const raw = await Promise.race([
                Promise.all(articles.map(_toPassage)),
                new Promise(res => setTimeout(() => res([]), 10000))
            ]);
            passages = (raw || []).filter(p => p && p.text && _hasMinSentences(p.text, 4));
        }
    } catch(err) {
        console.warn('[rss_paragraf] fetch hatası:', err.message);
    }

    // Eksik slotları statik ile tamamla (6'ya çıkar)
    const staticPool = _getStaticPassages();
    let si = 0;
    while (passages.length < 6 && si < staticPool.length) {
        const fill = staticPool[si++];
        if (!passages.some(p => p.title === fill.title)) passages.push(fill);
    }
    if (!passages.length) passages = staticPool;

    // Kaydet
    _saveToLS(passages);
    _syncRSSToFirebase(passages); // async, render'ı bekletmez

    renderAIDailyParagraflar(passages, listEl);
}

/* ══════════════════════════════════════════════════════════════
   RENDER PATCH
   ══════════════════════════════════════════════════════════════ */
(function _patchRender() {
    const tryPatch = () => {
        if (typeof window.renderAIDailyParagraflar !== 'function') { setTimeout(tryPatch, 100); return; }
        const _orig = window.renderAIDailyParagraflar;
        window.renderAIDailyParagraflar = function(passages, listEl) {
            if (!listEl || !passages || !passages.length)  { _orig(passages, listEl); return; }
            if (!passages.some(p => p._fromRSS))           { _orig(passages, listEl); return; }

            const lvlClr = { A2:'#94a3b8', B1:'#22c55e', B2:'#3b82f6', C1:'#f97316', C2:'#e63946' };
            const fbIcons = ['🌿','🔬','🚀','🧪','📡','🤖'];

            listEl.innerHTML = passages.map((p, i) => {
                const voc     = Object.entries(p.vocabulary || {});
                const pills   = voc.slice(0, 4).map(([e,t]) => `<span class="rh2-pill rh2-pill-voc" title="${t}">${e}</span>`).join('');
                const wc      = (p.text || '').trim().split(/\s+/).length;
                const rm      = Math.ceil(wc / 180);
                const sents   = (p.text || '').match(/[^.!?]+[.!?]+/g) || [];
                const preview = sents.slice(0,2).join(' ').trim() || (p.text||'').slice(0,140)+'…';
                const saved   = typeof isAIPasajArşivde === 'function' ? isAIPasajArşivde(p.title) : false;
                const icon    = p.sourceIcon || fbIcons[i % fbIcons.length];
                const lc      = lvlClr[p.level] || '#6b7280';

                return `<div class="rh2-card" id="ai-card-${i}" style="position:relative;">
                    <div class="rh2-card-accent rh2-card-accent-ai" style="background:linear-gradient(135deg,#0ea5e9,#0284c7);"></div>
                    <div class="rh2-card-body" onclick="openAIDailyParagraf(${i})" style="cursor:pointer;">
                        <div class="rh2-card-header">
                            <div class="rh2-card-icon rh2-card-icon-ai">${icon}</div>
                            <div class="rh2-card-titlemeta">
                                <div class="rh2-card-title">${p.title}</div>
                                <div class="rh2-card-timing">
                                    ⏱ ${rm} dk · ${wc} kelime · ${sents.length} cümle &nbsp;·&nbsp;
                                    <span style="color:${lc};font-weight:800;">${p.level||'B2'}</span>
                                    ${p.levelNote ? `<span style="color:var(--ink3);font-size:.65rem;"> — ${p.levelNote}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="rh2-card-preview">${preview}</div>
                        <div class="rh2-card-footer">
                            ${voc.length ? `<span class="rh2-pill rh2-pill-word">📖 ${voc.length} kelime</span>` : ''}
                            <span class="rh2-pill" style="background:#e0f2fe;color:#0284c7;font-weight:800;">📰 ${p.sourceName||'RSS'}</span>
                            ${pills}
                            ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="rh2-pill" style="background:#f0fdf4;color:#16a34a;text-decoration:none;font-weight:800;">🔗 Kaynak</a>` : ''}
                        </div>
                    </div>
                    ${window._isAdmin() ? ('<button class="rh2-card-save-btn ' + (saved ? 'saved' : '') + '" id="ai-save-btn-' + i + '" onclick="event.stopPropagation(); _saveAIPasaj(' + i + ')" title="' + (saved ? 'Arşivde' : 'Yüklü Pasajlara Ekle') + '" style="position:absolute;bottom:14px;right:14px;">' + (saved ? '✅ Arşivde' : '📥 Arşive Ekle') + '</button>') : ''}
                </div>`;
            }).join('');

            window._aiDailyPassages = passages;
            if (typeof _updateRh2HeroStats === 'function') _updateRh2HeroStats();
        };
    };
    tryPatch();
})();

/* ── _saveData hook: her kayıtta paragraflar da Firebase'e ──── */
(function _hookSaveData() {
    const tryHook = () => {
        if (typeof window._saveData !== 'function') { setTimeout(tryHook, 300); return; }
        const _orig = window._saveData;
        window._saveData = function() {
            _orig();
            _syncParagraflarToFirebase();
        };
    };
    tryHook();
})();

async function _syncParagraflarToFirebase() {
    try {
        const uid = window._currentUser?.uid;
        if (!uid || !window.db) return;
        const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');
        if (typeof paragraflar !== 'undefined' && paragraflar.length > 0) {
            await set(ref(window.db, `ydt_users/${uid}/paragraflar`), paragraflar);
        }
        const arsiv = JSON.parse(localStorage.getItem(`ydt_${uid}_rss_arsiv`) || '[]');
        if (arsiv.length > 0) {
            await set(ref(window.db, `ydt_users/${uid}/rssArsiv`), arsiv.slice(0, 300));
        }
    } catch(_) {}
}

/* ── Tab label ──────────────────────────────────────────────── */
function _updateRSSTabLabel() {
    const tab = document.getElementById('rh-tab-ai');
    if (!tab) return;
    const icon = tab.querySelector('.rh2-tab-icon');
    if (icon) icon.textContent = '📰';
    tab.querySelectorAll('span:not(.rh2-tab-pill):not(.rh2-tab-icon)').forEach(el => {
        if (el.textContent.includes('AI') || el.textContent.includes('Günlük')) el.textContent = 'Günlük Haber';
    });
}

/* ── DOMContentLoaded ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(_updateRSSTabLabel, 400);
    // Auth hazır olunca Firebase'den yükle
    const t = setInterval(() => {
        if (window._currentUser !== undefined) {
            clearInterval(t);
            _loadRSSFromFirebase();
        }
    }, 500);
    setTimeout(() => clearInterval(t), 12000);
});

/* ── Static Fallback (6 pasaj) ──────────────────────────────── */
function _getStaticPassages() {
    return [
        {
            title: 'Microplastics Found in Human Brain Tissue',
            sourceName: 'BBC Science', sourceIcon: '🌿', _fromRSS: true,
            level: 'C1', levelNote: 'Tıp ve çevre bilimi terminolojisi',
            text: 'Scientists have discovered microplastics in human brain tissue for the first time, raising urgent concerns about the long-term neurological consequences of plastic pollution. The study, conducted by researchers at the University of New Mexico, found concentrations of tiny plastic particles in brain samples that were significantly higher than those detected in liver and kidney tissue. Experts warn that the blood-brain barrier, which ordinarily shields the central nervous system from harmful substances, may be increasingly compromised by nanoscale plastic fragments. While the precise mechanisms by which these particles cross this critical biological boundary remain under investigation, preliminary findings suggest a potential association with inflammatory responses in neural tissue.',
            vocabulary: { microplastics:'mikroplastikler', neurological:'nörolojik', concentration:'yoğunluk', barrier:'bariyer/engel', compromised:'tehlikeye girmiş', nanoscale:'nano ölçekli', inflammatory:'iltihaplı', preliminary:'ön/başlangıç', association:'ilişki/bağlantı', ordinarily:'normalde' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        },
        {
            title: 'James Webb Telescope Detects Water Vapour on Distant Exoplanet',
            sourceName: 'NASA News', sourceIcon: '🚀', _fromRSS: true,
            level: 'C1', levelNote: 'Astronomi söz varlığı yoğun',
            text: 'NASA\'s James Webb Space Telescope has detected water vapour in the atmosphere of a distant exoplanet located approximately 120 light-years from Earth, marking a significant milestone in the search for potentially habitable worlds. The planet, designated K2-18b, orbits within the habitable zone of its host star — the range of distances at which liquid water could theoretically exist on a planetary surface. Astronomers emphasise, however, that the presence of atmospheric water does not confirm biological activity, as numerous abiotic processes can generate similar chemical signatures. The discovery demonstrates the telescope\'s extraordinary capacity to characterise distant planetary atmospheres with unprecedented precision.',
            vocabulary: { exoplanet:'ötegezegen', habitable:'yaşanabilir', designated:'adlandırılmış', theoretical:'teorik', astronomers:'astronomlar', abiotic:'abiyotik', unprecedented:'emsalsiz', characterise:'nitelendirmek', precision:'hassasiyet', milestone:'dönüm noktası' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        },
        {
            title: 'AI Systems Outperform Doctors in Early Cancer Detection',
            sourceName: 'MIT Tech Review', sourceIcon: '🤖', _fromRSS: true,
            level: 'C2', levelNote: 'Tıp ve yapay zeka terminolojisi karmaşık',
            text: 'Artificial intelligence systems trained on millions of medical images are now demonstrating diagnostic accuracy that surpasses experienced radiologists in specific clinical contexts, according to a comprehensive meta-analysis published in The Lancet Digital Health. Researchers examined 69 studies comparing AI performance against human clinicians across a range of imaging modalities, including mammography and retinal disease detection. The analysis revealed that AI models achieved greater sensitivity and specificity in detecting early-stage malignancies. Nevertheless, medical ethicists caution against premature deployment of autonomous diagnostic systems, citing concerns about algorithmic bias and the irreplaceable value of the clinician-patient relationship.',
            vocabulary: { diagnostic:'tanısal', surpasses:'aşmak', radiologists:'radyologlar', modalities:'yöntemler', malignancies:'habis tümörler', sensitivity:'duyarlılık', specificity:'özgüllük', algorithmic:'algoritmik', premature:'erken/zamansız', autonomous:'otonom' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        },
        {
            title: 'The Hidden Intelligence of Forest Networks',
            sourceName: 'Sci. American', sourceIcon: '🔬', _fromRSS: true,
            level: 'C1', levelNote: 'Botanik ve ekoloji terminolojisi',
            text: 'Research into mycorrhizal networks — the vast webs of fungal filaments connecting tree root systems beneath forest floors — has fundamentally altered our understanding of how forests function as collective organisms. Pioneering work by ecologist Suzanne Simard demonstrated that mature trees, often called "mother trees," actively distribute carbon and nutrients through these subterranean highways to seedlings under stress. This reciprocal exchange suggests that forests possess a form of distributed intelligence, prioritising the survival of the broader community over individual competition. Critics argue that attributing intentionality to plant behaviour risks anthropomorphising biological processes, yet the adaptive complexity of these networks continues to challenge reductive models of plant life.',
            vocabulary: { mycorrhizal:'mikorizal', filaments:'iplikçikler', subterranean:'yeraltı', reciprocal:'karşılıklı', distributed:'dağıtık', prioritising:'önceliklendirmek', anthropomorphising:'insanileştirmek', adaptive:'uyarlanabilir', reductive:'indirgemeci', pioneering:'öncü' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        },
        {
            title: 'Urban Heat Islands and the Future of City Planning',
            sourceName: 'The Guardian', sourceIcon: '🧪', _fromRSS: true,
            level: 'B2', levelNote: 'Şehir planlama ve iklim değişikliği',
            text: 'Cities worldwide are increasingly experiencing urban heat island effects, where densely built areas record temperatures several degrees higher than surrounding rural landscapes due to the absorption and re-emission of heat by concrete, asphalt, and glass. Climate scientists warn that without significant intervention, many major metropolitan areas could become dangerously hot during summer months by mid-century. Progressive city planners are responding with green infrastructure initiatives, including mandatory rooftop gardens, expanded urban tree canopies, and permeable pavements that reduce surface heat accumulation. Studies from Singapore and Vienna suggest that strategic greening can lower local temperatures by up to four degrees Celsius.',
            vocabulary: { absorption:'emilim', metropolitan:'büyükşehir', infrastructure:'altyapı', mandatory:'zorunlu', permeable:'geçirgen', accumulation:'birikim', canopy:'örtü/taç', emission:'salım', intervention:'müdahale', strategic:'stratejik' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        },
        {
            title: 'The Neuroscience of Chronic Stress and Memory',
            sourceName: 'NPR Science', sourceIcon: '📡', _fromRSS: true,
            level: 'C2', levelNote: 'Nörobilim terminolojisi çok yoğun',
            text: 'Prolonged exposure to psychological stress triggers a cascade of neurochemical changes that can structurally remodel the hippocampus, the brain region most critical for forming and retrieving declarative memories. Elevated cortisol levels, sustained over weeks or months, have been shown to suppress neurogenesis — the production of new neurons — and to weaken synaptic connections between existing cells. Longitudinal studies tracking individuals through high-stress occupations reveal measurable reductions in hippocampal volume correlating with impaired recall performance. Research indicates that mindfulness-based interventions and regular aerobic exercise can partially reverse these structural changes by promoting neuroplasticity.',
            vocabulary: { neurochemical:'nörokimyasal', hippocampus:'hipokamp', declarative:'bildirimsel', neurogenesis:'nörogenez', synaptic:'sinaptik', longitudinal:'boylamsal', neuroplasticity:'nöroplastisite', adversity:'zorluk', correlating:'ilişkilendirmek', sustained:'sürdürülen' },
            link: '', pubDate: new Date().toISOString(), savedAt: Date.now()
        }
    ];
}

/* ── Admin kontrolü ─────────────────────────────────────────── */
// index.html'deki ADMIN_EMAIL ile aynı
const RSS_ADMIN_EMAIL = 'stasalan@gmail.com';
window._isAdmin = function() {
    const email = window._currentUser?.email || '';
    return email === RSS_ADMIN_EMAIL;
};

/* ── Global export ──────────────────────────────────────────── */
window.generateAIDailyParagraflar = generateAIDailyParagraflar;
window.RSS_SOURCES                 = RSS_SOURCES;
window._syncRSSToFirebase          = _syncRSSToFirebase;
window._loadRSSFromFirebase        = _loadRSSFromFirebase;

console.log('[rss_paragraf.js v3] ✅ 6 paragraf + min 4 cümle + admin arşiv + Firebase sync aktif');
