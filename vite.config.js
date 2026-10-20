import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(projectRoot, 'index.html'),
        sobreMi: resolve(projectRoot, 'sobre-mi.html'),
        servicios: resolve(projectRoot, 'servicios.html'),
        tecnologias: resolve(projectRoot, 'tecnologias.html'),
        proyectos: resolve(projectRoot, 'proyectos.html'),
        contacto: resolve(projectRoot, 'contacto.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 4174,
    strictPort: true
  }
});
