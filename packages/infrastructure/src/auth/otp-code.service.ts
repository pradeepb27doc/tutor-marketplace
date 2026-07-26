import { createHash, randomInt } from "node:crypto";
import type { OtpService } from "@tutor-marketplace/application";

export class OtpCodeService implements OtpService {
  private readonly codeLength = 6;

  generateCode(): string {
    let code = "";
    for (let i = 0; i < this.codeLength; i++) {
      code += randomInt(0, 10).toString();
    }
    return code;
  }

  async hashCode(code: string): Promise<string> {
    const hash = createHash("sha256");
    hash.update(code);
    return hash.digest("hex");
  }

  async verifyCode(code: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashCode(code);
    return computedHash === hash;
  }
}