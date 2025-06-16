const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { spawn } = require("child_process");

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
    if (subject_ids.length > 0) {
      const subjectQueries = subject_ids.map((sid) =>
        client.query(
          "INSERT INTO batch_subjects (batch_id, subject_id) VALUES ($1, $2)",
          [batchId, sid]
        )
      );
      await Promise.all(subjectQueries);
    }
    await client.query("COMMIT");
    res
      .status(201)
      .json({ msg: "Batch created successfully", batch_id: batchId });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A batch with this name already exists." });
    res.status(500).json({ msg: "Server error" });
  } finally {
    client.release();
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
    console.error(`Error updating batch ${id}:`, err);
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A batch with this name already exists." });
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    client.release();
  }
});

router.delete("/batches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM batches WHERE batch_id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Batch not found." });
    res
      .status(200)
      .json({ msg: "Batch and all associated data deleted successfully." });
  } catch (err) {
    console.error("Error deleting batch:", err);
    res.status(500).json({ msg: "Server error" });
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
      const query = `
          SELECT 
              cs.session_id,
              s.name AS subject_name,
              s.code AS subject_code,
              t.name AS teacher_name,
              r.room_name,
              ts.day_of_week,
              ts.start_time,
              ts.end_time,
              ts.slot_index
          FROM class_sessions cs
          LEFT JOIN subjects s ON cs.subject_id = s.subject_id
          LEFT JOIN teachers t ON cs.teacher_id = t.teacher_id
          LEFT JOIN rooms r ON cs.room_id = r.room_id
          LEFT JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
          WHERE cs.batch_id = $1
          ORDER BY ts.slot_index;
      `;
      const result = await pool.query(query, [batchId]);
      res.json(result.rows);
  } catch (err) {
      console.error(`Error fetching timetable for batch ${batchId}:`, err);
      res.status(500).json({ msg: "Internal server error" });
  }
});


// --- TIMETABLE ENGINE API ---
router.post("/generate-timetable", async (req, res) => {
  const { batch_id } = req.body;
  if (!batch_id) return res.status(400).json({ msg: "A Batch ID is required." });
  const client = await pool.connect();
  try {
      const [subjects, teachers, rooms, timeslots] = await Promise.all([
          client.query(`SELECT s.*, 'TBD' as teacher_id FROM subjects s JOIN batch_subjects bs ON s.subject_id = bs.subject_id WHERE bs.batch_id = $1`, [batch_id]),
          client.query("SELECT * FROM teachers"),
          client.query("SELECT * FROM rooms"),
          client.query("SELECT timeslot_id, slot_index FROM timeslots ORDER BY slot_index ASC")
      ]);
      const solverInput = { subjects: subjects.rows, teachers: teachers.rows, rooms: rooms.rows };
      if (solverInput.subjects.length === 0) return res.status(404).json({ msg: "No subjects found for this batch." });
      
      const pythonProcess = spawn('python', ['solver.py']);
      const result = await new Promise((resolve, reject) => {
          let resultData = '';
          pythonProcess.stdout.on('data', (data) => resultData += data.toString());
          pythonProcess.stderr.on('data', (data) => reject(new Error(data.toString())));
          pythonProcess.on('close', (code) => code === 0 ? resolve(resultData) : reject(new Error(`Solver exited with code ${code}`)));
          pythonProcess.stdin.write(JSON.stringify(solverInput));
          pythonProcess.stdin.end();
      });

      const solution = JSON.parse(result);
      if (solution.status !== 'success') return res.status(409).json({ msg: "Solver failed.", details: solution.message });

      const timeslotMap = new Map(timeslots.rows.map(ts => [ts.slot_index, ts.timeslot_id]));
      await client.query('BEGIN');
      await client.query('DELETE FROM class_sessions WHERE batch_id = $1', [batch_id]);
      const insertPromises = solution.schedule.map(item => {
          const timeslotId = timeslotMap.get(item.start_slot);
          if (!timeslotId) return null;
          return client.query("INSERT INTO class_sessions (subject_id, batch_id, teacher_id, room_id, timeslot_id) VALUES ($1, $2, $3, $4, $5)", [item.subject_id, batch_id, item.teacher_id, item.room_id, timeslotId]);
      });
      await Promise.all(insertPromises.filter(p => p));
      await client.query('COMMIT');
      res.status(200).json({ msg: `Timetable for batch ${batch_id} generated successfully!` });
  } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ msg: "An internal server error occurred.", details: err.message });
  } finally {
      client.release();
  }
});

module.exports = router;
