import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cliente.findMany({
      include: {
        creadoPor: { select: { nombre: true } },
        _count: { select: { ventas: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        ventas: {
          include: {
            detalles: { include: { producto: { select: { nombre: true, sku: true } } } },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async create(dto: CreateClienteDto, usuarioId: string) {
    return this.prisma.cliente.create({
      data: { ...dto, creadoPorId: usuarioId },
    });
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }
}
