import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(soloActivos = false) {
    return this.prisma.producto.findMany({
      where: soloActivos ? { activo: true } : {},
      include: { stock: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findBySku(sku: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { sku },
      include: { stock: true },
    });
    if (!producto) throw new NotFoundException(`Producto con SKU ${sku} no encontrado`);
    return producto;
  }

  async findById(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { stock: true },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async create(dto: CreateProductoDto, adminId: string) {
    const existe = await this.prisma.producto.findUnique({ where: { sku: dto.sku } });
    if (existe) throw new ConflictException(`Ya existe un producto con SKU ${dto.sku}`);

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          sku: dto.sku,
          nombre: dto.nombre,
          marca: dto.marca,
          descripcion: dto.descripcion,
          precio: dto.precio,
          imagenUrl: dto.imagenUrl,
          stock: {
            create: {
              cantidad: dto.stockInicial || 0,
              stockMinimo: dto.stockMinimo || 5,
            },
          },
        },
        include: { stock: true },
      });

      if (dto.stockInicial && dto.stockInicial > 0) {
        await tx.movimientoStock.create({
          data: {
            productoId: producto.id,
            tipo: 'ENTRADA',
            cantidad: dto.stockInicial,
            usuarioId: adminId,
            motivo: 'Stock inicial',
          },
        });
      }

      return producto;
    });
  }

  async update(id: string, dto: UpdateProductoDto) {
    await this.findById(id);
    return this.prisma.producto.update({
      where: { id },
      data: dto,
      include: { stock: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true },
    });
  }
}
