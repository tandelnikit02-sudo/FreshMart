/* ═══════════════════════════════════════════════════════════════
   FRESHMART — AI GROCERY CHATBOT  ·  app.js  v3.0
   Real typewriter effect · Live character-by-character rendering
═══════════════════════════════════════════════════════════════ */

/* ─── PARTICLE CANVAS ──────────────────────────────────────── */
(function () {
  const cv = document.getElementById('bgCanvas');
  if (!cv) return;
  const cx = cv.getContext('2d');
  let W, H, pts = [];
  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  function Pt() { this.reset(); }
  Pt.prototype.reset = function () {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.r = Math.random() * 1.6 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = -(Math.random() * 0.42 + 0.08);
    this.life = Math.random(); this.alpha = Math.random() * 0.4 + 0.1;
    this.hue = [160, 200, 38, 280][Math.floor(Math.random() * 4)];
  };
  function init() {
    pts = [];
    const n = Math.min(100, Math.floor(W * H / 16000));
    for (let i = 0; i < n; i++) { const p = new Pt(); p.life = Math.random(); pts.push(p); }
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life += 0.0025;
      if (p.life > 1) p.reset();
      const a = p.life < 0.2 ? p.life / 0.2 : p.life > 0.8 ? (1 - p.life) / 0.2 : 1;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = `hsla(${p.hue},78%,66%,${a * p.alpha})`; cx.fill();
    });
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y);
          cx.strokeStyle = `rgba(16,185,129,${(1 - d / 90) * 0.035})`; cx.lineWidth = 0.5; cx.stroke();
        }
      }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { resize(); init(); });
  resize(); init(); draw();
})();

/* ─── CATALOG ──────────────────────────────────────────────── */
const CATALOG = {
  Fruits: [
    { name: 'Apple',     price: 100, unit: 'kg',    emoji: '🍎', color: '#f97316' },
    { name: 'Banana',    price: 40,  unit: 'dozen', emoji: '🍌', color: '#eab308' },
    { name: 'Orange',    price: 60,  unit: 'kg',    emoji: '🍊', color: '#f97316' },
    { name: 'Mango',     price: 80,  unit: 'kg',    emoji: '🥭', color: '#f59e0b' },
    { name: 'Grapes',    price: 90,  unit: 'kg',    emoji: '🍇', color: '#a855f7' },
  ],
  Vegetables: [
    { name: 'Potato',    price: 30,  unit: 'kg',    emoji: '🥔', color: '#a16207' },
    { name: 'Tomato',    price: 40,  unit: 'kg',    emoji: '🍅', color: '#ef4444' },
    { name: 'Onion',     price: 35,  unit: 'kg',    emoji: '🧅', color: '#d97706' },
    { name: 'Carrot',    price: 50,  unit: 'kg',    emoji: '🥕', color: '#f97316' },
    { name: 'Spinach',   price: 25,  unit: 'bunch', emoji: '🌿', color: '#22c55e' },
  ],
  Snacks: [
    { name: 'Chips',     price: 20,  unit: 'pack',  emoji: '🥨', color: '#f59e0b' },
    { name: 'Biscuits',  price: 30,  unit: 'pack',  emoji: '🍪', color: '#d97706' },
    { name: 'Chocolate', price: 50,  unit: 'bar',   emoji: '🍫', color: '#92400e' },
    { name: 'Namkeen',   price: 45,  unit: 'pack',  emoji: '🌶️', color: '#ef4444' },
    { name: 'Popcorn',   price: 35,  unit: 'pack',  emoji: '🍿', color: '#fbbf24' },
  ],
};

const CATS = ['Fruits', 'Vegetables', 'Snacks'];

const CAT_META = {
  Fruits:     { icon: '🍎', num: '01', grad: 'linear-gradient(135deg,#fb923c,#ea580c)', glow: 'rgba(249,115,22,0.3)' },
  Vegetables: { icon: '🥦', num: '02', grad: 'linear-gradient(135deg,#4ade80,#16a34a)', glow: 'rgba(16,185,129,0.3)' },
  Snacks:     { icon: '🍫', num: '03', grad: 'linear-gradient(135deg,#fcd34d,#d97706)', glow: 'rgba(245,158,11,0.3)' },
};

/* ─── STATE ────────────────────────────────────────────────── */
let stage      = 'name';
let userName   = '';
let activeCat  = null;
let activeProd = null;
let cart       = [];
let busy       = false;
let aiHistory  = [];

/* ─── DOM REFS ─────────────────────────────────────────────── */
const $body    = document.getElementById('chatBody');
const $qzone   = document.getElementById('qzone');
const $inp     = document.getElementById('inp');
const $sendBtn = document.getElementById('sendBtn');
const $inpHint = document.getElementById('inpHint');
const $inpIcon = document.getElementById('inpIcon');
const $clock   = document.getElementById('clock');
const $navCart = document.getElementById('navCartChip');
const $navAmt  = document.getElementById('navCartAmt');
const $cartDot = document.getElementById('cartDot');
const $userAva = document.getElementById('userAva');
const $userNm  = document.getElementById('userNameNav');
const $chatST  = document.getElementById('chatStatusText');
const $chPill  = document.getElementById('chatCartPill');
const $pillAmt = document.getElementById('pillAmt');
const $catList = document.getElementById('catList');
const $cartCrd = document.getElementById('cartCard');
const $cartLst = document.getElementById('cartList');
const $cartBdg = document.getElementById('sbBadge');
const $cartTot = document.getElementById('cartTotalVal');
const $agStat  = document.getElementById('agentStatus');

/* ─── CLOCK ────────────────────────────────────────────────── */
const CLK = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
function tickClock() { if ($clock) $clock.textContent = CLK(); }
tickClock(); setInterval(tickClock, 30000);

/* ─── AGENT STATUS ─────────────────────────────────────────── */
function setTyping(on) {
  if ($chatST) $chatST.textContent = on ? 'Freshy is typing…' : 'Online · Ready to help';
  if ($agStat) $agStat.innerHTML = `<div class="ac-dot"></div><span>${on ? 'Typing…' : 'Online · Ready'}</span>`;
}

/* ─── CART ─────────────────────────────────────────────────── */
const GT = () => cart.reduce((s, i) => s + i.subtotal, 0);

function refreshCart() {
  const total = GT(), n = cart.length;
  if (n) {
    $navCart.style.display = 'flex'; $navAmt.textContent = `₹${total}`; $cartDot.textContent = n;
    $chPill.style.display = 'flex'; $pillAmt.textContent = `₹${total}`;
    $cartCrd.style.display = 'block'; $cartBdg.textContent = n; $cartTot.textContent = `₹${total}`;
    $cartLst.innerHTML = '';
    cart.forEach(item => {
      const el = document.createElement('div'); el.className = 'cart-item';
      el.innerHTML = `<span class="ci-emo">${item.emoji}</span>
        <div class="ci-info"><div class="ci-name">${item.name}</div><div class="ci-desc">${item.qty} ${item.unit}</div></div>
        <span class="ci-price">₹${item.subtotal}</span>`;
      $cartLst.appendChild(el);
    });
  } else {
    $navCart.style.display = 'none'; $chPill.style.display = 'none'; $cartCrd.style.display = 'none';
  }
}

function hlCat(cat) {
  $catList.querySelectorAll('.cat-row').forEach(el => el.classList.toggle('active', el.dataset.cat === cat));
}

function billHTML() {
  const rows = cart.map(i =>
    `${i.emoji} <strong>${i.name}</strong> × ${i.qty} ${i.unit} @ ₹${i.price}/${i.unit} = <strong style="color:#10b981">₹${i.subtotal}</strong>`
  ).join('<br/>');
  return `🧾 <strong>Your Order Summary</strong><br/><br/>${rows}<br/><br/>
    <span style="color:#2e4a65;letter-spacing:1px">━━━━━━━━━━━━━━━━━━</span><br/>
    💰 <strong style="color:#10b981;font-size:16px">Grand Total: ₹${GT()}</strong>`;
}

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER ENGINE
   Renders HTML content character-by-character with cursor
═══════════════════════════════════════════════════════════ */

/**
 * Converts HTML string into a sequence of "tokens":
 * each token is either a visible character (type:'char')
 * or a complete HTML tag (type:'tag') to inject wholesale.
 */
function htmlToTokens(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      // find closing >
      const end = html.indexOf('>', i);
      if (end === -1) {
        tokens.push({ type: 'char', val: html[i] });
        i++;
      } else {
        tokens.push({ type: 'tag', val: html.slice(i, end + 1) });
        i = end + 1;
      }
    } else if (html[i] === '&') {
      // HTML entity — treat as one character
      const end = html.indexOf(';', i);
      if (end === -1) {
        tokens.push({ type: 'char', val: html[i] });
        i++;
      } else {
        tokens.push({ type: 'char', val: html.slice(i, end + 1) });
        i = end + 1;
      }
    } else {
      tokens.push({ type: 'char', val: html[i] });
      i++;
    }
  }
  return tokens;
}

/**
 * Types out HTML content character by character into a DOM element.
 * Tags are injected instantly; only visible text chars are typed.
 * Returns a Promise that resolves when typing is complete.
 */
function typewriterHTML(el, html, opts = {}) {
  const {
    baseSpeed    = 22,   // ms per character (base)
    variance     = 18,   // random variance ±ms
    pauseComma   = 120,  // extra pause after ,
    pausePeriod  = 220,  // extra pause after . ! ?
    pauseNewline = 160,  // extra pause after <br>
    showCursor   = true,
  } = opts;

  return new Promise(resolve => {
    const tokens = htmlToTokens(html);
    let built = '';
    let idx = 0;

    // Add cursor span
    const cursorEl = document.createElement('span');
    cursorEl.className = 'tw-cursor';
    cursorEl.textContent = '▋';

    function step() {
      if (idx >= tokens.length) {
        // Done — remove cursor if needed
        if (!showCursor) cursorEl.remove();
        resolve();
        return;
      }

      const token = tokens[idx];
      idx++;

      if (token.type === 'tag') {
        // Inject tag instantly, keep going
        built += token.val;
        el.innerHTML = built;
        if (showCursor) el.appendChild(cursorEl);
        scrollDown();

        // Check if this was a <br/> for pause
        const isBr = /^<br/i.test(token.val);
        const delay = isBr ? pauseNewline : 0;
        setTimeout(step, delay);
      } else {
        // Type character
        built += token.val;
        el.innerHTML = built;
        if (showCursor) el.appendChild(cursorEl);
        scrollDown();

        // Compute next delay
        const ch = token.val;
        let delay = baseSpeed + (Math.random() * variance * 2 - variance);

        // Natural pauses
        if (ch === ',' || ch === ';') delay += pauseComma;
        else if (ch === '.' || ch === '!' || ch === '?') delay += pausePeriod;
        // Emoji — quick
        else if ([...ch].some(c => c.codePointAt(0) > 0x1F000)) delay = baseSpeed * 0.4;

        // Small burst chance — type 2-3 chars rapidly
        delay = Math.max(8, delay);
        setTimeout(step, delay);
      }
    }

    // Small initial pause before starting to type
    el.innerHTML = '';
    if (showCursor) el.appendChild(cursorEl);
    setTimeout(step, 80);
  });
}

/* ═══════════════════════════════════════════════════════════
   AI ENGINE
═══════════════════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are Freshy, the friendly AI grocery assistant for FreshMart India.

STORE CATALOG:
🍎 Fruits: Apple ₹100/kg, Banana ₹40/dozen, Orange ₹60/kg, Mango ₹80/kg, Grapes ₹90/kg
🥦 Vegetables: Potato ₹30/kg, Tomato ₹40/kg, Onion ₹35/kg, Carrot ₹50/kg, Spinach ₹25/bunch
🍫 Snacks: Chips ₹20/pack, Biscuits ₹30/pack, Chocolate ₹50/bar, Namkeen ₹45/pack, Popcorn ₹35/pack

RULES:
- Always prices in ₹ (Indian Rupees)
- Delivery in 30-45 minutes
- Be warm, helpful, use emojis naturally
- Keep replies SHORT — max 2-3 sentences
- For product questions: give price and suggest ordering
- For off-topic questions: politely redirect to groceries
- Never invent products outside the catalog
- Always end with a helpful question or next step`;

async function claudeAI(userMsg) {
  try {
    const messages = [
      ...aiHistory.slice(-8),
      { role: 'user', content: userMsg }
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.map(c => c.text || '').join('').trim() || null;
    if (text) {
      aiHistory.push({ role: 'user', content: userMsg });
      aiHistory.push({ role: 'assistant', content: text });
    }
    return text ? text.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>') : null;
  } catch { return null; }
}

/* ═══════════════════════════════════════════════════════════
   MESSAGES
═══════════════════════════════════════════════════════════ */
function pushUser(text) {
  const row = document.createElement('div'); row.className = 'msg-row user';
  const wrap = document.createElement('div'); wrap.className = 'msg-wrap u';
  const bbl = document.createElement('div'); bbl.className = 'bubble user';
  const ts  = document.createElement('div'); ts.className = 'msg-time';
  bbl.textContent = text; ts.innerHTML = `✓✓ ${CLK()}`;
  wrap.appendChild(bbl); wrap.appendChild(ts); row.appendChild(wrap);
  $body.appendChild(row); scrollDown();
}

/**
 * pushBot — shows the "thinking" dot animation first,
 * then transitions to typewriter character-by-character rendering.
 */
function pushBot(html, delay = 0) {
  return new Promise(resolve => {

    /* ── Step 1: Thinking dots ── */
    const thinkRow = document.createElement('div');
    thinkRow.className = 'typing-row';
    thinkRow.id = '__typing__';

    const av = document.createElement('div'); av.className = 'msg-ava'; av.textContent = '🤖';
    const tb = document.createElement('div'); tb.className = 'typing-bubble';
    tb.innerHTML = `
      <div class="tw-thinking">
        <div class="tw-dot"></div>
        <div class="tw-dot"></div>
        <div class="tw-dot"></div>
        <span class="tw-label">Freshy is typing</span>
      </div>`;
    thinkRow.appendChild(av); thinkRow.appendChild(tb);
    $body.appendChild(thinkRow);
    setTyping(true); scrollDown();

    // Thinking time: short (300–700ms) — just enough to feel real
    const thinkTime = Math.max(300, Math.min(700, html.replace(/<[^>]+>/g, '').length * 4)) + delay;

    setTimeout(async () => {
      /* ── Step 2: Remove dots, create message bubble ── */
      document.getElementById('__typing__')?.remove();
      setTyping(true); // keep "typing" status during typewriter

      const row  = document.createElement('div'); row.className = 'msg-row bot';
      const av2  = document.createElement('div'); av2.className = 'msg-ava'; av2.textContent = '🤖';
      const wrap = document.createElement('div'); wrap.className = 'msg-wrap';
      const bbl  = document.createElement('div'); bbl.className = 'bubble bot tw-active';
      const ts   = document.createElement('div'); ts.className = 'msg-time tw-timestamp'; ts.style.opacity = '0';

      wrap.appendChild(bbl); wrap.appendChild(ts);
      row.appendChild(av2); row.appendChild(wrap);
      $body.appendChild(row); scrollDown();

      /* ── Step 3: Typewriter effect ── */
      await typewriterHTML(bbl, html, {
        baseSpeed:    20,
        variance:     14,
        pauseComma:   110,
        pausePeriod:  200,
        pauseNewline: 140,
        showCursor:   true,
      });

      /* ── Step 4: Finalize ── */
      // Remove cursor blink, finalize content
      bbl.classList.remove('tw-active');
      const cursor = bbl.querySelector('.tw-cursor');
      if (cursor) {
        cursor.classList.add('tw-cursor-done');
        setTimeout(() => cursor.remove(), 400);
      }

      // Reveal timestamp
      ts.textContent = CLK();
      ts.style.transition = 'opacity 0.4s';
      ts.style.opacity = '1';

      setTyping(false);
      resolve();
    }, thinkTime);
  });
}

function scrollDown() { $body.scrollTo({ top: $body.scrollHeight, behavior: 'smooth' }); }

/* ═══════════════════════════════════════════════════════════
   QUICK PANELS
═══════════════════════════════════════════════════════════ */
function clrZone() { $qzone.innerHTML = ''; }

/* ── 4-category grid ── */
function showCats() {
  clrZone();
  const grid = document.createElement('div'); grid.className = 'q-cat-grid';
  CATS.forEach((cat, i) => {
    const m = CAT_META[cat];
    const card = document.createElement('div'); card.className = 'q-cat-card'; card.dataset.c = cat;
    card.style.setProperty('--cat-glow', m.glow);
    card.innerHTML = `
      <div class="qcc-ribbon" style="background:${m.grad}"></div>
      <span class="qcc-num">${m.num}</span>
      <div class="qcc-ico">${m.icon}</div>
      <div class="qcc-lbl">${cat}</div>
      <div class="qcc-sub">${CATALOG[cat].length} items</div>`;
    card.addEventListener('click', () => go(cat));
    grid.appendChild(card);
  });
  $qzone.appendChild(grid);
}

/* ── product list ── */
function showProds(cat) {
  clrZone();
  const list = document.createElement('div'); list.className = 'q-prod-list';
  CATALOG[cat].forEach(p => {
    const row = document.createElement('div'); row.className = 'q-prod';
    row.style.setProperty('--prod-accent', p.color || '#10b981');
    row.innerHTML = `
      <span class="qp-ico">${p.emoji}</span>
      <div class="qp-info"><div class="qp-name">${p.name}</div><div class="qp-unit">per ${p.unit}</div></div>
      <div class="qp-price">
        <span class="qp-amt" style="color:${p.color || '#10b981'}">₹${p.price}</span>
        <span class="qp-per">/${p.unit}</span>
      </div>`;
    row.addEventListener('click', () => go(p.name));
    list.appendChild(row);
  });
  $qzone.appendChild(list);
}

/* ── qty buttons ── */
function showQty(prod) {
  clrZone();
  const isCount = ['dozen','bunch','pack','bar','250g','100g','litre'].includes(prod.unit);
  const qtys = isCount ? [1, 2, 3, 5] : [0.5, 1, 2, 3, 5];
  const row = document.createElement('div'); row.className = 'q-qty-row';
  qtys.forEach(q => {
    const btn = document.createElement('button'); btn.className = 'q-qty-btn';
    btn.innerHTML = `<span class="qb-val">${q}</span><span class="qb-lbl">${prod.unit} · ₹${Math.round(prod.price * q)}</span>`;
    btn.addEventListener('click', () => go(String(q)));
    row.appendChild(btn);
  });
  const cu = document.createElement('button'); cu.className = 'q-qty-btn';
  cu.innerHTML = `<span class="qb-val">✏️</span><span class="qb-lbl">Custom</span>`;
  cu.addEventListener('click', () => { $inp.focus(); $inp.placeholder = `Enter ${prod.unit}s…`; });
  row.appendChild(cu); $qzone.appendChild(row);
}

/* ── more options ── */
function showMore() {
  clrZone();
  const row = document.createElement('div'); row.className = 'q-chip-row';
  [
    { label: '🛒 Add More',       cls: 'green',   val: 'add more' },
    { label: '↩️ Same Category',  cls: 'neutral',  val: 'same category' },
    { label: '🧾 Checkout',       cls: 'orange',   val: 'checkout' },
  ].forEach(({ label, cls, val }) => {
    const b = document.createElement('button'); b.className = `q-chip ${cls}`;
    b.textContent = label; b.addEventListener('click', () => go(val));
    row.appendChild(b);
  });
  $qzone.appendChild(row);
}

/* ── delivery choice ── */
function showDelivery() {
  clrZone();
  const row = document.createElement('div'); row.className = 'q-act-row';
  [
    { label: 'Home Delivery', ico: '🚚', cls: 'primary',   val: 'delivery' },
    { label: 'Store Pickup',  ico: '🏪', cls: 'secondary', val: 'pickup' },
  ].forEach(({ label, ico, cls, val }) => {
    const b = document.createElement('button'); b.className = `q-act-btn ${cls}`;
    b.innerHTML = `<span class="ab-ico">${ico}</span><span>${label}</span>`;
    b.addEventListener('click', () => go(val));
    row.appendChild(b);
  });
  $qzone.appendChild(row);
}

/* ── final done ── */
function showDone() {
  clrZone();
  const row = document.createElement('div'); row.className = 'q-act-row';
  [
    { label: '🔄 Shop Again', cls: 'primary',   val: 'yes' },
    { label: '👋 No Thanks',  cls: 'secondary',  val: 'no' },
  ].forEach(({ label, cls, val }) => {
    const b = document.createElement('button'); b.className = `q-act-btn ${cls}`;
    b.textContent = label; b.addEventListener('click', () => go(val));
    row.appendChild(b);
  });
  $qzone.appendChild(row);
}

/* ─── HINT SYNC ────────────────────────────────────────────── */
function syncHint() {
  const m = {
    name:     { h: 'Enter your name to start shopping 👋', ico: '👤', ph: "What's your name?" },
    category: { h: 'Tap a category card — Fruits, Vegetables or Snacks', ico: '🏪', ph: 'Type category name…' },
    product:  { h: 'Tap a product or type its exact name', ico: '🔍', ph: 'Product name…' },
    qty:      { h: `Tap a button or type quantity in ${activeProd?.unit || 'units'}`, ico: '🔢', ph: `Qty in ${activeProd?.unit || 'units'}…` },
    more:     { h: 'Add more items, browse same category, or checkout', ico: '⚡', ph: 'What next?' },
    checkout: { h: 'Choose Home Delivery or Store Pickup', ico: '📦', ph: 'Delivery or Pickup?' },
    address:  { h: 'Enter your complete delivery address', ico: '📍', ph: 'Full delivery address…' },
    done:     { h: 'Shop again or finish — your choice!', ico: '✅', ph: 'Continue…' },
  }[stage] || { h: 'Ask Freshy anything about groceries', ico: '💬', ph: 'Type here…' };
  $inpHint.textContent = m.h; $inpIcon.textContent = m.ico; $inp.placeholder = m.ph;
}

function setSend(on) { $sendBtn.classList.toggle('ready', on); $sendBtn.disabled = !on; }
function unlock()    { busy = false; $inp.disabled = false; $inp.focus(); }

/* ═══════════════════════════════════════════════════════════
   CATEGORY MATCHER
═══════════════════════════════════════════════════════════ */
function matchCat(msg) {
  const low = msg.toLowerCase().trim();
  const n = parseInt(low);
  if (!isNaN(n) && n >= 1 && n <= 4) return CATS[n - 1];
  const exact = CATS.find(c => c.toLowerCase() === low);
  if (exact) return exact;
  if (/fruit|apple|banana|mango|orange|grape/.test(low)) return 'Fruits';
  if (/veg|potato|tomato|onion|carrot|spinach/.test(low))  return 'Vegetables';
  if (/snack|chips|biscuit|chocolate|namkeen|popcorn/.test(low)) return 'Snacks';
  return null;
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT MATCHER
═══════════════════════════════════════════════════════════ */
function matchProd(msg, cat) {
  const low = msg.toLowerCase().trim();
  const list = CATALOG[cat];
  return list.find(p => p.name.toLowerCase() === low)
      || list.find(p => low.includes(p.name.toLowerCase()))
      || list.find(p => p.name.toLowerCase().includes(low));
}

/* ═══════════════════════════════════════════════════════════
   MAIN FLOW
═══════════════════════════════════════════════════════════ */
async function go(raw) {
  const msg = raw.trim();
  if (!msg || busy) return;
  busy = true;
  pushUser(msg); $inp.value = ''; setSend(false); $inp.disabled = true;

  /* ── NAME ── */
  if (stage === 'name') {
    userName = msg.split(' ')[0];
    $userAva.textContent = userName[0].toUpperCase();
    $userNm.textContent  = userName;
    aiHistory = [];
    stage = 'category';
    await pushBot(
      `Hey <strong>${userName}</strong>! 👋 Welcome to <strong>FreshMart</strong>!<br/><br/>
       I'm <strong>Freshy</strong> — your AI grocery assistant.<br/>
       Fresh groceries delivered to your door in just <strong>30 minutes!</strong><br/><br/>
       Which category would you like to explore today? 🛒`
    );
    showCats(); syncHint(); unlock(); return;
  }

  /* ── CATEGORY ── */
  if (stage === 'category') {
    const cat = matchCat(msg);
    if (cat) {
      activeCat = cat; stage = 'product'; hlCat(cat);
      const m = CAT_META[cat];
      await pushBot(
        `${m.icon} <strong>${cat}</strong> — excellent choice, ${userName}!<br/><br/>
         Here are all our fresh <strong>${cat}</strong> with today's prices.<br/>
         Tap any item to add it to your cart 👇`
      );
      showProds(cat); syncHint(); unlock(); return;
    }
    const aiRep = await claudeAI(`I want to buy groceries. Categories available: Fruits, Vegetables, Snacks. I said: "${msg}"`);
    await pushBot(aiRep || `I have <strong>3 categories</strong> for you — tap a card to browse! 👇`);
    showCats(); unlock(); return;
  }

  /* ── PRODUCT ── */
  if (stage === 'product') {
    const switchCat = matchCat(msg);
    if (switchCat && switchCat !== activeCat) {
      activeCat = switchCat; hlCat(switchCat);
      await pushBot(`Switching to <strong>${switchCat}</strong>! Here are the items 👇`);
      showProds(switchCat); unlock(); return;
    }
    const prod = matchProd(msg, activeCat);
    if (prod) {
      activeProd = prod; stage = 'qty';
      await pushBot(
        `${prod.emoji} <strong>${prod.name}</strong><br/>
         Price: <strong style="color:${prod.color || '#10b981'}">₹${prod.price}</strong> per <strong>${prod.unit}</strong><br/><br/>
         How many <strong>${prod.unit}s</strong> would you like?
         <span style="color:#2e4a65;font-size:12px"><br/>Tap a quick amount or type a custom value</span>`
      );
      showQty(prod); syncHint(); unlock(); return;
    }
    const aiRep = await claudeAI(`I'm browsing ${activeCat}. Available: ${CATALOG[activeCat].map(p => p.name).join(', ')}. I said: "${msg}"`);
    await pushBot(aiRep || `Tap any product from <strong>${activeCat}</strong> below to add it to your cart 👇`);
    showProds(activeCat); unlock(); return;
  }

  /* ── QTY ── */
  if (stage === 'qty') {
    const qty = parseFloat(msg);
    if (isNaN(qty) || qty <= 0) {
      await pushBot(`Please enter a <strong>valid quantity</strong> — e.g. <strong>1</strong>, <strong>2</strong>, or <strong>0.5</strong> for ${activeProd.unit}.`);
      showQty(activeProd); unlock(); return;
    }
    const sub = Math.round(activeProd.price * qty);
    const idx = cart.findIndex(i => i.name === activeProd.name);
    if (idx >= 0) { cart[idx].qty += qty; cart[idx].subtotal += sub; }
    else cart.push({ ...activeProd, qty, subtotal: sub });
    refreshCart(); stage = 'more';
    await pushBot(
      `✅ <strong>Added to cart!</strong><br/><br/>
       ${activeProd.emoji} <strong>${activeProd.name}</strong> × <strong>${qty} ${activeProd.unit}</strong>
       = <strong style="color:#10b981">₹${sub}</strong><br/>
       🛒 Cart total: <strong style="color:#10b981">₹${GT()}</strong><br/><br/>
       What would you like to do next, ${userName}?`
    );
    showMore(); syncHint(); unlock(); return;
  }

  /* ── MORE ── */
  if (stage === 'more') {
    const low = msg.toLowerCase().trim();
    if (/add more|add|more|new|another|continue|shop more/.test(low)) {
      stage = 'category';
      await pushBot(`Let's keep shopping! 🛒 Pick a category below 👇`);
      showCats(); syncHint(); unlock(); return;
    }
    if (/same|back|again/.test(low)) {
      stage = 'product';
      await pushBot(`Back to <strong>${activeCat}</strong>! Pick another item 👇`);
      showProds(activeCat); syncHint(); unlock(); return;
    }
    if (/checkout|check out|pay|bill|order|done|finish|proceed/.test(low)) {
      stage = 'checkout';
      await pushBot(billHTML() + `<br/><br/>How would you like to receive your order, <strong>${userName}</strong>?`);
      showDelivery(); syncHint(); unlock(); return;
    }
    const cat = matchCat(msg);
    if (cat) {
      activeCat = cat; stage = 'product'; hlCat(cat);
      await pushBot(`${CAT_META[cat].icon} <strong>${cat}</strong> — great! Pick an item below 👇`);
      showProds(cat); syncHint(); unlock(); return;
    }
    const aiRep = await claudeAI(`Cart total: ₹${GT()}. I said: "${msg}". I can add more items, browse ${activeCat}, or checkout.`);
    await pushBot(aiRep || `Tap a button below to continue shopping or checkout 👇`);
    showMore(); unlock(); return;
  }

  /* ── CHECKOUT ── */
  if (stage === 'checkout') {
    const low = msg.toLowerCase();
    if (/delivery|home|deliver/.test(low)) {
      stage = 'address';
      await pushBot(`🚚 <strong>Home Delivery</strong> selected!<br/><br/>Please share your <strong>complete delivery address</strong> including flat/house number, street, area, and city:`);
      clrZone(); syncHint(); unlock(); return;
    }
    if (/pickup|pick up|collect|store/.test(low)) {
      stage = 'done';
      await pushBot(`🏪 <strong>Store Pickup</strong> confirmed!<br/><br/>
        Your order will be ready in <strong>15–20 minutes</strong> at our store.<br/>
        <br/>Thank you for your order, <strong>${userName}</strong>! 😊`);
      showDone(); syncHint(); unlock(); return;
    }
    const aiRep = await claudeAI(`User needs to choose delivery or pickup. They said: "${msg}"`);
    await pushBot(aiRep || `Please choose <strong>Home Delivery</strong> or <strong>Store Pickup</strong> below 👇`);
    showDelivery(); unlock(); return;
  }

  /* ── ADDRESS ── */
  if (stage === 'address') {
    stage = 'done';
    const aiConf = await claudeAI(`Confirm order placed for ${userName}, delivering to: "${msg}". 30-45 min delivery. One warm sentence.`);
    await pushBot(
      `🎉 <strong>Order Confirmed!</strong><br/><br/>
       📍 <strong>Delivering to:</strong> ${msg}<br/>
       🌿 <strong>Items:</strong> ${cart.map(i => `${i.emoji} ${i.name}`).join(', ')}<br/>
       💰 <strong>Total:</strong> <span style="color:#10b981">₹${GT()}</span><br/><br/>
       ${aiConf ? aiConf + '<br/><br/>' : ''}
       ⏱ Estimated arrival: <strong style="color:#10b981">30–45 minutes</strong> 🚴<br/><br/>
       Would you like to place another order?`
    );
    showDone(); syncHint(); unlock(); return;
  }

  /* ── DONE ── */
  if (stage === 'done') {
    const low = msg.toLowerCase();
    if (/yes|again|shop|more|new|another/.test(low)) {
      cart = []; activeCat = null; activeProd = null;
      refreshCart(); hlCat(null); aiHistory = [];
      stage = 'category';
      await pushBot(`Welcome back, <strong>${userName}</strong>! 🛒<br/><br/>Choose a category to start your fresh order:`);
      showCats();
    } else {
      clrZone();
      const aibye = await claudeAI(`Say a short warm goodbye to ${userName} who finished shopping at FreshMart. 1 sentence only.`);
      await pushBot(aibye || `Thank you for shopping with <strong>FreshMart</strong>, <strong>${userName}</strong>! 🌿 See you soon! 👋`);
    }
    syncHint(); unlock(); return;
  }

  unlock();
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR CATEGORY CLICK
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.cat-row').forEach(el => {
  el.addEventListener('click', () => {
    if (stage === 'category' || stage === 'more') go(el.dataset.cat);
  });
});

/* ═══════════════════════════════════════════════════════════
   RIGHT SIDEBAR QUICK-ASK CHIPS
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.qa-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const q = chip.dataset.q;
    if (!q || busy || stage === 'name') return;
    const low = q.toLowerCase();
    if      (/fruit/.test(low)   && (stage==='category'||stage==='more')) go('Fruits');
    else if (/veg/.test(low)     && (stage==='category'||stage==='more')) go('Vegetables');
    else if (/snack/.test(low)   && (stage==='category'||stage==='more')) go('Snacks');
    else if (/checkout/.test(low)&& stage==='more')                        go('checkout');
    else {
      if (busy) return;
      busy = true;
      pushUser(q); $inp.value = ''; setSend(false); $inp.disabled = true;
      claudeAI(q).then(rep => {
        pushBot(rep || `Ask me about any grocery — I'm here to help! 🛒`).then(() => {
          if (stage === 'category') showCats();
          else if (stage === 'more') showMore();
          unlock();
        });
      });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   INPUT EVENTS
═══════════════════════════════════════════════════════════ */
$inp.addEventListener('input', () => setSend($inp.value.trim().length > 0));
$inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !$inp.disabled && $inp.value.trim()) go($inp.value); });
$sendBtn.addEventListener('click', () => { if (!$inp.disabled && $inp.value.trim()) go($inp.value); });

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */
(async function boot() {
  $inp.disabled = true;
  await pushBot(
    `👋 <strong>Welcome to FreshMart!</strong><br/><br/>
     I'm <strong>Freshy</strong> — your personal AI grocery assistant.<br/>
     Order farm-fresh groceries and get them delivered in just <strong>30 minutes</strong>! 🚀<br/><br/>
     To get started, what's your <strong>name</strong>? 😊`,
    600
  );
  syncHint(); unlock();
})();