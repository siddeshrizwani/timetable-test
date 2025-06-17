# Database Setup Guide

## 🚀 Database Setup Options

### Option 1: Unified Schema (Recommended for New Deployments)

For fresh databases (Railway, new PostgreSQL instances):

1. **Make sure your server is stopped**:
   ```bash
   # Stop any running node processes if needed
   Get-Process -Name "node" | Stop-Process -Force
   ```

2. **Run the unified schema**:
   ```bash
   npm run migrate
   ```

3. **Verify the setup**:
   ```bash
   npm run check-db
   ```

### Option 2: Incremental Migration (For Existing Databases)

If you have an existing database with data:

1. **Backup your database first** (recommended)

2. **Run incremental migrations**:
   ```bash
   npm run migrate:incremental
   ```

3. **Verify the migration**:
   ```bash
   npm run check-db
   ```

### Option 3: Manual SQL Execution

If you prefer to run SQL manually:

1. **For new databases**: Execute `backend/schema.sql`
2. **For existing databases**: Execute migration files in `backend/migrations/` in order

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
