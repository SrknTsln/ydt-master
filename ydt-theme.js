/**
 * ydt-theme.js — Tema flash önleyici (FOUC prevention)
 *
 * NEDEN defer YOK?
 * ─────────────────
 * Tarayıcı HTML'i parse ederken bu script'i hemen çalıştırır.
 * CSS boyama başlamadan önce data-theme set edilir → beyaz/siyah flash yok.
 * Sadece 6 satır — parse süresine etkisi göz ardı edilebilir düzeyde.
 *
 * NOT: CSP 'unsafe-inline' GEREKTIRMEZ — harici .js dosyası.
 * Tarayıcı render pipeline'ında blocking, ama < 1ms.
 */
(function(){
    var s = localStorage.getItem('ydtTheme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t = s || (d ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
    if (!s) localStorage.setItem('ydtTheme', t);
})();
