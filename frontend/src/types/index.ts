export type Rol = 'ADMIN' | 'VENDEDOR';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  creadoEn?: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  marca?: string;
  descripcion?: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
  stock?: Stock;
}

export interface Stock {
  id: string;
  productoId: string;
  cantidad: number;
  stockMinimo: number;
  actualizadoEn: string;
  producto?: Producto;
}

export interface MovimientoStock {
  id: string;
  productoId: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  usuarioId: string;
  motivo?: string;
  fecha: string;
  producto?: { sku: string; nombre: string };
  usuario?: { nombre: string };
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
  creadoPorId: string;
  creadoPor?: { nombre: string };
  _count?: { ventas: number };
  creadoEn: string;
  ventas?: Venta[];
}

export interface VentaDetalle {
  id: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  producto?: { nombre: string; sku: string };
}

export interface Venta {
  id: string;
  vendedorId: string;
  vendedor?: { nombre: string };
  clienteId?: string;
  cliente?: { nombre: string };
  total: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  fecha: string;
  detalles: VentaDetalle[];
}

export interface ItemPedidoJson {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: string;
  clienteId?: string;
  cliente?: { nombre: string; telefono?: string };
  nombreClienteTexto?: string;
  telefonoTexto?: string;
  itemsJson: ItemPedidoJson[];
  total: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  vendedorAsignadoId?: string;
  vendedorAsignado?: { nombre: string };
  fecha: string;
}

export interface Premio {
  id: string;
  texto: string;
  color: string;
  peso: number;
  activo: boolean;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
