
## User basic information
### `user_informations`

Stores user metadata and preferences. `user_id` is **UUID from Keycloak**, not an FK.

| Column      | Type          | Description                                 |
| ----------- | ------------- | ------------------------------------------- |
| user_id     | `UUID`        | Primary key, from Keycloak token            |
| kyc_answers | `JSONB`       | KYC or onboarding answers                   |
| name        | `TEXT`        | Full name or preferred name                 |
| age_range   | `VARCHAR(50)` | Age range                                   |
| gender      | `TEXT`        | Male/Female/Other                           |
| settings    | `JSONB`       | All user settings (see below for structure) |
| created_at  | `TIMESTAMP`   | Registration date                           |

---

### `settings` JSONB structure

This is stored inside the `users` table:

```json
NO schema design yet
```

---

## Journaling related tables
### `ai_guider_chatlog`

| Column      | Type        | Description            |
| ----------- | ----------- | ---------------------- |
| id          | `UUID`      | Primary key            |
| journal_id  | `UUID`      | FK from journals table |
| user_id     | `UUID`      | From Keycloak token    |
| sender_type | `TEXT`      | `user` or `ai`         |
| message     | `TEXT`      | Chat content           |
| created_at  | `TIMESTAMP` | Timestamp              |

### `user_journals`

| Column     | Type        | Description         |
| ---------- | ----------- | ------------------- |
| id         | `UUID`      | Primary key         |
| journal_id | `UUID`      | Template id         |
| user_id    | `UUID`      | From Keycloak token |
| title      | `TEXT`      | Journal title       |
| content    | `TEXT`      | Journal content     |
| created_at | `TIMESTAMP` | When written        |

### `user_streaks`

| Column         | Type      | Description                   |
| -------------- | --------- | ----------------------------- |
| user_id        | `UUID`    | From Keycloak token           |
| current_streak | `INTEGER` | Current daily activity streak |
| longest_streak | `INTEGER` | Historical best streak        |
| last_active    | `DATE`    | Last activity day             |

## Learning and prepare for therapy


### `collections`

| Column        | Type         | Constraints                     | Description                                  |
| ------------- | ------------ | ------------------------------- | -------------------------------------------- |
| `id`          | UUID         | PK, `DEFAULT gen_random_uuid()` | Unique collection ID                         |
| `title`       | VARCHAR(255) | NOT NULL                        | Collection title                             |
| `category`    | VARCHAR(50)  | NOT NULL                        | Collection Category                          |
| `description` | TEXT         |                                 | Short summary                                |
| `created_at`  | TIMESTAMP    | `DEFAULT CURRENT_TIMESTAMP`     | Creation timestamp                           |
| `type`        | VARCHAR(50)  | `learn` \| `prepare`            | spilt the colleciton into 2 types to display |
|               |              |                                 |                                              |

### `slide_groups`

| Column          | Type         | Constraints                               | Description                                             |
| --------------- | ------------ | ----------------------------------------- | ------------------------------------------------------- |
| `id`            | UUID         | PK, `DEFAULT gen_random_uuid()`           | Unique lesson ID                                        |
| `collection_id` | UUID         | FK → `collections.id` `ON DELETE CASCADE` | Parent collection                                       |
| `title`         | VARCHAR(255) | NOT NULL                                  | Lesson title                                            |
| `content`       | JSONB        |                                           | slide group content <br>[[Content type schemas design]] |
| `description`   | TEXT         |                                           | Short description                                       |
| `position`      | INT          | NOT NULL                                  | Ordering inside collection                              |
| `created_at`    | TIMESTAMP    | `DEFAULT CURRENT_TIMESTAMP`               | Creation timestamp                                      |



