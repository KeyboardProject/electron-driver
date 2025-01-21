import * as grpc from '@grpc/grpc-js';

export const grpcConfig = {
  defaultAddress: '10.55.0.1',
  ports: {
    input: '50051',
    restart: '50052',
    video: '50053'
  },
  credentials: grpc.credentials.createInsecure()
};

export const getGrpcEndpoint = (address: string, port: string) => 
  `${address}:${port}`; 