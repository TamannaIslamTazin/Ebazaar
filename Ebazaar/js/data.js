/**
 * Ebazaar – Seed data & storage helpers
 * Login: phone number + password
 */

const STORAGE_KEY = 'ebazaar_v1';

const DEMO_IMAGES = {
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
  dal: 'https://images.unsplash.com/photo-1604329760661-e7b527d8c606?w=400&h=300&fit=crop',
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
  shirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
  medicine: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
  book: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
};

function getDefaultData() {
  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  return {
    users: [
      {
        id: 'u_m1',
        phone: '01711111111',
        password: 'pass123',
        role: 'merchant',
        name: 'Karim Hossain',
        subscribedUntil: now + monthMs,
        shop: {
          name: 'Karim Grocery Store',
          owner: 'Karim Hossain',
          phone: '01711111111',
          address: 'House 12, Road 5, Dhanmondi',
          type: 'Grocery',
          location: 'Dhanmondi',
          ratingSum: 18,
          ratingCount: 4
        }
      },
      {
        id: 'u_m2',
        phone: '01822222222',
        password: 'pass123',
        role: 'merchant',
        name: 'Salma Begum',
        subscribedUntil: now + monthMs,
        shop: {
          name: 'Salma Tech Corner',
          owner: 'Salma Begum',
          phone: '01822222222',
          address: 'Plot 8, Gulshan Avenue',
          type: 'Electronics',
          location: 'Gulshan',
          ratingSum: 22,
          ratingCount: 5
        }
      },
      {
        id: 'u_m3',
        phone: '01933333333',
        password: 'pass123',
        role: 'merchant',
        name: 'Rafiq Ahmed',
        subscribedUntil: now + monthMs,
        shop: {
          name: 'Rafiq Fashion House',
          owner: 'Rafiq Ahmed',
          phone: '01933333333',
          address: 'Mirpur 10, Dhaka',
          type: 'Clothing',
          location: 'Mirpur',
          ratingSum: 14,
          ratingCount: 4
        }
      },
      {
        id: 'u_c1',
        phone: '01644444444',
        password: 'pass123',
        role: 'customer',
        name: 'Nusrat Jahan',
        address: 'Flat 3B, Dhanmondi R/A',
        location: 'Dhanmondi'
      },
      {
        id: 'u_c2',
        phone: '01555555555',
        password: 'pass123',
        role: 'customer',
        name: 'Tanvir Hasan',
        address: 'House 7, Gulshan 2',
        location: 'Gulshan'
      }
    ],
    products: [
      { id: 'p1', merchantId: 'u_m1', name: 'Miniket Rice 5kg', price: 420, cost: 380, desc: 'Premium quality rice', img: DEMO_IMAGES.rice },
      { id: 'p2', merchantId: 'u_m1', name: 'Mosur Dal 1kg', price: 140, cost: 110, desc: 'Fresh red lentils', img: DEMO_IMAGES.dal },
      { id: 'p3', merchantId: 'u_m1', name: 'Soybean Oil 2L', price: 380, cost: 340, desc: 'Pure cooking oil', img: DEMO_IMAGES.oil },
      { id: 'p4', merchantId: 'u_m1', name: 'Potato 1kg', price: 45, cost: 30, desc: 'Local fresh potato', img: DEMO_IMAGES.potato },
      { id: 'p5', merchantId: 'u_m2', name: 'Samsung Galaxy A15', price: 18500, cost: 16500, desc: '6GB RAM, 128GB', img: DEMO_IMAGES.phone },
      { id: 'p6', merchantId: 'u_m2', name: 'Wireless Earbuds', price: 1200, cost: 850, desc: 'Bluetooth 5.0', img: DEMO_IMAGES.default },
      { id: 'p7', merchantId: 'u_m3', name: 'Cotton Panjabi', price: 950, cost: 600, desc: 'Men traditional wear', img: DEMO_IMAGES.shirt },
      { id: 'p8', merchantId: 'u_m3', name: 'Ladies Kurti', price: 750, cost: 450, desc: 'Printed cotton kurti', img: DEMO_IMAGES.shirt },
      { id: 'p9', merchantId: 'u_m2', name: 'Miniket Rice 5kg', price: 450, cost: 390, desc: 'Imported grade', img: DEMO_IMAGES.rice },
      { id: 'p10', merchantId: 'u_m3', name: 'Miniket Rice 5kg', price: 410, cost: 370, desc: 'Budget pack', img: DEMO_IMAGES.rice }
    ],
    orders: [
      {
        id: 'o1',
        productId: 'p1',
        merchantId: 'u_m1',
        customerId: 'u_c1',
        customerName: 'Nusrat Jahan',
        customerPhone: '01644444444',
        address: 'Flat 3B, Dhanmondi R/A',
        qty: 2,
        price: 420,
        status: 'supplied',
        createdAt: now - 86400000 * 2
      },
      {
        id: 'o2',
        productId: 'p5',
        merchantId: 'u_m2',
        customerId: 'u_c2',
        customerName: 'Tanvir Hasan',
        customerPhone: '01555555555',
        address: 'Gulshan 2',
        qty: 1,
        price: 18500,
        status: 'pending',
        createdAt: now - 3600000
      }
    ],
    ratings: []
  };
}

function normalizePhone(p) {
  return String(p || '').replace(/\D/g, '');
}

function ensureDemoUsers(data) {
  const defaults = getDefaultData();
  const demoPhones = defaults.users.map(u => normalizePhone(u.phone));
  // Remove broken users without phone
  data.users = (data.users || []).filter(u => u && u.phone && u.password && u.role);
  // Upsert each demo user by phone so login always works
  defaults.users.forEach(demo => {
    const ph = normalizePhone(demo.phone);
    const idx = data.users.findIndex(u => normalizePhone(u.phone) === ph);
    if (idx === -1) {
      data.users.push(JSON.parse(JSON.stringify(demo)));
    } else {
      // Keep their shop/subscription if already customized, but ensure password & role match demo for reliability
      data.users[idx].password = demo.password;
      data.users[idx].role = demo.role;
      data.users[idx].phone = demo.phone;
      if (!data.users[idx].name) data.users[idx].name = demo.name;
      if (demo.role === 'merchant') {
        if (!data.users[idx].subscribedUntil || data.users[idx].subscribedUntil < Date.now()) {
          data.users[idx].subscribedUntil = demo.subscribedUntil;
        }
        if (!data.users[idx].shop) data.users[idx].shop = demo.shop;
      }
    }
  });
  if (!Array.isArray(data.products) || data.products.length === 0) {
    data.products = defaults.products;
  }
  if (!Array.isArray(data.orders)) data.orders = defaults.orders;
  return data;
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let data = JSON.parse(raw);
      data = ensureDemoUsers(data);
      saveDB(data);
      return data;
    }
  } catch (e) {
    console.warn('Ebazaar load error, resetting', e);
  }
  const data = getDefaultData();
  saveDB(data);
  return data;
}

function saveDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Ebazaar save error', e);
  }
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  return loadDB();
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function shopAvgRating(shop) {
  if (!shop || !shop.ratingCount) return 0;
  return +(shop.ratingSum / shop.ratingCount).toFixed(1);
}

function locationDistance(shopLoc, customerLoc) {
  if (!shopLoc || !customerLoc) return 1;
  return shopLoc === customerLoc ? 0 : 1;
}
