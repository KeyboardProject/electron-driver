import { BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';

export default class WindowService {
  private mainWindow: BrowserWindow | null = null;
  private videoWindow: BrowserWindow | null = null;

  createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1368,
      height: 768,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    const startURL = isDev
      ? 'http://localhost:1624'
      : `file://${path.join(__dirname, '../app/dist/index.html')}`;

    this.mainWindow.loadURL(startURL);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  createVideoWindow(): void {
    const { width, height } = this.getPrimaryDisplaySize();
    this.videoWindow = new BrowserWindow({
      width: 300,
      height: 80,
      frame: true,
      autoHideMenuBar: true,
      resizable: true,
      maximizable: true,
      minimizable: true,
      fullscreenable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    const startURL = isDev
      ? 'http://localhost:1624#video'
      : `file://${path.join(__dirname, '../app/dist/index.html')}`;

    this.videoWindow.loadURL(startURL);
  }

  hasMainWindow(): boolean {
    return this.mainWindow !== null;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getVideoWindow(): BrowserWindow | null {
    return this.videoWindow;
  }

  private getPrimaryDisplaySize() {
    const { screen } = require('electron');
    return screen.getPrimaryDisplay().workAreaSize;
  }
} 