-- Migration: Clean up duplicate foreign key constraints
-- Remove old constraints that don't have CASCADE delete

-- Drop the old constraints that have NO ACTION
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_new_batch_id_fkey;
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_new_batch_timeslot_id_fkey;
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_new_room_id_fkey;
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_new_subject_id_fkey;
ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_new_teacher_id_fkey;

-- Add the missing foreign key constraints with proper CASCADE behavior
ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_room_id_fkey 
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;

ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_subject_id_fkey 
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE RESTRICT;

ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_teacher_id_fkey 
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE RESTRICT;
