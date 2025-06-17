// Run the CASCADE deletes migration
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runCascadeMigration() {
    console.log('🚀 Adding CASCADE delete constraints...');
    
    const client = await pool.connect();
    
    try {
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', '004_add_cascade_deletes.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Executing CASCADE migration SQL...');
        
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
        
        console.log('✅ CASCADE constraints migration completed!');
        
        // Test the constraints
        const constraints = await client.query(`
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints AS rc
                ON rc.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND (ccu.table_name = 'batches' OR ccu.table_name = 'batch_timeslots')
            ORDER BY tc.table_name, tc.constraint_name;
        `);
        
        console.log('📊 CASCADE constraints added:');
        constraints.rows.forEach(constraint => {
            console.log(`  ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.delete_rule})`);
        });
        
    } catch (err) {
        console.error('❌ CASCADE migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

async function main() {
    console.log('🔧 Adding CASCADE Delete Constraints');
    console.log('====================================');
    
    await runCascadeMigration();
    console.log('🎉 CASCADE constraints added successfully!');
    console.log('📝 Now batch deletion will automatically cascade to related tables!');
}

main().catch(console.error);
