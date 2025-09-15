// 基础工具函数导出
// 提供各种常用工具函数

// 导出日期时间工具
export * from './date';

// 导出字符串工具
export * from './string';

// 导出数组工具
export * from './array';

// 导出对象工具
export * from './object';

// 导出验证工具
export * from './validation';

// ==================== 常用工具函数 ====================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}

/**
 * 超时函数
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  error: Error = new Error('Operation timed out')
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(error), ms))
  ]);
}

/**
 * 批量处理函数
 */
export async function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * 并行处理函数
 */
export async function parallel<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];
  
  const processBatch = async (batch: { item: T; index: number }[]) => {
    const batchResults = await Promise.all(
      batch.map(({ item, index }) => processor(item, index))
    );
    results.push(...batchResults);
  };
  
  const batches: { item: T; index: number }[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    batches.push(
      items.slice(i, i + concurrency).map((item, index) => ({
        item,
        index: i + index,
      }))
    );
  }
  
  await Promise.all(batches.map(processBatch));
  
  return results;
}

/**
 * 缓存函数
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * 一次性函数
 */
export function once<T extends (...args: any[]) => any>(func: T): T {
  let called = false;
  let result: ReturnType<T>;
  
  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    if (called) {
      return result;
    }
    
    called = true;
    result = func.apply(this, args);
    return result;
  } as T;
}

/**
 * 管道函数
 */
export function pipe<T>(value: T, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * 组合函数
 */
export function compose<T>(...fns: Array<(arg: any) => any>): (arg: T) => any {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

/**
 * 条件函数
 */
export function when<T, R>(
  condition: boolean,
  trueFn: () => R,
  falseFn: () => R
): R {
  return condition ? trueFn() : falseFn();
}

/**
 * 默认值函数
 */
export function defaultValue<T>(value: T | null | undefined, defaultValue: T): T {
  return value !== null && value !== undefined ? value : defaultValue;
}

/**
 * 安全解析JSON
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全字符串化
 */
export function safeJsonStringify(obj: any, indent?: number): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return '{}';
  }
}

/**
 * 格式化字节数
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化数字
 */
export function formatNumber(
  num: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
  }
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'zh-CN',
    style = 'decimal',
    currency = 'CNY'
  } = options || {};
  
  return new Intl.NumberFormat(locale, {
    style,
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

/**
 * 生成随机数
 */
export function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomNumber(min, max));
}

/**
 * 生成随机颜色
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * 深度比较两个对象
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return a === b;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * 获取对象属性值（支持嵌套路径）
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result ?? defaultValue;
}

/**
 * 设置对象属性值（支持嵌套路径）
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * 等待条件满足
 */
export async function waitFor(
  condition: () => boolean,
  options: {
    timeout?: number;
    interval?: number;
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await delay(interval);
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * 创建ID生成器
 */
export function createIdGenerator(prefix: string = ''): () => string {
  let counter = 0;
  
  return () => {
    counter++;
    return `${prefix}${counter}`;
  };
}

/**
 * 创建UUID生成器
 */
export function createUUIDGenerator(): () => string {
  return () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

/**
 * 创建事件发射器
 */
export function createEventEmitter<T extends Record<string, any>>() {
  const listeners: Record<string, Array<(data: any) => void>> = {};
  
  return {
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      if (!listeners[event as string]) {
        listeners[event as string] = [];
      }
      listeners[event as string].push(listener);
    },
    
    off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      if (!listeners[event as string]) return;
      const index = listeners[event as string].indexOf(listener);
      if (index > -1) {
        listeners[event as string].splice(index, 1);
      }
    },
    
    emit<K extends keyof T>(event: K, data: T[K]) {
      if (!listeners[event as string]) return;
      listeners[event as string].forEach(listener => listener(data));
    },
    
    once<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      const onceListener = (data: T[K]) => {
        listener(data);
        this.off(event, onceListener);
      };
      this.on(event, onceListener);
    },
  };
}

/**
 * 创建简单的状态管理器
 */
export function createSimpleState<T>(initialState: T) {
  let state = deepClone(initialState);
  const listeners: Array<(newState: T, oldState: T) => void> = [];
  
  return {
    getState: () => state,
    
    setState: (updater: (state: T) => Partial<T>) => {
      const oldState = state;
      const updates = updater(state);
      state = { ...state, ...updates };
      
      listeners.forEach(listener => listener(state, oldState));
    },
    
    subscribe: (listener: (newState: T, oldState: T) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    
    reset: () => {
      const oldState = state;
      state = deepClone(initialState);
      listeners.forEach(listener => listener(state, oldState));
    },
  };
}

/**
 * 性能监控
 */
export function createPerformanceMonitor() {
  const measurements: Record<string, number> = {};
  
  return {
    start: (name: string) => {
      measurements[name] = performance.now();
    },
    
    end: (name: string) => {
      const start = measurements[name];
      if (start) {
        const duration = performance.now() - start;
        delete measurements[name];
        return duration;
      }
      return 0;
    },
    
    measure: async <T>(name: string, fn: () => Promise<T>) => {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      return result;
    },
  };
}

/**
 * 简单的日志工具
 */
export function createLogger(prefix: string = '') {
  return {
    log: (...args: any[]) => console.log(`[${prefix}]`, ...args),
    error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args),
    info: (...args: any[]) => console.info(`[${prefix}]`, ...args),
    debug: (...args: any[]) => console.debug(`[${prefix}]`, ...args),
  };
}