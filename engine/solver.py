from ortools.sat.python import cp_model

def solve_timetable():
    # --- Model Configuration ---
    subjects_data = {
        'ALC': {'type': 'LecLab', 'lec_hr': 2, 'lab_hr': 2},
        'CTS': {'type': 'LecLab', 'lec_hr': 3, 'lab_hr': 2},
        'AWP': {'type': 'LecLab', 'lec_hr': 2, 'lab_hr': 2},
        'CVD': {'type': 'LecLab', 'lec_hr': 2, 'lab_hr': 2},
        'NSA': {'type': 'LecOnly', 'lec_hr': 3},
        'ICT': {'type': 'LecOnly', 'lec_hr': 3},
        'MINOR': {'type': 'LecOnly', 'lec_hr': 3},
    }

    NUM_DAYS = 5
    SLOTS_PER_DAY = 8  # 4 morning, 4 evening
    MORNING_SLOTS_COUNT = 4
    EVENING_SLOTS_START_IDX = 4 # Slot indices 0-3 are morning, 4-7 are evening
    TOTAL_SLOTS_PER_WEEK = NUM_DAYS * SLOTS_PER_DAY
    MAX_DAILY_HOURS_SOFT = 6

    # --- Prepare Events to Schedule ---
    # "Max 2hr consecutive lecture" means 3hr lectures must be split.
    events_to_schedule = []
    # Store pairs of lecture events that belong to the same original 3-hour lecture
    split_lecture_pairs = [] 

    for subj_name, details in subjects_data.items():
        if details['type'] == 'LecLab':
            events_to_schedule.append({'id': f"{subj_name}_Lec", 'subject': subj_name, 'type': 'Lec', 'duration': details['lec_hr']})
            events_to_schedule.append({'id': f"{subj_name}_Lab", 'subject': subj_name, 'type': 'Lab', 'duration': details['lab_hr']})
        elif details['type'] == 'LecOnly':
            # Split 3hr lecture into 2hr + 1hr
            lec_a_id = f"{subj_name}_LecA"
            lec_b_id = f"{subj_name}_LecB"
            events_to_schedule.append({'id': lec_a_id, 'subject': subj_name, 'type': 'Lec', 'duration': 2})
            events_to_schedule.append({'id': lec_b_id, 'subject': subj_name, 'type': 'Lec', 'duration': 1})
            split_lecture_pairs.append((lec_a_id, lec_b_id))

    model = cp_model.CpModel()

    # --- Create Variables for Each Event ---
    for event in events_to_schedule:
        event['start_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK - event['duration'], f"{event['id']}_start")
        event['end_var'] = model.NewIntVar(0, TOTAL_SLOTS_PER_WEEK, f"{event['id']}_end")
        event['interval_var'] = model.NewIntervalVar(event['start_var'], event['duration'], event['end_var'], f"{event['id']}_interval")
        
        # Helper variable for day of the event
        event['day_var'] = model.NewIntVar(0, NUM_DAYS - 1, f"{event['id']}_day")
        model.AddDivisionEquality(event['day_var'], event['start_var'], SLOTS_PER_DAY)


    # --- Hard Constraints ---
    # Constraint: Lectures of the same subject must be on different days.
    # Labs are not affected by this rule and can be on the same day as lectures of the same subject,
    # or on a day with another subject's lecture.
    subject_lectures = {}
    for event in events_to_schedule:
        if event['type'] == 'Lec':
            # Group lecture events by their subject
            subject_lectures.setdefault(event['subject'], []).append(event)

    for subject_name, lectures_list in subject_lectures.items():
        # If a subject has more than one lecture event (e.g., due to splitting a long lecture)
        if len(lectures_list) > 1:
            # Iterate through all unique pairs of these lecture events for the current subject
            for i in range(len(lectures_list)):
                for j in range(i + 1, len(lectures_list)):
                    lecture_event_1 = lectures_list[i]
                    lecture_event_2 = lectures_list[j]
                    
                    # Enforce that these two lecture events are scheduled on different days
                    model.Add(lecture_event_1['day_var'] != lecture_event_2['day_var'])
    # 1. No Overlap: No two events can be scheduled at the same time.
    model.AddNoOverlap([event['interval_var'] for event in events_to_schedule])

    # 2. Labs in Evening Slots Only:
    for event in events_to_schedule:
        if event['type'] == 'Lab':
            allowed_starts_for_lab = []
            for day in range(NUM_DAYS):
                # Labs can start in evening slots such that they finish within evening slots
                for slot_in_day in range(EVENING_SLOTS_START_IDX, SLOTS_PER_DAY - event['duration'] + 1):
                    allowed_starts_for_lab.append(day * SLOTS_PER_DAY + slot_in_day)
            if not allowed_starts_for_lab: # Should not happen with 2hr labs and 4 evening slots
                print(f"Error: No valid evening start slots for {event['id']} with duration {event['duration']}")
                return None 
            model.AddAllowedAssignments([event['start_var']], [(s,) for s in allowed_starts_for_lab])

    # 3. Max 2hr Consecutive Lecture per Subject:
    #    For subjects with split lectures (e.g., S5_LecA (2hr), S5_LecB (1hr)),
    #    these parts cannot be scheduled back-to-back on the same day.
    event_map = {ev['id']: ev for ev in events_to_schedule}
    for id_a, id_b in split_lecture_pairs:
        event_a = event_map[id_a]
        event_b = event_map[id_b]

        # Constraint: If on the same day, event_a cannot immediately precede event_b
        # b_same_day_ab => (event_a_end != event_b_start)
        b_same_day_ab = model.NewBoolVar(f"{event_a['subject']}_same_day_ab")
        model.Add(event_a['day_var'] == event_b['day_var']).OnlyEnforceIf(b_same_day_ab)
        model.Add(event_a['day_var'] != event_b['day_var']).OnlyEnforceIf(b_same_day_ab.Not())

        b_consecutive_ab = model.NewBoolVar(f"{event_a['subject']}_consecutive_ab")
        model.Add(event_a['end_var'] == event_b['start_var']).OnlyEnforceIf(b_consecutive_ab)
        model.Add(event_a['end_var'] != event_b['start_var']).OnlyEnforceIf(b_consecutive_ab.Not())
        
        model.AddImplication(b_same_day_ab, b_consecutive_ab.Not())

        # Constraint: If on the same day, event_b cannot immediately precede event_a
        # b_same_day_ba => (event_b_end != event_a_start)
        # Note: b_same_day_ba is identical to b_same_day_ab, can reuse b_same_day_ab
        b_consecutive_ba = model.NewBoolVar(f"{event_a['subject']}_consecutive_ba")
        model.Add(event_b['end_var'] == event_a['start_var']).OnlyEnforceIf(b_consecutive_ba)
        model.Add(event_b['end_var'] != event_a['start_var']).OnlyEnforceIf(b_consecutive_ba.Not())

        model.AddImplication(b_same_day_ab, b_consecutive_ba.Not())


    # --- Soft Constraint: Try not to exceed 6 hours a day ---
    daily_penalties = []
    for day in range(NUM_DAYS):
        # BoolVar for each event: is_event_active_on_this_day[event_idx]
        is_event_active_on_this_day = []
        for event in events_to_schedule:
            b = model.NewBoolVar(f"{event['id']}_on_day_{day}")
            model.Add(event['day_var'] == day).OnlyEnforceIf(b)
            model.Add(event['day_var'] != day).OnlyEnforceIf(b.Not())
            is_event_active_on_this_day.append(b)

        # Sum of durations of events on this day
        hours_on_this_day = model.NewIntVar(0, SLOTS_PER_DAY, f"hours_on_day_{day}")
        model.Add(hours_on_this_day == sum(
            event['duration'] * is_event_active_on_this_day[i]
            for i, event in enumerate(events_to_schedule)
        ))
        
        # Penalty for exceeding MAX_DAILY_HOURS_SOFT
        penalty = model.NewIntVar(0, SLOTS_PER_DAY - MAX_DAILY_HOURS_SOFT, f"penalty_day_{day}")
        model.Add(hours_on_this_day - MAX_DAILY_HOURS_SOFT <= penalty)
        # model.Add(penalty >= 0) # Implicit by domain
        daily_penalties.append(penalty)

    model.Minimize(sum(daily_penalties))

    # --- Solve ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 100.0 # Optional: time limit
    status = solver.Solve(model)

    # --- Output Results ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print(f"Solution found. Total penalty: {solver.ObjectiveValue()}")
        
        scheduled_slots = [[] for _ in range(TOTAL_SLOTS_PER_WEEK)]
        for event in events_to_schedule:
            start_time = solver.Value(event['start_var'])
            for i in range(event['duration']):
                scheduled_slots[start_time + i].append(event['id'])
        
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        slot_times_desc = [
            "M1 (9-10)", "M2 (10-11)", "M3 (11-12)", "M4 (12-1)",
            "E1 (2-3)", "E2 (3-4)", "E3 (4-5)", "E4 (5-6)" # Example timings
        ]

        print("\nTimetable:")
        for day_idx in range(NUM_DAYS):
            print(f"\n--- {day_names[day_idx]} ---")
            daily_load = 0
            for slot_idx_in_day in range(SLOTS_PER_DAY):
                global_slot_idx = day_idx * SLOTS_PER_DAY + slot_idx_in_day
                slot_content = ", ".join(scheduled_slots[global_slot_idx]) if scheduled_slots[global_slot_idx] else "---FREE---"
                print(f"  {slot_times_desc[slot_idx_in_day]}: {slot_content}")
                if scheduled_slots[global_slot_idx]:
                    daily_load +=1
            print(f"  Total hours on {day_names[day_idx]}: {daily_load}")


        # print("\nScheduled Events List:")
        # for event in events_to_schedule:
        #     start_val = solver.Value(event['start_var'])
        #     day = start_val // SLOTS_PER_DAY
        #     slot_in_day = start_val % SLOTS_PER_DAY
        #     end_val = solver.Value(event['end_var'])
            
        #     start_time_desc = f"{day_names[day]} {slot_times_desc[slot_in_day]}"
        #     # For end time, consider it's exclusive, so (end_val - 1) is the last occupied slot
        #     end_slot_global = end_val -1
        #     end_day = end_slot_global // SLOTS_PER_DAY
        #     end_slot_in_day = end_slot_global % SLOTS_PER_DAY
        #     end_time_desc = f"{day_names[end_day]} {slot_times_desc[end_slot_in_day].split(' ')[1]}" # just the time part

        #     print(f"  {event['id']} ({event['subject']}, {event['type']}, {event['duration']}hr): Starts {start_time_desc}, Ends after {slot_times_desc[end_slot_in_day]}")
        return True
            
    elif status == cp_model.INFEASIBLE:
        print("No solution found: Infeasible model.")
    else:
        print(f"No solution found. Status: {solver.StatusName(status)}")
    return False

if __name__ == '__main__':
    solve_timetable()