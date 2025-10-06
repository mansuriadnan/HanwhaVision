export class LoadingManager {
  private static listeners: ((isLoading: boolean) => void)[] = [];
  private static loadingCount = 0;

  static subscribe(callback: (isLoading: boolean) => void) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify() {
    const isLoading = this.loadingCount > 0;
    this.listeners.forEach((listener) => listener(isLoading));
  }

  static showLoading() {
    this.loadingCount++;
    this.notify();
  }

  static hideLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1); // Prevent negative
    this.notify();
  }

  static reset() {
    this.loadingCount = 0;
    this.notify();
  }
}
