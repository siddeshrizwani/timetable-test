-- Migration: Update database schema for multi-batch timetable support
-- Run this script on your database to update the schema

-- Step 1: Drop existing constraints that cause issues
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timeslots_slot_index_key') THEN
        ALTER TABLE timeslots DROP CONSTRAINT timeslots_slot_index_key;
    END IF;
END $$;

-- Step 2: Add new unique constraint for timeslots (only if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timeslots_day_slot_unique') THEN
        ALTER TABLE timeslots ADD CONSTRAINT timeslots_day_slot_unique UNIQUE(day_of_week, slot_index);
    END IF;
END $$;

-- Step 3: Clear existing class_sessions and insert standard timeslots
DELETE FROM class_sessions;
DELETE FROM timeslots WHERE slot_index IS NOT NULL;

-- Step 4: Insert standard timeslots for all days
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
('Friday', '17:00:00', '18:00:00', 7);

-- Step 5: Add session_type column to class_sessions if it doesn't exist
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS session_type VARCHAR(20) DEFAULT 'lecture';
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 6: Add unique constraints to prevent conflicts (only if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_batch_timeslot') THEN
        ALTER TABLE class_sessions ADD CONSTRAINT unique_batch_timeslot UNIQUE(batch_id, timeslot_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_room_timeslot') THEN
        ALTER TABLE class_sessions ADD CONSTRAINT unique_room_timeslot UNIQUE(room_id, timeslot_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_teacher_timeslot') THEN
        ALTER TABLE class_sessions ADD CONSTRAINT unique_teacher_timeslot UNIQUE(teacher_id, timeslot_id);
    END IF;
END $$;

-- Step 7: Create teacher_allocations table
CREATE TABLE IF NOT EXISTS teacher_allocations (
  allocation_id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(teacher_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  batch_id INTEGER REFERENCES batches(batch_id),
  can_teach_lecture BOOLEAN DEFAULT TRUE,
  can_teach_lab BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, subject_id, batch_id)
);

-- Step 8: Create timetable_generations table
CREATE TABLE IF NOT EXISTS timetable_generations (
  generation_id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES batches(batch_id),
  status VARCHAR(20) NOT NULL,
  objective_value DECIMAL(10,2),
  solver_time_seconds INTEGER,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  output_file_path VARCHAR(255)
);

-- Step 9: Create blocked_timeslots table
CREATE TABLE IF NOT EXISTS blocked_timeslots (
  block_id SERIAL PRIMARY KEY,
  timeslot_id INTEGER REFERENCES timeslots(timeslot_id),
  reason VARCHAR(255),
  blocked_date DATE,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_id ON class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_timeslot_id ON class_sessions(timeslot_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_room_id ON class_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_teacher_id ON teacher_allocations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_subject_id ON teacher_allocations(subject_id);
CREATE INDEX IF NOT EXISTS idx_timeslots_day_slot ON timeslots(day_of_week, slot_index);

COMMIT;
