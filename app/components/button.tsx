import * as React from "react";

import { CSSProperties } from "react";
import clsx from "clsx";

export type ButtonType = "primary" | "danger" | null;

export function IconButton(props: {
  onClick?: () => void;
  icon?: React.ReactNode;
  type?: ButtonType;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
  style?: CSSProperties;
  aria?: string;
}) {
  const baseClasses =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const typeClasses = {
    primary: "bg-primary text-on-primary hover:bg-primary-hover shadow",
    danger:
      "bg-danger-container text-on-danger-container hover:border-danger hover:bg-danger-container",
    null: "bg-surface-container hover:bg-surface-container-high",
  }[props.type ?? "null"];
  const borderClass = props.bordered ? "border border-outline-variant" : "";
  const shadowClass = props.shadow ? "shadow" : "";

  return (
    <button
      className={clsx(
        baseClasses,
        typeClasses,
        borderClass,
        shadowClass,
        props.className,
      )}
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
      tabIndex={props.tabIndex}
      autoFocus={props.autoFocus}
      style={props.style}
      aria-label={props.aria}
    >
      {props.icon && (
        <div
          aria-label={props.text || props.title}
          className={clsx(
            "flex h-4 w-4 shrink-0 items-center justify-center [&>img]:h-4 [&>img]:w-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
            {
              "no-dark": props.type === "primary",
            },
          )}
        >
          {props.icon}
        </div>
      )}

      {props.text && (
        <span aria-label={props.text || props.title}>{props.text}</span>
      )}
    </button>
  );
}
