import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/pedido.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pedidos')
export class PedidosController {
  constructor(private service: PedidosService) {}

  // Público — desde catálogo
  @Post()
  create(@Body() dto: CreatePedidoDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser('id') uid: string, @CurrentUser('rol') rol: string) {
    return this.service.findAll(uid, rol);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDEDOR', 'ADMIN')
  @Patch(':id/confirmar')
  confirmar(@Param('id') id: string, @CurrentUser('id') uid: string) {
    return this.service.confirmar(id, uid);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDEDOR', 'ADMIN')
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string, @CurrentUser('id') uid: string) {
    return this.service.rechazar(id, uid);
  }
}
