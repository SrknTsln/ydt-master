// JSON güvenli parse — bozuk veri, tarayıcı eklentisi veya AI hatası uygulamayı çökertemez
function safeJsonParse(str, fallback = null) {
    if (str == null) return fallback;
    try { return JSON.parse(str); } catch(e) { return fallback; }
}

// XSS koruma yardımcısı
function _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── AI cascade + providers — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

// 🤖 AI CASCADE SİSTEMİ
// Sıra: Gemini → Groq → OpenRouter → Mistral
// Kota/rate-limit hatası → otomatik sonraki provider
// ══════════════════════════════════════════════════════

function isQuotaError(msg) {
    const m = (msg || '').toLowerCase();
    return m.includes('quota') || m.includes('429') || m.includes('rate') ||
           m.includes('resource_exhausted') || m.includes('too many') ||
           m.includes('limit exceeded') || m.includes('overloaded');
}

// ── Toast Kuyruğu — birden fazla işlem aynı anda tamamlandığında üst üste binmeyi önler
const _toastQueue  = [];
let   _toastActive = false;
const TOAST_MAX_QUEUE = 3;   // Daha fazlası düşer (flood koruması)

function _toastNext() {
    if (_toastQueue.length === 0) { _toastActive = false; return; }
    _toastActive = true;
    const { msg, type, duration } = _toastQueue.shift();

    let t = document.getElementById('ai-cascade-toast');
    if (t) { t.classList.remove('show'); t.remove(); }

    t = document.createElement('div');
    t.id        = 'ai-cascade-toast';
    t.className = `ai-cascade-toast ai-toast-${type}`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));

    const ms = duration || (type === 'warn' ? 5000 : type === 'error' ? 7000 : 2400);
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => {
            if (t && t.parentNode) t.remove();
            _toastNext(); // Sıradaki toast'ı göster
        }, 350);
    }, ms);
}

// Ekranda küçük durum tostu göster (kuyruklu)
function showAIToast(msg, type = 'info', duration) {
    // Kuyruğa ekle — doluysa (flood) en eski düşer
    if (_toastQueue.length >= TOAST_MAX_QUEUE) {
        _toastQueue.shift(); // En eski mesajı at
    }
    _toastQueue.push({ msg, type, duration });
    // Aktif toast yoksa hemen başlat
    if (!_toastActive) {
        _toastNext();
    }
}

// ── AI Worker URL (RSS proxy ile aynı Worker) ────────────────────
// Anahtarlar client'a hiç gelmiyor — Worker env variable olarak saklar
// Cloudflare Dashboard → Workers → Settings → Environment Variables:
//   GEMINI_API_KEY / GROQ_API_KEY / OPENROUTER_API_KEY / MISTRAL_API_KEY
const AI_WORKER_URL = 'https://autumn-hill-be24ydt-master.stasalan.workers.dev';

// Worker üzerinden AI çağrısı — tek provider
async function _workerAICall(endpoint, prompt) {
    const resp = await fetch(`${AI_WORKER_URL}/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || `${endpoint} worker error ${resp.status}`);

    // Worker { raw: "..." } formatında döner — JSON string'i parse et
    const raw = typeof data.raw === 'string' ? data.raw : JSON.stringify(data);
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim();
    const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) throw new Error(`${endpoint}: JSON bulunamadı → ` + clean.slice(0, 80));
    return JSON.parse(match[0]);
}

// Provider tanımları — artık key localStorage'da saklanmıyor
// call() fonksiyonları Worker üzerinden proxy'leniyor
const AI_PROVIDERS = [
    {
        id: 'puter', name: 'Puter.js (GPT-4o)', icon: '🆓',
        lsKey: 'ydt_puter_enabled',  // her zaman true sayılır
        note: 'Ücretsiz · API key gerektirmez · GPT-4o',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            // Puter defer ile yüklendiğinden hazır olana kadar bekle (max 5sn)
            if (typeof puter === 'undefined' || !puter?.ai?.chat) {
                await new Promise((resolve, reject) => {
                    const start = Date.now();
                    const check = () => {
                        if (typeof puter !== 'undefined' && puter?.ai?.chat) return resolve();
                        if (Date.now() - start > 5000) return reject(new Error('puter_not_loaded'));
                        setTimeout(check, 200);
                    };
                    check();
                });
            }
            const resp = await puter.ai.chat(
                [{ role: 'system', content: 'You must respond with valid JSON only. No markdown, no explanation.' },
                 { role: 'user',   content: prompt }],
                { model: 'gpt-4o-mini' }
            );
            const content = resp?.message?.content;
            const raw = Array.isArray(content) ? (content[0]?.text || '') :
                        (typeof content === 'string' ? content :
                        (typeof resp === 'string' ? resp : ''));
            const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (!match) throw new Error('Puter: JSON bulunamadı → ' + raw.slice(0, 60));
            return JSON.parse(match[0]);
        }
    },
    {
        id: 'gemini', name: 'Gemini', icon: '✨',
        // lsKey artık sadece UI'da "aktif" göstergesi için — değer saklanmıyor
        lsKey: 'ydt_gemini_enabled',
        note: 'Gemini 2.0 Flash · Worker proxy ile güvenli',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            return await _workerAICall('gemini', prompt);
        }
    },
    {
        id: 'groq', name: 'Groq (Llama)', icon: '⚡',
        lsKey: 'ydt_groq_enabled',
        note: 'Llama 3.3 70B · Çok Hızlı · Worker proxy ile güvenli',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            return await _workerAICall('groq', prompt);
        }
    },
    {
        id: 'openrouter', name: 'OpenRouter', icon: '🌐',
        lsKey: 'ydt_openrouter_enabled',
        note: 'Free modeller · Worker proxy ile güvenli',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            return await _workerAICall('openrouter', prompt);
        }
    },
    {
        id: 'mistral', name: 'Mistral AI', icon: '🌪️',
        lsKey: 'ydt_mistral_enabled',
        note: 'Mistral Small · Worker proxy ile güvenli',
        keyHint: null,
        keyLink: null,
        async call(prompt) {
            return await _workerAICall('mistral', prompt);
        }
    }
];

// Ana cascade çağrısı — tüm provider'ları sırayla dener
// Artık localStorage'da anahtar aranmıyor — Worker env'den sağlar
// ── AI Rate Limiting: aynı anda birden fazla paralel çağrıyı önle ──────
const _aiCallQueue = { inFlight: 0, lastCallMs: 0 };
const AI_RATE_LIMIT_MS = 800;  // Ardışık çağrılar arası minimum ms
const AI_MAX_PARALLEL  = 3;    // Maksimum eşzamanlı çağrı

async function aiCall(prompt) {
    // Rate limit kontrolü
    const now = Date.now();
    const msSinceLast = now - _aiCallQueue.lastCallMs;
    if (_aiCallQueue.inFlight >= AI_MAX_PARALLEL) {
        throw new Error('Çok fazla eşzamanlı AI isteği. Lütfen bekleyin.');
    }
    if (msSinceLast < AI_RATE_LIMIT_MS && _aiCallQueue.inFlight > 0) {
        // Çok hızlı ardışık çağrı — kısa bekle
        await new Promise(r => setTimeout(r, AI_RATE_LIMIT_MS - msSinceLast));
    }
    _aiCallQueue.inFlight++;
    _aiCallQueue.lastCallMs = Date.now();

    // Tüm provider'lar Worker üzerinden aktif (Puter.js önce, sonra Worker proxy'ler)
    const available = AI_PROVIDERS; // hepsi her zaman denenir

    if (!available.length) {
        _aiCallQueue.inFlight--;
        alert('AI özelliği şu an kullanılamıyor.');
        throw new Error('no_api_key');
    }

    if (available.length === 1) {
        console.info('[AI Cascade] ⚠ Sadece 1 servis aktif:', available[0].name);
    }

    let lastErr = null;
    for (let i = 0; i < available.length; i++) {
        const p = available[i];
        const isLast = i === available.length - 1;

        if (i === 0) showAIToast(`${p.icon} ${p.name} ile bağlanılıyor...`, 'info');

        try {
            console.log(`[AI Cascade] ${i+1}/${available.length} deneniyor: ${p.name}`);
            const result = await p.call(prompt);
            console.log(`[AI Cascade] ✅ Başarılı: ${p.name}`);
            if (i > 0) {
                showAIToast(`✅ ${p.icon} ${p.name} ile başarılı!`, 'ok');
            } else {
                const t = document.getElementById('ai-cascade-toast');
                if (t) { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }
            }
            _aiCallQueue.inFlight--;
            return result;

        } catch (err) {
            lastErr = err;
            const isQuota = isQuotaError(err.message);
            console.warn(`[AI Cascade] ❌ ${p.name} ${isQuota ? 'KOTA DOLDU' : 'HATA'}: ${err.message}`);

            if (!isLast) {
                const next = available[i + 1];
                const reason = isQuota ? 'kotası doldu ⛔' : 'hata verdi ❌';
                showAIToast(
                    `${p.icon} ${p.name} ${reason} — ${next.icon} ${next.name} deneniyor...`,
                    'warn'
                );
                await new Promise(r => setTimeout(r, 1000));
            } else {
                const tip = available.length === 1
                    ? ' (Yönetim→🔑 bölümünden ek servis ekleyin)'
                    : '';
                showAIToast(`❌ Hata: ${err.message.slice(0, 70)}${tip}`, 'error');
            }
        }
    }
    _aiCallQueue.inFlight--;
    throw lastErr || new Error('all_failed');
}

// Eski çağrılar geminiCall kullanıyorsa yönlendir
async function geminiCall(prompt) { return aiCall(prompt); }

// Zorluk Seviyesi Algılama
async function detectDifficulty(text) {
    const badge = document.getElementById('p-difficulty-badge');
    if (!badge) return;
    badge.innerHTML = '<span class="diff-badge diff-loading">⏳ Analiz...</span>';
    try {
        const result = await geminiCall(`
Aşağıdaki İngilizce paragrafın zorluk seviyesini analiz et. Kelime yoğunluğunu, cümle uzunluğunu ve soyutluk düzeyini göz önünde bulundur.

Paragraf:
""" ${text.slice(0, 1200)} """
SADECE şu JSON'u döndür:
{
  "level": "B1" | "B2" | "C1" | "C2" | "YDT Easy" | "YDT Brutal",
  "score": 0-100 arası sayı,
  "color": "green" | "blue" | "orange" | "red" | "purple",
  "reasons": ["3 kısa Türkçe neden", "...", "..."]
}`);

        const colorMap = { green:'#16a34a', blue:'#1d4ed8', orange:'#ea580c', red:'#dc2626', purple:'#7c3aed' };
        const c = colorMap[result.color] || '#555';
        badge.innerHTML = `
            <div class="diff-badge" style="background:${c}10; border-color:${c}; color:${c};" title="${_esc((result.reasons||[]).join(' · '))}">
                ${_esc(result.level)} <span class="diff-score">${_esc(result.score)}/100</span>
            </div>`;
    } catch(e) {
        badge.innerHTML = e.message === 'no_api_key'
            ? '<span class="diff-badge diff-na">— Seviye</span>'
            : '<span class="diff-badge diff-na">⚠ Analiz başarısız</span>';
    }
}

// YDT Soru Üretici
async function generateYDTQuestions() {
    const p = paragraflar[currentParagrafIndex];
    if (!p) return;

    const btn   = document.getElementById('p-ydt-gen-btn');
    const panel = document.getElementById('p-ydt-panel');
    const qDiv  = document.getElementById('p-ydt-questions');

    if (!btn || !panel || !qDiv) { console.warn('generateYDTQuestions: UI elements missing'); return; }
    btn.disabled  = true;
    btn.innerHTML = '⏳ Sorular üretiliyor...';
    panel.style.display = 'block';
    qDiv.innerHTML = '<div class="p-ydt-loading"><div class="p-ydt-spin">⚙️</div><div>AI soruları hazırlıyor...</div></div>';

    try {
        const result = await geminiCall(`
Sen uzman bir YDT İngilizce öğretmenisin. Aşağıdaki paragraftan tam ÖSYM YDT standartlarında 5 farklı soru türü üret.

Paragraf:
""" ${p.metin} """
SADECE şu JSON formatını döndür:
{
  "questions": [
    {
      "type": "Ana Fikir",
      "icon": "💡",
      "question": "İngilizce soru cümlesi",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "A",
      "explanation": "Türkçe açıklama — neden bu şık doğru, diğerleri neden yanlış"
    },
    {
      "type": "Çıkarım",
      "icon": "🔎",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "C",
      "explanation": "..."
    },
    {
      "type": "Referans (This/That/They)",
      "icon": "👉",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "B",
      "explanation": "..."
    },
    {
      "type": "Kelime Anlamı",
      "icon": "📖",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "D",
      "explanation": "..."
    },
    {
      "type": "Paragraf Tamamlama",
      "icon": "✍️",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "E",
      "explanation": "..."
    }
  ]
}`);

        const questions = result.questions || [];

        // ── Soruları kaydet ──────────────────────────
        const key = paragrafKey(p);
        window.paragrafSorular[key] = {
            baslik:    p.baslik,
            savedAt:   new Date().toISOString(),
            questions: questions
        };
        window._saveData && window._saveData();
        // Kaydedilmiş bölümünü güncelle
        loadSavedQuestions(currentParagrafIndex);
        // ─────────────────────────────────────────────

        window._ydtSlideIdx['n'] = 0;
        qDiv.innerHTML = renderYDTQuestions(questions, 'n');

    } catch(e) {
        qDiv.innerHTML = `<div style="color:var(--red);font-size:.85rem;padding:12px;">⚠ Hata: ${_esc(e.message)}<br><small>API anahtarınızı ve bağlantınızı kontrol edin.</small></div>`;
    }

    btn.disabled  = false;
    btn.innerHTML = '🔄 Yeni Sorular Üret (AI)';
}

function checkYDTAnswer(btn, prefix, qi, selected, correct) {
    const optsDiv = document.getElementById(`ydt-opts-${prefix}-${qi}`);
    const expDiv  = document.getElementById(`ydt-exp-${prefix}-${qi}`);
    if (!optsDiv || optsDiv.dataset.answered) return;
    optsDiv.dataset.answered = '1';

    Array.from(optsDiv.querySelectorAll('.p-ydt-opt')).forEach(b => {
        b.disabled = true;
        const letter = b.textContent.trim()[0];
        if (letter === correct) b.classList.add('ydt-correct');
        else if (b === btn && selected !== correct) b.classList.add('ydt-wrong');
    });
    if (expDiv) expDiv.style.display = 'block';
    if (selected === correct) {
        stats.correctAnswers++; stats.totalAnswers++;
        incrementDailyCount();
        recordDailyPerf(true);
    } else {
        stats.totalAnswers++;
        recordDailyPerf(false);
    }
    window._saveData && window._saveData();
}

// Grammar X-Ray
async function analyzeGrammarXRay(sentenceIdx) {
    const sentence = paragrafSentences[sentenceIdx];
    if (!sentence || sentence.trim().length < 6) return;

    // Aktif cümleyi vurgula
    document.querySelectorAll('.p-sentence.psa').forEach(s => s.classList.remove('psa'));
    const activeSpan = document.querySelector(`.p-sentence[data-idx="${sentenceIdx}"]`);
    if (activeSpan) activeSpan.classList.add('psa');

    const panel   = document.getElementById('p-grammar-panel');
    const content = document.getElementById('p-grammar-content');
    panel.style.display = 'block';
    content.innerHTML = '<div class="p-grammar-loading"><span style="font-size:1.5rem;animation:spin 1s linear infinite;display:inline-block">⚙️</span><span>Analiz ediliyor...</span></div>';
    // poku-body scroll ediyor — panel'i görünür hale getir
    const _scroller = document.querySelector('.poku-body');
    if (_scroller) {
        setTimeout(() => {
            const pr = panel.getBoundingClientRect();
            const sr = _scroller.getBoundingClientRect();
            if (pr.bottom > sr.bottom - 20) {
                _scroller.scrollBy({ top: pr.bottom - sr.bottom + 60, behavior: 'smooth' });
            }
        }, 80);
    } else {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

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
        content.innerHTML = `<div style="color:var(--red);font-size:.84rem;padding:10px;">⚠ Analiz başarısız: ${_esc(e.message)}</div>`;
    }
}

// ── C1/C2 Kelime Filtresi ─────────────────────────────────────
// Oxford 3000 + COCA frekans listesine göre A1-B1 arası yaygın kelimeler.
// Bu listede OLAN kelimeler highlight EDİLMEZ (çok basit).
// Bu listede OLMAYAN kelimeler → C1/C2 → kırmızı highlight.
const _COMMON_WORDS = new Set([
    'a','an','the','and','or','but','if','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','being','have','has','had','do','does',
    'did','will','would','could','should','may','might','shall','can','need',
    'i','you','he','she','it','we','they','me','him','her','us','them',
    'my','your','his','its','our','their','mine','yours','ours','theirs',
    'this','that','these','those','what','which','who','whom','whose','where',
    'when','why','how','all','each','every','both','few','more','most','other',
    'some','such','no','not','only','same','so','than','too','very','just',
    'about','above','after','again','against','along','also','always','among',
    'another','any','away','back','because','before','between','big','book',
    'bring','buy','by','call','came','car','child','children','city','come',
    'coming','country','day','different','down','during','end','even','every',
    'example','eye','face','fact','family','far','feel','first','follow',
    'food','form','found','from','get','give','go','going','good','great',
    'hand','head','help','here','high','him','home','house','into','job',
    'just','keep','know','large','last','later','learn','leave','left','life',
    'like','little','live','long','look','made','make','man','many','mean',
    'men','money','month','mother','move','much','must','name','never','new',
    'next','night','now','number','off','old','once','open','out','over',
    'own','part','people','place','play','point','put','read','real','right',
    'room','said','same','say','school','see','seem','set','she','show',
    'since','small','something','start','still','stop','story','student',
    'take','talk','tell','thing','think','three','through','time','today',
    'together','told','turn','two','under','until','up','use','used','want',
    'water','way','week','well','went','while','white','whole','wide','word',
    'work','world','write','year','young','able','around','become','best',
    'better','body','business','change','close','come','control','course',
    'cut','early','eat','enough','ever','fall','five','four','free','full',
    'give','got','group','grow','hard','hear','hold','hope','hour','hundred',
    'idea','important','inside','interest','kind','late','later','lead',
    'less','let','light','likely','line','list','look','low','member','mind',
    'miss','moment','near','need','nothing','notice','often','open','order',
    'outside','own','paper','past','pay','person','plan','point','power',
    'present','pretty','problem','produce','program','public','put','question',
    'reach','reason','receive','remember','result','return','run','second',
    'serve','short','side','sometimes','sort','sound','speak','stand','stay',
    'step','study','sure','system','those','thought','true','try','turn',
    'type','understand','until','usually','view','voice','wait','walk','warm',
    'watch','whether','without','woman','women','write','wrong','yet',
    // Sık fiil formları
    'said','told','asked','wanted','needed','used','called','turned','seemed',
    'helped','looked','tried','started','became','kept','making','going',
    'coming','taking','getting','putting','having','doing','saying','giving',
    'knowing','thinking','feeling','seeing','showing','finding','using',
    // Bağlaçlar ve zarflar
    'however','therefore','although','because','since','while','unless',
    'instead','rather','quite','already','still','yet','soon','often',
    'never','always','usually','sometimes','perhaps','maybe','probably',
    'actually','really','clearly','simply','directly','finally','recently',
    'certainly','especially','generally','quickly','easily','simply',
    'nearly','almost','exactly','completely','especially','particularly',
    'including','according','following','during','within','between','among',
    'across','against','throughout','despite','except','beyond','toward',
    'upon','whether','either','neither','both','each','every','several',
    'various','certain','particular','specific','general','main','major',
    'national','local','social','political','economic','human','natural',
    'personal','public','private','special','full','whole','large','small',
    'high','low','long','short','old','young','new','early','late','next',
    'last','right','left','open','close','hard','easy','clear','dark',
    'deep','free','real','true','white','black','red','green','blue',
]);

/**
 * Kelime listesini C1/C2 seviyesine göre filtrele.
 * Basit (A1-B1) kelimeleri çıkar, sadece zor olanları döndür.
 */
function _filterC1C2Words(kelimeler) {
    const result = {};
    for (const [eng, tr] of Object.entries(kelimeler || {})) {
        const word = eng.trim().toLowerCase();
        // Çok kısa kelimeler (1-2 harf) ve yaygın listedekiler → atla
        if (word.length <= 2) continue;
        if (_COMMON_WORDS.has(word)) continue;
        // Yaygın suffix'lerle türetilmiş basit kelimeler de atla
        // (örn. "walking", "helped", "teachers" → "walk", "help", "teacher" listede)
        const stems = [
            word.replace(/ing$/, ''),
            word.replace(/ed$/, ''),
            word.replace(/s$/, ''),
            word.replace(/es$/, ''),
            word.replace(/er$/, ''),
            word.replace(/ers$/, ''),
            word.replace(/ly$/, ''),
            word.replace(/tion$/, 'te'),
            word.replace(/ness$/, ''),
            word.replace(/ment$/, ''),
        ];
        if (stems.some(s => s.length > 2 && _COMMON_WORDS.has(s))) continue;
        result[eng] = tr;
    }
    return result;
}

function showParagrafOku(index) {
    currentParagrafIndex = index;
    const p = paragraflar[index];

    // Cümlelere böl (Grammar X-Ray için)
    paragrafSentences = p.metin
        .replace(/([.?!])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 3);

    // Her cümleye c1-word renklendirme + tıklanabilir span ekle
    // Sadece C1/C2 seviyesi kelimeler highlight edilir
    const c1c2Kelimeler = _filterC1C2Words(p.kelimeler || {});
    const islenmisMetin = paragrafSentences.map((sent, si) => {
        let s = sent;
        for (let [ing, tr] of Object.entries(c1c2Kelimeler)) {
            const regex = new RegExp(`\\b(${ing.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`, 'gi');
            s = s.replace(regex, `<span class="c1-word" data-tr="${tr}">$1</span>`);
        }
        return `<span class="p-sentence" data-idx="${si}" onclick="analyzeGrammarXRay(${si})" title="Tıkla: Grammar X-Ray">${s}</span> `;
    }).join('');

    document.getElementById('p-oku-baslik').innerText = stripNumPrefix(p.baslik);
    document.getElementById('p-oku-metin').innerHTML  = islenmisMetin;

    // Panelleri sıfırla
    document.getElementById('p-grammar-panel').style.display = 'none';
    document.getElementById('p-ydt-panel').style.display     = 'none';
    document.getElementById('p-ydt-questions').innerHTML     = '';
    const genBtn = document.getElementById('p-ydt-gen-btn');
    if (genBtn) { genBtn.disabled = false; genBtn.innerHTML = '🎯 Bu paragraftan YDT sorusu üret'; }

    showPage('paragraf-oku-page');

    // Kaydedilmiş soruları yükle
    loadSavedQuestions(index);

    // ── Sidebar: Paragraf İstatistikleri ──
    const words = (p.metin || '').trim().split(/\s+/).filter(w => w.length > 0);
    const sentCount = paragrafSentences.length;
    const vocCount  = Object.keys(c1c2Kelimeler).length;
    const readMin   = Math.ceil(words.length / 180); // ~180 kelime/dk
    const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
    el('ps-word-count', words.length);
    el('ps-sent-count', sentCount);
    el('ps-voc-count',  vocCount);
    el('ps-read-time',  readMin + ' dk');

    // ── Sidebar: Genel İstatistikler ──
    const allWords  = Object.values(allData).flat();
    const totalW    = allWords.length;
    const learnedW  = allWords.filter(w => (w.correctStreak||0) >= 3).length;
    const accuracy  = stats.totalAnswers ? Math.round(stats.correctAnswers / stats.totalAnswers * 100) : 0;
    const streak    = parseInt(localStorage.getItem('ydt_streak') || '0');
    el('ps-total-words', totalW);
    el('ps-learned',     learnedW);
    el('ps-accuracy',    accuracy + '%');
    el('ps-streak',      streak);

    // ── Sidebar: Mini Sözlük — sadece C1/C2 kelimeler ──
    window._currentParagrafKelimeler = _filterC1C2Words(p.kelimeler || {});

    // Mobil touch bubble için c1-word
    // Use event delegation on container to avoid per-span listener memory leaks
    let activeBubble = null;
    const _okuMetin = document.getElementById('p-oku-metin');
    if (_okuMetin) {
        // Remove previous listener if any (re-assign via named function trick using dataset)
        if (_okuMetin._touchHandler) _okuMetin.removeEventListener('touchstart', _okuMetin._touchHandler, { passive: false });
        _okuMetin._touchHandler = function(e) {
            const span = e.target.closest('.c1-word');
            if (!span) return;
            e.preventDefault();
            if (activeBubble) { activeBubble.remove(); activeBubble = null; }
            const rect   = span.getBoundingClientRect();
            const bubble = document.createElement('div');
            bubble.className   = 'word-touch-bubble';
            bubble.textContent = span.dataset.tr || '';
            bubble.style.cssText = `position:fixed; left:${Math.min(rect.left + rect.width/2, window.innerWidth-120)}px; top:${Math.max(rect.top-44,60)}px; transform:translateX(-50%);`;
            document.body.appendChild(bubble);
            activeBubble = bubble;
            setTimeout(() => { if (activeBubble===bubble){bubble.remove();activeBubble=null;} }, 2200);
        };
        _okuMetin.addEventListener('touchstart', _okuMetin._touchHandler, { passive: false });
    }

    // Zorluk algıla
    detectDifficulty(p.metin);

    // Scroll progress bar başlat
    setTimeout(() => {
        if (typeof _initPokuScrollProgress === 'function') _initPokuScrollProgress();
    }, 100);
}
// ══════════════════════════════════════════════
