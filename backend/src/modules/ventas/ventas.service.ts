import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/venta.dto';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVentaDto, vendedorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verificar stock para cada producto
      for (const detalle of dto.detalles) {
        const stock = await tx.stock.findUnique({ where: { productoId: detalle.productoId } });
        if (!stock || stock.cantidad < detalle.cantidad) {
          const producto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
          throw new BadRequestException(
            `Stock insuficiente para "${producto?.nombre || detalle.productoId}". Disponible: ${stock?.cantidad ?? 0}`,
          );
        }
      }

      const total = dto.detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);

      const venta = await tx.venta.create({
        data: {
          vendedorId,
          clienteId: dto.clienteId || null,
          total,
          estado: 'CONFIRMADA',
          detalles: {
            create: dto.detalles.map((d) => ({
              productoId: d.productoId,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
            })),
          },
        },
        include: { detalles: { include: { producto: { select: { nombre: true, sku: true } } } } },
      });

      // Descontar stock con trazabilidad
      for (const detalle of dto.detalles) {
        await tx.stock.update({
          where: { productoId: detalle.productoId },
          data: { cantidad: { decrement: detalle.cantidad } },
        });
        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'SALIDA',
            cantidad: detalle.cantidad,
            usuarioId: vendedorId,
            motivo: `Venta #${venta.id.substring(0, 8)}`,
          },
        });
      }

      return venta;
    });
  }

  async findAll(usuarioId: string, rol: string) {
    const where = rol === 'ADMIN' ? {} : { vendedorId: usuarioId };
    return this.prisma.venta.findMany({
      where,
      include: {
        vendedor: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        detalles: { include: { producto: { select: { nombre: true, sku: true } } } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getResumen(desde?: string, hasta?: string) {
    const fechaInicio = desde ? new Date(desde) : new Date(new Date().setDate(1));
    const fechaFin = hasta ? new Date(hasta) : new Date();

    const ventas = await this.prisma.venta.findMany({
      where: {
        fecha: { gte: fechaInicio, lte: fechaFin },
        estado: 'CONFIRMADA',
      },
      include: { detalles: true },
    });

    const totalVentas = ventas.reduce((s, v) => s + Number(v.total), 0);

    return {
      totalVentas,
      cantidadVentas: ventas.length,
      promedioPorVenta: ventas.length ? totalVentas / ventas.length : 0,
      periodo: { desde: fechaInicio, hasta: fechaFin },
    };
  }

  async getTopProductos(limite = 5) {
    const result = await this.prisma.ventaDetalle.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: limite,
    });

    const withNames = await Promise.all(
      result.map(async (r) => {
        const p = await this.prisma.producto.findUnique({
          where: { id: r.productoId },
          select: { nombre: true, sku: true, imagenUrl: true },
        });
        return { ...r, producto: p };
      }),
    );

    return withNames;
  }
}
