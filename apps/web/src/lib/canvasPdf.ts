import jsPDF from 'jspdf';

type PdfOptions = { orientation?: 'portrait' | 'landscape'; subtitle?: string };

let fontsReady: Promise<void> | undefined;
async function loadReportFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all([
      new FontFace('GW Bengali', 'url(/fonts/NotoSansBengali-Regular.ttf)', { weight: '400' }).load(),
      new FontFace('GW Bengali', 'url(/fonts/NotoSansBengali-Bold.ttf)', { weight: '700' }).load(),
    ])
      .then((faces) => {
        faces.forEach((face) => document.fonts.add(face));
      })
      .catch(() => {
        fontsReady = undefined;
      });
  }
  await fontsReady;
  await document.fonts.ready;
}

function wrap(ctx: CanvasRenderingContext2D, value: unknown, width: number): string[] {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim() || '—';
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (ctx.measureText(`${line} ${word}`.trim()).width <= width) {
      line = `${line} ${word}`.trim();
      continue;
    }
    if (line) lines.push(line);
    line = word;
    // Long addresses and identifiers must never paint over the next cell.
    while (ctx.measureText(line).width > width && line.length > 1) {
      let cut = 1;
      while (cut < line.length && ctx.measureText(line.slice(0, cut + 1)).width <= width) cut++;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function exportCanvasPdf(columns: string[], rows: unknown[][], title: string, fileName: string, options: PdfOptions = {}) {
  if (!columns.length) throw new Error('A report needs at least one column.');
  await loadReportFonts();
  const landscape = options.orientation === 'landscape' || (options.orientation !== 'portrait' && columns.length > 6);
  const canvas = document.createElement('canvas');
  canvas.width = landscape ? 1754 : 1240;
  canvas.height = landscape ? 1240 : 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('PDF canvas is unavailable.');
  const pdf = new jsPDF(landscape ? 'landscape' : 'portrait', 'mm', 'a4');
  const width = canvas.width;
  const height = canvas.height;
  const margin = 44;
  const contentWidth = width - margin * 2;
  const fontSize = columns.length >= 11 ? 14 : columns.length >= 8 ? 16 : 18;
  const lineHeight = fontSize * 1.45;
  const weights = columns.map((label) => /location|note|detail|reason|address|project|employee|submitted|client|task/i.test(label) ? 1.7 : /date|status|amount|salary|payable|revenue|value|budget|benefit/i.test(label) ? 1.25 : 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((weight) => contentWidth * weight / sum);
  const xPositions = widths.map((_, i) => margin + widths.slice(0, i).reduce((a, b) => a + b, 0));
  const prepared = rows.map((row) => {
    ctx.font = `400 ${fontSize}px "GW Bengali", sans-serif`;
    const lines = columns.map((_, index) => wrap(ctx, row[index], widths[index] - 18));
    return { lines, height: Math.max(38, Math.max(...lines.map((item) => item.length)) * lineHeight + 13) };
  });
  const headerWrapped = columns.map((label, i) => {
    ctx.font = `700 ${fontSize}px "GW Bengali", sans-serif`;
    return wrap(ctx, label, widths[i] - 16);
  });
  const headHeight = Math.max(48, Math.max(...headerWrapped.map((h) => h.length)) * lineHeight + 18);
  const isNumericCol = columns.map((label) => /value|budget|received|receivable|benefit|spent|amount|cost|vat|tax|salary|allowance|deduction|payable|margin|ratio|revenue|days/i.test(label));

  let page = 0;
  let index = 0;
  do {
    page++;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#10241e';
    ctx.fillRect(0, 0, width, 106);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "GW Bengali", sans-serif';
    ctx.fillText('GEOSPATIAL WORKS ERP', margin, 38);
    ctx.font = '400 19px "GW Bengali", sans-serif';
    const titleLines = wrap(ctx, title, contentWidth).slice(0, 2);
    titleLines.forEach((tl, ti) => ctx.fillText(tl, margin, 72 + ti * 22));
    ctx.fillStyle = '#475569';
    ctx.font = '400 15px "GW Bengali", sans-serif';
    const subLines = wrap(ctx, options.subtitle || `${rows.length} records  •  Generated ${new Date().toLocaleString('en-GB')}`, contentWidth);
    ctx.fillText(subLines[0] || '', margin, 136);

    let y = 152;
    ctx.fillStyle = '#e8f1ed';
    ctx.fillRect(margin, y, contentWidth, headHeight);
    ctx.font = `700 ${fontSize}px "GW Bengali", sans-serif`;
    ctx.fillStyle = '#10241e';
    headerWrapped.forEach((lines, i) => {
      if (isNumericCol[i]) {
        ctx.textAlign = 'right';
        lines.forEach((line, j) => ctx.fillText(line, xPositions[i] + widths[i] - 8, y + 22 + j * lineHeight));
        ctx.textAlign = 'left';
      } else {
        lines.forEach((line, j) => ctx.fillText(line, xPositions[i] + 8, y + 22 + j * lineHeight));
      }
    });
    y += headHeight;
    while (index < prepared.length && y + prepared[index].height < height - 68) {
      const row = prepared[index];
      const isTotalRow = row.lines[0]?.[0] === 'Total';
      if (isTotalRow) {
        ctx.fillStyle = '#e8f1ed';
        ctx.fillRect(margin, y, contentWidth, row.height);
      } else if (index % 2) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(margin, y, contentWidth, row.height);
      }
      ctx.strokeStyle = '#dce3e7';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(margin, y + row.height); ctx.lineTo(width - margin, y + row.height); ctx.stroke();
      ctx.font = `${isTotalRow ? '700' : '400'} ${fontSize}px "GW Bengali", sans-serif`;
      ctx.fillStyle = '#1e293b';
      row.lines.forEach((lines, i) => {
        if (isNumericCol[i]) {
          ctx.textAlign = 'right';
          lines.forEach((line, j) => ctx.fillText(line, xPositions[i] + widths[i] - 8, y + 19 + j * lineHeight));
          ctx.textAlign = 'left';
        } else {
          lines.forEach((line, j) => ctx.fillText(line, xPositions[i] + 8, y + 19 + j * lineHeight));
        }
      });
      y += row.height;
      index++;
    }
    if (index < prepared.length && y === 153 + headHeight) throw new Error('A report row is too long to fit on a PDF page.');
    ctx.fillStyle = '#64748b';
    ctx.font = '400 14px "GW Bengali", sans-serif';
    ctx.fillText('Geospatial Works ERP  •  Official records', margin, height - 31);
    ctx.textAlign = 'right';
    ctx.fillText(`Page ${page}`, width - margin, height - 31);
    ctx.textAlign = 'left';
    if (page > 1) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, landscape ? 297 : 210, landscape ? 210 : 297);
  } while (index < prepared.length);
  pdf.save(`${fileName}.pdf`);
}
