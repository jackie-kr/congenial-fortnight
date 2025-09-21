export class FallbackStorage {
  private storageMethod: 'localStorage' | 'memory' | 'none' = 'none';
  private memoryStore: { [key: string]: string } = {};
  
  constructor() {
    // Detect available storage method
    if (typeof localStorage !== 'undefined') {
      this.storageMethod = 'localStorage';
    } else {
      this.storageMethod = 'memory';
    }
  }
  
  async getItem(key: string): Promise<string | null> {
    try {
      switch (this.storageMethod) {
        case 'localStorage':
          return localStorage.getItem(key);
        case 'memory':
          return this.memoryStore[key] || null;
        default:
          return null;
      }
    } catch (error) {
      console.log('Storage error:', error);
      return null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      switch (this.storageMethod) {
        case 'localStorage':
          localStorage.setItem(key, value);
          break;
        case 'memory':
          this.memoryStore[key] = value;
          break;
      }
    } catch (error) {
      console.log('Storage error:', error);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      switch (this.storageMethod) {
        case 'localStorage':
          localStorage.removeItem(key);
          break;
        case 'memory':
          delete this.memoryStore[key];
          break;
      }
    } catch (error) {
      console.log('Storage error:', error);
    }
  }
}

export const storage = new FallbackStorage();