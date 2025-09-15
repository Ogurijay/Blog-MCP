// 数组工具函数
// 提供数组操作、处理和转换等功能

/**
 * 检查数组是否为空
 */
export function isEmpty<T>(arr: T[]): boolean {
  return !arr || arr.length === 0;
}

/**
 * 检查数组是否包含某个元素
 */
export function includes<T>(arr: T[], item: T): boolean {
  return arr.includes(item);
}

/**
 * 检查数组是否包含所有指定元素
 */
export function includesAll<T>(arr: T[], items: T[]): boolean {
  return items.every(item => arr.includes(item));
}

/**
 * 检查数组是否包含任意指定元素
 */
export function includesAny<T>(arr: T[], items: T[]): boolean {
  return items.some(item => arr.includes(item));
}

/**
 * 获取数组中的第一个元素
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * 获取数组中的最后一个元素
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * 获取数组中的第n个元素
 */
export function nth<T>(arr: T[], index: number): T | undefined {
  return arr[index];
}

/**
 * 获取数组中的前n个元素
 */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

/**
 * 获取数组中的后n个元素
 */
export function takeRight<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

/**
 * 移除数组中的前n个元素
 */
export function drop<T>(arr: T[], n: number): T[] {
  return arr.slice(n);
}

/**
 * 移除数组中的后n个元素
 */
export function dropRight<T>(arr: T[], n: number): T[] {
  return arr.slice(0, -n);
}

/**
 * 获取数组中的唯一元素
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 根据指定键获取数组中的唯一元素
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 移除数组中的假值
 */
export function compact<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter(item => item != null) as NonNullable<T>[];
}

/**
 * 移除数组中的指定元素
 */
export function without<T>(arr: T[], items: T[]): T[] {
  return arr.filter(item => !items.includes(item));
}

/**
 * 交集
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * 并集
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2]);
}

/**
 * 差集
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * 对称差集
 */
export function symmetricDifference<T>(arr1: T[], arr2: T[]): T[] {
  return union(difference(arr1, arr2), difference(arr2, arr1));
}

/**
 * 分组数组
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 根据函数分组数组
 */
export function groupByFn<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = fn(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 键值对转换
 */
export function keyBy<T>(arr: T[], key: keyof T): Record<string, T> {
  return arr.reduce((obj, item) => {
    obj[String(item[key])] = item;
    return obj;
  }, {} as Record<string, T>);
}

/**
 * 排序数组
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * 根据函数排序数组
 */
export function sortByFn<T>(arr: T[], fn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const valueA = fn(a);
    const valueB = fn(b);
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * 随机排序数组
 */
export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 采样数组中的n个元素
 */
export function sample<T>(arr: T[], n: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, n);
}

/**
 * 采样数组中的1个元素
 */
export function sampleOne<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 分块数组
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 拍平数组
 */
export function flatten<T>(arr: T[]): T[] {
  return arr.flat();
}

/**
 * 深度拍平数组
 */
export function flattenDeep<T>(arr: any[]): T[] {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, [] as T[]);
}

/**
 * 分组连续相同元素
 */
export function groupConsecutive<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [];
  
  const groups: T[][] = [];
  let currentGroup: T[] = [arr[0]];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      currentGroup.push(arr[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [arr[i]];
    }
  }
  
  groups.push(currentGroup);
  return groups;
}

/**
 * 滑动窗口
 */
export function slidingWindow<T>(arr: T[], size: number): T[][] {
  const windows: T[][] = [];
  for (let i = 0; i <= arr.length - size; i++) {
    windows.push(arr.slice(i, i + size));
  }
  return windows;
}

/**
 * 数组分页
 */
export function paginate<T>(arr: T[], page: number, pageSize: number): {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const total = arr.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const items = arr.slice(startIndex, endIndex);
  
  return {
    items,
    total,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * 数组分页器
 */
export function paginator<T>(arr: T[], pageSize: number) {
  const total = arr.length;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    getPage: (page: number) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, total);
      const items = arr.slice(startIndex, endIndex);
      
      return {
        items,
        total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    },
    getTotalPages: () => totalPages,
    getTotalItems: () => total,
    getPageSize: () => pageSize,
  };
}

/**
 * 获取数组范围
 */
export function range<T>(arr: T[], start: number, end?: number): T[] {
  return arr.slice(start, end);
}

/**
 * 获取数组中的最小值
 */
export function min<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return Math.min(...arr as any[]);
}

/**
 * 获取数组中的最大值
 */
export function max<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return Math.max(...arr as any[]);
}

/**
 * 获取数组中的最小值（根据键）
 */
export function minBy<T>(arr: T[], key: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((min, item) => item[key] < min[key] ? item : min);
}

/**
 * 获取数组中的最大值（根据键）
 */
export function maxBy<T>(arr: T[], key: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((max, item) => item[key] > max[key] ? item : max);
}

/**
 * 求和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * 平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * 中位数
 */
export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * 众数
 */
export function mode<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  
  const frequency: Record<string, number> = {};
  arr.forEach(item => {
    const key = String(item);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  let maxFreq = 0;
  let mode: T | undefined;
  
  Object.entries(frequency).forEach(([key, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = arr.find(item => String(item) === key);
    }
  });
  
  return mode;
}

/**
 * 标准差
 */
export function standardDeviation(arr: number[]): number {
  if (arr.length === 0) return 0;
  
  const avg = average(arr);
  const variance = average(arr.map(x => Math.pow(x - avg, 2)));
  return Math.sqrt(variance);
}

/**
 * 压缩数组（移除重复元素）
 */
export function compress<T>(arr: T[]): T[] {
  return arr.filter((item, index, self) => self.indexOf(item) === index);
}

/**
 * 压缩数组（移除连续重复元素）
 */
export function compressConsecutive<T>(arr: T[]): T[] {
  if (arr.length === 0) return [];
  
  const compressed: T[] = [arr[0]];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      compressed.push(arr[i]);
    }
  }
  
  return compressed;
}

/**
 * 旋转数组
 */
export function rotate<T>(arr: T[], n: number): T[] {
  const len = arr.length;
  if (len === 0) return [];
  
  const normalizedN = ((n % len) + len) % len;
  return [...arr.slice(normalizedN), ...arr.slice(0, normalizedN)];
}

/**
 * 反转数组
 */
export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

/**
 * 反转数组的一部分
 */
export function reverseRange<T>(arr: T[], start: number, end: number): T[] {
  const copy = [...arr];
  const range = copy.slice(start, end + 1);
  const reversed = range.reverse();
  
  return [
    ...copy.slice(0, start),
    ...reversed,
    ...copy.slice(end + 1)
  ];
}

/**
 * 移动数组元素
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [removed] = copy.splice(from, 1);
  copy.splice(to, 0, removed);
  return copy;
}

/**
 * 交换数组元素
 */
export function swap<T>(arr: T[], i: number, j: number): T[] {
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/**
 * 查找数组中的元素
 */
export function find<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): T | undefined {
  return arr.find(predicate);
}

/**
 * 查找数组中的元素索引
 */
export function findIndex<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): number {
  return arr.findIndex(predicate);
}

/**
 * 查找数组中的最后一个元素
 */
export function findLast<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return arr[i];
    }
  }
  return undefined;
}

/**
 * 查找数组中的最后一个元素索引
 */
export function findLastIndex<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}

/**
 * 过滤数组
 */
export function filter<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): T[] {
  return arr.filter(predicate);
}

/**
 * 映射数组
 */
export function map<T, U>(arr: T[], mapper: (item: T, index: number, arr: T[]) => U): U[] {
  return arr.map(mapper);
}

/**
 * 归约数组
 */
export function reduce<T, U>(arr: T[], reducer: (acc: U, item: T, index: number, arr: T[]) => U, initialValue: U): U {
  return arr.reduce(reducer, initialValue);
}

/**
 * 归约右侧数组
 */
export function reduceRight<T, U>(arr: T[], reducer: (acc: U, item: T, index: number, arr: T[]) => U, initialValue: U): U {
  return arr.reduceRight(reducer, initialValue);
}

/**
 * 检查数组是否满足所有条件
 */
export function every<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * 检查数组是否满足任意条件
 */
export function some<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * 连接数组
 */
export function join<T>(arr: T[], separator: string = ','): string {
  return arr.join(separator);
}

/**
 * 切割数组
 */
export function slice<T>(arr: T[], start?: number, end?: number): T[] {
  return arr.slice(start, end);
}

/**
 * 拼接数组
 */
export function splice<T>(arr: T[], start: number, deleteCount?: number, ...items: T[]): T[] {
  const copy = [...arr];
  copy.splice(start, deleteCount, ...items);
  return copy;
}

/**
 * 填充数组
 */
export function fill<T>(arr: T[], value: T, start?: number, end?: number): T[] {
  return [...arr].fill(value, start, end);
}

/**
 * 复制数组
 */
export function copy<T>(arr: T[]): T[] {
  return [...arr];
}

/**
 * 深度复制数组
 */
export function deepCopy<T>(arr: T[]): T[] {
  return JSON.parse(JSON.stringify(arr));
}

/**
 * 获取数组长度
 */
export function length<T>(arr: T[]): number {
  return arr.length;
}

/**
 * 清空数组
 */
export function clear<T>(arr: T[]): T[] {
  return [];
}

/**
 * 获取数组类型
 */
export function type<T>(arr: T[]): string {
  return Array.isArray(arr) ? 'array' : typeof arr;
}

/**
 * 检查是否为数组
 */
export function isArray<T>(arr: any): arr is T[] {
  return Array.isArray(arr);
}

/**
 * 转换为数组
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * 创建数组
 */
export function create<T>(length: number, fillValue?: T): T[] {
  return new Array(length).fill(fillValue);
}

/**
 * 创建递增数组
 */
export function rangeArray(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * 创建递减数组
 */
export function rangeArrayReverse(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i > end; i -= step) {
    result.push(i);
  }
  return result;
}

/**
 * 创建重复数组
 */
export function repeatArray<T>(value: T, count: number): T[] {
  return new Array(count).fill(value);
}

/**
 * 创建随机数组
 */
export function randomArray<T>(values: T[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(values[Math.floor(Math.random() * values.length)]);
  }
  return result;
}