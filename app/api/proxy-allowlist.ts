const BUILT_IN_PROXY_ORIGINS = new Set([
  "https://api.openai.com",
  "https://generativelanguage.googleapis.com",
  "https://api.deepseek.com",
  "https://dashscope.aliyuncs.com",
]);

const AZURE_OPENAI_ORIGIN = /^https:\/\/[a-z0-9-]+\.openai\.azure\.com$/;

function configuredProxyOrigins() {
  return new Set(
    (process.env.ALLOWED_PROXY_ORIGINS ?? "")
      .split(",")
      .map((rawOrigin) => {
        try {
          return new URL(rawOrigin.trim()).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
}

export function resolveAllowedProxyBaseUrl(
  rawBaseUrl: string | null,
): string | null {
  if (!rawBaseUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(rawBaseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }

  const origin = url.origin;
  if (
    BUILT_IN_PROXY_ORIGINS.has(origin) ||
    AZURE_OPENAI_ORIGIN.test(origin) ||
    configuredProxyOrigins().has(origin)
  ) {
    return origin;
  }

  return null;
}
