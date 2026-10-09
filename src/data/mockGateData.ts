import {
  GateLane,
  GateTransaction,
  QueueTruck,
  GateSummaryStats
} from '../types';

export const INITIAL_LANES: GateLane[] = [
  {
    id: 'LANE-01',
    name: 'Lane 01 - Heavy & Reefer Inbound (Weighbridge OCR)',
    type: 'GATE_IN',
    status: 'BUSY',
    queueCount: 4,
    maxQueueCapacity: 8,
    avgProcessTimeMinutes: 2.1,
    activeOperator: 'Foreman Aris Subekti'
  },
  {
    id: 'LANE-02',
    name: 'Lane 02 - General Cargo Inbound (OCR Smart Gate)',
    type: 'GATE_IN',
    status: 'OPEN',
    queueCount: 2,
    maxQueueCapacity: 8,
    avgProcessTimeMinutes: 1.8,
    activeOperator: 'Operator Bambang P.'
  },
  {
    id: 'LANE-03',
    name: 'Lane 03 - Empty Return & Fast Track Inbound',
    type: 'GATE_IN',
    status: 'OPEN',
    queueCount: 1,
    maxQueueCapacity: 8,
    avgProcessTimeMinutes: 1.2,
    activeOperator: 'Sistem Otomatis (Unmanned)'
  },
  {
    id: 'LANE-04',
    name: 'Lane 04 - Laden Cargo Outbound & Seal Verify',
    type: 'GATE_OUT',
    status: 'ALERT',
    queueCount: 3,
    maxQueueCapacity: 8,
    avgProcessTimeMinutes: 3.4,
    activeOperator: 'Surveyor Dedi Prasetyo'
  },
  {
    id: 'LANE-05',
    name: 'Lane 05 - Empty Chassis & Bobtail Outbound',
    type: 'GATE_OUT',
    status: 'OPEN',
    queueCount: 1,
    maxQueueCapacity: 8,
    avgProcessTimeMinutes: 0.9,
    activeOperator: 'Sistem Otomatis (Unmanned)'
  }
];

export const INITIAL_QUEUE_TRUCKS: QueueTruck[] = [
  {
    id: 'Q-01',
    queueNumber: 101,
    truckPlate: 'AA 8912 KD',
    transporter: 'PT Samudera Logistik Nusantara',
    driverName: 'Slamet Riyadi',
    containerNumber: 'TEMU 892019-4',
    gateType: 'GATE_IN',
    laneId: 'LANE-01',
    arrivalTime: '10:42:15',
    waitingMinutes: 6,
    hasPriority: true
  },
  {
    id: 'Q-02',
    queueNumber: 102,
    truckPlate: 'B 9410 UEK',
    transporter: 'PT Meratus Forwarding Kalsel',
    driverName: 'Ahmad Fauzi',
    containerNumber: 'MSCU 782194-2',
    gateType: 'GATE_IN',
    laneId: 'LANE-01',
    arrivalTime: '10:44:02',
    waitingMinutes: 4,
    hasPriority: false,
    flaggedWarning: 'Estimasi Berat Mendekati Batas Maksimal (Gross ~31.2 Ton)'
  },
  {
    id: 'Q-03',
    queueNumber: 103,
    truckPlate: 'AB 8102 FA',
    transporter: 'CV Kebumen Jaya Trans',
    driverName: 'Wahyu Hidayat',
    containerNumber: 'SITU 341829-0',
    gateType: 'GATE_IN',
    laneId: 'LANE-02',
    arrivalTime: '10:45:30',
    waitingMinutes: 3,
    hasPriority: false
  },
  {
    id: 'Q-04',
    queueNumber: 104,
    truckPlate: 'AD 9011 CK',
    transporter: 'PT Sinar Logistik Solo',
    driverName: 'Budi Santoso',
    containerNumber: 'ONEU 918234-7',
    gateType: 'GATE_OUT',
    laneId: 'LANE-04',
    arrivalTime: '10:41:10',
    waitingMinutes: 7,
    hasPriority: false,
    flaggedWarning: 'Segel Fisik Beda 1 Digit dari Manifest Bea Cukai'
  },
  {
    id: 'Q-05',
    queueNumber: 105,
    truckPlate: 'AA 9204 WD',
    transporter: 'Koperasi Angkutan Truk Gombong',
    driverName: 'Nur Kholis',
    containerNumber: 'TGHU 662019-1',
    gateType: 'GATE_IN',
    laneId: 'LANE-01',
    arrivalTime: '10:46:18',
    waitingMinutes: 2,
    hasPriority: false
  },
  {
    id: 'Q-06',
    queueNumber: 106,
    truckPlate: 'H 8192 QA',
    transporter: 'PT Pandu Siwi Express',
    driverName: 'Hendra Saputra',
    containerNumber: 'CMAU 451928-8',
    gateType: 'GATE_OUT',
    laneId: 'LANE-04',
    arrivalTime: '10:46:50',
    waitingMinutes: 1,
    hasPriority: false
  }
];

export const INITIAL_TRANSACTIONS: GateTransaction[] = [
  {
    id: 'TX-20260910-001',
    ticketNumber: 'KICT-GT-20260910-001',
    timestamp: '2026-09-10 10:40:22',
    gateType: 'GATE_IN',
    laneId: 'LANE-01',
    laneName: 'Lane 01 - Heavy & Reefer Inbound',
    truckPlate: 'AA 8912 KD',
    truckHeadModel: 'Hino 500 FM 260 JD (6x4)',
    driver: {
      rfidCardId: 'RFID-KICT-88912',
      driverName: 'Slamet Riyadi',
      driverNik: '3305120904830004',
      simNumber: 'SIM-B2-99214-JTG',
      simExpiry: '2028-11-20',
      isSimValid: true,
      transporterCompany: 'PT Samudera Logistik Nusantara',
      safetyBriefingValid: true,
      status: 'VALID'
    },
    container: {
      containerNumber: 'TEMU 892019-4',
      isoCode: '45R1',
      size: '40ft',
      type: 'Reefer',
      sealNumber: 'SEAL-CUSTOMS-882190',
      carrierSealNumber: 'SEAL-CARRIER-00912',
      isSealIntact: true,
      customsStatus: 'SPPB_CLEARED',
      deliveryOrderStatus: 'PAID_VALID',
      shippingLine: 'Evergreen Line',
      commodity: 'Frozen Seafood (Tuna & Udang Ekspor)',
      isValidIsoFormat: true,
      targetYardSlot: 'B-02-04-03'
    },
    weight: {
      grossWeightKg: 31400,
      tareWeightKg: 13200,
      netWeightKg: 18200,
      maxGrossWeightKg: 32500,
      isOverweight: false,
      vgmCertificateNumber: 'VGM-KICT-20260910-8812',
      weighbridgeId: 'WB-IN-01',
      timestamp: '2026-09-10 10:40:48'
    },
    status: 'IN_PROGRESS',
    eirNumber: 'EIR-IN-99201',
    ocrConfidence: 99.2,
    processingTimeSeconds: 65,
    issues: [],
    notes: 'Prioritas Reefer plug-in Blok B-02. Pengemudi terverifikasi via biometrik facial reader.'
  },
  {
    id: 'TX-20260910-002',
    ticketNumber: 'KICT-GT-20260910-002',
    timestamp: '2026-09-10 10:35:10',
    gateType: 'GATE_OUT',
    laneId: 'LANE-04',
    laneName: 'Lane 04 - Laden Cargo Outbound',
    truckPlate: 'AD 9011 CK',
    truckHeadModel: 'Mitsubishi Fuso Fighter FN 62 F',
    driver: {
      rfidCardId: 'RFID-KICT-77401',
      driverName: 'Budi Santoso',
      driverNik: '3311041508820002',
      simNumber: 'SIM-B2-88412-SLO',
      simExpiry: '2027-04-12',
      isSimValid: true,
      transporterCompany: 'PT Sinar Logistik Solo',
      safetyBriefingValid: true,
      status: 'VALID'
    },
    container: {
      containerNumber: 'ONEU 918234-7',
      isoCode: '45G1',
      size: '40ft',
      type: 'Dry',
      sealNumber: 'SEAL-CUST-991204',
      carrierSealNumber: 'SEAL-ONE-77210',
      isSealIntact: false,
      customsStatus: 'INSPECTION_REQUIRED',
      deliveryOrderStatus: 'PAID_VALID',
      shippingLine: 'Ocean Network Express (ONE)',
      commodity: 'Textile Machinery Spare Parts',
      isValidIsoFormat: true
    },
    weight: {
      grossWeightKg: 28900,
      tareWeightKg: 12400,
      netWeightKg: 16500,
      maxGrossWeightKg: 30480,
      isOverweight: false,
      weighbridgeId: 'WB-OUT-01',
      timestamp: '2026-09-10 10:35:32'
    },
    status: 'HELD_FOR_INSPECTION',
    ocrConfidence: 96.8,
    processingTimeSeconds: 145,
    issues: [
      {
        id: 'ISSUE-01',
        code: 'SEAL_MISMATCH',
        title: 'Segel Fisik Terindikasi Retak / Beda Seri',
        description: 'Sensor optik gerbang dan surveyor mendeteksi segel bea cukai SEAL-CUST-991204 terpasang kendur dan nomor tergores.',
        severity: 'CRITICAL',
        detectedAt: '10:35:45',
        actionRequired: 'Arahkan ke Jalur Pemeriksaan Bea Cukai (Customs Inspection Bay K-2)',
        resolved: false
      }
    ],
    notes: 'Truk ditahan di kantong parkir Gate Out 4. Petugas Bea Cukai & P2 telah diberi notifikasi.'
  },
  {
    id: 'TX-20260910-003',
    ticketNumber: 'KICT-GT-20260910-003',
    timestamp: '2026-09-10 10:28:40',
    gateType: 'GATE_IN',
    laneId: 'LANE-02',
    laneName: 'Lane 02 - General Cargo Inbound',
    truckPlate: 'B 9801 TEX',
    truckHeadModel: 'Isuzu Giga GXZ 60 K',
    driver: {
      rfidCardId: 'RFID-KICT-55120',
      driverName: 'Tri Haryanto',
      driverNik: '3174092001800005',
      simNumber: 'SIM-B2-44109-JKT',
      simExpiry: '2026-08-01', // Expired
      isSimValid: false,
      transporterCompany: 'PT Berkah Samudra Express',
      safetyBriefingValid: true,
      status: 'EXPIRED_SIM',
      rejectionReason: 'Masa berlaku SIM B2 Umum telah kadaluarsa sejak 1 Agustus 2026'
    },
    container: {
      containerNumber: 'MSCU 881290-3',
      isoCode: '22G1',
      size: '20ft',
      type: 'Dry',
      sealNumber: 'SEAL-MSC-99012',
      carrierSealNumber: 'SEAL-MSC-99012',
      isSealIntact: true,
      customsStatus: 'SPPB_CLEARED',
      deliveryOrderStatus: 'PAID_VALID',
      shippingLine: 'Mediterranean Shipping Company (MSC)',
      commodity: 'Biji Kopi Robusta Kebumen & Temanggung',
      isValidIsoFormat: true,
      targetYardSlot: 'A-01-03-02'
    },
    weight: {
      grossWeightKg: 24100,
      tareWeightKg: 10200,
      netWeightKg: 13900,
      maxGrossWeightKg: 24000,
      isOverweight: true,
      weighbridgeId: 'WB-IN-02',
      timestamp: '2026-09-10 10:29:10'
    },
    status: 'HELD_FOR_INSPECTION',
    ocrConfidence: 98.7,
    processingTimeSeconds: 110,
    issues: [
      {
        id: 'ISSUE-02',
        code: 'EXPIRED_SIM',
        title: 'SIM B2 Pengemudi Kadaluarsa',
        description: 'SIM B2 Umum atas nama Tri Haryanto telah habis masa berlaku pada 1 Agustus 2026.',
        severity: 'WARNING',
        detectedAt: '10:29:05',
        actionRequired: 'Pergantian supir berlisensi resmi atau dispensasi darurat supervisor K3',
        resolved: false
      },
      {
        id: 'ISSUE-03',
        code: 'OVERWEIGHT_VGM',
        title: 'Muatan Melebihi Batas Gross 20ft (+100 kg)',
        description: 'Gross timbangan 24.100 kg melebihi kapasitas standar safe working load chassis 24.000 kg.',
        severity: 'WARNING',
        detectedAt: '10:29:15',
        actionRequired: 'Verifikasi VGM dan izin khusus muatan berat ke Yard Master',
        resolved: false
      }
    ],
    notes: 'Sedang menunggu pengemudi pengganti dari pool ekspedisi.'
  },
  {
    id: 'TX-20260910-004',
    ticketNumber: 'KICT-GT-20260910-004',
    timestamp: '2026-09-10 10:20:15',
    gateType: 'GATE_IN',
    laneId: 'LANE-01',
    laneName: 'Lane 01 - Heavy & Reefer Inbound',
    truckPlate: 'R 8820 DB',
    truckHeadModel: 'UD Trucks Quester GWE 280',
    driver: {
      rfidCardId: 'RFID-KICT-66312',
      driverName: 'Agus Setiawan',
      driverNik: '3304121203870001',
      simNumber: 'SIM-B2-66102-BMS',
      simExpiry: '2027-09-15',
      isSimValid: true,
      transporterCompany: 'PT Banyumas Sejahtera Kargo',
      safetyBriefingValid: true,
      status: 'VALID'
    },
    container: {
      containerNumber: 'MEDU 771920-5',
      isoCode: '45G1',
      size: '40ft',
      type: 'Hazmat (DG)',
      sealNumber: 'SEAL-MED-881290',
      carrierSealNumber: 'SEAL-MED-881290',
      isSealIntact: true,
      customsStatus: 'SPPB_CLEARED',
      deliveryOrderStatus: 'PAID_VALID',
      shippingLine: 'Maersk Line',
      commodity: 'Industrial Solvent (Class 3 Flammable)',
      isValidIsoFormat: true,
      hazmatClass: 'Class 3 Flammable Liquid (UN 1993)',
      targetYardSlot: 'C-01-01-01'
    },
    weight: {
      grossWeightKg: 29800,
      tareWeightKg: 12900,
      netWeightKg: 16900,
      maxGrossWeightKg: 32500,
      isOverweight: false,
      vgmCertificateNumber: 'VGM-KICT-20260910-7712',
      weighbridgeId: 'WB-IN-01',
      timestamp: '2026-09-10 10:20:50'
    },
    status: 'COMPLETED',
    eirNumber: 'EIR-IN-99180',
    ocrConfidence: 99.8,
    processingTimeSeconds: 52,
    issues: [],
    notes: 'Barang berbahaya (Hazmat Class 3) dialokasikan langsung ke Blok C Khusus Damkar.'
  },
  {
    id: 'TX-20260910-005',
    ticketNumber: 'KICT-GT-20260910-005',
    timestamp: '2026-09-10 10:12:05',
    gateType: 'GATE_OUT',
    laneId: 'LANE-05',
    laneName: 'Lane 05 - Empty Chassis Outbound',
    truckPlate: 'AA 9002 EA',
    truckHeadModel: 'Hino Dutro 130 HD',
    driver: {
      rfidCardId: 'RFID-KICT-11029',
      driverName: 'Joko Prabowo',
      driverNik: '3305101102850007',
      simNumber: 'SIM-B2-11029-KBM',
      simExpiry: '2028-01-10',
      isSimValid: true,
      transporterCompany: 'CV Kebumen Jaya Trans',
      safetyBriefingValid: true,
      status: 'VALID'
    },
    weight: {
      grossWeightKg: 8500,
      tareWeightKg: 8500,
      netWeightKg: 0,
      maxGrossWeightKg: 16000,
      isOverweight: false,
      weighbridgeId: 'WB-OUT-02',
      timestamp: '2026-09-10 10:12:22'
    },
    status: 'COMPLETED',
    eirNumber: 'EIR-OUT-99175',
    ocrConfidence: 99.5,
    processingTimeSeconds: 38,
    issues: [],
    notes: 'Truk sasis kosong selesai bongkar kontainer impor, gerbang buka otomatis.'
  }
];

export const INITIAL_STATS: GateSummaryStats = {
  todayTotalIn: 184,
  todayTotalOut: 162,
  avgTurnaroundMinutes: 2.3,
  currentActiveTrucks: 11,
  activeIssuesCount: 2,
  yardCapacityTeu: 18500,
  yardOccupiedTeu: 12420,
  ocrAccuracyRate: 98.9
};

// Helper ISO 6346 validator function
export function validateIso6346(containerNumber: string): {
  isValid: boolean;
  ownerCode: string;
  category: string;
  serialNumber: string;
  checkDigit: number;
  calculatedCheckDigit?: number;
  message: string;
} {
  const cleaned = containerNumber.replace(/[\s-]/g, '').toUpperCase();
  if (cleaned.length !== 11) {
    return {
      isValid: false,
      ownerCode: '',
      category: '',
      serialNumber: '',
      checkDigit: 0,
      message: 'Panjang nomor kontainer harus 11 karakter (4 huruf + 7 angka).'
    };
  }

  const ownerCode = cleaned.slice(0, 3);
  const category = cleaned[3];
  const serialNumber = cleaned.slice(4, 10);
  const checkDigit = parseInt(cleaned[10], 10);

  // ISO 6346 letter values
  const charValues: Record<string, number> = {
    A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
    K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
    U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38
  };

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = cleaned[i];
    let val = 0;
    if (/[A-Z]/.test(char)) {
      val = charValues[char] || 0;
    } else if (/[0-9]/.test(char)) {
      val = parseInt(char, 10);
    }
    sum += val * Math.pow(2, i);
  }

  let calculatedCheckDigit = sum % 11;
  if (calculatedCheckDigit === 10) calculatedCheckDigit = 0;

  const isValid = calculatedCheckDigit === checkDigit;

  return {
    isValid,
    ownerCode,
    category,
    serialNumber,
    checkDigit,
    calculatedCheckDigit,
    message: isValid
      ? 'Nomor kontainer valid sesuai standar ISO 6346.'
      : `Check digit tidak cocok (tertulis ${checkDigit}, kalkulasi ISO adalah ${calculatedCheckDigit}).`
  };
}
