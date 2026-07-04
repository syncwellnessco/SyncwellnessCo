import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-16">{children}</main>
      <Footer />
    </>
  );
}
