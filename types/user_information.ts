export type UserInformation = {
    user_uuid: string
    name: string
    age: number
    gender: string
    kyc_answers: {[key: string]: any}
    user_settings: {[key: string]: any}
    created_at: Date
}

export type UserInformationResponse = {
    user_info: UserInformation
}
