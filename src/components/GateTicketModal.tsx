import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Truck,
  Scale,
  Calendar,
  Clock
} from 'lucide-react';
import { GateTransaction } from '../types';

interface GateTicketModalProps {
  transaction: GateTransaction | null;
  onClose: () => void;
}

export const GateTicketModal: React.FC<GateTicketModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  const tx = transaction;
  const c = tx.container;
  const w = tx.weight;
  const d = tx.driver;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white font-terminal text-base">
              Pratinjau Tiket Resmi e-Pass Gerbang & e-EIR KICT
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Tiket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Canvas */}
        <div id="printable-ticket" className="bg-white text-slate-950 rounded-xl p-6 shadow-xl space-y-4 font-mono-code text-xs border-2 border-slate-300">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <div className="font-bold text-base tracking-wider font-terminal uppercase text-slate-900">
              KEBUMEN INTERNATIONAL CONTAINER TERMINAL
            </div>
            <div className="text-[10px] text-slate-600">
              Kawasan Industri & Pelabuhan Samudera Kebumen, Jawa Tengah - Indonesia
            </div>
            <div className="inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded text-[11px] uppercase tracking-widest mt-1">
              SURAT MASUK / KELUAR RESMI (e-GATE PASS)
            </div>
          </div>

          {/* Ticket ID & Timestamp */}
          <div className="flex items-center justify-between border-b border-dashed border-slate-400 pb-2 text-[11px]">
            <div>
              <span className="text-slate-600">NO TIKET: </span>
              <span className="font-bold text-slate-950">{tx.ticketNumber}</span>
            </div>
            <div>
              <span className="text-slate-600">WAKTU: </span>
              <span className="font-bold text-slate-950">{tx.timestamp} WIB</span>
            </div>
            <div>
              <span className="text-slate-600">LAJUR: </span>
              <span className="font-bold text-slate-950">{tx.laneId}</span>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-3 text-[11px] border-b border-dashed border-slate-400 pb-3">
            <div className="space-y-1">
              <div className="font-bold uppercase text-[10px] text-slate-600">Data Kendaraan & Supir</div>
              <div>Plat Truk: <strong className="text-sm">{tx.truckPlate}</strong></div>
              <div>Nama Supir: <strong>{d.driverName}</strong></div>
              <div>Transporter: <strong>{d.transporterCompany}</strong></div>
              <div>RFID ID: <strong>{d.rfidCardId}</strong></div>
              <div>SIM B2: <strong>{d.simNumber} ({d.isSimValid ? 'Aktif' : 'Expired'})</strong></div>
            </div>

            <div className="space-y-1">
              <div className="font-bold uppercase text-[10px] text-slate-600">Data Peti Kemas & Timbangan</div>
              {c ? (
                <>
                  <div>No Kontainer: <strong className="text-sm">{c.containerNumber}</strong></div>
                  <div>Ukuran / Tipe: <strong>{c.size} {c.type} ({c.isoCode})</strong></div>
                  <div>Pelayaran: <strong>{c.shippingLine}</strong></div>
                  <div>No Segel: <strong>{c.sealNumber}</strong></div>
                  {c.targetYardSlot && (
                    <div className="bg-slate-100 p-1 rounded font-bold">
                      ALOKASI YARD: <span className="text-amber-700">{c.targetYardSlot}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500 italic">Sasis Kosong / Bobtail</div>
              )}
            </div>
          </div>

          {/* Weighbridge result */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-300 grid grid-cols-3 text-center text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px]">GROSS TIMBANGAN</span>
              <span className="font-bold text-sm">{w.grossWeightKg.toLocaleString('id-ID')} KG</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">TARE KENDARAAN</span>
              <span className="font-bold text-sm">{w.tareWeightKg.toLocaleString('id-ID')} KG</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">NETTO MUATAN</span>
              <span className="font-bold text-sm text-emerald-800">{w.netWeightKg.toLocaleString('id-ID')} KG</span>
            </div>
          </div>

          {/* Bottom Barcode / QR & Signatures */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="font-mono text-center font-bold tracking-widest text-xs border border-slate-400 p-1 bg-white">
                * ||| | |||| || | ||||| ||| | *
              </div>
              <div className="text-[9px] text-slate-500 text-center">
                TOKEN: {tx.ticketNumber.replace(/-/g, '')}
              </div>
            </div>

            <div className="text-center text-[10px] space-y-0.5">
              <div className="text-slate-600">Petugas / Operator Gate:</div>
              <div className="font-bold underline pt-3">KICT DIGITAL GATE AUTORUN</div>
              <div className="text-[9px] text-slate-500">ISPS Code Security Certified</div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
