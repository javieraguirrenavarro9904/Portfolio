import {
  getTechnologyIcon,
  getTechnologyName,
  projectTechnologies
} from '../../src/technology-catalog.js';

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
  githubProjects.setAttribute('aria-busy', 'true');

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

      const languageResults = await Promise.all(ownRepositories.map(async repository => {
        try {
          const languageResponse = await fetch(repository.languages_url, {
            headers: { Accept: 'application/vnd.github+json' }
          });

          if (!languageResponse.ok) {
            throw new Error(`GitHub respondió con el estado ${languageResponse.status}.`);
          }

          const languages = await languageResponse.json();
          if (!languages || typeof languages !== 'object' || Array.isArray(languages)) {
            throw new Error('La respuesta de GitHub no contiene un mapa de lenguajes.');
          }

          const entries = Object.entries(languages)
            .filter(([, bytes]) => typeof bytes === 'number' && bytes > 0)
            .sort((first, second) => second[1] - first[1]);
          const totalBytes = entries.reduce((total, [, bytes]) => total + bytes, 0);

          return {
            languages: entries.map(([name, bytes]) => ({
              name: getTechnologyName(name),
              percentage: Math.round((bytes / totalBytes) * 100)
            })),
            failed: false
          };
        } catch (error) {
          console.error(`Error al cargar los lenguajes de ${repository.name}:`, error);
          return {
            languages: repository.language
              ? [{ name: repository.language, percentage: null }]
              : [],
            failed: true
          };
        }
      }));

      const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });
      const cards = ownRepositories.map((repository, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';

        const cover = document.createElement('img');
        cover.className = `project-card-cover${repository.name === 'FCT-v1' ? ' project-card-cover-fct' : ''}`;
        cover.src = `images/projects/${encodeURIComponent(repository.name)}.jpg`;
        cover.alt = `Portada del proyecto ${repository.name}`;
        cover.loading = 'lazy';
        cover.decoding = 'async';
        cover.addEventListener('error', () => cover.remove(), { once: true });

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

        const projectLanguages = document.createElement('div');
        projectLanguages.className = 'project-tech-grid';
        projectLanguages.setAttribute('role', 'list');
        projectLanguages.setAttribute('aria-label', `Tecnologías utilizadas en ${repository.name}`);

        const seenTechnologies = new Set();
        const technologies = [
          ...languageResults[index].languages,
          ...(projectTechnologies[repository.name] || []).map(name => ({
            name: getTechnologyName(name),
            percentage: null
          }))
        ].filter(technology => {
          const key = technology.name.toLowerCase();
          if (seenTechnologies.has(key)) return false;
          seenTechnologies.add(key);
          return true;
        });

        technologies.forEach(({ name, percentage }) => {
          const technology = document.createElement('span');
          technology.className = 'stack-chip project-tech-chip';
          technology.setAttribute('role', 'listitem');

          const iconUrl = getTechnologyIcon(name);
          if (iconUrl) {
            const icon = document.createElement('img');
            icon.src = iconUrl;
            icon.alt = '';
            icon.setAttribute('aria-hidden', 'true');
            icon.loading = 'lazy';
            icon.addEventListener('error', () => icon.remove(), { once: true });
            technology.append(icon);
          }

          const label = document.createElement('span');
          label.textContent = name;
          technology.append(label);

          if (percentage !== null) {
            const share = document.createElement('small');
            share.className = 'project-tech-share';
            share.textContent = `${percentage}%`;
            technology.title = `${name}: ${percentage}% del código detectado por GitHub`;
            technology.append(share);
          }

          projectLanguages.append(technology);
        });

        if (technologies.length === 0) {
          const noLanguages = document.createElement('p');
          noLanguages.className = 'project-tech-empty';
          noLanguages.textContent = 'Añade tecnologías manuales en technology-catalog.js para este proyecto.';
          projectLanguages.append(noLanguages);
        }

        const details = document.createElement('div');
        details.className = 'project-card-details';

        if (repository.stargazers_count > 0) {
          const stars = document.createElement('span');
          stars.textContent = `★ ${repository.stargazers_count.toLocaleString('es-ES')}`;
          stars.setAttribute('aria-label', `${repository.stargazers_count} estrellas en GitHub`);
          details.append(stars);
        }

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
        link.textContent = 'Ver código en GitHub';
        link.setAttribute('aria-label', `Ver el código de ${repository.name} en GitHub`);

        card.append(cover, title, description, projectLanguages, details, link);
        return card;
      });

      githubProjects.replaceChildren(...cards);
      const failedLanguageRequests = languageResults.filter(result => result.failed).length;
      const loadedText = `${ownRepositories.length} ${ownRepositories.length === 1 ? 'proyecto público' : 'proyectos públicos'} cargados desde GitHub.`;
      githubStatus.textContent = failedLanguageRequests
        ? `${loadedText} No se pudieron consultar los lenguajes de ${failedLanguageRequests} ${failedLanguageRequests === 1 ? 'proyecto' : 'proyectos'}.`
        : loadedText;
    } catch (error) {
      githubStatus.textContent = 'No se pudieron cargar los proyectos de GitHub. Puedes verlos directamente en mi perfil.';
      console.error('Error al cargar los repositorios públicos de GitHub:', error);
    } finally {
      githubProjects.setAttribute('aria-busy', 'false');
    }
  };

  loadGithubProjects();
}

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('role', 'progressbar');
scrollProgress.setAttribute('aria-label', 'Progreso de lectura');
scrollProgress.setAttribute('aria-valuemin', '0');
scrollProgress.setAttribute('aria-valuemax', '100');
scrollProgress.setAttribute('aria-valuenow', '0');

const scrollProgressTrack = document.createElement('span');
scrollProgressTrack.className = 'scroll-progress-track';
scrollProgressTrack.setAttribute('aria-hidden', 'true');
const scrollProgressFill = document.createElement('span');
scrollProgressFill.className = 'scroll-progress-fill';
scrollProgressFill.setAttribute('aria-hidden', 'true');
const scrollProgressRocket = document.createElement('span');
scrollProgressRocket.className = 'scroll-progress-rocket';
scrollProgressRocket.setAttribute('aria-hidden', 'true');
scrollProgressRocket.textContent = '🚀';
scrollProgress.append(scrollProgressTrack, scrollProgressFill, scrollProgressRocket);
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
  const progress = scrollableHeight > 0
    ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
    : 0;
  scrollProgress.style.setProperty('--scroll-progress', `${progress * 100}%`);
  scrollProgress.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  backToTop.classList.toggle('is-visible', window.scrollY > 450);
  scrollUpdateScheduled = false;
};

window.addEventListener('scroll', () => {
  if (scrollUpdateScheduled) return;
  scrollUpdateScheduled = true;
  window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });
window.addEventListener('resize', () => {
  updateScrollEffects();
}, { passive: true });
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
  '.skill-group, .simple-card, .service-card, .process-item, .prose > *, .timeline-item, .experience-timeline-item, ' +
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
