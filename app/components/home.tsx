"use client";

require("../polyfill");

import { Suspense, useEffect, useState } from "react";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang } from "../locales";

import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { getClientConfig } from "../config/client";
import { type ClientApi, getClientApi } from "../client/api";
import { useAccessStore } from "../store";
import clsx from "clsx";
import { initializeMcpSystem, isMcpEnabled } from "../mcp/actions";
import { AppLoading } from "./app-loading";

export function Loading(props: { noLogo?: boolean }) {
  return <AppLoading {...props} />;
}

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#141b19");
      metaDescriptionLight?.setAttribute("content", "#f0f4f2");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

export function WindowContent(props: { children: React.ReactNode }) {
  return (
    <main
      className="flex-1 h-full flex flex-col overflow-hidden"
      id={SlotID.AppBody}
    >
      {props?.children}
    </main>
  );
}

export function AppShell(props: { children: React.ReactNode }) {
  const config = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const isArtifact = pathname.includes(Path.Artifacts);
  const isHome = pathname === Path.Home;
  const isSd = pathname === Path.Sd;
  const isSdNew = pathname === Path.SdNew;

  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || isMobileScreen || config.tightBorder;

  if (isArtifact) {
    return props.children;
  }

  const content =
    isSd || isSdNew ? (
      props.children
    ) : (
      <>
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
      </>
    );

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
      {content}
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  const api: ClientApi = getClientApi(config.modelConfig.providerName);

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
  }, []);
}

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

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>{props.children}</Suspense>
    </ErrorBoundary>
  );
}

export function ChatRoute() {
  return (
    <AppShell>
      <Chat />
    </AppShell>
  );
}

export function Home() {
  return <ChatRoute />;
}
