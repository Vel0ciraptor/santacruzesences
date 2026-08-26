import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { Package, Plus, Search, Edit2, Trash2, Check, X, FileSpreadsheet, Download, FileDown, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Producto } from '@/types';
import { Link } from 'react-router-dom';

export const ProductosAdminPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [stockInicial, setStockInicial] = useState('10');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarCatalogo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { alert('No hay sesión activa'); return; }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${API_URL}/reportes/export/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al descargar el catálogo' }));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogo-productos-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error al descargar el catálogo');
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { alert('No hay sesión activa'); return; }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${API_URL}/reportes/plantilla/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al descargar la plantilla' }));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla-importacion-productos.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error al descargar la plantilla');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setSku(`SCE-${Math.floor(100 + Math.random() * 900)}`);
    setNombre('');
    setMarca('Santa Cruz Essence');
    setDescripcion('');
    setPrecio('250');
    setImagenUrl('https://images.unsplash.com/photo-1541643600914-78b084683702?w=500');
    setStockInicial('10');
    setStockMinimo('5');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Producto) => {
    setEditingId(p.id);
    setSku(p.sku);
    setNombre(p.nombre);
    setMarca(p.marca || '');
    setDescripcion(p.descripcion || '');
    setPrecio(p.precio.toString());
    setImagenUrl(p.imagenUrl);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingId) {
        await api.patch(`/productos/${editingId}`, {
          nombre,
          marca: marca || null,
          descripcion: descripcion || null,
          precio: parseFloat(precio),
          imagenUrl,
        });
      } else {
        await api.post('/productos', {
          sku,
          nombre,
          marca: marca || null,
          descripcion: descripcion || null,
          precio: parseFloat(precio),
          imagenUrl,
          stockInicial: parseInt(stockInicial) || 0,
          stockMinimo: parseInt(stockMinimo) || 5,
        });
      }

      setModalOpen(false);
      fetchProductos();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el producto.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desactivar este producto del catálogo?')) return;
    try {
      await api.delete(`/productos/${id}`);
      fetchProductos();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Catálogo de Productos</h1>
            <p className="text-xs text-slate-400 mt-1">Gestión integral de fragancias e imágenes del inventario.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDescargarPlantilla}
              title="Descargar plantilla Excel con columnas predefinidas"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Plantilla Excel</span>
            </button>

            <button
              onClick={handleDescargarCatalogo}
              title="Exportar todo el catálogo actual a un archivo Excel"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Exportar Excel</span>
            </button>

            <Link
              to="/admin/productos/importar"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importar Excel</span>
            </Link>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        <div className="mb-6 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU, nombre o marca..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Marca</th>
                  <th className="py-4 px-6">Precio (Bs)</th>
                  <th className="py-4 px-6">Stock Actual</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">Cargando productos...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">No hay productos registrados.</td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imagenUrl}
                            alt={p.nombre}
                            className="w-10 h-10 object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=100');
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-200">{p.nombre}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 font-semibold">{p.sku}</td>
                      <td className="py-4 px-6 text-slate-300">{p.marca || 'N/A'}</td>
                      <td className="py-4 px-6 font-extrabold text-emerald-400">
                        Bs. {Number(p.precio).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold ${ (p.stock?.cantidad ?? 0) <= (p.stock?.stockMinimo ?? 5) ? 'text-amber-400' : 'text-slate-200' }`}>
                          {p.stock?.cantidad ?? 0} un.
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {p.activo ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-500 text-[10px] font-bold border border-slate-800">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-teal-300 rounded-xl transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                            title="Desactivar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-100">
                  {editingId ? 'Editar Producto' : 'Nuevo Producto'}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      SKU (Único)
                    </label>
                    <input
                      type="text"
                      disabled={!!editingId}
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                      Precio en Bolivianos (Bs) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  {!editingId && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        value={stockInicial}
                        onChange={(e) => setStockInicial(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    URL de la Imagen *
                  </label>
                  <input
                    type="url"
                    required
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                {imagenUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <img src={imagenUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-[11px] text-slate-400">Vista previa de imagen</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Descripción / Notas
                  </label>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Producto'}
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
