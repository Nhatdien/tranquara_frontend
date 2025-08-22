import { UserInformation } from "./user_information"

export type JournalTemplate = {
    id: string
    title: string
    content: string[]
    category: string
    greetings: string[]
    created_at: string
}

export type Journal = {
  id: string
  user_id: string
  template_id: string
  title: string
  content: string
  mood: string
  created_at: string
}

export type CreateJournalRequest = {
  template_id: string
  title: string,
  content: string,
  mood: string,
}

export type UserJournalsResponse = {
  user_journals: Journal[]
}

export type JournalTemplateResponse = {
    templates: JournalTemplate[]
}

export type TemplateData = {
    content: string[];
    title: string;
    category: string;
  };
  
  export type InitConnectData = {
    template_data: TemplateData;
    user_info: UserInformation;
  };