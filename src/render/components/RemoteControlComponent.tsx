import React, { useEffect, useRef, useState } from 'react';
import VideoComponent from './VideoComponent';

const { ipcRenderer } = window.require('electron');

interface RemoteControlComponentProps {
  frameData: string | null; // base64 인코딩된 프레임 데이터
  remoteCursorPosition: { x: number; y: number } | null; // 원격 커서 위치
}

const RemoteControlComponent: React.FC<RemoteControlComponentProps> = ({
  frameData,
  remoteCursorPosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 컨테이너의 크기를 추적하기 위한 상태
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    const handleFocusChange = (_: any, focused: boolean) => {
      setIsFocused(focused);
    };

    updateContainerSize(); // 초기 크기 설정
    window.addEventListener('resize', updateContainerSize);

    ipcRenderer.send('start-remote-control');
    ipcRenderer.on('focus-status-changed', handleFocusChange);

    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  // 좌표 매핑 함수 (절대 좌표로 변환)
  const mapAbsoluteCoordinates = (x: number, y: number) => {
    const absoluteX = Math.round((x / containerSize.width) * 32767); // 0~32767 범위로 변환
    const absoluteY = Math.round((y / containerSize.height) * 32767); // 0~32767 범위로 변환
    return { absoluteX, absoluteY };
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (event: React.MouseEvent) => {
    console.log(isFocused);
    if (!isFocused) return;
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    const { absoluteX, absoluteY } = mapAbsoluteCoordinates(
      event.clientX - (rect?.left || 0),
      event.clientY - (rect?.top || 0)
    );
    const button = event.button;

    const mouseEventData = {
      absoluteX,
      absoluteY,
      wheelDelta: 0, // 휠 동작 없음
      leftButton: button === 0,
      rightButton: button === 2,
      middleButton: button === 1,
    };
    ipcRenderer.send('mouse-event', mouseEventData);
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isFocused) return;
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    const { absoluteX, absoluteY } = mapAbsoluteCoordinates(
      event.clientX - (rect?.left || 0),
      event.clientY - (rect?.top || 0)
    );

    const mouseEventData = {
      absoluteX,
      absoluteY,
      wheelDelta: 0, // 휠 동작 없음
      leftButton: false,
      rightButton: false,
      middleButton: false,
    };
    ipcRenderer.send('mouse-event', mouseEventData);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isFocused) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const { absoluteX, absoluteY } = mapAbsoluteCoordinates(
      event.clientX - (rect?.left || 0),
      event.clientY - (rect?.top || 0)
    );

    const mouseEventData = {
      absoluteX,
      absoluteY,
      wheelDelta: 0, // 휠 동작 없음
      leftButton: (event.buttons & 1) === 1,
      rightButton: (event.buttons & 2) === 2,
      middleButton: (event.buttons & 4) === 4,
    };
    ipcRenderer.send('mouse-event', mouseEventData);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!isFocused) return;
    event.preventDefault();
  
    const rect = containerRef.current?.getBoundingClientRect();
    const { absoluteX, absoluteY } = mapAbsoluteCoordinates(
      event.clientX - (rect?.left || 0),
      event.clientY - (rect?.top || 0)
    );
  
    // 휠 속도 조절: 10으로 나누어 속도를 줄임
    const scaledDeltaY = Math.round(event.deltaY / 100);
  
    // 최소/최대값 제한: 너무 빠른 움직임 방지
    const clampedDeltaY = -Math.max(-100, Math.min(100, scaledDeltaY));
  
    const mouseEventData = {
      absoluteX,
      absoluteY,
      wheelDelta: clampedDeltaY, // 조정된 휠 값
      leftButton: false,
      rightButton: false,
      middleButton: false,
    };
    ipcRenderer.send('mouse-event', mouseEventData);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // 우클릭 메뉴 방지
  };

  const handleContainerClick = () => {
    containerRef.current?.focus();
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 포커스 설정
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', outline: 'none', cursor: 'none', position: 'relative' }}
      tabIndex={0}
      onClick={handleContainerClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      <VideoComponent frameData={frameData} />
      {remoteCursorPosition && (
        <img
          src="path_to_cursor_image.png"
          alt="Remote Cursor"
          style={{
            position: 'absolute',
            left: `${remoteCursorPosition.x * 100}%`,
            top: `${remoteCursorPosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default RemoteControlComponent;
