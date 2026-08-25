import { IsBoolean, IsHexColor, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePremioDto {
  @IsString()
  texto: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  peso?: number;
}

export class UpdatePremioDto {
  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  peso?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
