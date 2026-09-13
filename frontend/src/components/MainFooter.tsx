'use client';

import React from 'react';
import Link from 'next/link';

export default function MainFooter() {
  return (
    <footer className="bg-[#050b14] text-slate-300 pt-12 sm:pt-16 pb-8 border-t border-slate-800 font-sans mt-auto">
      <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 sm:pb-12">
          {/* Col 1: Brand (Span 3) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo-conecta-nav.png"
                alt="CONECTA 360"
                className="h-7 sm:h-8 w-auto brightness-200 contrast-200 object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Conecta lo que necesitas con quien puede hacerlo en Cali y las principales ciudades de Colombia.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-slate-400">Plataforma Activa &bull; Colombia</span>
            </div>
          </div>

          {/* Col 2: Enlaces rápidos (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Enlaces rápidos
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Servicios y Profesionales
                </Link>
              </li>
              <li>
                <Link href="/cuadrillas" className="hover:text-white transition-colors">
                  Cuadrillas & Equipos
                </Link>
              </li>
              <li>
                <Link href="/#categorias" className="hover:text-white transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-white transition-colors">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Panel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categorías Principales (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Categorías
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 font-medium">
              <div>
                <Link href="/services?category=Electricidad" className="hover:text-white transition-colors">
                  Electricidad
                </Link>
              </div>
              <div>
                <Link href="/services?category=Plomería" className="hover:text-white transition-colors">
                  Plomería
                </Link>
              </div>
              <div>
                <Link href="/services?category=Cerrajería" className="hover:text-white transition-colors">
                  Cerrajería
                </Link>
              </div>
              <div>
                <Link href="/services?category=Tecnología" className="hover:text-white transition-colors">
                  Tecnología
                </Link>
              </div>
              <div>
                <Link href="/services?category=Pintura" className="hover:text-white transition-colors">
                  Pintura
                </Link>
              </div>
              <div>
                <Link href="/services?category=Mantenimiento" className="hover:text-white transition-colors">
                  Mantenimiento
                </Link>
              </div>
              <div>
                <Link href="/services?category=Limpieza" className="hover:text-white transition-colors">
                  Limpieza
                </Link>
              </div>
              <div>
                <Link href="/services?category=Salud" className="hover:text-white transition-colors">
                  Salud Domicilio
                </Link>
              </div>
            </div>
          </div>

          {/* Col 4: Síguenos (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Síguenos
            </h4>
            <div className="flex items-center space-x-2">
              {/* Facebook */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#0056d2] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#e1306c] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#ff0000] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#0077b5] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 5: Descarga nuestra app (Span 2) */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Descarga nuestra app
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              <a
                href="/api/download-apk"
                className="flex lg:hidden items-center space-x-2 bg-emerald-700/80 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg border border-emerald-500/40 transition-colors w-full col-span-2 sm:col-span-1"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M16.61 15.15c-.46 0-.84-.38-.84-.84s.38-.84.84-.84c.46 0 .84.38.84.84s-.38.84-.84.84zm-9.22 0c-.46 0-.84-.38-.84-.84s.38-.84.84-.84.84.38.84.84-.38.84-.84.84zm9.52-5.02l1.66-2.88a.347.347 0 0 0-.13-.47.347.347 0 0 0-.47.13l-1.69 2.92A10.87 10.87 0 0 0 12 9.27c-1.55 0-3 .24-4.28.69L6.03 7.04a.347.347 0 0 0-.47-.13.347.347 0 0 0-.13.47l1.66 2.88C3.59 12.02 1.5 15.15 1.5 18.75h21c0-3.6-2.09-6.73-5.59-8.62z"/>
                </svg>
                <div>
                  <div className="text-[7px] uppercase tracking-wider text-emerald-200 font-bold leading-none">Instalar APK Directo</div>
                  <div className="text-[10px] font-bold leading-tight">Android (conecta360.apk)</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 bg-black text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors w-full"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.37 2.37 0 0 1-.22-.324 2.128 2.128 0 0 1-.2-.93V3.068c0-.342.069-.66.2-.93a2.37 2.37 0 0 1 .219-.324zm11.23 11.23l2.096-2.096-12.06-6.963 9.964 9.059zm1.042-1.042l3.242 1.872a1.764 1.764 0 0 1 0 3.052l-3.242 1.872-2.146-2.146 2.146-2.65zm-1.042 3.136l-9.964 9.059 12.06-6.963-2.096-2.096z"/>
                </svg>
                <div>
                  <div className="text-[7px] uppercase tracking-wider text-slate-400 leading-none">Disponible en</div>
                  <div className="text-[10px] font-bold leading-tight">Google Play</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 bg-black text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors w-full"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.61-.75 1.04-1.8 0.92-2.87-.92.04-2.01.62-2.65 1.37-.56.65-1.06 1.71-.93 2.74 1.03.08 2.06-.52 2.66-1.24z"/>
                </svg>
                <div>
                  <div className="text-[7px] uppercase tracking-wider text-slate-400 leading-none">Consíguelo en el</div>
                  <div className="text-[10px] font-bold leading-tight">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar con Desarrollado por SarriaTech Solutions S.A.S */}
        <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
          <p>© 2026 Conecta360. Todos los derechos reservados.</p>
          <p className="text-slate-300 font-semibold">
            Desarrollado por SarriaTech Solutions S.A.S
          </p>
        </div>
      </div>
    </footer>
  );
}
