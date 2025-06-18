/**
 * =====================================================
 * University Timetable Management System - Database Seeder
 * =====================================================
 * 
 * This script seeds the database with comprehensive sample data
 * for local development and testing purposes.
 * 
 * Usage: node seed.js
 * 
 * Prerequisites:
 * - Database schema must be already created
 * - Database connection configured in .env file
 * =====================================================
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config();
// =====================================================
// Database Configuration
// =====================================================
// Supports both Railway/production and local development
let dbConfig;
if (process.env.DATABASE_URL) {
  // Production configuration (Railway, Heroku, etc.)
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // Local development configuration
  dbConfig = {
    user: process.env.DB_USER || 'timetable',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'TimeTable',
    password: process.env.DB_PASSWORD || 'admin',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };
}

const pool = new Pool(dbConfig);
const SALT_ROUNDS = 10;

// =====================================================
// Main Seeding Function
// =====================================================
async function seedDatabase() {
  const client = await pool.connect();
  console.log('✅ Connected to the database successfully.');
  console.log('🌱 Starting database seeding process...\n');

  try {
    await client.query('BEGIN');
    console.log('🚀 Transaction started.');

    // 1. Seed Roles
    // Your schema already has a roles_id_seq, so we don't specify the ID.
    console.log('Seeding roles...');
    const rolesData = [{ name: 'admin' }, { name: 'teacher' }];
    const roleResults = await Promise.all(
      rolesData.map(role =>
        client.query(
          'INSERT INTO public.roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name',
          [role.name]
        )
      )
    );
    // Fetch roles in case they already existed
    const allRolesRes = await client.query('SELECT id, name FROM public.roles');
    const roles = allRolesRes.rows;
    const adminRole = roles.find(r => r.name === 'admin');
    const teacherRole = roles.find(r => r.name === 'teacher');
    console.log('   Roles seeded or already exist.');

    // 2. Seed Users (Admin and Teachers)
    console.log('Seeding users...');
    const adminPasswordHash = await bcrypt.hash('adminpass123', SALT_ROUNDS);
    const teacher1PasswordHash = await bcrypt.hash('teacherpass123', SALT_ROUNDS);

    const usersData = [
      { username: 'admin', email: 'admin@university.com', password_hash: adminPasswordHash, role_id: adminRole.id },
      { username: 'prof_einstein', email: 'a.einstein@university.com', password_hash: teacher1PasswordHash, role_id: teacherRole.id },
    ];
    const userResults = await Promise.all(
      usersData.map(user =>
        client.query(
          'INSERT INTO public.users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id, email',
          [user.username, user.email, user.password_hash, user.role_id]
        )
      )
    );
    const allUsersRes = await client.query('SELECT id, email FROM public.users');
    const users = allUsersRes.rows;
    const teacherUser1 = users.find(u => u.email === 'a.einstein@university.com');
    console.log('   Users seeded or already exist.');    // 3. Seed Subjects
    console.log('📚 Seeding subjects...');
    const subjectsData = [
      // Computer Science Subjects
      { name: 'Data Structures and Algorithms', code: 'CS201', lecture_credits: 3, lab_credits: 1 },
      { name: 'Database Management Systems', code: 'CS301', lecture_credits: 3, lab_credits: 1 },
      { name: 'Software Engineering', code: 'CS401', lecture_credits: 3, lab_credits: 1 },
      { name: 'Computer Networks', code: 'CS302', lecture_credits: 3, lab_credits: 1 },
      { name: 'Operating Systems', code: 'CS303', lecture_credits: 3, lab_credits: 1 },
      { name: 'Machine Learning', code: 'CS501', lecture_credits: 3, lab_credits: 1 },
      
      // Mathematics Subjects  
      { name: 'Calculus I', code: 'MTH101', lecture_credits: 4, lab_credits: 0 },
      { name: 'Linear Algebra', code: 'MTH201', lecture_credits: 3, lab_credits: 0 },
      { name: 'Discrete Mathematics', code: 'MTH202', lecture_credits: 3, lab_credits: 0 },
      { name: 'Statistics and Probability', code: 'MTH301', lecture_credits: 3, lab_credits: 1 },
      
      // Physics Subjects
      { name: 'Classical Mechanics', code: 'PHY101', lecture_credits: 3, lab_credits: 1 },
      { name: 'Quantum Physics', code: 'PHY301', lecture_credits: 3, lab_credits: 1 },
      { name: 'Electromagnetic Theory', code: 'PHY302', lecture_credits: 3, lab_credits: 1 },
      { name: 'Thermodynamics', code: 'PHY201', lecture_credits: 3, lab_credits: 1 },
      
      // General Subjects
      { name: 'Technical Communication', code: 'ENG101', lecture_credits: 2, lab_credits: 0 },
      { name: 'Engineering Ethics', code: 'ETH101', lecture_credits: 2, lab_credits: 0 },
      { name: 'Environmental Science', code: 'ENV101', lecture_credits: 2, lab_credits: 0 }
    ];
    const subjectResults = await Promise.all(
      subjectsData.map(subject =>
        client.query(
          'INSERT INTO public.subjects (name, code, lecture_credits, lab_credits) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING RETURNING subject_id, code',
          [subject.name, subject.code, subject.lecture_credits, subject.lab_credits]
        )
      )    );
    const allSubjectsRes = await client.query('SELECT subject_id, code FROM public.subjects');
    const subjects = allSubjectsRes.rows;
    console.log(`   ✅ ${subjects.length} subjects seeded or already exist.`);

    // 4. Seed Rooms
    console.log('🏢 Seeding rooms...');
    const roomsData = [
      // Lecture Halls
      { room_name: 'Main Auditorium', capacity: 200, is_lab: false },
      { room_name: 'Lecture Hall A-101', capacity: 100, is_lab: false },
      { room_name: 'Lecture Hall A-102', capacity: 80, is_lab: false },
      { room_name: 'Lecture Hall B-201', capacity: 75, is_lab: false },
      { room_name: 'Lecture Hall B-202', capacity: 75, is_lab: false },
      { room_name: 'Lecture Hall C-301', capacity: 60, is_lab: false },
      { room_name: 'Lecture Hall C-302', capacity: 60, is_lab: false },
      { room_name: 'Seminar Room SR-1', capacity: 40, is_lab: false },
      { room_name: 'Seminar Room SR-2', capacity: 40, is_lab: false },
      { room_name: 'Conference Room CR-1', capacity: 25, is_lab: false },
      
      // Computer Labs
      { room_name: 'Computer Lab CL-1', capacity: 40, is_lab: true },
      { room_name: 'Computer Lab CL-2', capacity: 40, is_lab: true },
      { room_name: 'Computer Lab CL-3', capacity: 35, is_lab: true },
      { room_name: 'Advanced Computing Lab ACL-1', capacity: 30, is_lab: true },
      { room_name: 'Software Development Lab SDL-1', capacity: 25, is_lab: true },
      
      // Science Labs
      { room_name: 'Physics Lab PL-1', capacity: 30, is_lab: true },
      { room_name: 'Physics Lab PL-2', capacity: 30, is_lab: true },
      { room_name: 'Advanced Physics Lab APL-1', capacity: 25, is_lab: true },
      { room_name: 'Electronics Lab EL-1', capacity: 25, is_lab: true },
      { room_name: 'Research Lab RL-1', capacity: 20, is_lab: true }
    ];
    await Promise.all(
      roomsData.map(room =>
        client.query(
          'INSERT INTO public.rooms (room_name, capacity, is_lab) VALUES ($1, $2, $3) ON CONFLICT (room_name) DO NOTHING',
          [room.room_name, room.capacity, room.is_lab]
        )
      )    );
    console.log(`   ✅ ${roomsData.length} rooms seeded or already exist.`);

    // 5. Seed Teachers
    console.log('👨‍🏫 Seeding teachers...');
    const teachersData = [
      // Computer Science Faculty
      { name: 'Dr. Alan Turing', email: 'a.turing@university.com', user_id: teacherUser1.id },
      { name: 'Dr. Ada Lovelace', email: 'a.lovelace@university.com', user_id: null },
      { name: 'Prof. Donald Knuth', email: 'd.knuth@university.com', user_id: null },
      { name: 'Dr. Grace Hopper', email: 'g.hopper@university.com', user_id: null },
      { name: 'Prof. Tim Berners-Lee', email: 't.lee@university.com', user_id: null },
      { name: 'Dr. Linus Torvalds', email: 'l.torvalds@university.com', user_id: null },
      
      // Mathematics Faculty
      { name: 'Prof. Carl Gauss', email: 'c.gauss@university.com', user_id: null },
      { name: 'Dr. Emmy Noether', email: 'e.noether@university.com', user_id: null },
      { name: 'Prof. Leonhard Euler', email: 'l.euler@university.com', user_id: null },
      { name: 'Dr. Katherine Johnson', email: 'k.johnson@university.com', user_id: null },
      
      // Physics Faculty
      { name: 'Prof. Albert Einstein', email: 'a.einstein@university.com', user_id: null },
      { name: 'Dr. Marie Curie', email: 'm.curie@university.com', user_id: null },
      { name: 'Prof. Richard Feynman', email: 'r.feynman@university.com', user_id: null },
      { name: 'Dr. Niels Bohr', email: 'n.bohr@university.com', user_id: null },
      
      // General Faculty
      { name: 'Prof. Maya Patel', email: 'm.patel@university.com', user_id: null },
      { name: 'Dr. James Wilson', email: 'j.wilson@university.com', user_id: null }
    ];
    const teacherResults = await Promise.all(
      teachersData.map(teacher =>
        client.query(
          'INSERT INTO public.teachers (name, email, user_id) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING teacher_id, name',
          [teacher.name, teacher.email, teacher.user_id]
        )
      )    );
    const allTeachersRes = await client.query('SELECT teacher_id, name, email FROM public.teachers');
    const teachers = allTeachersRes.rows;
    console.log(`   ✅ ${teachers.length} teachers seeded or already exist.`);

    // 6. Seed Batches
    console.log('🎓 Seeding batches...');
    const batchesData = [
      // Computer Science Batches
      { name: 'B.Tech CSE 2024-2028 Batch A', academic_year: '2024-2028', semester_number: 1, department: 'Computer Science' },
      { name: 'B.Tech CSE 2024-2028 Batch B', academic_year: '2024-2028', semester_number: 1, department: 'Computer Science' },
      { name: 'B.Tech CSE 2023-2027 Batch A', academic_year: '2023-2027', semester_number: 3, department: 'Computer Science' },
      { name: 'B.Tech CSE 2022-2026 Batch A', academic_year: '2022-2026', semester_number: 5, department: 'Computer Science' },
      { name: 'M.Tech CSE 2024-2026', academic_year: '2024-2026', semester_number: 1, department: 'Computer Science' },
      
      // Mathematics Batches
      { name: 'B.Sc Mathematics 2024-2027', academic_year: '2024-2027', semester_number: 1, department: 'Mathematics' },
      { name: 'B.Sc Mathematics 2023-2026', academic_year: '2023-2026', semester_number: 3, department: 'Mathematics' },
      
      // Physics Batches
      { name: 'B.Sc Physics 2024-2027', academic_year: '2024-2027', semester_number: 1, department: 'Physics' },
      { name: 'B.Sc Physics 2023-2026', academic_year: '2023-2026', semester_number: 3, department: 'Physics' },
      { name: 'M.Sc Physics 2024-2026', academic_year: '2024-2026', semester_number: 1, department: 'Physics' }
    ];
    const batchResults = await Promise.all(
      batchesData.map(batch =>
        client.query(
          'INSERT INTO public.batches (name, academic_year, semester_number, department) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING RETURNING batch_id, name',
          [batch.name, batch.academic_year, batch.semester_number, batch.department]
        )
      )    );
    const allBatchesRes = await client.query('SELECT batch_id, name, department FROM public.batches');
    const batches = allBatchesRes.rows;
    console.log(`   ✅ ${batches.length} batches seeded or already exist.`);

    // 7. Link Subjects to Batches (Subject Assignment)
    console.log('🔗 Linking subjects to batches...');
    
    // Helper function to find items by properties
    const findBatch = (namePattern) => batches.find(b => b.name.includes(namePattern));
    const findSubject = (code) => subjects.find(s => s.code === code);
    
    // Computer Science batch assignments
    const csBatch2024A = findBatch('B.Tech CSE 2024-2028 Batch A');
    const csBatch2024B = findBatch('B.Tech CSE 2024-2028 Batch B');
    const csBatch2023 = findBatch('B.Tech CSE 2023-2027');
    const csBatch2022 = findBatch('B.Tech CSE 2022-2026');
    const mtechCS = findBatch('M.Tech CSE');
    
    // Physics batches
    const physicsBatch2024 = findBatch('B.Sc Physics 2024-2027');
    const physicsBatch2023 = findBatch('B.Sc Physics 2023-2026');
    const mscPhysics = findBatch('M.Sc Physics');
    
    // Mathematics batches
    const mathBatch2024 = findBatch('B.Sc Mathematics 2024-2027');
    const mathBatch2023 = findBatch('B.Sc Mathematics 2023-2026');

    // Batch-Subject assignments
    const batchSubjectAssignments = [
      // CS 2024 Batch A - First Semester
      { batch: csBatch2024A, subjects: ['CS201', 'MTH101', 'PHY101', 'ENG101'] },
      
      // CS 2024 Batch B - First Semester  
      { batch: csBatch2024B, subjects: ['CS201', 'MTH101', 'PHY101', 'ENG101'] },
      
      // CS 2023 Batch - Third Semester
      { batch: csBatch2023, subjects: ['CS301', 'CS302', 'MTH201', 'MTH202'] },
      
      // CS 2022 Batch - Fifth Semester
      { batch: csBatch2022, subjects: ['CS401', 'CS501', 'MTH301', 'ETH101'] },
      
      // M.Tech CS - Advanced subjects
      { batch: mtechCS, subjects: ['CS501', 'CS401', 'MTH301'] },
      
      // Physics 2024 - First Semester
      { batch: physicsBatch2024, subjects: ['PHY101', 'MTH101', 'ENG101', 'ENV101'] },
      
      // Physics 2023 - Third Semester
      { batch: physicsBatch2023, subjects: ['PHY301', 'PHY302', 'MTH201', 'MTH301'] },
      
      // M.Sc Physics
      { batch: mscPhysics, subjects: ['PHY301', 'PHY302', 'MTH301'] },
      
      // Mathematics 2024 - First Semester
      { batch: mathBatch2024, subjects: ['MTH101', 'MTH201', 'PHY101', 'ENG101'] },
      
      // Mathematics 2023 - Third Semester
      { batch: mathBatch2023, subjects: ['MTH202', 'MTH301', 'CS201', 'ETH101'] }
    ];

    for (const assignment of batchSubjectAssignments) {
      if (assignment.batch) {
        for (const subjectCode of assignment.subjects) {
          const subject = findSubject(subjectCode);
          if (subject) {
            await client.query(
              'INSERT INTO public.batch_subjects (batch_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [assignment.batch.batch_id, subject.subject_id]
            );
          }
        }
        console.log(`   📋 Assigned ${assignment.subjects.length} subjects to ${assignment.batch.name}`);
      }
    }
    console.log('   ✅ Finished linking subjects to batches.');

    // 8. Create Teacher Allocations (Teacher-Subject-Batch assignments)
    console.log('👨‍🏫 Creating teacher allocations...');
    
    const teacherAllocations = [
      // Dr. Alan Turing - CS subjects
      { teacher: 'a.turing@university.com', subject: 'CS201', batches: ['B.Tech CSE 2024-2028 Batch A', 'B.Tech CSE 2024-2028 Batch B'] },
      { teacher: 'a.turing@university.com', subject: 'CS301', batches: ['B.Tech CSE 2023-2027'] },
      
      // Dr. Ada Lovelace - CS subjects
      { teacher: 'a.lovelace@university.com', subject: 'CS401', batches: ['B.Tech CSE 2022-2026'] },
      { teacher: 'a.lovelace@university.com', subject: 'CS501', batches: ['B.Tech CSE 2022-2026', 'M.Tech CSE 2024-2026'] },
      
      // Prof. Donald Knuth - CS subjects
      { teacher: 'd.knuth@university.com', subject: 'CS302', batches: ['B.Tech CSE 2023-2027'] },
      
      // Prof. Carl Gauss - Mathematics
      { teacher: 'c.gauss@university.com', subject: 'MTH101', batches: ['B.Tech CSE 2024-2028 Batch A', 'B.Sc Physics 2024-2027', 'B.Sc Mathematics 2024-2027'] },
      { teacher: 'c.gauss@university.com', subject: 'MTH201', batches: ['B.Tech CSE 2023-2027', 'B.Sc Physics 2023-2026', 'B.Sc Mathematics 2024-2027'] },
      
      // Dr. Emmy Noether - Mathematics
      { teacher: 'e.noether@university.com', subject: 'MTH202', batches: ['B.Tech CSE 2023-2027', 'B.Sc Mathematics 2023-2026'] },
      { teacher: 'e.noether@university.com', subject: 'MTH301', batches: ['B.Tech CSE 2022-2026', 'B.Sc Physics 2023-2026', 'M.Sc Physics 2024-2026'] },
      
      // Prof. Albert Einstein - Physics
      { teacher: 'a.einstein@university.com', subject: 'PHY101', batches: ['B.Tech CSE 2024-2028 Batch A', 'B.Sc Physics 2024-2027', 'B.Sc Mathematics 2024-2027'] },
      { teacher: 'a.einstein@university.com', subject: 'PHY301', batches: ['B.Sc Physics 2023-2026', 'M.Sc Physics 2024-2026'] },
      
      // Dr. Marie Curie - Physics
      { teacher: 'm.curie@university.com', subject: 'PHY302', batches: ['B.Sc Physics 2023-2026', 'M.Sc Physics 2024-2026'] },
      
      // General subjects
      { teacher: 'm.patel@university.com', subject: 'ENG101', batches: ['B.Tech CSE 2024-2028 Batch A', 'B.Sc Physics 2024-2027', 'B.Sc Mathematics 2024-2027'] },
      { teacher: 'j.wilson@university.com', subject: 'ETH101', batches: ['B.Tech CSE 2022-2026', 'B.Sc Mathematics 2023-2026'] },
      { teacher: 'j.wilson@university.com', subject: 'ENV101', batches: ['B.Sc Physics 2024-2027'] }
    ];

    for (const allocation of teacherAllocations) {
      const teacher = teachers.find(t => t.email === allocation.teacher);
      const subject = findSubject(allocation.subject);
      
      if (teacher && subject) {
        for (const batchName of allocation.batches) {
          const batch = batches.find(b => b.name.includes(batchName));
          if (batch) {
            await client.query(
              'INSERT INTO public.teacher_allocations (teacher_id, subject_id, batch_id) VALUES ($1, $2, $3) ON CONFLICT (teacher_id, subject_id, batch_id) DO NOTHING',
              [teacher.teacher_id, subject.subject_id, batch.batch_id]
            );
          }
        }
        console.log(`   👨‍🏫 Allocated ${teacher.name} to teach ${allocation.subject}`);
      }
    }
    console.log('   ✅ Teacher allocations completed.');    // 9. Create default timeslots for each batch
    console.log('⏰ Creating default timeslots for each batch...');
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const defaultTimeSlots = [
      { start: '09:00', end: '10:00', slot: 1, name: 'Period 1' },
      { start: '10:00', end: '11:00', slot: 2, name: 'Period 2' },
      { start: '11:15', end: '12:15', slot: 3, name: 'Period 3' }, // 15 min break
      { start: '12:15', end: '13:15', slot: 4, name: 'Period 4' },
      { start: '14:00', end: '15:00', slot: 5, name: 'Period 5' }, // Lunch break
      { start: '15:00', end: '16:00', slot: 6, name: 'Period 6' },
      { start: '16:15', end: '17:15', slot: 7, name: 'Period 7' }, // 15 min break
      { start: '17:15', end: '18:15', slot: 8, name: 'Period 8' }
    ];

    let totalTimeslotsCreated = 0;
    for (const batch of batches) {
      for (const day of defaultDays) {
        for (const slot of defaultTimeSlots) {
          await client.query(
            'INSERT INTO public.batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index, slot_name) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [batch.batch_id, day, slot.start, slot.end, slot.slot, slot.name]
          );
          totalTimeslotsCreated++;
        }
      }
      console.log(`   📅 Timeslots created for: ${batch.name}`);
    }
    console.log(`   ✅ Total ${totalTimeslotsCreated} timeslots created across all batches.`);

    // 10. Create some sample students (optional)
    console.log('👨‍🎓 Creating sample students...');
    const studentsData = [
      { name: 'John Smith', email: 'john.smith@student.university.com', roll_number: 'CS2024001' },
      { name: 'Emily Johnson', email: 'emily.johnson@student.university.com', roll_number: 'CS2024002' },
      { name: 'Michael Brown', email: 'michael.brown@student.university.com', roll_number: 'CS2024003' },
      { name: 'Sarah Davis', email: 'sarah.davis@student.university.com', roll_number: 'PHY2024001' },
      { name: 'David Wilson', email: 'david.wilson@student.university.com', roll_number: 'PHY2024002' },
      { name: 'Lisa Anderson', email: 'lisa.anderson@student.university.com', roll_number: 'MTH2024001' }
    ];

    for (const student of studentsData) {
      await client.query(
        'INSERT INTO public.students (name, email, roll_number) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [student.name, student.email, student.roll_number]
      );
    }
    console.log(`   ✅ ${studentsData.length} sample students created.`);

    // 11. Assign students to batches
    console.log('📝 Assigning students to batches...');
    const studentBatchAssignments = [
      { studentEmail: 'john.smith@student.university.com', batchName: 'B.Tech CSE 2024-2028 Batch A' },
      { studentEmail: 'emily.johnson@student.university.com', batchName: 'B.Tech CSE 2024-2028 Batch A' },
      { studentEmail: 'michael.brown@student.university.com', batchName: 'B.Tech CSE 2024-2028 Batch B' },
      { studentEmail: 'sarah.davis@student.university.com', batchName: 'B.Sc Physics 2024-2027' },
      { studentEmail: 'david.wilson@student.university.com', batchName: 'B.Sc Physics 2024-2027' },
      { studentEmail: 'lisa.anderson@student.university.com', batchName: 'B.Sc Mathematics 2024-2027' }
    ];

    const allStudentsRes = await client.query('SELECT student_id, email FROM public.students');
    const students = allStudentsRes.rows;

    for (const assignment of studentBatchAssignments) {
      const student = students.find(s => s.email === assignment.studentEmail);
      const batch = batches.find(b => b.name.includes(assignment.batchName));
      
      if (student && batch) {
        await client.query(
          'INSERT INTO public.batch_students (batch_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [batch.batch_id, student.student_id]
        );
      }
    }
    console.log(`   ✅ Students assigned to their respective batches.`);    await client.query('COMMIT');
    console.log('\n🎉 ✅ Transaction committed successfully!');
    console.log('🌱 Database seeding completed successfully!\n');
    
    // Display seeding summary
    console.log('📊 ===== SEEDING SUMMARY =====');
    console.log(`👤 Users: 2 (1 admin, 1 teacher login)`);
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`📚 Subjects: ${subjects.length}`);
    console.log(`🏢 Rooms: ${roomsData.length}`);
    console.log(`🎓 Batches: ${batches.length}`);
    console.log(`👨‍🎓 Students: ${studentsData.length}`);
    console.log(`⏰ Timeslots: ${totalTimeslotsCreated} (across all batches)`);
    console.log('===============================\n');
    
    console.log('🔑 ===== DEFAULT LOGIN CREDENTIALS =====');
    console.log('Admin User:');
    console.log('  Email: admin@university.com');
    console.log('  Password: adminpass123');
    console.log('');
    console.log('Teacher User (Dr. Alan Turing):');
    console.log('  Email: a.einstein@university.com');
    console.log('  Password: teacherpass123');
    console.log('=======================================\n');
    
    console.log('🚀 You can now start the application with:');
    console.log('   npm run dev:full');
    console.log('');
    console.log('🌐 Access the application at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:5000/api');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error during seeding, transaction rolled back:');
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Ensure PostgreSQL is running');
    console.log('2. Verify database connection settings in .env file');
    console.log('3. Make sure the database schema has been applied');
    console.log('4. Check if all required tables exist');
  } finally {
    client.release();
    console.log('\n🔌 Database connection released.');
    await pool.end();
    console.log('🔌 Connection pool closed.');
  }
}

seedDatabase().catch(err => {
  console.error('Unhandled error in seedDatabase function:', err.stack);
  process.exit(1);
});