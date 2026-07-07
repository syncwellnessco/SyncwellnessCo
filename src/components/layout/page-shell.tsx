type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-cream pt-[72px] lg:pt-24">{children}</main>
  );
}
