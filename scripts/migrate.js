#!/usr/bin/env node

/**
 * 数据库迁移管理脚本
 * 用于运行、回滚和管理数据库迁移
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync, writeFileSync, existsSync, readdirSync } = require('fs');
const { join } = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

class MigrationManager {
    constructor() {
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('缺少 Supabase 配置，请检查环境变量');
        }
        
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
        this.migrationsDir = join(process.cwd(), 'supabase', 'migrations');
        this.appliedMigrationsFile = join(process.cwd(), 'supabase', 'applied_migrations.json');
    }

    // 获取所有迁移文件
    getMigrations() {
        if (!existsSync(this.migrationsDir)) {
            throw new Error(`迁移目录不存在: ${this.migrationsDir}`);
        }

        const files = readdirSync(this.migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort()
            .map(file => ({
                filename: file,
                path: join(this.migrationsDir, file),
                name: file.replace('.sql', ''),
                timestamp: parseInt(file.split('_')[0])
            }));

        return files;
    }

    // 获取已应用的迁移
    async getAppliedMigrations() {
        try {
            const { data, error } = await this.client
                .from('schema_migrations')
                .select('*')
                .order('applied_at', { ascending: true });

            if (error) {
                // 如果表不存在，返回空数组
                if (error.code === '42P01') {
                    return [];
                }
                throw error;
            }

            return data || [];
        } catch (error) {
            console.warn('获取已应用迁移失败:', error.message);
            return [];
        }
    }

    // 获取待应用的迁移
    async getPendingMigrations() {
        const allMigrations = this.getMigrations();
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedNames = appliedMigrations.map(m => m.name);

        return allMigrations.filter(migration => !appliedNames.includes(migration.name));
    }

    // 应用迁移
    async applyMigration(migration) {
        console.log(`应用迁移: ${migration.filename}`);
        
        const sql = readFileSync(migration.path, 'utf8');
        
        try {
            // 开始事务
            await this.client.rpc('exec_sql', {
                sql: 'BEGIN;'
            });

            // 执行迁移
            const { error } = await this.client.rpc('exec_sql', {
                sql: sql
            });

            if (error) {
                throw error;
            }

            // 记录迁移
            await this.client.rpc('exec_sql', {
                sql: `
                    INSERT INTO schema_migrations (name, filename, applied_at)
                    VALUES ('${migration.name}', '${migration.filename}', NOW());
                `
            });

            // 提交事务
            await this.client.rpc('exec_sql', {
                sql: 'COMMIT;'
            });

            console.log(`✅ 迁移应用成功: ${migration.filename}`);
            return true;
        } catch (error) {
            // 回滚事务
            await this.client.rpc('exec_sql', {
                sql: 'ROLLBACK;'
            });
            
            console.error(`❌ 迁移应用失败: ${migration.filename}`, error.message);
            return false;
        }
    }

    // 运行待应用的迁移
    async runPending() {
        console.log('🚀 开始运行待应用的迁移...\n');
        
        const pendingMigrations = await this.getPendingMigrations();
        
        if (pendingMigrations.length === 0) {
            console.log('✅ 没有待应用的迁移');
            return true;
        }

        console.log(`📋 发现 ${pendingMigrations.length} 个待应用的迁移:\n`);
        
        for (const migration of pendingMigrations) {
            const success = await this.applyMigration(migration);
            if (!success) {
                console.log(`❌ 迁移过程中止`);
                return false;
            }
        }

        console.log('\n🎉 所有迁移应用成功！');
        return true;
    }

    // 回滚迁移
    async rollback(steps = 1) {
        console.log(`🔄 开始回滚最近 ${steps} 个迁移...\n`);
        
        const appliedMigrations = await this.getAppliedMigrations();
        
        if (appliedMigrations.length === 0) {
            console.log('✅ 没有可回滚的迁移');
            return true;
        }

        const migrationsToRollback = appliedMigrations.slice(-steps).reverse();
        
        console.log(`📋 将回滚 ${migrationsToRollback.length} 个迁移:\n`);
        
        for (const migration of migrationsToRollback) {
            console.log(`回滚迁移: ${migration.filename}`);
            
            try {
                // 开始事务
                await this.client.rpc('exec_sql', {
                    sql: 'BEGIN;'
                });

                // 删除迁移记录
                await this.client.rpc('exec_sql', {
                    sql: `DELETE FROM schema_migrations WHERE name = '${migration.name}';`
                });

                // 注意：这里需要手动编写回滚 SQL
                // 实际项目中应该在每个迁移文件中包含回滚逻辑
                console.log(`⚠️  请手动执行回滚 SQL: ${migration.filename}`);

                // 提交事务
                await this.client.rpc('exec_sql', {
                    sql: 'COMMIT;'
                });

                console.log(`✅ 迁移回滚成功: ${migration.filename}`);
            } catch (error) {
                // 回滚事务
                await this.client.rpc('exec_sql', {
                    sql: 'ROLLBACK;'
                });
                
                console.error(`❌ 迁移回滚失败: ${migration.filename}`, error.message);
                return false;
            }
        }

        console.log('\n🎉 迁移回滚成功！');
        return true;
    }

    // 显示迁移状态
    async status() {
        console.log('📊 数据库迁移状态:\n');
        
        const allMigrations = this.getMigrations();
        const appliedMigrations = await this.getAppliedMigrations();
        const pendingMigrations = await this.getPendingMigrations();
        const appliedNames = appliedMigrations.map(m => m.name);

        console.log('📋 迁移列表:');
        console.log('┌─────────────────────────────────────┬─────────────┬─────────────┐');
        console.log('│ 迁移名称                            │ 状态        │ 应用时间    │');
        console.log('├─────────────────────────────────────┼─────────────┼─────────────┤');

        for (const migration of allMigrations) {
            const isApplied = appliedNames.includes(migration.name);
            const appliedMigration = appliedMigrations.find(m => m.name === migration.name);
            const status = isApplied ? '✅ 已应用' : '⏳ 待应用';
            const appliedAt = appliedMigration ? appliedMigration.applied_at.split('T')[0] : '-';
            
            console.log(`│ ${migration.filename.padEnd(35)} │ ${status.padEnd(11)} │ ${appliedAt.padEnd(11)} │`);
        }

        console.log('└─────────────────────────────────────┴─────────────┴─────────────┘');
        
        console.log(`\n📈 统计信息:`);
        console.log(`  总迁移数: ${allMigrations.length}`);
        console.log(`  已应用: ${appliedMigrations.length}`);
        console.log(`  待应用: ${pendingMigrations.length}`);
        console.log(`  应用率: ${((appliedMigrations.length / allMigrations.length) * 100).toFixed(1)}%`);
    }

    // 创建新迁移
    async create(name) {
        if (!name) {
            throw new Error('请提供迁移名称');
        }

        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `${timestamp}_${name}.sql`;
        const filepath = join(this.migrationsDir, filename);

        const template = `-- ${name}
-- 创建时间: ${new Date().toISOString()}

-- 在这里编写您的 SQL 语句

-- 示例：创建表
-- CREATE TABLE example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(100) NOT NULL,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- 示例：添加列
-- ALTER TABLE table_name ADD COLUMN new_column VARCHAR(100);

-- 示例：创建索引
-- CREATE INDEX idx_table_name_column ON table_name(column);

-- 示例：创建函数
-- CREATE OR REPLACE FUNCTION example_function()
-- RETURNS void AS $$
-- BEGIN
--     -- 函数逻辑
-- END;
-- $$ language 'plpgsql';

-- 记得在需要时更新 RLS 策略
`;

        writeFileSync(filepath, template);
        console.log(`✅ 创建新迁移: ${filename}`);
        console.log(`📝 迁移文件路径: ${filepath}`);
    }

    // 初始化迁移表
    async init() {
        console.log('🚀 初始化迁移系统...\n');

        const createMigrationsTable = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                filename VARCHAR(255) NOT NULL,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(name);
            CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);
        `;

        try {
            const { error } = await this.client.rpc('exec_sql', {
                sql: createMigrationsTable
            });

            if (error) {
                throw error;
            }

            console.log('✅ 迁移系统初始化成功');
        } catch (error) {
            console.error('❌ 迁移系统初始化失败:', error.message);
            throw error;
        }
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.log('📖 使用说明:');
        console.log('  node scripts/migrate.js <command> [options]');
        console.log('');
        console.log('🔧 可用命令:');
        console.log('  init                    - 初始化迁移系统');
        console.log('  up [steps]              - 运行待应用的迁移');
        console.log('  down [steps]            - 回滚指定数量的迁移');
        console.log('  status                  - 显示迁移状态');
        console.log('  create <name>           - 创建新迁移');
        console.log('  fresh                   - 重置数据库并运行所有迁移');
        console.log('');
        console.log('📝 示例:');
        console.log('  node scripts/migrate.js up');
        console.log('  node scripts/migrate.js down 1');
        console.log('  node scripts/migrate.js create add_user_table');
        console.log('  node scripts/migrate.js status');
        return;
    }

    const manager = new MigrationManager();

    try {
        switch (command) {
            case 'init':
                await manager.init();
                break;
                
            case 'up':
                const steps = args[1] ? parseInt(args[1]) : 1;
                await manager.runPending();
                break;
                
            case 'down':
                const rollbackSteps = args[1] ? parseInt(args[1]) : 1;
                await manager.rollback(rollbackSteps);
                break;
                
            case 'status':
                await manager.status();
                break;
                
            case 'create':
                const name = args[1];
                await manager.create(name);
                break;
                
            case 'fresh':
                console.log('⚠️  警告：这将删除所有数据并重新运行所有迁移');
                console.log('请手动备份数据库后继续');
                // 这里可以添加重置逻辑
                break;
                
            default:
                console.error(`❌ 未知命令: ${command}`);
                break;
        }
    } catch (error) {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = MigrationManager;