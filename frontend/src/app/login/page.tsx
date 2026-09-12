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
  AlertCircle
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, getInitialProviderSession, UserSession } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está logueado, redirigir
    const current = getCurrentUser();
    if (current) {
      if (current.role === 'PROVIDER') {
        router.push('/dashboard');
      } else {
        router.push(redirectUrl);
      }
    }
  }, [router, redirectUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Simulación de autenticación conectada
      if (email.trim() && password.trim()) {
        // Generar o recuperar sesión
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
        };
        setCurrentUser(session);
        router.push(session.role === 'PROVIDER' ? '/dashboard' : redirectUrl);
      } else {
        setError('Por favor ingresa tu correo y contraseña.');
        setLoading(false);
      }
    }, 600);
  };

  // Cuentas rápidas de demostración
  const handleQuickLogin = (role: 'PROVIDER' | 'CLIENT' | 'ADMIN') => {
    if (role === 'PROVIDER') {
      const providerSession = getInitialProviderSession();
      setCurrentUser(providerSession);
      router.push('/dashboard');
    } else if (role === 'CLIENT') {
      const clientSession: UserSession = {
        id: 101,
        email: 'maria.gomez@gmail.com',
        firstName: 'María Fernanda',
        lastName: 'Gómez',
        phone: '+57 318 654 3210',
        role: 'USER',
        status: 'APPROVED',
        isVerified: true,
        plan: 'FREE',
        createdAt: new Date().toISOString(),
        profile: {
          city: 'Cali',
          department: 'Valle del Cauca',
          country: 'Colombia',
        },
        services: [],
      };
      setCurrentUser(clientSession);
      router.push('/');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-between font-sans">
      {/* Top Simple Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo-conecta-nav.png"
            alt="CONECTA 360"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>
        <div className="text-xs text-slate-500 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-[#0056d2]" />
          <span>Red Colombia &bull; Sede Principal Cali</span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/80 p-8 space-y-6">
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

          {/* Quick Access Demo Accounts */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Ingreso rápido para demostración
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('PROVIDER')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0056d2]">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Soy Prestador (Cali)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Carlos Rodríguez &bull; Electricista</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CLIENT')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                  <User className="w-3.5 h-3.5" />
                  <span>Soy Cliente</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Buscar y contratar servicios</p>
              </button>
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

