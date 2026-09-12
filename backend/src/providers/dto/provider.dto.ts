import { IsBoolean, IsOptional } from 'class-validator';

export class ActivateProviderDto {
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
