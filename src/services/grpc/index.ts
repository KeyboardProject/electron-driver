import { MacroClient } from './clients/macroClient';
import { VideoClient } from './clients/videoClient';
import { RestartClient } from './clients/restartClient';

class GrpcClients {
  private static instance: GrpcClients;
  public macro: MacroClient;
  public video: VideoClient;
  public restart: RestartClient;

  private constructor() {
    this.macro = new MacroClient();
    this.video = new VideoClient();
    this.restart = new RestartClient();
  }

  public static getInstance(): GrpcClients {
    if (!GrpcClients.instance) {
      GrpcClients.instance = new GrpcClients();
    }
    return GrpcClients.instance;
  }

  public updateAddress(newAddress: string): void {
    this.macro.updateAddress(newAddress);
    this.video.updateAddress(newAddress);
    this.restart.updateAddress(newAddress);
  }
}

export const grpcClients = GrpcClients.getInstance();
export * from './config'; 