import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SearchTrigger } from "@/components/search/SearchTrigger";

/**
 * Trade-page header: logo (links home) · market search · Log in / Sign up.
 * Same logo treatment as the landing page.
 *
 * TODO(api): hook Log in / Sign up to your auth flow.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-30 grid h-14 shrink-0 grid-cols-[1fr_minmax(0,520px)_1fr] items-center gap-4 border-b border-line bg-bg/85 px-4 backdrop-blur-xl">
      <Link
        href="/"
        aria-label="LordsPot home"
        className="justify-self-start rounded-lg transition-opacity duration-200 hover:opacity-80 active:opacity-60"
      >
        <Logo />
      </Link>

      <SearchTrigger variant="header" />

      <div className="flex items-center gap-2 justify-self-end">
        <button type="button" className="btn btn-secondary btn-sm">
          Log in
        </button>
        <button type="button" className="btn btn-primary btn-sm">
          Sign up
        </button>
      </div>
    </header>
  );
}
