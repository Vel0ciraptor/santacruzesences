import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto } from './dto/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePedidoDto) {
    return this.prisma.pedido.create({
      data: {
        clienteId: dto.clienteId || null,
        nombreClienteTexto: dto.nombreClienteTexto,
        telefonoTexto: dto.telefonoTexto,
        itemsJson: JSON.stringify(dto.items),
        total: dto.total,
        estado: 'PENDIENTE',
      },
    });
  }

  async findAll(usuarioId: string, rol: string) {
    const where = rol === 'ADMIN' ? {} : { vendedorAsignadoId: usuarioId };
    const rawPedidos = await this.prisma.pedido.findMany({
      where,
      include: {
        cliente: { select: { nombre: true, telefono: true } },
        vendedorAsignado: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    return rawPedidos.map((p) => ({
      ...p,
      itemsJson: typeof p.itemsJson === 'string' ? JSON.parse(p.itemsJson) : p.itemsJson,
    }));
  }

  async confirmar(id: string, vendedorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ where: { id } });
      if (!pedido) throw new NotFoundException('Pedido no encontrado');
      if (pedido.estado !== 'PENDIENTE') {
        throw new BadRequestException(`El pedido ya está en estado ${pedido.estado}`);
      }

      const items = typeof pedido.itemsJson === 'string' ? JSON.parse(pedido.itemsJson) : (pedido.itemsJson as any[]);

      for (const item of items) {
        const stock = await tx.stock.findUnique({ where: { productoId: item.productoId } });
        if (!stock || stock.cantidad < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.nombre}". Disponible: ${stock?.cantidad ?? 0}`,
          );
        }
      }

      const total = items.reduce((s: number, i: any) => s + i.cantidad * i.precio, 0);
      const venta = await tx.venta.create({
        data: {
          vendedorId,
          clienteId: pedido.clienteId || null,
          total,
          estado: 'CONFIRMADA',
          detalles: {
            create: items.map((i: any) => ({
              productoId: i.productoId,
              cantidad: i.cantidad,
              precioUnitario: i.precio,
            })),
          },
        },
      });

      for (const item of items) {
        await tx.stock.update({
          where: { productoId: item.productoId },
          data: { cantidad: { decrement: item.cantidad } },
        });
        await tx.movimientoStock.create({
          data: {
            productoId: item.productoId,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            usuarioId: vendedorId,
            motivo: `Pedido #${id.substring(0, 8)}`,
          },
        });
      }

      return tx.pedido.update({
        where: { id },
        data: { estado: 'CONFIRMADO', vendedorAsignadoId: vendedorId },
      });
    });
  }

  async rechazar(id: string, vendedorId: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException(`El pedido ya está en estado ${pedido.estado}`);
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: 'RECHAZADO', vendedorAsignadoId: vendedorId },
    });
  }
}
