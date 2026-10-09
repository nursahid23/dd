import React, { useState, useEffect } from 'react';
import {
  GateNavbar
} from './components/GateNavbar';
import {
  QueueVisualizer
} from './components/QueueVisualizer';
import {
  AutoOcrProcessingCard
} from './components/AutoOcrProcessingCard';
import {
  IncidentAlertsBanner
} from './components/IncidentAlertsBanner';
import {
  GateTransactionList
} from './components/GateTransactionList';
import {
  NewGateEntryModal
} from './components/NewGateEntryModal';
import {
  GateTicketModal
} from './components/GateTicketModal';
import {
  LoginCompanyProfile
} from './components/LoginCompanyProfile';
import {
  MasterDataManagement
} from './components/MasterDataManagement';
import {
  TransactionManagement
} from './components/TransactionManagement';
import {
  ReportsAnalytics
} from './components/ReportsAnalytics';
import {
  NeonDbModal
} from './components/NeonDbModal';

import {
  INITIAL_LANES,
  INITIAL_QUEUE_TRUCKS,
  INITIAL_TRANSACTIONS,
  INITIAL_STATS
} from './data/mockGateData';
import {
  INITIAL_MASTER_DRIVERS,
  INITIAL_MASTER_TRUCKS,
  INITIAL_MASTER_CONTAINERS,
  INITIAL_MASTER_SHIPPING_LINES
} from './data/masterSeedData';
import {
  GateLane,
  GateTransaction,
  QueueTruck,
  GateLaneId,
  GateSummaryStats,
  AppView,
  User,
  MasterDriver,
  MasterTruck,
  MasterContainer,
  MasterShippingLine,
  NeonDbConfig
} from './types';
import {
  getStoredNeonConfig,
  saveStoredNeonConfig,
  syncDataToNeon
} from './services/neonDbService';
import {
  getDatabaseStatus,
  fetchDriversApi,
  fetchTrucksApi,
  fetchContainersApi,
  fetchShippingLinesApi,
  fetchTransactionsApi,
  bulkSyncDatabaseApi,
  createTransactionApi
} from './services/apiService';

export default function App() {
  // User Authentication & Active View State
  // The first view is the Login & Company Profile as required:
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kict_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const savedUser = localStorage.getItem('kict_active_user');
    return savedUser ? 'GATE_OPERATIONS' : 'LOGIN_PROFILE';
  });

  // Neon DB Configuration State
  const [neonConfig, setNeonConfig] = useState<NeonDbConfig>(() => {
    return getStoredNeonConfig();
  });
  const [isNeonModalOpen, setIsNeonModalOpen] = useState<boolean>(false);

  // Master Data State (Drivers, Trucks, Containers, Shipping Lines)
  const [drivers, setDrivers] = useState<MasterDriver[]>(() => {
    const saved = localStorage.getItem('kict_master_drivers');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_DRIVERS;
  });

  const [trucks, setTrucks] = useState<MasterTruck[]>(() => {
    const saved = localStorage.getItem('kict_master_trucks');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_TRUCKS;
  });

  const [containers, setContainers] = useState<MasterContainer[]>(() => {
    const saved = localStorage.getItem('kict_master_containers');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_CONTAINERS;
  });

  const [shippingLines, setShippingLines] = useState<MasterShippingLine[]>(() => {
    const saved = localStorage.getItem('kict_master_shipping_lines');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_SHIPPING_LINES;
  });

  // Gate Operational Data State
  const [lanes, setLanes] = useState<GateLane[]>(() => {
    const saved = localStorage.getItem('kict_gate_lanes');
    return saved ? JSON.parse(saved) : INITIAL_LANES;
  });

  const [transactions, setTransactions] = useState<GateTransaction[]>(() => {
    const saved = localStorage.getItem('kict_gate_tx');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [queueTrucks, setQueueTrucks] = useState<QueueTruck[]>(() => {
    const saved = localStorage.getItem('kict_gate_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE_TRUCKS;
  });

  const [stats, setStats] = useState<GateSummaryStats>(INITIAL_STATS);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('TX-20260910-001');
  const [selectedLaneId, setSelectedLaneId] = useState<GateLaneId | null>(null);

  // Modals & simulation state
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState<boolean>(false);
  const [ticketToPrint, setTicketToPrint] = useState<GateTransaction | null>(null);
  const [isSimulatingOcr, setIsSimulatingOcr] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('kict_master_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('kict_master_trucks', JSON.stringify(trucks));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem('kict_master_containers', JSON.stringify(containers));
  }, [containers]);

  useEffect(() => {
    localStorage.setItem('kict_master_shipping_lines', JSON.stringify(shippingLines));
  }, [shippingLines]);

  useEffect(() => {
    localStorage.setItem('kict_gate_lanes', JSON.stringify(lanes));
  }, [lanes]);

  useEffect(() => {
    localStorage.setItem('kict_gate_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kict_gate_queue', JSON.stringify(queueTrucks));
  }, [queueTrucks]);

  // Load real online database data on mount
  useEffect(() => {
    async function initOnlineDatabase() {
      try {
        const dbStatus = await getDatabaseStatus();
        if (dbStatus && dbStatus.online) {
          if (dbStatus.neonConfigured) {
            setNeonConfig((prev) => ({
              ...prev,
              isConnected: true,
              status: 'CONNECTED',
              activeDatabaseName: dbStatus.databaseName,
            }));
          }

          // Fetch real data from server API
          const [apiDrivers, apiTrucks, apiContainers, apiShippingLines, apiTransactions] = await Promise.all([
            fetchDriversApi().catch(() => null),
            fetchTrucksApi().catch(() => null),
            fetchContainersApi().catch(() => null),
            fetchShippingLinesApi().catch(() => null),
            fetchTransactionsApi().catch(() => null),
          ]);

          if (apiDrivers && apiDrivers.length > 0) setDrivers(apiDrivers);
          if (apiTrucks && apiTrucks.length > 0) setTrucks(apiTrucks);
          if (apiContainers && apiContainers.length > 0) setContainers(apiContainers);
          if (apiShippingLines && apiShippingLines.length > 0) setShippingLines(apiShippingLines);
          if (apiTransactions && apiTransactions.length > 0) {
            setTransactions(apiTransactions);
            setCurrentTransactionId(apiTransactions[0].id);
          }
        }
      } catch (err) {
        console.warn('Real database auto-fetch fallback:', err);
      }
    }

    initOnlineDatabase();
  }, []);

  // Compute active issues count
  const activeIssuesCount = transactions.reduce((acc, tx) => {
    return acc + tx.issues.filter((i) => !i.resolved).length;
  }, 0);

  // Find currently active transaction
  const currentTransaction = transactions.find((t) => t.id === currentTransactionId) || transactions[0] || null;

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('kict_active_user', JSON.stringify(user));
    setCurrentView('GATE_OPERATIONS');
    showToast(`Selamat datang kembali, ${user.fullName || user.name || user.username} (${user.role})!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kict_active_user');
    setCurrentView('LOGIN_PROFILE');
    showToast('Anda telah keluar dari sistem Terminal KICT.', 'info');
  };

  // 1. Simulate Truck Arrival with OCR Camera Auto-Scan
  const handleSimulateOcr = () => {
    setIsSimulatingOcr(true);
    showToast('Kamera OCR gerbang mendeteksi kedatangan truk di jembatan timbang...', 'info');

    setTimeout(() => {
      let newPlate = 'B 9410 UEK';
      let driverName = 'Ahmad Fauzi';
      let transporter = 'PT Meratus Forwarding Kalsel';
      let containerNumber = 'MSCU 782194-2';

      if (queueTrucks.length > 0) {
        const nextInQueue = queueTrucks[0];
        newPlate = nextInQueue.truckPlate;
        driverName = nextInQueue.driverName;
        transporter = nextInQueue.transporter;
        if (nextInQueue.containerNumber) {
          containerNumber = nextInQueue.containerNumber;
        }
        setQueueTrucks((prev) => prev.slice(1));
      }

      const gross = Math.floor(27000 + Math.random() * 5000);
      const tare = 12500;
      const net = gross - tare;
      const isOverweight = gross > 31000;

      const newTx: GateTransaction = {
        id: `TX-${Date.now()}`,
        ticketNumber: `KICT-GT-20260910-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        gateType: 'GATE_IN',
        laneId: 'LANE-01',
        laneName: 'Lane 01 - Heavy & Reefer Inbound',
        truckPlate: newPlate,
        truckHeadModel: 'Scania R500 V8 Highline',
        driver: {
          rfidCardId: `RFID-KICT-${Math.floor(10000 + Math.random() * 90000)}`,
          driverName,
          driverNik: '3305102008850009',
          simNumber: 'SIM-B2-88129-JTG',
          simExpiry: '2028-10-22',
          isSimValid: true,
          transporterCompany: transporter,
          safetyBriefingValid: true,
          status: 'VALID'
        },
        container: {
          containerNumber,
          isoCode: '45G1',
          size: '40ft',
          type: 'Dry',
          sealNumber: `SEAL-CUSTOMS-${Math.floor(100000 + Math.random() * 900000)}`,
          carrierSealNumber: `SEAL-CARRIER-${Math.floor(10000 + Math.random() * 90000)}`,
          isSealIntact: true,
          customsStatus: 'SPPB_CLEARED',
          deliveryOrderStatus: 'PAID_VALID',
          shippingLine: 'Mediterranean Shipping Company (MSC)',
          commodity: 'Komoditas Industri Elektronik & Mesin',
          isValidIsoFormat: true,
          targetYardSlot: `A-0${Math.floor(1 + Math.random() * 4)}-0${Math.floor(1 + Math.random() * 5)}-0${Math.floor(1 + Math.random() * 4)}`
        },
        weight: {
          grossWeightKg: gross,
          tareWeightKg: tare,
          netWeightKg: net,
          maxGrossWeightKg: 31000,
          isOverweight,
          vgmCertificateNumber: `VGM-KICT-${Date.now().toString().slice(-6)}`,
          weighbridgeId: 'WB-IN-01',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        },
        status: isOverweight ? 'HELD_FOR_INSPECTION' : 'IN_PROGRESS',
        eirNumber: `EIR-IN-${Math.floor(10000 + Math.random() * 90000)}`,
        ocrConfidence: 99.4,
        processingTimeSeconds: 22,
        issues: isOverweight ? [{
          id: `ISS-${Date.now()}`,
          code: 'OVERWEIGHT_VGM',
          title: 'Muatan Overweight Terdeteksi Sensor Timbangan',
          description: `Gross timbangan (${gross.toLocaleString('id-ID')} kg) melampaui batas aman SWL 31.000 kg.`,
          severity: 'CRITICAL',
          detectedAt: new Date().toLocaleTimeString('id-ID'),
          actionRequired: 'Alihkan ke timbangan kalibrasi atau pemeriksaan surveyor K3',
          resolved: false
        }] : [],
        notes: 'Pencatatan real-time hasil trigger optik kamera gerbang otomatis.'
      };

      setTransactions((prev) => [newTx, ...prev]);
      setCurrentTransactionId(newTx.id);
      setIsSimulatingOcr(false);

      if (isOverweight) {
        showToast(`Peringatan: Truk ${newPlate} overweight (${gross} kg)! Otomatis ditahan.`, 'warning');
      } else {
        showToast(`OCR Berhasil: Truk ${newPlate} (${containerNumber}) tervalidasi lengkap!`, 'success');
      }
    }, 1200);
  };

  // 2. Approve and Open Gate Barrier
  const handleApproveAndOpenGate = (tx: GateTransaction) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === tx.id
          ? {
              ...item,
              status: 'COMPLETED',
              notes: (item.notes || '') + ' | Portal gerbang dibuka otomatis oleh operator.'
            }
          : item
      )
    );

    setStats((prev) => ({
      ...prev,
      todayTotalIn: tx.gateType === 'GATE_IN' ? prev.todayTotalIn + 1 : prev.todayTotalIn,
      todayTotalOut: tx.gateType === 'GATE_OUT' ? prev.todayTotalOut + 1 : prev.todayTotalOut,
      currentActiveTrucks: Math.max(1, prev.currentActiveTrucks - 1)
    }));

    showToast(`Portal Gerbang Dibuka! Truk ${tx.truckPlate} diizinkan masuk terminal. e-Pass diterbitkan.`, 'success');
  };

  // 3. Hold For Physical Inspection
  const handleHoldForInspection = (tx: GateTransaction, reason: string) => {
    const newIssue = {
      id: `ISSUE-${Date.now()}`,
      code: 'CUSTOMS_HOLD' as const,
      title: 'Penahanan Truk di Gate untuk Inspeksi Fisik',
      description: reason,
      severity: 'CRITICAL' as const,
      detectedAt: new Date().toLocaleTimeString('id-ID'),
      actionRequired: 'Arahkan ke Bay Pemeriksaan Fisik K-2 Bea Cukai / K3',
      resolved: false
    };

    setTransactions((prev) =>
      prev.map((item) =>
        item.id === tx.id
          ? {
              ...item,
              status: 'HELD_FOR_INSPECTION',
              issues: [newIssue, ...item.issues],
              notes: (item.notes || '') + ` | Ditahan: ${reason}`
            }
          : item
      )
    );

    showToast(`Truk ${tx.truckPlate} dialihkan ke Jalur Pemeriksaan K-2: ${reason}`, 'warning');
  };

  // 4. Resolve Issue
  const handleResolveIssue = (transactionId: string, issueId: string) => {
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id === transactionId) {
          const updatedIssues = item.issues.map((iss) =>
            iss.id === issueId ? { ...iss, resolved: true } : iss
          );
          const hasRemainingUnresolved = updatedIssues.some((iss) => !iss.resolved);
          return {
            ...item,
            issues: updatedIssues,
            status: hasRemainingUnresolved ? 'HELD_FOR_INSPECTION' : 'IN_PROGRESS'
          };
        }
        return item;
      })
    );
    showToast('Masalah berhasil diselesaikan dan dicatat dalam audit log.', 'success');
  };

  // 5. Send to Inspection Bay
  const handleSendToInspectionBay = (tx: GateTransaction) => {
    showToast(`Truk ${tx.truckPlate} telah diarahkan menuju Bay Inspeksi K-2 (Bea Cukai & K3).`, 'info');
  };

  // 6. Process Truck From Waiting Buffer
  const handleProcessQueueTruck = (truck: QueueTruck) => {
    const matchingTx = transactions.find((t) => t.truckPlate === truck.truckPlate);
    if (matchingTx) {
      setCurrentTransactionId(matchingTx.id);
      showToast(`Membuka data transaksi aktif untuk truk ${truck.truckPlate}.`, 'info');
    } else {
      handleSimulateOcr();
    }
  };

  // 7. Master Data & Transactions Live Database CRUD Handlers
  const handleSaveDrivers = async (updated: MasterDriver[]) => {
    setDrivers(updated);
    try {
      await bulkSyncDatabaseApi({ drivers: updated, trucks, containers, shippingLines, transactions });
    } catch (e) {
      console.warn('Sync drivers to real DB:', e);
    }
  };

  const handleSaveTrucks = async (updated: MasterTruck[]) => {
    setTrucks(updated);
    try {
      await bulkSyncDatabaseApi({ drivers, trucks: updated, containers, shippingLines, transactions });
    } catch (e) {
      console.warn('Sync trucks to real DB:', e);
    }
  };

  const handleSaveContainers = async (updated: MasterContainer[]) => {
    setContainers(updated);
    try {
      await bulkSyncDatabaseApi({ drivers, trucks, containers: updated, shippingLines, transactions });
    } catch (e) {
      console.warn('Sync containers to real DB:', e);
    }
  };

  const handleSaveShippingLines = async (updated: MasterShippingLine[]) => {
    setShippingLines(updated);
    try {
      await bulkSyncDatabaseApi({ drivers, trucks, containers, shippingLines: updated, transactions });
    } catch (e) {
      console.warn('Sync shipping lines to real DB:', e);
    }
  };

  const handleSaveTransactions = async (updated: GateTransaction[]) => {
    setTransactions(updated);
    try {
      await bulkSyncDatabaseApi({ drivers, trucks, containers, shippingLines, transactions: updated });
    } catch (e) {
      console.warn('Sync transactions to real DB:', e);
    }
  };

  const handleDataFetchedFromNeon = (data: {
    drivers?: MasterDriver[];
    trucks?: MasterTruck[];
    containers?: MasterContainer[];
    shippingLines?: MasterShippingLine[];
  }) => {
    if (data.drivers && data.drivers.length > 0) setDrivers(data.drivers);
    if (data.trucks && data.trucks.length > 0) setTrucks(data.trucks);
    if (data.containers && data.containers.length > 0) setContainers(data.containers);
    if (data.shippingLines && data.shippingLines.length > 0) setShippingLines(data.shippingLines);
  };

  // 8. Manual Neon Sync
  const handleTriggerNeonSync = async () => {
    if (!neonConfig.connectionString) {
      setIsNeonModalOpen(true);
      showToast('Harap masukkan Connection String Neon DB terlebih dahulu.', 'warning');
      return;
    }
    const allData = { drivers, trucks, containers, shippingLines, transactions };
    const res = await syncDataToNeon(neonConfig.connectionString, allData);
    if (res.success) {
      const updated = { ...neonConfig, lastSyncAt: new Date().toISOString() };
      setNeonConfig(updated);
      saveStoredNeonConfig(updated);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {notificationToast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl text-xs font-mono flex items-center gap-2.5 animate-bounce transition-all ${
            notificationToast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : notificationToast.type === 'warning'
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-cyan-950 border-cyan-500 text-cyan-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{notificationToast.message}</span>
        </div>
      )}

      {/* Main App Navigation Header (Always accessible when logged in, or can be used to switch) */}
      <GateNavbar
        currentView={currentView}
        onChangeView={(v) => setCurrentView(v)}
        currentUser={currentUser}
        onLogout={handleLogout}
        neonConfig={neonConfig}
        onOpenNeonModal={() => setIsNeonModalOpen(true)}
        stats={stats}
        activeIssuesCount={activeIssuesCount}
        onSimulateOcr={handleSimulateOcr}
        onOpenNewEntryModal={() => setIsNewEntryModalOpen(true)}
        onOpenAlertsModal={() => {
          if (currentView !== 'GATE_OPERATIONS') setCurrentView('GATE_OPERATIONS');
          setTimeout(() => {
            const el = document.getElementById('alerts-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onRefreshData={() => {
          setTransactions(INITIAL_TRANSACTIONS);
          setQueueTrucks(INITIAL_QUEUE_TRUCKS);
          setLanes(INITIAL_LANES);
          setDrivers(INITIAL_MASTER_DRIVERS);
          setTrucks(INITIAL_MASTER_TRUCKS);
          setContainers(INITIAL_MASTER_CONTAINERS);
          setShippingLines(INITIAL_MASTER_SHIPPING_LINES);
          showToast('Data telemetri gerbang & master data berhasil disinkronkan ulang.', 'info');
        }}
        isSimulating={isSimulatingOcr}
      />

      {/* Main Content Area Based on Active View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: LOGIN & COMPANY PROFILE */}
        {currentView === 'LOGIN_PROFILE' && (
          <LoginCompanyProfile
            onLoginSuccess={handleLoginSuccess}
            neonConfig={neonConfig}
            onOpenNeonModal={() => setIsNeonModalOpen(true)}
          />
        )}

        {/* VIEW 2: GATE OPERATIONS (Real-time Simulation & Weighbridge) */}
        {currentView === 'GATE_OPERATIONS' && (
          <>
            {/* Section A: Visual Alerts & Incident Notifications */}
            <div id="alerts-section">
              <IncidentAlertsBanner
                transactions={transactions}
                onResolveIssue={handleResolveIssue}
                onViewTransaction={(tx) => setCurrentTransactionId(tx.id)}
                onSendToInspectionBay={handleSendToInspectionBay}
              />
            </div>

            {/* Section B: Truck Queue & Waiting Buffer Visualizer */}
            <QueueVisualizer
              lanes={lanes}
              queueTrucks={queueTrucks}
              selectedLaneId={selectedLaneId}
              onSelectLane={(laneId) => setSelectedLaneId(laneId === selectedLaneId ? null : laneId)}
              onProcessQueueTruck={handleProcessQueueTruck}
            />

            {/* Section C: Real-time OCR Auto-Scan & Digital Weighbridge Processing Bay */}
            <AutoOcrProcessingCard
              currentTransaction={currentTransaction}
              onApproveAndOpenGate={handleApproveAndOpenGate}
              onHoldForInspection={handleHoldForInspection}
              onPrintTicket={(tx) => setTicketToPrint(tx)}
              onSelectAnotherTx={() => {
                const next = transactions.find((t) => t.id !== currentTransactionId);
                if (next) setCurrentTransactionId(next.id);
              }}
            />

            {/* Section D: Live Gate Movement Table & History */}
            <GateTransactionList
              transactions={transactions}
              selectedTransactionId={currentTransactionId}
              onSelectTransaction={(tx) => {
                setCurrentTransactionId(tx.id);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onPrintTicket={(tx) => setTicketToPrint(tx)}
            />
          </>
        )}

        {/* VIEW 3: MASTER DATA (CRUD DRIVERS, TRUCKS, CONTAINERS, SHIPPING LINES) */}
        {currentView === 'MASTER_DATA' && (
          <MasterDataManagement
            drivers={drivers}
            trucks={trucks}
            containers={containers}
            shippingLines={shippingLines}
            onSaveDrivers={handleSaveDrivers}
            onSaveTrucks={handleSaveTrucks}
            onSaveContainers={handleSaveContainers}
            onSaveShippingLines={handleSaveShippingLines}
            onSyncNeon={handleTriggerNeonSync}
            isNeonConnected={neonConfig.isConnected}
            showToast={showToast}
          />
        )}

        {/* VIEW 4: TRANSACTIONS DATA (CRUD GATE IN / OUT) */}
        {currentView === 'TRANSACTIONS' && (
          <TransactionManagement
            transactions={transactions}
            onSaveTransactions={handleSaveTransactions}
            onSelectTransaction={(tx) => {
              setCurrentTransactionId(tx.id);
              setCurrentView('GATE_OPERATIONS');
            }}
            onPrintTicket={(tx) => setTicketToPrint(tx)}
            onOpenNewEntryModal={() => setIsNewEntryModalOpen(true)}
            showToast={showToast}
          />
        )}

        {/* VIEW 5: REPORTS & ANALYTICS (EXCEL & PDF AUTOMATION) */}
        {currentView === 'REPORTS' && (
          <ReportsAnalytics
            transactions={transactions}
            stats={stats}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <NewGateEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        onSubmit={async (newTx) => {
          await handleSaveTransactions([newTx, ...transactions]);
          setCurrentTransactionId(newTx.id);
          showToast(`Tiket ${newTx.ticketNumber} diterbitkan & tersimpan di Real Database!`, 'success');
        }}
      />

      <GateTicketModal
        transaction={ticketToPrint}
        onClose={() => setTicketToPrint(null)}
      />

      <NeonDbModal
        isOpen={isNeonModalOpen}
        onClose={() => setIsNeonModalOpen(false)}
        config={neonConfig}
        onUpdateConfig={(newCfg) => setNeonConfig(newCfg)}
        allDataForSync={{ drivers, trucks, containers, shippingLines, transactions }}
        onDataFetchedFromNeon={handleDataFetchedFromNeon}
        showToast={showToast}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span>KICT Smart Gate Automation System • Kebumen International Container Terminal © 2026</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Terminal Operating System (TOS)</span>
            <span>•</span>
            <span className="text-emerald-400">
              Database: {neonConfig.isConnected ? 'Neon DB Online (Direct Cloud)' : 'Real Database Online (PostgreSQL Ready)'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
