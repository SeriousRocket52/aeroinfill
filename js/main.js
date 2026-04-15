/* ============================================================
   AEROINFILL — main.js
   Nav toggle, scroll reveal, ticker, utilities
   ============================================================ */

'use strict';

/* ── Scroll Reveal ────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling reveals
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')]
          : [];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(idx * 80, 400));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => observer.observe(el));
})();

/* ── Mobile Nav Toggle ────────────────────────────────────── */
(function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    drawer.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on drawer link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ── Ticker pause on hover ────────────────────────────────── */
(function initTicker() {
  const ticker = document.querySelector('.ticker__inner');
  if (!ticker) return;

  ticker.addEventListener('mouseenter', () => {
    ticker.style.animationPlayState = 'paused';
  });
  ticker.addEventListener('mouseleave', () => {
    ticker.style.animationPlayState = 'running';
  });
})();

/* ── Hero crosshair parallax ──────────────────────────────── */
(function initCrosshair() {
  const hero = document.querySelector('.hero');
  const crosshair = document.querySelector('.hero-crosshair');
  if (!hero || !crosshair) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
      crosshair.style.transform = `translateY(-50%) translate(${x}px, ${y}px)`;
    });
  }
})();

/* ── Load More (category pages) ──────────────────────────── */
(function initLoadMore() {
  const btn  = document.querySelector('.btn-load-more');
  const grid = document.querySelector('.article-grid');
  if (!btn || !grid) return;

  const BATCH    = 6;
  const allCards = [...grid.querySelectorAll('.article-card')];

  // Hide cards beyond the first batch so the button has work to do
  if (allCards.length > BATCH) {
    allCards.slice(BATCH).forEach(card => {
      card.style.display    = 'none';
      card.dataset.loadMore = 'hidden';
    });
  }

  function refreshBtn() {
    const stillHidden = grid.querySelectorAll('[data-load-more="hidden"]').length;
    if (stillHidden === 0) {
      btn.disabled          = true;
      btn.innerHTML         = '&#9670; All Articles Shown';
      btn.style.opacity     = '0.45';
      btn.style.cursor      = 'default';
      btn.style.borderColor = 'var(--border)';
      btn.style.color       = 'var(--text-muted)';
    }
  }

  // Set initial state (disables immediately when all cards are already visible)
  refreshBtn();

  btn.addEventListener('click', () => {
    const hidden = [...grid.querySelectorAll('[data-load-more="hidden"]')];
    hidden.slice(0, BATCH).forEach(card => {
      card.style.display    = '';
      card.dataset.loadMore = '';
      // Re-trigger the scroll-reveal animation
      requestAnimationFrame(() => card.classList.add('visible'));
    });

    // Sync the filter-bar counter
    const counter = document.querySelector('.filter-bar__count strong');
    if (counter) {
      const visibleNow = allCards.filter(c => c.style.display !== 'none').length;
      counter.textContent = visibleNow;
    }

    refreshBtn();
  });
})();

/* ── Active nav link ──────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href)) {
      link.classList.add('active');
    }
  });
})();

/* ── Amazon OneLink fallback (CA → US tag swap) ───────────── */
(function initOneLink() {
  const tz = (Intl && Intl.DateTimeFormat)
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    : '';

  const US_TIMEZONES = [
    'America/New_York',    'America/Chicago',      'America/Denver',
    'America/Los_Angeles', 'America/Phoenix',      'America/Anchorage',
    'America/Adak',        'America/Boise',        'America/Detroit',
    'America/Juneau',      'America/Menominee',    'America/Metlakatla',
    'America/Nome',        'America/Sitka',        'America/Yakutat',
    'America/Indiana/Indianapolis', 'America/Indiana/Knox',
    'America/Indiana/Marengo',      'America/Indiana/Petersburg',
    'America/Indiana/Tell_City',    'America/Indiana/Vevay',
    'America/Indiana/Vincennes',    'America/Indiana/Winamac',
    'America/Kentucky/Louisville',  'America/Kentucky/Monticello',
    'America/North_Dakota/Beulah',  'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem', 'Pacific/Honolulu'
  ];

  if (!US_TIMEZONES.includes(tz)) return;

  // Visitor is in the US — swap amazon.ca links to amazon.com with US tag
  document.querySelectorAll('a[href*="amazon.ca"]').forEach(function(link) {
    link.href = link.href
      .replace('amazon.ca', 'amazon.com')
      .replace('tag=aeroinfill-20', 'tag=aeroinfill0c-20');
  });
})();
