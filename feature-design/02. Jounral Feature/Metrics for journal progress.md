

## Core Journal Metrics

| Metric          | Description                                                       | Visualization Idea           |
| --------------- | ----------------------------------------------------------------- | ---------------------------- |
| **Entry Count** | Total number of journal entries created (daily, weekly, monthly). | Line or bar chart over time. |
| **Streak Days** | Consecutive journaling days.                                      | Fire icon + streak counter.  |
| Word counts     | total word count of every journal                                 |                              |



## Emotion & Language Analysis

| Metric              | Description                                    | Visualization Idea                    |
| ------------------- | ---------------------------------------------- | ------------------------------------- |
| **Sentiment Trend** | Overall positivity/negativity trend over time. | Smooth line graph with emoji markers. |
| **Sleep trend       | The quality of sleeps overtine                 | bar chart or line chart               |




## 🧠 **Core Journal Metrics**

### 🔹 Data Collected

- `created_at` timestamp
    
- `entry_id` (unique ID)
    
- `user_id`
    
- Optional: journal type (`daily`, `prompt`, `therapy_prep`)
    

### 🔹 Derived Fields

- **Entry count** = number of entries within a time window
    
- **Streak days** = consecutive days with at least one entry
    

### 🔹 Example

|Date|Entry|
|---|---|
|2025-10-10|"Today I reflected on my goals and felt calm."|
|2025-10-11|"I wrote about my fears before my next session."|

📊 **Result**

- Entry Count (weekly): 2
    
- Streak Days: 2-day streak 🔥
    
