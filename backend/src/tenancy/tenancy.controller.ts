import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenantCountryDto } from './dto/tenant.dto';

@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get('countries')
  getAllCountries() {
    return this.tenancyService.getAllCountries();
  }

  @Get('countries/:code')
  getCountryByCode(@Param('code') code: string) {
    return this.tenancyService.getCountryByCode(code);
  }

  @Post('countries')
  upsertCountry(@Body() dto: TenantCountryDto) {
    return this.tenancyService.upsertCountry(dto);
  }

  @Get('resolve')
  resolveTenant(
    @Headers('x-country-code') countryCode?: string,
    @Headers('host') host?: string,
  ) {
    return this.tenancyService.resolveTenantConnection(countryCode, host);
  }
}
