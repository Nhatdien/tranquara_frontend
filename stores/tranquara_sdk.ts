import { Base } from "./base";
import type { Config } from "./base";
import { applyMixins } from "./utils/utils";
import { Exercises } from "./exercises";
import { UserCompletedExercises } from "./user_completed_exercise";
import { UserInformations } from "./user_information";
import { UserStreaks } from "./user_streak";
import { Chatlogs } from "./chatlog";
import { UserJournals } from "./user_journal";
import { Auth } from "./auth";

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

interface TranquaraSDK extends Exercises, UserCompletedExercises, UserInformations, UserStreaks, Chatlogs, UserJournals, Auth { }

applyMixins(TranquaraSDK, [Exercises, UserCompletedExercises, UserInformations, UserStreaks, Chatlogs, UserJournals, Auth]);

export default TranquaraSDK;
