import sys
import json
from ortools.sat.python import cp_model
import collections

def solve_timetable(input_data):
    """
    Generates a timetable based on dynamic data passed from the Node.js API.
    
    Args:
        input_data (dict): Contains lists of subjects, teachers, and rooms for scheduling.
    
    Returns:
        A dictionary with the schedule result or an error message.
    """
    # --- 1. Unpack Data from API ---
    all_subjects = {s['subject_id']: s for s in input_data.get('subjects', [])}
    all_teachers = {t['teacher_id']: t for t in input_data.get('teachers', [])}
    all_rooms = {r['room_id']: r for r in input_data.get('rooms', [])}
    
    # For this model, we schedule all subjects passed for a single batch.
    batch_subject_ids = list(all_subjects.keys())

    # --- 2. Define Model Constants ---
    NUM_DAYS = 5
    SLOTS_PER_DAY = 8
    TOTAL_SLOTS_PER_WEEK = NUM_DAYS * SLOTS_PER_DAY

    model = cp_model.CpModel()

    # --- 3. Create Events & Solver Variables ---
    events = {} # This will hold all data and variables for each class session
    
    for subject_id in batch_subject_ids:
        subject = all_subjects.get(subject_id)
        if not subject: continue

        # In a real system, teacher assignment would be more complex.
        # Here we assume a 'teacher_id' is associated with the subject for simplicity.
        teacher_id = subject.get('teacher_id', 'unassigned') 
        event_code = subject['code']

        # Create Lecture Event(s)
        lec_hours = subject.get('lecture_credits', 0)
        if lec_hours > 0:
            event_id = f"{event_code}_Lec"
            events[event_id] = {
                'subject_id': subject_id,
                'teacher_id': teacher_id,
                'type': 'Lec',
                'duration': lec_hours,
            }
        
        # Create Lab Event(s)
        lab_hours = subject.get('lab_credits', 0)
        if lab_hours > 0:
            event_id = f"{event_code}_Lab"
            duration = lab_hours * 2 # Assuming 1 lab credit = 2 hours
            events[event_id] = {
                'subject_id': subject_id,
                'teacher_id': teacher_id,
                'type': 'Lab',
                'duration': duration,
            }

    # Create solver variables for time and room for each event
    lecture_rooms = [r['room_id'] for r in all_rooms.values() if not r['is_lab']]
    lab_rooms = [r['room_id'] for r in all_rooms.values() if r['is_lab']]

    for event_id, event in events.items():
        duration = event['duration']
        event['start_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK - duration, f"{event_id}_start")
        event['end_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK, f"{event_id}_end")
        event['interval_var'] = model.NewIntervalVar(event['start_var'], duration, event['end_var'], f"{event_id}_interval")
        
        possible_room_ids = lab_rooms if event['type'] == 'Lab' else lecture_rooms
        if not possible_room_ids:
            return {'status': 'error', 'message': f"No rooms available for type '{event['type']}'."}
        
        # The solver works with integer indices, so we map our UUIDs.
        room_domain = cp_model.Domain.FromValues(range(len(possible_room_ids)))
        event['room_var_index'] = model.NewIntVarFromDomain(room_domain, f"{event_id}_room_idx")
        event['possible_room_ids'] = possible_room_ids


    # --- 4. Define Constraints ---

    # Constraint 1: A teacher cannot teach two classes at the same time.
    teacher_intervals = collections.defaultdict(list)
    for event in events.values():
        teacher_intervals[event['teacher_id']].append(event['interval_var'])
    for intervals in teacher_intervals.values():
        model.AddNoOverlap(intervals)

    # Constraint 2: A room cannot be used for two classes at the same time.
    room_intervals = collections.defaultdict(list)
    for event in events.values():
        for i, room_id in enumerate(event['possible_room_ids']):
            # is_event_in_this_room_bool
            b = model.NewBoolVar(f"{event['id']}_in_{room_id}")
            model.Add(event['room_var_index'] == i).OnlyEnforceIf(b)
            model.Add(event['room_var_index'] != i).OnlyEnforceIf(b.Not())
            
            # Create an optional interval that is only 'active' if the event is in this room
            opt_interval = model.NewOptionalIntervalVar(
                event['start_var'], event['duration'], event['end_var'], b, f"{event['id']}_opt_{room_id}"
            )
            room_intervals[room_id].append(opt_interval)
            
    for intervals in room_intervals.values():
        model.AddNoOverlap(intervals)
        
    # --- 5. Solve the Model ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0 # Set a time limit
    status = solver.Solve(model)

    # --- 6. Format and Return the Solution ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        schedule = []
        for event_id, event in events.items():
            room_index = solver.Value(event['room_var_index'])
            assigned_room_id = event['possible_room_ids'][room_index]
            
            schedule.append({
                'subject_id': event['subject_id'],
                'teacher_id': event['teacher_id'],
                'room_id': assigned_room_id,
                'start_slot': solver.Value(event['start_var']),
                'duration': event['duration']
            })
        return {'status': 'success', 'schedule': schedule}
    else:
        return {'status': 'error', 'message': f"No solution found. Solver status: {solver.StatusName(status)}"}

def main():
    """
    Main function to run the script from the command line,
    communicating via JSON on stdin and stdout.
    """
    try:
        input_json = sys.stdin.read()
        if not input_json:
            print(json.dumps({'status': 'error', 'message': 'Input data is empty.'}, indent=2))
            return

        input_data = json.loads(input_json)
        solution = solve_timetable(input_data)
        print(json.dumps(solution, indent=2))

    except Exception as e:
        error_output = {'status': 'error', 'message': str(e)}
        print(json.dumps(error_output, indent=2))

if __name__ == '__main__':
    main()
