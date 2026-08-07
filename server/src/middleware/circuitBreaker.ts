import { logWarn, logInfo } from '../utils/logger';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  name: string;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly options: CircuitOptions;

  constructor(options: CircuitOptions) {
    this.options = options;
  }

  async call<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.timeout) {
        this.state = 'HALF_OPEN';
        logInfo('circuit-breaker', `${this.options.name} → HALF_OPEN`);
      } else {
        logWarn('circuit-breaker', `${this.options.name} → OPEN, usando fallback`);
        return fallback();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure();
      logWarn('circuit-breaker', `${this.options.name} → fallo: ${err.message}`);
      return fallback();
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        this.failureCount = 0;
        logInfo('circuit-breaker', `${this.options.name} → CLOSED (recuperado)`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      logWarn('circuit-breaker', `${this.options.name} → OPEN`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

export const redisCircuitBreaker = new CircuitBreaker({
  name: 'redis',
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000,
});
