import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  providerId: number;

  @IsString()
  @IsNotEmpty()
  serviceTitle: string;

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  estimatedTimeRange?: string;

  @IsOptional()
  @IsString()
  locationZone?: string;

  @IsOptional()
  @IsString()
  dateString?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  teamBookingId?: string;

  @IsOptional()
  @IsString()
  teamProjectName?: string;

  @IsOptional()
  @IsNumber()
  teamMembersCount?: number;
}

export class UpdateBookingStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'CONFIRMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO' | 'RECHAZADO';

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  rejectionExplanation?: string;
}

export class PayPlatformDebtDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
