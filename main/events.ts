import { EventEmitter } from "events";
import type { SummarizeProgress } from "./services/SummarizationService";

interface AppEvents {
  uploadProgress: [progress: SummarizeProgress];
}

class TypedEventEmitter {
  private emitter = new EventEmitter();

  emit<K extends keyof AppEvents>(event: K, ...args: AppEvents[K]): void {
    this.emitter.emit(event, ...args);
  }

  on<K extends keyof AppEvents>(event: K, listener: (...args: AppEvents[K]) => void): void {
    this.emitter.on(event, listener);
  }

  off<K extends keyof AppEvents>(event: K, listener: (...args: AppEvents[K]) => void): void {
    this.emitter.off(event, listener);
  }
}

export const appEvents = new TypedEventEmitter();
