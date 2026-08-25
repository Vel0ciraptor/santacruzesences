import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { CartDrawer } from '../../components/CartDrawer';
import { Search, ShoppingBag, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Producto } from '../../types';
import { useCartStore } from '../../store/cartStore';

export const CatalogoPublico: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMarca, setSelectedMarca] = useState<string>('TODAS');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await api.get('/productos?activos=true');
      setProductos(res.data);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcas = ['TODAS', ...Array.from(new Set(productos.map((p) => p.marca).filter(Boolean))) as string[]];

  const filteredProductos = productos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(search.toLowerCase()));

    const matchesMarca = selectedMarca === 'TODAS' || p.marca === selectedMarca;

    return matchesSearch && matchesMarca;
  });

  const handleAddToCart = (producto: Producto) => {
    addItem(producto);
    setAddedAnimationId(producto.id);
    setTimeout(() => setAddedAnimationId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900 glass-card">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección de Perfumería Exclusiva</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-3xl mx-auto leading-tight">
            Descubre tu Esencia Única en{' '}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Santa Cruz Essence
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal">
            Explora las fragancias más selectas. Agrega tus perfumes al carrito y haz tu pedido directo por WhatsApp con atención personalizada.
          </p>

          {/* Bar de búsqueda */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar perfume por nombre, marca o SKU..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm shadow-xl"
            />
          </div>

          {/* Tags de Marcas */}
          {marcas.length > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold uppercase mr-2">
                <Filter className="w-3 h-3" /> Filtrar:
              </span>
              {marcas.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMarca(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedMarca === m
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid de productos */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl glass-card border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-600 stroke-1" />
            <h3 className="text-lg font-semibold text-slate-200">No se encontraron productos</h3>
            <p className="text-xs text-slate-500 mt-1">Intenta ajustando tus términos de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProductos.map((p) => {
              const isAdded = addedAnimationId === p.id;
              const stockCantidad = p.stock?.cantidad ?? 0;
              const sinStock = stockCantidad <= 0;

              return (
                <div
                  key={p.id}
                  className="group rounded-3xl glass-card border border-slate-800 hover:border-teal-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-teal-950/20"
                >
                  <div>
                    {/* Imagen con badge */}
                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500'
                          );
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                        {p.marca || 'Esencia'}
                      </div>

                      {sinStock && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-950/90 border border-red-500/50 text-red-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="text-[11px] text-slate-500 font-mono mb-1">SKU: {p.sku}</p>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-teal-300 transition-colors line-clamp-1">
                        {p.nombre}
                      </h3>
                      {p.descripcion && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Precio</span>
                      <span className="text-xl font-extrabold text-emerald-400">
                        Bs. {Number(p.precio).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={sinStock}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : sinStock
                          ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                          : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Agregado!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};
