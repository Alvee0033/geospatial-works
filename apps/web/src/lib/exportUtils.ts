import * as XLSX from 'xlsx';
import { exportCanvasPdf } from './canvasPdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, PageOrientation } from 'docx';

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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
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

  static async exportToDocx(title: string, dataRows: string[][], fileName: string) {
    const colCount = dataRows[0]?.length || 1;
    const isWide = colCount > 6;
    const tableRows = dataRows.map(
      (row, rowIndex) =>
        new TableRow({
          tableHeader: rowIndex === 0,
          children: row.map(
            (cell) =>
              new TableCell({
                width: { size: 100 / colCount, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cell ?? ''),
                        bold: rowIndex === 0,
                        size: rowIndex === 0 ? 16 : 14,
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
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date().toLocaleString()} • Geospatial Works ERP`,
                  italics: true,
                  size: 18,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Table({
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
