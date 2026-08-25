import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async exportarVentas(): Promise<Buffer> {
    const ventas = await this.prisma.venta.findMany({
      include: {
        vendedor: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        detalles: { include: { producto: { select: { nombre: true, sku: true } } } },
      },
      orderBy: { fecha: 'desc' },
    });

    const rows = ventas.flatMap((v) =>
      v.detalles.map((d) => ({
        'ID Venta': v.id,
        Fecha: v.fecha.toISOString().split('T')[0],
        Vendedor: v.vendedor.nombre,
        Cliente: v.cliente?.nombre || 'Sin cliente',
        SKU: d.producto.sku,
        Producto: d.producto.nombre,
        Cantidad: d.cantidad,
        'Precio Unitario (Bs)': Number(d.precioUnitario),
        'Subtotal (Bs)': Number(d.precioUnitario) * d.cantidad,
        'Total Venta (Bs)': Number(v.total),
        Estado: v.estado,
      })),
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarStock(): Promise<Buffer> {
    const stock = await this.prisma.stock.findMany({
      include: { producto: true },
      orderBy: { producto: { nombre: 'asc' } },
    });

    const rows = stock.map((s) => ({
      SKU: s.producto.sku,
      Nombre: s.producto.nombre,
      Marca: s.producto.marca || '',
      'Cantidad Actual': s.cantidad,
      'Stock Mínimo': s.stockMinimo,
      Alerta: s.cantidad <= s.stockMinimo ? '⚠️ BAJO' : 'OK',
      'Precio (Bs)': Number(s.producto.precio),
      Activo: s.producto.activo ? 'Sí' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarProductos(): Promise<Buffer> {
    const productos = await this.prisma.producto.findMany({
      include: { stock: true },
      orderBy: { nombre: 'asc' },
    });

    const rows = productos.map((p) => ({
      SKU: p.sku,
      Nombre: p.nombre,
      Marca: p.marca || '',
      Descripcion: p.descripcion || '',
      Precio: Number(p.precio),
      ImagenUrl: p.imagenUrl || '',
      Stock: p.stock?.cantidad ?? 0,
      StockMinimo: p.stock?.stockMinimo ?? 5,
      Activo: p.activo ? 'SI' : 'NO',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catalogo_Productos');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generarPlantillaExcel(): Promise<Buffer> {
    const rows = [
      {
        SKU: 'SCE-101',
        Nombre: 'Perfume Sauvage Dior 100ml',
        Marca: 'Dior',
        Descripcion: 'Notas de bergamota de Calabria y pimienta.',
        Precio: 450,
        ImagenUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500',
        StockInicial: 15,
        StockMinimo: 3,
      },
      {
        SKU: 'SCE-102',
        Nombre: 'Good Girl Carolina Herrera 80ml',
        Marca: 'Carolina Herrera',
        Descripcion: 'Fragancia oriental dulce floral.',
        Precio: 520,
        ImagenUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500',
        StockInicial: 10,
        StockMinimo: 2,
      },
      {
        SKU: 'SCE-103',
        Nombre: 'Acqua Di Gio Giorgio Armani 100ml',
        Marca: 'Giorgio Armani',
        Descripcion: 'Frescura acuática y cítrica marina.',
        Precio: 480,
        ImagenUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500',
        StockInicial: 20,
        StockMinimo: 5,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Productos');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarClientes(): Promise<Buffer> {
    const clientes = await this.prisma.cliente.findMany({
      include: {
        creadoPor: { select: { nombre: true } },
        _count: { select: { ventas: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    const rows = clientes.map((c) => ({
      Nombre: c.nombre,
      Telefono: c.telefono || '',
      Email: c.email || '',
      Notas: c.notas || '',
      'Creado Por': c.creadoPor.nombre,
      'Total Compras': c._count.ventas,
      'Fecha Alta': c.creadoEn.toISOString().split('T')[0],
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async importarProductosPreview(buffer: Buffer, permitirActualizar = true) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws) as any[];

    const validos: any[] = [];
    const errores: any[] = [];

    const existentes = await this.prisma.producto.findMany({
      select: { sku: true, nombre: true },
    });
    const skusExistentes = new Map(existentes.map((p) => [p.sku, p.nombre]));
    const skusEnArchivo = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const erroresRow: string[] = [];

      const sku = String(row['SKU'] || row['sku'] || '').trim();
      const nombre = String(row['Nombre'] || row['nombre'] || '').trim();
      const precio = parseFloat(row['Precio'] || row['precio'] || '0');
      const imagenUrl = String(row['ImagenUrl'] || row['imagenUrl'] || '').trim() ||
        'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500';

      if (!sku) erroresRow.push('SKU requerido');
      if (!nombre) erroresRow.push('Nombre requerido');
      if (isNaN(precio) || precio < 0) erroresRow.push('Precio inválido');
      if (skusEnArchivo.has(sku)) erroresRow.push(`SKU "${sku}" duplicado en el archivo`);

      const yaExiste = skusExistentes.has(sku);
      if (yaExiste && !permitirActualizar) {
        erroresRow.push(`SKU "${sku}" ya existe en BD (modo creación estricto)`);
      }

      if (sku) skusEnArchivo.add(sku);

      const item = {
        fila: i + 2,
        sku,
        nombre,
        precio,
        marca: String(row['Marca'] || row['marca'] || ''),
        descripcion: String(row['Descripcion'] || row['descripcion'] || ''),
        imagenUrl,
        stockInicial: parseInt(row['StockInicial'] || row['stockInicial'] || row['Stock'] || row['stock'] || '0'),
        stockMinimo: parseInt(row['StockMinimo'] || row['stockMinimo'] || '5'),
        accion: yaExiste ? 'ACTUALIZAR' : 'CREAR',
      };

      if (erroresRow.length > 0) {
        errores.push({ ...item, errores: erroresRow });
      } else {
        validos.push(item);
      }
    }

    return {
      totalFilas: data.length,
      validos: validos.length,
      conErrores: errores.length,
      preview: validos.slice(0, 10),
      errores: errores.slice(0, 20),
    };
  }

  async importarProductosConfirmar(buffer: Buffer, adminId: string, permitirActualizar = true) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws) as any[];

    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const row of data) {
      try {
        const sku = String(row['SKU'] || row['sku'] || '').trim();
        const nombre = String(row['Nombre'] || row['nombre'] || '').trim();
        const precio = parseFloat(row['Precio'] || row['precio'] || '0');
        const imagenUrl = String(row['ImagenUrl'] || row['imagenUrl'] || '').trim() ||
          'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500';
        const marca = String(row['Marca'] || row['marca'] || '').trim() || null;
        const descripcion = String(row['Descripcion'] || row['descripcion'] || '').trim() || null;
        const stockInicial = parseInt(row['StockInicial'] || row['stockInicial'] || row['Stock'] || row['stock'] || '0');
        const stockMinimo = parseInt(row['StockMinimo'] || row['stockMinimo'] || '5');

        if (!sku || !nombre || isNaN(precio)) {
          errores++;
          continue;
        }

        const existe = await this.prisma.producto.findUnique({
          where: { sku },
          include: { stock: true },
        });

        if (existe) {
          if (!permitirActualizar) {
            errores++;
            continue;
          }

          await this.prisma.$transaction(async (tx) => {
            await tx.producto.update({
              where: { sku },
              data: {
                nombre,
                precio,
                imagenUrl: imagenUrl || existe.imagenUrl,
                marca: marca !== null ? marca : existe.marca,
                descripcion: descripcion !== null ? descripcion : existe.descripcion,
                activo: true,
              },
            });

            if (stockInicial >= 0 && existe.stock) {
              const diferencia = stockInicial - existe.stock.cantidad;
              if (diferencia !== 0) {
                await tx.stock.update({
                  where: { productoId: existe.id },
                  data: {
                    cantidad: stockInicial,
                    stockMinimo: stockMinimo || existe.stock.stockMinimo,
                  },
                });

                await tx.movimientoStock.create({
                  data: {
                    productoId: existe.id,
                    tipo: diferencia > 0 ? 'ENTRADA' : 'AJUSTE',
                    cantidad: Math.abs(diferencia),
                    usuarioId: adminId,
                    motivo: `Actualización masiva Excel (${diferencia > 0 ? '+' : ''}${diferencia})`,
                  },
                });
              }
            }
          });
          actualizados++;
        } else {
          await this.prisma.$transaction(async (tx) => {
            const p = await tx.producto.create({
              data: {
                sku,
                nombre,
                precio,
                imagenUrl,
                marca,
                descripcion,
                stock: {
                  create: {
                    cantidad: stockInicial >= 0 ? stockInicial : 0,
                    stockMinimo: stockMinimo >= 0 ? stockMinimo : 5,
                  },
                },
              },
            });

            if (stockInicial > 0) {
              await tx.movimientoStock.create({
                data: {
                  productoId: p.id,
                  tipo: 'ENTRADA',
                  cantidad: stockInicial,
                  usuarioId: adminId,
                  motivo: 'Importación masiva Excel',
                },
              });
            }
          });
          creados++;
        }
      } catch (e) {
        errores++;
      }
    }

    return { creados, actualizados, errores, total: data.length };
  }

  // ──────────────────────────────────────────
  // BACKUP COMPLETO JSON (Exportar / Importar)
  // ──────────────────────────────────────────

  async exportarBackupCompleto(): Promise<object> {
    const [usuarios, productos, stocks, movimientos, clientes, ventas, ventaDetalles, pedidos, premios] =
      await Promise.all([
        this.prisma.usuario.findMany({ select: { id: true, nombre: true, email: true, passwordHash: true, rol: true, activo: true, creadoPorId: true, creadoEn: true } }),
        this.prisma.producto.findMany(),
        this.prisma.stock.findMany(),
        this.prisma.movimientoStock.findMany(),
        this.prisma.cliente.findMany(),
        this.prisma.venta.findMany(),
        this.prisma.ventaDetalle.findMany(),
        this.prisma.pedido.findMany(),
        this.prisma.premio.findMany(),
      ]);

    return {
      metadata: {
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
        generadoPor: 'Santa Cruz Essence CRM System',
      },
      counts: {
        usuarios: usuarios.length,
        productos: productos.length,
        stocks: stocks.length,
        clientes: clientes.length,
        ventas: ventas.length,
        pedidos: pedidos.length,
        premios: premios.length,
      },
      data: {
        usuarios,
        productos,
        stocks,
        movimientos,
        clientes,
        ventas,
        ventaDetalles,
        pedidos,
        premios,
      },
    };
  }

  async restaurarBackupCompleto(backupJson: any, adminId: string) {
    if (!backupJson || !backupJson.data) {
      throw new BadRequestException('El archivo de respaldo no tiene una estructura JSON válida.');
    }

    const { data } = backupJson;

    let productosRestaurados = 0;
    let clientesRestaurados = 0;
    let premiosRestaurados = 0;

    // Restaurar en transacción para asegurar integridad
    await this.prisma.$transaction(async (tx) => {
      // 1. Premios de Ruleta
      if (Array.isArray(data.premios)) {
        for (const p of data.premios) {
          await tx.premio.upsert({
            where: { id: p.id },
            update: { texto: p.texto, color: p.color, peso: p.peso, activo: p.activo },
            create: { id: p.id, texto: p.texto, color: p.color, peso: p.peso, activo: p.activo },
          });
          premiosRestaurados++;
        }
      }

      // 2. Productos y Stock
      if (Array.isArray(data.productos)) {
        for (const p of data.productos) {
          const prod = await tx.producto.upsert({
            where: { sku: p.sku },
            update: {
              nombre: p.nombre,
              marca: p.marca,
              descripcion: p.descripcion,
              precio: Number(p.precio),
              imagenUrl: p.imagenUrl,
              activo: p.activo ?? true,
            },
            create: {
              id: p.id,
              sku: p.sku,
              nombre: p.nombre,
              marca: p.marca,
              descripcion: p.descripcion,
              precio: Number(p.precio),
              imagenUrl: p.imagenUrl,
              activo: p.activo ?? true,
            },
          });

          // Stock asociado
          const stockData = Array.isArray(data.stocks)
            ? data.stocks.find((s: any) => s.productoId === p.id || s.productoId === prod.id)
            : null;

          if (stockData) {
            await tx.stock.upsert({
              where: { productoId: prod.id },
              update: {
                cantidad: Number(stockData.cantidad),
                stockMinimo: Number(stockData.stockMinimo || 5),
              },
              create: {
                productoId: prod.id,
                cantidad: Number(stockData.cantidad),
                stockMinimo: Number(stockData.stockMinimo || 5),
              },
            });
          } else {
            await tx.stock.upsert({
              where: { productoId: prod.id },
              update: {},
              create: {
                productoId: prod.id,
                cantidad: 0,
                stockMinimo: 5,
              },
            });
          }
          productosRestaurados++;
        }
      }

      // 3. Clientes
      if (Array.isArray(data.clientes)) {
        for (const c of data.clientes) {
          await tx.cliente.upsert({
            where: { id: c.id },
            update: {
              nombre: c.nombre,
              telefono: c.telefono,
              email: c.email,
              notas: c.notas,
            },
            create: {
              id: c.id,
              nombre: c.nombre,
              telefono: c.telefono,
              email: c.email,
              notas: c.notas,
              creadoPorId: c.creadoPorId || adminId,
            },
          });
          clientesRestaurados++;
        }
      }
    });

    return {
      mensaje: 'Respaldo restaurado exitosamente',
      productosRestaurados,
      clientesRestaurados,
      premiosRestaurados,
    };
  }
}
