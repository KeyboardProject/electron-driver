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
    if (this.videoWindow && !this.videoWindow.isDestroyed()) {
      this.videoWindow.show();
      return;
    }

    this.videoWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

    const startURL = isDev
      ? 'http://localhost:1624/#/video'
      : `file://${path.join(__dirname, '../app/dist/index.html')}#video`;

    this.videoWindow.loadURL(startURL);
    
    this.videoWindow.webContents.on('did-finish-load', () => {
      console.log('Video window loaded');
    });

    if (isDev) {
      this.videoWindow.webContents.openDevTools();
    }

    this.videoWindow.on('closed', () => {
      console.log('Video window closed');
      this.videoWindow = null;
    });

    return this.videoWindow;
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