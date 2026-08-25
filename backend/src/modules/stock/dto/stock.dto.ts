import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type TipoMovimientoStock = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export class MovimientoStockDto {
  @IsString()
  productoId: string;

  @IsString()
  tipo: TipoMovimientoStock;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
