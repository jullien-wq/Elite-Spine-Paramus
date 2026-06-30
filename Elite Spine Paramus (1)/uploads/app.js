// Tiny interactivity layer for Elite Spine homepage.

(function () {
  // Scroll-state for nav blur/condense
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // FAQ accordion — single-open behavior
  const items = document.querySelectorAll('.faq__item');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  // Mobile menu drawer
  const burger = document.getElementById('navBurger');
  const mmenu = document.getElementById('mobileMenu');
  if (burger && mmenu) {
    const openMenu = () => {
      mmenu.classList.add('is-open');
      mmenu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };
    const closeMenu = () => {
      mmenu.classList.remove('is-open');
      mmenu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    burger.addEventListener('click', openMenu);
    mmenu.querySelectorAll('[data-mclose]').forEach((el) => {
      el.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mmenu.classList.contains('is-open')) closeMenu();
    });

    // Treatments submenu accordion
    const tgl = mmenu.querySelector('.mmenu__toggle');
    if (tgl) {
      const group = tgl.closest('.mmenu__group');
      tgl.addEventListener('click', () => {
        const open = group.classList.toggle('is-expanded');
        tgl.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  // Hero play card — open video lightbox
  const play = document.querySelector('.hero__playcard');
  if (play) {
    const VIDEO_SRC = 'https://video.wixstatic.com/video/6515c6_f890feae948d4adbb62bb43a4a5d2703/1080p/mp4/file.mp4';

    const lb = document.createElement('div');
    lb.className = 'vlb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Elite Spine video');
    lb.innerHTML =
      '<div class="vlb__inner">' +
        '<button class="vlb__close" type="button" aria-label="Close video">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<video class="vlb__video" controls playsinline preload="metadata">' +
          '<source src="' + VIDEO_SRC + '" type="video/mp4" />' +
        '</video>' +
      '</div>';
    document.body.appendChild(lb);

    const video = lb.querySelector('.vlb__video');
    let lastFocused = null;

    const openLb = () => {
      lastFocused = document.activeElement;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.vlb__close').focus();
      try { video.currentTime = 0; video.play(); } catch (e) {}
    };
    const closeLb = () => {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      video.pause();
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    play.addEventListener('click', (e) => { e.preventDefault(); openLb(); });
    lb.querySelector('.vlb__close').addEventListener('click', closeLb);
    lb.addEventListener('mousedown', (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
    });
  }

  // ==========================================================
  // FORMS → GOOGLE SHEET
  // Paste your Apps Script Web App URL between the quotes below.
  // (See setup instructions / SHEET-SETUP.md). Until it's filled
  // in, forms still validate and show the success state, but no
  // data is transmitted.
  // ==========================================================
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwvpP6t2vKnA2xpA-hm3JaEg4mzE7Jo9-V6d4DSAUDqXudpjNqrDIaSv1DRlalRhe8xrg/exec';

  function sendToSheet(form) {
    if (!SHEET_ENDPOINT) return Promise.resolve();
    const data = new URLSearchParams();
    // Tab name comes from the form's data-sheet-tab attribute
    data.append('_tab', form.getAttribute('data-sheet-tab') || 'Submissions');
    data.append('_source', location.pathname.split('/').pop() || 'index.html');
    new FormData(form).forEach((value, key) => {
      if (key.charAt(0) !== '_') data.append(key, value);
    });
    return fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: data.toString()
    });
  }

  // Appointment / contact form validation (handles every form on the page)
  document.querySelectorAll('.cform__form').forEach((form) => {
    const showError = (field, msg) => {
      field.classList.add('is-invalid');
      const err = field.querySelector('[data-err]');
      if (err) err.textContent = msg;
    };
    const clearError = (field) => {
      field.classList.remove('is-invalid');
      const err = field.querySelector('[data-err]');
      if (err) err.textContent = '';
    };
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const phoneOk = (v) => (v.replace(/\D/g, '').length >= 10);

    const validateField = (input) => {
      const field = input.closest('.field');
      if (!field) return true;
      const val = input.value.trim();
      if (input.hasAttribute('required') && !val) {
        showError(field, 'This field is required.');
        return false;
      }
      if (input.type === 'email' && val && !emailOk(val)) {
        showError(field, 'Please enter a valid email address.');
        return false;
      }
      if (input.type === 'tel' && val && !phoneOk(val)) {
        showError(field, 'Please enter a valid phone number.');
        return false;
      }
      clearError(field);
      return true;
    };

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field && field.classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      let ok = true;
      let firstBad = null;
      inputs.forEach((input) => {
        if (!validateField(input)) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      const btn = form.querySelector('button[type="submit"]');
      const success = form.querySelector('.cform__success');
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }

      const reveal = () => {
        if (success) success.hidden = false;
        form.reset();
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      };
      // Send to Sheet (fire-and-forget, optimistic UI), then confirm
      sendToSheet(form).then(reveal).catch(reveal);
    });
  });
})();
