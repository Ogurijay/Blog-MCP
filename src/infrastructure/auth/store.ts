// 认证状态管理
// 使用 Pinia 管理全局认证状态

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  User, 
  Session, 
  AuthError,
  AuthResponse,
  Provider 
} from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/client';

// 扩展用户信息
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  bio?: string;
  website?: string;
  location?: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
}

// 登录选项
export interface SignInOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 注册选项
export interface SignUpOptions {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  redirectTo?: string;
}

// 社交登录选项
export interface SocialSignInOptions {
  provider: Provider;
  redirectTo?: string;
  scopes?: string;
}

// 重置密码选项
export interface ResetPasswordOptions {
  email: string;
  redirectTo?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const profile = ref<UserProfile | null>(null);
  const session = ref<Session | null>(null);
  const isLoading = ref(false);
  const permissions = ref({
    canRead: false,
    canWrite: false,
    canDelete: false,
    canManage: false,
  });

  // 计算属性
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => profile.value?.role === 'admin');
  const isModerator = computed(() => profile.value?.role === 'moderator');
  const isActive = computed(() => profile.value?.status === 'active');

  // Supabase 服务
  const supabase = new SupabaseService();

  // 初始化认证状态
  const initializeAuth = async () => {
    isLoading.value = true;
    
    try {
      // 获取当前会话
      const sessionData = await supabase.getCurrentSession();
      session.value = sessionData;
      
      if (sessionData?.user) {
        user.value = sessionData.user;
        await loadUserProfile(sessionData.user.id);
        await loadUserPermissions();
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error);
      clearAuthState();
    } finally {
      isLoading.value = false;
    }
  };

  // 加载用户资料
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.getClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      profile.value = data;
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  };

  // 加载用户权限
  const loadUserPermissions = async () => {
    try {
      const userPermissions = await supabase.getUserPermissions();
      permissions.value = userPermissions;
    } catch (error) {
      console.error('加载用户权限失败:', error);
    }
  };

  // 用户注册
  const signUp = async (options: SignUpOptions) => {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase.signUp(options.email, options.password, {
        redirectTo: options.redirectTo,
        data: {
          username: options.username,
          full_name: options.fullName,
        },
      });

      if (error) throw error;

      // 注册成功后创建用户资料
      if (data.user) {
        await createUserProfile(data.user.id, {
          username: options.username,
          full_name: options.fullName,
          email: options.email,
        });
      }

      return { success: true, data };
    } catch (error) {
      console.error('用户注册失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '注册失败' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 用户登录
  const signIn = async (options: SignInOptions) => {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase.signIn(options.email, options.password);

      if (error) throw error;

      // 登录成功后更新状态
      if (data.user && data.session) {
        user.value = data.user;
        session.value = data.session;
        await loadUserProfile(data.user.id);
        await loadUserPermissions();
      }

      return { success: true, data };
    } catch (error) {
      console.error('用户登录失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '登录失败' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 社交登录
  const signInWithSocial = async (options: SocialSignInOptions) => {
    try {
      const { data, error } = await supabase.signInWithOAuth(
        options.provider,
        {
          redirectTo: options.redirectTo,
          scopes: options.scopes,
        }
      );

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('社交登录失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '社交登录失败' 
      };
    }
  };

  // 用户登出
  const signOut = async () => {
    isLoading.value = true;
    
    try {
      await supabase.signOut();
      clearAuthState();
      return { success: true };
    } catch (error) {
      console.error('用户登出失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '登出失败' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 重置密码
  const resetPassword = async (options: ResetPasswordOptions) => {
    try {
      const { data, error } = await supabase.resetPassword(
        options.email,
        options.redirectTo
      );

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('重置密码失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '重置密码失败' 
      };
    }
  };

  // 更新密码
  const updatePassword = async (password: string) => {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase.updatePassword(password);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('更新密码失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '更新密码失败' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户信息
  const updateUser = async (attributes: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }) => {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase.updateUser(attributes);

      if (error) throw error;

      // 更新本地状态
      if (data.user) {
        user.value = data.user;
        if (attributes.data) {
          await updateUserProfile(data.user.id, attributes.data);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : '更新用户信息失败' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户资料
  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.getClient()
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      profile.value = data;
      return { success: true, data };
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return { success: false, error: '更新用户资料失败' };
    }
  };

  // 创建用户资料
  const createUserProfile = async (userId: string, profileData: {
    username: string;
    email: string;
    full_name?: string;
  }) => {
    try {
      const { data, error } = await supabase.getClient()
        .from('profiles')
        .insert([
          {
            id: userId,
            username: profileData.username,
            email: profileData.email,
            full_name: profileData.full_name,
            role: 'user',
            status: 'active',
            email_notifications: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      profile.value = data;
      return { success: true, data };
    } catch (error) {
      console.error('创建用户资料失败:', error);
      return { success: false, error: '创建用户资料失败' };
    }
  };

  // 检查权限
  const hasPermission = async (permission: string) => {
    try {
      return await supabase.hasPermission(permission);
    } catch (error) {
      console.error('检查权限失败:', error);
      return false;
    }
  };

  // 清除认证状态
  const clearAuthState = () => {
    user.value = null;
    profile.value = null;
    session.value = null;
    permissions.value = {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canManage: false,
    };
  };

  // 刷新认证状态
  const refreshAuth = async () => {
    await initializeAuth();
  };

  // 监听认证状态变化
  const setupAuthListener = () => {
    const { data: { subscription } } = supabase.subscribeAuth(
      async (event, session) => {
        console.log('认证状态变化:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            session.value = session;
            user.value = session?.user || null;
            if (user.value) {
              await loadUserProfile(user.value.id);
              await loadUserPermissions();
            }
            break;
            
          case 'SIGNED_OUT':
            clearAuthState();
            break;
            
          case 'TOKEN_REFRESHED':
            session.value = session;
            break;
            
          case 'USER_UPDATED':
            if (session?.user) {
              user.value = session.user;
              await loadUserProfile(session.user.id);
            }
            break;
        }
      }
    );

    return subscription;
  };

  return {
    // 状态
    user,
    profile,
    session,
    isLoading,
    permissions,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isModerator,
    isActive,
    
    // 方法
    initializeAuth,
    signUp,
    signIn,
    signInWithSocial,
    signOut,
    resetPassword,
    updatePassword,
    updateUser,
    updateUserProfile,
    hasPermission,
    refreshAuth,
    setupAuthListener,
    clearAuthState,
  };
});