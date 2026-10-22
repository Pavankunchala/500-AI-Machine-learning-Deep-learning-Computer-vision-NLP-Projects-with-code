import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

function secret(): string {
  if (process.env.TRENDPULSE_ENC_KEY) return process.env.TRENDPULSE_ENC_KEY;
  const file = path.join(process.cwd(), "data", ".enc-key");
  if (existsSync(file)) return readFileSync(file, "utf8");
  mkdirSync(path.dirname(file), { recursive: true });
  const created = randomBytes(32).toString("hex");
  writeFileSync(file, created, { mode: 0o600 });
  return created;
}

function key(): Buffer {
  return scryptSync(secret(), "trendpulse-v1", 32);
}

export function encrypt(plain: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${enc.toString("base64url")}`;
}

export function decrypt(payload: string): string {
  if (!payload) return "";
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) return "";
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]);
  return plain.toString("utf8");
}
