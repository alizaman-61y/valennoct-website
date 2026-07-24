document.addEventListener('DOMContentLoaded', () => {
  // 1. Netlify Identity Redirect Check
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }

  // 2. Splash Screen Logic
  const splash = document.getElementById('splash-screen');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (splash) {
    if (sessionStorage.getItem('valennoct_visited') || prefersReduced) {
      splash.style.display = 'none';
    } else {
      sessionStorage.setItem('valennoct_visited', 'true');
      setTimeout(() => {
        splash.style.transform = 'translateY(-100%)';
        setTimeout(() => splash.remove(), 600);
      }, 1800);
    }
  }

  // 3. Header Scroll Hide & Mobile Menu Toggle
  let lastScrollY = window.scrollY;
  const hamburger = document.getElementById('hamburger-fixed');
  const overlay = document.getElementById('menu-overlay');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
  });

  function toggleMenu(open) {
    if (open) {
      document.body.classList.add('menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      document.body.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('menu-open');
      toggleMenu(!isOpen);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleMenu(false));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      toggleMenu(false);
    }
  });

  // 4. Reveal Animations (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

  // 5. Dynamic Footer Year
  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
