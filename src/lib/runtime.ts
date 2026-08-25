import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data", "runtime");

export function readRuntime<T>(file: string, fallback: T): T {
  try {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8")) as T;
    }
  } catch {
    /* seed data is enough */
  }
  return fallback;
}

export function writeRuntime(file: string, data: unknown) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2), "utf8");
}

export function appendRuntime<T>(file: string, item: T, fallback: T[] = []) {
  const current = readRuntime<T[]>(file, fallback);
  current.unshift(item);
  writeRuntime(file, current);
  return current;
}
