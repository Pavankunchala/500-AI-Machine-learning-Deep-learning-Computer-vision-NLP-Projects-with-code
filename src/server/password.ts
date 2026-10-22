import { argon2id, argon2Verify } from "hash-wasm";

const OPTIONS = {
  parallelism: 1,
  iterations: 2,
  memorySize: 19456,
  hashLength: 32,
} as const;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return argon2id({
    password,
    salt,
    ...OPTIONS,
    outputType: "encoded",
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    return false;
  }
}
