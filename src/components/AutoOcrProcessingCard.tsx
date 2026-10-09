import React, { useState } from 'react';
import {
  Camera,
  ScanLine,
  Scale,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Printer,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock,
  Compass,
  Cpu
} from 'lucide-react';
import { GateTransaction } from '../types';
import { validateIso6346 } from '../data/mockGateData';

interface AutoOcrProcessingCardProps {
  currentTransaction: GateTransaction | null;
  onApproveAndOpenGate: (tx: GateTransaction) => void;
  onHoldForInspection: (tx: GateTransaction, reason: string) => void;
  onPrintTicket: (tx: GateTransaction) => void;
  onSelectAnotherTx: () => void;
}

export const AutoOcrProcessingCard: React.FC<AutoOcrProcessingCardProps> = ({
  currentTransaction,
  onApproveAndOpenGate,
  onHoldForInspection,
  onPrintTicket,
  onSelectAnotherTx
}) => {
  const [holdReason, setHoldReason] = useState<string>('');
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState<boolean>(false);

  if (!currentTransaction) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
          <Camera className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold font-terminal text-white">
            Sensor OCR & Timbangan Gerbang Dalam Keadaan Siap (Standby)
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tidak ada truk yang sedang berhenti di atas platform jembatan timbang. Pilih transaksi dari antrean atau klik tombol simulasi scan OCR.
          </p>
        </div>
      </div>
    );
  }

  const tx = currentTransaction;
  const container = tx.container;
  const driver = tx.driver;
  const weight = tx.weight;

  // Real-time ISO 6346 calculation check
  const isoCheck = container ? validateIso6346(container.containerNumber) : null;
  const isDriverSimValid = driver.isSimValid;
  const isCustomsCleared = container?.customsStatus === 'SPPB_CLEARED' || container?.customsStatus === 'NPE_EXPORT';
  const isDoPaid = container?.deliveryOrderStatus === 'PAID_VALID';
  const isSealIntact = container ? container.isSealIntact : true;
  const isOverweight = weight.isOverweight;

  const hasAnyCriticalIssue = !isDriverSimValid || !isCustomsCleared || !isDoPaid || !isSealIntact || isOverweight;

  return (
    <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-5 relative">
      {/* Glow highlight */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-amber-400">
                PENCATATAN OTOMATIS & TELEMETRI AKTIF • {tx.laneName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                OCR CONFIDENCE: {tx.ocrConfidence}%
              </span>
            </div>
            <h2 className="text-lg font-bold font-terminal text-white flex items-center gap-2">
              Tiket: {tx.ticketNumber} ({tx.gateType === 'GATE_IN' ? 'Pintu Masuk' : 'Pintu Keluar'})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-code">
          <span className="text-slate-400">Waktu Scan:</span>
          <span className="text-white font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {tx.timestamp}
          </span>
        </div>
      </div>

      {/* Main 3-Column Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMN 1: Camera OCR Scanner & Truck Telemetry */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-terminal">
              <Camera className="w-4 h-4" />
              <span>KAMERA OCR & KENDARAAN</span>
            </div>
            <span className="text-[10px] font-mono-code text-slate-400">CAM-GATE-01/02</span>
          </div>

          {/* Simulated Camera Viewfinder */}
          <div className="bg-slate-900 rounded-lg p-3 border border-cyan-500/30 relative overflow-hidden space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono-code text-cyan-400">
              <span>● LIVE OCR FEED</span>
              <span>1080P 60FPS</span>
            </div>

            {/* Target Plate recognition overlay */}
            <div className="border-2 border-dashed border-cyan-400/70 p-2.5 rounded bg-slate-950/80 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-mono-code uppercase block">
                Plat Nomor Truk (OCR Match: 99.4%)
              </span>
              <div className="text-xl font-bold font-mono-code text-amber-400 tracking-wider">
                {tx.truckPlate}
              </div>
            </div>

            <div className="text-[11px] font-mono-code text-slate-300 space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Truk:</span>
                <span className="text-white font-semibold">{tx.truckHeadModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transporter:</span>
                <span className="text-cyan-300 truncate max-w-[170px]">{driver.transporterCompany}</span>
              </div>
            </div>
          </div>

          {/* Weighbridge Live Scale */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-code">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Scale className="w-4 h-4" />
                <span>Jembatan Timbang ({weight.weighbridgeId})</span>
              </div>
              <span className="text-[10px] text-slate-400">Toleransi ±5kg</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Gross (Kotor)</span>
                <span className="font-bold text-white text-xs">{weight.grossWeightKg.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Tare (Truk)</span>
                <span className="font-bold text-slate-300 text-xs">{weight.tareWeightKg.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">Netto Muatan</span>
                <span className="font-bold text-emerald-400 text-xs">{weight.netWeightKg.toLocaleString('id-ID')} kg</span>
              </div>
            </div>

            {weight.isOverweight ? (
              <div className="p-2 rounded bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>MELEBIHI BATAS SWL: Max {weight.maxGrossWeightKg.toLocaleString('id-ID')} kg</span>
              </div>
            ) : (
              <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-between">
                <span>Status VGM SOLAS:</span>
                <span className="font-bold">TERVALIDASI (VGM-OK)</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Container Data & Customs Clearance */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-terminal">
              <ShieldCheck className="w-4 h-4" />
              <span>VALIDASI PETI KEMAS & BEA CUKAI</span>
            </div>
            {container && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-500/20 text-amber-300">
                {container.size} {container.type}
              </span>
            )}
          </div>

          {container ? (
            <div className="space-y-2.5 text-xs font-mono-code">
              {/* Container number banner */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nomor Peti Kemas (ISO 6346)</span>
                  <div className="text-base font-bold text-white tracking-wider">
                    {container.containerNumber}
                  </div>
                </div>
                <div className="text-right">
                  {isoCheck?.isValid ? (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ISO VALID
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold text-[10px] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      ISO INVALID
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">Kode ISO: {container.isoCode}</span>
                </div>
              </div>

              {/* Commodities and Seal */}
              <div className="space-y-1.5 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pelayaran:</span>
                  <span className="text-white font-semibold">{container.shippingLine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Komoditas:</span>
                  <span className="text-slate-200 truncate max-w-[190px]">{container.commodity}</span>
                </div>
                {container.hazmatClass && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Kelas Hazmat:</span>
                    <span>{container.hazmatClass}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Segel Bea Cukai:</span>
                  <span className="text-white font-mono-code font-semibold">{container.sealNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Kondisi Fisik Segel:</span>
                  {container.isSealIntact ? (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Utuh & Sesuai
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> RUSAK / BEDA SERI
                    </span>
                  )}
                </div>
              </div>

              {/* Status Documents Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-2 rounded-lg border ${
                  isCustomsCleared ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <span className="text-[9px] block uppercase text-slate-400">Bea Cukai</span>
                  <span className="font-bold">{container.customsStatus.replace('_', ' ')}</span>
                </div>
                <div className={`p-2 rounded-lg border ${
                  isDoPaid ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <span className="text-[9px] block uppercase text-slate-400">Delivery Order (DO)</span>
                  <span className="font-bold">{container.deliveryOrderStatus.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Target Yard allocation */}
              {container.targetYardSlot && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Alokasi Slot Yard:
                  </span>
                  <span className="text-amber-400 font-bold text-sm">
                    {container.targetYardSlot}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs font-mono-code">
              Truk Sasis Kosong (Bobtail / Empty Chassis)
            </div>
          )}
        </div>

        {/* COLUMN 3: Driver Validation & Quick Operator Approvals */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-terminal">
                <UserCheck className="w-4 h-4" />
                <span>VALIDASI IDENTITAS PENGEMUDI</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                isDriverSimValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {driver.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono-code">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Supir:</span>
                  <span className="text-white font-bold">{driver.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NIK:</span>
                  <span className="text-slate-300">{driver.driverNik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kartu RFID Gate:</span>
                  <span className="text-cyan-300 font-semibold">{driver.rfidCardId}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">No SIM B2 Umum:</span>
                  <span className="text-white">{driver.simNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Masa Berlaku SIM:</span>
                  <span className={`font-bold ${isDriverSimValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {driver.simExpiry} {isDriverSimValid ? '(Aktif)' : '(KADALUARSA)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Briefing K3 / APD:</span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    ✓ Lulus Sertifikasi Pelabuhan
                  </span>
                </div>
              </div>

              {driver.rejectionReason && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{driver.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Decision Box */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => onApproveAndOpenGate(tx)}
              className="w-full py-2.5 px-4 rounded-xl font-bold font-terminal text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validasi & Buka Portal Otomatis</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsHoldingModalOpen(true)}
                className="py-2 px-3 rounded-xl font-semibold text-[11px] font-mono-code bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tahan (Hold Bay)</span>
              </button>

              <button
                type="button"
                onClick={() => onPrintTicket(tx)}
                className="py-2 px-3 rounded-xl font-semibold text-[11px] font-mono-code bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak e-Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holding Confirmation Submodal */}
      {isHoldingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/60 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-terminal text-base font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Konfirmasi Penahanan Truk di Gate (Inspection Bay)</span>
            </div>
            <p className="text-xs text-slate-300">
              Truk <strong className="text-white">{tx.truckPlate}</strong> akan dialihkan dari lajur utama ke area inspeksi khusus (K-2) atau dipulangkan.
            </p>
            <div>
              <label className="block text-xs font-mono-code text-slate-400 mb-1">
                Catatan Alasan Penahanan:
              </label>
              <input
                type="text"
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Contoh: Segel rusak / Dokumen SPPB belum terbit / Overweight"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsHoldingModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onHoldForInspection(tx, holdReason || 'Pemeriksaan fisik lanjutan surveyor');
                  setIsHoldingModalOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Arahkan ke Bay Pemeriksaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
