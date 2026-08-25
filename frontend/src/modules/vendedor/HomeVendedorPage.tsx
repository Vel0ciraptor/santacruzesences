import React, { useEffect, useState } from 'react';
import { SidebarVendedor } from '../../components/SidebarVendedor';
import { QrCode, ShoppingCart, ShoppingBag, Disc, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const HomeVendedorPage: React.FC = () => {
  const { user } = useAuthStore();
  const [pedidosPendientesCount, setPedidosPendientesCount] = useState(0);

  useEffect(() => {
    api
      .get('/pedidos')
      .then((res) => {
        const pendientes = res.data.filter((p: any) => p.estado === 'PENDIENTE');
        setPedidosPendientesCount(pendientes.length);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terminal Vendedor</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bienvenido a tu panel de ventas. Selecciona la herramienta que necesitas.
          </p>
        </div>

        {/* Banner Pedidos Pendientes */}
        {pedidosPendientesCount > 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-teal-900/60 to-cyan-900/60 border border-teal-500/40 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg border border-teal-500/40 animate-pulse">
                {pedidosPendientesCount}
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Pedidos Entrantes por Atender</h3>
                <p className="text-xs text-teal-200/80">Tienes pedidos del catálogo público aguardando confirmación.</p>
              </div>
            </div>

            <Link
              to="/vendedor/pedidos"
              className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <span>Revisar Pedidos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Grid Accesos Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/vendedor/escaner"
            className="group glass-card p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between h-48 hover:shadow-xl hover:shadow-cyan-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                Cámara QR
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition-colors">
                Escáner de Productos
              </h3>
              <p className="text-xs text-slate-400 mt-1">Escanea el QR de la caja para consultar datos o vender.</p>
            </div>
          </Link>

          <Link
            to="/vendedor/ventas/nueva"
            className="group glass-card p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between h-48 hover:shadow-xl hover:shadow-emerald-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                Point of Sale
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-300 transition-colors">
                Registrar Nueva Venta
              </h3>
              <p className="text-xs text-slate-400 mt-1">Venta presencial directa con o sin cliente registrado.</p>
            </div>
          </Link>

          <Link
            to="/vendedor/ruleta"
            className="group glass-card p-6 rounded-3xl border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between h-48 hover:shadow-xl hover:shadow-teal-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Disc className="w-6 h-6 animate-spin-slow" />
              </div>
              <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
                Sorteos Live
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base group-hover:text-teal-300 transition-colors">
                Ruleta de Premios
              </h3>
              <p className="text-xs text-slate-400 mt-1">Sortea descuentos y muestras en directo con el comprador.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
