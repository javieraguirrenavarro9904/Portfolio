import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { stacks } from './technology-catalog.js';

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
