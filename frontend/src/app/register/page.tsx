'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  Phone,
  Mail,
  Lock,
  Sparkles
} from 'lucide-react';
import { registerUser, getCurrentUser } from '@/lib/auth';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment, DEFAULT_CITY, DEFAULT_DEPARTMENT } from '@/lib/colombia-data';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');

  const [role, setRole] = useState<'USER' | 'PROVIDER'>(
    initialRoleParam === 'provider' ? 'PROVIDER' : 'PROVIDER' // Default a Prestador para facilitar onboarding
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Actualizar ciudades al cambiar de departamento
  useEffect(() => {
    const cities = getCitiesForDepartment(department);
    setAvailableCities(cities);
    if (!cities.includes(city)) {
      setCity(cities[0] || 'Cali');
    }
  }, [department]);

  useEffect(() => {
    // Si ya está logueado, redirigir
    const current = getCurrentUser();
    if (current) {
      router.push(current.role === 'PROVIDER' ? '/dashboard' : '/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (role === 'PROVIDER' && !profession.trim()) {
      setError('Por favor indica tu profesión u oficio.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const newUser = registerUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role,
          city,
          department,
          profession: role === 'PROVIDER' ? profession.trim() : undefined,
        });

        // Redirigir según el rol
        if (newUser.role === 'PROVIDER') {
          router.push('/dashboard?welcome=true');
        } else {
          router.push('/?registered=true');
        }
      } catch (err: any) {
        setError(err.message || 'Error al registrar el usuario');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo-conecta-nav.png"
            alt="CONECTA 360"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>
        <div className="text-xs text-slate-600 flex items-center space-x-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#0056d2]" />
          <span>Colombia &bull; Operación inicial Cali</span>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="inline-block bg-blue-100 text-[#0056d2] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Únete a la Comunidad Conecta 360
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Crear Cuenta
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Conecta lo que necesitas con quien puede hacerlo en Cali y Colombia
            </p>
          </div>

          {/* Selector de Rol */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all ${
                role === 'PROVIDER'
                  ? 'bg-white text-[#0056d2] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Quiero ofrecer servicios</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all ${
                role === 'USER'
                  ? 'bg-white text-[#0056d2] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Quiero contratar</span>
            </button>
          </div>

          {/* Banner explicativo del estado de Verificación para Prestadores */}
          {role === 'PROVIDER' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Verificación Única al Registrarte
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Al registrarte, tu cuenta se activa de inmediato para iniciar sesión y configurar tus servicios. Tu estado iniciará como <span className="font-bold underline">"Pendiente de Verificación"</span>. Una vez revisada tu información, se activará la insignia azul de verificado en tus tarjetas públicas.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Carlos Andrés"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Rodríguez"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@ejemplo.com"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Teléfono / WhatsApp *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                    +57
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="315 123 4567"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Campos de Ubicación en Colombia con Cali predeterminado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Departamento (Colombia) *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800 font-medium"
                >
                  {COLOMBIA_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Ciudad con Acceso a Transportes *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800 font-medium"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c} {c === 'Cali' ? '(Sede Principal)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profesión u Oficio (si es prestador) */}
            {role === 'PROVIDER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Profesión u Oficio Principal *
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ej: Electricista Certificado, Cerrajero 24 Horas, Plomero..."
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Contraseña de Acceso *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
              />
            </div>

            <div className="flex items-start space-x-2 pt-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#0056d2] focus:ring-[#0056d2] w-4 h-4"
                required
              />
              <span>
                Acepto los términos y condiciones de Conecta 360, políticas de tratamiento de datos personales de Colombia y acuerdo de servicios.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full py-3.5 px-4 bg-[#0056d2] hover:bg-[#0046a8] disabled:opacity-50 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {role === 'PROVIDER' ? 'Registrarme y Configurar Servicios' : 'Crear Cuenta'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link
              href="/login"
              className="font-bold text-[#0056d2] hover:text-[#0046a8] underline underline-offset-2"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CONECTA 360 Colombia &bull; Cali, Valle del Cauca.
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </React.Suspense>
  );
}

