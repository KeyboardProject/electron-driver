import React, { useState, useEffect } from 'react';
import VideoComponent from './VideoComponent';
import RemoteControlComponent from './RemoteControlComponent';

const { ipcRenderer } = window.require('electron');

const MainVideoComponent: React.FC = () => {
  const [frameData, setFrameData] = useState<string | null>(null);
  const [remoteCursorPosition, setRemoteCursorPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Electron에서 비디오 프레임 수신
    ipcRenderer.on('stream-video-frame', (_, data) => {
      console.log('stream-video-frame', data);
      if (data.frame && data.frame.array && data.frame.array[0]) {
        const uint8Array = new Uint8Array(data.frame.array[0]);
        const base64String = Buffer.from(uint8Array).toString('base64');
        setFrameData(base64String);
      } else {
        console.error('Invalid frame data format');
      }
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      ipcRenderer.removeAllListeners('stream-video-frame');
    };
  }, []);

  return (<div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
    <RemoteControlComponent
      frameData={frameData}
      remoteCursorPosition={remoteCursorPosition}
    />
  </div>);
};

export default MainVideoComponent;
