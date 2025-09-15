// 认证中间件
// 提供路由守卫和权限检查中间件

import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../store';
import * as utils from '../utils';

// ==================== 路由守卫中间件 ====================

/**
 * 认证中间件
 * 检查用户是否已登录
 */
export async function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 如果路由不需要认证，直接通过
  if (!utils.requiresAuth(to.path)) {
    next();
    return;
  }
  
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    // 保存当前路径，登录后跳转回来
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }
  
  // 检查用户是否活跃
  if (!authStore.isActive) {
    next('/account-suspended');
    return;
  }
  
  next();
}

/**
 * 管理员中间件
 * 检查用户是否为管理员
 */
export async function adminMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }
  
  // 检查用户是否为管理员
  if (!authStore.isAdmin) {
    next('/403');
    return;
  }
  
  // 检查用户是否活跃
  if (!authStore.isActive) {
    next('/account-suspended');
    return;
  }
  
  next();
}

/**
 * 版主中间件
 * 检查用户是否为版主或管理员
 */
export async function moderatorMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }
  
  // 检查用户是否为版主或管理员
  if (!authStore.isModerator && !authStore.isAdmin) {
    next('/403');
    return;
  }
  
  // 检查用户是否活跃
  if (!authStore.isActive) {
    next('/account-suspended');
    return;
  }
  
  next();
}

/**
 * 游客中间件
 * 已登录用户不能访问游客页面
 */
export async function guestMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 如果用户已登录，重定向到首页
  if (authStore.isAuthenticated) {
    next('/');
    return;
  }
  
  next();
}

/**
 * 邮箱验证中间件
 * 检查用户是否已验证邮箱
 */
export async function emailVerificationMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }
  
  // 检查用户是否已验证邮箱
  if (!utils.isEmailVerified(authStore.user)) {
    next('/auth/verify-email');
    return;
  }
  
  next();
}

/**
 * 权限中间件
 * 检查用户是否有特定权限
 */
export async function permissionMiddleware(
  permission: string
) {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();
    
    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }
    
    // 检查用户是否有权限
    const hasPermission = await authStore.hasPermission(permission);
    if (!hasPermission) {
      next('/403');
      return;
    }
    
    // 检查用户是否活跃
    if (!authStore.isActive) {
      next('/account-suspended');
      return;
    }
    
    next();
  };
}

// ==================== 全局前置守卫 ====================

/**
 * 全局前置守卫
 * 处理认证状态检查和路由跳转
 */
export async function globalBeforeEach(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Blog-MCP`;
  }
  
  // 检查是否需要认证
  if (utils.requiresAuth(to.path)) {
    // 如果用户未登录，跳转到登录页面
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }
    
    // 检查用户是否活跃
    if (!authStore.isActive) {
      next('/account-suspended');
      return;
    }
    
    // 检查是否需要管理员权限
    if (utils.requiresAdmin(to.path) && !authStore.isAdmin) {
      next('/403');
      return;
    }
    
    // 检查是否需要版主权限
    if (utils.requiresModerator(to.path) && !authStore.isModerator) {
      next('/403');
      return;
    }
  }
  
  // 如果用户已登录，不能访问认证页面
  if (authStore.isAuthenticated && to.meta.requiresGuest) {
    next('/');
    return;
  }
  
  next();
}

// ==================== 全局后置钩子 ====================

/**
 * 全局后置钩子
 * 处理页面切换后的逻辑
 */
export function globalAfterEach(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  // 滚动到页面顶部
  window.scrollTo(0, 0);
  
  // 这里可以添加其他逻辑，如：
  // - 记录页面访问
  // - 发送分析数据
  // - 更新用户最后活跃时间
}

// ==================== 路由配置 ====================

/**
 * 路由元信息
 */
export const routeMeta = {
  requiresAuth: true,          // 需要认证
  requiresGuest: false,        // 需要游客状态
  requiresAdmin: false,         // 需要管理员权限
  requiresModerator: false,    // 需要版主权限
  requiresEmailVerification: false, // 需要邮箱验证
  permission: '',             // 特定权限
  title: '',                   // 页面标题
  layout: 'default',           // 布局类型
};

/**
 * 路由配置示例
 */
export const routeConfig = {
  // 公共路由
  public: {
    path: '/',
    meta: {
      requiresAuth: false,
      requiresGuest: false,
      title: '首页',
    },
  },
  
  // 认证路由
  auth: {
    path: '/login',
    meta: {
      requiresAuth: false,
      requiresGuest: true,
      title: '登录',
    },
  },
  
  // 管理员路由
  admin: {
    path: '/admin',
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '管理后台',
    },
  },
  
  // 版主路由
  moderator: {
    path: '/moderator',
    meta: {
      requiresAuth: true,
      requiresModerator: true,
      title: '版主中心',
    },
  },
  
  // 需要邮箱验证的路由
  emailVerified: {
    path: '/settings',
    meta: {
      requiresAuth: true,
      requiresEmailVerification: true,
      title: '设置',
    },
  },
  
  // 需要特定权限的路由
  permission: {
    path: '/posts/create',
    meta: {
      requiresAuth: true,
      permission: 'write',
      title: '创建文章',
    },
  },
};

// ==================== 中间件组合器 ====================

/**
 * 组合多个中间件
 */
export function composeMiddleware(
  ...middlewares: Array<Parameters<typeof authMiddleware>>
) {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    for (const middleware of middlewares) {
      try {
        await middleware(to, from, next);
      } catch (error) {
        console.error('中间件执行失败:', error);
        next('/500');
        return;
      }
    }
  };
}

// ==================== 错误处理中间件 ====================

/**
 * 403 错误处理
 */
export function handle403() {
  return {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/errors/403.vue'),
    meta: {
      title: '禁止访问',
    },
  };
}

/**
 * 404 错误处理
 */
export function handle404() {
  return {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/404.vue'),
    meta: {
      title: '页面不存在',
    },
  };
}

/**
 * 500 错误处理
 */
export function handle500() {
  return {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/errors/500.vue'),
    meta: {
      title: '服务器错误',
    },
  };
}

/**
 * 账户暂停处理
 */
export function handleAccountSuspended() {
  return {
    path: '/account-suspended',
    name: 'AccountSuspended',
    component: () => import('@/views/errors/AccountSuspended.vue'),
    meta: {
      title: '账户已暂停',
    },
  };
}

// ==================== 导出中间件 ====================

export {
  authMiddleware,
  adminMiddleware,
  moderatorMiddleware,
  guestMiddleware,
  emailVerificationMiddleware,
  permissionMiddleware,
  globalBeforeEach,
  globalAfterEach,
  composeMiddleware,
  handle403,
  handle404,
  handle500,
  handleAccountSuspended,
};