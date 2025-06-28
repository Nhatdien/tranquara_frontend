import { Base } from "../base";
import { UserInformation, UserInformationResponse } from "~/types/user_information";

export class UserInformations extends Base {
    async getExerciseById(exericseId: number): Promise<UserInformationResponse> {

        return this.fetch(`${this.config.base_url}/user_information`)
    }


}