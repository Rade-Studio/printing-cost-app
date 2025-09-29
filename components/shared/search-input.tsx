"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface SearchInputProps {
  placeholder?: string;
  debounceMs?: number;
  onSearchChange: (searchTerm: string) => void;
  value?: string; // <- valor inicial o externo
  className?: string;
  disabled?: boolean;
  clearTrigger?: number; // <- trigger para limpiar sin perder foco
}

export function SearchInput({
  placeholder = "Buscar...",
  debounceMs = 500,
  onSearchChange,
  value = "",
  className = "",
  disabled = false,
  clearTrigger,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value); // <- estado local real
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // NO sincronizar con valor externo para evitar pérdida de foco
  // useEffect(() => {
  //   if (value === "" && localValue !== "") {
  //     setLocalValue(value);
  //   }
  // }, [value]);

  // Solo limpiar cuando se dispare el clearTrigger
  useEffect(() => {
    if (clearTrigger && clearTrigger > 0) {
      setLocalValue("");
      onSearchChange("");
    }
  }, [clearTrigger, onSearchChange]);

  const handleChange = (val: string) => {
    setLocalValue(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(val);
      setIsSearching(false);
    }, debounceMs);
  };

  const clearSearch = () => {
    setLocalValue("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    onSearchChange("");
    setIsSearching(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={localValue} // <- controlado por estado local
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10"
        disabled={disabled}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      {localValue && (
        <button
          onClick={clearSearch}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
