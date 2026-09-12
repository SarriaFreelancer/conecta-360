import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  @IsOptional()
  website?: string;
}

export class UpdateProfileDto extends CreateProfileDto {}
