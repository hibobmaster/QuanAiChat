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
