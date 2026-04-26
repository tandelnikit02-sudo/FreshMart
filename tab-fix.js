/* ═══════════════════════════════════════════════════════════
   FRESHMART — NAV TAB FIX
   Add this script block at the END of app.js (or in a separate
   <script> tag just before </body>)
═══════════════════════════════════════════════════════════ */

/* ─── NAV TAB SWITCHER ──────────────────────────────────── */
(function initNavTabs() {

  /* Map each tab label to a handler */
  const TAB_HANDLERS = {
    '🛒 Shop':    handleShopTab,
    '📦 Orders':  handleOrdersTab,
    '💚 Deals':   handleDealsTab,
    '📍 Track':   handleTrackTab,
  };

  /* Grab all nav links */
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      /* Update active class */
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      /* Run tab handler */
      const handler = TAB_HANDLERS[link.textContent.trim()];
      if (handler) handler();
    });
  });

  /* ── SHOP TAB ── (default / home) */
  function handleShopTab() {
    showTabToast('🛒 Shop', 'Browse & order fresh groceries!', '#10b981');
    /* Restore chat to normal shopping flow */
    document.querySelector('.chat').style.display = 'flex';
    removeTabPanel();
  }

  /* ── ORDERS TAB ── */
  function handleOrdersTab() {
    showTabToast('📦 Orders', 'Your recent orders', '#60a5fa');
    injectTabPanel('orders', buildOrdersPanel());
  }

  /* ── DEALS TAB ── */
  function handleDealsTab() {
    showTabToast('💚 Deals', 'Today\'s freshest deals!', '#4ade80');
    injectTabPanel('deals', buildDealsPanel());
  }

  /* ── TRACK TAB ── */
  function handleTrackTab() {
    showTabToast('📍 Track', 'Track your delivery live', '#fb923c');
    injectTabPanel('track', buildTrackPanel());
  }

  /* ════════════════════════════════════════════════════
     PANEL BUILDER HELPERS
  ════════════════════════════════════════════════════ */

  /** Remove any injected tab panel and restore chat */
  function removeTabPanel() {
    const old = document.getElementById('__tab-panel__');
    if (old) old.remove();
    const chat = document.querySelector('.chat');
    if (chat) chat.style.display = 'flex';
  }

  /** Replace chat area with a panel HTML string */
  function injectTabPanel(id, html) {
    removeTabPanel();
    const chat = document.querySelector('.chat');
    if (!chat) return;
    chat.style.display = 'none';

    const panel = document.createElement('div');
    panel.id = '__tab-panel__';
    panel.className = 'tab-panel';
    panel.innerHTML = html;
    chat.parentNode.insertBefore(panel, chat.nextSibling);

    /* Animate in */
    requestAnimationFrame(() => panel.classList.add('tab-panel--in'));

    /* Back button */
    const backBtn = panel.querySelector('.tab-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-link')?.classList.add('active');
        handleShopTab();
      });
    }
  }

  /* ── ORDERS PANEL ── */
  function buildOrdersPanel() {
    const orders = typeof cart !== 'undefined' && cart.length
      ? cart.map(i => `
          <div class="tp-order-row">
            <span class="tp-order-ico">${i.emoji}</span>
            <div class="tp-order-info">
              <div class="tp-order-name">${i.name}</div>
              <div class="tp-order-meta">${i.qty} ${i.unit}</div>
            </div>
            <div class="tp-order-price">₹${i.subtotal}</div>
            <span class="tp-status tp-status--active">In Cart</span>
          </div>`).join('')
      : `<div class="tp-empty">
           <div class="tp-empty-ico">📦</div>
           <div class="tp-empty-title">No orders yet</div>
           <div class="tp-empty-sub">Start shopping to see your orders here</div>
         </div>`;

    return `
      <div class="tp-header">
        <button class="tab-back-btn">← Back to Shop</button>
        <h2 class="tp-title">📦 My Orders</h2>
        <p class="tp-sub">Your current cart & order history</p>
      </div>
      <div class="tp-body">${orders}</div>`;
  }

  /* ── DEALS PANEL ── */
  function buildDealsPanel() {
    const deals = [
      { emoji:'🥭', name:'Alphonso Mango',  was:'₹100', now:'₹80',  tag:'20% OFF',  color:'#f59e0b' },
      { emoji:'🍇', name:'Grapes',          was:'₹110', now:'₹90',  tag:'18% OFF',  color:'#a855f7' },
      { emoji:'🥕', name:'Carrot',          was:'₹65',  now:'₹50',  tag:'23% OFF',  color:'#f97316' },
      { emoji:'🍫', name:'Chocolate',       was:'₹70',  now:'₹50',  tag:'28% OFF',  color:'#92400e' },
      { emoji:'🍿', name:'Popcorn',         was:'₹45',  now:'₹35',  tag:'22% OFF',  color:'#fbbf24' },
      { emoji:'🥬', name:'Organic Spinach', was:'₹35',  now:'₹25',  tag:'29% OFF',  color:'#22c55e' },
    ];
    const rows = deals.map(d => `
      <div class="tp-deal-card">
        <span class="tp-deal-tag" style="background:${d.color}22;color:${d.color};border:1px solid ${d.color}44">${d.tag}</span>
        <div class="tp-deal-ico">${d.emoji}</div>
        <div class="tp-deal-name">${d.name}</div>
        <div class="tp-deal-prices">
          <span class="tp-deal-was">${d.was}</span>
          <span class="tp-deal-now" style="color:${d.color}">${d.now}</span>
        </div>
      </div>`).join('');

    return `
      <div class="tp-header">
        <button class="tab-back-btn">← Back to Shop</button>
        <h2 class="tp-title">💚 Today's Deals</h2>
        <p class="tp-sub">Limited time offers — refreshed daily</p>
      </div>
      <div class="tp-body">
        <div class="tp-deal-grid">${rows}</div>
      </div>`;
  }

  /* ── TRACK PANEL ── */
  function buildTrackPanel() {
    const steps = [
      { ico:'✅', label:'Order Placed',       sub:'Your order has been confirmed',         done:true  },
      { ico:'🧑‍🍳', label:'Being Prepared',   sub:'Our team is packing your items',         done:true  },
      { ico:'🚴', label:'Out for Delivery',   sub:'Rider is on the way to your address',   done:false, active:true },
      { ico:'🏠', label:'Delivered',          sub:'Enjoy your fresh groceries!',           done:false },
    ];
    const stepHTML = steps.map((s, i) => `
      <div class="tp-track-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}">
        <div class="tp-track-ico">${s.ico}</div>
        <div class="tp-track-line ${i < steps.length - 1 ? 'show' : ''}"></div>
        <div class="tp-track-info">
          <div class="tp-track-label">${s.label}</div>
          <div class="tp-track-sub">${s.sub}</div>
        </div>
      </div>`).join('');

    return `
      <div class="tp-header">
        <button class="tab-back-btn">← Back to Shop</button>
        <h2 class="tp-title">📍 Track Order</h2>
        <p class="tp-sub">Live delivery status</p>
      </div>
      <div class="tp-body">
        <div class="tp-track-eta">
          <div class="tp-eta-circle">
            <span class="tp-eta-num">22</span>
            <span class="tp-eta-unit">min</span>
          </div>
          <div class="tp-eta-info">
            <div class="tp-eta-title">Estimated Arrival</div>
            <div class="tp-eta-sub">Rider is 2.1 km away</div>
          </div>
        </div>
        <div class="tp-track-steps">${stepHTML}</div>
      </div>`;
  }

  /* ════════════════════════════════════════════════════
     TOAST NOTIFICATION
  ════════════════════════════════════════════════════ */
  function showTabToast(title, msg, color) {
    const old = document.getElementById('__tab-toast__');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = '__tab-toast__';
    toast.className = 'tab-toast';
    toast.style.setProperty('--toast-color', color);
    toast.innerHTML = `<strong>${title}</strong> — ${msg}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('tab-toast--in'));
    setTimeout(() => {
      toast.classList.remove('tab-toast--in');
      setTimeout(() => toast.remove(), 400);
    }, 2200);
  }

})();