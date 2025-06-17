const fs = require('fs');
const path = require('path');

console.log('🧹 Verifying project cleanup...');

const backendDir = path.join(__dirname, 'backend');
const rootDir = __dirname;

// Files that should NOT exist (cleaned up)
const removedFiles = [
    'backend/run-migration.js',
    'backend/run-second-migration.js', 
    'backend/run-batch-timeslots-migration.js',
    'backend/run-cascade-migration.js',
    'backend/cleanup-constraints.js',
    'backend/check-constraints-simple.js',
    'backend/check-constraints.js',
    'backend/check-data.js',
    'backend/check-schema.js',
    'backend/show-tables.js',
    'DEPLOY_SINGLE_SERVER.md',
    'DEPLOY_HEROKU.md',
    'DEPLOY_DIGITALOCEAN.md',
    'DEPLOYMENT_GUIDE.md'
];

// Files that SHOULD exist (kept/created)
const requiredFiles = [
    'backend/schema.sql',
    'backend/run-unified-schema.js',
    'backend/run-incremental-migrations.js',
    'backend/check-database.js',
    'backend/migrations/README.md',
    'DEPLOY_RAILWAY.md',
    'MIGRATION_GUIDE.md',
    'railway.json'
];

console.log('\n✅ Verifying removed files:');
let allClean = true;

removedFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ❌ ${file} still exists (should be removed)`);
        allClean = false;
    } else {
        console.log(`  ✓ ${file} removed`);
    }
});

console.log('\n✅ Verifying required files:');
requiredFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✓ ${file} exists`);
    } else {
        console.log(`  ❌ ${file} missing`);
        allClean = false;
    }
});

console.log('\n📋 Current scripts in package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    Object.keys(packageJson.scripts).forEach(script => {
        console.log(`  ✓ ${script}: ${packageJson.scripts[script]}`);
    });
} catch (err) {
    console.log('  ❌ Error reading package.json');
    allClean = false;
}

if (allClean) {
    console.log('\n🎉 Project cleanup verified! All files are properly organized.');
    console.log('\n📚 Current structure:');
    console.log('  • Unified schema: backend/schema.sql');
    console.log('  • New deployments: npm run migrate');
    console.log('  • Existing databases: npm run migrate:incremental');
    console.log('  • Database check: npm run check-db');
    console.log('  • Deployment guide: DEPLOY_RAILWAY.md');
} else {
    console.log('\n⚠️  Some cleanup issues found. Please review the output above.');
}
