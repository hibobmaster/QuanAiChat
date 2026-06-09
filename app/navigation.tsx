"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

const ROUTE_STATE_PREFIX = "quanai-route-state:";
const USE_LEGACY_HASH_ROUTER = true;

function routeStateKey(pathname: string) {
  return `${ROUTE_STATE_PREFIX}${pathname}`;
}

function hashPath(pathname: string) {
  return `#${pathname}`;
}

function currentHashPath() {
  if (typeof window === "undefined") return "/";
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function Link(props: ComponentProps<typeof NextLink>) {
  const href =
    USE_LEGACY_HASH_ROUTER && typeof props.href === "string"
      ? hashPath(props.href)
      : props.href;

  return <NextLink {...props} href={href} />;
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (href: string | number, options?: NavigateOptions) => {
      if (typeof href === "number") {
        if (USE_LEGACY_HASH_ROUTER && typeof window !== "undefined") {
          window.history.go(href);
        } else if (href < 0) {
          router.back();
        } else if (href > 0) {
          router.forward();
        }
        return;
      }

      if (typeof window !== "undefined" && options?.state !== undefined) {
        window.sessionStorage.setItem(
          routeStateKey(href),
          JSON.stringify(options.state),
        );
      }

      if (USE_LEGACY_HASH_ROUTER && typeof window !== "undefined") {
        const nextHash = hashPath(href);
        if (options?.replace) {
          window.location.replace(nextHash);
        } else {
          window.location.hash = nextHash;
        }
        return;
      }

      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router],
  );
}

export function useLocation<TState = unknown>() {
  const nextPathname = usePathname();
  const searchParams = useSearchParams();
  const [hashPathname, setHashPathname] = useState(currentHashPath);
  const pathname = USE_LEGACY_HASH_ROUTER ? hashPathname : nextPathname;
  const [state, setState] = useState<TState | null>(null);
  const search = useMemo(() => {
    if (USE_LEGACY_HASH_ROUTER) return "";

    const value = searchParams.toString();
    return value ? `?${value}` : "";
  }, [searchParams]);

  useEffect(() => {
    if (!USE_LEGACY_HASH_ROUTER) return;

    const syncHashPath = () => setHashPathname(currentHashPath());
    window.addEventListener("hashchange", syncHashPath);
    syncHashPath();
    return () => window.removeEventListener("hashchange", syncHashPath);
  }, []);

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

export function useParams<
  TParams extends Record<string, string> = Record<string, string>,
>() {
  const nextParams = useNextParams<TParams>();
  const { pathname } = useLocation();

  if (!USE_LEGACY_HASH_ROUTER) {
    return nextParams;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "artifacts" && segments[1]) {
    return { id: segments[1] } as unknown as TParams;
  }

  return {} as TParams;
}
