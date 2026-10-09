export type GateLaneId = 'LANE-01' | 'LANE-02' | 'LANE-03' | 'LANE-04' | 'LANE-05';
export type GateType = 'GATE_IN' | 'GATE_OUT';
export type GateStatus = 'COMPLETED' | 'IN_PROGRESS' | 'WAITING' | 'REJECTED' | 'HELD_FOR_INSPECTION';
export type IssueSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type UserRole = 'OPERATOR_GATE' | 'ADMIN_MASTER' | 'SUPERVISOR_TOS' | 'SURVEYOR_CUSTOMS';

export interface User {
  id: string;
  username: string;
  fullName: string;
  name?: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  terminalAssigned: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type AppView = 'LOGIN_PROFILE' | 'GATE_OPERATIONS' | 'MASTER_DATA' | 'TRANSACTIONS' | 'REPORTS' | 'DATABASE_NEON';

export type MasterDataTab = 'DRIVERS' | 'TRUCKS' | 'CONTAINERS' | 'SHIPPING_LINES';

export interface MasterDriver {
  id: string;
  nik: string;
  name: string;
  simNumber: string;
  simExpiry: string;
  phone: string;
  transporter: string;
  rfidCardId: string;
  safetyInductionValid: boolean;
  status: 'ACTIVE' | 'EXPIRED_SIM' | 'BLACKLISTED';
  createdAt: string;
  updatedAt: string;
}

export interface MasterTruck {
  id: string;
  plateNumber: string;
  brandModel: string;
  chassisType: '20ft Skeletal' | '40ft Skeletal' | 'Multi-Axle Heavy';
  tareWeightKg: number;
  maxGrossWeightKg: number;
  kirExpiry: string;
  transporter: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'EXPIRED_KIR';
  createdAt: string;
  updatedAt: string;
}

export interface MasterContainer {
  id: string;
  containerNumber: string;
  isoCode: string;
  size: '20ft' | '40ft' | '45ft';
  type: 'Dry' | 'Reefer' | 'Hazmat (DG)' | 'Open Top' | 'Flat Rack';
  shippingLine: string;
  tareWeightKg: number;
  maxPayloadKg: number;
  cargoStatus: 'FULL' | 'EMPTY';
  customsStatus: 'SPPB_CLEARED' | 'NPE_EXPORT' | 'HOLD_CUSTOMS' | 'INSPECTION_REQUIRED';
  currentYardSlot: string;
  isValidIso: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterShippingLine {
  id: string;
  code: string;
  name: string;
  country: string;
  agentContact: string;
  phone: string;
  email: string;
  address: string;
  activeContracts: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface NeonDbConfig {
  connectionString: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR' | 'OFFLINE_LOCAL';
  errorMessage?: string;
  tablesInitialized: boolean;
  activeDatabaseName?: string;
  activeHost?: string;
  lastSyncAt?: string;
}

export interface DriverValidation {
  rfidCardId: string;
  driverName: string;
  driverNik: string;
  simNumber: string;
  simExpiry: string;
  isSimValid: boolean;
  transporterCompany: string;
  safetyBriefingValid: boolean;
  status: 'VALID' | 'EXPIRED_SIM' | 'UNREGISTERED' | 'BLACKLISTED';
  rejectionReason?: string;
}

export interface ContainerValidation {
  containerNumber: string;
  isoCode: string; // e.g. 22G1, 45G1, 45R1
  size: '20ft' | '40ft' | '45ft';
  type: 'Dry' | 'Reefer' | 'Hazmat (DG)' | 'Open Top' | 'Flat Rack';
  sealNumber: string;
  carrierSealNumber: string;
  isSealIntact: boolean;
  customsStatus: 'SPPB_CLEARED' | 'NPE_EXPORT' | 'HOLD_CUSTOMS' | 'INSPECTION_REQUIRED';
  deliveryOrderStatus: 'PAID_VALID' | 'EXPIRED' | 'UNPAID';
  shippingLine: string;
  commodity: string;
  isValidIsoFormat: boolean;
  hazmatClass?: string;
  targetYardSlot?: string; // e.g. A-04-02-03
}

export interface WeightMeasurement {
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  maxGrossWeightKg: number; // usually 30,480 kg or 32,500 kg
  isOverweight: boolean;
  vgmCertificateNumber?: string;
  weighbridgeId: string;
  timestamp: string;
}

export interface GateIssue {
  id: string;
  code: 'OVERWEIGHT_VGM' | 'SEAL_MISMATCH' | 'CUSTOMS_HOLD' | 'EXPIRED_SIM' | 'DO_UNPAID' | 'OCR_UNREADABLE';
  title: string;
  description: string;
  severity: IssueSeverity;
  detectedAt: string;
  actionRequired: string;
  resolved: boolean;
}

export interface GateTransaction {
  id: string;
  ticketNumber: string; // e.g. KICT-GT-20260910-0012
  timestamp: string;
  gateType: GateType;
  laneId: GateLaneId;
  laneName: string;
  truckPlate: string;
  truckHeadModel: string;
  driver: DriverValidation;
  container?: ContainerValidation;
  weight: WeightMeasurement;
  status: GateStatus;
  eirNumber?: string;
  ocrConfidence: number; // e.g. 98.5%
  processingTimeSeconds: number;
  issues: GateIssue[];
  notes?: string;
}

export interface GateLane {
  id: GateLaneId;
  name: string;
  type: GateType;
  status: 'OPEN' | 'BUSY' | 'MAINTENANCE' | 'ALERT';
  currentTransactionId?: string;
  queueCount: number;
  maxQueueCapacity: number;
  avgProcessTimeMinutes: number;
  activeOperator: string;
}

export interface QueueTruck {
  id: string;
  queueNumber: number;
  truckPlate: string;
  transporter: string;
  driverName: string;
  containerNumber?: string;
  gateType: GateType;
  laneId: GateLaneId;
  arrivalTime: string;
  waitingMinutes: number;
  hasPriority: boolean;
  flaggedWarning?: string;
}

export interface GateSummaryStats {
  todayTotalIn: number;
  todayTotalOut: number;
  avgTurnaroundMinutes: number;
  currentActiveTrucks: number;
  activeIssuesCount: number;
  yardCapacityTeu: number;
  yardOccupiedTeu: number;
  ocrAccuracyRate: number;
}
