const { Pool } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config();
// --- Database Configuration ---
// It's highly recommended to use environment variables for these settings.
const dbConfig = {
  user: process.env.DB_USER || 'timetable',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'TimeTable',
  password: process.env.DB_PASSWORD || 'admin', // <-- IMPORTANT: Change this!
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

const pool = new Pool(dbConfig);
const SALT_ROUNDS = 10;

async function seedDatabase() {
  const client = await pool.connect();
  console.log('✅ Connected to the database.');

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
    console.log('   Users seeded or already exist.');

    // 3. Seed Subjects
    console.log('Seeding subjects...');
    const subjectsData = [
      { name: 'Quantum Physics', code: 'PHY301', lecture_credits: 3, lab_credits: 1 },
      { name: 'Software Engineering', code: 'CS401', lecture_credits: 3, lab_credits: 1 },
      { name: 'Advanced Mathematics', code: 'MTH250', lecture_credits: 4, lab_credits: 0 },
    ];
    const subjectResults = await Promise.all(
      subjectsData.map(subject =>
        client.query(
          'INSERT INTO public.subjects (name, code, lecture_credits, lab_credits) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING RETURNING subject_id, code',
          [subject.name, subject.code, subject.lecture_credits, subject.lab_credits]
        )
      )
    );
    const allSubjectsRes = await client.query('SELECT subject_id, code FROM public.subjects');
    const subjects = allSubjectsRes.rows;
    console.log('   Subjects seeded or already exist.');

    // 4. Seed Rooms
    console.log('Seeding rooms...');
    const roomsData = [
      { room_name: 'Hall C-1', capacity: 75, is_lab: false },
      { room_name: 'Physics Lab 1', capacity: 30, is_lab: true },
      { room_name: 'Computer Lab A', capacity: 40, is_lab: true },
    ];
    await Promise.all(
      roomsData.map(room =>
        client.query(
          'INSERT INTO public.rooms (room_name, capacity, is_lab) VALUES ($1, $2, $3) ON CONFLICT (room_name) DO NOTHING',
          [room.room_name, room.capacity, room.is_lab]
        )
      )
    );
    console.log('   Rooms seeded or already exist.');

    // 5. Seed Teachers
    console.log('Seeding teachers...');
    const teachersData = [
      { name: 'Albert Einstein', email: 'a.einstein@university.com', user_id: teacherUser1.id },
      { name: 'Marie Curie', email: 'm.curie@university.com', user_id: null }, // Teacher without a login
    ];
    const teacherResults = await Promise.all(
      teachersData.map(teacher =>
        client.query(
          'INSERT INTO public.teachers (name, email, user_id) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING teacher_id, name',
          [teacher.name, teacher.email, teacher.user_id]
        )
      )
    );
    const allTeachersRes = await client.query('SELECT teacher_id, name FROM public.teachers');
    const teachers = allTeachersRes.rows;
    console.log('   Teachers seeded or already exist.');

    // 6. Seed Batches
    console.log('Seeding batches...');
    const batchesData = [
      { name: 'B.Sc Physics 2024-2027', academic_year: '2024-2027', semester_number: 1, department: 'Physics' },
      { name: 'B.Eng Computer Science 2023-2027', academic_year: '2023-2027', semester_number: 3, department: 'Computer Science' },
    ];
    const batchResults = await Promise.all(
      batchesData.map(batch =>
        client.query(
          'INSERT INTO public.batches (name, academic_year, semester_number, department) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING RETURNING batch_id, name',
          [batch.name, batch.academic_year, batch.semester_number, batch.department]
        )
      )
    );
    const allBatchesRes = await client.query('SELECT batch_id, name FROM public.batches');
    const batches = allBatchesRes.rows;
    console.log('   Batches seeded or already exist.');

    // 7. Link Subjects to Batches
    console.log('Linking subjects to batches...');
    const physicsBatch = batches.find(b => b.name.includes('Physics'));
    const csBatch = batches.find(b => b.name.includes('Computer Science'));
    const physicsSubject = subjects.find(s => s.code === 'PHY301');
    const csSubject = subjects.find(s => s.code === 'CS401');
    const mathSubject = subjects.find(s => s.code === 'MTH250');

    if (physicsBatch && physicsSubject) {
      await client.query('INSERT INTO public.batch_subjects (batch_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [physicsBatch.batch_id, physicsSubject.subject_id]);
    }
    if (csBatch && csSubject && mathSubject) {
      await client.query('INSERT INTO public.batch_subjects (batch_id, subject_id) VALUES ($1, $2), ($1, $3) ON CONFLICT DO NOTHING', [csBatch.batch_id, csSubject.subject_id, mathSubject.subject_id]);
    }
    console.log('   Finished linking subjects to batches.');

    await client.query('COMMIT');
    console.log('✅ Transaction committed. Database seeded successfully!');
    console.log('\n--- Initial Admin User ---');
    console.log('Email: admin@university.com');
    console.log('Password: adminpass123');
    console.log('--------------------------\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding, transaction rolled back:', err.stack);
  } finally {
    client.release();
    console.log('DB connection released.');
    await pool.end();
    console.log('Connection pool closed.');
  }
}

seedDatabase().catch(err => {
  console.error('Unhandled error in seedDatabase function:', err.stack);
  process.exit(1);
});