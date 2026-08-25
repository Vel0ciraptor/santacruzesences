import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { Boxes, ArrowDownRight, ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';
import { Stock, MovimientoStock, Producto } from '@/types';

export const StockAdminPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'inventario' | 'movimientos'>('inventario');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/stock'),
        api.get('/stock/movimientos'),
      ]);
      setStocks(sRes.data);
      setMovimientos(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductoId) return;

    setErrorMsg(null);
    try {
      await api.post('/stock/movimiento', {
        productoId: selectedProductoId,
        tipo,
        cantidad: parseInt(cantidad),
        motivo: motivo || 'Ajuste manual de administración',
      });

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al procesar movimiento de stock.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Control de Inventario & Stock</h1>
            <p className="text-xs text-slate-400 mt-1">
              Monitoreo de existencias y trazabilidad de movimientos de entrada, salida y ajustes.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedProductoId(stocks[0]?.productoId || '');
              setTipo('ENTRADA');
              setCantidad('5');
              setMotivo('');
              setErrorMsg(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            <span>Registrar Movimiento / Ajuste</span>
          </button>
        </div>

        <div className="flex gap-3 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setSelectedTab('inventario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === 'inventario'
                ? 'bg-slate-900 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inventario Actual ({stocks.length})
          </button>
          <button
            onClick={() => setSelectedTab('movimientos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === 'movimientos'
                ? 'bg-slate-900 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial de Movimientos ({movimientos.length})
          </button>
        </div>

        {selectedTab === 'inventario' ? (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Cantidad Actual</th>
                  <th className="py-4 px-6">Stock Mínimo</th>
                  <th className="py-4 px-6">Estado Alerta</th>
                  <th className="py-4 px-6 text-right">Última Actualización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {stocks.map((s) => {
                  const bajoStock = s.cantidad <= s.stockMinimo;
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-200">{s.producto?.nombre}</td>
                      <td className="py-4 px-6 font-mono text-slate-400">{s.producto?.sku}</td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-extrabold ${bajoStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {s.cantidad} un.
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{s.stockMinimo} un.</td>
                      <td className="py-4 px-6">
                        {bajoStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 text-[10px] font-bold border border-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stock Bajo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Óptimo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 text-[11px]">
                        {new Date(s.actualizadoEn).toLocaleString('es-BO')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-6">Fecha / Hora</th>
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6">Cantidad</th>
                  <th className="py-4 px-6">Usuario Responsable</th>
                  <th className="py-4 px-6">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(m.fecha).toLocaleString('es-BO')}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200">{m.producto?.nombre}</td>
                    <td className="py-4 px-6">
                      {m.tipo === 'ENTRADA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                          <ArrowUpRight className="w-3 h-3" /> ENTRADA
                        </span>
                      ) : m.tipo === 'SALIDA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800">
                          <ArrowDownRight className="w-3 h-3" /> SALIDA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
                          AJUSTE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-100">{m.cantidad} un.</td>
                    <td className="py-4 px-6 text-slate-300">{m.usuario?.nombre}</td>
                    <td className="py-4 px-6 text-slate-400 text-[11px]">{m.motivo || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Ajuste Manual de Inventario</h2>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleMovimientoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Seleccionar Producto
                  </label>
                  <select
                    value={selectedProductoId}
                    onChange={(e) => setSelectedProductoId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    {stocks.map((s) => (
                      <option key={s.productoId} value={s.productoId} className="bg-slate-900">
                        {s.producto?.nombre} (Actual: {s.cantidad} un.)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      Tipo de Movimiento
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    >
                      <option value="ENTRADA" className="bg-slate-900">ENTRADA (Aumentar)</option>
                      <option value="SALIDA" className="bg-slate-900">SALIDA (Disminuir)</option>
                      <option value="AJUSTE" className="bg-slate-900">AJUSTE (Fijar exacto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Motivo / Observación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ingreso de nuevo lote proveedor"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
