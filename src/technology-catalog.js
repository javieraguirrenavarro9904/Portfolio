export const stacks = {
  frontend: {
    label: 'Frontend',
    description: 'Interfaces claras, accesibles y adaptables a cada pantalla.',
    technologies: [
      ['HTML5', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'],
      ['CSS3', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'],
      ['JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'],
      ['TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'],
      ['React', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'],
      ['Preact', 'https://cdn.simpleicons.org/preact/673AB8'],
      ['Next.js', 'https://cdn.simpleicons.org/nextdotjs/F0F6FC'],
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
      ['Node.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'],
      ['Express', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'],
      ['Socket.IO', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg']
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

export const projectTechnologies = {
  'Portfolio': [],
  'Oficina-Turismo-Italia': [],
  'FCT-v1': ['Preact', 'Node.js', 'Express', 'Socket.IO', 'MySQL']
};

const technologyNames = new Map([
  ...Object.values(stacks).flatMap(stack => stack.technologies)
].map(([name, icon]) => [name.toLowerCase(), { name, icon }]));

const githubLanguageAliases = new Map([
  ['html', 'HTML5'],
  ['css', 'CSS3'],
  ['dockerfile', 'Docker']
]);

export const getTechnologyName = technology => {
  const normalizedName = githubLanguageAliases.get(technology.toLowerCase()) || technology;
  return technologyNames.get(normalizedName.toLowerCase())?.name || normalizedName;
};

export const getTechnologyIcon = technology => {
  const normalizedName = getTechnologyName(technology);
  return technologyNames.get(normalizedName.toLowerCase())?.icon || '';
};
