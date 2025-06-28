export const onboardingSchema = [
    {
      id: "userProfile",
      title: "User Profile",
      steps: [
        {
          id: "age",
          type: "number",
          label: "Age",
          required: true
        },
        {
          id: "gender",
          type: "select",
          label: "Gender",
          required: true,
          options: ["Male", "Female", "Non-binary", "Prefer not to say"]
        }
      ]
    },
    {
      id: "userPreferences",
      title: "Your Preferences",
      steps: [
        {
          id: "goal",
          type: "multi-select",
          label: "What is your goal when using this website?",
          options: [
            "Journaling emotions",
            "Preparing for a therapy session",
            "Tracking emotional patterns",
            "Self-reflection",
            "Other"
          ]
        },
        {
          id: "therapyExperience",
          type: "radio",
          label: "Have you had any experience with mental therapy?",
          options: ["Yes", "No", "Prefer not to say"]
        }
      ]
    },
    {
      id: "emotionalCheckIn",
      title: "Check In With Yourself",
      steps: [
        {
          id: "emotionNow",
          type: "mood-picker",
          label: "How do you feel right now?"
        },
        {
          id: "emotionCause",
          type: "textarea",
          label: "What made you feel that way?"
        }
      ]
    },
    {
      id: "chatbotIntro",
      title: "Meet Your Chatbot Companion",
      steps: [
        {
          id: "chatbotGreeting",
          type: "info",
          content: "Hi! I'm your assistant here. I’ll help you create emotion logs and journal entries. You can chat with me anytime!"
        }
      ]
    },
    {
      id: "uiGuide",
      title: "Explore the Interface",
      steps: [
        {
          id: "guideStep1",
          type: "guide",
          label: "Let’s take a quick tour of the dashboard.",
          highlights: [
            {
              selector: "#chat-entry",
              title: "Chat with your assistant",
              description: "Start conversations here to log emotions or journal experiences automatically."
            },
            {
              selector: "#mood-check",
              title: "Mood Tracker",
              description: "Check in daily to monitor your emotional trends."
            },
            {
              selector: "#journal-button",
              title: "Journal",
              description: "Create new journal entries to reflect on your experiences and triggers."
            }
          ],
          finalMessage: "That's the tour! You’re now ready to begin."
        }
      ]
    },
    {
      id: "completion",
      title: "You're All Set!",
      steps: [
        {
          id: "summary",
          type: "info",
          content: "You've completed onboarding. You're ready to start using the chatbot, track your emotions, and explore your mental wellness."
        },
        {
          id: "nextSteps",
          type: "button",
          label: "Go to Dashboard",
          action: "redirectToDashboard"
        }
      ]
    }
  ];
  