'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CountryTenant,
  TenantCity,
  getCountriesRegistry,
  detectCountryFromHostname,
  setActiveCountryId,
  PRECONFIGURED_COUNTRIES,
} from '@/lib/countries-data';

interface CountryContextType {
  currentCountry: CountryTenant;
  availableCountries: CountryTenant[];
  currentCities: TenantCity[];
  selectCountry: (countryId: string) => void;
  formatCurrency: (amount: number) => string;
}

const CountryContext = createContext<CountryContextType>({
  currentCountry: PRECONFIGURED_COUNTRIES[0],
  availableCountries: PRECONFIGURED_COUNTRIES,
  currentCities: PRECONFIGURED_COUNTRIES[0].cities.filter((c) => c.active),
  selectCountry: () => {},
  formatCurrency: (amount: number) => `$ ${amount.toLocaleString()}`,
});

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [availableCountries, setAvailableCountries] = useState<CountryTenant[]>(PRECONFIGURED_COUNTRIES);
  const [currentCountry, setCurrentCountry] = useState<CountryTenant>(PRECONFIGURED_COUNTRIES[0]);

  useEffect(() => {
    // 1. Cargar registro de países
    const countries = getCountriesRegistry();
    setAvailableCountries(countries);

    // 2. Detectar país inicial
    const detected = detectCountryFromHostname();
    setCurrentCountry(detected);

    // 3. Escuchar cambios de países o de país activo
    const handleRegistryUpdate = () => {
      const updatedList = getCountriesRegistry();
      setAvailableCountries(updatedList);
      const match = updatedList.find((c) => c.id === currentCountry.id);
      if (match) setCurrentCountry(match);
    };

    const handleCountryChanged = (e: any) => {
      const newCountryId = e.detail;
      const updatedList = getCountriesRegistry();
      const match = updatedList.find((c) => c.id === newCountryId || c.code === newCountryId);
      if (match) setCurrentCountry(match);
    };

    window.addEventListener('countries-registry-updated', handleRegistryUpdate);
    window.addEventListener('country-changed', handleCountryChanged);
    window.addEventListener('storage', handleRegistryUpdate);

    return () => {
      window.removeEventListener('countries-registry-updated', handleRegistryUpdate);
      window.removeEventListener('country-changed', handleCountryChanged);
      window.removeEventListener('storage', handleRegistryUpdate);
    };
  }, []);

  const selectCountry = (countryId: string) => {
    const match = availableCountries.find((c) => c.id === countryId || c.code === countryId);
    if (match) {
      setCurrentCountry(match);
      setActiveCountryId(match.id);
    }
  };

  const formatCurrency = (amount: number): string => {
    try {
      const sym = currentCountry.currencySymbol || '$';
      const formatted = Number(amount || 0).toLocaleString('es-CO');
      return `${sym} ${formatted} ${currentCountry.code}`;
    } catch {
      return `$ ${amount}`;
    }
  };

  const currentCities = currentCountry.cities ? currentCountry.cities.filter((c) => c.active) : [];

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        availableCountries,
        currentCities,
        selectCountry,
        formatCurrency,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
