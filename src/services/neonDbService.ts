import { neon } from '@neondatabase/serverless';
import { NeonDbConfig, MasterDriver, MasterTruck, MasterContainer, MasterShippingLine, GateTransaction } from '../types';

const STORAGE_KEY_NEON_CONFIG = 'kict_neon_db_config';

// Default sample connection string template for user guidance
export const DEFAULT_NEON_CONNECTION_STRING = 
  'postgresql://neondb_owner:npg_sample_pass@ep-shiny-wave-a1b2c3d4.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getStoredNeonConfig(): NeonDbConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NEON_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to parse stored Neon config:', err);
  }

  return {
    connectionString: '',
    isConnected: false,
    status: 'OFFLINE_LOCAL',
    tablesInitialized: false,
    errorMessage: undefined,
  };
}

export function saveStoredNeonConfig(config: NeonDbConfig): void {
  localStorage.setItem(STORAGE_KEY_NEON_CONFIG, JSON.stringify(config));
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  dbName?: string;
  serverVersion?: string;
  serverTime?: string;
}

// Test live connection to Neon PostgreSQL
export async function testNeonConnection(connectionString: string): Promise<ConnectionTestResult> {
  if (!connectionString || !connectionString.trim()) {
    return {
      success: false,
      message: 'Connection string Neon DB belum diisi. Silakan masukkan URI koneksi PostgreSQL.',
    };
  }

  const startTime = performance.now();
  try {
    const sql = neon(connectionString.trim());
    // Execute ping query
    const rows = await sql`
      SELECT 
        1 as test_ping,
        current_database() as db_name,
        NOW() as server_time,
        version() as server_version
    `;

    const latency = Math.round(performance.now() - startTime);
    if (rows && rows.length > 0) {
      const data = rows[0] as any;
      return {
        success: true,
        message: `Berhasil terhubung ke Neon PostgreSQL (${data.db_name || 'neondb'})! Respon dalam ${latency}ms.`,
        latencyMs: latency,
        dbName: data.db_name,
        serverVersion: data.server_version,
        serverTime: data.server_time ? String(data.server_time) : undefined,
      };
    }

    return {
      success: true,
      message: `Terhubung ke database dalam ${latency}ms.`,
      latencyMs: latency,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    console.error('Neon DB Connection test failed:', err);
    return {
      success: false,
      message: `Gagal terhubung ke Neon DB: ${err.message || 'Network timeout atau kredensial salah.'}`,
      latencyMs: latency,
    };
  }
}

// Initialize tables in Neon DB
export async function initNeonDbTables(connectionString: string): Promise<{ success: boolean; message: string }> {
  if (!connectionString || !connectionString.trim()) {
    return { success: false, message: 'Connection string kosong.' };
  }

  try {
    const sql = neon(connectionString.trim());

    // 1. Master Drivers table
    await sql`
      CREATE TABLE IF NOT EXISTS kict_master_drivers (
        id VARCHAR(50) PRIMARY KEY,
        nik VARCHAR(20) NOT NULL,
        name VARCHAR(150) NOT NULL,
        sim_number VARCHAR(50) NOT NULL,
        sim_expiry VARCHAR(20) NOT NULL,
        phone VARCHAR(30),
        transporter VARCHAR(150) NOT NULL,
        rfid_card_id VARCHAR(50),
        safety_induction_valid BOOLEAN DEFAULT true,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Master Trucks table
    await sql`
      CREATE TABLE IF NOT EXISTS kict_master_trucks (
        id VARCHAR(50) PRIMARY KEY,
        plate_number VARCHAR(30) NOT NULL UNIQUE,
        brand_model VARCHAR(100),
        chassis_type VARCHAR(50),
        tare_weight_kg INTEGER DEFAULT 12000,
        max_gross_weight_kg INTEGER DEFAULT 32000,
        kir_expiry VARCHAR(20),
        transporter VARCHAR(150),
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Master Containers table
    await sql`
      CREATE TABLE IF NOT EXISTS kict_master_containers (
        id VARCHAR(50) PRIMARY KEY,
        container_number VARCHAR(30) NOT NULL UNIQUE,
        iso_code VARCHAR(10),
        size VARCHAR(10) DEFAULT '40ft',
        type VARCHAR(30) DEFAULT 'Dry',
        shipping_line VARCHAR(150),
        tare_weight_kg INTEGER DEFAULT 3800,
        max_payload_kg INTEGER DEFAULT 28000,
        cargo_status VARCHAR(20) DEFAULT 'FULL',
        customs_status VARCHAR(40) DEFAULT 'SPPB_CLEARED',
        current_yard_slot VARCHAR(50),
        is_valid_iso BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. Master Shipping Lines table
    await sql`
      CREATE TABLE IF NOT EXISTS kict_master_shipping_lines (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        country VARCHAR(100),
        agent_contact VARCHAR(150),
        phone VARCHAR(50),
        email VARCHAR(100),
        address TEXT,
        active_contracts INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 5. Gate Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS kict_gate_transactions (
        id VARCHAR(50) PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        gate_type VARCHAR(20) NOT NULL,
        lane_id VARCHAR(20) NOT NULL,
        lane_name VARCHAR(100),
        truck_plate VARCHAR(30) NOT NULL,
        truck_head_model VARCHAR(100),
        driver_name VARCHAR(150),
        driver_nik VARCHAR(30),
        driver_sim VARCHAR(50),
        transporter VARCHAR(150),
        container_number VARCHAR(50),
        container_size VARCHAR(10),
        container_type VARCHAR(30),
        shipping_line VARCHAR(150),
        seal_number VARCHAR(50),
        customs_status VARCHAR(40),
        gross_weight_kg INTEGER,
        tare_weight_kg INTEGER,
        net_weight_kg INTEGER,
        is_overweight BOOLEAN DEFAULT false,
        vgm_certificate VARCHAR(50),
        status VARCHAR(30) DEFAULT 'IN_PROGRESS',
        eir_number VARCHAR(50),
        ocr_confidence NUMERIC(5,2),
        processing_time_seconds INTEGER,
        notes TEXT
      );
    `;

    return {
      success: true,
      message: 'Skema tabel KICT (Master Drivers, Trucks, Containers, Shipping Lines, Gate Transactions) berhasil diinisialisasi di Neon DB!',
    };
  } catch (err: any) {
    console.error('Failed to init Neon DB schema:', err);
    return {
      success: false,
      message: `Gagal inisialisasi skema di Neon DB: ${err.message}`,
    };
  }
}

// Sync local master & transactions data to Neon DB
export async function syncDataToNeon(
  connectionString: string,
  data: {
    drivers: MasterDriver[];
    trucks: MasterTruck[];
    containers: MasterContainer[];
    shippingLines: MasterShippingLine[];
    transactions: GateTransaction[];
  }
): Promise<{ success: boolean; message: string; countSynced: number }> {
  if (!connectionString) {
    return { success: false, message: 'Tidak ada koneksi Neon.', countSynced: 0 };
  }

  try {
    const sql = neon(connectionString.trim());
    let count = 0;

    // Insert or update drivers
    for (const d of data.drivers) {
      await sql`
        INSERT INTO kict_master_drivers (
          id, nik, name, sim_number, sim_expiry, phone, transporter, rfid_card_id, safety_induction_valid, status
        ) VALUES (
          ${d.id}, ${d.nik}, ${d.name}, ${d.simNumber}, ${d.simExpiry}, ${d.phone}, ${d.transporter}, ${d.rfidCardId}, ${d.safetyInductionValid}, ${d.status}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sim_expiry = EXCLUDED.sim_expiry,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;
      count++;
    }

    // Insert or update trucks
    for (const t of data.trucks) {
      await sql`
        INSERT INTO kict_master_trucks (
          id, plate_number, brand_model, chassis_type, tare_weight_kg, max_gross_weight_kg, kir_expiry, transporter, status
        ) VALUES (
          ${t.id}, ${t.plateNumber}, ${t.brandModel}, ${t.chassisType}, ${t.tareWeightKg}, ${t.maxGrossWeightKg}, ${t.kirExpiry}, ${t.transporter}, ${t.status}
        )
        ON CONFLICT (plate_number) DO UPDATE SET
          brand_model = EXCLUDED.brand_model,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;
      count++;
    }

    // Insert or update containers
    for (const c of data.containers) {
      await sql`
        INSERT INTO kict_master_containers (
          id, container_number, iso_code, size, type, shipping_line, tare_weight_kg, max_payload_kg, cargo_status, customs_status, current_yard_slot, is_valid_iso
        ) VALUES (
          ${c.id}, ${c.containerNumber}, ${c.isoCode}, ${c.size}, ${c.type}, ${c.shippingLine}, ${c.tareWeightKg}, ${c.maxPayloadKg}, ${c.cargoStatus}, ${c.customsStatus}, ${c.currentYardSlot}, ${c.isValidIso}
        )
        ON CONFLICT (container_number) DO UPDATE SET
          cargo_status = EXCLUDED.cargo_status,
          customs_status = EXCLUDED.customs_status,
          current_yard_slot = EXCLUDED.current_yard_slot,
          updated_at = NOW();
      `;
      count++;
    }

    // Insert or update shipping lines
    for (const s of data.shippingLines) {
      await sql`
        INSERT INTO kict_master_shipping_lines (
          id, code, name, country, agent_contact, phone, email, address, active_contracts, status
        ) VALUES (
          ${s.id}, ${s.code}, ${s.name}, ${s.country}, ${s.agentContact}, ${s.phone}, ${s.email}, ${s.address}, ${s.activeContracts}, ${s.status}
        )
        ON CONFLICT (code) DO UPDATE SET
          agent_contact = EXCLUDED.agent_contact,
          phone = EXCLUDED.phone,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;
      count++;
    }

    return {
      success: true,
      message: `Sinkronisasi berhasil! ${count} data master tersimpan di Neon PostgreSQL.`,
      countSynced: count,
    };
  } catch (err: any) {
    console.error('Error syncing data to Neon:', err);
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err.message}`,
      countSynced: 0,
    };
  }
}

// Fetch all live records from Neon DB
export async function fetchDataFromNeon(connectionString: string): Promise<{
  success: boolean;
  drivers?: MasterDriver[];
  trucks?: MasterTruck[];
  containers?: MasterContainer[];
  shippingLines?: MasterShippingLine[];
  message?: string;
}> {
  if (!connectionString || !connectionString.trim()) {
    return { success: false, message: 'Tidak ada connection string Neon.' };
  }

  try {
    const sql = neon(connectionString.trim());
    const [rawDrivers, rawTrucks, rawContainers, rawShipping] = await Promise.all([
      sql`SELECT * FROM kict_master_drivers ORDER BY name ASC;`,
      sql`SELECT * FROM kict_master_trucks ORDER BY plate_number ASC;`,
      sql`SELECT * FROM kict_master_containers ORDER BY container_number ASC;`,
      sql`SELECT * FROM kict_master_shipping_lines ORDER BY code ASC;`,
    ]);

    const drivers: MasterDriver[] = rawDrivers.map((r: any) => ({
      id: r.id,
      nik: r.nik,
      name: r.name,
      simNumber: r.sim_number,
      simExpiry: r.sim_expiry,
      phone: r.phone || '',
      transporter: r.transporter,
      rfidCardId: r.rfid_card_id || '',
      safetyInductionValid: Boolean(r.safety_induction_valid),
      status: r.status || 'ACTIVE',
      createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
      updatedAt: r.updated_at ? String(r.updated_at) : new Date().toISOString()
    }));

    const trucks: MasterTruck[] = rawTrucks.map((r: any) => ({
      id: r.id,
      plateNumber: r.plate_number,
      brandModel: r.brand_model,
      chassisType: (r.chassis_type || '40ft Skeletal') as any,
      tareWeightKg: Number(r.tare_weight_kg) || 12000,
      maxGrossWeightKg: Number(r.max_gross_weight_kg) || 32000,
      kirExpiry: r.kir_expiry || '2027-01-01',
      transporter: r.transporter || '',
      status: r.status || 'ACTIVE',
      createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
      updatedAt: r.updated_at ? String(r.updated_at) : new Date().toISOString()
    }));

    const containers: MasterContainer[] = rawContainers.map((r: any) => ({
      id: r.id,
      containerNumber: r.container_number,
      isoCode: r.iso_code || '45G1',
      size: (r.size || '40ft') as any,
      type: (r.type || 'Dry') as any,
      shippingLine: r.shipping_line || '',
      tareWeightKg: Number(r.tare_weight_kg) || 3800,
      maxPayloadKg: Number(r.max_payload_kg) || 28000,
      cargoStatus: (r.cargo_status || 'FULL') as any,
      customsStatus: (r.customs_status || 'SPPB_CLEARED') as any,
      currentYardSlot: r.current_yard_slot || 'A-01-01-01',
      isValidIso: Boolean(r.is_valid_iso),
      createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
      updatedAt: r.updated_at ? String(r.updated_at) : new Date().toISOString()
    }));

    const shippingLines: MasterShippingLine[] = rawShipping.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      country: r.country || 'Indonesia',
      agentContact: r.agent_contact || '',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      activeContracts: Number(r.active_contracts) || 1,
      status: r.status || 'ACTIVE',
      createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
      updatedAt: r.updated_at ? String(r.updated_at) : new Date().toISOString()
    }));

    return {
      success: true,
      drivers,
      trucks,
      containers,
      shippingLines
    };
  } catch (err: any) {
    console.error('Failed to fetch data from Neon DB:', err);
    return {
      success: false,
      message: `Gagal membaca data dari Neon: ${err.message}`
    };
  }
}
