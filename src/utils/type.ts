import { PotentialOption } from './cubetype';

export interface KeyEvent {
  delay: number;
  data: Uint8Array;   // HID 리포트 데이터
}

export interface ComplexReplayType{
  filename: string;
  delayAfter: number;
  repeatCount: number;
}

export interface CubeRerollType {
  option: PotentialOption;  // 옵션 전체 객체를 저장
  size: number;            // 원하는 수치
}
