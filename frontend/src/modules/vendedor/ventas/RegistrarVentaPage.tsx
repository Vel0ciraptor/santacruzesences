import React, { useState, useEffect } from 'react';
import { SidebarVendedor } from '@/components/SidebarVendedor';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, User, Search, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Producto, Cliente } from '@/types';
import { useLocation } from 'react-router-dom';

export const RegistrarVentaPage: React.FC = () => {
  const location = useLocation();
  const preselected = location.state?.preselectedProducto;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');

  const [cart, setCart] = useState<{ producto: Producto; cantidad: number }[]>(
    preselected ? [{ producto: preselected, cantidad: 1 }] : []
  );

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/productos?activos=true'),
        api.get('/clientes'),
      ]);
      setProductos(pRes.data);
      setClientes(cRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addProductoToCart = (p: Producto) => {
    const idx = cart.findIndex((i) => i.producto.id === p.id);
    if (idx > -1) {
      const updated = [...cart];
      updated[idx].cantidad += 1;
      setCart(updated);
    } else {
      setCart([...cart, { producto: p, cantidad: 1 }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.producto.id !== id));
      return;
    }
    setCart(cart.map((i) => (i.producto.id === id ? { ...i, cantidad: qty } : i)));
  };

  const totalVenta = cart.reduce((sum, item) => sum + Number(item.producto.precio) * item.cantidad, 0);

  const handleCompletarVenta = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg(null);

    const detalles = cart.map((i) => ({
      productoId: i.producto.id,
      cantidad: i.cantidad,
      precioUnitario: Number(i.producto.precio),
    }));

    try {
      const res = await api.post('/ventas', {
        clienteId: selectedClienteId || null,
        detalles,
      });

      setVentaExitosa(res.data);
      setCart([]);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar la venta. Revisa disponibilidad de stock.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Registrar Nueva Venta</h1>
          <p className="text-xs text-slate-400 mt-1">Terminal de punto de venta (POS) para ventas presenciales.</p>
        </div>

        {ventaExitosa ? (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-100">¡Venta Registrada Correctamente!</h2>
            <p className="text-xs text-slate-400">
              Venta ID <strong className="text-teal-300">#{ventaExitosa.id.substring(0, 8)}</strong> — Total: <strong className="text-emerald-400">Bs. {Number(ventaExitosa.total).toFixed(2)}</strong>
            </p>
            <div className="pt-4">
              <button
                onClick={() => setVentaExitosa(null)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar fragancia para agregar a la venta..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredProductos.map((p) => {
                  const stockCant = p.stock?.cantidad ?? 0;
                  const sinStock = stockCant <= 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !sinStock && addProductoToCart(p)}
                      className={`p-3 rounded-2xl glass-card border border-slate-800 flex items-center gap-3 transition-all cursor-pointer ${
                        sinStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-500/40 hover:scale-[1.01]'
                      }`}
                    >
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        className="w-14 h-14 object-cover rounded-xl bg-slate-900 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200');
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-100 truncate">{p.nombre}</p>
                        <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-extrabold text-emerald-400">Bs. {Number(p.precio).toFixed(2)}</span>
                          <span className={`text-[10px] font-semibold ${sinStock ? 'text-red-400' : 'text-slate-400'}`}>
                            {stockCant} un.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>Detalle de Venta</span>
                  <ShoppingCart className="w-4 h-4 text-teal-400" />
                </h2>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Cliente (Opcional)
                  </label>
                  <select
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="" className="bg-slate-900">-- Venta a Cliente Anónimo --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">
                        {c.nombre} ({c.telefono || 'Sin tel'})
                      </option>
                    ))}
                  </select>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No has seleccionado productos.</p>
                  ) : (
                    cart.map(({ producto, cantidad }) => (
                      <div key={producto.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 text-xs">
                        <div className="truncate mr-2">
                          <p className="font-semibold text-slate-200 truncate">{producto.nombre}</p>
                          <p className="text-emerald-400 font-mono">Bs. {Number(producto.precio).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(producto.id, cantidad - 1)}
                            className="p-1 text-slate-400 hover:text-teal-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-slate-100">{cantidad}</span>
                          <button
                            onClick={() => updateQuantity(producto.id, cantidad + 1)}
                            className="p-1 text-slate-400 hover:text-teal-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-300">TOTAL:</span>
                  <span className="text-xl font-extrabold text-emerald-400">Bs. {totalVenta.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCompletarVenta}
                  disabled={cart.length === 0 || loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Confirmar Venta Directa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
