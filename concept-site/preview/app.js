(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.reference-nav');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', (event) => {
      const item = event.target.closest('.nav-item');
      if (!item) return;
      item.setAttribute('aria-expanded', String(item.getAttribute('aria-expanded') !== 'true'));
    });
  }

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in');
        });
      }, { threshold: 0.08 })
    : null;

  document.querySelectorAll('section').forEach((section) => {
    if (io) io.observe(section);
    else section.classList.add('in');
  });

  const archiveSearch = document.querySelector('#archive-search');
  if (archiveSearch) {
    const items = [...document.querySelectorAll('.archive-list a')];
    archiveSearch.addEventListener('input', () => {
      const query = archiveSearch.value.trim().toLowerCase();
      items.forEach((item) => {
        item.hidden = Boolean(query) && !String(item.dataset.search || '').includes(query);
      });
      document.querySelectorAll('.archive-group').forEach((group) => {
        group.hidden = !group.querySelector('.archive-list a:not([hidden])');
      });
    });
  }

  const form = document.querySelector('#callback-form');
  const timeLabel = document.querySelector('#callback-time-label');
  const timeInput = document.querySelector('#callback-time');
  const status = document.querySelector('#form-status');

  if (form && timeLabel && timeInput) {
    const syncCallbackTime = () => {
      const scheduled = form.querySelector('input[name="callbackType"]:checked')?.value === 'scheduled';
      timeLabel.hidden = !scheduled;
      timeInput.disabled = !scheduled;
      timeInput.required = scheduled;
      if (!scheduled) timeInput.value = '';
    };

    form.querySelectorAll('input[name="callbackType"]').forEach((radio) => {
      radio.addEventListener('change', syncCallbackTime);
    });
    syncCallbackTime();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const scheduled = form.querySelector('input[name="callbackType"]:checked')?.value === 'scheduled';
      status.textContent = scheduled
        ? 'Заявка подготовлена. Мы перезвоним в выбранное время.'
        : 'Заявка подготовлена. Мы перезвоним вам в ближайшее время.';
      form.reset();
      syncCallbackTime();
    });
  }

  const catalogCards = [...document.querySelectorAll('.home-card')];
  catalogCards.forEach((card) => {
    const image = card.querySelector('img');
    if (!image) return;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    image.dataset.monoSrc = image.getAttribute('src');
    image.dataset.colorSrc = image.dataset.monoSrc.replace('/enhanced/', '/');

    const toggleColor = () => {
      const color = card.classList.toggle('is-color');
      image.src = color ? image.dataset.colorSrc : image.dataset.monoSrc;
      card.setAttribute('aria-pressed', String(color));
    };

    card.addEventListener('click', toggleColor);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleColor();
    });
  });

  const directionPanels = [...document.querySelectorAll('.direction-panel, .home-intro-media')];
  directionPanels.forEach((panel) => {
    const image = panel.querySelector('img');
    if (!image) return;
    panel.tabIndex = 0;
    panel.setAttribute('role', 'button');
    panel.setAttribute('aria-pressed', 'false');
    image.dataset.monoSrc = image.getAttribute('src');
    image.dataset.colorSrc = image.dataset.monoSrc.replace('/enhanced/', '/');

    const toggleColor = () => {
      const color = panel.classList.toggle('is-color');
      image.src = color ? image.dataset.colorSrc : image.dataset.monoSrc;
      panel.setAttribute('aria-pressed', String(color));
    };

    panel.addEventListener('click', toggleColor);
    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleColor();
    });
  });
})();
