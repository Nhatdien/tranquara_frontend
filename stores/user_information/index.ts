import { Base } from "../base";
import { UserInformation, UserInformationResponse, OnboardingRequestPayload } from "~/types/user_information";

export class UserInformations extends Base {
    async getUserInformation(): Promise<UserInformationResponse> {
        return this.fetch(`${this.config.base_url}/user_information`)
    }

    async createUserInformation(info: OnboardingRequestPayload): Promise<UserInformationResponse> {
        return this.fetch(`${this.config.base_url}/user_information`, {
            method: "POST",
            body: JSON.stringify(info)
        })
    }

    async updateUserInformation(info: Partial<UserInformation>): Promise<UserInformationResponse> {
        return this.fetch(`${this.config.base_url}/user_information`, {
            method: "PUT",
            body: JSON.stringify(info)
        })
    }

}