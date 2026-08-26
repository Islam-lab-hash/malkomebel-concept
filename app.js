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
})();
