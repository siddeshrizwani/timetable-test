// End-to-end test for timetable generation and viewing
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Timetable System End-to-End Test...\n');

// Test 1: Check if Python solver works
console.log('📝 Test 1: Python Solver');
try {
  const { execSync } = require('child_process');
  const result = execSync('python --version', { encoding: 'utf8' });
  console.log('✅ Python available:', result.trim());
  
  const ortoolsTest = execSync('python -c "import ortools; print(\'OR-Tools available\')"', { encoding: 'utf8' });
  console.log('✅ OR-Tools available');
} catch (error) {
  console.log('❌ Python/OR-Tools not available:', error.message);
}

// Test 2: Check solver output
console.log('\n📊 Test 2: Solver Output Files');
const solverOutputPath = path.join(__dirname, 'backend', 'engine', 'outputs');
if (fs.existsSync(solverOutputPath)) {
  const files = fs.readdirSync(solverOutputPath);
  console.log('✅ Solver output directory exists');
  console.log('📁 Output files:', files);
} else {
  console.log('❌ Solver output directory not found');
}

// Test 3: Check frontend public files
console.log('\n🌐 Test 3: Frontend Public Files');
const frontendPublicPath = path.join(__dirname, 'frontend', 'public');
if (fs.existsSync(frontendPublicPath)) {
  const files = fs.readdirSync(frontendPublicPath).filter(f => f.startsWith('timetable'));
  console.log('✅ Frontend public directory exists');
  console.log('📄 Timetable files:', files);
  
  // Test sample file structure
  const sampleFile = path.join(frontendPublicPath, 'timetable_output.json');
  if (fs.existsSync(sampleFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
      console.log('✅ Sample timetable file is valid JSON');
      console.log('📋 Status:', data.status);
      console.log('📊 Sessions:', data.solution?.timetable?.length || 0);
    } catch (error) {
      console.log('❌ Sample file is invalid:', error.message);
    }
  }
} else {
  console.log('❌ Frontend public directory not found');
}

// Test 4: Check API route file
console.log('\n🔌 Test 4: API Configuration');
const apiRoutePath = path.join(__dirname, 'backend', 'routes', 'apiRoutes.js');
if (fs.existsSync(apiRoutePath)) {
  const content = fs.readFileSync(apiRoutePath, 'utf8');
  const hasGenerateEndpoint = content.includes('generate-timetable');
  const hasTimetableEndpoint = content.includes('/timetable/:batchId');
  
  console.log('✅ API routes file exists');
  console.log('🔄 Generate endpoint:', hasGenerateEndpoint ? '✅' : '❌');
  console.log('👁️ Viewer endpoint:', hasTimetableEndpoint ? '✅' : '❌');
} else {
  console.log('❌ API routes file not found');
}

// Test 5: Check frontend components
console.log('\n⚛️ Test 5: Frontend Components');
const components = [
  'frontend/src/pages/admin/AdminDashboardOverview.jsx',
  'frontend/src/pages/admin/TimetableViewerPage.jsx'
];

components.forEach(comp => {
  const compPath = path.join(__dirname, comp);
  if (fs.existsSync(compPath)) {
    console.log(`✅ ${comp.split('/').pop()}`);
  } else {
    console.log(`❌ ${comp.split('/').pop()}`);
  }
});

console.log('\n🎉 End-to-End Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Start backend server: cd backend && npm start');
console.log('2. Start frontend server: cd frontend && npm run dev');
console.log('3. Navigate to admin dashboard');
console.log('4. Generate timetable for a batch');
console.log('5. View generated timetable');
