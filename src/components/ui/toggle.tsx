"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  className?: string;
  name?: string;
}

export function Toggle({
  checked,
  onChange,
  loading: externalLoading = false,
  disabled = false,
  size = "md",
  label,
  description,
  id,
  className = "",
  name,
}: ToggleProps) {
  const [internalPending, setInternalPending] = useState(false);
  const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(null);

  const isLoading = externalLoading || internalPending;
  const isDisabled = disabled || isLoading;

  // Reset optimistic state when loading completes or prop updates
  useEffect(() => {
    if (!isLoading) {
      setOptimisticChecked(null);
    }
  }, [isLoading, checked]);

  // Determine current visual state (optimistic state -> fallback to inverted if loading -> fallback to checked)
  const displayChecked =
    optimisticChecked !== null
      ? optimisticChecked
      : isLoading
      ? !checked
      : checked;

  const handleClick = async () => {
    if (isDisabled || !onChange) return;

    const targetState = !checked;
    setOptimisticChecked(targetState);
    setInternalPending(true);

    try {
      const result = onChange(targetState);
      if (result && typeof (result as any).then === "function") {
        await result;
      }
    } catch (error) {
      console.error("Toggle action failed, reverting:", error);
      setOptimisticChecked(null); // Revert to original position on failure
    } finally {
      setInternalPending(false);
    }
  };

  // Dimensions based on size
  const dimensions = {
    sm: {
      switch: "h-4 w-7",
      knob: "h-3 w-3",
      translate: "translate-x-3",
      spinner: "h-2.5 w-2.5",
    },
    md: {
      switch: "h-5 w-9",
      knob: "h-4 w-4",
      translate: "translate-x-4",
      spinner: "h-3 w-3",
    },
    lg: {
      switch: "h-6 w-11",
      knob: "h-5 w-5",
      translate: "translate-x-5",
      spinner: "h-3.5 w-3.5",
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={displayChecked}
        id={id}
        name={name}
        disabled={isDisabled}
        onClick={handleClick}
        className={`relative inline-flex ${dimensions.switch} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8C6D40]/40 focus:ring-offset-1 ${
          isDisabled ? "opacity-75 cursor-not-allowed" : ""
        } ${displayChecked ? "bg-[#8C6D40]" : "bg-gray-200 hover:bg-gray-300"}`}
      >
        <span
          className={`pointer-events-none inline-flex items-center justify-center ${dimensions.knob} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            displayChecked ? dimensions.translate : "translate-x-0"
          }`}
        >
          {isLoading ? (
            <Loader2 className={`${dimensions.spinner} animate-spin text-[#8C6D40]`} />
          ) : null}
        </span>
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <label
              htmlFor={id}
              onClick={handleClick}
              className={`text-sm font-medium text-charcoal ${
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-charcoal/60">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
