import { BrowserWindow } from 'electron';
import { grpcClients } from '../../services/grpc';
import * as videoService from '../../../generated/video_service';
import WindowService from './WindowService';

export default class VideoService {
  private videoWindow: BrowserWindow | null;
  private windowService: WindowService;
  private isRetrying: boolean = false;

  constructor(videoWindow: BrowserWindow | null, windowService: WindowService) {
    this.videoWindow = videoWindow;
    this.windowService = windowService;
  }

  showVideoWindow(): void {
    if (!this.videoWindow || this.videoWindow.isDestroyed()) {
      this.videoWindow = this.windowService.createVideoWindow();
      return;
    }
    this.videoWindow.show();
  }

  // 비활성화 서비스
  startVideoStream(event: Electron.IpcMainEvent): void {
    if (this.isRetrying) return;

    console.log('Starting video stream...');
    const call = grpcClients.video.streamVideo();
    
    call.on('data', (frame: videoService.VideoFrame) => {
      console.log('Received frame from server');
      if (this.videoWindow && !this.videoWindow.isDestroyed()) {
        console.log('Sending frame to video window');
        this.videoWindow.webContents.send('stream-video-frame', { 
          frame: frame.frame
        });
      } else {
        console.warn('Video window not available for frame');
      }
    });

    call.on('end', () => {
      // this.retryVideoStream(event)
    });
    call.on('error', (e: any) => {
      // console.log('stream-video-error', e);
    });
  }

  startMinimapVideoStream(event: Electron.IpcMainEvent): void {
    const call = grpcClients.video.streamMinimapVideo();

    call.on('data', (frame: videoService.VideoFrame) => {
      event.sender.send('stream-minimap-video-frame', { 
        frame: frame.frame
      });
    });
  }

  startCubeVideoStream(event: Electron.IpcMainEvent): void {
    const call = grpcClients.video.streamCube();

    call.on('data', (frame: videoService.VideoFrame) => {
      event.sender.send('stream-cube-video-frame', { frame });
    });
  }

  private retryVideoStream(event: Electron.IpcMainEvent): void {
    if (this.isRetrying) return;
    this.isRetrying = true;

    setTimeout(() => {
      this.isRetrying = false;
      this.startVideoStream(event);
    }, 5000);
  }
} 