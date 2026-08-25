import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public & Auth
import { CatalogoPublico } from '../modules/catalogo/CatalogoPublico';
import { CheckoutPage } from '../modules/catalogo/CheckoutPage';
import { LoginPage } from '../modules/auth/LoginPage';
import { RoleGuard } from '../components/RoleGuard';

// Admin Modules
import { DashboardPage } from '../modules/admin/dashboard/DashboardPage';
import { ProductosAdminPage } from '../modules/admin/productos/ProductosAdminPage';
import { ImportarExcelPage } from '../modules/admin/productos/ImportarExcelPage';
import { StockAdminPage } from '../modules/admin/stock/StockAdminPage';
import { QrGeneratorPage } from '../modules/admin/qr/QrGeneratorPage';
import { VendedoresAdminPage } from '../modules/admin/vendedores/VendedoresAdminPage';
import { ClientesAdminPage } from '../modules/admin/clientes/ClientesAdminPage';
import { RuletaAdminPage } from '../modules/admin/ruleta/RuletaAdminPage';
import { ReportesAdminPage } from '../modules/admin/reportes/ReportesAdminPage';

// Vendedor Modules
import { HomeVendedorPage } from '../modules/vendedor/HomeVendedorPage';
import { EscanerQrPage } from '../modules/vendedor/escaner/EscanerQrPage';
import { RegistrarVentaPage } from '../modules/vendedor/ventas/RegistrarVentaPage';
import { PedidosVendedorPage } from '../modules/vendedor/pedidos/PedidosVendedorPage';
import { ClientesVendedorPage } from '../modules/vendedor/clientes/ClientesVendedorPage';
import { RuletaVendedorPage } from '../modules/vendedor/ruleta/RuletaVendedorPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<CatalogoPublico />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas — Rol ADMIN */}
          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/productos" element={<ProductosAdminPage />} />
            <Route path="/admin/productos/importar" element={<ImportarExcelPage />} />
            <Route path="/admin/stock" element={<StockAdminPage />} />
            <Route path="/admin/qr" element={<QrGeneratorPage />} />
            <Route path="/admin/vendedores" element={<VendedoresAdminPage />} />
            <Route path="/admin/clientes" element={<ClientesAdminPage />} />
            <Route path="/admin/ruleta" element={<RuletaAdminPage />} />
            <Route path="/admin/reportes" element={<ReportesAdminPage />} />
          </Route>

          {/* Rutas Protegidas — Rol VENDEDOR o ADMIN */}
          <Route element={<RoleGuard allowedRoles={['VENDEDOR', 'ADMIN']} />}>
            <Route path="/vendedor" element={<HomeVendedorPage />} />
            <Route path="/vendedor/escaner" element={<EscanerQrPage />} />
            <Route path="/vendedor/ventas/nueva" element={<RegistrarVentaPage />} />
            <Route path="/vendedor/pedidos" element={<PedidosVendedorPage />} />
            <Route path="/vendedor/clientes" element={<ClientesVendedorPage />} />
            <Route path="/vendedor/ruleta" element={<RuletaVendedorPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
