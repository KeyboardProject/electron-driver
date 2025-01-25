import { ClientWritableStream } from '@grpc/grpc-js';
import GrpcClient from '../../utils/grpc';
import { MouseEvent } from '../../../generated/input_service';

export default class MouseService {
  private mouseCall: ClientWritableStream<MouseEvent> | null = null;
  private reconnectingRemote = false;

  constructor() {
    this.initializeMouseStream();
  }

  private initializeMouseStream(): void {
    if (!this.mouseCall) {
      this.mouseCall = GrpcClient.MacroGrpcClient.sendRemoteMouseEvents();
      this.setupStreamHandlers();
    }
  }

  private setupStreamHandlers(): void {
    if (!this.mouseCall) return;

    this.mouseCall.on('end', () => this.handleStreamDisconnect());
    this.mouseCall.on('error', () => this.handleStreamDisconnect());
  }

  private handleStreamDisconnect(): void {
    if (this.reconnectingRemote) return;

    this.reconnectingRemote = true;
    this.mouseCall?.end();

    setTimeout(() => {
      this.reconnectingRemote = false;
      this.initializeMouseStream();
    }, 1000);
  }

  handleMouseEvent(mouseEventData: any): void {
    if (this.mouseCall && !this.mouseCall.writableEnded) {
      const request = new MouseEvent(mouseEventData);
      this.mouseCall.write(request);
    } else {
      console.warn('mouseCall is not initialized or has ended');
    }
  }

  stopMouseStream(): void {
    if (this.mouseCall) {
      this.mouseCall.end();
      this.mouseCall = null;
    }
  }
} 