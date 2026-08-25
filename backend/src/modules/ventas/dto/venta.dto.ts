import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VentaDetalleDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleDto)
  detalles: VentaDetalleDto[];
}
