/* =========================================================
   MAISON Café — shared application logic
   Vanilla JS, no dependencies. GPU-friendly, event-light.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const money = (n) => '$' + n.toFixed(2);
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
  };

  /* ----------------------------------------------------------
     THEME  (initial theme already set by inline head script)
  ---------------------------------------------------------- */
  function initTheme() {
    const btn = $('#themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      store.set('maison-theme', next);
    });
  }

  /* ----------------------------------------------------------
     HEADER scroll + mobile nav
  ---------------------------------------------------------- */
  function initHeader() {
    const header = $('#header');
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (header) header.classList.toggle('scrolled', window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = $('#hamburger'), mnav = $('#mobileNav');
    if (burger && mnav) {
      const toggle = (open) => {
        mnav.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      };
      burger.addEventListener('click', () => toggle(!mnav.classList.contains('open')));
      $$('a', mnav).forEach(a => a.addEventListener('click', () => toggle(false)));
    }
  }

  /* ----------------------------------------------------------
     REVEAL on scroll (IntersectionObserver)
  ---------------------------------------------------------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(e => e.classList.add('in')); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(e => io.observe(e));
    // Safety: reveal anything already within the viewport on load (no scroll needed),
    // and a final failsafe so content can never remain invisible.
    const revealInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach(e => { if (!e.classList.contains('in')) { const r = e.getBoundingClientRect(); if (r.top < vh * 0.96 && r.bottom > 0) { e.classList.add('in'); io.unobserve(e); } } });
    };
    requestAnimationFrame(revealInView);
    window.addEventListener('load', revealInView);
    setTimeout(() => els.forEach(e => e.classList.add('in')), 2500);
  }

  /* ----------------------------------------------------------
     TOAST
  ---------------------------------------------------------- */
  let toastWrap;
  function toast(msg) {
    if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; document.body.appendChild(toastWrap); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>${msg}</span>`;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2400);
  }

  /* ----------------------------------------------------------
     MENU DATA
  ---------------------------------------------------------- */
  const IMG = {
    latte: 'assets/img/hero-latte.jpg',
    cappuccino: 'assets/img/cappuccino.jpg',
    iced: 'assets/img/iced-coffee.jpg',
    cake: 'assets/img/chocolate-cake.jpg'
  };
  const CATS = [
    { id: 'espresso', name: 'Espresso Bar', note: 'Pure & concentrated' },
    { id: 'hot', name: 'Hot Coffee', note: 'Crafted warm classics' },
    { id: 'cold', name: 'Cold Coffee', note: 'Iced & refreshing' },
    { id: 'tea', name: 'Tea & Refreshers', note: 'Light & aromatic' },
    { id: 'dessert', name: 'Desserts & Bakery', note: 'Sweet companions' }
  ];
  const MENU = [
    // Espresso
    { id: 'espresso', cat: 'espresso', type: 'coffee', name: 'Single Espresso', price: 3.20, desc: 'A concentrated 25ml shot with rich crema and deep cocoa notes.', img: null, badge: 'Classic' },
    { id: 'doppio', cat: 'espresso', type: 'coffee', name: 'Doppio', price: 3.90, desc: 'Double shot for a bolder, fuller-bodied experience.', img: null },
    { id: 'macchiato', cat: 'espresso', type: 'coffee', name: 'Espresso Macchiato', price: 4.10, desc: 'Espresso "stained" with a dollop of silky steamed milk.', img: null },
    { id: 'cortado', cat: 'espresso', type: 'coffee', name: 'Cortado', price: 4.40, desc: 'Balanced espresso cut with warm micro-foamed milk.', img: null },
    // Hot
    { id: 'cappuccino', cat: 'hot', type: 'coffee', name: 'Cappuccino', price: 4.80, desc: 'Espresso, steamed milk and a thick cloud of velvety foam.', img: IMG.cappuccino, badge: 'Popular' },
    { id: 'latte', cat: 'hot', type: 'coffee', name: 'Signature Latte', price: 5.20, desc: 'Our house blend with silky milk and delicate leaf art.', img: IMG.latte, badge: 'Signature' },
    { id: 'flatwhite', cat: 'hot', type: 'coffee', name: 'Flat White', price: 4.90, desc: 'Ristretto shots under a thin layer of micro-foam.', img: null },
    { id: 'mocha', cat: 'hot', type: 'coffee', name: 'Café Mocha', price: 5.50, desc: 'Espresso, dark chocolate and steamed milk, lightly dusted.', img: null },
    { id: 'americano', cat: 'hot', type: 'coffee', name: 'Americano', price: 3.80, desc: 'Espresso lengthened with hot water for a smooth finish.', img: null },
    // Cold
    { id: 'icedlatte', cat: 'cold', type: 'coffee', name: 'Iced Latte', price: 5.40, desc: 'Chilled espresso and cold milk poured over clear ice.', img: null, temp: 'Iced' },
    { id: 'icedcoffee', cat: 'cold', type: 'coffee', name: 'Classic Iced Coffee', price: 4.90, desc: 'Slow-steeped, smooth and endlessly refreshing.', img: IMG.iced, badge: 'Popular', temp: 'Iced' },
    { id: 'coldbrew', cat: 'cold', type: 'coffee', name: 'Cold Brew', price: 5.60, desc: '18-hour steeped for a naturally sweet, low-acidity cup.', img: null, temp: 'Iced' },
    { id: 'frappe', cat: 'cold', type: 'coffee', name: 'Caramel Frappé', price: 6.20, desc: 'Blended ice, espresso and caramel, crowned with cream.', img: null, temp: 'Iced' },
    { id: 'affogato', cat: 'cold', type: 'coffee', name: 'Affogato', price: 5.80, desc: 'A shot of hot espresso poured over vanilla gelato.', img: null },
    // Tea
    { id: 'chai', cat: 'tea', type: 'tea', name: 'Masala Chai', price: 4.20, desc: 'Black tea simmered with cardamom, ginger and cinnamon.', img: null },
    { id: 'greentea', cat: 'tea', type: 'tea', name: 'Jasmine Green Tea', price: 3.90, desc: 'Delicate jasmine-scented leaves, gently steeped.', img: null },
    { id: 'matcha', cat: 'tea', type: 'tea', name: 'Matcha Latte', price: 5.30, desc: 'Ceremonial-grade matcha whisked with steamed milk.', img: null, badge: 'New' },
    { id: 'berry', cat: 'tea', type: 'tea', name: 'Berry Refresher', price: 5.00, desc: 'Sparkling infusion of real berries and green tea.', img: null, temp: 'Iced' },
    { id: 'lemonmint', cat: 'tea', type: 'tea', name: 'Lemon Mint Cooler', price: 4.60, desc: 'Fresh lemon, crushed mint and a hint of honey.', img: null, temp: 'Iced' },
    // Dessert
    { id: 'chococake', cat: 'dessert', type: 'dessert', name: 'Chocolate Fudge Cake', price: 6.50, desc: 'Triple-layer cake with warm dark chocolate ganache.', img: IMG.cake, badge: 'Popular' },
    { id: 'croissant', cat: 'dessert', type: 'dessert', name: 'Butter Croissant', price: 3.60, desc: 'Flaky, golden and baked fresh every morning.', img: null },
    { id: 'tiramisu', cat: 'dessert', type: 'dessert', name: 'Tiramisu', price: 5.90, desc: 'Espresso-soaked layers with mascarpone cream.', img: null },
    { id: 'cheesecake', cat: 'dessert', type: 'dessert', name: 'Vanilla Cheesecake', price: 5.70, desc: 'Silky baked cheesecake on a buttery biscuit base.', img: null },
    { id: 'cinnamon', cat: 'dessert', type: 'dessert', name: 'Cinnamon Roll', price: 4.30, desc: 'Soft swirl of cinnamon sugar with cream glaze.', img: null }
  ];

  // customization option config by type
  const OPTIONS = {
    coffee: [
      { key: 'size', label: 'Size', type: 'single', required: true, choices: [
        { v: 'Small', d: -0.5 }, { v: 'Medium', d: 0, def: true }, { v: 'Large', d: 0.8 }
      ]},
      { key: 'temp', label: 'Temperature', type: 'single', choices: [
        { v: 'Hot', def: true }, { v: 'Iced' }
      ]},
      { key: 'milk', label: 'Milk', type: 'single', choices: [
        { v: 'Whole', def: true }, { v: 'Skim' }, { v: 'Oat', d: 0.5 }, { v: 'Almond', d: 0.5 }, { v: 'None' }
      ]},
      { key: 'sugar', label: 'Sugar', type: 'single', choices: [
        { v: 'None' }, { v: 'Low', def: true }, { v: 'Regular' }, { v: 'Extra' }
      ]},
      { key: 'syrup', label: 'Flavour Syrup', type: 'single', choices: [
        { v: 'None', def: true }, { v: 'Vanilla', d: 0.5 }, { v: 'Caramel', d: 0.5 }, { v: 'Hazelnut', d: 0.5 }
      ]},
      { key: 'extras', label: 'Extras', type: 'multi', choices: [
        { v: 'Extra Shot', d: 0.8 }, { v: 'Extra Cream', d: 0.4 }, { v: 'Decaf' }
      ]}
    ],
    tea: [
      { key: 'size', label: 'Size', type: 'single', required: true, choices: [
        { v: 'Small', d: -0.5 }, { v: 'Medium', d: 0, def: true }, { v: 'Large', d: 0.8 }
      ]},
      { key: 'temp', label: 'Temperature', type: 'single', choices: [
        { v: 'Hot', def: true }, { v: 'Iced' }
      ]},
      { key: 'sugar', label: 'Sweetness', type: 'single', choices: [
        { v: 'None' }, { v: 'Low', def: true }, { v: 'Regular' }, { v: 'Extra' }
      ]},
      { key: 'milk', label: 'Milk', type: 'single', choices: [
        { v: 'None', def: true }, { v: 'Whole' }, { v: 'Oat', d: 0.5 }
      ]}
    ],
    dessert: [
      { key: 'serve', label: 'Serving', type: 'single', choices: [
        { v: 'As is', def: true }, { v: 'Warmed up' }, { v: 'With cream', d: 0.6 }
      ]}
    ]
  };

  /* ----------------------------------------------------------
     CART state
  ---------------------------------------------------------- */
  let cart = store.get('maison-cart', []);
  let promo = store.get('maison-promo', null);
  let orderType = store.get('maison-ordertype', 'pickup');

  const DELIVERY_FEE = 2.50;
  const PROMOS = { MAISON10: 0.10, WELCOME: 0.15 };

  const saveCart = () => { store.set('maison-cart', cart); updateCartUI(); };
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
  const lineTotal = (i) => i.unit * i.qty;
  const subtotal = () => cart.reduce((s, i) => s + lineTotal(i), 0);
  const discountAmt = () => promo && PROMOS[promo] ? subtotal() * PROMOS[promo] : 0;
  const feeAmt = () => (orderType === 'delivery' && cart.length) ? DELIVERY_FEE : 0;
  const grandTotal = () => Math.max(0, subtotal() - discountAmt()) + feeAmt();

  function optsSummary(sel) {
    const parts = [];
    Object.keys(sel).forEach(k => {
      const v = sel[k];
      if (Array.isArray(v)) { if (v.length) parts.push(v.join(', ')); }
      else if (v && v !== 'None' && v !== 'As is' && v !== 'Medium') parts.push(v);
    });
    return parts.join(' · ');
  }

  /* ----------------------------------------------------------
     CUSTOMIZE MODAL
  ---------------------------------------------------------- */
  function computeUnit(item, sel) {
    let price = item.price;
    const cfg = OPTIONS[item.type] || [];
    cfg.forEach(group => {
      const val = sel[group.key];
      group.choices.forEach(c => {
        if (!c.d) return;
        if (group.type === 'multi') { if (Array.isArray(val) && val.includes(c.v)) price += c.d; }
        else if (val === c.v) price += c.d;
      });
    });
    return price;
  }

  function defaultSelection(item) {
    const sel = {};
    (OPTIONS[item.type] || []).forEach(g => {
      if (g.type === 'multi') sel[g.key] = [];
      else { const def = g.choices.find(c => c.def) || g.choices[0]; sel[g.key] = def.v; }
    });
    if (item.temp === 'Iced' && sel.temp) sel.temp = 'Iced';
    return sel;
  }

  function openCustomize(item, editIndex = null) {
    const root = $('#customizeRoot');
    const sel = editIndex !== null ? structuredClone(cart[editIndex].sel) : defaultSelection(item);
    let qty = editIndex !== null ? cart[editIndex].qty : 1;
    const cfg = OPTIONS[item.type] || [];

    const groupsHTML = cfg.map(g => `
      <div class="opt-group" data-group="${g.key}">
        <div class="lbl">${g.label}${g.type === 'multi' ? ' <small>optional · choose any</small>' : ''}</div>
        <div class="opt-row">
          ${g.choices.map(c => {
            const isSel = g.type === 'multi' ? sel[g.key].includes(c.v) : sel[g.key] === c.v;
            return `<button type="button" class="opt${isSel ? ' sel' : ''}" data-val="${c.v}">${c.v}${c.d ? `<span class="plus">+${money(Math.abs(c.d)).replace('$','$')}</span>` : ''}</button>`;
          }).join('')}
        </div>
      </div>`).join('');

    const thumb = item.img ? `<img src="${item.img}" alt="${item.name}">`
      : `<div class="ph" style="display:grid;place-items:center;color:var(--accent)">${coffeeIcon()}</div>`;

    root.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="Customize ${item.name}">
        <button class="modal-close" data-close aria-label="Close">${xIcon()}</button>
        <div class="modal-pad" style="padding-bottom:0">
          <div class="cust-head">
            ${thumb}
            <div>
              <h3>${item.name}</h3>
              <div class="price" id="custUnit">${money(item.price)}</div>
              <div class="loc-pill" style="margin-top:.3rem">${item.desc ? '' : ''}</div>
            </div>
          </div>
          ${groupsHTML || '<p class="m-sub">This item comes just the way our chef intended.</p>'}
          <div class="opt-group">
            <div class="lbl">Quantity</div>
            <div class="qty" id="custQty">
              <button type="button" data-q="-1" aria-label="Decrease">−</button>
              <span>${qty}</span>
              <button type="button" data-q="1" aria-label="Increase">+</button>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-primary btn-block" id="custAdd">
            ${editIndex !== null ? 'Update order' : 'Add to order'} · <span id="custTotal">${money(item.price * qty)}</span>
          </button>
        </div>
      </div>`;

    const unitEl = $('#custUnit'), totalEl = $('#custTotal'), qtyEl = $('#custQty span');
    const refresh = () => {
      const unit = computeUnit(item, sel);
      unitEl.textContent = money(unit);
      totalEl.textContent = money(unit * qty);
    };

    root.querySelectorAll('.opt-group[data-group]').forEach(gEl => {
      const key = gEl.dataset.group;
      const group = cfg.find(g => g.key === key);
      gEl.querySelectorAll('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.dataset.val;
          if (group.type === 'multi') {
            const arr = sel[key];
            const i = arr.indexOf(v);
            if (i > -1) arr.splice(i, 1); else arr.push(v);
            btn.classList.toggle('sel');
          } else {
            sel[key] = v;
            gEl.querySelectorAll('.opt').forEach(b => b.classList.toggle('sel', b === btn));
          }
          refresh();
        });
      });
    });
    $('#custQty').addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]'); if (!b) return;
      qty = Math.max(1, qty + parseInt(b.dataset.q, 10));
      qtyEl.textContent = qty; refresh();
    });
    $('#custAdd').addEventListener('click', () => {
      const unit = computeUnit(item, sel);
      const entry = { id: item.id, name: item.name, img: item.img, type: item.type, base: item.price, unit, qty, sel };
      if (editIndex !== null) cart[editIndex] = entry;
      else {
        // merge identical config
        const key = JSON.stringify([item.id, sel]);
        const found = cart.find(c => JSON.stringify([c.id, c.sel]) === key);
        if (found) found.qty += qty; else cart.push(entry);
      }
      saveCart();
      closeModal(root);
      bumpCart();
      toast(editIndex !== null ? 'Order updated' : `${item.name} added to order`);
    });

    openModal(root);
    refresh();
  }

  function quickAdd(item) {
    // items with no options → add directly, else open customizer
    const cfg = OPTIONS[item.type] || [];
    if (!cfg.length) {
      const sel = {};
      const entry = { id: item.id, name: item.name, img: item.img, type: item.type, base: item.price, unit: item.price, qty: 1, sel };
      const found = cart.find(c => c.id === item.id && JSON.stringify(c.sel) === '{}');
      if (found) found.qty += 1; else cart.push(entry);
      saveCart(); bumpCart(); toast(`${item.name} added to order`);
    } else {
      openCustomize(item);
    }
  }

  /* ----------------------------------------------------------
     MODAL open/close helpers
  ---------------------------------------------------------- */
  function openModal(root) {
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    root.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeModal(root)));
    document.addEventListener('keydown', escClose);
    function escClose(e) { if (e.key === 'Escape') { closeModal(root); document.removeEventListener('keydown', escClose); } }
  }
  function closeModal(root) {
    root.classList.remove('open');
    if (!$('.drawer-root.open') && !$('.modal-root.open')) document.body.style.overflow = '';
  }

  /* ----------------------------------------------------------
     CART DRAWER
  ---------------------------------------------------------- */
  function bumpCart() {
    $$('.cart-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  }
  function updateCartUI() {
    const c = cartCount();
    $$('.cart-count').forEach(el => { el.textContent = c; el.classList.toggle('show', c > 0); });
    const dr = $('#drawerRoot');
    if (dr && dr.classList.contains('open')) renderDrawer();
  }

  function cartLineHTML(i, idx) {
    const s = optsSummary(i.sel);
    const thumb = i.img ? `<img src="${i.img}" alt="${i.name}" loading="lazy">`
      : `<div class="ph" style="display:grid;place-items:center;color:var(--accent)">${coffeeIcon()}</div>`;
    return `<div class="cart-line" data-idx="${idx}">
      ${thumb}
      <div class="cl-main">
        <h4>${i.name}<span class="cl-price">${money(lineTotal(i))}</span></h4>
        ${s ? `<div class="opts">${s}</div>` : ''}
        <div class="cl-foot">
          <div class="qty">
            <button type="button" data-act="dec" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button type="button" data-act="inc" aria-label="Increase">+</button>
          </div>
          <div class="cl-tools">
            ${(OPTIONS[i.type]||[]).length ? '<button type="button" data-act="edit">Edit</button>' : ''}
            <button type="button" class="rm" data-act="remove">Remove</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderDrawer() {
    const root = $('#drawerRoot'); if (!root) return;
    const step = root.dataset.step || 'cart';
    // steps indicator
    $$('.dstep', root).forEach(d => {
      const s = d.dataset.step;
      d.classList.toggle('active', s === step);
      const order = ['cart', 'details', 'done'];
      d.classList.toggle('done', order.indexOf(s) < order.indexOf(step));
    });

    // CART panel
    const body = $('#cartItems');
    if (body) {
      if (!cart.length) {
        body.innerHTML = `<div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <p>Your order is empty.</p><p style="font-size:.85rem;margin-top:.3rem">Add something delicious from our menu.</p>
          <a href="menu.html" class="btn btn-ghost" style="margin-top:1.2rem" data-nav>Browse the menu</a>
        </div>`;
      } else {
        body.innerHTML = cart.map((i, idx) => cartLineHTML(i, idx)).join('') + summaryHTML();
      }
    }
    // mini totals in foot
    $$('.mini-total .mt-val').forEach(el => el.textContent = money(grandTotal()));
    const foot = $('#drawerFoot');
    if (foot) foot.classList.toggle('hide', !cart.length || step === 'done');

    // details totals
    const dsum = $('#detailsSummary');
    if (dsum) dsum.innerHTML = summaryHTML(true);
  }

  function summaryHTML(withType) {
    const d = discountAmt(), f = feeAmt();
    return `<div class="summary">
      ${withType ? orderTypeHTML() : ''}
      <div class="row"><span>Subtotal</span><span>${money(subtotal())}</span></div>
      ${d > 0 ? `<div class="row discount"><span>Discount (${promo})</span><span>−${money(d)}</span></div>` : ''}
      ${orderType === 'delivery' ? `<div class="row"><span>Delivery fee</span><span>${money(f)}</span></div>` : ''}
      <div class="promo">
        <input type="text" id="promoInput" placeholder="Promo code (try MAISON10)" value="${promo || ''}" autocomplete="off">
        <button class="btn btn-ghost" id="promoBtn" type="button">Apply</button>
      </div>
      <div class="row total"><span>Total</span><span>${money(grandTotal())}</span></div>
    </div>`;
  }
  function orderTypeHTML() {
    return `<div class="opt-row" data-otype-group style="margin-bottom:1rem">
      <button type="button" class="opt${orderType==='pickup'?' sel':''}" data-otype="pickup">🏠 Pickup / Dine-in</button>
      <button type="button" class="opt${orderType==='delivery'?' sel':''}" data-otype="delivery">🛵 Delivery (+${money(DELIVERY_FEE)})</button>
    </div>`;
  }

  function gotoStep(step) {
    const root = $('#drawerRoot');
    root.dataset.step = step;
    $$('.drawer-panel', root).forEach(p => p.classList.toggle('active', p.dataset.panel === step));
    renderDrawer();
    $('.drawer-body', root).scrollTop = 0;
  }

  function openDrawer() {
    const root = $('#drawerRoot');
    root.dataset.step = 'cart';
    $$('.drawer-panel', root).forEach(p => p.classList.toggle('active', p.dataset.panel === 'cart'));
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderDrawer();
  }
  function closeDrawer() {
    $('#drawerRoot').classList.remove('open');
    if (!$('.modal-root.open')) document.body.style.overflow = '';
  }

  function initDrawerEvents() {
    const root = $('#drawerRoot'); if (!root) return;
    // Enter inside the promo field applies the code instead of submitting the checkout form
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'promoInput') { e.preventDefault(); $('#promoBtn')?.click(); }
    });
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-drawer]')) return closeDrawer();
      const line = e.target.closest('.cart-line');
      if (line) {
        const idx = +line.dataset.idx;
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'inc') { cart[idx].qty++; saveCart(); }
        else if (act === 'dec') { cart[idx].qty--; if (cart[idx].qty < 1) cart.splice(idx, 1); saveCart(); }
        else if (act === 'remove') { const n = cart[idx].name; cart.splice(idx, 1); saveCart(); toast(`${n} removed`); }
        else if (act === 'edit') { const it = MENU.find(m => m.id === cart[idx].id); if (it) openCustomize(it, idx); }
        return;
      }
      const promoBtn = e.target.closest('#promoBtn');
      if (promoBtn) {
        const code = ($('#promoInput').value || '').trim().toUpperCase();
        if (!code) { promo = null; store.set('maison-promo', null); renderDrawer(); return; }
        if (PROMOS[code]) { promo = code; store.set('maison-promo', code); toast(`Promo ${code} applied`); }
        else { toast('Invalid promo code'); }
        renderDrawer(); return;
      }
      const otype = e.target.closest('[data-otype]');
      if (otype) { orderType = otype.dataset.otype; store.set('maison-ordertype', orderType); renderDrawer(); return; }
      const goDetails = e.target.closest('#toDetails');
      if (goDetails) { if (!cart.length) return; gotoStep('details'); return; }
      const backCart = e.target.closest('#backToCart');
      if (backCart) { gotoStep('cart'); return; }
    });

    // payment method select + place order
    root.addEventListener('click', (e) => {
      const pm = e.target.closest('.pay-opt');
      if (pm) { $$('.pay-opt', root).forEach(p => p.classList.remove('sel')); pm.classList.add('sel');
        const addr = $('#cardFields'); if (addr) addr.classList.toggle('hide', pm.dataset.method !== 'card'); }
    });

    const form = $('#checkoutForm');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const method = $('.pay-opt.sel', root)?.dataset.method || 'cod';
      const code = 'MSN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const total = grandTotal();
      // build confirmation
      const done = $('[data-panel="done"]', root);
      done.innerHTML = `<div class="confirm-ok">
        <div class="circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h3>Order confirmed</h3>
        <p>Thank you! Your order has been received and is being prepared with care.</p>
        <div class="order-code">${code}</div>
        <div class="summary" style="text-align:left;max-width:280px;margin:1.4rem auto 0">
          <div class="row"><span>Payment</span><span>${payLabel(method)}</span></div>
          <div class="row"><span>Fulfilment</span><span>${orderType === 'delivery' ? 'Delivery' : 'Pickup'}</span></div>
          <div class="row total"><span>Paid total</span><span>${money(total)}</span></div>
        </div>
        <p style="font-size:.78rem;color:var(--ink-faint);margin-top:1.2rem">Demo checkout — no real payment was processed.</p>
        <button class="btn btn-primary btn-block mt-2" data-close-drawer>Done</button>
      </div>`;
      cart = []; promo = null; store.set('maison-cart', cart); store.set('maison-promo', null);
      updateCartUI();
      gotoStep('done');
    });
  }
  function payLabel(m) { return m === 'card' ? 'Card' : m === 'bank' ? 'Bank Transfer' : 'Cash / Pay at Café'; }

  /* ----------------------------------------------------------
     Build shared UI (drawer, modals, location, auth) into DOM
  ---------------------------------------------------------- */
  function buildSharedUI() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <!-- Customize modal -->
      <div class="modal-root" id="customizeRoot"></div>

      <!-- Cart drawer -->
      <div class="drawer-root" id="drawerRoot" data-step="cart">
        <div class="drawer-backdrop" data-close-drawer></div>
        <aside class="drawer" role="dialog" aria-label="Your order">
          <div class="drawer-head">
            <h3>Your Order</h3>
            <button class="icon-btn" data-close-drawer aria-label="Close">${xIcon()}</button>
          </div>
          <div class="drawer-steps">
            <div class="dstep active" data-step="cart"><span class="n">1</span> Review</div>
            <div class="dstep" data-step="details"><span class="n">2</span> Details</div>
            <div class="dstep" data-step="done"><span class="n">3</span> Done</div>
          </div>
          <div class="drawer-body">
            <div class="drawer-panel active" data-panel="cart">
              <div id="cartItems"></div>
            </div>
            <div class="drawer-panel" data-panel="details">
              <button type="button" id="backToCart" class="loc-pill" style="margin-bottom:1rem;background:none;border:none">${backIcon()} Back to order</button>
              <form id="checkoutForm">
                <div id="detailsSummary"></div>
                <h4 style="font-family:var(--font-display);font-size:1.15rem;margin:1.4rem 0 .8rem">Your details</h4>
                <div class="field"><label>Full name</label><input required type="text" placeholder="Jordan Rivera" autocomplete="name"></div>
                <div class="field-row">
                  <div class="field"><label>Email</label><input required type="email" placeholder="you@email.com" autocomplete="email"></div>
                  <div class="field"><label>Phone</label><input required type="tel" placeholder="+1 555 000 0000" autocomplete="tel"></div>
                </div>
                <div class="field" id="addrField"><label>Delivery address</label><input type="text" placeholder="Street, apt, city" autocomplete="street-address"></div>
                <div class="field"><label>Order notes <small style="color:var(--ink-faint)">(optional)</small></label><textarea placeholder="Allergies, preferences, or a note to our baristas…"></textarea></div>

                <h4 style="font-family:var(--font-display);font-size:1.15rem;margin:1.4rem 0 .8rem">Payment method</h4>
                <div class="pay-methods">
                  <label class="pay-opt sel" data-method="cod"><span class="dot"></span><span class="p-ic">${cashIcon()}</span><span class="p-txt"><strong>Cash on Delivery / Pay at Café</strong><small>Pay when you collect or receive your order</small></span></label>
                  <label class="pay-opt" data-method="card"><span class="dot"></span><span class="p-ic">${cardIcon()}</span><span class="p-txt"><strong>Card / Online Payment</strong><small>Visa, Mastercard, Apple Pay</small></span></label>
                  <label class="pay-opt" data-method="bank"><span class="dot"></span><span class="p-ic">${bankIcon()}</span><span class="p-txt"><strong>Bank Transfer</strong><small>Pay via direct bank transfer</small></span></label>
                </div>
                <div id="cardFields" class="hide">
                  <div class="field"><label>Card number</label><input type="text" inputmode="numeric" placeholder="•••• •••• •••• ••••"></div>
                  <div class="field-row">
                    <div class="field"><label>Expiry</label><input type="text" placeholder="MM / YY"></div>
                    <div class="field"><label>CVC</label><input type="text" inputmode="numeric" placeholder="•••"></div>
                  </div>
                  <div class="note">${infoIcon()}<span>Demo payment UI only. No card data is stored or processed. Connect a provider (Stripe, etc.) to enable real payments.</span></div>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg mt-2">Place order · <span class="mt-val">$0.00</span></button>
                <div class="note" style="margin-top:.8rem">${infoIcon()}<span>This is a demo storefront. Orders are simulated locally — no real transaction occurs.</span></div>
              </form>
            </div>
            <div class="drawer-panel" data-panel="done"></div>
          </div>
          <div class="drawer-foot" id="drawerFoot">
            <div class="mini-total"><span>Total</span><span class="mt-val">$0.00</span></div>
            <button class="btn btn-primary btn-block btn-lg" id="toDetails">Checkout</button>
          </div>
        </aside>
      </div>

      <!-- Auth modal -->
      <div class="modal-root" id="authRoot">
        <div class="modal-backdrop" data-close></div>
        <div class="modal" role="dialog" aria-label="Account">
          <button class="modal-close" data-close aria-label="Close">${xIcon()}</button>
          <div class="modal-pad">
            <div class="auth-tabs">
              <button class="active" data-tab="signin">Sign In</button>
              <button data-tab="signup">Sign Up</button>
            </div>
            <div class="auth-panel active" data-auth="signin">
              <h3 class="m-title">Welcome back</h3>
              <p class="m-sub">Sign in to track orders and save favourites.</p>
              <form data-authform="signin">
                <div class="field"><label>Email</label><input required type="email" placeholder="you@email.com"></div>
                <div class="field"><label>Password</label><input required type="password" placeholder="••••••••"></div>
                <button class="btn btn-primary btn-block btn-lg" type="submit">Sign In</button>
              </form>
              <div class="auth-divider">or continue with</div>
              <div class="auth-social">
                <button type="button">${googleIcon()} Google</button>
                <button type="button">${appleIcon()} Apple</button>
              </div>
            </div>
            <div class="auth-panel" data-auth="signup">
              <h3 class="m-title">Create account</h3>
              <p class="m-sub">Join Maison for rewards and faster checkout.</p>
              <form data-authform="signup">
                <div class="field"><label>Full name</label><input required type="text" placeholder="Jordan Rivera"></div>
                <div class="field"><label>Email</label><input required type="email" placeholder="you@email.com"></div>
                <div class="field"><label>Password</label><input required type="password" placeholder="Create a password"></div>
                <button class="btn btn-primary btn-block btn-lg" type="submit">Create Account</button>
              </form>
              <div class="note mt-1">${infoIcon()}<span>Demo only — accounts are stored locally in your browser, not on a server.</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location modal -->
      <div class="modal-root loc-modal" id="locRoot">
        <div class="modal-backdrop" data-close></div>
        <div class="modal" role="dialog" aria-label="Choose location">
          <div class="modal-pad">
            <div class="loc-icon">${pinIcon()}</div>
            <h3 class="m-title">Find your Maison</h3>
            <p class="m-sub">Select your location to see the nearest café and delivery options.</p>
            <div class="field"><label>Country</label>
              <select id="locCountry"><option value="">Select country</option></select>
            </div>
            <div class="field"><label>City / Location</label>
              <select id="locCity" disabled><option value="">Select city</option></select>
            </div>
            <button class="btn btn-primary btn-block btn-lg" id="locContinue" disabled>Continue</button>
            <br><a class="loc-skip" data-close>Skip for now</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  /* ----------------------------------------------------------
     AUTH modal logic
  ---------------------------------------------------------- */
  function initAuth() {
    const root = $('#authRoot'); if (!root) return;
    const openAuth = (tab) => {
      switchTab(tab || 'signin');
      openModal(root);
    };
    function switchTab(tab) {
      $$('.auth-tabs button', root).forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      $$('.auth-panel', root).forEach(p => p.classList.toggle('active', p.dataset.auth === tab));
    }
    $$('.auth-tabs button', root).forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    root.querySelectorAll('[data-authform]').forEach(f => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = f.dataset.authform;
      const email = f.querySelector('input[type=email]').value;
      store.set('maison-user', { email, ts: Date.now() });
      closeModal(root);
      updateAuthUI();
      toast(mode === 'signup' ? 'Account created — welcome!' : 'Signed in successfully');
    }));
    $$('.auth-social button', root).forEach(b => b.addEventListener('click', () => {
      store.set('maison-user', { email: 'guest@maison.cafe', social: true, ts: Date.now() });
      closeModal(root); updateAuthUI(); toast('Signed in successfully');
    }));
    // expose
    window.__openAuth = openAuth;
    $$('[data-open-auth]').forEach(b => b.addEventListener('click', () => {
      const u = store.get('maison-user', null);
      if (u) { // sign out
        if (confirm('Sign out of your Maison account?')) { store.set('maison-user', null); updateAuthUI(); toast('Signed out'); }
      } else openAuth(b.dataset.openAuth);
    }));
  }
  function updateAuthUI() {
    const u = store.get('maison-user', null);
    $$('[data-open-auth] .auth-label').forEach(el => el.textContent = u ? 'Account' : 'Sign In');
    $$('[data-open-auth]').forEach(b => b.classList.toggle('is-auth', !!u));
  }

  /* ----------------------------------------------------------
     LOCATION modal logic
  ---------------------------------------------------------- */
  const LOCATIONS = {
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Seattle', 'San Francisco'],
    'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Bristol'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane'],
    'Pakistan': ['Karachi', 'Lahore', 'Islamabad'],
    'France': ['Paris', 'Lyon', 'Nice'],
    'Singapore': ['Singapore']
  };
  function initLocation() {
    const root = $('#locRoot'); if (!root) return;
    const cSel = $('#locCountry'), citySel = $('#locCity'), cont = $('#locContinue');
    Object.keys(LOCATIONS).forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; cSel.appendChild(o); });
    cSel.addEventListener('change', () => {
      citySel.innerHTML = '<option value="">Select city</option>';
      const cities = LOCATIONS[cSel.value] || [];
      cities.forEach(ci => { const o = document.createElement('option'); o.value = ci; o.textContent = ci; citySel.appendChild(o); });
      citySel.disabled = !cities.length;
      cont.disabled = true;
    });
    citySel.addEventListener('change', () => { cont.disabled = !citySel.value; });
    cont.addEventListener('click', () => {
      const loc = { country: cSel.value, city: citySel.value };
      store.set('maison-location', loc);
      closeModal(root);
      renderLocPill();
      toast(`Location set to ${loc.city}`);
    });
    root.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => { store.set('maison-loc-dismissed', true); }));

    // first-visit open
    const saved = store.get('maison-location', null);
    const dismissed = store.get('maison-loc-dismissed', false);
    if (!saved && !dismissed) setTimeout(() => openModal(root), 650);
    renderLocPill();

    // reopen from pill
    $$('[data-open-loc]').forEach(b => b.addEventListener('click', () => {
      const s = store.get('maison-location', null);
      if (s) { cSel.value = s.country; cSel.dispatchEvent(new Event('change')); citySel.value = s.city; cont.disabled = false; }
      openModal(root);
    }));
  }
  function renderLocPill() {
    const s = store.get('maison-location', null);
    $$('[data-loc-text]').forEach(el => el.textContent = s ? `${s.city}` : 'Set location');
    $$('[data-open-loc]').forEach(b => b.classList.toggle('has-loc', !!s));
  }

  /* ----------------------------------------------------------
     MENU page rendering
  ---------------------------------------------------------- */
  function initMenuPage() {
    const wrap = $('#menuSections'); if (!wrap) return;
    // build sections
    wrap.innerHTML = CATS.map(cat => {
      const items = MENU.filter(m => m.cat === cat.id);
      return `<section class="menu-cat section" id="cat-${cat.id}" style="padding-block:clamp(36px,5vw,60px)">
        <h2 class="reveal">${cat.name} <span>${cat.note}</span></h2>
        <div class="menu-grid">
          ${items.map((it, i) => menuCardHTML(it, i)).join('')}
        </div>
      </section>`;
    }).join('');

    // filter chips
    const bar = $('#filterScroll');
    if (bar) {
      bar.innerHTML = `<button class="filter-chip active" data-filter="all">All</button>` +
        CATS.map(c => `<button class="filter-chip" data-filter="${c.id}">${c.name}</button>`).join('');
      bar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip'); if (!chip) return;
        $$('.filter-chip', bar).forEach(c => c.classList.toggle('active', c === chip));
        const f = chip.dataset.filter;
        if (f === 'all') { $$('.menu-cat').forEach(s => s.classList.remove('hide')); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else {
          const target = $('#cat-' + f);
          $$('.menu-cat').forEach(s => s.classList.remove('hide'));
          const y = target.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    }

    // card actions
    wrap.addEventListener('click', (e) => {
      const card = e.target.closest('.item-card'); if (!card) return;
      const item = MENU.find(m => m.id === card.dataset.id); if (!item) return;
      if (e.target.closest('[data-add]')) quickAdd(item);
      else if (e.target.closest('[data-customize]')) openCustomize(item);
    });

    initReveal();
  }
  function menuCardHTML(it, i) {
    const delay = (i % 4) + 1;
    const thumb = it.img
      ? `<div class="item-thumb"><img src="${it.img}" alt="${it.name}" loading="lazy" decoding="async">${it.badge ? `<span class="badge">${it.badge}</span>` : ''}</div>`
      : `<div class="item-thumb no-img">${coffeeIcon()}${it.badge ? `<span class="badge">${it.badge}</span>` : ''}</div>`;
    const hasOpts = (OPTIONS[it.type] || []).length;
    return `<article class="item-card reveal" data-id="${it.id}" data-delay="${delay}">
      ${thumb}
      <div class="item-body">
        <h3>${it.name}<span class="price">${money(it.price)}</span></h3>
        <p class="desc">${it.desc}</p>
        <div class="item-actions">
          <button class="btn btn-primary" data-add>Add to order</button>
          ${hasOpts ? `<button class="customize-link" data-customize title="Customize" aria-label="Customize ${it.name}">${slidersIcon()}</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  // home featured items
  function initFeaturedRail() {
    const rail = $('#featuredRail'); if (!rail) return;
    const ids = ['latte', 'cappuccino', 'icedcoffee', 'chococake'];
    rail.innerHTML = ids.map((id, i) => {
      const it = MENU.find(m => m.id === id);
      return menuCardHTML(it, i);
    }).join('');
    rail.addEventListener('click', (e) => {
      const card = e.target.closest('.item-card'); if (!card) return;
      const item = MENU.find(m => m.id === card.dataset.id); if (!item) return;
      if (e.target.closest('[data-add]')) quickAdd(item);
      else if (e.target.closest('[data-customize]')) openCustomize(item);
    });
  }

  /* ----------------------------------------------------------
     Global cart open buttons + page nav transition
  ---------------------------------------------------------- */
  function initGlobalButtons() {
    $$('.cart-btn, [data-open-cart]').forEach(b => b.addEventListener('click', openDrawer));
  }
  function initPageTransition() {
    const veil = document.createElement('div'); veil.className = 'page-veil'; document.body.appendChild(veil);
    const internal = /\.html$|^index/;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a) return;
      const href = a.getAttribute('href') || '';
      if (a.target === '_blank' || href.startsWith('#') || href.startsWith('http') || a.hasAttribute('data-nav-skip')) return;
      if (internal.test(href) && !a.closest('.mobile-nav')) {
        // let same-page anchors pass; veil for page changes
        if (href !== location.pathname.split('/').pop()) {
          e.preventDefault();
          veil.classList.add('show');
          setTimeout(() => { location.href = href; }, 260);
        }
      }
    });
    window.addEventListener('pageshow', () => veil.classList.remove('show'));
  }

  /* ----------------------------------------------------------
     Video: ensure autoplay/loop resilience on mobile
  ---------------------------------------------------------- */
  function initVideos() {
    $$('video').forEach(v => {
      v.muted = true; v.setAttribute('muted', '');
      v.playsInline = true;
      const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
      if (v.readyState >= 2) tryPlay(); else v.addEventListener('loadeddata', tryPlay, { once: true });
      // guard against freeze at end
      v.addEventListener('ended', () => { v.currentTime = 0; tryPlay(); });
      // pause offscreen to save power
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((ents) => ents.forEach(en => en.isIntersecting ? tryPlay() : v.pause()), { threshold: 0.05 })
          .observe(v);
      }
      // resume when tab visible / after interaction
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
    });
    window.addEventListener('touchstart', function once() { $$('video').forEach(v => { if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(()=>{}); } }); window.removeEventListener('touchstart', once); }, { once: true, passive: true });
  }

  /* ----------------------------------------------------------
     Generic form demo handler (contact / newsletter)
  ---------------------------------------------------------- */
  function initDemoForms() {
    $$('[data-demo-form]').forEach(f => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = f.dataset.demoForm || 'Message sent — we’ll be in touch soon.';
      f.reset(); toast(msg);
    }));
  }

  /* ----------------------------------------------------------
     Delivery address show/hide in checkout based on orderType
  ---------------------------------------------------------- */
  function watchOrderType() {
    const obs = new MutationObserver(() => {
      const addr = $('#addrField');
      if (addr) addr.style.display = orderType === 'delivery' ? '' : 'none';
    });
    const root = $('#drawerRoot');
    if (root) obs.observe(root, { subtree: true, attributes: true, attributeFilter: ['class', 'data-step'] });
  }

  /* ----------------------------------------------------------
     SVG icons
  ---------------------------------------------------------- */
  function xIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`; }
  function backIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`; }
  function coffeeIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`; }
  function slidersIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`; }
  function pinIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>`; }
  function cashIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>`; }
  function cardIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`; }
  function bankIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>`; }
  function infoIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`; }
  function googleIcon() { return `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.9Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.4 9.1 5.4 12 5.4Z"/></svg>`; }
  function appleIcon() { return `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1 2.8-2.1c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9ZM14.2 5.9c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.8-1.2Z"/></svg>`; }

  /* ----------------------------------------------------------
     Footer year
  ---------------------------------------------------------- */
  function initYear() { $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear()); }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    buildSharedUI();
    initTheme();
    initHeader();
    initAuth();
    initLocation();
    updateAuthUI();
    initDrawerEvents();
    watchOrderType();
    initGlobalButtons();
    initMenuPage();
    initFeaturedRail();
    initVideos();
    initDemoForms();
    initReveal();
    initYear();
    initPageTransition();
    updateCartUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
