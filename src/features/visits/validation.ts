import { z } from "zod";

const optionalName = z.string().trim().max(50);

export const customerSearchSchema = z
  .object({ firstName: optionalName, lastName: optionalName })
  .refine(
    ({ firstName, lastName }) =>
      (firstName === "" && lastName === "") ||
      (firstName !== "" && lastName !== ""),
    { message: "Enter both first and last name to search." },
  );

export const customerIdSchema = z.uuid();
export const visitIdSchema = z.uuid();
export const starsSchema = z.coerce.number().int().min(1).max(5);

export function normalizeVisitPage(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  if (!text || !/^\d+$/.test(text)) return 1;
  const page = Number(text);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
