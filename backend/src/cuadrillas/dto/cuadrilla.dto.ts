import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CuadrillaMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  experience: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;
}

export class CreateCuadrillaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsString()
  @IsNotEmpty()
  leaderName: string;

  @IsOptional()
  @IsString()
  leaderPhone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  hourlyRate: number;

  @IsNumber()
  dailyRate: number;

  @IsNumber()
  fulfillmentRate: number;

  @IsOptional()
  @IsString()
  preferredPricingModel?: string;

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsOptional()
  @IsString()
  coverage?: string;

  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CuadrillaMemberDto)
  members: CuadrillaMemberDto[];
}

export class CreateCuadrillaProposalDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  pricingModel: string; // 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO'

  @IsNumber()
  proposedRate: number;

  @IsString()
  @IsNotEmpty()
  estimatedDuration: string;

  @IsOptional()
  @IsString()
  agreementNotes?: string;
}

export class UpdateProposalStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // 'PROPUESTA_ENVIADA' | 'EN_NEGOCIACION' | 'ACUERDO_PACTADO' | 'RECHAZADO'

  @IsOptional()
  @IsString()
  agreementNotes?: string;
}
