import React, { useState } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  Scale,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock
} from 'lucide-react';
import {
  GateTransaction,
  GateType,
  GateLaneId
} from '../types';
import { validateIso6346 } from '../data/mockGateData';

interface NewGateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTx: GateTransaction) => void;
}

export const NewGateEntryModal: React.FC<NewGateEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [gateType, setGateType] = useState<GateType>('GATE_IN');
  const [laneId, setLaneId] = useState<GateLaneId>('LANE-01');
  const [truckPlate, setTruckPlate] = useState<string>('AA 8931 WD');
  const [truckHeadModel, setTruckHeadModel] = useState<string>('Hino 500 FM 260 JD');
  const [driverName, setDriverName] = useState<string>('Bambang Irawan');
  const [driverNik, setDriverNik] = useState<string>('3305101205840003');
  const [simNumber, setSimNumber] = useState<string>('SIM-B2-88310-KBM');
  const [simExpiry, setSimExpiry] = useState<string>('2028-05-14');
  const [transporterCompany, setTransporterCompany] = useState<string>('PT Samudera Logistik Nusantara');
  const [rfidCardId, setRfidCardId] = useState<string>('RFID-KICT-88914');

  // Container fields
  const [hasContainer, setHasContainer] = useState<boolean>(true);
  const [containerNumber, setContainerNumber] = useState<string>('MSCU 918204-5');
  const [isoCode, setIsoCode] = useState<string>('45G1');
  const [containerSize, setContainerSize] = useState<'20ft' | '40ft' | '45ft'>('40ft');
  const [containerType, setContainerType] = useState<'Dry' | 'Reefer' | 'Hazmat (DG)' | 'Open Top' | 'Flat Rack'>('Dry');
  const [sealNumber, setSealNumber] = useState<string>('SEAL-CUSTOMS-991204');
  const [shippingLine, setShippingLine] = useState<string>('Mediterranean Shipping Company (MSC)');
  const [commodity, setCommodity] = useState<string>('Komponen Manufaktur Otomotif');
  const [customsStatus, setCustomsStatus] = useState<'SPPB_CLEARED' | 'NPE_EXPORT' | 'HOLD_CUSTOMS' | 'INSPECTION_REQUIRED'>('SPPB_CLEARED');
  const [isSealIntact, setIsSealIntact] = useState<boolean>(true);
  const [targetYardSlot, setTargetYardSlot] = useState<string>('A-02-03-01');

  // Weight
  const [grossWeightKg, setGrossWeightKg] = useState<number>(30200);
  const [tareWeightKg, setTareWeightKg] = useState<number>(12800);
  const netWeightKg = Math.max(0, grossWeightKg - tareWeightKg);

  if (!isOpen) return null;

  // Real-time container ISO validation
  const isoValidation = hasContainer ? validateIso6346(containerNumber) : null;
  const isSimValid = new Date(simExpiry) >= new Date();
  const maxGross = containerSize === '20ft' ? 24000 : 32500;
  const isOverweight = grossWeightKg > maxGross;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTicketNumber = `KICT-GT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: GateTransaction = {
      id: `TX-${Date.now()}`,
      ticketNumber: newTicketNumber,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      gateType,
      laneId,
      laneName: laneId === 'LANE-01' ? 'Lane 01 - Heavy & Reefer Inbound' : laneId,
      truckPlate: truckPlate.toUpperCase(),
      truckHeadModel,
      driver: {
        rfidCardId,
        driverName,
        driverNik,
        simNumber,
        simExpiry,
        isSimValid,
        transporterCompany,
        safetyBriefingValid: true,
        status: isSimValid ? 'VALID' : 'EXPIRED_SIM',
        rejectionReason: isSimValid ? undefined : 'SIM B2 Umum telah kadaluarsa'
      },
      container: hasContainer ? {
        containerNumber: containerNumber.toUpperCase(),
        isoCode,
        size: containerSize,
        type: containerType,
        sealNumber,
        carrierSealNumber: sealNumber,
        isSealIntact,
        customsStatus,
        deliveryOrderStatus: 'PAID_VALID',
        shippingLine,
        commodity,
        isValidIsoFormat: isoValidation?.isValid || false,
        targetYardSlot: targetYardSlot || 'A-01-01-01'
      } : undefined,
      weight: {
        grossWeightKg,
        tareWeightKg,
        netWeightKg,
        maxGrossWeightKg: maxGross,
        isOverweight,
        vgmCertificateNumber: `VGM-KICT-${Date.now().toString().slice(-6)}`,
        weighbridgeId: gateType === 'GATE_IN' ? 'WB-IN-01' : 'WB-OUT-01',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      status: (!isSimValid || isOverweight || !isSealIntact || customsStatus === 'HOLD_CUSTOMS')
        ? 'HELD_FOR_INSPECTION'
        : 'IN_PROGRESS',
      eirNumber: `EIR-${gateType === 'GATE_IN' ? 'IN' : 'OUT'}-${Math.floor(10000 + Math.random() * 90000)}`,
      ocrConfidence: 99.4,
      processingTimeSeconds: 45,
      issues: [
        ...(!isSimValid ? [{
          id: `ISSUE-${Date.now()}-1`,
          code: 'EXPIRED_SIM' as const,
          title: 'SIM B2 Pengemudi Kadaluarsa',
          description: `SIM Pengemudi ${driverName} habis masa berlaku per ${simExpiry}.`,
          severity: 'WARNING' as const,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
          actionRequired: 'Pergantian supir resmi atau dispensasi K3 pelabuhan',
          resolved: false
        }] : []),
        ...(isOverweight ? [{
          id: `ISSUE-${Date.now()}-2`,
          code: 'OVERWEIGHT_VGM' as const,
          title: 'Muatan Overweight Melebihi Batas SWL',
          description: `Gross ${grossWeightKg} kg melebihi batas safe working load ${maxGross} kg.`,
          severity: 'CRITICAL' as const,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
          actionRequired: 'Alihkan ke timbangan ulang atau pembongkaran parsial',
          resolved: false
        }] : []),
        ...(!isSealIntact ? [{
          id: `ISSUE-${Date.now()}-3`,
          code: 'SEAL_MISMATCH' as const,
          title: 'Kondisi Segel Bea Cukai Tidak Utuh',
          description: 'Segel dilaporkan retak atau rusak saat inspeksi fisik gerbang.',
          severity: 'CRITICAL' as const,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
          actionRequired: 'Pemeriksaan fisik bersama petugas Bea Cukai di Bay K-2',
          resolved: false
        }] : [])
      ],
      notes: 'Pencatatan truk baru melalui form gate operator assist.'
    };

    onSubmit(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white font-terminal text-lg">
                Pencatatan Truk & Penerbitan e-Pass Baru (Gate Register)
              </h3>
              <p className="text-xs text-slate-400">
                Input data identitas truk, supir, peti kemas, dan hasil timbangan untuk penerbitan izin masuk/keluar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono-code">
          {/* Section 1: Gate Direction & Lane */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Arah Gerbang</label>
              <select
                value={gateType}
                onChange={(e) => setGateType(e.target.value as GateType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              >
                <option value="GATE_IN">GATE IN (Truk Masuk Terminal)</option>
                <option value="GATE_OUT">GATE OUT (Truk Keluar Pelabuhan)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Pilih Lajur (Lane)</label>
              <select
                value={laneId}
                onChange={(e) => setLaneId(e.target.value as GateLaneId)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="LANE-01">Lane 01 - Heavy Inbound (Weighbridge)</option>
                <option value="LANE-02">Lane 02 - General Inbound</option>
                <option value="LANE-03">Lane 03 - Empty Return</option>
                <option value="LANE-04">Lane 04 - Laden Outbound</option>
                <option value="LANE-05">Lane 05 - Empty Chassis Outbound</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Muatan Peti Kemas?</label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setHasContainer(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                    hasContainer ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Ada Peti Kemas
                </button>
                <button
                  type="button"
                  onClick={() => setHasContainer(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                    !hasContainer ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Sasis Kosong
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Truck & Driver Details */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="font-bold text-cyan-400 text-xs font-terminal flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>DATA ARMADA TRUK & PENGEMUDI</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nomor Plat Polisi</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Model / Tipe Kepala Truk</label>
                <input
                  type="text"
                  value={truckHeadModel}
                  onChange={(e) => setTruckHeadModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Perusahaan Ekspedisi (Transporter)</label>
                <input
                  type="text"
                  value={transporterCompany}
                  onChange={(e) => setTransporterCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-900">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nama Supir</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">No SIM B2 Umum</label>
                <input
                  type="text"
                  value={simNumber}
                  onChange={(e) => setSimNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Masa Berlaku SIM</label>
                <input
                  type="date"
                  value={simExpiry}
                  onChange={(e) => setSimExpiry(e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg p-2 text-white ${
                    isSimValid ? 'border-slate-700' : 'border-red-500 text-red-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">ID Kartu RFID Truk</label>
                <input
                  type="text"
                  value={rfidCardId}
                  onChange={(e) => setRfidCardId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Container Details (Conditional) */}
          {hasContainer && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-amber-400 text-xs font-terminal flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DATA PETI KEMAS & VALIDASI STANDAR ISO 6346</span>
                </div>
                {isoValidation && (
                  <span className={`text-[10px] font-bold ${isoValidation.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isoValidation.isValid ? '✓ Check Digit ISO Cocok' : '⚠ Check Digit ISO Beda'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nomor Peti Kemas (11 Digit)</label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: TEMU 123456-7"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ukuran & Tipe</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={containerSize}
                      onChange={(e) => setContainerSize(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="20ft">20ft</option>
                      <option value="40ft">40ft</option>
                      <option value="45ft">45ft</option>
                    </select>
                    <select
                      value={containerType}
                      onChange={(e) => setContainerType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="Dry">Dry</option>
                      <option value="Reefer">Reefer</option>
                      <option value="Hazmat (DG)">Hazmat</option>
                      <option value="Open Top">Open Top</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Perusahaan Pelayaran</label>
                  <input
                    type="text"
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nomor Segel (Seal)</label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Status Dokumen Bea Cukai</label>
                  <select
                    value={customsStatus}
                    onChange={(e) => setCustomsStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="SPPB_CLEARED">SPPB Rilis (Impor)</option>
                    <option value="NPE_EXPORT">NPE Disetujui (Ekspor)</option>
                    <option value="HOLD_CUSTOMS">HOLD Bea Cukai</option>
                    <option value="INSPECTION_REQUIRED">Jalur Merah (Periksa Fisik)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Kondisi Segel</label>
                  <select
                    value={isSealIntact ? 'true' : 'false'}
                    onChange={(e) => setIsSealIntact(e.target.value === 'true')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="true">Utuh & Terpasang Sesuai</option>
                    <option value="false">Rusak / Tidak Sesuai Manifest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rencana Slot Yard</label>
                  <input
                    type="text"
                    value={targetYardSlot}
                    onChange={(e) => setTargetYardSlot(e.target.value)}
                    placeholder="Contoh: A-01-02-03"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Weighbridge Scale Readings */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 text-xs font-terminal flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>DATA PENGUKURAN JEMBATAN TIMBANG DIGITAL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gross Weight (Berat Total Truk + Muatan)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tare Weight (Berat Kosong Truk & Sasis)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tareWeightKg}
                    onChange={(e) => setTareWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Netto (Berat Bersih Muatan Barang)</label>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-bold text-sm">
                  {netWeightKg.toLocaleString('id-ID')} kg
                </div>
              </div>
            </div>

            {isOverweight && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  PERINGATAN: Berat Kotor ({grossWeightKg} kg) melebihi batas aman SWL ({maxGross} kg). Truk otomatis dialihkan ke status penahanan.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Terbitkan e-Pass & Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
