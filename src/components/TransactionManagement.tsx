import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Truck,
  Scale,
  X,
  Save,
  ShieldCheck
} from 'lucide-react';
import { GateTransaction, GateType, GateStatus, GateLaneId } from '../types';
import { exportTransactionsToExcel, exportTransactionsToPdf } from '../services/exportService';

interface TransactionManagementProps {
  transactions: GateTransaction[];
  onSaveTransactions: (txs: GateTransaction[]) => void;
  onSelectTransaction: (tx: GateTransaction) => void;
  onPrintTicket: (tx: GateTransaction) => void;
  onOpenNewEntryModal: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const TransactionManagement: React.FC<TransactionManagementProps> = ({
  transactions,
  onSaveTransactions,
  onSelectTransaction,
  onPrintTicket,
  onOpenNewEntryModal,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gateTypeFilter, setGateTypeFilter] = useState<'ALL' | GateType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | GateStatus>('ALL');
  const [laneFilter, setLaneFilter] = useState<'ALL' | GateLaneId>('ALL');

  // Edit Modal State (CRUD Update)
  const [editingTx, setEditingTx] = useState<GateTransaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<GateTransaction | null>(null);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      tx.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.truckPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.container?.containerNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.eirNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = gateTypeFilter === 'ALL' || tx.gateType === gateTypeFilter;
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchLane = laneFilter === 'ALL' || tx.laneId === laneFilter;

    return matchSearch && matchType && matchStatus && matchLane;
  });

  // Handle Edit Submit (CRUD Update)
  const handleUpdateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const updated = transactions.map((t) => (t.id === editingTx.id ? editingTx : t));
    onSaveTransactions(updated);
    showToast(`Transaksi ${editingTx.ticketNumber} berhasil diperbarui (CRUD Update).`, 'success');
    setEditingTx(null);
  };

  // Handle Delete (CRUD Delete)
  const confirmDeleteTx = () => {
    if (!txToDelete) return;
    const updated = transactions.filter((t) => t.id !== txToDelete.id);
    onSaveTransactions(updated);
    showToast(`Tiket transaksi ${txToDelete.ticketNumber} (${txToDelete.truckPlate}) berhasil dihapus (CRUD Delete).`, 'success');
    setTxToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400 mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Pencatatan Gerbang Terminal (CRUD Transaksi)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Data Transaksi Gate In & Gate Out
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola arsip transaksi penimbangan, pencocokan OCR, status bea cukai, dan penerbitan surat jalan e-Pass KICT.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewEntryModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pendaftaran Gerbang Baru</span>
          </button>

          <button
            onClick={() => {
              exportTransactionsToExcel(filteredTransactions, `KICT_Transaksi_${Date.now()}.xlsx`);
              showToast(`Berhasil mengekspor ${filteredTransactions.length} data transaksi ke Excel!`, 'success');
            }}
            className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Ekspor ke format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Ekspor</span> Excel
          </button>

          <button
            onClick={() => {
              exportTransactionsToPdf(filteredTransactions, 'LAPORAN ARSIP TRANSAKSI SMART GATE KICT');
              showToast(`Laporan transaksi berhasil dicetak ke format PDF resmi!`, 'success');
            }}
            className="px-3 py-2 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Ekspor ke format PDF resmi"
          >
            <FileText className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Cetak</span> PDF
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tiket, plat, supir, kontainer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={gateTypeFilter}
            onChange={(e) => setGateTypeFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Arah Gerbang</option>
            <option value="GATE_IN">Gate In (Masuk Terminal)</option>
            <option value="GATE_OUT">Gate Out (Keluar Terminal)</option>
          </select>
        </div>

        <div>
          <select
            value={laneFilter}
            onChange={(e) => setLaneFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Lajur (Lane 01 - 05)</option>
            <option value="LANE-01">Lane 01 - Heavy & Reefer In</option>
            <option value="LANE-02">Lane 02 - Standard Inbound</option>
            <option value="LANE-03">Lane 03 - Fast Empty Inbound</option>
            <option value="LANE-04">Lane 04 - Heavy & Reefer Out</option>
            <option value="LANE-05">Lane 05 - Standard Outbound</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status Transaksi</option>
            <option value="COMPLETED">Selesai (Gate Pass Terbit)</option>
            <option value="IN_PROGRESS">Sedang Diproses</option>
            <option value="HELD_FOR_INSPECTION">Ditahan Inspeksi Fisik</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Transactions Table (CRUD Read & Action) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">No. Tiket & Waktu</th>
                <th className="py-3 px-4">Arah & Lajur</th>
                <th className="py-3 px-4">Truk & Pengemudi</th>
                <th className="py-3 px-4">Peti Kemas & Segel</th>
                <th className="py-3 px-4">Timbangan (Gross/Net)</th>
                <th className="py-3 px-4">Bea Cukai</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi CRUD & Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                    Tidak ada transaksi yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Ticket & Time */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-amber-400 text-xs">{tx.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{tx.timestamp.slice(11, 19) || tx.timestamp}</span>
                      </div>
                    </td>

                    {/* Direction & Lane */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                        {tx.gateType === 'GATE_IN' ? (
                          <span className="flex items-center text-emerald-400">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Masuk
                          </span>
                        ) : (
                          <span className="flex items-center text-cyan-400">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Keluar
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.laneId}</div>
                    </td>

                    {/* Truck & Driver */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-xs">{tx.truckPlate}</div>
                      <div className="text-slate-300 text-[11px]">{tx.driver.driverName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{tx.driver.transporterCompany}</div>
                    </td>

                    {/* Container & Seal */}
                    <td className="py-3.5 px-4">
                      {tx.container ? (
                        <>
                          <div className="font-mono font-bold text-white text-xs">{tx.container.containerNumber}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {tx.container.size} {tx.container.type} • Segel: {tx.container.sealNumber.slice(-6)}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">(Chassis Kosong)</span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div>
                        Gross: <span className="font-bold text-white">{tx.weight.grossWeightKg.toLocaleString('id-ID')} kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Netto: {tx.weight.netWeightKg.toLocaleString('id-ID')} kg
                      </div>
                      {tx.weight.isOverweight && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-500/40">
                          OVERWEIGHT
                        </span>
                      )}
                    </td>

                    {/* Customs status */}
                    <td className="py-3.5 px-4">
                      {tx.container ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            tx.container.customsStatus === 'SPPB_CLEARED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : tx.container.customsStatus === 'NPE_EXPORT'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              : 'bg-red-950 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {tx.container.customsStatus.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                            : tx.status === 'HELD_FOR_INSPECTION'
                            ? 'bg-red-950 border-red-500/40 text-red-300'
                            : tx.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {tx.status === 'COMPLETED'
                          ? 'SELESAI'
                          : tx.status === 'HELD_FOR_INSPECTION'
                          ? 'DITAHAN'
                          : tx.status === 'IN_PROGRESS'
                          ? 'PROSES'
                          : 'DITOLAK'}
                      </span>
                    </td>

                    {/* Actions (CRUD & Print) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintTicket(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                          title="Cetak Tiket e-Pass & EIR"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTx({ ...tx })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                          title="Edit Transaksi (CRUD Update)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                          title="Hapus Transaksi (CRUD Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL (CRUD UPDATE) */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Edit Data Transaksi Gerbang</h3>
                <p className="text-xs font-mono text-amber-400">{editingTx.ticketNumber} • Truk {editingTx.truckPlate}</p>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTx} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Transaksi</label>
                  <select
                    value={editingTx.status}
                    onChange={(e) => setEditingTx({ ...editingTx, status: e.target.value as GateStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  >
                    <option value="COMPLETED">COMPLETED (Gerbang Terbuka / Selesai)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Sedang Verifikasi)</option>
                    <option value="HELD_FOR_INSPECTION">HELD_FOR_INSPECTION (Ditahan Inspeksi)</option>
                    <option value="REJECTED">REJECTED (Ditolak Masuk/Keluar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jalur Gate</label>
                  <select
                    value={editingTx.laneId}
                    onChange={(e) => setEditingTx({ ...editingTx, laneId: e.target.value as GateLaneId })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  >
                    <option value="LANE-01">Lane 01 - Heavy & Reefer In</option>
                    <option value="LANE-02">Lane 02 - Standard Inbound</option>
                    <option value="LANE-03">Lane 03 - Fast Empty Inbound</option>
                    <option value="LANE-04">Lane 04 - Heavy & Reefer Out</option>
                    <option value="LANE-05">Lane 05 - Standard Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    value={editingTx.weight.grossWeightKg}
                    onChange={(e) => {
                      const gross = parseInt(e.target.value) || 0;
                      const net = gross - editingTx.weight.tareWeightKg;
                      setEditingTx({
                        ...editingTx,
                        weight: {
                          ...editingTx.weight,
                          grossWeightKg: gross,
                          netWeightKg: net,
                          isOverweight: gross > editingTx.weight.maxGrossWeightKg
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tare Weight (kg)</label>
                  <input
                    type="number"
                    value={editingTx.weight.tareWeightKg}
                    onChange={(e) => {
                      const tare = parseInt(e.target.value) || 0;
                      const net = editingTx.weight.grossWeightKg - tare;
                      setEditingTx({
                        ...editingTx,
                        weight: {
                          ...editingTx.weight,
                          tareWeightKg: tare,
                          netWeightKg: net
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                  />
                </div>

                {editingTx.container && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nomor Segel Bea Cukai</label>
                      <input
                        type="text"
                        value={editingTx.container.sealNumber}
                        onChange={(e) =>
                          setEditingTx({
                            ...editingTx,
                            container: { ...editingTx.container!, sealNumber: e.target.value }
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Status Dokumen Bea Cukai</label>
                      <select
                        value={editingTx.container.customsStatus}
                        onChange={(e) =>
                          setEditingTx({
                            ...editingTx,
                            container: { ...editingTx.container!, customsStatus: e.target.value as any }
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                      >
                        <option value="SPPB_CLEARED">SPPB Rilis (Impor)</option>
                        <option value="NPE_EXPORT">NPE Rilis (Ekspor)</option>
                        <option value="HOLD_CUSTOMS">Hold Bea Cukai</option>
                        <option value="INSPECTION_REQUIRED">Perlu Periksa Fisik</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Catatan Khusus Operator Gate</label>
                  <textarea
                    rows={2}
                    value={editingTx.notes || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: DELETE TRANSACTION (CRUD DELETE) */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Transaksi Gerbang</h3>
                <p className="text-xs text-slate-400">Pembatalan tiket operasional terminal.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>Apakah Anda yakin ingin menghapus data transaksi tiket:</p>
              <p className="font-mono text-amber-400 font-bold text-sm">{txToDelete.ticketNumber}</p>
              <p className="text-slate-400">Truk: {txToDelete.truckPlate} • Pengemudi: {txToDelete.driver.driverName}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteTx}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
