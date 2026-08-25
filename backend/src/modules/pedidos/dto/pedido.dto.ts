import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
  @IsString()
  productoId: string;

  @IsString()
  nombre: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  precio: number;
}

export class CreatePedidoDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  nombreClienteTexto?: string;

  @IsOptional()
  @IsString()
  telefonoTexto?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total: number;
}
