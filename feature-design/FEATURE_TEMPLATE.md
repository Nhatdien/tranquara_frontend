# 📝 Feature Documentation Template

> Use this template when creating documentation for new features or reorganizing existing feature folders.

---

## File Structure

Each feature folder should contain these standardized files:

```
📁 [Feature Name]/
  ├── 00-OVERVIEW.md          # Feature purpose, goals, and status
  ├── 01-USER-FLOWS.md         # User journeys and interaction patterns
  ├── 02-TECHNICAL-SPEC.md     # Implementation details and architecture
  ├── 03-DATA-MODELS.md        # Database schemas and data structures
  ├── diagrams/                # Visual aids (flowcharts, wireframes, etc.)
  │   └── *.png, *.drawio.png
  └── examples/                # Sample data, mock responses, etc.
      └── *.json, *.md
```

---

## 00-OVERVIEW.md Template

```markdown
# [Feature Name] - Overview

## 🎯 Purpose

[Brief description of what this feature does and why it exists]

## 📊 Status

- **Current Status**: [✅ Done | 🔄 In Progress | 🧠 Planned | 🧪 Testing | etc.]
- **Priority**: [High | Medium | Low]
- **Target Release**: [Version or date]
- **Dependencies**: [List features this depends on]

## 🎨 User Value

[Describe the value this feature provides to users]

## 🔑 Key Features

- Feature point 1
- Feature point 2
- Feature point 3

## 📋 Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Related Features

- [Feature A](../feature-a/) - [How they're related]
- [Feature B](../feature-b/) - [How they're related]

## 📝 Notes

[Any additional context, assumptions, or considerations]
```

---

## 01-USER-FLOWS.md Template

```markdown
# [Feature Name] - User Flows

## 🎭 User Personas

### Primary Users
- **Persona 1**: [Description]
- **Persona 2**: [Description]

## 🔄 Main User Flow

### Happy Path

```
┌─────────────┐
│ Entry Point │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 1    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 2    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Result    │
└─────────────┘
```

### Step-by-Step Walkthrough

1. **[Step Name]**
   - User action: [What the user does]
   - System response: [What happens]
   - Screen/UI: [What they see]

2. **[Step Name]**
   - User action: [What the user does]
   - System response: [What happens]
   - Screen/UI: [What they see]

## 🚨 Edge Cases & Error Flows

### Edge Case 1: [Name]
- **Scenario**: [When this happens]
- **User Experience**: [What user sees/does]
- **System Behavior**: [How system handles it]

### Edge Case 2: [Name]
- **Scenario**: [When this happens]
- **User Experience**: [What user sees/does]
- **System Behavior**: [How system handles it]

## 🎨 UI/UX Considerations

- Consideration 1
- Consideration 2

## 📱 Screen Mockups

[Reference to mockups in diagrams/ folder or external design files]
```

---

## 02-TECHNICAL-SPEC.md Template

```markdown
# [Feature Name] - Technical Specification

## 🏗️ Architecture Overview

[High-level description of how this feature fits into the system]

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────►│   Backend    │────►│   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 🔧 Technology Stack

- **Frontend**: [Technologies used]
- **Backend**: [Technologies used]
- **Database**: [Technologies used]
- **External Services**: [Any third-party services]

## 📡 API Endpoints

### Endpoint 1: [Name]

**Request:**
```http
POST /api/v1/resource
Content-Type: application/json

{
  "field1": "value",
  "field2": 123
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "uuid",
  "status": "success",
  "data": {}
}
```

### Endpoint 2: [Name]

[Same format as above]

## 🔐 Security Considerations

- Security point 1
- Security point 2
- Security point 3

## ⚡ Performance Requirements

- Requirement 1 (e.g., response time < 200ms)
- Requirement 2 (e.g., handle 1000 concurrent users)

## 🧪 Testing Strategy

### Unit Tests
- Test scenario 1
- Test scenario 2

### Integration Tests
- Test scenario 1
- Test scenario 2

### E2E Tests
- User flow 1
- User flow 2

## 📝 Implementation Checklist

- [ ] Backend API development
- [ ] Database migrations
- [ ] Frontend UI components
- [ ] API integration
- [ ] Error handling
- [ ] Loading states
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation
- [ ] Code review
```

---

## 03-DATA-MODELS.md Template

```markdown
# [Feature Name] - Data Models

## 📊 Database Tables

### Table 1: `table_name`

**Purpose**: [What this table stores]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK, NOT NULL | Reference to users |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `field1` | VARCHAR(255) | NOT NULL | [Description] |
| `field2` | JSONB | | [Description] |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_created_at` on `created_at`

**Relationships:**
- Belongs to `users` table via `user_id`
- Has many `related_table` records

### Table 2: `table_name`

[Same format as above]

## 🔄 Data Flow

```
User Input → Validation → Transform → Database → Response
```

### Example Data Flow

1. User submits form data
2. Frontend validates input
3. API receives request
4. Backend validates business rules
5. Data transformed to database format
6. Database transaction committed
7. Response sent to frontend

## 📝 Sample Data

### Example Record 1

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "field1": "example value",
  "field2": {
    "nested": "data"
  },
  "created_at": "2025-11-21T10:30:00Z"
}
```

## 🔗 Related Schemas

- [Database Overview](../../database/SCHEMA_OVERVIEW.md)
- [Other Feature Schema](../other-feature/03-DATA-MODELS.md)

## 🚀 Migration Notes

[Any important notes about database migrations, data transformations, or backwards compatibility]
```

---

## 📐 Diagram Guidelines

### Recommended Diagram Types

1. **Flow Diagrams** - Use for user flows and process flows
   - Tool: draw.io, Mermaid, or Excalidraw
   - Format: `.drawio.png` (editable) or `.png`

2. **Wireframes** - Use for UI/UX mockups
   - Tool: Figma, Sketch, or screenshots
   - Format: `.png` or `.jpg`

3. **Architecture Diagrams** - Use for technical architecture
   - Tool: draw.io or Mermaid
   - Format: `.drawio.png`

4. **Data Flow Diagrams** - Use for data movement
   - Tool: draw.io or text-based diagrams
   - Format: `.drawio.png` or inline in markdown

### Naming Convention

```
[feature-name]-[diagram-type]-[version].png

Examples:
- authentication-user-flow-v1.png
- journaling-architecture-v2.drawio.png
- therapy-prep-wireframe-home.png
```

---

## ✅ Checklist for Complete Documentation

When documenting a feature, ensure:

- [ ] 00-OVERVIEW.md created with clear purpose and status
- [ ] 01-USER-FLOWS.md includes main flow and edge cases
- [ ] 02-TECHNICAL-SPEC.md details implementation approach
- [ ] 03-DATA-MODELS.md documents all database tables
- [ ] Visual diagrams added to `diagrams/` folder
- [ ] Sample data/examples added to `examples/` folder (if applicable)
- [ ] Cross-references to related features included
- [ ] Links to database schema documentation added
- [ ] Status indicators updated in main README
- [ ] All markdown properly formatted and readable

---

## 🎯 Best Practices

1. **Be Specific**: Avoid vague descriptions; use concrete examples
2. **Stay Updated**: Update docs when implementation changes
3. **Link Liberally**: Cross-reference related documentation
4. **Use Visuals**: Include diagrams for complex flows
5. **Version Control**: Note versions when updating major changes
6. **Think of AI**: Write in a way that's easy for AI assistants to parse
7. **Code Examples**: Use actual code snippets, not pseudo-code
8. **Consistency**: Follow this template structure across all features

---

**Last Updated**: November 21, 2025
