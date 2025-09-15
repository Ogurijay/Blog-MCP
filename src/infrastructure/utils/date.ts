// 日期时间工具函数
// 提供日期格式化、计算和转换等功能

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD',
  locale: string = 'zh-CN'
): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const formatMap: Record<string, string> = {
    'YYYY': d.getFullYear().toString(),
    'YY': d.getFullYear().toString().slice(-2),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'M': (d.getMonth() + 1).toString(),
    'DD': String(d.getDate()).padStart(2, '0'),
    'D': d.getDate().toString(),
    'HH': String(d.getHours()).padStart(2, '0'),
    'H': d.getHours().toString(),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'm': d.getMinutes().toString(),
    'ss': String(d.getSeconds()).padStart(2, '0'),
    's': d.getSeconds().toString(),
    'SSS': String(d.getMilliseconds()).padStart(3, '0'),
    'A': d.getHours() >= 12 ? 'PM' : 'AM',
    'a': d.getHours() >= 12 ? 'pm' : 'am',
  };
  
  let formatted = format;
  
  // 使用Intl格式化
  if (format === 'relative') {
    return formatRelativeTime(d, locale);
  }
  
  if (format === 'full') {
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  if (format === 'date') {
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  // 简单格式替换
  Object.entries(formatMap).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(key, 'g'), value);
  });
  
  return formatted;
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date, locale: string = 'zh-CN'): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) {
    return rtf.format(-seconds, 'second');
  } else if (minutes < 60) {
    return rtf.format(-minutes, 'minute');
  } else if (hours < 24) {
    return rtf.format(-hours, 'hour');
  } else if (days < 7) {
    return rtf.format(-days, 'day');
  } else if (weeks < 4) {
    return rtf.format(-weeks, 'week');
  } else if (months < 12) {
    return rtf.format(-months, 'month');
  } else {
    return rtf.format(-years, 'year');
  }
}

/**
 * 计算两个日期之间的时间差
 */
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'days'
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2.getTime() - d1.getTime();
  
  switch (unit) {
    case 'milliseconds':
      return diff;
    case 'seconds':
      return Math.floor(diff / 1000);
    case 'minutes':
      return Math.floor(diff / (1000 * 60));
    case 'hours':
      return Math.floor(diff / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    case 'years':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    default:
      return diff;
  }
}

/**
 * 添加时间
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date {
  const d = new Date(date);
  
  switch (unit) {
    case 'milliseconds':
      d.setMilliseconds(d.getMilliseconds() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'weeks':
      d.setDate(d.getDate() + amount * 7);
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
  }
  
  return d;
}

/**
 * 减去时间
 */
export function subtractTime(
  date: Date | string | number,
  amount: number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date {
  return addTime(date, -amount, unit);
}

/**
 * 获取日期的开始时间
 */
export function startOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取日期的结束时间
 */
export function endOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取周的开始时间
 */
export function startOfWeek(date: Date | string | number, weekStartsOn: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
}

/**
 * 获取周的结束时间
 */
export function endOfWeek(date: Date | string | number, weekStartsOn: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() + (6 - diff));
  return endOfDay(d);
}

/**
 * 获取月的开始时间
 */
export function startOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
}

/**
 * 获取月的结束时间
 */
export function endOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  return endOfDay(d);
}

/**
 * 获取年的开始时间
 */
export function startOfYear(date: Date | string | number): Date {
  const d = new Date(date);
  d.setMonth(0, 1);
  return startOfDay(d);
}

/**
 * 获取年的结束时间
 */
export function endOfYear(date: Date | string | number): Date {
  const d = new Date(date);
  d.setMonth(11, 31);
  return endOfDay(d);
}

/**
 * 检查是否为同一天
 */
export function isSameDay(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * 检查是否为同一周
 */
export function isSameWeek(
  date1: Date | string | number,
  date2: Date | string | number,
  weekStartsOn: number = 0
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const week1 = startOfWeek(d1, weekStartsOn);
  const week2 = startOfWeek(d2, weekStartsOn);
  
  return week1.getTime() === week2.getTime();
}

/**
 * 检查是否为同一月
 */
export function isSameMonth(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
}

/**
 * 检查是否为同一年
 */
export function isSameYear(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear();
}

/**
 * 检查日期是否在范围内
 */
export function isDateInRange(
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return d >= start && d <= end;
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(date: Date | string | number): number {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * 获取星期名称
 */
export function getDayName(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * 获取月份名称
 */
export function getMonthName(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, { month: 'long' });
}

/**
 * 解析日期字符串
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 格式化ISO日期
 */
export function formatISODate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString();
}

/**
 * 格式化UTC日期
 */
export function formatUTCDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toUTCString();
}

/**
 * 获取时间戳
 */
export function getTimestamp(date?: Date | string | number): number {
  return date ? new Date(date).getTime() : Date.now();
}

/**
 * 验证日期是否有效
 */
export function isValidDate(date: Date | string | number): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * 获取时区偏移
 */
export function getTimezoneOffset(date?: Date | string | number): number {
  const d = date ? new Date(date) : new Date();
  return d.getTimezoneOffset();
}

/**
 * 转换为UTC时间
 */
export function toUTC(date: Date | string | number): Date {
  const d = new Date(date);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

/**
 * 从UTC时间转换
 */
export function fromUTC(date: Date | string | number): Date {
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

/**
 * 获取季度
 */
export function getQuarter(date: Date | string | number): number {
  const d = new Date(date);
  return Math.floor(d.getMonth() / 3) + 1;
}

/**
 * 获取周数
 */
export function getWeekNumber(date: Date | string | number): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * 格式化持续时间
 */
export function formatDuration(
  milliseconds: number,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  if (format === 'full') {
    return `${days}d ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  
  if (format === 'long') {
    const parts = [];
    if (days > 0) parts.push(`${days} days`);
    if (remainingHours > 0) parts.push(`${remainingHours} hours`);
    if (remainingMinutes > 0) parts.push(`${remainingMinutes} minutes`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds} seconds`);
    return parts.join(', ');
  }
  
  // short format
  if (days > 0) return `${days}d ${remainingHours}h`;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

/**
 * 获取年龄
 */
export function getAge(birthDate: Date | string | number): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 检查是否为闰年
 */
export function isLeapYear(date: Date | string | number): boolean {
  const d = new Date(date);
  const year = d.getFullYear();
  
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 获取日期范围
 */
export function getDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  unit: 'days' | 'hours' | 'minutes' = 'days'
): Date[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];
  
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    
    switch (unit) {
      case 'days':
        current.setDate(current.getDate() + 1);
        break;
      case 'hours':
        current.setHours(current.getHours() + 1);
        break;
      case 'minutes':
        current.setMinutes(current.getMinutes() + 1);
        break;
    }
  }
  
  return dates;
}

/**
 * 获取最近的时间段
 */
export function getRecentTimeRange(
  range: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear'
): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    
    case 'thisWeek':
      return {
        start: startOfWeek(today),
        end: endOfWeek(today),
      };
    
    case 'lastWeek':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      return {
        start: startOfWeek(lastWeekStart),
        end: endOfWeek(lastWeekStart),
      };
    
    case 'thisMonth':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    
    case 'lastMonth':
      const lastMonthStart = new Date(today);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      return {
        start: startOfMonth(lastMonthStart),
        end: endOfMonth(lastMonthStart),
      };
    
    case 'thisYear':
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };
    
    case 'lastYear':
      const lastYearStart = new Date(today);
      lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
      return {
        start: startOfYear(lastYearStart),
        end: endOfYear(lastYearStart),
      };
    
    default:
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
  }
}