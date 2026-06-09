import { buildCorsHeaders } from "../app/api/cors";

const ORIGINAL_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;

function requestWithOrigin(origin?: string) {
  return {
    headers: new Headers(origin ? { Origin: origin } : undefined),
  } as Request;
}

describe("buildCorsHeaders", () => {
  afterEach(() => {
    process.env.ALLOWED_ORIGINS = ORIGINAL_ALLOWED_ORIGINS;
  });

  test("does not set Access-Control-Allow-Origin when no origins are configured", () => {
    delete process.env.ALLOWED_ORIGINS;

    const headers = buildCorsHeaders(requestWithOrigin("https://app.test"));

    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  test("echoes configured origin and sets Vary Origin", () => {
    process.env.ALLOWED_ORIGINS = "https://app.test, https://admin.test";

    const headers = buildCorsHeaders(requestWithOrigin("https://app.test"));

    expect(headers.get("Access-Control-Allow-Origin")).toBe("https://app.test");
    expect(headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(headers.get("Vary")).toBe("Origin");
  });

  test("rejects unconfigured origin", () => {
    process.env.ALLOWED_ORIGINS = "https://app.test";

    const headers = buildCorsHeaders(requestWithOrigin("https://evil.test"));

    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});
