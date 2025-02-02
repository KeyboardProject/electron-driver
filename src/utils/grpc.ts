import * as grpc from '@grpc/grpc-js';
import { StartRequest, StopRequest, InputClient, ListRequest, StopReplayRequest, ReplayRequest, StatusResponse, SaveFilesResponse, GetMacroDetailRequest, GetMacroDetailResponse, DeleteMacrosRequest, ComplexReplayRequest, ImportProfileRequest, ExportProfileRequest, ExportProfileResponse, KeyboardEvent, MouseEvent } from '../../generated/input_service';
import { RestartClient, RestartRequest, UpdateRequest, UpdateResponse } from '../../generated/restart_service';
import { VideoServiceClient, VideoRequest, VideoFrame, Empty } from '../../generated/video_service';

class MacroGrpcClient {
  client;
  private address: string;
  
  constructor() {
    this.address = '10.55.0.1';
    this.client = new InputClient(`${this.address}:50051`, grpc.credentials.createInsecure());
  }

  updateAddress(newAddress: string) {
    if (newAddress !== this.address) {
      this.address = newAddress;
      this.client = new InputClient(`${this.address}:50051`, grpc.credentials.createInsecure());
      console.log(`Address updated to ${this.address}:50051`);
    }
  }

  deleteMacros(request: DeleteMacrosRequest) {
    console.log(request);
    this.client.DeleteMacros(request, (error, response) => {
      if (error) {
        console.error('Error:', error);
        return;
      }
      console.log('Response:', response);
    });
  }

  startRequest(request: StartRequest) {
    this.client.StartRecording(request, (error, response) => {
      if (error) {
        console.error('Error:', error);
        return;
      }
      console.log('Response:', response);
    });
  }

  stopRequest(request: StopRequest) {
    this.client.StopRecording(request, (error, response) => {
      if (error) {
        console.error('Error:', error);
        return;
      }
      console.log('Response:', response);
    });
  }

  listMacros() {
    return new Promise<string[]>((resolve, reject) => {
      const request = new ListRequest();
      this.client.ListSaveFiles(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response ? response.filenames : [] );
      });
    });
  }

  replayMacroDebug(request: ReplayRequest) {
    const call = this.client.ReplayMacroDebug(request);
    return call;
  }

  // Stop replaying a macro
  stopReplay(request: StopReplayRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.StopReplay(request, (error, response) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
          return;
        }
        if (!response) {
          // 여기서 undefined 처리
          console.error('No response received');
          reject(new Error('No response received'));
          return;
        }
        console.log('Response:', response);
        resolve(response);
      });
    });
  }

  listSaveFiles(request: ListRequest, callback: (error: grpc.ServiceError | null, response: SaveFilesResponse | null) => void) {
    this.client.ListSaveFiles(request, (error, response) => {
      if (error) {
        console.error('Error in ListSaveFiles:', error);
        callback(error, null);
        return;
      }
  
      if (response === undefined) {
        // grpc.ServiceError 타입에 맞는 에러 객체 생성
        const serviceError: grpc.ServiceError = {
          name: 'NoResponseError',
          message: 'No response received',
          code: grpc.status.UNKNOWN,
          details: 'No response received from gRPC service',
          metadata: new grpc.Metadata()
        };
        console.error('No response received');
        callback(serviceError, null);
        return;
      }
  
      console.log('Response from ListSaveFiles:', response);
      callback(null, response);
    });
  }  
  getMacroDetail(request: GetMacroDetailRequest): Promise<GetMacroDetailResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetMacroDetail(request, (error, response) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
          return;
        }
        if (response) {
          resolve(response);
        }
      });
    });
  }

  startComplexReplay(request: ComplexReplayRequest) {
    const call = this.client.StartComplexReplay(request);
    return call;
  }
  
  importProfile(request: ImportProfileRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.ImportProfile(request, (error, response) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
          return;
        }
        if (response) {
          resolve(response);
        }
      });
    });
  }

  exportProfile(request: ExportProfileRequest): Promise<ExportProfileResponse> {
    return new Promise((resolve, reject) => {
      this.client.ExportProfile(request, (error, response) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
          return;
        }
        if (response) {
          resolve(response);
        }
      });
    });
  }

  sendRemoteKeyEvents(): grpc.ClientWritableStream<KeyboardEvent>  {
    const call = this.client.RemoteKeyEvent((error: any, response: any) => {
      if (error) {
        console.error('Error in RemoteKeyEvent:', error);
        return;
      }
      console.log('RemoteKeyEvent completed');
    });
    return call;
  }

  sendRemoteMouseEvents(): grpc.ClientWritableStream<MouseEvent> {
    const call = this.client.RemoteMouseEvent((error: any, response: any) => {
      if (error) {
        console.error('Error in RemoteMouseEvent:', error);
        return;
      }
      console.log('RemoteMouseEvent completed');
    });
    return call;
  }
}

class RestartGrpcClient {
  client;
  private address: string;

  constructor() {
    this.address = '10.55.0.1';
    this.client = new RestartClient(`${this.address}:50052`, grpc.credentials.createInsecure());
  }

  updateAddress(newAddress: string) {
    if (newAddress !== this.address) {
      this.address = newAddress;
      this.client = new RestartClient(`${this.address}:50052`, grpc.credentials.createInsecure());
      console.log(`Address updated to ${this.address}:50052`);
    }
  }

  restartRequest(request: RestartRequest) {
    this.client.RestartProcess(request, (error, response) => {
      if (error) {
        console.error('Error:', error);
        return;
      }
      console.log('Response:', response);
    });
  }

  requestUpdate(request: UpdateRequest) {
    const call = this.client.RequestUpdate(request);
    return call;
  }
}

class VideoGrpcClient {
  client;
  private address: string;

  constructor() {
    this.address = '10.55.0.1';
    this.client = new VideoServiceClient(`${this.address}:50053`, grpc.credentials.createInsecure());
  }

  streamVideo() {
    const call = this.client.StreamVideo(new VideoRequest());
    return call;
  }

  streamCube() {
    const call = this.client.StreamCube(new Empty());
    return call;
  }

  streamMinimapVideo() {
    const call = this.client.CalculateMinimap(new Empty());
    return call;
  }

  updateAddress(newAddress: string) {
    if (newAddress !== this.address) {
      this.address = newAddress;
      this.client = new VideoServiceClient(`${this.address}:50053`, grpc.credentials.createInsecure());
      console.log(`Address updated to ${this.address}:50053`);
    }
  }
}

export default { MacroGrpcClient: new MacroGrpcClient(), RestartGrpcClient: new RestartGrpcClient(), VideoGrpcClient: new VideoGrpcClient()};
