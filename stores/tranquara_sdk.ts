import { Base } from "./base";
import type { Config } from "./base";
import { applyMixins } from "./utils/utils";
import { Exercises } from "./exercises";
import { UserCompletedExercises } from "./user_completed_exercise";
import { UserInformations } from "./user_information";
import { UserStreaks } from "./user_streak";
import { Chatlogs } from "./chatlog";
import { UserJournals } from "./user_journal";
import { UserLearned } from "./user_learned";
import { Auth } from "./auth";
import { AIService } from "./ai_service";

class TranquaraSDK extends Base {
  constructor(config?: null | Config) {
    // Ensure config is always defined with default values
    super(config || {
      base_url: "",
      current_username: "",
      base_frontend_url: "",
      websocket_url: "",
      access_token: "",
      client_id: "",
    });
  }

  private static _instance: TranquaraSDK;

  public static getInstance(config?: null | Config): TranquaraSDK {
    if (!this._instance) {
      this._instance = new this(config);
    } else if (config) {
      // Allow updating config if instance exists and config is provided
      this._instance.config = { ...this._instance.config, ...config };
    }
    return this._instance;
  }

}

interface TranquaraSDK extends Exercises, UserCompletedExercises, UserInformations, UserStreaks, Chatlogs, UserJournals, UserLearned, Auth, AIService { }

applyMixins(TranquaraSDK, [Exercises, UserCompletedExercises, UserInformations, UserStreaks, Chatlogs, UserJournals, UserLearned, Auth, AIService]);

export default TranquaraSDK;
