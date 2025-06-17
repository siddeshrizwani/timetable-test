const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

// --- DASHBOARD API ---
router.get("/stats", async (req, res) => {
  try {
    const queries = [
      pool.query("SELECT COUNT(*) FROM batches"),
      pool.query("SELECT COUNT(*) FROM subjects"),
      pool.query("SELECT COUNT(*) FROM teachers"),
      pool.query("SELECT COUNT(*) FROM rooms"),
    ];
    const results = await Promise.all(queries);
    res.json({
      batches: parseInt(results[0].rows[0].count, 10),
      subjects: parseInt(results[1].rows[0].count, 10),
      teachers: parseInt(results[2].rows[0].count, 10),
      rooms: parseInt(results[3].rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ msg: "Server error fetching stats" });
  }
});

// --- BATCHES API ---
router.get("/batches", async (req, res) => {
  try {
    const query = `
      SELECT b.*, COUNT(bs.subject_id)::int AS subject_count
      FROM batches b
      LEFT JOIN batch_subjects bs ON b.batch_id = bs.batch_id
      GROUP BY b.batch_id ORDER BY b.name ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.get("/batches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const batchResult = await pool.query(
      "SELECT * FROM batches WHERE batch_id = $1",
      [id]
    );
    if (batchResult.rows.length === 0)
      return res.status(404).json({ msg: "Batch not found" });
    const subjectsResult = await pool.query(
      `SELECT s.* FROM subjects s JOIN batch_subjects bs ON s.subject_id = bs.subject_id WHERE bs.batch_id = $1 ORDER BY s.name ASC`,
      [id]
    );
    res.json({ ...batchResult.rows[0], subjects: subjectsResult.rows });
  } catch (err) {
    console.error(`Error fetching batch ${id}:`, err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/batches", async (req, res) => {
  const { name, academic_year, semester_number, department, subject_ids } =
    req.body;
  if (
    !name ||
    !academic_year ||
    !semester_number ||
    !department ||
    !subject_ids
  ) {
    return res.status(400).json({ msg: "All fields are required." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const batchRes = await client.query(
      "INSERT INTO batches (name, academic_year, semester_number, department) VALUES ($1, $2, $3, $4) RETURNING batch_id",
      [name, academic_year, semester_number, department]
    );
    const batchId = batchRes.rows[0].batch_id;
    
    // Create subject associations
    if (subject_ids.length > 0) {
      const subjectQueries = subject_ids.map((sid) =>
        client.query(
          "INSERT INTO batch_subjects (batch_id, subject_id) VALUES ($1, $2)",
          [batchId, sid]
        )
      );
      await Promise.all(subjectQueries);
    }

    // AUTO-CREATE BATCH TIMESLOTS - Standard university schedule
    console.log(`Creating default timeslots for batch ${batchId}`);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '09:00', end: '10:00', slot: 1 },
      { start: '10:00', end: '11:00', slot: 2 },
      { start: '11:15', end: '12:15', slot: 3 },
      { start: '12:15', end: '13:15', slot: 4 },
      { start: '14:00', end: '15:00', slot: 5 },
      { start: '15:00', end: '16:00', slot: 6 },
      { start: '16:15', end: '17:15', slot: 7 },
      { start: '17:15', end: '18:15', slot: 8 }
    ];

    // Insert batch timeslots for all days and time slots
    for (const day of days) {
      for (const slot of timeSlots) {
        await client.query(
          "INSERT INTO batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index) VALUES ($1, $2, $3, $4, $5)",
          [batchId, day, slot.start, slot.end, slot.slot]
        );
      }
    }
    console.log(`Created ${days.length * timeSlots.length} timeslots for batch ${batchId}`);

    await client.query("COMMIT");
    res
      .status(201)
      .json({ 
        msg: "Batch created successfully with default timeslots", 
        batch_id: batchId,
        timeslots_created: days.length * timeSlots.length
      });
  } catch (err) {
    console.error(`Error in POST /api/batches for batch '${req.body.name || 'unknown'}':`, err); // Log the full error object and batch name
    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back due to error.");
    } catch (rollbackErr) {
      console.error("Error attempting to rollback transaction:", rollbackErr);
    }

    if (err.code === "23505") { // Unique constraint violation
      return res
        .status(409)
        .json({
          msg: "A batch with this name already exists or another unique constraint was violated.",
          error: err.detail || err.message, // Provide more specific error detail if available
          code: err.code
        });
    }
    // For other errors, send a 500 status
    res.status(500).json({
      msg: "Server error occurred while creating batch. Please check server logs for more details.",
      error: err.message, // Include the error message in the response for easier debugging
      code: err.code // Include error code if available
    });
  } finally {
    if (client) { // Check if client was successfully initialized
      client.release();
      console.log("Database client released from POST /api/batches.");
    }
  }
});

router.put("/batches/:id", async (req, res) => {
  const { id } = req.params;
  const { name, academic_year, semester_number, department, subject_ids } =
    req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE batches SET name = $1, academic_year = $2, semester_number = $3, department = $4 WHERE batch_id = $5",
      [name, academic_year, semester_number, department, id]
    );
    await client.query("DELETE FROM batch_subjects WHERE batch_id = $1", [id]);
    if (subject_ids.length > 0) {
      const subjectPromises = subject_ids.map((subject_id) =>
        client.query(
          "INSERT INTO batch_subjects (batch_id, subject_id) VALUES ($1, $2)",
          [id, subject_id]
        )
      );
      await Promise.all(subjectPromises);
    }
    await client.query("COMMIT");
    res.status(200).json({ msg: "Batch updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") { // Check for unique violation on batch name (e.g., duplicate batch name)
      return res
        .status(409)
        .json({ msg: "A batch with this name already exists." });
    }
    // Add detailed error logging for other errors
    console.error('Error in POST /api/batches:', err); 
    res.status(500).json({ msg: "Server error. Check server logs for details." });
  } finally {
    client.release();
  }
});

router.delete("/batches/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Check if batch exists and get info for response
    const batchCheck = await client.query("SELECT batch_id, name FROM batches WHERE batch_id = $1", [id]);
    if (batchCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ msg: "Batch not found." });
    }
    
    const batchName = batchCheck.rows[0].name;
    console.log(`Starting deletion of batch: ${batchName} (${id})`);
    
    // Get counts before deletion for response
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM class_sessions WHERE batch_id = $1) as sessions,
        (SELECT COUNT(*) FROM batch_timeslots WHERE batch_id = $1) as timeslots,
        (SELECT COUNT(*) FROM teacher_allocations WHERE batch_id = $1) as allocations,
        (SELECT COUNT(*) FROM timetable_generations WHERE batch_id = $1) as generations,
        (SELECT COUNT(*) FROM batch_subjects WHERE batch_id = $1) as subjects
    `, [id]);
    
    const beforeCounts = counts.rows[0];
    
    // Delete the batch - CASCADE will automatically delete related data
    const batchResult = await client.query("DELETE FROM batches WHERE batch_id = $1", [id]);
    console.log(`Deleted batch: ${batchName} with CASCADE delete`);
    
    await client.query("COMMIT");
    
    // Clean up any generated files
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Delete output files
      const outputFile = path.join(__dirname, '..', 'engine', 'outputs', `${id}_output.json`);
      const frontendFile = path.join(__dirname, '..', '..', 'frontend', 'public', `timetable_${id}.json`);
      
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
        console.log(`Deleted output file: ${outputFile}`);
      }
      
      if (fs.existsSync(frontendFile)) {
        fs.unlinkSync(frontendFile);
        console.log(`Deleted frontend file: ${frontendFile}`);
      }
    } catch (fileErr) {
      console.warn("Could not delete some files:", fileErr.message);
    }
    
    res.status(200).json({ 
      msg: "Batch and all associated data deleted successfully.",
      details: {
        batch_name: batchName,
        deleted_counts: {
          class_sessions: parseInt(beforeCounts.sessions),
          batch_timeslots: parseInt(beforeCounts.timeslots),
          teacher_allocations: parseInt(beforeCounts.allocations),
          timetable_generations: parseInt(beforeCounts.generations),
          batch_subjects: parseInt(beforeCounts.subjects)
        }
      }
    });
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting batch:", err);
    res.status(500).json({ 
      msg: "Server error", 
      error: err.message,
      detail: "Failed to delete batch and associated data" 
    });
  } finally {
    client.release();
  }
});

// --- SUBJECTS API ---
router.get("/subjects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/subjects", async (req, res) => {
  const { name, code, lecture_credits, lab_credits } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO subjects (name, code, lecture_credits, lab_credits) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, code, lecture_credits, lab_credits]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A subject with this code already exists." });
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/subjects/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subjects WHERE subject_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.put("/subjects/:id", async (req, res) => {
  const { name, code, lecture_credits, lab_credits } = req.body;
  try {
    const result = await pool.query(
      "UPDATE subjects SET name = $1, code = $2, lecture_credits = $3, lab_credits = $4 WHERE subject_id = $5 RETURNING *",
      [name, code, lecture_credits, lab_credits, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usageCheck = await pool.query(
      "SELECT 1 FROM class_sessions WHERE subject_id = $1 LIMIT 1",
      [id]
    );
    if (usageCheck.rowCount > 0) {
      return res
        .status(409)
        .json({
          msg: "Cannot delete subject. It is part of one or more scheduled classes.",
        });
    }
    const result = await pool.query(
      "DELETE FROM subjects WHERE subject_id = $1",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.status(200).json({ msg: "Subject deleted successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// --- TEACHERS API ---
router.get("/teachers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teachers ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/teachers", async (req, res) => {
  const { name, email, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      "INSERT INTO users (username, email, password_hash, role_id, provider, requires_password_change) VALUES ($1, $2, $3, 3, 'local', TRUE) RETURNING id",
      [name, email, hashedPassword]
    );
    const teacherRes = await client.query(
      "INSERT INTO teachers (name, email, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, email, userRes.rows[0].id]
    );
    await client.query("COMMIT");
    res.status(201).json(teacherRes.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505")
      return res.status(409).json({ msg: "This email is already registered." });
    res.status(500).json({ msg: "Server error" });
  } finally {
    client.release();
  }
});

router.get("/teachers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM teachers WHERE teacher_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Teacher not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.put("/teachers/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
    const teacherRes = await pool.query(
      "UPDATE teachers SET name = $1, email = $2 WHERE teacher_id = $3 RETURNING *",
      [name, email, req.params.id]
    );
    if (teacherRes.rowCount === 0)
      return res.status(404).json({ msg: "Teacher not found." });
    await pool.query(
      "UPDATE users SET email = $1, username = $2 WHERE id = (SELECT user_id FROM teachers WHERE teacher_id = $3)",
      [email, name, req.params.id]
    );
    res.json(teacherRes.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ msg: "This email is already in use." });
    res.status(500).json({ msg: "Server Error" });
  }
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    const usageCheck = await pool.query(
      "SELECT 1 FROM class_sessions WHERE teacher_id = $1 LIMIT 1",
      [req.params.id]
    );
    if (usageCheck.rowCount > 0) {
      return res
        .status(409)
        .json({
          msg: "Cannot delete teacher. They are assigned to one or more scheduled classes.",
        });
    }
    const result = await pool.query(
      "DELETE FROM teachers WHERE teacher_id = $1",
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Teacher not found." });
    res.status(200).json({ msg: "Teacher deleted successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/teachers/:id/reset-password", async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ msg: "New password is required." });
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      "UPDATE users SET password_hash = $1, requires_password_change = TRUE WHERE id = (SELECT user_id FROM teachers WHERE teacher_id = $2)",
      [hashedPassword, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Teacher not found." });
    res.status(200).json({ msg: "Password has been reset successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// --- ROOMS API ---
router.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY room_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/rooms", async (req, res) => {
  const { room_name, capacity, is_lab } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO rooms (room_name, capacity, is_lab) VALUES ($1, $2, $3) RETURNING *",
      [room_name, capacity, is_lab]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A room with this name already exists." });
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/rooms/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rooms WHERE room_id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Room not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.put("/rooms/:id", async (req, res) => {
  const { room_name, capacity, is_lab } = req.body;
  try {
    const result = await pool.query(
      "UPDATE rooms SET room_name = $1, capacity = $2, is_lab = $3 WHERE room_id = $4 RETURNING *",
      [room_name, capacity, is_lab, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Room not found." });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A room with this name already exists." });
    res.status(500).json({ msg: "Server Error" });
  }
});

router.delete("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usageCheck = await pool.query(
      "SELECT 1 FROM class_sessions WHERE room_id = $1 LIMIT 1",
      [id]
    );
    if (usageCheck.rowCount > 0) {
      return res
        .status(409)
        .json({
          msg: "Cannot delete room. It is currently scheduled for one or more classes.",
        });
    }
    const result = await pool.query("DELETE FROM rooms WHERE room_id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Room not found." });
    res.status(200).json({ msg: "Room deleted successfully." });
  } catch (err) {
    console.error(`Error deleting room ${id}:`, err);
    res.status(500).json({ msg: "Internal server error." });
  }
});


// --- STUDENTS API (Full CRUD) ---
router.get("/students", async (req, res) => {
  try {
      const result = await pool.query("SELECT * FROM students ORDER BY roll_number ASC");
      res.json(result.rows);
  } catch (err) { res.status(500).json({ msg: "Server error fetching students" }); }
});

router.post("/students", async (req, res) => {
  const { name, email, roll_number } = req.body;
  if (!name || !email || !roll_number) return res.status(400).json({ msg: "Name, email, and roll number are required." });
  try {
      const result = await pool.query("INSERT INTO students (name, email, roll_number) VALUES ($1, $2, $3) RETURNING *", [name, email, roll_number]);
      res.status(201).json(result.rows[0]);
  } catch (err) {
      if (err.code === '23505') return res.status(409).json({ msg: "A student with this email or roll number already exists." });
      res.status(500).json({ msg: "Server error creating student." });
  }
});

router.put("/students/:id", async (req, res) => {
  const { name, email, roll_number } = req.body;
  if (!name || !email || !roll_number) return res.status(400).json({ msg: "Name, email, and roll number are required." });
  try {
      const result = await pool.query("UPDATE students SET name = $1, email = $2, roll_number = $3 WHERE student_id = $4 RETURNING *", [name, email, roll_number, req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ msg: "Student not found." });
      res.json(result.rows[0]);
  } catch (err) {
      if (err.code === '23505') return res.status(409).json({ msg: "A student with this email or roll number already exists." });
      res.status(500).json({ msg: "Server error updating student." });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
      const result = await pool.query("DELETE FROM students WHERE student_id = $1", [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ msg: "Student not found." });
      res.status(200).json({ msg: "Student deleted successfully." });
  } catch (err) { res.status(500).json({ msg: "Server error deleting student." }); }
});


// --- CLASS SESSIONS API (Full CRUD) ---
router.get("/class-sessions", async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT cs.session_id, s.name as subject_name, b.name as batch_name, t.name as teacher_name, r.room_name, ts.day_of_week, ts.start_time, ts.end_time
          FROM class_sessions cs
          LEFT JOIN subjects s ON cs.subject_id = s.subject_id
          LEFT JOIN batches b ON cs.batch_id = b.batch_id
          LEFT JOIN teachers t ON cs.teacher_id = t.teacher_id
          LEFT JOIN rooms r ON cs.room_id = r.room_id
          LEFT JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
      `);
      res.json(result.rows);
  } catch (err) { res.status(500).json({ msg: "Server error" }); }
});

router.post("/class-sessions", async (req, res) => {
  const { subject_id, batch_id, teacher_id, timeslot_id, room_id } = req.body;
  try {
      const conflictCheck = await pool.query("SELECT * FROM class_sessions WHERE timeslot_id = $1 AND (teacher_id = $2 OR room_id = $3 OR batch_id = $4)", [timeslot_id, teacher_id, room_id, batch_id]);
      if (conflictCheck.rowCount > 0) {
          return res.status(409).json({ msg: "Conflict: The teacher, room, or batch is already scheduled." });
      }
      const result = await pool.query("INSERT INTO class_sessions (subject_id, batch_id, teacher_id, timeslot_id, room_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [subject_id, batch_id, teacher_id, timeslot_id, room_id]);
      res.status(201).json(result.rows[0]);
  } catch(err) { res.status(500).json({ msg: "Server Error" }); }
});

router.delete("/class-sessions/:id", async (req, res) => {
  try {
      const result = await pool.query("DELETE FROM class_sessions WHERE session_id = $1", [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ msg: "Class session not found." });
      res.status(200).json({ msg: "Class session unscheduled successfully." });
  } catch (err) { res.status(500).json({ msg: "Server error." }); }
});

// --- TIMETABLE VIEWER API (NEW) ---
router.get("/timetable/:batchId", async (req, res) => {
  const { batchId } = req.params;
  try {
      // First try to get from generated output files
      const fs = require('fs');
      const path = require('path');
      const outputFilePath = path.join(__dirname, '..', 'engine', 'outputs', `${batchId}_output.json`);
      if (fs.existsSync(outputFilePath)) {
        const outputData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
        return res.json(outputData);
      }
        // Fallback to database query (legacy support)
      const query = `
          SELECT 
              cs.session_id,
              cs.session_type,
              s.subject_id,
              s.name AS subject_name,
              s.code AS subject_code,
              t.teacher_id,
              t.name AS teacher_name,
              r.room_id,
              r.room_name,
              bt.day_of_week,
              bt.start_time,
              bt.end_time,
              bt.slot_index,
              bt.slot_name
          FROM class_sessions cs
          LEFT JOIN subjects s ON cs.subject_id = s.subject_id
          LEFT JOIN teachers t ON cs.teacher_id = t.teacher_id
          LEFT JOIN rooms r ON cs.room_id = r.room_id
          LEFT JOIN batch_timeslots bt ON cs.batch_timeslot_id = bt.timeslot_id
          WHERE cs.batch_id = $1
          ORDER BY bt.day_of_week, bt.slot_index;
      `;
      const result = await pool.query(query, [batchId]);
      
      // Convert database format to match solver output format
      const timetableEntries = result.rows.map(row => ({
        event_id: `${row.subject_code}_${row.session_id}`,
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        subject_code: row.subject_code,
        type: row.session_type === 'lab' ? 'Lab' : 'Lec',
        teacher_id: row.teacher_id,
        teacher_name: row.teacher_name,
        room_id: row.room_id,
        room_name: row.room_name,
        duration_slots: 1, // Default for now
        day_of_week: row.day_of_week,
        slot_index: parseInt(row.slot_index) || 0,
        start_slot_in_day: parseInt(row.slot_index) || 0,
        end_slot_in_day: parseInt(row.slot_index) || 0
      }));
      
      res.json({
        status: "DATABASE",
        solution: {
          timetable: timetableEntries
        },
        batch_info: {
          batch_id: batchId,
          name: `Batch ${batchId}`
        }
      });
  } catch (err) {
      console.error(`Error fetching timetable for batch ${batchId}:`, err);
      res.status(500).json({ msg: "Internal server error" });
  }
});


// --- TIMETABLE ENGINE API ---
router.post("/generate-timetable", async (req, res) => {
  const { batch_id } = req.body;
  const batchId = batch_id; // Use batch_id from payload
  
  if (!batchId) {
    return res.status(400).json({ msg: "Batch ID is required" });
  }

  let client;
  let responseHandled = false;
  let clientReleased = false;

  // Helper function to safely release client
  const safeReleaseClient = (reason) => {
    if (!clientReleased && client) {
      try {
        client.release();
        clientReleased = true;
        console.log(`[${batchId}] Database client released: ${reason}`);
      } catch (releaseError) {
        console.error(`[${batchId}] Error releasing client (${reason}):`, releaseError);
      }
    }
  };

  try {
    // Get database client
    client = await pool.connect();
    console.log(`[${batchId}] Database client connected for timetable generation`);

    // Fetch batch information
    const batchResult = await client.query(
      "SELECT * FROM batches WHERE batch_id = $1",
      [batchId]
    );

    if (batchResult.rows.length === 0) {
      safeReleaseClient("batch not found");
      responseHandled = true;
      return res.status(404).json({ msg: "Batch not found" });
    }

    const batch = batchResult.rows[0];
    console.log(`[${batchId}] Found batch: ${batch.name}`);

    // Fetch subjects for the batch
    const subjectsResult = await client.query(`
      SELECT s.* FROM subjects s 
      JOIN batch_subjects bs ON s.subject_id = bs.subject_id 
      WHERE bs.batch_id = $1
    `, [batchId]);

    // Fetch all teachers
    const teachersResult = await client.query("SELECT * FROM teachers");

    // Fetch all rooms
    const roomsResult = await client.query("SELECT * FROM rooms");

    // Create teacher allocations (1:1 mapping for now)
    const teacherAllocations = subjectsResult.rows.map((subject, index) => ({
      subject_id: subject.subject_id,
      teacher_id: teachersResult.rows[index % teachersResult.rows.length]?.teacher_id,
      batch_id: batchId
    }));

    console.log(`[${batchId}] Created ${teacherAllocations.length} teacher allocations for batch ${batchId}`);    // Fetch batch timeslots (specific to this batch)
    const batchTimeslotsResult = await client.query(`
      SELECT * FROM batch_timeslots 
      WHERE batch_id = $1 
      ORDER BY day_of_week, slot_index
    `, [batchId]);

    if (batchTimeslotsResult.rows.length === 0) {
      safeReleaseClient("no batch timeslots found");
      responseHandled = true;
      return res.status(400).json({ 
        msg: "No timeslots found for this batch. Please create batch timeslots first." 
      });
    }

    console.log(`[${batchId}] Found ${batchTimeslotsResult.rows.length} batch-specific timeslots`);

    // Fetch existing sessions (from this batch only - for conflicts within batch)
    let existingSessionsResult;
    try {
      existingSessionsResult = await client.query(`
        SELECT cs.*, bt.day_of_week, bt.slot_index, bt.start_time, bt.end_time
        FROM class_sessions cs
        JOIN batch_timeslots bt ON cs.batch_timeslot_id = bt.timeslot_id
        WHERE cs.batch_id = $1
      `, [batchId]);
      console.log(`[${batchId}] Found ${existingSessionsResult.rows.length} existing sessions for this batch`);
    } catch (timeslotError) {
      console.warn(`[${batchId}] Could not fetch existing sessions with batch timeslots, using empty:`, timeslotError.message);
      existingSessionsResult = { rows: [] };
    }

    // Prepare input data for Python solver
    const inputData = {
      config: {
        num_days: 5,
        slots_per_day: 8,
        morning_slots_count: 4,
        evening_slots_start_idx: 4,
        max_daily_hours_soft: 6,
        max_consecutive_lecture_hours: 2,
        solver_max_time_seconds: 30,
        log_search_progress: true
      },
      batch_to_schedule: {
        batch_id: batch.batch_id,
        name: batch.name
      },
      blocked_slots: [],
      existing_sessions: existingSessionsResult.rows.map(session => ({
        teacher_id: session.teacher_id,
        room_id: session.room_id,
        day_index: session.day_of_week === 'Monday' ? 0 : 
                   session.day_of_week === 'Tuesday' ? 1 :
                   session.day_of_week === 'Wednesday' ? 2 :
                   session.day_of_week === 'Thursday' ? 3 :
                   session.day_of_week === 'Friday' ? 4 : 0,
        start_slot_in_day: session.slot_index || 0,
        duration_slots: 1 // Default duration
      })),
      subjects: subjectsResult.rows.map(subject => ({
        subject_id: subject.subject_id,
        name: subject.name,
        code: subject.code,
        lecture_credits: subject.lecture_credits || 0,
        lab_credits: subject.lab_credits || 0
      })),
      teachers: teachersResult.rows.map(teacher => ({
        teacher_id: teacher.teacher_id,
        name: teacher.name
      })),      teacher_allocations: teacherAllocations,
      rooms: roomsResult.rows.map(room => ({
        room_id: room.room_id,
        room_name: room.room_name,
        capacity: room.capacity,
        is_lab: room.is_lab || false
      })),
      timeslots: batchTimeslotsResult.rows.map(timeslot => ({
        timeslot_id: timeslot.timeslot_id,
        batch_id: timeslot.batch_id,
        day_of_week: timeslot.day_of_week,
        start_time: timeslot.start_time,
        end_time: timeslot.end_time,
        slot_index: timeslot.slot_index,
        slot_name: timeslot.slot_name
      }))
    };

    // Create input file
    const fs = require('fs');
    const path = require('path');
    const inputFilePath = path.join(__dirname, '..', 'engine', `input_${batchId}.json`);
    
    const engineDir = path.join(__dirname, '..', 'engine');
    if (!fs.existsSync(engineDir)) {
      fs.mkdirSync(engineDir, { recursive: true });
    }

    await fs.promises.writeFile(inputFilePath, JSON.stringify(inputData, null, 2));
    console.log(`[${batchId}] Input file created: ${inputFilePath}`);

    // Execute Python solver
    const pythonScriptPath = path.join(__dirname, '..', 'engine', 'solve_.py');
    console.log(`[${batchId}] Starting Python solver: ${pythonScriptPath} with input ${inputFilePath}`);

    const pythonProcess = spawn('python', [pythonScriptPath, inputFilePath]);
    console.log(`[${batchId}] Python process spawned with PID: ${pythonProcess.pid}. Timeout set for 30s.`);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (responseHandled) return;

      console.log(`[${batchId}] Python process PID ${pythonProcess.pid} exited with code ${code}.`);
      
      // Clean up input file
      try {
        if (fs.existsSync(inputFilePath)) {
          await fs.promises.unlink(inputFilePath);
          console.log(`[${batchId}] Successfully deleted input file: ${inputFilePath}`);
        }
      } catch (err) {
        console.error(`[${batchId}] Error deleting input file:`, err);
      }

      if (code !== 0) {
        console.error(`[${batchId}] Python script execution failed. Exit code: ${code}.`);
        console.error(`[${batchId}] Python stderr:`, pythonError);
        safeReleaseClient("Python script failure");
        responseHandled = true;
        return res.status(500).json({
          message: "Timetable generation script failed.",
          error: pythonError || `Python script exited with code ${code}.`,
          batchId: batchId,
        });
      }

      // Process the output
      const outputFilePath = path.join(__dirname, '..', 'engine', 'outputs', `${batchId}_output.json`);
      const frontendOutputPath = path.join(__dirname, '..', '..', 'frontend', 'public', `timetable_${batchId}.json`);

      try {
        if (!fs.existsSync(outputFilePath)) {
          console.error(`[${batchId}] Output file not found: ${outputFilePath}`);
          safeReleaseClient("output file not found");
          responseHandled = true;
          return res.status(500).json({
            message: "Timetable generation succeeded, but output file was not created.",
            batchId: batchId,
          });
        }

        const resultData = JSON.parse(await fs.promises.readFile(outputFilePath, 'utf8'));
        console.log(`[${batchId}] Successfully read output file: ${outputFilePath}`);

        // Copy to frontend
        const frontendDir = path.dirname(frontendOutputPath);
        if (!fs.existsSync(frontendDir)) {
          fs.mkdirSync(frontendDir, { recursive: true });
        }
        await fs.promises.copyFile(outputFilePath, frontendOutputPath);
        console.log(`[${batchId}] Copied output to frontend: ${frontendOutputPath}`);

        // Store in database
        if (resultData.solution && resultData.solution.timetable && Array.isArray(resultData.solution.timetable)) {
          try {
            await client.query("BEGIN");

            // Clear old sessions for this batch
            await client.query("DELETE FROM class_sessions WHERE batch_id = $1", [batchId]);
            console.log(`[${batchId}] Cleared old class sessions from DB`);

            // Insert new sessions
            for (const session of resultData.solution.timetable) {
              if (!session.subject_id || !session.teacher_id || !session.room_id) {
                console.warn(`[${batchId}] Skipping session due to missing data:`, session);
                continue;
              }              // Find batch-specific timeslot
              let batchTimeslotId;
              const dayOfWeek = session.day_of_week || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][session.day_index] || "Monday";
              const slotIndex = session.slot_index || session.start_slot_in_day || 0;
              
              // Find the batch-specific timeslot
              const batchTimeslotResult = await client.query(`
                SELECT timeslot_id FROM batch_timeslots 
                WHERE batch_id = $1 AND day_of_week = $2 AND slot_index = $3
              `, [batchId, dayOfWeek, slotIndex]);

              if (batchTimeslotResult.rows.length > 0) {
                batchTimeslotId = batchTimeslotResult.rows[0].timeslot_id;
              } else {
                console.warn(`[${batchId}] No batch timeslot found for ${dayOfWeek} slot ${slotIndex}, skipping session`);
                continue; // Skip this session if batch timeslot doesn't exist
              }

              // Insert class session with batch_timeslot_id
              await client.query(`
                INSERT INTO class_sessions (subject_id, batch_id, teacher_id, batch_timeslot_id, room_id, session_type)
                VALUES ($1, $2, $3, $4, $5, $6)
              `, [session.subject_id, batchId, session.teacher_id, batchTimeslotId, session.room_id, session.type === 'Lab' ? 'lab' : 'lecture']);
            }

            await client.query("COMMIT");
            console.log(`[${batchId}] Successfully stored timetable in database`);

          } catch (dbError) {
            console.error(`[${batchId}] Database error:`, dbError);
            try {
              await client.query("ROLLBACK");
            } catch (rollbackError) {
              console.error(`[${batchId}] Rollback error:`, rollbackError);
            }
          }
        }

        // Send successful response
        safeReleaseClient("successful completion");
        responseHandled = true;
        return res.status(200).json({
          message: "Timetable generated and saved successfully.",
          batchId: batchId,
          outputFile: `/timetable_${batchId}.json`,
          data: resultData,
        });

      } catch (fileError) {
        console.error(`[${batchId}] File processing error:`, fileError);
        safeReleaseClient("file processing error");
        responseHandled = true;
        return res.status(500).json({
          message: "Failed to process timetable output.",
          error: fileError.message,
          batchId: batchId,
        });
      }
    });

    // Set timeout for Python process
    setTimeout(() => {
      if (!responseHandled) {
        pythonProcess.kill('SIGTERM');
        safeReleaseClient("timeout");
        responseHandled = true;
        res.status(500).json({
          message: "Timetable generation timed out.",
          batchId: batchId,
        });
      }
    }, 35000); // 35 seconds timeout

  } catch (err) {
    console.error(`[${batchId}] Overall error:`, err);
    if (!responseHandled) {
      safeReleaseClient("general error");
      responseHandled = true;
      res.status(500).json({ 
        msg: "Internal server error during timetable generation: " + err.message, 
        batchId: batchId 
      });
    }
  } finally {
    safeReleaseClient("finally block");
  }
});

// POST endpoint to create/recreate timeslots for an existing batch
router.post("/batches/:id/timeslots", async (req, res) => {
  const { id } = req.params;
  const { days, timeSlots } = req.body;
  
  // Default schedule if not provided
  const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const defaultTimeSlots = [
    { start: '09:00', end: '10:00', slot: 1 },
    { start: '10:00', end: '11:00', slot: 2 },
    { start: '11:15', end: '12:15', slot: 3 },
    { start: '12:15', end: '13:15', slot: 4 },
    { start: '14:00', end: '15:00', slot: 5 },
    { start: '15:00', end: '16:00', slot: 6 },
    { start: '16:15', end: '17:15', slot: 7 },
    { start: '17:15', end: '18:15', slot: 8 }
  ];

  const useDays = days || defaultDays;
  const useTimeSlots = timeSlots || defaultTimeSlots;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Check if batch exists
    const batchCheck = await client.query("SELECT batch_id FROM batches WHERE batch_id = $1", [id]);
    if (batchCheck.rows.length === 0) {
      return res.status(404).json({ msg: "Batch not found" });
    }

    // Delete existing timeslots for this batch
    await client.query("DELETE FROM batch_timeslots WHERE batch_id = $1", [id]);
    console.log(`Cleared existing timeslots for batch ${id}`);

    // Insert new batch timeslots
    let timeslotsCreated = 0;
    for (const day of useDays) {
      for (const slot of useTimeSlots) {
        await client.query(
          "INSERT INTO batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index) VALUES ($1, $2, $3, $4, $5)",
          [id, day, slot.start, slot.end, slot.slot]
        );
        timeslotsCreated++;
      }
    }
    
    await client.query("COMMIT");
    console.log(`Created ${timeslotsCreated} timeslots for batch ${id}`);
    
    res.status(201).json({ 
      msg: "Timeslots created successfully", 
      batch_id: id,
      timeslots_created: timeslotsCreated
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Error creating timeslots for batch ${id}:`, err);
    res.status(500).json({ msg: "Server error creating timeslots" });
  } finally {
    client.release();
  }
});

// GET endpoint to check timeslots for a batch
router.get("/batches/:id/timeslots", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM batch_timeslots WHERE batch_id = $1 ORDER BY day_of_week, slot_index",
      [id]
    );
    res.json({
      batch_id: id,
      timeslots_count: result.rows.length,
      timeslots: result.rows
    });
  } catch (err) {
    console.error(`Error fetching timeslots for batch ${id}:`, err);
    res.status(500).json({ msg: "Server error fetching timeslots" });
  }
});

// POST endpoint to create timeslots for ALL batches that don't have them
router.post("/batches/ensure-timeslots", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Find batches without timeslots
    const batchesWithoutTimeslots = await client.query(`
      SELECT b.batch_id, b.name 
      FROM batches b 
      LEFT JOIN batch_timeslots bt ON b.batch_id = bt.batch_id 
      WHERE bt.batch_id IS NULL
    `);
    
    if (batchesWithoutTimeslots.rows.length === 0) {
      return res.json({ msg: "All batches already have timeslots", batches_processed: 0 });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '09:00', end: '10:00', slot: 1 },
      { start: '10:00', end: '11:00', slot: 2 },
      { start: '11:15', end: '12:15', slot: 3 },
      { start: '12:15', end: '13:15', slot: 4 },
      { start: '14:00', end: '15:00', slot: 5 },
      { start: '15:00', end: '16:00', slot: 6 },
      { start: '16:15', end: '17:15', slot: 7 },
      { start: '17:15', end: '18:15', slot: 8 }
    ];

    let totalTimeslotsCreated = 0;
    const processedBatches = [];

    // Create timeslots for each batch
    for (const batch of batchesWithoutTimeslots.rows) {
      let batchTimeslots = 0;
      for (const day of days) {
        for (const slot of timeSlots) {
          await client.query(
            "INSERT INTO batch_timeslots (batch_id, day_of_week, start_time, end_time, slot_index) VALUES ($1, $2, $3, $4, $5)",
            [batch.batch_id, day, slot.start, slot.end, slot.slot]
          );
          batchTimeslots++;
          totalTimeslotsCreated++;
        }
      }
      processedBatches.push({
        batch_id: batch.batch_id,
        name: batch.name,
        timeslots_created: batchTimeslots
      });
      console.log(`Created ${batchTimeslots} timeslots for batch ${batch.name} (${batch.batch_id})`);
    }
    
    await client.query("COMMIT");
    
    res.status(201).json({ 
      msg: "Timeslots created for all batches without them", 
      batches_processed: batchesWithoutTimeslots.rows.length,
      total_timeslots_created: totalTimeslotsCreated,
      processed_batches: processedBatches
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error ensuring timeslots for batches:", err);
    res.status(500).json({ msg: "Server error ensuring timeslots" });
  } finally {
    client.release();
  }
});



module.exports = router;
