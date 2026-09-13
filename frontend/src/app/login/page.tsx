'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Briefcase,
  AlertCircle,
  Users
} from 'lucide-react';
import {
  getCurrentUser,
  setCurrentUser,
  getInitialSuperAdminSession,
  getInitialAdminSession,
  getInitialProviderSession,
  getInitialClientSession,
  UserSession
} from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const actionType = searchParams.get('action_type') || searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está logueado, redirigir al destino deseado
    const current = getCurrentUser();
    if (current) {
      if (redirectUrl && redirectUrl !== '/') {
        router.push(redirectUrl);
      } else if (current.role === 'SUPERADMIN' || current.role === 'ADMIN') {
        router.push('/admin');
      } else if (current.role === 'PROVIDER') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [router, redirectUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const em = email.trim().toLowerCase();
      // Credenciales de prueba integradas
      if (em === 'superadmin@conecta360.com') {
        const session = getInitialSuperAdminSession();
        setCurrentUser(session);
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin');
        return;
      }

      if (em === 'admin@conecta360.com') {
        const session = getInitialAdminSession();
        setCurrentUser(session);
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin');
        return;
      }

      if (em === 'carlos.rodriguez@conecta360.co' || em.includes('electricista') || em.includes('proveedor')) {
        const session = getInitialProviderSession();
        setCurrentUser(session);
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/dashboard');
        return;
      }

      if (em === 'laura.gomez@gmail.com' || em.includes('cliente')) {
        const session = getInitialClientSession();
        setCurrentUser(session);
        router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/');
        return;
      }

      // Si ingresa con cualquier otro correo válido
      if (email.trim() && password.trim()) {
        const session: UserSession = {
          id: Date.now(),
          email: email.trim(),
          firstName: email.split('@')[0].replace('.', ' ').toUpperCase(),
          lastName: 'Usuario',
          phone: '+57 312 345 6789',
          role: email.toLowerCase().includes('proveedor') ? 'PROVIDER' : 'USER',
          status: 'PENDING',
          isVerified: false,
          plan: 'FREE',
          createdAt: new Date().toISOString(),
          profile: {
            city: 'Cali',
            department: 'Valle del Cauca',
            country: 'Colombia',
            profession: 'Técnico de Servicios',
          },
          services: [],
          history: [],
          platformDebt: 0,
        };
        setCurrentUser(session);
        const destination = redirectUrl && redirectUrl !== '/' ? redirectUrl : (session.role === 'PROVIDER' ? '/dashboard' : '/');
        router.push(destination);
      } else {
        setError('Por favor ingresa tu correo y contraseña.');
        setLoading(false);
      }
    }, 400);
  };

  // Cuentas rápidas de demostración
  const handleQuickLogin = (role: 'SUPERADMIN' | 'ADMIN' | 'PROVIDER' | 'CLIENT') => {
    if (role === 'SUPERADMIN') {
      const session = getInitialSuperAdminSession();
      setCurrentUser(session);
      router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin');
    } else if (role === 'ADMIN') {
      const session = getInitialAdminSession();
      setCurrentUser(session);
      router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/admin');
    } else if (role === 'PROVIDER') {
      const providerSession = getInitialProviderSession();
      setCurrentUser(providerSession);
      router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/dashboard');
    } else {
      const clientSession = getInitialClientSession();
      setCurrentUser(clientSession);
      router.push(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/');
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-between font-sans">
      {/* Top Simple Header */}
      <header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo-conecta-nav.png"
            alt="CONECTA 360"
            className="h-7 sm:h-9 w-auto object-contain"
          />
        </Link>
        <div className="text-[10px] sm:text-xs text-slate-500 flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-[#0056d2]" />
          <span>Red Colombia &bull; Cali</span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 sm:my-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/80 p-5 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#0056d2] mb-1">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-slate-500">
              Accede a tu cuenta de <span className="font-bold text-[#0056d2]">CONECTA 360</span>
            </p>
          </div>

          {/* Banners de autenticación requerida para contratar o brindar servicios */}
          {actionType === 'hire' && (
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 flex items-start space-x-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#0056d2] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">Autenticación requerida para contratar</p>
                <p className="text-slate-600 leading-relaxed">
                  Por seguridad y garantía de pago, debes iniciar sesión o registrarte como cliente para solicitar este servicio en Conecta 360.
                </p>
              </div>
            </div>
          )}

          {actionType === 'cuadrilla' && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start space-x-3 shadow-xs">
              <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">Autenticación requerida para cuadrillas</p>
                <p className="text-slate-600 leading-relaxed">
                  Para contratar una cuadrilla, enviar propuestas de trabajo o coordinar equipos, debes iniciar sesión o crear una cuenta en Conecta 360.
                </p>
              </div>
            </div>
          )}

          {actionType === 'offer' && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start space-x-3 shadow-xs">
              <Briefcase className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">Autenticación requerida para ofrecer servicios</p>
                <p className="text-slate-600 leading-relaxed">
                  Para publicar tus servicios profesionales y recibir clientes en Cali, inicia sesión en tu cuenta o regístrate como prestador.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@conecta360.co"
                  required
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Contraseña
                </label>
                <a href="#" className="text-xs font-semibold text-[#0056d2] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0056d2] focus:ring-[#0056d2] w-4 h-4"
                />
                <span>Recordar mi sesión</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0056d2] hover:bg-[#0046a8] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar a Conecta 360</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Demo Accounts - 4 Roles */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Credenciales de Prueba (1-Click)
              </p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                4 Roles Listos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Superadmin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('SUPERADMIN')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SuperAdmin</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">superadmin@conecta360.com</p>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Operaciones</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">admin@conecta360.com</p>
              </button>

              {/* Prestador */}
              <button
                type="button"
                onClick={() => handleQuickLogin('PROVIDER')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0056d2]">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Prestador (Cali)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">carlos.rodriguez@conecta360.co</p>
              </button>

              {/* Cliente */}
              <button
                type="button"
                onClick={() => handleQuickLogin('CLIENT')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                  <User className="w-3.5 h-3.5" />
                  <span>Cliente Solicitante</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">laura.gomez@gmail.com</p>
              </button>
            </div>

            {/* Accordion / Info Box con las contraseñas exactas */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-700 font-sans font-bold text-[10px] uppercase tracking-wide">
                <span>Tabla de Accesos de Prueba</span>
                <span className="text-slate-400 font-normal lowercase">(o haz click arriba)</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="font-semibold text-purple-800 font-sans">Superadmin:</span>
                  <span className="text-slate-700 select-all">superadmin@conecta360.com &bull; SuperSecretPassword123!</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="font-semibold text-indigo-800 font-sans">Admin:</span>
                  <span className="text-slate-700 select-all">admin@conecta360.com &bull; AdminSecretPassword123!</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="font-semibold text-[#0056d2] font-sans">Prestador:</span>
                  <span className="text-slate-700 select-all">carlos.rodriguez@conecta360.co &bull; Provider123!</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-emerald-800 font-sans">Cliente:</span>
                  <span className="text-slate-700 select-all">laura.gomez@gmail.com &bull; Cliente123!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            ¿Aún no tienes una cuenta?{' '}
            <Link
              href="/register"
              className="font-bold text-[#0056d2] hover:text-[#0046a8] underline underline-offset-2"
            >
              Regístrate gratis aquí
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CONECTA 360 Colombia &bull; Conectando el talento de Cali y todo el país.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

