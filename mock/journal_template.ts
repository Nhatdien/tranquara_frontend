// mockup.ts
// Development mock data for journal templates

export interface JournalTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  greetings: string[];
}

export const journalTemplates: JournalTemplate[] = [
  {
    id: "f7710e56-98f6-4ac2-be46-e123ce8596b8",
    title: "Goal for therapy",
    category: "Therapy Prepare",
    content: `
###### What do I want to understand, change, or accept about myself through therapy?

###### Are there specific thoughts, feelings, or patterns I want help with?

###### What would “progress” in therapy look like for me?

###### How will I know therapy is helping?
    `,
    greetings: [
      "Hi 👋 let’s think about your therapy goals.",
      "Welcome back 🌱 What do you want to focus on today?",
      "Hey, ready to reflect on what you want to work on in therapy?"
    ]
  },
  {
    id: "71ae04ef-06e8-4970-a720-57e212926420",
    title: "Past experience with therapy",
    category: "Therapy Prepare",
    content: `
###### Have I tried therapy before? If so, what was it like?

###### What worked well in past therapy experiences?

###### What didn’t feel helpful, safe, or effective?

###### What do I want to do differently this time?
    `,
    greetings: [
      "Thinking about your past therapy experiences 💭",
      "Let’s reflect on what worked or didn’t work before.",
      "Your past experiences can guide your next steps."
    ]
  },
  {
    id: "b381777e-888f-4633-b29f-5f70b1f8c7e4",
    title: "Why now",
    category: "Therapy Prepare",
    content: `
###### What led me to seek therapy at this particular moment?

###### Was there a specific event, change, or breakdown that pushed me to act?

###### How long have I been thinking about starting therapy?

###### What would happen if I didn’t go to therapy now?
    `,
    greetings: [
      "Let’s explore why you’re choosing therapy now 🕒",
      "Thinking about what brought you here today?",
      "This moment matters—let’s start from here."
    ]
  },
  {
    id: "8f49a01f-eaff-43e5-9dd1-880dd0d7bbef",
    title: "Concerns about therapy",
    category: "Therapy Prepare",
    content: `
###### Is there anything I feel nervous or unsure about when it comes to therapy?

###### Am I worried about being judged, misunderstood, or overwhelmed?

###### What has stopped me from seeking therapy in the past?

###### What would help me feel more at ease about starting?
    `,
    greetings: [
      "It’s normal to have concerns—let’s talk about them 💬",
      "What’s on your mind when it comes to starting therapy?",
      "Let’s gently explore any worries you may have."
    ]
  },
  {
    id: "dc5e3c15-0041-404c-b0d2-18683afcfc9b",
    title: "What I want my therapist to know",
    category: "Therapy Prepare",
    content: `
###### What personal experiences, identities, or beliefs do I want my therapist to understand about me?

###### Are there topics I’m not ready to talk about yet?

###### How do I usually respond when someone pushes me emotionally?

###### What kind of support or approach do I think will help me the most?
    `,
    greetings: [
      "Let’s think about what you’d like your therapist to know 👂",
      "Your story matters—what feels important to share?",
      "We can explore how you want to be supported."
    ]
  },
  {
    id: "cd1e8dfe-2102-45f4-9256-a708a7577e0b",
    title: "Morning",
    category: "Daily Reflection",
    content: `
###### What's on my mind this morning

###### What can I do to make today amazing ?
    `,
    greetings: [
      "Good morning 🌞 How are you feeling today?",
      "Morning! Let’s set the tone for your day.",
      "Hi 👋 Ready to reflect and plan your morning?"
    ]
  },
  {
    id: "24ff39b2-65ac-4483-bd9c-58f62704f4fd",
    title: "Evening",
    category: "Daily Reflection",
    content: `
###### What happened today worth remembering ?

###### What went well today

###### What did I learn today?

###### What would I have changed about today?

###### What can I celebrate today ?

###### How am I differenct from yesterday ?

###### How can I wind down, realease the day and rest now ?
    `,
    greetings: [
      "Good evening 🌙 Let’s reflect on your day.",
      "Hey, how did today go for you?",
      "Let’s take a moment to wind down and look back."
    ]
  }
];
