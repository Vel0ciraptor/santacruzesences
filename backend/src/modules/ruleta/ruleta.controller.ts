import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RuletaService } from './ruleta.service';
import { CreatePremioDto, UpdatePremioDto } from './dto/premio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('premios')
export class RuletaController {
  constructor(private service: RuletaService) {}

  // Vendedor puede ver los premios para mostrar la ruleta
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  findAllAdmin() { return this.service.findAllAdmin(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePremioDto) { return this.service.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePremioDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
