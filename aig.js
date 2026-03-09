// ── AI paragraf üretici — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

// AI PARAGRAF ÜRETİCİ — Kullanıcı isteğiyle tek paragraf üretir
// ═══════════════════════════════════════════════════════════════

const AIG_TOPICS = [
    { icon: '🔬', label: 'Biology',      query: 'biology and genetics' },
    { icon: '🤖', label: 'AI & Tech',    query: 'artificial intelligence and robotics' },
    { icon: '🎮', label: 'Gaming',        query: 'video game design and psychology' },
    { icon: '🌌', label: 'Space',         query: 'space exploration and astrophysics' },
    { icon: '🧠', label: 'Neuroscience', query: 'neuroscience and human cognition' },
    { icon: '⚡', label: 'Energy',        query: 'renewable energy and climate tech' },
    { icon: '🏛️', label: 'History',       query: 'ancient civilizations and archaeology' },
    { icon: '💊', label: 'Medicine',      query: 'medical breakthroughs and biotech' },
    { icon: '🌊', label: 'Ocean',         query: 'ocean science and marine biology' },
    { icon: '🎭', label: 'Psychology',    query: 'psychology and behavioral science' },
    { icon: '🔭', label: 'Physics',       query: 'quantum physics and particle science' },
    { icon: '🕹️', label: 'Indie Games',   query: 'indie game development and storytelling' },
];

let _aigSelectedTopic = null;
let _aigGeneratedPassage = null;

async function _aigInitTopics() {
    const grid = document.getElementById('aig-topics-grid');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = AIG_TOPICS.map((t, i) =>
        `<button class="aig-topic-chip" data-idx="${i}" data-action="aigSelectTopic(${i})">
            <span class="aig-tc-icon">${t.icon}</span>${t.label}
        </button>`
    ).join('');
    // Kota bilgisini panel başına ekle (admin hariç)
    if (!(await _isAdminUser())) {
        const quota = _aigGetQuota();
        const remaining = AIG_DAILY_LIMIT - quota.count;
        const subEl = document.querySelector('.aig-panel-sub');
        if (subEl && !document.getElementById('aig-panel-quota')) {
            const quotaSpan = document.createElement('div');
            quotaSpan.id = 'aig-panel-quota';
            quotaSpan.style.cssText = 'margin-top:6px;font-size:.7rem;font-weight:800;';
            quotaSpan.innerHTML = remaining > 0
                ? `<span style="color:var(--c-green)">✅ Bugün ${remaining}/${AIG_DAILY_LIMIT} hakkın var</span>`
                : `<span style="color:#dc2626">⛔ Günlük limit doldu — yarın tekrar gel</span>`;
            subEl.after(quotaSpan);
        }
        if (remaining <= 0) {
            const btn = document.getElementById('aig-gen-btn');
            if (btn) btn.disabled = true;
        }
    }
}

function aigSelectTopic(idx) {
    _aigSelectedTopic = idx;
    document.querySelectorAll('.aig-topic-chip').forEach((el, i) =>
        el.classList.toggle('active', i === idx));
    // Custom inputu temizle
    const inp = document.getElementById('aig-custom-topic');
    if (inp) inp.value = '';
}

// ── Paragraf üretim kotası ──────────────────────
const AIG_QUOTA_KEY = () => getUserKey ? getUserKey('aig_quota') : 'ydt_aig_quota';
const AIG_DAILY_LIMIT = 5;

function _aigGetQuota() {
    try {
        const raw = localStorage.getItem(AIG_QUOTA_KEY());
        if (raw) { const q = JSON.parse(raw); if (q.date === _ukmToday()) return q; }
    } catch(e) {}
    return { date: _ukmToday(), count: 0 };
}
function _aigSaveQuota(q) { localStorage.setItem(AIG_QUOTA_KEY(), JSON.stringify(q)); }
// _isAdminUser: Firebase custom claim (admin:true) kontrolü
async function _isAdminUser() {
    const user = window._currentUser || (typeof firebase !== 'undefined' && firebase.auth?.().currentUser) || null;
    if (!user) return false;
    try {
        const token = await user.getIdTokenResult();
        return token.claims.admin === true;
    } catch(e) {
        console.warn('[aig] Admin claim kontrol hatası:', e.message);
        return false;
    }
}

async function aiGenerateParagraf(random = false) {
    const btn = document.getElementById('aig-gen-btn');
    const lblEl = document.getElementById('aig-gen-btn-label');
    const previewEl = document.getElementById('aig-preview');

    // ── Kota kontrolü (admin hariç 5/gün) ──
    if (!(await _isAdminUser())) {
        const quota = _aigGetQuota();
        if (quota.count >= AIG_DAILY_LIMIT) {
            showAIToast(`Günlük ${AIG_DAILY_LIMIT} paragraf limitine ulaştınız. Yarın tekrar deneyin.`, 'warn');
            return;
        }
    }

    // Konu belirle
    let topic = '';
    if (random) {
        const t = AIG_TOPICS[Math.floor(Math.random() * AIG_TOPICS.length)];
        topic = t.query;
        // Chip seç
        const idx = AIG_TOPICS.indexOf(t);
        aigSelectTopic(idx);
    } else {
        const customInp = (document.getElementById('aig-custom-topic')?.value || '').trim();
        if (customInp) {
            topic = customInp;
            // Chip seçimini kaldır
            document.querySelectorAll('.aig-topic-chip').forEach(el => el.classList.remove('active'));
            _aigSelectedTopic = null;
        } else if (_aigSelectedTopic !== null) {
            topic = AIG_TOPICS[_aigSelectedTopic].query;
        } else {
            showAIToast('Lütfen bir konu seçin veya yazın!', 'warn'); return;
        }
    }

    // Loading state
    btn.disabled = true;
    lblEl.innerHTML = '<span class="aig-btn-spinner"></span> Üretiliyor…';
    previewEl.style.display = 'none';

    const prompt = `You are an expert English language teacher. Create ONE original C1/C2 level reading passage about: "${topic}".

Requirements:
- Exactly 6-8 sentences, 130-170 words
- Sophisticated academic vocabulary
- Engaging and informative
- Clear topic sentence
- Include 8-12 key vocabulary words from the text

Respond ONLY with valid JSON:
{
  "title": "Concise descriptive title (max 7 words)",
  "text": "The full passage text here...",
  "vocabulary": {
    "word1": "Türkçe karşılık",
    "word2": "Türkçe karşılık"
  }
}`;

    try {
        const result = await aiCall(prompt);

        if (!result.title || !result.text) throw new Error('Geçersiz yanıt');

        _aigGeneratedPassage = {
            title: result.title,
            text: result.text,
            vocabulary: result.vocabulary || {},
            topic
        };

        // Kota artır (admin hariç)
        if (!(await _isAdminUser())) {
            const quota = _aigGetQuota();
            quota.count++;
            _aigSaveQuota(quota);
            // Badge güncelle
            _aigUpdateQuotaBadge();
        }

        _aigRenderPreview(_aigGeneratedPassage);
        previewEl.style.display = 'block';
        setTimeout(() => previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

    } catch(e) {
        showAIToast('Paragraf üretilemedi: ' + (e.message || ''), 'error');
    }

    btn.disabled = false;
    lblEl.textContent = '✨ Paragraf Oluştur';
}

async function _aigRenderPreview(p) {
    const previewEl = document.getElementById('aig-preview');
    if (!previewEl) return;

    const vocab = Object.entries(p.vocabulary || {});
    const wordCount = p.text.trim().split(/\s+/).length;
    const sentences = p.text.match(/[^.!?]+[.!?]+/g) || [];
    const readMin   = Math.ceil(wordCount / 180);

    // Kelime highlight — c1-word span ile (mevcut CSS kullanılıyor)
    let highlightedText = p.text;
    vocab.forEach(([eng, tr]) => {
        const regex = new RegExp(`\\b(${eng.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex,
            `<span class="c1-word" data-tr="${tr}" style="cursor:pointer;">$1</span>`);
    });

    // Cümleleri paragrafSentences[] global'e yaz — analyzeGrammarXRay okuyabilsin
    const rawSentences = p.text.match(/[^.!?]+[.!?]+/g) || [];
    paragrafSentences = rawSentences.map(s => s.trim());

    // Cümleleri tıklanabilir yap (Grammar X-Ray çağırıyor)
    let sentIdx = 0;
    const sentHighlight = highlightedText.replace(/([^.!?]+[.!?]+)/g, (match) => {
        const idx = sentIdx++;
        return `<span class="p-sentence" data-idx="${idx}" data-action="aigPreviewGrammarXRay(${idx})" style="cursor:pointer;" title="Tıkla: Grammar X-Ray">` + match + `</span> `;
    });

    const vocPills = vocab.map(([eng, tr]) =>
        `<span class="aig-vocab-pill" data-tr="${_esc(tr)}" title="${_esc(tr)}">${_esc(eng)}</span>`
    ).join('');

    const vocCheckboxes = vocab.map(([eng, tr]) =>
        `<label class="aig-wl-chip"><input type="checkbox" class="aig-wl-check" value="${_esc(eng)}" data-tr="${_esc(tr)}" checked><span class="aig-wl-eng">${_esc(eng)}</span><span class="aig-wl-tr">${_esc(tr)}</span></label>`
    ).join('');

    const isAdmin = await _isAdminUser();
    const quota   = _aigGetQuota();
    const remaining = AIG_DAILY_LIMIT - quota.count;
    const quotaHTML = !isAdmin ? `<div class="aig-quota-info">${remaining > 0 ? `<span style="color:var(--c-green)">✅ Bugün ${remaining} paragraf hakkın kaldı</span>` : `<span style="color:#dc2626">⚠️ Günlük limit doldu (${AIG_DAILY_LIMIT}/${AIG_DAILY_LIMIT})</span>`}</div>` : '';

    const ukmLists = Object.keys(_ukmGetLists());
    const listOptions = ukmLists.length
        ? ukmLists.map(n => `<option value="${_esc(n)}">${_esc(n)}</option>`).join('')
        : `<option value="">— Önce Profil'den liste oluşturun —</option>`;

    previewEl.innerHTML = `
    <div class="aig-result-card">
        <div class="aig-result-hero">
            <div class="aig-result-badge">✨ AI Üretim · C1/C2</div>
            <div class="aig-result-title">${_esc(p.title)}</div>
            <div class="aig-result-meta">⏱ ${readMin} dk · ${wordCount} kelime · ${sentences.length} cümle · ${vocab.length} voc</div>
        </div>
        <div class="aig-result-body">
            <div class="aig-result-text">${sentHighlight}</div>
            ${vocab.length > 0 ? `
            <div class="aig-wordlist-section">
                <div class="aig-vocab-title" style="margin-bottom:10px;">📌 Kelime Listene Ekle</div>
                <div class="aig-wl-chips">${vocCheckboxes}</div>
                <div class="aig-wl-actions">
                    <select id="aig-wl-target" class="aig-wl-select"><option value="">— Liste seçin —</option>${listOptions}</select>
                    <button class="aig-action-btn primary" data-action="aigAddWordsToList()" style="flex:0 0 auto;padding:9px 14px;">➕ Seçilenleri Ekle</button>
                </div>
                <div id="aig-wl-result" style="font-size:.72rem;font-weight:700;color:var(--c-green);margin-top:6px;display:none;"></div>
            </div>` : ''}

            <!-- ── Grammar X-Ray Panel (inline, aynı sayfada) ── -->
            <div id="aig-grammar-panel" style="display:none; margin-top:16px; padding-top:16px; border-top:1.5px solid var(--border);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <div class="aig-vocab-title" style="margin:0;">⚙️ Grammar X-Ray</div>
                    <button data-hide-id="aig-grammar-panel"
                        style="border:none;background:none;cursor:pointer;font-size:.8rem;color:var(--ink3);font-family:inherit;font-weight:700;">✕ Kapat</button>
                </div>
                <div id="aig-grammar-content">
                    <div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:16px;">
                        Bir cümleye tıkla → Grammar X-Ray analizi
                    </div>
                </div>
            </div>
        </div>
        <div class="aig-result-actions">
            <button class="aig-action-btn primary" data-action="aigOpenReading()">📖 Okumaya Başla</button>
            <button class="aig-action-btn" data-action="aigSavePassage()" id="aig-save-btn">💾 Arşive Kaydet</button>
            <button class="aig-action-btn" data-action="aiGenerateParagraf(true)">🎲 Yeniden Üret</button>
        </div>
        ${quotaHTML}
    </div>`;
}

// Üretilen pasajı okuma moduna aç
function aigOpenReading() {
    if (!_aigGeneratedPassage) return;
    const p = _aigGeneratedPassage;
    const tempP = { baslik: p.title, metin: p.text, kelimeler: p.vocabulary };
    const exists = paragraflar.findIndex(x => x.baslik === p.title);
    let idx;
    if (exists >= 0) { idx = exists; }
    else { paragraflar.push(tempP); idx = paragraflar.length - 1; }
    showParagrafOku(idx);
}

// Arşive kaydet
function aigSavePassage() {
    if (!_aigGeneratedPassage) return;
    const saved = saveAIPasajToArsiv(_aigGeneratedPassage);
    const btn = document.getElementById('aig-save-btn');
    if (saved) {
        showAIToast('✅ Yüklü Pasajlara kaydedildi!', 'info', 2500);
        if (btn) { btn.textContent = '✅ Kaydedildi'; btn.disabled = true; }
    } else {
        showAIToast('Bu pasaj zaten arşivde.', 'warn', 2000);
        if (btn) { btn.textContent = '✅ Zaten Kayıtlı'; btn.disabled = true; }
    }
}

// ── Paragraftan kelime listesine ekle ────────────────────────
function aigAddWordsToList() {
    const targetSel = document.getElementById('aig-wl-target');
    const listName  = targetSel?.value;
    if (!listName) { showAIToast('Önce bir liste seçin!', 'warn'); return; }

    const checks = document.querySelectorAll('.aig-wl-check:checked');
    if (!checks.length) { showAIToast('Eklenecek kelime seçmediniz!', 'warn'); return; }

    const lists = _ukmGetLists();
    if (!lists[listName]) { showAIToast('Liste bulunamadı!', 'warn'); return; }

    let added = 0, skipped = 0;
    checks.forEach(cb => {
        const eng = cb.value;
        const tr  = cb.dataset.tr || '—';
        if (lists[listName].length >= UKM_MAX_WORDS_PER_LIST) { skipped++; return; }
        if (lists[listName].some(w => w.eng.toLowerCase() === eng.toLowerCase())) { skipped++; return; }
        lists[listName].push({
            eng, tr, pos: 'n', level: 'C1',
            phonetic: '', mnemonic: '', story: '',
            errorCount: 0, correctStreak: 0,
            sm2_ef: 2.5, sm2_interval: 0, sm2_next: null
        });
        added++;
    });

    _ukmSaveLists(lists);

    const resultEl = document.getElementById('aig-wl-result');
    if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.textContent = added > 0
            ? `✅ ${added} kelime "${listName}" listesine eklendi!${skipped > 0 ? ` (${skipped} zaten vardı/limit)` : ''}`
            : `⚠️ Hiç kelime eklenemedi — limit dolu veya zaten mevcut.`;
        resultEl.style.color = added > 0 ? 'var(--c-green)' : '#dc2626';
    }
    if (added > 0) showAIToast(`✅ ${added} kelime eklendi!`, 'info', 2000);
}

// ── Kota badge güncelle ──────────────────────────────────────
async function _aigUpdateQuotaBadge() {
    if (await _isAdminUser()) return;
    const quota = _aigGetQuota();
    const remaining = AIG_DAILY_LIMIT - quota.count;
    const el = document.getElementById('aig-quota-info');
    if (!el) return;
    el.innerHTML = remaining > 0
        ? `<span style="color:var(--c-green)">✅ Bugün ${remaining} paragraf hakkın kaldı</span>`
        : `<span style="color:#dc2626">⚠️ Günlük limit doldu (${AIG_DAILY_LIMIT}/${AIG_DAILY_LIMIT})</span>`;
}

// Kota badge helper

// ── AI Preview — Inline Grammar X-Ray ──────────────────────
async function aigPreviewGrammarXRay(sentenceIdx) {
    const sentence = paragrafSentences[sentenceIdx];
    if (!sentence || sentence.trim().length < 6) return;

    // Aktif cümleyi vurgula
    document.querySelectorAll('#aig-preview .p-sentence.psa').forEach(s => s.classList.remove('psa'));
    const activeSpan = document.querySelector(`#aig-preview .p-sentence[data-idx="${sentenceIdx}"]`);
    if (activeSpan) activeSpan.classList.add('psa');

    const panel   = document.getElementById('aig-grammar-panel');
    const content = document.getElementById('aig-grammar-content');
    if (!panel || !content) return;

    panel.style.display = 'block';
    content.innerHTML = '<div class="p-grammar-loading"><span style="font-size:1.5rem;animation:spin 1s linear infinite;display:inline-block">⚙️</span><span>Analiz ediliyor...</span></div>';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        const r = await geminiCall(`
Sen bir İngilizce dilbilgisi uzmanısın. Aşağıdaki cümleyi dilbilgisel olarak analiz et.

Cümle: "${sentence.trim()}"

SADECE şu JSON formatını döndür:
{
  "tense": "Zaman ve yapı adı (Türkçe ve İngilizce)",
  "voice": "active" | "passive",
  "clause_count": sayı,
  "clauses": [
    {"type": "main clause" | "subordinate clause" | "relative clause" | "conditional clause", "text": "cümle parçası", "color": "hex renk kodu"}
  ],
  "conjunctions": [{"word": "kelime", "role": "Türkçe açıklama"}],
  "relative_clauses": ["varsa relative clause metinleri"],
  "formula": "Cümle yapısı formülü (örn: S + have + been + V3 + by + O)",
  "tr_translation": "Cümlenin Türkçe çevirisi",
  "tip": "YDT sınavı için 1 cümlelik not"
}`);

        const voiceIcon = r.voice === 'passive' ? '🔄 Passive' : '✅ Active';
        const clauseColors = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444'];

        content.innerHTML = `
            <div class="gx-sentence-box">"${_esc(sentence.trim())}"</div>
            <div class="gx-tr">${_esc(r.tr_translation || '')}</div>
            <div class="gx-grid">
                <div class="gx-chip"><span class="gx-chip-label">⏰ Zaman</span><span class="gx-chip-val">${_esc(r.tense)}</span></div>
                <div class="gx-chip"><span class="gx-chip-label">🔄 Voice</span><span class="gx-chip-val">${_esc(voiceIcon)}</span></div>
                <div class="gx-chip" style="grid-column:1/-1;"><span class="gx-chip-label">🧮 Formül</span><span class="gx-chip-val" style="font-family:monospace;font-size:.82rem;">${_esc(r.formula || '—')}</span></div>
            </div>
            ${(r.clauses||[]).length ? `
            <div class="gx-section-title">📐 Clause Yapısı</div>
            <div class="gx-clauses">
                ${r.clauses.map((cl, i) => `
                    <div class="gx-clause" style="border-left-color:${cl.color || clauseColors[i%5]};">
                        <span class="gx-clause-type" style="color:${cl.color || clauseColors[i%5]};">${_esc(cl.type)}</span>
                        <span class="gx-clause-text">"${_esc(cl.text)}"</span>
                    </div>`).join('')}
            </div>` : ''}
            ${(r.conjunctions||[]).length ? `
            <div class="gx-section-title">🔗 Bağlaçlar</div>
            <div class="gx-tags">
                ${r.conjunctions.map(c => `<span class="gx-tag gx-tag-conj"><strong>${_esc(c.word)}</strong> — ${_esc(c.role)}</span>`).join('')}
            </div>` : ''}
            ${(r.relative_clauses||[]).length ? `
            <div class="gx-section-title">🔀 Relative Clause</div>
            <div class="gx-tags">
                ${r.relative_clauses.map(rc => `<span class="gx-tag gx-tag-rel">${_esc(rc)}</span>`).join('')}
            </div>` : ''}
            ${r.tip ? `<div class="gx-tip">💡 YDT Notu: ${_esc(r.tip)}</div>` : ''}
        `;
    } catch(e) {
        content.innerHTML = `<div style="color:var(--red);font-size:.84rem;padding:10px;">⚠ Analiz başarısız: ${e.message}</div>`;
    }
}

// ── Window Exports ────────────────────────────────────────────────
window.aiGenerateParagraf    = aiGenerateParagraf;
window.aigPreviewGrammarXRay = aigPreviewGrammarXRay;
