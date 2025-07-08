export type UserInformation = {
    user_id: string
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

export type OnboardingState = {
    profile: {
        age: number
        gender: string
    }
    preference: {
        goal: string
        therapy_experience: string
    }
}

export type OnboardingRequestPayload = Omit<UserInformation, "user_id" | "created_at">