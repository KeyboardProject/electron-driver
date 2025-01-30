import React, { useState } from 'react';
import ModalComponent from './ModalComponent';
import MacroListComponent from './MacroListComponent';
import ButtonComponent from './ButtonComponent';
import { CubeRerollType } from '../utils/type';
import VideoComponent from './MinimapComponent';
import { EquipmentPotentialOptions, EquipmentType } from 'utils/cubetype';
const { ipcRenderer } = window.require('electron');

interface CubeComponentProps {
  onClose: () => void;
  runCubeReroll: (cubeRerollRequest: CubeRerollType[]) => void;
}

const ComplexReplayComponent: React.FC<CubeComponentProps> = ({ onClose, runCubeReroll }) => {
  const [cubeRerollRequest, setCubeRerollRequest] = useState<CubeRerollType[]>([]);
  const [frameData, setFrameData] = useState<string | null>(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType | ''>('');

  React.useEffect(() => {
    // Electron에서 비디오 프레임 수신
    ipcRenderer.on('stream-cube-video-frame', (_, data) => {
      if (data.frame && data.frame.array && data.frame.array[0]) {
        const uint8Array = new Uint8Array(data.frame.array[0]);
        const base64String = Buffer.from(uint8Array).toString('base64');
        setFrameData(base64String); // frameData 상태 업데이트
      } else {
        console.error('Invalid frame data format');
      }
    });

    // 컴포넌트가 언마운트될 때 이벤트 리스너 정리
    return () => {
      ipcRenderer.removeAllListeners('stream-minimap-video-frame');
    };
  }, []);

  const updateSizeAtIndex = (index: number, size: number) => {
    const updatedTasks = cubeRerollRequest.map((task, idx) =>
      idx === index ? {...task, size} : task
    );
    setCubeRerollRequest(updatedTasks);
  };

  const addRow = () => {
    const newRow = {
      option: { name: '', englishName: '' },
      size: 0
    };
    setCubeRerollRequest([...cubeRerollRequest, newRow]);
  };

  const closeModal = () => {
    // 프레임 받아오기 종료 및 detecting 종료 요청
    onClose();
  }

  const removeRow = (index: number) => {
    const updatedReplayRequest = [...cubeRerollRequest];
    updatedReplayRequest.splice(index, 1);
    setCubeRerollRequest(updatedReplayRequest);
  }

  const updateOptionAtIndex = (index: number, optionName: string) => {
    if (!selectedEquipmentType) return;
    
    const selectedOption = EquipmentPotentialOptions[selectedEquipmentType].find(
      opt => opt.name === optionName
    );
    
    if (!selectedOption) return;

    const updatedTasks = cubeRerollRequest.map((task, idx) =>
      idx === index ? {...task, option: selectedOption} : task
    );
    setCubeRerollRequest(updatedTasks);
  };

  // 사용 가능한 옵션 목록을 필터링하는 함수
  const getAvailableOptions = (index: number) => {
    if (!selectedEquipmentType || !EquipmentPotentialOptions[selectedEquipmentType]) {
      return [];
    }

    // 현재 선택된 모든 옵션들
    const selectedOptions = cubeRerollRequest.map(task => task.option.name);
    
    // 현재 행의 옵션은 제외하고 필터링
    const otherSelectedOptions = selectedOptions.filter((_, idx) => idx !== index);

    // 해당 장비의 모든 옵션 중에서 다른 행에서 선택되지 않은 옵션만 반환
    return EquipmentPotentialOptions[selectedEquipmentType].filter(
      option => !otherSelectedOptions.includes(option.name)
    );
  };

  const getCubeStatus = () => {
    // Electron의 IPC를 통해 비디오 스트림 시작 요청
    ipcRenderer.send('start-cube-video-stream');
  };

  const startCubeReroll = () => {
    // 선택된 옵션이 있는지 확인
    if (cubeRerollRequest.length === 0) {
      alert('큐브 옵션을 선택해주세요.');
      return;
    }

    let isRolling = false;
    let frameCheckTimeout: NodeJS.Timeout | null = null;

    // OCR 결과를 확인하고 원하는 옵션이 있는지 체크하는 함수
    const checkOptions = (frameData: string) => {
      if (frameData) {
        isRolling = false;
        
        // 모든 원하는 옵션이 현재 큐브 결과에 있는지 확인
        const hasAllDesiredOptions = cubeRerollRequest.every(request => {
          // englishName에서 {value} 부분을 실제 숫자와 매칭할 수 있는 정규식으로 변환
          const pattern = request.option.englishName.replace('{value}', '(\\d+)');
          const optionRegex = new RegExp(pattern);
          const match = frameData.match(optionRegex);
          
          if (match) {
            const value = parseInt(match[1], 10);
            return value >= request.size;
          }
          return false;
        });

        if (hasAllDesiredOptions) {
          if (frameCheckTimeout) {
            clearTimeout(frameCheckTimeout);
          }
          alert('원하는 옵션을 얻었습니다!');
          return;
        } else {
          cubeReroll();
        }
      }
    };

    // 프레임 데이터 감시 설정
    const startFrameCheck = () => {
      frameCheckTimeout = setTimeout(() => {
        if (!isRolling && frameData) {
          checkOptions(frameData);
        }
        startFrameCheck(); // 재귀적으로 계속 확인
      }, 100); // 100ms마다 확인
    };

    // 큐브 리롤 실행 함수
    const cubeReroll = () => {
      isRolling = true;

      // 클릭 이벤트 생성 (좌클릭)
      const clickEvent = {
        button: 0,
        type: 'mousedown',
        x: 0,
        y: 0
      };

      // 엔터키 이벤트 생성
      const enterKeyEvent = {
        data: new Uint8Array([0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x00, 0x00])
      };

      // 클릭 후 엔터 3회 전송
      ipcRenderer.send('mouse-event', clickEvent);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          ipcRenderer.send('keyboard-event', enterKeyEvent);
        }, i * 100);
      }
    };

    // 초기 리롤 시작
    startFrameCheck();
    cubeReroll();

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      if (frameCheckTimeout) {
        clearTimeout(frameCheckTimeout);
      }
    };
  };

  return (
    <ModalComponent isOpen={true} errorMessage="">
      <div style={{display: "flex", flexDirection: "row"}}>
        <select 
          onChange={(e) => {
            setSelectedEquipmentType(e.target.value as EquipmentType);
            setCubeRerollRequest([]); // 장비가 변경되면 옵션 목록 초기화
          }} 
          value={selectedEquipmentType}
        >
          <option value="">아이템 선택</option>
          {Object.values(EquipmentType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>큐브 옵션</th>
            <th>수치</th>
          </tr>
        </thead>
        <tbody>
          {cubeRerollRequest.map((task, index) => (
            <tr key={index}>
              <td>
                <select
                  value={task.option.name}
                  onChange={(e) => updateOptionAtIndex(index, e.target.value)}
                  disabled={!selectedEquipmentType}
                >
                  <option value="">옵션 선택</option>
                  {getAvailableOptions(index).map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={task.size}
                  onChange={(e) => updateSizeAtIndex(index, parseInt(e.target.value, 10))}
                />
              </td>
              <td>
                <ButtonComponent text={'열 삭제'} onClick={() => removeRow(index)}></ButtonComponent>
              </td>
            </tr>
          ))}
          <tr>
          <td colSpan={5}>
            <ButtonComponent text={'열 추가'} onClick={addRow} />
          </td>
        </tr>
        </tbody>
      </table>
      <div className="modal-buttons-container">
        <button onClick={closeModal}>창 끄기</button>
        <button onClick={getCubeStatus}>큐브 상태 가져오기</button>
        <button onClick={startCubeReroll}>옵션 리롤 시작</button>
      </div>

      <div style={{ marginTop: '20px' }}>
          <VideoComponent frameData={frameData} />
        </div>
      
    </ModalComponent>
  );
};

export default React.memo(ComplexReplayComponent);
