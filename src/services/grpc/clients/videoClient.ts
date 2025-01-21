import { VideoServiceClient, VideoRequest, VideoFrame, Empty } from 'generated/video_service';
import { grpcConfig, getGrpcEndpoint } from '../config';

export class VideoClient {
  private client: VideoServiceClient;
  private address: string;

  constructor(address: string = grpcConfig.defaultAddress) {
    this.address = address;
    this.client = this.createClient();
  }

  private createClient(): VideoServiceClient {
    const endpoint = getGrpcEndpoint(this.address, grpcConfig.ports.video);
    return new VideoServiceClient(endpoint, grpcConfig.credentials);
  }

  public updateAddress(newAddress: string): void {
    if (this.address !== newAddress) {
      this.address = newAddress;
      this.client = this.createClient();
    }
  }

  public streamVideo() {
    return this.client.StreamVideo(new VideoRequest());
  }

  public streamMinimapVideo() {
    return this.client.CalculateMinimap(new Empty());
  }
} 