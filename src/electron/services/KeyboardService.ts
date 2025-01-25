import { ClientWritableStream } from '@grpc/grpc-js';
import GrpcClient from '../../utils/grpc';
import { KeyboardEvent } from '../../../generated/input_service';

export default class KeyboardService {
  private keyboardCall: ClientWritableStream<KeyboardEvent> | null = null;
  private lastHidReport: Uint8Array | null = null;

  constructor() {
    this.initializeKeyboardStream();
  }

  private initializeKeyboardStream(): void {
    if (!this.keyboardCall) {
      this.keyboardCall = GrpcClient.MacroGrpcClient.sendRemoteKeyEvents();
    }
  }

  handleKeyboardEvent(keyboardEventData: any): void {
    if (this.keyboardCall) {
      const request: KeyboardEvent = new KeyboardEvent(keyboardEventData);
      this.keyboardCall.write(request);
    } else {
      console.warn('keyboardCall is not initialized');
    }
  }

  generateHIDReport(input: Electron.Input): Uint8Array {
    const { code, control, shift, alt, meta, type } = input;
    const isKeyDown = type === 'keyDown';
    const modifier = (control ? 0x01 : 0) | (shift ? 0x02 : 0) | (alt ? 0x04 : 0) | (meta ? 0x08 : 0);
    const hidKeyCode = this.mapKeyCodeToHIDKeyCode(code);

    if (isKeyDown) {
      return new Uint8Array([modifier, 0x00, hidKeyCode, 0x00, 0x00, 0x00, 0x00, 0x00]);
    } else {
      return new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    }
  }

  private mapKeyCodeToHIDKeyCode(code: string): number {
    const HID_KEY_CODES: { [key: string]: number } = {
      'KeyA': 0x04, 'KeyB': 0x05, 'KeyC': 0x06, 'KeyD': 0x07,
      'KeyE': 0x08, 'KeyF': 0x09, 'KeyG': 0x0A, 'KeyH': 0x0B,
      'KeyI': 0x0C, 'KeyJ': 0x0D, 'KeyK': 0x0E, 'KeyL': 0x0F,
      'KeyM': 0x10, 'KeyN': 0x11, 'KeyO': 0x12, 'KeyP': 0x13,
      'KeyQ': 0x14, 'KeyR': 0x15, 'KeyS': 0x16, 'KeyT': 0x17,
      'KeyU': 0x18, 'KeyV': 0x19, 'KeyW': 0x1A, 'KeyX': 0x1B,
      'KeyY': 0x1C, 'KeyZ': 0x1D,
      // ... 나머지 키 코드들
    };
    return HID_KEY_CODES[code] || 0x00;
  }
} 