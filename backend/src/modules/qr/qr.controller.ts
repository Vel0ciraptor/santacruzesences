import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('qr')
export class QrController {
  constructor(private service: QrService) {}

  @Get('productos')
  getProductos() {
    return this.service.getProductosParaQr();
  }

  @Get('generar/:productoId')
  generar(@Param('productoId') id: string) {
    return this.service.generarQr(id);
  }

  @Post('lote')
  lote(@Body() body: { productoIds: string[] }) {
    return this.service.generarLote(body.productoIds);
  }
}
