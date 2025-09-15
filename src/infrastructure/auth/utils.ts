// 认证工具函数
// 提供认证相关的辅助功能

import { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from './store';

// 权限类型
export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'manage'
  | 'admin'
  | 'moderate';

// 角色类型
export type Role = 'user' | 'moderator' | 'admin';

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'banned';

// ==================== 权限检查工具 ====================

// 检查用户是否拥有指定权限
export function hasPermission(
  userRole: Role,
  userStatus: UserStatus,
  requiredPermission: Permission
): boolean {
  if (userStatus !== 'active') {
    return false;
  }

  const rolePermissions: Record<Role, Permission[]> = {
    user: ['read', 'write'],
    moderator: ['read', 'write', 'delete', 'moderate'],
    admin: ['read', 'write', 'delete', 'manage', 'admin'],
  };

  return rolePermissions[userRole]?.includes(requiredPermission) || false;
}

// 检查用户是否为管理员
export function isAdmin(userRole: Role): boolean {
  return userRole === 'admin';
}

// 检查用户是否为版主
export function isModerator(userRole: Role): boolean {
  return userRole === 'moderator' || userRole === 'admin';
}

// 检查用户是否为活跃用户
export function isActive(userStatus: UserStatus): boolean {
  return userStatus === 'active';
}

// ==================== 用户信息工具 ====================

// 获取用户显示名称
export function getUserDisplayName(user: User | UserProfile | null): string {
  if (!user) return '匿名用户';
  
  if ('full_name' in user && user.full_name) {
    return user.full_name;
  }
  
  if ('username' in user && user.username) {
    return user.username;
  }
  
  if ('email' in user && user.email) {
    const email = user.email;
    return email.split('@')[0];
  }
  
  return '匿名用户';
}

// 获取用户头像
export function getUserAvatar(user: User | UserProfile | null): string {
  if (!user) return '';
  
  if ('avatar_url' in user && user.avatar_url) {
    return user.avatar_url;
  }
  
  // 生成基于邮箱的 gravatar 头像
  if ('email' in user && user.email) {
    const email = user.email.trim().toLowerCase();
    const hash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  }
  
  return '';
}

// 检查用户是否完成邮箱验证
export function isEmailVerified(user: User | UserProfile | null): boolean {
  if (!user) return false;
  
  if ('email_confirmed_at' in user) {
    return !!user.email_confirmed_at;
  }
  
  return false;
}

// 获取用户角色标签
export function getRoleLabel(role: Role): string {
  const roleLabels: Record<Role, string> = {
    user: '用户',
    moderator: '版主',
    admin: '管理员',
  };
  
  return roleLabels[role] || '用户';
}

// 获取用户状态标签
export function getStatusLabel(status: UserStatus): string {
  const statusLabels: Record<UserStatus, string> = {
    active: '活跃',
    inactive: '非活跃',
    banned: '已封禁',
  };
  
  return statusLabels[status] || '未知';
}

// ==================== 时间工具 ====================

// 格式化用户加入时间
export function formatJoinDate(date: string | Date): string {
  const joinDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

// 格式化最后活跃时间
export function formatLastActive(date: string | Date | null): string {
  if (!date) return '从未活跃';
  
  const lastActive = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}小时前`;
  } else if (diffMinutes < 10080) {
    const days = Math.floor(diffMinutes / 1440);
    return `${days}天前`;
  } else {
    return formatJoinDate(date);
  }
}

// ==================== 验证工具 ====================

// 验证密码强度
export function getPasswordStrength(password: string): {
  score: number;
  message: string;
  color: string;
} {
  let score = 0;
  
  // 长度检查
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // 复杂度检查
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  const strengthMap = [
    { score: 0, message: '非常弱', color: 'text-red-500' },
    { score: 1, message: '弱', color: 'text-red-400' },
    { score: 2, message: '一般', color: 'text-yellow-500' },
    { score: 3, message: '中等', color: 'text-yellow-400' },
    { score: 4, message: '强', color: 'text-green-400' },
    { score: 5, message: '很强', color: 'text-green-500' },
    { score: 6, message: '非常强', color: 'text-green-600' },
  ];
  
  return strengthMap[Math.min(score, 6)];
}

// 验证用户名格式
export function validateUsername(username: string): {
  isValid: boolean;
  message: string;
} {
  if (username.length < 3) {
    return { isValid: false, message: '用户名长度至少3位' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: '用户名长度不能超过20位' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: '用户名只能包含字母、数字和下划线' };
  }
  
  if (/^[0-9_]/.test(username)) {
    return { isValid: false, message: '用户名不能以数字或下划线开头' };
  }
  
  if (/_+$/.test(username)) {
    return { isValid: false, message: '用户名不能以下划线结尾' };
  }
  
  if (username.includes('__')) {
    return { isValid: false, message: '用户名不能包含连续的下划线' };
  }
  
  return { isValid: true, message: '用户名格式正确' };
}

// 验证邮箱格式
export function validateEmail(email: string): {
  isValid: boolean;
  message: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' };
  }
  
  return { isValid: true, message: '邮箱格式正确' };
}

// 验证URL格式
export function validateUrl(url: string): {
  isValid: boolean;
  message: string;
} {
  if (!url) {
    return { isValid: true, message: '' };
  }
  
  try {
    new URL(url);
    return { isValid: true, message: 'URL格式正确' };
  } catch {
    return { isValid: false, message: '请输入有效的URL' };
  }
}

// ==================== 存储工具 ====================

// 保存认证信息到本地存储
export function saveAuthToStorage(session: Session): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    }));
  }
}

// 从本地存储加载认证信息
export function loadAuthFromStorage(): {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
} | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('supabase.auth.token');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载认证信息失败:', error);
    }
  }
  return null;
}

// 清除本地存储的认证信息
export function clearAuthFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token');
  }
}

// ==================== 路由守卫工具 ====================

// 检查是否需要认证
export function requiresAuth(path: string): boolean {
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/blog',
    '/about',
    '/contact',
  ];
  
  return !publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  );
}

// 检查是否需要管理员权限
export function requiresAdmin(path: string): boolean {
  const adminPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/settings',
    '/admin/analytics',
  ];
  
  return adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(adminPath + '/')
  );
}

// 检查是否需要版主权限
export function requiresModerator(path: string): boolean {
  const moderatorPaths = [
    '/moderator',
    '/moderator/comments',
    '/moderator/posts',
    '/moderator/reports',
  ];
  
  return moderatorPaths.some(moderatorPath => 
    path === moderatorPath || path.startsWith(moderatorPath + '/')
  );
}

// ==================== 安全工具 ====================

// 生成安全的随机字符串
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 防止XSS攻击
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 验证CSRF令牌
export function validateCsrfToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}

// ==================== 社交媒体工具 ====================

// 获取社交媒体链接
export function getSocialLinks(profile: UserProfile | null): {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
} {
  if (!profile) return {};
  
  return {
    github: profile.github_url,
    twitter: profile.twitter_url,
    linkedin: profile.linkedin_url,
    website: profile.website,
  };
}

// 验证社交媒体URL
export function validateSocialUrl(url: string, platform: 'github' | 'twitter' | 'linkedin' | 'website'): {
  isValid: boolean;
  message: string;
} {
  if (!url) {
    return { isValid: true, message: '' };
  }
  
  const platformRegex = {
    github: /^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/,
    twitter: /^https:\/\/twitter\.com\/[a-zA-Z0-9_]+$/,
    linkedin: /^https:\/\/linkedin\.com\/in\/[a-zA-Z0-9_-]+$/,
    website: /^https?:\/\/.+/,
  };
  
  if (platformRegex[platform].test(url)) {
    return { isValid: true, message: 'URL格式正确' };
  }
  
  return { isValid: false, message: `请输入有效的${platform} URL` };
}

// ==================== 导出工具 ====================

// 导出用户数据
export function exportUserData(user: User, profile: UserProfile | null): string {
  const userData = {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    profile: profile ? {
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio,
      website: profile.website,
      location: profile.location,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    } : null,
  };
  
  return JSON.stringify(userData, null, 2);
}

// 导出用户活动数据
export function exportUserActivity(activities: any[]): string {
  return JSON.stringify(activities, null, 2);
}