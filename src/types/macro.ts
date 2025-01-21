export interface MacroEvent {
  delay: number;
  data: Uint8Array;
}

export interface ComplexReplayConfig {
  filename: string;
  delayAfter: number;
  repeatCount: number;
} 