/* Scentra Ryv — Main JavaScript */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileMenu();
  initToasts();
  initQuickView();
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

function initQuickView() {
  document.querySelectorAll('[data-quick-view]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = btn.dataset.quickView;
      const modal = document.getElementById('quick-view-modal');
      const content = document.getElementById('quick-view-content');
      if (!modal || !content) return;

      try {
        const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        content.innerHTML = await res.text();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      } catch {
        showToast('Could not load product.', 'error');
      }
    });
  });

  document.getElementById('quick-view-close')?.addEventListener('click', () => {
    const modal = document.getElementById('quick-view-modal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
    document.body.style.overflow = '';
  });

  document.getElementById('quick-view-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'quick-view-modal') {
      e.currentTarget.classList.add('hidden');
      e.currentTarget.classList.remove('flex');
      document.body.style.overflow = '';
    }
  });
}

function initCartAjax() {
  document.querySelectorAll('form[data-cart-add]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      if (!form.dataset.ajax) return;
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const originalText = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Adding...';
      }

      try {
        const formData = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        const data = await res.json();

        if (data.success) {
          showToast(data.message);
          const badge = document.getElementById('cart-badge');
          if (badge) {
            badge.textContent = data.cart_count;
            badge.classList.remove('hidden');
          }
        } else {
          showToast(data.message || 'Could not add to cart.', 'error');
        }
      } catch {
        showToast('Something went wrong.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    });
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
