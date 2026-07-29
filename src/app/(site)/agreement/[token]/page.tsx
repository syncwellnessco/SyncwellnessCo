import { getServiceSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { AgreementForm } from "@/app/(site)/agreement/[token]/agreement-form";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function AgreementPage({ params }: PageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const supabase = getServiceSupabase();

  // Fetch the purchase details
  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("agreementToken", token)
    .maybeSingle();

  if (error || !purchase) {
    console.warn(`Coaching Agreement Page error: Token not found: ${token}`);
    notFound();
  }

  // Fetch the program details
  const { data: program } = await supabase
    .from("programs")
    .select("title, duration, included")
    .eq("id", purchase.program_id)
    .maybeSingle();

  const programTitle = program?.title || "our coaching program";
  const dateVal = purchase.created_at || purchase.createdat;
  const purchaseDate = dateVal
    ? new Date(dateVal).toLocaleDateString()
    : "Unknown";

  return (
    <PageShell>
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <AgreementForm
            token={token}
            name={purchase.name || "Guest Client"}
            programTitle={programTitle}
            programDuration={program?.duration || "3 months"}
            programIncluded={program?.included || []}
            purchaseDate={purchaseDate}
            initialStatus={purchase.agreementStatus || "Pending"}
            acceptedAt={purchase.agreementAcceptedAt}
            ip={purchase.agreementIp}
            userAgent={purchase.agreementUserAgent}
          />
        </div>
      </div>
    </PageShell>
  );
}
