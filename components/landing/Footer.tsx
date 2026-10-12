import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-10">
        <Logo size={26} />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fg-3">
          <button type="button" className="transition-colors hover:text-fg">Terms</button>
          <button type="button" className="transition-colors hover:text-fg">Privacy</button>
          <button type="button" className="transition-colors hover:text-fg">Support</button>
        </nav>
        <p className="text-[13px] text-fg-3">© 2026 LordsPot Exchange</p>
      </div>
    </footer>
  );
}
