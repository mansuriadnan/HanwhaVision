// src/utils/LoadingManager.ts
export class LoadingManager {
  private static listeners: ((isLoading: boolean) => void)[] = [];

  static subscribe(callback: (isLoading: boolean) => void) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  static showLoading() {
    this.listeners.forEach((listener) => listener(true));
  }

  static hideLoading() {
    this.listeners.forEach((listener) => listener(false));
  }
}
