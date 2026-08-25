import React, { useState, useEffect } from 'react';
import { SidebarVendedor } from '@/components/SidebarVendedor';
import { ShoppingBag, CheckCircle2, XCircle, AlertTriangle, MessageSquare, ShieldAlert, X } from 'lucide-react';
import { api } from '@/services/api';
import { Pedido } from '@/types';

export const PedidosVendedorPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [pedidoToConfirm, setPedidoToConfirm] = useState<Pedido | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/pedidos');
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (p: Pedido) => {
    setPedidoToConfirm(p);
    setErrorMsg(null);
    setModalConfirmOpen(true);
  };

  const handleConfirmarDefinitivo = async () => {
    if (!pedidoToConfirm) return;
    setProcessing(true);
    setErrorMsg(null);

    try {
      await api.patch(`/pedidos/${pedidoToConfirm.id}/confirmar`);
      setModalConfirmOpen(false);
      setPedidoToConfirm(null);
      fetchPedidos();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al confirmar pedido. Verifica si hay suficiente stock.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRechazar = async (id: string) => {
    if (!window.confirm('¿Rechazar este pedido definitivamente?')) return;
    try {
      await api.patch(`/pedidos/${id}/rechazar`);
      fetchPedidos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Pedidos Entrantes del Catálogo</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de reservas solicitadas desde el sitio web público.
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-4 px-6">ID Pedido / Fecha</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Productos Solicitados</th>
                <th className="py-4 px-6">Total (Bs)</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acción Vendedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-mono text-teal-400 font-bold">#{p.id.substring(0, 8)}</p>
                    <p className="text-[10px] text-slate-500">{new Date(p.fecha).toLocaleString('es-BO')}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-200">{p.nombreClienteTexto || p.cliente?.nombre || 'Anónimo'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.telefonoTexto || p.cliente?.telefono || 'Sin WhatsApp'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-0.5 max-w-xs">
                      {p.itemsJson?.map((item: any, idx: number) => (
                        <p key={idx} className="text-[11px] text-slate-300 truncate">
                          • {item.cantidad}x {item.nombre}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-extrabold text-emerald-400">
                    Bs. {Number(p.total).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    {p.estado === 'PENDIENTE' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 text-[10px] font-bold border border-amber-800 animate-pulse">
                        PENDIENTE
                      </span>
                    ) : p.estado === 'CONFIRMADO' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                        CONFIRMADO
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-400 text-[10px] font-bold border border-red-800">
                        RECHAZADO
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {p.estado === 'PENDIENTE' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openConfirmModal(p)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                        >
                          Aceptar & Vender
                        </button>
                        <button
                          onClick={() => handleRechazar(p.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-medium"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        {p.vendedorAsignado ? `Procesado por ${p.vendedorAsignado.nombre}` : 'Procesado'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalConfirmOpen && pedidoToConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-4">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h2 className="text-base font-bold text-slate-100">Doble Confirmación de Pedido</h2>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  ¿Estás seguro de confirmar el pedido <strong className="text-teal-300">#{pedidoToConfirm.id.substring(0, 8)}</strong> de <strong className="text-slate-100">{pedidoToConfirm.nombreClienteTexto || 'Cliente'}</strong>?
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="font-semibold text-slate-200">Acciones automáticas al aceptar:</p>
                  <p className="text-slate-400">• Se descontará el stock de cada perfume inmediatamente.</p>
                  <p className="text-slate-400">• Se registrará la Venta oficial a tu nombre.</p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setModalConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarDefinitivo}
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  {processing ? 'Descontando stock...' : 'Sí, Confirmar Venta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
