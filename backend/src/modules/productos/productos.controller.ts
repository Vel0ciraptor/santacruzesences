import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Optional } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('productos')
export class ProductosController {
  constructor(private service: ProductosService) {}

  // Endpoint público — catálogo
  @Get()
  findAll(@Query('activos') activos: string) {
    return this.service.findAll(activos === 'true');
  }

  // Endpoint para escáner QR — requiere auth
  @UseGuards(JwtAuthGuard)
  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.service.findBySku(sku);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductoDto, @CurrentUser('id') adminId: string) {
    return this.service.create(dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
