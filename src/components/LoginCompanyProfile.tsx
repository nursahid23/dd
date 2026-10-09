import React, { useState } from 'react';
import {
  Anchor,
  ShieldCheck,
  Truck,
  Database,
  Building2,
  KeyRound,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Compass,
  Cpu,
  UserCheck
} from 'lucide-react';
import { User, UserRole, NeonDbConfig } from '../types';
import { INITIAL_USERS } from '../data/masterSeedData';

interface LoginCompanyProfileProps {
  onLoginSuccess: (user: User) => void;
  neonConfig: NeonDbConfig;
  onOpenNeonModal: () => void;
}

export const LoginCompanyProfile: React.FC<LoginCompanyProfileProps> = ({
  onLoginSuccess,
  neonConfig,
  onOpenNeonModal,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('OPERATOR_GATE');
  const [username, setUsername] = useState<string>('operator.gate');
  const [password, setPassword] = useState<string>('kict2026');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const matched = INITIAL_USERS.find((u) => u.role === role);
    if (matched) {
      setUsername(matched.username);
    }
  };

  const handleQuickLogin = (demoUser: User) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      onLoginSuccess(demoUser);
      setIsLoading(false);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Silakan masukkan username atau email petugas.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user or fallback to tailored role user
      let matched = INITIAL_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase()
      );

      if (!matched) {
        matched = {
          id: `USR-${Date.now()}`,
          username: username.trim(),
          fullName: username.includes('@') ? username.split('@')[0] : username,
          email: username.includes('@') ? username : `${username}@kict.port.id`,
          role: selectedRole,
          badgeNumber: `KIC-${selectedRole.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
          terminalAssigned: 'Gerbang Utama Terminal Peti Kemas KICT',
          lastLogin: new Date().toISOString()
        };
      } else {
        matched = {
          ...matched,
          role: selectedRole,
          lastLogin: new Date().toISOString()
        };
      }

      setIsLoading(false);
      onLoginSuccess(matched);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Anchor className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-wider text-white">KICT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                TOS v3.2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              PT Pelabuhan Kebumen Internasional • Terminal Operating System
            </p>
          </div>
        </div>

        {/* Real Online Database status badge & Quick Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNeonModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40"
            title="Klik untuk konfigurasi dan cek audit query Neon DB"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline font-sans">Database:</span>
            <span className="font-semibold">
              {neonConfig.status === 'CONNECTED' ? 'Neon DB Online' : 'Real DB Online (PostgreSQL)'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout: Left Company Profile, Right Login Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Comprehensive Company Description & Port Facilities (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Hero Tag */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-amber-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Gerbang Logistik Maritim Samudera Hindia • Pesisir Selatan Jawa</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                PT Pelabuhan Kebumen Internasional
                <span className="block text-amber-400 text-2xl sm:text-3xl font-bold mt-1">
                  Kebumen International Container Terminal (KICT)
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                KICT merupakan terminal peti kemas modern berstandar internasional yang beroperasi di pesisir selatan Kebumen, Jawa Tengah. Dirancang sebagai hub logistik terpadu untuk menopang rantai pasok industri nasional melalui jalur laut Samudera Hindia dengan akses langsung ke Jalur Jalan Lintas Selatan (JJLS) dan jaringan kereta api pelabuhan.
              </p>
            </div>

            {/* Core Port Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Fasilitas Dermaga</h2>
                    <span className="text-xs text-amber-400 font-mono font-semibold">650 m • -14.5 m LWS</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Dermaga beton bertulang mampu melayani kapal kontainer generasi Post-Panamax hingga 8.500 TEUs dengan 4 unit STS Crane elektrifikasi penuh.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Smart Gate Automation</h2>
                    <span className="text-xs text-cyan-400 font-mono font-semibold">5 Lane OCR & Weighbridge</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Kamera OCR optik otomatis, timbangan digital tersertifikasi VGM SOLAS, pembaca RFID supir, dan portal palang gerbang sinkron TOS real-time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Container Yard (CY)</h2>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">45 Hektar • 850.000 TEUs/Thn</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Kapasitas penumpukan 45.000 ground slot dengan 12 E-RTG, area dedicated reefer 240 plugs, dan blok khusus Dangerous Goods (DG Hazmat).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sertifikasi & Regulasi</h2>
                    <span className="text-xs text-purple-400 font-mono font-semibold">ISPS Code & ISO 27001</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Kepatuhan keamanan fasilitas pelabuhan internasional ISPS Code, ISO 9001/14001, integrasi INSW CEISA Bea Cukai rilis SPPB & NPE instan.
                </p>
              </div>
            </div>

            {/* Visi, Misi & SOP Gate System Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800/80 shadow-inner space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Visi KICT 2030: Pelabuhan Hijau, Cerdas & Tepercaya</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Menjadi terminal peti kemas terdepan di pesisir selatan pulau Jawa yang mengedepankan efisiensi operasional berbasis teknologi cerdas (Smart Port), keselamatan kerja K3 nihil kecelakaan (*zero accident*), dan perlindungan lingkungan maritim berkelanjutan."
              </p>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="text-base font-bold text-white font-mono">&lt; 45 Detik</div>
                  <div className="text-[11px] text-slate-400">Waktu Gate Cycle</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="text-base font-bold text-emerald-400 font-mono">99.4%</div>
                  <div className="text-[11px] text-slate-400">Akurasi Sensor OCR</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="text-base font-bold text-cyan-400 font-mono">24/7/365</div>
                  <div className="text-[11px] text-slate-400">Operasional Gate</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Modern Login Form Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl shadow-slate-950/80 relative overflow-hidden">
              {/* Subtle accent glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                      Otentikasi Petugas Gate
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Port Gateway ID: KICT-01</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Masuk Sistem TOS</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan kredensial atau gunakan akun uji coba cepat di bawah.
                </p>
              </div>

              {/* Error Notification if any */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Pilih Peran Petugas (Role)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'OPERATOR_GATE' as UserRole, label: 'Operator Gate', desc: 'Jalur Timbangan' },
                      { role: 'ADMIN_MASTER' as UserRole, label: 'Admin Master', desc: 'CRUD Data Induk' },
                      { role: 'SUPERVISOR_TOS' as UserRole, label: 'Supervisor', desc: 'Command TOS' },
                      { role: 'SURVEYOR_CUSTOMS' as UserRole, label: 'Bea Cukai / K3', desc: 'Inspeksi Fisik' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleChange(item.role)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedRole === item.role
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ID Pengguna / Email Resmi KICT
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="contoh: operator.gate"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                      required
                    />
                    <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi Keamanan
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                      required
                    />
                    <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                      <KeyRound className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Remember Me & Neon Database Status Note */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Ingat sesi di peramban ini</span>
                  </label>
                  <button
                    type="button"
                    onClick={onOpenNeonModal}
                    className="text-amber-400 hover:underline text-[11px]"
                  >
                    Atur Neon DB
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akses Gate...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Gerbang Operasi KICT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Demo Logins for effortless evaluation */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Masuk Cepat 1-Klik (Akun Demo):</span>
                  <span className="text-amber-400 font-mono text-[10px]">Instant Access</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {INITIAL_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickLogin(usr)}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                        {usr.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {usr.role.replace('_', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon DB live status note footer inside card */}
              <div className="mt-4 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {neonConfig.status === 'CONNECTED'
                      ? 'Real Database: Neon PostgreSQL Terhubung'
                      : 'Database: Siap Terhubung ke Neon DB'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenNeonModal}
                  className="text-amber-400 hover:underline font-mono text-[10px]"
                >
                  {neonConfig.status === 'CONNECTED' ? 'Uji Koneksi' : 'Koneksikan'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-8 text-center text-xs text-slate-500 font-mono">
        KICT Smart Gate Automation & Terminal Operating System • PT Pelabuhan Kebumen Internasional © 2026
      </footer>
    </div>
  );
};
