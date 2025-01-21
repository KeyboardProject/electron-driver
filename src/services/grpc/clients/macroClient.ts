import { InputClient, StartRequest, StopRequest, ListRequest } from 'generated/input_service';
import { grpcConfig, getGrpcEndpoint } from '../config';
import { MacroEvent } from '../../../types/macro';

export class MacroClient {
  private client: InputClient;
  private address: string;
  
  constructor(address: string = grpcConfig.defaultAddress) {
    this.address = address;
    this.client = this.createClient();
  }

  private createClient(): InputClient {
    const endpoint = getGrpcEndpoint(this.address, grpcConfig.ports.input);
    return new InputClient(endpoint, grpcConfig.credentials);
  }

  public updateAddress(newAddress: string): void {
    if (this.address !== newAddress) {
      this.address = newAddress;
      this.client = this.createClient();
    }
  }

  public async startRecording(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.StartRecording(new StartRequest({ filename }), (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  // 다른 매크로 관련 메서드들...
} 