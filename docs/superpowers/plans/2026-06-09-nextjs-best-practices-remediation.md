# Next.js Best Practices Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring QuanAIChat closer to current Next.js 16 App Router production best practices while preserving the existing chat, auth, settings, artifact, MCP market, and SD flows.

**Architecture:** Do the low-risk production hygiene first, then migrate routing in two stages. Security-sensitive API behavior moves into small tested helpers; UI routing moves from React Router to Next route files behind a local navigation adapter so component churn stays controlled.

**Tech Stack:** Next.js 16.2.6 App Router, React 19, TypeScript 5.9, Jest via `next/jest`, ESLint flat config, Tailwind utility classes.

---

## Required Docs Before Coding

The repo requires reading installed Next docs before any Next.js work. At the start of each implementation session, read these files:

- `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`

Run:

```bash
sed -n '1,220p' node_modules/next/dist/docs/01-app/02-guides/production-checklist.md
sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md
sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
sed -n '1,160p' node_modules/next/dist/docs/01-app/01-getting-started/12-images.md
```

Expected: all files exist and describe the current installed Next version.

## File Structure

- Modify `package.json`: replace the broken `next lint` script with direct ESLint.
- Modify `eslint.config.mjs`: re-enable image linting after eligible raw image usages are addressed or explicitly documented.
- Create `app/components/app-loading.tsx`: shared loading UI that does not import the full app shell.
- Create `app/loading.tsx`: route-level loading UI.
- Create `app/error.tsx`: Next route error boundary.
- Create `app/not-found.tsx`: Next 404 UI.
- Modify `app/layout.tsx`: remove duplicate viewport meta, move manifest into Metadata API, use `next/script`, and later wrap routes in app providers.
- Create `app/api/cors.ts`: per-request CORS helper.
- Create `app/api/proxy-allowlist.ts`: validate generic proxy upstream origins.
- Modify `app/api/proxy.ts`: reject missing/disallowed `x-base-url` before fetching.
- Modify `app/api/google.ts`, `app/api/deepseek.ts`, `app/api/config/route.ts`, `app/api/artifacts/route.ts`: apply shared CORS helper where cross-origin support is intentionally kept.
- Modify `next.config.mjs`: remove wildcard API CORS headers from global config.
- Create `test/api-cors.test.ts`: unit tests for CORS helper.
- Create `test/proxy-allowlist.test.ts`: unit tests for proxy allowlist behavior.
- Create `app/navigation.tsx`: local Next navigation adapter replacing direct `react-router-dom` imports.
- Modify components currently importing `react-router-dom`: `app/components/home.tsx`, `app/components/sidebar.tsx`, `app/components/chat.tsx`, `app/components/chat-list.tsx`, `app/components/search-chat.tsx`, `app/components/settings.tsx`, `app/components/auth.tsx`, `app/components/mask.tsx`, `app/components/new-chat.tsx`, `app/components/mcp-market.tsx`, `app/components/sd/sd.tsx`, `app/components/sd/sd-sidebar.tsx`.
- Create App Router pages: `app/chat/page.tsx`, `app/settings/page.tsx`, `app/search-chat/page.tsx`, `app/mcp-market/page.tsx`, `app/auth/page.tsx`, `app/sd/page.tsx`, `app/sd-new/page.tsx`, `app/new-chat/page.tsx`, `app/masks/page.tsx`, `app/artifacts/[id]/page.tsx`.

---

### Task 1: Fix Verification Tooling

**Files:**
- Modify: `package.json:10-23`

- [ ] **Step 1: Update lint script**

Change the scripts block entry:

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

Keep the existing `build`, `test`, and `test:ci` scripts unchanged.

- [ ] **Step 2: Verify lint command runs**

Run:

```bash
pnpm lint
```

Expected: ESLint runs against the repo. Current expected result is `0 errors` with warnings until later cleanup tasks reduce them.

- [ ] **Step 3: Verify type check**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: fix lint script for next 16"
```

---

### Task 2: Add Route-Level Loading, Error, and Not Found UI

**Files:**
- Create: `app/components/app-loading.tsx`
- Create: `app/loading.tsx`
- Create: `app/error.tsx`
- Create: `app/not-found.tsx`
- Modify: `app/components/home.tsx`

- [ ] **Step 1: Create shared loading component**

Create `app/components/app-loading.tsx`:

```tsx
import { Bot, Loader2 } from "lucide-react";

export function AppLoading(props: { noLogo?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      {!props.noLogo && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container">
          <Bot className="h-6 w-6 text-primary" />
        </div>
      )}
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
```

- [ ] **Step 2: Update `home.tsx` loading imports**

In `app/components/home.tsx`, remove `Bot` and `Loader2` from the `lucide-react` import and replace the local `Loading` implementation with:

```tsx
import { AppLoading } from "./app-loading";

export function Loading(props: { noLogo?: boolean }) {
  return <AppLoading {...props} />;
}
```

- [ ] **Step 3: Create route loading UI**

Create `app/loading.tsx`:

```tsx
import { AppLoading } from "./components/app-loading";

export default function Loading() {
  return (
    <div className="h-dvh w-screen bg-surface-container-low">
      <AppLoading />
    </div>
  );
}
```

- [ ] **Step 4: Create route error boundary**

Create `app/error.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Route Error]", error);
  }, [error]);

  return (
    <main className="flex h-dvh w-screen items-center justify-center bg-surface-container-low p-6 text-on-surface">
      <section className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-on-surface-variant">
          The app hit an unexpected route error.
        </p>
        <pre className="max-h-48 overflow-auto rounded border border-outline-variant p-3 text-xs">
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ""}
        </pre>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded border border-outline px-3 py-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Create not-found UI**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";
import { Path } from "./constant";

export default function NotFound() {
  return (
    <main className="flex h-dvh w-screen items-center justify-center bg-surface-container-low p-6 text-on-surface">
      <section className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-on-surface-variant">
          This route does not exist in QuanAIChat.
        </p>
        <Link
          href={Path.Home}
          className="inline-flex rounded border border-outline px-3 py-2 text-sm"
        >
          Back to chat
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Verify**

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all commands exit `0`; lint may still show warnings.

- [ ] **Step 7: Commit**

```bash
git add app/components/app-loading.tsx app/components/home.tsx app/loading.tsx app/error.tsx app/not-found.tsx
git commit -m "feat: add next route fallback UI"
```

---

### Task 3: Clean Up Metadata and Scripts

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Move manifest into Metadata API**

Add `manifest` to the exported metadata object:

```tsx
export const metadata: Metadata = {
  title: "QuanAiChat",
  description: "quanquan.space 公益 GPT 服务",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/quanai.png",
    shortcut: "/quanai.png",
    apple: "/quanai.png",
  },
  appleWebApp: {
    title: "QuanAiChat",
    statusBarStyle: "default",
  },
};
```

- [ ] **Step 2: Use `next/script`**

Add:

```tsx
import Script from "next/script";
```

Replace the raw `<script>` tags with:

```tsx
<Script src="/serviceWorkerRegister.js" strategy="afterInteractive" />
<Script
  src="https://analytics.qqs.tw/script.js"
  strategy="afterInteractive"
  data-website-id="6ac8e216-95c3-495d-8974-ad467b2c7fed"
/>
```

- [ ] **Step 3: Remove duplicate viewport and manifest tags**

Delete the manual head entries:

```tsx
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>
<link
  rel="manifest"
  href="/site.webmanifest"
  crossOrigin="use-credentials"
></link>
```

Keep the exported `viewport` object as the single viewport source of truth.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "chore: use next metadata and script APIs"
```

---

### Task 4: Harden API CORS and Generic Proxy Routing

**Files:**
- Create: `app/api/cors.ts`
- Create: `app/api/proxy-allowlist.ts`
- Create: `test/api-cors.test.ts`
- Create: `test/proxy-allowlist.test.ts`
- Modify: `app/api/proxy.ts`
- Modify: `app/api/google.ts`
- Modify: `app/api/deepseek.ts`
- Modify: `app/api/config/route.ts`
- Modify: `app/api/artifacts/route.ts`
- Modify: `next.config.mjs`

- [ ] **Step 1: Write CORS helper tests**

Create `test/api-cors.test.ts`:

```ts
import { buildCorsHeaders } from "@/app/api/cors";

function requestWithOrigin(origin: string) {
  return new Request("https://example.test/api/config", {
    headers: { origin },
  });
}

describe("buildCorsHeaders", () => {
  const original = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    process.env.ALLOWED_ORIGINS = original;
  });

  it("returns no origin header when no allowed origins are configured", () => {
    delete process.env.ALLOWED_ORIGINS;
    const headers = buildCorsHeaders(requestWithOrigin("https://evil.test"));
    expect(headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("allows a configured origin", () => {
    process.env.ALLOWED_ORIGINS = "https://chat.example.com, https://admin.example.com";
    const headers = buildCorsHeaders(requestWithOrigin("https://chat.example.com"));
    expect(headers.get("Access-Control-Allow-Origin")).toBe("https://chat.example.com");
    expect(headers.get("Vary")).toBe("Origin");
  });

  it("rejects an unconfigured origin", () => {
    process.env.ALLOWED_ORIGINS = "https://chat.example.com";
    const headers = buildCorsHeaders(requestWithOrigin("https://evil.test"));
    expect(headers.has("Access-Control-Allow-Origin")).toBe(false);
  });
});
```

- [ ] **Step 2: Write proxy allowlist tests**

Create `test/proxy-allowlist.test.ts`:

```ts
import { resolveAllowedProxyBaseUrl } from "@/app/api/proxy-allowlist";

describe("resolveAllowedProxyBaseUrl", () => {
  const original = process.env.ALLOWED_PROXY_ORIGINS;

  afterEach(() => {
    process.env.ALLOWED_PROXY_ORIGINS = original;
  });

  it("allows built-in OpenAI, Google, DeepSeek, and Alibaba origins", () => {
    expect(resolveAllowedProxyBaseUrl("https://api.openai.com")).toBe("https://api.openai.com");
    expect(resolveAllowedProxyBaseUrl("https://generativelanguage.googleapis.com")).toBe("https://generativelanguage.googleapis.com");
    expect(resolveAllowedProxyBaseUrl("https://api.deepseek.com")).toBe("https://api.deepseek.com");
    expect(resolveAllowedProxyBaseUrl("https://dashscope.aliyuncs.com")).toBe("https://dashscope.aliyuncs.com");
  });

  it("allows Azure OpenAI resource origins", () => {
    expect(resolveAllowedProxyBaseUrl("https://my-resource.openai.azure.com")).toBe("https://my-resource.openai.azure.com");
  });

  it("allows configured custom origins", () => {
    process.env.ALLOWED_PROXY_ORIGINS = "https://llm.example.com";
    expect(resolveAllowedProxyBaseUrl("https://llm.example.com/v1")).toBe("https://llm.example.com");
  });

  it("rejects malformed and untrusted origins", () => {
    expect(resolveAllowedProxyBaseUrl(null)).toBeNull();
    expect(resolveAllowedProxyBaseUrl("not-a-url")).toBeNull();
    expect(resolveAllowedProxyBaseUrl("http://api.openai.com")).toBeNull();
    expect(resolveAllowedProxyBaseUrl("https://evil.test")).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests and confirm they fail**

Run:

```bash
pnpm exec jest test/api-cors.test.ts test/proxy-allowlist.test.ts --ci
```

Expected: fail because `app/api/cors.ts` and `app/api/proxy-allowlist.ts` do not exist yet.

- [ ] **Step 4: Implement CORS helper**

Create `app/api/cors.ts`:

```ts
const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS";
const DEFAULT_ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Goog-Api-Key, X-Base-Url";

function configuredOrigins() {
  return new Set(
    (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function buildCorsHeaders(request: Request) {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  const allowedOrigins = configuredOrigins();

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", DEFAULT_ALLOWED_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

export function withCors(response: Response, request: Request) {
  const corsHeaders = buildCorsHeaders(request);
  corsHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export function corsPreflight(request: Request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}
```

- [ ] **Step 5: Implement proxy allowlist helper**

Create `app/api/proxy-allowlist.ts`:

```ts
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
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
}

export function resolveAllowedProxyBaseUrl(rawBaseUrl: string | null) {
  if (!rawBaseUrl) return null;

  let url: URL;
  try {
    url = new URL(rawBaseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const origin = url.origin;
  if (BUILT_IN_PROXY_ORIGINS.has(origin)) return origin;
  if (AZURE_OPENAI_ORIGIN.test(origin)) return origin;
  if (configuredProxyOrigins().has(origin)) return origin;

  return null;
}
```

- [ ] **Step 6: Apply allowlist in generic proxy**

In `app/api/proxy.ts`, import helpers:

```ts
import { corsPreflight, withCors } from "@/app/api/cors";
import { resolveAllowedProxyBaseUrl } from "@/app/api/proxy-allowlist";
```

Replace the `OPTIONS` branch:

```ts
if (req.method === "OPTIONS") {
  return corsPreflight(req);
}
```

Replace `fetchUrl` construction with:

```ts
const baseUrl = resolveAllowedProxyBaseUrl(req.headers.get("x-base-url"));
if (!baseUrl) {
  return withCors(
    NextResponse.json(
      { error: true, message: "Disallowed proxy upstream" },
      { status: 400 },
    ),
    req,
  );
}

const subpath = params.path.join("/");
const query = req.nextUrl.searchParams.toString();
const fetchUrl = `${baseUrl}/${subpath}${query ? `?${query}` : ""}`;
```

Wrap final response:

```ts
return withCors(
  new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  }),
  req,
);
```

- [ ] **Step 7: Apply CORS helper to provider/config/artifacts routes**

For each route handler that currently returns JSON or upstream responses directly, use `corsPreflight(req)` for `OPTIONS` and wrap final responses with `withCors(response, req)`.

Example for `app/api/google.ts`:

```ts
import { corsPreflight, withCors } from "@/app/api/cors";

if (req.method === "OPTIONS") {
  return corsPreflight(req);
}

return withCors(response, req);
```

Apply the same pattern to `app/api/deepseek.ts`, `app/api/config/route.ts`, and `app/api/artifacts/route.ts`.

- [ ] **Step 8: Remove global wildcard CORS**

In `next.config.mjs`, delete `CorsHeaders` and the `nextConfig.headers = async () => ...` block. Keep the `rewrites` block.

- [ ] **Step 9: Verify tests and build**

Run:

```bash
pnpm exec jest test/api-cors.test.ts test/proxy-allowlist.test.ts --ci
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all commands exit `0`; lint may still show unrelated warnings.

- [ ] **Step 10: Commit**

```bash
git add app/api/cors.ts app/api/proxy-allowlist.ts app/api/proxy.ts app/api/google.ts app/api/deepseek.ts app/api/config/route.ts app/api/artifacts/route.ts next.config.mjs test/api-cors.test.ts test/proxy-allowlist.test.ts
git commit -m "fix: restrict api cors and proxy upstreams"
```

---

### Task 5: Introduce a Local Navigation Adapter

**Files:**
- Create: `app/navigation.tsx`
- Modify: React Router imports in the component files listed in File Structure.

- [ ] **Step 1: Create adapter**

Create `app/navigation.tsx`:

```tsx
"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

const ROUTE_STATE_PREFIX = "quanai-route-state:";

function routeStateKey(pathname: string) {
  return `${ROUTE_STATE_PREFIX}${pathname}`;
}

export const Link = NextLink;

export function useNavigate() {
  const router = useRouter();

  return (href: string, options?: NavigateOptions) => {
    if (typeof window !== "undefined" && options?.state !== undefined) {
      window.sessionStorage.setItem(
        routeStateKey(href),
        JSON.stringify(options.state),
      );
    }

    if (options?.replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };
}

export function useLocation<TState = unknown>() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<TState | null>(null);
  const search = useMemo(() => {
    const value = searchParams.toString();
    return value ? `?${value}` : "";
  }, [searchParams]);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(routeStateKey(pathname));
    if (!raw) {
      setState(null);
      return;
    }

    try {
      setState(JSON.parse(raw) as TState);
    } catch {
      setState(null);
    } finally {
      window.sessionStorage.removeItem(routeStateKey(pathname));
    }
  }, [pathname]);

  return {
    pathname,
    search,
    hash: "",
    state,
  };
}
```

- [ ] **Step 2: Replace direct React Router imports**

In each affected component, replace imports like:

```tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
```

with the local adapter:

```tsx
import { Link, useLocation, useNavigate } from "@/app/navigation";
```

For files that only use `useNavigate`, import only `useNavigate`. For files that only use `Link`, import only `Link`.

- [ ] **Step 3: Verify no component imports React Router**

Run:

```bash
rg -n "react-router-dom" app/components app/store app/utils
```

Expected: no output outside `app/components/home.tsx` until Task 6 removes the router shell.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add app/navigation.tsx app/components
git commit -m "refactor: route navigation through local adapter"
```

---

### Task 6: Replace React Router Shell with App Router Pages

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/home.tsx`
- Create: `app/chat/page.tsx`
- Create: `app/settings/page.tsx`
- Create: `app/search-chat/page.tsx`
- Create: `app/mcp-market/page.tsx`
- Create: `app/auth/page.tsx`
- Create: `app/sd/page.tsx`
- Create: `app/sd-new/page.tsx`
- Create: `app/new-chat/page.tsx`
- Create: `app/masks/page.tsx`
- Create: `app/artifacts/[id]/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: Refactor `home.tsx` into providers and shell**

Remove these imports from `app/components/home.tsx`:

```tsx
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
```

Add:

```tsx
import { usePathname, useRouter } from "next/navigation";
```

Replace `Screen` with:

```tsx
export function AppShell(props: { children: React.ReactNode }) {
  const config = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === Path.Home;
  const isArtifact = pathname.startsWith(`${Path.Artifacts}/`);
  const isSd = pathname === Path.Sd || pathname === Path.SdNew;

  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || isMobileScreen || config.tightBorder;

  if (isArtifact) {
    return <>{props.children}</>;
  }

  if (isSd) {
    return (
      <div className="h-full w-full bg-surface text-on-surface">
        {props.children}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "h-full w-full flex overflow-hidden",
        "bg-surface text-on-surface",
        !shouldTightBorder &&
          "rounded-lg border border-outline-variant shadow-floating",
        shouldTightBorder && "app-container-fluid",
      )}
    >
      <SideBar
        className={clsx({
          "max-md:translate-x-0": isHome,
          "max-md:-translate-x-full": !isHome,
        })}
      />
      {isMobileScreen && isHome && (
        <button
          type="button"
          aria-label="Close chat list"
          className="fixed inset-0 z-40 hidden border-0 bg-black/25 p-0 max-md:block"
          onClick={() => router.push(Path.Chat)}
        />
      )}
      <WindowContent>{props.children}</WindowContent>
    </div>
  );
}
```

Add:

```tsx
export function AppProviders(props: { children: React.ReactNode }) {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();

    const initMcp = async () => {
      try {
        const enabled = await isMcpEnabled();
        if (enabled) {
          console.log("[MCP] initializing...");
          await initializeMcpSystem();
          console.log("[MCP] initialized");
        }
      } catch (err) {
        console.error("[MCP] failed to initialize:", err);
      }
    };
    initMcp();
  }, []);

  if (!useHasHydrated()) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-surface-container-low">
        <Loading />
      </div>
    );
  }

  return <ErrorBoundary>{props.children}</ErrorBoundary>;
}
```

Replace `Home` with:

```tsx
export function Home() {
  return <ChatRoute />;
}

export function ChatRoute() {
  return (
    <AppShell>
      <Chat />
    </AppShell>
  );
}
```

- [ ] **Step 2: Wrap children in root layout providers**

In `app/layout.tsx`, import providers:

```tsx
import { AppProviders } from "./components/home";
```

Change body:

```tsx
<body>
  <AppProviders>{children}</AppProviders>
</body>
```

- [ ] **Step 3: Create route page files**

Create `app/chat/page.tsx`:

```tsx
import { ChatRoute } from "../components/home";

export default function Page() {
  return <ChatRoute />;
}
```

Create `app/settings/page.tsx`:

```tsx
import { AppShell } from "../components/home";
import { Settings } from "../components/settings";

export default function Page() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}
```

Create `app/search-chat/page.tsx`:

```tsx
import { AppShell } from "../components/home";
import { SearchChatPage } from "../components/search-chat";

export default function Page() {
  return (
    <AppShell>
      <SearchChatPage />
    </AppShell>
  );
}
```

Create `app/mcp-market/page.tsx`:

```tsx
import { AppShell } from "../components/home";
import { McpMarketPage } from "../components/mcp-market";

export default function Page() {
  return (
    <AppShell>
      <McpMarketPage />
    </AppShell>
  );
}
```

Create `app/auth/page.tsx`:

```tsx
import { AuthPage } from "../components/auth";

export default function Page() {
  return <AuthPage />;
}
```

Create `app/sd/page.tsx`:

```tsx
import { Sd } from "../components/sd";

export default function Page() {
  return <Sd />;
}
```

Create `app/sd-new/page.tsx`:

```tsx
import { Sd } from "../components/sd";

export default function Page() {
  return <Sd />;
}
```

Create `app/new-chat/page.tsx`:

```tsx
import { AppShell } from "../components/home";
import { NewChat } from "../components/new-chat";

export default function Page() {
  return (
    <AppShell>
      <NewChat />
    </AppShell>
  );
}
```

Create `app/masks/page.tsx`:

```tsx
import { AppShell } from "../components/home";
import { MaskPage } from "../components/mask";

export default function Page() {
  return (
    <AppShell>
      <MaskPage />
    </AppShell>
  );
}
```

Create `app/artifacts/[id]/page.tsx`:

```tsx
import { Artifacts } from "../../components/artifacts";

export default function Page() {
  return <Artifacts />;
}
```

- [ ] **Step 4: Update root page**

Ensure `app/page.tsx` remains:

```tsx
import { Home } from "./components/home";

export default function App() {
  return <Home />;
}
```

- [ ] **Step 5: Remove React Router dependency**

After all imports are gone, remove `react-router-dom` from `package.json` dependencies.

- [ ] **Step 6: Verify no React Router remains**

Run:

```bash
rg -n "react-router-dom|HashRouter|<Routes|<Route\\b" app package.json
```

Expected: no output.

- [ ] **Step 7: Verify**

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 8: Manual smoke test**

Run:

```bash
pnpm dev
```

Open these routes in the browser and verify the expected screen renders:

- `http://localhost:3000/`
- `http://localhost:3000/chat`
- `http://localhost:3000/settings`
- `http://localhost:3000/search-chat`
- `http://localhost:3000/mcp-market`
- `http://localhost:3000/auth`
- `http://localhost:3000/sd`
- `http://localhost:3000/sd-new`

Expected: route transitions use normal paths, not hash fragments.

- [ ] **Step 9: Commit**

```bash
git add app package.json
git commit -m "refactor: migrate client routes to app router pages"
```

---

### Task 7: Revisit Image Optimization

**Files:**
- Modify: `eslint.config.mjs`
- Modify eligible raw image sites: `app/components/chat.tsx`, `app/components/exporter.tsx`, `app/components/ui-lib.tsx`, `app/components/sd/sd.tsx`

- [ ] **Step 1: Re-enable Next image lint**

In `eslint.config.mjs`, remove:

```js
"@next/next/no-img-element": "off",
```

- [ ] **Step 2: Classify each raw image**

For each remaining `<img>`, choose one outcome:

1. Convert static or stable remote images to `next/image`.
2. Keep user-generated, blob, data URL, canvas/export, or modal preview images as `<img>` with a local disable comment.

Use this comment format for justified raw images:

```tsx
{/* eslint-disable-next-line @next/next/no-img-element -- User-provided blob/data URLs cannot use next/image optimization safely. */}
<img src={image} alt="" className={styles["chat-message-item-image"]} />
```

- [ ] **Step 3: Verify lint catches undocumented raw images**

Run:

```bash
pnpm lint
```

Expected: no `@next/next/no-img-element` warnings except lines with explicit local disable comments.

- [ ] **Step 4: Verify build**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.mjs app/components
git commit -m "chore: document raw image exceptions"
```

---

### Task 8: Final Verification and Regression Sweep

**Files:**
- No required file changes unless verification exposes failures.

- [ ] **Step 1: Full static verification**

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm exec jest --ci
pnpm build
```

Expected: all commands exit `0`. ESLint warnings should be reviewed; remaining warnings must be unrelated to the migrated behavior or tracked in a follow-up issue.

- [ ] **Step 2: Check build route output**

Run:

```bash
pnpm build
```

Expected route output includes concrete App Router pages for `/chat`, `/settings`, `/search-chat`, `/mcp-market`, `/auth`, `/sd`, `/sd-new`, `/new-chat`, `/masks`, and `/artifacts/[id]`.

- [ ] **Step 3: Browser smoke test**

Run:

```bash
pnpm dev
```

Open `http://localhost:3000` and verify:

- Sidebar opens on `/`.
- Starting or selecting chat navigates to `/chat`.
- Settings opens at `/settings`.
- MCP market opens at `/mcp-market`.
- Search opens at `/search-chat`.
- SD routes render at `/sd` and `/sd-new`.
- Unknown route such as `/definitely-missing` renders the new not-found UI.

- [ ] **Step 4: Security spot checks**

Run with no `ALLOWED_ORIGINS`:

```bash
curl -i -X OPTIONS http://localhost:3000/api/config -H 'Origin: https://evil.test'
```

Expected: no `Access-Control-Allow-Origin: *`.

Run:

```bash
curl -i -X POST http://localhost:3000/api/proxy/openai/v1/chat/completions -H 'x-base-url: https://evil.test'
```

Expected: HTTP `400` with `Disallowed proxy upstream`.

- [ ] **Step 5: Final status**

Run:

```bash
git status --short
```

Expected: clean worktree after commits.

---

## Self-Review

- Spec coverage: Covers all audit findings: broken lint script, missing route fallback files, broad client boundary/React Router, raw script/head usage, wildcard API CORS and generic proxy, image optimization lint exception, and production verification.
- Placeholder scan: No `TBD`, `TODO`, or unspecified test steps remain. The only judgment step is image classification, with exact allowed outcomes and comment format.
- Type consistency: Navigation adapter exposes `Link`, `useNavigate`, and `useLocation`, matching the existing React Router imports that will be replaced.
