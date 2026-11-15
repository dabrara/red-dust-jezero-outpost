/**
 * StarSprout is a static single-page game. This Worker serves the built assets
 * and falls back to index.html for unknown non-file paths, so links never 404.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    const isFileRequest = url.pathname.includes(".");
    if (
      response.status === 404 &&
      (request.method === "GET" || request.method === "HEAD") &&
      !isFileRequest
    ) {
      const indexUrl = new URL("/index.html", url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};
