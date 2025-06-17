# 🗄️ Database Schema - Unified Approach

## ✅ **COMPLETED: Unified Database Schema**

The timetable project now has a **unified database schema** instead of 5 separate migration files.

### 🆕 **New Structure**

**Single Schema File**: `backend/schema.sql`
- ✅ Complete database schema in one file
- ✅ All tables, relationships, and indexes
- ✅ Default data insertion
- ✅ Clean deployment for new databases

**Smart Migration Scripts**:
- ✅ `run-unified-schema.js` - For fresh databases
- ✅ `run-incremental-migrations.js` - For existing databases
- ✅ Auto-detection of database state

### 📋 **Database Tables Included**

**Core System:**
- `users`, `roles` - Authentication & authorization
- `batches`, `subjects`, `teachers`, `rooms` - Academic entities

**Relationships:**
- `batch_subjects` - Which subjects belong to which batches
- `teacher_allocations` - Teacher-subject-batch assignments

**Timetable Engine:**
- `batch_timeslots` - Batch-specific time schedules
- `class_sessions` - Actual timetable entries
- `timetable_generations` - Generation history

**Management:**
- `blocked_timeslots` - Holiday/maintenance blocking
- `timeslots` - Legacy compatibility

### 🚀 **Usage Commands**

```bash
# New deployment (Railway, fresh database)
npm run migrate

# Existing database with data
npm run migrate:incremental

# Legacy approach (for reference)
npm run migrate:legacy
```

### 🎯 **Benefits**

1. **Clean Deployments**: Single command creates entire schema
2. **Railway Optimized**: Perfect for Railway PostgreSQL deployment
3. **Backward Compatible**: Existing databases can still use incremental migrations
4. **Self-Documenting**: Complete schema visible in one file
5. **Performance Optimized**: All indexes and constraints included

### 📁 **File Organization**

```
backend/
├── schema.sql                     # 🆕 Unified schema
├── run-unified-schema.js          # 🆕 Smart deployment
├── run-incremental-migrations.js  # 🆕 Legacy support
├── migrations/                    # Legacy migration files
│   ├── README.md                 # Migration guide
│   ├── 001_update_schema.sql
│   ├── 002_create_missing_tables.sql
│   ├── 003_batch_specific_timeslots.sql
│   ├── 004_add_cascade_deletes.sql
│   └── 005_cleanup_constraints.sql
```

### 🌊 **Railway Deployment**

Railway deployment now uses the unified approach:

1. **Deploy**: Railway auto-deploys from GitHub
2. **Migrate**: `railway run npm run migrate`
3. **Ready**: Complete database schema in one command

The unified schema provides a much cleaner deployment experience for Railway and other platforms! 🎉
