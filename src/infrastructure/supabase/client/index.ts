// Supabase 客户端完整封装
// 提供统一的数据库访问接口

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { getConfig } from '../config';
import { Database, DatabaseError } from '../types/database';

// 扩展的 Supabase 选项接口
export interface SupabaseOptions {
  persistSession?: boolean;
  autoRefreshToken?: boolean;
  detectSessionInUrl?: boolean;
  headers?: Record<string, string>;
}

// 文件上传选项
export interface FileUploadOptions {
  upsert?: boolean;
  contentType?: string;
  metadata?: Record<string, any>;
}

// 查询选项
export interface QueryOptions {
  select?: string;
  where?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
  single?: boolean;
}

// 订阅选项
export interface SubscriptionOptions {
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table?: string;
  filter?: string;
}

// 健康检查结果
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  database: boolean;
  auth: boolean;
  storage: boolean;
  responseTime: number;
  error?: string;
}

// 用户权限类型
export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManage: boolean;
}

class SupabaseService {
  private client: SupabaseClient<Database>;
  private serviceClient: SupabaseClient<Database>;
  private options: SupabaseOptions;

  constructor(options: SupabaseOptions = {}) {
    const config = getConfig();
    this.options = {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...options
    };
    
    // 公共客户端
    this.client = createClient<Database>(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          persistSession: this.options.persistSession,
          autoRefreshToken: this.options.autoRefreshToken,
          detectSessionInUrl: this.options.detectSessionInUrl,
        },
        headers: this.options.headers,
      }
    );

    // 服务角色客户端（用于服务器端操作）
    this.serviceClient = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceKey,
      {
        auth: {
          persistSession: false,
        },
        headers: this.options.headers,
      }
    );
  }

  // ==================== 基础客户端方法 ====================

  // 获取公共客户端
  getClient(): SupabaseClient<Database> {
    return this.client;
  }

  // 获取服务角色客户端
  getServiceClient(): SupabaseClient<Database> {
    return this.serviceClient;
  }

  // ==================== 认证相关方法 ====================

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error) throw error;
    return user;
  }

  // 获取当前会话
  async getCurrentSession() {
    const { data: { session }, error } = await this.client.auth.getSession();
    if (error) throw error;
    return session;
  }

  // 用户注册
  async signUp(email: string, password: string, options?: {
    redirectTo?: string;
    data?: Record<string, any>;
  }) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        redirectTo: options?.redirectTo,
        data: options?.data,
      },
    });
    if (error) throw error;
    return data;
  }

  // 用户登录
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // 社交登录
  async signInWithOAuth(provider: 'google' | 'github' | 'twitter', options?: {
    redirectTo?: string;
    scopes?: string;
  }) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo,
        scopes: options?.scopes,
      },
    });
    if (error) throw error;
    return data;
  }

  // 用户登出
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  // 重置密码
  async resetPassword(email: string, redirectTo?: string) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  }

  // 更新密码
  async updatePassword(password: string) {
    const { data, error } = await this.client.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  }

  // 更新用户信息
  async updateUser(attributes: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }) {
    const { data, error } = await this.client.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  }

  // ==================== 权限管理 ====================

  // 检查用户权限
  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // 根据角色检查权限
      const role = data.role;
      const permissions = this.getRolePermissions(role);
      return permissions.includes(permission);
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }

  // 获取用户权限
  async getUserPermissions(): Promise<UserPermissions> {
    const user = await this.getCurrentUser();
    if (!user) {
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManage: false,
      };
    }

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return this.getPermissionsByRole(data.role, data.status);
    } catch (error) {
      console.error('获取用户权限失败:', error);
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManage: false,
      };
    }
  }

  // 根据角色获取权限
  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'user': ['read', 'write'],
      'moderator': ['read', 'write', 'moderate'],
      'admin': ['read', 'write', 'moderate', 'admin'],
    };
    return rolePermissions[role] || [];
  }

  // 根据角色和状态获取权限
  private getPermissionsByRole(role: string, status: string): UserPermissions {
    if (status !== 'active') {
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManage: false,
      };
    }

    switch (role) {
      case 'admin':
        return {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canManage: true,
        };
      case 'moderator':
        return {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canManage: false,
        };
      case 'user':
      default:
        return {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canManage: false,
        };
    }
  }

  // ==================== 文件存储方法 ====================

  // 上传文件
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options: FileUploadOptions = {}
  ) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options.upsert || false,
        contentType: options.contentType,
        metadata: options.metadata,
      });

    if (error) throw error;
    return data;
  }

  // 获取文件URL
  getFileUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // 获取签名URL（用于私有文件）
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 60) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  // 下载文件
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }

  // 删除文件
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) throw error;
  }

  // 批量删除文件
  async deleteFiles(bucket: string, paths: string[]) {
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) throw error;
  }

  // 列出文件
  async listFiles(bucket: string, path?: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .list(path, options);

    if (error) throw error;
    return data;
  }

  // ==================== 实时订阅方法 ====================

  // 订阅表变化
  subscribe<T = any>(
    table: string,
    callback: (payload: T) => void,
    options: SubscriptionOptions = {}
  ): RealtimeChannel {
    const subscription = this.client
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: options.table || table,
          filter: options.filter,
        },
        callback
      )
      .subscribe();

    return subscription;
  }

  // 订阅认证状态变化
  subscribeAuth(callback: (event: string, session: any) => void) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // 取消订阅
  unsubscribe(channel: RealtimeChannel) {
    this.client.removeChannel(channel);
  }

  // ==================== 通用查询方法 ====================

  // 通用查询
  async query<T = any>(
    table: keyof Database['public']['Tables'],
    options: QueryOptions = {}
  ) {
    let query = this.client.from(table).select(options.select || '*');

    if (options.where) {
      query = query.filter(options.where);
    }

    if (options.orderBy) {
      const [column, order] = options.orderBy.split(' ');
      query = query.order(column, { ascending: order !== 'desc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options.single) {
      const { data, error } = await query.single();
      if (error) throw error;
      return data as T;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  // 插入数据
  async insert<T = any>(
    table: keyof Database['public']['Tables'],
    data: any | any[],
    options?: {
      select?: string;
      returning?: 'minimal' | 'representation';
    }
  ) {
    let query = this.client.from(table).insert(data);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.returning) {
      query = query.select(options.returning);
    }

    const { data: result, error } = await query;
    if (error) throw error;
    return result as T;
  }

  // 更新数据
  async update<T = any>(
    table: keyof Database['public']['Tables'],
    data: any,
    options: {
      where: string;
      select?: string;
    }
  ) {
    let query = this.client.from(table).update(data);

    if (options.where) {
      query = query.filter(options.where);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    const { data: result, error } = await query;
    if (error) throw error;
    return result as T;
  }

  // 删除数据
  async delete(
    table: keyof Database['public']['Tables'],
    where: string,
    options?: {
      returning?: 'minimal' | 'representation';
    }
  ) {
    let query = this.client.from(table).delete().filter(where);

    if (options?.returning) {
      query = query.select(options.returning);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ==================== 批量操作方法 ====================

  // 批量插入
  async bulkInsert<T = any>(
    table: keyof Database['public']['Tables'],
    data: any[],
    options?: {
      batchSize?: number;
      select?: string;
    }
  ) {
    const batchSize = options?.batchSize || 100;
    const results: T[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await this.insert<T>(table, batch, {
        select: options?.select,
      });
      results.push(...(Array.isArray(result) ? result : [result]));
    }

    return results;
  }

  // 批量更新
  async bulkUpdate<T = any>(
    table: keyof Database['public']['Tables'],
    updates: Array<{ where: string; data: any }>,
    options?: {
      select?: string;
    }
  ) {
    const results: T[] = [];

    for (const update of updates) {
      const result = await this.update<T>(table, update.data, {
        where: update.where,
        select: options?.select,
      });
      results.push(...(Array.isArray(result) ? result : [result]));
    }

    return results;
  }

  // ==================== 健康检查方法 ====================

  // 健康检查
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const result: HealthCheckResult = {
      status: 'healthy',
      database: false,
      auth: false,
      storage: false,
      responseTime: 0,
    };

    try {
      // 检查数据库连接
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('count', { count: 'exact', head: true })
          .limit(1);

        result.database = !error;
      } catch (error) {
        console.error('数据库健康检查失败:', error);
      }

      // 检查认证服务
      try {
        await this.client.auth.getSession();
        result.auth = true;
      } catch (error) {
        console.error('认证健康检查失败:', error);
      }

      // 检查存储服务
      try {
        await this.client.storage.from('blog-images').list('', { limit: 1 });
        result.storage = true;
      } catch (error) {
        console.error('存储健康检查失败:', error);
      }

      result.responseTime = Date.now() - startTime;
      result.status = result.database && result.auth && result.storage ? 'healthy' : 'unhealthy';
    } catch (error) {
      result.status = 'unhealthy';
      result.error = error.message;
      console.error('健康检查失败:', error);
    }

    return result;
  }

  // ==================== 事务支持 ====================

  // 执行事务
  async transaction<T = any>(
    operations: Array<(client: SupabaseClient<Database>) => Promise<any>>
  ): Promise<T[]> {
    const results: T[] = [];
    
    try {
      // 开始事务
      await this.client.rpc('exec_sql', { sql: 'BEGIN;' });

      // 执行操作
      for (const operation of operations) {
        const result = await operation(this.client);
        results.push(result);
      }

      // 提交事务
      await this.client.rpc('exec_sql', { sql: 'COMMIT;' });

      return results;
    } catch (error) {
      // 回滚事务
      await this.client.rpc('exec_sql', { sql: 'ROLLBACK;' });
      throw error;
    }
  }

  // ==================== 错误处理 ====================

  // 处理数据库错误
  handleDatabaseError(error: any): DatabaseError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown database error',
      details: error.details || null,
      hint: error.hint || null,
    };
  }

  // ==================== 辅助方法 ====================

  // 获取表行数
  async getTableCount(table: keyof Database['public']['Tables'], where?: string): Promise<number> {
    let query = this.client.from(table).select('*', { count: 'exact', head: true });
    
    if (where) {
      query = query.filter(where);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  // 检查记录是否存在
  async exists(
    table: keyof Database['public']['Tables'],
    where: string
  ): Promise<boolean> {
    const { data, error } = await this.client
      .from(table)
      .select('id', { count: 'exact', head: true })
      .filter(where);

    if (error) throw error;
    return (data || []).length > 0;
  }
}

// 单例模式
let supabaseInstance: SupabaseService | null = null;

export const getSupabaseService = (options?: SupabaseOptions): SupabaseService => {
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseService(options);
  }
  return supabaseInstance;
};

// 重置服务实例（用于测试）
export const resetSupabaseService = () => {
  supabaseInstance = null;
};

export default SupabaseService;