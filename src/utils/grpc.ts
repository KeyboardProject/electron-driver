import * as grpc from '@grpc/grpc-js';
import * as inputService from '../../generated/input_service';
import * as videoService from '../../generated/video_service';
import * as restartService from '../../generated/restart_service';

class GrpcClient {
  private static instance: GrpcClient;
  private macroClient: any;
  private videoClient: any;
  private restartClient: any;

  private constructor() {
    const target = 'localhost:50051';
    this.macroClient = new inputService.InputClient(
      target,
      grpc.credentials.createInsecure()
    );
    this.videoClient = new videoService.VideoServiceClient(
      target,
      grpc.credentials.createInsecure()
    );
    this.restartClient = new restartService.RestartClient(
      target,
      grpc.credentials.createInsecure()
    );
  }

  static get MacroGrpcClient() {
    if (!GrpcClient.instance) {
      GrpcClient.instance = new GrpcClient();
    }
    return GrpcClient.instance.macroClient;
  }

  static get VideoGrpcClient() {
    if (!GrpcClient.instance) {
      GrpcClient.instance = new GrpcClient();
    }
    return GrpcClient.instance.videoClient;
  }

  static get RestartGrpcClient() {
    if (!GrpcClient.instance) {
      GrpcClient.instance = new GrpcClient();
    }
    return GrpcClient.instance.restartClient;
  }
}

export default GrpcClient;
