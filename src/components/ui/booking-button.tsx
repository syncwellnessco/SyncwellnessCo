"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCalendlyEventListener, PopupModal } from "react-calendly";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/user-store";

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useCalendlyEventListener({
    onEventScheduled: async (e) => {
      // Event scheduled, close modal and initiate stripe checkout
      setIsOpen(false);
      
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
          window.location.href = data.url;
        }
      } catch (err) {
        console.error("Error creating checkout session", err);
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

  if (!isClient) return <Button className={className}>{children || "Book Discovery Call"}</Button>;

  return (
    <>
      <Button className={className} onClick={handleClick}>
        {children || "Book Discovery Call"}
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
