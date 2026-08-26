import React, { useState } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';

export const ImportarExcelPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [permitirActualizar, setPermitirActualizar] = useState(true);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewResult(null);
      setSuccessResult(null);
      setErrorMsg(null);
    }
  };

  const handleDownloadPlantilla = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { alert('No hay sesión activa'); return; }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${API_URL}/reportes/plantilla/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al descargar plantilla Excel' }));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla-productos.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error al descargar plantilla Excel.');
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(
        `/reportes/import/productos?permitirActualizar=${permitirActualizar}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      setPreviewResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al analizar archivo Excel.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!file) return;

    setConfirming(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(
        `/reportes/import/productos/confirmar?permitirActualizar=${permitirActualizar}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      setSuccessResult(res.data);
      setPreviewResult(null);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al confirmar la carga masiva.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin/productos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo de Productos</span>
          </Link>

          <button
            onClick={handleDownloadPlantilla}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Descargar Plantilla Excel Ejemplo</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Carga Masiva desde Excel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Importa múltiples productos con sus stocks iniciales. Puedes crear nuevos o actualizar precios y datos existentes por SKU.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 mb-8">
          <form onSubmit={handlePreview} className="space-y-6">
            <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-8 text-center bg-slate-900/40 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Selecciona o arrastra tu archivo Excel (.xlsx o .xls)'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Columnas requeridas: <strong>SKU</strong>, <strong>Nombre</strong>, <strong>Precio</strong> | Opcionales: <strong>Marca</strong>, <strong>Descripcion</strong>, <strong>ImagenUrl</strong>, <strong>StockInicial</strong>, <strong>StockMinimo</strong>
              </p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excelInput"
              />
              <label
                htmlFor="excelInput"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Buscar Archivo Excel</span>
              </label>
            </div>

            {/* Configuración de Upsert */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Modo Actualización Inteligente (Upsert)</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Si un SKU ya existe en la base de datos, se actualizarán su precio, descripción, imagen y stock con los valores del Excel.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={permitirActualizar}
                  onChange={(e) => {
                    setPermitirActualizar(e.target.checked);
                    setPreviewResult(null);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {file && !previewResult && !successResult && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Analizando filas...' : 'Analizar y Previsualizar'}
              </button>
            )}
          </form>
        </div>

        {previewResult && (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Resultado del Análisis</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-2xl font-extrabold text-slate-100">{previewResult.totalFilas}</span>
                <span className="block text-[11px] text-slate-400 mt-1">Total Filas Leídas</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="text-2xl font-extrabold text-emerald-400">{previewResult.validos}</span>
                <span className="block text-[11px] text-emerald-300 mt-1">Listos para Procesar</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center">
                <span className="text-2xl font-extrabold text-amber-400">{previewResult.conErrores}</span>
                <span className="block text-[11px] text-amber-300 mt-1">Con Errores / Bloqueados</span>
              </div>
            </div>

            {previewResult.preview && previewResult.preview.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300">Muestra de datos analizados:</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Fila</th>
                        <th className="py-2.5 px-3">Acción</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Nombre</th>
                        <th className="py-2.5 px-3">Precio</th>
                        <th className="py-2.5 px-3">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {previewResult.preview.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 text-slate-500 font-mono">#{p.fila}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                p.accion === 'ACTUALIZAR'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {p.accion}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-200">{p.sku}</td>
                          <td className="py-2 px-3 truncate max-w-xs">{p.nombre}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-400">Bs. {p.precio}</td>
                          <td className="py-2 px-3">{p.stockInicial}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {previewResult.errores.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                <h3 className="text-xs font-bold text-red-400">Filas con Errores:</h3>
                <ul className="text-xs text-red-300 space-y-1 list-disc pl-4">
                  {previewResult.errores.map((err: any, idx: number) => (
                    <li key={idx}>
                      Fila #{err.fila} (SKU: {err.sku || 'N/A'}): {err.errores.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewResult.validos > 0 && (
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewResult(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={confirming}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{confirming ? 'Procesando...' : `Confirmar y Cargar ${previewResult.validos} Registros`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {successResult && (
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-100">¡Carga Masiva Completada!</h2>
            <div className="flex justify-center gap-4 text-xs text-slate-300">
              <span className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                Creados: <strong className="text-emerald-400">{successResult.creados}</strong>
              </span>
              <span className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/30">
                Actualizados: <strong className="text-teal-400">{successResult.actualizados || 0}</strong>
              </span>
              <span className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                Errores: <strong className="text-slate-400">{successResult.errores || 0}</strong>
              </span>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSuccessResult(null);
                  setFile(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-900"
              >
                Cargar Otro Archivo
              </button>
              <Link
                to="/admin/productos"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <span>Ver Catálogo de Productos</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
