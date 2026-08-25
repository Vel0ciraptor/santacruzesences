import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MovimientoStockDto } from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stock.findMany({
      include: {
        producto: { select: { id: true, sku: true, nombre: true, marca: true, imagenUrl: true, activo: true } },
      },
      orderBy: { producto: { nombre: 'asc' } },
    });
  }

  async registrarMovimiento(dto: MovimientoStockDto, usuarioId: string) {
    return this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({ where: { productoId: dto.productoId } });
      if (!stock) throw new NotFoundException('Producto sin stock registrado');

      let nuevaCantidad = stock.cantidad;
      if (dto.tipo === 'ENTRADA') {
        nuevaCantidad += dto.cantidad;
      } else if (dto.tipo === 'SALIDA') {
        if (stock.cantidad < dto.cantidad) {
          throw new BadRequestException('Stock insuficiente para realizar la salida');
        }
        nuevaCantidad -= dto.cantidad;
      } else {
        // AJUSTE: fija la cantidad directamente
        nuevaCantidad = dto.cantidad;
      }

      await tx.stock.update({
        where: { productoId: dto.productoId },
        data: { cantidad: nuevaCantidad },
      });

      return tx.movimientoStock.create({
        data: {
          productoId: dto.productoId,
          tipo: dto.tipo,
          cantidad: dto.tipo === 'AJUSTE' ? Math.abs(nuevaCantidad - stock.cantidad) : dto.cantidad,
          usuarioId,
          motivo: dto.motivo,
        },
        include: {
          producto: { select: { nombre: true, sku: true } },
          usuario: { select: { nombre: true } },
        },
      });
    });
  }

  async getAlertas() {
    return this.prisma.stock.findMany({
      where: {
        cantidad: { lte: this.prisma.stock.fields.stockMinimo as any },
      },
      include: {
        producto: { select: { id: true, sku: true, nombre: true, marca: true } },
      },
    });
  }

  async getAlertasRaw() {
    // Consulta manual para comparar cantidad <= stockMinimo
    const stocks = await this.prisma.$queryRaw<any[]>`
      SELECT s.*, p.sku, p.nombre, p.marca, p.id as "productoNombre"
      FROM "Stock" s
      JOIN "Producto" p ON s."productoId" = p.id
      WHERE s.cantidad <= s."stockMinimo"
    `;
    return stocks;
  }

  async getMovimientos() {
    return this.prisma.movimientoStock.findMany({
      include: {
        producto: { select: { sku: true, nombre: true } },
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });
  }
}
