import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

export class ExportUtils {
  static exportToExcel(data: any[], fileName: string, sheetName = 'Data') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportToPdf(columns: string[], rows: any[][], title: string, fileName: string) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [13, 17, 23], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`${fileName}.pdf`);
  }

  static exportAttendanceDossierPdf(options: {
    employee: {
      name: string;
      email?: string;
      department?: string;
      designation?: string;
      employeeCode?: string;
      joinedDate?: string;
    };
    period: {
      monthName: string;
      year: number;
    };
    kpis: {
      totalSessions: number;
      presentDays: number;
      lateDays: number;
      totalWorkHours: number;
      eligibleWorkdays: number;
      absentDays: number;
      punctuality: number;
    };
    records: Array<{
      date: string;
      sessionType: string;
      loginTime?: string;
      workMode?: string;
      addressText?: string;
      distanceMeters?: number | null;
      status: string;
    }>;
    calendarDays: Array<{
      date: string;
      dayName: string;
      morningTime?: string | null;
      afternoonTime?: string | null;
      hours: number;
      dayStatus: string;
      locationName?: string;
    }>;
    officeName?: string;
  }) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Header Banner
    doc.setFillColor(16, 36, 30); // Dark theme #10241E
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GEOSPATIAL WORKS ERP', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(200, 215, 210);
    doc.text('MONTHLY ATTENDANCE & GEOFENCE AUDIT DOSSIER', 14, 18);

    doc.setFontSize(8);
    doc.text(
      `Period: ${options.period.monthName} ${options.period.year}`,
      pageWidth - 14,
      11,
      { align: 'right' }
    );
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      pageWidth - 14,
      18,
      { align: 'right' }
    );

    // Employee Profile Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 28, pageWidth - 28, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(options.employee.name, 19, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const subtitle = [
      options.employee.designation,
      options.employee.department,
      options.employee.email,
    ].filter(Boolean).join(' • ');
    doc.text(subtitle, 19, 42);

    const joinText = options.employee.joinedDate ? `Joined: ${options.employee.joinedDate}` : 'Staff Member';
    doc.text(joinText, 19, 48);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 36, 30);
    doc.text(
      `Office HQ: ${options.officeName || 'Mohammadpur HQ (550m)'}`,
      pageWidth - 19,
      36,
      { align: 'right' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Audit Month: ${options.period.monthName} ${options.period.year}`,
      pageWidth - 19,
      43,
      { align: 'right' }
    );

    // KPI Summary Table
    autoTable(doc, {
      startY: 56,
      head: [
        [
          'Recorded Sessions',
          'Days Present',
          'Late Arrivals',
          'Hours Logged',
          'Eligible Workdays',
          'Absent Days',
          'Punctuality',
        ],
      ],
      body: [
        [
          options.kpis.totalSessions,
          options.kpis.presentDays,
          options.kpis.lateDays,
          `${options.kpis.totalWorkHours}h`,
          options.kpis.eligibleWorkdays,
          options.kpis.absentDays,
          `${options.kpis.punctuality}%`,
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        textColor: [15, 23, 42],
        cellPadding: 3,
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // Section 1: Geotagged Check-In Records
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`1. Geotagged Check-In Records (${options.records.length} logged)`, 14, currentY);

    if (options.records.length > 0) {
      const recordRows = options.records.map((r) => [
        r.date,
        (r.sessionType || 'morning').toUpperCase(),
        r.loginTime
          ? new Date(r.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—',
        (r.workMode || 'office').toUpperCase(),
        r.addressText || 'HQ Geofence',
        r.distanceMeters !== null && r.distanceMeters !== undefined
          ? r.distanceMeters <= 550
            ? 'Inside (0m)'
            : `${r.distanceMeters}m from HQ`
          : 'At HQ',
        (r.status || 'present').toUpperCase(),
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: [['Date', 'Session', 'Time', 'Mode', 'Location / Landmark', 'Geofence Status', 'Status']],
        body: recordRows,
        theme: 'striped',
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: 255,
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          4: { cellWidth: 55 },
        },
        margin: { left: 14, right: 14 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No attendance sessions were logged in the database for this month.', 14, currentY + 5);
      currentY += 12;
    }

    // Check if new page is needed for Section 2
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    // Section 2: Day-by-Day Monthly Calendar Audit Log
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. Day-by-Day Monthly Calendar Audit Log (${options.calendarDays.length} days)`, 14, currentY);

    const calendarRows = options.calendarDays.map((d) => [
      d.date,
      d.dayName,
      d.morningTime || '—',
      d.afternoonTime || '—',
      d.hours > 0 ? `${d.hours}h` : '—',
      d.dayStatus,
      d.locationName || '—',
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Date', 'Day', 'Morning Shift', 'Afternoon Shift', 'Hours', 'Status', 'Location / Remarks']],
      body: calendarRows,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 36, 30],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        6: { cellWidth: 50 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = String(data.cell.raw);
          if (val === 'Present') {
            data.cell.styles.textColor = [16, 120, 70];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Late') {
            data.cell.styles.textColor = [180, 110, 10];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Absent') {
            data.cell.styles.textColor = [200, 30, 30];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Weekend' || val === 'Not joined') {
            data.cell.styles.textColor = [148, 163, 184];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Add page numbers on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Geospatial Works ERP • Confidential • Official Attendance Record`,
        14,
        pageHeight - 8
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: 'right' }
      );
    }

    const cleanName = options.employee.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Attendance_Report_${cleanName}_${options.period.monthName}_${options.period.year}.pdf`);
  }

  static async exportToDocx(title: string, dataRows: string[][], fileName: string) {
    const tableRows = dataRows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
                children: [new Paragraph(cell)],
              })
          ),
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date().toLocaleDateString()}`,
                  italics: true,
                  size: 20,
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
