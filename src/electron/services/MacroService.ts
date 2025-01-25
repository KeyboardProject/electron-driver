import { ipcMain } from 'electron';
import GrpcClient from '../../utils/grpc';
import { 
  StartRequest, 
  StopRequest, 
  DeleteMacrosRequest,
  ReplayRequest,
  ListRequest 
} from '../../../generated/input_service';

export default class MacroService {
  startRecording(fileName: string): void {
    const request = new StartRequest({ filename: fileName });
    GrpcClient.MacroGrpcClient.startRequest(request);
  }

  stopRecording(): void {
    const request = new StopRequest();
    GrpcClient.MacroGrpcClient.stopRequest(request);
  }

  deleteMacros(filenames: string[]): void {
    const request = new DeleteMacrosRequest({ filenames });
    GrpcClient.MacroGrpcClient.deleteMacros(request);
  }

  startReplayDebug(event: Electron.IpcMainEvent, filename: string): void {
    const call = GrpcClient.MacroGrpcClient.replayMacroDebug(
      new ReplayRequest({ filename })
    );

    call.on('data', (macroEvent) => {
      event.sender.send('macro-event', macroEvent.eventDescription);
    });

    call.on('end', () => {
      event.sender.send('replay-ended');
    });

    call.on('error', (error) => {
      event.sender.send('grpc-error', error.message);
    });
  }

  listMacros(event: Electron.IpcMainEvent): void {
    const request = new ListRequest();
    GrpcClient.MacroGrpcClient.listSaveFiles(request, (error, response) => {
      if (error) {
        event.sender.send('grpc-error', error.message);
        return;
      }
      event.sender.send('macro-list', response!.filenames);
    });
  }
} 