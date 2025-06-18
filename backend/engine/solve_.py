import json
import sys
import os
from ortools.sat.python import cp_model
import collections

def generate_timetable_solution(input_data):
    """
    Generates a university timetable for a single batch, respecting existing schedules
    for other batches and allowing for blocked-off time slots.
    """
    print("Starting timetable generation...", )
    # --- 1. Unpack Data from Input JSON ---
    config = input_data.get('config', {})
    subjects_input = input_data.get('subjects', [])
    teachers_input = input_data.get('teachers', [])
    rooms_input = input_data.get('rooms', [])
    teacher_allocations_input = input_data.get('teacher_allocations', [])
    batch_info = input_data.get('batch_to_schedule', {})
    
    print(f"Processing batch: {batch_info.get('name', 'Unknown')}", flush=True)
    print(f"Subjects: {len(subjects_input)}, Teachers: {len(teachers_input)}, Rooms: {len(rooms_input)}", flush=True)
    
    existing_sessions = input_data.get('existing_sessions', [])
    blocked_slots_input = input_data.get('blocked_slots', [])

    if not all([subjects_input, teachers_input, rooms_input, teacher_allocations_input, batch_info]):
        return {
            "status": "INPUT_ERROR", "error_message": "Missing core data in input JSON (subjects, teachers, rooms, allocations, or batch info)."
        }

    all_subjects = {s['subject_id']: s for s in subjects_input}
    all_teachers = {t['teacher_id']: t for t in teachers_input}
    all_rooms = {r['room_id']: r for r in rooms_input}
    subject_teacher_map = {alloc['subject_id']: alloc['teacher_id'] for alloc in teacher_allocations_input}

    # --- 2. Define Model Constants from Config ---
    NUM_DAYS = config.get('num_days', 5)
    SLOTS_PER_DAY = config.get('slots_per_day', 8)
    TOTAL_SLOTS_PER_WEEK = NUM_DAYS * SLOTS_PER_DAY
    MAX_DAILY_HOURS_SOFT = config.get('max_daily_hours_soft', 6)
    MAX_CONSECUTIVE_LECTURE_HOURS = config.get('max_consecutive_lecture_hours', 2)
    MORNING_SLOTS_COUNT = config.get('morning_slots_count', SLOTS_PER_DAY // 2)
    EVENING_SLOTS_START_IDX = config.get('evening_slots_start_idx', MORNING_SLOTS_COUNT)

    # --- 3. Prepare Events to Schedule for the Batch ---
    events_to_schedule = []
    split_lecture_specific_pairs = []
    for subj_id, subject in all_subjects.items():
        teacher_id = subject_teacher_map.get(subj_id)
        if not teacher_id: continue
        lec_duration = subject.get('lecture_credits', 0)
        lab_duration = subject.get('lab_credits', 0)
        subj_code = subject.get('code', subj_id)
        if lec_duration > 0:
            if lec_duration > MAX_CONSECUTIVE_LECTURE_HOURS:
                part_a_duration = MAX_CONSECUTIVE_LECTURE_HOURS
                part_b_duration = lec_duration - MAX_CONSECUTIVE_LECTURE_HOURS
                lec_a_id = f"{subj_code}_LecA"
                lec_b_id = f"{subj_code}_LecB"
                events_to_schedule.append({'id': lec_a_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_a_duration, 'teacher_id': teacher_id})
                events_to_schedule.append({'id': lec_b_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_b_duration, 'teacher_id': teacher_id})
                split_lecture_specific_pairs.append((lec_a_id, lec_b_id))
            else:
                events_to_schedule.append({'id': f"{subj_code}_Lec", 'subject_id': subj_id, 'type': 'Lec', 'duration': lec_duration, 'teacher_id': teacher_id})
        if lab_duration > 0:
            events_to_schedule.append({'id': f"{subj_code}_Lab", 'subject_id': subj_id, 'type': 'Lab', 'duration': lab_duration, 'teacher_id': teacher_id})

    if not events_to_schedule:
        return {"status": "MODEL_INVALID", "error_message": "No events to schedule."}
    
    event_map_by_id = {ev['id']: ev for ev in events_to_schedule}
    model = cp_model.CpModel()
    
    # --- 4. Create Solver Variables & Hard Constraints ---
    all_possible_slots = range(TOTAL_SLOTS_PER_WEEK)
    blocked_slot_indices = { s['day_index'] * SLOTS_PER_DAY + s['slot_index_in_day'] for s in blocked_slots_input }
    
    lecture_rooms = [r for r in rooms_input if not r.get('is_lab', False)]
    lab_rooms = [r for r in rooms_input if r.get('is_lab', True)]

    teacher_event_intervals = collections.defaultdict(list)
    room_event_intervals = collections.defaultdict(list)

    for event in events_to_schedule:
        duration = event['duration']
        allowed_starts = [s for s in all_possible_slots if s + duration <= TOTAL_SLOTS_PER_WEEK and all(s + i not in blocked_slot_indices for i in range(duration))]
        if not allowed_starts:
             return {"status": "MODEL_INVALID", "error_message": f"Event {event['id']} (duration {duration}) cannot be scheduled due to blocked slots."}
        
        domain = cp_model.Domain.FromValues(allowed_starts)
        event['start_var'] = model.NewIntVarFromDomain(domain, f"{event['id']}_start")
        event['end_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK, f"{event['id']}_end")
        event['interval_var'] = model.NewIntervalVar(event['start_var'], duration, event['end_var'], f"{event['id']}_interval")
        event['day_var'] = model.NewIntVar(0, NUM_DAYS - 1, f"{event['id']}_day")
        model.AddDivisionEquality(event['day_var'], event['start_var'], SLOTS_PER_DAY)
        
        possible_rooms = lab_rooms if event['type'] == 'Lab' else lecture_rooms
        room_domain = cp_model.Domain.FromValues(range(len(possible_rooms)))
        event['room_var_index'] = model.NewIntVarFromDomain(room_domain, f"{event['id']}_room_idx")
        event['possible_rooms'] = possible_rooms

        teacher_event_intervals[event['teacher_id']].append(event['interval_var'])

        for i, room in enumerate(possible_rooms):
            is_event_in_this_room = model.NewBoolVar(f"{event['id']}_in_room_{room['room_id']}")
            model.Add(event['room_var_index'] == i).OnlyEnforceIf(is_event_in_this_room)
            model.Add(event['room_var_index'] != i).OnlyEnforceIf(is_event_in_this_room.Not())
            optional_interval = model.NewOptionalIntervalVar(event['start_var'], duration, event['end_var'], is_event_in_this_room, f"{event['id']}_opt_interval_in_room_{room['room_id']}")
            room_event_intervals[room['room_id']].append(optional_interval)

    for i, session in enumerate(existing_sessions):
        start = session['day_index'] * SLOTS_PER_DAY + session['start_slot_in_day']
        duration = session['duration_slots']
        fixed_interval = model.NewFixedSizeIntervalVar(start, duration, f"existing_session_{i}")
        if session.get('teacher_id'): teacher_event_intervals[session['teacher_id']].append(fixed_interval)
        if session.get('room_id'): room_event_intervals[session['room_id']].append(fixed_interval)

    for intervals in teacher_event_intervals.values(): model.AddNoOverlap(intervals)
    for intervals in room_event_intervals.values(): model.AddNoOverlap(intervals)
    model.AddNoOverlap([event['interval_var'] for event in events_to_schedule])
    
    subject_lecture_events = {sid: [e for e in events_to_schedule if e['subject_id'] == sid and e['type'] == 'Lec'] for sid in all_subjects}
    for lectures_list in subject_lecture_events.values():
        if len(lectures_list) > 1: model.AddAllDifferent([lec['day_var'] for lec in lectures_list])

    for event in events_to_schedule:
        if event['type'] == 'Lab':
            allowed_starts_for_lab = [ds * SLOTS_PER_DAY + s for ds in range(NUM_DAYS) for s in range(EVENING_SLOTS_START_IDX, SLOTS_PER_DAY - event['duration'] + 1)]
            if not allowed_starts_for_lab and event['duration'] > 0: return {"status": "MODEL_INVALID", "error_message": f"No valid evening slots for Lab {event['id']}."}
            if allowed_starts_for_lab: model.AddAllowedAssignments([event['start_var']], [(s,) for s in allowed_starts_for_lab])

        # NEW CONSTRAINT: 2-hour lectures must be entirely in morning or entirely in evening
        if event['type'] == 'Lec' and event['duration'] == 2:
            allowed_starts_for_2hr_lec = []
            for day in range(NUM_DAYS):
                # Allowed starts in Morning (e.g., slots 0, 1, 2 if morning_slots_count is 4)
                if MORNING_SLOTS_COUNT >= 2:
                    for slot_in_day_morning in range(MORNING_SLOTS_COUNT - 1):
                        allowed_starts_for_2hr_lec.append(day * SLOTS_PER_DAY + slot_in_day_morning)
                
                # Allowed starts in Evening (e.g., slots 4, 5, 6 if evening starts at 4 and slots_per_day is 8)
                num_evening_slots = SLOTS_PER_DAY - EVENING_SLOTS_START_IDX
                if num_evening_slots >= 2:
                    for evening_slot_offset in range(num_evening_slots - 1):
                        allowed_starts_for_2hr_lec.append(day * SLOTS_PER_DAY + EVENING_SLOTS_START_IDX + evening_slot_offset)
            
            if allowed_starts_for_2hr_lec:
                model.AddAllowedAssignments([event['start_var']], [(s,) for s in allowed_starts_for_2hr_lec])

    # --- 5. Define SOFT CONSTRAINTS (for Optimization) ---
    daily_penalties = []
    if MAX_DAILY_HOURS_SOFT > 0 and MAX_DAILY_HOURS_SOFT < SLOTS_PER_DAY:
        for day in range(NUM_DAYS):
            daily_duration_vars = [model.NewBoolVar(f"{e['id']}_on_day_{day}") for e in events_to_schedule]
            for i, event in enumerate(events_to_schedule):
                model.Add(event['day_var'] == day).OnlyEnforceIf(daily_duration_vars[i])
                model.Add(event['day_var'] != day).OnlyEnforceIf(daily_duration_vars[i].Not())
            
            hours_on_this_day = model.NewIntVar(0, SLOTS_PER_DAY, f"hours_on_day_{day}")
            model.Add(hours_on_this_day == sum(daily_duration_vars[i] * events_to_schedule[i]['duration'] for i in range(len(events_to_schedule))))
            
            penalty_var = model.NewIntVar(0, SLOTS_PER_DAY, f"penalty_day_{day}")
            model.Add(penalty_var >= hours_on_this_day - MAX_DAILY_HOURS_SOFT)
            daily_penalties.append(penalty_var)
        if daily_penalties: model.Minimize(sum(daily_penalties))    # --- 6. Solve the Model ---
    print(f"Starting solver with {len(events_to_schedule)} events to schedule...", flush=True)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(config.get('solver_max_time_seconds', 30.0))
    solver.parameters.log_search_progress = config.get('log_search_progress', True)
    print(f"Solver configured with max time: {solver.parameters.max_time_in_seconds} seconds", flush=True)
    
    print("Starting solve...", flush=True)
    status = solver.Solve(model)
    print(f"Solver finished with status: {solver.StatusName(status)}", flush=True)

    # --- 7. Format and Return the Solution ---
    output_result = {
        "status": solver.StatusName(status),
        "objective_value": None,
        "solution": None,
        "error_message": None,
        "batch_info": batch_info
    }

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        if daily_penalties:
            output_result["objective_value"] = solver.ObjectiveValue()
        
        timetable_entries = []
        for event in events_to_schedule:
            start_slot_global = solver.Value(event['start_var'])
            duration = event['duration']
            room_idx = solver.Value(event['room_var_index'])
            assigned_room = event['possible_rooms'][room_idx]
            start_slot_in_day = start_slot_global % SLOTS_PER_DAY            
            timetable_entries.append({
                "event_id": event['id'],
                "subject_id": event['subject_id'],
                "subject_name": all_subjects[event['subject_id']].get('name'),
                "subject_code": all_subjects[event['subject_id']].get('code'),
                "type": event['type'],
                "teacher_id": event.get('teacher_id'),
                "teacher_name": all_teachers.get(event.get('teacher_id'), {}).get('name'),
                "room_id": assigned_room['room_id'],
                "room_name": assigned_room['room_name'],
                "duration_slots": duration,
                "day_index": start_slot_global // SLOTS_PER_DAY,
                "start_slot_in_day": start_slot_in_day,
                "end_slot_in_day": start_slot_in_day + duration - 1,
                "day_of_week": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][start_slot_global // SLOTS_PER_DAY],
                "slot_index": start_slot_in_day
            })
        output_result["solution"] = {"timetable": sorted(timetable_entries, key=lambda x: (x['day_index'], x['start_slot_in_day']))}
    
    elif status == cp_model.INFEASIBLE:
        output_result["error_message"] = "Model is infeasible. This could be due to overly restrictive blocked slots or existing sessions making it impossible to schedule all classes."
    else:
        output_result["error_message"] = f"Solver finished with status: {solver.StatusName(status)}."
    
    return output_result

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python solve_.py <path_to_input_json>")
        sys.exit(1)
    
    input_file_path = sys.argv[1]
      # Read input JSON to extract batch_id for output file naming
    try:
        with open(input_file_path, 'r') as f:
            input_json_data = json.load(f)            
            batch_id = input_json_data.get('batch_to_schedule', {}).get('batch_id', 'unknown')    
            
            # Create absolute path to outputs directory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            outputs_dir = os.path.join(script_dir, 'outputs')
            os.makedirs(outputs_dir, exist_ok=True)
            output_file_path = os.path.join(outputs_dir, f'{batch_id}_output.json')
    except Exception as e:
        print(f"Error reading input file: {e}", file=sys.stderr)
        sys.exit(1)
    
    solution_output = generate_timetable_solution(input_json_data)

    try:
        with open(output_file_path, 'w') as f:
            json.dump(solution_output, f, indent=2)
        print(f"Timetable solution saved to {output_file_path}")
    except Exception as e:
        print(f"Error saving output file: {e}", file=sys.stderr)
        print(json.dumps(solution_output, indent=2))
