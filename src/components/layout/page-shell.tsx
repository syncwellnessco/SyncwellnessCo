import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

export function PageShell({ children, className, noPadding = false }: PageShellProps) {
  return (
    <main className={cn(
      "min-h-screen bg-cream",
      noPadding ? "pt-0" : "pt-[72px] lg:pt-24",
      className
    )}>
      {children}
    </main>
  );
}
