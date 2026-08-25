import React, { useState, useEffect } from 'react';
import { SidebarVendedor } from '@/components/SidebarVendedor';
import { UserCheck, Plus, Search, Phone, Mail, X } from 'lucide-react';
import { api } from '@/services/api';
import { Cliente } from '@/types';

export const ClientesVendedorPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await api.post('/clientes', {
        nombre,
        telefono: telefono || null,
        email: email || null,
        notas: notas || null,
      });
      setModalOpen(false);
      setNombre('');
      setTelefono('');
      setEmail('');
      setNotas('');
      fetchClientes();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar cliente.');
    }
  };

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono && c.telefono.includes(search))
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Base de Clientes</h1>
            <p className="text-xs text-slate-400 mt-1">Alta y consulta rápida de compradores frecuentes.</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        </div>

        <div className="mb-6 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-100 text-base">{c.nombre}</h3>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800">
                  {c._count?.ventas || 0} compras
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-2 font-mono text-teal-300">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{c.telefono || 'Sin WhatsApp'}</span>
                </p>
                {c.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{c.email}</span>
                  </p>
                )}
              </div>
              {c.notas && <p className="text-[11px] text-slate-500 italic border-t border-slate-800/80 pt-2">{c.notas}</p>}
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-100">Registrar Cliente</h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 71234567"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Notas (Preferencias de aroma)
                  </label>
                  <input
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Le gustan las fragancias amaderadas"
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
                    Guardar Cliente
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
