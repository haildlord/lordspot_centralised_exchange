import Link from "next/link";
import { DEFAULT_MARKET, tradeHref } from "@/lib/config";
import { Logo } from "@/components/ui/Logo";

/**
 * Landing-page header.
 * TODO(api): hook Log in / Sign up to your auth flow.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label="LordsPot home" className="rounded-lg transition-opacity duration-200 hover:opacity-80 active:opacity-60">
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <Link href={tradeHref(DEFAULT_MARKET)} className="btn btn-ghost btn-sm">
            Trade
          </Link>
          <a href="#markets" className="btn btn-ghost btn-sm">
            Markets
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm">
            Log in
          </button>
          <button type="button" className="btn btn-primary btn-sm">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
