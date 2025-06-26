import { UserInformation } from "./user_information"

type RequestMessage = {
    "user_information": UserInformation
    "input": string
}


type ResposneMessage = {
    sample_response: string[]
    message_content: string
}