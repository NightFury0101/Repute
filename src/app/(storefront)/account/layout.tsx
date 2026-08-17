import { Container } from "@/components/ui/container";
import { AccountNav, MobileAccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-8 sm:mb-10">My Account</h1>
        <MobileAccountNav />
        <div className="grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <AccountNav />
            </div>
          </aside>
          <div>{children}</div>
        </div>
      </Container>
    </div>
  );
}
