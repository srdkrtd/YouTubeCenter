const numberFormatter = new Intl.NumberFormat('tr-TR');

const formatClock = (value) => {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const syncBedtimeLabel = (() => {
  const bedtimeInput = document.querySelector('#bedtime');
  const bedtimeValue = document.querySelector('#bedtimeValue');

  if (!bedtimeInput || !bedtimeValue) {
    return () => {};
  }

  const update = () => {
    bedtimeValue.textContent = formatClock(Number(bedtimeInput.value));
  };

  bedtimeInput.addEventListener('input', update);
  update();
  return update;
})();

const setupRuleForm = () => {
  const form = document.querySelector('#ruleForm');
  const list = document.querySelector('[data-rule-list]');
  if (!form || !list) return;

  const createRuleRow = (name, device, bedtime) => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = name;
    const deviceSpan = document.createElement('span');
    deviceSpan.textContent = device;
    info.append(title, deviceSpan);

    const bedtimeSpan = document.createElement('span');
    bedtimeSpan.textContent = `Uyku: ${bedtime}`;

    li.append(info, bedtimeSpan);
    li.classList.add('is-new');
    setTimeout(() => li.classList.remove('is-new'), 1500);
    return li;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = form.querySelector('#ruleName');
    const deviceSelect = form.querySelector('#ruleDevice');
    const bedtimeInput = form.querySelector('#bedtime');
    const name = nameInput?.value.trim();
    if (!name) return;
    const device = deviceSelect?.value ?? 'Genel';
    const bedtime = formatClock(Number(bedtimeInput?.value ?? 21));

    const newRule = createRuleRow(name, device, bedtime);
    list.prepend(newRule);
    form.reset();
    requestAnimationFrame(syncBedtimeLabel);
  });
};

const setupToggles = () => {
  document.querySelectorAll('[data-toggle]').forEach((toggle) => {
    const button = toggle.querySelector('button');
    if (!button) return;
    button.addEventListener('click', () => {
      const isActive = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!isActive));
      button.textContent = isActive ? 'Kapalı' : 'Açık';
      toggle.classList.toggle('toggle--off', isActive);
    });
  });
};

const setupFaq = () => {
  const items = document.querySelectorAll('.faq__item');
  items.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;
    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherButton = other.querySelector('button');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });
};

const animateNumbers = () => {
  const counters = document.querySelectorAll('[data-rolling-number]');
  const animate = (el) => {
    if (el.dataset.animated === 'true') return;
    const target = Number(el.dataset.rollingNumber);
    if (!Number.isFinite(target)) return;
    el.dataset.animated = 'true';
    const suffix = el.dataset.suffix ?? '';
    const duration = 1200;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.round(target * progress);
      el.textContent = `${numberFormatter.format(value)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (typeof IntersectionObserver === 'undefined') {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

syncBedtimeLabel();
setupRuleForm();
setupToggles();
setupFaq();
animateNumbers();
