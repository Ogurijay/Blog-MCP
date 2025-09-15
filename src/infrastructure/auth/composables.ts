// 认证组合式函数
// 提供便捷的认证相关组合式函数

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { authService } from '../service';
import * as utils from '../utils';

// ==================== 基础认证组合式函数 ====================

/**
 * 使用认证状态
 * @returns 认证状态和相关方法
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // 初始化认证
  const initialize = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authStore.initializeAuth();
      
      // 设置认证状态监听
      const subscription = authStore.setupAuthListener();
      
      // 组件卸载时取消监听
      onUnmounted(() => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化认证失败';
      console.error('初始化认证失败:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // 用户登录
  const login = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.signIn(data);
      
      if (result.success) {
        // 登录成功，跳转到首页或之前的页面
        const redirectPath = router.currentRoute.value.query.redirect as string || '/';
        await router.push(redirectPath);
      } else {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 用户注册
  const register = async (data: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.signUp({
        ...data,
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (result.success) {
        // 注册成功，跳转到验证邮箱页面
        await router.push('/auth/verify-email');
      } else {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 用户登出
  const logout = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.signOut();
      
      if (result.success) {
        // 登出成功，跳转到登录页面
        await router.push('/login');
      } else {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登出失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 社交登录
  const socialLogin = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const result = await authStore.signInWithSocial({
        provider,
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '社交登录失败';
      return { success: false, error: error.value };
    }
  };
  
  // 重置密码
  const resetPassword = async (email: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.resetPassword({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (result.success) {
        // 重置密码邮件发送成功，跳转到确认页面
        await router.push('/auth/reset-password-sent');
      } else {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置密码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 更新密码
  const updatePassword = async (password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.updatePassword(password);
      
      if (result.success) {
        // 密码更新成功，跳转到登录页面
        await router.push('/login');
      } else {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新密码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 刷新认证状态
  const refreshAuth = async () => {
    await authStore.refreshAuth();
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  return {
    // 状态
    isLoading: computed(() => isLoading.value || authStore.isLoading),
    error: computed(() => error.value),
    
    // 认证状态
    user: computed(() => authStore.user),
    profile: computed(() => authStore.profile),
    session: computed(() => authStore.session),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    isModerator: computed(() => authStore.isModerator),
    isActive: computed(() => authStore.isActive),
    permissions: computed(() => authStore.permissions),
    
    // 方法
    initialize,
    login,
    register,
    logout,
    socialLogin,
    resetPassword,
    updatePassword,
    refreshAuth,
    clearError,
    
    // 工具函数
    hasPermission: authStore.hasPermission,
    updateUser: authStore.updateUser,
    updateUserProfile: authStore.updateUserProfile,
  };
}

// ==================== 用户资料组合式函数 ====================

/**
 * 使用用户资料
 * @returns 用户资料相关方法
 */
export function useProfile() {
  const authStore = useAuthStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // 更新用户资料
  const updateProfile = async (data: {
    full_name?: string;
    bio?: string;
    website?: string;
    location?: string;
    github_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    email_notifications?: boolean;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authStore.updateUserProfile(authStore.user!.id, data);
      
      if (!result.success) {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新资料失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  // 更新头像
  const updateAvatar = async (file: File) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // 这里需要实现文件上传逻辑
      // TODO: 实现头像上传
      const avatarUrl = ''; // 上传后返回的URL
      
      const result = await authStore.updateUserProfile(authStore.user!.id, {
        avatar_url: avatarUrl,
      });
      
      if (!result.success) {
        error.value = result.error;
      }
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新头像失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    updateProfile,
    updateAvatar,
  };
}

// ==================== 权限检查组合式函数 ====================

/**
 * 使用权限检查
 * @returns 权限检查相关方法
 */
export function usePermission() {
  const authStore = useAuthStore();
  
  // 检查是否有特定权限
  const can = async (permission: string) => {
    return await authStore.hasPermission(permission);
  };
  
  // 检查是否为管理员
  const canAdmin = computed(() => authStore.isAdmin);
  
  // 检查是否为版主
  const canModerate = computed(() => authStore.isModerator);
  
  // 检查是否可读
  const canRead = computed(() => authStore.permissions.value.canRead);
  
  // 检查是否可写
  const canWrite = computed(() => authStore.permissions.value.canWrite);
  
  // 检查是否可删除
  const canDelete = computed(() => authStore.permissions.value.canDelete);
  
  // 检查是否可管理
  const canManage = computed(() => authStore.permissions.value.canManage);
  
  // 检查用户是否活跃
  const isUserActive = computed(() => authStore.isActive);
  
  return {
    can,
    canAdmin,
    canModerate,
    canRead,
    canWrite,
    canDelete,
    canManage,
    isUserActive,
  };
}

// ==================== 路由守卫组合式函数 ====================

/**
 * 使用路由守卫
 * @returns 路由守卫相关方法
 */
export function useAuthGuard() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  // 检查是否已认证
  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      // 保存当前路径，登录后跳转回来
      const currentPath = router.currentRoute.value.fullPath;
      router.push({
        path: '/login',
        query: { redirect: currentPath },
      });
      return false;
    }
    return true;
  };
  
  // 检查是否为管理员
  const requireAdmin = () => {
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      router.push('/403');
      return false;
    }
    return true;
  };
  
  // 检查是否为版主或管理员
  const requireModerator = () => {
    if (!authStore.isAuthenticated || (!authStore.isAdmin && !authStore.isModerator)) {
      router.push('/403');
      return false;
    }
    return true;
  };
  
  // 检查是否为活跃用户
  const requireActive = () => {
    if (!authStore.isAuthenticated || !authStore.isActive) {
      router.push('/account-suspended');
      return false;
    }
    return true;
  };
  
  return {
    requireAuth,
    requireAdmin,
    requireModerator,
    requireActive,
  };
}

// ==================== 密码验证组合式函数 ====================

/**
 * 使用密码验证
 * @returns 密码验证相关方法
 */
export function usePasswordValidation() {
  const password = ref('');
  const confirmPassword = ref('');
  const strength = computed(() => utils.getPasswordStrength(password.value));
  const isValid = computed(() => {
    return password.value.length >= 8 && 
           password.value === confirmPassword.value &&
           strength.value.score >= 2;
  });
  
  const errors = computed(() => {
    const errors: string[] = [];
    
    if (password.value.length < 8) {
      errors.push('密码长度至少8位');
    }
    
    if (password.value !== confirmPassword.value) {
      errors.push('两次输入的密码不一致');
    }
    
    if (strength.value.score < 2) {
      errors.push('密码强度太弱');
    }
    
    return errors;
  });
  
  return {
    password,
    confirmPassword,
    strength,
    isValid,
    errors,
  };
}

// ==================== 用户名验证组合式函数 ====================

/**
 * 使用用户名验证
 * @returns 用户名验证相关方法
 */
export function useUsernameValidation() {
  const username = ref('');
  const isValid = computed(() => utils.validateUsername(username.value).isValid);
  const validation = computed(() => utils.validateUsername(username.value));
  
  return {
    username,
    isValid,
    validation,
  };
}

// ==================== 邮箱验证组合式函数 ====================

/**
 * 使用邮箱验证
 * @returns 邮箱验证相关方法
 */
export function useEmailValidation() {
  const email = ref('');
  const isValid = computed(() => utils.validateEmail(email.value).isValid);
  const validation = computed(() => utils.validateEmail(email.value));
  
  return {
    email,
    isValid,
    validation,
  };
}

// ==================== 表单验证组合式函数 ====================

/**
 * 使用表单验证
 * @returns 表单验证相关方法
 */
export function useFormValidation() {
  const errors = ref<Record<string, string[]>>({});
  const isValid = computed(() => Object.keys(errors.value).length === 0);
  
  // 设置字段错误
  const setFieldError = (field: string, message: string) => {
    if (!errors.value[field]) {
      errors.value[field] = [];
    }
    errors.value[field].push(message);
  };
  
  // 清除字段错误
  const clearFieldError = (field: string) => {
    delete errors.value[field];
  };
  
  // 清除所有错误
  const clearErrors = () => {
    errors.value = {};
  };
  
  // 验证字段
  const validateField = (field: string, value: any, rules: Array<(value: any) => string | null>) => {
    clearFieldError(field);
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        setFieldError(field, error);
        break;
      }
    }
  };
  
  // 验证表单
  const validateForm = (fields: Record<string, any>, rules: Record<string, Array<(value: any) => string | null>>) => {
    clearErrors();
    
    for (const [field, value] of Object.entries(fields)) {
      if (rules[field]) {
        validateField(field, value, rules[field]);
      }
    }
    
    return isValid.value;
  };
  
  return {
    errors,
    isValid,
    setFieldError,
    clearFieldError,
    clearErrors,
    validateField,
    validateForm,
  };
}