// ════════════════════════════════════════════════════════════════
// grammar-engine.js  —  GrammarModule Base Class
// YDT Master Pro
//
// Tüm grammar modülleri (conj, gerund, adjadv, conditionals,
// grammar/tenses, modals, noun, passive, pronouns, relative,
// tagquant) bu engine üzerinden çalışır.
//
// Regresyon koruması:
//   - Her modülün window.openXxxSection wrapper'ı korunur
//   - CSS class isimleri değişmez
//   - window.* export'ları kaldırılmaz
// ════════════════════════════════════════════════════════════════

'use strict';

class GrammarModule {
    /**
     * @param {object} cfg
     * @param {string}   cfg.id        - Modül kimliği (örn: 'conj')
     * @param {string}   cfg.pageId    - Sayfa element ID (örn: 'conj-page')
     * @param {string}   cfg.sbId      - Sidebar buton ID (örn: 'sb-grammar-conj')
     * @param {string}   [cfg.diId]    - Drawer buton ID (örn: 'di-grammar-conj')
     * @param {string}   cfg.title     - Topbar başlığı (HTML kabul eder)
     * @param {Array}    cfg.sections  - Section metadata dizisi
     *                                   Her eleman: { id, label, grp }
     *                                   grammar.js'de grp yerine cat kullanılır —
     *                                   her ikisi de kabul edilir.
     * @param {object}   cfg.dotColors - { grpAdı: renk } eşlemesi
     * @param {string[]} [cfg.grpOrder]- Sidenav grup sırası. Verilmezse sections'tan çıkarılır.
     * @param {Function} [cfg.sectionMap] - id → render fn eşlemesi { id: fn }
     *                                      render fonksiyonları hiç değişmez.
     * @param {Function} [cfg.onSectionRender] - section render sonrası callback(id)
     */
    constructor(cfg) {
        this.id             = cfg.id;
        this.pageId         = cfg.pageId;
        this.sbId           = cfg.sbId;
        this.diId           = cfg.diId ?? null;
        this.title          = cfg.title;
        this.sections       = cfg.sections;          // [ {id, label, grp|cat} ]
        this.dotColors      = cfg.dotColors ?? {};
        this.sectionMap     = cfg.sectionMap ?? {};
        this.onSectionRender = cfg.onSectionRender ?? null;

        // grp yoksa cat'i grp olarak normalleştir (grammar.js uyumu)
        this.sections = this.sections.map(s => ({
            ...s,
            grp: s.grp ?? s.cat ?? ''
        }));

        // Grup sırası: verilmişse kullan, yoksa sections'tan ilk geçiş sırasıyla çıkar
        this.grpOrder = cfg.grpOrder ?? this._extractGrpOrder();

        // Aktif section state (her modül kendi state'ini yönetir)
        this._current = 'overview';
    }

    // ── Public API ───────────────────────────────────────────────

    /** Modülü aç ve belirtilen section'ı göster */
    open(sectionId = 'overview') {
        this._current = sectionId;

        // Tüm container/page'leri gizle
        document.querySelectorAll('.container, .arsiv-full-page').forEach(el => {
            el.classList.add('hidden');
        });
        // modals.js'de ek class'lar da gizleniyor — genel hale getiriyoruz
        document.querySelectorAll('.cx-page, .sr-page, .tw-page').forEach(el => {
            el.classList.add('hidden');
        });

        const page = document.getElementById(this.pageId);
        if (!page) return;
        page.classList.remove('hidden');

        // Sidebar active state sıfırla
        document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(el => {
            el.classList.remove('active');
        });
        [this.sbId, this.diId].filter(Boolean).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('active');
        });

        this._render();
    }

    /** Section'a git (sayfa zaten açık, sadece içerik değişir) */
    goTo(sectionId) {
        if (!this._findSection(sectionId)) return;
        this._current = sectionId;
        this._buildSidenav();
        this._renderSection(sectionId);
    }

    /** Mevcut section ID'sini döner */
    get current() { return this._current; }

    // ── Private ──────────────────────────────────────────────────

    _render() {
        const page = document.getElementById(this.pageId);
        if (!page) return;

        const navId     = `${this.id}-sidenav`;
        const contentId = `${this.id}-content`;

        page.innerHTML =
            `<div class="gr-topbar">` +
            `<button class="gr-back-btn" data-action="navTo('index-page')" aria-label="Ana sayfaya dön">←</button>` +
            `<div><div class="gr-topbar-label">Grammar Modülü</div>` +
            `<div class="gr-topbar-title">${this.title}</div></div>` +
            `</div>` +
            `<div class="gr-body">` +
            `<nav class="gr-sidenav" id="${navId}"></nav>` +
            `<div class="gr-content" id="${contentId}"></div>` +
            `</div>`;

        this._buildSidenav();
        this._renderSection(this._current);

        // ── Event Delegation — dynamically rendered content ──────────
        // gr-sidenav ve gr-content'te oluşan butonlar CSP'ye takılmaması için
        // data-gr-goto, data-gr-toggle, data-gr-section attribute'ları ile listener bağla.
        // Mevcut innerHTML onclick'ler CSP bloke edebilir — bu listener onları yakalar.
        this._bindPageDelegation(page);
    }

    /**
     * Sayfa içindeki gr-sidenav ve gr-content için event delegation.
     * Her açılışta yeniden bağlanır — listener leak önlemek için AbortController kullanır.
     */
    _bindPageDelegation(page) {
        // Önceki listener'ı temizle
        if (this._delegationController) {
            this._delegationController.abort();
        }
        this._delegationController = new AbortController();
        const { signal } = this._delegationController;

        const mod = this;

        page.addEventListener('click', function(e) {
            // gr-sn-btn (sidenav item) → data-gr-goto veya data-action ile çalışır
            const snBtn = e.target.closest('.gr-sn-btn');
            if (snBtn) {
                // data-action zaten ydt-delegation tarafından handle edilir — skip
                if (snBtn.hasAttribute('data-action')) return;
                // Fallback: textContent ile section bul
                return;
            }

            // gr-acc (accordion toggle)
            const acc = e.target.closest('.gr-acc');
            if (acc && e.target === acc) {
                acc.classList.toggle('open');
                e.stopPropagation();
                return;
            }

            // gr-cat-card → section render
            const catCard = e.target.closest('.gr-cat-card, [data-gr-section]');
            if (catCard) {
                const secId = catCard.getAttribute('data-gr-section') ||
                              catCard.className.match(/cat-([\w-]+)/)?.[1];
                if (secId && mod.sectionMap[secId]) {
                    mod.goTo(secId);
                }
                return;
            }

            // tip-card toggle (collapsed/expanded)
            const tipCard = e.target.closest('.gr-tip-card');
            if (tipCard && e.target === tipCard) {
                tipCard.classList.toggle('open');
                return;
            }

        }, { signal });
    }

    _buildSidenav() {
        const navId = `${this.id}-sidenav`;
        const nav   = document.getElementById(navId);
        if (!nav) return;

        // sections'ı gruplara ayır
        const groups = {};
        this.sections.forEach(s => {
            if (!groups[s.grp]) groups[s.grp] = [];
            groups[s.grp].push(s);
        });

        let html = '';
        this.grpOrder.forEach(grp => {
            const list = groups[grp];
            if (!list) return;
            const dot = this.dotColors[grp] ?? '#aaa';
            html += `<div class="gr-sn-sec">${grp}</div>`;
            list.forEach(s => {
                const active = s.id === this._current ? ' active' : '';
                // data-action → ydt-delegation.js tarafından işlenir (CSP unsafe-inline gerektirmez)
                html += `<button class="gr-sn-btn${active}" ` +
                    `data-action="window['_${this.id}GoTo']('${s.id}')">` +
                    `<span class="gr-sn-dot" style="background:${dot}"></span>` +
                    `${s.label}</button>`;
            });
        });
        nav.innerHTML = html;
    }

    _renderSection(id) {
        const contentId = `${this.id}-content`;
        const content   = document.getElementById(contentId);
        if (!content) return;

        content.scrollTop = 0;

        const fn = this.sectionMap[id];
        content.innerHTML = fn
            ? (typeof fn === 'function' ? fn() : fn)
            : '<div style="padding:40px">Yakında...</div>';

        if (this.onSectionRender) {
            this.onSectionRender(id);
        }
    }

    _findSection(id) {
        return this.sections.find(s => s.id === id);
    }

    _extractGrpOrder() {
        const seen  = new Set();
        const order = [];
        this.sections.forEach(s => {
            if (!seen.has(s.grp)) { seen.add(s.grp); order.push(s.grp); }
        });
        return order;
    }
}

// ── Global export ────────────────────────────────────────────────
window.GrammarModule = GrammarModule;
