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
