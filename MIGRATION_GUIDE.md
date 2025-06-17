# Database Migration Instructions

## 🚀 How to Apply the Database Changes

### Option 1: Run the Node.js Migration Script (Recommended)

1. **Make sure your server is stopped**:
   ```bash
   # Stop any running node processes
   Get-Process -Name "node" | Stop-Process -Force
   ```

2. **Run the migration script**:
   ```bash
   cd backend
   node run-migration.js
   ```

3. **Start your server again**:
   ```bash
   node server.js
   ```

### Option 2: Manual SQL Execution

If you prefer to run the SQL manually:

1. Connect to your PostgreSQL database
2. Run the SQL file: `backend/migrations/001_update_schema.sql`

## ✅ What This Migration Does

### Fixed Issues:
- ✅ Removes unique constraint on `slot_index` alone
- ✅ Adds proper constraint: `UNIQUE(day_of_week, slot_index)`
- ✅ Pre-populates all standard timeslots (Mon-Fri, 8 slots per day)
- ✅ Adds `session_type` column to class_sessions
- ✅ Adds conflict prevention constraints

### New Features:
- ✅ **Teacher Allocations**: Track which teachers teach which subjects
- ✅ **Generation History**: Track all timetable generation attempts
- ✅ **Blocked Timeslots**: Support for maintenance/holidays
- ✅ **Performance Indexes**: Faster queries for large datasets

### Conflict Prevention:
- ✅ No batch can have multiple sessions at same timeslot
- ✅ No room can be double-booked
- ✅ No teacher can be double-booked

## 🎯 After Migration

Your database will have:
- **40 pre-created timeslots** (5 days × 8 slots)
- **Conflict-free scheduling** for multiple batches
- **Better performance** with optimized indexes
- **Enhanced tracking** of timetable operations

## 🐛 Troubleshooting

If migration fails:
1. Check your database connection in `.env` file
2. Ensure PostgreSQL is running
3. Make sure you have admin privileges on the database
4. Check the error messages for specific issues

## 📞 Support

If you encounter issues, the migration script will show detailed error messages to help diagnose the problem.
