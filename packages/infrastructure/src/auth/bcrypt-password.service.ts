import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordService } from "@tutor-marketplace/application";

const scryptAsync = promisify(scrypt);

export class BcryptPasswordService implements PasswordService {
  private readonly saltLength = 16;
  private readonly keyLength = 64;

  async hash(password: string): Promise<string> {
    const salt = this.generateSalt();
    const derivedKey = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;

    const derivedKey = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    const keyBuffer = Buffer.from(key, "hex");

    if (derivedKey.length !== keyBuffer.length) return false;

    return timingSafeEqual(derivedKey, keyBuffer);
  }

  private generateSalt(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let salt = "";
    for (let i = 0; i < this.saltLength; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }
}