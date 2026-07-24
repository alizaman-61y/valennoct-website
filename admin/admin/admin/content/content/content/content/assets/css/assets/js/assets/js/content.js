document.addEventListener('DOMContentLoaded', async () => {
  // Load Site Configuration Settings globally
  try {
    const res = await fetch('/content/site.json');
    if (res.ok) {
      const site = await res.json();
      applySiteSettings(site);
    }
  } catch (err) {
    console.warn('Site ayarları yüklenemedi, varsayılanlar aktif:', err);
  }

  // Page Specific Handlers
  const path = window.location.pathname;

  if (path.endsWith('index.html') || path === '/') {
    loadHomeData();
  } else if (path.includes('projeler.html')) {
    loadProjectsData();
  } else if (path.includes('hakkinda.html')) {
    loadAboutData();
  } else if (path.includes('portfolyo.html')) {
    loadPortfolioData();
  } else if (path.includes('magaza.html')) {
    loadShopData();
  } else if (path.includes('iletisim.html')) {
    initContactForm();
  }
});

function applySiteSettings(site) {
  if (site.accentColor) {
    document.documentElement.style.setProperty('--accent-color', site.accentColor);
  }
  
  // Footer elements
  const slogan = document.getElementById('footer-slogan');
  if (slogan && site.footerSlogan) slogan.textContent = site.footerSlogan;

  const instaLinks = document.querySelectorAll('.insta-link');
  if (site.instagram) {
    instaLinks.forEach(a => a.href = site.instagram);
  }
}

async function loadHomeData() {
  try {
    const res = await fetch('/content/site.json');
    if (!res.ok) return;
    const site = await res.json();

    const heroImg = document.getElementById('hero-img');
    if (heroImg) {
      const isMobile = window.innerWidth <= 768;
      heroImg.src = isMobile ? (site.heroMobile || site.heroDesktop) : site.heroDesktop;
    }

    const aboutText = document.getElementById('home-about-text');
    if (aboutText && site.aboutText) aboutText.textContent = site.aboutText;
    
    const areas = document.getElementById('home-work-areas');
    if (areas && site.workAreas) areas.textContent = site.workAreas;

    const progs = document.getElementById('home-programs');
    if (progs && site.programs) progs.textContent = site.programs;

    const year = document.getElementById('home-foundation');
    if (year && site.foundationYear) year.textContent = site.foundationYear;

  } catch (e) {
    console.error("Ana sayfa verisi okunamadı:", e);
  }
}

async function loadProjectsData() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    const res = await fetch('/content/projects.json');
    const data = await res.json();
    const items = (data.items || []).filter(p => p.status === 'published').sort((a,b) => a.order - b.order);

    if (items.length === 0) {
      container.innerHTML = '<p>Henüz yayımlanmış proje bulunmuyor.</p>';
      return;
    }

    container.innerHTML = items.map(p => `
      <article class="project-card reveal-on-scroll">
        <a href="${p.openInNewTab ? p.coverImage : '#'}" ${p.openInNewTab ? 'target="_blank"' : ''}>
          <div class="project-cover-wrap">
            <img src="${p.coverImage}" alt="${p.title}" class="project-cover" loading="lazy" />
          </div>
          <div class="project-meta-head" style="margin-top: 10px;">
            <span>${p.category || 'MİMARLIK'}</span>
            <span>${p.year} / ${p.location}</span>
          </div>
          <h3 class="portfolio-name" style="margin-top: 5px;">${p.title}</h3>
          <p style="font-size: 0.85rem; color: #555; margin-top: 5px;">${p.shortDesc || ''}</p>
        </a>
      </article>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>Projeler yüklenirken bir hata oluştu.</p>';
  }
}

async function loadAboutData() {
  try {
    const res = await fetch('/content/site.json');
    const site = await res.json();

    const title = document.getElementById('about-page-title');
    const text = document.getElementById('about-page-text');
    if (title) title.textContent = site.aboutTitle || 'HAKKIMDA';
    if (text) text.textContent = site.aboutText;

    const areas = document.getElementById('about-areas');
    if (areas) areas.textContent = site.workAreas;

    const progs = document.getElementById('about-programs');
    if (progs) progs.textContent = site.programs;

    const year = document.getElementById('about-year');
    if (year) year.textContent = site.foundationYear;
  } catch (e) {
    console.error(e);
  }
}

async function loadPortfolioData() {
  const container = document.getElementById('portfolio-container');
  if (!container) return;

  try {
    const res = await fetch('/content/portfolio.json');
    const data = await res.json();
    const items = (data.items || []).sort((a,b) => a.pageOrder - b.pageOrder);

    if (items.length === 0) {
      container.innerHTML = '<p>Portfolyo öğesi bulunamadı.</p>';
      return;
    }

    container.innerHTML = items.map(item => {
      if (item.isSpreading && item.coverImage) {
        return `
          <div class="portfolio-item reveal-on-scroll">
            <div class="portfolio-row">
              <span class="portfolio-no">${item.projectNo}</span>
              <span class="portfolio-name">${item.title}</span>
            </div>
            <div class="book-container" onclick="openFullscreen('${item.coverImage}')">
              <div class="book-panel book-panel-left" style="background-image: url('${item.coverImage}');"></div>
              <div class="book-panel book-panel-right" style="background-image: url('${item.coverImage}');"></div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="portfolio-item reveal-on-scroll">
            <div class="portfolio-row" onclick="openFullscreen('${item.coverImage}')" style="cursor:pointer;">
              <span class="portfolio-no">${item.projectNo}</span>
              <span class="portfolio-name">${item.title}</span>
            </div>
          </div>
        `;
      }
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Portfolyo yüklenemedi.</p>';
  }
}

function openFullscreen(imgSrc) {
  const modal = document.getElementById('fullscreen-modal');
  const img = document.getElementById('modal-img');
  if (modal && img) {
    img.src = imgSrc;
    modal.classList.add('active');
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fullscreen-modal');
  if (modal) modal.classList.remove('active');
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let siteEmail = 'info@valennoct.com';
    try {
      const res = await fetch('/content/site.json');
      const site = await res.json();
      if (site.email) siteEmail = site.email;
    } catch(err){}

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const message = document.getElementById('form-message').value;

    const subject = encodeURIComponent(`VALENNOCT İletişim Formu: ${name}`);
    const body = encodeURIComponent(`İsim: ${name}\nE-Posta: ${email}\n\nMesaj:\n${message}`);

    window.location.href = `mailto:${siteEmail}?subject=${subject}&body=${body}`;
  });
}
