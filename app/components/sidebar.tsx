"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Trash2, Wrench, GripVertical, X } from "lucide-react";
import GithubIcon from "../icons/github.svg";

import Image from "next/image";
import { IconButton } from "./button";

import QuanAiLogo from "../../assets/quanai.webp";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "@/app/navigation";
import { isIOS, useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm } from "./ui-lib";
import clsx from "clsx";
import { isMcpEnabled } from "../mcp/actions";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

export function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

export function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(0);

  const toggleSideBar = () => {
    config.update((config) => {
      if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        if (nextWidth < MIN_SIDEBAR_WIDTH) {
          config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
        } else {
          config.sidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

interface SideBarContainerProps {
  children: React.ReactNode;
  onDragStart: (e: MouseEvent) => void;
  shouldNarrow: boolean;
  className?: string;
}

export function SideBarContainer({
  children,
  className,
  onDragStart,
  shouldNarrow,
}: SideBarContainerProps) {
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  return (
    <motion.aside
      className={clsx(
        "h-full flex flex-col relative",
        "bg-surface-container",
        "border-r border-outline-variant/50",
        "transition-all duration-200 ease-out",
        shouldNarrow && "w-16",
        "max-md:fixed max-md:left-0 max-md:top-0 max-md:z-50",
        "max-md:w-full max-md:max-w-[280px]",
        className,
      )}
      style={{
        width: !shouldNarrow ? "var(--sidebar-width)" : undefined,
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      {children}
      {!isMobileScreen && (
        <div
          className="absolute top-0 right-0 h-full w-3 cursor-ew-resize group flex items-center justify-center"
          onPointerDown={(e) => onDragStart(e as unknown as MouseEvent)}
        >
          <GripVertical className="w-3 h-3 text-on-surface-variant/0 group-hover:text-on-surface-variant/50 transition-colors" />
        </div>
      )}
    </motion.aside>
  );
}

interface SideBarHeaderProps {
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  logo?: React.ReactNode;
  children?: React.ReactNode;
  shouldNarrow?: boolean;
}

export function SideBarHeader({
  title,
  subTitle,
  logo,
  children,
  shouldNarrow,
}: SideBarHeaderProps) {
  return (
    <>
      <div
        className={clsx(
          "flex items-center gap-3 px-4 py-4",
          "border-b border-outline-variant/30",
          shouldNarrow && "justify-center px-2",
        )}
      >
        {!shouldNarrow && (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="text-base font-semibold text-on-surface truncate">
              {title}
            </div>
            <div className="text-xs text-on-surface-variant truncate">
              {subTitle}
            </div>
          </div>
        )}
        <div
          className={clsx(
            "flex-shrink-0",
            shouldNarrow && "flex justify-center w-full",
          )}
        >
          {logo}
        </div>
      </div>
      {children}
    </>
  );
}

interface SideBarBodyProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function SideBarBody({ onClick, children }: SideBarBodyProps) {
  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface SideBarTailProps {
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  narrow?: boolean;
}

export function SideBarTail({
  primaryAction,
  secondaryAction,
  narrow,
}: SideBarTailProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-2 border-t border-outline-variant/30 px-3 py-3",
        narrow && "flex-col-reverse",
      )}
    >
      <div className={clsx("flex items-center gap-2", narrow && "flex-col")}>
        {primaryAction}
      </div>
      <div className="flex items-center">{secondaryAction}</div>
    </div>
  );
}

export function SideBar(props: { className?: string }) {
  useHotKey();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const chatStore = useChatStore();
  const isMobileScreen = useMobileScreen();
  const [mcpEnabled, setMcpEnabled] = useState(false);

  useEffect(() => {
    const checkMcpStatus = async () => {
      const enabled = await isMcpEnabled();
      setMcpEnabled(enabled);
      console.log("[SideBar] MCP enabled:", enabled);
    };
    checkMcpStatus();
  }, []);

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <SideBarHeader
        title="QuanAiChat"
        subTitle="quanquan.space 公益 GPT 服務"
        logo={
          isMobileScreen ? (
            <IconButton
              aria="Close chat list"
              title="Close chat list"
              icon={<X className="h-4 w-4" />}
              onClick={() => navigate(Path.Chat)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high shadow-sm">
              <Image
                src={QuanAiLogo}
                alt="QuanAiChat logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-contain"
                priority
                unoptimized
              />
            </div>
          )
        }
        shouldNarrow={shouldNarrow}
      >
        {mcpEnabled && !shouldNarrow && (
          <div className="px-3 pb-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              onClick={() => {
                navigate(Path.McpMarket, { state: { fromHome: true } });
              }}
            >
              <Wrench className="w-4 h-4" />
              {Locale.Mcp.Name}
            </button>
          </div>
        )}
      </SideBarHeader>
      <SideBarBody
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </SideBarBody>
      <SideBarTail
        narrow={shouldNarrow}
        primaryAction={
          <>
            <div className="md:hidden">
              <IconButton
                icon={<Trash2 className="w-4 h-4" />}
                onClick={async () => {
                  if (await showConfirm(Locale.Home.DeleteChat)) {
                    chatStore.deleteSession(chatStore.currentSessionIndex);
                  }
                }}
              />
            </div>
            <Link href={Path.Settings}>
              <IconButton
                aria={Locale.Settings.Title}
                icon={<Settings className="w-4 h-4" />}
              />
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <IconButton
                aria="GitHub"
                icon={<GithubIcon className="w-4 h-4" />}
              />
            </a>
          </>
        }
        secondaryAction={
          <button
            className="flex min-w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hover active:scale-95"
            aria-label={Locale.Home.NewChat}
            onClick={() => {
              chatStore.newSession();
              navigate(Path.Chat);
            }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!shouldNarrow && (
              <span className="whitespace-nowrap">{Locale.Home.NewChat}</span>
            )}
          </button>
        }
      />
    </SideBarContainer>
  );
}
