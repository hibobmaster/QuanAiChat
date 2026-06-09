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

function routeStateKey(pathname: string) {
  return `${ROUTE_STATE_PREFIX}${pathname}`;
}

export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} href={props.href} />;
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (href: string | number, options?: NavigateOptions) => {
      if (typeof href === "number") {
        if (href === -1) {
          router.back();
        } else if (href === 1) {
          router.forward();
        } else if (typeof window !== "undefined") {
          window.history.go(href);
        }
        return;
      }

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
    },
    [router],
  );
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

export function useParams<
  TParams extends Record<string, string> = Record<string, string>,
>() {
  return useNextParams<TParams>();
}
