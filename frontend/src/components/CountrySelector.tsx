'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCountry } from '@/context/CountryContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function CountrySelector() {
  const { currentCountry, availableCountries, selectCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        title="Seleccionar país y moneda"
        aria-label="Seleccionar país"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{currentCountry.flag}</span>
        <span className="hidden sm:inline font-medium">{currentCountry.name}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">({currentCountry.code})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Selecciona tu país</span>
            </span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-[#0056d2] dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
              Multi-Tenant
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {availableCountries.map((c) => {
              const isSelected = c.id === currentCountry.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    selectCountry(c.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0056d2] dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span>{c.name}</span>
                        {c.isDefault && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">
                            Sede
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                        {c.currency} • {c.cities.filter((ci) => ci.active).length} ciudades
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#0056d2] dark:text-blue-400" />}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
            Filtra automáticamente servicios, cuadrillas y cotizaciones en la moneda local.
          </div>
        </div>
      )}
    </div>
  );
}
