import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', data);
      const { usuario, user, accessToken, refreshToken } = res.data;
      const currentUser = usuario || user;

      if (!currentUser) {
        throw new Error('Respuesta de usuario inválida del servidor');
      }

      setAuth(currentUser, accessToken, refreshToken);

      if (currentUser.rol === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/vendedor');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const email = prompt('Ingresa el email del usuario demo:');
    if (!email) return;
    const pass = prompt('Ingresa la contraseña:');
    if (!pass) return;
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20 animate-pulse">
            <Sparkles className="w-8 h-8 text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-200 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            Santa Cruz Essence
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">
            Acceso al Sistema CRM Perfumería
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                {...register('email')}
                placeholder="admin@santacruzessence.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl glass-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider text-center">
            Credenciales de Demostración Iniciales
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={fillDemo}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-300 hover:text-teal-300 transition-colors text-left flex justify-between items-center"
            >
              <span>🔐 Ingresar con credenciales de demostración</span>
              <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">Auto-Llenar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
