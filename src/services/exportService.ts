import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { GateTransaction, MasterDriver, MasterTruck, MasterContainer, MasterShippingLine } from '../types';

// ==========================================
// 1. EXCEL EXPORT HELPERS (SheetJS / XLSX)
// ==========================================

export function exportTransactionsToExcel(transactions: GateTransaction[], filename = 'KICT_Transaksi_Gate.xlsx') {
  const data = transactions.map((t, idx) => ({
    'No': idx + 1,
    'No Tiket': t.ticketNumber,
    'Waktu': t.timestamp,
    'Tipe Gerbang': t.gateType === 'GATE_IN' ? 'Gate In (Masuk)' : 'Gate Out (Keluar)',
    'Jalur': t.laneName,
    'No Polisi Truk': t.truckPlate,
    'Merek Truk': t.truckHeadModel,
    'Nama Pengemudi': t.driver.driverName,
    'NIK Pengemudi': t.driver.driverNik,
    'No SIM B2': t.driver.simNumber,
    'Perusahaan Transporter': t.driver.transporterCompany,
    'No Peti Kemas': t.container?.containerNumber || 'Chassis Kosong',
    'Ukuran': t.container?.size || '-',
    'Tipe Peti Kemas': t.container?.type || '-',
    'Shipping Line': t.container?.shippingLine || '-',
    'No Segel Bea Cukai': t.container?.sealNumber || '-',
    'Status Kepabeanan': t.container?.customsStatus || '-',
    'Slot Yard': t.container?.targetYardSlot || '-',
    'Berat Gross (kg)': t.weight.grossWeightKg,
    'Berat Tare (kg)': t.weight.tareWeightKg,
    'Berat Netto (kg)': t.weight.netWeightKg,
    'Status Overweight': t.weight.isOverweight ? 'YA (OVERWEIGHT)' : 'NORMAL',
    'No Sertifikat VGM': t.weight.vgmCertificateNumber || '-',
    'No Surat Jalan e-Pass': t.eirNumber || '-',
    'Akurasi OCR (%)': t.ocrConfidence,
    'Durasi Proses (detik)': t.processingTimeSeconds,
    'Status Transaksi': t.status,
    'Catatan Operator': t.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 14)
  }));
  worksheet['!cols'] = maxProps;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi Gate KICT');

  XLSX.writeFile(workbook, filename);
}

export function exportMasterDataToExcel(
  categoryName: string,
  records: any[],
  filename?: string
) {
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Master ${categoryName}`);
  XLSX.writeFile(workbook, filename || `KICT_Master_${categoryName}.xlsx`);
}

// ==========================================
// 2. PDF EXPORT HELPERS (jsPDF + autoTable)
// ==========================================

export function exportTransactionsToPdf(
  transactions: GateTransaction[],
  title = 'LAPORAN TRANSAKSI SMART GATE TERMINAL',
  period = 'Hari Ini (Real-Time)'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  // Header Styling (KICT Official Letterhead)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 65, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PT PELABUHAN KEBUMEN INTERNASIONAL (PERSERO)', 40, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('KEBUMEN INTERNATIONAL CONTAINER TERMINAL (KICT) • SMART GATE AUTOMATION SYSTEM', 40, 42);
  doc.text('Kawasan Pelabuhan Samudera Kebumen, Jawa Tengah • ISPS Code & ISO 27001 Certified', 40, 54);

  // Document Title & Metadata
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 40, 90);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const printTime = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });
  doc.text(`Periode Data: ${period}  |  Dicetak pada: ${printTime} WIB  |  Total Data: ${transactions.length} Truk`, 40, 105);

  // Table Data Mapping
  const tableData = transactions.map((t, idx) => [
    idx + 1,
    t.ticketNumber,
    t.timestamp.slice(11, 19) || t.timestamp,
    t.gateType === 'GATE_IN' ? 'GATE IN' : 'GATE OUT',
    t.laneId,
    t.truckPlate,
    t.driver.driverName,
    t.container?.containerNumber || '(Chassis Kosong)',
    t.container ? `${t.container.size} ${t.container.type}` : '-',
    t.weight.grossWeightKg ? `${t.weight.grossWeightKg.toLocaleString('id-ID')} kg` : '-',
    t.weight.netWeightKg ? `${t.weight.netWeightKg.toLocaleString('id-ID')} kg` : '-',
    t.weight.isOverweight ? 'OVERWEIGHT' : t.status === 'COMPLETED' ? 'SELESAI' : t.status === 'HELD_FOR_INSPECTION' ? 'DITAHAN' : 'PROSES'
  ]);

  autoTable(doc, {
    startY: 115,
    head: [[
      'No',
      'No Tiket',
      'Jam',
      'Arah',
      'Lajur',
      'No Polisi',
      'Pengemudi',
      'Peti Kemas',
      'Tipe / Ukuran',
      'Gross (kg)',
      'Netto (kg)',
      'Status'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { cellWidth: 70 },
      2: { halign: 'center', cellWidth: 42 },
      3: { halign: 'center', cellWidth: 45 },
      4: { halign: 'center', cellWidth: 38 },
      5: { cellWidth: 55, fontStyle: 'bold' },
      6: { cellWidth: 65 },
      7: { cellWidth: 68, fontStyle: 'bold' },
      8: { cellWidth: 55 },
      9: { halign: 'right', cellWidth: 50 },
      10: { halign: 'right', cellWidth: 50 },
      11: { halign: 'center', cellWidth: 55 }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 11) {
        const val = String(data.cell.raw);
        if (val === 'OVERWEIGHT' || val === 'DITAHAN') {
          data.cell.styles.textColor = [220, 38, 38]; // red
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'SELESAI') {
          data.cell.styles.textColor = [16, 185, 129]; // emerald
        }
      }
    }
  });

  // Footer & Signature Block
  const finalY = (doc as any).lastAutoTable?.finalY || 450;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (finalY + 80 < pageHeight) {
    const sigY = finalY + 25;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    // Left Signature: Gate Supervisor
    doc.text('Petugas Smart Gate KICT,', 60, sigY);
    doc.text('(________________________)', 60, sigY + 45);
    doc.text('Operator Gate & Timbangan', 60, sigY + 57);

    // Right Signature: Terminal Manager
    const rightX = doc.internal.pageSize.getWidth() - 200;
    doc.text('Mengetahui & Menyetujui,', rightX, sigY);
    doc.text('(________________________)', rightX, sigY + 45);
    doc.text('Supervisor TOS & Operasional KICT', rightX, sigY + 57);
  }

  doc.save(`KICT_Laporan_Gate_${Date.now()}.pdf`);
}

export function exportMasterDataToPdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename = 'KICT_Master_Data.pdf'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  // Header Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PT PELABUHAN KEBUMEN INTERNASIONAL (KICT)', 40, 24);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`MASTER DATA TERINTEGRASI NEON DATABASE • ${title.toUpperCase()}`, 40, 40);

  // Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 40, 78);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} WIB | Total: ${rows.length} Data`, 40, 92);

  autoTable(doc, {
    startY: 102,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240]
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  doc.save(filename);
}
