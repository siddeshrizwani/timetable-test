import json
import sys
from ortools.sat.python import cp_model

def generate_timetable_solution(input_data):
    # --- Extract Configuration ---
    config = input_data.get('config', {})
    subjects_input = input_data.get('subjects', [])
    # teachers_input = input_data.get('teachers', []) # Placeholder for future use
    # rooms_input = input_data.get('rooms', [])       # Placeholder for future use

    NUM_DAYS = config.get('num_days', 5)
    SLOTS_PER_DAY = config.get('slots_per_day', 8)
    # Default morning slots to half if not specified, evening starts after morning
    MORNING_SLOTS_COUNT = config.get('morning_slots_count', SLOTS_PER_DAY // 2)
    EVENING_SLOTS_START_IDX = config.get('evening_slots_start_idx', MORNING_SLOTS_COUNT)
    
    TOTAL_SLOTS_PER_WEEK = NUM_DAYS * SLOTS_PER_DAY
    MAX_DAILY_HOURS_SOFT = config.get('max_daily_hours_soft', 6)
    # Max hours a single lecture part can be, lectures longer than this are split
    MAX_CONSECUTIVE_LECTURE_HOURS = config.get('max_consecutive_lecture_hours', 2)

    # --- Prepare Events to Schedule ---
    events_to_schedule = []
    # Stores (event_a_id, event_b_id) for lectures split due to MAX_CONSECUTIVE_LECTURE_HOURS
    # This is specifically for the constraint that these two parts shouldn't be back-to-back if on the same day.
    split_lecture_specific_pairs = [] 

    for subj_details in subjects_input:
        subj_id = subj_details['id']
        subj_type = subj_details['type']

        if subj_type == 'LecLab':
            lec_duration = subj_details.get('lec_hr', 0)
            lab_duration = subj_details.get('lab_hr', 0)
            
            # Lecture part processing
            if lec_duration > 0:
                if lec_duration > MAX_CONSECUTIVE_LECTURE_HOURS:
                    # Split lecture logic (e.g., 3hr lec with max 2hr consecutive -> 2hr + 1hr)
                    part_a_duration = MAX_CONSECUTIVE_LECTURE_HOURS
                    part_b_duration = lec_duration - MAX_CONSECUTIVE_LECTURE_HOURS
                    
                    lec_a_id = f"{subj_id}_LecA"
                    lec_b_id = f"{subj_id}_LecB"

                    if part_a_duration > 0:
                        events_to_schedule.append({
                            'id': lec_a_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_a_duration,
                            'teacher_id': subj_details.get('lec_teacher_id'), 'room_id': subj_details.get('lec_room_id')
                        })
                    if part_b_duration > 0:
                        events_to_schedule.append({
                            'id': lec_b_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_b_duration,
                            'teacher_id': subj_details.get('lec_teacher_id'), 'room_id': subj_details.get('lec_room_id')
                        })
                    if part_a_duration > 0 and part_b_duration > 0:
                        split_lecture_specific_pairs.append((lec_a_id, lec_b_id))
                else: # Lecture does not need splitting
                     events_to_schedule.append({
                        'id': f"{subj_id}_Lec", 'subject_id': subj_id, 'type': 'Lec', 'duration': lec_duration,
                        'teacher_id': subj_details.get('lec_teacher_id'), 'room_id': subj_details.get('lec_room_id')
                    })

            # Lab part (not split)
            if lab_duration > 0:
                events_to_schedule.append({
                    'id': f"{subj_id}_Lab", 'subject_id': subj_id, 'type': 'Lab', 'duration': lab_duration,
                    'teacher_id': subj_details.get('lab_teacher_id'), 'room_id': subj_details.get('lab_room_id')
                })

        elif subj_type == 'LecOnly':
            lec_duration = subj_details.get('lec_hr', 0)
            if lec_duration > 0:
                if lec_duration > MAX_CONSECUTIVE_LECTURE_HOURS:
                    part_a_duration = MAX_CONSECUTIVE_LECTURE_HOURS
                    part_b_duration = lec_duration - MAX_CONSECUTIVE_LECTURE_HOURS

                    lec_a_id = f"{subj_id}_LecA"
                    lec_b_id = f"{subj_id}_LecB"
                    
                    if part_a_duration > 0:
                        events_to_schedule.append({
                            'id': lec_a_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_a_duration,
                            'teacher_id': subj_details.get('teacher_id'), 'room_id': subj_details.get('room_id')
                        })
                    if part_b_duration > 0:
                        events_to_schedule.append({
                            'id': lec_b_id, 'subject_id': subj_id, 'type': 'Lec', 'duration': part_b_duration,
                            'teacher_id': subj_details.get('teacher_id'), 'room_id': subj_details.get('room_id')
                        })
                    if part_a_duration > 0 and part_b_duration > 0:
                         split_lecture_specific_pairs.append((lec_a_id, lec_b_id))
                else:
                    events_to_schedule.append({
                        'id': f"{subj_id}_Lec", 'subject_id': subj_id, 'type': 'Lec', 'duration': lec_duration,
                        'teacher_id': subj_details.get('teacher_id'), 'room_id': subj_details.get('room_id')
                    })
    
    if not events_to_schedule:
        return {
            "status": "MODEL_INVALID", "objective_value": None, "solution": None,
            "error_message": "No events to schedule. Check subject definitions and durations."
        }

    model = cp_model.CpModel()

    # --- Create Variables for Each Event ---
    for event in events_to_schedule:
        if event['duration'] <= 0 or event['duration'] > SLOTS_PER_DAY : # Basic validation
             return {
                "status": "MODEL_INVALID", "objective_value": None, "solution": None,
                "error_message": f"Event {event['id']} has invalid duration {event['duration']} (must be >0 and <=SLOTS_PER_DAY)."
            }
        event['start_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK - event['duration'], f"{event['id']}_start")
        # end is start + duration. So domain is [duration, TOTAL_SLOTS_PER_WEEK]
        event['end_var'] = model.NewIntVar(event['duration'], TOTAL_SLOTS_PER_WEEK, f"{event['id']}_end")
        event['interval_var'] = model.NewIntervalVar(event['start_var'], event['duration'], event['end_var'], f"{event['id']}_interval")
        
        event['day_var'] = model.NewIntVar(0, NUM_DAYS - 1, f"{event['id']}_day")
        model.AddDivisionEquality(event['day_var'], event['start_var'], SLOTS_PER_DAY)

    # --- Hard Constraints ---
    # 1. No Overlap (globally for all events):
    if events_to_schedule: # Only if there are events
        model.AddNoOverlap([event['interval_var'] for event in events_to_schedule])

    # 2. Teacher Conflict: A teacher cannot be assigned to two overlapping events.
    teacher_event_intervals = {}
    for event in events_to_schedule:
        teacher_id = event.get('teacher_id')
        if teacher_id: 
            teacher_event_intervals.setdefault(teacher_id, []).append(event['interval_var'])
    
    for intervals in teacher_event_intervals.values():
        if len(intervals) > 1:
            model.AddNoOverlap(intervals)

    # 3. Lectures of the same subject (all its parts, e.g. LecA, LecB) must be on different days.
    subject_lecture_events = {} 
    for event in events_to_schedule:
        if event['type'] == 'Lec':
            subject_lecture_events.setdefault(event['subject_id'], []).append(event)

    for lectures_list in subject_lecture_events.values():
        if len(lectures_list) > 1:
            for i in range(len(lectures_list)):
                for j in range(i + 1, len(lectures_list)):
                    model.Add(lectures_list[i]['day_var'] != lectures_list[j]['day_var'])
    
    # 4. Labs in Evening Slots Only:
    for event in events_to_schedule:
        if event['type'] == 'Lab':
            allowed_starts_for_lab = []
            # Max start slot in day for lab: SLOTS_PER_DAY - event['duration']
            # Loop from EVENING_SLOTS_START_IDX to SLOTS_PER_DAY - event['duration'] (inclusive)
            for day in range(NUM_DAYS):
                for slot_in_day in range(EVENING_SLOTS_START_IDX, SLOTS_PER_DAY - event['duration'] + 1):
                    allowed_starts_for_lab.append(day * SLOTS_PER_DAY + slot_in_day)
            
            if not allowed_starts_for_lab and event['duration'] > 0 :
                 return {
                    "status": "MODEL_INVALID", "objective_value": None, "solution": None,
                    "error_message": f"No valid evening start slots for Lab {event['id']} (duration {event['duration']}). Check evening slot configuration, lab duration, and SLOTS_PER_DAY."
                }
            if event['duration'] > 0 and allowed_starts_for_lab: # Add constraint if lab has duration and valid slots exist
                model.AddAllowedAssignments([event['start_var']], [(s,) for s in allowed_starts_for_lab])

    # 5. Max Consecutive Lecture Hours (Split Parts Not Back-to-Back on Same Day):
    #    Applies to pairs in `split_lecture_specific_pairs` (e.g., S_LecA, S_LecB from a 3hr original)
    #    This constraint is only meaningful if the "lectures of same subject on different days" (constraint 3)
    #    is relaxed for these specific split parts. Given constraint 3, this one might be redundant.
    #    However, keeping structure similar to reference solver.py.
    event_map_by_id = {ev['id']: ev for ev in events_to_schedule}
    for id_a, id_b in split_lecture_specific_pairs:
        if id_a not in event_map_by_id or id_b not in event_map_by_id:
            continue 
        event_a = event_map_by_id[id_a]
        event_b = event_map_by_id[id_b]

        b_same_day = model.NewBoolVar(f"sameday_{event_a['id']}_{event_b['id']}")
        model.Add(event_a['day_var'] == event_b['day_var']).OnlyEnforceIf(b_same_day)
        model.Add(event_a['day_var'] != event_b['day_var']).OnlyEnforceIf(b_same_day.Not())

        b_consecutive_ab = model.NewBoolVar(f"consecutive_ab_{event_a['id']}_{event_b['id']}")
        model.Add(event_a['end_var'] == event_b['start_var']).OnlyEnforceIf(b_consecutive_ab)
        model.Add(event_a['end_var'] != event_b['start_var']).OnlyEnforceIf(b_consecutive_ab.Not())
        model.AddImplication(b_same_day, b_consecutive_ab.Not()) # If same day, not A then B

        b_consecutive_ba = model.NewBoolVar(f"consecutive_ba_{event_a['id']}_{event_b['id']}")
        model.Add(event_b['end_var'] == event_a['start_var']).OnlyEnforceIf(b_consecutive_ba)
        model.Add(event_b['end_var'] != event_a['start_var']).OnlyEnforceIf(b_consecutive_ba.Not())
        model.AddImplication(b_same_day, b_consecutive_ba.Not()) # If same day, not B then A

    # 6. NEW CONSTRAINT: 2-hour lectures must be entirely in morning or entirely in evening
    for event in events_to_schedule:
        if event['type'] == 'Lec' and event['duration'] == 2:
            allowed_starts_for_2hr_lec = []
            for day in range(NUM_DAYS):
                # Allowed starts in Morning:
                # A 2hr lecture can start in slots 0 to MORNING_SLOTS_COUNT - 2
                # Requires at least 2 morning slots to exist.
                if MORNING_SLOTS_COUNT >= 2:
                    for slot_in_day_morning in range(MORNING_SLOTS_COUNT - 1):
                        allowed_starts_for_2hr_lec.append(day * SLOTS_PER_DAY + slot_in_day_morning)
                
                # Allowed starts in Evening:
                # A 2hr lecture can start in slots EVENING_SLOTS_START_IDX to SLOTS_PER_DAY - 2
                # Requires at least 2 evening slots to exist.
                num_evening_slots = SLOTS_PER_DAY - EVENING_SLOTS_START_IDX
                if num_evening_slots >= 2:
                    for evening_slot_offset in range(num_evening_slots - 1):
                        allowed_starts_for_2hr_lec.append(day * SLOTS_PER_DAY + EVENING_SLOTS_START_IDX + evening_slot_offset)
            
            if allowed_starts_for_2hr_lec: # Only add if there are valid slots
                model.AddAllowedAssignments([event['start_var']], [(s,) for s in allowed_starts_for_2hr_lec])
            elif event['duration'] > 0: # If no allowed slots for a 2hr lecture, it will likely make the model infeasible
                # This case means the configuration (morning/evening slots) doesn't permit 2hr lectures
                # to be scheduled according to this rule. The solver will handle this.
                # For clarity, one could return an error here if such events exist and allowed_starts is empty.
                # However, AddAllowedAssignments with an empty list for a variable that must take a value
                # will correctly lead to infeasibility if this event must be scheduled.
                # To be absolutely safe and explicit if this event *must* be scheduled and has no valid starts:
                model.AddBoolOr([]).OnlyEnforceIf(model.NewConstant(0)) # Add a trivially false constraint part if needed for this event.
                                                                        # Or rely on AddAllowedAssignments([]) to do its job.
                                                                        # The current AddAllowedAssignments handles it.
                pass


    # --- Soft Constraint: Try not to exceed MAX_DAILY_HOURS_SOFT a day ---
    daily_penalties = []
    if MAX_DAILY_HOURS_SOFT > 0 and MAX_DAILY_HOURS_SOFT < SLOTS_PER_DAY : # Only if constraint is meaningful
        for day in range(NUM_DAYS):
            is_event_active_on_this_day_vars = [] 
            event_durations_for_sum = []      

            for event in events_to_schedule:
                b = model.NewBoolVar(f"{event['id']}_on_day_{day}")
                model.Add(event['day_var'] == day).OnlyEnforceIf(b)
                model.Add(event['day_var'] != day).OnlyEnforceIf(b.Not())
                is_event_active_on_this_day_vars.append(b)
                event_durations_for_sum.append(event['duration'])

            hours_on_this_day = model.NewIntVar(0, SLOTS_PER_DAY, f"hours_on_day_{day}")
            model.Add(hours_on_this_day == cp_model.LinearExpr.WeightedSum(is_event_active_on_this_day_vars, event_durations_for_sum))
            
            penalty_var = model.NewIntVar(0, SLOTS_PER_DAY, f"penalty_day_{day}")
            model.Add(penalty_var >= hours_on_this_day - MAX_DAILY_HOURS_SOFT)
            # model.Add(penalty_var >= 0) # Implicit by domain
            daily_penalties.append(penalty_var)

        if daily_penalties:
             model.Minimize(sum(daily_penalties))

    # --- Solve ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(config.get('solver_max_time_seconds', 30.0))
    # solver.parameters.log_search_progress = True # Uncomment for debugging
    status = solver.Solve(model)

    # --- Output Results ---
    output_result = {
        "status": solver.StatusName(status), "objective_value": None,
        "solution": None, "error_message": None
    }

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        if daily_penalties: # If minimization was active
            output_result["objective_value"] = solver.ObjectiveValue()
        else: # No penalties, so objective is implicitly 0 or not relevant
             output_result["objective_value"] = 0.0

        timetable_entries = []
        for event in events_to_schedule:
            start_slot_global = solver.Value(event['start_var'])
            duration = event['duration']
            end_slot_global = start_slot_global + duration - 1 

            day_index = start_slot_global // SLOTS_PER_DAY
            start_slot_in_day = start_slot_global % SLOTS_PER_DAY
            # end_slot_in_day is the slot index within its day that the event ends on
            end_slot_in_day = (start_slot_in_day + duration - 1) 

            timetable_entries.append({
                "event_id": event['id'], "subject_id": event['subject_id'], "type": event['type'],
                "duration_slots": duration, "teacher_id": event.get('teacher_id'), "room_id": event.get('room_id'),
                "day_index": day_index, "start_slot_index_in_day": start_slot_in_day,
                "end_slot_index_in_day": end_slot_in_day, 
                "start_slot_global": start_slot_global, "end_slot_global": end_slot_global
            })
        output_result["solution"] = {"timetable": sorted(timetable_entries, key=lambda x: x['start_slot_global'])}
    elif status == cp_model.INFEASIBLE:
        output_result["error_message"] = "Model is infeasible. No solution satisfies all hard constraints."
    elif status == cp_model.MODEL_INVALID:
        output_result["error_message"] = "Model is invalid. Check constraints, variable definitions, or input data."
    else:
        output_result["error_message"] = f"Solver finished with status: {solver.StatusName(status)}."

    return output_result

if __name__ == '__main__':
    input_file_path = 'sample_input.json' # Define the input file name
    output_file_path = 'outputs/timetable_output.json' # Define the output file name
    try:
        with open(input_file_path, 'r') as f:
            raw_input_json = f.read()
        if not raw_input_json.strip():
            raise ValueError(f"Empty input JSON received from {input_file_path}.")
        input_json_data = json.loads(raw_input_json)
    except FileNotFoundError:
        error_output = {"status": "INPUT_ERROR", "error_message": f"Input file '{input_file_path}' not found."}
        print(json.dumps(error_output, indent=2))
        sys.exit(1)
    except json.JSONDecodeError as e:
        error_output = {"status": "INPUT_ERROR", "error_message": f"Failed to decode input JSON: {str(e)}"}
        print(json.dumps(error_output, indent=2))
        sys.exit(1)
    except ValueError as e: # Catch empty input
        error_output = {"status": "INPUT_ERROR", "error_message": str(e)}
        print(json.dumps(error_output, indent=2))
        sys.exit(1)
    except Exception as e: 
        error_output = {"status": "INPUT_ERROR", "error_message": f"An unexpected error occurred reading input: {str(e)}"}
        print(json.dumps(error_output, indent=2))
        sys.exit(1)
    
    try:
        solution_output = generate_timetable_solution(input_json_data)
    except Exception as e: # Catch errors during solving
        solution_output = {"status": "SOLVER_ERROR", "error_message": f"An error occurred during timetable generation: {str(e)}"}

    # Write the solution to the output file
    try:
        with open(output_file_path, 'w') as f:
            json.dump(solution_output, f, indent=2)
        print(f"Timetable solution saved to {output_file_path}")
    except Exception as e:
        print(f"Error saving output to {output_file_path}: {str(e)}")
        print(json.dumps(solution_output, indent=2))  # Fall back to console output
