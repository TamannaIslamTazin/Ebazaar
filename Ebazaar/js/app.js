/**
 * Ebazaar – Main application logic
 * Login: phone number + password
 */

let db = loadDB();
let currentUser = null;
let currentRoleChoice = null;
let authMode = 'login';
let pendingOrderProduct = null;
let ratingTargetMerchantId = null;
let selectedStars = 0;
let orderFilter = 'all';
let salesChart = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function chooseRole(role) {
  currentRoleChoice = role;
  document.getElementById('auth-title').textContent = role === 'merchant' ? 'Merchant Login / Register' : 'Customer Login / Register';
  document.getElementById('auth-note').textContent =
    role === 'merchant'
      ? 'Login with phone number. New merchants unlock with ৳100 demo payment.'
      : 'Login with phone number. Browse, order and rate shops.';
  switchAuthTab('login');
  showScreen('auth');
}

function switchAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
  document.querySelectorAll('.reg-only').forEach(el => {
    el.style.display = mode === 'register' ? 'block' : 'none';
    if (mode === 'register') el.required = true;
    else { el.required = false; el.value = ''; }
  });
  document.getElementById('auth-submit').textContent = mode === 'login' ? 'Login' : 'Create Account';
}

function handleAuth(e) {
  e.preventDefault();
  // Reload DB so demo accounts are always available
  db = loadDB();

  const phoneRaw = document.getElementById('auth-phone').value.trim();
  const phone = normalizePhone(phoneRaw);
  const password = document.getElementById('auth-password').value;
  const nameEl = document.getElementById('auth-name');
  const name = nameEl ? nameEl.value.trim() : '';

  if (!phone || phone.length < 10) {
    toast('Enter a valid phone number (e.g. 01711111111)');
    return;
  }
  if (!password) {
    toast('Enter password');
    return;
  }
  if (!currentRoleChoice) {
    toast('Go back and choose Merchant or Customer first');
    return;
  }

  if (authMode === 'login') {
    const user = db.users.find(u =>
      normalizePhone(u.phone) === phone &&
      String(u.password) === String(password) &&
      u.role === currentRoleChoice
    );
    if (!user) {
      // Helpful hint: check if phone exists under other role
      const any = db.users.find(u => normalizePhone(u.phone) === phone);
      if (any && any.role !== currentRoleChoice) {
        toast('This phone is a ' + any.role + ' account. Choose the correct role.');
      } else if (any) {
        toast('Wrong password. Demo password is pass123');
      } else {
        toast('No account for this phone. Use demo numbers or Register.');
      }
      return;
    }
    loginAs(user);
  } else {
    if (db.users.some(u => normalizePhone(u.phone) === phone)) {
      toast('This phone number is already registered.');
      return;
    }
    const user = {
      id: uid('u'),
      phone: phone,
      password: password,
      role: currentRoleChoice,
      name: name || phone,
      subscribedUntil: 0,
      shop: null
    };
    db.users.push(user);
    saveDB(db);
    toast('Account created! Logging in...');
    loginAs(user);
  }
}

function resetAppData() {
  if (!confirm('Reset all Ebazaar data to demo defaults?')) return;
  localStorage.removeItem(STORAGE_KEY);
  db = loadDB();
  toast('Data reset. Try demo login again.');
  showScreen('landing');
}

function loginAs(user) {
  currentUser = user;
  if (user.role === 'merchant') {
    const active = user.subscribedUntil && user.subscribedUntil > Date.now();
    if (!active) {
      showScreen('merchant-lock');
      return;
    }
    enterMerchantDash();
  } else {
    enterCustomerDash();
  }
}

function logout() {
  currentUser = null;
  currentRoleChoice = null;
  document.getElementById('auth-form').reset();
  showScreen('landing');
}

function demoPaySubscription() {
  if (!currentUser || currentUser.role !== 'merchant') return;
  currentUser.subscribedUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
  if (!currentUser.shop) {
    currentUser.shop = {
      name: '',
      owner: currentUser.name,
      phone: currentUser.phone || '',
      address: '',
      type: 'Grocery',
      location: 'Dhanmondi',
      ratingSum: 0,
      ratingCount: 0
    };
  }
  const idx = db.users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) db.users[idx] = currentUser;
  saveDB(db);
  toast('Payment successful! Shop unlocked for 30 days.');
  enterMerchantDash();
}

function enterMerchantDash() {
  showScreen('merchant-dash');
  fillShopForm();
  renderMerchantProducts();
  renderMerchantOrders();
  updateOrderBadge();
  document.getElementById('m-shop-name').textContent = (currentUser.shop && currentUser.shop.name) || currentUser.name;
  const exp = currentUser.subscribedUntil ? new Date(currentUser.subscribedUntil).toLocaleDateString() : '—';
  document.getElementById('sub-expiry').textContent = exp;
  document.getElementById('sub-status').textContent = currentUser.subscribedUntil > Date.now() ? 'Active' : 'Expired';
  showMerchantPanel('m-setup');
}

function showMerchantPanel(id) {
  document.querySelectorAll('#merchant-dash .panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#merchant-dash .nav-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === id));
  document.getElementById(id).classList.add('active');
  if (id === 'm-orders') renderMerchantOrders();
  if (id === 'm-stats') renderStats();
  if (id === 'm-products') renderMerchantProducts();
}

function fillShopForm() {
  const s = currentUser.shop || {};
  document.getElementById('shop-name').value = s.name || '';
  document.getElementById('shop-owner').value = s.owner || currentUser.name || '';
  document.getElementById('shop-phone').value = s.phone || currentUser.phone || '';
  document.getElementById('shop-address').value = s.address || '';
  document.getElementById('shop-type').value = s.type || 'Grocery';
  document.getElementById('shop-location').value = s.location || 'Dhanmondi';
}

function saveShop(e) {
  e.preventDefault();
  currentUser.shop = {
    name: document.getElementById('shop-name').value.trim(),
    owner: document.getElementById('shop-owner').value.trim(),
    phone: document.getElementById('shop-phone').value.trim(),
    address: document.getElementById('shop-address').value.trim(),
    type: document.getElementById('shop-type').value,
    location: document.getElementById('shop-location').value,
    ratingSum: (currentUser.shop && currentUser.shop.ratingSum) || 0,
    ratingCount: (currentUser.shop && currentUser.shop.ratingCount) || 0
  };
  const idx = db.users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) db.users[idx] = currentUser;
  saveDB(db);
  document.getElementById('m-shop-name').textContent = currentUser.shop.name;
  document.getElementById('shop-saved-msg').classList.remove('hidden');
  setTimeout(() => document.getElementById('shop-saved-msg').classList.add('hidden'), 2500);
  toast('Shop profile saved!');
}

function addProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prod-name').value.trim();
  const price = +document.getElementById('prod-price').value;
  const cost = +document.getElementById('prod-cost').value || 0;
  const desc = document.getElementById('prod-desc').value.trim();
  let img = document.getElementById('prod-img').value.trim();
  if (!img) {
    const key = Object.keys(DEMO_IMAGES).find(k => name.toLowerCase().includes(k)) || 'default';
    img = DEMO_IMAGES[key];
  }
  const prod = {
    id: uid('p'),
    merchantId: currentUser.id,
    name,
    price,
    cost,
    desc,
    img
  };
  db.products.push(prod);
  saveDB(db);
  document.getElementById('product-form').reset();
  renderMerchantProducts();
  toast('Product added!');
}

function renderMerchantProducts() {
  const list = document.getElementById('product-list');
  const my = db.products.filter(p => p.merchantId === currentUser.id);
  if (!my.length) {
    list.innerHTML = '<p class="empty-state">No products yet. Add your first item above.</p>';
    return;
  }
  list.innerHTML = my.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${esc(p.name)}" onerror="this.src='${DEMO_IMAGES.default}'" />
      <div class="body">
        <h4>${esc(p.name)}</h4>
        <div class="price">৳${p.price}</div>
        <div class="meta">${esc(p.desc || '')} ${p.cost ? '• Cost ৳' + p.cost : ''}</div>
        <div class="actions">
          <button class="btn small danger" onclick="deleteProduct('${p.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  db.products = db.products.filter(p => p.id !== id);
  saveDB(db);
  renderMerchantProducts();
  toast('Product removed');
}

function filterOrders(f) {
  orderFilter = f;
  document.querySelectorAll('.order-filters .chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
  renderMerchantOrders();
}

function renderMerchantOrders() {
  const list = document.getElementById('order-list');
  let orders = db.orders.filter(o => o.merchantId === currentUser.id);
  if (orderFilter !== 'all') orders = orders.filter(o => o.status === orderFilter);
  orders.sort((a, b) => b.createdAt - a.createdAt);
  if (!orders.length) {
    list.innerHTML = '<p class="empty-state">No orders in this filter.</p>';
    return;
  }
  list.innerHTML = orders.map(o => {
    const prod = db.products.find(p => p.id === o.productId);
    return `
      <div class="order-card ${o.status}">
        <div class="row">
          <strong>${esc(prod ? prod.name : 'Product')}</strong>
          <span class="status-tag ${o.status}">${o.status.toUpperCase()}</span>
        </div>
        <div>Qty: ${o.qty} × ৳${o.price} = <strong>৳${o.qty * o.price}</strong></div>
        <div class="customer-details">
          <strong>Customer:</strong> ${esc(o.customerName)}<br/>
          Phone: ${esc(o.customerPhone || '—')}<br/>
          Address: ${esc(o.address || '—')}<br/>
          Ordered: ${new Date(o.createdAt).toLocaleString()}
        </div>
        ${o.status === 'pending' ? `<button class="btn small success" onclick="markSupplied('${o.id}')">Mark as Supplied</button>` : ''}
      </div>
    `;
  }).join('');
}

function markSupplied(orderId) {
  const o = db.orders.find(x => x.id === orderId);
  if (!o) return;
  o.status = 'supplied';
  saveDB(db);
  renderMerchantOrders();
  updateOrderBadge();
  toast('Order marked as supplied');
}

function updateOrderBadge() {
  if (!currentUser) return;
  const pending = db.orders.filter(o => o.merchantId === currentUser.id && o.status === 'pending').length;
  const badge = document.getElementById('m-order-badge');
  if (pending > 0) {
    badge.textContent = pending;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderStats() {
  const myOrders = db.orders.filter(o => o.merchantId === currentUser.id && o.status === 'supplied');
  let items = 0, revenue = 0, profit = 0;
  const byProduct = {};

  myOrders.forEach(o => {
    items += o.qty;
    revenue += o.qty * o.price;
    const prod = db.products.find(p => p.id === o.productId);
    const cost = prod ? (prod.cost || 0) : 0;
    profit += o.qty * (o.price - cost);
    const name = prod ? prod.name : o.productId;
    if (!byProduct[name]) byProduct[name] = { sold: 0, revenue: 0, profit: 0 };
    byProduct[name].sold += o.qty;
    byProduct[name].revenue += o.qty * o.price;
    byProduct[name].profit += o.qty * (o.price - cost);
  });

  document.getElementById('stat-orders').textContent = myOrders.length;
  document.getElementById('stat-items').textContent = items;
  document.getElementById('stat-revenue').textContent = '৳' + revenue.toLocaleString();
  document.getElementById('stat-profit').textContent = '৳' + profit.toLocaleString();

  const tbody = document.querySelector('#sales-table tbody');
  const rows = Object.entries(byProduct);
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4">No supplied orders yet.</td></tr>';
  } else {
    tbody.innerHTML = rows.map(([name, d]) => `
      <tr>
        <td>${esc(name)}</td>
        <td>${d.sold}</td>
        <td>৳${d.revenue.toLocaleString()}</td>
        <td>৳${d.profit.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  const ctx = document.getElementById('sales-chart');
  if (salesChart) salesChart.destroy();
  const labels = rows.map(r => r[0]);
  const dataSold = rows.map(r => r[1].sold);
  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        label: 'Units Sold',
        data: dataSold.length ? dataSold : [0],
        backgroundColor: '#0d9488',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function enterCustomerDash() {
  showScreen('customer-dash');
  document.getElementById('c-name').textContent = currentUser.name;
  document.getElementById('search-input').value = '';
  fillCustomerProfileForm();
  // sync area selector if profile has location
  if (currentUser.location) {
    const sel = document.getElementById('customer-location');
    if (sel && [...sel.options].some(o => o.value === currentUser.location)) {
      sel.value = currentUser.location;
    }
  }
  searchProducts();
  showCustomerPanel('c-browse');
}

function fillCustomerProfileForm() {
  const nameEl = document.getElementById('c-prof-name');
  if (!nameEl) return;
  nameEl.value = currentUser.name || '';
  document.getElementById('c-prof-phone').value = currentUser.phone || '';
  document.getElementById('c-prof-address').value = currentUser.address || '';
  document.getElementById('c-prof-location').value = currentUser.location || 'Dhanmondi';
}

function saveCustomerProfile(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('c-prof-name').value.trim();
  currentUser.phone = normalizePhone(document.getElementById('c-prof-phone').value.trim()) || currentUser.phone;
  currentUser.address = document.getElementById('c-prof-address').value.trim();
  currentUser.location = document.getElementById('c-prof-location').value;
  const idx = db.users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) db.users[idx] = currentUser;
  saveDB(db);
  document.getElementById('c-name').textContent = currentUser.name;
  const sel = document.getElementById('customer-location');
  if (sel && currentUser.location) sel.value = currentUser.location;
  document.getElementById('c-profile-saved').classList.remove('hidden');
  setTimeout(() => document.getElementById('c-profile-saved').classList.add('hidden'), 2500);
  toast('Profile saved!');
  searchProducts();
}

function showCustomerPanel(id) {
  document.querySelectorAll('#customer-dash .panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#customer-dash .nav-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === id));
  document.getElementById(id).classList.add('active');
  if (id === 'c-orders') renderCustomerOrders();
  if (id === 'c-profile') fillCustomerProfileForm();
}

function searchProducts() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  const custLoc = document.getElementById('customer-location').value;
  const resultsEl = document.getElementById('search-results');
  const emptyEl = document.getElementById('empty-search');

  let products = db.products.slice();
  if (q) {
    products = products.filter(p => p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q));
  }

  const enriched = products.map(p => {
    const merchant = db.users.find(u => u.id === p.merchantId);
    const shop = merchant && merchant.shop ? merchant.shop : null;
    const rating = shopAvgRating(shop);
    const dist = locationDistance(shop ? shop.location : null, custLoc);
    return { product: p, merchant, shop, rating, dist };
  }).filter(x => x.merchant && x.merchant.subscribedUntil > Date.now());

  enriched.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.dist - b.dist;
  });

  if (!enriched.length) {
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'block';
    emptyEl.textContent = q ? 'No products found for "' + q + '". Try rice, phone, shirt...' : 'Type a product name above. Results sorted by rating then nearness.';
    return;
  }
  emptyEl.style.display = 'none';

  resultsEl.innerHTML = enriched.map(({ product: p, merchant, shop, rating }) => {
    const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    return `
      <div class="product-card">
        <img src="${p.img}" alt="${esc(p.name)}" onerror="this.src='${DEMO_IMAGES.default}'" />
        <div class="body">
          <h4>${esc(p.name)}</h4>
          <div class="price">৳${p.price}</div>
          <div class="meta">${esc(p.desc || '')}</div>
          <div class="shop-line">
            <strong>${esc(shop ? shop.name : merchant.name)}</strong><br/>
            <span class="rating-stars">${stars}</span> ${rating || 'New'}
            · ${esc(shop ? shop.location : '')}
          </div>
          <div class="actions">
            <button class="btn small primary" onclick="openOrderModal('${p.id}')">Order</button>
            <button class="btn small" onclick="openRateModal('${merchant.id}')">Rate Shop</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openOrderModal(productId) {
  const p = db.products.find(x => x.id === productId);
  if (!p) return;
  pendingOrderProduct = p;
  const merchant = db.users.find(u => u.id === p.merchantId);
  document.getElementById('modal-product-info').innerHTML = `
    <img src="${p.img}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:0.5rem" onerror="this.src='${DEMO_IMAGES.default}'" />
    <strong>${esc(p.name)}</strong> — ৳${p.price}<br/>
    <small>From: ${esc(merchant && merchant.shop ? merchant.shop.name : '')}</small>
  `;
  document.getElementById('order-qty').value = 1;
  document.getElementById('order-address').value = currentUser.address || '';
  document.getElementById('order-phone').value = currentUser.phone || '';
  document.getElementById('order-modal').classList.remove('hidden');
}

function confirmOrder() {
  if (!pendingOrderProduct || !currentUser) return;
  const qty = Math.max(1, +document.getElementById('order-qty').value || 1);
  const address = document.getElementById('order-address').value.trim() || 'Not provided';
  const phone = document.getElementById('order-phone').value.trim() || currentUser.phone || '';
  const order = {
    id: uid('o'),
    productId: pendingOrderProduct.id,
    merchantId: pendingOrderProduct.merchantId,
    customerId: currentUser.id,
    customerName: currentUser.name,
    customerPhone: phone,
    address,
    qty,
    price: pendingOrderProduct.price,
    status: 'pending',
    createdAt: Date.now()
  };
  db.orders.push(order);
  saveDB(db);
  closeModal();
  toast('Order placed! Merchant will see it immediately.');
}

function openRateModal(merchantId) {
  ratingTargetMerchantId = merchantId;
  selectedStars = 0;
  const merchant = db.users.find(u => u.id === merchantId);
  document.getElementById('rate-shop-name').textContent = merchant && merchant.shop ? merchant.shop.name : 'Shop';
  document.querySelectorAll('#star-rating span').forEach(s => s.classList.remove('active'));
  document.getElementById('rate-modal').classList.remove('hidden');
}

function submitRating() {
  if (!ratingTargetMerchantId || selectedStars < 1) {
    toast('Please select 1–5 stars');
    return;
  }
  const merchant = db.users.find(u => u.id === ratingTargetMerchantId);
  if (!merchant || !merchant.shop) return;
  merchant.shop.ratingSum = (merchant.shop.ratingSum || 0) + selectedStars;
  merchant.shop.ratingCount = (merchant.shop.ratingCount || 0) + 1;
  saveDB(db);
  closeModal();
  toast('Thanks for rating!');
  searchProducts();
}

function renderCustomerOrders() {
  const list = document.getElementById('customer-orders');
  const orders = db.orders.filter(o => o.customerId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt);
  if (!orders.length) {
    list.innerHTML = '<p class="empty-state">You have no orders yet.</p>';
    return;
  }
  list.innerHTML = orders.map(o => {
    const prod = db.products.find(p => p.id === o.productId);
    const merchant = db.users.find(u => u.id === o.merchantId);
    return `
      <div class="order-card ${o.status}">
        <div class="row">
          <strong>${esc(prod ? prod.name : 'Item')}</strong>
          <span class="status-tag ${o.status}">${o.status.toUpperCase()}</span>
        </div>
        <div>Qty ${o.qty} · ৳${o.qty * o.price}</div>
        <div class="meta">Shop: ${esc(merchant && merchant.shop ? merchant.shop.name : '—')} · ${new Date(o.createdAt).toLocaleString()}</div>
        ${o.status === 'supplied' ? `<button class="btn small" onclick="openRateModal('${o.merchantId}')">Rate Shop</button>` : ''}
      </div>
    `;
  }).join('');
}

function closeModal() {
  document.getElementById('order-modal').classList.add('hidden');
  document.getElementById('rate-modal').classList.add('hidden');
  pendingOrderProduct = null;
  ratingTargetMerchantId = null;
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.add('hidden'), 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('#star-rating span');
  stars.forEach(span => {
    span.addEventListener('mouseenter', () => {
      const v = +span.dataset.v;
      stars.forEach(s => s.classList.toggle('hover', +s.dataset.v <= v));
    });
    span.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hover')));
    span.addEventListener('click', () => {
      selectedStars = +span.dataset.v;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= selectedStars));
    });
  });
  setInterval(() => {
    if (currentUser && currentUser.role === 'merchant') updateOrderBadge();
  }, 3000);
});

window.chooseRole = chooseRole;
window.switchAuthTab = switchAuthTab;
window.handleAuth = handleAuth;
window.logout = logout;
window.demoPaySubscription = demoPaySubscription;
window.showMerchantPanel = showMerchantPanel;
window.saveShop = saveShop;
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.filterOrders = filterOrders;
window.markSupplied = markSupplied;
window.showCustomerPanel = showCustomerPanel;
window.searchProducts = searchProducts;
window.openOrderModal = openOrderModal;
window.confirmOrder = confirmOrder;
window.openRateModal = openRateModal;
window.submitRating = submitRating;
window.closeModal = closeModal;
window.showScreen = showScreen;
window.resetAppData = resetAppData;
window.saveCustomerProfile = saveCustomerProfile;
