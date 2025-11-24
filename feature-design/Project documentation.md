
### 🧾 TheraPrep

> Example: **TheraPrep – Emotion Journal and Prepare for a Therapy session**

---

### 🗂️ 1. **Feature Overview**

| Feature Name                                         | Description                                                                                                                                                                                                                          | Status     | Priority |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------- |
| User Registration                                    | Allow users to sign up with just user name using FIDO                                                                                                                                                                                | ✅ Done     | High     |
| Journaling                                           | AI-assisted journaling, user will be given a list of journaling prompts, the prompt will be display in carousel format                                                                                                               | 🧠 Planned | High     |
| Prepare for therapy                                  | Provide lessons to learn about the fundamental of psychology and to help them prepare for the therapy session, the lesson will also have slide format with many slide type like cta link, docs, journal prompt or small quiz, etc... | 🧠 Planned | High     |
| Profile Summarizing                                  | Summarize user profile, contain it in an document with informations that therapist will need to start                                                                                                                                | 🧠 Planned | High     |
| Personalize metric                                   | Show metric about user moods and wording, and tracking user streak to provide personalization                                                                                                                                        | 🧠 Planned | High     |
| Daily micro learning and prompt bridge               | Small learning lesson, take about 2-5 minute to read, relate to many topic about psychology, therapy, journaling, etc.... And it also have some sentence provide in the dashboard to make user more engage to journaling             | 🧠 Planned | High     |
| Suggestion after journaling if recognizing a pattern | Suggest content in a private, supportive way, like if                                                                                                                                                                                | 🧠 Planned | High     |

---

### 🗺️ 2. **Architecture Notes**

- **Frontend**: Nuxt 3 + Composition API + TailwindCSS
    
- **Backend** (User information): Golang with http router
    
- **AI Service**: Python (FastAPI) + HuggingFace models
    
- **DB**: PostgreSQL (Users, Journals, Streak, etc...), Qdrant vector store in Python service
    
- **Queue**: RabbitMQ (Go ⇄ Python async processing)


### 3 User flow 
![[theraprep_user_journey_flow.png]]

The user flow taking a lot of inspiration for Alan Mind app



Status table

|Status|Meaning|
|---|---|
|✅ Done|Feature is fully implemented and tested|
|🔄 In Progress|Currently being developed or integrated|
|🧠 Planned|Planned feature, not yet started|
|❌ Backlog|Feature idea acknowledged, but not scheduled|
|🧪 Testing|Feature is developed and currently in testing (manual or automated)|
|🛠️ Maintenance|Existing feature undergoing updates or bug fixes|
|⏸️ On Hold|Development paused due to external factors or dependencies|
|⚠️ Blocked|Cannot proceed due to a technical or organizational blocker|
