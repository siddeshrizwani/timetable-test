-- Additional migration: Create missing tables without foreign key constraints first
-- Run this after the main migration

-- Create teacher_allocations table without foreign keys first
CREATE TABLE IF NOT EXISTS teacher_allocations (
  allocation_id SERIAL PRIMARY KEY,
  teacher_id UUID,
  subject_id UUID,
  batch_id UUID,
  can_teach_lecture BOOLEAN DEFAULT TRUE,
  can_teach_lab BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timetable_generations table without foreign keys first
CREATE TABLE IF NOT EXISTS timetable_generations (
  generation_id SERIAL PRIMARY KEY,
  batch_id UUID,
  status VARCHAR(20) NOT NULL,
  objective_value DECIMAL(10,2),
  solver_time_seconds INTEGER,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  output_file_path VARCHAR(255)
);

-- Create blocked_timeslots table without foreign keys first
CREATE TABLE IF NOT EXISTS blocked_timeslots (
  block_id SERIAL PRIMARY KEY,
  timeslot_id UUID,
  reason VARCHAR(255),
  blocked_date DATE,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Now add foreign key constraints if the tables exist
DO $$ 
BEGIN 
    -- Add teacher_allocations foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_allocations_teacher_id_fkey') THEN
        ALTER TABLE teacher_allocations ADD CONSTRAINT teacher_allocations_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_allocations_subject_id_fkey') THEN
        ALTER TABLE teacher_allocations ADD CONSTRAINT teacher_allocations_subject_id_fkey 
        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_allocations_batch_id_fkey') THEN
        ALTER TABLE teacher_allocations ADD CONSTRAINT teacher_allocations_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id);
    END IF;
    
    -- Add timetable_generations foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetable_generations_batch_id_fkey') THEN
        ALTER TABLE timetable_generations ADD CONSTRAINT timetable_generations_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id);
    END IF;
    
    -- Add blocked_timeslots foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blocked_timeslots_timeslot_id_fkey') THEN
        ALTER TABLE blocked_timeslots ADD CONSTRAINT blocked_timeslots_timeslot_id_fkey 
        FOREIGN KEY (timeslot_id) REFERENCES timeslots(timeslot_id);
    END IF;
END $$;

-- Add unique constraints
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_allocations_unique') THEN
        ALTER TABLE teacher_allocations ADD CONSTRAINT teacher_allocations_unique 
        UNIQUE(teacher_id, subject_id, batch_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_teacher_id ON teacher_allocations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_subject_id ON teacher_allocations(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_allocations_batch_id ON teacher_allocations(batch_id);
