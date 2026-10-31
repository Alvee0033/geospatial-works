import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = '/home/alvee/Desktop/gw project app';
const web = await fs.readFile(`${root}/showcase/dashboard-web-sidebar-compact.jpg`);
const mobile = await fs.readFile(`${root}/repo/reports/2026-10-06_02-37-44/assets/flow-000/cmd-001-after.png`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2880" height="2160" viewBox="0 0 1440 1080">
<defs>
 <radialGradient id="bg" cx="50%" cy="22%" r="85%"><stop stop-color="#3841b4"/><stop offset=".45" stop-color="#8491ed"/><stop offset="1" stop-color="#e7e8ff"/></radialGradient>
 <linearGradient id="metal" x2="1" y2="1"><stop stop-color="#e9eafa"/><stop offset=".3" stop-color="#777d9a"/><stop offset=".55" stop-color="#d3d7ed"/><stop offset=".8" stop-color="#555c76"/><stop offset="1" stop-color="#c1c6df"/></linearGradient>
 <linearGradient id="stand" x2=".9" y2="1"><stop stop-color="#343951"/><stop offset=".55" stop-color="#a6abc7"/><stop offset="1" stop-color="#e0e3f2"/></linearGradient>
 <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#f5f4ff" stop-opacity="0"/><stop offset="1" stop-color="#f5f4ff" stop-opacity=".75"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<rect width="1440" height="1080" fill="url(#bg)"/>
<path d="M-150 50 Q540 590 1530 20" fill="none" stroke="#e9eaff" stroke-width="90" opacity=".13"/>
<path d="M-170 60 Q520 700 1550 160" fill="none" stroke="#f4f3ff" stroke-width="3" opacity=".5"/>
<path d="M-180 790 Q500 360 1600 600" fill="none" stroke="#f6f3ff" stroke-width="80" opacity=".13"/>
<rect y="790" width="1440" height="290" fill="url(#floor)"/>
<text x="720" y="126" text-anchor="middle" fill="white" font-family="DejaVu Sans,sans-serif" font-size="65" font-weight="700" letter-spacing="-2">Multi-Platform ERP Suite</text>
<text x="720" y="182" text-anchor="middle" fill="#f0f0ff" font-family="DejaVu Sans,sans-serif" font-size="21" letter-spacing="7">PROJECTS • FINANCE • PEOPLE</text>
<ellipse cx="585" cy="947" rx="480" ry="24" fill="#353c85" opacity=".33" filter="url(#shadow)"/>
<ellipse cx="1268" cy="945" rx="140" ry="18" fill="#353c85" opacity=".4" filter="url(#shadow)"/>
<path d="M510 802 L650 802 L678 912 L486 912 Z" fill="url(#stand)" stroke="#949ab9"/>
<path d="M459 911 L698 911 L768 937 Q772 945 754 946 L426 946 Q409 945 415 938 Z" fill="url(#metal)" stroke="#747d9f" stroke-width="1.5"/>
<rect x="33" y="280" width="1072" height="550" rx="24" fill="url(#metal)" stroke="#d1d5ef" stroke-width="2"/>
<rect x="38" y="284" width="1062" height="537" rx="20" fill="#11131c"/>
<image x="54" y="302" width="1030" height="489.731735" href="data:image/jpeg;base64,${web.toString('base64')}" preserveAspectRatio="xMidYMid meet"/>
<rect x="1129" y="284" width="282" height="637" rx="47" fill="url(#metal)" stroke="#cdd2e9" stroke-width="2"/>
<rect x="1135" y="289" width="270" height="627" rx="42" fill="#11131a"/>
<image x="1145" y="312" width="250" height="555.555556" href="data:image/png;base64,${mobile.toString('base64')}" preserveAspectRatio="xMidYMid meet"/>
<rect x="1225" y="892" width="90" height="4" rx="2" fill="#818492"/>
</svg>`;
const target = `${root}/showcase/multi-platform-erp-exact-screenshots-4x3.png`;
await sharp(Buffer.from(svg)).png().toFile(target);
console.log(target);
