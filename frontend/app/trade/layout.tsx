import { TopBar } from "@/components/shell/TopBar";

/** Top bar (logo · search · auth) above every /trade/* page. */
export default function TradeLayout({ children }: LayoutProps<"/trade">) {
  return (
    <>
      <TopBar />
      <main className="flex-1">{children}</main>
    </>
  );
}
