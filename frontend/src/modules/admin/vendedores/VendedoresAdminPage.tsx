import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { Users, UserPlus, KeyRound, Shield, CheckCircle2, X } from 'lucide-react';
import { api } from '@/services/api';
import { Usuario } from '@/types';

export const VendedoresAdminPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'VENDEDOR' | 'ADMIN'>('VENDEDOR');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setNombre('');
    setEmail('');
    setPassword('Vendedor123!');
    setRol('VENDEDOR');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (u: Usuario) => {
    setEditingUser(u);
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword('');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingUser) {
        await api.patch(`/usuarios/${editingUser.id}`, {
          nombre,
          email,
          ...(password ? { password } : {}),
        });
      } else {
        await api.post('/usuarios', {
          nombre,
          email,
          password,
          rol,
        });
      }

      setModalOpen(false);
      fetchUsuarios();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar la cuenta de usuario.');
    }
  };

  const handleDesactivar = async (id: string) => {
    if (!window.confirm('¿Desactivar la cuenta de este usuario?')) return;
    try {
      await api.patch(`/usuarios/${id}/desactivar`);
      fetchUsuarios();
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
            <h1 className="text-2xl font-extrabold text-slate-100">Gestión de Vendedores & Cuentas</h1>
            <p className="text-xs text-slate-400 mt-1">
              Crea o modifica credenciales de acceso para el equipo comercial y administración.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nueva Cuenta</span>
          </button>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Email / Usuario</th>
                <th className="py-4 px-6">Rol de Acceso</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-200">{u.nombre}</td>
                  <td className="py-4 px-6 font-mono text-slate-400">{u.email}</td>
                  <td className="py-4 px-6">
                    {u.rol === 'ADMIN' ? (
                      <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
                        ADMINISTRADOR
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 text-[10px] font-bold border border-teal-800">
                        VENDEDOR
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {u.activo ? (
                      <span className="text-emerald-400 font-semibold text-xs">Activo</span>
                    ) : (
                      <span className="text-slate-500 font-semibold text-xs">Inactivo</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-300 text-xs font-medium"
                      >
                        Modificar / Clave
                      </button>
                      {u.activo && (
                        <button
                          onClick={() => handleDesactivar(u.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-950 text-xs font-medium"
                        >
                          Desactivar
                        </button>
                      )}
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
                  {editingUser ? `Modificar Cuenta: ${editingUser.nombre}` : 'Nueva Cuenta Vendedor'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Correo Electrónico (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    {editingUser ? 'Nueva Contraseña (Dejar en blanco para mantener)' : 'Contraseña de Acceso *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      Rol de Permisos
                    </label>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    >
                      <option value="VENDEDOR" className="bg-slate-900">VENDEDOR (Escáner, ventas, pedidos)</option>
                      <option value="ADMIN" className="bg-slate-900">ADMIN (Acceso total)</option>
                    </select>
                  </div>
                )}

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
                    Guardar Cuenta
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
