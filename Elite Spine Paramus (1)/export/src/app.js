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

  // Hero play card — soft pulse on view
  const play = document.querySelector('.hero__playcard');
  if (play) {
    play.addEventListener('click', (e) => {
      e.preventDefault();
      play.animate(
        [{ transform: 'translateY(-30%) scale(1)' }, { transform: 'translateY(-30%) scale(0.97)' }, { transform: 'translateY(-30%) scale(1)' }],
        { duration: 260, easing: 'ease-out' }
      );
    });
  }

  // Smooth-scroll anchor handling already via CSS scroll-behavior; nothing extra.
})();
