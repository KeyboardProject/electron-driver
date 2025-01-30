import { ClientWritableStream } from '@grpc/grpc-js';
import { grpcClients } from '../../services/grpc';
import * as inputService from '../../../generated/input_service';

export default class MouseService {
  private mouseCall: ClientWritableStream<inputService.MouseEvent> | null = null;
  private reconnectingRemote: boolean = false;

  constructor() {
    this.initializeMouseStream();
  }

  initializeMouseStream(): void {
    if (!this.mouseCall) {
      this.mouseCall = grpcClients.macro.remoteMouseEvent();
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
      const request = inputService.MouseEvent.create(mouseEventData);
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