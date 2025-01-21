import React from 'react';
import { MainVideo } from '../components/video/MainVideo';
import { RemoteControl } from '../components/video/RemoteControl';

const VideoPage: React.FC = () => {
  return (
    <div className="video-page">
      <RemoteControl>
        <MainVideo />
      </RemoteControl>
    </div>
  );
};

export default VideoPage; 