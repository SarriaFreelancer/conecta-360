// lib/countries-data.ts
// Gestión Multi-País y Multi-Tenancy para Conecta 360

export interface TenantCity {
  name: string;
  province: string; // Departamento, Estado o Provincia
  active: boolean;
}

export interface TenantDbConfig {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  status: 'CONNECTED' | 'PROVISIONING' | 'DISCONNECTED';
}

export interface CountryTenant {
  id: string; // ISO code: CO, MX, ES, US, PE, CL
  code: string;
  name: string;
  flag: string; // Emoji
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  domain: string; // ej: conecta360.com.co, conecta360.mx
  hostingEndpoint: string; // ej: https://api.co.conecta360.com o /api
  dbConfig: TenantDbConfig;
  defaultCity: string;
  defaultDepartment: string;
  cities: TenantCity[];
  platformCommission: number; // Porcentaje (%)
  minPlatformFee: number; // En moneda local
  minHourlyRate: number; // En moneda local
  status: 'ACTIVE' | 'MAINTENANCE' | 'PLANNED';
  isDefault?: boolean;
}

export const PRECONFIGURED_COUNTRIES: CountryTenant[] = [
  {
    id: 'CO',
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP ($)',
    currencySymbol: '$',
    phonePrefix: '+57',
    domain: 'conecta360.com.co',
    hostingEndpoint: 'https://api.conecta360.com.co',
    dbConfig: {
      dbHost: 'localhost',
      dbPort: 3306,
      dbName: 'conecta360_co',
      dbUser: 'conecta360_user',
      status: 'CONNECTED'
    },
    defaultCity: 'Cali',
    defaultDepartment: 'Valle del Cauca',
    cities: [
      { name: 'Cali', province: 'Valle del Cauca', active: true },
      { name: 'Jamundí', province: 'Valle del Cauca', active: true },
      { name: 'Yumbo', province: 'Valle del Cauca', active: true },
      { name: 'Palmira', province: 'Valle del Cauca', active: true },
      { name: 'Buga', province: 'Valle del Cauca', active: true },
      { name: 'Tuluá', province: 'Valle del Cauca', active: true },
      { name: 'Bogotá D.C.', province: 'Cundinamarca', active: true },
      { name: 'Medellín', province: 'Antioquia', active: true },
      { name: 'Barranquilla', province: 'Atlántico', active: true },
      { name: 'Bucaramanga', province: 'Santander', active: true },
      { name: 'Cartago', province: 'Valle del Cauca', active: false },
      { name: 'Buenaventura', province: 'Valle del Cauca', active: false }
    ],
    platformCommission: 5.0,
    minPlatformFee: 2500,
    minHourlyRate: 25000,
    status: 'ACTIVE',
    isDefault: true
  },
  {
    id: 'MX',
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    currency: 'MXN ($)',
    currencySymbol: '$',
    phonePrefix: '+52',
    domain: 'conecta360.mx',
    hostingEndpoint: 'https://api.conecta360.mx',
    dbConfig: {
      dbHost: 'db-mx.internal.conecta360.com',
      dbPort: 3306,
      dbName: 'conecta360_mx',
      dbUser: 'conecta360_mx_user',
      status: 'CONNECTED'
    },
    defaultCity: 'Ciudad de México',
    defaultDepartment: 'CDMX',
    cities: [
      { name: 'Ciudad de México', province: 'CDMX', active: true },
      { name: 'Guadalajara', province: 'Jalisco', active: true },
      { name: 'Monterrey', province: 'Nuevo León', active: true },
      { name: 'Puebla', province: 'Puebla', active: true },
      { name: 'Querétaro', province: 'Querétaro', active: true },
      { name: 'Mérida', province: 'Yucatán', active: true },
      { name: 'Cancún', province: 'Quintana Roo', active: true },
      { name: 'Tijuana', province: 'Baja California', active: true }
    ],
    platformCommission: 6.0,
    minPlatformFee: 35,
    minHourlyRate: 150,
    status: 'ACTIVE'
  },
  {
    id: 'ES',
    code: 'ES',
    name: 'España',
    flag: '🇪🇸',
    currency: 'EUR (€)',
    currencySymbol: '€',
    phonePrefix: '+34',
    domain: 'conecta360.es',
    hostingEndpoint: 'https://api.conecta360.es',
    dbConfig: {
      dbHost: 'db-es.internal.conecta360.com',
      dbPort: 3306,
      dbName: 'conecta360_es',
      dbUser: 'conecta360_es_user',
      status: 'CONNECTED'
    },
    defaultCity: 'Madrid',
    defaultDepartment: 'Comunidad de Madrid',
    cities: [
      { name: 'Madrid', province: 'Madrid', active: true },
      { name: 'Barcelona', province: 'Cataluña', active: true },
      { name: 'Valencia', province: 'Comunidad Valenciana', active: true },
      { name: 'Sevilla', province: 'Andalucía', active: true },
      { name: 'Málaga', province: 'Andalucía', active: true },
      { name: 'Bilbao', province: 'País Vasco', active: true },
      { name: 'Zaragoza', province: 'Aragón', active: true }
    ],
    platformCommission: 7.5,
    minPlatformFee: 4,
    minHourlyRate: 20,
    status: 'ACTIVE'
  },
  {
    id: 'PE',
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    currency: 'PEN (S/)',
    currencySymbol: 'S/',
    phonePrefix: '+51',
    domain: 'conecta360.pe',
    hostingEndpoint: 'https://api.conecta360.pe',
    dbConfig: {
      dbHost: 'db-pe.internal.conecta360.com',
      dbPort: 3306,
      dbName: 'conecta360_pe',
      dbUser: 'conecta360_pe_user',
      status: 'CONNECTED'
    },
    defaultCity: 'Lima',
    defaultDepartment: 'Lima Metropolitana',
    cities: [
      { name: 'Lima', province: 'Lima', active: true },
      { name: 'Arequipa', province: 'Arequipa', active: true },
      { name: 'Trujillo', province: 'La Libertad', active: true },
      { name: 'Cusco', province: 'Cusco', active: true },
      { name: 'Chiclayo', province: 'Lambayeque', active: true },
      { name: 'Piura', province: 'Piura', active: true }
    ],
    platformCommission: 5.5,
    minPlatformFee: 8,
    minHourlyRate: 35,
    status: 'ACTIVE'
  },
  {
    id: 'US',
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    currency: 'USD ($)',
    currencySymbol: '$',
    phonePrefix: '+1',
    domain: 'conecta360.us',
    hostingEndpoint: 'https://api.conecta360.us',
    dbConfig: {
      dbHost: 'db-us.internal.conecta360.com',
      dbPort: 3306,
      dbName: 'conecta360_us',
      dbUser: 'conecta360_us_user',
      status: 'CONNECTED'
    },
    defaultCity: 'Miami',
    defaultDepartment: 'Florida',
    cities: [
      { name: 'Miami', province: 'Florida', active: true },
      { name: 'Orlando', province: 'Florida', active: true },
      { name: 'Houston', province: 'Texas', active: true },
      { name: 'Los Angeles', province: 'California', active: true },
      { name: 'New York', province: 'New York', active: true },
      { name: 'Chicago', province: 'Illinois', active: true }
    ],
    platformCommission: 8.0,
    minPlatformFee: 5,
    minHourlyRate: 30,
    status: 'ACTIVE'
  }
];

const COUNTRIES_STORAGE_KEY = 'conecta360_countries_registry';
const ACTIVE_COUNTRY_KEY = 'conecta360_active_country_id';

export function getCountriesRegistry(): CountryTenant[] {
  if (typeof window === 'undefined') return PRECONFIGURED_COUNTRIES;
  try {
    const raw = localStorage.getItem(COUNTRIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading countries registry:', err);
  }
  return PRECONFIGURED_COUNTRIES;
}

export function saveCountriesRegistry(countries: CountryTenant[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUNTRIES_STORAGE_KEY, JSON.stringify(countries));
    window.dispatchEvent(new Event('countries-registry-updated'));
  } catch (err) {
    console.error('Error saving countries registry:', err);
  }
}

export function getCountryByCode(code: string): CountryTenant | undefined {
  const all = getCountriesRegistry();
  return all.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function detectCountryFromHostname(): CountryTenant {
  if (typeof window === 'undefined') return PRECONFIGURED_COUNTRIES[0];
  
  // 1. Verificar si hay un país explícitamente guardado en sesión
  const savedId = localStorage.getItem(ACTIVE_COUNTRY_KEY);
  const allCountries = getCountriesRegistry();
  if (savedId) {
    const match = allCountries.find((c) => c.id === savedId || c.code === savedId);
    if (match) return match;
  }

  // 2. Detección automática por dominio
  const host = window.location.hostname.toLowerCase();
  for (const c of allCountries) {
    if (c.domain && (host === c.domain.toLowerCase() || host.endsWith('.' + c.domain.toLowerCase()))) {
      return c;
    }
  }

  // 3. Fallback al país por defecto (Colombia)
  const defaultCountry = allCountries.find((c) => c.isDefault) || allCountries[0];
  return defaultCountry;
}

export function setActiveCountryId(countryId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_COUNTRY_KEY, countryId);
  window.dispatchEvent(new CustomEvent('country-changed', { detail: countryId }));
}

export function upsertCountry(country: CountryTenant): CountryTenant[] {
  const current = getCountriesRegistry();
  const existingIdx = current.findIndex((c) => c.id === country.id || c.code === country.code);
  let updated: CountryTenant[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...country };
  } else {
    updated = [...current, country];
  }
  saveCountriesRegistry(updated);
  return updated;
}

export function deleteCountry(countryId: string): CountryTenant[] {
  const current = getCountriesRegistry();
  const updated = current.filter((c) => c.id !== countryId && !c.isDefault);
  saveCountriesRegistry(updated);
  return updated;
}
