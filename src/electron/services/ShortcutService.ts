import { globalShortcut } from 'electron';
import WindowService from './WindowService';

export default class ShortcutService {
  private windowService: WindowService;
  private isFocused: boolean = true;

  constructor(windowService: WindowService) {
    this.windowService = windowService;
  }

  setupGlobalShortcuts(): void {
    globalShortcut.register('Control+Alt+K', () => {
      const videoWindow = this.windowService.getVideoWindow();
      if (videoWindow && videoWindow.isFocused()) {
        videoWindow.blur();
        this.isFocused = false;
        videoWindow.webContents.send('focus-status-changed', this.isFocused);
      }
    });
  }

  unregisterShortcuts(): void {
    globalShortcut.unregisterAll();
  }

  getFocusState(): boolean {
    return this.isFocused;
  }

  setFocusState(focused: boolean): void {
    this.isFocused = focused;
  }
} 