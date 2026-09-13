'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, User, LogOut, Menu, X, Building2 } from 'lucide-react';
import { getCurrentUser, setCurrentUser, UserSession } from '@/lib/auth';
import CountrySelector from '@/components/CountrySelector';
import ThemeToggle from '@/components/ThemeToggle';
import { useCountry } from '@/context/CountryContext';

export default function MainNavbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentCountry } = useCountry();

  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/services' },
    { label: 'Cuadrillas', href: '/cuadrillas' },
    { label: 'Business', href: '/business', isBusiness: true },
    { label: 'Categorías', href: '/#categorias' },
    { label: 'Admin', href: '/admin' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/services') return pathname === '/services' || pathname === '/servicios';
    if (href === '/cuadrillas') return pathname === '/cuadrillas';
    if (href === '/business') return pathname === '/business' || pathname === '/empresas';
    return false;
  };

  return (
    <header className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 h-16 sm:h-20 flex items-center shadow-xs transition-colors">
      <div className="max-w-[1620px] w-full mx-auto px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Logo Oficial CONECTA 360 */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 sm:h-9 w-auto object-contain dark:brightness-110"
            />
          </Link>
        </div>

        {/* Enlaces de Navegación Desktop */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? 'text-[#0056d2] dark:text-blue-400 font-bold border-b-2 border-[#0056d2] dark:border-blue-400 pb-1 transition-colors flex items-center space-x-1.5'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0056d2] dark:hover:text-blue-400 border-b-2 border-transparent pb-1 transition-colors flex items-center space-x-1.5'
                }
              >
                {link.isBusiness && <Building2 className="w-3.5 h-3.5 text-blue-500" />}
                <span>{link.label}</span>
                {link.isBusiness && (
                  <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full">
                    Empresas
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Controles de la Barra Superior */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Selector de País Multi-Tenant */}
          <CountrySelector />

          {/* Botón de Modo Oscuro */}
          <ThemeToggle />

          {user ? (
            /* Usuario autenticado */
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#0056d2] dark:text-blue-300 text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border border-blue-200 dark:border-blue-800 transition-all shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="max-w-[100px] sm:max-w-none truncate">{user.firstName}</span>
              </Link>

              <Link
                href="/dashboard?action=new-service"
                className="px-4 py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold items-center space-x-1.5 shadow-sm transition-all hidden sm:flex"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Ofrecer Servicios</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Usuario no autenticado */
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              <Link
                href="/login?redirect=/dashboard?action=new-service&action_type=offer"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#0056d2] dark:border-blue-500 text-[#0056d2] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-xs sm:text-sm font-bold items-center space-x-1.5 transition-all hidden sm:flex"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Quiero ofrecer</span>
              </Link>

              <Link
                href="/login"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            </div>
          )}

          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            )}
          </button>
        </div>
      </div>

      {/* Desplegable de Navegación Móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-xl px-5 py-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Banner Conecta 360 Business Móvil */}
          <Link
            href="/business"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shadow-md"
          >
            <div className="flex items-center space-x-2.5">
              <Building2 className="w-5 h-5 text-blue-300" />
              <div>
                <div className="text-xs font-bold flex items-center space-x-1.5">
                  <span>Conecta 360 Business</span>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    Empresas
                  </span>
                </div>
                <div className="text-[10px] text-blue-200">Planes corporativos y cuadrillas B2B</div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-300">Entrar →</span>
          </Link>

          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0056d2] dark:text-blue-400 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {link.isBusiness && <Building2 className="w-4 h-4 text-blue-500" />}
                    <span>{link.label}</span>
                  </span>
                  {link.isBusiness && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-[#0056d2] dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      B2B
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0056d2] text-slate-700 dark:text-slate-200 hover:text-[#0056d2] text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Ingresar a mi cuenta</span>
                </Link>
                <Link
                  href="/login?redirect=/dashboard?action=new-service&action_type=offer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0056d2] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Quiero ofrecer servicios</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-[#0056d2] dark:text-blue-300 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Mi Panel / Perfil ({user.firstName})</span>
                </Link>
                <Link
                  href="/dashboard?action=new-service"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0056d2] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Ofrecer nuevo servicio</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-red-600 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}
            <div className="text-[11px] text-center text-slate-400 font-medium pt-1">
              📍 Operando en {currentCountry.name} ({currentCountry.currency})
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
