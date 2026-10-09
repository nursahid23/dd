import React from 'react';
import {
  Layers,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Gauge,
  UserCheck
} from 'lucide-react';
import { GateLane, QueueTruck, GateLaneId } from '../types';

interface QueueVisualizerProps {
  lanes: GateLane[];
  queueTrucks: QueueTruck[];
  selectedLaneId: GateLaneId | null;
  onSelectLane: (laneId: GateLaneId) => void;
  onProcessQueueTruck: (truck: QueueTruck) => void;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({
  lanes,
  queueTrucks,
  selectedLaneId,
  onSelectLane,
  onProcessQueueTruck
}) => {
  const totalInQueue = queueTrucks.length;
  const maxBufferCapacity = 25;
  const occupancyPercentage = Math.round((totalInQueue / maxBufferCapacity) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-terminal text-white flex items-center gap-2">
              Status Visual Antrean Jalur & Area Penyangga Truk (Pre-Gate Buffer)
            </h2>
            <p className="text-xs text-slate-400">
              Monitoring kepadatan lajur masuk, lajur keluar, dan antrean jembatan timbang secara real-time.
            </p>
          </div>
        </div>

        {/* Capacity Meter */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono-code text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Kapasitas Area Buffer</span>
            <span className="text-white font-bold">
              {totalInQueue} / {maxBufferCapacity} Truk ({occupancyPercentage}%)
            </span>
          </div>
          <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occupancyPercentage > 75
                  ? 'bg-red-500'
                  : occupancyPercentage > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 Lane Status Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {lanes.map((lane) => {
          const isSelected = selectedLaneId === lane.id;
          const laneQueue = queueTrucks.filter((q) => q.laneId === lane.id);

          let statusBg = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
          let statusText = 'SIAP / TERBUKA';
          if (lane.status === 'BUSY') {
            statusBg = 'bg-amber-500/10 border-amber-500/40 text-amber-400';
            statusText = 'SEDANG MEMPROSES';
          } else if (lane.status === 'ALERT') {
            statusBg = 'bg-red-500/10 border-red-500/40 text-red-400';
            statusText = 'PERIKSA FISIK / DITAHAN';
          } else if (lane.status === 'MAINTENANCE') {
            statusBg = 'bg-slate-800 border-slate-700 text-slate-400';
            statusText = 'MAINTENANCE';
          }

          return (
            <div
              key={lane.id}
              onClick={() => onSelectLane(lane.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-xs font-terminal text-white group-hover:text-amber-400 transition-colors">
                    {lane.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase ${
                      lane.type === 'GATE_IN'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {lane.type === 'GATE_IN' ? 'Masuk (In)' : 'Keluar (Out)'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 font-semibold line-clamp-2 min-h-[32px] leading-tight">
                  {lane.name}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono-code">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusBg}`}>
                    {statusText}
                  </span>
                  <span className="text-slate-400">
                    ~{lane.avgProcessTimeMinutes} min/truk
                  </span>
                </div>
              </div>

              {/* Lane Queue progress pill */}
              <div className="pt-2.5 border-t border-slate-800/80 text-xs font-mono-code flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Antrean:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  {laneQueue.length} Truk Menunggu
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Trucks in Waiting Line (Buffer) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold font-terminal text-white uppercase tracking-wider">
              Antrean Truk di Area Buffer Penyangga ({queueTrucks.length} Truk Menunggu Giliran Masuk Gate)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-code">
            Klik truk untuk memindahkan ke lajur aktif / proses cepat
          </span>
        </div>

        {queueTrucks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono-code">
            Tidak ada antrean truk di area penyangga. Seluruh lajur lancar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {queueTrucks.map((truck) => (
              <div
                key={truck.id}
                onClick={() => onProcessQueueTruck(truck)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between space-y-2 hover:border-amber-500/60 ${
                  truck.flaggedWarning
                    ? 'bg-red-950/30 border-red-500/40 hover:bg-red-900/30'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-mono-code font-bold flex items-center justify-center text-[10px]">
                      #{truck.queueNumber}
                    </span>
                    <div>
                      <div className="font-bold text-white font-mono-code text-sm">
                        {truck.truckPlate}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {truck.transporter}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold ${
                      truck.gateType === 'GATE_IN'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {truck.laneId}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Supir: <span className="text-slate-200">{truck.driverName}</span></span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3 h-3" />
                    {truck.waitingMinutes}m lalu
                  </span>
                </div>

                {truck.containerNumber && (
                  <div className="text-[10px] font-mono-code bg-slate-950 px-2 py-1 rounded text-cyan-300 border border-slate-800 flex items-center justify-between">
                    <span>Peti Kemas:</span>
                    <span className="font-bold">{truck.containerNumber}</span>
                  </div>
                )}

                {truck.flaggedWarning && (
                  <div className="text-[10px] text-red-300 bg-red-950/80 border border-red-500/40 px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{truck.flaggedWarning}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="w-full py-1 text-center text-[10px] font-bold font-mono-code bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <span>Arahkan Masuk Timbangan OCR</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
