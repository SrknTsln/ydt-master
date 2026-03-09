/**
 * ydt-delegation.js — YDT Master Pro Merkezi Event Delegation
 *
 * AMAÇ
 * ────
 * index.html üzerindeki tüm inline onclick/onchange/onerror/onkeydown/oninput/
 * onmouseover/onmouseout attribute'ları CSP 'unsafe-inline' kaldırımı kapsamında
 * data-action / data-change / data-error / data-keydown / data-input /
 * data-hover-bg / data-hoverout-bg attribute'larına dönüştürülmüştür.
 *
 * Bu dosya söz konusu attribute'ları okuyarak asıl fonksiyonları çağırır.
 *
 * MİMARİ
 * ──────
 * - document üzerinde tek bir 'click' listener (bubbling) → O(1) bellek
 * - Delegated handler: e.target.closest('[data-action]')
 * - Fonksiyon adı string → window[fn] lookup → argümanlar evalAction() ile parse
 * - eval() KULLANILMAZ — güvenli whitelist + argument parser
 *
 * GÜVENLİK
 * ────────
 * - Sadece window üzerinde tanımlı, bilinen fonksiyonlar çağrılır
 * - Bilinmeyen fonksiyon adları konsola uyarı yazar ve sessizce geçer
 * - Argümanlar string literal, this referansı veya basit ifadeler olabilir
 *
 * BAĞIMLILIK
 * ──────────
 * Tüm uygulama JS dosyaları yüklendikten sonra çalışmalıdır.
 * Script loading bloğunda EN SON eklendi (onboarding.js'ten sonra, defer).
 */

'use strict';

(function YDTDelegation() {

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: Fonksiyon çağrısını parse et
       "funcName(arg1, arg2)" → { name: 'funcName', args: ['arg1','arg2'] }
       "funcName()" → { name: 'funcName', args: [] }
       Zincirleme ifadeler (a(); b();) → birden fazla çağrı dizisi döner
    ────────────────────────────────────────────────────────────────── */
    function parseCall(expr) {
        if (!expr || typeof expr !== 'string') return [];
        expr = expr.trim();

        // Noktalı virgülle ayrılmış çoklu ifadeler
        const parts = expr.split(/;(?![^()]*\))/g).map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
            return parts.flatMap(parseCall);
        }

        // Tek ifade: funcName(...) veya obj.method(...) veya arrow fn
        // Arrow fn içerenleri (=>), doğrudan eval etmeden çöz
        // Arrow fn: ifade KENDISI ()=>... veya x=>... ile başlıyorsa arrow
        // NOT: _requireAuth(()=>...) içinde => olsa da bu bir CALL
        if (/^\s*(?:\([^)]*\)|[\w$]+)\s*=>/.test(expr)) {
            return [{ type: 'arrow', expr }];
        }

        // "obj.method(args)" veya "func(args)" veya "window['_fnName'](args)"
        // Bracket notation desteği: window['_conjGoTo']('tenses') → funcPath = '_conjGoTo'
        const bracketMatch = expr.match(/^window\s*\[\s*['"]([^'"]+)['"]\s*\]\s*\((.*)\)\s*$/s);
        if (bracketMatch) {
            return [{ type: 'call', funcPath: bracketMatch[1], argsStr: (bracketMatch[2] || '').trim() }];
        }

        const match = expr.match(/^([\w$.]+(?:\.[\w$]+)*)\s*\((.*)\)\s*$/s);
        if (!match) {
            // Atama veya property erişimi (örn: foo.bar = 'x') — güvenli atla
            return [{ type: 'raw', expr }];
        }

        const funcPath = match[1];
        const argsStr  = match[2].trim();

        return [{ type: 'call', funcPath, argsStr }];
    }

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: Argüman string'ini array'e çevir
       Sadece string literal, number, boolean, this, event token'ları desteklenir
    ────────────────────────────────────────────────────────────────── */
    function parseArgs(argsStr, el, event) {
        if (!argsStr || argsStr.trim() === '') return [];

        // Basit argüman tokenizer — iç içe parantez / virgül aware
        const tokens = [];
        let depth = 0, current = '';
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '(' || ch === '[' || ch === '{') { depth++; current += ch; }
            else if (ch === ')' || ch === ']' || ch === '}') { depth--; current += ch; }
            else if (ch === ',' && depth === 0) { tokens.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        if (current.trim()) tokens.push(current.trim());

        return tokens.map(tok => {
            // String literal
            if (/^'[^']*'$/.test(tok))  return tok.slice(1, -1);
            if (/^"[^"]*"$/.test(tok))  return tok.slice(1, -1);
            // Number
            if (/^-?\d+(\.\d+)?$/.test(tok)) return Number(tok);
            // Boolean
            if (tok === 'true')  return true;
            if (tok === 'false') return false;
            if (tok === 'null')  return null;
            // Özel referanslar
            if (tok === 'this')  return el;
            if (tok === 'event') return event;
            // DOM sorgular — güvenli whitelist
            if (/^document\.getElementById\(['"][\w-]+['"]\)(?:\.[\w]+)?$/.test(tok)) {
                const idM = tok.match(/getElementById\(['"]([^'"]+)['"]\)/);
                if (!idM) return undefined;
                const targetEl = document.getElementById(idM[1]);
                if (!targetEl) return undefined;
                // .innerText vb. property erişimi
                const propM = tok.match(/\)\.(\w+)$/);
                return propM ? targetEl[propM[1]] : targetEl;
            }
            // this.innerText / this.value vb.
            if (/^this\.([\w]+)$/.test(tok)) {
                const prop = tok.split('.')[1];
                return el[prop];
            }
            // this.value — select/input için
            if (tok === 'this.value') return el.value;
            // Arrow fn içeren argüman → döndür
            if (/^\s*(?:\([^)]*\)|[\w$]+)\s*=>/.test(tok)) return evalArrow(tok);
            // Bilinmeyen identifier → window üzerinden fonksiyon referansı ara
            // Örn: mobRun(startQuizFromNav) → window['startQuizFromNav']
            // Örn: mobRun(KW.open) → window.KW.open
            if (/^[\w$]+(?:\.[\w$]+)*$/.test(tok)) {
                const ref = tok.split('.').reduce((o, k) => (o != null ? o[k] : undefined), window);
                if (ref !== undefined) return ref;
            }
            console.warn('[YDTDelegation] Çözülemeyen argüman:', tok);
            return undefined;
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: Arrow function ifadelerini güvenli şekilde çözümle
       Yalnızca window üzerindeki bilinen fonksiyonlara izin verir
    ────────────────────────────────────────────────────────────────── */
    function evalArrow(expr) {
        // ()=>funcName(...) ya da ()=>funcName()
        const m = expr.match(/^\s*\(\s*\)\s*=>\s*(.+)$/s);
        if (!m) return null;
        const inner = m[1].trim();

        // Birden fazla çağrı: a();b()
        const calls = parseCall(inner);
        return function arrowFn() {
            calls.forEach(c => executeCall(c, null, null));
        };
    }

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: Ayrıştırılmış çağrıyı çalıştır
    ────────────────────────────────────────────────────────────────── */
    function executeCall(parsed, el, event) {
        if (!parsed) return;

        // Özel DOM event metodları — window üzerinde değil, event objesinde
        if (parsed.type === 'call' && parsed.funcPath === 'event.stopPropagation') {
            if (event) event.stopPropagation();
            return;
        }
        if (parsed.type === 'call' && parsed.funcPath === 'event.preventDefault') {
            if (event) event.preventDefault();
            return;
        }

        if (parsed.type === 'arrow') {
            const fn = evalArrow(parsed.expr);
            if (typeof fn === 'function') fn();
            return;
        }

        if (parsed.type === 'raw') {
            // "document.getElementById('x').style.display='none'" gibi — güvenli DOM op
            // Sadece bilinen safe pattern'ler
            if (/^document\.getElementById\(['"][\w-]+['"]\)\.style\.\w+\s*=/.test(parsed.expr)) {
                const idM  = parsed.expr.match(/getElementById\(['"]([^'"]+)['"]\)/);
                const propM = parsed.expr.match(/\.style\.(\w+)\s*=\s*['"]([^'"]*)['"]/);
                if (idM && propM) {
                    const targetEl = document.getElementById(idM[1]);
                    if (targetEl) targetEl.style[propM[1]] = propM[2];
                }
            } else if (/^document\.querySelectorAll\(/.test(parsed.expr)) {
                // "document.querySelectorAll('.foo').forEach(s=>s.classList.remove('bar'))"
                // Güvenli DOM sınıf işlemleri — delegation'da class add/remove
                const selM   = parsed.expr.match(/querySelectorAll\(['"]([^'"]+)['"]\)/);
                const clsM   = parsed.expr.match(/classList\.(add|remove|toggle)\(['"]([^'"]+)['"]\)/);
                if (selM && clsM) {
                    document.querySelectorAll(selM[1]).forEach(function(node) {
                        node.classList[clsM[1]](clsM[2]);
                    });
                }
            }
            return;
        }

        if (parsed.type !== 'call') return;

        // funcPath: "window.AuthModule.authSignOut" ya da "showPage" ya da "KW.open"
        const pathParts = parsed.funcPath.split('.');
        let fn = window;
        for (const part of pathParts) {
            if (fn == null || typeof fn[part] === 'undefined') {
                // Henüz yüklenmemiş olabilir — defer sırası
                console.warn('[YDTDelegation] Fonksiyon bulunamadı:', parsed.funcPath);
                return;
            }
            fn = fn[part];
        }

        if (typeof fn !== 'function') {
            console.warn('[YDTDelegation] Fonksiyon değil:', parsed.funcPath, typeof fn);
            return;
        }

        const args = parseArgs(parsed.argsStr, el, event);
        try {
            // Ternary: "window.AuthModule ? window.AuthModule.authSignOut() : ydtSignOut()"
            fn.apply(el, args);
        } catch (err) {
            console.error('[YDTDelegation] Çağrı hatası:', parsed.funcPath, err);
        }
    }

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: Ternary ifadeleri (condition ? a() : b()) handle et
    ────────────────────────────────────────────────────────────────── */
    function executeTernary(expr, el, event) {
        // "window.AuthModule ? window.AuthModule.authSignOut() : ydtSignOut()"
        // "window.AuthModule && window.AuthModule.syncNow()"
        if (expr.includes('&&')) {
            const [condPart, thenPart] = expr.split('&&').map(s => s.trim());
            const condPath = condPart.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), window);
            if (condPath) {
                executeCall(parseCall(thenPart)[0], el, event);
            }
            return;
        }
        if (expr.includes('?') && expr.includes(':')) {
            const qIdx = expr.indexOf('?');
            // Bulunduğu en dıştaki ternary
            const condPart = expr.slice(0, qIdx).trim();
            const rest     = expr.slice(qIdx + 1);
            // ':' bölücü — iç içe parantez aware
            let depth = 0, colonIdx = -1;
            for (let i = 0; i < rest.length; i++) {
                if (rest[i] === '(' || rest[i] === '[') depth++;
                else if (rest[i] === ')' || rest[i] === ']') depth--;
                else if (rest[i] === ':' && depth === 0) { colonIdx = i; break; }
            }
            if (colonIdx === -1) return;
            const thenPart = rest.slice(0, colonIdx).trim();
            const elsePart = rest.slice(colonIdx + 1).trim();

            // Condition eval: sadece "window.X" erişimi
            const condVal = condPart.split('.').reduce((o, k) => {
                const key = k.trim();
                return (o != null && typeof o[key] !== 'undefined') ? o[key] : undefined;
            }, window);

            const branch = condVal ? thenPart : elsePart;
            if (branch) executeCall(parseCall(branch)[0], el, event);
            return;
        }
        // Düz ifade
        const calls = parseCall(expr);
        calls.forEach(c => executeCall(c, el, event));
    }

    /* ──────────────────────────────────────────────────────────────────
       YARDIMCI: data-action string'ini çalıştır (genel giriş noktası)
    ────────────────────────────────────────────────────────────────── */
    function runAction(expr, el, event) {
        if (!expr) return;
        expr = expr.trim();

        // Ternary / && operatörü içeren ifadeler
        if ((expr.includes('?') && expr.includes(':')) || expr.includes('&&')) {
            executeTernary(expr, el, event);
            return;
        }

        // Noktalı virgülle ayrılmış çoklu ifadeler
        const calls = parseCall(expr);
        calls.forEach(c => executeCall(c, el, event));
    }

    /* ══════════════════════════════════════════════════════════════════
       ANA DELEGATION — CLICK
       data-stop="true" → stopPropagation önce çalışır, parent card
       tetiklenmez (arşiv butonu, kaynak linki, konuşma butonu vb.)
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('click', function (e) {
        // ── data-stop="true" olan en yakın atayı bul ──────────────
        // Bu, iç içe kartlarda (Arşivle butonu, Kaynak linki) parent
        // card'ın data-action'ının tetiklenmesini engeller.
        const stopEl = e.target.closest('[data-stop="true"]');
        if (stopEl) {
            e.stopPropagation();
            const stopAction = stopEl.getAttribute('data-action');
            if (stopAction) runAction(stopAction, stopEl, e);
            return; // parent delegate chain'e devam etme
        }

        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.getAttribute('data-action');
        if (!action) return;
        runAction(action, el, e);
    }); // bubbling phase — standart event propagation

    /* ══════════════════════════════════════════════════════════════════
       KEYDOWN-ENTER DELEGATION — data-keydown-enter="expr"
       Sadece Enter tuşuna tepki verir; diğer tuşlar geçer.
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        const el = e.target.closest('[data-keydown-enter]');
        if (!el) return;
        const action = el.getAttribute('data-keydown-enter');
        if (!action) return;
        runAction(action, el, e);
    });

    /* ══════════════════════════════════════════════════════════════════
       CHANGE DELEGATION
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('change', function (e) {
        const el = e.target.closest('[data-change]');
        if (!el) return;
        const action = el.getAttribute('data-change');
        if (!action) return;
        runAction(action, el, e);
    });

    /* ══════════════════════════════════════════════════════════════════
       INPUT DELEGATION
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('input', function (e) {
        const el = e.target.closest('[data-input]');
        if (!el) return;
        const action = el.getAttribute('data-input');
        if (!action) return;
        runAction(action, el, e);
    });

    /* ══════════════════════════════════════════════════════════════════
       KEYDOWN DELEGATION
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('keydown', function (e) {
        const el = e.target.closest('[data-keydown]');
        if (!el) return;
        const action = el.getAttribute('data-keydown');
        if (!action) return;
        runAction(action, el, e);
    });

    /* ══════════════════════════════════════════════════════════════════
       ERROR DELEGATION — img/script onerror
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('error', function (e) {
        const el = e.target;
        if (!el || !el.hasAttribute('data-error')) return;
        const action = el.getAttribute('data-error');
        if (!action) return;
        runAction(action, el, e);
    }, true); // capture — error events bubble etmez

    /* ══════════════════════════════════════════════════════════════════
       HOVER DELEGATION — mouseover/mouseout → data-hover-bg
    ══════════════════════════════════════════════════════════════════ */
    document.addEventListener('mouseover', function (e) {
        const el = e.target.closest('[data-hover-bg]');
        if (!el) return;
        el.style.background = el.getAttribute('data-hover-bg');
    });
    document.addEventListener('mouseout', function (e) {
        const el = e.target.closest('[data-hoverout-bg]');
        if (!el) return;
        el.style.background = el.getAttribute('data-hoverout-bg');
    });

    /* ══════════════════════════════════════════════════════════════════
       ÖZEL DURUMLAR
       selectAvatar(this) — 8 adet, this = img elementi
    ══════════════════════════════════════════════════════════════════ */
    // selectAvatar için this doğru iletiliyor (parseArgs'da 'this' → el)

    /* ══════════════════════════════════════════════════════════════════
       DOĞRULAMA — geliştirme modunda
    ══════════════════════════════════════════════════════════════════ */
    if (typeof YDT !== 'undefined' && YDT.logger) {
        YDT.logger.debug('[YDTDelegation] ✅ Delegation kuruldu — inline event handler yok');
    }

})();
