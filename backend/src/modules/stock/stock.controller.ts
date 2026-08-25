import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { MovimientoStockDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('stock')
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('movimientos')
  getMovimientos() {
    return this.service.getMovimientos();
  }

  @Get('alertas')
  getAlertas() {
    return this.service.getAlertasRaw();
  }

  @Post('movimiento')
  registrar(@Body() dto: MovimientoStockDto, @CurrentUser('id') uid: string) {
    return this.service.registrarMovimiento(dto, uid);
  }
}
