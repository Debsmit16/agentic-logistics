const { app, BrowserWindow } = require("electron");
const path = require("path");

const url = process.env.ELECTRON_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { contextIsolation: true },
  });
  win.loadURL(url);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
