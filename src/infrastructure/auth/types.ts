// 认证类型定义
// 提供认证相关的类型定义

import { User, Session } from '@supabase/supabase-js';

// ==================== 基础类型 ====================

// 用户角色
export type UserRole = 'user' | 'moderator' | 'admin';

// 用户状态
export type UserStatus = 'active' | 'inactive' | 'banned';

// 权限类型
export type Permission = 
  | 'read'              // 读取权限
  | 'write'             // 写入权限
  | 'delete'            // 删除权限
  | 'manage'            // 管理权限
  | 'admin'             // 管理员权限
  | 'moderate'          // 版主权限
  | 'publish'           // 发布权限
  | 'edit'              // 编辑权限
  | 'comment'           // 评论权限
  | 'upload'            // 上传权限
  | 'download'          // 下载权限
  | 'share'             // 分享权限
  | 'export'            // 导出权限
  | 'import'            // 导入权限
  | 'configure'         // 配置权限
  | 'monitor'           // 监控权限
  | 'backup'            // 备份权限
  | 'restore'           // 恢复权限;

// 社交登录提供商
export type SocialProvider = 'google' | 'github' | 'twitter' | 'facebook' | 'apple';

// ==================== 用户相关类型 ====================

// 用户资料
export interface UserProfile {
  id: string;                              // 用户ID
  username: string;                         // 用户名
  email: string;                           // 邮箱
  full_name?: string;                      // 全名
  avatar_url?: string;                     // 头像URL
  role: UserRole;                          // 用户角色
  status: UserStatus;                      // 用户状态
  bio?: string;                            // 个人简介
  website?: string;                        // 个人网站
  location?: string;                       // 位置
  github_url?: string;                     // GitHub链接
  twitter_url?: string;                    // Twitter链接
  linkedin_url?: string;                   // LinkedIn链接
  email_notifications: boolean;             // 邮箱通知
  last_sign_in_at?: string;                // 最后登录时间
  created_at: string;                      // 创建时间
  updated_at: string;                      // 更新时间
}

// 用户权限
export interface UserPermissions {
  canRead: boolean;                        // 读取权限
  canWrite: boolean;                       // 写入权限
  canDelete: boolean;                      // 删除权限
  canManage: boolean;                      // 管理权限
  canPublish: boolean;                     // 发布权限
  canEdit: boolean;                        // 编辑权限
  canComment: boolean;                     // 评论权限
  canUpload: boolean;                      // 上传权限
  canDownload: boolean;                    // 下载权限
  canShare: boolean;                       // 分享权限
  canExport: boolean;                      // 导出权限
  canImport: boolean;                      // 导入权限
  canConfigure: boolean;                   // 配置权限
  canMonitor: boolean;                     // 监控权限
  canBackup: boolean;                      // 备份权限
  canRestore: boolean;                     // 恢复权限
}

// 扩展用户信息
export interface ExtendedUser extends User {
  profile?: UserProfile;
  permissions?: UserPermissions;
}

// ==================== 认证状态类型 ====================

// 认证状态
export interface AuthState {
  user: User | null;                        // 当前用户
  profile: UserProfile | null;             // 用户资料
  session: Session | null;                  // 会话信息
  isLoading: boolean;                      // 加载状态
  isAuthenticated: boolean;                 // 是否已认证
  permissions: UserPermissions;             // 用户权限
}

// 认证配置
export interface AuthConfig {
  persistSession: boolean;                  // 持久化会话
  autoRefreshToken: boolean;                // 自动刷新令牌
  detectSessionInUrl: boolean;             // 从URL检测会话
  redirectTo?: string;                      // 重定向URL
  socialProviders?: SocialProvider[];      // 社交登录提供商
}

// ==================== 注册相关类型 ====================

// 注册数据
export interface RegisterData {
  email: string;                           // 邮箱
  password: string;                        // 密码
  confirmPassword: string;                 // 确认密码
  username: string;                        // 用户名
  fullName?: string;                       // 全名
  agreeToTerms: boolean;                   // 同意服务条款
  recaptchaToken?: string;                 // reCAPTCHA令牌
}

// 注册选项
export interface RegisterOptions {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  redirectTo?: string;
  data?: Record<string, any>;
}

// 注册结果
export interface RegisterResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  user?: User;
  needsEmailVerification?: boolean;
}

// ==================== 登录相关类型 ====================

// 登录数据
export interface LoginData {
  email: string;                           // 邮箱
  password: string;                        // 密码
  rememberMe?: boolean;                    // 记住我
  recaptchaToken?: string;                 // reCAPTCHA令牌
}

// 登录选项
export interface LoginOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 登录结果
export interface LoginResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  user?: User;
  session?: Session;
}

// ==================== 社交登录类型 ====================

// 社交登录数据
export interface SocialLoginData {
  provider: SocialProvider;                // 提供商
  redirectTo?: string;                     // 重定向URL
  scopes?: string;                         // 权限范围
}

// 社交登录结果
export interface SocialLoginResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  url?: string;                            // 授权URL
}

// ==================== 密码相关类型 ====================

// 密码重置数据
export interface PasswordResetData {
  email: string;                           // 邮箱
  redirectTo?: string;                     // 重定向URL
  recaptchaToken?: string;                 // reCAPTCHA令牌
}

// 密码重置结果
export interface PasswordResetResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 密码更新数据
export interface PasswordUpdateData {
  currentPassword?: string;               // 当前密码
  newPassword: string;                     // 新密码
  confirmPassword: string;                 // 确认密码
}

// 密码更新结果
export interface PasswordUpdateResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 密码强度
export interface PasswordStrength {
  score: number;                           // 分数 (0-6)
  message: string;                         // 强度描述
  color: string;                           // 显示颜色
  suggestions: string[];                   // 建议
}

// ==================== 用户资料相关类型 ====================

// 用户资料更新数据
export interface ProfileUpdateData {
  full_name?: string;                      // 全名
  bio?: string;                            // 个人简介
  website?: string;                        // 个人网站
  location?: string;                       // 位置
  github_url?: string;                     // GitHub链接
  twitter_url?: string;                    // Twitter链接
  linkedin_url?: string;                   // LinkedIn链接
  email_notifications?: boolean;           // 邮箱通知
  avatar_url?: string;                     // 头像URL
}

// 用户资料更新结果
export interface ProfileUpdateResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  profile?: UserProfile;
}

// 头像上传数据
export interface AvatarUploadData {
  file: File;                             // 文件
  maxSize?: number;                        // 最大大小
  allowedTypes?: string[];                 // 允许的类型
}

// 头像上传结果
export interface AvatarUploadResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  url?: string;                            // 头像URL
}

// ==================== 验证相关类型 ====================

// 验证错误
export interface ValidationError {
  field: string;                           // 字段名
  message: string;                         // 错误消息
  code?: string;                           // 错误代码
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;                        // 是否有效
  errors: ValidationError[];               // 错误列表
}

// 邮箱验证数据
export interface EmailVerificationData {
  token: string;                           // 验证令牌
  email?: string;                         // 邮箱
}

// 邮箱验证结果
export interface EmailVerificationResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 重新发送验证邮件结果
export interface ResendVerificationResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// ==================== 会话相关类型 ====================

// 会话信息
export interface SessionInfo {
  accessToken: string;                     // 访问令牌
  refreshToken: string;                    // 刷新令牌
  expiresAt: number;                       // 过期时间
  tokenType: string;                       // 令牌类型
  user: User;                              // 用户信息
}

// 会话刷新结果
export interface SessionRefreshResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  session?: Session;
}

// ==================== 权限相关类型 ====================

// 角色权限映射
export interface RolePermissions {
  role: UserRole;                          // 角色
  permissions: Permission[];               // 权限列表
  description: string;                     // 描述
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;                  // 是否有权限
  reason?: string;                         // 原因
  requiredPermissions?: Permission[];     // 需要的权限
  userPermissions?: Permission[];         // 用户权限
}

// ==================== 安全相关类型 ====================

// 登录尝试记录
export interface LoginAttempt {
  id: string;                              // 记录ID
  userId?: string;                         // 用户ID
  email: string;                           // 邮箱
  ipAddress: string;                        // IP地址
  userAgent: string;                       // 用户代理
  success: boolean;                        // 是否成功
  timestamp: string;                       // 时间戳
  errorMessage?: string;                   // 错误消息
}

// 安全设置
export interface SecuritySettings {
  maxLoginAttempts: number;                // 最大登录尝试次数
  lockoutDuration: number;                 // 锁定持续时间(分钟)
  passwordExpiryDays: number;              // 密码过期天数
  requireTwoFactor: boolean;               // 是否需要双因子认证
  allowSocialLogin: boolean;                // 允许社交登录
  sessionTimeout: number;                   // 会话超时时间(分钟)
  enableRecaptcha: boolean;                // 启用reCAPTCHA
}

// ==================== 通知相关类型 ====================

// 通知类型
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

// 通知消息
export interface NotificationMessage {
  id: string;                              // 通知ID
  type: NotificationType;                  // 通知类型
  title: string;                           // 标题
  message: string;                         // 消息内容
  timestamp: string;                       // 时间戳
  read: boolean;                           // 是否已读
  actions?: NotificationAction[];         // 操作按钮
}

// 通知操作
export interface NotificationAction {
  label: string;                           // 按钮标签
  action: () => void;                       // 操作函数
  primary?: boolean;                       // 是否主要按钮
}

// ==================== 工具相关类型 ====================

// 工具函数类型
export type ValidatorFunction<T> = (value: T) => string | null;

// 验证规则
export interface ValidationRule {
  field: string;                           // 字段名
  validator: ValidatorFunction<any>;       // 验证函数
  message?: string;                         // 错误消息
}

// 表单状态
export interface FormState<T> {
  data: T;                                 // 表单数据
  errors: Record<string, string[]>;         // 错误信息
  isSubmitting: boolean;                    // 提交状态
  isDirty: boolean;                        // 是否有修改
}

// ==================== 事件相关类型 ====================

// 认证事件
export type AuthEvent = 
  | 'SIGNED_IN'                            // 登录
  | 'SIGNED_OUT'                           // 登出
  | 'TOKEN_REFRESHED'                      // 令牌刷新
  | 'USER_UPDATED'                         // 用户更新
  | 'PASSWORD_RESET'                       // 密码重置
  | 'EMAIL_VERIFIED'                       // 邮箱验证
  | 'PROFILE_UPDATED'                      // 资料更新
  | 'PERMISSIONS_CHANGED'                 // 权限变更
  | 'ACCOUNT_SUSPENDED'                    // 账户暂停
  | 'ACCOUNT_REACTIVATED'                  // 账户重新激活;

// 事件处理器
export type AuthEventHandler = (event: AuthEvent, data?: any) => void;

// 事件监听器
export interface AuthEventListener {
  event: AuthEvent;                         // 事件类型
  handler: AuthEventHandler;               // 事件处理器
  once?: boolean;                          // 是否只执行一次
}

// ==================== 导出所有类型 ====================

// 重新导出常用类型
export type {
  User,
  Session,
} from '@supabase/supabase-js';