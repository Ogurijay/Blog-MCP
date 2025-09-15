#!/usr/bin/env node

/**
 * Supabase 项目初始化脚本
 * 用于创建必要的存储桶和基础配置
 */

import { createClient } from '@supabase/supabase-js';
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
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || 'development_service'
};

// 创建服务角色客户端
const supabase = createClient(config.supabaseUrl, config.serviceRoleKey);

// 存储桶配置
const storageBuckets = [
  {
    name: 'blog-images',
    options: {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    }
  },
  {
    name: 'user-avatars',
    options: {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    }
  },
  {
    name: 'attachments',
    options: {
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['*/*']
    }
  },
  {
    name: 'exports',
    options: {
      public: false,
      fileSizeLimit: 524288000, // 500MB
      allowedMimeTypes: ['application/json', 'text/csv', 'application/pdf']
    }
  }
];

// 创建存储桶
async function createStorageBuckets() {
  console.log('🪣 创建存储桶...');
  
  for (const bucket of storageBuckets) {
    try {
      console.log(`  创建桶: ${bucket.name}`);
      
      // 检查桶是否已存在
      const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(bucket.name);
      
      if (checkError && !checkError.message.includes('not found')) {
        throw checkError;
      }
      
      if (existingBucket) {
        console.log(`  ✅ 桶 ${bucket.name} 已存在`);
        continue;
      }
      
      // 创建新桶
      const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.options);
      
      if (error) {
        throw error;
      }
      
      console.log(`  ✅ 桶 ${bucket.name} 创建成功`);
    } catch (error) {
      console.error(`  ❌ 创建桶 ${bucket.name} 失败:`, error.message);
    }
  }
}

// 设置存储桶策略
async function setStoragePolicies() {
  console.log('\n🔐 设置存储策略...');
  
  const policies = [
    {
      bucket: 'blog-images',
      name: 'Public Access',
      definition: {
        schema: 'storage',
        table: 'objects',
        type: 'SELECT',
        using: 'bucket_id = \'blog-images\''
      }
    },
    {
      bucket: 'user-avatars',
      name: 'Public Access',
      definition: {
        schema: 'storage',
        table: 'objects',
        type: 'SELECT',
        using: 'bucket_id = \'user-avatars\''
      }
    },
    {
      bucket: 'attachments',
      name: 'Authenticated Users Access',
      definition: {
        schema: 'storage',
        table: 'objects',
        type: 'ALL',
        using: 'bucket_id = \'attachments\' AND auth.role() = \'authenticated\'',
        check: 'bucket_id = \'attachments\' AND auth.role() = \'authenticated\''
      }
    }
  ];
  
  for (const policy of policies) {
    try {
      console.log(`  设置策略: ${policy.name} (${policy.bucket})`);
      
      // 创建策略（这里简化处理，实际应该使用 SQL）
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "${policy.name}" ON storage.objects
          FOR ${policy.definition.type}
          TO authenticated
          USING (${policy.definition.using})
          ${policy.definition.check ? `WITH CHECK (${policy.definition.check})` : ''}
        `
      });
      
      if (error) {
        console.warn(`  ⚠️  策略 ${policy.name} 可能需要手动设置`);
      } else {
        console.log(`  ✅ 策略 ${policy.name} 设置成功`);
      }
    } catch (error) {
      console.warn(`  ⚠️  设置策略 ${policy.name} 时出错:`, error.message);
    }
  }
}

// 创建基础扩展
async function createExtensions() {
  console.log('\n🔧 创建数据库扩展...');
  
  const extensions = [
    'uuid-ossp',
    'pg_trgm',
    'vector',
    'pg_stat_statements'
  ];
  
  for (const extension of extensions) {
    try {
      console.log(`  创建扩展: ${extension}`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `CREATE EXTENSION IF NOT EXISTS "${extension}";`
      });
      
      if (error) {
        console.warn(`  ⚠️  扩展 ${extension} 可能已存在或创建失败`);
      } else {
        console.log(`  ✅ 扩展 ${extension} 创建成功`);
      }
    } catch (error) {
      console.warn(`  ⚠️  创建扩展 ${extension} 时出错:`, error.message);
    }
  }
}

// 验证配置
async function verifyConfiguration() {
  console.log('\n✅ 验证配置...');
  
  try {
    // 验证存储桶
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      return false;
    }
    
    const bucketNames = buckets.map(b => b.name);
    const requiredBuckets = storageBuckets.map(b => b.name);
    const missingBuckets = requiredBuckets.filter(name => !bucketNames.includes(name));
    
    if (missingBuckets.length > 0) {
      console.warn('⚠️  以下存储桶缺失:', missingBuckets.join(', '));
      return false;
    }
    
    console.log('✅ 所有存储桶创建成功');
    
    // 验证数据库连接
    const { data, error } = await supabase.from('pg_catalog.pg_settings').select('name').limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接正常');
    
    return true;
  } catch (error) {
    console.error('❌ 配置验证失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始 Supabase 项目初始化...\n');
  
  try {
    // 创建存储桶
    await createStorageBuckets();
    
    // 设置存储策略
    await setStoragePolicies();
    
    // 创建数据库扩展
    await createExtensions();
    
    // 验证配置
    const success = await verifyConfiguration();
    
    if (success) {
      console.log('\n🎉 Supabase 项目初始化成功！');
      console.log('\n📋 后续步骤:');
      console.log('1. 运行数据库迁移: npm run db:migrate');
      console.log('2. 设置 RLS 策略: npm run db:setup-rls');
      console.log('3. 运行种子数据: npm run db:seed');
    } else {
      console.log('\n❌ 初始化过程中遇到问题，请检查错误信息');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
main().catch(error => {
  console.error('初始化运行失败:', error);
  process.exit(1);
});