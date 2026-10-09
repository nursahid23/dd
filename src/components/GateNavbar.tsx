import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  PlusCircle,
  ScanLine,
  RefreshCw,
  SlidersHorizontal,
  Wifi,
  Bell,
  Database,
  Users,
  Box,
  FileSpreadsheet,
  FileText,
  LogOut,
  Building2,
  ChevronDown
} from 'lucide-react';
import { GateSummaryStats, AppView, User, NeonDbConfig } from '../types';

interface GateNavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
  neonConfig: NeonDbConfig;
  onOpenNeonModal: () => void;
  stats: GateSummaryStats;
  activeIssuesCount: number;
  onSimulateOcr: () => void;
  onOpenNewEntryModal: () => void;
  onOpenAlertsModal: () => void;
  onRefreshData: () => void;
  isSimulating: boolean;
}

export const GateNavbar: React.FC<GateNavbarProps> = ({
  currentView,
  onChangeView,
  currentUser,
  onLogout,
  neonConfig,
  onOpenNeonModal,
  stats,
  activeIssuesCount,
  onSimulateOcr,
  onOpenNewEntryModal,
  onOpenAlertsModal,
  onRefreshData,
  isSimulating
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-2xl">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>TOS REAL-TIME LIVE</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          {/* Real Online Database status */}
          <button
            onClick={onOpenNeonModal}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border transition-all bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900"
            title="Klik untuk melihat Status & Audit Query Real Database Neon"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {neonConfig.status === 'CONNECTED'
                ? `Neon DB: ONLINE (${neonConfig.activeDatabaseName || 'neondb'})`
                : 'Real DB: ONLINE (PostgreSQL Ready)'}
            </span>
          </button>

          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 font-mono hidden md:inline">
            OCR SENSORS: <span className="text-cyan-400 font-bold">10/10 AKTIF</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeString || '10:45:00 WIB'}</span>
          </div>

          {/* User info & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none">{currentUser.fullName || currentUser.name}</div>
                <div className="text-[10px] text-amber-400 font-mono leading-none mt-0.5">{currentUser.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors"
                title="Keluar (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onRefreshData}
            title="Muat Ulang Data Telemetri"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Terminal Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-terminal text-white tracking-wide">
                KICT TERMINAL OPERATING SYSTEM
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                v3.4 NEON DB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kebumen International Container Terminal • Gate System, Master Data & Reports
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Gate, Master Data, Transaksi, Laporan, Profil) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeView('GATE_OPERATIONS')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'GATE_OPERATIONS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Operasional Gerbang</span>
          </button>

          <button
            onClick={() => onChangeView('MASTER_DATA')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'MASTER_DATA'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Master Data (CRUD)</span>
          </button>

          <button
            onClick={() => onChangeView('TRANSACTIONS')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'TRANSACTIONS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Transaksi Data</span>
          </button>

          <button
            onClick={() => onChangeView('REPORTS')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'REPORTS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Laporan & Ekspor</span>
          </button>

          <button
            onClick={() => onChangeView('LOGIN_PROFILE')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'LOGIN_PROFILE'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Lihat Deskripsi Perusahaan KICT"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Profil KICT</span>
          </button>
        </div>

        {/* Action Controls for Gate view */}
        {currentView === 'GATE_OPERATIONS' && (
          <div className="flex items-center gap-2">
            {/* Notification / Issues Button */}
            <button
              onClick={onOpenAlertsModal}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                activeIssuesCount > 0
                  ? 'bg-red-950/50 border-red-500/60 text-red-300 hover:bg-red-900/50 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Notifikasi</span>
              {activeIssuesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white font-mono">
                  {activeIssuesCount}
                </span>
              )}
            </button>

            {/* Simulate Truck Arrival with OCR */}
            <button
              onClick={onSimulateOcr}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold cursor-pointer transition-all shadow-md disabled:opacity-50"
            >
              <ScanLine className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'text-cyan-400'}`} />
              <span>{isSimulating ? 'Memindai...' : 'Simulasi Scan OCR'}</span>
            </button>

            {/* Manual Gate Entry Button */}
            <button
              onClick={onOpenNewEntryModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Truk Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="bg-slate-950/90 border-t border-slate-800/90 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Total Gate-In Hari Ini</span>
            <span className="text-emerald-400 font-bold text-sm">{stats.todayTotalIn} Truk</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Total Gate-Out Hari Ini</span>
            <span className="text-cyan-400 font-bold text-sm">{stats.todayTotalOut} Truk</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Truk Sedang Dalam Gate</span>
            <span className="text-amber-400 font-bold text-sm">{stats.currentActiveTrucks} Unit</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Rata-rata Waktu Proses</span>
            <span className="text-white font-bold text-sm">{stats.avgTurnaroundMinutes} Menit</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Akurasi Kamera OCR</span>
            <span className="text-emerald-400 font-bold text-sm">{stats.ocrAccuracyRate}%</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Isu Perlu Perhatian</span>
            <span className={`font-bold text-sm ${activeIssuesCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {activeIssuesCount} Kejadian
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
