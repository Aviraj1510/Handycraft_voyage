// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Contact form â€” front-end only placeholder (only present on index.html).
// Replace this handler with a real request to your backend or a form service
// (e.g. Formspree, Netlify Forms) when you're ready to receive submissions.
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = 'Thanks â€” this form is not yet connected to an inbox. Add a form service to start receiving messages.';
    contactForm.reset();
  });
}

// ===== CART SYSTEM =====
// Cart lives in localStorage so it persists across pages (index.html / collection.html)
// on the same live site. No payment happens here â€” checkout hands off to Instagram DM.
const CART_KEY = 'hcv_cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    // Storage can fail in some browser contexts â€” cart just won't persist.
  }
}

function addToCart(productName) {
  const cart = getCart();
  const existing = cart.find(item => item.name === productName);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: productName, qty: 1 });
  }
  saveCart(cart);
  renderCart();
  openCart();
}

function removeFromCart(productName) {
  const cart = getCart().filter(item => item.name !== productName);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  if (!cartCountEl || !cartItemsEl) return;

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = String(totalQty);
  cartCountEl.style.display = totalQty > 0 ? 'flex' : 'none';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your bag is empty. Add a piece you like from the <a href="collection">collection</a>.</p>';
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-qty">Qty: ${item.qty}</p>
      </div>
      <button class="cart-item-remove" data-remove="${item.name}" aria-label="Remove ${item.name}">&times;</button>
    </div>
  `).join('');

  cartItemsEl.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('open');
  overlay.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
const cartCheckout = document.getElementById('cartCheckout');

if (cartToggle) cartToggle.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

if (cartCheckout) {
  cartCheckout.addEventListener('click', async () => {
    const cart = getCart();
    if (cart.length === 0) return;
    const lines = cart.map(item => `â€¢ ${item.name} x${item.qty}`).join('\n');
    const message = `Hi! I'd like to order:\n${lines}`;
    try {
      await navigator.clipboard.writeText(message);
      const original = cartCheckout.textContent;
      cartCheckout.textContent = 'Message copied â€” opening Instagramâ€¦';
      setTimeout(() => { cartCheckout.textContent = original; }, 2500);
    } catch (err) {
      // Clipboard can fail silently â€” Instagram still opens below.
    }
    window.open('https://www.instagram.com/handycraft_voyage', '_blank', 'noopener');
  });
}

// "Add to Cart" buttons on the shop page
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const product = btn.dataset.product || 'Item';
    addToCart(product);
    const original = btn.textContent;
    btn.textContent = 'Added âœ“';
    btn.classList.remove('added');
    void btn.offsetWidth;
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = original; }, 1400);
  });
});

// Legacy single-item "enquire" buttons (if present) still hand off to Instagram DM directly
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const product = btn.dataset.product || 'a product';
    const message = `Hi! I'd like to enquire about: ${product}`;
    try {
      await navigator.clipboard.writeText(message);
      const original = btn.textContent;
      btn.textContent = 'Message copied â€” paste in DM';
      setTimeout(() => { btn.textContent = original; }, 2500);
    } catch (err) {
      // Clipboard access can fail â€” the DM still opens normally.
    }
  });
});

renderCart();

// Cart icon bounce whenever an item is added
function bumpCartIcon() {
  if (!cartToggle) return;
  cartToggle.classList.remove('bump');
  // Force reflow so the animation can restart if triggered again quickly
  void cartToggle.offsetWidth;
  cartToggle.classList.add('bump');
}
const originalAddToCart = addToCart;
addToCart = function (productName) {
  originalAddToCart(productName);
  bumpCartIcon();
};

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}

// ===== NAV SHRINK ON SCROLL =====
const navEl = document.getElementById('nav');
function updateNavScrolled() {
  if (!navEl) return;
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}

// ===== BACK TO TOP BUTTON =====
const backToTop = document.getElementById('backToTop');
function updateBackToTop() {
  if (!backToTop) return;
  backToTop.classList.toggle('visible', window.scrollY > 500);
}
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateNavScrolled();
  updateBackToTop();
}, { passive: true });
updateScrollProgress();
updateNavScrolled();
updateBackToTop();

// ===== STAGGERED SCROLL REVEAL =====
// Groups sibling cards so they animate in one after another rather than all at once.
const revealGroups = [
  '.craft-grid > .craft-card',
  '.postcard-grid > .postcard',
  '.route-steps > .route-step',
  '.shop-grid > .shop-card',
  '.hoop-grid > .hoop-item'
];

revealGroups.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal-on-scroll');
    el.style.setProperty('--stagger', `${(i % 4) * 0.09}s`);
  });
});

// Section headings / standalone blocks fade in individually
document.querySelectorAll('.section-title, .story-copy, .story-visual, .hero-scroll').forEach(el => {
  el.classList.add('reveal-on-scroll');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

