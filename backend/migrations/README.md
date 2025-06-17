# Database Migrations

This folder contains database migration files for the University Timetable System.

## 🆕 **Unified Schema (Recommended for New Deployments)**

For new deployments on Railway or fresh databases, use the unified schema:

```bash
# Run the unified schema
npm run migrate
```

**File**: `../schema.sql` - Contains the complete database schema in a single file.

**Script**: `../run-unified-schema.js` - Automatically detects if database is fresh and runs the unified schema.

## 🔄 **Incremental Migrations (For Existing Databases)**

For existing databases with data that need to be updated:

```bash
# Run incremental migrations
npm run migrate:incremental
```

**Script**: `../run-incremental-migrations.js` - Runs all migration files in sequence.

## 📁 **Migration Files (Legacy)**

These files are kept for existing database upgrades:

1. **001_update_schema.sql** - Initial schema updates and timeslot standardization
2. **002_create_missing_tables.sql** - Additional tables (teacher_allocations, timetable_generations, blocked_timeslots)
3. **003_batch_specific_timeslots.sql** - Batch-specific timeslot support
4. **004_add_cascade_deletes.sql** - Cascade delete constraints for proper batch deletion
5. **005_cleanup_constraints.sql** - Constraint cleanup and validation

## 🎯 **Which Option to Choose?**

- **New Railway deployment**: Use `npm run migrate` (unified schema)
- **Existing database with data**: Use `npm run migrate:incremental`
- **Development/Local**: Either option works, unified is cleaner

## ⚡ **Railway Deployment**

The Railway deployment guide (`../DEPLOY_RAILWAY.md`) automatically uses the unified schema approach for the cleanest deployment experience.
