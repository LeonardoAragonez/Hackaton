// Stub para Jest: shared-catalog re-exporta handlers que importan msw, que requiere
// Web APIs (Request/fetch). En entorno de pruebas Node/jsdom no se usan handlers reales,
// así que devolvemos APIs vacías compatibles con http.get/post/HttpResponse.json.
const httpMethod = () => ({ handler: 'noop' });
const http = new Proxy({}, { get: () => httpMethod });

const HttpResponse = {
  json: (body, init) => ({ body, init }),
  text: (body, init) => ({ body, init }),
};

const delay = () => Promise.resolve();

module.exports = { http, HttpResponse, delay };
