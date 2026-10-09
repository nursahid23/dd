import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  TrendingUp,
  Box,
  Truck,
  ArrowDownRight,
  ArrowUpRight,
  Percent,
  Printer
} from 'lucide-react';
import { GateTransaction, GateSummaryStats } from '../types';
import { exportTransactionsToExcel, exportTransactionsToPdf } from '../services/exportService';

interface ReportsAnalyticsProps {
  transactions: GateTransaction[];
  stats: GateSummaryStats;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  transactions,
  stats,
  showToast
}) => {
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [reportType, setReportType] = useState<'ALL' | 'GATE_IN' | 'GATE_OUT'>('ALL');

  // Filter transactions based on selection
  const filteredTxs = transactions.filter((t) => {
    if (reportType !== 'ALL' && t.gateType !== reportType) return false;
    return true;
  });

  // Calculate Metrics
  const totalTransactions = filteredTxs.length;
  const totalGateIn = filteredTxs.filter((t) => t.gateType === 'GATE_IN').length;
  const totalGateOut = filteredTxs.filter((t) => t.gateType === 'GATE_OUT').length;

  const totalGrossKg = filteredTxs.reduce((acc, t) => acc + (t.weight.grossWeightKg || 0), 0);
  const totalNettoKg = filteredTxs.reduce((acc, t) => acc + (t.weight.netWeightKg || 0), 0);
  const totalNettoTon = (totalNettoKg / 1000).toFixed(1);

  // TEUs calculation: 20ft = 1 TEU, 40ft/45ft = 2 TEU
  const totalTeus = filteredTxs.reduce((acc, t) => {
    if (!t.container) return acc;
    return acc + (t.container.size === '20ft' ? 1 : 2);
  }, 0);

  const overweightCount = filteredTxs.filter((t) => t.weight.isOverweight).length;
  const overweightRate = totalTransactions > 0 ? ((overweightCount / totalTransactions) * 100).toFixed(1) : '0';

  const completedCount = filteredTxs.filter((t) => t.status === 'COMPLETED').length;
  const heldCount = filteredTxs.filter((t) => t.status === 'HELD_FOR_INSPECTION').length;

  const avgSeconds =
    totalTransactions > 0
      ? Math.round(filteredTxs.reduce((acc, t) => acc + t.processingTimeSeconds, 0) / totalTransactions)
      : 30;

  // Lane breakdown
  const laneCounts = {
    'LANE-01': filteredTxs.filter((t) => t.laneId === 'LANE-01').length,
    'LANE-02': filteredTxs.filter((t) => t.laneId === 'LANE-02').length,
    'LANE-03': filteredTxs.filter((t) => t.laneId === 'LANE-03').length,
    'LANE-04': filteredTxs.filter((t) => t.laneId === 'LANE-04').length,
    'LANE-05': filteredTxs.filter((t) => t.laneId === 'LANE-05').length,
  };

  const handleExportExcel = () => {
    const filename = `KICT_Laporan_Gate_${dateRange}_${Date.now()}.xlsx`;
    exportTransactionsToExcel(filteredTxs, filename);
    showToast(`Laporan format Excel (${filename}) berhasil diekspor secara otomatis!`, 'success');
  };

  const handleExportPdf = () => {
    const periodStr =
      dateRange === 'TODAY'
        ? 'Hari Ini (Shift Operasi Real-Time)'
        : dateRange === 'WEEK'
        ? '7 Hari Terakhir'
        : dateRange === 'MONTH'
        ? 'Bulan Berjalan 2026'
        : 'Seluruh Arsip Transaksi';

    exportTransactionsToPdf(
      filteredTxs,
      'LAPORAN ANALITIK OPERASIONAL SMART GATE KICT',
      periodStr
    );
    showToast('Laporan resmi KICT berhasil digenerate ke format PDF!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Pusat Laporan & Analitik Terminal (Reports)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Laporan Operasional Smart Gate KICT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekapitulasi data penimbangan, volume throughput TEUs, utilisasi gerbang, dan ekspor instan Excel & PDF.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Otomatis Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor Otomatis PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-semibold">Rentang Waktu:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'TODAY' as const, label: 'Hari Ini' },
              { id: 'WEEK' as const, label: '7 Hari Terakhir' },
              { id: 'MONTH' as const, label: 'Bulan Ini' },
              { id: 'ALL' as const, label: 'Semua Arsip' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  dateRange === r.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Arah Gerbang:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Arah (In & Out)</option>
            <option value="GATE_IN">Gate In (Muatan Impor / MT)</option>
            <option value="GATE_OUT">Gate Out (Muatan Ekspor / Delivery)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Transaksi Gate</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalTransactions}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">Truk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400">↑ {totalGateIn} In</span>
            <span>•</span>
            <span className="text-cyan-400">↓ {totalGateOut} Out</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Volume Throughput</span>
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {totalTeus}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">TEUs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Standar ISO 20ft & 40ft High Cube
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tonase Netto Muatan</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalNettoTon}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">Ton</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totalNettoKg.toLocaleString('id-ID')} kg
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ketidaksesuaian / Hold</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {overweightRate}%{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">({overweightCount} Truk)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {heldCount} unit dialihkan ke Bay K-2
          </div>
        </div>
      </div>

      {/* Visual Lane Distribution Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider">
            Distribusi Beban Transaksi per Lajur (Lane 01 - 05)
          </h3>
          <span className="text-slate-400 font-mono">Rata-rata Siklus: {avgSeconds} detik/truk</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Object.entries(laneCounts).map(([lane, count]) => {
            const pct = totalTransactions > 0 ? Math.round((count / totalTransactions) * 100) : 0;
            return (
              <div key={lane} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-1">
                <div className="text-[11px] font-mono text-slate-400">{lane}</div>
                <div className="text-lg font-bold font-mono text-amber-400">{count}</div>
                <div className="text-[10px] text-slate-500 font-mono">{pct}% total</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Summary Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Tabel Rekapitulasi Laporan Transaksi</h3>
            <p className="text-xs text-slate-400">Menampilkan {filteredTxs.length} baris data transaksi terverifikasi.</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Status: {completedCount} Selesai • {heldCount} Ditahan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">No Tiket</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Arah</th>
                <th className="py-3 px-3">Lajur</th>
                <th className="py-3 px-3">No Polisi Truk</th>
                <th className="py-3 px-3">Pengemudi</th>
                <th className="py-3 px-3">No Peti Kemas</th>
                <th className="py-3 px-3">Netto (kg)</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTxs.slice(0, 10).map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{t.timestamp.slice(11, 19) || t.timestamp}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {t.gateType === 'GATE_IN' ? 'GATE IN' : 'GATE OUT'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{t.laneId}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-white">{t.truckPlate}</td>
                  <td className="py-2.5 px-3 text-slate-200">{t.driver.driverName}</td>
                  <td className="py-2.5 px-3 font-mono">{t.container?.containerNumber || '(Chassis Kosong)'}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-right text-emerald-400">
                    {t.weight.netWeightKg.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : t.status === 'HELD_FOR_INSPECTION'
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTxs.length > 10 && (
          <div className="pt-2 text-center text-xs text-slate-500 font-mono">
            Menampilkan 10 dari total {filteredTxs.length} transaksi. Gunakan tombol "Ekspor Otomatis Excel / PDF" di atas untuk mengunduh seluruh data lengkap.
          </div>
        )}
      </div>
    </div>
  );
};
