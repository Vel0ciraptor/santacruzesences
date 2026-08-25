import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { UserCheck, Search, ShoppingBag, Eye, X } from 'lucide-react';
import { api } from '@/services/api';
import { Cliente } from '@/types';

export const ClientesAdminPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      const res = await api.get(`/clientes/${id}`);
      setSelectedCliente(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono && c.telefono.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Base de Clientes CRM</h1>
            <p className="text-xs text-slate-400 mt-1">
              Registro histórico de compradores y consultas de frecuencia de compras.
            </p>
          </div>
        </div>

        <div className="mb-6 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Teléfono / WhatsApp</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Ventas Registradas</th>
                <th className="py-4 px-6">Registrado por</th>
                <th className="py-4 px-6 text-right">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-200">{c.nombre}</td>
                  <td className="py-4 px-6 font-mono text-teal-400">{c.telefono || 'Sin teléfono'}</td>
                  <td className="py-4 px-6 text-slate-400">{c.email || 'N/A'}</td>
                  <td className="py-4 px-6 font-bold text-emerald-400">{c._count?.ventas || 0} compras</td>
                  <td className="py-4 px-6 text-slate-300">{c.creadoPor?.nombre}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openDetail(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-300 text-xs font-medium flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Compras</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCliente && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedCliente.nombre}</h2>
                  <p className="text-xs text-teal-400">{selectedCliente.telefono || 'Sin teléfono'}</p>
                </div>
                <button onClick={() => setSelectedCliente(null)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Historial de Ventas</h3>
                {selectedCliente.ventas?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No registra compras todavía.</p>
                ) : (
                  selectedCliente.ventas?.map((v: any) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">Venta #{v.id.substring(0, 8)}</span>
                        <span className="text-slate-500">{new Date(v.fecha).toLocaleString('es-BO')}</span>
                      </div>
                      <div className="space-y-1">
                        {v.detalles?.map((d: any) => (
                          <div key={d.id} className="flex justify-between text-xs text-slate-300">
                            <span>{d.cantidad}x {d.producto?.nombre}</span>
                            <span className="font-mono">Bs. {(Number(d.precioUnitario) * d.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400">Total Venta:</span>
                        <span className="text-emerald-400 text-sm">Bs. {Number(v.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
