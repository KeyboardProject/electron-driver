import { VideoServiceClient, VideoRequest, VideoFrame, Empty } from 'generated/video_service';
import { grpcConfig, getGrpcEndpoint, updateGrpcAddress } from '../config';

export class VideoClient {
  public client: VideoServiceClient;
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
    console.log('video updateAddress', newAddress);
    if (this.address !== newAddress) {
      updateGrpcAddress(newAddress);
      this.address = newAddress;
      this.client = this.createClient();
    }
  }

  public streamVideo() {
    return this.client.streamVideo({});
  }

  public streamMinimapVideo() {
    return this.client.calculateMinimap({});
  }

  public streamCube() {
    return this.client.streamCube({});
  }
} 