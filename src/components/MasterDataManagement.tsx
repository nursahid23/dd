import React, { useState } from 'react';
import {
  Users,
  Truck,
  Box,
  Ship,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Database,
  Calendar,
  Phone,
  Building,
  ShieldAlert
} from 'lucide-react';
import {
  MasterDriver,
  MasterTruck,
  MasterContainer,
  MasterShippingLine,
  MasterDataTab
} from '../types';
import { exportMasterDataToExcel, exportMasterDataToPdf } from '../services/exportService';

interface MasterDataManagementProps {
  drivers: MasterDriver[];
  trucks: MasterTruck[];
  containers: MasterContainer[];
  shippingLines: MasterShippingLine[];
  onSaveDrivers: (drivers: MasterDriver[]) => void;
  onSaveTrucks: (trucks: MasterTruck[]) => void;
  onSaveContainers: (containers: MasterContainer[]) => void;
  onSaveShippingLines: (lines: MasterShippingLine[]) => void;
  onSyncNeon: () => void;
  isNeonConnected: boolean;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const MasterDataManagement: React.FC<MasterDataManagementProps> = ({
  drivers,
  trucks,
  containers,
  shippingLines,
  onSaveDrivers,
  onSaveTrucks,
  onSaveContainers,
  onSaveShippingLines,
  onSyncNeon,
  isNeonConnected,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<MasterDataTab>('DRIVERS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: MasterDataTab } | null>(null);

  // Form states
  const [driverForm, setDriverForm] = useState<Partial<MasterDriver>>({});
  const [truckForm, setTruckForm] = useState<Partial<MasterTruck>>({});
  const [containerForm, setContainerForm] = useState<Partial<MasterContainer>>({});
  const [shippingLineForm, setShippingLineForm] = useState<Partial<MasterShippingLine>>({});

  // Reset forms
  const openCreateModal = () => {
    if (activeTab === 'DRIVERS') {
      setDriverForm({
        id: `DRV-${Date.now().toString().slice(-4)}`,
        nik: '3305' + Math.floor(100000000000 + Math.random() * 900000000000),
        name: '',
        simNumber: 'SIM-B2-' + Math.floor(10000 + Math.random() * 90000) + '-JTG',
        simExpiry: '2028-12-31',
        phone: '0812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
        transporter: 'PT Meratus Forwarding Kalsel',
        rfidCardId: 'RFID-KICT-' + Math.floor(10000 + Math.random() * 90000),
        safetyInductionValid: true,
        status: 'ACTIVE'
      });
    } else if (activeTab === 'TRUCKS') {
      setTruckForm({
        id: `TRK-${Date.now().toString().slice(-4)}`,
        plateNumber: '',
        brandModel: 'Scania R500 V8 Highline',
        chassisType: '40ft Skeletal',
        tareWeightKg: 12500,
        maxGrossWeightKg: 32000,
        kirExpiry: '2028-06-30',
        transporter: 'PT Meratus Forwarding Kalsel',
        status: 'ACTIVE'
      });
    } else if (activeTab === 'CONTAINERS') {
      setContainerForm({
        id: `CNT-${Date.now().toString().slice(-4)}`,
        containerNumber: '',
        isoCode: '45G1',
        size: '40ft',
        type: 'Dry',
        shippingLine: 'Mediterranean Shipping Company (MSC)',
        tareWeightKg: 3800,
        maxPayloadKg: 28200,
        cargoStatus: 'FULL',
        customsStatus: 'SPPB_CLEARED',
        currentYardSlot: 'A-01-01-01',
        isValidIso: true
      });
    } else if (activeTab === 'SHIPPING_LINES') {
      setShippingLineForm({
        id: `SHP-${Date.now().toString().slice(-4)}`,
        code: '',
        name: '',
        country: 'Indonesia',
        agentContact: '',
        phone: '+62 21 ',
        email: '',
        address: '',
        activeContracts: 1,
        status: 'ACTIVE'
      });
    }
    setEditingItem(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'DRIVERS') setDriverForm({ ...item });
    if (activeTab === 'TRUCKS') setTruckForm({ ...item });
    if (activeTab === 'CONTAINERS') setContainerForm({ ...item });
    if (activeTab === 'SHIPPING_LINES') setShippingLineForm({ ...item });
    setIsCreateModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'DRIVERS') {
      if (!driverForm.name?.trim() || !driverForm.simNumber?.trim()) {
        showToast('Nama pengemudi dan No SIM wajib diisi!', 'warning');
        return;
      }

      if (editingItem) {
        const updated = drivers.map((d) => (d.id === editingItem.id ? ({ ...d, ...driverForm, updatedAt: new Date().toISOString() } as MasterDriver) : d));
        onSaveDrivers(updated);
        showToast(`Data pengemudi ${driverForm.name} berhasil diperbarui (CRUD Update).`, 'success');
      } else {
        const newDrv: MasterDriver = {
          ...(driverForm as MasterDriver),
          id: driverForm.id || `DRV-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        onSaveDrivers([newDrv, ...drivers]);
        showToast(`Pengemudi baru ${newDrv.name} berhasil ditambahkan (CRUD Create).`, 'success');
      }
    } else if (activeTab === 'TRUCKS') {
      if (!truckForm.plateNumber?.trim()) {
        showToast('Nomor plat polisi truk wajib diisi!', 'warning');
        return;
      }

      if (editingItem) {
        const updated = trucks.map((t) => (t.id === editingItem.id ? ({ ...t, ...truckForm, updatedAt: new Date().toISOString() } as MasterTruck) : t));
        onSaveTrucks(updated);
        showToast(`Data truk ${truckForm.plateNumber} berhasil diperbarui.`, 'success');
      } else {
        const newTrk: MasterTruck = {
          ...(truckForm as MasterTruck),
          id: truckForm.id || `TRK-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        onSaveTrucks([newTrk, ...trucks]);
        showToast(`Armada truk ${newTrk.plateNumber} berhasil didaftarkan.`, 'success');
      }
    } else if (activeTab === 'CONTAINERS') {
      if (!containerForm.containerNumber?.trim()) {
        showToast('Nomor peti kemas ISO 6346 wajib diisi!', 'warning');
        return;
      }

      if (editingItem) {
        const updated = containers.map((c) => (c.id === editingItem.id ? ({ ...c, ...containerForm, updatedAt: new Date().toISOString() } as MasterContainer) : c));
        onSaveContainers(updated);
        showToast(`Data kontainer ${containerForm.containerNumber} berhasil diperbarui.`, 'success');
      } else {
        const newCnt: MasterContainer = {
          ...(containerForm as MasterContainer),
          id: containerForm.id || `CNT-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        onSaveContainers([newCnt, ...containers]);
        showToast(`Peti kemas ${newCnt.containerNumber} berhasil didaftarkan.`, 'success');
      }
    } else if (activeTab === 'SHIPPING_LINES') {
      if (!shippingLineForm.code?.trim() || !shippingLineForm.name?.trim()) {
        showToast('Kode pelayaran dan nama perusahaan wajib diisi!', 'warning');
        return;
      }

      if (editingItem) {
        const updated = shippingLines.map((s) => (s.id === editingItem.id ? ({ ...s, ...shippingLineForm, updatedAt: new Date().toISOString() } as MasterShippingLine) : s));
        onSaveShippingLines(updated);
        showToast(`Data pelayaran ${shippingLineForm.name} berhasil diperbarui.`, 'success');
      } else {
        const newLine: MasterShippingLine = {
          ...(shippingLineForm as MasterShippingLine),
          id: shippingLineForm.id || `SHP-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        onSaveShippingLines([newLine, ...shippingLines]);
        showToast(`Shipping line ${newLine.name} berhasil ditambahkan.`, 'success');
      }
    }

    setIsCreateModalOpen(false);
  };

  // Handle Delete (Confirm & Execute)
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'DRIVERS') {
      onSaveDrivers(drivers.filter((d) => d.id !== itemToDelete.id));
      showToast(`Pengemudi ${itemToDelete.name} berhasil dihapus (CRUD Delete).`, 'success');
    } else if (itemToDelete.type === 'TRUCKS') {
      onSaveTrucks(trucks.filter((t) => t.id !== itemToDelete.id));
      showToast(`Truk ${itemToDelete.name} berhasil dihapus dari Master Data.`, 'success');
    } else if (itemToDelete.type === 'CONTAINERS') {
      onSaveContainers(containers.filter((c) => c.id !== itemToDelete.id));
      showToast(`Peti kemas ${itemToDelete.name} berhasil dihapus.`, 'success');
    } else if (itemToDelete.type === 'SHIPPING_LINES') {
      onSaveShippingLines(shippingLines.filter((s) => s.id !== itemToDelete.id));
      showToast(`Shipping line ${itemToDelete.name} berhasil dihapus.`, 'success');
    }

    setItemToDelete(null);
  };

  // Export handlers
  const handleExportExcel = () => {
    if (activeTab === 'DRIVERS') {
      exportMasterDataToExcel('Pengemudi', drivers, 'KICT_Master_Pengemudi.xlsx');
    } else if (activeTab === 'TRUCKS') {
      exportMasterDataToExcel('Armada_Truk', trucks, 'KICT_Master_Truk.xlsx');
    } else if (activeTab === 'CONTAINERS') {
      exportMasterDataToExcel('Peti_Kemas', containers, 'KICT_Master_Kontainer.xlsx');
    } else if (activeTab === 'SHIPPING_LINES') {
      exportMasterDataToExcel('Shipping_Lines', shippingLines, 'KICT_Master_Pelayaran.xlsx');
    }
    showToast(`Master data ${activeTab} berhasil diekspor ke format Excel (.xlsx)!`, 'success');
  };

  const handleExportPdf = () => {
    if (activeTab === 'DRIVERS') {
      const headers = ['No', 'NIK', 'Nama Lengkap', 'No SIM B2', 'Masa Berlaku', 'Transporter', 'RFID Card', 'Status'];
      const rows = drivers.map((d, i) => [i + 1, d.nik, d.name, d.simNumber, d.simExpiry, d.transporter, d.rfidCardId, d.status]);
      exportMasterDataToPdf('Laporan Master Data Pengemudi KICT', headers, rows, 'KICT_Master_Pengemudi.pdf');
    } else if (activeTab === 'TRUCKS') {
      const headers = ['No', 'Plat Polisi', 'Merek / Tipe', 'Chassis', 'Tare (kg)', 'SWL Max (kg)', 'Uji KIR', 'Ekspedisi', 'Status'];
      const rows = trucks.map((t, i) => [i + 1, t.plateNumber, t.brandModel, t.chassisType, t.tareWeightKg, t.maxGrossWeightKg, t.kirExpiry, t.transporter, t.status]);
      exportMasterDataToPdf('Laporan Master Data Armada Truk KICT', headers, rows, 'KICT_Master_Truk.pdf');
    } else if (activeTab === 'CONTAINERS') {
      const headers = ['No', 'No Kontainer', 'ISO', 'Ukuran', 'Tipe', 'Shipping Line', 'Muatan', 'Bea Cukai', 'Slot Yard'];
      const rows = containers.map((c, i) => [i + 1, c.containerNumber, c.isoCode, c.size, c.type, c.shippingLine, c.cargoStatus, c.customsStatus, c.currentYardSlot]);
      exportMasterDataToPdf('Laporan Master Data Peti Kemas KICT', headers, rows, 'KICT_Master_Kontainer.pdf');
    } else if (activeTab === 'SHIPPING_LINES') {
      const headers = ['No', 'Kode', 'Nama Shipping Line', 'Negara', 'Kontak Agen', 'Telepon', 'Email', 'Status'];
      const rows = shippingLines.map((s, i) => [i + 1, s.code, s.name, s.country, s.agentContact, s.phone, s.email, s.status]);
      exportMasterDataToPdf('Laporan Master Data Shipping Lines KICT', headers, rows, 'KICT_Master_Pelayaran.pdf');
    }
    showToast(`Master data ${activeTab} berhasil dicetak ke format PDF resmi!`, 'success');
  };

  // Filtered lists
  const filteredDrivers = drivers.filter((d) => {
    const matchQ = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   d.simNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   d.transporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   d.nik.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchQ && matchStatus;
  });

  const filteredTrucks = trucks.filter((t) => {
    const matchQ = t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.transporter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchQ && matchStatus;
  });

  const filteredContainers = containers.filter((c) => {
    const matchQ = c.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   c.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   c.currentYardSlot.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.customsStatus === statusFilter || c.cargoStatus === statusFilter;
    return matchQ && matchStatus;
  });

  const filteredShippingLines = shippingLines.filter((s) => {
    const matchQ = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   s.agentContact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Manajemen Data Induk Pelabuhan (CRUD)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Data Terintegrasi KICT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data pengemudi, armada truk kontainer, peti kemas ISO, dan agen pelayaran terdaftar di sistem.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data {activeTab === 'DRIVERS' ? 'Pengemudi' : activeTab === 'TRUCKS' ? 'Truk' : activeTab === 'CONTAINERS' ? 'Peti Kemas' : 'Pelayaran'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Ekspor ke format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Ekspor</span> Excel
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3 py-2 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Ekspor ke format PDF resmi"
          >
            <FileText className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Cetak</span> PDF
          </button>

          <button
            onClick={onSyncNeon}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Sinkronisasi ke Neon PostgreSQL"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Sinkron Neon</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'DRIVERS' as MasterDataTab, label: 'Master Pengemudi', icon: Users, count: drivers.length },
          { id: 'TRUCKS' as MasterDataTab, label: 'Master Armada Truk', icon: Truck, count: trucks.length },
          { id: 'CONTAINERS' as MasterDataTab, label: 'Master Peti Kemas', icon: Box, count: containers.length },
          { id: 'SHIPPING_LINES' as MasterDataTab, label: 'Master Shipping Line', icon: Ship, count: shippingLines.length },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari data ${activeTab.toLowerCase()} (nama, plat, kontainer, dsb)...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status</option>
            {activeTab === 'DRIVERS' && (
              <>
                <option value="ACTIVE">Aktif (Valid)</option>
                <option value="EXPIRED_SIM">SIM Kadaluarsa</option>
                <option value="BLACKLISTED">Blacklist</option>
              </>
            )}
            {activeTab === 'TRUCKS' && (
              <>
                <option value="ACTIVE">Siap Operasi</option>
                <option value="EXPIRED_KIR">Uji KIR Habis</option>
                <option value="MAINTENANCE">Perawatan</option>
              </>
            )}
            {activeTab === 'CONTAINERS' && (
              <>
                <option value="FULL">Muatan Penuh (FCL)</option>
                <option value="EMPTY">Kontainer Kosong (MT)</option>
                <option value="SPPB_CLEARED">Bea Cukai SPPB</option>
                <option value="HOLD_CUSTOMS">Hold Bea Cukai</option>
              </>
            )}
            {activeTab === 'SHIPPING_LINES' && (
              <>
                <option value="ACTIVE">Aktif Kerjasama</option>
                <option value="INACTIVE">Nonaktif</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* DATA TABLES (READ & ACTION CRUD) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* TAB 1: MASTER DRIVERS */}
        {activeTab === 'DRIVERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Pengemudi</th>
                  <th className="py-3 px-4">NIK & SIM B2</th>
                  <th className="py-3 px-4">Masa Berlaku SIM</th>
                  <th className="py-3 px-4">Perusahaan Transporter</th>
                  <th className="py-3 px-4">RFID Gate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs">
                      Tidak ada data pengemudi yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{driver.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{driver.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200">{driver.simNumber}</div>
                        <div className="text-[10px] text-slate-500">NIK: {driver.nik}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={driver.status === 'EXPIRED_SIM' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {driver.simExpiry}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {driver.transporter}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {driver.rfidCardId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border ${
                            driver.status === 'ACTIVE'
                              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                              : driver.status === 'EXPIRED_SIM'
                              ? 'bg-red-950 border-red-500/40 text-red-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {driver.status === 'ACTIVE' ? 'SIAP JALAN' : driver.status === 'EXPIRED_SIM' ? 'SIM KADALUARSA' : 'BLACKLIST'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(driver)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Data Pengemudi (CRUD Update)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: driver.id, name: driver.name, type: 'DRIVERS' })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                            title="Hapus Data Pengemudi (CRUD Delete)"
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
        )}

        {/* TAB 2: MASTER TRUCKS */}
        {activeTab === 'TRUCKS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">No Polisi Truk</th>
                  <th className="py-3 px-4">Merek Kepala / Tipe</th>
                  <th className="py-3 px-4">Jenis Chassis</th>
                  <th className="py-3 px-4">Tare / SWL Max (kg)</th>
                  <th className="py-3 px-4">Masa Berlaku Uji KIR</th>
                  <th className="py-3 px-4">Perusahaan Ekspedisi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTrucks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                      Tidak ada data armada truk yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredTrucks.map((truck) => (
                    <tr key={truck.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                        {truck.plateNumber}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        {truck.brandModel}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {truck.chassisType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="text-slate-400">{truck.tareWeightKg.toLocaleString()}</span> /{' '}
                        <span className="text-white font-semibold">{truck.maxGrossWeightKg.toLocaleString()} kg</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={truck.status === 'EXPIRED_KIR' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {truck.kirExpiry}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {truck.transporter}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border ${
                            truck.status === 'ACTIVE'
                              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                              : truck.status === 'EXPIRED_KIR'
                              ? 'bg-red-950 border-red-500/40 text-red-300'
                              : 'bg-amber-950 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {truck.status === 'ACTIVE' ? 'LAIK JALAN' : truck.status === 'EXPIRED_KIR' ? 'KIR HABIS' : 'PERAWATAN'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(truck)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Data Truk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: truck.id, name: truck.plateNumber, type: 'TRUCKS' })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                            title="Hapus Truk"
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
        )}

        {/* TAB 3: MASTER CONTAINERS */}
        {activeTab === 'CONTAINERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">No Peti Kemas ISO</th>
                  <th className="py-3 px-4">Ukuran & Tipe</th>
                  <th className="py-3 px-4">Shipping Line</th>
                  <th className="py-3 px-4">Tare / Max Payload</th>
                  <th className="py-3 px-4">Status Muatan</th>
                  <th className="py-3 px-4">Bea Cukai</th>
                  <th className="py-3 px-4">Slot Lapangan Yard</th>
                  <th className="py-3 px-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredContainers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                      Tidak ada data peti kemas yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map((cnt) => (
                    <tr key={cnt.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {cnt.containerNumber}
                        <span className="block text-[10px] text-slate-500 font-normal">ISO: {cnt.isoCode}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-400 font-semibold">{cnt.size}</span> • {cnt.type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {cnt.shippingLine}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="text-slate-400">{cnt.tareWeightKg.toLocaleString()}</span> /{' '}
                        <span className="text-white font-semibold">{cnt.maxPayloadKg.toLocaleString()} kg</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            cnt.cargoStatus === 'FULL'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {cnt.cargoStatus === 'FULL' ? 'FCL (ISI)' : 'MT (KOSONG)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            cnt.customsStatus === 'SPPB_CLEARED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : cnt.customsStatus === 'NPE_EXPORT'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              : 'bg-red-950 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {cnt.customsStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold text-xs">
                        {cnt.currentYardSlot}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(cnt)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Peti Kemas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: cnt.id, name: cnt.containerNumber, type: 'CONTAINERS' })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                            title="Hapus Peti Kemas"
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
        )}

        {/* TAB 4: MASTER SHIPPING LINES */}
        {activeTab === 'SHIPPING_LINES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Pelayaran</th>
                  <th className="py-3 px-4">Negara Asal</th>
                  <th className="py-3 px-4">Kontak Agen Pelabuhan</th>
                  <th className="py-3 px-4">Telepon & Email</th>
                  <th className="py-3 px-4">Kontrak Berjalan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredShippingLines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs">
                      Tidak ada data shipping line yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredShippingLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
                            {line.code}
                          </span>
                          <span className="font-semibold text-white">{line.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {line.country}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {line.agentContact}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        <div>{line.phone}</div>
                        <div className="text-[10px] text-slate-500">{line.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
                          {line.activeContracts} Layanan
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                          {line.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(line)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Shipping Line"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: line.id, name: line.name, type: 'SHIPPING_LINES' })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                            title="Hapus Shipping Line"
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
        )}
      </div>

      {/* MODAL: CREATE / EDIT MASTER DATA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Data' : 'Tambah Baru'} {activeTab === 'DRIVERS' ? 'Pengemudi' : activeTab === 'TRUCKS' ? 'Armada Truk' : activeTab === 'CONTAINERS' ? 'Peti Kemas' : 'Shipping Line'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* DRIVER FORM */}
              {activeTab === 'DRIVERS' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Pengemudi</label>
                    <input
                      type="text"
                      value={driverForm.name || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      placeholder="contoh: Ahmad Fauzi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">NIK (KTP)</label>
                    <input
                      type="text"
                      value={driverForm.nik || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, nik: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">No. SIM B2 Umum</label>
                    <input
                      type="text"
                      value={driverForm.simNumber || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, simNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Masa Berlaku SIM</label>
                    <input
                      type="date"
                      value={driverForm.simExpiry || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, simExpiry: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">No. Telepon / HP</label>
                    <input
                      type="text"
                      value={driverForm.phone || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Perusahaan Transporter / Ekspedisi</label>
                    <input
                      type="text"
                      value={driverForm.transporter || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, transporter: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status Kelaikan</label>
                    <select
                      value={driverForm.status || 'ACTIVE'}
                      onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="ACTIVE">Aktif (Siap Kerja)</option>
                      <option value="EXPIRED_SIM">SIM Kadaluarsa</option>
                      <option value="BLACKLISTED">Blacklist K3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kartu RFID Gate</label>
                    <input
                      type="text"
                      value={driverForm.rfidCardId || ''}
                      onChange={(e) => setDriverForm({ ...driverForm, rfidCardId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* TRUCK FORM */}
              {activeTab === 'TRUCKS' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nomor Polisi Truk (Plat)</label>
                    <input
                      type="text"
                      value={truckForm.plateNumber || ''}
                      onChange={(e) => setTruckForm({ ...truckForm, plateNumber: e.target.value.toUpperCase() })}
                      placeholder="contoh: B 9410 UEK"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Merek Kepala Truk (Head)</label>
                    <input
                      type="text"
                      value={truckForm.brandModel || ''}
                      onChange={(e) => setTruckForm({ ...truckForm, brandModel: e.target.value })}
                      placeholder="contoh: Scania R500 V8"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Jenis Chassis</label>
                    <select
                      value={truckForm.chassisType || '40ft Skeletal'}
                      onChange={(e) => setTruckForm({ ...truckForm, chassisType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="20ft Skeletal">20ft Skeletal</option>
                      <option value="40ft Skeletal">40ft Skeletal</option>
                      <option value="Multi-Axle Heavy">Multi-Axle Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Berat Kosong Tare (kg)</label>
                    <input
                      type="number"
                      value={truckForm.tareWeightKg || 12000}
                      onChange={(e) => setTruckForm({ ...truckForm, tareWeightKg: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kapasitas Maksimal SWL (kg)</label>
                    <input
                      type="number"
                      value={truckForm.maxGrossWeightKg || 32000}
                      onChange={(e) => setTruckForm({ ...truckForm, maxGrossWeightKg: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Masa Berlaku Uji KIR</label>
                    <input
                      type="date"
                      value={truckForm.kirExpiry || ''}
                      onChange={(e) => setTruckForm({ ...truckForm, kirExpiry: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status Kelaikan</label>
                    <select
                      value={truckForm.status || 'ACTIVE'}
                      onChange={(e) => setTruckForm({ ...truckForm, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="ACTIVE">Aktif (Laik Jalan)</option>
                      <option value="EXPIRED_KIR">Uji KIR Habis</option>
                      <option value="MAINTENANCE">Perawatan Bengkel</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Perusahaan Transporter</label>
                    <input
                      type="text"
                      value={truckForm.transporter || ''}
                      onChange={(e) => setTruckForm({ ...truckForm, transporter: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* CONTAINER FORM */}
              {activeTab === 'CONTAINERS' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nomor Peti Kemas (Format ISO 6346: 4 Huruf + 7 Angka)</label>
                    <input
                      type="text"
                      value={containerForm.containerNumber || ''}
                      onChange={(e) => setContainerForm({ ...containerForm, containerNumber: e.target.value.toUpperCase() })}
                      placeholder="contoh: MSCU 782194-2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ukuran</label>
                    <select
                      value={containerForm.size || '40ft'}
                      onChange={(e) => setContainerForm({ ...containerForm, size: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="20ft">20 Feet</option>
                      <option value="40ft">40 Feet</option>
                      <option value="45ft">45 Feet High Cube</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tipe Peti Kemas</label>
                    <select
                      value={containerForm.type || 'Dry'}
                      onChange={(e) => setContainerForm({ ...containerForm, type: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="Dry">Dry Container (General Cargo)</option>
                      <option value="Reefer">Refrigerated (Reefer)</option>
                      <option value="Hazmat (DG)">Dangerous Goods (DG)</option>
                      <option value="Open Top">Open Top</option>
                      <option value="Flat Rack">Flat Rack</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Shipping Line Pemilik</label>
                    <input
                      type="text"
                      value={containerForm.shippingLine || ''}
                      onChange={(e) => setContainerForm({ ...containerForm, shippingLine: e.target.value })}
                      placeholder="contoh: Mediterranean Shipping Company (MSC)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status Muatan</label>
                    <select
                      value={containerForm.cargoStatus || 'FULL'}
                      onChange={(e) => setContainerForm({ ...containerForm, cargoStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="FULL">FCL (Muatan Isi)</option>
                      <option value="EMPTY">MT (Kontainer Kosong)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status Bea Cukai</label>
                    <select
                      value={containerForm.customsStatus || 'SPPB_CLEARED'}
                      onChange={(e) => setContainerForm({ ...containerForm, customsStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                    >
                      <option value="SPPB_CLEARED">SPPB Rilis Impor</option>
                      <option value="NPE_EXPORT">NPE Ekspor</option>
                      <option value="HOLD_CUSTOMS">Hold Bea Cukai</option>
                      <option value="INSPECTION_REQUIRED">Perlu Periksa Fisik</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Alokasi Slot Yard (Blok-Row-Tier)</label>
                    <input
                      type="text"
                      value={containerForm.currentYardSlot || ''}
                      onChange={(e) => setContainerForm({ ...containerForm, currentYardSlot: e.target.value })}
                      placeholder="contoh: A-02-04-03"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* SHIPPING LINE FORM */}
              {activeTab === 'SHIPPING_LINES' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kode Operator</label>
                    <input
                      type="text"
                      value={shippingLineForm.code || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, code: e.target.value.toUpperCase() })}
                      placeholder="contoh: MSC"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Negara Asal</label>
                    <input
                      type="text"
                      value={shippingLineForm.country || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, country: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nama Resmi Perusahaan Pelayaran</label>
                    <input
                      type="text"
                      value={shippingLineForm.name || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kontak Agen Pelabuhan</label>
                    <input
                      type="text"
                      value={shippingLineForm.agentContact || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, agentContact: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Telepon Kantor</label>
                    <input
                      type="text"
                      value={shippingLineForm.phone || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Alamat Email Operasional</label>
                    <input
                      type="email"
                      value={shippingLineForm.email || ''}
                      onChange={(e) => setShippingLineForm({ ...shippingLineForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: DELETE ITEM (CRUD DELETE) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Penghapusan (CRUD)</h3>
                <p className="text-xs text-slate-400">Tindakan ini akan menghapus data dari Master Database.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus data <strong>"{itemToDelete.name}"</strong>? Data transaksi historis yang terhubung mungkin akan terpengaruh.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
