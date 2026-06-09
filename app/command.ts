import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Locale from "./locales";

type Command = (param: string) => void;
interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
  code?: Command;
  settings?: Command;
}

export function useCommand(commands: Commands = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let shouldUpdate = false;
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    for (const [name, param] of Array.from(nextSearchParams.entries())) {
      const commandName = name as keyof Commands;
      if (typeof commands[commandName] === "function") {
        commands[commandName]!(param);
        nextSearchParams.delete(name);
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      const nextQuery = nextSearchParams.toString();
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams, commands]);
}

interface ChatCommands {
  new?: Command;
  newm?: Command;
  next?: Command;
  prev?: Command;
  clear?: Command;
  fork?: Command;
  del?: Command;
}

// Compatible with Chinese colon character "："
export const ChatCommandPrefix = /^[:：]/;

export function useChatCommand(commands: ChatCommands = {}) {
  function extract(userInput: string) {
    const match = userInput.match(ChatCommandPrefix);
    if (match) {
      return userInput.slice(1) as keyof ChatCommands;
    }
    return userInput as keyof ChatCommands;
  }

  function search(userInput: string) {
    const input = extract(userInput);
    const desc = Locale.Chat.Commands;
    return Object.keys(commands)
      .filter((c) => c.startsWith(input))
      .map((c) => ({
        title: desc[c as keyof ChatCommands],
        content: ":" + c,
      }));
  }

  function match(userInput: string) {
    const command = extract(userInput);
    const matched = typeof commands[command] === "function";

    return {
      matched,
      invoke: () => matched && commands[command]!(userInput),
    };
  }

  return { match, search };
}
