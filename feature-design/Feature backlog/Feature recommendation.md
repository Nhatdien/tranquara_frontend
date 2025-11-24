

## 1. Personalize metric

**Purpose:** Show both charts (quantitative) and summaries (qualitative).

### User Flow:

1. **Morning** → user logs mood with emoji/metaphor slider.
    
    - (🌞 “Calm,” 😐 “Okay,” 😔 “Stressed”).
        
2. **Evening Reflection** → user writes about their day.
    
3. **Dashboard** (auto-updated):
    
    - Chart: Line graph of mood for the week.
        
    - Qualitative: “This week you mentioned ‘anxiety’ 4 times, ‘sleep’ 3 times.”
        
4. **User feels**: “I can see my patterns clearly.”


### Solution
Collect user moods through `Daily Reflection` collections and provide a mood line chart and a wording chart.

---

## 2. Profile Summarizing

**Purpose:** Give the user a weekly reflection they can export to share with their therapist.

### User Flow:

1. **Sunday Evening** → user completes Weekly Reflection.
    
2. App automatically **generates Prep Pack**:
    
    - Highlights → “Top 3 things you celebrated this week.”
        
    - Challenges → “Main stressors you wrote about.”
        
    - Goals → “One focus for next session.”
        
3. **User clicks “Export”** → PDF/notes to bring to therapy.
    
4. **User feels**: “I’m walking into my session prepared, with my week summarized.”


### Solution
Use cron job to send user a notification that their weekly reflection has been done, they can press in the notification and go to the link to display the reflection

#### Context for chatbot
journals and chatlog for a whole week before 0h Monday

---

## 3. **Daily Mini-Lessons + Prompt Bridge**

**Purpose:** Small daily teaching that links into journaling.

### User Flow:

1. **Morning Home Screen** → sees a card:
    
    - “💡 Did you know naming emotions reduces their power? Try noticing one emotion right now.”
        
2. CTA button → takes them to _Emotional Check-in_.
    
3. They write a quick entry.
    
4. App shows small feedback → “Nice work, you spotted your emotion today.”
    
5. **User feels**: “I learned something new AND practiced it in 2 minutes.”
    


### Solution
	Request the chatbot for the recommendation at the start of the day, and put the result in a cache for 1 day (maybe use http header).
	- Context for AI: 
		- User previous 3 days chatlog and journals
---

## 4. **Gentle Personalization (AI-assisted)**

**Purpose:** Suggest content in a private, supportive way.

### User Flow:

1. **User journals in Stress → Work Stress**:
    
    - Writes: “Deadlines are crushing me.”
        
2. App (AI) notices repeated theme.
    
3. Suggestion pops up after journaling:
    
    - “Looks like work pressure has come up a few times this week. Want to check Lifestyle → Sleep Habits? Poor sleep often makes stress feel heavier.”
        
4. User taps CTA → goes to new collection.
    
5. **User feels**: “The app is guiding me, like a therapist gently connecting the dots.”
    

---

## 5. **Hybrid Engagement (in-between playful & serious)**

**Purpose:** Keep the experience supportive without feeling like a game or a clinic.

### User Flow:

1. User opens **Progress Dashboard**.
    
    - Sees a **tree illustration** that grows leaves based on streaks.
        
    - Beneath it → a serious written summary of mood trends.
        
2. Evening Reflection ends with a cute metaphor →
    
    - “🌙 Imagine placing today’s worries in a box before bed.”
        
    - Then → structured prompt: “What would you put in the box today?”
        
3. **User feels**: “This is gentle and uplifting, but also gives me something real to take to therapy.”
    

---

# 🚀 Combined Daily Example

Here’s how a **normal user’s week** might flow:

- **Monday Morning** → logs “anxious,” sees tip card: _“Breathing slows down anxious thoughts”_ → does Emotional Check-in.
    
- **Tuesday Midday** → quick Daily Check-in: “Feeling tired, deadline stress.”
    
- **Wednesday Evening** → Reflection: “Had conflict at work.” App suggests → _Relationship Stress_ prompts.
    
- **Thursday** → Dashboard shows: “You’ve mentioned deadlines 3 times this week.”
    
- **Sunday Night** → Completes Weekly Reflection → gets “Therapy Prep Pack” summary → exports to bring to therapy.
    

---

👉 Would you like me to **design how the Dashboard looks** (like JSON schema for progress + summaries, similar to how slide_groups are structured), so it matches the rest of your `testCollection` style?


### Questions 
- Do I need a Cronjob to summarize user chatlog and journaling to provide better context for the bot, and how long should i run it in interval (maybe 3 days)