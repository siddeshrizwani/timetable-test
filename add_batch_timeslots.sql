-- Add timeslots for the batch that needs them
-- This will create standard university timeslots for the batch

-- First, get the batch_id for "B.Tech test 2022-2026 - Section A"
-- Replace 'your-batch-id-here' with the actual batch ID from your logs: c4a4cdcd-a13d-4868-949f-5c6d5491ad6e

-- Insert batch-specific timeslots (Monday to Friday, 8 slots per day)
INSERT INTO batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index, duration_minutes) 
VALUES 
-- Monday slots
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '09:00', '10:00', 1, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '10:00', '11:00', 2, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '11:15', '12:15', 3, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '12:15', '13:15', 4, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '14:00', '15:00', 5, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '15:00', '16:00', 6, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '16:15', '17:15', 7, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Monday', '17:15', '18:15', 8, 60),

-- Tuesday slots
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '09:00', '10:00', 1, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '10:00', '11:00', 2, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '11:15', '12:15', 3, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '12:15', '13:15', 4, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '14:00', '15:00', 5, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '15:00', '16:00', 6, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '16:15', '17:15', 7, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Tuesday', '17:15', '18:15', 8, 60),

-- Wednesday slots
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '09:00', '10:00', 1, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '10:00', '11:00', 2, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '11:15', '12:15', 3, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '12:15', '13:15', 4, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '14:00', '15:00', 5, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '15:00', '16:00', 6, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '16:15', '17:15', 7, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Wednesday', '17:15', '18:15', 8, 60),

-- Thursday slots
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '09:00', '10:00', 1, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '10:00', '11:00', 2, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '11:15', '12:15', 3, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '12:15', '13:15', 4, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '14:00', '15:00', 5, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '15:00', '16:00', 6, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '16:15', '17:15', 7, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Thursday', '17:15', '18:15', 8, 60),

-- Friday slots
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '09:00', '10:00', 1, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '10:00', '11:00', 2, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '11:15', '12:15', 3, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '12:15', '13:15', 4, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '14:00', '15:00', 5, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '15:00', '16:00', 6, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '16:15', '17:15', 7, 60),
('c4a4cdcd-a13d-4868-949f-5c6d5491ad6e', 'Friday', '17:15', '18:15', 8, 60);

-- Verify the timeslots were added
SELECT COUNT(*) as timeslot_count FROM batch_timeslots WHERE batch_id = 'c4a4cdcd-a13d-4868-949f-5c6d5491ad6e';
