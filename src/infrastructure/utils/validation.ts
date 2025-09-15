// 验证工具函数
// 提供各种数据验证功能

// ==================== 基础类型验证 ====================

/**
 * 检查值是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查值是否为整数
 */
export function isInteger(value: any): value is number {
  return Number.isInteger(value);
}

/**
 * 检查值是否为浮点数
 */
export function isFloat(value: any): value is number {
  return isNumber(value) && !isInteger(value);
}

/**
 * 检查值是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为数组
 */
export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * 检查值是否为对象
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 检查值是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 检查值是否为Date对象
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查值是否为Promise
 */
export function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function';
}

/**
 * 检查值是否为正则表达式
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp;
}

/**
 * 检查值是否为错误对象
 */
export function isError(value: any): value is Error {
  return value instanceof Error;
}

// ==================== 数字验证 ====================

/**
 * 检查数字是否在指定范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 检查数字是否为正数
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * 检查数字是否为负数
 */
export function isNegative(value: number): boolean {
  return value < 0;
}

/**
 * 检查数字是否为0
 */
export function isZero(value: number): boolean {
  return value === 0;
}

/**
 * 检查数字是否为偶数
 */
export function isEven(value: number): boolean {
  return value % 2 === 0;
}

/**
 * 检查数字是否为奇数
 */
export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

/**
 * 检查数字是否为质数
 */
export function isPrime(value: number): boolean {
  if (value <= 1) return false;
  if (value <= 3) return true;
  if (value % 2 === 0 || value % 3 === 0) return false;
  
  for (let i = 5; i * i <= value; i += 6) {
    if (value % i === 0 || value % (i + 2) === 0) return false;
  }
  
  return true;
}

// ==================== 字符串验证 ====================

/**
 * 检查字符串是否符合邮箱格式
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 检查字符串是否符合URL格式
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查字符串是否符合手机号格式（中国）
 */
export function isPhoneNumber(value: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value);
}

/**
 * 检查字符串是否符合身份证号格式（中国）
 */
export function isIdCard(value: string): boolean {
  const idCardRegex = /^\d{17}[\dXx]$/;
  if (!idCardRegex.test(value)) return false;
  
  // 简单的校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(value[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return value[17].toUpperCase() === checkCode;
}

/**
 * 检查字符串是否符合密码强度要求
 */
export function isStrongPassword(value: string): boolean {
  // 至少8位，包含大小写字母、数字和特殊字符
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
}

/**
 * 检查字符串是否为中文字符
 */
export function isChinese(value: string): boolean {
  const chineseRegex = /^[\u4e00-\u9fa5]+$/;
  return chineseRegex.test(value);
}

/**
 * 检查字符串是否为英文字符
 */
export function isEnglish(value: string): boolean {
  const englishRegex = /^[a-zA-Z]+$/;
  return englishRegex.test(value);
}

/**
 * 检查字符串是否为字母数字组合
 */
export function isAlphanumeric(value: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(value);
}

/**
 * 检查字符串是否为十六进制颜色值
 */
export function isHexColor(value: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(value);
}

/**
 * 检查字符串是否为IP地址
 */
export function isIpAddress(value: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(value);
}

/**
 * 检查字符串是否为MAC地址
 */
export function isMacAddress(value: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(value);
}

/**
 * 检查字符串是否为Base64编码
 */
export function isBase64(value: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(value);
}

/**
 * 检查字符串是否为JSON格式
 */
export function isJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查字符串是否为UUID格式
 */
export function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * 检查字符串是否符合用户名格式
 */
export function isUsername(value: string): boolean {
  // 3-20位，字母开头，允许字母、数字、下划线
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(value);
}

/**
 * 检查字符串长度是否在指定范围内
 */
export function isLength(value: string, min: number, max?: number): boolean {
  const length = value.length;
  if (max !== undefined) {
    return length >= min && length <= max;
  }
  return length >= min;
}

// ==================== 数组验证 ====================

/**
 * 检查数组是否包含特定元素
 */
export function contains<T>(array: T[], element: T): boolean {
  return array.includes(element);
}

/**
 * 检查数组是否包含所有指定元素
 */
export function containsAll<T>(array: T[], elements: T[]): boolean {
  return elements.every(element => array.includes(element));
}

/**
 * 检查数组是否包含任意指定元素
 */
export function containsAny<T>(array: T[], elements: T[]): boolean {
  return elements.some(element => array.includes(element));
}

/**
 * 检查数组是否唯一
 */
export function isUnique<T>(array: T[]): boolean {
  return array.length === new Set(array).size;
}

/**
 * 检查数组是否有序（升序）
 */
export function isSorted<T>(array: T[]): boolean {
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] > array[i + 1]) return false;
  }
  return true;
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * 检查数组长度是否在指定范围内
 */
export function isArrayLength<T>(array: T[], min: number, max?: number): boolean {
  const length = array.length;
  if (max !== undefined) {
    return length >= min && length <= max;
  }
  return length >= min;
}

// ==================== 对象验证 ====================

/**
 * 检查对象是否为空
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 检查对象是否包含指定键
 */
export function hasKey<T extends object>(obj: T, key: string | number | symbol): boolean {
  return key in obj;
}

/**
 * 检查对象是否包含所有指定键
 */
export function hasKeys<T extends object>(obj: T, keys: (string | number | symbol)[]): boolean {
  return keys.every(key => key in obj);
}

/**
 * 检查对象是否包含任意指定键
 */
export function hasAnyKey<T extends object>(obj: T, keys: (string | number | symbol)[]): boolean {
  return keys.some(key => key in obj);
}

/**
 * 检查对象是否为普通对象
 */
export function isPlainObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

// ==================== 日期验证 ====================

/**
 * 检查日期是否为今天
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * 检查日期是否为昨天
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * 检查日期是否为明天
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

/**
 * 检查日期是否为工作日
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * 检查日期是否为周末
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 检查日期是否在未来
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * 检查日期是否在过去
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * 检查日期是否在指定范围内
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * 检查日期是否为闰年
 */
export function isLeapYear(date: Date): boolean {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// ==================== 文件验证 ====================

/**
 * 检查文件扩展名
 */
export function isFileExtension(filename: string, extensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? extensions.includes(extension) : false;
}

/**
 * 检查文件类型
 */
export function isFileType(file: File, types: string[]): boolean {
  return types.includes(file.type);
}

/**
 * 检查文件大小
 */
export function isFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * 检查文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 检查文件是否为视频
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * 检查文件是否为音频
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

/**
 * 检查文件是否为PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * 检查文件是否为Word文档
 */
export function isWordFile(file: File): boolean {
  return file.type.includes('word') || file.type.includes('document');
}

/**
 * 检查文件是否为Excel文档
 */
export function isExcelFile(file: File): boolean {
  return file.type.includes('excel') || file.type.includes('sheet');
}

/**
 * 检查文件是否为PowerPoint文档
 */
export function isPowerPointFile(file: File): boolean {
  return file.type.includes('powerpoint') || file.type.includes('presentation');
}

/**
 * 检查文件是否为文本文件
 */
export function isTextFile(file: File): boolean {
  return file.type.startsWith('text/');
}

/**
 * 检查文件是否为压缩文件
 */
export function isArchiveFile(file: File): boolean {
  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/x-7z-compressed',
    'application/x-gzip',
  ];
  return archiveTypes.includes(file.type);
}

// ==================== 验证器类 ====================

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * 验证器类
 */
export class Validator {
  private errors: ValidationError[] = [];

  /**
   * 添加错误
   */
  private addError(field: string, message: string, value?: any): void {
    this.errors.push({ field, message, value });
  }

  /**
   * 验证必填字段
   */
  required(field: string, value: any, message?: string): this {
    if (isEmpty(value)) {
      this.addError(field, message || `${field} is required`, value);
    }
    return this;
  }

  /**
   * 验证邮箱
   */
  email(field: string, value: any, message?: string): this {
    if (!isEmpty(value) && !isEmail(value)) {
      this.addError(field, message || `${field} must be a valid email`, value);
    }
    return this;
  }

  /**
   * 验证URL
   */
  url(field: string, value: any, message?: string): this {
    if (!isEmpty(value) && !isUrl(value)) {
      this.addError(field, message || `${field} must be a valid URL`, value);
    }
    return this;
  }

  /**
   * 验证手机号
   */
  phone(field: string, value: any, message?: string): this {
    if (!isEmpty(value) && !isPhoneNumber(value)) {
      this.addError(field, message || `${field} must be a valid phone number`, value);
    }
    return this;
  }

  /**
   * 验证最小长度
   */
  minLength(field: string, value: any, min: number, message?: string): this {
    if (!isEmpty(value) && isString(value) && value.length < min) {
      this.addError(
        field, 
        message || `${field} must be at least ${min} characters`, 
        value
      );
    }
    return this;
  }

  /**
   * 验证最大长度
   */
  maxLength(field: string, value: any, max: number, message?: string): this {
    if (!isEmpty(value) && isString(value) && value.length > max) {
      this.addError(
        field, 
        message || `${field} must be at most ${max} characters`, 
        value
      );
    }
    return this;
  }

  /**
   * 验证长度范围
   */
  lengthBetween(field: string, value: any, min: number, max: number, message?: string): this {
    if (!isEmpty(value) && isString(value)) {
      const length = value.length;
      if (length < min || length > max) {
        this.addError(
          field, 
          message || `${field} must be between ${min} and ${max} characters`, 
          value
        );
      }
    }
    return this;
  }

  /**
   * 验证最小值
   */
  min(field: string, value: any, min: number, message?: string): this {
    if (!isEmpty(value) && isNumber(value) && value < min) {
      this.addError(field, message || `${field} must be at least ${min}`, value);
    }
    return this;
  }

  /**
   * 验证最大值
   */
  max(field: string, value: any, max: number, message?: string): this {
    if (!isEmpty(value) && isNumber(value) && value > max) {
      this.addError(field, message || `${field} must be at most ${max}`, value);
    }
    return this;
  }

  /**
   * 验证数值范围
   */
  between(field: string, value: any, min: number, max: number, message?: string): this {
    if (!isEmpty(value) && isNumber(value) && (value < min || value > max)) {
      this.addError(field, message || `${field} must be between ${min} and ${max}`, value);
    }
    return this;
  }

  /**
   * 验证密码强度
   */
  strongPassword(field: string, value: any, message?: string): this {
    if (!isEmpty(value) && !isStrongPassword(value)) {
      this.addError(
        field, 
        message || `${field} must be a strong password (at least 8 characters with uppercase, lowercase, number, and special character)`, 
        value
      );
    }
    return this;
  }

  /**
   * 验证确认字段
   */
  matches(field: string, value: any, target: any, targetField: string, message?: string): this {
    if (!isEmpty(value) && value !== target) {
      this.addError(
        field, 
        message || `${field} must match ${targetField}`, 
        value
      );
    }
    return this;
  }

  /**
   * 自定义验证
   */
  custom(field: string, value: any, validator: (value: any) => boolean, message: string): this {
    if (!isEmpty(value) && !validator(value)) {
      this.addError(field, message, value);
    }
    return this;
  }

  /**
   * 验证数组长度
   */
  arrayLength(field: string, value: any, min: number, max?: number, message?: string): this {
    if (!isEmpty(value) && isArray(value)) {
      const length = value.length;
      if (max !== undefined) {
        if (length < min || length > max) {
          this.addError(
            field, 
            message || `${field} must have between ${min} and ${max} items`, 
            value
          );
        }
      } else if (length < min) {
        this.addError(
          field, 
          message || `${field} must have at least ${min} items`, 
          value
        );
      }
    }
    return this;
  }

  /**
   * 验证文件类型
   */
  fileType(field: string, value: any, types: string[], message?: string): this {
    if (!isEmpty(value) && value instanceof File) {
      if (!types.includes(value.type)) {
        this.addError(
          field, 
          message || `${field} must be one of: ${types.join(', ')}`, 
          value
        );
      }
    }
    return this;
  }

  /**
   * 验证文件大小
   */
  fileSize(field: string, value: any, maxSize: number, message?: string): this {
    if (!isEmpty(value) && value instanceof File) {
      if (value.size > maxSize) {
        this.addError(
          field, 
          message || `${field} must be smaller than ${maxSize} bytes`, 
          value
        );
      }
    }
    return this;
  }

  /**
   * 获取错误
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * 获取字段错误
   */
  getFieldErrors(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * 检查字段是否有错误
   */
  hasFieldErrors(field: string): boolean {
    return this.errors.some(error => error.field === field);
  }

  /**
   * 清除错误
   */
  clearErrors(): void {
    this.errors = [];
  }
}

// ==================== 验证函数 ====================

/**
 * 创建验证器
 */
export function createValidator(): Validator {
  return new Validator();
}

/**
 * 验证数据
 */
export function validate(data: Record<string, any>, rules: Record<string, (validator: Validator, value: any) => Validator>): ValidationError[] {
  const validator = new Validator();
  
  for (const [field, rule] of Object.entries(rules)) {
    rule(validator, data[field]);
  }
  
  return validator.getErrors();
}

/**
 * 同步验证
 */
export function validateSync<T>(
  data: T,
  schema: Record<keyof T, Array<(value: any) => string | null>>
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  for (const [field, validators] of Object.entries(schema)) {
    for (const validator of validators) {
      const error = validator(data[field as keyof T]);
      if (error) {
        errors.push({
          field: String(field),
          message: error,
          value: data[field as keyof T],
        });
        break; // 只保留第一个错误
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 异步验证
 */
export async function validateAsync<T>(
  data: T,
  schema: Record<keyof T, Array<(value: any) => Promise<string | null>>>
): Promise<{ valid: boolean; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];
  
  for (const [field, validators] of Object.entries(schema)) {
    for (const validator of validators) {
      const error = await validator(data[field as keyof T]);
      if (error) {
        errors.push({
          field: String(field),
          message: error,
          value: data[field as keyof T],
        });
        break; // 只保留第一个错误
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}