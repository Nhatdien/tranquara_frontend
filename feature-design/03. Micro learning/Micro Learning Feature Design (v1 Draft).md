
### **Database Integration**

#### `collections`

|Column|Type|Example|
|---|---|---|
|`id`|UUID|`"63b6c9..."`|
|`title`|VARCHAR(255)|`"Naming Emotions Reduces Their Power"`|
|`category`|VARCHAR(50)|`"mindfulness"`|
|`description`|TEXT|`"A short daily practice about labeling emotions"`|
|`type`|VARCHAR(50)|`"learn"`|
|`created_at`|TIMESTAMP|`CURRENT_TIMESTAMP`|

> For daily micro-lessons, store them under `type = "learn"` with a `category` like `"daily_mini"`.

#### `slide_groups`

|Column|Type|Example|
|---|---|---|
|`id`|UUID|`"ad9b2a..."`|
|`collection_id`|UUID|(FK → `collections.id`)|
|`title`|VARCHAR(255)|`"Naming Emotions Reduces Their Power"`|
|`content`|JSONB|Array of content objects (see below)|
|`position`|INT|`1`|
|`description`|TEXT|`"Learn how identifying emotions improves regulation."`|

---

###  **Slide Group Content JSON (uses your Content Type Schema)**

_[JSON code implementation removed - to be added during development]_

>  These slides follow your defined schema (`doc`, `cta`, `journal_prompt`, `further_reading`) and can be rendered with your existing Vue component logic.

---

### **AI Recommendation Flow**

The AI service (Python + Qdrant) will:

1. Search `collections` where `type = 'learn'` and `category = 'daily_mini'`.
    
2. Filter out lessons the user has already completed.
    
3. If no relevant match:
    
    - Use a fallback model (e.g., curated HuggingFace retriever) to fetch a short psychological insight.
        
    - Generate new slides following the schema above.
        
    - Insert them into `collections` + `slide_groups`.
        

---

###  **Daily Cache + Tracking**

You can reuse the journaling structure for tracking completion.

#### New temporary table:

##### `user_daily_lessons`

|Column|Type|Description|
|---|---|---|
|`id`|UUID|Primary key|
|`user_id`|UUID|From Keycloak token|
|`collection_id`|UUID|FK → `collections.id`|
|`completed_at`|TIMESTAMP|When finished|
|`ai_context`|JSONB|Cached context from the AI (topics, moods, etc.)|

> Used for caching and ensuring the same lesson isn’t shown twice in 24h.

---

### 🔄 **Flow Summary**

1. **Morning:**
    
    - Go backend checks cache for `/api/micro-lessons/today`.

		(Perform a progress loading here when fetching preparing for lesson)
        
    - If none → AI service fetches a new one from DB or generates fresh content.
        
2. **Frontend:**
    
    - Shows the slide-based lesson under “Daily Task.”
        
3. **User finishes slides:**
    
    - Save completion record → `user_daily_lessons`.
        
    - Optionally link journal entry (if created via `journal_prompt` slide).
        
4. **AI learns context:**
    
    - Next day’s lesson uses last 3 days’ journals + chatlog + recent lessons.
        

---

### Example `collections` Record (for clarity)

_[JSON code implementation removed - to be added during development]_

---

Would you like me to extend this next by:

- 🔹 creating the **TypeScript interface** for the `slide_group` JSON schema (for use in Nuxt 3 frontend),  
    or
    
- 🔹 illustrating the **AI service flow diagram** showing how Go ↔ RabbitMQ ↔ Python handle micro-lesson selection and caching?