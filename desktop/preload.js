const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopClient', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
  getTargetUrl: () => ipcRenderer.invoke('get-target-url'),
  setTargetUrl: (url) => ipcRenderer.invoke('set-target-url', url),
  retryConnection: () => ipcRenderer.invoke('retry-connection'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
