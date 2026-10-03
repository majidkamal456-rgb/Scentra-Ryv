/* Scentra Ryv — Main JavaScript */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileMenu();
  initToasts();
  initQuickView();
  initCartDrawer();
  initCartAjax();
});

function initScrollAnimations() {
  const sections = document.querySelectorAll('.fade-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!toggle || !drawer) return;

  const open = () => {
    drawer.classList.remove('translate-x-full');
    overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    drawer.classList.add('translate-x-full');
    overlay?.classList.add('hidden');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-fade-in`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function initToasts() {
  document.querySelectorAll('[data-toast]').forEach((el) => {
    showToast(el.dataset.toast, el.dataset.toastType || 'success');
    el.remove();
  });
}

function openQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

async function loadQuickView(url) {
  const content = document.getElementById('quick-view-content');
  if (!content || !url) return;

  content.innerHTML = '<p class="py-16 text-center text-brand-mute">Loading...</p>';
  openQuickViewModal();

  try {
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error('Failed');
    content.innerHTML = await res.text();
  } catch {
    content.innerHTML = '<p class="py-16 text-center text-red-300">Could not load product.</p>';
    showToast('Could not load product.', 'error');
  }
}

function initQuickView() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-view]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      loadQuickView(btn.dataset.quickView);
      return;
    }

    if (e.target.closest('#quick-view-close')) {
      e.preventDefault();
      closeQuickViewModal();
      return;
    }

    const modal = document.getElementById('quick-view-modal');
    if (modal && e.target === modal) {
      closeQuickViewModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickViewModal();
    }
  });
}

function updateCartBadge(count) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.textContent = count;
  if (count > 0) badge.classList.remove('hidden');
  else badge.classList.add('hidden');
}

function setCartDrawerHtml(html) {
  const body = document.getElementById('cart-drawer-body');
  if (body && typeof html === 'string') body.innerHTML = html;
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer) return;
  overlay?.removeAttribute('hidden');
  requestAnimationFrame(() => {
    overlay?.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  });
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  drawer?.classList.remove('is-open');
  overlay?.classList.remove('is-open');
  drawer?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  window.setTimeout(() => overlay?.setAttribute('hidden', ''), 350);
}

async function refreshCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const url = drawer?.dataset.drawerUrl;
  if (!url) return;
  try {
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const data = await res.json();
    if (data.success) {
      setCartDrawerHtml(data.html);
      updateCartBadge(data.cart_count);
    }
  } catch {
    /* ignore refresh errors */
  }
}

function findFlySourceImage(form) {
  const card = form.closest('.product-card');
  if (card) {
    const img = card.querySelector('.product-card__media img');
    if (img) return img;
  }
  const quickView = form.closest('.quick-view');
  if (quickView) {
    const img = quickView.querySelector('.quick-view__img');
    if (img) return img;
  }
  return document.querySelector('.product-gallery__img, .product-detail img, main img');
}

function flyImageToCart(sourceImg, imageUrl) {
  return new Promise((resolve) => {
    const cartBtn = document.getElementById('cart-trigger');
    const src = imageUrl || sourceImg?.currentSrc || sourceImg?.src;
    if (!cartBtn || !src) {
      resolve();
      return;
    }

    const startRect = sourceImg
      ? sourceImg.getBoundingClientRect()
      : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2 - 40, width: 80, height: 80 };
    const endRect = cartBtn.getBoundingClientRect();
    const size = 80;
    const startX = startRect.left + startRect.width / 2 - size / 2;
    const startY = startRect.top + startRect.height / 2 - size / 2;
    const endX = endRect.left + endRect.width / 2 - size / 2;
    const endY = endRect.top + endRect.height / 2 - size / 2;

    const clone = document.createElement('div');
    clone.className = 'cart-fly-clone';
    clone.innerHTML = `<img src="${src}" alt="">`;
    clone.style.cssText = `left:${startX}px;top:${startY}px;width:${size}px;height:${size}px;opacity:1;transform:translate(0,0) scale(1);`;
    document.body.appendChild(clone);

    // Force layout so the transition always runs toward the header cart icon
    // eslint-disable-next-line no-unused-expressions
    clone.offsetWidth;

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.2)`;
      clone.style.opacity = '0.35';
    });

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clone.remove();
      cartBtn.classList.add('is-pulse');
      window.setTimeout(() => cartBtn.classList.remove('is-pulse'), 450);
      resolve();
    };

    clone.addEventListener('transitionend', (ev) => {
      if (ev.propertyName === 'transform') finish();
    });
    window.setTimeout(finish, 900);
  });
}

function initCartDrawer() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-open]')) {
      e.preventDefault();
      refreshCartDrawer().finally(openCartDrawer);
      return;
    }
    if (e.target.closest('#cart-drawer-close') || e.target.id === 'cart-drawer-overlay') {
      e.preventDefault();
      closeCartDrawer();
      return;
    }

    const qtyBtn = e.target.closest('[data-qty-delta]');
    if (qtyBtn) {
      const form = qtyBtn.closest('form[data-cart-drawer-update]');
      const input = form?.querySelector('input[name="quantity"]');
      if (!form || !input) return;
      e.preventDefault();
      const delta = Number(qtyBtn.dataset.qtyDelta || 0);
      const max = Number(input.max || 99);
      const next = Math.min(max, Math.max(1, Number(input.value || 1) + delta));
      input.value = String(next);
      form.requestSubmit();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });

  document.addEventListener('submit', async (e) => {
    const updateForm = e.target.closest('form[data-cart-drawer-update]');
    const removeForm = e.target.closest('form[data-cart-drawer-remove]');
    const form = updateForm || removeForm;
    if (!form) return;
    e.preventDefault();

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const data = await res.json();
      if (data.success) {
        setCartDrawerHtml(data.html);
        updateCartBadge(data.cart_count);
      }
    } catch {
      showToast('Could not update cart.', 'error');
    }
  });
}

function initCartAjax() {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-cart-add]');
    if (!form || !form.dataset.ajax) return;
    e.preventDefault();
    e.stopPropagation();

    const btn = form.querySelector('[type="submit"]');
    const iconBtn = Boolean(btn?.querySelector('.product-card__cart-icon, svg'));
    const originalText = btn && !iconBtn ? btn.textContent : null;
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-adding');
      btn.classList.remove('is-added');
      if (!iconBtn) btn.textContent = 'Adding...';
    }

    try {
      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      const data = await res.json();

      if (data.success) {
        const sourceImg = findFlySourceImage(form);
        // Restore bag icon before fly so second add always shows cart icon
        if (btn) {
          btn.classList.remove('is-adding');
          btn.disabled = false;
        }
        await flyImageToCart(sourceImg, data.product_image);
        updateCartBadge(data.cart_count ?? 0);
        if (data.drawer_html) setCartDrawerHtml(data.drawer_html);
        else await refreshCartDrawer();
        closeQuickViewModal();
        openCartDrawer();
        if (iconBtn && btn) {
          btn.classList.add('is-added');
          window.setTimeout(() => {
            btn.classList.remove('is-added');
          }, 1200);
        }
      } else {
        showToast(data.message || 'Could not add to cart.', 'error');
      }
    } catch {
      showToast('Something went wrong.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-adding');
        if (originalText != null) btn.textContent = originalText;
      }
    }
  });
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 2000);
  });
}

window.copyToClipboard = copyToClipboard;
