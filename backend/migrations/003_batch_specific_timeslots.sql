-- Migration: Convert to batch-specific timeslots
-- This migration restructures the schema to support independent timeslots per batch

-- Step 1: Create new batch_timeslots table
CREATE TABLE IF NOT EXISTS batch_timeslots (
  timeslot_id SERIAL PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(batch_id),
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_index INTEGER NOT NULL,
  slot_name VARCHAR(50),
  is_break BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(batch_id, day_of_week, slot_index)
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_batch_timeslots_batch_id ON batch_timeslots(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_timeslots_day_slot ON batch_timeslots(batch_id, day_of_week, slot_index);

-- Step 3: Migrate existing class_sessions to use batch_timeslots
-- First, let's backup existing sessions
CREATE TABLE IF NOT EXISTS class_sessions_backup AS 
SELECT * FROM class_sessions;

-- Step 4: Create new class_sessions table with batch_timeslot reference
CREATE TABLE IF NOT EXISTS class_sessions_new (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(subject_id),
  batch_id UUID NOT NULL REFERENCES batches(batch_id),
  teacher_id UUID NOT NULL REFERENCES teachers(teacher_id),
  batch_timeslot_id INTEGER NOT NULL REFERENCES batch_timeslots(timeslot_id),
  room_id UUID NOT NULL REFERENCES rooms(room_id),
  session_type VARCHAR(20) DEFAULT 'lecture',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Batch-specific unique constraints
  CONSTRAINT unique_batch_timeslot_new UNIQUE(batch_id, batch_timeslot_id),
  CONSTRAINT unique_batch_room_timeslot UNIQUE(batch_id, room_id, batch_timeslot_id),
  CONSTRAINT unique_batch_teacher_timeslot UNIQUE(batch_id, teacher_id, batch_timeslot_id)
);

-- Step 5: For each existing batch, create standard timeslots
DO $$
DECLARE
    batch_record RECORD;
    days TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    day_name TEXT;
    slot_idx INTEGER;
    start_times TIME[] := ARRAY['09:00:00', '10:00:00', '11:00:00', '12:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00'];
    end_times TIME[] := ARRAY['10:00:00', '11:00:00', '12:00:00', '13:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'];
BEGIN
    -- For each batch, create the standard timeslots
    FOR batch_record IN SELECT batch_id FROM batches LOOP
        FOREACH day_name IN ARRAY days LOOP
            FOR slot_idx IN 0..7 LOOP
                INSERT INTO batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index, slot_name)
                VALUES (
                    batch_record.batch_id,
                    day_name,
                    start_times[slot_idx + 1],
                    end_times[slot_idx + 1],
                    slot_idx,
                    day_name || ' Slot ' || (slot_idx + 1)
                )
                ON CONFLICT (batch_id, day_of_week, slot_index) DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Created timeslots for batch: %', batch_record.batch_id;
    END LOOP;
END $$;

-- Step 6: Migrate existing class_sessions data
INSERT INTO class_sessions_new (
    session_id, subject_id, batch_id, teacher_id, batch_timeslot_id, room_id, session_type, created_at, updated_at
)
SELECT 
    cs.session_id,
    cs.subject_id,
    cs.batch_id,
    cs.teacher_id,
    bt.timeslot_id,
    cs.room_id,
    COALESCE(cs.session_type, 'lecture'),
    COALESCE(cs.created_at, CURRENT_TIMESTAMP),
    COALESCE(cs.updated_at, CURRENT_TIMESTAMP)
FROM class_sessions cs
JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
JOIN batch_timeslots bt ON (
    bt.batch_id = cs.batch_id AND 
    bt.day_of_week = ts.day_of_week AND 
    bt.slot_index = ts.slot_index
)
ON CONFLICT (batch_id, batch_timeslot_id) DO NOTHING;

-- Step 7: Drop old tables and rename new ones
DROP TABLE IF EXISTS class_sessions CASCADE;
ALTER TABLE class_sessions_new RENAME TO class_sessions;

-- Step 8: Create indexes for the new class_sessions table
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_id ON class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_timeslot_id ON class_sessions(batch_timeslot_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_room_id ON class_sessions(room_id);

-- Step 9: Update other tables to reference batch_timeslots instead of timeslots
ALTER TABLE blocked_timeslots DROP CONSTRAINT IF EXISTS blocked_timeslots_timeslot_id_fkey;
ALTER TABLE blocked_timeslots ADD COLUMN IF NOT EXISTS batch_timeslot_id INTEGER;
ALTER TABLE blocked_timeslots ADD CONSTRAINT blocked_timeslots_batch_timeslot_id_fkey 
    FOREIGN KEY (batch_timeslot_id) REFERENCES batch_timeslots(timeslot_id);

-- Step 10: Create a view for easy querying of timetables
CREATE OR REPLACE VIEW batch_timetable_view AS
SELECT 
    cs.session_id,
    cs.session_type,
    b.name as batch_name,
    s.name as subject_name,
    s.code as subject_code,
    t.name as teacher_name,
    r.room_name,
    bt.day_of_week,
    bt.start_time,
    bt.end_time,
    bt.slot_index,
    bt.slot_name,
    cs.batch_id,
    cs.subject_id,
    cs.teacher_id,
    cs.room_id,
    cs.batch_timeslot_id
FROM class_sessions cs
JOIN batches b ON cs.batch_id = b.batch_id
JOIN subjects s ON cs.subject_id = s.subject_id
JOIN teachers t ON cs.teacher_id = t.teacher_id
JOIN rooms r ON cs.room_id = r.room_id
JOIN batch_timeslots bt ON cs.batch_timeslot_id = bt.timeslot_id
ORDER BY b.name, bt.day_of_week, bt.slot_index;
