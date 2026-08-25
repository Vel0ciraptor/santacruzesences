import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generarQr(productoId: string): Promise<{ sku: string; nombre: string; qrBase64: string }> {
    const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const qrData = producto.sku;
    const qrBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return { sku: producto.sku, nombre: producto.nombre, qrBase64 };
  }

  async generarLote(productoIds: string[]) {
    const resultados = await Promise.all(productoIds.map((id) => this.generarQr(id)));
    return resultados;
  }

  async getProductosParaQr() {
    return this.prisma.producto.findMany({
      where: { activo: true },
      select: { id: true, sku: true, nombre: true, marca: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
