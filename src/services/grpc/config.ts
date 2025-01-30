import { ChannelCredentials } from '@grpc/grpc-js';

interface GrpcPorts {
  input: number;
  video: number;
  restart: number;
}

interface GrpcConfig {
  defaultAddress: string;
  credentials: ChannelCredentials;
  ports: GrpcPorts;
}

let currentAddress = '10.55.0.1';  // 기본값 설정

export const grpcConfig: GrpcConfig = {
  get defaultAddress() {
    return currentAddress;
  },
  set defaultAddress(address: string) {
    currentAddress = address;
  },
  credentials: ChannelCredentials.createInsecure(),
  ports: {
    input: 50051,
    video: 50053,
    restart: 50052
  }
};

export function getGrpcEndpoint(address: string, port: number): string {
  return `${address}:${port}`;
}

export function updateGrpcAddress(address: string): void {
  grpcConfig.defaultAddress = address;
} 