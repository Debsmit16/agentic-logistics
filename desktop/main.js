const { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
const DEFAULT_LOCAL_URL = 'http://localhost:3000';
const DEFAULT_PROD_URL = 'https://agentic-logistics.vercel.app';

// Config path for user persistence
function getConfigPath() {
  return path.join(app.getPath('userData'), 'desktop-config.json');
}

function loadConfig() {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to read config:', e);
  }
  return {};
}

function saveConfig(cfg) {
  try {
    const p = getConfigPath();
    const current = loadConfig();
    fs.writeFileSync(p, JSON.stringify({ ...current, ...cfg }, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}

// Check if a URL is responding quickly
function checkUrlReachability(testUrl) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(testUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(testUrl, { timeout: 1500 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function resolveInitialUrl() {
  const cfg = loadConfig();
  if (cfg.customUrl && cfg.customUrl.trim().length > 0) {
    return cfg.customUrl.trim();
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  // Check if local dev server is running
  const isLocalUp = await checkUrlReachability(DEFAULT_LOCAL_URL);
  if (isLocalUp) {
    return DEFAULT_LOCAL_URL;
  }
  return DEFAULT_PROD_URL;
}

function createMainWindow() {
  const cfg = loadConfig();
  const windowState = cfg.windowState || {
    width: 1366,
    height: 860,
    isMaximized: false,
  };

  const iconPath = path.join(__dirname, 'assets', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#060913',
    title: 'Agentic Logistics Enterprise',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: true,
      spellcheck: false,
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Build enterprise menu
  setupApplicationMenu();

  // Load the application
  loadTargetApplication();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Track window bounds
  mainWindow.on('close', () => {
    if (!mainWindow) return;
    const isMax = mainWindow.isMaximized();
    const bounds = mainWindow.getBounds();
    saveConfig({
      windowState: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: isMax,
      },
    });
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      // Check if external or navigation
      const currentUrl = mainWindow.webContents.getURL();
      try {
        const parsedCurrent = new URL(currentUrl);
        const parsedTarget = new URL(url);
        if (parsedCurrent.host !== parsedTarget.host) {
          shell.openExternal(url);
          return { action: 'deny' };
        }
      } catch {}
    }
    return { action: 'allow' };
  });

  // Handle navigation errors gracefully
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.warn(`[Desktop] Page failed to load: ${errorCode} - ${errorDescription} (${validatedURL})`);
    if (errorCode === -3) return; // ignore ABORTED errors (e.g. user navigation)
    loadOfflinePage();
  });
}

async function loadTargetApplication() {
  if (!mainWindow) return;
  const targetUrl = await resolveInitialUrl();
  console.log(`[Desktop] Loading target: ${targetUrl}`);

  mainWindow.loadURL(targetUrl).catch((err) => {
    console.error(`[Desktop] Failed to load URL:`, err.message);
    loadOfflinePage();
  });
}

function loadOfflinePage() {
  if (!mainWindow) return;
  const offlinePath = path.join(__dirname, 'offline.html');
  mainWindow.loadFile(offlinePath);
}

function setupApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: '&File',
      submenu: [
        {
          label: 'Reload Platform',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            loadTargetApplication();
          },
        },
        {
          label: 'Clear Cache & Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: async () => {
            if (mainWindow) {
              await session.defaultSession.clearCache();
              loadTargetApplication();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Open in Web Browser',
          click: async () => {
            const url = await resolveInitialUrl();
            shell.openExternal(url);
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'E&xit' },
      ],
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: '&View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: '&Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Agentic Logistics Documentation',
          click: () => shell.openExternal('https://github.com/Debsmit16/agentic-logistics'),
        },
        {
          label: 'About Agentic Logistics',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Agentic Logistics Enterprise',
              message: 'Agentic Logistics Desktop Client',
              detail: 'Version: 1.0.0\nArchitecture: Windows x64 Enterprise Wrapper\nPowered by Electron & Chromium',
              buttons: ['OK'],
              icon: path.join(__dirname, 'assets', 'icon.ico'),
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-target-url', async () => {
  return await resolveInitialUrl();
});

ipcMain.handle('set-target-url', (event, newUrl) => {
  saveConfig({ customUrl: newUrl });
  loadTargetApplication();
  return true;
});

ipcMain.handle('retry-connection', () => {
  loadTargetApplication();
  return true;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
  return true;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// Second instance focus
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
