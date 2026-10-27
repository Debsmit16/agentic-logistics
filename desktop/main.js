const { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Append switches for enterprise SSL & local testing
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');

// Trust certificates for platform domains
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (
    url.includes('agenticlogistics.in') ||
    url.includes('vercel.app') ||
    url.includes('localhost') ||
    url.includes('127.0.0.1')
  ) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
const DEFAULT_LOCAL_URL = 'http://localhost:3000';
const DEFAULT_PROD_URL = 'https://erp.agenticlogistics.in';

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
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;
      const options = {
        timeout: 1500,
        rejectUnauthorized: false,
      };
      const req = client.get(testUrl, options, (res) => {
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
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: true,
      spellcheck: false,
    },
  });

  // Completely eliminate the top "File Edit View..." menu strip
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  // Identify as desktop app in user-agent
  mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + ' AgenticDesktop/1.0');

  // Inject desktop styles & flags to suppress web-only buttons (e.g. Download)
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.insertCSS(`
      .agentic-download-btn { display: none !important; }
    `).catch(() => {});
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.add('agentic-desktop-app');
      window.isAgenticDesktop = true;
    `).catch(() => {});
  });

  // Modern keyboard shortcuts (without needing a visible menu bar)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
      loadTargetApplication();
      event.preventDefault();
    }
    if (input.control && input.shift && input.key.toLowerCase() === 'r') {
      session.defaultSession.clearCache().then(() => loadTargetApplication());
      event.preventDefault();
    }
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load the application
  loadTargetApplication();

  const showWindowSafely = () => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  };

  mainWindow.once('ready-to-show', showWindowSafely);
  // Failsafe: guarantee window is always displayed even if network is slow
  setTimeout(showWindowSafely, 1500);

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
    if (validatedURL && validatedURL.includes('offline.html')) return;
    loadOfflinePage();
  });
}

async function loadTargetApplication() {
  if (!mainWindow) return;
  const targetUrl = await resolveInitialUrl();
  console.log(`[Desktop] Loading target: ${targetUrl}`);

  mainWindow.loadURL(targetUrl).then(() => {
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
  }).catch((err) => {
    console.error(`[Desktop] Failed to load URL:`, err.message);
    loadOfflinePage();
  });
}

function loadOfflinePage() {
  if (!mainWindow) return;
  const offlinePath = path.join(__dirname, 'offline.html');
  mainWindow.loadFile(offlinePath).finally(() => {
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
  });
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
