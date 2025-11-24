

# 🧭 **1. Key Comparison & Gaps**

|Area|From Existing Design|From Uploaded Files|Recommended Integration|
|---|---|---|---|
|**Journal Metrics**|We had `user_metrics` for mood_avg, sentiment, and theme_counts.|Adds detailed emotional features (emotion variety, intensity, word frequency, mood stability).|Expand `user_metrics` with **emotion and language dimensions** + create `journal_metrics_daily` table for time-series tracking.|
|**Learning Metrics**|We tracked collections/lessons but not user completion progress.|Adds `user_learned_lessons` with topic aggregation + visualization ideas.|Add `user_learned_lessons` as a permanent table, and a derived metrics table `lesson_progress_metrics` for aggregation.|
|**Visualization & Analytics**|Only basic dashboard metrics.|Adds direct visualization goals (emotion heatmap, sentiment trend).|Store aggregated outputs (like emotion frequencies) in **JSONB** for flexibility.|
|**AI Context**|`ai_context_cache` holds summaries.|No change, but metrics help generate summaries.|Keep it — it’ll store _summaries of these metrics_ for AI retrieval.|

---

# 🧱 **2. Revised Database Additions**

Let’s integrate your metric files cleanly into the full architecture.

---

## 🧘‍♀️ A. Journal Progress Metrics

### **Table: `journal_metrics_daily` (New)**

Tracks per-day emotional and linguistic metrics derived from journals.

| Column                | Type      | Description                           |
| --------------------- | --------- | ------------------------------------- |
| id                    | UUID      | PK                                    |
| user_id               | UUID      |                                       |
| date                  | DATE      |                                       |
| entry_count           | INT       | Number of journal entries that day    |
| streak_days           | INT       | Active streak count                   |
| avg_sentiment         | FLOAT     | Average sentiment (-1 to +1)          |
| emotion_variety_index | FLOAT     | Diversity of emotions (0–1 scale)     |
| emotional_intensity   | FLOAT     | Sentiment polarity confidence average |
| dominant_emotions     | TEXT[]    | e.g., ["calm", "anxious", "hopeful"]  |
| emotion_word_freq     | JSONB     | {"calm":3, "fear":1, "happy":2}       |
| mood_stability_index  | FLOAT     | 1 - (std_dev(mood_score) / max_range) |
| updated_at            | TIMESTAMP |                                       |

### 🧠 Why:

- You can build trend charts, emotion heatmaps, and volatility graphs directly.
    
- Gives AI temporal context for insights like:  
    “Your emotional intensity has been decreasing this week — stability is improving.”
    

---

### **Modification: `user_metrics` (aggregate table)**

Now becomes a **weekly/monthly summary layer**, derived from `journal_metrics_daily`.

| Column                  | Type        | Description                    |
| ----------------------- | ----------- | ------------------------------ |
| id                      | UUID        | PK                             |
| user_id                 | UUID        |                                |
| metric_period           | VARCHAR(10) | "weekly" / "monthly"           |
| start_date              | DATE        | Period start                   |
| end_date                | DATE        | Period end                     |
| mood_avg                | FLOAT       | Mean mood score                |
| sentiment_trend         | FLOAT       | Slope of sentiment over period |
| top_emotions            | TEXT[]      | Most frequent emotions         |
| emotion_diversity_score | FLOAT       | Aggregated variety index       |
| stability_score         | FLOAT       | Aggregated mood stability      |
| streak_score            | INT         | Weighted streak activity       |
| theme_counts            | JSONB       | {"stress":4,"sleep":3}         |
| created_at              | TIMESTAMP   |                                |

> 🧩 Derived via cron every 7 days → this table powers the **Progress Dashboard** and **weekly summary for therapist**.

---

## 📘 B. Learning Progress Metrics

### **Table: `user_learned_lessons` (New, from your file)**

Stores lesson completion logs.

|Column|Type|Description|
|---|---|---|
|id|UUID|PK|
|user_id|UUID||
|collection_id|UUID|FK → `collections.id`|
|topic|VARCHAR(50)|Category (duplicated for speed)|
|completed_at|TIMESTAMP|When finished|

---

### **Table: `lesson_progress_metrics` (New)**

Stores aggregated progress metrics for faster dashboard rendering.

| Column                | Type      | Description                    |
| --------------------- | --------- | ------------------------------ |
| id                    | UUID      | PK                             |
| user_id               | UUID      |                                |
| total_lessons         | INT       | Total lessons completed        |
| topic_distribution    | JSONB     | {"mindfulness":6,"stress":3}   |
| last_completed_lesson | UUID      | FK → `user_learned_lessons.id` |
| updated_at            | TIMESTAMP |                                |

---

### **Metric Examples**

|Metric|How it’s Calculated|Example Visualization|
|---|---|---|
|**Lesson Count**|`COUNT(*) FROM user_learned_lessons WHERE user_id = $1`|CardMetric|
|**Topic Distribution**|Group by topic|Pie chart|
|**Lesson Recency**|`MAX(completed_at)`|“Last learned: Mindfulness”|
|**Learning Focus Balance**|Compare topic proportions|Bar chart|

> 🧠 The AI can use this to suggest balance:  
> “You’ve focused on mindfulness recently — maybe explore emotional awareness next?”

---

# 🧮 **3. How Data Should Be Stored**

### Journaling Flow (per entry)

1. Save journal in `user_journals`.
    
2. AI service (Python) extracts:
    
    - Sentiment, emotion, mood.
        
    - Generates embeddings → store in **Qdrant**.
        
    - Updates `journal_metrics_daily` and `user_metrics`.
        

### Learning Flow

1. When user completes a lesson:
    
    - Insert into `user_learned_lessons`.
        
    - Update `lesson_progress_metrics` via aggregation trigger or cron.
        

---

# 🧠 **4. Metric Storage & Computation Summary**

| Metric Group                | Table                     | Computation Source                | Stored As     |
| --------------------------- | ------------------------- | --------------------------------- | ------------- |
| Entry Count, Streak Days    | `journal_metrics_daily`   | Count from `user_journals`        | INT           |
| Sentiment Trend             | `user_metrics`            | Avg of daily sentiment            | FLOAT         |
| Emotion Variety & Intensity | `journal_metrics_daily`   | NLP model output                  | FLOAT         |
| Emotion Word Frequency      | `journal_metrics_daily`   | NLP token analysis                | JSONB         |
| Mood Stability              | `journal_metrics_daily`   | Formula: 1 - std_dev / max_range  | FLOAT         |
| Lesson Count                | `lesson_progress_metrics` | Count from `user_learned_lessons` | INT           |
| Topic Distribution          | `lesson_progress_metrics` | Group by topic                    | JSONB         |
| Learning Balance            | `lesson_progress_metrics` | Ratio of topics                   | Derived by AI |
| Streak Score                | `user_metrics`            | Derived from `user_streaks`       | INT           |

---

# 🔍 **5. Summary of Database Modifications (Compared to Previous Schema)**

|Type|Change|Reason|
|---|---|---|
|**New**|`journal_metrics_daily`|Needed for day-by-day visualization and AI time-series analysis|
|**Expand**|`user_metrics`|Weekly/monthly aggregate now includes stability, diversity, trend|
|**New**|`user_learned_lessons`|Logs lesson completions (from new file)|
|**New**|`lesson_progress_metrics`|Aggregated learning insights|
|**No change**|Qdrant collections|Still store embeddings (journal & lesson)|

---

# ⚙️ **6. Next Step Options**

We can now go two ways:

1. **Sync Strategy:**  
    Define exactly how and when Postgres & Qdrant update each other — including cron frequency and message queue events.  
    _(This will specify: who updates metrics, when summaries are cached, and how AI context refresh works.)_
    
2. **Metric Calculation Blueprint:**  
    Write concrete formulas and pseudo-code for how each metric is computed from raw journals and lessons (e.g., Python side logic).
    

---

👉 Which would you like me to detail next —  
**the sync strategy between PostgreSQL, Qdrant, and the AI service**,  
or the **exact metric calculation plan (with pseudo-formulas and update rules)**?