import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { UserInformation, UserInformationResponse, OnboardingRequestPayload } from "~/types/user_information";
import tranquaraSDKClient from "~/plugins/05.tranquaraSDK.client";


export const userInformationStore = defineStore("user_info", {
    state: () => ({
        userInfomation: {} as UserInformation,
        isError: false as Boolean,
    }),

    actions: {
        async getMe() {
            return TranquaraSDK.getInstance().getUserInformation().then((response: UserInformationResponse) => {
                this.userInfomation = response.user_info
            }).catch((error: Error) => {
                this.isError = true
            })
        },

        async sendOnboardingInfo(info: OnboardingRequestPayload) {
            return TranquaraSDK.getInstance().createUserInformation(info).then((response: UserInformationResponse) => {
                this.userInfomation = response.user_info
            }).catch((error: Error) => {
                this.isError = true
            })
        }
    }
})
