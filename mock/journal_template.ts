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
      id: "2d6cd057-997e-4817-8bf5-42e48945d4cf",
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
      id: "76d812e3-2ee9-4c23-a1be-2f8626fbab62",
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
      id: "a0442532-8c59-407f-b714-07dbf3e7f9a9",
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
      id: "cc32776f-9cbc-4c99-b8b4-81533af42902",
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
      id: "4cfa8e01-ceb6-4009-a4ae-020c48d5b0ea",
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
      id: "129e3fc5-9b10-44f0-8bdb-ec0ba9fec2b1",
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
      id: "7792db32-1828-4157-b2b7-62f58e502fef",
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
  