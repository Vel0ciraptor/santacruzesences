import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/venta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(private service: VentasService) {}

  @Post()
  @Roles('VENDEDOR', 'ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateVentaDto, @CurrentUser('id') uid: string) {
    return this.service.create(dto, uid);
  }

  @Get()
  findAll(@CurrentUser('id') uid: string, @CurrentUser('rol') rol: string) {
    return this.service.findAll(uid, rol);
  }

  @Get('reportes/resumen')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  resumen(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.service.getResumen(desde, hasta);
  }

  @Get('reportes/top-productos')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  topProductos(@Query('limite') limite: string) {
    return this.service.getTopProductos(parseInt(limite) || 5);
  }
}
