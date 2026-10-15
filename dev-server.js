const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Método no permitido');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end('Solicitud no válida');
    return;
  }

  if (pathname.split('/').includes('.git')) {
    response.writeHead(404);
    response.end('No encontrado');
    return;
  }

  const requestedPath = path.resolve(root, `.${pathname}`);
  const relativePath = path.relative(root, requestedPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end('Acceso denegado');
    return;
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError) {
      response.writeHead(404);
      response.end('No encontrado');
      return;
    }

    const filePath = stats.isDirectory() ? path.join(requestedPath, 'index.html') : requestedPath;
    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        response.writeHead(404);
        response.end('No encontrado');
        return;
      }

      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Length': data.length,
        'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : data);
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio disponible en http://127.0.0.1:${port}`);
  console.log('Pulsa Ctrl+C para detener el servidor.');
});
