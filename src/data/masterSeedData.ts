import { MasterDriver, MasterTruck, MasterContainer, MasterShippingLine, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-01',
    username: 'operator.gate',
    fullName: 'Bambang Sudiro',
    email: 'bambang.sudiro@kict.port.id',
    role: 'OPERATOR_GATE',
    badgeNumber: 'KIC-GT-042',
    terminalAssigned: 'Gate Inbound Lane 01-03',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-10 07:15:00'
  },
  {
    id: 'USR-02',
    username: 'admin.master',
    fullName: 'Siti Rahmawati, S.Kom',
    email: 'siti.rahmawati@kict.port.id',
    role: 'ADMIN_MASTER',
    badgeNumber: 'KIC-ADM-018',
    terminalAssigned: 'Kantor Administrasi & Database TOS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-10 08:00:00'
  },
  {
    id: 'USR-03',
    username: 'spv.tos',
    fullName: 'Ir. Hendra Gunawan',
    email: 'hendra.gunawan@kict.port.id',
    role: 'SUPERVISOR_TOS',
    badgeNumber: 'KIC-SPV-007',
    terminalAssigned: 'Command Center & Yard Monitoring',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-10 06:45:00'
  },
  {
    id: 'USR-04',
    username: 'surveyor.customs',
    fullName: 'Agus Purnomo (Bea Cukai)',
    email: 'agus.purnomo@customs.go.id',
    role: 'SURVEYOR_CUSTOMS',
    badgeNumber: 'BC-KPKP-302',
    terminalAssigned: 'Pos K-2 Pemeriksaan Fisik Gate KICT',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-10 08:30:00'
  }
];

export const INITIAL_MASTER_DRIVERS: MasterDriver[] = [
  {
    id: 'DRV-001',
    nik: '3305102008850009',
    name: 'Ahmad Fauzi',
    simNumber: 'SIM-B2-88129-JTG',
    simExpiry: '2028-10-22',
    phone: '0812-3456-7890',
    transporter: 'PT Meratus Forwarding Kalsel',
    rfidCardId: 'RFID-KICT-98214',
    safetyInductionValid: true,
    status: 'ACTIVE',
    createdAt: '2026-01-15',
    updatedAt: '2026-08-20'
  },
  {
    id: 'DRV-002',
    nik: '3305121404880003',
    name: 'Budi Santoso',
    simNumber: 'SIM-B2-44102-JTG',
    simExpiry: '2027-05-18',
    phone: '0813-8877-2233',
    transporter: 'PT Samudera Indonesia Logistik',
    rfidCardId: 'RFID-KICT-67123',
    safetyInductionValid: true,
    status: 'ACTIVE',
    createdAt: '2026-02-01',
    updatedAt: '2026-07-14'
  },
  {
    id: 'DRV-003',
    nik: '3305010906920005',
    name: 'Candra Wijaya',
    simNumber: 'SIM-B2-12093-JTG',
    simExpiry: '2025-11-30',
    phone: '0857-9911-4455',
    transporter: 'PT Puninar Jaya Transport',
    rfidCardId: 'RFID-KICT-45190',
    safetyInductionValid: false,
    status: 'EXPIRED_SIM',
    createdAt: '2026-02-18',
    updatedAt: '2026-09-01'
  },
  {
    id: 'DRV-004',
    nik: '3305081109860002',
    name: 'Dedi Kurniawan',
    simNumber: 'SIM-B2-99381-JTG',
    simExpiry: '2029-03-12',
    phone: '0821-4433-8899',
    transporter: 'PT Salam Pacific Indonesia Lines',
    rfidCardId: 'RFID-KICT-33812',
    safetyInductionValid: true,
    status: 'ACTIVE',
    createdAt: '2026-03-10',
    updatedAt: '2026-08-30'
  },
  {
    id: 'DRV-005',
    nik: '3305141907840001',
    name: 'Eko Prasetyo',
    simNumber: 'SIM-B2-55219-JTG',
    simExpiry: '2027-12-05',
    phone: '0812-7766-5544',
    transporter: 'PT Cipta Krida Bahari',
    rfidCardId: 'RFID-KICT-12948',
    safetyInductionValid: true,
    status: 'ACTIVE',
    createdAt: '2026-03-22',
    updatedAt: '2026-06-19'
  }
];

export const INITIAL_MASTER_TRUCKS: MasterTruck[] = [
  {
    id: 'TRK-001',
    plateNumber: 'B 9410 UEK',
    brandModel: 'Scania R500 V8 Highline 6x4',
    chassisType: '40ft Skeletal',
    tareWeightKg: 12500,
    maxGrossWeightKg: 32000,
    kirExpiry: '2027-08-15',
    transporter: 'PT Meratus Forwarding Kalsel',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    updatedAt: '2026-08-15'
  },
  {
    id: 'TRK-002',
    plateNumber: 'AA 8821 KD',
    brandModel: 'Hino Profia 700 Series',
    chassisType: '20ft Skeletal',
    tareWeightKg: 10800,
    maxGrossWeightKg: 28000,
    kirExpiry: '2027-03-20',
    transporter: 'PT Samudera Indonesia Logistik',
    status: 'ACTIVE',
    createdAt: '2026-01-20',
    updatedAt: '2026-07-22'
  },
  {
    id: 'TRK-003',
    plateNumber: 'L 9032 UQ',
    brandModel: 'Volvo FH16 650 Euro 5',
    chassisType: 'Multi-Axle Heavy',
    tareWeightKg: 14200,
    maxGrossWeightKg: 42000,
    kirExpiry: '2026-07-10',
    transporter: 'PT Puninar Jaya Transport',
    status: 'EXPIRED_KIR',
    createdAt: '2026-02-12',
    updatedAt: '2026-07-10'
  },
  {
    id: 'TRK-004',
    plateNumber: 'B 9188 TIX',
    brandModel: 'Mercedes-Benz Actros 3340',
    chassisType: '40ft Skeletal',
    tareWeightKg: 12800,
    maxGrossWeightKg: 32000,
    kirExpiry: '2028-01-19',
    transporter: 'PT Salam Pacific Indonesia Lines',
    status: 'ACTIVE',
    createdAt: '2026-03-05',
    updatedAt: '2026-09-02'
  },
  {
    id: 'TRK-005',
    plateNumber: 'AA 9912 FB',
    brandModel: 'Isuzu Giga FVR Heavy',
    chassisType: '20ft Skeletal',
    tareWeightKg: 11200,
    maxGrossWeightKg: 26000,
    kirExpiry: '2027-11-28',
    transporter: 'PT Cipta Krida Bahari',
    status: 'MAINTENANCE',
    createdAt: '2026-03-15',
    updatedAt: '2026-08-11'
  }
];

export const INITIAL_MASTER_CONTAINERS: MasterContainer[] = [
  {
    id: 'CNT-001',
    containerNumber: 'MSCU 782194-2',
    isoCode: '45G1',
    size: '40ft',
    type: 'Dry',
    shippingLine: 'Mediterranean Shipping Company (MSC)',
    tareWeightKg: 3850,
    maxPayloadKg: 28650,
    cargoStatus: 'FULL',
    customsStatus: 'SPPB_CLEARED',
    currentYardSlot: 'A-02-04-03',
    isValidIso: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-09-08'
  },
  {
    id: 'CNT-002',
    containerNumber: 'MRKU 901244-8',
    isoCode: '22G1',
    size: '20ft',
    type: 'Dry',
    shippingLine: 'Maersk Line A/S',
    tareWeightKg: 2280,
    maxPayloadKg: 28200,
    cargoStatus: 'FULL',
    customsStatus: 'SPPB_CLEARED',
    currentYardSlot: 'B-01-02-02',
    isValidIso: true,
    createdAt: '2026-01-22',
    updatedAt: '2026-09-09'
  },
  {
    id: 'CNT-003',
    containerNumber: 'ONEY 441092-3',
    isoCode: '45R1',
    size: '40ft',
    type: 'Reefer',
    shippingLine: 'Ocean Network Express (ONE)',
    tareWeightKg: 4620,
    maxPayloadKg: 27880,
    cargoStatus: 'FULL',
    customsStatus: 'INSPECTION_REQUIRED',
    currentYardSlot: 'REEFER-03-01',
    isValidIso: true,
    createdAt: '2026-02-05',
    updatedAt: '2026-09-10'
  },
  {
    id: 'CNT-004',
    containerNumber: 'CMAU 582103-6',
    isoCode: '45G1',
    size: '40ft',
    type: 'Dry',
    shippingLine: 'CMA CGM Group',
    tareWeightKg: 3900,
    maxPayloadKg: 28600,
    cargoStatus: 'EMPTY',
    customsStatus: 'NPE_EXPORT',
    currentYardSlot: 'MT-04-02-01',
    isValidIso: true,
    createdAt: '2026-02-18',
    updatedAt: '2026-09-05'
  },
  {
    id: 'CNT-005',
    containerNumber: 'EGLV 319082-1',
    isoCode: '45U1',
    size: '40ft',
    type: 'Open Top',
    shippingLine: 'Evergreen Marine Corporation',
    tareWeightKg: 4100,
    maxPayloadKg: 28400,
    cargoStatus: 'FULL',
    customsStatus: 'HOLD_CUSTOMS',
    currentYardSlot: 'HOLD-01-01',
    isValidIso: true,
    createdAt: '2026-03-01',
    updatedAt: '2026-09-10'
  }
];

export const INITIAL_MASTER_SHIPPING_LINES: MasterShippingLine[] = [
  {
    id: 'SHP-001',
    code: 'MSC',
    name: 'Mediterranean Shipping Company S.A.',
    country: 'Switzerland',
    agentContact: 'Capt. Roberto Vianello',
    phone: '+62 21 5290 8800',
    email: 'id-agency@msc.com',
    address: 'Wisma GKBI Lt. 28, Jl. Jend. Sudirman, Jakarta Pusat',
    activeContracts: 4,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'SHP-002',
    code: 'MAERSK',
    name: 'A.P. Moller – Maersk Line',
    country: 'Denmark',
    agentContact: 'Anita Kusuma',
    phone: '+62 21 3006 5000',
    email: 'jakarta.ops@maersk.com',
    address: 'South Quarter Tower C, Jl. TB Simatupang, Jakarta Selatan',
    activeContracts: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'SHP-003',
    code: 'ONE',
    name: 'Ocean Network Express (ONE) Pte. Ltd.',
    country: 'Singapore / Japan',
    agentContact: 'Kenji Takahashi',
    phone: '+62 21 2927 7700',
    email: 'one.id.ops@one-line.com',
    address: 'Menara Astra Lt. 35, Jl. Jend. Sudirman, Jakarta',
    activeContracts: 3,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-07-20'
  },
  {
    id: 'SHP-004',
    code: 'CMA-CGM',
    name: 'CMA CGM Shipping Agency Indonesia',
    country: 'France',
    agentContact: 'Francois Martin',
    phone: '+62 21 2994 1800',
    email: 'id.customer@cma-cgm.com',
    address: 'Plaza Asia Lt. 19, Jl. Jend. Sudirman Kav. 59, Jakarta',
    activeContracts: 5,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-10'
  },
  {
    id: 'SHP-005',
    code: 'MERATUS',
    name: 'PT Meratus Line (Domestik & Regional)',
    country: 'Indonesia',
    agentContact: 'Gunawan Prasetyo',
    phone: '+62 31 329 2288',
    email: 'customer.service@meratusline.com',
    address: 'Jl. Alun-Alun Priok No. 27, Surabaya / Kantor Cabang KICT Kebumen',
    activeContracts: 8,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-09-01'
  }
];
