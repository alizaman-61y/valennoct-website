// LocalStorage Based Shopping Cart Module
const CART_KEY = 'valennoct_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.title === product.title);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  alert(`${product.title} sepete eklendi.`);
}

function removeFromCart(title) {
  let cart = getCart();
  cart = cart.filter(item => item.title !== title);
  saveCart(cart);
  renderCartModal();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const cart = getCart();
    const total = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.textContent = total;
  }
}

async function loadShopData() {
  const container = document.getElementById('shop-products-container');
  const statusBanner = document.getElementById('shop-status-banner');
  if (!container) return;

  let siteSettings = { shopStatus: 'Yakında', email: 'info@valennoct.com' };
  try {
    const siteRes = await fetch('/content/site.json');
    siteSettings = await siteRes.json();
  } catch(e) {}

  if (statusBanner) {
    if (siteSettings.shopStatus === 'Yakında') {
      statusBanner.innerHTML = '<div style="background:#f4f4f4; padding:15px; text-align:center; font-weight:600; letter-spacing:0.1em; margin-bottom:30px;">MAĞAZA YAKINDA AÇILIYOR</div>';
    } else if (siteSettings.shopStatus === 'Kapalı') {
      statusBanner.innerHTML = '<div style="background:#f4f4f4; padding:15px; text-align:center; font-weight:600; letter-spacing:0.1em; margin-bottom:30px;">MAĞAZA GEÇİCİ OLARAK KAPALIDIR</div>';
    }
  }

  try {
    const res = await fetch('/content/products.json');
    const data = await res.json();
    const items = (data.items || []).filter(p => p.status === 'published').sort((a,b) => a.sortOrder - b.sortOrder);

    if (items.length === 0) {
      container.innerHTML = '<p>Ürün bulunamadı.</p>';
      return;
    }

    container.innerHTML = items.map(p => {
      const isAvailable = siteSettings.shopStatus === 'Aktif' && p.addableToCart && p.inStock;
      
      return `
        <div class="product-card">
          <div>
            <img src="${p.coverImage}" alt="${p.title}" class="product-image" loading="lazy" />
            <h3 class="product-title">${p.title}</h3>
            <p class="product-material">${p.material || ''}</p>
            <p style="font-size:0.8rem; color:#444;">${p.description || ''}</p>
          </div>
          <div class="product-bottom">
            <span class="product-price">${p.showPrice ? p.price + ' TL' : ''}</span>
            <button 
              class="btn-accent" 
              ${!isAvailable ? 'disabled' : ''} 
              onclick='addToCart(${JSON.stringify({ title: p.title, price: p.price, code: p.sortOrder })})'>
              ${!p.inStock ? 'STOKTA YOK' : 'SEPETE EKLE'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Ürünler yüklenirken hata oluştu.</p>';
  }

  updateCartBadge();
}

function checkoutOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Sepetiniz boş.');
    return;
  }

  let email = 'info@valennoct.com';
  let bodyText = "Sipariş Detayları:\n\n";
  
  cart.forEach(item => {
    bodyText += `- Ürün: ${item.title} | Adet: ${item.qty} | Fiyat: ${item.price} TL\n`;
  });

  const note = prompt("Siparişinize eklemek istediğiniz not varsa yazabilirsiniz:");
  if (note) bodyText += `\nMüşteri Notu: ${note}\n`;

  const subject = encodeURIComponent('VALENNOCT Web Sitesi Sipariş Talebi');
  const body = encodeURIComponent(bodyText);

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
