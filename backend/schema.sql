-- Unified Database Schema for University Timetable System
-- This file replaces the 5 separate migration files for clean deployments
-- Run this ONCE on a fresh PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- CORE AUTHENTICATION & USER TABLES
-- ================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ACADEMIC STRUCTURE TABLES
-- ================================

-- Batches table (student groups/classes)
CREATE TABLE IF NOT EXISTS batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(100) NOT NULL,
    year_of_study INTEGER,
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    credits INTEGER DEFAULT 3,
    lecture_hours_per_week INTEGER DEFAULT 0,
    lab_hours_per_week INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) NOT NULL,
    building VARCHAR(50),
    capacity INTEGER DEFAULT 30,
    room_type VARCHAR(20) DEFAULT 'classroom', -- 'classroom', 'lab', 'auditorium'
    has_projector BOOLEAN DEFAULT FALSE,
    has_computer BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- BATCH-SPECIFIC RELATIONSHIPS
-- ================================

-- Batch-Subject relationships (which subjects are taught to which batches)
CREATE TABLE IF NOT EXISTS batch_subjects (
    id SERIAL PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    lecture_hours_per_week INTEGER DEFAULT 0,
    lab_hours_per_week INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, subject_id)
);

-- Teacher allocations (which teachers can teach which subjects to which batches)
CREATE TABLE IF NOT EXISTS teacher_allocations (
    allocation_id SERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    can_teach_lecture BOOLEAN DEFAULT TRUE,
    can_teach_lab BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- BATCH-SPECIFIC TIMESLOTS
-- ================================

-- Batch-specific timeslots (each batch can have different time schedules)
CREATE TABLE IF NOT EXISTS batch_timeslots (
    timeslot_id SERIAL PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_index INTEGER NOT NULL,
    slot_name VARCHAR(50),
    is_break BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, day_of_week, slot_index)
);

-- ================================
-- TIMETABLE DATA
-- ================================

-- Class sessions (the actual timetable entries)
CREATE TABLE IF NOT EXISTS class_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    batch_timeslot_id INTEGER NOT NULL REFERENCES batch_timeslots(timeslot_id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'lecture', -- 'lecture', 'lab', 'tutorial'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable generation history and metadata
CREATE TABLE IF NOT EXISTS timetable_generations (
    generation_id SERIAL PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed'
    objective_value DECIMAL(10,2),
    solver_time_seconds INTEGER,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    output_file_path VARCHAR(255)
);

-- ================================
-- TIMESLOT MANAGEMENT
-- ================================

-- Blocked timeslots (for maintenance, holidays, etc.)
CREATE TABLE IF NOT EXISTS blocked_timeslots (
    block_id SERIAL PRIMARY KEY,
    batch_timeslot_id INTEGER REFERENCES batch_timeslots(timeslot_id) ON DELETE CASCADE,
    reason VARCHAR(255),
    blocked_date DATE,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy timeslots table (for backward compatibility)
CREATE TABLE IF NOT EXISTS timeslots (
    timeslot_id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week, slot_index)
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Batch timeslots indexes
CREATE INDEX IF NOT EXISTS idx_batch_timeslots_batch_id ON batch_timeslots(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_timeslots_day_slot ON batch_timeslots(batch_id, day_of_week, slot_index);

-- Class sessions indexes
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_id ON class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject_id ON class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_room_id ON class_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_timeslot ON class_sessions(batch_timeslot_id);

-- Teacher allocations indexes
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_batch_id ON teacher_allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_teacher_id ON teacher_allocations(teacher_id);

-- ================================
-- INSERT DEFAULT DATA
-- ================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('admin', 'System administrator with full access'),
    ('faculty', 'Faculty member with limited access')
ON CONFLICT (name) DO NOTHING;

-- Insert standard timeslots for legacy compatibility
INSERT INTO timeslots (day_of_week, start_time, end_time, slot_index) VALUES
-- Monday
('Monday', '09:00:00', '10:00:00', 0),
('Monday', '10:00:00', '11:00:00', 1),
('Monday', '11:00:00', '12:00:00', 2),
('Monday', '12:00:00', '13:00:00', 3),
('Monday', '14:00:00', '15:00:00', 4),
('Monday', '15:00:00', '16:00:00', 5),
('Monday', '16:00:00', '17:00:00', 6),
('Monday', '17:00:00', '18:00:00', 7),
-- Tuesday
('Tuesday', '09:00:00', '10:00:00', 0),
('Tuesday', '10:00:00', '11:00:00', 1),
('Tuesday', '11:00:00', '12:00:00', 2),
('Tuesday', '12:00:00', '13:00:00', 3),
('Tuesday', '14:00:00', '15:00:00', 4),
('Tuesday', '15:00:00', '16:00:00', 5),
('Tuesday', '16:00:00', '17:00:00', 6),
('Tuesday', '17:00:00', '18:00:00', 7),
-- Wednesday
('Wednesday', '09:00:00', '10:00:00', 0),
('Wednesday', '10:00:00', '11:00:00', 1),
('Wednesday', '11:00:00', '12:00:00', 2),
('Wednesday', '12:00:00', '13:00:00', 3),
('Wednesday', '14:00:00', '15:00:00', 4),
('Wednesday', '15:00:00', '16:00:00', 5),
('Wednesday', '16:00:00', '17:00:00', 6),
('Wednesday', '17:00:00', '18:00:00', 7),
-- Thursday
('Thursday', '09:00:00', '10:00:00', 0),
('Thursday', '10:00:00', '11:00:00', 1),
('Thursday', '11:00:00', '12:00:00', 2),
('Thursday', '12:00:00', '13:00:00', 3),
('Thursday', '14:00:00', '15:00:00', 4),
('Thursday', '15:00:00', '16:00:00', 5),
('Thursday', '16:00:00', '17:00:00', 6),
('Thursday', '17:00:00', '18:00:00', 7),
-- Friday
('Friday', '09:00:00', '10:00:00', 0),
('Friday', '10:00:00', '11:00:00', 1),
('Friday', '11:00:00', '12:00:00', 2),
('Friday', '12:00:00', '13:00:00', 3),
('Friday', '14:00:00', '15:00:00', 4),
('Friday', '15:00:00', '16:00:00', 5),
('Friday', '16:00:00', '17:00:00', 6),
('Friday', '17:00:00', '18:00:00', 7),
-- Saturday
('Saturday', '09:00:00', '10:00:00', 0),
('Saturday', '10:00:00', '11:00:00', 1),
('Saturday', '11:00:00', '12:00:00', 2),
('Saturday', '12:00:00', '13:00:00', 3),
('Saturday', '14:00:00', '15:00:00', 4),
('Saturday', '15:00:00', '16:00:00', 5)
ON CONFLICT (day_of_week, slot_index) DO NOTHING;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, roles, batches, subjects, teachers, rooms, batch_subjects,';
    RAISE NOTICE '               teacher_allocations, batch_timeslots, class_sessions,';
    RAISE NOTICE '               timetable_generations, blocked_timeslots, timeslots';
    RAISE NOTICE 'Ready for timetable application deployment!';
END $$;
