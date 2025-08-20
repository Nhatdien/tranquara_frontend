import { UserInformation } from "./user_information"

export type JournalTemplate = {
    id: string
    title: string
    content: string
    category: string
    greetings: string[]
    created_at: string
}

export type Journal = {
  id: string
  user_id: string
  template_id: string
  status: "draft" | "active" | "completed"
  title: string
  short_description: string
  created_at: string
}

export type CreateJournalRequest = {
  template_id: string
}

export type UserJournalsResponse = {
  user_journals: Journal[]
}

export type JournalTemplateResponse = {
    templates: JournalTemplate[]
}

export type TemplateData = {
    content: string;
    title: string;
    category: string;
  };
  
  export type InitConnectData = {
    journal_id: string
    template_data: TemplateData;
    user_info: UserInformation;
  };