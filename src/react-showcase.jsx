import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const stacks = {
  frontend: {
    label: 'Frontend',
    description: 'Interfaces claras, accesibles y adaptables a cada pantalla.',
    technologies: [
      ['HTML5', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'],
      ['CSS3', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'],
      ['JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'],
      ['React', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'],
      ['Astro', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg'],
      ['Angular', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg']
    ]
  },
  backend: {
    label: 'Backend',
    description: 'Lógica, servicios y conexiones para dar vida a una aplicación.',
    technologies: [
      ['PHP', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg'],
      ['Laravel', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg'],
      ['Java', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg'],
      ['Node.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg']
    ]
  },
  datos: {
    label: 'Datos',
    description: 'Almacenamiento y consulta de información para cada proyecto.',
    technologies: [
      ['MySQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'],
      ['MariaDB', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg'],
      ['PostgreSQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'],
      ['SQL Server', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-original.svg']
    ]
  },
  herramientas: {
    label: 'Herramientas',
    description: 'Herramientas para desarrollar, probar y publicar sitios.',
    technologies: [
      ['Git', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'],
      ['GitHub', 'https://cdn.simpleicons.org/github/F0F6FC'],
      ['VS Code', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg'],
      ['Docker', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'],
      ['Postman', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg'],
      ['AWS', 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/aws.svg'],
      ['Vercel', 'https://cdn.simpleicons.org/vercel/F0F0F0']
    ]
  }
};

function StackExplorer() {
  const [activeStack, setActiveStack] = useState('frontend');
  const [query, setQuery] = useState('');
  const selected = stacks[activeStack];
  const visibleTechnologies = useMemo(
    () => selected.technologies.filter(([name]) => name.toLowerCase().includes(query.trim().toLowerCase())),
    [query, selected]
  );

  return (
    <section className="react-explorer" aria-labelledby="react-explorer-title">
      <div className="react-explorer-heading">
        <div>
          <p className="eyebrow">UN POCO MÁS INTERACTIVO</p>
          <h2 id="react-explorer-title">Explora mi stack</h2>
          <p>Elige una categoría y descubre las herramientas que aparecen en mi recorrido.</p>
        </div>
      </div>
      <div className="stack-tabs" role="group" aria-label="Categorías de tecnologías">
        {Object.entries(stacks).map(([key, stack]) => (
          <button
            aria-pressed={activeStack === key}
            className={`stack-tab${activeStack === key ? ' is-active' : ''}`}
            id={`stack-tab-${key}`}
            key={key}
            onClick={() => {
              setActiveStack(key);
              setQuery('');
            }}
            type="button"
          >
            {stack.label}
          </button>
        ))}
      </div>
      <label className="stack-search">
        <span>Filtrar esta categoría</span>
        <input
          autoComplete="off"
          onChange={event => setQuery(event.target.value)}
          placeholder={`Buscar en ${selected.label.toLowerCase()}…`}
          type="search"
          value={query}
        />
        <span className="stack-result-count" aria-live="polite">
          {visibleTechnologies.length} {visibleTechnologies.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </label>
      <div
        aria-labelledby={`stack-tab-${activeStack}`}
        className="stack-panel"
        key={activeStack}
        role="region"
      >
        <p className="stack-panel-description">{selected.description}</p>
        <div className="stack-chip-grid">
          {visibleTechnologies.map(([name, icon]) => (
            <div className="stack-chip" key={name}>
              <img alt="" aria-hidden="true" loading="lazy" src={icon} />
              <span>{name}</span>
            </div>
          ))}
          {visibleTechnologies.length === 0 && (
            <p className="stack-empty">No hay tecnologías con ese nombre en esta categoría.</p>
          )}
        </div>
      </div>
    </section>
  );
}

const root = document.getElementById('react-stack-explorer');
if (root) {
  const appRoot = import.meta.hot?.data.reactRoot || createRoot(root);
  if (import.meta.hot) import.meta.hot.data.reactRoot = appRoot;
  appRoot.render(<StackExplorer />);
}
