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

const githubProjects = document.querySelector('[data-github-projects]');
const githubStatus = document.querySelector('[data-github-status]');

if (githubProjects && githubStatus) {
  const githubUsername = 'javieraguirrenavarro9904';
  const projectsUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=pushed`;

  const loadGithubProjects = async () => {
    try {
      const response = await fetch(projectsUrl, {
        headers: { Accept: 'application/vnd.github+json' }
      });

      if (!response.ok) {
        throw new Error(`GitHub respondió con el estado ${response.status}.`);
      }

      const repositories = await response.json();
      if (!Array.isArray(repositories)) {
        throw new Error('La respuesta de GitHub no contiene una lista de repositorios.');
      }

      const ownRepositories = repositories.filter(repository => !repository.fork);

      if (ownRepositories.length === 0) {
        githubStatus.textContent = 'Todavía no hay repositorios públicos para mostrar.';
        return;
      }

      const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });
      const cards = ownRepositories.map(repository => {
        const card = document.createElement('article');
        card.className = 'project-card';

        const title = document.createElement('h3');
        const repositoryLink = document.createElement('a');
        repositoryLink.href = repository.html_url;
        repositoryLink.target = '_blank';
        repositoryLink.rel = 'noopener noreferrer';
        repositoryLink.textContent = repository.name;
        title.append(repositoryLink);

        const description = document.createElement('p');
        description.className = 'project-card-description';
        description.textContent = repository.description || 'Repositorio público de GitHub sin descripción.';

        const details = document.createElement('div');
        details.className = 'project-card-details';

        const language = document.createElement('span');
        language.textContent = repository.language || 'Lenguaje no especificado';
        details.append(language);

        if (repository.pushed_at) {
          const updated = document.createElement('span');
          updated.textContent = `Actualizado ${dateFormatter.format(new Date(repository.pushed_at))}`;
          details.append(updated);
        }

        const link = document.createElement('a');
        link.className = 'project-card-link';
        link.href = repository.html_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Ver código';
        link.setAttribute('aria-label', `Ver el código de ${repository.name} en GitHub`);

        card.append(title, description, details, link);
        return card;
      });

      githubProjects.replaceChildren(...cards);
      githubStatus.textContent = `${ownRepositories.length} ${ownRepositories.length === 1 ? 'proyecto público' : 'proyectos públicos'} cargados desde GitHub.`;
    } catch (error) {
      githubStatus.textContent = 'No se pudieron cargar los proyectos de GitHub. Puedes verlos directamente en mi perfil.';
      console.error('Error al cargar los repositorios públicos de GitHub:', error);
    }
  };

  loadGithubProjects();
}

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

const marqueeSpeed = 28;
const marqueeStates = [...document.querySelectorAll('.tech-track')].map((track, index) => {
  const viewport = track.parentElement;
  const list = track.querySelector('.tech-set');
  const state = {
    track,
    viewport,
    list,
    items: [...list.children],
    widths: [],
    viewportWidth: 0,
    padding: 18,
    gap: 0,
    offset: 0,
    direction: index % 2 === 0 ? -1 : 1,
    hovered: false
  };

  viewport.addEventListener('pointerenter', () => { state.hovered = true; });
  viewport.addEventListener('pointerleave', () => { state.hovered = false; });
  return state;
});

const updateMarquees = () => {
  marqueeStates.forEach(state => {
    const viewportWidth = state.viewport.getBoundingClientRect().width;
    if (!viewportWidth) return;

    state.viewportWidth = viewportWidth;
    state.padding = parseFloat(getComputedStyle(state.list).paddingLeft) || 0;
    state.widths = state.items.map(item => item.getBoundingClientRect().width);
    const itemsWidth = state.widths.reduce((total, width) => total + width, 0);
    const defaultGap = parseFloat(getComputedStyle(state.list).columnGap) || 0;
    const largestItem = Math.max(...state.widths);
    const minimumGap = state.items.length > 1
      ? (viewportWidth + largestItem - itemsWidth - state.padding * 2) / (state.items.length - 1)
      : defaultGap;

    state.gap = Math.max(defaultGap, minimumGap);
    state.list.style.gap = `${state.gap}px`;
    const lastStart = state.padding +
      state.widths.slice(0, -1).reduce((total, width) => total + width, 0) +
      state.gap * (state.widths.length - 1);
    state.offset = state.direction > 0 ? viewportWidth - lastStart : 0;
    state.track.style.transform = `translate3d(${state.offset}px, 0, 0)`;
    state.viewport.classList.add('is-overflowing');
  });
};

let previousMarqueeFrame = 0;

const animateMarquees = timestamp => {
  const elapsed = previousMarqueeFrame
    ? Math.min((timestamp - previousMarqueeFrame) / 1000, 0.05)
    : 0;
  previousMarqueeFrame = timestamp;

  if (!reducedMotion && !document.hidden) {
    marqueeStates.forEach(state => {
      if (skillsLayout?.classList.contains('marquees-paused') || state.hovered || !state.viewportWidth) return;

      state.offset += state.direction * marqueeSpeed * elapsed;

      if (state.direction < 0) {
        const firstWidth = state.widths[0];
        if (state.offset <= -(state.padding + firstWidth)) {
          state.items.push(state.items.shift());
          state.widths.push(state.widths.shift());
          state.list.append(state.items[state.items.length - 1]);
          state.offset += firstWidth + state.gap;
        }
      } else {
        const lastIndex = state.widths.length - 1;
        const lastStart = state.padding +
          state.widths.slice(0, lastIndex).reduce((total, width) => total + width, 0) +
          state.gap * lastIndex;
        if (state.offset > state.viewportWidth - lastStart) {
          const lastWidth = state.widths.pop();
          state.widths.unshift(lastWidth);
          state.items.unshift(state.items.pop());
          state.list.prepend(state.items[0]);
          state.offset -= lastWidth + state.gap;
        }
      }

      state.track.style.transform = `translate3d(${state.offset}px, 0, 0)`;
    });
  }

  requestAnimationFrame(animateMarquees);
};

if (marqueeStates.length) {
  const marqueeResizeObserver = new ResizeObserver(() => requestAnimationFrame(updateMarquees));
  marqueeStates.forEach(({ viewport }) => marqueeResizeObserver.observe(viewport));
  window.addEventListener('load', updateMarquees, { once: true });
  document.addEventListener('visibilitychange', () => { previousMarqueeFrame = 0; });
  updateMarquees();
  requestAnimationFrame(animateMarquees);
}

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
