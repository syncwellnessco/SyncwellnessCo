import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn("min-h-screen pt-[72px] lg:pt-24", className || "bg-cream")}>
      {children}
    </main>
  );
}
