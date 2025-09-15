// 认证模块导出
// 提供统一的认证相关导出

// 导出状态管理
export { useAuthStore } from './store';
export type {
  UserProfile,
  AuthState,
  SignInOptions,
  SignUpOptions,
  SocialSignInOptions,
  ResetPasswordOptions,
} from './store';

// 导出服务
export { AuthService, authService } from './service';
export type {
  RegisterData,
  LoginData,
  SocialLoginData,
  PasswordResetData,
  PasswordUpdateData,
  ProfileUpdateData,
  AuthResult,
  ValidationError,
} from './service';

// 导出工具函数
export * from './utils';

// 导出认证组合式函数
export * from './composables';

// 导出认证中间件
export * from './middleware';

// 导出认证类型定义
export * from './types';