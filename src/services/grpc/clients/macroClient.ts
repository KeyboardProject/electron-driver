import { InputClient, StartRequest, StopRequest, ListRequest, ReplayRequest, DeleteMacrosRequest, ComplexReplayRequest, ImportProfileRequest, ExportProfileRequest, StatusResponse, SaveFilesResponse, ExportProfileResponse, GetMacroDetailRequest, GetMacroDetailResponse } from 'generated/input_service';
import { grpcConfig, getGrpcEndpoint, updateGrpcAddress } from '../config';
import { MacroEvent } from '../../../types/macro';
import { ServiceError } from '@grpc/grpc-js';

export class MacroClient {
  public client: InputClient;
  public address: string;
  
  constructor(address: string = grpcConfig.defaultAddress) {
    this.address = address;
    this.client = this.createClient();
  }

  private createClient(): InputClient {
    const endpoint = getGrpcEndpoint(this.address, grpcConfig.ports.input);
    console.log('createClient', endpoint);
    return new InputClient(endpoint, grpcConfig.credentials);
  }

  public updateAddress(newAddress: string): void {
    console.log('updateAddress', newAddress);
    if (this.address !== newAddress) {
      updateGrpcAddress(newAddress);
      this.address = newAddress;
      this.client = this.createClient();
    }
  }

  public remoteKeyEvent() {
    return this.client.remoteKeyEvent((error, response) => {
      if (error) {
        console.error('Remote key event error:', error);
      }
    });
  }

  public remoteMouseEvent() {
    return this.client.remoteMouseEvent((error, response) => {
      if (error) {
        console.error('Remote mouse event error:', error);
      }
    });
  }

  public startRecording(request: StartRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.startRecording(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public stopRecording(request: StopRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.stopRecording(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public replayMacroDebug(request: ReplayRequest) {
    return this.client.replayMacroDebug(request);
  }

  public deleteMacros(request: DeleteMacrosRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.deleteMacros(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public listSaveFiles(request: ListRequest): Promise<SaveFilesResponse> {
    return new Promise((resolve, reject) => {
      this.client.listSaveFiles(request, (error, response) => {
        if (error) {
          reject(error);
        }
        else {
          console.log('listSaveFiles', response.filenames);
          resolve(response);
        }
      });
    });
  }

  public startComplexReplay(request: ComplexReplayRequest) {
    return this.client.startComplexReplay(request);
  }

  public importProfile(request: ImportProfileRequest): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.importProfile(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public exportProfile(request: ExportProfileRequest): Promise<ExportProfileResponse> {
    return new Promise((resolve, reject) => {
      this.client.exportProfile(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public getMacroDetail(request: GetMacroDetailRequest): Promise<GetMacroDetailResponse> {
    return new Promise((resolve, reject) => {
      this.client.getMacroDetail(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // 다른 매크로 관련 메서드들...
} 