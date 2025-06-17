-- Migration: Add CASCADE delete constraints for batch deletion
-- This allows batch deletion to automatically cascade to related tables

-- Step 1: Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE batch_timeslots DROP CONSTRAINT IF EXISTS batch_timeslots_batch_id_fkey;
ALTER TABLE batch_timeslots ADD CONSTRAINT batch_timeslots_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;

ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_batch_id_fkey;
ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;

ALTER TABLE teacher_allocations DROP CONSTRAINT IF EXISTS teacher_allocations_batch_id_fkey;
ALTER TABLE teacher_allocations ADD CONSTRAINT teacher_allocations_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;

ALTER TABLE timetable_generations DROP CONSTRAINT IF EXISTS timetable_generations_batch_id_fkey;
ALTER TABLE timetable_generations ADD CONSTRAINT timetable_generations_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;

ALTER TABLE batch_subjects DROP CONSTRAINT IF EXISTS batch_subjects_batch_id_fkey;
ALTER TABLE batch_subjects ADD CONSTRAINT batch_subjects_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;

-- Step 2: Also add CASCADE for batch_timeslots references
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_batch_timeslot_id_fkey;
ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_batch_timeslot_id_fkey 
    FOREIGN KEY (batch_timeslot_id) REFERENCES batch_timeslots(timeslot_id) ON DELETE CASCADE;

ALTER TABLE blocked_timeslots DROP CONSTRAINT IF EXISTS blocked_timeslots_batch_timeslot_id_fkey;
ALTER TABLE blocked_timeslots ADD CONSTRAINT blocked_timeslots_batch_timeslot_id_fkey 
    FOREIGN KEY (batch_timeslot_id) REFERENCES batch_timeslots(timeslot_id) ON DELETE CASCADE;

-- Step 3: Add CASCADE for batch_students if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_students') THEN
        ALTER TABLE batch_students DROP CONSTRAINT IF EXISTS batch_students_batch_id_fkey;
        ALTER TABLE batch_students ADD CONSTRAINT batch_students_batch_id_fkey 
            FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE;
    END IF;
END $$;
