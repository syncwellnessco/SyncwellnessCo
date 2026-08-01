"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  value = "",
  onChange,
  placeholder = "Add tag & press Enter or comma...",
  className,
  disabled = false,
  maxTags = 50,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to parse comma-separated string to array of clean tag strings
  const parseTags = (str: string): string[] => {
    if (!str) return [];
    return str
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const tags = parseTags(value);

  // Emit updated tags as comma separated string
  const updateTags = (newTags: string[]) => {
    if (onChange) {
      onChange(newTags.join(", "));
    }
  };

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;

    // Split if tagToAdd contains commas (e.g. pasted text or comma typed)
    const candidates = trimmed
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated = [...tags];
    let changed = false;

    for (const cand of candidates) {
      // Avoid duplicate tags (case insensitive comparison)
      if (
        !updated.some((t) => t.toLowerCase() === cand.toLowerCase()) &&
        updated.length < maxTags
      ) {
        updated.push(cand);
        changed = true;
      }
    }

    if (changed) {
      updateTags(updated);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    const updated = tags.filter((_, index) => index !== indexToRemove);
    updateTags(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes(",")) {
      e.preventDefault();
      addTag(pastedText);
    }
  };

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "w-full min-h-[44px] max-h-[110px] overflow-y-auto rounded-md border border-[#EBE3DB] bg-[#FAF8F5] p-2 text-sm text-charcoal shadow-sm transition-colors",
          "focus-within:border-[#8C6D40] focus-within:ring-1 focus-within:ring-[#8C6D40]",
          "flex flex-wrap items-center gap-1.5 cursor-text select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-[#8C6D40]/10 border border-[#8C6D40]/20 text-[#8C6D40] px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[#8C6D40]/15"
          >
            <span className="max-w-[180px] truncate" title={tag}>
              {tag}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="rounded-full p-0.5 text-[#8C6D40]/70 hover:bg-[#8C6D40]/20 hover:text-[#8C6D40] focus:outline-none transition-colors cursor-pointer"
                title="Remove tag"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none border-none p-0.5 h-7"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-charcoal/50 px-1">
          <span>{tags.length} tag{tags.length !== 1 ? "s" : ""} added</span>
          {tags.length >= maxTags && (
            <span className="text-amber-600 font-medium">Max tags reached ({maxTags})</span>
          )}
        </div>
      )}
    </div>
  );
}
