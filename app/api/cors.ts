export const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS";
export const DEFAULT_ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Goog-Api-Key, X-Base-Url";

function configuredOrigins() {
  return new Set(
    (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function buildCorsHeaders(request: Request): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": DEFAULT_ALLOWED_METHODS,
    "Access-Control-Allow-Headers": DEFAULT_ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
  });
  const origin = request.headers.get("Origin");

  if (origin && configuredOrigins().has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  return headers;
}

export function withCors(response: Response, request: Request): Response {
  buildCorsHeaders(request).forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsPreflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}
