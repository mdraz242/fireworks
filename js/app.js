/*
  GURPREET FIREWORKS — Minimal Premium JS
  Clean interactions, subtle canvas, essential commerce logic.
*/

document.addEventListener('DOMContentLoaded', () => {

  /* ------ Header scroll ------- */
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ------ Mobile Nav ------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
    // close on nav link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        const icon = toggle.querySelector('i');
        icon.className = 'fas fa-bars';
      });
    });
  }

  /* ------ Subtle Ambient Canvas Fireworks ------- */
  const canvas = document.getElementById('fireworksCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const maxParticles = 60;
    const colors = [
      'rgba(201,168,76,', // gold
      'rgba(255,180,80,', // warm
      'rgba(220,160,60,', // amber
      'rgba(255,220,130,', // soft gold
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.018 + 0.006;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = color;
        this.gravity = 0.02;
      }
      update() {
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    function spawnBurst(x, y) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = 20 + Math.floor(Math.random() * 15);
      for (let i = 0; i < count; i++) {
        if (particles.length < 500) {
          particles.push(new Particle(x, y, color));
        }
      }
    }

    function autoLaunch() {
      if (document.hidden) return;
      const x = Math.random() * W * 0.6 + W * 0.2;
      const y = Math.random() * H * 0.4 + H * 0.1;
      spawnBurst(x, y);
    }

    setInterval(autoLaunch, 4000);
    setTimeout(autoLaunch, 500);
    setTimeout(() => autoLaunch(), 2000);

    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].alpha <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ------ Product Filters ------- */
  const filterBtns = document.querySelectorAll('.product-filters button');
  const productCards = document.querySelectorAll('.p-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;

      productCards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ------ Cart Logic ------- */
  let cart = JSON.parse(localStorage.getItem('nf_cart') || '[]');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCount = document.querySelectorAll('.cart-count');
  const cartBody = document.querySelector('#cartDrawer .drawer-body');
  const cartTotal = document.querySelector('#cartDrawer .drawer-total span:last-child');

  function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.forEach(el => el.textContent = total);
  }

  function saveCart() {
    localStorage.setItem('nf_cart', JSON.stringify(cart));
    updateCartCount();
  }

  function renderCart() {
    if (!cartBody) return;
    if (cart.length === 0) {
      cartBody.innerHTML = '<div class="empty-drawer"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>';
      if (cartTotal) cartTotal.textContent = '£0.00';
      return;
    }

    cartBody.innerHTML = cart.map((item, i) => `
      <div class="d-item">
        <div class="d-item-thumb"><img src="${item.img || ''}" alt="${item.name}"></div>
        <div class="d-item-info">
          <h4>${item.name}</h4>
          <span>£${item.price.toFixed(2)}</span>
          <div class="d-item-qty">
            <button onclick="window._cartQty(${i},-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="window._cartQty(${i},1)">+</button>
          </div>
        </div>
        <span class="d-item-remove" onclick="window._cartRemove(${i})"><i class="fas fa-trash-alt"></i></span>
      </div>
    `).join('');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartTotal) cartTotal.textContent = '£' + total.toFixed(2);
  }

  window._cartQty = (idx, delta) => {
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart();
    renderCart();
  };

  window._cartRemove = (idx) => {
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  };

  window.addToCart = (name, price, img) => {
    const exists = cart.find(i => i.name === name);
    if (exists) { exists.qty++; }
    else { cart.push({ name, price, img, qty: 1 }); }
    saveCart();
    renderCart();
    showToast(`${name} added to cart`);
  };

  updateCartCount();
  renderCart();

  /* ------ Wishlist ------- */
  let wishlist = JSON.parse(localStorage.getItem('nf_wish') || '[]');
  const wishDrawer = document.getElementById('wishDrawer');
  const wishCount = document.querySelectorAll('.wish-count');
  const wishBody = document.querySelector('#wishDrawer .drawer-body');

  function updateWishCount() {
    wishCount.forEach(el => el.textContent = wishlist.length);
  }

  function saveWish() {
    localStorage.setItem('nf_wish', JSON.stringify(wishlist));
    updateWishCount();
    renderWish();
    syncWishBtns();
  }

  function renderWish() {
    if (!wishBody) return;
    if (wishlist.length === 0) {
      wishBody.innerHTML = '<div class="empty-drawer"><i class="fas fa-heart"></i><p>Your wishlist is empty</p></div>';
      return;
    }
    wishBody.innerHTML = wishlist.map((item, i) => `
      <div class="d-item">
        <div class="d-item-thumb"><img src="${item.img || ''}" alt="${item.name}"></div>
        <div class="d-item-info">
          <h4>${item.name}</h4>
          <span>£${item.price.toFixed(2)}</span>
        </div>
        <span class="d-item-remove" onclick="window._wishRemove(${i})"><i class="fas fa-trash-alt"></i></span>
      </div>
    `).join('');
  }

  window._wishRemove = (idx) => {
    wishlist.splice(idx, 1);
    saveWish();
  };

  function syncWishBtns() {
    document.querySelectorAll('.wish-btn').forEach(btn => {
      const name = btn.dataset.name;
      btn.classList.toggle('active', wishlist.some(w => w.name === name));
    });
  }

  window.toggleWish = (name, price, img) => {
    const idx = wishlist.findIndex(w => w.name === name);
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      showToast(`Removed from wishlist`);
    } else {
      wishlist.push({ name, price, img });
      showToast(`${name} added to wishlist`);
    }
    saveWish();
  };

  updateWishCount();
  renderWish();
  syncWishBtns();

  /* ------ Drawers ------- */
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const drawer = document.getElementById(btn.dataset.open);
      if (drawer) drawer.classList.add('open');
    });
  });

  document.querySelectorAll('.drawer-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.drawer').classList.remove('open');
    });
  });

  /* ------ Accordion ------- */
  document.querySelectorAll('.accord-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const isOpen = item.classList.contains('open');
      // close all others
      item.parentElement.querySelectorAll('.accord-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ------ Bonfire Countdown ------- */
  function bonfireCountdown() {
    const now = new Date();
    let bonfire = new Date(now.getFullYear(), 10, 5); // approx Nov 5
    if (bonfire < now) bonfire.setFullYear(bonfire.getFullYear() + 1);

    function tick() {
      const diff = bonfire - new Date();
      if (diff < 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2, '0'); };
      set('cd-d', d);
      set('cd-h', h);
      set('cd-m', m);
      set('cd-s', s);
    }
    tick();
    setInterval(tick, 1000);
  }
  bonfireCountdown();

  /* ------ Modals ------- */
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.modal);
      if (modal) modal.classList.add('show');
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-bg').classList.remove('show');
    });
  });

  document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', (e) => {
      if (e.target === bg) bg.classList.remove('show');
    });
  });

  /* ------ Quick View ------- */
  window.quickView = (name, price, img, cat, desc) => {
    const qv = document.getElementById('quickViewModal');
    if (!qv) return;
    qv.querySelector('.qv-image img').src = img || '';
    qv.querySelector('.qv-name').textContent = name;
    qv.querySelector('.qv-price').textContent = '£' + Number(price).toFixed(2);
    qv.querySelector('.qv-cat').textContent = cat || '';
    qv.querySelector('.qv-desc').textContent = desc || 'Premium quality firework from Gurpreet Fireworks. Ideal for celebrations and events.';
    qv.querySelector('.qv-add').setAttribute('onclick', `addToCart('${name.replace(/'/g,"\\'")}',${price},'${img}')`);
    qv.classList.add('show');
  };

  /* ------ Toast ------- */
  const toastWrap = document.querySelector('.toast-wrap');

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    toastWrap.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
  window.showToast = showToast;

  /* ------ Smooth scroll anchors ------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ------ Contact form ------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! We will contact you shortly.');
      contactForm.reset();
    });
  }

  /* ------ B2B form ------- */
  const b2bForm = document.getElementById('b2bForm');
  if (b2bForm) {
    b2bForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('B2B inquiry submitted! Our team will reach out.');
      b2bForm.reset();
      document.getElementById('b2bModal').classList.remove('show');
    });
  }

  /* ------ Scroll reveal ------- */
  const revealEls = document.querySelectorAll('.section, .cat-item, .p-card, .f-item, .t-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1)';
    observer.observe(el);
  });

  /* ------ Booking form ------- */
  const bookForm = document.getElementById('bookingForm');
  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Booking request submitted!');
      bookForm.reset();
      document.getElementById('bookingModal').classList.remove('show');
    });
  }

  /* ------ STORES CONSTANT & MULTI-PAGE INITIALIZATION ROUTING ------ */
  const STORES = {
    london: {
      name: "London Outlet",
      address: "123 Fireworks Lane, Covent Garden, London WC2E 8RF, United Kingdom",
      phone: "+44 20 7946 0958",
      timings: "10:00 AM – 9:00 PM"
    },
    manchester: {
      name: "Manchester Outlet",
      address: "45 Sparkler Way, Northern Quarter, Manchester M1 1DB, United Kingdom",
      phone: "+44 161 496 0294",
      timings: "10:00 AM – 9:00 PM"
    },
    edinburgh: {
      name: "Edinburgh Outlet",
      address: "78 Royal Mile, Old Town, Edinburgh EH1 1TB, United Kingdom",
      phone: "+44 131 496 0891",
      timings: "10:00 AM – 8:30 PM"
    },
    birmingham: {
      name: "Birmingham Outlet",
      address: "89 Jewellery Quarter, Birmingham B18 6HN, United Kingdom",
      phone: "+44 121 496 0124",
      timings: "10:00 AM – 9:00 PM"
    }
  };

  const pathname = window.location.pathname;
  if (pathname.includes('product.html')) {
    initProductPage();
  } else if (pathname.includes('cart.html')) {
    initCartPage();
  } else if (pathname.includes('checkout.html')) {
    initCheckoutPage();
  }

  function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('id');
    if (!prodId || !window.NF_PRODUCTS || !window.NF_PRODUCTS[prodId]) {
      window.location.href = 'index.html';
      return;
    }

    const product = window.NF_PRODUCTS[prodId];
    
    // Breadcrumbs
    const bcCat = document.getElementById('bc-cat');
    if (bcCat) {
      bcCat.textContent = product.category;
      bcCat.href = "index.html#products";
    }
    const bcName = document.getElementById('bc-name');
    if (bcName) bcName.textContent = product.name;

    // Gallery and details
    const pdImage = document.getElementById('pd-image');
    if (pdImage) {
      pdImage.src = product.image;
      pdImage.alt = product.name;
    }
    const pdCat = document.getElementById('pd-cat');
    if (pdCat) pdCat.textContent = product.category;
    const pdTitle = document.getElementById('pd-title');
    if (pdTitle) pdTitle.textContent = product.name;
    const pdDesc = document.getElementById('pd-desc');
    if (pdDesc) pdDesc.textContent = product.description;
    const pdDetailsText = document.getElementById('pd-details-text');
    if (pdDetailsText) pdDetailsText.textContent = product.details;

    // Badge
    const pdBadge = document.getElementById('pd-badge');
    if (pdBadge) {
      if (product.badge) {
        pdBadge.textContent = product.badge;
        pdBadge.style.display = 'inline-block';
        pdBadge.className = 'badge ' + (product.badge.includes('Sale') ? 'badge-sale' : (product.badge.includes('Eco') ? 'badge-eco' : 'badge-gold'));
      } else {
        pdBadge.style.display = 'none';
      }
    }

    // Price
    const pdPrice = document.getElementById('pd-price');
    if (pdPrice) pdPrice.textContent = '£' + product.price.toFixed(2);
    const pdPriceDel = document.getElementById('pd-price-del');
    if (pdPriceDel) {
      if (product.originalPrice && product.originalPrice > product.price) {
        pdPriceDel.textContent = '£' + product.originalPrice.toFixed(2);
        pdPriceDel.style.display = 'inline-block';
      } else {
        pdPriceDel.style.display = 'none';
      }
    }

    // Stars
    const pdStars = document.getElementById('pd-stars');
    if (pdStars) {
      let starsHtml = '';
      const floor = Math.floor(product.rating);
      for (let i = 0; i < floor; i++) starsHtml += '<i class="fas fa-star" style="color:var(--gold); margin-right:2px;"></i>';
      if (product.rating % 1 !== 0) starsHtml += '<i class="fas fa-star-half-alt" style="color:var(--gold); margin-right:2px;"></i>';
      for (let i = Math.ceil(product.rating); i < 5; i++) starsHtml += '<i class="far fa-star" style="color:var(--gold); margin-right:2px;"></i>';
      pdStars.innerHTML = starsHtml;
    }
    const pdReviews = document.getElementById('pd-reviews');
    if (pdReviews) pdReviews.textContent = `(${product.reviewsCount} customer reviews)`;

    // Specs
    const pdSpecsTable = document.getElementById('pd-specs-table');
    if (pdSpecsTable) {
      pdSpecsTable.innerHTML = Object.entries(product.specs).map(([k, v]) => `
        <tr>
          <td>${k}</td>
          <td>${v}</td>
        </tr>
      `).join('');
    }

    // Safety Guide
    const pdSafetyList = document.getElementById('pd-safety-list');
    if (pdSafetyList) {
      pdSafetyList.innerHTML = product.safetyGuide.map(s => `<li>${s}</li>`).join('');
    }

    // Qty triggers
    let qty = 1;
    const qtyVal = document.getElementById('qty-val');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    if (qtyMinus && qtyPlus && qtyVal) {
      qtyMinus.addEventListener('click', () => {
        qty = Math.max(1, qty - 1);
        qtyVal.textContent = qty;
      });
      qtyPlus.addEventListener('click', () => {
        qty++;
        qtyVal.textContent = qty;
      });
    }

    // Actions
    const pdAddBtn = document.getElementById('pd-add-to-cart');
    if (pdAddBtn) {
      pdAddBtn.addEventListener('click', () => {
        for (let i = 0; i < qty; i++) {
          window.addToCart(product.name, product.price, product.image);
        }
        const drawer = document.getElementById('cartDrawer');
        if (drawer) drawer.classList.add('open');
      });
    }

    const pdBuyBtn = document.getElementById('pd-buy-now');
    if (pdBuyBtn) {
      pdBuyBtn.addEventListener('click', () => {
        for (let i = 0; i < qty; i++) {
          window.addToCart(product.name, product.price, product.image);
        }
        window.location.href = 'checkout.html';
      });
    }

    // Tabs toggle
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const pane = document.getElementById(tab.dataset.tab);
        if (pane) pane.classList.add('active');
      });
    });

    // Related grid
    const relatedGrid = document.getElementById('pd-related-grid');
    if (relatedGrid && window.NF_PRODUCTS) {
      const related = Object.values(window.NF_PRODUCTS)
        .filter(p => p.id !== product.id)
        .slice(0, 3);

      relatedGrid.innerHTML = related.map(p => `
        <div class="p-card" data-cat="${p.category.toLowerCase()}">
          <div class="p-card-img">
            ${p.badge ? `<div class="p-card-badges"><span class="badge ${p.badge.includes('Sale') ? 'badge-sale' : (p.badge.includes('Eco') ? 'badge-eco' : 'badge-gold')}">${p.badge}</span></div>` : ''}
            <span class="wish-btn" data-name="${p.name}" onclick="toggleWish('${p.name}',${p.price},'${p.image}')"><i class="far fa-heart"></i></span>
            <img src="${p.image}" alt="${p.name}">
            <div class="p-overlay">
              <button class="btn btn-gold" onclick="addToCart('${p.name}',${p.price},'${p.image}')">Add to Cart</button>
              <a href="product.html?id=${p.id}" class="btn btn-outline" style="justify-content:center;">View Details</a>
            </div>
          </div>
          <div class="p-card-body">
            <span class="p-card-cat">${p.category}</span>
            <h3 class="p-card-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <div class="p-card-stars">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
              <span class="rev">(${p.reviewsCount})</span>
            </div>
            <div class="p-card-price">
              <strong>£${p.price.toFixed(2)}</strong>
              ${p.originalPrice > p.price ? `<del>£${p.originalPrice.toFixed(2)}</del>` : ''}
            </div>
          </div>
        </div>
      `).join('');
      syncWishBtns();
    }
  }

  function initCartPage() {
    const listEl = document.getElementById('cart-page-list');
    const storeSelect = document.getElementById('pickup-store-select');
    const storeDetails = document.getElementById('selected-store-details');
    const storePickerArea = document.getElementById('store-picker-area');
    const ffPickup = document.getElementById('ff-pickup');
    const ffDelivery = document.getElementById('ff-delivery');
    const coBtn = document.getElementById('proceed-checkout-btn');

    let discountPercent = 0;

    function renderCartPage() {
      if (!listEl) return;
      if (cart.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center; padding:60px 20px; border:1px dashed var(--border); background:var(--bg-alt);">
            <i class="fas fa-shopping-bag" style="font-size:3rem; color:var(--gold); margin-bottom:20px; display:block;"></i>
            <h3 class="heading heading-md" style="margin-bottom:10px;">Your Cart is Empty</h3>
            <p style="color:var(--gray); margin-bottom:25px; font-size:0.95rem;">Browse our collections and find the perfect products for your celebration.</p>
            <a href="index.html#products" class="btn btn-gold">Explore Products</a>
          </div>
        `;
        if (coBtn) coBtn.disabled = true;
        updateTotals();
        return;
      }

      if (coBtn) coBtn.disabled = false;

      listEl.innerHTML = cart.map((item, i) => `
        <div class="cart-item-row">
          <img src="${item.img || 'assets/logo.png'}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span>£${item.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-qty">
            <button onclick="window._cartPageQty(${i},-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="window._cartPageQty(${i},1)">+</button>
          </div>
          <div class="cart-item-subtotal">£${(item.price * item.qty).toFixed(2)}</div>
          <span class="cart-item-remove-btn" onclick="window._cartPageRemove(${i})"><i class="fas fa-trash-alt"></i></span>
        </div>
      `).join('');
      
      updateTotals();
    }

    window._cartPageQty = (idx, delta) => {
      cart[idx].qty = Math.max(1, cart[idx].qty + delta);
      saveCart();
      renderCart();
      renderCartPage();
    };

    window._cartPageRemove = (idx) => {
      cart.splice(idx, 1);
      saveCart();
      renderCart();
      renderCartPage();
    };

    function updateTotals() {
      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const vat = Number((subtotal * 0.20).toFixed(2));
      
      const isDelivery = ffDelivery && ffDelivery.checked;
      const deliveryFee = isDelivery ? 5.00 : 0;
      
      const delRow = document.getElementById('delivery-row');
      if (delRow) delRow.style.display = isDelivery ? 'flex' : 'none';

      let discount = 0;
      if (discountPercent > 0) {
        discount = Number(((subtotal + vat) * (discountPercent / 100)).toFixed(2));
      }

      const total = Number((subtotal + vat + deliveryFee - discount).toFixed(2));
      
      const subEl = document.getElementById('cart-subtotal');
      if (subEl) subEl.textContent = '£' + subtotal.toFixed(2);
      const vatEl = document.getElementById('cart-vat');
      if (vatEl) vatEl.textContent = '£' + vat.toFixed(2);
      const totEl = document.getElementById('cart-total');
      if (totEl) totEl.textContent = '£' + total.toFixed(2);

      localStorage.setItem('nf_checkout_summary', JSON.stringify({
        subtotal,
        vat,
        deliveryFee,
        discount,
        total,
        fulfillment: isDelivery ? 'delivery' : 'pickup',
        store: storeSelect ? storeSelect.value : 'london'
      }));
    }

    function updateStoreInfo() {
      if (!storeDetails || !storeSelect) return;
      const store = STORES[storeSelect.value];
      if (store) {
        storeDetails.innerHTML = `
          <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${store.address}</p>
          <p><strong><i class="fas fa-phone-alt"></i> Phone:</strong> ${store.phone}</p>
          <p><strong><i class="fas fa-clock"></i> Hours:</strong> ${store.timings}</p>
        `;
      }
    }

    if (storeSelect) {
      storeSelect.addEventListener('change', () => {
        updateStoreInfo();
        updateTotals();
      });
    }

    if (ffPickup) {
      ffPickup.addEventListener('change', () => {
        if (storePickerArea) storePickerArea.style.display = 'block';
        updateTotals();
      });
    }

    if (ffDelivery) {
      ffDelivery.addEventListener('change', () => {
        if (storePickerArea) storePickerArea.style.display = 'none';
        updateTotals();
      });
    }

    const applyPromo = document.getElementById('apply-promo-btn');
    if (applyPromo) {
      applyPromo.addEventListener('click', () => {
        const promoInp = document.getElementById('promo-code-input');
        const code = promoInp ? promoInp.value.toUpperCase().trim() : '';
        if (code === 'BONFIRE40') {
          discountPercent = 40;
          showToast('Promo code BONFIRE40 applied! 40% discount.');
          updateTotals();
        } else if (code === 'FESTIVE5') {
          discountPercent = 5;
          showToast('Promo code FESTIVE5 applied! 5% discount.');
          updateTotals();
        } else if (code) {
          showToast('Invalid promo code');
        }
      });
    }

    if (coBtn) {
      coBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        window.location.href = 'checkout.html';
      });
    }

    updateStoreInfo();
    renderCartPage();
  }

  function initCheckoutPage() {
    if (cart.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    const summary = JSON.parse(localStorage.getItem('nf_checkout_summary') || '{}');
    const miniList = document.getElementById('checkout-mini-list');
    if (miniList) {
      miniList.innerHTML = cart.map(item => `
        <div class="summary-item-mini">
          <div class="summary-item-mini-info">
            <img src="${item.img || 'assets/logo.png'}" alt="${item.name}">
            <div class="summary-item-mini-text">
              <span style="font-weight: 500;">${item.name}</span>
              <span>Qty: ${item.qty}</span>
            </div>
          </div>
          <span class="summary-item-mini-price">£${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `).join('');
    }

    const subtotal = summary.subtotal || cart.reduce((s, i) => s + i.price * i.qty, 0);
    const vat = summary.vat !== undefined ? summary.vat : Number((subtotal * 0.20).toFixed(2));
    const deliveryFee = summary.deliveryFee || 0;
    const discount = summary.discount || 0;
    const total = Number((subtotal + vat + deliveryFee - discount).toFixed(2));

    const subEl = document.getElementById('checkout-subtotal');
    if (subEl) subEl.textContent = '£' + subtotal.toFixed(2);
    const vatEl = document.getElementById('checkout-vat');
    if (vatEl) vatEl.textContent = '£' + vat.toFixed(2);
    const totEl = document.getElementById('checkout-total');
    if (totEl) totEl.textContent = '£' + total.toFixed(2);

    const coDelRow = document.getElementById('checkout-delivery-row');
    const coDelInfo = document.getElementById('checkout-delivery-info');
    const coPickInfo = document.getElementById('checkout-pickup-info');

    if (deliveryFee > 0) {
      if (coDelRow) coDelRow.style.display = 'flex';
      if (coDelInfo) coDelInfo.style.display = 'block';
      if (coPickInfo) coPickInfo.style.display = 'none';
      
      // hide pay at store
      const storeCard = document.getElementById('pay-card-store');
      if (storeCard) storeCard.style.display = 'none';
      const homeAddress = document.getElementById('co-address');
      if (homeAddress) homeAddress.required = true;
    } else {
      if (coDelRow) coDelRow.style.display = 'none';
      if (coDelInfo) coDelInfo.style.display = 'none';
      if (coPickInfo) coPickInfo.style.display = 'block';

      const storeCode = summary.store || 'london';
      const store = STORES[storeCode];
      const detailsEl = document.getElementById('checkout-store-details');
      if (detailsEl && store) {
        detailsEl.innerHTML = `
          <p><strong>Store Outlet:</strong> ${store.name} (${storeCode.toUpperCase()})</p>
          <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${store.address}</p>
          <p><strong><i class="fas fa-phone-alt"></i> Phone:</strong> ${store.phone}</p>
        `;
      }

      const storeLabel = document.getElementById('pay-opt-store-label');
      if (storeLabel && store) {
        storeLabel.textContent = `Pay on Pickup at ${store.name}`;
      }
    }

    // Payment Cards Toggle
    const optOnline = document.getElementById('pay-card-online');
    const optStore = document.getElementById('pay-card-store');
    const onlineFields = document.getElementById('online-fields');
    
    if (optOnline && optStore) {
      optOnline.addEventListener('click', () => {
        optOnline.classList.add('active');
        optStore.classList.remove('active');
        document.getElementById('pay-opt-online').checked = true;
        if (onlineFields) onlineFields.style.display = 'block';
      });

      optStore.addEventListener('click', () => {
        optStore.classList.add('active');
        optOnline.classList.remove('active');
        document.getElementById('pay-opt-store').checked = true;
        if (onlineFields) onlineFields.style.display = 'none';
      });
    }

    const coForm = document.getElementById('checkoutForm');
    if (coForm) {
      coForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const payMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        if (payMethod === 'online') {
          const card = document.getElementById('co-card-num').value.trim();
          const paypal = document.getElementById('co-paypal-email').value.trim();
          if (!card && !paypal) {
            showToast('Please enter Credit Card details or PayPal email');
            return;
          }
        }

        const orderId = '#NF-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 8999 + 1000);
        const pickupCode = 'NF-PK-' + Math.floor(Math.random() * 89999 + 10000);

        document.getElementById('success-order-id').textContent = orderId;
        document.getElementById('success-pickup-code').textContent = pickupCode;

        const successLoc = document.getElementById('success-location-details');
        if (successLoc) {
          if (deliveryFee > 0) {
            document.getElementById('success-fulfillment-type').textContent = 'Home Delivery';
            successLoc.innerHTML = `
              <p style="margin-bottom:8px;"><strong style="color:var(--white);"><i class="fas fa-truck" style="color:var(--gold);"></i> Delivering to Address:</strong></p>
              <p style="color:var(--white);">${document.getElementById('co-address').value}, ${document.getElementById('co-city').value.toUpperCase()} - ${document.getElementById('co-postcode').value}</p>
              <p style="margin-top: 15px; font-size:0.8rem; color:var(--gray);">Estimated shipping time: 1-2 business days with SMS tracking.</p>
            `;
          } else {
            document.getElementById('success-fulfillment-type').textContent = 'Store Pickup';
            const storeCode = summary.store || 'london';
            const store = STORES[storeCode];
            successLoc.innerHTML = `
              <p style="margin-bottom:8px;"><strong style="color:var(--white);"><i class="fas fa-store" style="color:var(--gold);"></i> Pick up Store Location:</strong></p>
              <p style="color:var(--white);">${store.name} - ${store.address}</p>
              <p style="margin-top: 8px;"><strong>Timings:</strong> ${store.timings} | <strong>Phone:</strong> ${store.phone}</p>
              <p style="margin-top: 15px; font-size:0.8rem; color:var(--gray);">Your items are reserved. Pay at the counter on collection.</p>
            `;
          }
        }

        document.getElementById('checkout-main-view').style.display = 'none';
        document.getElementById('checkout-success-view').style.display = 'block';

        // clear checkout summary
        localStorage.removeItem('nf_checkout_summary');
        
        // empty cart
        cart = [];
        saveCart();
        renderCart();

        showToast('Order placed successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

});

