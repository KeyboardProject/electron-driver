import { BrowserWindow } from 'electron';
import { grpcClients } from '../../services/grpc';
import * as inputService from '../../../generated/input_service';
import { ComplexReplayType } from '../../utils/type';

export default class ComplexReplayService {
  private mainWindow: BrowserWindow | null;

  constructor(mainWindow: BrowserWindow | null) {
    this.mainWindow = mainWindow;
  }

  async startComplexReplay(event: Electron.IpcMainEvent, tasks: ComplexReplayType[], repeatCount: number): Promise<void> {
    try {
      const convertTasks = tasks.map(v => 
        inputService.ReplayTask.create({ 
          ...v, 
          repeatCount: v.repeatCount || 1 
        })
      );

      const call = grpcClients.macro.startComplexReplay(
        inputService.ComplexReplayRequest.create({ 
          tasks: convertTasks, 
          repeatCount 
        })
      );

      call.on('data', (response: inputService.StatusResponse) => {
        event.sender.send('get-start-complex-replay-response', response, null);
        if (this.mainWindow) {
          this.showNotification(response.message);
        }
      });

      call.on('end', () => {
        console.log("Streaming ended");
      });

      call.on('error', (err) => {
        console.error("Error:", err);
        event.sender.send('get-start-complex-replay-response', null, err);
      });
    } catch (error) {
      console.error('Error starting complex replay:', error);
      event.sender.send('get-start-complex-replay-response', null, error);
    }
  }

  private showNotification(message: string): void {
    // 알림 표시 로직 구현
  }
} 