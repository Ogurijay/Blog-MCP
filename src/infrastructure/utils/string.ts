// 字符串工具函数
// 提供字符串处理、验证和转换等功能

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 标题格式化（每个单词首字母大写）
 */
export function titleCase(str: string): string {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * 驼峰转下划线
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 下划线转驼峰
 */
export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => 
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

/**
 * 驼峰转短横线
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * 短横线转驼峰
 */
export function kebabToCamel(str: string): string {
  return str.replace(/(-[a-z])/g, (group) => 
    group.toUpperCase().replace('-', '')
  );
}

/**
 * 截断字符串
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

/**
 * 截断单词
 */
export function truncateWords(str: string, wordCount: number, suffix: string = '...'): string {
  if (!str) return str;
  const words = str.split(' ');
  if (words.length <= wordCount) return str;
  return words.slice(0, wordCount).join(' ') + suffix;
}

/**
 * 移除HTML标签
 */
export function stripHtml(html: string): string {
  if (!html) return html;
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 转义HTML
 */
export function escapeHtml(html: string): string {
  if (!html) return html;
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * 反转义HTML
 */
export function unescapeHtml(html: string): string {
  if (!html) return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * 生成随机字符串
 */
export function randomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 生成UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成短ID
 */
export function shortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 驼峰化字符串
 */
export function camelize(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * 帕斯卡化字符串
 */
export function pascalize(str: string): string {
  return camelize(str).replace(/(?:^|\s+)(\w)/g, (_, firstLetter) => firstLetter.toUpperCase());
}

/**
 * 移除字符串中的所有空格
 */
export function removeSpaces(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * 压缩字符串（移除多余空格）
 */
export function compact(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * 反转字符串
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * 检查字符串是否为空
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * 检查字符串是否包含特定内容
 */
export function includes(str: string, search: string, position: number = 0): boolean {
  return str.toLowerCase().includes(search.toLowerCase(), position);
}

/**
 * 检查字符串是否以特定内容开头
 */
export function startsWith(str: string, search: string, position: number = 0): boolean {
  return str.toLowerCase().startsWith(search.toLowerCase(), position);
}

/**
 * 检查字符串是否以特定内容结尾
 */
export function endsWith(str: string, search: string, position: number = str.length): boolean {
  return str.toLowerCase().endsWith(search.toLowerCase(), position);
}

/**
 * 计算字符串的字节长度
 */
export function byteLength(str: string): number {
  return new Blob([str]).size;
}

/**
 * 截断字节长度
 */
export function truncateBytes(str: string, maxBytes: number, suffix: string = '...'): string {
  if (byteLength(str) <= maxBytes) return str;
  
  let result = str;
  while (byteLength(result + suffix) > maxBytes) {
    result = result.slice(0, -1);
  }
  
  return result + suffix;
}

/**
 * URL编码
 */
export function encodeUrl(str: string): string {
  return encodeURIComponent(str);
}

/**
 * URL解码
 */
export function decodeUrl(str: string): string {
  return decodeURIComponent(str);
}

/**
 * Base64编码
 */
export function base64Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  ));
}

/**
 * Base64解码
 */
export function base64Decode(str: string): string {
  return decodeURIComponent(atob(str).split('').map(c => 
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
}

/**
 * MD5哈希（简化版）
 */
export function md5(str: string): string {
  // 这是一个简化的实现，实际项目中应使用专业的哈希库
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 格式化字符串（模板字符串）
 */
export function format(template: string, ...values: any[]): string {
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const value = values[parseInt(index, 10)];
    return value !== undefined ? value.toString() : match;
  });
}

/**
 * 格式化数字为字符串
 */
export function formatNumber(num: number, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
}): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'zh-CN'
  } = options || {};
  
  return num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number, currency: string = 'CNY', locale: string = 'zh-CN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 2, locale: string = 'zh-CN'): string {
  return (value * 100).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * 转换为复数形式
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * 转换为序数形式
 */
export function ordinalize(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  
  return num + 'th';
}

/**
 * 驼峰化对象键
 */
export function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = camelToSnake(key);
      result[newKey] = camelizeKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

/**
 * 下划线化对象键
 */
export function snakeizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = camelToSnake(key);
      result[newKey] = snakeizeKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

/**
 * 提取字符串中的数字
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+\.?\d*/g);
  return matches ? matches.map(Number) : [];
}

/**
 * 提取字符串中的邮箱
 */
export function extractEmails(str: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = str.match(emailRegex);
  return matches || [];
}

/**
 * 提取字符串中的URL
 */
export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = str.match(urlRegex);
  return matches || [];
}

/**
 * 高亮搜索关键词
 */
export function highlight(text: string, keyword: string, highlightClass: string = 'highlight'): string {
  if (!keyword) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * 生成slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 替换空格为短横线
    .replace(/-+/g, '-') // 合并多个短横线
    .trim();
}

/**
 * 从slug生成标题
 */
export function deslugify(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * 检查字符串是否为JSON
 */
export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化JSON字符串
 */
export function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * 压缩JSON字符串
 */
export function minifyJson(obj: any): string {
  return JSON.stringify(obj);
}

/**
 * 获取字符串的字形
 */
export function getGraphemes(str: string): string[] {
  // 简单实现，实际项目中可能需要更复杂的处理
  return Array.from(str);
}

/**
 * 获取字符串的单词
 */
export function getWords(str: string): string[] {
  return str.trim().split(/\s+/).filter(word => word.length > 0);
}

/**
 * 获取字符串的句子
 */
export function getSentences(str: string): string[] {
  return str.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
}

/**
 * 获取字符串的段落
 */
export function getParagraphs(str: string): string[] {
  return str.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
}

/**
 * 统计字符数
 */
export function countCharacters(str: string): number {
  return str.length;
}

/**
 * 统计单词数
 */
export function countWords(str: string): number {
  return getWords(str).length;
}

/**
 * 统计句子数
 */
export function countSentences(str: string): number {
  return getSentences(str).length;
}

/**
 * 统计段落数
 */
export function countParagraphs(str: string): number {
  return getParagraphs(str).length;
}

/**
 * 计算阅读时间
 */
export function readingTime(str: string, wordsPerMinute: number = 200): string {
  const words = countWords(str);
  const minutes = Math.ceil(words / wordsPerMinute);
  
  if (minutes < 1) return '少于1分钟';
  if (minutes === 1) return '1分钟';
  return `${minutes}分钟`;
}

/**
 * 检查字符串是否为回文
 */
export function isPalindrome(str: string): boolean {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

/**
 * 生成缩写
 */
export function acronym(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * 生成首字母缩写
 */
export function initialism(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0))
    .join('.')
    .toUpperCase();
}

/**
 * 重复字符串
 */
export function repeat(str: string, count: number): string {
  return str.repeat(count);
}

/**
 * 填充字符串
 */
export function pad(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char);
}

/**
 * 左填充字符串
 */
export function padStart(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char);
}

/**
 * 右填充字符串
 */
export function padEnd(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char);
}

/**
 * 移除字符串中的重音符号
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * 转换为ASCII
 */
export function toAscii(str: string): string {
  return removeAccents(str).replace(/[^\x00-\x7F]/g, '');
}