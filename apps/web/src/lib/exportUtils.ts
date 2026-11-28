import * as XLSX from 'xlsx';
import { exportCanvasPdf } from './canvasPdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, PageOrientation, ShadingType } from 'docx';

export class ExportUtils {
  static exportWorkbook(sheets: Array<{ name: string; rows: Record<string, any>[] }>, fileName: string) {
    const wb = XLSX.utils.book_new();
    for (const sheet of sheets) {
      const ws = XLSX.utils.json_to_sheet(sheet.rows);
      if (sheet.rows.length) {
        ws['!cols'] = Object.keys(sheet.rows[0]).map((key) => ({ wch: Math.min(36, Math.max(12, key.length + 3)) }));
      }
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    }
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportToExcel(data: any[], fileName: string, sheetName = 'Data') {
    const ws = XLSX.utils.json_to_sheet(data);
    if (data.length) {
      const keys = Object.keys(data[0]);
      ws['!cols'] = keys.map((key) => {
        const maxCell = data.reduce((max, row) => Math.max(max, String(row[key] ?? '').length), key.length);
        return { wch: Math.min(40, Math.max(12, maxCell + 3)) };
      });
    }
    const safeSheet = (sheetName || 'Data').replace(/[:\\/?*\[\]]/g, '').trim().slice(0, 31) || 'Data';
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, safeSheet);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static async exportToPdf(
    columns: string[], rows: unknown[][], title: string, fileName: string,
    options?: { orientation?: 'portrait' | 'landscape'; subtitle?: string },
  ) {
    await exportCanvasPdf(columns, rows, title, fileName, options);
  }

  static async exportAttendanceDossierPdf(options: {
    employee: { name: string; email?: string; department?: string; designation?: string; employeeCode?: string; joinedDate?: string };
    period: { monthName: string; year: number };
    kpis: { totalSessions: number; presentDays: number; lateDays: number; totalWorkHours: number; eligibleWorkdays: number; absentDays: number; punctuality: number };
    records: Array<{ date: string; sessionType: string; loginTime?: string; workMode?: string; addressText?: string; distanceMeters?: number | null; status: string }>;
    calendarDays: Array<{ date: string; dayName: string; morningTime?: string | null; afternoonTime?: string | null; hours: number; dayStatus: string; locationName?: string }>;
    officeName?: string;
  }) {
    const { employee, period, kpis } = options;
    const rows: unknown[][] = options.calendarDays.map((day) => {
      const sessions = options.records.filter((record) => record.date === day.date);
      const detail = sessions.map((record) => [record.sessionType, record.workMode, record.addressText,
        record.distanceMeters == null ? '' : `${record.distanceMeters} m`].filter(Boolean).join(' · ')).join(' / ');
      return [day.date, day.dayName, day.morningTime || '—', day.afternoonTime || '—',
        day.hours ? `${day.hours} h` : '—', day.dayStatus, day.locationName || detail || '—'];
    });
    const subtitle = [employee.designation, employee.department, employee.email,
      `${kpis.presentDays} present`, `${kpis.absentDays} absent`, `${kpis.lateDays} late`,
      `${kpis.totalSessions} sessions`, `${kpis.totalWorkHours} hours`, `${kpis.punctuality}% punctuality`]
      .filter(Boolean).join('  ·  ');
    const cleanName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
    await exportCanvasPdf(['Date', 'Day', 'Morning', 'Afternoon', 'Hours', 'Status', 'Location / session details'], rows,
      `${employee.name} — Attendance Register — ${period.monthName} ${period.year}`,
      `Attendance_Report_${cleanName}_${period.monthName}_${period.year}`,
      { orientation: 'landscape', subtitle });
  }

  static async exportToDocx(
    title: string,
    dataRows: string[][],
    fileName: string,
    options?: { subtitle?: string },
  ) {
    const headers = dataRows[0] || [];
    const colCount = headers.length || 1;
    const isWide = colCount > 6;
    const weights = headers.map((label) =>
      /location|note|detail|reason|address|project|employee|submitted|client|task|entity/i.test(label)
        ? 1.7
        : /date|status|amount|salary|payable|revenue|value|budget|benefit|spent|receivable|received/i.test(label)
          ? 1.2
          : 1,
    );
    const weightSum = weights.reduce((a, b) => a + b, 0) || colCount;
    const colWidths = weights.map((w) => Number(((w / weightSum) * 100).toFixed(2)));

    const tableRows = dataRows.map(
      (row, rowIndex) =>
        new TableRow({
          tableHeader: rowIndex === 0,
          children: row.map(
            (cell, colIdx) =>
              new TableCell({
                width: { size: colWidths[colIdx] ?? 100 / colCount, type: WidthType.PERCENTAGE },
                shading:
                  rowIndex === 0
                    ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8F1ED' }
                    : rowIndex % 2 === 1
                      ? { type: ShadingType.CLEAR, color: 'auto', fill: 'F8FAFC' }
                      : undefined,
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cell ?? ''),
                        font: 'Noto Sans',
                        bold: rowIndex === 0 || row[0] === 'Total',
                        size: rowIndex === 0 ? 17 : 15,
                        color: rowIndex === 0 ? '10241E' : '1E293B',
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: isWide ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              },
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  font: 'Noto Sans',
                  bold: true,
                  size: 28,
                  color: '10241E',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${options?.subtitle ? `${options.subtitle}  •  ` : ''}Generated on ${new Date().toLocaleString('en-GB')}  •  Geospatial Works ERP`,
                  font: 'Noto Sans',
                  italics: true,
                  size: 18,
                  color: '475569',
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
