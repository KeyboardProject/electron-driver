import { app } from 'electron';
import WindowService from './src/electron/services/WindowService';
import IpcService from './src/electron/services/IpcService';

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
}

const electronApp = new ElectronApp();
electronApp.init(); 