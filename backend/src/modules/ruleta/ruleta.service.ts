import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePremioDto, UpdatePremioDto } from './dto/premio.dto';

@Injectable()
export class RuletaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.premio.findMany({ where: { activo: true }, orderBy: { peso: 'desc' } });
  }

  async findAllAdmin() {
    return this.prisma.premio.findMany({ orderBy: { peso: 'desc' } });
  }

  async create(dto: CreatePremioDto) {
    return this.prisma.premio.create({ data: dto });
  }

  async update(id: string, dto: UpdatePremioDto) {
    const p = await this.prisma.premio.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Premio no encontrado');
    return this.prisma.premio.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const p = await this.prisma.premio.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Premio no encontrado');
    return this.prisma.premio.update({ where: { id }, data: { activo: false } });
  }
}
