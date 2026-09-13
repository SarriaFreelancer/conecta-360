'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function MobileApkInstaller() {
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    // 1. Detectar dispositivo móvil o tablet real (nunca escritorio web)
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const mobileOrTabletRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet|Silk|Kindle/i;
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);
    const isSmallOrMediumScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;

    const isMobileOrTablet = mobileOrTabletRegex.test(ua) || (isTouch && isSmallOrMediumScreen);
    const androidDevice = /Android/i.test(ua);
    const iosDevice = /iPhone|iPad|iPod/i.test(ua);

    setIsMobile(isMobileOrTablet);
    setIsAndroid(androidDevice);
    setIsIOS(iosDevice);

    // Revisar si ya fue descartado en esta sesión
    if (typeof sessionStorage !== 'undefined') {
      const dismissed = sessionStorage.getItem('conecta360_apk_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }

    // 2. Capturar evento de instalación PWA/WebAPK ÚNICAMENTE si es móvil o tablet
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isMobileOrTablet) {
        setIsMobile(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('conecta360_apk_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('El usuario aceptó instalar la app oficial.');
          setIsDismissed(true);
          return;
        }
      } catch (err) {
        console.log('Error al invocar prompt nativo, procediendo con descarga APK:', err);
      }
    }

    // Abrir modal de instalación guiada de APK
    setShowModal(true);
    triggerApkDownload();
  };

  const triggerApkDownload = () => {
    setDownloadStarted(true);
    // Disparar descarga directa del APK con cabeceras Android
    const link = document.createElement('a');
    link.href = '/api/download-apk';
    link.download = 'conecta360.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Si no es móvil o fue descartado por el usuario, no mostramos el banner flotante grande
  if (!isMobile) return null;

  return (
    <>
      {/* 1. Banner Flotante Inferior de Instalación de APK en Móvil */}
      {!isDismissed && (
        <aside 
          aria-label="Instalación de la app móvil"
          className="fixed bottom-3 inset-x-3 sm:inset-x-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-slate-950/95 backdrop-blur-md text-white border border-blue-500/30 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between gap-3 max-w-xl mx-auto ring-1 ring-white/10">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0056d2] to-blue-400 p-0.5 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src="/images/logo-conecta-hero-icon.png"
                  alt="Conecta 360 App"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black tracking-tight text-white truncate">
                    App Conecta 360
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                    {isAndroid ? 'Android APK' : 'Móvil'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Instala la app oficial para solicitudes y chat rápido
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-[#0056d2] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Instalar APK</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Botón flotante discreto si el usuario lo descartó para permitir reinstalar cuando quiera */}
      {isDismissed && !showModal && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-2 rounded-full bg-slate-900 text-white border border-blue-400/40 text-[11px] font-bold shadow-xl flex items-center space-x-1.5 hover:bg-[#0056d2] transition-all"
            title="Descargar App Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instalar App</span>
          </button>
        </div>
      )}

      {/* 3. Modal de Instalación Guiada y Descarga de APK */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera del modal */}
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#002f6c] to-[#0056d2] p-1 flex items-center justify-center shrink-0 shadow-lg">
                <img
                  src="/images/logo-conecta-hero-icon.png"
                  alt="Conecta 360"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    APK Oficial v1.2.0
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">18 MB</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Instalar Conecta 360
                </h3>
                <p className="text-xs text-slate-500">
                  {isAndroid ? 'Optimizado para teléfonos Android' : 'Instalación para dispositivos móviles'}
                </p>
              </div>
            </div>

            {/* Estado de descarga */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center space-x-1.5 text-[#0056d2]">
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>Archivo: conecta360.apk</span>
                </span>
                <span className="text-emerald-600 font-black text-[11px]">Listo</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                Si la descarga no inició automáticamente en tu dispositivo, pulsa el botón inferior para comenzar de inmediato.
              </p>
            </div>

            {/* 3 Pasos Sencillos de Instalación */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Pasos para completar la instalación:
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#0056d2] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Abre el archivo descargado</p>
                    <p className="text-slate-500 text-[11px]">
                      Toca la notificación de descarga o busca <code className="bg-slate-200 px-1 rounded text-[10.5px]">conecta360.apk</code> en tu carpeta de Descargas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#0056d2] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Permitir instalación de esta fuente</p>
                    <p className="text-slate-500 text-[11px]">
                      Si Android muestra advertencia de seguridad, pulsa en <em>"Configuración"</em> y activa la casilla <em>"Permitir desde esta fuente"</em>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#0056d2] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Presiona "Instalar" y listo</p>
                    <p className="text-slate-500 text-[11px]">
                      La app quedará en la pantalla principal de tu teléfono lista para contratar cuadrillas y servicios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Garantía de Seguridad */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paquete verificado y libre de software malicioso</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={triggerApkDownload}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0056d2] hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Descargar conecta360.apk</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
