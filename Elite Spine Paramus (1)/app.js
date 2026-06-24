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

  // Smooth-scroll anchor handling already via CSS scroll-behavior; nothing extra.
})();
