'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  name?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  className = '',
  name,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    value !== undefined ? value : (defaultValue !== undefined ? defaultValue : (options[0]?.value || ''))
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const selectedOption = useMemo(() => {
    return options.find((o) => o.value === selectedValue) || options[0];
  }, [options, selectedValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    setSelectedValue(option.value);
    setIsOpen(false);

    if (onValueChange) {
      onValueChange(option.value);
    }

    if (onChange) {
      const syntheticEvent = {
        target: {
          value: option.value,
          name: name || '',
          id: id || '',
        },
        currentTarget: {
          value: option.value,
          name: name || '',
          id: id || '',
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      <input type="hidden" name={name} id={id} value={selectedOption?.value || ''} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-charcoal bg-[#FAF8F5] border border-[#EBE3DB] hover:bg-white focus:border-[#8C6D40] rounded-sm transition-all cursor-pointer ${className}`}
      >
        <span className="truncate">{selectedOption?.label || ''}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-charcoal/50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 min-w-full w-max max-w-xs bg-white rounded-md shadow-xl border border-[#EBE3DB] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 p-1">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {options.map((option) => {
              const isSelected = option.value === selectedOption?.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left ${
                    isSelected
                      ? 'bg-[#8C6D40]/10 text-[#8C6D40] font-semibold'
                      : 'text-charcoal hover:bg-[#FAF9F7]'
                  }`}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
