import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  FileWarning,
  ExternalLink
} from 'lucide-react';
import { GateIssue, GateTransaction } from '../types';

interface IncidentAlertsBannerProps {
  transactions: GateTransaction[];
  onResolveIssue: (transactionId: string, issueId: string) => void;
  onViewTransaction: (tx: GateTransaction) => void;
  onSendToInspectionBay: (tx: GateTransaction) => void;
}

export const IncidentAlertsBanner: React.FC<IncidentAlertsBannerProps> = ({
  transactions,
  onResolveIssue,
  onViewTransaction,
  onSendToInspectionBay
}) => {
  // Extract all unresolved issues across all transactions
  const activeAlerts: { tx: GateTransaction; issue: GateIssue }[] = [];
  transactions.forEach((tx) => {
    tx.issues.forEach((issue) => {
      if (!issue.resolved) {
        activeAlerts.push({ tx, issue });
      }
    });
  });

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white font-terminal text-sm">
              Sistem Normal & Tanpa Kendala Kritis
            </div>
            <p className="text-slate-300 text-[11px]">
              Seluruh gerbang Gate In & Gate Out beroperasi lancar. Validasi OCR, sensor jembatan timbang, dan dokumen Bea Cukai berjalan tanpa pelanggaran.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono-code font-bold text-[11px]">
          STATUS: 100% CLEAR
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-terminal text-sm flex items-center gap-2">
              Pusat Notifikasi Kendala & Pelanggaran Operasional Gerbang
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono-code text-[10px]">
                {activeAlerts.length} Masalah Terdeteksi
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Validasi otomatis mendeteksi ketidaksesuaian data kontainer, beban lebih, atau pelanggaran izin pengemudi.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeAlerts.map(({ tx, issue }) => {
          const isCritical = issue.severity === 'CRITICAL';

          return (
            <div
              key={`${tx.id}-${issue.id}`}
              className={`p-4 rounded-xl border text-xs flex flex-col justify-between space-y-3 transition-all ${
                isCritical
                  ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/5'
                  : 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase ${
                        isCritical
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-bold text-white font-mono-code text-xs">
                      {tx.truckPlate}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono-code">
                      ({tx.laneId})
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px] font-mono-code">
                    {issue.detectedAt} WIB
                  </span>
                </div>

                <div>
                  <div className="font-bold text-white text-sm font-terminal">
                    {issue.title}
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-[11px] font-mono-code">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Instruksi Tindakan:</span>
                    <span className="text-amber-300 font-semibold">{issue.actionRequired}</span>
                  </div>
                  {tx.container && (
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>No Peti Kemas:</span>
                      <span className="text-cyan-300 font-bold">{tx.container.containerNumber}</span>
                    </div>
                  )}
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Pengemudi:</span>
                    <span className="text-white">{tx.driver.driverName} ({tx.driver.transporterCompany})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onViewTransaction(tx)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono-code font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Detail Transaksi</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendToInspectionBay(tx)}
                  className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800/80 border border-red-500/50 text-red-200 text-[11px] font-mono-code font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  <span>Arahkan ke Bay K-2</span>
                </button>

                <button
                  type="button"
                  onClick={() => onResolveIssue(tx.id, issue.id)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-mono-code font-bold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Selesaikan & Buka Gate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
