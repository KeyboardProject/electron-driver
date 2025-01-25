import { ipcMain } from 'electron';
import WindowService from './WindowService';
import MacroService from './MacroService';
import VideoService from './VideoService';
import KeyboardService from './KeyboardService';
import MouseService from './MouseService';
import ShortcutService from './ShortcutService';

export default class IpcService {
  private windowService: WindowService;
  private macroService: MacroService;
  private videoService: VideoService;
  private keyboardService: KeyboardService;
  private mouseService: MouseService;
  private shortcutService: ShortcutService;

  constructor(windowService: WindowService) {
    this.windowService = windowService;
    this.macroService = new MacroService();
    this.videoService = new VideoService(windowService);
    this.keyboardService = new KeyboardService();
    this.mouseService = new MouseService();
    this.shortcutService = new ShortcutService(windowService);
  }

  registerHandlers(): void {
    this.registerMacroHandlers();
    this.registerVideoHandlers();
    this.registerInputHandlers();
    this.shortcutService.setupGlobalShortcuts();
  }

  private registerMacroHandlers(): void {
    ipcMain.on('start-recording', (event, fileName) => {
      this.macroService.startRecording(fileName);
    });

    ipcMain.on('end-recording', () => {
      this.macroService.stopRecording();
    });

    ipcMain.on('remove-macro', (event, filenames) => {
      this.macroService.deleteMacros(filenames);
    });

    ipcMain.on('start-replay-debug', async (event, filename) => {
      this.macroService.startReplayDebug(event, filename);
    });

    ipcMain.on('list-macros', async (event) => {
      this.macroService.listMacros(event);
    });
  }

  private registerVideoHandlers(): void {
    ipcMain.on('view-video-stream', () => {
      this.videoService.showVideoWindow();
    });

    ipcMain.on('connect-video-stream', (event) => {
      this.videoService.startVideoStream(event);
    });
  }

  private registerInputHandlers(): void {
    ipcMain.on('keyboard-event', (event, keyboardEventData) => {
      this.keyboardService.handleKeyboardEvent(keyboardEventData);
    });

    ipcMain.on('mouse-event', (event, mouseEventData) => {
      this.mouseService.handleMouseEvent(mouseEventData);
    });

    ipcMain.on('request-focus-status', (event) => {
      event.reply('focus-status-changed', this.shortcutService.getFocusState());
    });
  }
} 