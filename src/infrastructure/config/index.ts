// Blog-MCP 配置管理

import { AppConfig } from '../types';

// 默认配置
const defaultConfig: AppConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  app: {
    name: 'Blog-MCP',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: '智能化博客系统',
    author: 'Blog-MCP Team',
  },
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    provider: (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'local') || 'openai',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  },
};

// 配置验证
export const validateConfig = (config: AppConfig): boolean => {
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.error('Supabase 配置缺失');
    return false;
  }

  if (config.ai.enabled && !config.ai.apiKey) {
    console.error('AI 功能已启用但 API 密钥缺失');
    return false;
  }

  return true;
};

// 获取配置
export const getConfig = (): AppConfig => {
  const config = defaultConfig;
  
  if (!validateConfig(config)) {
    throw new Error('配置验证失败');
  }

  return config;
};

// 环境变量工具
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`环境变量 ${key} 未设置`);
  }
  return value || defaultValue || '';
};

// 布尔值环境变量
export const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

// 数字环境变量
export const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return num;
};

export default getConfig;