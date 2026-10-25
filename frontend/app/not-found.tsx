import Link from "next/link";
import { OpenPaletteButton } from "@/components/search/OpenPaletteButton";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="num text-[13px] font-semibold tracking-[0.2em] text-gold-400">404</p>
        <h1 className="mt-3 font-display text-[clamp(44px,8vw,72px)] leading-none tracking-tight">
          Nothing in this book.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] text-fg-2">
          We couldn&apos;t find that market or page. Check the pair, or search for another.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary btn-lg">
            Back home
          </Link>
          <OpenPaletteButton className="btn btn-secondary btn-lg">Search markets</OpenPaletteButton>
        </div>
      </div>
    </main>
  );
}
