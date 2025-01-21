import { MacroClient } from './clients/macroClient';
import { VideoClient } from './clients/videoClient';
import { RestartClient } from './clients/restartClient';

export const grpcClients = {
  macro: new MacroClient(),
  video: new VideoClient(),
  restart: new RestartClient()
};

export * from './config'; 