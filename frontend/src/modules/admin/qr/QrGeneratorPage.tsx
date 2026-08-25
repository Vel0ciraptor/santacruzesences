import React, { useState, useEffect } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { QrCode, Printer, CheckSquare, Square, Download } from 'lucide-react';
import { api } from '@/services/api';

export const QrGeneratorPage: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrResults, setQrResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await api.get('/qr/productos');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === productos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productos.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerarLote = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/qr/lote', { productoIds: selectedIds });
      setQrResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="print:hidden">
        <SidebarAdmin />
      </div>

      <main className="flex-1 p-8 overflow-y-auto print:p-0 print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Generador de Códigos QR</h1>
            <p className="text-xs text-slate-400 mt-1">
              Genera etiquetas QR imprimibles con los SKUs para el lector de la cámara del vendedor.
            </p>
          </div>

          {qrResults.length > 0 && (
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Hoja de QR</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden mb-8">
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-slate-100 text-sm">Seleccionar Productos ({selectedIds.length})</h2>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-teal-400 hover:underline flex items-center gap-1"
              >
                {selectedIds.length === productos.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Desseleccionar Todos
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Seleccionar Todos
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {productos.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/50 text-teal-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{p.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                    </div>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleGenerarLote}
              disabled={selectedIds.length === 0 || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? 'Generando QRs...' : `Generar ${selectedIds.length} Códigos QR`}
            </button>
          </div>

          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
            {qrResults.length === 0 ? (
              <div className="p-8 text-slate-500">
                <QrCode className="w-16 h-16 mx-auto mb-3 stroke-1" />
                <p className="text-sm font-semibold text-slate-300">Hoja de Vista Previa</p>
                <p className="text-xs text-slate-500 mt-1">Selecciona productos y presiona "Generar".</p>
              </div>
            ) : (
              <div className="w-full text-left">
                <p className="text-xs font-bold text-emerald-400 mb-2">¡QRs Listos para Imprimir!</p>
                <p className="text-xs text-slate-400 mb-4">
                  Presiona el botón de "Imprimir Hoja de QR" para abrir la vista imprimible.
                </p>
              </div>
            )}
          </div>
        </div>

        {qrResults.length > 0 && (
          <div className="bg-white text-black p-8 rounded-3xl print:p-0 print:rounded-none">
            <div className="mb-6 text-center print:mb-4 border-b pb-4">
              <h2 className="text-xl font-extrabold tracking-tight">Santa Cruz Essence</h2>
              <p className="text-xs text-gray-500">Etiquetas QR de Inventario & Escáner</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
              {qrResults.map((item, idx) => (
                <div
                  key={idx}
                  className="border-2 border-gray-900 rounded-2xl p-4 text-center flex flex-col items-center justify-between bg-white shadow-sm"
                >
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Santa Cruz Essence
                  </span>
                  <img src={item.qrBase64} alt={item.sku} className="w-36 h-36 my-2 object-contain" />
                  <span className="text-xs font-extrabold text-gray-900 font-mono tracking-wider">
                    {item.sku}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-700 truncate w-full mt-0.5">
                    {item.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
