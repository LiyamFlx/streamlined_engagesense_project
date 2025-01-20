export class ErrorRecoveryManager {
  private maxRetries: number;
  private retryDelay: number;
  private retryCount: Map<string, number>;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.retryCount = new Map();
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    onError?: (error: Error, attempt: number) => void
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const currentRetries = this.retryCount.get(operationId) || 0;
      
      if (currentRetries < this.maxRetries) {
        this.retryCount.set(operationId, currentRetries + 1);
        
        onError?.(error as Error, currentRetries + 1);
        
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, currentRetries))
        );
        
        return this.executeWithRetry(operation, operationId, onError);
      }
      
      this.retryCount.delete(operationId);
      throw error;
    }
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationId: string
  ): Promise<T> {
    try {
      return await this.executeWithRetry(primaryOperation, operationId);
    } catch (error) {
      console.warn(`Primary operation failed, using fallback for ${operationId}:`, error);
      return fallbackOperation();
    }
  }

  resetRetryCount(operationId: string): void {
    this.retryCount.delete(operationId);
  }

  getRetryCount(operationId: string): number {
    return this.retryCount.get(operationId) || 0;
  }
}