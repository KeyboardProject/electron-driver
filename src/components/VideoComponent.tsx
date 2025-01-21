import React, { useEffect, useRef } from 'react';

interface VideoComponentProps {
  frameData: string | null; // base64 인코딩된 프레임 데이터
}

const VideoComponent: React.FC<VideoComponentProps> = ({ frameData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 원본 영상의 비율 (16:9)
  const VIDEO_ASPECT_RATIO = 16 / 9;

  useEffect(() => {
    const updateCanvasSize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // 캔버스 크기 계산 (화면 비율 유지)
      let canvasWidth = windowWidth;
      let canvasHeight = canvasWidth / VIDEO_ASPECT_RATIO;

      if (canvasHeight > windowHeight) {
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight * VIDEO_ASPECT_RATIO;
      }

      // 캔버스 스타일로 크기 설정
      if (canvasRef.current) {
        canvasRef.current.style.width = `${canvasWidth}px`;
        canvasRef.current.style.height = `${canvasHeight}px`;
      }
    };

    updateCanvasSize(); // 초기 크기 설정
    window.addEventListener('resize', updateCanvasSize); // 창 크기 조절 시 업데이트

    return () => {
      window.removeEventListener('resize', updateCanvasSize); // 이벤트 리스너 정리
    };
  }, []);

  useEffect(() => {
    if (frameData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 실제 캔버스의 해상도는 이미지를 기준으로 설정
        canvasRef.current!.width = img.width;
        canvasRef.current!.height = img.height;

        ctx?.clearRect(0, 0, img.width, img.height);
        ctx?.drawImage(img, 0, 0, img.width, img.height);
      };

      img.src = `data:image/jpeg;base64,${frameData}`;
    }
  }, [frameData]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'black', // 레터박스 배경색
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', overflow: 'hidden' }} />
    </div>
  );
};

export default VideoComponent;
