import styles from "./ui-lib.module.css";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as ToastPrimitive from "@radix-ui/react-toast";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";
import EyeIcon from "../icons/eye.svg";
import EyeOffIcon from "../icons/eye-off.svg";
import DownIcon from "../icons/down.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";

import Locale from "../locales";

import { createRoot } from "react-dom/client";
import React, {
  CSSProperties,
  MouseEvent,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { IconButton } from "./button";
import { Avatar } from "./emoji";
import clsx from "clsx";

export function Popover(props: {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <PopoverPrimitive.Root
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose?.();
        }
      }}
    >
      <PopoverPrimitive.Anchor asChild>
        <div className={styles.popover}>{props.children}</div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={12}
          collisionPadding={12}
          className={styles["popover-content"]}
        >
          {props.content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function Card(props: {
  children: React.ReactNode[];
  className?: string;
}) {
  return (
    <div className={clsx(styles.card, props.className)}>{props.children}</div>
  );
}

export function ListItem(props: {
  title?: string;
  subTitle?: string | React.ReactNode;
  children?: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  vertical?: boolean;
}) {
  return (
    <div
      className={clsx(
        styles["list-item"],
        {
          [styles["vertical"]]: props.vertical,
        },
        props.className,
      )}
      onClick={props.onClick}
    >
      <div className={styles["list-header"]}>
        {props.icon && <div className={styles["list-icon"]}>{props.icon}</div>}
        <div className={styles["list-item-title"]}>
          <div>{props.title}</div>
          {props.subTitle && (
            <div className={styles["list-item-sub-title"]}>
              {props.subTitle}
            </div>
          )}
        </div>
      </div>
      {props.children}
    </div>
  );
}

export function List(props: { children: React.ReactNode; id?: string }) {
  return (
    <div className={styles.list} id={props.id}>
      {props.children}
    </div>
  );
}

export function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoadingIcon />
    </div>
  );
}

interface ModalProps {
  title: string;
  children?: any;
  actions?: React.ReactNode[];
  defaultMax?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
}
export function Modal(props: ModalProps) {
  const [isMax, setMax] = useState(!!props.defaultMax);

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          props.onClose?.();
        }
      }}
    >
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={clsx(styles["modal-container"], {
          [styles["modal-container-max"]]: isMax,
        })}
      >
        <div className={styles["modal-header"]}>
          <DialogPrimitive.Title className={styles["modal-title"]}>
            {props.title}
          </DialogPrimitive.Title>

          <div className={styles["modal-header-actions"]}>
            <button
              type="button"
              aria-label={isMax ? "Restore modal size" : "Maximize modal"}
              className={styles["modal-header-action"]}
              onClick={() => setMax(!isMax)}
            >
              {isMax ? <MinIcon /> : <MaxIcon />}
            </button>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label={Locale.UI.Close}
                className={styles["modal-header-action"]}
              >
                <CloseIcon />
              </button>
            </DialogPrimitive.Close>
          </div>
        </div>

        <div className={styles["modal-content"]}>{props.children}</div>

        <div className={styles["modal-footer"]}>
          {props.footer}
          <div className={styles["modal-actions"]}>
            {props.actions?.map((action, i) => (
              <div key={i} className={styles["modal-action"]}>
                {action}
              </div>
            ))}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}

export function showModal(props: ModalProps) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    props.onClose?.();
    root.unmount();
    div.remove();
  };

  div.onclick = (e) => {
    if (e.target === div) {
      closeModal();
    }
  };

  root.render(<Modal {...props} onClose={closeModal}></Modal>);
}

export type ToastProps = {
  content: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  delay?: number;
  onClose?: () => void;
};

export function Toast(props: ToastProps) {
  const [open, setOpen] = useState(true);

  return (
    <ToastPrimitive.Provider duration={props.delay}>
      <ToastPrimitive.Root
        open={open}
        className={styles["toast-content"]}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            props.onClose?.();
          }
        }}
      >
        <span>{props.content}</span>
        {props.action && (
          <ToastPrimitive.Action asChild altText={props.action.text}>
            <button
              onClick={() => {
                props.action?.onClick?.();
                setOpen(false);
              }}
              className={styles["toast-action"]}
            >
              {props.action.text}
            </button>
          </ToastPrimitive.Action>
        )}
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className={styles["toast-container"]} />
    </ToastPrimitive.Provider>
  );
}

export function showToast(
  content: string,
  action?: ToastProps["action"],
  delay = 3000,
  placement?: "above-input",
) {
  const div = document.createElement("div");
  if (placement) {
    div.dataset.toastPlacement = placement;
  }
  document.body.appendChild(div);

  const root = createRoot(div);
  const close = () => {
    root.unmount();
    div.remove();
  };

  root.render(
    <Toast content={content} action={action} delay={delay} onClose={close} />,
  );
}

export type InputProps = Omit<React.ComponentProps<"textarea">, "ref"> & {
  ref?: React.Ref<HTMLTextAreaElement>;
  autoHeight?: boolean;
  rows?: number;
};

export function Input(props: InputProps) {
  return (
    <textarea
      {...props}
      ref={props.ref as any}
      className={clsx(styles["input"], props.className)}
    ></textarea>
  );
}

export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "ref"> & {
    ref?: React.Ref<HTMLInputElement>;
    aria?: string;
  },
) {
  const [visible, setVisible] = useState(false);
  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <div className={"password-input-container"}>
      <IconButton
        aria={props.aria}
        icon={visible ? <EyeIcon /> : <EyeOffIcon />}
        onClick={changeVisibility}
        className={"password-eye"}
      />
      <input
        {...props}
        ref={props.ref as any}
        type={visible ? "text" : "password"}
        className={"password-input"}
      />
    </div>
  );
}

export function Select(
  props: Omit<React.ComponentProps<"select">, "ref"> & {
    ref?: React.Ref<HTMLSelectElement>;
    align?: "left" | "center";
  },
) {
  const {
    className,
    children,
    align,
    value,
    defaultValue,
    disabled,
    name,
    onChange,
    ...otherProps
  } = props;
  type SelectOption = {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
  };
  type SelectGroup = {
    label?: React.ReactNode;
    options: SelectOption[];
  };
  const groups: SelectGroup[] = React.Children.toArray(children).flatMap(
    (child, index): SelectGroup[] => {
      if (!React.isValidElement(child)) {
        return [];
      }

      if (child.type === "optgroup") {
        const groupProps =
          child.props as React.OptgroupHTMLAttributes<HTMLOptGroupElement>;
        const options = React.Children.toArray(groupProps.children).flatMap(
          (option) => {
            if (!React.isValidElement(option) || option.type !== "option") {
              return [];
            }

            const optionProps =
              option.props as React.OptionHTMLAttributes<HTMLOptionElement>;

            return [
              {
                value: String(optionProps.value ?? optionProps.children ?? ""),
                label: optionProps.children,
                disabled: optionProps.disabled,
              },
            ];
          },
        );

        return [{ label: groupProps.label ?? String(index), options }];
      }

      if (child.type !== "option") {
        return [];
      }

      const optionProps =
        child.props as React.OptionHTMLAttributes<HTMLOptionElement>;

      return [
        {
          label: undefined,
          options: [
            {
              value: String(optionProps.value ?? optionProps.children ?? ""),
              label: optionProps.children,
              disabled: optionProps.disabled,
            },
          ],
        },
      ];
    },
  );
  const flatOptions = groups.flatMap((group) => group.options);
  const selectedValue = value == null ? undefined : String(value);
  const initialValue =
    defaultValue == null ? flatOptions[0]?.value : String(defaultValue);
  const hiddenValue = selectedValue ?? initialValue ?? "";

  const handleValueChange = (nextValue: string) => {
    onChange?.({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <SelectPrimitive.Root
      value={selectedValue}
      defaultValue={initialValue}
      disabled={disabled}
      onValueChange={handleValueChange}
    >
      <div
        className={clsx(
          styles["select-with-icon"],
          {
            [styles["left-align-option"]]: align === "left",
          },
          className,
        )}
      >
        {name && <input type="hidden" name={name} value={hiddenValue} />}
        <SelectPrimitive.Trigger
          aria-label={otherProps["aria-label"]}
          className={styles["select-with-icon-select"]}
        >
          <SelectPrimitive.Value
            placeholder={
              (otherProps as { placeholder?: React.ReactNode }).placeholder ??
              flatOptions[0]?.label
            }
          />
          <SelectPrimitive.Icon asChild>
            <DownIcon className={styles["select-with-icon-icon"]} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          align={align === "left" ? "start" : "center"}
          collisionPadding={12}
          className={styles["select-content"]}
        >
          <SelectPrimitive.Viewport className={styles["select-viewport"]}>
            {groups.map((group, groupIndex) => (
              <SelectPrimitive.Group key={groupIndex}>
                {group.label && (
                  <SelectPrimitive.Label className={styles["select-label"]}>
                    {group.label}
                  </SelectPrimitive.Label>
                )}
                {group.options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={styles["select-item"]}
                  >
                    <SelectPrimitive.ItemText>
                      {option.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function showConfirm(content: any) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<boolean>((resolve) => {
    root.render(
      <Modal
        title={Locale.UI.Confirm}
        actions={[
          <IconButton
            key="cancel"
            text={Locale.UI.Cancel}
            onClick={() => {
              resolve(false);
              closeModal();
            }}
            icon={<CancelIcon />}
            tabIndex={0}
            bordered
            shadow
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.UI.Confirm}
            type="primary"
            onClick={() => {
              resolve(true);
              closeModal();
            }}
            icon={<ConfirmIcon />}
            tabIndex={0}
            autoFocus
            bordered
            shadow
          ></IconButton>,
        ]}
        onClose={closeModal}
      >
        {content}
      </Modal>,
    );
  });
}

function PromptInput(props: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [input, setInput] = useState(props.value);
  const onInput = (value: string) => {
    props.onChange(value);
    setInput(value);
  };

  return (
    <textarea
      className={styles["modal-input"]}
      autoFocus
      value={input}
      onInput={(e) => onInput(e.currentTarget.value)}
      rows={props.rows ?? 3}
    ></textarea>
  );
}

export function showPrompt(content: any, value = "", rows = 3) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<string>((resolve) => {
    let userInput = value;

    root.render(
      <Modal
        title={content}
        actions={[
          <IconButton
            key="cancel"
            text={Locale.UI.Cancel}
            onClick={() => {
              closeModal();
            }}
            icon={<CancelIcon />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.UI.Confirm}
            type="primary"
            onClick={() => {
              resolve(userInput);
              closeModal();
            }}
            icon={<ConfirmIcon />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
        ]}
        onClose={closeModal}
      >
        <PromptInput
          onChange={(val) => (userInput = val)}
          value={value}
          rows={rows}
        ></PromptInput>
      </Modal>,
    );
  });
}

export function showImageModal(
  img: string,
  defaultMax?: boolean,
  style?: CSSProperties,
  boxStyle?: CSSProperties,
) {
  showModal({
    title: Locale.Export.Image.Modal,
    defaultMax: defaultMax,
    children: (
      <div style={{ display: "flex", justifyContent: "center", ...boxStyle }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Modal previews render caller-provided blob/data/runtime image URLs that cannot use next/image optimization safely. */}
        <img
          src={img}
          alt="preview"
          style={
            style ?? {
              maxWidth: "100%",
            }
          }
        ></img>
      </div>
    ),
  });
}

export function Selector<T>(props: {
  items: Array<{
    title: string;
    subTitle?: string;
    value: T;
    disable?: boolean;
  }>;
  defaultSelectedValue?: T[] | T;
  onSelection?: (selection: T[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}) {
  const [selectedValues, setSelectedValues] = useState<T[]>(
    Array.isArray(props.defaultSelectedValue)
      ? props.defaultSelectedValue
      : props.defaultSelectedValue !== undefined
        ? [props.defaultSelectedValue]
        : [],
  );

  const handleSelection = (e: MouseEvent, value: T) => {
    if (props.multiple) {
      e.stopPropagation();
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      props.onSelection?.(newSelectedValues);
    } else {
      setSelectedValues([value]);
      props.onSelection?.([value]);
      props.onClose?.();
    }
  };

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          props.onClose?.();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles["selector"]} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={styles["selector-content"]}
        >
          <DialogPrimitive.Title className={styles["sr-only"]}>
            Select an option
          </DialogPrimitive.Title>
          <List>
            {props.items.map((item, i) => {
              const selected = selectedValues.includes(item.value);
              return (
                <ListItem
                  className={clsx(styles["selector-item"], {
                    [styles["selector-item-disabled"]]: item.disable,
                  })}
                  key={i}
                  title={item.title}
                  subTitle={item.subTitle}
                  icon={<Avatar model={item.value as string} />}
                  onClick={(e) => {
                    if (item.disable) {
                      e.stopPropagation();
                    } else {
                      handleSelection(e, item.value);
                    }
                  }}
                >
                  {selected ? (
                    <div
                      style={{
                        height: 10,
                        width: 10,
                        backgroundColor: "var(--primary)",
                        borderRadius: 10,
                      }}
                    ></div>
                  ) : (
                    <></>
                  )}
                </ListItem>
              );
            })}
          </List>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function FullScreen(props: any) {
  const { children, right = 10, top = 10, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);
  useEffect(() => {
    const handleScreenChange = (e: any) => {
      if (e.target === ref.current) {
        setFullScreen(!!document.fullscreenElement);
      }
    };
    document.addEventListener("fullscreenchange", handleScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleScreenChange);
    };
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }} {...rest}>
      <div style={{ position: "absolute", right, top }}>
        <IconButton
          icon={fullScreen ? <MinIcon /> : <MaxIcon />}
          onClick={toggleFullscreen}
          bordered
        />
      </div>
      {children}
    </div>
  );
}
