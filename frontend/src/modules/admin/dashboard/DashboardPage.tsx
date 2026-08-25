import React, { useEffect, useState } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Award,
  Calendar,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { api } from '@/services/api';

export const DashboardPage: React.FC = () => {
  const [resumen, setResumen] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resumenRes, alertasRes, topRes] = await Promise.all([
        api.get('/ventas/reportes/resumen'),
        api.get('/stock/alertas'),
        api.get('/ventas/reportes/top-productos?limite=5'),
      ]);

      setResumen(resumenRes.data);
      setAlertas(alertasRes.data);
      setTopProductos(topRes.data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Dashboard de Control</h1>
            <p className="text-xs text-slate-400 mt-1">
              Visión general del desempeño comercial y estado de inventario en Santa Cruz Essence.
            </p>
          </div>
          <button
            onClick={loadData}
            className="self-start px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="glass-card p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Mes</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-100">
              Bs. {resumen ? Number(resumen.totalVentas).toFixed(2) : '0.00'}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              {resumen?.cantidadVentas || 0} transacciones registradas
            </p>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-100">
              Bs. {resumen ? Number(resumen.promedioPorVenta).toFixed(2) : '0.00'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Promedio por orden</p>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas Stock</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{alertas.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Productos bajo el mínimo</p>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Producto</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-base font-bold text-slate-100 truncate">
              {topProductos[0]?.producto?.nombre || 'N/A'}
            </p>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">
              {topProductos[0]?._sum?.cantidad || 0} unidades vendidas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h2 className="font-bold text-slate-100 text-base">Top 5 Fragancias Más Vendidas</h2>
              </div>
            </div>

            <div className="space-y-4">
              {topProductos.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No hay registros de ventas suficientes.</p>
              ) : (
                topProductos.map((tp, idx) => (
                  <div
                    key={tp.productoId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-teal-950 text-teal-300 text-xs font-bold flex items-center justify-center border border-teal-800">
                        #{idx + 1}
                      </span>
                      <img
                        src={tp.producto?.imagenUrl}
                        alt={tp.producto?.nombre}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-950"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=100');
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{tp.producto?.nombre}</p>
                        <p className="text-[10px] text-slate-500">SKU: {tp.producto?.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {tp._sum?.cantidad} un.
                      </span>
                      <span className="block text-[10px] text-slate-400">Vendidas</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-base">Alertas de Bajo Inventario</h2>
            </div>

            <div className="space-y-3">
              {alertas.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Package className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-300">¡Inventario Saludable!</p>
                  <p className="text-[11px] text-slate-500 mt-1">Todos los productos superan el stock mínimo.</p>
                </div>
              ) : (
                alertas.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{a.nombre}</p>
                      <p className="text-[10px] text-slate-400">
                        SKU: {a.sku} — {a.marca || 'Santa Cruz'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">
                        {a.cantidad} / Mín. {a.stockMinimo}
                      </span>
                      <span className="block text-[9px] uppercase tracking-wider font-semibold text-red-400">
                        Reponer Stock
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
