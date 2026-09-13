export class TenantDbConfigDto {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  status: string;
}

export class TenantCityDto {
  name: string;
  province: string;
  active: boolean;
}

export class TenantCountryDto {
  id: string;
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  domain: string;
  hostingEndpoint: string;
  dbConfig: TenantDbConfigDto;
  defaultCity: string;
  defaultDepartment: string;
  cities: TenantCityDto[];
  platformCommission: number;
  minPlatformFee: number;
  minHourlyRate: number;
  status: string;
  isDefault?: boolean;
}
