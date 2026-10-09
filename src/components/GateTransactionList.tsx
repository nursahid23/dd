import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  Truck,
  FileText,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Scale,
  ExternalLink
} from 'lucide-react';
import { GateTransaction, GateType, GateStatus } from '../types';

interface GateTransactionListProps {
  transactions: GateTransaction[];
  selectedTransactionId: string | null;
  onSelectTransaction: (tx: GateTransaction) => void;
  onPrintTicket: (tx: GateTransaction) => void;
}

export const GateTransactionList: React.FC<GateTransactionListProps> = ({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onPrintTicket
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GATE_IN' | 'GATE_OUT' | 'ISSUES' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter((tx) => {
    // Type/status filter
    if (filterType === 'GATE_IN' && tx.gateType !== 'GATE_IN') return false;
    if (filterType === 'GATE_OUT' && tx.gateType !== 'GATE_OUT') return false;
    if (filterType === 'ISSUES' && tx.status !== 'HELD_FOR_INSPECTION' && tx.issues.length === 0) return false;
    if (filterType === 'COMPLETED' && tx.status !== 'COMPLETED') return false;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchPlate = tx.truckPlate.toLowerCase().includes(q);
      const matchContainer = tx.container?.containerNumber.toLowerCase().includes(q) || false;
      const matchDriver = tx.driver.driverName.toLowerCase().includes(q);
      const matchTicket = tx.ticketNumber.toLowerCase().includes(q);
      const matchTransporter = tx.driver.transporterCompany.toLowerCase().includes(q);
      if (!matchPlate && !matchContainer && !matchDriver && !matchTicket && !matchTransporter) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white font-terminal text-base">
            Catatan Pergerakan Truk & Riwayat Gate Real-Time ({filtered.length})
          </h3>
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari plat nomor, kontainer, supir..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono-code"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-code">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
            filterType === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Semua ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('GATE_IN')}
          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
            filterType === 'GATE_IN'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Gate In Masuk
        </button>
        <button
          onClick={() => setFilterType('GATE_OUT')}
          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
            filterType === 'GATE_OUT'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Gate Out Keluar
        </button>
        <button
          onClick={() => setFilterType('ISSUES')}
          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
            filterType === 'ISSUES'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Periksa / Tertahan
        </button>
        <button
          onClick={() => setFilterType('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
            filterType === 'COMPLETED'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Selesai Lolos
        </button>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 font-mono-code">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">No Tiket & Waktu</th>
              <th className="p-3">Arah & Lajur</th>
              <th className="p-3">Plat Truk & Supir</th>
              <th className="p-3">Data Peti Kemas</th>
              <th className="p-3 text-right">Berat Timbangan</th>
              <th className="p-3">Status Gate</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-[11px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Tidak ada transaksi yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isSelected = selectedTransactionId === tx.id;
                const hasIssues = tx.issues.length > 0 || tx.status === 'HELD_FOR_INSPECTION';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10'
                        : hasIssues
                        ? 'bg-red-950/20 hover:bg-red-900/30'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Ticket & Time */}
                    <td className="p-3">
                      <div className="font-bold text-white font-mono-code">
                        {tx.ticketNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {tx.timestamp.slice(11, 19)} WIB
                      </div>
                    </td>

                    {/* Gate Direction & Lane */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.gateType === 'GATE_IN'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {tx.gateType === 'GATE_IN' ? 'MASUK' : 'KELUAR'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {tx.laneId}
                      </div>
                    </td>

                    {/* Truck & Driver */}
                    <td className="p-3">
                      <div className="font-bold text-amber-400 text-sm font-mono-code">
                        {tx.truckPlate}
                      </div>
                      <div className="text-white text-[11px]">
                        {tx.driver.driverName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {tx.driver.transporterCompany}
                      </div>
                    </td>

                    {/* Container Info */}
                    <td className="p-3">
                      {tx.container ? (
                        <div>
                          <div className="font-bold text-white text-xs">
                            {tx.container.containerNumber}
                          </div>
                          <div className="text-[10px] text-cyan-400">
                            {tx.container.size} {tx.container.type} • {tx.container.shippingLine}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Segel: {tx.container.sealNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">
                          Sasis Kosong (Bobtail)
                        </span>
                      )}
                    </td>

                    {/* Weighbridge scale */}
                    <td className="p-3 text-right">
                      <div className="font-bold text-white">
                        {tx.weight.grossWeightKg.toLocaleString('id-ID')} kg
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        Netto: {tx.weight.netWeightKg.toLocaleString('id-ID')} kg
                      </div>
                      {tx.weight.isOverweight && (
                        <div className="text-[9px] text-red-400 font-bold uppercase">
                          Overweight!
                        </div>
                      )}
                    </td>

                    {/* Gate Status */}
                    <td className="p-3">
                      {tx.status === 'COMPLETED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> SELESAI
                        </span>
                      ) : tx.status === 'HELD_FOR_INSPECTION' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> TAHAN / PERIKSA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> PROSES OCR
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectTransaction(tx)}
                          title="Tampilkan di Monitor OCR"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintTicket(tx)}
                          title="Cetak Tiket e-Pass"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
