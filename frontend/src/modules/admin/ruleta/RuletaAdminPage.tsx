import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { Disc, Plus, Trash2, Edit2, Sparkles, X } from 'lucide-react';
import { api } from '@/services/api';
import { Premio } from '@/types';

export const RuletaAdminPage: React.FC = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [texto, setTexto] = useState('');
  const [color, setColor] = useState('#06d6a0');
  const [peso, setPeso] = useState('1');

  useEffect(() => {
    fetchPremios();
  }, []);

  const fetchPremios = async () => {
    try {
      const res = await api.get('/premios/admin');
      setPremios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTexto('');
    setColor('#06d6a0');
    setPeso('1');
    setModalOpen(true);
  };

  const openEditModal = (p: Premio) => {
    setEditingId(p.id);
    setTexto(p.texto);
    setColor(p.color);
    setPeso(p.peso.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/premios/${editingId}`, {
          texto,
          color,
          peso: parseInt(peso),
        });
      } else {
        await api.post('/premios', {
          texto,
          color,
          peso: parseInt(peso),
        });
      }
      setModalOpen(false);
      fetchPremios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desactivar este premio de la ruleta?')) return;
    try {
      await api.delete(`/premios/${id}`);
      fetchPremios();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Editor de Ruleta de Sorteos</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configura los premios y la ponderación de probabilidades para el módulo de ruleta en vivo.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nuevo Premio</span>
          </button>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-4 px-6">Premio / Texto</th>
                <th className="py-4 px-6">Color en Ruleta</th>
                <th className="py-4 px-6">Peso Ponderado (Probabilidad)</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {premios.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-200">{p.texto}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: p.color }} />
                      <span className="font-mono text-slate-400 text-xs">{p.color}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-teal-400">{p.peso} pt.</td>
                  <td className="py-4 px-6">
                    {p.activo ? (
                      <span className="text-emerald-400 font-semibold text-xs">Activo</span>
                    ) : (
                      <span className="text-slate-500 font-semibold text-xs">Inactivo</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-teal-300 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-100">
                  {editingId ? 'Editar Premio' : 'Nuevo Premio'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Texto del Premio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ¡10% de descuento!"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Color en la Ruleta
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 rounded-xl cursor-pointer bg-slate-900 border border-slate-800 p-1"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Peso Ponderado (Mayor = Más Frecuente)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
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
                    Guardar Premio
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
