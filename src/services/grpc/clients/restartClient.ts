import { RestartClient as GrpcRestartClient, RestartRequest, UpdateRequest } from 'generated/restart_service';
import { grpcConfig, getGrpcEndpoint, updateGrpcAddress } from '../config';

export class RestartClient {
  private client: GrpcRestartClient;
  private address: string;

  constructor(address: string = grpcConfig.defaultAddress) {
    this.address = address;
    this.client = this.createClient();
  }

  private createClient(): GrpcRestartClient {
    const endpoint = getGrpcEndpoint(this.address, grpcConfig.ports.restart);
    return new GrpcRestartClient(endpoint, grpcConfig.credentials);
  }

  public updateAddress(newAddress: string): void {
    console.log('restart updateAddress', newAddress);
    if (this.address !== newAddress) {
      updateGrpcAddress(newAddress);
      this.address = newAddress;
      this.client = this.createClient();
    }
  }

  public restartRequest(request: RestartRequest) {
    return this.client.restartProcess(request);
  }

  public requestUpdate(request: UpdateRequest) {
    return this.client.requestUpdate(request);
  }
} 