// 对象工具函数
// 提供对象操作、处理和转换等功能

/**
 * 检查对象是否为空
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 深度检查对象是否为空
 */
export function isDeepEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!isDeepEmpty(obj[key])) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 获取对象的键
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * 获取对象的值
 */
export function values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj);
}

/**
 * 获取对象的键值对
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * 检查对象是否包含指定键
 */
export function hasKey<T extends object>(obj: T, key: string | number | symbol): key is keyof T {
  return key in obj;
}

/**
 * 检查对象是否包含指定值
 */
export function hasValue<T extends object>(obj: T, value: T[keyof T]): boolean {
  return Object.values(obj).includes(value);
}

/**
 * 获取对象中的指定键值
 */
export function get<T extends object, K extends keyof T>(obj: T, key: K, defaultValue?: T[K]): T[K] {
  return obj[key] ?? defaultValue;
}

/**
 * 安全获取嵌套对象属性
 */
export function getNested<T extends object, K extends string>(
  obj: T,
  path: K,
  defaultValue?: any
): any {
  const keys = path.split('.');
  let result: any = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result ?? defaultValue;
}

/**
 * 设置对象中的指定键值
 */
export function set<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

/**
 * 安全设置嵌套对象属性
 */
export function setNested<T extends object, K extends string>(
  obj: T,
  path: K,
  value: any
): T {
  const keys = path.split('.');
  const result = { ...obj };
  let current: any = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === null || current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * 删除对象中的指定键
 */
export function remove<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const { [key]: _, ...rest } = obj;
  return rest;
}

/**
 * 安全删除嵌套对象属性
 */
export function removeNested<T extends object, K extends string>(
  obj: T,
  path: K
): T {
  const keys = path.split('.');
  if (keys.length === 1) {
    return remove(obj, keys[0] as keyof T);
  }
  
  const result = { ...obj };
  let current: any = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === null || current[key] === undefined) {
      return obj;
    }
    current = current[key];
  }
  
  if (typeof current === 'object' && current !== null) {
    delete current[keys[keys.length - 1]];
  }
  
  return result;
}

/**
 * 合并对象
 */
export function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  const result = { ...obj1 } as any;
  
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      const value1 = result[key];
      const value2 = obj2[key as keyof U];
      
      if (typeof value1 === 'object' && typeof value2 === 'object' && 
          value1 !== null && value2 !== null) {
        result[key] = deepMerge(value1, value2);
      } else {
        result[key] = value2;
      }
    }
  }
  
  return result;
}

/**
 * 挑选对象的指定键
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * 排除对象的指定键
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result as Omit<T, K>;
}

/**
 * 反转对象的键值对
 */
export function invert<T extends Record<string, any>>(obj: T): Record<string, keyof T> {
  const result: Record<string, keyof T> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[String(obj[key])] = key;
    }
  }
  
  return result;
}

/**
 * 过滤对象
 */
export function filter<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (predicate(value, key)) {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * 映射对象
 */
export function map<T extends object, U>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = mapper(obj[key], key);
    }
  }
  
  return result;
}

/**
 * 归约对象
 */
export function reduce<T extends object, U>(
  obj: T,
  reducer: (acc: U, value: T[keyof T], key: keyof T) => U,
  initialValue: U
): U {
  let result = initialValue;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result = reducer(result, obj[key], key);
    }
  }
  
  return result;
}

/**
 * 查找对象中的指定值
 */
export function find<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): { key: keyof T; value: T[keyof T] } | undefined {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (predicate(value, key)) {
        return { key, value };
      }
    }
  }
  return undefined;
}

/**
 * 查找对象中的指定键
 */
export function findKey<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): keyof T | undefined {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (predicate(value, key)) {
        return key;
      }
    }
  }
  return undefined;
}

/**
 * 检查对象是否满足所有条件
 */
export function every<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): boolean {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (!predicate(value, key)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 检查对象是否满足任意条件
 */
export function some<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): boolean {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (predicate(value, key)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 复制对象
 */
export function copy<T extends object>(obj: T): T {
  return { ...obj };
}

/**
 * 深度复制对象
 */
export function deepCopy<T extends object>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepCopy(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const copied = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copied[key] = deepCopy(obj[key]);
      }
    }
    return copied;
  }
  
  return obj;
}

/**
 * 冻结对象
 */
export function freeze<T extends object>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

/**
 * 深度冻结对象
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  const propNames = Object.getOwnPropertyNames(obj);
  
  for (const name of propNames) {
    const value = obj[name as keyof T];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  
  return Object.freeze(obj);
}

/**
 * 密封对象
 */
export function seal<T extends object>(obj: T): T {
  return Object.seal(obj);
}

/**
 * 深度密封对象
 */
export function deepSeal<T extends object>(obj: T): T {
  const propNames = Object.getOwnPropertyNames(obj);
  
  for (const name of propNames) {
    const value = obj[name as keyof T];
    if (value && typeof value === 'object') {
      deepSeal(value);
    }
  }
  
  return Object.seal(obj);
}

/**
 * 防止扩展对象
 */
export function preventExtensions<T extends object>(obj: T): T {
  return Object.preventExtensions(obj);
}

/**
 * 获取对象属性描述符
 */
export function getDescriptor<T extends object, K extends keyof T>(
  obj: T,
  key: K
): PropertyDescriptor | undefined {
  return Object.getOwnPropertyDescriptor(obj, key);
}

/**
 * 定义对象属性
 */
export function defineProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  descriptor: PropertyDescriptor
): T {
  Object.defineProperty(obj, key, descriptor);
  return obj;
}

/**
 * 定义多个对象属性
 */
export function defineProperties<T extends object>(
  obj: T,
  descriptors: PropertyDescriptors<T>
): T {
  Object.defineProperties(obj, descriptors);
  return obj;
}

/**
 * 获取对象原型
 */
export function getPrototypeOf<T extends object>(obj: T): object {
  return Object.getPrototypeOf(obj);
}

/**
 * 设置对象原型
 */
export function setPrototypeOf<T extends object, U extends object>(obj: T, prototype: U): T & U {
  return Object.setPrototypeOf(obj, prototype) as T & U;
}

/**
 * 创建对象
 */
export function create<T extends object>(prototype: object, properties?: PropertyDescriptors<T>): T {
  return Object.create(prototype, properties) as T;
}

/**
 * 获取对象属性名称
 */
export function getPropertyNames<T extends object>(obj: T): (string | symbol)[] {
  return Object.getOwnPropertyNames(obj);
}

/**
 * 获取对象符号属性
 */
export function getOwnPropertySymbols<T extends object>(obj: T): symbol[] {
  return Object.getOwnPropertySymbols(obj);
}

/**
 * 获取对象所有属性
 */
export function getAllKeys<T extends object>(obj: T): (string | symbol)[] {
  return [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ];
}

/**
 * 检查对象是否可扩展
 */
export function isExtensible<T extends object>(obj: T): boolean {
  return Object.isExtensible(obj);
}

/**
 * 检查对象是否已密封
 */
export function isSealed<T extends object>(obj: T): boolean {
  return Object.isSealed(obj);
}

/**
 * 检查对象是否已冻结
 */
export function isFrozen<T extends object>(obj: T): boolean {
  return Object.isFrozen(obj);
}

/**
 * 比较两个对象是否相等
 */
export function isEqual<T extends object>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * 深度比较两个对象是否相等
 */
export function isDeepEqual<T extends object>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    
    const value1 = obj1[key as keyof T];
    const value2 = obj2[key as keyof T];
    
    if (typeof value1 === 'object' && typeof value2 === 'object') {
      if (!isDeepEqual(value1, value2)) {
        return false;
      }
    } else {
      if (value1 !== value2) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 获取对象类型
 */
export function type<T extends object>(obj: T): string {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * 检查是否为普通对象
 */
export function isPlainObject<T extends object>(obj: T): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

/**
 * 检查是否为类数组对象
 */
export function isArrayLike<T extends object>(obj: T): boolean {
  return obj !== null && typeof obj === 'object' && 'length' in obj;
}

/**
 * 转换为数组
 */
export function toArray<T extends object>(obj: T): any[] {
  return Object.values(obj);
}

/**
 * 转换为Map
 */
export function toMap<T extends object>(obj: T): Map<keyof T, T[keyof T]> {
  return new Map(Object.entries(obj));
}

/**
 * 从Map创建对象
 */
export function fromMap<K extends string | number | symbol, V>(map: Map<K, V>): Record<K, V> {
  const result = {} as Record<K, V>;
  
  for (const [key, value] of map) {
    result[key] = value;
  }
  
  return result;
}

/**
 * 转换为FormData
 */
export function toFormData<T extends object>(obj: T): FormData {
  const formData = new FormData();
  
  for (const [key, value] of Object.entries(obj)) {
    formData.append(key, String(value));
  }
  
  return formData;
}

/**
 * 从FormData创建对象
 */
export function fromFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of formData.entries()) {
    result[key] = String(value);
  }
  
  return result;
}

/**
 * 转换为URL参数
 */
export function toUrlParams<T extends object>(obj: T): string {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(obj)) {
    params.append(key, String(value));
  }
  
  return params.toString();
}

/**
 * 从URL参数创建对象
 */
export function fromUrlParams(urlParams: string): Record<string, string> {
  const result: Record<string, string> = {};
  const params = new URLSearchParams(urlParams);
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

/**
 * 遍历对象
 */
export function forEach<T extends object>(
  obj: T,
  callback: (value: T[keyof T], key: keyof T, obj: T) => void
): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      callback(obj[key], key, obj);
    }
  }
}

/**
 * 排序对象键
 */
export function sortKeys<T extends object>(obj: T): T {
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  
  for (const key of sortedKeys) {
    result[key] = obj[key as keyof T];
  }
  
  return result;
}

/**
 * 计数对象属性
 */
export function count<T extends object>(obj: T): number {
  return Object.keys(obj).length;
}

/**
 * 清空对象
 */
export function clear<T extends object>(obj: T): T {
  const result = {} as T;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      delete result[key];
    }
  }
  
  return result;
}

/**
 * 重命名对象键
 */
export function renameKeys<T extends object, K extends string>(
  obj: T,
  keyMap: Record<keyof T, K>
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = keyMap[key];
      if (newKey) {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

/**
 * 重映射对象键
 */
export function remapKeys<T extends object, K extends string>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => K
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = mapper(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * 扁平化对象
 */
export function flatten<T extends object>(obj: T, separator: string = '.'): Record<string, any> {
  const result: Record<string, any> = {};
  
  function recurse(current: any, path: string = '') {
    if (typeof current === 'object' && current !== null) {
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          const newPath = path ? `${path}${separator}${key}` : key;
          recurse(current[key], newPath);
        }
      }
    } else {
      result[path] = current;
    }
  }
  
  recurse(obj);
  return result;
}

/**
 * 解析扁平化对象
 */
export function unflatten<T extends object>(
  flatObj: Record<string, any>,
  separator: string = '.'
): T {
  const result: any = {};
  
  for (const path in flatObj) {
    if (flatObj.hasOwnProperty(path)) {
      const keys = path.split(separator);
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = flatObj[path];
    }
  }
  
  return result;
}

// 类型定义
interface PropertyDescriptors<T> {
  [P in keyof T]?: PropertyDescriptor;
}