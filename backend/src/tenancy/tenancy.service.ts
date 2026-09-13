import { Injectable } from '@nestjs/common';
import { TenantCountryDto } from './dto/tenant.dto';

@Injectable()
export class TenancyService {
  private countriesRegistry: TenantCountryDto[] = [
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
        status: 'CONNECTED',
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
      ],
      platformCommission: 5.0,
      minPlatformFee: 2500,
      minHourlyRate: 25000,
      status: 'ACTIVE',
      isDefault: true,
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
        status: 'CONNECTED',
      },
      defaultCity: 'Ciudad de México',
      defaultDepartment: 'CDMX',
      cities: [
        { name: 'Ciudad de México', province: 'CDMX', active: true },
        { name: 'Guadalajara', province: 'Jalisco', active: true },
        { name: 'Monterrey', province: 'Nuevo León', active: true },
        { name: 'Puebla', province: 'Puebla', active: true },
        { name: 'Querétaro', province: 'Querétaro', active: true },
      ],
      platformCommission: 6.0,
      minPlatformFee: 35,
      minHourlyRate: 150,
      status: 'ACTIVE',
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
        status: 'CONNECTED',
      },
      defaultCity: 'Madrid',
      defaultDepartment: 'Comunidad de Madrid',
      cities: [
        { name: 'Madrid', province: 'Madrid', active: true },
        { name: 'Barcelona', province: 'Cataluña', active: true },
        { name: 'Valencia', province: 'Comunidad Valenciana', active: true },
        { name: 'Sevilla', province: 'Andalucía', active: true },
      ],
      platformCommission: 7.5,
      minPlatformFee: 4,
      minHourlyRate: 20,
      status: 'ACTIVE',
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
        status: 'CONNECTED',
      },
      defaultCity: 'Lima',
      defaultDepartment: 'Lima Metropolitana',
      cities: [
        { name: 'Lima', province: 'Lima', active: true },
        { name: 'Arequipa', province: 'Arequipa', active: true },
        { name: 'Cusco', province: 'Cusco', active: true },
      ],
      platformCommission: 5.5,
      minPlatformFee: 8,
      minHourlyRate: 35,
      status: 'ACTIVE',
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
        status: 'CONNECTED',
      },
      defaultCity: 'Miami',
      defaultDepartment: 'Florida',
      cities: [
        { name: 'Miami', province: 'Florida', active: true },
        { name: 'Orlando', province: 'Florida', active: true },
        { name: 'Houston', province: 'Texas', active: true },
      ],
      platformCommission: 8.0,
      minPlatformFee: 5,
      minHourlyRate: 30,
      status: 'ACTIVE',
    },
  ];

  getAllCountries(): TenantCountryDto[] {
    return this.countriesRegistry;
  }

  getCountryByCode(code: string): TenantCountryDto | undefined {
    return this.countriesRegistry.find(
      (c) => c.code.toUpperCase() === code.toUpperCase(),
    );
  }

  upsertCountry(country: TenantCountryDto): TenantCountryDto {
    const idx = this.countriesRegistry.findIndex(
      (c) => c.id === country.id || c.code === country.code,
    );
    if (idx >= 0) {
      this.countriesRegistry[idx] = { ...this.countriesRegistry[idx], ...country };
    } else {
      this.countriesRegistry.push(country);
    }
    return country;
  }

  resolveTenantConnection(countryCode?: string, hostname?: string): { dbName: string; host: string } {
    let country: TenantCountryDto | undefined;
    if (countryCode) {
      country = this.getCountryByCode(countryCode);
    }
    if (!country && hostname) {
      country = this.countriesRegistry.find((c) =>
        hostname.toLowerCase().includes(c.domain.toLowerCase()),
      );
    }
    const target = country || this.countriesRegistry[0];
    return {
      dbName: target.dbConfig.dbName,
      host: target.dbConfig.dbHost,
    };
  }
}
