import { ipcMain } from 'electron';
import { grpcClients } from '../../services/grpc';
import * as inputService from '../../../generated/input_service';

export default class MacroService {
  startRecording(fileName: string): void {
    const request = inputService.StartRequest.create({ filename: fileName });
    grpcClients.macro.startRecording(request);
  }

  stopRecording(): void {
    const request = inputService.StopRequest.create();
    grpcClients.macro.stopRecording(request);
  }

  deleteMacros(filenames: string[]): void {
    const request = inputService.DeleteMacrosRequest.create({ filenames });
    grpcClients.macro.deleteMacros(request);
  }

  startReplayDebug(event: Electron.IpcMainEvent, filename: string): void {
    const call = grpcClients.macro.replayMacroDebug(
      inputService.ReplayRequest.create({ filename })
    );

    call.on('data', (macroEvent: inputService.MacroEvent) => {
      event.sender.send('macro-event', macroEvent.eventDescription);
    });

    call.on('end', () => {
      event.sender.send('replay-ended');
    });

    call.on('error', (error: Error) => {
      event.sender.send('grpc-error', error.message);
      console.log('replay-error', error.message);
    });
  }

  async listMacros(event: Electron.IpcMainEvent): Promise<void> {
    const request = inputService.ListRequest.create();
    try {
      const response = await grpcClients.macro.listSaveFiles(request);
      console.log('listMacros', response.filenames);
      event.sender.send('macro-list', response.filenames);
    } catch (error) {
      console.error('Error listing macros:', error);
      event.sender.send('grpc-error', error.message);
    }
  }

  async getMacroDetail(event: Electron.IpcMainEvent, filename: string): Promise<void> {
    try {
      const request = inputService.GetMacroDetailRequest.create({ filename });
      const response = await grpcClients.macro.getMacroDetail(request);
      // console.log('getMacroDetail', response);
      const events = this.convertMessage(response);
      // console.log('getMacroDetail', events);
      event.sender.send('get-macro-detail-response', events, null);
    } catch (error) {
      console.error('Error getting macro detail:', error);
      event.sender.send('get-macro-detail-response', null, error);
    }
  }

  private convertMessage(response: inputService.GetMacroDetailResponse) {
    // response.events를 적절한 형식으로 변환
    response.events?.forEach(event => {
      console.log('event', event);
    });
    return response.events?.map(event => ({
      delay: event.delay,
      data: event.data
    })) || [];
  }
} 