import { cookies } from "next/headers";
import { parseLocale } from "./locale";

export async function getPublicLocale() {
  const jar = await cookies();
  return parseLocale(jar.get("al_lang")?.value);
}
