import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActivateProviderDto {
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}

export class VerifyProviderDto {
  @IsString()
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED' | 'PENDING';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateVerificationDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDocumentStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
