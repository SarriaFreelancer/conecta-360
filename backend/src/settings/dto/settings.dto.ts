import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  platformName?: string;

  @IsOptional()
  @IsString()
  primarySlogan?: string;

  @IsOptional()
  @IsString()
  secondarySlogan?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  defaultCity?: string;

  @IsOptional()
  @IsString()
  defaultDepartment?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsString()
  supportWhatsApp?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformCommission?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPlatformFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minHourlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  freePlanMaxServices?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxActivitiesPerService?: number;

  @IsOptional()
  @IsBoolean()
  requireIdentityVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  requirePoliceRecord?: boolean;

  @IsOptional()
  @IsBoolean()
  cashTransferDebtEnabled?: boolean;
}
