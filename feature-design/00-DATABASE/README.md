# 📊 Database Documentation - TheraPrep

> Centralized database schema, architecture, and design documentation

---

## 📑 Quick Navigation

| Document | Purpose | Status |
|----------|---------|--------|
| **[SCHEMA_OVERVIEW.md](./SCHEMA_OVERVIEW.md)** | Complete current schema reference | ✅ Primary |
| **[CONTENT_SCHEMAS.md](./CONTENT_SCHEMAS.md)** | Slide content type specifications | 🔄 TBD |
| **[database-design-v2.md](./database-design-v2.md)** | V2 design with metrics evolution | 📋 Reference |
| **[architecture-notes.md](./architecture-notes.md)** | Scalability & performance considerations | 📚 Reference |
| **[legacy-database-design.md](./legacy-database-design.md)** | Original database design | 📜 Archive |

---

## 🎯 Which Document Should I Read?

### For Implementation
→ **Start with [SCHEMA_OVERVIEW.md](./SCHEMA_OVERVIEW.md)**  
This is the authoritative, up-to-date schema with all tables, relationships, and examples.

### For Content Design
→ **Read [CONTENT_SCHEMAS.md](./CONTENT_SCHEMAS.md)**  
Details how slide content is structured in JSONB format (journal templates, lessons, etc.)

### For Architecture Decisions
→ **Check [architecture-notes.md](./architecture-notes.md)**  
Discusses sync patterns, vector DB integration, RabbitMQ usage, and scaling considerations.

### For Evolution History
→ **Review [database-design-v2.md](./database-design-v2.md)**  
Shows how metrics tables evolved and what changed from v1.

---

## 📚 Schema Sections

The main schema is organized into these logical groups:

1. **User & Authentication** - User profiles, settings, KYC data
2. **Journaling System** - Journals, AI chat logs, streaks
3. **Learning & Therapy Prep** - Collections, slide groups, lesson tracking
4. **Metrics & Analytics** - Daily metrics, aggregated summaries, progress tracking

---

## 🔗 Related Documentation

- **[Feature Design README](../README.md)** - Overall project navigation
- **[Journaling Feature](../02.%20Emotion%20Jounral%20Feature/)** - Journaling-specific data flows
- **[Learning Features](../04.%20Prepare%20for%20Therapy/)** - Therapy prep content structure

---

## 🚀 Getting Started with Database

### Prerequisites
- PostgreSQL 14+
- Drizzle ORM installed
- Qdrant running (for vector storage)

### Setup
```bash
# Install dependencies
npm install drizzle-orm postgres

# Generate migrations
npx drizzle-kit generate:pg

# Push to database
npx drizzle-kit push:pg
```

### Connection
See `db/drizzle.ts` for database connection configuration.

---

## 📝 Best Practices

### When Adding Tables
1. Update **[SCHEMA_OVERVIEW.md](./SCHEMA_OVERVIEW.md)** with full schema
2. Add relationships to the ER diagram
3. Include sample queries
4. Document JSONB structures
5. Add indexes for common queries
6. Update feature-specific data model docs

### When Modifying Schema
1. Create migration file
2. Update schema overview
3. Update affected feature documentation
4. Check for breaking changes in API
5. Update seed data if needed

### Naming Conventions
- **Tables**: `snake_case`, plural (e.g., `user_journals`)
- **Columns**: `snake_case` (e.g., `created_at`)
- **Indexes**: `idx_table_column` (e.g., `idx_user_journals_user_id`)
- **Foreign Keys**: `fk_table_column` (if explicitly named)

---

**Last Updated**: November 21, 2025
