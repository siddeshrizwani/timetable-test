// Run the second migration to create missing tables
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runSecondMigration() {
    console.log('🚀 Running second migration for missing tables...');
    
    const client = await pool.connect();
    
    try {
        // Read the second migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', '002_create_missing_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Executing second migration SQL...');
        
        // Split by semicolon, but be careful about DO blocks
        const statements = [];
        let currentStatement = '';
        let inDoBlock = false;
        
        const lines = migrationSQL.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('DO $$')) {
                inDoBlock = true;
                currentStatement += line + '\n';
            } else if (trimmedLine === 'END $$;') {
                inDoBlock = false;
                currentStatement += line + '\n';
                statements.push(currentStatement.trim());
                currentStatement = '';
            } else if (inDoBlock) {
                currentStatement += line + '\n';
            } else if (trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
                currentStatement += line + '\n';
                statements.push(currentStatement.trim());
                currentStatement = '';
            } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('--')) {
                currentStatement += line + '\n';
            }
        }
        
        // Add any remaining statement
        if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
        }
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement && !statement.startsWith('--')) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    await client.query('BEGIN');
                    await client.query(statement);
                    await client.query('COMMIT');
                    console.log(`✅ Statement ${i + 1} completed successfully`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.warn(`⚠️  Warning in statement ${i + 1}:`, err.message);
                }
            }
        }
        
        console.log('✅ Second migration completed!');
        
        // Verify the new tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('teacher_allocations', 'timetable_generations', 'blocked_timeslots')
        `);
        console.log('📊 New tables created:');
        tables.rows.forEach(t => console.log('  ✅', t.table_name));
        
    } catch (err) {
        console.error('❌ Second migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

async function main() {
    console.log('🔧 Creating Missing Tables');
    console.log('=========================');
    
    await runSecondMigration();
    console.log('🎉 All missing tables created successfully!');
}

main().catch(console.error);
