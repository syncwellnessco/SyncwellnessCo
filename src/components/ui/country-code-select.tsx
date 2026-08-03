'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ALL_COUNTRIES, Country } from '@/data/countries';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryCodeSelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  name?: string;
  id?: string;
}

export function CountryCodeSelect({
  value,
  defaultValue = '+61',
  onChange,
  className = '',
  name,
  id,
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDialCode, setSelectedDialCode] = useState<string>(
    value !== undefined ? value : defaultValue
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when controlled value changes from outside
  useEffect(() => {
    if (value !== undefined) {
      setSelectedDialCode(value);
    }
  }, [value]);

  // Find currently selected country object
  const selectedCountry = useMemo(() => {
    return (
      ALL_COUNTRIES.find((c) => c.dialCode === selectedDialCode) ||
      ALL_COUNTRIES[0] // fallback to Australia
    );
  }, [selectedDialCode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    const q = search.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.shortCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelectCountry = (country: Country) => {
    setSelectedDialCode(country.dialCode);
    setIsOpen(false);
    setSearch('');

    if (onChange) {
      // Create a synthetic event compatible with standard HTMLSelectElement onChange
      const syntheticEvent = {
        target: {
          value: country.dialCode,
          name: name || '',
          id: id || '',
        },
        currentTarget: {
          value: country.dialCode,
          name: name || '',
          id: id || '',
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      {/* Hidden input for HTML form submissions */}
      <input type="hidden" name={name} id={id} value={selectedCountry.dialCode} />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1 px-0.5 py-1.5 font-normal text-charcoal bg-transparent hover:bg-black/5 rounded cursor-pointer transition-all focus:outline-none ${className}`}
      >
        <span className="truncate flex items-center gap-1.5 shrink min-w-0">
          <span className="text-base shrink-0">{selectedCountry.flag}</span>
          <span className="whitespace-nowrap">
            {selectedCountry.shortCode} ({selectedCountry.dialCode})
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-charcoal/50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-64 md:w-72 bg-white rounded-md shadow-xl border border-[#EBE3DB] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-[#EBE3DB] bg-[#FAF9F7] flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-charcoal/40 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none py-1"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-3 text-xs text-charcoal/50 text-center">No countries found</div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.dialCode === selectedCountry.dialCode && country.code === selectedCountry.code;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-sm transition-colors text-left ${
                      isSelected
                        ? 'bg-[#8C6D40]/10 text-[#8C6D40] font-semibold'
                        : 'text-charcoal hover:bg-[#FAF9F7]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate pr-2">
                      <span className="text-sm shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                      <span className="text-charcoal/40 font-mono text-[11px] shrink-0">({country.dialCode})</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
