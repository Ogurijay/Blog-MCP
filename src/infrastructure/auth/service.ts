// 认证服务
// 提供统一的认证接口和业务逻辑

import { SupabaseService } from '../supabase/client';
import type { 
  User, 
  Session, 
  AuthError,
  AuthResponse,
  Provider 
} from '@supabase/supabase-js';

// 用户注册数据
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName?: string;
  agreeToTerms: boolean;
}

// 登录数据
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 社交登录数据
export interface SocialLoginData {
  provider: Provider;
  redirectTo?: string;
}

// 密码重置数据
export interface PasswordResetData {
  email: string;
  redirectTo?: string;
}

// 密码更新数据
export interface PasswordUpdateData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户资料更新数据
export interface ProfileUpdateData {
  full_name?: string;
  bio?: string;
  website?: string;
  location?: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  email_notifications?: boolean;
  avatar_url?: string;
}

// 认证结果
export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 验证错误
export interface ValidationError {
  field: string;
  message: string;
}

export class AuthService {
  private supabase: SupabaseService;

  constructor() {
    this.supabase = new SupabaseService();
  }

  // ==================== 验证方法 ====================

  // 验证邮箱格式
  private validateEmail(email: string): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { field: 'email', message: '请输入有效的邮箱地址' };
    }
    return null;
  }

  // 验证密码强度
  private validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (password.length < 8) {
      errors.push({ field: 'password', message: '密码长度至少8位' });
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push({ field: 'password', message: '密码必须包含小写字母' });
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push({ field: 'password', message: '密码必须包含大写字母' });
    }
    
    if (!/\d/.test(password)) {
      errors.push({ field: 'password', message: '密码必须包含数字' });
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push({ field: 'password', message: '密码必须包含特殊字符' });
    }
    
    return errors;
  }

  // 验证用户名
  private validateUsername(username: string): ValidationError | null {
    if (username.length < 3) {
      return { field: 'username', message: '用户名长度至少3位' };
    }
    
    if (username.length > 20) {
      return { field: 'username', message: '用户名长度不能超过20位' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return { field: 'username', message: '用户名只能包含字母、数字和下划线' };
    }
    
    return null;
  }

  // 验证注册数据
  validateRegisterData(data: RegisterData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 验证邮箱
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);
    
    // 验证密码
    const passwordErrors = this.validatePassword(data.password);
    errors.push(...passwordErrors);
    
    // 验证密码确认
    if (data.password !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: '两次输入的密码不一致' });
    }
    
    // 验证用户名
    const usernameError = this.validateUsername(data.username);
    if (usernameError) errors.push(usernameError);
    
    // 验证服务条款
    if (!data.agreeToTerms) {
      errors.push({ field: 'agreeToTerms', message: '请同意服务条款' });
    }
    
    return errors;
  }

  // 验证登录数据
  validateLoginData(data: LoginData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 验证邮箱
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);
    
    // 验证密码
    if (!data.password) {
      errors.push({ field: 'password', message: '请输入密码' });
    }
    
    return errors;
  }

  // 验证密码更新数据
  validatePasswordUpdateData(data: PasswordUpdateData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 验证新密码
    const passwordErrors = this.validatePassword(data.newPassword);
    errors.push(...passwordErrors);
    
    // 验证密码确认
    if (data.newPassword !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: '两次输入的密码不一致' });
    }
    
    return errors;
  }

  // ==================== 认证方法 ====================

  // 用户注册
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // 验证数据
      const validationErrors = this.validateRegisterData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: '验证失败',
          message: validationErrors.map(e => e.message).join(', '),
        };
      }

      // 检查用户名是否已存在
      const usernameExists = await this.checkUsernameExists(data.username);
      if (usernameExists) {
        return {
          success: false,
          error: '用户名已存在',
          message: '该用户名已被注册，请选择其他用户名',
        };
      }

      // 检查邮箱是否已存在
      const emailExists = await this.checkEmailExists(data.email);
      if (emailExists) {
        return {
          success: false,
          error: '邮箱已存在',
          message: '该邮箱已被注册，请使用其他邮箱',
        };
      }

      // 注册用户
      const result = await this.supabase.signUp(data.email, data.password, {
        redirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: data.username,
          full_name: data.fullName,
        },
      });

      return {
        success: true,
        data: result,
        message: '注册成功，请查收邮件验证邮箱',
      };
    } catch (error) {
      console.error('用户注册失败:', error);
      return {
        success: false,
        error: '注册失败',
        message: error instanceof AuthError ? error.message : '注册过程中发生错误',
      };
    }
  }

  // 用户登录
  async login(data: LoginData): Promise<AuthResult> {
    try {
      // 验证数据
      const validationErrors = this.validateLoginData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: '验证失败',
          message: validationErrors.map(e => e.message).join(', '),
        };
      }

      // 登录用户
      const result = await this.supabase.signIn(data.email, data.password);

      return {
        success: true,
        data: result,
        message: '登录成功',
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      return {
        success: false,
        error: '登录失败',
        message: error instanceof AuthError ? error.message : '登录过程中发生错误',
      };
    }
  }

  // 社交登录
  async socialLogin(data: SocialLoginData): Promise<AuthResult> {
    try {
      const result = await this.supabase.signInWithOAuth(data.provider, {
        redirectTo: data.redirectTo || `${window.location.origin}/auth/callback`,
      });

      return {
        success: true,
        data: result,
        message: '正在跳转到社交登录页面',
      };
    } catch (error) {
      console.error('社交登录失败:', error);
      return {
        success: false,
        error: '社交登录失败',
        message: error instanceof AuthError ? error.message : '社交登录过程中发生错误',
      };
    }
  }

  // 用户登出
  async logout(): Promise<AuthResult> {
    try {
      await this.supabase.signOut();
      return {
        success: true,
        message: '登出成功',
      };
    } catch (error) {
      console.error('用户登出失败:', error);
      return {
        success: false,
        error: '登出失败',
        message: error instanceof AuthError ? error.message : '登出过程中发生错误',
      };
    }
  }

  // 重置密码
  async resetPassword(data: PasswordResetData): Promise<AuthResult> {
    try {
      // 验证邮箱
      const emailError = this.validateEmail(data.email);
      if (emailError) {
        return {
          success: false,
          error: '验证失败',
          message: emailError.message,
        };
      }

      const result = await this.supabase.resetPassword(data.email, 
        data.redirectTo || `${window.location.origin}/auth/reset-password`
      );

      return {
        success: true,
        data: result,
        message: '密码重置邮件已发送，请查收邮件',
      };
    } catch (error) {
      console.error('重置密码失败:', error);
      return {
        success: false,
        error: '重置密码失败',
        message: error instanceof AuthError ? error.message : '重置密码过程中发生错误',
      };
    }
  }

  // 更新密码
  async updatePassword(data: PasswordUpdateData): Promise<AuthResult> {
    try {
      // 验证数据
      const validationErrors = this.validatePasswordUpdateData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: '验证失败',
          message: validationErrors.map(e => e.message).join(', '),
        };
      }

      const result = await this.supabase.updatePassword(data.newPassword);

      return {
        success: true,
        data: result,
        message: '密码更新成功',
      };
    } catch (error) {
      console.error('更新密码失败:', error);
      return {
        success: false,
        error: '更新密码失败',
        message: error instanceof AuthError ? error.message : '更新密码过程中发生错误',
      };
    }
  }

  // 更新用户资料
  async updateProfile(data: ProfileUpdateData): Promise<AuthResult> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: '用户未登录',
          message: '请先登录后再更新资料',
        };
      }

      const result = await this.supabase.updateUser({
        data: data,
      });

      return {
        success: true,
        data: result,
        message: '资料更新成功',
      };
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return {
        success: false,
        error: '更新资料失败',
        message: error instanceof AuthError ? error.message : '更新资料过程中发生错误',
      };
    }
  }

  // ==================== 辅助方法 ====================

  // 检查用户名是否已存在
  private async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // 检查邮箱是否已存在
  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.supabase.getCurrentUser();
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  // 获取当前会话
  async getCurrentSession(): Promise<Session | null> {
    try {
      return await this.supabase.getCurrentSession();
    } catch (error) {
      console.error('获取当前会话失败:', error);
      return null;
    }
  }

  // 刷新会话
  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.getClient().auth.refreshSession();
      
      if (error) throw error;

      return {
        success: true,
        data,
        message: '会话刷新成功',
      };
    } catch (error) {
      console.error('刷新会话失败:', error);
      return {
        success: false,
        error: '刷新会话失败',
        message: error instanceof AuthError ? error.message : '刷新会话过程中发生错误',
      };
    }
  }

  // 检查权限
  async hasPermission(permission: string): Promise<boolean> {
    try {
      return await this.supabase.hasPermission(permission);
    } catch (error) {
      console.error('检查权限失败:', error);
      return false;
    }
  }

  // 验证邮箱
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.getClient().auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;

      return {
        success: true,
        data,
        message: '邮箱验证成功',
      };
    } catch (error) {
      console.error('邮箱验证失败:', error);
      return {
        success: false,
        error: '邮箱验证失败',
        message: error instanceof AuthError ? error.message : '邮箱验证过程中发生错误',
      };
    }
  }

  // 重新发送验证邮件
  async resendVerificationEmail(email: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.getClient().auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      return {
        success: true,
        data,
        message: '验证邮件已重新发送',
      };
    } catch (error) {
      console.error('重新发送验证邮件失败:', error);
      return {
        success: false,
        error: '发送验证邮件失败',
        message: error instanceof AuthError ? error.message : '发送验证邮件过程中发生错误',
      };
    }
  }
}

// 创建认证服务实例
export const authService = new AuthService();