import WindowService from './WindowService';
import GrpcClient from '../../utils/grpc';
import { VideoFrame } from '../../../generated/video_service';

export default class VideoService {
  private windowService: WindowService;
  private isRetrying: boolean = false;

  constructor(windowService: WindowService) {
    this.windowService = windowService;
  }

  showVideoWindow(): void {
    this.windowService.createVideoWindow();
  }

  startVideoStream(event: Electron.IpcMainEvent): void {
    if (this.isRetrying) return;

    const call = GrpcClient.VideoGrpcClient.streamVideo();
    const videoWindow = this.windowService.getVideoWindow();

    call.on('data', (frame: VideoFrame) => {
      if (videoWindow && !videoWindow.isDestroyed()) {
        videoWindow.webContents.send('stream-video-frame', { frame });
      }
    });

    call.on('end', () => {
      this.retryVideoStream(event);
    });

    call.on('error', () => {
      this.retryVideoStream(event);
    });
  }

  private retryVideoStream(event: Electron.IpcMainEvent): void {
    if (this.isRetrying) return;
    this.isRetrying = true;

    setTimeout(() => {
      console.log('Retrying video stream...');
      this.isRetrying = false;
      this.startVideoStream(event);
    }, 5000);
  }
} 