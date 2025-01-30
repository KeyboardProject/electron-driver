import { useState, useCallback } from 'react';
import { isValidIpAddress } from '../utils/validation';
const { ipcRenderer } = window.require('electron');

export const useGrpcConnection = () => {
  const [ipAddress, setIpAddress] = useState<string>('');

  const connectToServer = useCallback(() => {
    const ipToSet = isValidIpAddress(ipAddress) ? ipAddress : '10.55.0.1';
    
    ipcRenderer.send('change-ip-address', ipToSet);
    console.log('IP Address changed to:', ipToSet);
    
    // ipcRenderer.send('connect-video-stream');
    ipcRenderer.send('view-video-stream');
  }, [ipAddress]);

  return {
    ipAddress,
    setIpAddress,
    connectToServer
  };
}; 