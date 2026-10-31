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
