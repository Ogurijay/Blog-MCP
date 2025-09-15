/**
 * Supabase 配置验证工具
 * 用于验证 Supabase 项目配置是否正确
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 环境变量验证接口
interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL: string;
}

// 验证结果接口
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvConfig>;
}

/**
 * 验证环境变量配置
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    config: {}
  };

  // 必需的环境变量
  const requiredVars: (keyof EnvConfig)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  // 可选的环境变量
  const optionalVars: (keyof EnvConfig)[] = [
    'DATABASE_URL'
  ];

  // 验证必需变量
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      result.errors.push(`环境变量 ${varName} 未设置或为空`);
      result.valid = false;
    } else {
      result.config[varName] = value;
    }
  });

  // 验证可选变量
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      result.warnings.push(`环境变量 ${varName} 未设置，使用默认值`);
    } else {
      result.config[varName] = value;
    }
  });

  // 验证 URL 格式
  if (result.config.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(result.config.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      result.errors.push('NEXT_PUBLIC_SUPABASE_URL 不是有效的 URL');
      result.valid = false;
    }
  }

  // 验证 API 密钥格式
  if (result.config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (!result.config.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
      result.warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY 可能不是有效的 JWT 格式');
    }
  }

  return result;
}

/**
 * 测试 Supabase 连接
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const client = createClient(url, anonKey);
    
    // 测试基本连接
    const { data, error } = await client.from('pg_catalog.pg_tables').select('tablename').limit(1);
    
    if (error) {
      return {
        success: false,
        message: `连接失败: ${error.message}`,
        details: error
      };
    }

    // 测试认证服务
    const { data: authData, error: authError } = await client.auth.getSession();
    
    if (authError) {
      return {
        success: false,
        message: `认证服务失败: ${authError.message}`,
        details: authError
      };
    }

    return {
      success: true,
      message: '连接成功',
      details: {
        database: true,
        auth: true,
        tables: data
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `连接测试失败: ${error.message}`,
      details: error
    };
  }
}

/**
 * 获取 Supabase 项目信息
 */
export async function getSupabaseProjectInfo(url: string, serviceKey: string): Promise<{
  success: boolean;
  project?: any;
  error?: string;
}> {
  try {
    const client = createClient(url, serviceKey);
    
    // 获取项目信息
    const { data: projectData, error } = await client.rpc('get_project_info');
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      project: projectData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成配置报告
 */
export function generateConfigReport(validation: ValidationResult): string {
  let report = '🔍 Supabase 配置验证报告\n\n';
  
  report += `✅ 验证状态: ${validation.valid ? '通过' : '失败'}\n\n`;
  
  if (validation.config.NEXT_PUBLIC_SUPABASE_URL) {
    report += `📡 项目 URL: ${validation.config.NEXT_PUBLIC_SUPABASE_URL}\n`;
  }
  
  if (validation.config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const keyPreview = validation.config.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...';
    report += `🔑 匿名密钥: ${keyPreview}\n`;
  }
  
  if (validation.config.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceKeyPreview = validation.config.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...';
    report += `🔧 服务密钥: ${serviceKeyPreview}\n`;
  }
  
  report += '\n';
  
  if (validation.errors.length > 0) {
    report += '❌ 错误:\n';
    validation.errors.forEach(error => {
      report += `  - ${error}\n`;
    });
    report += '\n';
  }
  
  if (validation.warnings.length > 0) {
    report += '⚠️  警告:\n';
    validation.warnings.forEach(warning => {
      report += `  - ${warning}\n`;
    });
    report += '\n';
  }
  
  return report;
}

/**
 * 完整的配置验证流程
 */
export async function validateSupabaseConfig(): Promise<ValidationResult & {
  connectionTest?: {
    success: boolean;
    message: string;
  };
}> {
  // 验证环境变量
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    return validation;
  }
  
  // 测试连接
  const connectionTest = await testSupabaseConnection(
    validation.config.NEXT_PUBLIC_SUPABASE_URL!,
    validation.config.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  if (!connectionTest.success) {
    validation.errors.push(connectionTest.message);
    validation.valid = false;
  }
  
  return {
    ...validation,
    connectionTest
  };
}

// 主函数
export async function main() {
  console.log('🚀 开始验证 Supabase 配置...\n');
  
  try {
    const result = await validateSupabaseConfig();
    
    const report = generateConfigReport(result);
    console.log(report);
    
    if (result.connectionTest) {
      console.log('🔗 连接测试:');
      console.log(`  状态: ${result.connectionTest.success ? '✅ 成功' : '❌ 失败'}`);
      console.log(`  消息: ${result.connectionTest.message}\n`);
    }
    
    if (result.valid) {
      console.log('🎉 配置验证通过！');
    } else {
      console.log('❌ 配置验证失败，请修复错误后重试');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}