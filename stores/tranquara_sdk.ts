import { Base } from "./base";
import type { Config } from "./base";
import { applyMixins } from "./utils/utils";
import { Exercises } from "./exercises";
import { ProgramExercises } from "./program_exericse";
import { UserSelfGuideActivities } from "./user_self_guilde_activity";
import { UserCompletedExercises } from "./user_completed_exercise";
import { UserInformations } from "./user_information";
import { UserStreaks } from "./user_streak";

class TranquaraSDK extends Base {
  constructor(config?: null | Config) {
    super(config!);
  }

  private static _instance: TranquaraSDK;

  public static getInstance(config?: null | Config): TranquaraSDK {
    const result = this._instance || (this._instance = new this(config));
    return result;
  }

}

interface TranquaraSDK extends Exercises, ProgramExercises, UserSelfGuideActivities, UserCompletedExercises, UserInformations, UserStreaks { }

applyMixins(TranquaraSDK, [Exercises, ProgramExercises, UserSelfGuideActivities, UserCompletedExercises, UserInformations, UserStreaks]);

export default TranquaraSDK;
