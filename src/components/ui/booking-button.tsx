"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCalendlyEventListener, PopupModal } from "react-calendly";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

interface BookingButtonProps {
  programId: string;
  programName: string;
  pricing?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BookingButton({ programId, programName, pricing, className, children }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useCalendlyEventListener({
    onEventScheduled: async (e) => {
      // Event scheduled, close modal and initiate stripe checkout
      setIsOpen(false);
      setLoading(true);
      toast.loading("Preparing checkout...", { id: "checkout" });
      
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ programId, programName }),
        });
        
        const data = await res.json();
        if (data.url) {
          toast.success("Redirecting to Stripe...", { id: "checkout" });
          window.location.href = data.url;
        } else {
          toast.error("Checkout failed.", { id: "checkout" });
          setLoading(false);
        }
      } catch (err) {
        toast.error("Error creating checkout session", { id: "checkout" });
        console.error("Error creating checkout session", err);
        setLoading(false);
      }
    },
  });

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsOpen(true);
  };

  if (!isClient) return <Button className={className}>{children || "Join Program"}</Button>;

  return (
    <>
      <Button className={className} onClick={handleClick} disabled={loading}>
        {loading ? <Spinner className="h-4 w-4" /> : (children || "Join Program")}
      </Button>
      <PopupModal
        url="https://calendly.com/your-calendly-link" // Ensure user updates this
        onModalClose={() => setIsOpen(false)}
        open={isOpen}
        rootElement={document.getElementById("root") || document.body}
      />
    </>
  );
}
