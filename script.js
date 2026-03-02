(() => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  const year = document.querySelector('#year');

  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile menu toggle
  if (btn && nav) {
    const close = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    // Close when clicking a link (mobile)
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) close();
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Close if resizing to desktop
    const mq = window.matchMedia('(min-width: 900px)');
    mq.addEventListener('change', () => {
      if (mq.matches) close();
    });
  }
})();
