import { Bot, Loader2 } from "lucide-react";

export function AppLoading(props: { noLogo?: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-label="Loading"
    >
      {!props.noLogo && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container">
          <Bot className="h-6 w-6 text-primary" />
        </div>
      )}
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
