# AI-Assisted Journaling

## Goal
Helping users deepen their journal entries by providing direction-based AI guidance that encourages reflection and helps users open up their mind.

---

## 🎯 Direction-Based "Go Deeper" Feature

### Overview
Instead of generic AI questions, users select a **reflection direction** that aligns with their current needs. This gives users agency while maintaining AI assistance quality.

### Five Reflection Directions

#### 🧠 Understand Why
**Purpose**: Explore underlying reasons, causes, and motivations

**AI Focus**:
- Ask about root causes and triggers
- Probe into "why" behind experiences
- Connect events to outcomes

**Example Question**:
> "What part of the meeting felt most disappointing to you—and why do you think that mattered?"

**User Scenario**: User wants to understand the reason behind their feelings or reactions

---

#### 💭 Explore Emotions
**Purpose**: Dive deeper into emotional experiences and feelings

**AI Focus**:
- Ask about secondary/hidden emotions
- Probe beyond surface feelings
- Explore bodily sensations and emotional complexity

**Example Question**:
> "Besides frustration, was there another feeling underneath—like embarrassment, fear, or sadness?"

**User Scenario**: User wants to label and process their emotions more clearly

---

#### 🔁 Look for Patterns
**Purpose**: Recognize recurring themes and behavioral cycles

**AI Focus**:
- Ask about similar past experiences
- Identify triggers and patterns
- Connect current situation to history

**Example Question**:
> "Have you felt a similar frustration in past meetings, or was this one different?"

**User Scenario**: User suspects a pattern but can't quite see it yet

---

#### 🧩 Challenge My Thinking
**Purpose**: Reframe assumptions and challenge cognitive distortions

**AI Focus**:
- Question unhelpful beliefs
- Offer alternative perspectives
- Identify cognitive distortions (CBT-based)

**Example Question**:
> "What assumption about the meeting might be making this feel heavier than it needs to be?"

**User Scenario**: User wants to check if they're being too harsh on themselves or others

---

#### 🌱 Focus on Growth
**Purpose**: Extract lessons and plan for future improvement

**AI Focus**:
- Ask about lessons learned
- Explore future actions
- Encourage growth mindset

**Example Question**:
> "If a similar meeting happened again, what's one thing you'd want to do differently—or keep the same?"

**User Scenario**: User wants to move forward constructively

---

## 🎨 User Interface

### Button Interaction Flow

1. **User clicks "Go Deeper" button**
2. **Direction selector opens** (drawer on mobile, dropdown on desktop)
3. **User selects one of 5 directions**
4. **AI generates direction-specific question**
5. **Question appears inline as gray text with direction emoji**

### Visual Design

```
┌─────────────────────────────────────┐
│         Choose Your Direction        │
├─────────────────────────────────────┤
│                                     │
│  🧠  Understand why                 │
│      Explore the reasons and causes │
│                                     │
│  💭  Explore emotions               │
│      Dive into what you're feeling  │
│                                     │
│  🔁  Look for patterns              │
│      Notice recurring themes        │
│                                     │
│  🧩  Challenge my thinking          │
│      Question your assumptions      │
│                                     │
│  🌱  Focus on growth                │
│      Learn and plan ahead           │
│                                     │
└─────────────────────────────────────┘
```

### Question Display
```html
<p class="ai-suggestion">
  💭 <span class="opacity-50">[Exploring emotions]</span><br>
  Besides frustration, was there another feeling underneath—like 
  embarrassment, fear, or sadness?
</p>
```

---

## 🧠 AI Behavior Guidelines

### General Principles
- The role is to listen, encourage reflection, and help the user express themselves
- **Never provide clinical diagnoses** or therapeutic advice
- Questions should feel like **user asking themselves**
- Stay gentle, non-judgmental, and conversational

### Context Awareness

#### Journaling from a Template
- Take the template topic seriously to keep user on topic
- Reference earlier slides in the session (mood, sleep, etc.)
- Align with collection theme (therapy prep, daily reflection, stress management)

#### Journaling from No Template (Free-form)
- User can freely talk about any topic
- Focus purely on the content they wrote
- No collection context to reference

---

## 📊 Direction-Specific Prompt Templates

### System Prompt Enhancement
Each direction adds specific guidance to the base system prompt:

```python
direction_prompts = {
    "why": """
    Focus on helping the user understand underlying reasons and causes.
    - Ask about motivations, triggers, and 'why' behind their experience
    - Probe into root causes and connections
    - Help them see cause-and-effect relationships
    
    Question style: "What part of X felt most Y—and why do you think that mattered?"
    """,
    
    "emotions": """
    Focus on emotional exploration and labeling feelings.
    - Ask about emotions beyond the surface
    - Probe for secondary feelings (e.g., "Besides anger, what else?")
    - Explore bodily sensations and emotional complexity
    
    Question style: "Besides X, was there another feeling underneath—like Y or Z?"
    """,
    
    "patterns": """
    Focus on recognizing patterns and recurring themes.
    - Ask about similar past experiences
    - Identify behavioral cycles and triggers
    - Connect current situation to personal history
    
    Question style: "Have you felt similar X in past situations, or was this one different?"
    """,
    
    "challenge": """
    Focus on cognitive reframing and challenging assumptions (CBT-based).
    - Question unhelpful beliefs and thought distortions
    - Offer alternative perspectives
    - Help identify all-or-nothing thinking, catastrophizing, etc.
    
    Question style: "What assumption about X might be making this feel heavier than it needs to be?"
    """,
    
    "growth": """
    Focus on learning, growth mindset, and forward-thinking.
    - Ask about lessons learned
    - Explore future actions and what they'd do differently
    - Encourage self-compassion while planning improvement
    
    Question style: "If a similar situation happened again, what's one thing you'd want to do differently?"
    """
}
```

---

## 🎓 Therapeutic Foundations

### CBT (Cognitive Behavioral Therapy)
- **Challenge thinking** direction uses CBT reframing
- **Look for patterns** identifies cognitive/behavioral cycles

### DBT (Dialectical Behavior Therapy)
- **Explore emotions** encourages emotion labeling (DBT mindfulness)

### Positive Psychology
- **Focus on growth** aligns with growth mindset principles

### Person-Centered Therapy
- All directions respect user autonomy and non-directive approach
- Questions guide rather than prescribe

---

## 📈 Expected Benefits

### User Experience
- **+50% control**: Users choose their exploration direction
- **+40% relevance**: Questions match user's current needs
- **+30% engagement**: Clear options encourage more "Go Deeper" clicks
- **+60% therapeutic value**: Structured reflection teaches CBT/therapy concepts

### AI Performance
- **Better context**: AI knows exactly what type of question to generate
- **Reduced irrelevance**: No more "wrong direction" questions
- **Consistent quality**: Direction-specific prompts ensure focused output

---

## 🔄 User Flows

### Flow 1: First-Time User
1. Types journal entry
2. Clicks "Go Deeper"
3. Sees 5 direction options with descriptions
4. Selects "💭 Explore emotions"
5. Receives emotion-focused question
6. Learns that they can choose different directions

### Flow 2: Experienced User
1. Types journal entry
2. Clicks "Go Deeper" → Already knows what to expect
3. Quickly selects "🔁 Look for patterns"
4. Receives pattern-focused question
5. Continues journaling

### Flow 3: Direction Discovery
1. User always picks "🧠 Understand why"
2. Eventually tries "🧩 Challenge my thinking"
3. Discovers cognitive reframing helps them more
4. Expands their reflection toolkit

---

## 🚀 Future Enhancements

### Phase 2
- **Smart suggestions**: Highlight recommended direction based on content/mood
- **Direction history**: Show which directions user uses most
- **Quick access**: Remember last-used direction for one-tap access

### Phase 3
- **Custom directions**: Allow users to create personal reflection styles
- **Therapist-configured**: Therapists can customize directions for their clients
- **Multi-step guidance**: Chain multiple directions (e.g., emotions → challenge → growth)

---

## ✅ Implementation Checklist

- [ ] Backend: Add `direction` parameter to API
- [ ] Backend: Implement direction-specific prompt templates
- [ ] Frontend: Create direction selector component (drawer/dropdown)
- [ ] Frontend: Update "Go Deeper" button to open selector
- [ ] Frontend: Display selected direction with AI question
- [ ] UX: Add direction descriptions/tooltips
- [ ] Analytics: Track which directions users choose most
- [ ] Documentation: Update user help guides
- [ ] Testing: Verify each direction generates appropriate questions

---

**Last Updated**: February 1, 2026  
**Status**: 🔄 Design Complete, Ready for Implementation




