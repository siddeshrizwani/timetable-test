# Timetable Generation API

## Overview
The timetable generation API creates optimized schedules for university batches using constraint programming with Google OR-Tools.

## Installation

### Backend Dependencies
```bash
npm install
```

### Python Dependencies
```bash
cd backend/engine
pip install -r requirements.txt
```

## API Endpoint

### POST /api/generate-timetable

Generates a timetable for a specific batch.

**Request Body:**
```json
{
  "batch_id": 1
}
```

**Response:**
```json
{
  "msg": "Timetable generated successfully",
  "status": "OPTIMAL",
  "objective_value": 2.0,
  "timetable": [
    {
      "event_id": "CS201_LecA",
      "subject_id": 101,
      "subject_name": "Data Structures",
      "subject_code": "CS201",
      "type": "Lec",
      "teacher_id": 1,
      "teacher_name": "Dr. Alan Turing",
      "room_id": 1,
      "room_name": "Room 101",
      "duration_slots": 2,
      "day_index": 0,
      "start_slot_in_day": 2,
      "end_slot_in_day": 3
    }
  ],
  "error_message": null,
  "batch_info": {
    "batch_id": 1,
    "name": "Computer Science - 3rd Semester"
  }
}
```

## How It Works

1. **Data Fetching**: The API fetches all required data from the database:
   - Batch information
   - Subjects for the batch
   - Teachers and their allocations
   - Available rooms
   - Existing sessions (to avoid conflicts)

2. **Input Generation**: Creates a JSON input file with the schema expected by the Python solver:
   - Configuration parameters (days, slots, constraints)
   - Subjects with lecture and lab credits
   - Teachers and room information
   - Teacher-subject allocations
   - Existing sessions and blocked slots

3. **Solver Execution**: Runs the Python constraint programming solver:
   - Uses Google OR-Tools CP-SAT solver
   - Applies hard constraints (no overlaps, room types, time restrictions)
   - Optimizes soft constraints (daily hour limits)

4. **Result Processing**: 
   - Reads the generated output file
   - Stores successful timetables in the database
   - Returns the result to the client

## Configuration

The solver uses these default configuration parameters:
- **num_days**: 5 (Monday to Friday)
- **slots_per_day**: 8 (8 time slots per day)
- **morning_slots_count**: 4 (first 4 slots are morning)
- **evening_slots_start_idx**: 4 (evening starts from slot 4)
- **max_daily_hours_soft**: 6 (soft limit for daily hours)
- **max_consecutive_lecture_hours**: 2 (max consecutive lecture slots)
- **solver_max_time_seconds**: 30 (solver timeout)

## Database Schema Requirements

The API expects these database tables:
- `batches`: Batch information
- `subjects`: Subject details with lecture/lab credits
- `teachers`: Teacher information
- `rooms`: Room details with lab/lecture distinction
- `batch_subjects`: Many-to-many relationship
- `subject_teachers`: Subject-teacher assignments (optional, falls back to cyclic assignment)
- `class_sessions`: Generated timetable sessions
- `timeslots`: Time slot definitions

## Error Handling

The API handles various error scenarios:
- Missing batch, subjects, teachers, or rooms
- Python script execution failures
- Database transaction errors
- File system issues

## Testing

Use the provided test script:
```bash
node backend/test-timetable.js
```

Make sure your server is running on port 5000 and you have a batch with ID 1 configured in the database.
