import { UserInformation } from "./user_information"

export type JournalTemplate = {
    id: string
    title: string
    content: string
    category: string
    created_at: string
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
    template_data: TemplateData;
    user_info: UserInformation;
  };