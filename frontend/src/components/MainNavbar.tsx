'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, User, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser, setCurrentUser, UserSession } from '@/lib/auth';

export default function MainNavbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    { label: 'Categorías', href: '/#categorias' },
    { label: 'Cómo funciona', href: '/#como-funciona' },
    { label: 'Admin', href: '/admin' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/services') return pathname === '/services' || pathname === '/servicios';
    if (href === '/cuadrillas') return pathname === '/cuadrillas';
    return false;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 sm:h-20 flex items-center shadow-xs">
      <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 flex items-center justify-between">
        {/* Logo Oficial CONECTA 360 */}
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo-conecta-nav.png"
            alt="CONECTA 360"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        {/* Enlaces de Navegación Desktop */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? 'text-[#0056d2] font-bold border-b-2 border-[#0056d2] pb-1 transition-colors'
                    : 'text-slate-600 hover:text-[#0056d2] border-b-2 border-transparent pb-1 transition-colors'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Controles de la Barra Superior */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            /* Usuario autenticado */
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0056d2] text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border border-blue-200 transition-all shadow-xs"
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
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Usuario no autenticado */
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/login?redirect=/dashboard?action=new-service&action_type=offer"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#0056d2] text-[#0056d2] hover:bg-blue-50 text-xs sm:text-sm font-bold items-center space-x-1.5 transition-all hidden sm:flex"
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
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Desplegable de Navegación Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-5 py-4 space-y-3 z-50">
          <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-[#0056d2] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#0056d2] text-slate-700 hover:text-[#0056d2] text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
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
                  className="w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50 text-[#0056d2] text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
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
            <div className="text-[11px] text-center text-slate-400 font-medium pt-0.5">
              📍 Operando en Cali y principales ciudades de Colombia
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
