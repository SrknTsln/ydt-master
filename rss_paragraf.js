// ════════════════════════════════════════════════════════════════
//  rss_paragraf.js  —  YDT Master  v4.7
//
//  ┌─────────────────────────────────────────────────────────────┐
//  │  RSS ÇEKİM SIRASI (Adım adım)                               │
//  │                                                             │
//  │  1. KAYNAK GRUPLARI (paralel, öncelik sırası)               │
//  │     Bilim (5 kaynak) → Teknoloji (5) → Oyun (6)            │
//  │     Her grup için Promise.allSettled ile eşzamanlı çekilir  │
//  │                                                             │
//  │  2. HER KAYNAK İÇİN PROXY SIRASI (_fetchOneSource)          │
//  │     a) Ücretsiz proxy'ler PARALEL denenir (Promise.any):    │
//  │        · allorigins.win                                     │
//  │        · corsproxy.io                                       │
//  │        · codetabs.com                                       │
//  │        → İlk başarılı yanıt kullanılır (6 sn timeout)       │
//  │     b) Ücretsiz proxy'ler başarısız olursa FALLBACK:        │
//  │        · rss2json API (API key ile, 8 sn timeout)           │
//  │     c) Tümü başarısız → null döner, kaynak atlanır          │
//  │                                                             │
//  │  3. SLOT DAĞILIMI (toplam 20 makale hedefi)                 │
//  │     Bilim: 12 slot · Teknoloji: 5 slot · Oyun: 3 slot      │
//  │     Eksik kalırsa diğer kategoriler tamamlar                │
//  │                                                             │
//  │  4. FİLTRELEME                                              │
//  │     · İngilizce kontrol (_isEnglish: en az 4 yaygın kelime) │
//  │     · Min 4 cümle filtresi (_hasMinSentences)               │
//  │     · AI analizi: kelime listesi + CEFR seviyesi            │
//  │                                                             │
//  │  5. KAYDETME                                                │
//  │     · localStorage cache (3 saatlik slot bazlı)             │
//  │     · localStorage rssArsiv (max 300, uid bazlı)            │
//  │     · Firebase Realtime DB:                                 │
//  │         ydt_users/{uid}/rssArsiv      (tüm çekilen, max 300)│
//  │         ydt_users/{uid}/paragraflar   (arşive eklenenler)   │
//  │         ydt_users/{uid}/paragrafSorular (mevcut sistem)     │
//  │                                                             │
//  │  6. EKSİK SLOT → statik fallback pasajlar ile tamamlanır    │
//  └─────────────────────────────────────────────────────────────┘
// ════════════════════════════════════════════════════════════════

/* ── Admin kontrolü — Worker tarafında yapılır, client'ta e-posta saklanmaz ── */
window._isAdmin = function() {
    // Senkron UI kararları için _adminVerified flag'ini kullan
    // adminCheckAccess() Worker'dan async onayladıktan sonra bu flag set edilir
    return window._adminVerified === true;
};


/* ── RSS Kaynakları ─────────────────────────────────────────── */
// Kaynaklar kategoriye göre ayrılmış — çekim önceliği: Bilim → Teknoloji → Oyun
const RSS_SOURCES_SCIENCE = [
    { name: 'BBC Science',     url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', icon: '🌿', cat: 'science' },
    { name: 'The Guardian',    url: 'https://www.theguardian.com/science/rss',                       icon: '🧪', cat: 'science' },
    { name: 'NASA News',       url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',                icon: '🚀', cat: 'science' },
    { name: 'NPR Science',     url: 'https://feeds.npr.org/1007/rss.xml',                            icon: '📡', cat: 'science' },
    { name: 'New Scientist',   url: 'https://www.newscientist.com/feed/home/',                       icon: '🔬', cat: 'science' },
];
const RSS_SOURCES_TECH = [
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/stories.rss',                  icon: '🤖', cat: 'tech' },
    { name: 'Ars Technica',    url: 'https://feeds.arstechnica.com/arstechnica/index',               icon: '💻', cat: 'tech' },
    { name: 'Wired',           url: 'https://www.wired.com/feed/rss',                                icon: '⚡', cat: 'tech' },
    { name: 'TechCrunch',      url: 'https://techcrunch.com/feed/',                                  icon: '🛠️', cat: 'tech' },
    { name: 'The Verge',       url: 'https://www.theverge.com/rss/index.xml',                        icon: '📱', cat: 'tech' },
];
const RSS_SOURCES_GAMING = [
    { name: 'IGN',             url: 'https://feeds.ign.com/ign/all',                                 icon: '🎮', cat: 'gaming' },
    { name: 'Eurogamer',       url: 'https://www.eurogamer.net/?format=rss',                         icon: '🕹️', cat: 'gaming' },
    { name: 'PC Gamer',        url: 'https://www.pcgamer.com/rss/',                                  icon: '🖥️', cat: 'gaming' },
    { name: 'Kotaku',          url: 'https://kotaku.com/rss',                                        icon: '👾', cat: 'gaming' },
    { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed',                      icon: '🔫', cat: 'gaming' },
    { name: 'Polygon',         url: 'https://www.polygon.com/rss/index.xml',                         icon: '🎲', cat: 'gaming' },
];
// Tüm kaynaklar düz liste (loading UI için)
const RSS_SOURCES = [...RSS_SOURCES_SCIENCE, ...RSS_SOURCES_TECH, ...RSS_SOURCES_GAMING];

/* ── CORS Proxy Yapılandırması ──────────────────────────────── */
// Cloudflare Worker URL'ini buraya yapıştır (deploy ettikten sonra)
// Örn: 'https://ydt-proxy.KULLANICI.workers.dev'
const WORKER_URL = 'https://autumn-hill-be24ydt-master.stasalan.workers.dev';

// Worker hazır mı? (URL güncellenmemişse eski proxy'lere fallback)
const _workerReady = WORKER_URL && !WORKER_URL.includes('KULLANICI');

// Yedek proxy'ler (Worker çalışmadığında fallback — API key kaldırıldı)
const RSS_PROXIES = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
];

/* ── Yardımcılar ────────────────────────────────────────────── */
function _rssToday() { return new Date().toISOString().slice(0, 10); }
// Her 1 saatte bir farklı cache slot → içerik taze kalır
function _rssCacheSlot() {
    const now  = new Date();
    // Saatlik slot — yeni haber her saat (eskiden 3 saatti)
    return `${_rssToday()}_h${now.getHours()}`;
}

function _parseXML(xmlStr) {
    try {
        const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');

        // RSS 2.0 <item> veya Atom <entry> desteği
        const items = Array.from(doc.querySelectorAll('item, entry'));
        if (!items.length) return [];

        return items.map(el => {
            // namespace sorunlarını bypass et — getElementsByTagNameNS yerine textContent
            const g = (...tags) => {
                for (const tag of tags) {
                    // namespace'li tag (content:encoded gibi)
                    const byNS = el.getElementsByTagName(tag);
                    if (byNS.length) return (byNS[0].textContent || '').replace(/<[^>]+>/g, '').trim();
                    // namespace'siz querySelector
                    const node = el.querySelector(tag);
                    if (node) return (node.textContent || '').replace(/<[^>]+>/g, '').trim();
                }
                return '';
            };

            const title   = g('title');
            const desc    = g('description', 'summary');
            const cont    = g('content\\:encoded', 'content');
            // Atom link: <link href="..."> veya <link>url</link>
            let link = '';
            const linkEl = el.querySelector('link');
            if (linkEl) link = linkEl.getAttribute('href') || linkEl.textContent || '';
            const pubDate = g('pubDate', 'published', 'updated', 'dc\\:date');

            return { title, description: desc, content: cont, link, pubDate };
        }).filter(i => i.title && (i.description + i.content).length > 150);
    } catch(_) { return []; }
}

function _parseRSS2JSON(data) {
    if (!data || !data.items) return [];
    return data.items.map(i => ({
        title:       (i.title       || '').replace(/<[^>]+>/g, '').trim(),
        description: (i.description || i.content || '').replace(/<[^>]+>/g, '').trim(),
        content:     (i.content     || '').replace(/<[^>]+>/g, '').trim(),
        link:        i.link || '',
        pubDate:     i.pubDate || ''
    })).filter(i => i.title && (i.description + i.content).length > 200);
}

/* ── Tek kaynaktan sıralı proxy ile çek ─────────────────────── */
async function _fetchOneSource(source) {
    try {

        // 1. ÖNCELİK: Kendi Cloudflare Worker'ı — limitsiz, hızlı, güvenilir
        if (_workerReady) {
            try {
                const workerUrl = `${WORKER_URL}/rss?url=${encodeURIComponent(source.url)}`;
                const res = await fetch(workerUrl, { signal: AbortSignal.timeout(8000) });
                if (res.ok) {
                    const xml = await res.text();
                    if (xml && xml.includes('<item')) {
                        const items = _parseXML(xml);
                        if (items.length) {
                            console.log(`[RSS ✅] ${source.name} → Worker (${items.length} item)`);
                            return { source, items };
                        }
                    }
                }
            } catch(e) {
                console.warn(`[RSS ⚠️] ${source.name} Worker timeout, fallback deneniyor…`);
            }
        }

        // 2. FALLBACK: Ücretsiz proxy'ler paralel (Worker yoksa veya başarısız olursa)
        const freeProxies = [
            { make: u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, mode: 'json' },
            { make: u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,          mode: 'text' },
            { make: u => `https://api.codetabs.com/v1/proxy?url=${encodeURIComponent(u)}`, mode: 'text' },
        ];
        const freeTries = freeProxies.map(async ({ make, mode }) => {
            try {
                const res = await fetch(make(source.url), { signal: AbortSignal.timeout(6000) });
                if (!res.ok) return null;
                let xml;
                if (mode === 'json') {
                    const data = await res.json();
                    xml = data.contents || null;
                } else {
                    xml = await res.text();
                }
                if (xml && xml.includes('<item')) {
                    const items = _parseXML(xml);
                    if (items.length) {
                        console.log(`[RSS ✅] ${source.name} → free proxy (${items.length} item)`);
                        return { source, items };
                    }
                }
            } catch(e) {}
            return null;
        });
        try {
            const winner = await Promise.any(freeTries);
            if (winner) return winner;
        } catch(_) {}

        // 3. SON FALLBACK: rss2json (API key'siz ücretsiz tier)
        try {
            const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}&count=10`;
            const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'ok' && data.items?.length) {
                    const items = _parseRSS2JSON(data);
                    if (items.length) {
                        console.log(`[RSS ✅] ${source.name} → rss2json fallback (${items.length} item)`);
                        return { source, items };
                    }
                }
                if (data.status === 'error') {
                    console.warn(`[RSS ⚠️] ${source.name} rss2json: ${data.message}`);
                }
            }
        } catch(e) {
            console.warn(`[RSS ⚠️] ${source.name} rss2json timeout`);
        }

        console.warn(`[RSS ❌] ${source.name} — tüm proxy'ler başarısız`);
        return null;
    } catch(e) {
        console.error("[_fetchOneSource] Hata:", e.message || e);
    }
}

/* ── İngilizce metin kontrolü ───────────────────────────────── */
const _EN_COMMON = ['the','and','that','this','with','have','from','they','been','were',
                    'which','their','will','when','more','also','about','said','after','into'];
function _isEnglish(text) {
    if (!text || text.length < 50) return false;
    const lower = text.toLowerCase();
    const hits  = _EN_COMMON.filter(w => lower.includes(' ' + w + ' '));
    return hits.length >= 4; // En az 4 İngilizce yaygın kelime
}

/* ── Tüm kaynaklardan paralel çek → count kadar makale ─────── */
async function _fetchAllRSS(count) {
    try {
        // Kategori sırası: Bilim → Teknoloji → Oyun
        // Her kategoriden paralel çek, önce bilim doldur, yer kalırsa diğerlerinden ekle
        const SCIENCE_SLOTS = 12; // 20'nin %60'ı bilim
        const TECH_SLOTS    = 5;  // %25 teknoloji
        const GAMING_SLOTS  = 3;  // %15 oyun (kalan)

        function _pickFromResults(results, maxPerSource) {
            const articles = [];
            for (const r of results) {
                if (r.status !== 'fulfilled' || !r.value) continue;
                const { source, items } = r.value;
                const sorted = [...items]
                    .filter(i => _isEnglish(i.description + ' ' + (i.content||'')))
                    .sort((a, b) => {
                        // En yeni haber önce
                        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
                        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
                        if (db !== da) return db - da;
                        // Tarih eşitse daha zengin içerik
                        return (b.description + (b.content||'')).length - (a.description + (a.content||'')).length;
                    });
                sorted.slice(0, maxPerSource).forEach(pick => {
                    if (pick) articles.push({ ...pick, sourceName: source.name, sourceIcon: source.icon, _cat: source.cat });
                });
            }
            // Kategori içinde karıştır
            for (let i = articles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [articles[i], articles[j]] = [articles[j], articles[i]];
            }
            return articles;
        }

        // Tüm kategorileri paralel çek
        const [sciRes, techRes, gameRes] = await Promise.all([
            Promise.allSettled(RSS_SOURCES_SCIENCE.map(_fetchOneSource)),
            Promise.allSettled(RSS_SOURCES_TECH.map(_fetchOneSource)),
            Promise.allSettled(RSS_SOURCES_GAMING.map(_fetchOneSource)),
        ]);

        const sciArticles  = _pickFromResults(sciRes,  2);
        const techArticles = _pickFromResults(techRes, 2);
        const gameArticles = _pickFromResults(gameRes, 2);

        // Önce bilim slotlarını doldur, yer kalırsa teknoloji, sonra oyun
        let articles = [
            ...sciArticles.slice(0, SCIENCE_SLOTS),
            ...techArticles.slice(0, TECH_SLOTS),
            ...gameArticles.slice(0, GAMING_SLOTS),
        ];

        // Bilim yetmediyse teknoloji/oyundan tamamla
        if (articles.length < count) {
            const extra = [
                ...sciArticles.slice(SCIENCE_SLOTS),
                ...techArticles.slice(TECH_SLOTS),
                ...gameArticles.slice(GAMING_SLOTS),
            ];
            articles = [...articles, ...extra].slice(0, count);
        }

        console.log(`[RSS] Toplam: ${articles.length} makale — Bilim: ${articles.filter(a=>a._cat==='science').length} · Teknoloji: ${articles.filter(a=>a._cat==='tech').length} · Oyun: ${articles.filter(a=>a._cat==='gaming').length}`);
        return articles.slice(0, count);
    } catch(e) {
        console.error("[_fetchAllRSS] Hata:", e.message || e);
    }
}

/* ── Ham metni temizle ──────────────────────────────────────── */
function _cleanText(article) {
    // HTML tag'ları sökerken kelime birleşmesini önle:
    // <a>forms</a>Craig → "forms Craig" (tag yerine boşluk)
    const stripHTML = (str) => (str || '')
        .replace(/<br\s*\/?>/gi, ' ')           // <br> → boşluk
        .replace(/<\/(?:p|div|li|h[1-6]|tr|td)>/gi, ' ')  // kapanan blok tag → boşluk
        .replace(/<[^>]+>/g, ' ')               // kalan tüm tag'lar → boşluk
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g,  '&')
        .replace(/&lt;/g,   '<')
        .replace(/&gt;/g,   '>')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, ' ')               // numeric entities
        .replace(/\s+/g, ' ')
        .trim();

    const desc = stripHTML(article.description || '');
    const cont = stripHTML(article.content     || '');

    // İkisini birleştir; content belirgin şekilde daha uzunsa önce al
    let raw;
    if (cont.length > desc.length * 1.5 && cont.length > 200) {
        raw = cont + (desc && desc !== cont ? ' ' + desc : '');
    } else {
        raw = [desc, cont].filter(Boolean).join(' ');
    }

    raw = raw.replace(/\s+/g, ' ').trim();

    let t = raw;
    if (t.length < 120) t = (article.title || '') + '. ' + t;

    const sentences = t.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length >= 4) {
        if (t.length > 1200) t = t.slice(0, 1200).replace(/\s\S+$/, '') + '…';
    } else {
        if (t.length > 700) t = t.slice(0, 700).replace(/\s\S+$/, '') + '…';
    }
    return t;
}

/* ── Min N cümle kontrolü ───────────────────────────────────── */
function _hasMinSentences(text, min = 4) {
    const sentences = (text || '').match(/[^.!?]+[.!?]+/g) || [];
    return sentences.length >= min;
}

/* ── Stop words ─────────────────────────────────────────────── */
const _SW = new Set('the a an and or but in on at to of for is are was were be been have has had do does did will would could should may might must can that this these those with from by as it its they their we our you your he she him her his i me my not no so if then than when where which who what how all any each more also about into after before during through because although however therefore thus said says make makes made use used using one two three well even new now just like get got back still most'.split(' '));

/* ── Akıllı CEFR tahmin (kelime uzunluğu + sıklık bazlı) ────── */
function _guessCEFR(text) {
    const words  = text.replace(/[^a-zA-Z\s]/g,'').toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const total  = words.length || 1;
    const long6  = words.filter(w => w.length >= 6  && !_SW.has(w)).length;
    const long9  = words.filter(w => w.length >= 9  && !_SW.has(w)).length;
    const long12 = words.filter(w => w.length >= 12 && !_SW.has(w)).length;
    const r6 = long6 / total, r9 = long9 / total, r12 = long12 / total;
    if (r12 > 0.06 || r9 > 0.18) return 'C1';
    if (r9  > 0.12 || r6 > 0.35) return 'B2';
    if (r6  > 0.22)               return 'B1';
    return 'B2';
}

/* ── Kelime sözlüğü: yaygın İngilizce→Türkçe mini-map ──────── */
const _TR_MAP = {
    // Bilim / Akademik
    'phenomenon':'olgu/fenomen','significant':'önemli','subsequent':'sonraki',
    'demonstrate':'göstermek','approximately':'yaklaşık olarak','contribute':'katkıda bulunmak',
    'environment':'çevre','evidence':'kanıt','establish':'kurmak','investigate':'araştırmak',
    'fundamental':'temel','generate':'üretmek','identify':'tanımlamak','indicate':'göstermek',
    'maintain':'sürdürmek','obtain':'elde etmek','participate':'katılmak','potential':'potansiyel',
    'previous':'önceki','primary':'birincil','process':'süreç/işlem','require':'gerektirmek',
    'research':'araştırma','response':'yanıt','structure':'yapı',
    'suggest':'önermek','therefore':'bu nedenle','traditional':'geleneksel','various':'çeşitli',
    // Teknoloji
    'algorithm':'algoritma','artificial':'yapay','autonomous':'özerk','bandwidth':'bant genişliği',
    'blockchain':'blok zinciri','capability':'kapasite/yetenek','computational':'hesapsal',
    'cybersecurity':'siber güvenlik','deployment':'dağıtım','efficiency':'verimlilik',
    'encryption':'şifreleme','infrastructure':'altyapı','integration':'entegrasyon',
    'interface':'arayüz','optimization':'optimizasyon','prototype':'prototip',
    'surveillance':'gözetleme','sustainable':'sürdürülebilir','transparency':'şeffaflık',
    'vulnerability':'güvenlik açığı',
    // Genel / YDT
    'acknowledge':'kabul etmek','adequate':'yeterli','adjacent':'komşu/yanında',
    'advocate':'savunmak/savunucu','ambiguous':'belirsiz','anticipate':'öngörmek',
    'arbitrary':'keyfi','articulate':'açıkça ifade etmek','assertive':'kendinden emin',
    'catastrophic':'felaket niteliğinde','coherent':'tutarlı','comprehensive':'kapsamlı',
    'consequently':'sonuç olarak','controversial':'tartışmalı','convenient':'elverişli',
    'conventional':'geleneksel','correlation':'korelasyon','credible':'güvenilir',
    'cumulative':'kümülatif','deficient':'yetersiz','deliberate':'kasıtlı',
    'diminish':'azalmak','discrepancy':'tutarsızlık','elaborate':'ayrıntılı',
    'eliminate':'ortadan kaldırmak','emphasize':'vurgulamak','encounter':'karşılaşmak',
    'enormous':'çok büyük','explicit':'açık/net','facilitate':'kolaylaştırmak',
    'fluctuate':'dalgalanmak','formidable':'zorlu/güçlü','gradual':'kademeli',
    'hierarchy':'hiyerarşi','hypothesis':'hipotez','illustrate':'örneklemek',
    'imminent':'yakın/çok yakında olan','implication':'çıkarım/sonuç','inevitable':'kaçınılmaz',
    'inherent':'doğasında olan','innovative':'yenilikçi','insufficient':'yetersiz',
    'intricate':'karmaşık','legislation':'mevzuat','legitimate':'meşru',
    'magnitude':'büyüklük/boyut','mandatory':'zorunlu','mechanism':'mekanizma',
    'minimize':'en aza indirmek','monitor':'izlemek','negligible':'ihmal edilebilir',
    'nevertheless':'bununla birlikte','obscure':'belirsiz/gizlemek','opponent':'rakip/karşı taraf',
    'perceive':'algılamak','predominantly':'ağırlıklı olarak',
    'preliminary':'ön/hazırlık aşaması','profound':'derin/köklü','prohibit':'yasaklamak',
    'promote':'teşvik etmek','proportion':'orantı','pursue':'peşinden gitmek',
    'radical':'köklü','rational':'mantıklı','recover':'iyileşmek/kurtarmak',
    'regulate':'düzenlemek','reinforce':'güçlendirmek','reluctant':'isteksiz',
    'remarkable':'dikkat çekici','resistant':'dirençli','restrict':'kısıtlamak',
    'retrieve':'geri almak','reveal':'ortaya çıkarmak','scrutiny':'titiz inceleme',
    'simultaneously':'eş zamanlı olarak','sophisticated':'gelişmiş/karmaşık',
    'speculate':'spekülasyon yapmak','substantial':'önemli/büyük miktarda',
    'suppress':'bastırmak','thorough':'kapsamlı/titiz',
    'transform':'dönüştürmek','transition':'geçiş','tremendous':'muazzam',
    'ultimately':'sonuç itibarıyla','unprecedented':'emsalsiz','volatile':'değişken',
    // Ek B2/C1 — sık RSS kelimeleri
    'adventure':'macera','subscription':'abonelik','evolution':'evrim',
    'examining':'incelemek','charting':'haritalamak','recently':'yakın zamanda',
    'palaeontology':'paleontoloji','honours':'onur/birincilik','electronics':'elektronik',
    'trainee':'stajyer','rankled':'rahatsız etmek','decided':'karar verdi',
    'graduated':'mezun oldu','library':'kütüphane','degree':'derece/diploma',
    'studying':'çalışmak','discovery':'keşif','climate':'iklim','species':'tür',
    'habitat':'yaşam alanı','extinct':'nesli tükenmiş','fossil':'fosil',
    'ancient':'antik/kadim','modern':'modern','digital':'dijital','global':'küresel',
    'complex':'karmaşık','critical':'kritik','creative':'yaratıcı','diverse':'çeşitli',
    'dynamic':'dinamik','flexible':'esnek','stable':'kararlı/istikrarlı',
    'unique':'benzersiz','visible':'görünür','crucial':'çok önemli',
    'challenge':'meydan okuma/zorluk','achieve':'başarmak','impact':'etki',
    'support':'desteklemek','develop':'geliştirmek','improve':'geliştirmek',
    'reduce':'azaltmak','increase':'artırmak','provide':'sağlamak',
    'expand':'genişletmek','decline':'azalmak/reddetmek','emerge':'ortaya çıkmak',
    'acquire':'edinmek','pursue':'takip etmek','consider':'düşünmek',
    'explain':'açıklamak','describe':'tanımlamak','measure':'ölçmek',
    'analyse':'analiz etmek','compare':'karşılaştırmak','predict':'tahmin etmek',
    'benefit':'fayda/yararlanmak','consequence':'sonuç','circumstance':'durum/koşul',
    'assumption':'varsayım','perspective':'bakış açısı','principle':'ilke',
    'solution':'çözüm','challenge':'zorluk','opportunity':'fırsat',
    'diversity':'çeşitlilik','inequality':'eşitsizlik','innovation':'yenilik',
    'consciousness':'bilinç','perception':'algı','motivation':'motivasyon',
    'intelligence':'zeka','population':'nüfus','territory':'bölge/toprak',
    'resource':'kaynak','demand':'talep','competition':'rekabet',
    'strategy':'strateji','technology':'teknoloji','community':'topluluk',
    'authority':'otorite','responsibility':'sorumluluk','capability':'yetenek'
};

/* ── Kelime analizi: sözlük + akıllı fallback ───────────────── */
function _vocabFallback(text) {
    const words = text.replace(/[^a-zA-Z\s]/g,'').toLowerCase().split(/\s+/)
                      .filter(w => w.length >= 5 && !_SW.has(w));
    const unique = [...new Set(words)];
    const vocab  = {};

    // 1. Önce sözlükte olan kelimeleri al (Türkçe çevirisi kesin)
    unique.filter(w => _TR_MAP[w]).forEach(w => { vocab[w] = _TR_MAP[w]; });

    // 2. Sözlükte olmayan ama uzun (8+ harf) kelimeleri de ekle
    if (Object.keys(vocab).length < 12) {
        unique.filter(w => !_TR_MAP[w] && w.length >= 8)
              .slice(0, 15 - Object.keys(vocab).length)
              .forEach(w => { vocab[w] = ''; }); // boş çeviri → hover'da AI çevirecek
    }

    // 3. Hâlâ < 12 ise 7+ harf kelimeleri de ekle
    if (Object.keys(vocab).length < 12) {
        unique.filter(w => !vocab[w] && w.length >= 7)
              .slice(0, 15 - Object.keys(vocab).length)
              .forEach(w => { vocab[w] = ''; });
    }

    const level = _guessCEFR(text);
    return { level, levelNote: 'Otomatik analiz', vocabulary: vocab };
}

/* ── Batch AI analizi: makaleler 8'lik gruplarda işlenir ─────── */
async function _batchAnalyzeWithAI(articles) {
    try {
        if (typeof aiCall !== 'function') throw new Error('aiCall yok');

        const CHUNK = 8; // 8 makale / istek — timeout riski azalır
        const allResults = [];

        for (let start = 0; start < articles.length; start += CHUNK) {
            const chunk = articles.slice(start, start + CHUNK);
            const items = chunk.map((a, i) => ({
                i: start + i,
                title:   (a._title || a.title || '').slice(0, 80),
                snippet: (a._text  || a.text  || '').slice(0, 250) // daha kısa snippet
            }));

            const prompt =
`You are an expert English teacher preparing materials for Turkish YDT (university entrance) students.
Analyze the ${items.length} passages below. Return ONLY a valid JSON array — no markdown, no prose.

${items.map(it => `[${it.i}] "${it.title}"\n${it.snippet}`).join('\n\n')}

Return a JSON array with exactly ${items.length} objects. Each object MUST use this exact structure:
[
  {
    "level": "C1",
    "levelNote": "kısa Türkçe not (maks 6 kelime)",
    "vocabulary": {
      "actual_word_from_text": "Türkçe karşılık"
    },
    "questions": [
      {
        "type": "Ana Fikir",
        "icon": "💡",
        "question": "English question about main idea",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "answer": "A",
        "explanation": "Türkçe açıklama — doğru şık neden doğru, diğerleri neden yanlış"
      },
      {
        "type": "Çıkarım",
        "icon": "🔎",
        "question": "English inference question",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "answer": "C",
        "explanation": "Türkçe açıklama"
      },
      {
        "type": "Kelime Anlamı",
        "icon": "📖",
        "question": "English vocabulary-in-context question",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "answer": "B",
        "explanation": "Türkçe açıklama"
      }
    ]
  }
]

Strict rules:
- level: one of A2/B1/B2/C1/C2
- levelNote: max 6 Turkish words describing difficulty
- vocabulary: EXACTLY 12-15 B2/C1/C2 level words ACTUALLY present in the text — real words as keys, NEVER "word" or "english_word"
- questions: exactly 3 per passage, ÖSYM YDT exam format, 5 options each labeled A)–E), grounded in the passage text
- answer: single capital letter A/B/C/D/E only
- No placeholder text anywhere`;

            try {
                const result = await Promise.race([
                    aiCall(prompt),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('batch_timeout')), 25000))
                ]);
                const arr = Array.isArray(result) ? result
                           : (result?.items || result?.data || null);
                if (Array.isArray(arr) && arr.length > 0) {
                    allResults.push(...arr);
                } else {
                    return null; // bu chunk başarısız → fallback'e geç
                }
            } catch(chunkErr) {
                console.warn(`[rss_paragraf] Batch chunk ${start}-${start+CHUNK} başarısız:`, chunkErr.message);
                return null;
            }
        }

        return allResults.length === articles.length ? allResults : null;

    } catch(e) {
        console.error("[_batchAnalyzeWithAI] Hata:", e.message || e);
    }
}

/* ── AI: tek makale analizi (5 sn timeout ile) ──────────────── */
async function _analyzeWithAI(text, title) {
    try {
        const prompt =
    `You are an expert English teacher for Turkish YDT exam students.
    Analyze this passage and return ONLY valid JSON (no markdown, no prose).

    Title: "${title}"
    Text: "${text.slice(0, 500)}"

    Return exactly this JSON structure:
    {
      "level": "C1",
      "levelNote": "Akademik söz varlığı yoğun",
      "vocabulary": {
        "sophisticated": "karmaşık/sofistike",
        "inevitable": "kaçınılmaz"
      },
      "questions": [
        {
          "type": "Ana Fikir", "icon": "💡",
          "question": "English main idea question",
          "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
          "answer": "A",
          "explanation": "Türkçe açıklama"
        },
        {
          "type": "Çıkarım", "icon": "🔎",
          "question": "English inference question",
          "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
          "answer": "C",
          "explanation": "Türkçe açıklama"
        },
        {
          "type": "Kelime Anlamı", "icon": "📖",
          "question": "English vocabulary-in-context question",
          "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
          "answer": "B",
          "explanation": "Türkçe açıklama"
        }
      ]
    }

    Strict rules:
    - level: A2/B1/B2/C1/C2
    - levelNote: max 6 Turkish words
    - vocabulary: 12-15 B2/C1/C2 level words ACTUALLY from the text — real words as keys, NEVER "word" or placeholders
    - questions: exactly 3, ÖSYM YDT format, 5 options A)–E), grounded in the text
    - answer: single capital letter only`;
        try {
            if (typeof aiCall === 'function') {
                return await Promise.race([
                    aiCall(prompt),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('single_timeout')), 10000))
                ]);
            }
        } catch(_) {}
        return _vocabFallback(text);
    } catch(e) {
        console.error("[_analyzeWithAI] Hata:", e.message || e);
    }
}

/* ── Makaleyi passage nesnesine dönüştür (AI olmadan da çalışır) */
function _toPassageSync(article, aiData) {
    // _text her zaman bu article'a ait — farklı article'dan gelmesini engelle
    const text = typeof article._text === 'string' && article._text.length > 0
        ? article._text
        : _cleanText(article);
    // Başlık mutlaka bu article'dan gelsin
    const title = (article.title || '').trim();
    const data = aiData || _vocabFallback(text);

    // Vocabulary: placeholder key'leri temizle (AI bazen {"word":"Turkish"} döndürüyor)
    const PLACEHOLDER_KEYS = new Set(['word','english_word','english','turkish','tr','key','vocab','term','placeholder']);
    const rawVoc = data.vocabulary || {};
    const cleanVoc = {};
    for (const [eng, tr] of Object.entries(rawVoc)) {
        const k = eng.trim().toLowerCase();
        if (PLACEHOLDER_KEYS.has(k) || k.length <= 2) continue;
        cleanVoc[eng.trim()] = tr;
    }

    // Questions: AI'dan gelen 3 YDT sorusunu doğrula
    const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
    const VALID_ANSWERS = new Set(['A','B','C','D','E']);
    const cleanQuestions = rawQuestions
        .filter(q => q && q.question && Array.isArray(q.options) && q.options.length === 5
                      && VALID_ANSWERS.has((q.answer || '').trim().toUpperCase()))
        .map(q => ({
            type:        q.type        || 'Soru',
            icon:        q.icon        || '📝',
            question:    q.question,
            options:     q.options,
            answer:      q.answer.trim().toUpperCase(),
            explanation: q.explanation || ''
        }));

    return {
        title,
        topic:      article.sourceName,
        text,
        vocabulary: cleanVoc,
        level:      data.level      || 'B2',
        levelNote:  data.levelNote  || '',
        questions:  cleanQuestions,           // ← YDT soruları passage ile birlikte gelir
        sourceIcon: article.sourceIcon || '📰',
        sourceName: article.sourceName || '',
        link:       article.link       || '',
        pubDate:    article.pubDate    || new Date().toISOString(),
        savedAt:    Date.now(),
        _fromRSS:   true
    };
}

/* ── Makaleyi passage nesnesine dönüştür (eski API uyumu) ───── */
async function _toPassage(article) {
    try {
        const text   = _cleanText(article);
        article._text = text; // cache for sync usage
        const aiData = await _analyzeWithAI(text, article.title);
        return _toPassageSync(article, aiData);
    } catch(e) {
        console.error("[_toPassage] Hata:", e.message || e);
    }
}

/* ══════════════════════════════════════════════════════════════
   FIREBASE SYNC
   ══════════════════════════════════════════════════════════════ */
async function _syncRSSToFirebase(passages) {
    try {
        const uid = window._currentUser?.uid;
        if (!uid || !window.db) return;
        const { ref, set, get } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');

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

        // paragraflar (yüklü pasajlar) — arşive eklenenler dahil
        if (typeof paragraflar !== 'undefined' && paragraflar.length > 0) {
            await set(ref(window.db, `ydt_users/${uid}/paragraflar`), paragraflar);
            console.log(`[rss_paragraf] ✅ Firebase: ${paragraflar.length} yüklü pasaj yazıldı`);
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
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');

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
    const uid      = window._currentUser?.uid || getDeviceId();
    localStorage.setItem(`ydt_rss_cache_${_rssCacheSlot()}`, JSON.stringify(passages));
    let arsiv = [];
    try { arsiv = JSON.parse(localStorage.getItem(`ydt_${uid}_rss_arsiv`) || '[]'); } catch(_) {}
    passages.forEach(p => {
        // Duplicate kontrolü: aynı link VEYA (aynı başlık + aynı gün)
        const today = new Date().toISOString().slice(0, 10);
        const isDup = arsiv.some(a =>
            a.link === p.link ||
            (a.title === p.title && (a.savedAt || 0) > Date.now() - 86400000)
        );
        if (!isDup) arsiv.unshift({ ...p, savedAt: Date.now() });
    });
    if (arsiv.length > 300) arsiv.length = 300;
    localStorage.setItem(`ydt_${uid}_rss_arsiv`, JSON.stringify(arsiv));
}

/* ══════════════════════════════════════════════════════════════
   ANA FONKSİYON — motor.js generateAIDailyParagraflar override
   ══════════════════════════════════════════════════════════════ */
async function generateAIDailyParagraflar(force) {
    try {
        const todayKey   = _rssToday();
        const cacheKey   = `ydt_rss_cache_${_rssCacheSlot()}`;
        const listEl     = document.getElementById('ai-daily-paragraf-list');
        const badgeEl    = document.getElementById('ai-daily-date-badge');
        const refreshBtn = document.getElementById('ai-daily-refresh-btn');

        if (badgeEl) {
            const [y, m, d] = todayKey.split('-');
            badgeEl.textContent = `${d}.${m}.${y}`;
        }

        // Force modunda eski cache'i sil
        if (force) localStorage.removeItem(cacheKey);

        // Cache varsa hemen göster
        if (!force) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const p = JSON.parse(cached);
                    if (p && p.length >= 1) {
                        if (listEl && listEl.style.display === 'none') listEl.style.display = 'grid';
                        renderAIDailyParagraflar(p, listEl);
                        return;
                    }
                } catch(_) {}
            }
        }

        if (!listEl) return;
        listEl.style.display = 'grid';

        // Yenile butonu — loading state
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="animation:spin .7s linear infinite;display:inline-block"><path d="M11.5 2A6 6 0 1 0 12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.5 2H11.5V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Yükleniyor\u2026`;
        }
        const _resetBtn = () => {
            if (!refreshBtn) return;
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11.5 2A6 6 0 1 0 12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.5 2H11.5V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Yenile`;
        };

        // Loading UI
        listEl.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:28px 16px;">
            <div style="font-size:2rem;margin-bottom:8px;">📰</div>
            <div style="font-weight:800;color:var(--ink);font-size:.9rem;margin-bottom:4px;">Günlük 25 haber yükleniyor\u2026</div>
            <div style="font-size:.75rem;color:var(--ink3);margin-bottom:10px;">Bilim · Teknoloji · Oyun kaynakları taranıyor</div>
            <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">
              ${RSS_SOURCES.map(s => `<span style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:3px 9px;font-size:.65rem;font-weight:700;">${s.icon} ${s.name}</span>`).join('')}
            </div>
          </div>`;

        let passages = [];

        try {
            // RSS çek — 30 pasaj için daha fazla aday
            const articles = await Promise.race([
                _fetchAllRSS(40),
                new Promise(res => setTimeout(() => res([]), 20000))  // 20 sn — 16 kaynak paralel
            ]);

            if (articles && articles.length > 0) {
                listEl.innerHTML = `
                  <div style="grid-column:1/-1;text-align:center;padding:20px 16px;">
                    <div style="font-size:1.4rem;margin-bottom:6px;">🤖</div>
                    <div style="font-weight:800;color:var(--ink);font-size:.85rem;">Pasajlar hazırlanıyor\u2026</div>
                    <div style="font-size:.72rem;color:var(--ink3);margin-top:4px;">${articles.length} makale bulundu, analiz ediliyor</div>
                  </div>`;

                // 1. Önce tüm metinleri temizle (senkron, hızlı)
                articles.forEach(a => { a._text = _cleanText(a); });

                // 2. Batch AI analizi dene (tek istek, 15 sn timeout)
                let batchResults = null;
                try {
                    batchResults = await _batchAnalyzeWithAI(articles);
                } catch(_) { batchResults = null; }

                // 3. Batch başarısızsa: sadece ilk 5 makale için bireysel AI, geri kalan fallback
                if (!batchResults) {
                    const MAX_AI = 5;
                    const aiSlice = articles.slice(0, MAX_AI);
                    const aiResults = await Promise.allSettled(
                        aiSlice.map(a => Promise.race([
                            _analyzeWithAI(a._text, a.title),
                            new Promise(res => setTimeout(() => res(null), 5000))
                        ]))
                    );
                    batchResults = articles.map((_, i) => {
                        if (i < MAX_AI) {
                            const r = aiResults[i];
                            return (r && r.status === 'fulfilled' && r.value) ? r.value : null;
                        }
                        return null;
                    });
                }

                // 4. Pasajları oluştur (AI verisi varsa kullan, yoksa akıllı fallback)
                passages = articles
                    .map((a, i) => {
                        const aiData = (batchResults && batchResults[i]) ? batchResults[i] : null;
                        return _toPassageSync(a, aiData);
                    })
                    .filter(p => p && p.text && _hasMinSentences(p.text, 4))
                    .slice(0, 30);  // Günlük max 30
            }
        } catch(err) {
            console.warn('[rss_paragraf] fetch hatası:', err.message);
        }

        // Eksik slotları statik ile tamamla (30'a çıkar)
        const staticPool = _getStaticPassages();
        let si = 0;
        while (passages.length < 30 && si < staticPool.length) {
            const fill = staticPool[si++];
            if (!passages.some(p => p.title === fill.title)) passages.push(fill);
        }
        if (!passages.length) passages = staticPool.slice(0, 30);

        // ── YDT sorularını paragrafSorular'a otomatik yaz ──────────────
        // RSS+AI tek istekte üretilen soruları cache'e alır.
        // Kullanıcı "Soru Üret" butonuna basmadan sorular hazır gelir.
        window.paragrafSorular = window.paragrafSorular || {};
        let _newQCount = 0;
        passages.forEach(p => {
            if (!Array.isArray(p.questions) || p.questions.length === 0) return;
            const key = `p_${(p.title || '').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g,'').trim().slice(0,40)}_${(p.text || '').length}`;
            if (!window.paragrafSorular[key]) {
                window.paragrafSorular[key] = {
                    baslik:    p.title,
                    savedAt:   new Date().toISOString(),
                    questions: p.questions
                };
                _newQCount++;
            }
        });
        if (_newQCount > 0) {
            try { localStorage.setItem('ydt_paragraf_sorular', JSON.stringify(window.paragrafSorular)); } catch(_) {}
            if (window._saveData) window._saveData();
            console.log(`[rss_paragraf] ✅ ${_newQCount} pasaj için YDT soruları otomatik üretildi`);
        }
        // ────────────────────────────────────────────────────────────────

        // Kaydet ve render
        _saveToLS(passages);
        _syncRSSToFirebase(passages);
        renderAIDailyParagraflar(passages, listEl);
        _resetBtn();
    } catch(e) {
        console.error("[generateAIDailyParagraflar] Hata:", e.message || e);
    }
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

            // ── Eski cache'deki az kelimeli pasajları zenginleştir ──────────
            // Cache silinmeden, render anında vocabulary < 12 ise fallback ile takviye
            passages = passages.map(p => {
                if (!p._fromRSS) return p;
                const vocCount = Object.keys(p.vocabulary || {}).length;
                if (vocCount >= 12) return p;
                const text = p.text || '';
                if (!text) return p;
                const fb = _vocabFallback(text);
                const enriched = Object.assign({}, p.vocabulary || {});
                for (const [w, tr] of Object.entries(fb.vocabulary || {})) {
                    if (!enriched[w]) enriched[w] = tr;
                }
                return Object.assign({}, p, { vocabulary: enriched });
            });

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

                return `<div class="rh2-card" id="ai-card-${i}" data-action="openAIDailyParagraf(${i})">
                    <div class="rh2-card-accent rh2-card-accent-ai" style="background:linear-gradient(90deg,#0ea5e9,#0284c7);"></div>
                    <div class="rh2-card-body">
                        <div class="rh2-card-header">
                            <div class="rh2-card-icon rh2-card-icon-ai">${icon}</div>
                            <div class="rh2-card-titlemeta">
                                <div class="rh2-card-title">${p.title}</div>
                            </div>
                        </div>
                        <div class="rh2-card-statband">
                            <div class="rh2-sband-cell"><span class="rh2-sband-ico">⏱</span><span class="rh2-sband-num">${rm} dk</span></div>
                            <div class="rh2-sband-div"></div>
                            <div class="rh2-sband-cell"><span class="rh2-sband-ico">📝</span><span class="rh2-sband-num">${wc}</span><span class="rh2-sband-lbl">KELİME</span></div>
                            <div class="rh2-sband-div"></div>
                            <div class="rh2-sband-cell"><span class="rh2-sband-ico">💬</span><span class="rh2-sband-num">${sents.length}</span><span class="rh2-sband-lbl">CÜMLE</span></div>
                            <div class="rh2-sband-div"></div>
                            <div class="rh2-sband-cell rh2-sband-max"><span class="rh2-sband-maxlbl">MAX:</span><span class="rh2-sband-maxnum">${voc.length}</span><span class="rh2-sband-maxsub">KELİME</span></div>
                        </div>
                        <div class="rh2-card-preview">${preview}</div>
                        <div class="rh2-card-footer">
                            ${voc.length ? `<span class="rh2-pill rh2-pill-word">📖 ${voc.length} kelime</span>` : ''}
                            <span class="rh2-pill" style="background:#e0f2fe;color:#0284c7;font-weight:800;">📰 ${p.sourceName||'RSS'}</span>
                            ${pills}
                            ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" data-stop="true" class="rh2-pill" style="background:#f0fdf4;color:#16a34a;text-decoration:none;font-weight:800;">🔗 Kaynak</a>` : ''}
                            <button class="rh2-card-save-btn ${saved?'saved':''}" id="ai-save-btn-${i}" data-stop="true" data-action="_saveAIPasaj(${i})">${saved?'✅ Arşivde':'🗂 Arşivle'}</button>
                        </div>
                    </div>
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
        const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
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
            sourceName: 'New Scientist', sourceIcon: '🔬', _fromRSS: true,
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

/* ── Admin kontrolü yukarıya taşındı ── */

/* ── Global export ──────────────────────────────────────────── */
window.generateAIDailyParagraflar = generateAIDailyParagraflar;
window.RSS_SOURCES                 = RSS_SOURCES;
window._syncRSSToFirebase          = _syncRSSToFirebase;
window._loadRSSFromFirebase        = _loadRSSFromFirebase;

console.log('[rss_paragraf.js v4.7] ✅ 16 kaynak · Bilim→Teknoloji→Oyun önceliği · free proxy önce · rss2json fallback · max 25/gün');
