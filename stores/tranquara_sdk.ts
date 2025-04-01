import { Base } from "./base";
import type { Config } from "./base";
import { applyMixins } from "./utils/utils";

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

interface TranquaraSDK {}

applyMixins(TranquaraSDK, []);

export default TranquaraSDK;
