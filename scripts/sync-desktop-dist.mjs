import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const desktopDist = path.join(rootDir, 'desktop', 'dist');
const erpPublic = path.join(rootDir, 'erp', 'public');
const downloadsDir = path.join(erpPublic, 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

console.log('[Sync] Scanning for desktop build artifacts in:', desktopDist);

if (!fs.existsSync(desktopDist)) {
  console.log('[Sync] No desktop/dist found yet. Run npm run build:desktop first.');
  process.exit(0);
}

const files = fs.readdirSync(desktopDist);
const exeFile = files.find((f) => f.endsWith('.exe') && f.includes('Setup'));

if (exeFile) {
  const src = path.join(desktopDist, exeFile);
  const destExe = path.join(downloadsDir, 'Agentic-Logistics-Setup.exe');
  const destRootExe = path.join(erpPublic, 'Agentic-Logistics-Setup.exe');

  fs.copyFileSync(src, destExe);
  fs.copyFileSync(src, destRootExe);

  const stats = fs.statSync(src);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  const meta = {
    version: '1.0.0',
    fileName: exeFile,
    fileSizeMB: sizeMB,
    lastBuilt: new Date().toISOString(),
    platform: 'win32-x64',
  };

  fs.writeFileSync(
    path.join(downloadsDir, 'version.json'),
    JSON.stringify(meta, null, 2),
    'utf8'
  );

  console.log(`[Sync] Successfully synced ${exeFile} (${sizeMB} MB) to ERP public downloads!`);
} else {
  console.log('[Sync] No Setup .exe file found in desktop/dist');
}
