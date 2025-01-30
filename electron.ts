import { app } from 'electron';
import WindowService from './src/electron/services/WindowService';
import IpcService from './src/electron/services/IpcService';
import { BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

class ElectronApp {
  private windowService: WindowService;
  private ipcService: IpcService;

  constructor() {
    this.windowService = new WindowService();
    this.ipcService = new IpcService(this.windowService);
  }

  init() {
    app.on('ready', () => {
      this.windowService.createMainWindow();
      this.ipcService.registerHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('will-quit', () => {
      // 앱 종료 시 전역 단축키 해제
      const { globalShortcut } = require('electron');
      globalShortcut.unregisterAll();
    });

    app.on('activate', () => {
      if (!this.windowService.hasMainWindow()) {
        this.windowService.createMainWindow();
      }
    });
  }

  createWindow(): void {
    const mainWindow = new BrowserWindow({
    width: 1368,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startURL = isDev
    ? 'http://localhost:1624'
      : `file://${path.join(__dirname, 'dist', 'index.html')}`;  // dist 폴더 경로 수정

  mainWindow.loadURL(startURL);

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
}

const electronApp = new ElectronApp();
electronApp.init(); 