// Website Worker: serves the React build and forwards /api/* to the balaji-api Worker.
// Same origin for site and API means login cookies work everywhere (including Safari).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (!env.API) {
        return Response.json({ error: { code: 'API_NOT_CONNECTED', message: 'API is not connected yet' } }, { status: 503 });
      }
      return env.API.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
