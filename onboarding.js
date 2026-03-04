// ════════════════════════════════════════════════════════════════
// onboarding.js  —  YDT Master Pro  Karşılama & Seviye Testi
// Adım 1: Yaş grubu seç  →  Adım 2: Seviye testi (16+ için)
//         → Adım 3: Sonuç & Yönlendirme
// Zorunlu değil — "Atla" her zaman mevcut
// ════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════
   SORULAR  —  Offline, hazır, 10 adet
   Her soruya CEFRLevel atandı (A1-C1)
   Doğru cevap sayısına göre seviye hesaplanır
   ════════════════════════════════════════════ */
const OB_QUESTIONS = [
    // A1
    {
        level: 'A1',
        q: 'She ___ to school every day.',
        blank: true,
        opts: ['go', 'goes', 'going', 'gone'],
        ans: 1
    },
    // A2
    {
        level: 'A2',
        q: 'I have lived in this city ___ ten years.',
        blank: true,
        opts: ['since', 'for', 'from', 'during'],
        ans: 1
    },
    // A2
    {
        level: 'A2',
        q: 'What is the meaning of "ancient"?',
        blank: false,
        opts: ['Very new', 'Very old', 'Very large', 'Very fast'],
        ans: 1
    },
    // B1
    {
        level: 'B1',
        q: 'By the time we arrived, the film ___ already started.',
        blank: true,
        opts: ['has', 'had', 'was', 'is'],
        ans: 1
    },
    // B1
    {
        level: 'B1',
        q: 'If I ___ rich, I would travel the world.',
        blank: true,
        opts: ['am', 'was', 'were', 'be'],
        ans: 2
    },
    // B1
    {
        level: 'B1',
        q: '"Eloquent" means someone who is ___.',
        blank: false,
        opts: ['Very strong', 'Well-spoken and expressive', 'Extremely lazy', 'Easily confused'],
        ans: 1
    },
    // B2
    {
        level: 'B2',
        q: 'The project was completed ___ schedule, much to everyone\'s surprise.',
        blank: true,
        opts: ['ahead of', 'in front of', 'on top of', 'in spite of'],
        ans: 0
    },
    // B2
    {
        level: 'B2',
        q: 'Choose the sentence in passive voice:',
        blank: false,
        opts: [
            'They built the bridge in 1990.',
            'The bridge was built in 1990.',
            'Building the bridge took years.',
            'The bridge building ended in 1990.'
        ],
        ans: 1
    },
    // C1
    {
        level: 'C1',
        q: '"Meticulous" is closest in meaning to ___.',
        blank: false,
        opts: ['Careless', 'Extremely thorough and careful', 'Somewhat interested', 'Overly emotional'],
        ans: 1
    },
    // C1
    {
        level: 'C1',
        q: 'The scientist\'s findings were so ___ that they challenged decades of established theory.',
        blank: true,
        opts: ['mundane', 'ambiguous', 'groundbreaking', 'redundant'],
        ans: 2
    }
];

/* Doğru sayısına göre seviye */
const OB_LEVEL_MAP = [
    { min: 0,  max: 2,  code: 'A1', label: 'Başlangıç',    color: '#64748b', badge: 'ob-badge-a1', desc: 'Temel kelime ve gramerle başlayalım. Adım adım ilerleyeceksin!', recommend: 'Kelime Öğren modülünden "Örnek Liste" ile başla.' },
    { min: 3,  max: 4,  code: 'A2', label: 'Temel',        color: '#0ea5e9', badge: 'ob-badge-a2', desc: 'Temel yapıları biliyorsun. Vocabulary ve Grammar modülleri sana çok şey katacak.', recommend: 'Vocabulary Test + English Tenses modülüne odaklan.' },
    { min: 5,  max: 6,  code: 'B1', label: 'Orta',         color: '#22c55e', badge: 'ob-badge-b1', desc: 'İyi bir temel var! Şimdi B2 hedefliyoruz — paragraf okuma ve AI testleri tam sana göre.', recommend: 'Paragraf Okuma ve AI Vocabulary Test\'i dene.' },
    { min: 7,  max: 8,  code: 'B2', label: 'Orta-İleri',   color: '#f59e0b', badge: 'ob-badge-b2', desc: 'Güçlü bir seviyedesin! YDT\'ye hazırlanmak için AI testler ve Grammar modülleri ile devam et.', recommend: 'AI Vocabulary Test + Grammar modüllerini tamamla.' },
    { min: 9,  max: 10, code: 'C1', label: 'İleri',        color: '#8b5cf6', badge: 'ob-badge-c1', desc: 'Harika! C1 seviyesindesin. Akademik kelime hazineni genişletmek için devam et.', recommend: 'C1/C2 Paragraf Okuma ve Speaking modülünü keşfet.' }
];

/* ════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════ */
const OB = {
    step:        1,       // 1=yaş, 2=quiz, 3=sonuç
    ageGroup:    null,    // '4-8' | '9-12' | '16+'
    quizIdx:     0,
    quizScore:   0,
    answered:    false,
    levelResult: null,
    skipQuiz:    false,

    STORAGE_KEY:  'ydt_onboarding_done',
    PROFILE_KEY:  'ydt_user_profile',

    /* Daha önce tamamlandı mı? */
    isDone() {
        const uid = window._currentUser?.uid || 'guest';
        return !!localStorage.getItem(`${this.STORAGE_KEY}_${uid}`);
    },

    /* Profili kaydet */
    saveProfile(extra = {}) {
        const uid = window._currentUser?.uid || 'guest';
        const existing = this.getProfile();
        const profile = { ...existing, ageGroup: this.ageGroup, ...extra, updatedAt: Date.now() };
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem(`${this.PROFILE_KEY}_${uid}`, JSON.stringify(profile));
        if (this.levelResult) {
            profile.level = this.levelResult.code;
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
            localStorage.setItem(`${this.PROFILE_KEY}_${uid}`, JSON.stringify(profile));
        }
    },

    /* Profili oku */
    getProfile() {
        const uid = window._currentUser?.uid || 'guest';
        const raw = localStorage.getItem(`${this.PROFILE_KEY}_${uid}`)
                 || localStorage.getItem(this.PROFILE_KEY);
        try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
    },

    /* Tamamlandı olarak işaretle */
    markDone() {
        const uid = window._currentUser?.uid || 'guest';
        localStorage.setItem(`${this.STORAGE_KEY}_${uid}`, '1');
    }
};

/* ════════════════════════════════════════════
   AÇILIŞ KONTROLÜ
   index.html'deki auth onAuthStateChanged
   tamamlandıktan sonra çağrılır
   ════════════════════════════════════════════ */
function obCheckAndShow() {
    // Misafir modda veya daha önce tamamlandıysa gösterme
    if (OB.isDone()) {
        obApplySavedProfile();
        return;
    }
    obShow();
}

/* Kaydedilmiş profili uygula (her sayfada sidebar vb.) */
function obApplySavedProfile() {
    const p = OB.getProfile();
    if (p.ageGroup) obApplySidebar(p.ageGroup);
}

/* ════════════════════════════════════════════
   OVERLAY OLUŞTUR & GÖSTER
   ════════════════════════════════════════════ */
function obShow() {
    if (document.getElementById('onboarding-overlay')) return;

    const el = document.createElement('div');
    el.id = 'onboarding-overlay';
    el.innerHTML = obBuildStep1();
    document.body.appendChild(el);
}

function obClose(skipAll = false) {
    const el = document.getElementById('onboarding-overlay');
    if (!el) return;
    OB.saveProfile();
    OB.markDone();
    if (OB.ageGroup) obApplySidebar(OB.ageGroup);
    el.classList.add('ob-fade-out');
    setTimeout(() => el.remove(), 420);

    // 16+ + seviye testi tamamlandıysa yönlendirme
    if (!skipAll && OB.levelResult && OB.ageGroup === '16+') {
        obDoRedirect();
    }
    // 4-8 → Kids
    if (!skipAll && OB.ageGroup === '4-8') {
        setTimeout(() => {
            if (typeof KW !== 'undefined' && KW.open) KW.open();
        }, 500);
    }
    // 9-12 → study
    if (!skipAll && OB.ageGroup === '9-12') {
        setTimeout(() => {
            if (typeof startStudy === 'function') startStudy();
        }, 500);
    }
}

/* ════════════════════════════════════════════
   ADIM 1 — Yaş Grubu Seç
   ════════════════════════════════════════════ */
function obBuildStep1() {
    return `
    <div class="ob-card ob-step">
        <div class="ob-header">
            <div class="ob-logo">🎓</div>
            <div class="ob-title">Hoş Geldin!</div>
            <div class="ob-sub">Sana en uygun deneyimi sunabilmemiz için<br>yaş grubunu seçmeni istiyoruz.</div>
            <div class="ob-dots">
                <div class="ob-dot active"></div>
                <div class="ob-dot"></div>
                <div class="ob-dot"></div>
            </div>
        </div>
        <div class="ob-body">
            <div class="ob-age-grid">
                <div class="ob-age-card" onclick="obSelectAge('4-8', this)">
                    <div class="ob-age-emoji">🌈</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">4 – 8 Yaş</div>
                        <div class="ob-age-desc">Oyunlu öğrenme, resimli kelimeler, eğlenceli aktiviteler</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">🎮 Oyunlar</span>
                            <span class="ob-age-tag">🌍 Kids English</span>
                            <span class="ob-age-tag">🔊 Sesli</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
                <div class="ob-age-card" onclick="obSelectAge('9-12', this)">
                    <div class="ob-age-emoji">🎒</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">9 – 12 Yaş</div>
                        <div class="ob-age-desc">Temel kelimeler, basit gramerde alıştırmalar, kelime oyunları</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">📖 Kelime</span>
                            <span class="ob-age-tag">🎯 Quiz</span>
                            <span class="ob-age-tag">🎮 Oyunlar</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
                <div class="ob-age-card" onclick="obSelectAge('16+', this)">
                    <div class="ob-age-emoji">🎓</div>
                    <div class="ob-age-info">
                        <div class="ob-age-range">13 Yaş ve Üzeri</div>
                        <div class="ob-age-desc">YDT hazırlık, tam grammar modülleri, AI testler, paragraf okuma</div>
                        <div class="ob-age-tags">
                            <span class="ob-age-tag">🤖 AI Test</span>
                            <span class="ob-age-tag">📐 Grammar</span>
                            <span class="ob-age-tag">📄 Paragraf</span>
                        </div>
                    </div>
                    <div class="ob-age-check">✅</div>
                </div>
            </div>
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" id="ob-next-1" onclick="obStep1Next()" disabled>
                Devam Et →
            </button>
            <div class="ob-skip-link">
                <button class="ob-skip-btn" onclick="obClose(true)">Atla, direkt başla</button>
            </div>
        </div>
    </div>`;
}

function obSelectAge(group, el) {
    OB.ageGroup = group;
    document.querySelectorAll('.ob-age-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('ob-next-1');
    if (btn) btn.disabled = false;
}

function obStep1Next() {
    if (!OB.ageGroup) return;

    // 4-8 ve 9-12 → doğrudan kapat/yönlendir
    if (OB.ageGroup !== '16+') {
        obClose(false);
        return;
    }

    // 16+ → Seviye testini sor
    obRenderStep2();
}

/* ════════════════════════════════════════════
   ADIM 2 — Seviye Testi (16+ için)
   ════════════════════════════════════════════ */
function obRenderStep2() {
    OB.step = 2;
    OB.quizIdx = 0;
    OB.quizScore = 0;
    OB.answered = false;

    const card = document.querySelector('.ob-card');
    if (!card) return;

    card.innerHTML = `
        <div class="ob-header">
            <div class="ob-logo">🧠</div>
            <div class="ob-title">Seviye Testi</div>
            <div class="ob-sub">10 kısa soru — yaklaşık <strong>2 dakika</strong>.<br>Cevaplarına göre sana özel içerik önereceğiz.</div>
            <div class="ob-dots">
                <div class="ob-dot done"></div>
                <div class="ob-dot active"></div>
                <div class="ob-dot"></div>
            </div>
        </div>
        <div class="ob-body" id="ob-quiz-body">
            ${obBuildQuizQ(0)}
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" id="ob-quiz-btn" onclick="obQuizAction()" disabled>
                Cevapla
            </button>
            <div class="ob-skip-link">
                <button class="ob-skip-btn" onclick="obSkipQuiz()">Testi atla</button>
            </div>
        </div>`;

    card.classList.remove('ob-step');
    void card.offsetWidth;
    card.classList.add('ob-step');
}

function obBuildQuizQ(idx) {
    const q = OB_QUESTIONS[idx];
    const letters = ['A', 'B', 'C', 'D'];
    const pct = Math.round((idx / OB_QUESTIONS.length) * 100);

    const questionHtml = q.blank
        ? q.q.replace('___', '<em>___</em>')
        : q.q;

    return `
        <div class="ob-quiz-progress-wrap">
            <div class="ob-quiz-progress-top">
                <span class="ob-quiz-progress-lbl">Soru</span>
                <span class="ob-quiz-progress-num">${idx + 1} / ${OB_QUESTIONS.length}</span>
            </div>
            <div class="ob-quiz-progress-track">
                <div class="ob-quiz-progress-fill" style="width:${pct}%"></div>
            </div>
        </div>
        <div class="ob-quiz-level-badge">
            <span>📊</span> ${q.level} Seviye Soru
        </div>
        <div class="ob-quiz-question">${questionHtml}</div>
        <div class="ob-quiz-options" id="ob-quiz-opts">
            ${q.opts.map((opt, i) => `
                <button class="ob-quiz-opt" onclick="obSelectOpt(${i}, this)">
                    <span class="ob-quiz-opt-letter">${letters[i]}</span>
                    ${opt}
                </button>`).join('')}
        </div>
        <div class="ob-quiz-feedback" id="ob-quiz-fb"></div>`;
}

let _obSelectedOpt = -1;

function obSelectOpt(idx, el) {
    if (OB.answered) return;
    _obSelectedOpt = idx;
    document.querySelectorAll('.ob-quiz-opt').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('ob-quiz-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Cevapla'; }
}

function obQuizAction() {
    if (!OB.answered) {
        obCheckAnswer();
    } else {
        obNextQuestion();
    }
}

function obCheckAnswer() {
    if (_obSelectedOpt < 0) return;
    OB.answered = true;

    const q = OB_QUESTIONS[OB.quizIdx];
    const correct = _obSelectedOpt === q.ans;
    if (correct) OB.quizScore++;

    const opts = document.querySelectorAll('.ob-quiz-opt');
    opts.forEach((b, i) => {
        b.disabled = true;
        if (i === q.ans) b.classList.add('ob-opt-correct');
        else if (i === _obSelectedOpt && !correct) b.classList.add('ob-opt-wrong');
    });

    const fb = document.getElementById('ob-quiz-fb');
    if (fb) {
        fb.className = 'ob-quiz-feedback ' + (correct ? 'correct' : 'wrong');
        fb.textContent = correct ? '✓ Doğru!' : `✗ Doğru cevap: ${q.opts[q.ans]}`;
    }

    const btn = document.getElementById('ob-quiz-btn');
    if (btn) {
        const isLast = OB.quizIdx >= OB_QUESTIONS.length - 1;
        btn.textContent = isLast ? 'Sonuçları Gör →' : 'Sonraki Soru →';
        btn.disabled = false;
    }
}

function obNextQuestion() {
    OB.quizIdx++;
    OB.answered = false;
    _obSelectedOpt = -1;

    if (OB.quizIdx >= OB_QUESTIONS.length) {
        obShowResult();
        return;
    }

    const body = document.getElementById('ob-quiz-body');
    if (body) {
        body.classList.remove('ob-step');
        body.innerHTML = obBuildQuizQ(OB.quizIdx);
        void body.offsetWidth;
        body.classList.add('ob-step');
    }

    const btn = document.getElementById('ob-quiz-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Cevapla'; }
}

function obSkipQuiz() {
    OB.skipQuiz = true;
    obClose(false);
}

/* ════════════════════════════════════════════
   ADIM 3 — Sonuç
   ════════════════════════════════════════════ */
function obShowResult() {
    OB.step = 3;

    // Seviyeyi hesapla
    const score = OB.quizScore;
    OB.levelResult = OB_LEVEL_MAP.find(l => score >= l.min && score <= l.max)
                  || OB_LEVEL_MAP[OB_LEVEL_MAP.length - 1];

    OB.saveProfile({ level: OB.levelResult.code, quizScore: score });

    const total = OB_QUESTIONS.length;
    const pct   = Math.round((score / total) * 100);

    const card = document.querySelector('.ob-card');
    if (!card) return;

    card.innerHTML = `
        <div class="ob-header">
            <div class="ob-logo">🏆</div>
            <div class="ob-title">Sonucun Hazır!</div>
            <div class="ob-sub">Testi tamamladın. İşte seviye değerlendirmen:</div>
            <div class="ob-dots">
                <div class="ob-dot done"></div>
                <div class="ob-dot done"></div>
                <div class="ob-dot active"></div>
            </div>
        </div>
        <div class="ob-body">
            <div class="ob-result-hero">
                <div class="ob-result-badge ${OB.levelResult.badge}">
                    ${OB.levelResult.code}
                    <span class="ob-result-level-name">${OB.levelResult.label}</span>
                </div>
                <div class="ob-result-title">${obResultTitle(OB.levelResult.code)}</div>
                <div class="ob-result-desc">${OB.levelResult.desc}</div>
            </div>
            <div class="ob-result-stats">
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val">${score}/${total}</div>
                    <div class="ob-result-stat-lbl">Doğru</div>
                </div>
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val">%${pct}</div>
                    <div class="ob-result-stat-lbl">Başarı</div>
                </div>
                <div class="ob-result-stat">
                    <div class="ob-result-stat-val" style="color:${OB.levelResult.color}">${OB.levelResult.code}</div>
                    <div class="ob-result-stat-lbl">Seviye</div>
                </div>
            </div>
            <div class="ob-recommend-box">
                <div class="ob-recommend-icon">💡</div>
                <div class="ob-recommend-text">
                    <div class="ob-recommend-title">Öneri</div>
                    <div class="ob-recommend-desc">${OB.levelResult.recommend}</div>
                </div>
            </div>
        </div>
        <div class="ob-footer">
            <button class="ob-btn-primary" onclick="obClose(false)">
                🚀 Öğrenmeye Başla
            </button>
        </div>`;

    card.classList.remove('ob-step');
    void card.offsetWidth;
    card.classList.add('ob-step');
}

function obResultTitle(code) {
    const titles = {
        A1: 'Güzel bir başlangıç! 🌱',
        A2: 'İyi gidiyorsun! ✨',
        B1: 'Orta seviyedesin! 💪',
        B2: 'Çok iyi! 🎯',
        C1: 'Mükemmel! 🏆'
    };
    return titles[code] || 'Harika! 🎉';
}

/* ════════════════════════════════════════════
   YÖNLENDİRME — seviye bazlı
   ════════════════════════════════════════════ */
function obDoRedirect() {
    const code = OB.levelResult?.code;
    if (!code) return;
    setTimeout(() => {
        if (code === 'A1' || code === 'A2') {
            if (typeof startStudy === 'function') startStudy();
        } else if (code === 'B1' || code === 'B2') {
            if (typeof showParagrafListesi === 'function') showParagrafListesi();
        } else {
            if (typeof startAIQuizMode === 'function') startAIQuizMode();
        }
    }, 600);
}

/* ════════════════════════════════════════════
   SİDEBAR ADAPTASYONU
   ════════════════════════════════════════════ */
function obApplySidebar(ageGroup) {
    const sidebar   = document.getElementById('desktop-sidebar');
    const drawer    = document.getElementById('mob-drawer');
    const bottomnav = document.querySelector('.mob-bottomnav');

    if (!sidebar) return;

    if (ageGroup === '4-8') {
        sidebar.classList.add('sb-kids-mode');
        if (drawer)    drawer.classList.add('mob-kids-mode');
        if (bottomnav) bottomnav.classList.add('bn-kids-mode');

        // Dashboard hero metnini güncelle
        const titleEl = document.getElementById('dash-title-text');
        const subEl   = document.getElementById('dash-sub-text');
        if (titleEl) titleEl.innerHTML = 'Merhaba! <em>Birlikte oğrenelim!</em>';
        if (subEl)   subEl.textContent = 'Renkli dünyada İngilizce keşfet 🌈';

    } else if (ageGroup === '9-12') {
        // 9-12: sadece AI YDT ve Paragraf gizle
        const toHide = ['sb-ai-ydt', 'sb-paragraf', 'sb-speaking',
                        'sb-grammar-toggle-main', 'sb-grammar-list-main',
                        'di-ai-ydt', 'di-paragraf', 'di-speaking',
                        'di-grammar-toggle-main', 'di-grammar-list-main'];
        toHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }
    // 16+ için hiçbir şeyi gizleme
}

/* ════════════════════════════════════════════
   PROFİL SAYFASI ENTEGRASYONu
   obAddProfilWidget() — profil sayfasında çağrılır
   ════════════════════════════════════════════ */
function obAddProfilWidget() {
    const section = document.querySelector('.admin-section, .pp-section');
    if (!section) return;

    const existing = document.getElementById('ob-profil-widget');
    if (existing) { obUpdateProfilWidget(); return; }

    const p = OB.getProfile();
    const ageLabels = { '4-8': '🌈 4-8 Yaş', '9-12': '🎒 9-12 Yaş', '16+': '🎓 13+ Yaş' };
    const ageLabel = p.ageGroup ? (ageLabels[p.ageGroup] || p.ageGroup) : 'Belirlenmedi';
    const levelLabel = p.level ? `${p.level} Seviye` : 'Test yapılmadı';

    const widget = document.createElement('div');
    widget.id = 'ob-profil-widget';
    widget.className = 'pp-section';
    widget.style.marginTop = '12px';
    widget.innerHTML = `
        <div class="pp-section-title">🎯 Profil & Seviye</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:10px 16px;flex:1;text-align:center;min-width:100px;">
                <div style="font-size:1.1rem;font-weight:900;color:var(--ink);" id="ob-pw-age">${ageLabel}</div>
                <div style="font-size:.62rem;font-weight:700;color:var(--ink3);text-transform:uppercase;margin-top:3px;">Yaş Grubu</div>
            </div>
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:10px 16px;flex:1;text-align:center;min-width:100px;">
                <div style="font-size:1.1rem;font-weight:900;color:#8b5cf6;" id="ob-pw-level">${levelLabel}</div>
                <div style="font-size:.62rem;font-weight:700;color:var(--ink3);text-transform:uppercase;margin-top:3px;">Seviye</div>
            </div>
        </div>
        <button class="ob-restart-btn" onclick="obRestartOnboarding()">
            🔄 Yaş / Seviye Testi Yeniden Yap
        </button>`;

    // profil-basari'nın hemen altına ekle (en üst görünür bölüm)
    const basari = document.querySelector('.profil-basari');
    if (basari) basari.insertAdjacentElement('afterend', widget);
    else {
        const statsRow = document.querySelector('.profil-stats-row');
        if (statsRow) statsRow.insertAdjacentElement('afterend', widget);
        else document.getElementById('profil-page')?.appendChild(widget);
    }
}

function obUpdateProfilWidget() {
    const p = OB.getProfile();
    const ageLabels = { '4-8': '🌈 4-8 Yaş', '9-12': '🎒 9-12 Yaş', '16+': '🎓 13+ Yaş' };
    const ageEl   = document.getElementById('ob-pw-age');
    const levelEl = document.getElementById('ob-pw-level');
    if (ageEl)   ageEl.textContent   = p.ageGroup ? (ageLabels[p.ageGroup] || p.ageGroup) : 'Belirlenmedi';
    if (levelEl) levelEl.textContent = p.level ? `${p.level} Seviye` : 'Test yapılmadı';
}

/* Profil sayfasından yeniden onboarding başlat */
function obRestartOnboarding() {
    const uid = window._currentUser?.uid || 'guest';
    localStorage.removeItem(`${OB.STORAGE_KEY}_${uid}`);
    OB.step = 1; OB.ageGroup = null; OB.quizIdx = 0;
    OB.quizScore = 0; OB.answered = false; OB.levelResult = null;

    // Mevcut sidebar sınıflarını temizle
    document.getElementById('desktop-sidebar')?.classList.remove('sb-kids-mode');
    document.getElementById('mob-drawer')?.classList.remove('mob-kids-mode');
    document.querySelector('.mob-bottomnav')?.classList.remove('bn-kids-mode');

    obShow();
}

/* ════════════════════════════════════════════
   OTOMATIK BAŞLATMA
   Auth modülü window._currentUser'ı set ettiğinde
   çağrılır. index.html'deki onAuthStateChanged
   callback'ine şu satırı ekliyoruz:
       obCheckAndShow();
   Ancak onboarding.js bağımsız çalışabilir —
   DOMContentLoaded'da da tetiklenir (guest mod)
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Auth yüklenmesini kısa bekle, sonra guest kontrolü
    setTimeout(() => {
        if (!OB.isDone()) obShow();
        else { obApplySavedProfile(); if (typeof initDashToday === 'function') setTimeout(initDashToday, 300); }

        // Profil sayfası açıldığında widget ekle (MutationObserver)
        const profilPage = document.getElementById('profil-page');
        if (profilPage) {
            const mo = new MutationObserver(() => {
                if (!profilPage.classList.contains('hidden')) {
                    obAddProfilWidget();
                }
            });
            mo.observe(profilPage, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }, 1200);
});

/* ════════════════════════════════════════════
   GLOBAL API
   ════════════════════════════════════════════ */
window.OB = OB;
window.obCheckAndShow   = obCheckAndShow;
window.obApplySavedProfile = obApplySavedProfile;
window.obRestartOnboarding = obRestartOnboarding;
window.obAddProfilWidget   = obAddProfilWidget;
