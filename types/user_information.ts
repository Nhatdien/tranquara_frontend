export type UserInformation = {
    user_uuid: string
    age: number
    kyc_answers: {[key: string]: any}
    program_mode: '8-week' | 'self-guided'
    daily_reminder_time: Date
    notification_enabled: boolean
}