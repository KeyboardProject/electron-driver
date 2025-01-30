import { ipcMain } from 'electron';
import WindowService from './WindowService';
import MacroService from './MacroService';
import VideoService from './VideoService';
import KeyboardService from './KeyboardService';
import MouseService from './MouseService';
import ShortcutService from './ShortcutService';
import ProfileService from './ProfileService';
import ComplexReplayService from './ComplexReplayService';
import { grpcClients } from '../../services/grpc';

export default class IpcService {
  private windowService: WindowService;
  private macroService: MacroService;
  private videoService: VideoService;
  private keyboardService: KeyboardService;
  private mouseService: MouseService;
  private shortcutService: ShortcutService;
  private profileService: ProfileService;
  private complexReplayService: ComplexReplayService;

  constructor(windowService: WindowService) {
    this.windowService = windowService;
    this.macroService = new MacroService();
    this.videoService = new VideoService(
      windowService.getVideoWindow(),
      windowService
    );
    this.keyboardService = new KeyboardService();
    this.mouseService = new MouseService();
    this.shortcutService = new ShortcutService(windowService);
    this.profileService = new ProfileService(windowService.getMainWindow());
    this.complexReplayService = new ComplexReplayService(windowService.getMainWindow());
  }

  registerHandlers(): void {
    this.registerMacroHandlers();
    this.registerVideoHandlers();
    this.registerInputHandlers();
    this.registerProfileHandlers();
    this.registerComplexReplayHandlers();
    this.registerAddressHandlers();
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

    ipcMain.on('get-macro-detail', (event, filename) => {
      this.macroService.getMacroDetail(event, filename);
    });
  }

  private registerVideoHandlers(): void {
    ipcMain.on('view-video-stream', () => {
      // this.videoService.showVideoWindow();
    });

    ipcMain.on('connect-video-stream', (event) => {
      this.videoService.startVideoStream(event);
    });

    ipcMain.on('calcul-minimap-video-stream', (event) => {
      this.videoService.startMinimapVideoStream(event);
    });

    ipcMain.on('start-cube-video-stream', (event) => {
      this.videoService.startCubeVideoStream(event);
    });
  }

  private registerProfileHandlers(): void {
    ipcMain.on('import-profile', (event) => {
      this.profileService.importProfile(event);
    });

    ipcMain.on('export-profile', (event, filename) => {
      this.profileService.exportProfile(event, filename);
    });
  }

  private registerComplexReplayHandlers(): void {
    ipcMain.on('start-complex-replay', (event, tasks, repeatCount) => {
      this.complexReplayService.startComplexReplay(event, tasks, repeatCount);
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

  private registerAddressHandlers(): void {
    ipcMain.on('change-ip-address', async (event, ipAddress: string) => {
      console.log('change-ip-address', ipAddress);
      grpcClients.updateAddress(ipAddress);
      
      // 스트림 재초기화
      this.keyboardService.initializeKeyboardStream();
      this.mouseService.initializeMouseStream();
    });
  }
} 