/**
 * ydtui.js — YDT Master Pro UI Yardımcıları
 *
 * Kapsam : Sidebar daralt/genişlet, grammar accordion toggle,
 *          mobil drawer grammar toggle.
 * Bağımlılık : motor.js (global DOM hazır olmalı)
 * Taşıma notu: index.html içindeki ikinci <script> bloğundan (satır 2385)
 *              ayrıştırılmıştır — CSP 'unsafe-inline' kaldırımının parçası.
 */

'use strict';

/* ── Sidebar daralt / genişlet ──────────────────────────────────── */
function sbToggleCollapse() {
    const sb = document.getElementById('desktop-sidebar');
    if (!sb) return;
    const collapsed = sb.classList.toggle('sb-collapsed');
    localStorage.setItem('ydt_sb_collapsed', collapsed ? '1' : '0');
}

/* ── Desktop Sidebar Grammar accordion ──────────────────────────── */
function sbToggleGrammar() {
    const btn  = document.getElementById('sb-grammar-toggle-main');
    const list = document.getElementById('sb-grammar-list-main');
    if (!btn || !list) return;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    list.setAttribute('aria-hidden',  String(open));
    list.classList.toggle('sb-grammar-list--open', !open);
}
/** Alias — HTML onclick="sbToggleGrammarMain()" uyumluluğu */
function sbToggleGrammarMain() { sbToggleGrammar(); }

/* ── Mobil Drawer Grammar accordion ─────────────────────────────── */
function mobToggleGrammar() {
    const btn  = document.getElementById('di-grammar-toggle-main');
    const list = document.getElementById('di-grammar-list-main');
    if (!btn || !list) return;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    list.setAttribute('aria-hidden',  String(open));
    list.classList.toggle('mob-grammar-list--open', !open);
}
/** Alias — HTML onclick="mobToggleGrammarMain()" uyumluluğu */
function mobToggleGrammarMain() { mobToggleGrammar(); }

/* ── Sayfa yüklenince sidebar collapse durumunu uygula ─────────── */
(function _applySidebarCollapseState() {
    if (localStorage.getItem('ydt_sb_collapsed') === '1') {
        const sb = document.getElementById('desktop-sidebar');
        if (sb) sb.classList.add('sb-collapsed');
    }
})();

// ── Window Exports — data-action delegation için zorunlu ────────────
window.sbToggleCollapse    = sbToggleCollapse;
window.sbToggleGrammarMain = sbToggleGrammarMain;
window.sbToggleGrammar     = sbToggleGrammar;
window.mobToggleGrammarMain = mobToggleGrammarMain;
window.mobToggleGrammar    = mobToggleGrammar;
