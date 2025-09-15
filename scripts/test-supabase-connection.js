#!/usr/bin/env node

/**
 * Supabase 连接测试脚本
 * 用于验证 Supabase 项目配置是否正确
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 加载环境变量
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.development');
    const envContent = readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return env;
  } catch (error) {
    console.warn('无法加载 .env.development 文件，使用默认值');
    return {};
  }
}

const env = loadEnvFile();

// 配置
const config = {
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'development',
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || 'development_service',
  databaseUrl: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
};

// 创建客户端
const publicClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
const serviceClient = createClient(config.supabaseUrl, config.serviceRoleKey);

// 测试结果
const testResults = {
  passed: 0,
  failed: 0,
  tests: [] as any[]
};

// 测试函数
async function test(name: string, testFn: () => Promise<boolean>) {
  try {
    console.log(`🔍 测试: ${name}`);
    const result = await testFn();
    
    if (result) {
      console.log(`✅ 通过: ${name}`);
      testResults.passed++;
      testResults.tests.push({ name, status: 'passed' });
    } else {
      console.log(`❌ 失败: ${name}`);
      testResults.failed++;
      testResults.tests.push({ name, status: 'failed' });
    }
  } catch (error) {
    console.log(`❌ 错误: ${name} - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'error', error: error.message });
  }
}

// 测试套件
async function runTests() {
  console.log('🚀 开始 Supabase 连接测试...\n');
  
  // 1. 测试公共客户端连接
  await test('公共客户端连接', async () => {
    const { data, error } = await publicClient.from('pg_catalog.pg_tables').select('tablename').limit(1);
    return !error && data !== null;
  });
  
  // 2. 测试服务角色客户端连接
  await test('服务角色客户端连接', async () => {
    const { data, error } = await serviceClient.from('pg_catalog.pg_tables').select('tablename').limit(1);
    return !error && data !== null;
  });
  
  // 3. 测试认证服务
  await test('认证服务', async () => {
    const { data, error } = await publicClient.auth.getSession();
    return !error && data !== null;
  });
  
  // 4. 测试存储服务
  await test('存储服务', async () => {
    try {
      const { data, error } = await publicClient.storage.getBucket('blog-images');
      if (error && error.message.includes('not found')) {
        // 如果桶不存在，尝试创建
        const { error: createError } = await serviceClient.storage.createBucket('blog-images', {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
        return !createError;
      }
      return !error && data !== null;
    } catch (error) {
      return false;
    }
  });
  
  // 5. 测试数据库基本操作
  await test('数据库基本操作', async () => {
    const { data, error } = await publicClient
      .from('pg_catalog.pg_settings')
      .select('name, setting')
      .limit(5);
    return !error && data !== null && data.length > 0;
  });
  
  // 6. 测试实时连接
  await test('实时连接', async () => {
    try {
      const channel = publicClient.channel('test-connection');
      const subscription = channel.subscribe();
      
      // 等待连接建立
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isConnected = channel.state === 'subscribed';
      subscription.unsubscribe();
      
      return isConnected;
    } catch (error) {
      return false;
    }
  });
  
  // 7. 测试配置信息
  await test('配置信息', async () => {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missing = required.filter(key => !config[key]);
    return missing.length === 0;
  });
  
  // 输出测试结果
  console.log('\n📊 测试结果:');
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // 输出详细信息
  if (testResults.failed > 0) {
    console.log('\n📋 失败的测试:');
    testResults.tests
      .filter(test => test.status !== 'passed')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.error || '失败'}`);
      });
  }
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      supabaseUrl: config.supabaseUrl,
      hasAnonKey: !!config.supabaseAnonKey,
      hasServiceKey: !!config.serviceRoleKey
    },
    results: testResults
  };
  
  // 保存报告
  const reportPath = resolve(process.cwd(), 'supabase-test-report.json');
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存到: ${reportPath}`);
  
  // 返回结果
  if (testResults.failed > 0) {
    console.log('\n❌ 部分测试失败，请检查配置');
    process.exit(1);
  } else {
    console.log('\n🎉 所有测试通过！Supabase 配置正确');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});