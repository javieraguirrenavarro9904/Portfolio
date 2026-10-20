const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-menu');

if (menuToggle && menu) {
  const closeMenu = () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    menu.classList.toggle('open', !isOpen);
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.append(scrollProgress);

const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.type = 'button';
backToTop.setAttribute('aria-label', 'Volver arriba');
backToTop.innerHTML = '<span aria-hidden="true">↑</span>';
document.body.append(backToTop);

let scrollUpdateScheduled = false;
const updateScrollEffects = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  backToTop.classList.toggle('is-visible', window.scrollY > 450);
  scrollUpdateScheduled = false;
};

window.addEventListener('scroll', () => {
  if (scrollUpdateScheduled) return;
  scrollUpdateScheduled = true;
  window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });
window.addEventListener('resize', updateScrollEffects, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
updateScrollEffects();

const marqueeToggle = document.querySelector('#marquee-toggle');
const skillsLayout = document.querySelector('#skills-layout');

if (marqueeToggle && skillsLayout) {
  marqueeToggle.addEventListener('click', () => {
    const paused = skillsLayout.classList.toggle('marquees-paused');
    marqueeToggle.setAttribute('aria-pressed', String(paused));
    marqueeToggle.innerHTML = paused
      ? '<span aria-hidden="true">▶</span> Reanudar tiras'
      : '<span aria-hidden="true">Ⅱ</span> Pausar tiras';
  });
}

const marqueeStates = [...document.querySelectorAll('.tech-track')].map(track => ({
  track,
  viewport: track.parentElement,
  originalItems: [...track.querySelector('.tech-set').children].map(item => item.cloneNode(true)),
  width: -1
}));

const updateMarquees = () => {
  marqueeStates.forEach(state => {
    const viewportWidth = state.viewport.getBoundingClientRect().width;
    if (!viewportWidth || Math.abs(state.width - viewportWidth) < 0.5) return;

    const original = document.createElement('ul');
    original.className = 'tech-set';
    original.append(...state.originalItems.map(item => item.cloneNode(true)));
    state.track.replaceChildren(original);

    const contentWidth = original.getBoundingClientRect().width;
    const travelDistance = Math.max(0, contentWidth - viewportWidth);
    if (travelDistance === 0) {
      original.style.width = `${viewportWidth}px`;
      original.style.justifyContent = 'space-around';
    }

    state.viewport.classList.toggle('is-overflowing', travelDistance > 1);
    state.track.style.setProperty('--marquee-distance', `${-travelDistance}px`);
    state.track.style.setProperty('--marquee-duration', `${Math.max(8, travelDistance / 24)}s`);
    state.width = viewportWidth;
  });
};

const marqueeResizeObserver = new ResizeObserver(() => requestAnimationFrame(updateMarquees));
marqueeStates.forEach(({ viewport }) => marqueeResizeObserver.observe(viewport));
window.addEventListener('load', updateMarquees, { once: true });
updateMarquees();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll(
  '.hero-copy, .intro-card, .home-next-grid > div, .showcase-image, .showcase-copy, .home-link-card, ' +
  '.page-heading .wrap > *, .service-visual, .project-visual, ' +
  '.skill-group, .simple-card, .service-card, .process-item, .prose > *, .timeline-item, ' +
  '.note-box, .project-note, .experience-card, .contact-form, .contact-detail'
);

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  const revealDelays = new Map();

  revealTargets.forEach(element => {
    const parent = element.parentElement;
    const delay = revealDelays.get(parent) || 0;
    revealDelays.set(parent, Math.min(delay + 1, 5));
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${delay * 80}ms`);
    revealObserver.observe(element);
  });
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer && !reducedMotion) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--spot-x', `${x * 100}%`);
      card.style.setProperty('--spot-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(x - 0.5) * 4}deg`);
      card.style.setProperty('--tilt-y', `${(0.5 - y) * 4}deg`);
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
}

if (finePointer && !reducedMotion) {
  const cursor = document.createElement('span');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  document.body.classList.add('has-custom-cursor');

  window.addEventListener('pointermove', event => {
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursor.classList.add('is-visible');
    const target = event.target;
    cursor.classList.toggle(
      'is-hovering',
      target instanceof Element && Boolean(target.closest('a, button, input, textarea, select, [role="button"]'))
    );
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  document.documentElement.addEventListener('pointerenter', () => cursor.classList.add('is-visible'));
}
