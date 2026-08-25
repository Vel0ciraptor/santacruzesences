import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ProductosModule } from './modules/productos/productos.module';
import { StockModule } from './modules/stock/stock.module';
import { QrModule } from './modules/qr/qr.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { RuletaModule } from './modules/ruleta/ruleta.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    StockModule,
    QrModule,
    VentasModule,
    PedidosModule,
    ClientesModule,
    RuletaModule,
    ReportesModule,
  ],
})
export class AppModule {}
